---
title: Timed mock rounds
part: Part F · Mixed practice
lede: Five rounds that mix the whole guide the way Java interviews do: a `HashMap` question becomes a question about `hashCode`, then about resizing, then about thread safety; a "why is this slow" question ends at the JIT or the garbage collector. Set a timer, answer before opening anything, and score yourself honestly.
desc: Mixed question sets under a timer, with an answer key
hours: 3
prereqs: Chapters 1–12
---

## How to run a round {#ch13-how-to .th}

- Keep to the time shown and answer every question out loud or in writing before opening the answer.
- For predict-the-output questions, write the exact output. Half right counts as wrong.
- Score 1 for a correct answer with the right reason, ½ for the right answer with a weak reason, 0 otherwise; 80% or more means the topic is ready.
- After each round, reread the chapter named in every answer you missed.

| Round | Focus | Time |
|---|---|---|
| 1 | Generalist warm-up | 15 min |
| 2 | Predict the output | 20 min |
| 3 | JVM internals deep dive | 20 min |
| 4 | Debugging | 20 min |
| 5 | Coding | 45 min |

## Round 1: generalist warm-up {#ch13-round-1 .dr}

:::drill concept
Is Java pass-by-value or pass-by-reference?
---
**Answer.** Always pass-by-value. For objects, the value passed is a reference, so a method can mutate the object but cannot make the caller's variable point elsewhere. (Chapter 1.)

**Why.** `void reset(List<String> l) { l = new ArrayList<>(); }` does nothing to the caller; `l.clear()` does.
:::

:::drill concept
What is the difference between the JDK, the JRE and the JVM, and what does "write once, run anywhere" rely on?
---
**Answer.** The JVM executes bytecode; the JRE is the JVM plus the class library; the JDK adds development tools (`javac`, `javap`, `jcmd`, `jlink`). Portability relies on class files being platform-independent bytecode run by a platform-specific JVM. (Chapter 1.)

**Why.** Since Java 11 there is no separate JRE download; `jlink` builds custom runtimes.
:::

:::drill concept
Why are `String`s immutable, and name two benefits.
---
**Answer.** Immutability lets strings be shared from the string pool, used safely as hash-map keys with a cached hash, passed between threads without synchronisation, and trusted in security checks (a file name cannot change after validation). (Chapter 4.)

**Why.** Interviewers often follow up with "how is `+` compiled now?": an `invokedynamic` to `StringConcatFactory`.
:::

:::drill tricky
`final List<String> names = new ArrayList<>();` Can you add to `names`?
---
**Answer.** Yes. `final` makes the variable unassignable, not the object immutable. For an unmodifiable list use `List.of` or `List.copyOf`. (Chapters 8 and 9.)

**Why.** `final` fields do give a visibility guarantee for the reference and what it pointed to at construction (Chapter 9), which is a different topic.
:::

:::drill concept
What happens when you call `start()` versus `run()` on a `Thread`?
---
**Answer.** `start()` creates a new thread of execution that calls `run()`; calling `run()` directly just runs the method on the current thread. Calling `start()` twice throws `IllegalThreadStateException`. (Chapters 9 and 11.)

**Why.** `start()` is also a happens-before edge to everything the new thread does.
:::

:::drill concept
What are the main memory areas of the JVM, and which ones are per thread?
---
**Answer.** Heap (objects, shared), metaspace (class metadata, shared), code cache (JIT code, shared), and per thread: the Java stack of frames, the program counter and the native stack. (Chapter 3.)

**Why.** `StackOverflowError` is per-thread stack exhaustion; `OutOfMemoryError` usually means the shared heap.
:::

:::drill tricky
Can an object be garbage collected while one of its methods is still running?
---
**Answer.** Yes. Once the JIT determines that `this` and the object's fields are no longer used in the rest of the method, the object can become unreachable and be collected (and a `Cleaner` registered for it can run) before the method returns. `Reference.reachabilityFence(this)` prevents it. (Chapter 5.)

**Why.** This caused real bugs with finalizers that closed native resources still in use.
:::

## Round 2: predict the output {#ch13-round-2 .dr}

:::drill output
What does this print?

```java run=c13-r2-strings
public class R2Strings {
    public static void main(String[] args) {
        String a = "hi";
        String b = "h" + "i";
        String h = "h";
        String c = h + "i";
        System.out.println((a == b) + " " + (a == c) + " " + (a == c.intern()) + " " + ("" + 1 + 2) + (1 + 2 + ""));
    }
}
```
---
**Answer.** `true false true 123`. The constant expression is folded and pooled; the run-time concatenation creates a new object; `intern` returns the pooled one; `"" + 1 + 2` is `"12"` and `1 + 2 + ""` is `"3"`. (Chapter 4.)

**Why.** String `+` is left-associative and changes meaning once a string is on the left.
:::

:::drill output
What does this print?

```java run=c13-r2-boxing
import java.util.*;

public class R2Boxing {
    public static void main(String[] args) {
        Integer a = 100, b = 100, c = 1000, d = 1000;
        List<Integer> list = new ArrayList<>(List.of(5, 6, 7));
        list.remove(1);
        list.remove(Integer.valueOf(5));
        System.out.println((a == b) + " " + (c == d) + " " + list);
    }
}
```
---
**Answer.** `true false [7]`. 100 is in the Integer cache, 1000 is not; `remove(1)` removes index 1 (the 6), `remove(Integer)` removes the element 5. (Chapter 3.)

**Why.** Boxing and overload resolution together produce most Java "puzzler" questions.
:::

:::drill output
What does this print?

```java run=c13-r2-init
public class R2Init {
    static class A {
        A() { System.out.print("A "); show(); }
        void show() { System.out.print("A.show "); }
    }
    static class B extends A {
        int x = 5;
        B() { System.out.print("B x=" + x + " "); }
        @Override void show() { System.out.print("B.show x=" + x + " "); }
    }

    public static void main(String[] args) {
        new B();
        System.out.println();
    }
}
```
---
**Answer.** `A B.show x=0 B x=5`. The superclass constructor runs first and calls the override before `B`'s field initialiser has set `x`. (Chapter 2.)

**Why.** `x = 5` is not a constant variable (it is not `final`), so it really is 0 at that point.
:::

:::drill output
What does this print?

```java run=c13-r2-hash
import java.util.*;

public class R2Hash {
    record P(int x, int y) {}
    static final class Q {
        final int x;
        Q(int x) { this.x = x; }
        @Override public boolean equals(Object o) { return o instanceof Q q && q.x == x; }
    }

    public static void main(String[] args) {
        Set<P> ps = new HashSet<>(List.of(new P(1, 2), new P(1, 2 * 1)));
        Set<Q> qs = new HashSet<>();
        qs.add(new Q(1));
        qs.add(new Q(1));
        System.out.println(ps.size() + " " + qs.size() + " " + qs.contains(new Q(1)));
    }
}
```
---
**Answer.** `1 2 false`. The two `P` records are equal and have equal hash codes, so the set keeps one (`List.of` allows duplicates; the `HashSet` removes them). `Q` overrides only `equals`, so two equal `Q`s get different identity hash codes: `HashMap` compares the stored hash before calling `equals`, so it never even notices they are equal. (Chapter 8.)

**Why.** Override `equals` and `hashCode` together.
:::

:::drill output
What does this print?

```java run=c13-r2-finally
public class R2Finally {
    @SuppressWarnings("finally")
    static int f(int[] calls) {
        try {
            calls[0]++;
            return calls[0];
        } finally {
            calls[0] += 10;
        }
    }

    public static void main(String[] args) {
        int[] calls = {0};
        int r = f(calls);
        System.out.println(r + " " + calls[0]);
    }
}
```
---
**Answer.** `1 11`. The return value 1 is saved before `finally` runs; the `finally` changes the array element afterwards, which the caller sees. (Chapter 12.)

**Why.** The saved value is a copy of the primitive; mutations of objects remain visible.
:::

:::drill output
What does this print?

```java run=c13-r2-generics
import java.util.*;

public class R2Generics {
    static String which(Object o) { return "object"; }
    static String which(List<?> l) { return "list"; }

    public static void main(String[] args) {
        List<String> a = new ArrayList<>();
        List<Integer> b = new ArrayList<>();
        Object c = a;
        System.out.println((a.getClass() == b.getClass()) + " " + which(a) + " " + which(c));
    }
}
```
---
**Answer.** `true list object`. Erasure makes both lists the same class at run time; overloads are chosen by static type at compile time. (Chapter 7.)

**Why.** Overloading is static, overriding is dynamic.
:::

:::drill output
What does this print?

```java run=c13-r2-lambda
import java.util.*;
import java.util.function.*;

public class R2Lambda {
    public static void main(String[] args) {
        List<Supplier<Integer>> list = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            final int j = i;
            list.add(() -> j * j);
        }
        int sum = 0;
        for (Supplier<Integer> s : list) sum += s.get();
        Runnable r1 = () -> {}, r2 = () -> {};
        System.out.println(sum + " " + (r1 == r2));
    }
}
```
---
**Answer.** `5 false`: each lambda captured its own `j` (0 + 1 + 4), and two different lambda expressions are different call sites, so even non-capturing ones are different objects. (Chapter 12.)

**Why.** A non-capturing lambda is a singleton *per call site*, not per body.
:::

## Round 3: JVM internals deep dive {#ch13-round-3 .dr}

:::drill concept
Walk through what happens from `java Main` to the first line of `main` running.
---
**Answer.** The launcher starts the JVM (heap, GC threads, JIT threads, class-data sharing archive mapped), the bootstrap loader loads core classes, the application loader loads `Main`, it is linked (verified, statics prepared) and initialised (`<clinit>`), and `main` runs in the interpreter. Classes it uses are loaded lazily as they are first used, and hot methods are later compiled by C1 and C2. (Chapters 1, 2 and 6.)

**Why.** It connects class loading, verification, initialisation and tiered compilation.
:::

:::drill concept
Explain how a young collection in G1 works and why its cost is proportional to live objects.
---
**Answer.** At a safepoint, G1 evacuates (copies) live objects from all eden and survivor regions into new survivor or old regions, finding roots in thread stacks, statics and the remembered sets/card table that record old-to-young references; then the evacuated regions are freed wholesale. Dead objects are never visited, so only the survivors cost time. (Chapter 5.)

**Why.** That is the payoff of the generational hypothesis, and why short-lived objects are cheap.
:::

:::drill tricky
A hot method allocates a temporary `Point` per iteration, yet an allocation profiler shows zero allocations from it. How?
---
**Answer.** C2 inlined the code, found by escape analysis that the `Point` never escapes, and scalar-replaced it: its fields live in registers and no object is created. (Chapter 6.)

**Why.** Storing the point in a field, an array or passing it to a non-inlined call makes it escape and the allocations reappear.
:::

:::drill concept
How does `HashMap` keep `get` close to O(1), and what is its worst case since Java 8?
---
**Answer.** A power-of-two table indexed by the spread hash, a load factor of 0.75 that keeps bins short, and doubling on resize. A bin with 8 or more entries in a table of 64 or more bins becomes a red-black tree, so the worst case is O(log n). (Chapter 8.)

**Why.** Before Java 8 the worst case was O(n), which hash-flooding attacks exploited.
:::

:::drill concept
What does `volatile` do at the memory-model level, and why is it not enough for `count++`?
---
**Answer.** A volatile write happens-before every later read of that variable, so writes before it are visible after the read; reads and writes of the field itself are atomic. `count++` is a read, an increment and a write, three steps another thread can interleave with. (Chapter 9.)

**Why.** Use `AtomicInteger`, `LongAdder` or a lock.
:::

:::drill tricky
Why did virtual threads in JDK 21 recommend replacing `synchronized` with `ReentrantLock` around blocking I/O?
---
**Answer.** In JDK 21 a virtual thread that blocks while holding a monitor is pinned to its carrier thread and cannot unmount, so it blocks the carrier. `ReentrantLock` is implemented on AQS with `LockSupport.park`, which unmounts. JDK 24 (JEP 491) removed the monitor pinning. (Chapter 11.)

**Why.** `-Djdk.tracePinnedThreads` and JFR show pinning.
:::

:::drill concept
What is a safepoint and why does it matter for latency?
---
**Answer.** A point in the code where a thread can be stopped with its state fully known to the JVM (which registers and stack slots hold references). Stop-the-world GC phases, deoptimisation and some VM operations need all threads at a safepoint, so one thread slow to reach one delays everyone. (Chapter 5.)

**Why.** Concurrent collectors like ZGC keep safepoint pauses very short but still use them.
:::

## Round 4: debugging {#ch13-round-4 .dr}

:::drill bug
An order total in a report is sometimes wrong under load. Find the bug.

```java run=c13-r4-sdf
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.*;

public class Dates {
    static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static void main(String[] args) throws Exception {
        LocalDate day = LocalDate.of(2026, 10, 24);
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            var futures = new java.util.ArrayList<Future<String>>();
            for (int i = 0; i < 1000; i++) futures.add(pool.submit(() -> FORMAT.format(day)));
            boolean allSame = true;
            for (var f : futures) allSame &= f.get().equals("2026-10-24");
            System.out.println("all formatted correctly: " + allSame);
        }
    }
}
```
---
**Answer.** The original shared one `java.text.SimpleDateFormat` across threads. It keeps mutable state (an internal `Calendar`) while formatting, so concurrent use corrupts results. `java.time.format.DateTimeFormatter` is immutable and thread-safe, as above. (Chapter 9.)

**Why.** Sharing a mutable, non-thread-safe object through a `static final` field is a data race even though the reference never changes.
:::

:::drill bug
A service's heap grows steadily and full GCs get longer every hour. A histogram shows millions of `byte[]` reachable from `ListenerRegistry`. What is the likely bug and fix?

```java run=c13-r4-leak
import java.lang.ref.WeakReference;
import java.util.*;
import java.util.function.Consumer;

public class Registry {
    private final List<Consumer<String>> listeners = new ArrayList<>();
    Runnable subscribe(Consumer<String> l) { listeners.add(l); return () -> listeners.remove(l); }
    int count() { return listeners.size(); }

    static final class Session {
        final byte[] buffer = new byte[1 << 16];
        Runnable unsubscribe;
        void onEvent(String e) {}
    }

    public static void main(String[] args) {
        Registry reg = new Registry();
        WeakReference<Session> probe = null;
        for (int i = 0; i < 100; i++) {
            Session s = new Session();
            s.unsubscribe = reg.subscribe(s::onEvent);
            probe = new WeakReference<>(s);
            s.unsubscribe.run();                        // the fix: unsubscribe when the session ends
        }
        System.gc();
        System.out.println("listeners left: " + reg.count() + ", last session collected: " + (probe.get() == null));
    }
}
```
---
**Answer.** Each session registered `s::onEvent` (a bound method reference capturing the session) and never unregistered, so the registry kept every session and its buffer reachable. Return an unsubscribe handle and call it when the session ends (or hold listeners weakly). (Chapter 5.)

**Why.** "Lapsed listener" leaks are the most common Java memory leak.
:::

:::drill bug
After a refactor, a `HashMap<Point, …>` sometimes "loses" entries. Find the bug.

```java run=c13-r4-mutable
import java.util.*;

public class Lost {
    record Point(int x, int y) {
        Point moved(int dx) { return new Point(x + dx, y); }
    }

    public static void main(String[] args) {
        Map<Point, String> labels = new HashMap<>();
        Point p = new Point(1, 1);
        labels.put(p, "start");
        Point moved = p.moved(5);                 // a new key, instead of mutating the old one
        labels.put(moved, labels.remove(p));
        System.out.println(labels.get(new Point(6, 1)) + " " + labels.size());
    }
}
```
---
**Answer.** The refactor made `Point` a mutable class with setters, and code moved points in place while they were map keys, changing their hash so lookups went to the wrong bucket. Keep keys immutable (a record), and "move" a key by removing it and inserting a new one, as above. (Chapter 8.)

**Why.** A key's `hashCode` must not change while it is in a hash-based collection.
:::

:::drill bug
A batch job that processes 10 million records with `parallelStream()` is slower than the sequential version and makes the web endpoints of the same JVM time out. Explain.

```java run=c13-r4-parallel
import java.util.concurrent.*;
import java.util.stream.*;

public class ParallelIo {
    static int enrich(int id) {
        try { Thread.sleep(1); } catch (InterruptedException e) { throw new RuntimeException(e); }
        return id * 2;
    }

    public static void main(String[] args) throws Exception {
        try (ExecutorService io = Executors.newVirtualThreadPerTaskExecutor()) {
            var futures = IntStream.range(0, 200).mapToObj(i -> io.submit(() -> enrich(i))).toList();
            long sum = 0;
            for (var f : futures) sum += f.get();
            System.out.println("sum " + sum + " computed on virtual threads, common pool untouched");
        }
    }
}
```
---
**Answer.** Each element made a blocking call inside `parallelStream()`, which runs on the shared common `ForkJoinPool` (CPUs − 1 threads). The blocked workers made the stream slow and starved every other user of the common pool in the JVM. Run blocking work on a dedicated executor or virtual threads, as above; keep parallel streams for CPU-bound work. (Chapter 11.)

**Why.** Parallel streams help only for CPU-heavy, splittable work on large data.
:::

:::drill bug
A microbenchmark "shows" that a regex validation takes 2 ns. A colleague does not believe it. Who is right?

```java run=c13-r4-bench nondet
import java.util.regex.Pattern;

public class RegexBench {
    static final Pattern EMAIL = Pattern.compile("[^@\\s]+@[^@\\s]+\\.[a-z]+");

    public static void main(String[] args) {
        String[] inputs = {"a@b.com", "bad", "x@y.org", "no@at"};
        int matches = 0;
        for (int i = 0; i < 200_000; i++) if (EMAIL.matcher(inputs[i & 3]).matches()) matches++;   // warm-up, result used
        long t0 = System.nanoTime();
        for (int i = 0; i < 1_000_000; i++) if (EMAIL.matcher(inputs[i & 3]).matches()) matches++;
        System.out.printf("%.0f ns per match (matches=%d)%n", (System.nanoTime() - t0) / 1e6, matches);
    }
}
```
---
**Answer.** The colleague. The original loop discarded the `matches()` result after no warm-up, so the JIT could remove work and the timing measured something else. With warm-up, varied inputs and the result used, a match takes tens to hundreds of nanoseconds. Use JMH for real numbers. (Chapter 6.)

**Why.** Dead-code elimination and constant folding make naive Java benchmarks unreliable.
:::

## Round 5: coding {#ch13-round-5 .cd}

:::drill code rating=1600
Implement a thread-safe `BoundedBlockingQueue<T>` with `put`, `take` and `offer(item, timeout)`, using one `ReentrantLock` and two `Condition`s, and test it with 3 producers and 2 consumers.
---
```java run=c13-r5-queue
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.*;

public class BoundedBlockingQueue<T> {
    private final Object[] items;
    private int head, tail, count;
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition(), notEmpty = lock.newCondition();

    BoundedBlockingQueue(int capacity) { items = new Object[capacity]; }

    void put(T item) throws InterruptedException {
        lock.lockInterruptibly();
        try {
            while (count == items.length) notFull.await();
            enqueue(item);
        } finally { lock.unlock(); }
    }

    boolean offer(T item, long timeout, TimeUnit unit) throws InterruptedException {
        long nanos = unit.toNanos(timeout);
        lock.lockInterruptibly();
        try {
            while (count == items.length) {
                if (nanos <= 0) return false;
                nanos = notFull.awaitNanos(nanos);
            }
            enqueue(item);
            return true;
        } finally { lock.unlock(); }
    }

    @SuppressWarnings("unchecked")
    T take() throws InterruptedException {
        lock.lockInterruptibly();
        try {
            while (count == 0) notEmpty.await();
            T item = (T) items[head];
            items[head] = null;
            head = (head + 1) % items.length;
            count--;
            notFull.signal();
            return item;
        } finally { lock.unlock(); }
    }

    private void enqueue(T item) {
        items[tail] = item;
        tail = (tail + 1) % items.length;
        count++;
        notEmpty.signal();
    }

    public static void main(String[] args) throws Exception {
        BoundedBlockingQueue<Integer> q = new BoundedBlockingQueue<>(4);
        AtomicInteger sum = new AtomicInteger();
        try (ExecutorService pool = Executors.newFixedThreadPool(5)) {
            for (int p = 0; p < 3; p++) { int base = p * 1000; pool.submit(() -> { for (int i = 0; i < 1000; i++) q.put(base + i); return null; }); }
            for (int c = 0; c < 2; c++) pool.submit(() -> { for (int i = 0; i < 1500; i++) sum.addAndGet(q.take()); return null; });
        }
        long expected = 0;
        for (int p = 0; p < 3; p++) for (int i = 0; i < 1000; i++) expected += p * 1000 + i;
        BoundedBlockingQueue<String> full = new BoundedBlockingQueue<>(1);
        full.put("x");
        System.out.println((sum.get() == expected) + " " + full.offer("y", 50, TimeUnit.MILLISECONDS));
    }
}
```

Two conditions mean a `put` wakes only a waiting taker and a `take` only a waiting putter, so `signal()` is safe here, unlike `notify()` with a single wait set. `awaitNanos` returns the remaining time, which makes the timeout loop correct across spurious wake-ups.
:::

:::drill code rating=1500
Write a generic `TtlCache<K, V>` backed by `ConcurrentHashMap` where `get(key, loader)` loads at most once per key concurrently, entries expire after a TTL measured with an injectable clock, and expired entries are reloaded.
---
```java run=c13-r5-ttl
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.*;

public class TtlCache<K, V> {
    private record Entry<V>(V value, long expiresAt) {}
    private final ConcurrentHashMap<K, Entry<V>> map = new ConcurrentHashMap<>();
    private final long ttlNanos;
    private final LongSupplier clock;

    TtlCache(long ttl, TimeUnit unit, LongSupplier clock) { this.ttlNanos = unit.toNanos(ttl); this.clock = clock; }

    V get(K key, Function<? super K, ? extends V> loader) {
        Entry<V> e = map.compute(key, (k, old) -> {
            long now = clock.getAsLong();
            if (old != null && now < old.expiresAt()) return old;
            return new Entry<>(loader.apply(k), now + ttlNanos);
        });
        return e.value();
    }

    public static void main(String[] args) throws Exception {
        long[] now = {0};
        AtomicInteger loads = new AtomicInteger();
        TtlCache<String, String> cache = new TtlCache<>(10, TimeUnit.SECONDS, () -> now[0]);
        Function<String, String> loader = k -> { loads.incrementAndGet(); return k.toUpperCase(); };
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            for (int i = 0; i < 100; i++) pool.submit(() -> cache.get("user", loader));
        }
        System.out.println(cache.get("user", loader) + " loads=" + loads.get());
        now[0] = TimeUnit.SECONDS.toNanos(11);
        System.out.println(cache.get("user", loader) + " loads=" + loads.get());
    }
}
```

`compute` runs the remapping function atomically for the key, so concurrent callers for the same key wait instead of loading in parallel, while different keys proceed independently. The loader runs while the bin is locked, so it must be reasonably fast and must not touch the same map.
:::

:::drill code rating=1700
Implement a simple JSON-like pretty printer using sealed interfaces, records and pattern-matching `switch` for the value types `JNull`, `JBool`, `JNum`, `JStr`, `JArr` and `JObj`, with correct string escaping and indentation.
---
```java run=c13-r5-json
import java.util.*;
import java.util.stream.*;

public class Json {
    sealed interface JValue permits JNull, JBool, JNum, JStr, JArr, JObj {}
    record JNull() implements JValue {}
    record JBool(boolean value) implements JValue {}
    record JNum(double value) implements JValue {}
    record JStr(String value) implements JValue {}
    record JArr(List<JValue> items) implements JValue {}
    record JObj(LinkedHashMap<String, JValue> fields) implements JValue {}

    static String quote(String s) {
        StringBuilder sb = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                default -> { if (c < 0x20) sb.append(String.format("\\u%04x", (int) c)); else sb.append(c); }
            }
        }
        return sb.append('"').toString();
    }

    static String render(JValue v, int indent) {
        String pad = "  ".repeat(indent + 1), end = "  ".repeat(indent);
        return switch (v) {
            case JNull n -> "null";
            case JBool(boolean b) -> String.valueOf(b);
            case JNum(double d) when d == Math.rint(d) && Math.abs(d) < 1e15 -> String.valueOf((long) d);
            case JNum(double d) -> String.valueOf(d);
            case JStr(String s) -> quote(s);
            case JArr(List<JValue> items) when items.isEmpty() -> "[]";
            case JArr(List<JValue> items) -> items.stream().map(i -> pad + render(i, indent + 1)).collect(Collectors.joining(",\n", "[\n", "\n" + end + "]"));
            case JObj(LinkedHashMap<String, JValue> f) when f.isEmpty() -> "{}";
            case JObj(LinkedHashMap<String, JValue> f) -> f.entrySet().stream()
                .map(e -> pad + quote(e.getKey()) + ": " + render(e.getValue(), indent + 1))
                .collect(Collectors.joining(",\n", "{\n", "\n" + end + "}"));
        };
    }

    public static void main(String[] args) {
        LinkedHashMap<String, JValue> user = new LinkedHashMap<>();
        user.put("name", new JStr("Ada \"Countess\" Lovelace"));
        user.put("born", new JNum(1815));
        user.put("ratio", new JNum(0.5));
        user.put("languages", new JArr(List.of(new JStr("Analytical Engine"), new JNull())));
        user.put("active", new JBool(false));
        user.put("tags", new JArr(List.of()));
        System.out.println(render(new JObj(user), 0));
    }
}
```

The `switch` has no `default`: the compiler proves it covers every permitted subtype, and the guarded cases (`when`) are checked before the unguarded ones for the same record. Adding a new `JValue` type would make `render` fail to compile until it is handled.
:::
