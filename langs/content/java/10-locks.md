---
title: Locks, monitors and atomics
part: Part D · Concurrency
lede: Every Java object can be used as a lock, and HotSpot makes that cheap with a few bits in the object header that it upgrades to a full monitor only when threads actually contend. This chapter covers what `synchronized` compiles to, how HotSpot implements monitors, the rules of `wait` and `notify`, `ReentrantLock` and the AbstractQueuedSynchronizer framework behind most of `java.util.concurrent`, compare-and-swap and the atomic classes, and how to detect deadlocks.
desc: monitorenter/exit, lock states in the mark word, wait/notify, ReentrantLock, AQS, CAS, LongAdder, deadlock detection
hours: 4
prereqs: Chapters 3 and 9
---

## What synchronized compiles to {#ch10-bytecode .th}

A `synchronized` block becomes a `monitorenter` and one or more `monitorexit` instructions, plus an exception-table entry that releases the monitor if the block throws. A `synchronized` method has no such instructions: it carries the `ACC_SYNCHRONIZED` flag and the JVM locks the receiver (or the `Class` object, for a static method) around the call.

```java run=c10-bytecode cmd="javac -d . Sync.java && javap -c -v -p Sync | grep -E 'monitor|ACC_SYNCHRONIZED|any|void (block|method)'"
public class Sync {
    private final Object lock = new Object();
    private int count;

    void block() {
        synchronized (lock) {
            count++;
        }
    }

    synchronized void method() {
        count++;
    }
}
```

The second `monitorexit` and the `any` entry in the exception table are the compiler's guarantee that the monitor is released even when the block throws. Monitors are **re-entrant**: a thread that already owns one can enter it again, and the JVM counts the nesting.

## How HotSpot implements monitors {#ch10-states .th}

Allocating a full mutex for every object would be wasteful, since most objects are never locked and most locks are never contended. HotSpot stores lock state in the low bits of the object's **mark word** (Chapter 3) and escalates only when needed:

- **Unlocked**: the mark word holds the identity hash (if computed) and GC age.
- **Lightweight (thin) lock**: an uncontended lock is taken with a single compare-and-swap. In the classic implementation the mark word is copied to a "lock record" on the owner's stack and replaced with a pointer to it; the newer lightweight locking (`-XX:LockingMode=2`, introduced in JDK 21 and the default from JDK 23) keeps a small per-thread lock stack instead.
- **Inflated (heavyweight) lock**: on contention, on `wait()`, or in some cases when the identity hash is needed, the JVM allocates an `ObjectMonitor` with an owner, a recursion count, an entry queue and a wait set, and the mark word points to it. Contended threads first spin briefly (adaptive spinning), then park in the operating system.

**Biased locking**, which let one thread re-lock an object without even a CAS, was disabled by default in JDK 15 (JEP 374) and removed in JDK 18: on modern CPUs the CAS is cheap, and revoking biases required safepoints.

Timing these states with a simple loop is misleading, because the JIT also optimises locks themselves: it removes locks on objects that do not escape (**lock elision**, Chapter 6) and merges adjacent `synchronized` regions on the same object into one, even across loop iterations (**lock coarsening**). A loop of a million tiny `synchronized` blocks may execute as a few large ones, so a naive benchmark can show contended locking as faster than uncontended. JFR's `jdk.JavaMonitorEnter` events and `jcmd <pid> Thread.print` show real contention in a running service.

## wait and notify {#ch10-wait .th}

`wait()`, `notify()` and `notifyAll()` let threads wait for a condition protected by a monitor:

- They may only be called while **holding** the monitor, otherwise `IllegalMonitorStateException`.
- `wait()` atomically releases the monitor and suspends the thread in the monitor's **wait set**; when woken, it must re-acquire the monitor before returning.
- Wake-ups can be **spurious**, and another thread may change the state between the notification and the waiter re-acquiring the lock, so `wait` must always be called in a `while` loop that re-checks the condition.
- `notify()` wakes one arbitrary waiter; `notifyAll()` wakes all. With several kinds of waiters on one monitor (producers and consumers), `notify()` can wake the wrong kind and deadlock, so `notifyAll()` is the safe default.

```java run=c10-wait-notify
import java.util.*;

public class WaitNotify {
    static final class BoundedQueue<T> {
        private final Deque<T> items = new ArrayDeque<>();
        private final int capacity;
        BoundedQueue(int capacity) { this.capacity = capacity; }

        synchronized void put(T item) throws InterruptedException {
            while (items.size() == capacity) wait();
            items.addLast(item);
            notifyAll();
        }

        synchronized T take() throws InterruptedException {
            while (items.isEmpty()) wait();
            T item = items.removeFirst();
            notifyAll();
            return item;
        }
    }

    public static void main(String[] args) throws Exception {
        BoundedQueue<Integer> q = new BoundedQueue<>(2);
        List<Integer> got = Collections.synchronizedList(new ArrayList<>());
        Thread consumer = new Thread(() -> {
            try { for (int i = 0; i < 6; i++) got.add(q.take()); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        });
        consumer.start();
        for (int i = 0; i < 6; i++) q.put(i);
        consumer.join();
        System.out.println(got);
        try {
            new Object().wait();
        } catch (IllegalMonitorStateException e) {
            System.out.println("IllegalMonitorStateException: " + e.getMessage());
        }
    }
}
```

In new code, prefer `java.util.concurrent`: `BlockingQueue`, `CountDownLatch`, `Semaphore`, or `ReentrantLock` with separate `Condition`s for "not full" and "not empty".

## ReentrantLock and AQS {#ch10-reentrantlock .th}

`ReentrantLock` has the same semantics as `synchronized` (mutual exclusion, re-entrancy, happens-before from unlock to lock) and adds:

- `tryLock()` and `tryLock(timeout)`, which avoid blocking forever;
- `lockInterruptibly()`, which a waiting thread can abandon when interrupted;
- an optional **fair** mode (FIFO hand-off, lower throughput);
- several `Condition` objects per lock, instead of one wait set per monitor.

The price is discipline: you must `unlock()` in a `finally` block, every time.

```java run=c10-trylock
import java.util.concurrent.*;
import java.util.concurrent.locks.*;

public class TryLock {
    public static void main(String[] args) throws Exception {
        ReentrantLock lock = new ReentrantLock();
        CountDownLatch held = new CountDownLatch(1), release = new CountDownLatch(1);
        Thread holder = new Thread(() -> {
            lock.lock();
            try { held.countDown(); release.await(); } catch (InterruptedException ignored) {
            } finally { lock.unlock(); }
        });
        holder.start();
        held.await();
        long t0 = System.nanoTime();
        boolean got = lock.tryLock(100, TimeUnit.MILLISECONDS);
        System.out.println("tryLock while held: " + got + " after ~" + Math.round((System.nanoTime() - t0) / 1e8) * 100 + " ms, queued=" + lock.hasQueuedThreads());
        release.countDown();
        holder.join();
        lock.lock();
        lock.lock();                              // re-entrant
        System.out.println("hold count " + lock.getHoldCount() + ", locked=" + lock.isLocked());
        lock.unlock();
        lock.unlock();
    }
}
```

### AbstractQueuedSynchronizer

`ReentrantLock`, `Semaphore`, `CountDownLatch`, `ReentrantReadWriteLock` and `ThreadPoolExecutor.Worker` are all built on **AQS**, which provides:

- an `int state`, read and updated with CAS (for a lock: 0 = free, n = hold count; for a semaphore: permits; for a latch: the count);
- a FIFO **wait queue** of nodes for threads that failed to acquire, a variant of the CLH queue lock;
- **parking**: waiting threads block with `LockSupport.park()`, and a releasing thread `unpark()`s its successor.

A subclass only defines what "acquire" and "release" mean by overriding `tryAcquire`/`tryRelease` (exclusive) or `tryAcquireShared`/`tryReleaseShared` (shared). Here is a complete non-reentrant mutex:

```java run=c10-aqs
import java.util.concurrent.locks.AbstractQueuedSynchronizer;

public class AqsMutex {
    static final class Mutex {
        private static final class Sync extends AbstractQueuedSynchronizer {
            @Override protected boolean tryAcquire(int ignored) {
                if (compareAndSetState(0, 1)) { setExclusiveOwnerThread(Thread.currentThread()); return true; }
                return false;
            }
            @Override protected boolean tryRelease(int ignored) {
                if (getState() == 0) throw new IllegalMonitorStateException();
                setExclusiveOwnerThread(null);
                setState(0);                 // volatile write: publishes the critical section
                return true;
            }
            @Override protected boolean isHeldExclusively() { return getExclusiveOwnerThread() == Thread.currentThread(); }
        }
        private final Sync sync = new Sync();
        void lock() { sync.acquire(1); }
        void unlock() { sync.release(1); }
        int waiting() { return sync.getQueueLength(); }
    }

    static long counter;

    public static void main(String[] args) throws Exception {
        Mutex m = new Mutex();
        Thread[] ts = new Thread[4];
        for (int i = 0; i < ts.length; i++) {
            ts[i] = new Thread(() -> { for (int j = 0; j < 100_000; j++) { m.lock(); try { counter++; } finally { m.unlock(); } } });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("counter=" + counter + " waiting=" + m.waiting());
    }
}
```

Queueing, parking, timeouts, interruption and fairness all come from AQS; the subclass is ten lines.

## CAS and the atomic classes {#ch10-cas .th}

**Compare-and-swap** (`CMPXCHG` on x86, `LDXR`/`STXR` or `CAS` on ARM) atomically does: *if the value at this address is still `expected`, replace it with `new`, and tell me whether it worked*. Lock-free algorithms are loops that read, compute, and CAS, retrying when another thread got there first. `AtomicInteger`, `AtomicLong`, `AtomicReference` and `VarHandle` expose it:

```java run=c10-cas
import java.util.concurrent.atomic.*;

public class Cas {
    static final AtomicLong max = new AtomicLong(Long.MIN_VALUE);
    static final AtomicInteger retries = new AtomicInteger();

    static void offer(long value) {
        while (true) {
            long current = max.get();
            if (value <= current) return;
            if (max.compareAndSet(current, value)) return;
            retries.incrementAndGet();                    // someone else changed it; try again
        }
    }

    public static void main(String[] args) throws Exception {
        Thread[] ts = new Thread[4];
        for (int i = 0; i < ts.length; i++) {
            int seed = i;
            ts[i] = new Thread(() -> { for (long v = seed; v < 400_000; v += 4) offer(v); });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("max=" + max.get());
        AtomicStampedReference<String> ref = new AtomicStampedReference<>("A", 0);
        int[] stamp = new int[1];
        String seen = ref.get(stamp);
        ref.compareAndSet("A", "B", 0, 1);
        ref.compareAndSet("B", "A", 1, 2);                // A -> B -> A
        System.out.println("plain value looks unchanged: " + seen.equals(ref.getReference()) + ", stamped CAS succeeds: " + ref.compareAndSet(seen, "C", stamp[0], stamp[0] + 1));
    }
}
```

The last lines show the **ABA problem**: a CAS on the value alone cannot tell that it changed from A to B and back to A, which breaks lock-free stacks that reuse nodes. `AtomicStampedReference` adds a version stamp so the stale CAS fails.

### LongAdder

Under heavy contention, every thread CASing one `AtomicLong` fights over a single cache line. **`LongAdder`** keeps a base value plus an array of padded **cells**; a thread that loses a CAS on the base switches to a cell chosen by a per-thread hash, so threads mostly update different cache lines. `sum()` adds them up (and is not an atomic snapshot).

```java run=c10-longadder nondet
import java.util.concurrent.atomic.*;

public class Adder {
    static long time(Runnable inc, int threads, int each) throws InterruptedException {
        Thread[] ts = new Thread[threads];
        long t0 = System.nanoTime();
        for (int i = 0; i < threads; i++) { ts[i] = new Thread(() -> { for (int j = 0; j < each; j++) inc.run(); }); ts[i].start(); }
        for (Thread t : ts) t.join();
        return (System.nanoTime() - t0) / 1_000_000;
    }

    public static void main(String[] args) throws Exception {
        AtomicLong atomic = new AtomicLong();
        LongAdder adder = new LongAdder();
        time(atomic::incrementAndGet, 8, 200_000);
        time(adder::increment, 8, 200_000);
        long a = time(atomic::incrementAndGet, 8, 2_000_000);
        long b = time(adder::increment, 8, 2_000_000);
        System.out.printf("AtomicLong %d ms, LongAdder %d ms, totals %d %d%n", a, b, atomic.get(), adder.sum());
    }
}
```

## Deadlock {#ch10-deadlock .th}

A deadlock needs four conditions at once: mutual exclusion, hold-and-wait, no pre-emption, and a **cycle** of threads each waiting for a lock the next one holds. Breaking any one prevents it; the practical fix is a **global lock order**. The JVM can detect monitor and `ReentrantLock` deadlocks for you, which is what `jstack` reports as "Found one Java-level deadlock":

```java run=c10-deadlock
import java.lang.management.*;
import java.util.concurrent.CountDownLatch;

public class Deadlock {
    public static void main(String[] args) throws Exception {
        Object a = new Object(), b = new Object();
        CountDownLatch bothHoldOne = new CountDownLatch(2);
        Thread t1 = new Thread(() -> { synchronized (a) { bothHoldOne.countDown(); await(bothHoldOne); synchronized (b) { } } }, "worker-1");
        Thread t2 = new Thread(() -> { synchronized (b) { bothHoldOne.countDown(); await(bothHoldOne); synchronized (a) { } } }, "worker-2");
        t1.setDaemon(true);
        t2.setDaemon(true);
        t1.start();
        t2.start();
        ThreadMXBean mx = ManagementFactory.getThreadMXBean();
        long[] ids = null;
        for (int i = 0; i < 50 && ids == null; i++) { Thread.sleep(20); ids = mx.findDeadlockedThreads(); }
        for (ThreadInfo info : mx.getThreadInfo(ids)) System.out.println(info.getThreadName() + " is " + info.getThreadState() + ", waiting for a lock held by " + info.getLockOwnerName());
    }

    static void await(CountDownLatch l) {
        try { l.await(); } catch (InterruptedException e) { throw new RuntimeException(e); }
    }
}
```

Monitors cannot be broken out of: a thread blocked in `synchronized` ignores interrupts. `ReentrantLock.tryLock(timeout)` or `lockInterruptibly` are the tools for code that must be able to back off.

## Concept and tricky questions {#ch10-concept .dr}

:::drill concept
What does a `synchronized` block compile to, and how is the lock released if the block throws?
---
**Answer.** `monitorenter` on the lock object, the body, and `monitorexit`; `javac` also adds an exception-table entry covering the body that jumps to a handler which executes `monitorexit` and rethrows. A `synchronized` method instead has the `ACC_SYNCHRONIZED` flag.

**Why.** The JVM requires balanced monitor use on every path; the compiler generates the cleanup that `ReentrantLock` users must write by hand with `finally`.
:::

:::drill concept
Describe how HotSpot escalates a monitor from cheap to expensive.
---
**Answer.** Unlocked objects keep their hash and age in the mark word. An uncontended lock is taken with one CAS (a thin/lightweight lock, tracked via a stack lock record or, with the newer lightweight locking, a per-thread lock stack). Contention, `wait()` or certain identity-hash cases inflate it into an `ObjectMonitor` with entry and wait queues, where threads spin briefly and then park.

**Why.** Biased locking used to sit before the thin lock but was disabled in JDK 15 and removed in JDK 18.
:::

:::drill tricky
Why must `wait()` be called inside a `while` loop?
---
**Answer.** Because the thread may wake without the condition being true: wake-ups can be spurious, `notifyAll` wakes threads waiting for other conditions, and another thread may grab the monitor and change the state between the notify and this thread re-acquiring it. The loop re-checks the condition after every wake-up.

**Why.** The Javadoc of `Object.wait` states the loop idiom explicitly.
:::

:::drill concept
When would you choose `ReentrantLock` over `synchronized`?
---
**Answer.** When you need `tryLock` (with or without a timeout), interruptible lock acquisition, a fair lock, several condition queues on one lock, or lock/unlock in different scopes (hand-over-hand locking). Otherwise `synchronized` is simpler and cannot be left locked by a forgotten `unlock`.

**Why.** Performance is no longer a reason in either direction for uncontended locks.
:::

:::drill concept
What does AbstractQueuedSynchronizer provide, and what does a subclass implement?
---
**Answer.** An atomic `int` state, a FIFO queue of waiting threads, parking and unparking, timeouts, interruption and condition objects. A subclass implements `tryAcquire`/`tryRelease` (exclusive) and/or `tryAcquireShared`/`tryReleaseShared` (shared), defining what the state means.

**Why.** `ReentrantLock`, `Semaphore`, `CountDownLatch` and `ReentrantReadWriteLock` are thin AQS subclasses.
:::

:::drill tricky
What is the ABA problem?
---
**Answer.** A CAS succeeds if the value equals the expected one, even if it changed from A to B and back to A in between. In lock-free data structures that reuse nodes, the "same" A can be a different state, corrupting the structure. Solutions: version stamps (`AtomicStampedReference`), or relying on garbage collection not to reuse a node while any thread still references it.

**Why.** Java's GC makes ABA much rarer than in C++, but it still matters for stamped values and pooled objects.
:::

:::drill concept
Why can `LongAdder` beat `AtomicLong` under contention, and when should you not use it?
---
**Answer.** Contending threads update different padded cells instead of one cache line, so they rarely retry or bounce the line between cores. `sum()` must add all cells and is not an atomic snapshot, so use `AtomicLong` when you need `compareAndSet`, an exact read-after-write, or a sequence number.

**Why.** It trades read cost and memory for write scalability, ideal for statistics counters.
:::

## Predict the output and find the bug {#ch10-reading .dr}

:::drill output
What does this print?

```java run=c10-d-reentrant
public class Reentrant {
    synchronized void outer() { System.out.print("outer "); inner(); }
    synchronized void inner() { System.out.print("inner "); }
    static synchronized void stat() { System.out.print("static "); }

    public static void main(String[] args) throws Exception {
        Reentrant r = new Reentrant();
        r.outer();
        Thread t = new Thread(() -> {
            synchronized (Reentrant.class) { System.out.print("class-lock "); }
        });
        synchronized (r) {
            t.start();
            t.join();
            stat();
        }
        System.out.println();
    }
}
```
---
**Answer.** `outer inner class-lock static`. The same thread can re-enter `inner` while holding `r`'s monitor. The other thread locks `Reentrant.class`, a different monitor from `r`, so it is not blocked while `main` holds `r`. `stat()` locks `Reentrant.class`, which is free again.

**Why.** Instance methods lock `this`; static synchronized methods lock the `Class` object. They do not exclude each other.
:::

:::drill output
What does this print?

```java run=c10-d-interrupt
public class InterruptWait {
    public static void main(String[] args) throws Exception {
        Object lock = new Object();
        Thread waiter = new Thread(() -> {
            synchronized (lock) {
                try {
                    lock.wait();
                    System.out.println("woken normally");
                } catch (InterruptedException e) {
                    System.out.println("interrupted, flag now " + Thread.currentThread().isInterrupted());
                }
            }
        });
        waiter.start();
        Thread.sleep(100);
        waiter.interrupt();
        waiter.join();
    }
}
```
---
**Answer.** `interrupted, flag now false`. Interrupting a thread in `wait()` makes it re-acquire the monitor and throw `InterruptedException`, and throwing clears the interrupt flag.

**Why.** Code that catches `InterruptedException` and cannot rethrow it should restore the flag with `Thread.currentThread().interrupt()`, so callers can still see the request.
:::

:::drill bug
Under load, this method occasionally leaves the lock held forever and every thread blocks. Find the bug.

```java run=c10-d-bug-unlock
import java.util.concurrent.locks.ReentrantLock;

public class Inventory {
    private final ReentrantLock lock = new ReentrantLock();
    private int stock = 1;

    boolean reserve(int n) {
        lock.lock();
        try {
            if (n <= 0) throw new IllegalArgumentException("n must be positive");
            if (stock < n) return false;
            stock -= n;
            return true;
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) {
        Inventory inv = new Inventory();
        try { inv.reserve(-1); } catch (IllegalArgumentException e) { System.out.println("rejected"); }
        System.out.println(inv.reserve(1) + " " + inv.lock.isLocked());
    }
}
```
---
**Answer.** The original called `lock.unlock()` at the end of the method and before each `return`, but not before the `throw`, so an invalid argument left the lock held. Put `unlock()` in a `finally` that covers everything after `lock()`.

**Why.** `synchronized` cannot have this bug; it is the main cost of explicit locks.
:::

:::drill bug
A producer/consumer with one monitor uses `notify()` and sometimes hangs with every thread waiting. Explain.

```java run=c10-d-bug-notify
import java.util.*;

public class LostWakeup {
    private final Deque<Integer> q = new ArrayDeque<>();
    private static final int CAP = 1;

    synchronized void put(int x) throws InterruptedException {
        while (q.size() == CAP) wait();
        q.add(x);
        notifyAll();
    }

    synchronized int take() throws InterruptedException {
        while (q.isEmpty()) wait();
        int x = q.remove();
        notifyAll();
        return x;
    }

    public static void main(String[] args) throws Exception {
        LostWakeup lw = new LostWakeup();
        List<Thread> ts = new ArrayList<>();
        int[] taken = new int[1];
        for (int p = 0; p < 2; p++) ts.add(new Thread(() -> { try { for (int i = 0; i < 1000; i++) lw.put(i); } catch (InterruptedException e) {} }));
        for (int c = 0; c < 2; c++) ts.add(new Thread(() -> { try { for (int i = 0; i < 1000; i++) { lw.take(); synchronized (taken) { taken[0]++; } } } catch (InterruptedException e) {} }));
        ts.forEach(Thread::start);
        for (Thread t : ts) t.join();
        System.out.println("taken " + taken[0]);
    }
}
```
---
**Answer.** With `notify()`, producers and consumers share one wait set. A producer's `notify()` can wake another producer instead of a consumer; that producer sees the queue full and waits again, and nobody is left to wake a consumer, so all threads end up waiting. `notifyAll()` (as fixed above) or a `ReentrantLock` with separate `notFull`/`notEmpty` conditions avoids it.

**Why.** `notify()` is only safe when every waiter waits for the same condition and any one of them can make progress.
:::

## Write the code {#ch10-coding .cd}

:::drill code rating=1500
Implement a `ReadWriteLock`-style `RwLock` on top of AQS using shared mode: many readers or one writer, where `state` counts readers and −1 means a writer holds it. Test that readers overlap and a writer excludes them.
---
```java run=c10-c-rwlock
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.AbstractQueuedSynchronizer;

public class RwLockDemo {
    static final class RwLock {
        private static final class Sync extends AbstractQueuedSynchronizer {
            @Override protected int tryAcquireShared(int ignored) {
                for (;;) {
                    int s = getState();
                    if (s < 0 || hasQueuedPredecessors()) return -1;     // writer holds it, or someone queued first
                    if (compareAndSetState(s, s + 1)) return 1;
                }
            }
            @Override protected boolean tryReleaseShared(int ignored) {
                for (;;) {
                    int s = getState();
                    if (compareAndSetState(s, s - 1)) return s - 1 == 0;
                }
            }
            @Override protected boolean tryAcquire(int ignored) {
                return getState() == 0 && !hasQueuedPredecessors() && compareAndSetState(0, -1);
            }
            @Override protected boolean tryRelease(int ignored) { setState(0); return true; }
        }
        private final Sync sync = new Sync();
        void readLock() { sync.acquireShared(1); }
        void readUnlock() { sync.releaseShared(1); }
        void writeLock() { sync.acquire(1); }
        void writeUnlock() { sync.release(1); }
    }

    public static void main(String[] args) throws Exception {
        RwLock lock = new RwLock();
        AtomicInteger readersInside = new AtomicInteger(), maxReaders = new AtomicInteger();
        AtomicBoolean writerSawReader = new AtomicBoolean();
        ExecutorService pool = Executors.newFixedThreadPool(6);
        CountDownLatch go = new CountDownLatch(1);
        for (int i = 0; i < 5; i++) pool.submit(() -> {
            go.await();
            for (int k = 0; k < 200; k++) {
                lock.readLock();
                try { maxReaders.accumulateAndGet(readersInside.incrementAndGet(), Math::max); Thread.onSpinWait(); readersInside.decrementAndGet(); }
                finally { lock.readUnlock(); }
            }
            return null;
        });
        pool.submit(() -> {
            go.await();
            for (int k = 0; k < 200; k++) {
                lock.writeLock();
                try { if (readersInside.get() != 0) writerSawReader.set(true); } finally { lock.writeUnlock(); }
            }
            return null;
        });
        go.countDown();
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);
        System.out.println("readers overlapped: " + (maxReaders.get() > 1) + ", writer ever saw a reader: " + writerSawReader.get());
    }
}
```

`hasQueuedPredecessors()` gives queued writers priority over newly arriving readers, which prevents writer starvation, at some cost in read throughput. The JDK's `ReentrantReadWriteLock` packs a 16-bit read count and a 16-bit write count into the one `int` state and supports re-entrancy and downgrading.
:::

:::drill code rating=1400
Implement a lock-free stack (Treiber stack) with `push` and `pop` using `AtomicReference` and a CAS loop, and check it with 4 threads pushing 10,000 items each and then popping them all.
---
```java run=c10-c-treiber
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;

public class Treiber<T> {
    private record Node<T>(T value, Node<T> next) {}
    private final AtomicReference<Node<T>> top = new AtomicReference<>();

    void push(T value) {
        Node<T> current, node;
        do {
            current = top.get();
            node = new Node<>(value, current);
        } while (!top.compareAndSet(current, node));
    }

    T pop() {
        Node<T> current;
        do {
            current = top.get();
            if (current == null) return null;
        } while (!top.compareAndSet(current, current.next()));
        return current.value();
    }

    public static void main(String[] args) throws Exception {
        Treiber<Integer> stack = new Treiber<>();
        Thread[] ts = new Thread[4];
        for (int t = 0; t < ts.length; t++) {
            int base = t * 10_000;
            ts[t] = new Thread(() -> { for (int i = 0; i < 10_000; i++) stack.push(base + i); });
            ts[t].start();
        }
        for (Thread t : ts) t.join();
        Set<Integer> seen = new HashSet<>();
        Integer v;
        while ((v = stack.pop()) != null) seen.add(v);
        System.out.println(seen.size() + " distinct items popped");
    }
}
```

Each node is immutable and freshly allocated, and the garbage collector does not reuse a node while any thread still holds a reference, so this stack does not suffer from ABA the way a C version with manual memory reuse would.
:::

:::drill code rating=1300
Write `transfer(from, to, amount)` between bank accounts that cannot deadlock, using `ReentrantLock.tryLock` with a timeout and retry with random back-off, and test it with opposite-direction transfers.
---
```java run=c10-c-transfer
import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

public class Transfer {
    static final class Account {
        final ReentrantLock lock = new ReentrantLock();
        long balance;
        Account(long b) { balance = b; }
    }

    static void transfer(Account from, Account to, long amount) throws InterruptedException {
        while (true) {
            if (from.lock.tryLock(1, TimeUnit.MILLISECONDS)) {
                try {
                    if (to.lock.tryLock(1, TimeUnit.MILLISECONDS)) {
                        try { from.balance -= amount; to.balance += amount; return; }
                        finally { to.lock.unlock(); }
                    }
                } finally { from.lock.unlock(); }
            }
            Thread.sleep(0, ThreadLocalRandom.current().nextInt(1000));   // back off before retrying
        }
    }

    public static void main(String[] args) throws Exception {
        Account a = new Account(1000), b = new Account(1000);
        Thread t1 = new Thread(() -> { try { for (int i = 0; i < 2000; i++) transfer(a, b, 1); } catch (InterruptedException e) {} });
        Thread t2 = new Thread(() -> { try { for (int i = 0; i < 2000; i++) transfer(b, a, 1); } catch (InterruptedException e) {} });
        t1.start(); t2.start(); t1.join(); t2.join();
        System.out.println(a.balance + " " + b.balance + " total " + (a.balance + b.balance));
    }
}
```

`tryLock` breaks the "no pre-emption" condition: a thread that cannot get the second lock gives up the first, so no cycle can persist. The random back-off avoids **livelock**, where both threads keep retrying in lock-step. A global lock order (Python chapter 11) is simpler when you control every caller.
:::

## Cheat sheet {#ch10-cheatsheet .th}

- `synchronized` block = `monitorenter` / `monitorexit` + exception-table release; method = `ACC_SYNCHRONIZED`. Re-entrant. Instance methods lock `this`, static ones the `Class`.
- HotSpot: lock bits in the mark word; uncontended = one CAS (stack locks or JDK 21+ lightweight lock stack); contention/`wait` → inflated `ObjectMonitor` (spin, then park). Biased locking removed in JDK 18.
- `wait`/`notify` need the monitor (`IllegalMonitorStateException`), always `while (!cond) wait();`, prefer `notifyAll` or separate `Condition`s. Interrupted waits throw and clear the flag.
- `ReentrantLock`: `tryLock`, timeouts, `lockInterruptibly`, fairness, multiple `Condition`s; `unlock()` in `finally`.
- AQS: CAS'd `int state` + FIFO wait queue + `LockSupport.park/unpark`; subclasses define `tryAcquire`/`tryRelease` (and shared variants).
- CAS loops: read, compute, `compareAndSet`, retry; functions must be pure. ABA → `AtomicStampedReference`.
- `LongAdder` for hot counters (striped cells, `sum()` not a snapshot); `AtomicLong` for exact sequences and CAS.
- Deadlock = cycle of waits; prevent with lock ordering or `tryLock` + back-off; detect with `ThreadMXBean.findDeadlockedThreads()` / `jstack`.
