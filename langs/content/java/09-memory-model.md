---
title: The Java Memory Model
part: Part D · Concurrency
lede: Without synchronisation, one thread may never see another thread's write, or may see writes in a different order than they were made, because compilers and CPUs reorder memory operations. The Java Memory Model (JLS chapter 17) defines exactly which writes a read is allowed to see, through the happens-before relation. This chapter shows visibility and reordering failures happening on a real machine, then covers `volatile`, the happens-before rules, safe publication, `final` fields, double-checked locking and atomicity.
desc: Visibility, reordering, happens-before, volatile, safe publication, final fields, DCL, atomicity
hours: 4
prereqs: Chapters 1 and 6
---

## Two things that go wrong {#ch09-problems .th}

### Visibility

Compilers keep values in registers, and the JIT may hoist a read out of a loop if nothing in the loop could change it from the *current thread's* point of view. A thread spinning on an ordinary field may therefore never see another thread's update:

```java run=c09-visibility nondet
public class Visibility {
    static boolean stop;                 // plain field
    static volatile boolean vstop;       // volatile field

    public static void main(String[] args) throws Exception {
        Thread plain = new Thread(() -> { long n = 0; while (!stop) n++; });
        plain.setDaemon(true);
        plain.start();
        Thread.sleep(200);                // let the loop get JIT-compiled
        stop = true;
        plain.join(1000);
        System.out.println("plain flag: worker still running after 1 s = " + plain.isAlive());

        Thread vol = new Thread(() -> { long n = 0; while (!vstop) n++; });
        vol.setDaemon(true);
        vol.start();
        Thread.sleep(200);
        vstop = true;
        vol.join(1000);
        System.out.println("volatile flag: worker still running after 1 s = " + vol.isAlive());
    }
}
```

Once C2 compiles the first loop, it reads `stop` once and loops forever on a register copy: the program would hang if the thread were not a daemon. With `volatile`, every iteration reads memory and the worker stops at once. The JMM allows the first behaviour, so it is not a JIT bug.

### Reordering

Each thread's memory operations may become visible to other threads in a different order than the program wrote them, both because the JIT reorders independent instructions and because CPUs buffer stores. The classic store-buffer test runs two threads, each writing one variable and then reading the other:

```java run=c09-reordering nondet
import java.util.concurrent.CountDownLatch;

public class Reordering {
    public static void main(String[] args) throws Exception {
        int n = 2_000_000;
        int total = 0;
        for (int round = 0; round < 5; round++) {
            int[] x = new int[n], y = new int[n], r1 = new int[n], r2 = new int[n];
            CountDownLatch go = new CountDownLatch(1);
            Thread t1 = new Thread(() -> { await(go); for (int i = 0; i < n; i++) { x[i] = 1; r1[i] = y[i]; } });
            Thread t2 = new Thread(() -> { await(go); for (int i = 0; i < n; i++) { y[i] = 1; r2[i] = x[i]; } });
            t1.start(); t2.start(); go.countDown(); t1.join(); t2.join();
            for (int i = 0; i < n; i++) if (r1[i] == 0 && r2[i] == 0) total++;
        }
        System.out.println("outcomes with r1 == 0 and r2 == 0: " + total);
    }

    static void await(CountDownLatch l) {
        try { l.await(); } catch (InterruptedException e) { throw new RuntimeException(e); }
    }
}
```

If each thread's write happened before its read, at least one read would see a 1. Yet `r1 == r2 == 0` occurs: each CPU's store sat in its store buffer while its load went ahead to memory. How often depends on timing; some runs show none, which is exactly why such bugs escape testing. The tool for this kind of test is OpenJDK's **jcstress**.

## Happens-before {#ch09-hb .th}

The JMM does not describe caches or fences. It defines a partial order, **happens-before** (hb), and one rule: if a write *w* happens-before a read *r* of the same variable (and no other write intervenes), *r* sees *w*. If two accesses to the same variable, at least one a write, are not ordered by hb, the program has a **data race**, and a read may see either value.

Happens-before edges come from:

1. **Program order**: each action in a thread hb every later action in that thread.
2. **Monitor lock**: an unlock of a monitor hb every later lock of the same monitor.
3. **volatile**: a write to a volatile variable hb every later read of that variable.
4. **Thread start**: `t.start()` hb every action in `t`.
5. **Thread termination**: every action in `t` hb another thread's successful return from `t.join()` (or `isAlive()` returning false).
6. **Interruption**: `t.interrupt()` hb `t` detecting the interrupt.
7. **Finalizer / constructors** and **static initialisation** (a class's initialisation hb any use of it, Chapter 2).
8. **Transitivity**: if a hb b and b hb c, then a hb c.

Library classes add edges on top: putting into a `ConcurrentHashMap` or `BlockingQueue` hb the get or take that retrieves the element, `Future.get()` sees everything the task did, and so on (documented under "Memory Consistency Properties" in `java.util.concurrent`).

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 200" role="img" aria-label="Thread A writes data then writes a volatile flag; thread B reads the flag then reads data; the volatile write-read edge plus program order gives a happens-before chain">
  <text x="120" y="24" text-anchor="middle" class="t-bold">thread A</text><text x="560" y="24" text-anchor="middle" class="t-bold">thread B</text>
  <rect x="40" y="40" width="160" height="34" rx="6" class="d-acc"/><text x="120" y="62" text-anchor="middle" class="t-mono">data = 42</text>
  <rect x="40" y="110" width="160" height="34" rx="6" class="d-key"/><text x="120" y="132" text-anchor="middle" class="t-mono">ready = true (volatile)</text>
  <rect x="480" y="110" width="160" height="34" rx="6" class="d-key"/><text x="560" y="132" text-anchor="middle" class="t-mono">if (ready)</text>
  <rect x="480" y="170" width="160" height="26" rx="6" class="d-acc"/><text x="560" y="188" text-anchor="middle" class="t-mono">print(data) → 42</text>
  <path d="M120 74 L120 110" class="d-line"/><text x="128" y="96" class="t-small">program order</text>
  <path d="M200 127 L 480 127" class="d-line-key"/><text x="340" y="118" text-anchor="middle" class="t-small t-key">volatile write → read</text>
  <path d="M560 144 L560 170" class="d-line"/>
</svg></div><figcaption><b>Publishing through a volatile.</b> By transitivity, <code>data = 42</code> happens-before the read of <code>data</code>, so thread B must see 42 once it sees <code>ready</code>.</figcaption></figure>

## volatile {#ch09-volatile .th}

A `volatile` field gives two guarantees:

- **Visibility and ordering**: a volatile write hb subsequent volatile reads of the same field, so everything the writer did *before* the write is visible to a reader *after* it reads the new value. That is enough to publish data through a flag, as in the figure.
- **Atomic reads and writes of the field itself**, including `long` and `double` (plain 64-bit fields may be "torn" into two 32-bit halves on some 32-bit JVMs; 64-bit HotSpot does not tear them in practice).

It does **not** make compound operations atomic. `volatileCounter++` is a read, an add and a write, and two threads can interleave them:

```java run=c09-volatile-increment nondet
import java.util.concurrent.atomic.AtomicInteger;

public class VolatileIncrement {
    static volatile int volatileCount;
    static final AtomicInteger atomicCount = new AtomicInteger();

    public static void main(String[] args) throws Exception {
        Thread[] ts = new Thread[4];
        for (int i = 0; i < ts.length; i++) {
            ts[i] = new Thread(() -> {
                for (int j = 0; j < 100_000; j++) { volatileCount++; atomicCount.incrementAndGet(); }
            });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("volatile int: " + volatileCount + ", AtomicInteger: " + atomicCount.get() + " (expected 400000)");
    }
}
```

On x86, a volatile read is as cheap as a plain one, and a volatile write costs a full fence (a locked instruction), typically a few tens of cycles. On ARM, both need extra barriers.

## Safe publication and final fields {#ch09-publication .th}

Creating an object and storing its reference in a shared field without synchronisation is a race: another thread can see the reference **before** it sees the constructor's writes to the object's fields, because those writes and the reference store can be reordered. An object is **safely published** if its reference is made visible through a happens-before edge:

- storing it in a `volatile` field or an `AtomicReference`;
- storing it in a field guarded by a lock that the reader also takes;
- passing it through a concurrent collection, a `BlockingQueue` or a `Future`;
- initialising it in a static initialiser.

**`final` fields** have an extra guarantee (JLS §17.5): when a constructor finishes, its writes to `final` fields are "frozen", and any thread that obtains a reference to the object **after** construction sees the final fields' correct values, even if the reference itself was published through a race, as long as `this` did not escape during construction. This is what makes immutable objects (`String`, records, `List.of`) safe to share without synchronisation.

```java run=c09-final
public class FinalFields {
    static final class Point {
        final int x, y;                // frozen at the end of the constructor
        Point(int x, int y) { this.x = x; this.y = y; }
    }
    static final class MutablePoint {
        int x, y;                      // no guarantee when published through a race
        MutablePoint(int x, int y) { this.x = x; this.y = y; }
    }

    static Point shared;              // published without synchronisation

    public static void main(String[] args) throws Exception {
        Thread writer = new Thread(() -> shared = new Point(3, 4));
        Thread reader = new Thread(() -> {
            Point p;
            while ((p = shared) == null) Thread.onSpinWait();
            System.out.println("reader sees x=" + p.x + " y=" + p.y + " (guaranteed for final fields)");
        });
        reader.start();
        writer.start();
        writer.join();
        reader.join();
    }
}
```

The reader loop still relies on eventually seeing `shared` become non-null, which the JMM does not strictly guarantee for a plain field (it does in practice here, because `Thread.onSpinWait` and the loop's structure keep the read in memory). The point of the example is the second guarantee: once the reader sees the reference, the `final` fields are complete. For `MutablePoint` the reader could in principle see `x == 0`.

## Double-checked locking {#ch09-dcl .th}

The pattern below tries to avoid locking on every call to a lazy getter:

```java
private static Helper helper;            // BROKEN without volatile
static Helper get() {
    if (helper == null) {                // first check, no lock
        synchronized (Holder.class) {
            if (helper == null) helper = new Helper();   // second check
        }
    }
    return helper;
}
```

Without `volatile`, the store to `helper` can become visible before the stores done by `Helper`'s constructor, so a thread taking the fast path (no lock, so no happens-before edge) may receive a partly constructed object. Declaring the field **`volatile`** fixes it, because the volatile write now happens-before the unlocked read. Since a class's initialisation is itself thread-safe, the holder idiom (Chapter 2) is usually simpler still.

```java run=c09-dcl
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Dcl {
    static final AtomicInteger constructed = new AtomicInteger();

    static final class Expensive {
        final int[] table = new int[1024];
        Expensive() { constructed.incrementAndGet(); for (int i = 0; i < table.length; i++) table[i] = i; }
    }

    private static volatile Expensive instance;

    static Expensive get() {
        Expensive local = instance;              // one volatile read on the fast path
        if (local == null) {
            synchronized (Dcl.class) {
                local = instance;
                if (local == null) instance = local = new Expensive();
            }
        }
        return local;
    }

    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(8);
        CountDownLatch start = new CountDownLatch(1);
        var futures = new java.util.ArrayList<Future<Integer>>();
        for (int i = 0; i < 16; i++) futures.add(pool.submit(() -> { start.await(); return get().table[1023]; }));
        start.countDown();                       // release all 16 callers at once
        int sum = 0;
        for (var f : futures) sum += f.get();
        pool.shutdown();
        System.out.println("constructed " + constructed.get() + " time(s), every reader saw a full table: " + (sum == 16 * 1023));
    }
}
```

The local variable avoids reading the volatile field twice on the fast path, a small optimisation used in the JDK's own code.

:::key
Every shared mutable variable needs one of: a lock, `volatile`, an atomic class, a concurrent collection, or confinement to one thread. "It's just a boolean" and "it's only read" are the two most common excuses behind real visibility bugs.
:::

## Concept and tricky questions {#ch09-concept .dr}

:::drill concept
What is a data race in the Java Memory Model?
---
**Answer.** Two accesses to the same variable from different threads, at least one a write, that are not ordered by happens-before. In a racy program a read may see any write that is not ruled out by happens-before, including stale values.

**Why.** Correctly synchronised (race-free) programs get sequential consistency: they behave as if all actions happened in one interleaved order.
:::

:::drill concept
List four sources of happens-before edges.
---
**Answer.** Program order within a thread; unlocking a monitor before a later lock of it; a volatile write before a later read of the same variable; `Thread.start()` before the started thread's actions; a thread's actions before `join()` returns; static initialisation before use; plus transitivity. Concurrent library classes add their own (queue put → take, `Future` completion → `get`).

**Why.** Reasoning about correctness means finding a chain of these edges from each write to each read that must see it.
:::

:::drill tricky
Why can a thread spinning on `while (!stop) {}` with a plain `boolean stop` run forever after another thread sets `stop = true`?
---
**Answer.** Nothing orders the write and the reads, so the JIT may legally hoist the read out of the loop and spin on a register copy. Make `stop` `volatile` (or use `AtomicBoolean`, or interrupt the thread).

**Why.** In the interpreter the loop usually stops, which is why this bug often appears only after warm-up.
:::

:::drill concept
What does `volatile` guarantee, and what does it not?
---
**Answer.** It guarantees visibility and ordering (a write hb later reads; writes before the volatile write are visible after the read) and atomic reads/writes of the field itself, including `long`/`double`. It does not make read-modify-write operations such as `count++` or check-then-act atomic.

**Why.** For counters use `AtomicInteger`/`LongAdder`; for compound invariants use a lock.
:::

:::drill tricky
Why is double-checked locking broken without `volatile`?
---
**Answer.** A thread that sees a non-null `instance` without taking the lock has no happens-before edge with the constructing thread, so the constructor's field writes may not be visible yet: it can see a partly constructed object. `volatile` adds the edge from the publishing write to the unlocked read.

**Why.** It was famously broken under the pre-Java 5 memory model too; JSR-133 (Java 5) made the `volatile` fix work.
:::

:::drill concept
What special guarantee do `final` fields have?
---
**Answer.** After a constructor completes, any thread that sees a reference to the object (obtained after construction, with no escape of `this` during construction) sees the values the constructor assigned to its `final` fields, and objects reachable through them as of that time, even if the reference was published through a data race.

**Why.** It makes immutable objects thread-safe by construction. Leaking `this` from the constructor (registering a listener, starting a thread) voids it.
:::

:::drill tricky
Are reads and writes of `long` fields atomic?
---
**Answer.** For `volatile long`/`double` yes, always. For plain ones the JLS allows splitting into two 32-bit accesses ("word tearing"); 64-bit HotSpot JVMs perform them atomically in practice, but portable code must not rely on it.

**Why.** The rule exists for 32-bit platforms where a 64-bit store took two instructions.
:::

## Predict the output and find the bug {#ch09-reading .dr}

:::drill output
Is this program guaranteed to print `42`? What does it print?

```java run=c09-d-join
public class JoinVisibility {
    static int result;                      // plain field

    public static void main(String[] args) throws Exception {
        Thread worker = new Thread(() -> result = 42);
        worker.start();
        worker.join();
        System.out.println(result);
    }
}
```
---
**Answer.** Yes, it prints `42`, guaranteed. Every action of `worker` happens-before `join()` returning in `main`, so the plain write is visible.

**Why.** Synchronisation does not always mean `volatile` or locks; thread start/join, executors and concurrent collections create happens-before edges too.
:::

:::drill output
What does this print?

```java run=c09-d-sync-visibility
public class SyncVisibility {
    private int value;
    private final Object lock = new Object();

    void set(int v) { synchronized (lock) { value = v; } }
    int get() { synchronized (lock) { return value; } }

    public static void main(String[] args) throws Exception {
        SyncVisibility s = new SyncVisibility();
        Thread t = new Thread(() -> s.set(7));
        t.start();
        while (s.get() != 7) Thread.onSpinWait();
        System.out.println("saw " + s.get());
    }
}
```
---
**Answer.** `saw 7`, and the loop is guaranteed to terminate: each `get` locks the same monitor that `set` unlocked, and unlock hb a later lock, so the reader eventually sees the write.

**Why.** Locks give visibility as well as mutual exclusion, but only when **both** sides use the same lock. A getter without `synchronized` would be a data race.
:::

:::drill output
What does this print?

```java run=c09-d-atomic
import java.util.concurrent.atomic.*;

public class AtomicOps {
    public static void main(String[] args) {
        AtomicInteger n = new AtomicInteger(5);
        System.out.println(n.getAndIncrement() + " " + n.incrementAndGet() + " " + n.compareAndSet(7, 10) + " " + n.compareAndSet(7, 20) + " " + n.get());
        System.out.println(n.updateAndGet(x -> x * 2) + " " + n.accumulateAndGet(3, Math::max));
    }
}
```
---
**Answer.** `5 7 true false 10`, then `20 20`. `getAndIncrement` returns the old value, `incrementAndGet` the new one; the first CAS succeeds (7 → 10), the second fails because the value is no longer 7.

**Why.** `updateAndGet` retries its lambda in a CAS loop, so the function must be side-effect free: it can run more than once under contention.
:::

:::drill bug
A config object is replaced periodically by a background thread, and readers occasionally see a config whose `timeoutMs` is 0. Find the bug.

```java run=c09-d-bug-publish
import java.util.*;

public class ConfigReload {
    static final class Config {
        final int timeoutMs;
        final Map<String, String> settings;
        Config(int timeoutMs, Map<String, String> settings) {
            this.timeoutMs = timeoutMs;
            this.settings = Map.copyOf(settings);
        }
    }

    private static volatile Config current = new Config(1000, Map.of("mode", "a"));

    static void reload(int timeout) { current = new Config(timeout, Map.of("mode", "b")); }
    static int timeout() { return current.timeoutMs; }

    public static void main(String[] args) throws Exception {
        Thread t = new Thread(() -> reload(2500));
        t.start();
        t.join();
        System.out.println(timeout() + " " + current.settings);
    }
}
```
---
**Answer.** The original `Config` had non-final fields set after construction (`c = new Config(); c.timeoutMs = …; current = c;`) and `current` was a plain field, so readers could see the reference before the field writes. Making the class immutable (`final` fields, copied map) and the reference `volatile`, as above, gives safe publication twice over.

**Why.** "Immutable object + volatile reference" is the standard pattern for configuration that is swapped at run time.
:::

:::drill bug
Two threads count events into a shared `int` and the total is wrong. The developer made it `volatile`, and it is still wrong. Fix it.

```java run=c09-d-bug-counter
import java.util.concurrent.atomic.LongAdder;

public class EventCounter {
    static final LongAdder events = new LongAdder();

    public static void main(String[] args) throws Exception {
        Runnable work = () -> { for (int i = 0; i < 500_000; i++) events.increment(); };
        Thread a = new Thread(work), b = new Thread(work);
        a.start(); b.start(); a.join(); b.join();
        System.out.println(events.sum());
    }
}
```
---
**Answer.** `volatile int count; count++` is still a read-modify-write that loses updates when the threads interleave. Use an atomic: `AtomicLong.incrementAndGet()`, or `LongAdder`, which spreads contended increments over per-thread cells and sums them on read, scaling better for counters that are written much more than read.

**Why.** `volatile` fixes visibility, not atomicity.
:::

## Write the code {#ch09-coding .cd}

:::drill code rating=1400
Write a `SpinLatch` (a one-shot gate) with `open()` and `await()` using only a `volatile boolean`, and show that data written before `open()` is visible after `await()` returns, in eight reader threads.
---
```java run=c09-c-latch
import java.util.*;

public class SpinLatchDemo {
    static final class SpinLatch {
        private volatile boolean open;
        void open() { open = true; }
        void await() { while (!open) Thread.onSpinWait(); }
    }

    static int[] payload;                  // plain field, published through the latch

    public static void main(String[] args) throws Exception {
        SpinLatch latch = new SpinLatch();
        List<Thread> readers = new ArrayList<>();
        int[] sums = new int[8];
        for (int i = 0; i < 8; i++) {
            int id = i;
            Thread t = new Thread(() -> { latch.await(); sums[id] = Arrays.stream(payload).sum(); });
            readers.add(t);
            t.start();
        }
        payload = new int[] {1, 2, 3, 4};
        latch.open();                        // volatile write publishes payload
        for (Thread t : readers) t.join();
        System.out.println(Arrays.toString(sums));
    }
}
```

Each reader's volatile read that sees `true` happens-after the volatile write, which happens-after `payload = …` in program order. `Thread.onSpinWait` hints the CPU (a `PAUSE` instruction on x86) to spin efficiently. A real program would use `CountDownLatch`, which parks waiting threads instead of spinning.
:::

:::drill code rating=1500
Implement a lazily initialised, thread-safe `Lazy<T>` (`get()` computes the value once from a `Supplier`) using double-checked locking with a `volatile` field, and release the supplier afterwards so it can be garbage collected. Prove the supplier runs once with 16 concurrent callers.
---
```java run=c09-c-lazy
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

public class LazyDemo {
    static final class Lazy<T> implements Supplier<T> {
        private volatile Supplier<? extends T> supplier;
        private T value;                                 // published by the volatile write of supplier = null

        Lazy(Supplier<? extends T> supplier) { this.supplier = supplier; }

        @Override public T get() {
            if (supplier != null) {
                synchronized (this) {
                    Supplier<? extends T> s = supplier;
                    if (s != null) {
                        value = s.get();
                        supplier = null;                 // volatile write after value is set
                    }
                }
            }
            return value;
        }
    }

    public static void main(String[] args) throws Exception {
        AtomicInteger calls = new AtomicInteger();
        Lazy<String> lazy = new Lazy<>(() -> { calls.incrementAndGet(); return "computed"; });
        ExecutorService pool = Executors.newFixedThreadPool(16);
        CountDownLatch go = new CountDownLatch(1);
        var futures = new java.util.ArrayList<Future<String>>();
        for (int i = 0; i < 16; i++) futures.add(pool.submit(() -> { go.await(); return lazy.get(); }));
        go.countDown();
        boolean allSame = true;
        for (var f : futures) allSame &= f.get().equals("computed");
        pool.shutdown();
        System.out.println("supplier ran " + calls.get() + " time, all callers got the value: " + allSame);
    }
}
```

The plain `value` field is safe because it is written **before** the volatile write `supplier = null`, and a reader that sees `supplier == null` (a volatile read) therefore also sees `value`. Readers that see a non-null supplier take the lock, which also gives them a happens-before edge.
:::

:::drill code rating=1300
Demonstrate that `synchronized` gives both mutual exclusion and visibility: write a `Counter` with `synchronized` `increment()` and `get()`, run 4 threads × 250,000 increments, and compare with an unsynchronised version.
---
```java run=c09-c-sync nondet
public class SyncCounter {
    static final class Safe { private int n; synchronized void inc() { n++; } synchronized int get() { return n; } }
    static final class Unsafe { private int n; void inc() { n++; } int get() { return n; } }

    public static void main(String[] args) throws Exception {
        Safe safe = new Safe();
        Unsafe unsafe = new Unsafe();
        Thread[] ts = new Thread[4];
        for (int i = 0; i < ts.length; i++) {
            ts[i] = new Thread(() -> { for (int j = 0; j < 250_000; j++) { safe.inc(); unsafe.inc(); } });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("synchronized: " + safe.get() + ", unsynchronized: " + unsafe.get() + " (expected 1000000)");
    }
}
```

The unsynchronised count loses updates when increments interleave, and the exact number changes from run to run. The synchronised one is always exactly one million.
:::

## Cheat sheet {#ch09-cheatsheet .th}

- Without synchronisation: no visibility guarantee (reads can be hoisted) and no ordering guarantee (compiler and CPU reorder, store buffers).
- Data race = conflicting accesses not ordered by happens-before. Race-free programs behave sequentially consistently.
- Happens-before: program order, unlock → lock (same monitor), volatile write → read (same field), `start()` → thread, thread → `join()`, static init → use, `j.u.c` hand-offs, transitivity.
- `volatile`: visibility + ordering + atomic single read/write (incl. long/double); **not** atomic `++` or check-then-act.
- Atomics (`AtomicInteger`, `LongAdder`, `compareAndSet`) for counters and lock-free updates; update functions must be pure (they can retry).
- Safe publication: volatile/atomic field, lock, concurrent collection/queue/`Future`, static initialiser.
- `final` fields are frozen at the end of the constructor and visible to any thread that later sees the reference (if `this` did not escape).
- Double-checked locking needs a `volatile` field; prefer the holder idiom or `enum`.
- Test concurrency with jcstress; "it passed 1,000 times" proves little.
