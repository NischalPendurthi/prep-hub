---
title: Debugging: ftrace, perf, gdb, JTAG and reading an oops
part: Part D · Tools of the trade
lede: Kernel bugs often show up as a hang, a crash log or a timing problem, and adding `printk` everywhere can change the timing or come too late. This chapter gives you a tool for each symptom, shows how to read an oops line by line, and explains when to reach for a hardware debugger. Interviewers often describe a symptom and ask what you would do first, so the choice of tool matters as much as knowing its commands.
desc: choosing a tool, ftrace, perf, gdb and KGDB, JTAG, reading an oops, decoding addresses
hours: 3
prereqs: Chapters 2 and 3, some use of gdb in user space
---

## Choosing a tool {#ch05-choose .th}

| Symptom | Start with |
|---|---|
| Kernel crash log | Read the oops, then `faddr2line` or `decode_stacktrace.sh` |
| Crash with no log on the console | `pstore`/`ramoops`, `kdump`, or JTAG |
| Hang before the console works | `earlycon`, then JTAG |
| Wrong behaviour in a driver | `dynamic_debug`, `pr_debug`, tracepoints |
| Call flow or who called this | ftrace `function_graph` |
| Latency spikes | ftrace latency tracers, `timerlat`, `osnoise` |
| Slow, high CPU | `perf stat`, then `perf record` and `perf report` |
| Memory corruption | KASAN, KFENCE, `slub_debug`, hardware watchpoint |
| Deadlock | lockdep, `hung_task` messages, SysRq `w` and `l` |
| A regression | `git bisect` |
| User-space crash on target | Core dump, or `gdbserver` from the host |

For `printk`: it is simple and always available, but it takes time and can hide races. On a slow console it can change the timing enough for a bug to disappear. Use `pr_debug` with dynamic debug, or `trace_printk`, which writes to a fast in-memory ring buffer.

## ftrace {#ch05-ftrace .th}

ftrace is the kernel's built-in tracer. With `CONFIG_FUNCTION_TRACER`, each function starts with a few bytes of space that are normally no-ops, and the kernel patches them at runtime only when tracing is turned on, so the cost is low when it is off. You control it through files in **tracefs**, at `/sys/kernel/tracing` (or the older `/sys/kernel/debug/tracing`).

```text
# Needs root. Not run in this guide.
cd /sys/kernel/tracing
cat available_tracers

echo function_graph > current_tracer
echo foo_read > set_graph_function
echo 1 > tracing_on
cat /dev/foo > /dev/null
echo 0 > tracing_on
cat trace
echo nop > current_tracer

# Static events, for example scheduler switches
echo 1 > events/sched/sched_switch/enable
cat trace_pipe
```

The same work is easier with the `trace-cmd` front end: `trace-cmd record -p function_graph -g foo_read`, and then `trace-cmd report`. Output from `function_graph` looks like this. It is illustrative, written by hand to show the shape:

```text
# Illustrative. Not captured from a real run.
 1)               |  foo_read() {
 1)               |    mutex_lock() {
 1)   0.250 us    |      __cond_resched();
 1)   0.900 us    |    }
 1)   1.300 us    |    simple_read_from_buffer();
 1)   0.200 us    |    mutex_unlock();
 1)   3.100 us    |  }
```

Useful features to know by name:

- **Latency tracers**: `irqsoff`, `preemptoff`, `preemptirqsoff` and `wakeup_rt` record the worst section they saw, with the trace that caused it. Each needs its kernel config option.
- **`set_ftrace_filter`** limits function tracing, which you usually need to reduce the overhead and output.
- **Trace events** are stable named points placed in the code, such as `sched_switch` and `irq_handler_entry`. **kprobes** let you attach to almost any kernel instruction at runtime. **uprobes** do the same in user space.
- **Stopping at the moment of failure**: call `tracing_off()` from your code when you detect the bug, so that the buffer keeps the events that led up to it. This is often more useful than the full history.
- **eBPF tools** such as `bpftrace` attach small verified programs to these same hooks, and aggregate in the kernel. They need BTF or headers on the target, so embedded use may take some setup.

## perf {#ch05-perf .th}

`perf` uses the CPU's hardware performance counters (the PMU) and kernel software events. It has two modes: **counting** totals for a whole run, and **sampling** interrupts every N events and records where the program was, which gives you a statistical profile.

```text
perf stat -e cycles,instructions,cache-misses,branch-misses ./app
perf record -g ./app          # add --call-graph dwarf if frame pointers are missing
perf report
perf top
perf sched record -- ./app && perf sched latency
```

Reading the output: start with instructions per cycle, which is low when the CPU is mostly waiting (often for memory). High cache misses suggest a data layout problem. Hot functions from `perf report` tell you where to look, but samples can be attributed a little after the true instruction, which is called **skid**.

Access is controlled by `/proc/sys/kernel/perf_event_paranoid`, and a virtual machine may not expose any hardware counters. Programs can use the same interface with `perf_event_open`. This one counts its own instructions in user mode, and copes when the machine refuses:

```c run=el-c05-perf nondet
#define _GNU_SOURCE
#include <errno.h>
#include <linux/perf_event.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/syscall.h>
#include <unistd.h>

int main(void) {
    struct perf_event_attr a;
    memset(&a, 0, sizeof a);
    a.size = sizeof a;
    a.type = PERF_TYPE_HARDWARE;
    a.config = PERF_COUNT_HW_INSTRUCTIONS;
    a.disabled = 1;
    a.exclude_kernel = 1;
    a.exclude_hv = 1;

    int fd = syscall(SYS_perf_event_open, &a, 0, -1, -1, 0);
    if (fd < 0) {
        printf("perf_event_open refused: %s\n", strerrorname_np(errno));
        return 0;
    }
    ioctl(fd, PERF_EVENT_IOC_ENABLE, 0);
    volatile long s = 0;
    for (long i = 0; i < 1000000; i++) s += i;
    ioctl(fd, PERF_EVENT_IOC_DISABLE, 0);
    uint64_t count = 0;
    if (read(fd, &count, sizeof count) == sizeof count)
        printf("about %llu million instructions\n", (unsigned long long)count / 1000000);
}
```

## gdb, KGDB and QEMU {#ch05-gdb .th}

On a target board, you usually do not run a full gdb. You run a small stub on the target and a cross-gdb on the host, with symbols from the host:

```text
# On the target:
gdbserver :2345 ./app

# On the host, with the unstripped binary and the target's libraries:
gdb-multiarch ./app
(gdb) set sysroot /path/to/target/sysroot
(gdb) target remote board:2345
(gdb) break main
(gdb) continue
```

For a crash with no debugger attached, use a core dump: set `ulimit -c unlimited` and `kernel.core_pattern`, then run `gdb ./app core` on the host and start with `bt` and `info locals`. Keep unstripped binaries from every release for this reason.

Commands that show experience: `bt full`, `frame N`, `info registers`, `x/16xb addr`, `thread apply all bt`, and **watchpoints**. `watch *(int *)0xADDR` uses a debug register to stop at the exact write that changes a value, which often ends a memory corruption hunt quickly.

For the kernel there are two options:

- **QEMU's gdb stub**: run QEMU with `-s -S`, boot with `nokaslr`, then `gdb vmlinux` and `target remote :1234`. Enable `CONFIG_GDB_SCRIPTS` for helpers such as `lx-dmesg` and `lx-symbols`. No hardware is needed, so this is the best way to learn, and it is ideal for logic bugs and for hardware that QEMU models.
- **KGDB**: a stub in the running kernel, usually over a serial line, with `kgdboc=ttyS0,115200 kgdbwait`. The whole kernel stops at a breakpoint. It needs a working serial driver, so it cannot help with very early boot.

## JTAG {#ch05-jtag .th}

JTAG is a hardware debug port with pins TCK, TMS, TDI and TDO, and optionally TRST. ARM's SWD is a two-wire alternative. A probe connects your host to the SoC's debug logic, and software such as OpenOCD exposes a gdb server. Because the debug logic is in hardware, it works when no software is running on the CPU.

```text
# Illustrative. Config file names depend on your probe and SoC.
openocd -f interface/your-probe.cfg -f target/your-soc.cfg

# In another terminal:
gdb-multiarch vmlinux
(gdb) target extended-remote :3333
(gdb) monitor reset halt
(gdb) hbreak start_kernel
(gdb) continue
```

**When to use it:** before a console works, in SPL or early kernel bring-up; when the system hangs so hard that no log comes out; when you need to inspect memory or peripheral registers directly; or to load code into a board with broken flash.

**Things that go wrong:**

- Use `hbreak` for code in ROM or flash, or before the MMU settings are stable. A software breakpoint writes a trap instruction into memory, which may be read-only or may be remapped afterwards.
- Virtual and physical addresses differ. When the MMU is off, symbol addresses from `vmlinux` do not match, and you need an offset. Use `nokaslr` so that later addresses match too.
- Deep idle states and power gating can cut off the debug logic, so disable `cpuidle` while debugging (`cpuidle.off=1` or `nohlt`, depending on the platform).
- Watchdogs keep counting and reset the board while you are stopped, so disable them.
- Production parts may have debug access locked by fuses as part of secure boot.
- Stopping the CPU changes real-time behaviour: devices keep running, and buffers overflow. Instruction trace hardware such as ETM can record without stopping, if your board has it.

## Reading an oops {#ch05-oops .th}

An **oops** is the kernel reporting a fault in its own code. The kernel kills the current task and tries to continue, in a damaged state, so treat the machine as unreliable afterwards. If the oops happens in an interrupt, or `panic_on_oops` is set, it becomes a **panic**, which stops the system. Here is a made-up arm64 oops, illustrative only:

```text
# Illustrative. Hand-written to show the layout. Details vary by version and architecture.
Unable to handle kernel NULL pointer dereference at virtual address 0000000000000018
Internal error: Oops: 0000000096000005 [#1] SMP
Modules linked in: foo(O)
CPU: 1 PID: 412 Comm: cat Tainted: G           O       6.x.y #1
Hardware name: Example Board (DT)
pc : foo_read+0x2c/0x90 [foo]
lr : vfs_read+0xa8/0x1b4
sp : ffff80000a3b3d50
x1 : 0000fffff7ff0000 x0 : 0000000000000000
Call trace:
 foo_read+0x2c/0x90 [foo]
 vfs_read+0xa8/0x1b4
 ksys_read+0x70/0x100
 __arm64_sys_read+0x20/0x30
Code: a9bf7bfd 910003fd f9400a80 d503201f (f9400c00)
---[ end trace 0000000000000000 ]---
```

Read it in this order:

1. **First line: what happened.** A NULL dereference at `0x18` is a read of a field at offset `0x18` of a NULL struct pointer. Small addresses point to a NULL struct. An address like `dead000000000100` or `6b6b…` is a poison pattern (Chapter 3).
2. **`pc` or `RIP`: where.** `foo_read+0x2c/0x90` is 0x2c bytes into a function that is 0x90 bytes long. `[foo]` is the module. The `lr` on ARM is the return address.
3. **`Comm` and `PID`: who.** Which process, and hence the context. `cat` here means the code ran in a `read` system call.
4. **`Tainted`.** Letters explain the kernel's state: `G` means no proprietary modules, `O` is out-of-tree, `W` means a warning happened earlier. An earlier `W` may be the real start of the problem.
5. **Call trace: how you got here.** Read from the top. On x86, entries starting with `?` were found on the stack, but may be stale.
6. **Registers and `Code:`.** The instruction in parentheses is the one that faulted. Comparing with the registers shows which pointer was bad. Here `x0` is 0.

Turn the offset into a source line. This needs the debug info for the same build:

```text
# From the kernel tree, with the same build that crashed:
./scripts/faddr2line foo.ko foo_read+0x2c/0x90
./scripts/decode_stacktrace.sh vmlinux . < oops.txt
gdb foo.ko -ex 'list *(foo_read+0x2c)'
```

:::trap
Decode with the exact build that crashed. A different config, compiler or source shifts every offset and gives a believable but wrong line. Keep `vmlinux` and the modules with debug info for each release you ship.
:::

The same idea works in user space, so you can try it here. `nm` gives a function's address, and `addr2line` turns it into a source line using debug info:

```bash run=el-c05-addr2line nondet
cat > t.c <<'EOF_C'
#include <stdio.h>

int buggy(int *p)
{
    return p[1];
}

int main(void)
{
    int a[2] = { 1, 2 };
    printf("%d\n", buggy(a));
}
EOF_C
gcc -g -O0 -no-pie -o t t.c
addr=$(nm t | awk '$3 == "buggy" { print $1 }')
addr2line -f -e t "0x$addr" | sed 's#.*/##'
```

A user-space segmentation fault follows the same logic as the kernel's "NULL pointer at 0x18". The fault address is the base pointer plus a field offset, so the offset tells you which field was being accessed:

```c run=el-c05-segv
#define _GNU_SOURCE
#include <signal.h>
#include <stddef.h>
#include <stdio.h>
#include <unistd.h>

struct dev { char name[16]; void *ops; int irq; };

static void on_segv(int sig, siginfo_t *si, void *ctx) {
    /* printf is not async-signal-safe. Tolerable only because we exit right after. */
    printf("fault address %p, %s\n", si->si_addr,
           si->si_code == SEGV_MAPERR ? "no mapping" : "permission");
    fflush(stdout);
    _exit(0);
}

int main(void) {
    struct sigaction sa = { .sa_sigaction = on_segv, .sa_flags = SA_SIGINFO };
    sigaction(SIGSEGV, &sa, NULL);
    printf("offset of irq: %#zx\n", offsetof(struct dev, irq));
    struct dev *volatile d = NULL;
    printf("%d\n", d->irq);
}
```

### Related messages

- **`BUG:` / `WARNING:`**: code called `BUG_ON` or `WARN_ON`. A warning continues with a backtrace, and taints with `W`.
- **`soft lockup`**: a CPU stayed in the kernel without scheduling for a long time, typically an endless loop with preemption off.
- **`hard lockup`**: a CPU had interrupts disabled for too long, detected through a non-maskable interrupt where available.
- **`INFO: task blocked for more than N seconds`**: the hung task detector, usually a deadlock or stuck I/O.
- **`rcu_preempt detected stalls`**: a CPU did not pass through a quiescent state, typically a loop in kernel code.

For crash logs that never reach a console, `pstore` with `ramoops` keeps them in reserved RAM across a warm reset, and `kdump` boots a small kernel to save a memory dump for the `crash` tool. Both suit embedded systems if you reserve the memory ahead of time.

## Drills {#ch05-drills .dr}

:::drill concept
What is the difference between an oops and a panic?
---
**Answer.** An oops is a reported kernel fault. The kernel kills the current task and tries to keep going, possibly leaving locks held and data inconsistent. A panic stops the system. An oops becomes a panic in interrupt context, or with `panic_on_oops` set, which production systems usually set so they can reboot into a known state. **Why.** After an oops, later failures may be side effects, so always debug the first one in the log.
:::

:::drill output
A kernel reports "NULL pointer dereference at virtual address 0x18". Using the struct below, which field was accessed?

```c run=el-c05-d-offset
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>

struct ctx {
    uint64_t id;
    uint32_t flags;
    uint32_t count;
    void *buf;
    uint64_t len;
};

int main(void) {
    printf("%zx %zx %zx %zx %zx\n", offsetof(struct ctx, id), offsetof(struct ctx, flags),
           offsetof(struct ctx, count), offsetof(struct ctx, buf), offsetof(struct ctx, len));
}
```
---
**Answer.** Offsets are 0, 8, c, 10 and 18, so it accessed `len` through a NULL `struct ctx *`. **Why.** `pahole` prints struct layouts with offsets from debug info, which is quicker than counting by hand for big kernel structs.
:::

:::drill concept
A driver is slow and CPU use is high. Which tool first, and why not ftrace?
---
**Answer.** `perf record -g` followed by `perf report`, because sampling shows where time goes at low overhead. Then use `perf stat` to see whether the cause is cache misses, branch mispredictions or simply too many instructions. ftrace answers a different question, about flow and timing of specific functions, and tracing every function adds a lot of overhead and distorts results. **Why.** Use ftrace once you need the order of events, or to see who called what.
:::

:::drill tricky
Why does adding `printk` sometimes make a bug disappear?
---
**Answer.** `printk` takes locks, may write to a slow console and changes timing, so it can close a race window or add ordering by accident. Use a lower-impact approach: `trace_printk` or tracepoints to the in-memory ring buffer. **Why.** A bug that vanishes with logging is strong evidence for a race or a missing barrier, which is useful information in itself.
:::

:::drill bug
A developer sets a breakpoint with `break start_kernel` over JTAG, before the kernel has started. It never hits, and sometimes memory looks wrong afterwards. What is wrong?
---
**Answer.** `break` is a software breakpoint: gdb writes a trap instruction at the symbol's address. At that point, the kernel may not be loaded yet, so it gets overwritten or lands at the wrong place, and the address may be virtual while the MMU is off. Use `hbreak`, which uses a debug register. Check the address mapping, and boot with `nokaslr`. **Why.** Hardware breakpoints are few, so use them deliberately.
:::

:::drill output
`/proc/sys/kernel/tainted` holds a bitmask. Bit 0 is proprietary module (P), bit 9 is an earlier warning (W), bit 12 is out-of-tree module (O), bit 13 is unsigned module (E). What does this print?

```python run=el-c05-d-taint
flags = {0: "P", 9: "W", 12: "O", 13: "E"}
for value in (0, 4096, 4609, 12800):
    print(value, "".join(l for b, l in flags.items() if value >> b & 1) or "clean")
```
---
**Answer.** 0 is clean. 4096 is only O. 4609 is 4096 + 512 + 1, so P, W and O. 12800 is 8192 + 4096 + 512, so W, O and E. **Why.** The bits are defined in `include/linux/panic.h`, and the same letters appear in the oops `Tainted:` line.
:::

:::drill concept
How would you find what corrupts one specific variable?
---
**Answer.** Use a hardware watchpoint, from gdb or JTAG, on its address, which stops at the exact write. In kernel code without a debugger, enable KASAN for out-of-bounds and use-after-free, or check for a DMA cause if the contents look like device data. Log the address and value when the bug appears, so you can test each theory. **Why.** Watchpoints beat reading code here because the bad write is usually in another subsystem altogether.
:::

:::drill tricky
A kernel hangs at boot with no output, even with `earlycon`. What can JTAG tell you?
---
**Answer.** Halt the CPU and read the program counter and registers. Map the PC to a symbol with `vmlinux` (allowing for the MMU state). Read the kernel's log buffer directly from memory, since it may contain messages that never reached a console. Check the exception registers to see whether it faulted. **Why.** If the PC is in the idle loop, the CPU is fine and the problem is elsewhere, such as a missing console or a device waiting for an interrupt.
:::

:::drill concept
What's the difference between kprobes, tracepoints and `trace_printk`?
---
**Answer.** Tracepoints are static hooks placed in the source with a defined format, and are cheap when off. Kprobes attach dynamically to almost any kernel instruction with no rebuild, and are more fragile since they depend on the code as built. `trace_printk` is a debugging print to the ring buffer that you add temporarily and should not ship, as the kernel warns at boot if it is present. **Why.** Tracepoint names are also treated as somewhat stable, so tools rely on them.
:::

:::drill bug
`faddr2line` gives a nonsense source line for an oops from a device in the field. What's the likely mistake?
---
**Answer.** The binary used for decoding is not from the same build as the kernel that crashed. Any change in config, compiler or source shifts the offsets. Keep the `vmlinux` and modules with debug info for each release, and match them using the build ID. **Why.** With `CONFIG_RANDOMIZE_BASE`, absolute addresses also shift each boot, so decode from `symbol+offset`, not raw addresses.
:::

:::drill output
A regression lies somewhere in a range of commits. How many `git bisect` builds does each case need in the worst case?

```python run=el-c05-d-bisect
import math
for n in (2, 100, 1024, 15000):
    print(n, math.ceil(math.log2(n)))
```
---
**Answer.** 1, 7, 10 and 14 steps. Bisection halves the range each time. **Why.** This is why each kernel patch has to build and boot on its own. A patch that breaks the build in the middle of a series makes bisection much harder for everyone.
:::

:::drill concept
What can you do when a target crashes and reboots, losing the log?
---
**Answer.** Configure `pstore` with `ramoops` to save the log in reserved RAM across a warm reset, then read it from `/sys/fs/pstore` after boot. Or use `kdump` to capture a full memory image. Or connect a serial console to a logger on the host. **Why.** Set `panic` so the board reboots after a delay, and confirm the bootloader does not clear the reserved region.
:::

## Write the code {#ch05-coding .cd}

:::drill code rating=1200
Write a parser for oops frames like `foo_read+0x2c/0x90 [foo]` that returns the function, offset, size and module, and flags offsets beyond the function's size as bad.
---
A regular expression with optional module group handles the format. An offset past the size suggests a corrupted log or the wrong symbol table.

```python run=el-c05-c-frame
import re

FRAME = re.compile(r"^\s*(?:\? )?(\w+)\+(0x[0-9a-f]+)/(0x[0-9a-f]+)(?: \[(\w+)\])?")

def parse(line):
    m = FRAME.match(line)
    if not m:
        return None
    off, size = int(m[2], 16), int(m[3], 16)
    return {"func": m[1], "off": off, "size": size, "mod": m[4] or "vmlinux", "ok": off < size}

for line in ["foo_read+0x2c/0x90 [foo]", " vfs_read+0xa8/0x1b4", " ? bar+0x200/0x40", "---[ end trace ]---"]:
    print(parse(line))
```
:::

:::drill code rating=1300
An overrun that only corrupts memory is hard to catch. Write a guard-page allocator that places each block right before an inaccessible page, so that an overrun faults at the exact bad access, and report how far past the end it went.
---
This is the idea behind KFENCE and old-style electric fence tools: align the end of the block to a page boundary, and protect the next page.

```c run=el-c05-c-guard
#define _GNU_SOURCE
#include <signal.h>
#include <stdint.h>
#include <stdio.h>
#include <sys/mman.h>
#include <unistd.h>

static char *block_end;

static void on_segv(int sig, siginfo_t *si, void *ctx) {
    printf("overrun: %ld bytes past the end\n", (long)((char *)si->si_addr - block_end));
    fflush(stdout);
    _exit(0);
}

static void *guard_alloc(size_t n) {
    long ps = sysconf(_SC_PAGESIZE);
    size_t pages = (n + ps - 1) / ps + 1;
    char *m = mmap(NULL, pages * ps, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    mprotect(m + (pages - 1) * ps, ps, PROT_NONE);
    block_end = m + (pages - 1) * ps;
    return block_end - n;
}

int main(void) {
    struct sigaction sa = { .sa_sigaction = on_segv, .sa_flags = SA_SIGINFO };
    sigaction(SIGSEGV, &sa, NULL);
    volatile char *buf = guard_alloc(100);
    for (int i = 0; i < 100; i++) buf[i] = 'x';
    printf("100 bytes written fine\n");
    fflush(stdout);
    buf[100 + 3] = 'y';
    printf("not reached\n");
}
```

The block is pushed to the end of its page, which is why alignment-sensitive callers may need padding. It finds overruns at the bad instruction, not later when damage is noticed. It costs at least a page per allocation, so KFENCE samples only some allocations.
:::

## Cheat sheet {#ch05-cheatsheet .th}

- Pick by symptom: oops decode, `perf` for slow, `ftrace` for flow, KASAN for corruption, lockdep for deadlocks, `bisect` for regressions, JTAG when nothing prints.
- tracefs: `/sys/kernel/tracing`. `current_tracer`, `set_ftrace_filter`, `set_graph_function`, `events/`, `trace`, `tracing_on`.
- Latency tracers: `irqsoff`, `preemptoff`, `wakeup_rt`, `timerlat`, `osnoise`. Use `trace-cmd` to make this easier.
- perf: `stat` counts, `record` plus `report` samples. Low instructions per cycle often means a memory wait. Skid exists. `perf_event_paranoid` controls access.
- gdb on target: `gdbserver` plus cross-gdb with `set sysroot`. `watch` for corruption. Kernel: QEMU `-s -S`, `nokaslr`, `CONFIG_GDB_SCRIPTS`, or KGDB.
- JTAG: works with no software. Use `hbreak`, account for MMU state, disable idle and watchdog. Fuses may lock it.
- Oops: first line is what, `pc` is where, `Comm` is who, then taint, call trace, registers and `Code:`.
- Small fault address means a NULL struct pointer, and the offset names the field. `6b6b…` means use after free.
- Decode with `faddr2line` or `decode_stacktrace.sh`, using the exact same build.
- Lost logs: `pstore`/`ramoops`, `kdump`, or a serial logger.
