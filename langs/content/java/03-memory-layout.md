---
title: Memory areas and object layout
part: Part A · The JVM
lede: Every `new` in Java puts an object on the heap with a hidden header in front of its fields, and the size of that header, the order of the fields and the alignment rules decide how much memory your data really takes. This chapter maps the JVM's memory areas, measures real object sizes in HotSpot, explains the mark word, the compressed class pointer and compressed oops, shows how fast allocation is with TLABs, and covers boxing and the caches behind `Integer.valueOf`.
desc: Heap, stacks, metaspace, code cache; mark word, compressed oops, field layout; TLABs; boxing caches
hours: 3.5
prereqs: Chapters 1–2
---

## The JVM's memory areas {#ch03-areas .th}

| Area | Per | Holds | When it runs out |
|---|---|---|---|
| **Heap** | JVM | Every object and array; managed by the garbage collector | `OutOfMemoryError: Java heap space` |
| **Java stacks** | Thread | Frames: local variables (primitives and references) and operand stacks | `StackOverflowError` |
| **Metaspace** | JVM (native memory) | Class metadata: methods, bytecode, constant pools; replaced PermGen in Java 8 | `OutOfMemoryError: Metaspace` |
| **Code cache** | JVM (native) | Machine code produced by the JIT | JIT stops compiling, with a warning |
| **Direct / native memory** | JVM | `ByteBuffer.allocateDirect`, thread stacks, GC data structures | `OutOfMemoryError: Direct buffer memory` / `unable to create native thread` |

A local variable of a reference type lives in a frame on the thread's stack, but the object it points to always lives on the heap (unless the JIT proves it never escapes, Chapter 6). The heap size is set with `-Xms` (initial) and `-Xmx` (maximum); by default HotSpot uses a quarter of physical memory as the maximum.

```java run=c03-areas nondet
import java.lang.management.*;

public class Areas {
    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        System.out.printf("max heap %d MB, processors %d%n", rt.maxMemory() >> 20, rt.availableProcessors());
        for (MemoryPoolMXBean pool : ManagementFactory.getMemoryPoolMXBeans()) {
            if (pool.getUsage() != null)
                System.out.printf("%-6s %-30s used %6d KB%n", pool.getType() == MemoryType.HEAP ? "heap" : "native", pool.getName(), pool.getUsage().getUsed() >> 10);
        }
    }
}
```

The heap pools are G1's eden, survivor and old regions (Chapter 5). Metaspace, the class space and the code-cache segments are native memory outside the heap. The exact numbers depend on the machine.

## What an object looks like {#ch03-layout .th}

In 64-bit HotSpot every object starts with a **header**:

- the **mark word** (8 bytes): the identity hash code once computed, the GC age, and lock state bits (Chapter 10);
- the **klass pointer** (4 bytes with compressed class pointers, the default): a pointer to the class's metadata in metaspace;
- for arrays, a 4-byte **length**.

Then come the fields, and the object's total size is rounded up to a multiple of **8 bytes**. HotSpot does not keep fields in declaration order: it places larger fields first (`long`/`double`, then `int`/`float`, then `short`/`char`, then `byte`/`boolean`, with references packed where they fit) and uses any gap left after the 12-byte header for a smaller field. You can see the real offsets with `sun.misc.Unsafe`:

```java run=c03-offsets
import java.lang.reflect.Field;

public class Offsets {
    static class Point { int x; int y; }
    static class Mixed { byte b; long l; int i; Object o; boolean z; }
    static class Child extends Point { int z; }

    public static void main(String[] args) throws Exception {
        Field f = sun.misc.Unsafe.class.getDeclaredField("theUnsafe");
        f.setAccessible(true);
        sun.misc.Unsafe unsafe = (sun.misc.Unsafe) f.get(null);
        for (Class<?> c : new Class<?>[] {Point.class, Mixed.class, Child.class}) {
            StringBuilder sb = new StringBuilder(c.getSimpleName() + ":");
            for (Class<?> k = c; k != Object.class; k = k.getSuperclass())
                for (Field fl : k.getDeclaredFields())
                    sb.append(" ").append(fl.getName()).append("@").append(unsafe.objectFieldOffset(fl));
            System.out.println(sb);
        }
        System.out.println("int[] data starts at " + unsafe.arrayBaseOffset(int[].class) + ", Object[] slot size " + unsafe.arrayIndexScale(Object[].class));
    }
}
```

`Point.x` sits right after the 12-byte header, at offset 12. In `Mixed`, the `long` goes to the first 8-byte-aligned offset (16), the `int` fills the gap at 12, the `byte` and `boolean` share bytes 24 and 25, and the reference takes 28–31. A subclass's fields come after all of its superclass's fields. Array elements start at offset 16 and each reference slot is 4 bytes, because references are compressed.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 150" role="img" aria-label="Layout of Mixed: mark word 0-7, klass pointer 8-11, int at 12, long at 16, byte at 24, boolean at 25, padding, reference at 28">
  <text x="20" y="22" class="t-small">class Mixed { byte b; long l; int i; Object o; boolean z; } — 32 bytes</text>
  <rect x="20" y="40" width="160" height="44" class="d-soft"/><text x="100" y="67" text-anchor="middle" class="t-mono">mark word 0–7</text>
  <rect x="180" y="40" width="80" height="44" class="d-soft"/><text x="220" y="67" text-anchor="middle" class="t-mono">klass 8</text>
  <rect x="260" y="40" width="80" height="44" class="d-acc"/><text x="300" y="67" text-anchor="middle" class="t-mono">i @12</text>
  <rect x="340" y="40" width="160" height="44" class="d-key"/><text x="420" y="67" text-anchor="middle" class="t-mono">l @16</text>
  <rect x="500" y="40" width="20" height="44" class="d-rs"/><rect x="520" y="40" width="20" height="44" class="d-rs"/>
  <rect x="540" y="40" width="40" height="44" class="d-box"/>
  <rect x="580" y="40" width="80" height="44" class="d-acc"/><text x="620" y="67" text-anchor="middle" class="t-mono">o @28</text>
  <text x="510" y="102" text-anchor="middle" class="t-small">b z</text><text x="560" y="102" text-anchor="middle" class="t-small">pad</text>
  <text x="20" y="130" class="t-small">Each column is 4 bytes wide (one compressed reference or int). Declaration order would have wasted 8 bytes in gaps.</text>
</svg></div><figcaption><b>Field packing.</b> HotSpot sorts fields by size and fills the gap after the 12-byte header.</figcaption></figure>

### Measuring real sizes

HotSpot counts every byte each thread allocates, which gives exact object sizes:

```java run=c03-sizes
import java.lang.management.ManagementFactory;

public class Sizes {
    static final com.sun.management.ThreadMXBean MX =
        (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean();
    static final Object[] keep = new Object[100_000];
    interface Maker { Object make(int i); }

    static long bytesPer(Maker m) {
        for (int i = 0; i < keep.length; i++) keep[i] = m.make(i);       // warm up
        long before = MX.getCurrentThreadAllocatedBytes();
        for (int i = 0; i < keep.length; i++) keep[i] = m.make(i);
        return (MX.getCurrentThreadAllocatedBytes() - before) / keep.length;
    }

    record Pair(int a, int b) {}
    static class OneLong { long v; }
    static class OneBool { boolean v; }

    public static void main(String[] args) {
        System.out.println("new Object()      " + bytesPer(i -> new Object()));
        System.out.println("Integer (1000+)   " + bytesPer(i -> Integer.valueOf(1000 + i)));
        System.out.println("record Pair(int,int) " + bytesPer(i -> new Pair(i, i)));
        System.out.println("one long field    " + bytesPer(i -> new OneLong()));
        System.out.println("one boolean field " + bytesPer(i -> new OneBool()));
        System.out.println("int[0] " + bytesPer(i -> new int[0]) + ", int[3] " + bytesPer(i -> new int[3]) + ", int[10] " + bytesPer(i -> new int[10]));
        System.out.println("long[1] " + bytesPer(i -> new long[1]) + ", Object[4] " + bytesPer(i -> new Object[4]));
    }
}
```

An empty `Object` is 16 bytes (12 of header, 4 of padding). One `int` or `boolean` fits in the padding, so `Integer` and `OneBool` are also 16. A `long` needs 8-byte alignment, which pushes the object to 24. An `int[3]` is 16 bytes of header and length plus 12 bytes of data, rounded up to 32.

:::key
A `List<Integer>` of a million values costs about 16 bytes per `Integer` plus 4 per reference in the backing array, roughly 20 MB, while an `int[]` of a million values costs 4 MB. Boxed collections are the most common reason Java programs use more memory than expected.
:::

### Compressed oops

A reference is 8 bytes on a 64-bit machine in principle. HotSpot instead stores **compressed ordinary object pointers**: 32-bit values that are shifted left by 3 (multiplied by the 8-byte alignment) and added to the heap base when used. 2<sup>32</sup> × 8 bytes = 32 GB, so compressed oops work for heaps up to about 32 GB, which is why heaps of 32–40 GB are a known bad size: crossing the limit makes every reference twice as big and can leave *less* usable space than a 31 GB heap.

The header is also shrinking: **compact object headers**, which merge the mark word and klass pointer into 8 bytes, were added as an experimental option in JDK 24 (JEP 450) and became a product option in JDK 25 (JEP 519). With them an empty `Object` is 8 bytes.

## Allocation is cheap: TLABs {#ch03-tlab .th}

Most allocations do not lock anything. Each thread gets a **thread-local allocation buffer** (TLAB), a chunk of the young generation that only it allocates from. Allocating an object is a **pointer bump**: check that `top + size <= end`, return `top`, advance `top`. Only when the TLAB is full does the thread take a new one from the shared heap, and only objects too big for a TLAB are allocated directly in shared space.

```java run=c03-tlab nondet
public class Tlab {
    record Point(double x, double y) {}

    public static void main(String[] args) {
        Point[] ring = new Point[1024];          // objects escape, but die young
        int n = 20_000_000;
        for (int round = 0; round < 3; round++) {
            long t0 = System.nanoTime();
            for (int i = 0; i < n; i++) ring[i & 1023] = new Point(i, i);
            long ns = System.nanoTime() - t0;
            System.out.printf("round %d: %.1f ns per allocation%n", round, (double) ns / n);
        }
    }
}
```

Each allocation here costs a few tens of nanoseconds at most, and that includes converting two ints to doubles, writing the fields, storing into the array and the young collections that reclaim the 20 million dead objects. The ring buffer matters: if the demo kept all its objects alive, the time would be dominated by the collector copying survivors, not by allocation. That is the real lesson behind "avoid creating objects": short-lived objects are cheap, and what costs is keeping objects alive (Chapter 5).

## Primitives, boxing and the caches {#ch03-boxing .th}

Generics, collections and `Object` parameters need references, so Java **autoboxes** primitives: `list.add(5)` compiles to `list.add(Integer.valueOf(5))`, and `int x = list.get(0)` to `list.get(0).intValue()`. `Integer.valueOf` returns cached instances for values from −128 to 127 (the upper bound can be raised with `-XX:AutoBoxCacheMax`), and allocates a new object outside that range:

```java run=c03-boxing cmd="javac -d . Boxing.java && java -cp . Boxing && javap -c -p Boxing | grep -E 'valueOf|intValue'"
import java.util.*;

public class Boxing {
    public static void main(String[] args) {
        Integer a = 127, b = 127, c = 128, d = 128;
        System.out.println((a == b) + " " + (c == d) + " " + c.equals(d) + " " + (c.intValue() == d));
        Long l1 = 127L, l2 = 127L;
        Character ch1 = 'z', ch2 = 'z';
        Double d1 = 1.0, d2 = 1.0;
        System.out.println((l1 == l2) + " " + (ch1 == ch2) + " " + (d1 == d2));
        List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
        int first = list.get(0);
        list.remove(Integer.valueOf(1));
        list.remove(0);
        System.out.println(first + " " + list);
    }
}
```

The `javap` lines confirm that boxing and unboxing are ordinary method calls inserted by the compiler. `Byte`, `Short`, `Integer` and `Long` cache −128..127, `Character` caches 0..127, `Boolean` has two instances, and `Float` and `Double` cache nothing.

The last lines show a famous overload trap: `list.remove(Integer.valueOf(1))` removes the *element* 1, while `list.remove(0)` removes the element at *index* 0, because `remove(int)` is chosen over `remove(Object)` without boxing.

:::trap
Comparing boxed numbers with `==` works in tests that use small values and fails in production with larger ones. Use `equals`, or unbox first. Also beware of `null`: unboxing a `null` `Integer` throws `NullPointerException`, for example `int total = map.get("missing");`.
:::

## Concept and tricky questions {#ch03-concept .dr}

:::drill concept
Which JVM memory areas are shared between threads and which are per thread?
---
**Answer.** Shared: the heap (all objects), metaspace (class metadata) and the code cache. Per thread: the Java stack of frames (locals and operand stacks), the program counter and the native stack.

**Why.** Locals are thread-confined, so they never need synchronisation; anything reachable from the heap may be seen by other threads.
:::

:::drill concept
What is in a HotSpot object header, and how big is it on a 64-bit JVM with default settings?
---
**Answer.** An 8-byte mark word (identity hash, GC age, lock bits) and a 4-byte compressed klass pointer: 12 bytes. Arrays add a 4-byte length, making 16. Objects are padded to multiples of 8 bytes, so `new Object()` takes 16 bytes.

**Why.** Compact object headers (JDK 24 experimental, JDK 25 product) reduce the header to 8 bytes.
:::

:::drill tricky
Why can a 36 GB heap hold fewer objects than a 31 GB heap?
---
**Answer.** Up to about 32 GB, HotSpot uses compressed oops (32-bit references scaled by 8). Above that it must use full 64-bit references, so every reference field and array slot doubles in size, which can use up more than the extra 4 GB.

**Why.** This is why large-heap guidance says "stay below 32 GB or go well above it".
:::

:::drill concept
Why is allocation in Java usually so fast?
---
**Answer.** Each thread allocates from its own thread-local allocation buffer by bumping a pointer, with no locking; the memory is already zeroed, and young-generation collection makes reclaiming short-lived objects cheap.

**Why.** The cost of objects is mostly in how long they survive, not in creating them.
:::

:::drill tricky
`Integer a = 1000, b = 1000; a == b` is `false`, but `Integer a = 100, b = 100; a == b` is `true`. Explain.
---
**Answer.** Autoboxing calls `Integer.valueOf`, which returns cached objects for −128..127 and new objects outside that range. `==` compares references, so it is true only when both sides are the same cached object.

**Why.** The cache is required by the JLS for −128..127; its upper bound can be raised with `-XX:AutoBoxCacheMax`, which makes the "same" code behave differently on different JVM settings.
:::

:::drill concept
Does HotSpot store fields in declaration order?
---
**Answer.** No. It groups fields by size (8-byte, then 4-byte, 2-byte and 1-byte fields, with references packed in), places superclass fields before subclass fields, and fills the gap after the 12-byte header with a small field if one fits.

**Why.** The JVM specification leaves layout to the implementation. Reordering minimises padding.
:::

:::drill concept
Name four different `OutOfMemoryError` messages and what each means.
---
**Answer.** `Java heap space`: the heap is full of live objects. `GC overhead limit exceeded`: the JVM spends almost all its time in GC recovering almost nothing (Parallel GC). `Metaspace`: too much class metadata, often a class-loader leak. `unable to create native thread`: the OS refused another thread (limits or memory). `Direct buffer memory`: too much off-heap `ByteBuffer` memory.

**Why.** Each needs a different fix; increasing `-Xmx` only helps the first.
:::

## Predict the output and find the bug {#ch03-reading .dr}

:::drill output
What does this print?

```java run=c03-d-equals
public class EqualsMix {
    public static void main(String[] args) {
        Long a = 127L;
        Integer b = 127;
        System.out.println(a.equals(127) + " " + a.equals(127L) + " " + (a == 127) + " " + b.equals(127));
        Object o = 42;
        System.out.println(o.getClass().getSimpleName() + " " + o.equals(42L));
    }
}
```
---
**Answer.** `false true true true`, then `Integer false`. `a.equals(127)` boxes 127 to an `Integer`, and `Long.equals` returns false for anything that is not a `Long`. `a == 127` unboxes `a` and compares numbers. `42` boxes to `Integer`, which is not equal to a `Long`.

**Why.** `equals` on wrapper types checks the exact type. This bites with `Map<Long, …>.get(someInt)`, which always misses.
:::

:::drill output
What does this print?

```java run=c03-d-remove
import java.util.*;

public class Remove {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(10, 20, 30, 1));
        list.remove(1);
        System.out.println(list);
        list.remove((Integer) 1);
        System.out.println(list);
        Set<Short> set = new HashSet<>();
        for (short i = 0; i < 5; i++) {
            set.add(i);
            set.remove(i - 1);
        }
        System.out.println(set.size());
    }
}
```
---
**Answer.** `[10, 30, 1]`, `[10, 30]`, then `5`. `remove(1)` removes index 1 (the 20). The cast forces `remove(Object)`. In the set loop, `i - 1` is an `int`, boxed to `Integer`, which never equals a `Short`, so nothing is ever removed.

**Why.** The set example is a classic puzzle (from *Java Puzzlers*): arithmetic promotes `short` to `int`, and boxing preserves the promoted type.
:::

:::drill output
What does this print?

```java run=c03-d-npe
import java.util.*;

public class Unbox {
    public static void main(String[] args) {
        Map<String, Integer> stock = new HashMap<>(Map.of("apple", 3));
        int apples = stock.get("apple");
        System.out.println(apples + " " + stock.getOrDefault("pear", 0));
        try {
            int pears = stock.get("pear");
        } catch (NullPointerException e) {
            System.out.println("NPE: " + e.getMessage());
        }
    }
}
```
---
**Answer.** `3 0`, then an NPE whose helpful message (Java 14+, JEP 358) says that the return value of `Map.get` is null and `intValue()` cannot be invoked on it.

**Why.** Assigning to an `int` inserts `.intValue()`. Use `getOrDefault`, or keep the result as `Integer` and check it.
:::

:::drill bug
A service keeps 10 million readings in a `List<Double>` and runs out of memory with a 1 GB heap. Estimate the cost and fix it.

```java run=c03-d-bug-boxed
import java.lang.management.ManagementFactory;
import java.util.*;

public class Readings {
    static long allocated() {
        return ((com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean()).getCurrentThreadAllocatedBytes();
    }

    public static void main(String[] args) {
        int n = 1_000_000;
        long t0 = allocated();
        List<Double> boxed = new ArrayList<>(n);
        for (int i = 0; i < n; i++) boxed.add(i * 0.5);
        long boxedBytes = allocated() - t0;
        t0 = allocated();
        double[] primitive = new double[n];
        for (int i = 0; i < n; i++) primitive[i] = i * 0.5;
        long primitiveBytes = allocated() - t0;
        System.out.printf("List<Double>: %d bytes/value, double[]: %d bytes/value%n", boxedBytes / n, primitiveBytes / n);
    }
}
```
---
**Answer.** Each `Double` is a 24-byte object (12-byte header + 8-byte value = 20, rounded up to 24) plus a 4-byte reference in the list's array: about 28 bytes per reading, so 10 million readings need about 280 MB before any growth slack. A `double[]` needs 8 bytes per value. Use primitive arrays or a primitive collection library.

**Why.** The measured numbers above make the 3–4× difference concrete.
:::

:::drill bug
A cache keyed by `Long` user ids never finds anything. Find the bug.

```java run=c03-d-bug-key
import java.util.*;

public class CacheKey {
    static Map<Long, String> names = new HashMap<>();

    static String lookup(int userId) {
        return names.get((long) userId);
    }

    public static void main(String[] args) {
        names.put(42L, "Ada");
        int id = 42;
        System.out.println(names.get(id) + " " + lookup(id));
    }
}
```
---
**Answer.** `names.get(id)` boxes the `int` to an `Integer`, and `Integer.equals(Long)` is always false (and their hash codes happen to be equal, so it even finds the right bucket). `Map.get` takes `Object`, so the compiler cannot catch it. Convert to `long` first, as `lookup` does.

**Why.** Generic `Map.get(Object)` and `Collection.contains(Object)` accept any type; IDE inspections flag "suspicious collection calls" for this reason.
:::

## Write the code {#ch03-coding .cd}

:::drill code rating=1400
Write `shallowSize(Class<?>)` that computes a HotSpot object's size from its declared fields using `Unsafe.objectFieldOffset` (largest offset plus that field's size, rounded up to 8), and compare it with the allocation-counter measurement for three classes.
---
```java run=c03-c-shallow
import java.lang.management.ManagementFactory;
import java.lang.reflect.*;

public class Shallow {
    static sun.misc.Unsafe U;
    static {
        try {
            Field f = sun.misc.Unsafe.class.getDeclaredField("theUnsafe");
            f.setAccessible(true);
            U = (sun.misc.Unsafe) f.get(null);
        } catch (ReflectiveOperationException e) { throw new ExceptionInInitializerError(e); }
    }

    static int sizeOf(Class<?> t) {
        if (t == long.class || t == double.class) return 8;
        if (t == int.class || t == float.class) return 4;
        if (t == short.class || t == char.class) return 2;
        if (t == byte.class || t == boolean.class) return 1;
        return U.arrayIndexScale(Object[].class);       // reference size: 4 with compressed oops
    }

    static long shallowSize(Class<?> c) {
        long end = 12;                                   // header with compressed class pointers
        for (Class<?> k = c; k != null; k = k.getSuperclass())
            for (Field f : k.getDeclaredFields())
                if (!Modifier.isStatic(f.getModifiers()))
                    end = Math.max(end, U.objectFieldOffset(f) + sizeOf(f.getType()));
        return (end + 7) / 8 * 8;
    }

    static long measured(java.util.function.Supplier<Object> make) {
        var mx = (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean();
        Object[] keep = new Object[10_000];
        for (int i = 0; i < keep.length; i++) keep[i] = make.get();
        long before = mx.getCurrentThreadAllocatedBytes();
        for (int i = 0; i < keep.length; i++) keep[i] = make.get();
        return (mx.getCurrentThreadAllocatedBytes() - before) / keep.length;
    }

    static class A { byte b; }
    static class B { long l; int i; }
    static class C extends B { Object ref; short s; }

    public static void main(String[] args) throws Exception {
        System.out.println("A: computed " + shallowSize(A.class) + ", measured " + measured(A::new));
        System.out.println("B: computed " + shallowSize(B.class) + ", measured " + measured(B::new));
        System.out.println("C: computed " + shallowSize(C.class) + ", measured " + measured(C::new));
    }
}
```

The measurement uses constructor references rather than `Constructor.newInstance`, because reflective construction allocates a little extra on every call (an argument array and bookkeeping), which would inflate the count. Libraries such as JOL (Java Object Layout) print the same information, including padding.
:::

:::drill code rating=1300
Write `IntList`, a growable list of primitive `int`s (`add`, `get`, `size`, `sum`) backed by an `int[]` that doubles in capacity, and measure its bytes per element against `ArrayList<Integer>` for one million values above the cache range.
---
```java run=c03-c-intlist
import java.lang.management.ManagementFactory;
import java.util.*;

public class IntListDemo {
    static final class IntList {
        private int[] data = new int[8];
        private int size;
        void add(int v) {
            if (size == data.length) data = Arrays.copyOf(data, size * 2);
            data[size++] = v;
        }
        int get(int i) {
            Objects.checkIndex(i, size);
            return data[i];
        }
        int size() { return size; }
        long sum() { long s = 0; for (int i = 0; i < size; i++) s += data[i]; return s; }
    }

    static long allocated() {
        return ((com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean()).getCurrentThreadAllocatedBytes();
    }

    public static void main(String[] args) {
        int n = 1_000_000;
        long t0 = allocated();
        IntList ints = new IntList();
        for (int i = 0; i < n; i++) ints.add(i + 1000);
        long a = allocated() - t0;
        t0 = allocated();
        List<Integer> boxed = new ArrayList<>();
        for (int i = 0; i < n; i++) boxed.add(i + 1000);
        long b = allocated() - t0;
        System.out.println(ints.sum() == boxed.stream().mapToLong(Integer::longValue).sum());
        System.out.printf("IntList %.1f bytes/value (including growth copies), ArrayList<Integer> %.1f%n", (double) a / n, (double) b / n);
    }
}
```

The allocation totals include every discarded array from resizing, so both are higher than the final footprint, but the boxed list still allocates several times more, and every `Integer` is a separate object the GC has to trace.
:::

:::drill code rating=1200
Write a program that shows the `Integer` cache boundary and how `-XX:AutoBoxCacheMax` changes it: print `Integer.valueOf(n) == Integer.valueOf(n)` for n in {127, 128, 1000}, run once normally and once with `-XX:AutoBoxCacheMax=1000`.
---
```java run=c03-c-cachemax cmd="javac -d . CacheMax.java && java -cp . CacheMax && java -XX:AutoBoxCacheMax=1000 -cp . CacheMax"
public class CacheMax {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        for (int n : new int[] {127, 128, 1000, 1001})
            sb.append(n).append("=").append(Integer.valueOf(n) == Integer.valueOf(n)).append(" ");
        System.out.println(sb.toString().trim());
    }
}
```

The same program gives different `==` results depending on a JVM flag, which is the strongest argument for never comparing boxed values with `==`. Only `Integer` honours this flag; `Long` and the others always cache −128..127.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- Areas: heap (objects, GC), per-thread Java stacks (frames), metaspace (class metadata, native), code cache (JIT code), direct/native memory.
- 64-bit HotSpot header: 8-byte mark word + 4-byte compressed klass = 12 bytes; arrays + 4-byte length; objects padded to 8. `new Object()` = 16 bytes, `Integer` = 16, one-`long` object = 24, `int[3]` = 32.
- Fields are reordered by size; superclass fields come first; the gap after the header is reused.
- Compressed oops: 32-bit references × 8 → heaps up to ~32 GB. Compact headers (JDK 24/25) cut the header to 8 bytes.
- TLAB allocation is a pointer bump; short-lived objects are cheap, long-lived ones cost GC work.
- Autoboxing = `valueOf` / `xxxValue` calls. Caches: −128..127 for Byte/Short/Integer/Long, 0..127 for Character; `-XX:AutoBoxCacheMax` raises Integer's.
- Never compare wrappers with `==`; `Long.equals(Integer)` is false; unboxing `null` throws NPE; `list.remove(int)` vs `remove(Object)`.
- Boxed collections cost ~20–28 bytes per value vs 4–8 for primitive arrays.
