---
title: Interrupts, kernel locking, DMA and cache coherency
part: Part B · Talking to hardware
lede: Drivers run alongside interrupts, other CPUs and devices that write straight to memory. This chapter covers how interrupt work is split between contexts, which lock fits which context, how RCU lets readers avoid locks, and how DMA and caches can disagree about what is in memory. These bugs appear rarely and look random, so interviewers ask about them to see whether you can reason about concurrency and hardware together.
desc: top and bottom halves, softirq, workqueue, spinlock vs mutex, RCU, DMA mappings, cache bugs, barriers, memory corruption
hours: 5
prereqs: Chapter 2, threads and mutexes, what a CPU cache does
---

## Interrupt context and bottom halves {#ch03-irq .th}

A device raises an interrupt. The CPU stops what it is doing and enters the kernel, and Linux calls the handler you registered with `request_irq`. This code runs in **hard interrupt context**: there is no process to put to sleep, so it must not sleep, and local interrupts are off while it runs. Anything slow here delays every other interrupt on the CPU. So the work is divided:

- The **top half** (the handler) does the minimum: read the status, clear the interrupt at the device, grab data that would otherwise be lost, schedule the rest, return.
- The **bottom half** does the rest, later, with interrupts enabled.

| Mechanism | Context | Can sleep? | Notes |
|---|---|---|---|
| Hard IRQ handler | Interrupt | No | Local interrupts off. Return `IRQ_HANDLED`, or `IRQ_NONE` if it was not your device |
| Softirq | Softirq | No | Fixed set of types, such as network receive and timers. The same type can run on several CPUs at once. Not for ordinary drivers |
| Tasklet | Softirq | No | Built on softirqs. A tasklet does not run concurrently with itself. Being phased out in favour of BH workqueues (`WQ_BH`, since 6.9) |
| Threaded IRQ | Process, kernel thread | Yes | `request_threaded_irq`. Has a scheduling priority of its own |
| Workqueue | Process, `kworker` thread | Yes | `schedule_work`. General deferred work |

Softirqs run on the way out of a hard interrupt, or in the per-CPU `ksoftirqd` thread if there is too much work. For a new driver, use a threaded handler or a workqueue unless you have a measured reason to do otherwise, since being able to sleep makes the code simpler.

`request_threaded_irq` takes two functions. The hard handler returns `IRQ_WAKE_THREAD` to wake the thread function. With level-triggered lines you pass `IRQF_ONESHOT`, so that the line stays masked until the thread finishes. Otherwise the interrupt fires again immediately and starves the thread.

:::trap
An IRQ handler for a shared line (`IRQF_SHARED`) must check whether its own device raised the interrupt and return `IRQ_NONE` if not. Returning `IRQ_HANDLED` always hides the real source, and if nobody handles the line, the kernel eventually disables it with "irq N: nobody cared".
:::

## Kernel locking {#ch03-locks .th}

Choose a lock from the **context** of everyone who touches the data.

| Data is shared between | Use |
|---|---|
| Process contexts only, may sleep inside | `mutex` |
| Process context and softirq or tasklet | `spin_lock_bh` in process context, `spin_lock` in softirq |
| Process context and hard IRQ | `spin_lock_irqsave` in process context, `spin_lock` in the handler |
| A single counter or flag | `atomic_t`, bit operations |
| Read-mostly data | RCU, or `seqlock` for small values |
| Per-CPU statistics | per-CPU variables with preemption off |

**Spinlock**: a waiter loops on the CPU, and the holder runs with preemption off. The critical section must be short and must not sleep. It is fast when contention is rare and hold times are shorter than the cost of two context switches.

**Mutex**: a waiter sleeps, after spinning briefly if the owner is running on another CPU. It can only be used where sleeping is allowed, and only the owner may unlock it. `CONFIG_DEBUG_MUTEXES` checks these rules.

:::trap Self-deadlock with one CPU
Process context takes `spin_lock(&l)` with interrupts on. An interrupt arrives on the same CPU and its handler calls `spin_lock(&l)`. The handler spins forever, because the holder cannot run until the handler returns. This is why process context must use `spin_lock_irqsave` when a handler shares the lock. More CPUs do not help, because this interrupt interrupted the very code holding the lock.
:::

Rules that interviewers check: do not sleep holding a spinlock (no `mutex_lock`, `copy_to_user`, `GFP_KERNEL` or `msleep`), take locks in a consistent global order, and keep critical sections short. `CONFIG_PROVE_LOCKING` (lockdep) reports order violations and irq-safety mistakes even when the deadlock itself did not occur in that run, and `CONFIG_DEBUG_ATOMIC_SLEEP` catches sleeping in atomic context. A `BUG: sleeping function called from invalid context` message comes from that check.

On a `PREEMPT_RT` kernel, `spinlock_t` becomes a sleeping lock and `raw_spinlock_t` stays a true spinning lock (Chapter 4).

Locks protect data from races. A counter without a lock loses updates, because `count++` is a read, an add and a write. `volatile` does not change that:

```c run=el-c03-race nondet
#define _GNU_SOURCE
#include <pthread.h>
#include <stdatomic.h>
#include <stdio.h>

#define N 1000000
static volatile long plain;
static atomic_long atom;
static long locked;
static pthread_spinlock_t spin;

static void *worker(void *arg) {
    for (int i = 0; i < N; i++) {
        plain++;
        atomic_fetch_add(&atom, 1);
        pthread_spin_lock(&spin);
        locked++;
        pthread_spin_unlock(&spin);
    }
    return NULL;
}

int main(void) {
    pthread_t t[4];
    pthread_spin_init(&spin, PTHREAD_PROCESS_PRIVATE);
    for (int i = 0; i < 4; i++) pthread_create(&t[i], NULL, worker, NULL);
    for (int i = 0; i < 4; i++) pthread_join(t[i], NULL);
    printf("expected %d\nvolatile %ld\natomic   %ld\nspinlock %ld\n", 4 * N, plain, (long)atom, locked);
}
```

The atomic and spinlock totals are always exact. The `volatile` total depends on the run and is normally short on a multi-core machine.

### RCU basics

**Read-Copy-Update** suits data that is read often and changed rarely, such as routing tables. Readers take no lock and write no shared memory, so they scale with CPU count. A writer does this:

1. Allocate a copy of the object and change the copy.
2. Publish the new pointer with `rcu_assign_pointer`, which includes the ordering needed so readers see initialised contents.
3. Wait for a **grace period**, a time after which every reader that could have seen the old pointer has finished (`synchronize_rcu`, `call_rcu`, or `kfree_rcu`).
4. Free the old object.

```c
/* Reader: cheap, must not sleep in the classic form. */
rcu_read_lock();
c = rcu_dereference(cur_cfg);
rate = c ? c->rate : 0;
rcu_read_unlock();

/* Writer: writers still exclude each other with their own lock. */
mutex_lock(&cfg_lock);
old = rcu_dereference_protected(cur_cfg, lockdep_is_held(&cfg_lock));
if (old)
	*new = *old;
new->rate = rate;
rcu_assign_pointer(cur_cfg, new);
mutex_unlock(&cfg_lock);
if (old)
	kfree_rcu(old, rcu);	/* struct has a struct rcu_head rcu member */
```

The cost moves to writers, and readers may see old data for a while, so RCU fits only when slightly stale is fine. A reader sees either the old object or the new one, never a mix, because the pointer swap is a single store.

## DMA and cache coherency {#ch03-dma .th}

With DMA, a device reads and writes system memory by itself. On a system where the device does not snoop CPU caches, which is common on embedded SoCs, the CPU and the device can see different contents for the same address. The DMA API exists to hide this, and to handle IOMMUs and devices with limited address ranges. Use it even if your current board happens to be coherent.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 262" role="img" aria-label="Two failure cases with a write-back cache and a DMA device: reading a stale cache line, and a dirty line evicted over DMA data">
  <text x="170" y="22" text-anchor="middle" class="t-bold">Stale read</text>
  <rect x="30" y="38" width="130" height="50" rx="6" class="d-acc"/><text x="95" y="60" text-anchor="middle" class="t-small">CPU cache</text><text x="95" y="78" text-anchor="middle" class="t-mono">old</text>
  <rect x="190" y="38" width="130" height="50" rx="6" class="d-soft"/><text x="255" y="60" text-anchor="middle" class="t-small">Device</text><text x="255" y="78" text-anchor="middle" class="t-mono">writes new</text>
  <rect x="110" y="140" width="130" height="50" rx="6" class="d-key"/><text x="175" y="162" text-anchor="middle" class="t-small">DRAM</text><text x="175" y="180" text-anchor="middle" class="t-mono">new</text>
  <path d="M255 88 L 210 140" class="d-line-acc"/>
  <text x="30" y="118" class="t-small t-trap">CPU reads "old" from cache</text>
  <text x="30" y="222" class="t-small">Fix: invalidate before the CPU reads.</text>
  <text x="530" y="22" text-anchor="middle" class="t-bold">Dirty eviction</text>
  <rect x="390" y="38" width="130" height="50" rx="6" class="d-acc"/><text x="455" y="60" text-anchor="middle" class="t-small">CPU cache</text><text x="455" y="78" text-anchor="middle" class="t-mono">dirty line</text>
  <rect x="550" y="38" width="130" height="50" rx="6" class="d-soft"/><text x="615" y="60" text-anchor="middle" class="t-small">Device</text><text x="615" y="78" text-anchor="middle" class="t-mono">writes new</text>
  <rect x="470" y="140" width="130" height="50" rx="6" class="d-key"/><text x="535" y="162" text-anchor="middle" class="t-small">DRAM</text><text x="535" y="180" text-anchor="middle" class="t-mono">new, then lost</text>
  <path d="M615 88 L 570 140" class="d-line-acc"/>
  <path d="M455 88 L 500 140" class="d-line-trap"/>
  <text x="390" y="118" class="t-small t-trap">Eviction overwrites DMA data</text>
  <text x="390" y="222" class="t-small">Fix: clean or invalidate before the device writes,</text>
  <text x="390" y="242" class="t-small">and keep buffers on their own cache lines.</text>
</svg></div><figcaption><b>Two ways a non-coherent cache breaks DMA.</b> The first shows old data once. The second destroys data that was correct in memory, which is much harder to diagnose.</figcaption></figure>

The next program is a simulation of one write-back cache line with a device writing straight to memory. It makes the sequence of events easy to follow.

```python run=el-c03-cache
class Line:
    """One write-back cache line in front of a dict of memory."""
    def __init__(self, mem): self.mem, self.tag, self.val, self.dirty = mem, None, None, False
    def read(self, a):
        if self.tag != a: self.evict(); self.tag, self.val = a, self.mem[a]
        return self.val
    def write(self, a, v):
        if self.tag != a: self.evict(); self.tag = a
        self.val, self.dirty = v, True
    def evict(self):
        if self.dirty: self.mem[self.tag] = self.val
        self.tag, self.dirty = None, False
    invalidate = lambda self: (setattr(self, "tag", None), setattr(self, "dirty", False))

mem = {0: "old"}; c = Line(mem)
c.read(0); mem[0] = "dma"                   # CPU cached the line, then the device wrote memory
print("1 no invalidate :", c.read(0))
c.invalidate()
print("2 invalidated   :", c.read(0))

mem = {0: "old", 1: "x"}; c = Line(mem)
c.write(0, "cpu"); mem[0] = "dma"           # dirty line present while the device writes
c.read(1)                                   # something else evicts the line
print("3 dirty eviction:", mem[0])

mem = {0: "old", 1: "x"}; c = Line(mem)
c.write(0, "cpu"); c.evict(); mem[0] = "dma"   # clean before giving the buffer to the device
c.read(1); print("4 cleaned first :", c.read(0))
```

### Coherent and streaming mappings

| | Coherent (consistent) | Streaming |
|---|---|---|
| API | `dma_alloc_coherent`, `dma_free_coherent` | `dma_map_single`, `dma_map_sg`, `dma_unmap_*` |
| Lifetime | Long-lived, usually for the driver's life | Usually one transfer |
| Who may touch it | CPU and device at the same time | Only one owner at a time |
| How it works | Often an uncached mapping on non-coherent hardware | Cache maintenance at map, unmap and sync |
| Typical use | Descriptor rings, mailboxes | Packet payloads, large data buffers |
| Cost | CPU access can be slow, since it may be uncached | Fast CPU access, with a cost at each handoff |

```c
/* Streaming receive: the device owns the buffer between map and unmap. */
handle = dma_map_single(dev, buf, len, DMA_FROM_DEVICE);
if (dma_mapping_error(dev, handle))
	return -ENOMEM;
/* give handle to the device, wait for completion */
dma_unmap_single(dev, handle, len, DMA_FROM_DEVICE);
/* the CPU may now read buf */
```

Ownership is the idea to remember. After mapping, the CPU must not touch the buffer until it unmaps or calls `dma_sync_single_for_cpu`. To hand the buffer back without unmapping, call `dma_sync_single_for_device`. The direction tells the API which cache work is required: `DMA_TO_DEVICE` needs dirty data written out, and `DMA_FROM_DEVICE` needs stale lines dropped.

Other points to bring up:

- The handle is a `dma_addr_t` in the device's address space. With an IOMMU or address offsets it is not the physical address, so do not use `virt_to_phys`.
- Set what the device can address with `dma_set_mask_and_coherent`. If a buffer is out of range, the kernel may silently use a **bounce buffer** (SWIOTLB), which costs an extra copy.
- Do not map stack or `vmalloc` memory with `dma_map_single`. The former can share cache lines with live variables, and the latter is not physically contiguous.
- A small DMA buffer in a struct must not share a cache line with fields the CPU uses. Align it with `____cacheline_aligned`, or allocate it separately. Maintenance works on whole lines, so a neighbouring field gets caught in it.

:::key
Ask two questions of any DMA bug: who owns this buffer right now, and could a cache line be holding something older or newer than memory? `CONFIG_DMA_API_DEBUG` catches many ownership mistakes.
:::

### False sharing

Caches also have to stay coherent with each other. CPU caches do this in hardware, by moving a line between cores whenever one of them writes it. Two threads writing different variables that happen to share a line still fight over it, with no logical sharing at all. The fix is to place hot per-CPU or per-thread data on separate lines, which the kernel does with `____cacheline_aligned` and per-CPU variables.

```c run=el-c03-falseshare nondet
#define _GNU_SOURCE
#include <pthread.h>
#include <stdatomic.h>
#include <stdio.h>
#include <time.h>

#define N 30000000L
static struct { atomic_long a; atomic_long b; } near_;
static struct { atomic_long a; char pad[256]; atomic_long b; } far_;

static void *inc(void *p) {
    for (long i = 0; i < N; i++) atomic_fetch_add_explicit((atomic_long *)p, 1, memory_order_relaxed);
    return NULL;
}

static double run(atomic_long *x, atomic_long *y) {
    struct timespec s, e;
    pthread_t a, b;
    clock_gettime(CLOCK_MONOTONIC, &s);
    pthread_create(&a, NULL, inc, x);
    pthread_create(&b, NULL, inc, y);
    pthread_join(a, NULL); pthread_join(b, NULL);
    clock_gettime(CLOCK_MONOTONIC, &e);
    return (e.tv_sec - s.tv_sec) + (e.tv_nsec - s.tv_nsec) / 1e9;
}

int main(void) {
    double shared = run(&near_.a, &near_.b);
    double apart = run(&far_.a, &far_.b);
    printf("same line %.2fs, separate lines %.2fs\n", shared, apart);
}
```

The size of the gap depends on the CPU. On a single-core machine there is none, since only one thread runs at a time.

## Memory barriers {#ch03-barriers .th}

Compilers and CPUs both reorder memory operations when a single thread cannot notice. Other CPUs and devices can notice. x86 only lets a load pass an earlier store to a different location, and ARM allows much more. The classic store-buffer test below shows this happening on real hardware when it runs on a multi-core machine: both threads can read 0, an outcome no simple interleaving allows. Adding a full fence removes it.

```c run=el-c03-sb nondet
#define _GNU_SOURCE
#include <pthread.h>
#include <stdatomic.h>
#include <stdio.h>

#define ROUNDS 300000
static atomic_int x, y, go, ready;
static int r1, r2, use_fence;

static void *worker(void *arg) {
    int me = arg != NULL;                         /* 0 writes x and reads y, 1 the reverse */
    atomic_int *mine = me ? &y : &x, *other = me ? &x : &y;
    for (int i = 1; i <= ROUNDS; i++) {
        while (atomic_load(&go) != i) ;
        atomic_store_explicit(mine, 1, memory_order_relaxed);
        if (use_fence) atomic_thread_fence(memory_order_seq_cst);
        *(me ? &r2 : &r1) = atomic_load_explicit(other, memory_order_relaxed);
        atomic_fetch_add(&ready, 1);
    }
    return NULL;
}
static long run(int fence) {
    pthread_t a, b;
    long both_zero = 0;
    use_fence = fence;
    atomic_store(&go, 0);
    pthread_create(&a, NULL, worker, NULL);
    pthread_create(&b, NULL, worker, &a);
    for (int i = 1; i <= ROUNDS; i++) {
        atomic_store(&x, 0); atomic_store(&y, 0); atomic_store(&ready, 0);
        atomic_store(&go, i);
        while (atomic_load(&ready) != 2) ;
        if (r1 == 0 && r2 == 0) both_zero++;
    }
    pthread_join(a, NULL); pthread_join(b, NULL);
    return both_zero;
}
int main(void) {
    printf("no fence: both read 0 in %ld of %d rounds\n", run(0), ROUNDS);
    printf("fence   : both read 0 in %ld of %d rounds\n", run(1), ROUNDS);
}
```

The kernel's main tools:

| Tool | What it does |
|---|---|
| `barrier()` | Compiler only. No CPU instruction |
| `READ_ONCE`, `WRITE_ONCE` | One real access, not torn or merged by the compiler. No CPU ordering |
| `smp_mb`, `smp_rmb`, `smp_wmb` | CPU-to-CPU ordering. Compile to a compiler barrier on non-SMP builds |
| `smp_load_acquire`, `smp_store_release` | One-way ordering attached to one access. Preferred for publish patterns |
| `mb`, `rmb`, `wmb` | Ordering that also applies to devices |
| `dma_wmb`, `dma_rmb` | Ordering for CPU and device access to coherent memory |
| `readl`, `writel` | MMIO with ordering. The `_relaxed` forms drop most of it |

Barriers come in pairs: a write barrier on the publishing side does nothing unless the reader has a matching one. The standard device pattern publishes a descriptor to the hardware, with the ownership bit written last:

```c
d->addr = cpu_to_le64(handle);
d->len = cpu_to_le32(n);
dma_wmb();				/* device must not see OWN before addr and len */
WRITE_ONCE(d->flags, cpu_to_le32(DESC_OWN));
writel(tail, regs + REG_DOORBELL);	/* writel orders against the memory writes above */
```

:::trap
`volatile` is not a memory barrier. It stops the compiler from dropping or merging accesses to that variable, and it has no effect on what other CPUs observe, or on the order of accesses to other variables. Kernel documentation discourages it for this reason, in `volatile-considered-harmful`.
:::

## Memory corruption causes {#ch03-corruption .th}

When memory holds a wrong value and the crash happens much later, you need a list of suspects and a way to narrow them. The contents of the bad memory are often the best clue: packet data suggests DMA, a repeating pattern suggests poison.

| Cause | Typical sign |
|---|---|
| Buffer overrun | A neighbouring object or slab redzone is damaged. Found by KASAN, `slub_debug` |
| Use after free | Value `6b6b6b6b` with slab poisoning on (`POISON_FREE` is `0x6b`). KASAN, KFENCE |
| Double free | Allocator reports it, or freelist corruption shows up later |
| List misuse | Oops at an address with `dead...100` or `dead...122` (`LIST_POISON1` and `2` on many 64-bit builds) |
| DMA after unmap or free | Device data appears in unrelated objects. Try `CONFIG_DMA_API_DEBUG`, and an IOMMU reports faults |
| Cache line shared with DMA | Fields beside a DMA buffer change value, only on non-coherent systems |
| Missing lock or barrier | Rare, load-dependent. KCSAN finds data races. Lockdep finds lock misuse |
| Kernel stack overflow | Random crash in deep call chains. `CONFIG_VMAP_STACK` gives a guard page |
| Hardware | Bad DRAM timing or power. Patterns of single-bit flips, varying with temperature. Run a memory test |

## Drills {#ch03-drills .dr}

:::drill concept
Why can't you sleep in an interrupt handler?
---
**Answer.** Sleeping means switching to another task and being woken later, but an interrupt handler has no task of its own to suspend: it runs on top of whatever was interrupted. Nothing could reschedule it, and it may hold up the interrupted code, which could be holding the very thing it waits for. **Why.** Follow-up: threaded handlers can sleep because they run as real kernel threads.
:::

:::drill tricky
Spinlock or mutex for a critical section of 5 µs in process context with no interrupt involvement? And if it must call `kmalloc(GFP_KERNEL)`?
---
**Answer.** Either can work for the first, and a mutex is the normal default since it stays correct if the section later grows. With `GFP_KERNEL`, the allocation can sleep, so it must be a mutex, or the allocation should move outside the lock. **Why.** Modern mutexes spin briefly when the owner is running, so the old "spinlock is faster for short sections" argument is weaker than people expect.
:::

:::drill bug
This driver deadlocks under load on a machine with several CPUs. Why?

```c
static void process_ctx(void)
{
	spin_lock(&dev->lock);
	dev->count++;
	spin_unlock(&dev->lock);
}

static irqreturn_t handler(int irq, void *d)
{
	spin_lock(&dev->lock);
	dev->pending = 1;
	spin_unlock(&dev->lock);
	return IRQ_HANDLED;
}
```
---
**Answer.** If the interrupt arrives on the CPU that is inside `process_ctx` holding the lock, the handler spins on a lock its own CPU holds. Use `spin_lock_irqsave` in process context. **Why.** It looks rare because it needs an interrupt in a small window on the same CPU, which is why it only shows under load. Lockdep reports it the first time both paths run.
:::

:::drill concept
Compare softirq, tasklet and workqueue. When would you choose each?
---
**Answer.** Softirqs are a fixed set for high-rate core subsystems, can run on several CPUs at once and cannot sleep. Tasklets were the simple driver version, serialised against themselves, also unable to sleep, and they are being phased out. Workqueues run in kernel threads and can sleep. Use a workqueue or threaded IRQ for almost everything in a driver. **Why.** Softirq and tasklet work also runs ahead of all normal tasks, which hurts latency (Chapter 4).
:::

:::drill output
What does this print, and what property does it show?

```c run=el-c03-d-bitops
#include <stdatomic.h>
#include <stdio.h>

int main(void) {
    atomic_uint flags = 0;
    unsigned prev = atomic_fetch_or(&flags, 1u << 3);
    printf("%u %u\n", prev, (unsigned)flags);
    prev = atomic_fetch_or(&flags, 1u << 3);
    printf("%u %u\n", prev, (unsigned)flags);
    printf("first setter: %d\n", (prev & (1u << 3)) == 0);
}
```
---
**Answer.** The first call returns the old value 0 and sets bit 3, giving 8. The second returns 8 and changes nothing. `prev` now holds the second call's result, so the last line prints 0: the second caller did not win. Only one caller ever sees the bit clear. **Why.** This is what the kernel's `test_and_set_bit` does, and it is the standard way to run something only once without a lock.
:::

:::drill bug
A receive path sometimes returns old packet contents on an ARM board and always works on x86. What is missing?

```c
handle = dma_map_single(dev, buf, len, DMA_FROM_DEVICE);
start_rx(dev, handle);
wait_for_completion(&done);
memcpy(out, buf, len);
```
---
**Answer.** The CPU reads `buf` without `dma_unmap_single` or `dma_sync_single_for_cpu`, so it may hit stale cache lines. **Why.** x86 is generally coherent for DMA, so the missing step does no harm there, and that is why the code passed review on a PC.
:::

:::drill tricky
Why does a buffer used for DMA sometimes corrupt the struct field right next to it, on non-coherent hardware only?
---
**Answer.** Cache maintenance works on whole lines. If the buffer shares a line with a field, invalidating the line drops the CPU's recent write to the field, and a dirty write-back of the field overwrites the device's data in the same line. Fix it by aligning the buffer to a cache line and padding after it, or by allocating it separately. **Why.** `kmalloc` guarantees DMA-safe alignment for its own allocations by `ARCH_DMA_MINALIGN` rules, but a member inside a struct does not get that.
:::

:::drill concept
When would you pick a coherent mapping, and when a streaming mapping?
---
**Answer.** Coherent for structures that both sides access at any time, such as descriptor rings and status blocks. Streaming for data buffers passed one way per transfer. Streaming keeps CPU access cached and fast, with maintenance only at handoff. **Why.** A follow-up might be whether coherent memory removes the need for barriers. It does not: `dma_wmb` is still needed to order the writes the device sees.
:::

:::drill bug
Publishing an initialised object to another CPU. What can go wrong on ARM?

```c
obj->value = 42;
obj->ready = 1;

/* other CPU */
if (obj->ready)
	use(obj->value);
```
---
**Answer.** The CPU or compiler can reorder the two writes or the two reads, so the reader can see `ready == 1` and an old `value`. Use `smp_store_release(&obj->ready, 1)` and `smp_load_acquire(&obj->ready)`. **Why.** On x86 hardware keeps store-store and load-load order, so only the compiler could cause it, and the bug stays hidden until the code moves to ARM.
:::

:::drill concept
Explain RCU to someone who knows reader-writer locks. Why are RCU readers faster?
---
**Answer.** A reader-writer lock makes readers write to a shared counter, so each read bounces a cache line between CPUs. RCU readers write nothing shared, and on non-preempt kernels `rcu_read_lock` does almost nothing. Writers copy, publish the new pointer, wait for existing readers to finish, then free the old copy. **Why.** The cost is that readers may see old data briefly, writers are slow, and writers need their own lock against each other.
:::

:::drill tricky
A crash shows a pointer value of `6b6b6b6b6b6b6b6b`. What do you suspect first?
---
**Answer.** Use after free. With slab poisoning, freed objects are filled with `0x6b`, so a pointer read from a freed object has this value. Look at who frees that object type, and enable KASAN to get the allocation and free stacks. **Why.** Knowing poison patterns turns a scary oops into a one-line diagnosis.
:::

:::drill bug
Why is this flag loop wrong, even with `volatile`?

```c
volatile int done;
int result;

/* thread A */  result = compute(); done = 1;
/* thread B */  while (!done) ; use(result);
```
---
**Answer.** `volatile` forces reads and writes of `done`, but it gives no ordering against `result`. On a weakly ordered CPU, B can see `done == 1` and an old `result`. It is also a data race on `result` in C. Use acquire and release (or a kernel completion). **Why.** In the kernel you would normally use `wait_for_completion`, which also avoids burning the CPU.
:::

## Write the code {#ch03-coding .cd}

:::drill code rating=1400
Write a lock-free single-producer, single-consumer ring buffer using C11 atomics, of the kind used between an interrupt handler and a thread. Prove it delivers every item in order.
---
Each index has one writer. The producer publishes with release after filling the slot, and the consumer reads with acquire.

```c run=el-c03-c-spsc
#include <pthread.h>
#include <stdatomic.h>
#include <stdio.h>

#define SIZE 1024          /* power of two */
static int ring[SIZE];
static atomic_uint head, tail;   /* free-running counters */

static int put(int v) {
    unsigned h = atomic_load_explicit(&head, memory_order_relaxed);
    if (h - atomic_load_explicit(&tail, memory_order_acquire) == SIZE) return 0;   /* full */
    ring[h & (SIZE - 1)] = v;
    atomic_store_explicit(&head, h + 1, memory_order_release);
    return 1;
}

static int get(int *v) {
    unsigned t = atomic_load_explicit(&tail, memory_order_relaxed);
    if (atomic_load_explicit(&head, memory_order_acquire) == t) return 0;          /* empty */
    *v = ring[t & (SIZE - 1)];
    atomic_store_explicit(&tail, t + 1, memory_order_release);
    return 1;
}

#define COUNT 2000000
static void *producer(void *arg) {
    for (int i = 0; i < COUNT; )
        if (put(i)) i++;
    return NULL;
}

int main(void) {
    pthread_t p;
    pthread_create(&p, NULL, producer, NULL);
    int v, next = 0, errors = 0;
    while (next < COUNT)
        if (get(&v)) { if (v != next) errors++; next++; }
    pthread_join(p, NULL);
    printf("received %d items, out of order: %d\n", next, errors);
}
```

The kernel has `kfifo` for exactly this pattern. It needs no lock with one reader and one writer.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- Top half: quick, no sleeping, interrupts off. Bottom half: softirq and tasklet cannot sleep, threaded IRQ and workqueue can.
- `IRQF_SHARED`: check your device, return `IRQ_NONE` otherwise. Threaded with a level-triggered line: `IRQF_ONESHOT`.
- Pick the lock by context: mutex if everyone may sleep, `spin_lock_bh` with softirq, `spin_lock_irqsave` with a hard IRQ.
- Never sleep under a spinlock. Same-CPU interrupt on the same lock means deadlock. Lockdep finds this.
- RCU: copy, publish, wait for grace period, free. Readers are cheap, writers are slow and need their own lock.
- Coherent DMA is for shared long-lived structures. Streaming DMA is for transfers, with an owner and a direction.
- Always check `dma_mapping_error`. CPU must not touch a mapped buffer until unmap or sync. Not stack, not vmalloc, not sharing a cache line.
- Stale read: invalidate before reading. Dirty eviction: clean before the device writes.
- `barrier` is compiler only. `smp_*` is CPU-to-CPU. `dma_*` and `mb` are for devices. Release pairs with acquire. `volatile` is not a barrier.
- `0x6b` means use after free. `dead...100` means a deleted list entry. ASCII in an integer means overrun. Device data in a kernel object means DMA.
- Tools: KASAN, KFENCE, KCSAN, lockdep, `slub_debug`, `CONFIG_DMA_API_DEBUG`, memory test.
