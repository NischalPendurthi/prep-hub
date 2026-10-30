---
title: PREEMPT_RT and sub-100µs latency tuning
part: Part C · Timing
lede: Real-time means bounded, and speed is only part of that. A system that responds in 5 µs on average and 5 ms once a day has failed if the deadline was 100 µs. This chapter covers where latency comes from, what PREEMPT_RT changes in the kernel, how the real-time scheduling classes behave, how priority inheritance prevents inversion, how to measure with cyclictest, and how to isolate a CPU for a critical task.
desc: latency sources, PREEMPT_RT, SCHED_FIFO and DEADLINE, priority inversion, cyclictest, isolation, IRQ affinity, mlockall
hours: 4
prereqs: Chapter 3, process scheduling basics, virtual memory and page faults
---

## Where latency comes from {#ch04-sources .th}

The latency that matters is the time from an event (a timer expiring, a device interrupt) to the moment your task runs its first useful instruction. It adds up from several stages, and any one of them can be the worst case.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 150" role="img" aria-label="Latency timeline: event, interrupts-off delay, handler, scheduler wakeup, then the task runs">
  <path d="M20 90 L 700 90" class="d-line"/>
  <text x="20" y="70" class="t-small">event</text>
  <rect x="60" y="76" width="170" height="28" class="d-acc"/><text x="145" y="95" text-anchor="middle" class="t-small">IRQs or preemption off</text>
  <rect x="230" y="76" width="110" height="28" class="d-soft"/><text x="285" y="95" text-anchor="middle" class="t-small">handler</text>
  <rect x="340" y="76" width="170" height="28" class="d-acc"/><text x="425" y="95" text-anchor="middle" class="t-small">lock or higher-prio wait</text>
  <rect x="510" y="76" width="90" height="28" class="d-soft"/><text x="555" y="95" text-anchor="middle" class="t-small">context switch</text>
  <rect x="600" y="76" width="96" height="28" class="d-key"/><text x="648" y="95" text-anchor="middle" class="t-small">task runs</text>
  <text x="20" y="132" class="t-small">Page faults, cache misses and firmware interrupts can stretch any segment.</text>
</svg></div><figcaption><b>Wakeup latency is a sum.</b> You reduce it by shrinking the longest non-preemptible section, and by removing what shares the CPU with you.</figcaption></figure>

Sources to name in an interview:

- **Kernel non-preemptible sections**: spinlocks and interrupt-off regions.
- **Interrupts and softirqs**: on a mainline kernel, softirq work can run ahead of your task. Network and block I/O produce plenty of it.
- **Lock contention and priority inversion**: waiting for a lower-priority holder.
- **Page faults**: a minor fault costs kernel entry and page handling, and a major fault waits on storage, which can take milliseconds.
- **Caches and TLB**: another workload or a context switch evicts your data, so you run slowly after waking.
- **Power management**: deep idle states take time to exit, and frequency scaling slows you down.
- **Firmware and hardware**: system management interrupts on x86 stop all software invisibly. DMA bursts contend for memory.
- **Console output**: `printk` to a slow serial port can be a large non-preemptible delay on older kernels and non-RT consoles.

How low you can go depends on the SoC, firmware and workload. Sub-100 µs worst case is a goal many tuned systems reach, and it must be measured on your hardware under load. For scale, 100 µs at 1 GHz is 100,000 cycles, and a slow path through a contended lock plus cold caches can consume a large share of it.

## What PREEMPT_RT changes {#ch04-rt .th}

Linux has several preemption models, chosen at build time (or partly at boot with `PREEMPT_DYNAMIC`): none, voluntary, full `PREEMPT`, recent `PREEMPT_LAZY`, and `PREEMPT_RT`. Under `PREEMPT`, kernel code can be preempted except where it holds a spinlock or has disabled preemption or interrupts. `PREEMPT_RT` shrinks those remaining regions:

- **`spinlock_t` and `rwlock_t` become sleeping locks** based on rtmutexes, with priority inheritance. Waiters can be preempted, and so can holders.
- **`raw_spinlock_t` stays a real spinning lock**. It is for very low-level code such as scheduler internals and interrupt controllers, and must be kept short.
- **Interrupt handlers run in threads** by default, each with a real-time priority that you can adjust. A small part still runs in hard IRQ context, such as handlers marked `IRQF_NO_THREAD` and the wakeups themselves.
- **Softirqs run in thread context**, so they can be preempted and do not stack on top of arbitrary tasks.

PREEMPT_RT was merged into mainline in 6.12 for x86, arm64 and RISC-V, after being an out-of-tree patch set for many years. Other architectures depend on `ARCH_SUPPORTS_RT`, so check your kernel. Check too that all your drivers are RT-ready, since vendor drivers often are not.

Enabling it costs throughput: more context switches and heavier lock paths. It lowers the worst case and may raise the average. Choose it when the bound is what you need.

:::trap
On PREEMPT_RT a `spinlock_t` may sleep, so you cannot take one while holding a `raw_spinlock_t` or in a true hard-IRQ handler. Code like `local_irq_disable(); spin_lock(&l);` is wrong on RT. `spin_lock_irqsave` remains fine, since on RT it does not really disable interrupts. Lockdep reports such nesting problems.
:::

## Real-time scheduling classes {#ch04-sched .th}

| Policy | Rule | Priority |
|---|---|---|
| `SCHED_OTHER` | Fair share (CFS, then EEVDF since 6.6) | Nice values |
| `SCHED_FIFO` | Runs until it blocks, yields or a higher priority wakes | 1 to 99 |
| `SCHED_RR` | FIFO, plus a time slice among equal priorities | 1 to 99 |
| `SCHED_DEADLINE` | Earliest deadline first, with a CPU budget per period | Above all FIFO tasks |

`SCHED_FIFO` is simple and predictable: a single CPU always runs the highest-priority runnable task. A runaway FIFO task can freeze everything of lower priority on that CPU, so the kernel limits RT tasks by default with `kernel.sched_rt_runtime_us` (950000 of `sched_rt_period_us` 1000000, so 95%). The mechanism behind this has changed in recent kernels, so check your version. Do not disable it casually.

Interrupt threads run at `SCHED_FIFO` priority 50 by default, so a critical task above 50 preempts device interrupts. You must then decide deliberately whether that task depends on any of those interrupts.

`SCHED_DEADLINE` takes three numbers in nanoseconds, with runtime ≤ deadline ≤ period: "give me `runtime` of CPU before `deadline`, every `period`". The kernel runs admission control and refuses a set of tasks that cannot fit, and throttles a task that overruns its budget. It uses `sched_setattr`, with no glibc wrapper in older versions.

Both need privilege: `CAP_SYS_NICE`, or for FIFO and RR a suitable `RLIMIT_RTPRIO`. A well-written program handles refusal, and this one reports what happened on the machine that ran it:

```c run=el-c04-setsched nondet
#define _GNU_SOURCE
#include <errno.h>
#include <sched.h>
#include <stdio.h>
#include <string.h>
#include <sys/syscall.h>
#include <unistd.h>

#ifndef SCHED_DEADLINE
#define SCHED_DEADLINE 6
#endif

struct dl_attr {        /* the layout sched_setattr(2) documents */
    unsigned int size, policy;
    unsigned long long flags;
    int nice;
    unsigned int priority;
    unsigned long long runtime, deadline, period;   /* nanoseconds */
};

int main(void) {
    printf("FIFO priorities: %d..%d\n", sched_get_priority_min(SCHED_FIFO), sched_get_priority_max(SCHED_FIFO));

    struct sched_param p = { .sched_priority = 80 };
    if (sched_setscheduler(0, SCHED_FIFO, &p) == 0) {
        printf("FIFO: granted\n");
        p.sched_priority = 0;
        sched_setscheduler(0, SCHED_OTHER, &p);
    } else
        printf("FIFO: %s\n", strerrorname_np(errno));

    struct dl_attr a = { .size = sizeof a, .policy = SCHED_DEADLINE,
                         .runtime = 2000000, .deadline = 10000000, .period = 10000000 };
    if (syscall(SYS_sched_setattr, 0, &a, 0) == 0)
        printf("DEADLINE: granted\n");
    else
        printf("DEADLINE: %s\n", strerrorname_np(errno));
}
```

The first line is fixed on Linux. Unprivileged users normally see `EPERM` on the other two, and root or a generous `RLIMIT_RTPRIO` changes that.

## Priority inversion {#ch04-inversion .th}

A low-priority task L holds a lock that a high-priority task H needs. H blocks, which is expected and short. Then a medium-priority task M, which needs no lock, wakes up and preempts L. Now M runs while H waits, for as long as M wants. H is effectively running below M.

**Priority inheritance** fixes this. While L holds a lock that H wants, L runs at H's priority, so M cannot preempt it. L finishes the critical section, releases the lock, and returns to its own priority. This is a deterministic simulation of both cases, one tick per time unit on one CPU:

```python run=el-c04-inversion
def simulate(inherit):
    # L starts at tick 0 and takes the lock at tick 1, for 4 ticks of its own running time.
    # H arrives at tick 2 and needs the lock at once. M arrives at tick 3 and computes for 6 ticks.
    l_left, m_left, holder_left = 6, 6, None
    h_blocked = h_done = None
    trace = ""
    for t in range(40):
        if t == 1: holder_left = 4
        h_ready = t >= 2 and h_done is None
        wants_lock = h_ready and holder_left
        l_prio = 3 if (inherit and wants_lock) else 1
        cands = []
        if h_ready and not wants_lock: cands.append((3, "H"))
        if t >= 3 and m_left: cands.append((2, "M"))
        if l_left: cands.append((l_prio, "L"))
        if not cands: break
        who = max(cands)[1]
        trace += who
        if who == "L":
            l_left -= 1
            if holder_left: holder_left -= 1
        elif who == "M": m_left -= 1
        else:
            h_done = t + 1
    return trace, h_done - 2

for inherit in (False, True):
    trace, wait = simulate(inherit)
    print(f"inherit={inherit!s:5} {trace}  H finished {wait} ticks after arriving")
```

Without inheritance, M's whole 6-tick computation runs ahead of H. With inheritance, H waits only for the rest of L's critical section.

In user space, you ask for this on the mutex. A default pthread mutex has no inheritance:

```c run=el-c04-pi
#define _GNU_SOURCE
#include <pthread.h>
#include <stdio.h>

int main(void) {
    pthread_mutexattr_t a;
    int proto;
    pthread_mutexattr_init(&a);
    pthread_mutexattr_getprotocol(&a, &proto);
    printf("default is PRIO_NONE: %d\n", proto == PTHREAD_PRIO_NONE);
    pthread_mutexattr_setprotocol(&a, PTHREAD_PRIO_INHERIT);
    pthread_mutexattr_getprotocol(&a, &proto);
    printf("now PRIO_INHERIT: %d\n", proto == PTHREAD_PRIO_INHERIT);
    pthread_mutex_t m;
    printf("init returned %d\n", pthread_mutex_init(&m, &a));
}
```

Inheritance only helps with locks that have a known owner. A semaphore or a condition-variable handshake has no owner to boost, so that design can still invert. Keep the critical sections short, too, because each one adds to everyone's worst case.

## Measuring with cyclictest {#ch04-cyclictest .th}

`cyclictest` runs threads that sleep until an absolute time, and record how late they wake. It is the standard wakeup latency benchmark. It needs root or suitable limits to get real-time priority.

```text
# Needs privilege. Run for hours, under a realistic worst-case load, on the target board.
cyclictest --mlockall --smp --priority=80 --interval=200 --distance=0 --histogram=400 --duration=4h

# Output shape. Illustrative only: these numbers are not a measurement.
T: 0 ( 1234) P:80 I:200 C: 100000 Min:   2 Act:   3 Avg:   3 Max:  41
```

The `Max` column is the result that matters, along with the histogram. Interpretation rules:

- A run on an idle system proves little. Add CPU, memory, network and storage load (such as `stress-ng`, `hackbench`, and real traffic).
- A short run can miss rare events, so run for hours or days.
- It measures wakeup latency. Your full response time also includes your code and I/O.
- For a spike, use `cyclictest --breaktrace` with ftrace, or the `osnoise` and `timerlat` tracers to find what ran (Chapter 5). `hwlatdetect` looks for firmware-caused gaps.

This small version shows the idea. It runs without privilege and without any tuning, so its numbers say nothing about real-time capability. Note the absolute-time sleep:

```c run=el-c04-mini nondet
#define _GNU_SOURCE
#include <stdio.h>
#include <time.h>

static long long ns(struct timespec t) { return t.tv_sec * 1000000000LL + t.tv_nsec; }

int main(void) {
    enum { LOOPS = 2000, INTERVAL = 200000 };    /* 200 us */
    struct timespec next, now;
    long long min = 1LL << 62, max = 0, sum = 0;
    clock_gettime(CLOCK_MONOTONIC, &next);
    for (int i = 0; i < LOOPS; i++) {
        next.tv_nsec += INTERVAL;
        if (next.tv_nsec >= 1000000000) { next.tv_nsec -= 1000000000; next.tv_sec++; }
        clock_nanosleep(CLOCK_MONOTONIC, TIMER_ABSTIME, &next, NULL);
        clock_gettime(CLOCK_MONOTONIC, &now);
        long long late = ns(now) - ns(next);
        if (late < min) min = late;
        if (late > max) max = late;
        sum += late;
    }
    printf("loops %d  min %lld us  avg %lld us  max %lld us\n", LOOPS, min / 1000, sum / LOOPS / 1000, max / 1000);
}
```

:::trap
A relative `nanosleep(interval)` in a loop drifts, because the time spent in the loop and the wake-up lateness add up each cycle. Use `clock_nanosleep` with `TIMER_ABSTIME` and `CLOCK_MONOTONIC`, and add the period to the previous target, not to the current time.
:::

## CPU isolation and IRQ affinity {#ch04-isolation .th}

Removing competition from a CPU often helps more than any other tuning step. The usual setup reserves one or more CPUs for the critical task and moves everything else away.

```text
# Kernel command line. Reserves CPUs 2 and 3. The options depend on kernel config.
isolcpus=managed_irq,domain,2-3 nohz_full=2-3 rcu_nocbs=2-3 irqaffinity=0-1

# Move one IRQ to CPUs 0 and 1 at runtime. Needs root.
echo 0-1 > /proc/irq/45/smp_affinity_list    # or a hex mask in smp_affinity

# Run the task on an isolated CPU.
taskset -c 2 chrt -f 80 ./control_loop
```

| Tool | Effect |
|---|---|
| `isolcpus=` | Removes CPUs from general scheduling and load balancing. Long-standing, though cpuset partitions are now the suggested runtime method |
| `nohz_full=` | Stops the periodic tick on a CPU running a single task |
| `rcu_nocbs=` | Moves RCU callback work to other CPUs |
| `irqaffinity=`, `/proc/irq/N/smp_affinity` | Steers interrupts away. Managed IRQs may refuse to move, and `irqbalance` may undo manual settings |
| cpuset cgroup | Runtime isolation through `cpuset.cpus` and partitions |
| `sched_setaffinity` | Pins a thread to CPUs |

Some kernel threads stay per-CPU, so isolation is not absolute. Trace to see what still runs. Also think about shared caches and hyper-threading siblings: a noisy neighbour on a sibling or the last-level cache can hurt, so disable siblings or keep them idle.

Other settings on the checklist: use the `performance` frequency governor, limit deep idle states (`cpu_dma_latency` or a kernel parameter), turn off transparent huge pages if they cause compaction stalls, and avoid swap.

## Avoiding page faults {#ch04-faults .th}

A page fault in a control loop is an unbounded delay from the point of view of your deadline. Normal allocations are lazy: `malloc` and `mmap` give address space, and the page appears on first touch. The kernel counts these faults, so you can see them:

```c run=el-c04-faults
#define _GNU_SOURCE
#include <stdio.h>
#include <sys/mman.h>
#include <sys/resource.h>
#include <unistd.h>

static long minflt(void) { struct rusage r; getrusage(RUSAGE_SELF, &r); return r.ru_minflt; }

int main(void) {
    enum { PAGES = 2000 };
    long ps = sysconf(_SC_PAGESIZE);
    volatile char *p = mmap(NULL, PAGES * ps, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    madvise((void *)p, PAGES * ps, MADV_NOHUGEPAGE);

    long a = minflt();
    for (long i = 0; i < PAGES; i++) p[i * ps] = 1;
    long first = minflt() - a;

    a = minflt();
    for (long i = 0; i < PAGES; i++) p[i * ps] = 2;
    long second = minflt() - a;

    printf("first touch: at least %d faults: %d\n", PAGES, first >= PAGES);
    printf("second touch: under 10 faults: %d\n", second < 10);
}
```

The standard recipe for a real-time program, done before the critical loop starts:

1. `mlockall(MCL_CURRENT | MCL_FUTURE)` locks present and future pages in RAM and stops them from being paged out.
2. Touch every page you will use, including stack and heap. `mlockall` populates what is mapped now, and with `MCL_FUTURE` later mappings are populated during the mapping call, so that call becomes the slow step. Stack not yet grown still faults page by page. Pre-allocate, and pre-fault the stack.
3. With glibc, stop the heap from returning memory: `mallopt(M_TRIM_THRESHOLD, -1)` and `mallopt(M_MMAP_MAX, 0)`.
4. In the loop: no `malloc`, no `printf`, no file I/O and no unbounded system calls. Hand logging to a low-priority thread through a lock-free ring buffer (the SPSC ring from Chapter 3).

`mlockall` is limited by `RLIMIT_MEMLOCK` for unprivileged users, so it may fail. Handle that, since a silently unlocked RT program is a latency bug waiting for memory pressure:

```c run=el-c04-mlock nondet
#define _GNU_SOURCE
#include <errno.h>
#include <malloc.h>
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>

static void prefault_stack(void) {
    volatile char stack[512 * 1024];
    for (size_t i = 0; i < sizeof stack; i += 4096) stack[i] = 0;
}

int main(void) {
    if (mlockall(MCL_CURRENT | MCL_FUTURE) != 0)
        printf("mlockall: %s (running without locked memory)\n", strerrorname_np(errno));
    else
        printf("mlockall: ok\n");
    mallopt(M_TRIM_THRESHOLD, -1);
    mallopt(M_MMAP_MAX, 0);
    prefault_stack();
    printf("ready for the critical loop\n");
}
```

## Drills {#ch04-drills .dr}

:::drill concept
What does "real-time" mean? Is an RT kernel faster?
---
**Answer.** It means there is a known bound on response time, and meeting the deadline is part of correctness. It is often slower in throughput, with similar or worse average latency, and a much lower worst case. **Why.** Hard real-time misses are failures. Soft real-time misses degrade quality. Linux with PREEMPT_RT is commonly used for firm requirements, and safety-critical limits usually need extra analysis beyond it.
:::

:::drill concept
List what PREEMPT_RT changes compared with `PREEMPT`.
---
**Answer.** `spinlock_t` and `rwlock_t` become sleeping rtmutex-based locks with priority inheritance; interrupt handlers are threaded by default; softirqs run in thread context; `raw_spinlock_t` stays spinning for the small parts that truly need it. **Why.** The effect is that nearly all kernel code becomes preemptible by a higher-priority task, so its priority decides who runs.
:::

:::drill tricky
Explain priority inversion in three tasks, then explain why a higher priority for H does not fix it.
---
**Answer.** L holds a lock, H blocks on it, M preempts L, so H waits on M. H's priority is irrelevant while H is blocked, since the scheduler only sees L and M. L is what must run, so L has to be boosted, and priority inheritance does that. **Why.** Alternatives are the priority ceiling protocol (`PTHREAD_PRIO_PROTECT`), and designing without shared locks across priorities.
:::

:::drill bug
This loop should run every 1 ms. What is wrong?

```c
for (;;) {
	do_control();
	usleep(1000);
}
```
---
**Answer.** It runs every 1 ms plus `do_control` time plus wake-up lateness, so it drifts. Use `clock_nanosleep` with `TIMER_ABSTIME` and advance an absolute target by exactly 1 ms. **Why.** Also check overruns: if `now` passes the next target, the loop should detect and count it.
:::

:::drill tricky
A `SCHED_FIFO` task at priority 99 runs `while (1);` on a one-CPU board. What happens to the system?
---
**Answer.** By default, RT throttling leaves a little CPU time for other tasks (about 5% with the default settings), so the system stays barely usable. If throttling is disabled, nothing of lower priority runs on that CPU, including kernel threads at lower priority. **Why.** That is also why you do not use priority 99 by habit: it can outrank things your own task needs, such as a watchdog or interrupt threads.
:::

:::drill output
This program models the priority and order rule of FIFO on one CPU. What does it print?

```python run=el-c04-d-fifo
tasks = [("a", 10, 2), ("b", 50, 2), ("c", 50, 1), ("d", 80, 1)]   # name, priority, ticks
order = ""
while tasks:
    top = max(t[1] for t in tasks)
    i = next(i for i, t in enumerate(tasks) if t[1] == top)
    name, prio, left = tasks[i]
    order += name
    if left == 1:
        tasks.pop(i)
    else:
        tasks[i] = (name, prio, left - 1)
print(order)
```
---
**Answer.** `dbbcaa`. The highest priority runs first. Among equal priorities, the first one keeps the CPU until it finishes. **Why.** With `SCHED_RR`, `b` and `c` would take turns. Only the time slice differs.
:::

:::drill concept
What does `isolcpus` do, and what can still run on an isolated CPU?
---
**Answer.** It removes those CPUs from general scheduling and balancing, so tasks arrive only if explicitly pinned. Still present: some per-CPU kernel threads, interrupts unless also steered away, timers, and the scheduler tick unless `nohz_full` applies. **Why.** A good answer says you verify with tracing and `/proc/interrupts`, instead of trusting the setting.
:::

:::drill bug
An RT task's latency spikes once a minute, only when a logging service runs. The loop is below. What are the likely causes?

```c
for (;;) {
	clock_nanosleep(CLOCK_MONOTONIC, TIMER_ABSTIME, &next, NULL);
	process();
	fprintf(logf, "%ld\n", result);
	buf = malloc(n);
	free(buf);
	advance(&next);
}
```
---
**Answer.** `fprintf` can block on stdio's lock and on file writeback, and `malloc` can take an arena lock or fault new pages. Either can wait on a lower-priority holder. Move logging to a low-priority thread through a lock-free queue, pre-allocate buffers, and call `mlockall` at start. **Why.** "Once a minute" and "only with the logging service" point to a shared resource, not to the kernel's own preemption.
:::

:::drill tricky
You set `SCHED_FIFO` 90 for a task that waits for a device interrupt. Latency gets worse. Why might that be?
---
**Answer.** On an RT kernel, the device's IRQ thread runs at priority 50 by default. If something else of priority higher than 50 hogs the CPU, your interrupt's thread never runs, so your task's high priority does not help. Set the IRQ thread's priority above the competition using `chrt`, and pin it sensibly. **Why.** Priorities have to be planned as a whole chain: event, interrupt thread, then task.
:::

:::drill concept
Why does `mlockall` not fully prevent page faults on its own?
---
**Answer.** It keeps mapped pages in RAM and populates them, but the stack still faults as it grows into new pages, and a later heap expansion pays its cost during the `brk` or `mmap` call. So you also pre-allocate the heap and pre-fault the stack before entering the loop. **Why.** A `fork` makes pages copy-on-write, so the next write in the parent can fault. Locks are not inherited by the child either. Avoid `fork` in RT processes.
:::

:::drill tricky
How do you find out what caused one 300 µs spike seen in a cyclictest run?
---
**Answer.** Rerun with tracing ready to stop at the spike: `cyclictest --breaktrace=N` with ftrace (such as `wakeup_rt` or `function` tracing), or use the `timerlat` and `osnoise` tracers with `rtla`. Then read what ran just before the wake-up. If nothing in the kernel explains it, use `hwlatdetect` to test for hardware or firmware gaps. **Why.** Interviewers want a process that ends in evidence, as opposed to tuning by guesswork.
:::

:::drill concept
Which is better for a fixed periodic task with a known execution time, `SCHED_FIFO` or `SCHED_DEADLINE`?
---
**Answer.** `SCHED_DEADLINE` states the timing directly, and admission control and budget enforcement stop one task from starving others, which is good for several periodic tasks. `SCHED_FIFO` is simpler and more widely used, and easier with existing code and locks. You need to design priorities by hand with FIFO. **Why.** A deadline task that calls `fork` is refused by default, and overruns get throttled. Both are details you must plan for.
:::

## Write the code {#ch04-coding .cd}

:::drill code rating=1100
IRQ affinity masks are hex bitmaps. Write `cpulist_to_mask` for strings such as `"0-1,4"`, printing the result in the form `/proc/irq/N/smp_affinity` uses.
---
Parse comma-separated ranges and set bits.

```c run=el-c04-c-mask
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

static uint64_t cpulist_to_mask(const char *s) {
    uint64_t mask = 0;
    while (*s) {
        char *end;
        long a = strtol(s, &end, 10), b = a;
        if (*end == '-') b = strtol(end + 1, &end, 10);
        for (long c = a; c <= b; c++) mask |= 1ULL << c;
        s = *end ? end + 1 : end;
    }
    return mask;
}

int main(void) {
    const char *t[] = { "0", "0-1", "2-3,6", "0-3,8-11" };
    for (int i = 0; i < 4; i++)
        printf("%-9s %llx\n", t[i], (unsigned long long)cpulist_to_mask(t[i]));
}
```

Real masks on large systems are comma-separated 32-bit groups, so a 64-bit integer is enough only for this exercise.
:::

:::drill code rating=1100
Write `timespec_add_ns` and `timespec_cmp` for a periodic loop, with correct carry, and show overrun detection. Do not use floating point.
---
Keep `tv_nsec` normalised to `0..999999999`. Floating point would lose precision on large values.

```c run=el-c04-c-timespec
#include <stdio.h>
#include <time.h>

#define NSEC 1000000000L

static void add_ns(struct timespec *t, long ns) {
    t->tv_nsec += ns;
    while (t->tv_nsec >= NSEC) { t->tv_nsec -= NSEC; t->tv_sec++; }
}
static int cmp(const struct timespec *a, const struct timespec *b) {
    if (a->tv_sec != b->tv_sec) return a->tv_sec < b->tv_sec ? -1 : 1;
    return (a->tv_nsec > b->tv_nsec) - (a->tv_nsec < b->tv_nsec);
}

int main(void) {
    struct timespec next = { 5, 999500000 };
    add_ns(&next, 1000000);
    printf("%ld.%09ld\n", (long)next.tv_sec, next.tv_nsec);
    struct timespec now = { 6, 600000 };
    printf("overrun: %d\n", cmp(&now, &next) > 0);
    now.tv_nsec = 400000;
    printf("overrun: %d\n", cmp(&now, &next) > 0);
}
```
:::

## Cheat sheet {#ch04-cheatsheet .th}

- Real-time means a bound on the worst case. Measure the `Max`, under load, for a long time.
- Latency sources: non-preemptible kernel code, IRQ and softirq work, lock waits, page faults, caches, idle states, firmware, consoles.
- PREEMPT_RT (mainline since 6.12 on some architectures): sleeping `spinlock_t`, threaded IRQs and softirqs, `raw_spinlock_t` stays spinning. Lower worst case, lower throughput.
- FIFO runs until it blocks or is preempted. RR adds a slice. DEADLINE uses runtime, deadline and period with admission control. All need privilege, so handle `EPERM`.
- Inversion: L holds, H waits, M runs. Inheritance boosts L. Set `PTHREAD_PRIO_INHERIT`, and it does not help semaphores.
- Periodic loop: `clock_nanosleep` with `TIMER_ABSTIME`, `CLOCK_MONOTONIC`, and an absolute target.
- Isolation: `isolcpus`, `nohz_full`, `rcu_nocbs`, `irqaffinity`, cpusets, `taskset`, and stop `irqbalance` if needed.
- Memory: `mlockall(MCL_CURRENT | MCL_FUTURE)`, pre-fault stack and heap, `mallopt`. No `malloc`, `printf` or file I/O in the loop.
- Priority chain: event, IRQ thread (FIFO 50 by default), then task. Plan them together.
- Tools: `cyclictest`, `timerlat`/`osnoise`/`rtla`, `hwlatdetect`, `ftrace`.
