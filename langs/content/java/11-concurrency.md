---
title: Executors, concurrent collections and virtual threads
part: Part D · Concurrency
lede: Modern Java code rarely creates threads or takes locks by hand. It submits tasks to executors, chains `CompletableFuture`s, shares state through `ConcurrentHashMap`, and since Java 21 can give every task its own cheap virtual thread. This chapter explains how `ThreadPoolExecutor` decides between queuing, growing and rejecting, how `ConcurrentHashMap` stays scalable without a global lock, how fork/join work stealing works, and how virtual threads are mounted on carrier threads and when they get pinned.
desc: ThreadPoolExecutor rules, CompletableFuture, fork/join, ConcurrentHashMap internals, virtual threads and pinning
hours: 4
prereqs: Chapters 9–10
---

## ThreadPoolExecutor {#ch11-tpe .th}

Every `Executors.newXxx` factory except the virtual-thread one returns a `ThreadPoolExecutor` (or a `ForkJoinPool`) configured with four key settings: **core pool size**, **maximum pool size**, a **work queue**, and a **rejection policy**. When a task is submitted:

1. If fewer than *core* threads exist, start a new thread for it (even if others are idle).
2. Otherwise, try to put it in the **queue**.
3. If the queue is full, start a new thread, up to *max*.
4. If that fails too, **reject** it with the policy: `AbortPolicy` (throw `RejectedExecutionException`, the default), `CallerRunsPolicy` (run it on the submitting thread, which slows the producer down), `DiscardPolicy` or `DiscardOldestPolicy`.

Step 3 surprises people: threads above *core* are only created when the queue is **full**, so with an unbounded queue *max* is never used.

```java run=c11-tpe
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Pool {
    public static void main(String[] args) throws Exception {
        CountDownLatch block = new CountDownLatch(1);
        ThreadPoolExecutor pool = new ThreadPoolExecutor(2, 4, 30, TimeUnit.SECONDS, new ArrayBlockingQueue<>(3));
        AtomicInteger rejected = new AtomicInteger();
        for (int i = 1; i <= 9; i++) {
            try {
                pool.execute(() -> { try { block.await(); } catch (InterruptedException e) {} });
                System.out.printf("task %d: threads=%d queued=%d%n", i, pool.getPoolSize(), pool.getQueue().size());
            } catch (RejectedExecutionException e) {
                rejected.incrementAndGet();
                System.out.printf("task %d: rejected%n", i);
            }
        }
        block.countDown();
        pool.shutdown();
        System.out.println("terminated: " + pool.awaitTermination(5, TimeUnit.SECONDS) + ", rejected " + rejected.get());
    }
}
```

Tasks 1–2 start the core threads, 3–5 fill the queue, 6–7 start extra threads up to the maximum of 4, and 8–9 are rejected.

:::trap
`Executors.newFixedThreadPool(n)` uses an **unbounded** `LinkedBlockingQueue`: if producers are faster than the pool, the queue grows until `OutOfMemoryError`. `newCachedThreadPool()` uses a `SynchronousQueue` and an unbounded maximum: under load it creates thousands of threads. For servers, build a `ThreadPoolExecutor` with a bounded queue and an explicit rejection policy.
:::

Always `shutdown()` an executor you created (or use try-with-resources, since `ExecutorService` is `AutoCloseable` in Java 19+): its threads are non-daemon by default and keep the JVM alive.

## CompletableFuture {#ch11-cf .th}

`CompletableFuture` represents a value that will be available later and lets you describe what to do with it, without blocking a thread while waiting:

- `supplyAsync(fn, executor)` starts an asynchronous computation (on the common `ForkJoinPool` if no executor is given);
- `thenApply` transforms the result, `thenCompose` chains another async step (like `flatMap`), `thenCombine` joins two independent futures;
- `exceptionally` / `handle` recover from failures, which propagate down the chain wrapped in `CompletionException`;
- `allOf` / `anyOf` wait for many; `join()` blocks and throws unchecked exceptions, `get()` throws checked ones.

```java run=c11-cf nondet
import java.util.concurrent.*;

public class Pipeline {
    static int price(String item) { sleep(50); return item.length() * 10; }
    static double rate(String currency) { sleep(50); return currency.equals("EUR") ? 0.9 : 1.0; }
    static void sleep(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { throw new RuntimeException(e); } }

    public static void main(String[] args) {
        try (ExecutorService io = Executors.newFixedThreadPool(4)) {
            long t0 = System.nanoTime();
            CompletableFuture<Integer> p = CompletableFuture.supplyAsync(() -> price("keyboard"), io);
            CompletableFuture<Double> r = CompletableFuture.supplyAsync(() -> rate("EUR"), io);
            CompletableFuture<String> total = p.thenCombine(r, (cents, fx) -> cents * fx)
                .thenApply(v -> String.format("%.1f EUR", v));
            System.out.println(total.join() + " in " + (System.nanoTime() - t0) / 1_000_000 + " ms (two 50 ms calls in parallel)");

            CompletableFuture<String> failing = CompletableFuture
                .supplyAsync(() -> { if (true) throw new IllegalStateException("no stock"); return "x"; }, io)
                .thenApply(String::toUpperCase)
                .exceptionally(ex -> "fallback after " + ex.getClass().getSimpleName() + ": " + ex.getCause().getMessage());
            System.out.println(failing.join());
        }
    }
}
```

The two lookups run in parallel, so in steady state the total is about one call's latency rather than two. The number printed above is higher because this is the first call (the pool starts its threads and the code is still interpreted) and because the guide's builder runs many examples at once. The exception thrown in the first stage skips `thenApply` and reaches `exceptionally` wrapped in a `CompletionException`.

:::key
Pass your own executor to the `…Async` methods for blocking work. The default common pool has only (CPUs − 1) threads and is shared by parallel streams and every library in the JVM; blocking it starves them all.
:::

## Fork/join and work stealing {#ch11-forkjoin .th}

`ForkJoinPool` is built for divide-and-conquer: a task splits itself into subtasks (`fork`) and later waits for them (`join`). Each worker thread has its own **double-ended queue**. It pushes and pops its own subtasks at one end (LIFO, cache-friendly), and an idle worker **steals** from the *other* end of a busy worker's deque (FIFO, usually the biggest remaining chunks). Parallel streams run on the common pool this way.

```java run=c11-forkjoin
import java.util.concurrent.*;
import java.util.stream.LongStream;

public class SumTask extends RecursiveTask<Long> {
    private final long[] data;
    private final int lo, hi;
    SumTask(long[] data, int lo, int hi) { this.data = data; this.lo = lo; this.hi = hi; }

    @Override protected Long compute() {
        if (hi - lo <= 10_000) {
            long s = 0;
            for (int i = lo; i < hi; i++) s += data[i];
            return s;
        }
        int mid = (lo + hi) >>> 1;
        SumTask left = new SumTask(data, lo, mid);
        left.fork();                                   // push onto this worker's deque
        long right = new SumTask(data, mid, hi).compute();
        return left.join() + right;                    // join may run or steal other work while waiting
    }

    public static void main(String[] args) {
        long[] data = LongStream.rangeClosed(1, 5_000_000).toArray();
        long viaFj = ForkJoinPool.commonPool().invoke(new SumTask(data, 0, data.length));
        long viaStream = LongStream.of(data).parallel().sum();
        System.out.println(viaFj + " " + (viaFj == viaStream) + " " + (viaFj == 5_000_000L * 5_000_001L / 2));
    }
}
```

Computing one half directly and forking only the other halves the number of tasks. A worker that calls `join()` on an unfinished task does not just block: it helps by running other queued tasks.

## ConcurrentHashMap {#ch11-chm .th}

`Hashtable` and `Collections.synchronizedMap` put one lock around every operation. `ConcurrentHashMap` (Java 8 design) instead:

- keeps a `table` of bins like `HashMap`, with `volatile` reads of bins so `get` takes **no lock at all**;
- inserts into an **empty** bin with a single CAS;
- for a non-empty bin, `synchronized`s on the bin's **first node**, so writers to different bins never block each other;
- turns crowded bins into trees, like `HashMap`;
- resizes **cooperatively**: threads that write during a resize help move bins to the new table, marked by `ForwardingNode`s;
- counts its size with `LongAdder`-style counter cells, so `size()` is an estimate under concurrent updates;
- forbids `null` keys and values, so that `get` returning `null` always means "absent".

Its compound operations are atomic per key: `putIfAbsent`, `computeIfAbsent`, `compute`, `merge`. Combining separate calls (`get` then `put`) is not:

```java run=c11-chm nondet
import java.util.*;
import java.util.concurrent.*;

public class WordCount {
    public static void main(String[] args) throws Exception {
        List<String> words = new ArrayList<>();
        for (int i = 0; i < 200_000; i++) words.add("w" + (i % 10));
        ConcurrentHashMap<String, Integer> racy = new ConcurrentHashMap<>();
        ConcurrentHashMap<String, Integer> atomic = new ConcurrentHashMap<>();
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            for (int t = 0; t < 8; t++) {
                pool.submit(() -> {
                    for (String w : words) {
                        Integer old = racy.get(w);                 // check...
                        racy.put(w, old == null ? 1 : old + 1);    // ...then act: lost updates
                        atomic.merge(w, 1, Integer::sum);          // one atomic operation
                    }
                });
            }
        }
        int expected = 8 * 200_000;
        System.out.println("racy total correct: " + (racy.values().stream().mapToInt(Integer::intValue).sum() == expected)
            + ", merge total correct: " + (atomic.values().stream().mapToInt(Integer::intValue).sum() == expected));
    }
}
```

Each map operation on its own is thread-safe, but `get` followed by `put` lets two threads read the same old count, and one increment is lost. `merge` performs the read-modify-write under the bin's lock.

Other concurrent collections: `CopyOnWriteArrayList` (copies the array on every write; great for rarely changed listener lists, terrible for frequent writes), `ConcurrentLinkedQueue` (lock-free), `ConcurrentSkipListMap` (concurrent sorted map), and the `BlockingQueue` family (`ArrayBlockingQueue`, `LinkedBlockingQueue`, `SynchronousQueue`, `DelayQueue`, `PriorityBlockingQueue`) for producer/consumer hand-offs.

## Virtual threads {#ch11-virtual .th}

A **platform thread** is a thin wrapper over an OS thread: about 1 MB of reserved stack, expensive to create, and limited to a few thousand per process. Server code written as "one thread per request" therefore hit a ceiling, and the alternative, asynchronous callbacks, is hard to write and debug.

**Virtual threads** (JEP 444, final in Java 21) are threads implemented by the JVM. Each one is a `Thread` object whose stack is stored on the heap as a **continuation**. The JVM runs them on a small pool of platform **carrier threads** (a `ForkJoinPool` with one carrier per CPU core by default):

- When a virtual thread performs a blocking operation that the JDK knows about (sleeping, socket I/O, `BlockingQueue.take`, `ReentrantLock.lock`…), the JDK **unmounts** it: its stack frames are saved to the heap and the carrier is free to run another virtual thread.
- When the operation can continue, the virtual thread is scheduled again and **mounted** on any carrier.

You keep simple blocking code, and millions of threads can wait at the same time.

```java run=c11-virtual nondet
import java.util.concurrent.*;

public class Virtual {
    static long run(ExecutorService ex, int tasks) throws Exception {
        long t0 = System.nanoTime();
        try (ex) {
            for (int i = 0; i < tasks; i++) ex.submit(() -> { Thread.sleep(100); return null; });
        }                                                  // close() waits for all tasks
        return (System.nanoTime() - t0) / 1_000_000;
    }

    public static void main(String[] args) throws Exception {
        run(Executors.newVirtualThreadPerTaskExecutor(), 1_000);       // warm up
        System.out.println("10,000 sleeping tasks on virtual threads: " + run(Executors.newVirtualThreadPerTaskExecutor(), 10_000) + " ms");
        System.out.println("2,000 sleeping tasks on 100 platform threads: " + run(Executors.newFixedThreadPool(100), 2_000) + " ms");
        Thread vt = Thread.ofVirtual().name("demo").unstarted(() -> {});
        System.out.println(vt.isVirtual() + " " + vt.isDaemon());
    }
}
```

The pool of 100 platform threads can only sleep 100 tasks at a time, so 2,000 tasks take 20 rounds of 100 ms. The virtual threads all sleep at once, so five times as many tasks finish in a fraction of that time, because a sleeping virtual thread holds no carrier. Virtual threads are always daemon threads. They are not faster at computing; they make **waiting** cheap. Do not pool them: create one per task.

### Pinning

A virtual thread cannot be unmounted while it is **pinned** to its carrier. In Java 21 that happens when it blocks:

- inside a `synchronized` block or method (the monitor implementation is tied to the carrier thread), or
- inside a native method or foreign function call.

A pinned virtual thread blocks its carrier, and if all carriers are pinned, no other virtual thread can run. JDK 21 can report it:

```java run=c11-pinning cmd="javac -d . Pinning.java && java -Djdk.tracePinnedThreads=short -cp . Pinning 2>&1 | sed -E 's/#[0-9]+/#N/; s/worker-[0-9]+/worker-N/'"
import java.util.concurrent.locks.ReentrantLock;

public class Pinning {
    static final Object monitor = new Object();
    static final ReentrantLock lock = new ReentrantLock();

    public static void main(String[] args) throws Exception {
        Thread a = Thread.ofVirtual().start(() -> {
            synchronized (monitor) { sleep(50); }              // pinned in JDK 21
        });
        a.join();
        Thread b = Thread.ofVirtual().start(() -> {
            lock.lock();
            try { sleep(50); } finally { lock.unlock(); }      // unmounts normally
        });
        b.join();
        System.out.println("done");
    }

    static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
```

Only the `synchronized` version is reported (`reason:MONITOR`), with the frame holding the monitor marked. In JDK 21, replace `synchronized` around blocking calls with `ReentrantLock` in code that runs on virtual threads. **JDK 24 removed this limitation** (JEP 491): monitors no longer pin, leaving only native frames.

:::tip
Two more virtual-thread habits: avoid `ThreadLocal` caches of expensive objects (with a million threads you get a million copies; Java 21's `ScopedValue` preview is the intended replacement for request context), and limit concurrency with a `Semaphore`, not a small pool, when a downstream resource such as a database can only take N connections.
:::

## Concept and tricky questions {#ch11-concept .dr}

:::drill concept
Describe the decision `ThreadPoolExecutor` makes when a task is submitted.
---
**Answer.** Fewer than core threads: start a new thread. Otherwise: offer the task to the queue. Queue full: start a new thread if below max. Otherwise: reject with the policy (`AbortPolicy` by default).

**Why.** The consequence that surprises people: with an unbounded queue the pool never grows past its core size.
:::

:::drill tricky
Why is `Executors.newFixedThreadPool` risky in a server, and what would you use instead?
---
**Answer.** It uses an unbounded `LinkedBlockingQueue`, so a slow downstream lets the queue grow until the JVM runs out of memory, while latency rises without bound. Use a `ThreadPoolExecutor` with a bounded queue and a deliberate rejection policy (`CallerRunsPolicy` applies back-pressure), or virtual threads with a `Semaphore` limit.

**Why.** Failing fast under overload is usually better than queueing work that will time out anyway.
:::

:::drill concept
What is the difference between `thenApply` and `thenCompose`?
---
**Answer.** `thenApply(fn)` transforms the result with a function returning a value, giving `CompletableFuture<U>`. `thenCompose(fn)` takes a function that returns another `CompletableFuture<U>` and flattens it, so you get `CompletableFuture<U>` instead of `CompletableFuture<CompletableFuture<U>>`.

**Why.** It is `map` versus `flatMap`; use `thenCompose` to chain a dependent async call.
:::

:::drill concept
How does `ConcurrentHashMap` let many threads write at once without a global lock?
---
**Answer.** Reads are lock-free (volatile bin reads). Writes to an empty bin use CAS; writes to a non-empty bin lock only that bin's first node. Resizing is shared among writing threads, and the size is kept in striped counter cells.

**Why.** Java 7's version used 16 segment locks; Java 8's per-bin design scales further and uses less memory.
:::

:::drill tricky
`map.get(k)` and `map.put(k, v)` are both thread-safe on a `ConcurrentHashMap`. Why can a word counter built from them lose counts?
---
**Answer.** Each call is atomic, but the sequence is not: two threads can both read the old count before either writes, and one increment overwrites the other. Use `merge(k, 1, Integer::sum)` or `compute`, which perform the read-modify-write atomically for that key.

**Why.** Thread-safe building blocks do not make compound actions atomic, the same lesson as `volatile` `++`.
:::

:::drill concept
What is a virtual thread, and what happens when it blocks on a socket read?
---
**Answer.** A `java.lang.Thread` implemented by the JVM, whose stack lives on the heap as a continuation and which runs mounted on a platform carrier thread. On a blocking socket read the JDK registers interest with its poller, unmounts the virtual thread (saving its frames) and frees the carrier; when data arrives, the virtual thread is scheduled and remounted, possibly on another carrier.

**Why.** It gives the scalability of async I/O with plain blocking code.
:::

:::drill tricky
What is pinning, and how did JDK 24 change it?
---
**Answer.** A virtual thread is pinned when it cannot be unmounted, so a blocking operation blocks its carrier too. In JDK 21 this happens inside `synchronized` blocks/methods and native calls. JDK 24 (JEP 491) reimplemented monitors so `synchronized` no longer pins; native and foreign calls still do.

**Why.** On JDK 21, `-Djdk.tracePinnedThreads=full` and JFR's `jdk.VirtualThreadPinned` event find pinning; the usual fix was switching to `ReentrantLock`.
:::

## Predict the output and find the bug {#ch11-reading .dr}

:::drill output
What does this print?

```java run=c11-d-cf-order
import java.util.concurrent.*;

public class CfOrder {
    public static void main(String[] args) {
        CompletableFuture<Integer> f = CompletableFuture.completedFuture(2);
        CompletableFuture<Integer> g = f.thenApply(x -> x * 10).thenApply(x -> x + 1);
        System.out.println(g.join() + " " + g.isDone());
        CompletableFuture<String> h = CompletableFuture.<String>failedFuture(new RuntimeException("boom"))
            .thenApply(s -> s + "!")
            .handle((v, ex) -> v != null ? v : "handled " + ex.getMessage());
        System.out.println(h.join());
        try {
            CompletableFuture.failedFuture(new IllegalStateException("bad")).join();
        } catch (CompletionException e) {
            System.out.println("CompletionException caused by " + e.getCause().getClass().getSimpleName());
        }
    }
}
```
---
**Answer.** `21 true`, `handled java.lang.RuntimeException: boom`, `CompletionException caused by IllegalStateException`. Stages on an already-completed future run immediately on the calling thread. The failure skips `thenApply` and reaches `handle`, but by then it is wrapped in a `CompletionException` whose message is the cause's `toString()`, hence the class name in the text. `join()` also wraps the cause in `CompletionException`.

**Why.** `get()` would throw a checked `ExecutionException` with the same cause.
:::

:::drill output
What does this print?

```java run=c11-d-cow
import java.util.*;
import java.util.concurrent.*;

public class CowIteration {
    public static void main(String[] args) {
        List<String> cow = new CopyOnWriteArrayList<>(List.of("a", "b"));
        for (String s : cow) cow.add(s.toUpperCase());
        System.out.println(cow);
        Map<String, Integer> chm = new ConcurrentHashMap<>(Map.of("x", 1));
        for (String k : chm.keySet()) chm.put(k + "2", 2);
        System.out.println(chm.size() >= 2);
    }
}
```
---
**Answer.** `[a, b, A, B]`, then `true`. A copy-on-write iterator walks the snapshot taken when it started, so adding during iteration neither throws nor loops forever. `ConcurrentHashMap`'s iterators are weakly consistent: they never throw `ConcurrentModificationException` and may or may not see updates made during iteration.

**Why.** Concurrent collections trade exact iteration semantics for safety under concurrent modification.
:::

:::drill bug
A service runs blocking database calls in `CompletableFuture.supplyAsync` without an executor, and under load all parallel streams in the application stall. Fix it.

```java run=c11-d-bug-commonpool
import java.util.*;
import java.util.concurrent.*;

public class CommonPool {
    static String query(int id) {
        try { Thread.sleep(20); } catch (InterruptedException e) { throw new RuntimeException(e); }
        return "row" + id;
    }

    public static void main(String[] args) {
        try (ExecutorService db = Executors.newFixedThreadPool(32)) {
            List<CompletableFuture<String>> rows = new ArrayList<>();
            for (int i = 0; i < 64; i++) {
                int id = i;
                rows.add(CompletableFuture.supplyAsync(() -> query(id), db));
            }
            CompletableFuture.allOf(rows.toArray(new CompletableFuture[0])).join();
            System.out.println(rows.get(63).join() + " via dedicated pool; common pool parallelism " + ForkJoinPool.getCommonPoolParallelism());
        }
    }
}
```
---
**Answer.** Without an executor argument, every blocking query occupied one of the common pool's (CPUs − 1) threads, starving parallel streams and other async code that share it. Pass a dedicated executor sized for the blocking work, as above (or use virtual threads).

**Why.** The common pool is meant for short, non-blocking CPU work.
:::

:::drill bug
A per-user cache is filled with `if (!map.containsKey(id)) map.put(id, load(id));` on a `ConcurrentHashMap`, and `load` runs several times per user. Fix it.

```java run=c11-d-bug-load
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class LoadOnce {
    static final AtomicInteger loads = new AtomicInteger();
    static String load(String id) { loads.incrementAndGet(); return "profile:" + id; }

    public static void main(String[] args) throws Exception {
        ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();
        CountDownLatch go = new CountDownLatch(1);
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            for (int i = 0; i < 8; i++) pool.submit(() -> { go.await(); return cache.computeIfAbsent("u1", LoadOnce::load); });
            go.countDown();
        }
        System.out.println(cache.get("u1") + " loaded " + loads.get() + " time");
    }
}
```
---
**Answer.** `containsKey` followed by `put` is check-then-act: several threads see the key missing and all call `load`. `computeIfAbsent` runs the loader at most once per key, atomically, while other callers for the same key wait.

**Why.** Keep the mapping function short and never modify the same map inside it; it runs while holding the bin lock.
:::

## Write the code {#ch11-coding .cd}

:::drill code rating=1400
Write `fetchAll(List<String> urls)` that "downloads" every URL on virtual threads (simulate with `Thread.sleep`), limits concurrency to 10 with a `Semaphore`, preserves input order in the result, and reports the peak number of concurrent downloads.
---
```java run=c11-c-semaphore
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Fetch {
    static final Semaphore permits = new Semaphore(10);
    static final AtomicInteger active = new AtomicInteger(), peak = new AtomicInteger();

    static String download(String url) throws InterruptedException {
        permits.acquire();
        try {
            peak.accumulateAndGet(active.incrementAndGet(), Math::max);
            Thread.sleep(20);
            return url.toUpperCase();
        } finally {
            active.decrementAndGet();
            permits.release();
        }
    }

    static List<String> fetchAll(List<String> urls) throws Exception {
        try (ExecutorService ex = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<String>> futures = new ArrayList<>();
            for (String u : urls) futures.add(ex.submit(() -> download(u)));
            List<String> out = new ArrayList<>();
            for (Future<String> f : futures) out.add(f.get());
            return out;
        }
    }

    public static void main(String[] args) throws Exception {
        List<String> urls = new ArrayList<>();
        for (int i = 0; i < 100; i++) urls.add("https://example.com/" + i);
        List<String> pages = fetchAll(urls);
        System.out.println(pages.size() + " pages, first " + pages.get(0) + ", peak concurrency " + peak.get());
    }
}
```

All 100 virtual threads start at once; the semaphore makes 90 of them wait (unmounted, costing almost nothing) so that at most 10 downloads are in flight. Collecting futures in submission order keeps the output order independent of completion order.
:::

:::drill code rating=1500
Implement a minimal fixed-size thread pool from scratch: N worker threads taking `Runnable`s from a `BlockingQueue`, `submit` returning a `Future` (use `FutureTask`), and `shutdown` that lets queued tasks finish and then stops the workers with a "poison pill".
---
```java run=c11-c-pool
import java.util.*;
import java.util.concurrent.*;

public class MiniPool {
    private static final Runnable POISON = () -> {};
    private final BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>();
    private final List<Thread> workers = new ArrayList<>();
    private volatile boolean shutdown;

    MiniPool(int n) {
        for (int i = 0; i < n; i++) {
            Thread t = new Thread(() -> {
                try {
                    while (true) {
                        Runnable task = queue.take();
                        if (task == POISON) return;
                        task.run();                      // FutureTask captures exceptions
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "mini-" + i);
            workers.add(t);
            t.start();
        }
    }

    <T> Future<T> submit(Callable<T> c) {
        if (shutdown) throw new RejectedExecutionException("pool is shut down");
        FutureTask<T> task = new FutureTask<>(c);
        queue.add(task);
        return task;
    }

    void shutdownAndWait() throws InterruptedException {
        shutdown = true;
        for (int i = 0; i < workers.size(); i++) queue.add(POISON);   // after all real tasks
        for (Thread t : workers) t.join();
    }

    public static void main(String[] args) throws Exception {
        MiniPool pool = new MiniPool(3);
        List<Future<Integer>> results = new ArrayList<>();
        for (int i = 1; i <= 10; i++) { int n = i; results.add(pool.submit(() -> n * n)); }
        Future<Integer> failing = pool.submit(() -> { throw new IllegalStateException("task failed"); });
        pool.shutdownAndWait();
        int sum = 0;
        for (Future<Integer> f : results) sum += f.get();
        try { failing.get(); } catch (ExecutionException e) { System.out.println("caught " + e.getCause().getMessage()); }
        try { pool.submit(() -> 1); } catch (RejectedExecutionException e) { System.out.println("rejected after shutdown"); }
        System.out.println("sum of squares " + sum);
    }
}
```

`FutureTask` stores a task's result or exception so a failing task does not kill its worker thread. Poison pills enqueued after the real tasks guarantee queued work completes before the workers exit; `ThreadPoolExecutor` uses a state machine and interrupts instead.
:::

:::drill code rating=1300
Use `CompletableFuture` to call three "services" with different latencies, take whichever answers first with `anyOf`, apply a timeout of 100 ms with `orTimeout`, and fall back to a default when all are too slow.
---
```java run=c11-c-anyof
import java.util.concurrent.*;

public class FirstAnswer {
    static CompletableFuture<String> call(String name, long ms, Executor ex) {
        return CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(ms); } catch (InterruptedException e) { throw new RuntimeException(e); }
            return name;
        }, ex);
    }

    static String fastest(Executor ex, long a, long b, long c) {
        return CompletableFuture.anyOf(call("primary", a, ex), call("replica-1", b, ex), call("replica-2", c, ex))
            .orTimeout(100, TimeUnit.MILLISECONDS)
            .thenApply(String.class::cast)
            .exceptionally(ex2 -> "default (" + (ex2 instanceof CompletionException ? ex2.getCause() : ex2).getClass().getSimpleName() + ")")
            .join();
    }

    public static void main(String[] args) {
        try (ExecutorService ex = Executors.newVirtualThreadPerTaskExecutor()) {
            System.out.println(fastest(ex, 80, 20, 50));
            System.out.println(fastest(ex, 300, 400, 500));
        }
    }
}
```

`orTimeout` (Java 9) completes the future exceptionally with a `TimeoutException` if nothing finished in time; the next stage sees it wrapped in a `CompletionException`, which is why the handler unwraps it. The slower calls keep running in the background; `cancel(true)` on a `CompletableFuture` does not interrupt the underlying task, so long calls need their own timeouts.
:::

## Cheat sheet {#ch11-cheatsheet .th}

- `ThreadPoolExecutor`: < core → new thread; else queue; queue full → new thread up to max; else reject (`Abort`, `CallerRuns`, `Discard`, `DiscardOldest`).
- `newFixedThreadPool` = unbounded queue (OOM risk); `newCachedThreadPool` = unbounded threads. Bound queues in servers; always shut down (try-with-resources in 19+).
- `CompletableFuture`: `supplyAsync(fn, executor)`, `thenApply` (map), `thenCompose` (flatMap), `thenCombine`, `exceptionally`/`handle`, `allOf`/`anyOf`, `orTimeout`; `join` wraps in `CompletionException`.
- Common `ForkJoinPool`: CPUs − 1 threads shared by parallel streams and default async; never block it.
- Fork/join: per-worker deques, LIFO own work, FIFO stealing; fork one half, compute the other.
- `ConcurrentHashMap`: lock-free reads, CAS into empty bins, per-bin `synchronized`, cooperative resize, counter cells, no nulls, weakly consistent iterators. Use `merge`/`compute`/`computeIfAbsent` for read-modify-write.
- `CopyOnWriteArrayList` for read-mostly lists; `BlockingQueue`s for hand-off.
- Virtual threads (21): JVM threads on carrier `ForkJoinPool`; blocking unmounts; one per task, never pooled; daemon; limit with `Semaphore`.
- Pinning: `synchronized` and native frames in 21 (`-Djdk.tracePinnedThreads`), only native in 24+ (JEP 491). Watch `ThreadLocal` footprint; `ScopedValue` preview.
