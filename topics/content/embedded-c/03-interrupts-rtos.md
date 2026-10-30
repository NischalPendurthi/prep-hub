---
title: Interrupt handlers and RTOS scheduling
part: Part C · Concurrency without an OS, and with a small one
lede: Firmware is concurrent even with one core, because an interrupt can arrive between any two instructions. This chapter covers what an ISR may and may not do, how to share data with one safely, ring buffers, watchdogs, and then what an RTOS adds. It ends with the scheduling questions interviewers like: mutex versus semaphore, priority inversion and rate-monotonic analysis.
desc: ISR rules, latency, nesting, critical sections, ring buffers, watchdog, super-loop vs RTOS, priority scheduling, priority inversion, rate-monotonic
hours: 4
prereqs: Chapters 1 and 2, threads and mutexes from an OS course
---

## What happens on an interrupt {#ch03-entry .th}

When a peripheral raises an interrupt and its priority allows it, the CPU finishes the current instruction (some long ones can be interrupted partway) and saves context. It then reads the handler's address from the vector table and runs it. On return, the saved context is restored and the interrupted code continues, unaware.

On a Cortex-M the hardware pushes eight registers: `r0`–`r3`, `r12`, `lr`, `pc` and `xPSR`. These are the registers the calling convention lets a function overwrite, so an ISR can be an ordinary C function. `lr` holds a special `EXC_RETURN` value that tells the hardware to unstack on return.

**Latency** is the time from the event to the first useful instruction of the handler. On a Cortex-M3 or M4 with zero-wait memory, the hardware part is about a dozen cycles. The larger, more variable parts are in your control:

- the longest section of code that runs with interrupts disabled
- any higher-priority ISRs that run first
- wait states on flash, and cache misses on bigger cores

**Jitter** is how much the latency varies, and for a control loop it can matter more than the average.

**Nesting.** A higher-priority interrupt can preempt a lower-priority handler. Equal priorities wait their turn. On the Cortex-M interrupt controller (NVIC), a lower number means higher priority, so priority 0 beats priority 5. The hardware also optimises back-to-back interrupts by skipping the unstack and restack, which is called tail-chaining.

## Rules for an ISR {#ch03-rules .th}

- **Keep it short.** Read the hardware, clear the flag, put data in a buffer, set a flag or wake a task, and return. Do the processing elsewhere. Long ISRs add latency to everything of equal or lower priority.
- **Clear the interrupt source.** If a level-triggered flag stays set, the handler re-enters as soon as it returns, and the system appears hung.
- **Never block.** No `delay`, no waiting on a mutex, no polling loop with an unbounded wait. An ISR has no task context to suspend.
- **Avoid non-reentrant calls.** `printf` and `malloc` commonly use global state or locks, so they can deadlock or corrupt state if the interrupted code was inside them. They are also slow.
- **Mark shared data `volatile`, and protect it.** See below.
- **Beware of floating point.** It may add stacking cost or need setup, depending on the core and its settings.

## Sharing data with the main loop {#ch03-shared .th}

The hazard is the same as in Chapter 2: main's update can be interrupted part way. A hosted program cannot take real interrupts, so these examples use POSIX signals as a stand-in. A signal handler runs on top of the current code and can be blocked, as an interrupt can be masked. `raise` makes the "interrupt" arrive at an exact line, so the result repeats every run.

```c run=ec-c03-lost-update
#define _POSIX_C_SOURCE 200809L
#include <signal.h>
#include <stdio.h>
static volatile unsigned count;
static void isr(int sig) { (void)sig; count++; }
int main(void) {
    struct sigaction sa = {.sa_handler = isr};
    sigaction(SIGUSR1, &sa, NULL);
    unsigned tmp = count;        /* main begins count++ */
    raise(SIGUSR1);              /* interrupt between the load and the store */
    count = tmp + 1;
    printf("unprotected: %u\n", count);
    count = 0;
    sigset_t block, old;
    sigemptyset(&block);
    sigaddset(&block, SIGUSR1);
    sigprocmask(SIG_BLOCK, &block, &old);   /* enter critical section */
    tmp = count;
    raise(SIGUSR1);                         /* stays pending */
    count = tmp + 1;
    sigprocmask(SIG_SETMASK, &old, NULL);   /* leave: the handler runs now */
    printf("protected:   %u\n", count);
    return 0;
}
```

Two increments happened in each case. The unprotected version lost one of them, and `volatile` did not help.

A variable also tears when it is wider than one load. A 32-bit tick counter read on an 8-bit CPU takes four loads, so an interrupt can change it midway. On a 32-bit core an aligned word read is a single access, but a `uint64_t` is not.

### Critical sections

A critical section disables interrupts, or only those at or below some priority, for a few instructions. The correct pattern saves the previous state and restores it, so that nesting works. Unconditionally re-enabling is a classic bug, because it turns interrupts back on inside an outer critical section. This simulation uses a variable in place of the CPU's interrupt mask:

```c run=ec-c03-nested-cs
#include <stdio.h>
static int irq_on = 1;                       /* simulated interrupt enable flag */
static int save_and_disable(void) { int s = irq_on; irq_on = 0; return s; }
static void restore(int s) { irq_on = s; }
static void helper_bad(void)  { irq_on = 0; /* work */ irq_on = 1; }
static void helper_good(void) { int s = save_and_disable(); /* work */ restore(s); }
int main(void) {
    int s = save_and_disable();
    helper_bad();
    printf("after bad helper:  irq_on=%d (still inside the outer section)\n", irq_on);
    restore(s);
    s = save_and_disable();
    helper_good();
    printf("after good helper: irq_on=%d\n", irq_on);
    restore(s);
    return 0;
}
```

On a Cortex-M the save and restore uses the `PRIMASK` register. `BASEPRI` masks only low priorities, so urgent interrupts stay live. Keep these sections as short as you can, because their length adds directly to worst-case latency. Other options avoid disabling interrupts altogether: exclusive load/store instructions, C11 `<stdatomic.h>`, or a design where each variable has only one writer.

:::trap A masked interrupt only remembers one event
An interrupt's pending state is a single bit. If an event fires three times while masked, you get one handler call. So do not count events by counting ISR runs when they can arrive faster than you service them. The drills show the same effect with signals.
:::

## Ring buffers {#ch03-ring .th}

A ring buffer moves data between an ISR and the main loop with no lock, as long as there is one producer and one consumer. Each index has one writer. The producer writes the slot first and then advances `head`, and the consumer reads the slot first and then advances `tail`. Here the indices run freely and are masked on use, which makes empty and full easy to tell apart when the size is a power of two:

```c run=ec-c03-ring
#include <stdio.h>
#include <stdint.h>
#define SIZE 4u                               /* must be a power of two */
static volatile uint8_t buf[SIZE];
static volatile uint32_t head, tail;          /* free-running; wrap is harmless */
static uint32_t dropped;
static int rb_put(uint8_t b) {                /* called by the ISR */
    if (head - tail == SIZE) { dropped++; return 0; }
    buf[head & (SIZE - 1)] = b;
    head++;
    return 1;
}
static int rb_get(uint8_t *b) {               /* called by the main loop */
    if (head == tail) return 0;
    *b = buf[tail & (SIZE - 1)];
    tail++;
    return 1;
}
int main(void) {
    for (uint8_t c = 'a'; c <= 'f'; c++) rb_put(c);
    printf("dropped %u, used %u\n", (unsigned)dropped, (unsigned)(head - tail));
    uint8_t b;
    while (rb_get(&b)) putchar(b);
    putchar('\n');
    rb_put('x');
    rb_get(&b);
    printf("%c head=%u tail=%u\n", b, (unsigned)head, (unsigned)tail);
    return 0;
}
```

`head` and `tail` alone being `volatile` is not enough, since the compiler may move a non-volatile `buf` write across the `head` update. The example also makes `buf` volatile, which is sufficient on a single core. Portable code uses C11 atomics with release and acquire, as in the coding drill below, and a multi-core system needs them. The other common design keeps indices wrapped and leaves one slot empty, so that `head == tail` always means empty.

## Watchdog {#ch03-watchdog .th}

A watchdog is a hardware timer that resets the chip unless software "kicks" it before it expires. Its clock is usually independent of the main clock, so it survives a clock failure. Where you kick it is what interviewers ask about:

- Kick from a place that proves the whole system is healthy. A kick from a timer ISR proves only that interrupts work, while the main loop may be stuck.
- With several tasks, have each one report in, and let one supervisor kick only when all have reported (see the code section).
- Do not kick inside a long loop just to silence it.
- Check the reset-cause register at boot, and log watchdog resets.

A **window watchdog** also resets if you kick too early, which catches code running away in a tight loop that includes the kick.

## Super-loop or RTOS {#ch03-superloop .th}

| | Super-loop with ISRs | Preemptive RTOS |
|---|---|---|
| Structure | `for (;;) { poll flags; run each job; }` | Independent tasks with priorities, blocking on events |
| Worst-case response of main-loop work | The sum of all other jobs | Set by priority; a high-priority task runs at once |
| Blocking calls | Not allowed; long jobs become state machines | Normal; the task sleeps and others run |
| RAM | One stack | One stack per task, plus kernel objects |
| Risks | One slow job delays all; hidden coupling | Races, deadlock, priority inversion, stack sizing |
| Good fit | Few simple jobs, tight memory | Several activities with different deadlines, or stacks like networking |

Neither is better in general. A sensor node with two jobs does not need a kernel. A device juggling a radio stack, a motor loop and a display usually benefits from one.

## Preemptive priority scheduling {#ch03-sched .th}

An RTOS keeps tasks in states: **running**, **ready**, **blocked** (waiting on time or an event), and sometimes **suspended**. The rule is simple: the highest-priority ready task runs. A timer tick or an ISR that wakes a task can trigger a switch at once. Equal priorities commonly share the CPU in time slices, depending on configuration. On a Cortex-M the switch usually happens in the `PendSV` exception at the lowest priority, so it never delays another ISR. It saves the remaining registers and the stack pointer, and then restores those of the next task. "Real time" means deadlines can be met predictably, and it does not imply fast.

### Mutex versus semaphore

- **Mutex**: for mutual exclusion. It has an owner, and only the owner may release it. Because of ownership the kernel can apply priority inheritance, and it may support recursive locking. It cannot be used from an ISR.
- **Binary semaphore**: for signalling. It has no owner, so one context gives and another takes. An ISR giving a semaphore to wake a task is the standard deferred-interrupt pattern.
- **Counting semaphore**: counts available resources or pending events, such as free buffers.

### Priority inversion

Inversion happens when a high-priority task waits for a lock held by a low-priority one. Some wait is unavoidable and is short. The danger is an unrelated medium-priority task preempting the lock holder, because then the high-priority task waits for as long as the medium one runs. Mars Pathfinder hit this in 1997: repeated system resets on the lander were traced to this pattern, and the fix was to enable priority inheritance.

This small tick simulator shows it. Each letter is the task that ran in that tick. L locks a mutex at tick 1. H arrives at tick 2 and needs the mutex at tick 3. M arrives at tick 3 and never touches the mutex.

```python run=ec-c03-inversion
def simulate(inherit):
    # prog: CPU ticks, "lock" or "unlock"; a higher prio number is more urgent
    tasks = {"L": dict(prio=1, arrive=0, prog=[1, "lock", 4, "unlock", 1]),
             "M": dict(prio=2, arrive=3, prog=[5]),
             "H": dict(prio=3, arrive=2, prog=[1, "lock", 1, "unlock", 1])}
    owner, trace, done, t = None, "", {}, 0
    while len(done) < 3:
        live = [n for n, k in tasks.items() if k["arrive"] <= t and k["prog"]]
        waiting = [n for n in live if tasks[n]["prog"][0] == "lock" and owner not in (None, n)]
        def prio(n):
            own = tasks[n]["prio"]
            return max([own] + [tasks[w]["prio"] for w in waiting]) if inherit and n == owner else own
        run = max((n for n in live if n not in waiting), key=prio)
        prog = tasks[run]["prog"]
        if prog[0] == "lock":
            owner = run
            prog.pop(0)
        prog[0] -= 1
        trace += run
        if prog[0] == 0:
            prog.pop(0)
        if prog and prog[0] == "unlock":
            owner = None
            prog.pop(0)
        t += 1
        if not prog:
            done[run] = t
    return trace, done

for inherit in (False, True):
    trace, done = simulate(inherit)
    print("inherit" if inherit else "plain  ", trace, "H done at", done["H"], "M done at", done["M"])
```

Without inheritance, H finishes at tick 13, after M has run all 5 of its ticks, even though M has lower priority and never uses the mutex. With inheritance, L runs at H's priority from tick 3 and releases the mutex after three more ticks. H then finishes at tick 8, and M is the one that waits, as its priority says it should.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 140" role="img" aria-label="Timelines of tasks L, M and H with and without priority inheritance; without it, M runs before H">
  <text x="10" y="52" text-anchor="start" class="t-mono">plain</text>
  <rect x="80" y="30" width="44" height="34" class="d-soft"/>
  <text x="102" y="52" text-anchor="middle" class="t-mono">L</text>
  <rect x="124" y="30" width="44" height="34" class="d-soft"/>
  <text x="146" y="52" text-anchor="middle" class="t-mono">L</text>
  <rect x="168" y="30" width="44" height="34" class="d-key"/>
  <text x="190" y="52" text-anchor="middle" class="t-mono">H</text>
  <rect x="212" y="30" width="44" height="34" class="d-trap"/>
  <text x="234" y="52" text-anchor="middle" class="t-mono">M</text>
  <rect x="256" y="30" width="44" height="34" class="d-trap"/>
  <text x="278" y="52" text-anchor="middle" class="t-mono">M</text>
  <rect x="300" y="30" width="44" height="34" class="d-trap"/>
  <text x="322" y="52" text-anchor="middle" class="t-mono">M</text>
  <rect x="344" y="30" width="44" height="34" class="d-trap"/>
  <text x="366" y="52" text-anchor="middle" class="t-mono">M</text>
  <rect x="388" y="30" width="44" height="34" class="d-trap"/>
  <text x="410" y="52" text-anchor="middle" class="t-mono">M</text>
  <rect x="432" y="30" width="44" height="34" class="d-soft"/>
  <text x="454" y="52" text-anchor="middle" class="t-mono">L</text>
  <rect x="476" y="30" width="44" height="34" class="d-soft"/>
  <text x="498" y="52" text-anchor="middle" class="t-mono">L</text>
  <rect x="520" y="30" width="44" height="34" class="d-soft"/>
  <text x="542" y="52" text-anchor="middle" class="t-mono">L</text>
  <rect x="564" y="30" width="44" height="34" class="d-key"/>
  <text x="586" y="52" text-anchor="middle" class="t-mono">H</text>
  <rect x="608" y="30" width="44" height="34" class="d-key"/>
  <text x="630" y="52" text-anchor="middle" class="t-mono">H</text>
  <rect x="652" y="30" width="44" height="34" class="d-soft"/>
  <text x="674" y="52" text-anchor="middle" class="t-mono">L</text>
  <text x="10" y="112" text-anchor="start" class="t-mono">inherit</text>
  <rect x="80" y="90" width="44" height="34" class="d-soft"/>
  <text x="102" y="112" text-anchor="middle" class="t-mono">L</text>
  <rect x="124" y="90" width="44" height="34" class="d-soft"/>
  <text x="146" y="112" text-anchor="middle" class="t-mono">L</text>
  <rect x="168" y="90" width="44" height="34" class="d-key"/>
  <text x="190" y="112" text-anchor="middle" class="t-mono">H</text>
  <rect x="212" y="90" width="44" height="34" class="d-soft"/>
  <text x="234" y="112" text-anchor="middle" class="t-mono">L</text>
  <rect x="256" y="90" width="44" height="34" class="d-soft"/>
  <text x="278" y="112" text-anchor="middle" class="t-mono">L</text>
  <rect x="300" y="90" width="44" height="34" class="d-soft"/>
  <text x="322" y="112" text-anchor="middle" class="t-mono">L</text>
  <rect x="344" y="90" width="44" height="34" class="d-key"/>
  <text x="366" y="112" text-anchor="middle" class="t-mono">H</text>
  <rect x="388" y="90" width="44" height="34" class="d-key"/>
  <text x="410" y="112" text-anchor="middle" class="t-mono">H</text>
  <rect x="432" y="90" width="44" height="34" class="d-trap"/>
  <text x="454" y="112" text-anchor="middle" class="t-mono">M</text>
  <rect x="476" y="90" width="44" height="34" class="d-trap"/>
  <text x="498" y="112" text-anchor="middle" class="t-mono">M</text>
  <rect x="520" y="90" width="44" height="34" class="d-trap"/>
  <text x="542" y="112" text-anchor="middle" class="t-mono">M</text>
  <rect x="564" y="90" width="44" height="34" class="d-trap"/>
  <text x="586" y="112" text-anchor="middle" class="t-mono">M</text>
  <rect x="608" y="90" width="44" height="34" class="d-trap"/>
  <text x="630" y="112" text-anchor="middle" class="t-mono">M</text>
  <rect x="652" y="90" width="44" height="34" class="d-soft"/>
  <text x="674" y="112" text-anchor="middle" class="t-mono">L</text>
  <text x="80" y="24" text-anchor="middle" class="t-small">0</text>
  <text x="168" y="24" text-anchor="middle" class="t-small">2</text>
  <text x="256" y="24" text-anchor="middle" class="t-small">4</text>
  <text x="344" y="24" text-anchor="middle" class="t-small">6</text>
  <text x="432" y="24" text-anchor="middle" class="t-small">8</text>
  <text x="520" y="24" text-anchor="middle" class="t-small">10</text>
  <text x="608" y="24" text-anchor="middle" class="t-small">12</text>
  <text x="696" y="24" text-anchor="middle" class="t-small">14</text>
</svg></div><figcaption><b>The recorded traces, one cell per tick.</b> In the top row M runs while H waits on the lock L holds, and H finishes at tick 13. In the bottom row L inherits H's priority, and H finishes at tick 8.</figcaption></figure>

The two standard fixes are:

- **Priority inheritance**: while a task holds a lock that a higher-priority task wants, it runs at that higher priority. Simple, and used on demand.
- **Priority ceiling**: each mutex has a ceiling equal to the highest priority of any task that uses it. A task runs at the ceiling while it holds the lock. It needs prior knowledge of who uses what, and it also prevents some deadlocks.

### Rate-monotonic scheduling

For periodic tasks with fixed priorities, the **rate-monotonic** rule gives the shorter period the higher priority. Under the classic assumptions (independent tasks, deadline equal to period, no blocking, zero switch cost), it is optimal among fixed-priority schedules: if any fixed priority order works, this one does.

Utilisation is `U = Σ C/T`, where `C` is worst-case run time and `T` the period. Liu and Layland proved a sufficient test: `U ≤ n(2^(1/n) − 1)`. For large `n` the bound approaches ln 2, about 0.693. Passing it guarantees success, and failing it proves nothing, so you then calculate the exact worst-case response time. A task's response is its own time plus all the higher-priority work released during it: `R = C + Σ ceil(R/Tj)·Cj`. You iterate from `R = C` until it stops changing or passes the deadline.

```python run=ec-c03-rms
import math

def bound(n):
    return n * (2 ** (1 / n) - 1)

def response_times(tasks):   # tasks sorted by period; each is (C, T)
    out = []
    for i, (c, t) in enumerate(tasks):
        r = c
        while True:
            nxt = c + sum(math.ceil(r / tj) * cj for cj, tj in tasks[:i])
            if nxt == r or nxt > t:
                r = nxt
                break
            r = nxt
        out.append(r)
    return out

def timeline(tasks, length):
    left = [0] * len(tasks)
    s = ""
    for t in range(length):
        for i, (c, p) in enumerate(tasks):
            if t % p == 0:
                left[i] = c
        ready = [i for i in range(len(tasks)) if left[i]]
        if ready:
            left[ready[0]] -= 1
            s += "ABC"[ready[0]]
        else:
            s += "."
    return s

print("bounds", [round(bound(n), 3) for n in (1, 2, 3, 10)])
for tasks in ([(1, 4), (2, 6), (3, 12)], [(2, 5), (4, 7)]):
    u = sum(c / t for c, t in tasks)
    print(tasks, "U =", round(u, 3), "bound =", round(bound(len(tasks)), 3), "R =", response_times(tasks))
print(timeline([(1, 4), (2, 6), (3, 12)], 12))
```

The first set has `U` = 0.833, above the three-task bound of 0.78, so the simple test is inconclusive. The exact test gives responses of 1, 3 and 10, all within the periods of 4, 6 and 12. The timeline (A, B and C are the tasks, in priority order) covers one 12-tick cycle and confirms that C finishes at tick 10. The second set has `U` = 0.971, and its second task reaches 8, past its deadline of 7. That set fails with fixed priorities although `U` is below 1.

## Drills {#ch03-drills .dr}

:::drill concept
What should an ISR do, and what should it never do?
---
**Answer.** It should acknowledge the hardware, move data to a buffer, signal a task or set a flag, and return quickly. It should never block, wait on a mutex, call `printf` or `malloc`, or run long computations.
:::

:::drill output
Signals model a pending bit here. The signal is raised three times while blocked. What does this print?
```c run=ec-c03-d-coalesce
#define _POSIX_C_SOURCE 200809L
#include <signal.h>
#include <stdio.h>
static volatile sig_atomic_t runs;
static void isr(int sig) { (void)sig; runs++; }
int main(void) {
    struct sigaction sa = {.sa_handler = isr};
    sigaction(SIGUSR1, &sa, NULL);
    sigset_t block, old;
    sigemptyset(&block);
    sigaddset(&block, SIGUSR1);
    sigprocmask(SIG_BLOCK, &block, &old);
    for (int i = 0; i < 3; i++) raise(SIGUSR1);
    printf("while blocked: %d\n", (int)runs);
    sigprocmask(SIG_SETMASK, &old, NULL);
    printf("after unblock: %d\n", (int)runs);
    return 0;
}
```
---
**Answer.** 0, then 1. Ordinary signals do not queue, so three events collapse into one handler call. An interrupt pending bit behaves the same way.
:::

:::drill tricky
A `uint32_t ticks` is incremented in a timer ISR and read in main. It is `volatile`. Is that always safe?
---
**Answer.** On a 32-bit core, reading it is safe, as an aligned word is one access. On an 8-bit or 16-bit core it takes several loads and can tear, so main must disable the interrupt around the read or re-read until two values match. Any read-modify-write from main needs protection on all cores.
:::

:::drill bug
Why can this hang for a long time even though the event occurred?
```c
if (!data_ready) {
    wait_for_interrupt();   // sleep until any interrupt
}
```
---
**Answer.** If the interrupt fires after the check and before the sleep, the wake-up is already gone, and the CPU sleeps until some other interrupt. Fix: disable interrupts, check the flag, then sleep, then re-enable. On a Cortex-M, `WFI` still wakes on a pending interrupt when `PRIMASK` masks it, and the ISR runs once interrupts are re-enabled.
:::

:::drill bug
This UART handler locks up the system once data arrives. The flag is level-triggered and is cleared by reading `DR`. Find the bug.
```c
void UART_IRQHandler(void) {
    if (UART0->SR & RX_READY) {
        rx_flag = 1;      // main loop will read DR later
    }
}
```
---
**Answer.** The source is never cleared, because `DR` is not read in the ISR. The handler re-enters as soon as it returns and main never runs. Fix: read `DR` in the ISR and put the byte in a ring buffer.
:::

:::drill bug
Find the bug in this "protected" helper, which is sometimes called from inside another critical section.
```c
void log_event(int e) {
    disable_irq();
    events[n++] = e;
    enable_irq();
}
```
---
**Answer.** `enable_irq()` turns interrupts on even if the caller had them off, which breaks the caller's critical section. Save the mask on entry and restore it on exit.
:::

:::drill bug
In a wrapped-index ring buffer of size `N`, this is the "full" test. What is wrong?
```c
if (head + 1 == tail) return FULL;
```
---
**Answer.** It misses the wrap: with `head == N - 1` and `tail == 0`, the buffer is full, but `head + 1` is `N`. Use `(head + 1) % N == tail`, which deliberately leaves one slot empty so that `head == tail` can mean empty.
:::

:::drill tricky
Why is it wrong to kick the watchdog from a periodic timer ISR?
---
**Answer.** The ISR keeps running even when the main loop or a task has hung, so the watchdog never fires. Kick it from code that proves all critical work is progressing, for example a supervisor that needs a check-in from each task.
:::

:::drill concept
Explain latency versus jitter, and name the largest contributor you control.
---
**Answer.** Latency is the delay from event to handler. Jitter is its variation. The largest contributor you control is usually the longest critical section, since all of that time can delay the handler.
:::

:::drill concept
Mutex or binary semaphore? (a) A UART driver's shared transmit buffer between two tasks. (b) An ISR telling a task that a DMA transfer has finished.
---
**Answer.** (a) Mutex, since this is mutual exclusion with an owner, and it can use priority inheritance. (b) Binary semaphore, since this is signalling across contexts, and an ISR cannot own or wait on a mutex.
:::

:::drill concept
Define priority inversion and say how priority inheritance fixes it. What does it not fix?
---
**Answer.** A high-priority task is delayed by lower-priority work, unboundedly if medium-priority tasks preempt the lock holder. Inheritance raises the holder's priority to that of the waiter until it releases the lock, so medium tasks cannot get in the way. It does not fix deadlock, and the time inside the critical section still counts as blocking.
:::

:::drill tricky
Two tasks each take mutex A and mutex B, in opposite orders. What can happen, and what are two fixes?
---
**Answer.** Deadlock: each holds one lock and waits forever for the other. Fix by taking locks in one global order everywhere, or by using a timeout and backing off, or by merging them into one lock.
:::

:::drill output
Tasks are `(C, T)` and priorities are rate-monotonic. Is this set schedulable? Work out `U` and the response of the slow task, then check.
```python run=ec-c03-d-rms
import math
tasks = [(1, 2), (2, 5)]
print("U =", sum(c / t for c, t in tasks))
r = c = tasks[1][0]
while True:
    nxt = c + math.ceil(r / tasks[0][1]) * tasks[0][0]
    print("R ->", nxt)
    if nxt == r:
        break
    r = nxt
```
---
**Answer.** `U` is 0.9, above the two-task bound of 0.828, so the simple test says nothing. The response iteration settles at 4, which is within the period of 5, so it is schedulable.
:::

:::drill tricky
A task set has `U = 1.0` and harmonic periods (each period divides the next). Can rate-monotonic schedule it?
---
**Answer.** Yes. The Liu and Layland bound is sufficient only, and with harmonic periods fixed priorities can reach full utilisation under the classic assumptions.
**Why.** Earliest-deadline-first can reach 100 percent for any periods under those assumptions, but it needs dynamic priorities.
:::

:::drill concept
What does a context switch save, and why is it put at the lowest exception priority on Cortex-M?
---
**Answer.** It saves the registers the hardware did not stack (`r4`–`r11`, and FP registers if used), plus the task's stack pointer. It uses `PendSV` at the lowest priority so that it runs after all ISRs finish and never delays one.
:::

:::drill tricky
You give each of ten tasks a 1 KB stack and run out of RAM. Name two ways to reduce this without removing features.
---
**Answer.** Measure the actual high-water marks and trim the oversized stacks. Merge related work into fewer tasks, or use event-driven state machines. Keep large buffers out of stacks. Each task's stack must also leave room for what an interrupt pushes on it.
:::

## Write the code {#ch03-coding .cd}

:::drill code rating=1300
Write a lock-free single-producer, single-consumer ring buffer using C11 atomics, and test it with two threads standing in for an ISR and a main loop.
---
The producer stores the data and then publishes `head` with release order. The consumer loads `head` with acquire order, so it sees the data. Each side reads its own index relaxed, as it is the only writer.

```c run=ec-c03-c-spsc timeout=60
#include <pthread.h>
#include <stdatomic.h>
#include <stdint.h>
#include <stdio.h>
#define SIZE 256u
#define N 100000u
static uint32_t buf[SIZE];
static atomic_uint head, tail;
static int put(uint32_t v) {
    unsigned h = atomic_load_explicit(&head, memory_order_relaxed);
    if (h - atomic_load_explicit(&tail, memory_order_acquire) == SIZE) return 0;
    buf[h & (SIZE - 1)] = v;
    atomic_store_explicit(&head, h + 1, memory_order_release);
    return 1;
}
static int get(uint32_t *v) {
    unsigned t = atomic_load_explicit(&tail, memory_order_relaxed);
    if (atomic_load_explicit(&head, memory_order_acquire) == t) return 0;
    *v = buf[t & (SIZE - 1)];
    atomic_store_explicit(&tail, t + 1, memory_order_release);
    return 1;
}
static void *producer(void *arg) {
    (void)arg;
    for (uint32_t i = 1; i <= N; i++) while (!put(i)) { }
    return NULL;
}
int main(void) {
    pthread_t th;
    pthread_create(&th, NULL, producer, NULL);
    uint64_t sum = 0;
    uint32_t v, last = 0, in_order = 1;
    for (uint32_t i = 0; i < N; i++) {
        while (!get(&v)) { }
        if (v != last + 1) in_order = 0;
        last = v;
        sum += v;
    }
    pthread_join(th, NULL);
    printf("sum=%llu in_order=%u\n", (unsigned long long)sum, (unsigned)in_order);
    return 0;
}
```

The sum and order are the same on every run even though the scheduling is not. The expected sum is N(N+1)/2.
:::

:::drill code rating=1100
Write a watchdog supervisor. Each task sets a bit when it reaches its check-in point. The supervisor kicks only when all bits are set, and then clears them.
---
```c run=ec-c03-c-wdt
#include <stdio.h>
#include <stdint.h>
#define ALL_TASKS 0x07u
static volatile uint32_t checkins;
static int kicks, ticks_since_kick;
static void task_checkin(int id) { checkins |= 1u << id; }     /* needs protection if tasks preempt */
static void supervisor(void) {
    ticks_since_kick++;
    if ((checkins & ALL_TASKS) == ALL_TASKS) {
        checkins = 0;
        kicks++;
        ticks_since_kick = 0;
    }
}
int main(void) {
    for (int round = 0; round < 3; round++) {
        task_checkin(0); task_checkin(1); task_checkin(2);
        supervisor();
    }
    printf("healthy: kicks=%d\n", kicks);
    for (int round = 0; round < 3; round++) {    /* task 1 has hung */
        task_checkin(0); task_checkin(2);
        supervisor();
    }
    printf("hung: kicks=%d, %d ticks since the last kick\n", kicks, ticks_since_kick);
    return 0;
}
```

One stuck task stops the kicks, and the hardware then resets the system. A real design logs which bit was missing, so that the cause can be read after reset.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- Cortex-M entry: the hardware stacks `r0`–`r3`, `r12`, `lr`, `pc`, `xPSR`, loads the vector and puts `EXC_RETURN` in `lr`. An ISR can be plain C.
- A lower NVIC number means higher priority. A higher priority preempts, and equal priorities wait.
- ISR: short, clear the source, no blocking, no `printf` or `malloc`.
- `volatile` stops compiler caching only. `count++` shared with an ISR still needs a critical section or an atomic.
- Save and restore the interrupt mask, and never blindly re-enable. Keep the section short, as it sets worst-case latency.
- A pending interrupt holds one event. Fast repeats merge.
- Ring buffer: one writer per index. Data first, index second. Free-running indices with a power-of-two size, or wrapped indices with one slot empty.
- `check flag; WFI` races: disable interrupts around the check and the sleep.
- Watchdog: kick only after all tasks check in, never from a timer ISR. A window watchdog also catches kicks that come too early.
- RTOS rule: the highest-priority ready task runs. Tasks need their own stacks.
- Mutex: ownership, inheritance, not from ISRs. Semaphore: signalling or counting, and an ISR may give it.
- Priority inversion needs three tasks to become unbounded. Fix with inheritance or a ceiling.
- Rate-monotonic: shorter period gets higher priority. Sufficient test: `U ≤ n(2^(1/n) − 1)`, tending to 0.693. Exact test: `R = C + Σ ceil(R/Tj)·Cj`, with `R ≤ T`.
