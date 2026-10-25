---
title: The JIT compiler
part: Part B · Runtime
lede: HotSpot starts every method in an interpreter, watches how it behaves, and compiles the hot ones to machine code twice: quickly with C1, then aggressively with C2 using the profile it gathered. The second compiler makes speculative assumptions, such as "this call always reaches the same class", and throws the code away when an assumption breaks. This chapter covers tiered compilation, inlining, escape analysis, deoptimisation and why naive benchmarks of Java code lie.
desc: Interpreter → C1 → C2 tiers, profiling, inlining, escape analysis, deopt, warm-up, benchmarking traps
hours: 3.5
prereqs: Chapters 1 and 3
---

## Tiered compilation {#ch06-tiers .th}

HotSpot has an interpreter and two JIT compilers, and by default (`-XX:+TieredCompilation`) a method moves through **tiers**:

| Tier | Runs | Purpose |
|---|---|---|
| 0 | Interpreter | Starts immediately; counts invocations and loop back-edges |
| 1 | C1, no profiling | Trivial methods (getters) that C2 would not improve |
| 2 | C1, light profiling | Used when C2's queue is long |
| 3 | C1 with full profiling | Fast machine code that also records types, branch frequencies and call targets |
| 4 | C2 | Optimised code built from the tier-3 profile |

A method is queued for tier 3 after about 200 invocations (`Tier3InvocationThreshold`) or a long-running loop, and for tier 4 after about 5,000 (`Tier4InvocationThreshold`), with adjustments for loops and compiler load. Compilation happens on background compiler threads, so the method keeps running at its old tier until the new code is installed.

```java run=c06-printcompilation nondet cmd="javac -d . Hot.java && java -XX:+PrintCompilation -cp . Hot | grep -E 'Hot::square|done' | head -6"
public class Hot {
    static long square(long x) {
        return x * x;
    }

    public static void main(String[] args) {
        long sum = 0;
        for (int i = 0; i < 2_000_000; i++) sum += square(i);
        System.out.println("done " + (sum != 0));
    }
}
```

Each `PrintCompilation` line shows a timestamp in milliseconds, a compilation id, flags (`%` marks on-stack replacement, `s` synchronized, `n` native), the **tier**, and the method. `square` appears at tier 3 and then tier 4, and the tier-3 version is later "made not entrant" because the C2 version replaced it.

### On-stack replacement

A `main` method with one long loop is invoked only once, so invocation counters would never compile it. The back-edge counter catches it instead, and the JVM compiles the loop and **replaces the running interpreter frame** with a compiled one in the middle of the loop: **on-stack replacement (OSR)**, shown with `%` in `PrintCompilation`.

## Warm-up {#ch06-warmup .th}

The cost of tiering is warm-up: the first calls run slowly in the interpreter, then faster in C1 code, and only reach full speed after C2 has compiled them.

```java run=c06-warmup nondet
public class Warmup {
    static int collatzSteps(long n) {
        int steps = 0;
        while (n != 1) { n = (n & 1) == 0 ? n >> 1 : 3 * n + 1; steps++; }
        return steps;
    }

    public static void main(String[] args) {
        for (int batch = 0; batch < 8; batch++) {
            long t0 = System.nanoTime();
            long total = 0;
            for (long n = 1; n <= 500; n++) total += collatzSteps(n);     // the same work every batch
            System.out.printf("batch %d: %6.1f µs (total %d)%n", batch, (System.nanoTime() - t0) / 1e3, total);
        }
    }
}
```

Every batch does exactly the same work, yet the first is several times slower than the rest: it runs in the interpreter and then in C1 code while C2 is still compiling. Services feel this as slow first requests after a deploy; mitigations include warm-up traffic before joining a load balancer, and in newer JDKs class-data sharing and ahead-of-time profiling (Project Leyden, JEP 483 in JDK 24 and later).

## Inlining and speculation {#ch06-inlining .th}

**Inlining** copies a called method's body into the caller. It removes call overhead, but more importantly it lets the optimiser see across the call boundary and then eliminate redundant checks, propagate constants and analyse allocations. C2 inlines methods smaller than 35 bytes of bytecode always (`MaxInlineSize`) and hot methods up to 325 bytes (`FreqInlineSize`), up to a depth limit.

Virtual and interface calls are inlined **speculatively** using the receiver types recorded in the profile:

- **Monomorphic** call site (one class seen): inline that class's method behind a cheap type check.
- **Bimorphic** (two classes): inline both behind a type switch.
- **Megamorphic** (three or more): fall back to a real virtual call through the vtable or itable; no inlining.

```java run=c06-morphism nondet
public class Morphism {
    interface Shape { double area(); }
    record Square(double s) implements Shape { public double area() { return s * s; } }
    record Circle(double r) implements Shape { public double area() { return 3.14159 * r * r; } }
    record Tri(double b, double h) implements Shape { public double area() { return 0.5 * b * h; } }
    record Rect(double w, double h) implements Shape { public double area() { return w * h; } }

    static double total(Shape[] shapes) {
        double t = 0;
        for (Shape s : shapes) t += s.area();
        return t;
    }

    static double time(Shape[] shapes) {
        for (int i = 0; i < 200; i++) total(shapes);
        long t0 = System.nanoTime();
        double r = 0;
        for (int i = 0; i < 200; i++) r += total(shapes);
        return (System.nanoTime() - t0) / 1e6 + (r < 0 ? 1 : 0);
    }

    public static void main(String[] args) {
        int n = 100_000;
        Shape[] mono = new Shape[n], mega = new Shape[n];
        for (int i = 0; i < n; i++) {
            mono[i] = new Square(i);
            mega[i] = switch (i % 4) { case 0 -> new Square(i); case 1 -> new Circle(i); case 2 -> new Tri(i, i); default -> new Rect(i, i); };
        }
        System.out.printf("monomorphic %.1f ms, megamorphic %.1f ms%n", time(mono), time(mega));
    }
}
```

The two arrays must be measured in **separate JVM runs** to compare fairly, because the `total` call site keeps the profile it saw first; even so, the megamorphic version is clearly slower here. This is the performance argument against deep hierarchies in hot paths, and the reason the JIT works so well with ordinary, mostly monomorphic Java code.

## Escape analysis {#ch06-escape .th}

After inlining, C2 checks whether each allocated object **escapes**: is it stored in a field or array, returned, or passed to code it cannot see? If not, C2 can apply **scalar replacement**: it never allocates the object and keeps its fields in registers. It can also remove locks on objects that do not escape (**lock elision**).

```java run=c06-escape cmd="javac -d . Escape.java && echo -n 'default: ' && java -cp . Escape && echo -n 'no escape analysis: ' && java -XX:-DoEscapeAnalysis -cp . Escape && echo -n 'interpreter only: ' && java -Xint -cp . Escape"
import java.lang.management.ManagementFactory;

public class Escape {
    record Vec(double x, double y) {
        Vec plus(Vec o) { return new Vec(x + o.x, y + o.y); }
        double len2() { return x * x + y * y; }
    }

    static double work(int n) {
        double s = 0;
        for (int i = 0; i < n; i++) {
            Vec v = new Vec(i, 1).plus(new Vec(1, i));   // three Vec objects per iteration
            s += v.len2();
        }
        return s;
    }

    public static void main(String[] args) {
        var mx = (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean();
        for (int i = 0; i < 20; i++) work(100_000);       // let C2 compile work()
        long before = mx.getCurrentThreadAllocatedBytes();
        double r = work(1_000_000);
        System.out.println((mx.getCurrentThreadAllocatedBytes() - before) / 1_000_000 + " bytes per iteration");
    }
}
```

Each iteration creates three 32-byte `Vec` objects, 96 bytes. After C2 compiles `work` with escape analysis, it allocates nothing at all: the records exist only in the source code. Turn the analysis off, or stay in the interpreter, and the allocations come back.

:::key
Small, short-lived value objects (iterators, coordinates, `Optional`s in a chain) are often free in hot JIT-compiled code, as long as they do not escape. They are not free in the interpreter, in C1 code, or when you store them somewhere.
:::

## Deoptimisation {#ch06-deopt .th}

C2's speculation can be wrong. A branch that never ran gets compiled as an "uncommon trap"; a call site compiled as monomorphic sees a new class; a class is loaded that overrides a method C2 assumed had one implementation (class hierarchy analysis). When a guard fails, the JVM **deoptimises**: it converts the compiled frame back into an interpreter frame, continues in the interpreter, marks the compiled code "not entrant", and later recompiles with the new information.

```java run=c06-deopt nondet cmd="javac -d . Deopt.java && java -XX:+PrintCompilation -cp . Deopt | grep -E 'Deopt::(describe|run)|phase' | head -12"
public class Deopt {
    interface Animal { String sound(); }
    static final class Dog implements Animal { public String sound() { return "woof"; } }
    static final class Cat implements Animal { public String sound() { return "meow"; } }

    static int describe(Animal a) { return a.sound().length(); }

    static long run(Animal a, int n) {
        long s = 0;
        for (int i = 0; i < n; i++) s += describe(a);
        return s;
    }

    public static void main(String[] args) {
        System.out.println("phase 1: dogs only " + run(new Dog(), 3_000_000));
        System.out.println("phase 2: a cat appears " + run(new Cat(), 3_000_000));
    }
}
```

In phase 1, C2 compiles `describe` assuming every `Animal` is a `Dog`. When a `Cat` arrives, the type guard fails, the compiled code is marked "made not entrant" and the method is compiled again with both types. A program whose behaviour changes after start-up can go through several such cycles.

## Benchmarking traps {#ch06-benchmarking .th}

Because of tiering, speculation and dead-code elimination, a hand-written timing loop often measures the wrong thing:

- **No warm-up**: you time the interpreter and the compilers instead of the steady state.
- **Dead-code elimination**: if the result is never used, C2 may delete the work being measured.
- **Constant folding**: inputs known at compile time are computed once, not per iteration.
- **Profile pollution**: running several variants in one JVM makes later ones see the earlier ones' profiles.
- **GC noise and OSR**: one long `main` loop is compiled by OSR, which often produces worse code than a normal compilation.

The "find the bug" drill below shows dead-code elimination in action: a `Math.sqrt` loop whose result is unused runs in a small fraction of a nanosecond per iteration. The standard tool is **JMH** (Java Microbenchmark Harness), which forks fresh JVMs, runs warm-up iterations, consumes results through a `Blackhole`, and reports statistics.

## Concept and tricky questions {#ch06-concept .dr}

:::drill concept
Describe HotSpot's tiered compilation and why it uses two compilers.
---
**Answer.** Methods start in the interpreter (tier 0), are compiled by C1 with profiling (tier 3) once warm, and by C2 (tier 4) once hot, using the profile. C1 compiles quickly so code gets fast soon; C2 compiles slowly but produces much faster code, guided by the observed types and branches.

**Why.** It balances start-up time and peak performance. `-XX:TieredStopAtLevel=1` trades peak speed for quick start-up in short-lived tools.
:::

:::drill concept
What is on-stack replacement and when is it needed?
---
**Answer.** Compiling a method while it is running inside a long loop and switching the active interpreter frame to compiled code mid-loop. It is needed for methods invoked rarely but containing hot loops, such as `main`.

**Why.** Without OSR a long-running loop in a method called once would stay interpreted forever.
:::

:::drill concept
What do monomorphic, bimorphic and megamorphic mean for a call site, and why does it matter?
---
**Answer.** The number of receiver classes the profile has seen at that call: one, two, or more. C2 inlines monomorphic and bimorphic calls behind type checks; megamorphic sites are compiled as real virtual or interface calls with no inlining, which also blocks the optimisations inlining enables.

**Why.** `TypeProfileWidth` (2 by default) is how many receiver types the profile records per site.
:::

:::drill concept
What is escape analysis and what can the JIT do when an object does not escape?
---
**Answer.** An analysis, after inlining, of whether an object can be seen outside the compiled region (stored to the heap, returned, passed to non-inlined code). If it cannot, C2 replaces the object by its fields in registers (scalar replacement, so no allocation), and removes synchronisation on it (lock elision).

**Why.** It is why small temporary objects often cost nothing in hot code, measurable with the allocation counter.
:::

:::drill tricky
Why can a well-warmed service suddenly get slower when a new feature flag is turned on, even if the new code path is cheap?
---
**Answer.** The new path can invalidate C2's speculation: a branch compiled as "never taken" (an uncommon trap) is now taken, or a new class reaches a monomorphic call site. The JVM deoptimises, runs the affected methods in the interpreter, and recompiles them, possibly into less optimised (bimorphic or megamorphic) code.

**Why.** `-XX:+PrintCompilation` shows "made not entrant", and JFR records deoptimisation events.
:::

:::drill concept
Why should you use JMH instead of `System.nanoTime()` around a loop?
---
**Answer.** Hand-written loops are distorted by warm-up, dead-code elimination, constant folding, OSR-compiled code and profile pollution between variants. JMH runs each benchmark in forked JVMs with warm-up iterations, feeds results to a `Blackhole`, prevents folding of inputs and reports statistical error.

**Why.** Many published "Java is slow/fast at X" claims measured the interpreter or eliminated code.
:::

:::drill tricky
Is "the JVM interprets bytecode, so Java is slower than C++" correct?
---
**Answer.** Not in general. Hot code is compiled to machine code by C2, which can use run-time profiles (speculative inlining of virtual calls, branch layout) that a static compiler does not have. Java pays for warm-up, GC and safety checks such as bounds checks, many of which C2 hoists out of loops.

**Why.** Steady-state performance of compiled Java is close to C++ for many workloads; start-up and memory use are where it usually loses.
:::

## Predict the output and find the bug {#ch06-reading .dr}

:::drill output
What does this program print? (The question is about the semantics, not timing.)

```java run=c06-d-semantics
public class Semantics {
    static int counter = 0;
    static boolean check(int x) { counter++; return x > 0; }

    public static void main(String[] args) {
        int found = 0;
        for (int i = -5; i < 100_000; i++) if (check(i) && i % 2 == 0) found++;
        System.out.println(found + " " + counter);
    }
}
```
---
**Answer.** `49999 100005`: the even numbers from 2 to 99,998 pass both tests, and `check` runs once for each of the 100,005 values of `i`. The JIT may inline `check`, reorder or vectorise the loop, but it must preserve the observable result: every call increments the counter, and `&&` still short-circuits.

**Why.** Optimisations are invisible to correct single-threaded code. Only data races (Chapter 9) can expose reordering.
:::

:::drill output
What does this print with the default JVM settings?

```java run=c06-d-flags cmd="javac -d . Flags.java && java -cp . Flags && java -XX:TieredStopAtLevel=1 -cp . Flags && java -Xint -cp . Flags"
import java.lang.management.*;

public class Flags {
    public static void main(String[] args) {
        RuntimeMXBean rt = ManagementFactory.getRuntimeMXBean();
        String mode = rt.getInputArguments().isEmpty() ? "defaults" : String.join(" ", rt.getInputArguments());
        System.out.println(mode + " -> " + System.getProperty("java.vm.info"));
    }
}
```
---
**Answer.** Three lines: `defaults -> mixed mode, sharing`, then `-XX:TieredStopAtLevel=1 -> mixed mode, emulated-client, sharing`, then `-Xint -> interpreted mode, sharing`. "Mixed mode" means the interpreter plus JIT; "emulated-client" means only C1 is used, like the old client VM; `-Xint` disables the compilers; "sharing" means class-data sharing is on.

**Why.** `java -version` prints the same `java.vm.info` string, which is a quick way to check how a JVM was started.
:::

:::drill bug
A developer concludes that `Math.sqrt` costs almost nothing, from this benchmark. What is wrong?

```java run=c06-d-bug-bench nondet
public class BadBench {
    public static void main(String[] args) {
        long t0 = System.nanoTime();
        for (int i = 0; i < 100_000_000; i++) Math.sqrt(i);
        long ns = System.nanoTime() - t0;
        System.out.printf("%.3f ns per sqrt (wrong: the result is unused)%n", ns / 1e8);
        double sink = 0;
        t0 = System.nanoTime();
        for (int i = 0; i < 100_000_000; i++) sink += Math.sqrt(i);
        ns = System.nanoTime() - t0;
        System.out.printf("%.3f ns per sqrt with the result used (%b)%n", ns / 1e8, sink > 0);
    }
}
```
---
**Answer.** The result of `Math.sqrt(i)` is discarded and the call has no side effects, so C2 removes it (dead-code elimination), and the loop measures an empty loop compiled by OSR. Use the result (or JMH's `Blackhole`) and warm up first.

**Why.** `Math.sqrt` is an intrinsic that compiles to one instruction; it is cheap, but not free, and only a correct benchmark shows how cheap.
:::

:::drill bug
A short-lived command-line tool runs in 0.4 s, most of it JIT compilation it never benefits from. What JVM options reduce that, and what is the trade-off?

```java run=c06-d-bug-cli cmd="javac -d . Cli.java && java -XX:TieredStopAtLevel=1 -XX:+UseSerialGC -Xshare:auto -cp . Cli"
public class Cli {
    public static void main(String[] args) {
        int words = 0;
        for (String line : "a quick tool\nthat exits fast\n".split("\n")) words += line.split(" ").length;
        System.out.println(words + " words");
    }
}
```
---
**Answer.** `-XX:TieredStopAtLevel=1` uses only C1 (no C2 compilations or profiling), `-XX:+UseSerialGC` avoids starting parallel GC threads, and class-data sharing (`-Xshare`, on by default; application CDS archives with `-XX:SharedArchiveFile`) speeds up class loading. The trade-off is lower peak performance, which a short-lived tool never reaches anyway.

**Why.** For truly instant start-up, GraalVM native-image compiles ahead of time; JDK 24+ adds AOT class loading and linking from Project Leyden.
:::

## Write the code {#ch06-coding .cd}

:::drill code rating=1400
Write a minimal benchmark harness `bench(name, Supplier<Object>)` that does warm-up iterations, measures several timed iterations, keeps every result in a volatile "blackhole" so that work cannot be eliminated, and reports the median. Use it to compare `String.format` with a `StringBuilder`.
---
```java run=c06-c-harness nondet
import java.util.*;
import java.util.function.Supplier;

public class Harness {
    static volatile Object blackhole;

    static double bench(String name, Supplier<Object> body) {
        int inner = 20_000;
        for (int w = 0; w < 10; w++) for (int i = 0; i < inner; i++) blackhole = body.get();
        double[] samples = new double[9];
        for (int s = 0; s < samples.length; s++) {
            long t0 = System.nanoTime();
            for (int i = 0; i < inner; i++) blackhole = body.get();
            samples[s] = (System.nanoTime() - t0) / (double) inner;
        }
        Arrays.sort(samples);
        System.out.printf("%-14s median %7.1f ns/op%n", name, samples[samples.length / 2]);
        return samples[samples.length / 2];
    }

    public static void main(String[] args) {
        int[] counter = {0};
        double fmt = bench("String.format", () -> String.format("id=%d name=%s", counter[0]++, "x"));
        double sb = bench("StringBuilder", () -> new StringBuilder(24).append("id=").append(counter[0]++).append(" name=").append("x").toString());
        System.out.println("format slower: " + (fmt > sb));
    }
}
```

Writing to a `volatile` field forces each result to be stored, so the work cannot be removed; incrementing a counter prevents the inputs from being constant-folded. It is still a toy: JMH forks separate JVMs so the two variants do not share profiles, and reports confidence intervals.
:::

:::drill code rating=1300
Show escape analysis defeating and not defeating allocation: write two versions of a method that sums the lengths of `Point` objects, one where each `Point` stays local and one where it is stored in a field, and measure bytes allocated per iteration for each after warm-up.
---
```java run=c06-c-escape-field
import java.lang.management.ManagementFactory;

public class EscapeField {
    record Point(int x, int y) { int manhattan() { return Math.abs(x) + Math.abs(y); } }
    static Point last;

    static long local(int n) {
        long s = 0;
        for (int i = 0; i < n; i++) s += new Point(i, -i).manhattan();
        return s;
    }

    static long escaping(int n) {
        long s = 0;
        for (int i = 0; i < n; i++) { Point p = new Point(i, -i); last = p; s += p.manhattan(); }
        return s;
    }

    interface Body { long run(int n); }

    static long bytesPerIteration(Body b) {
        var mx = (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean();
        for (int i = 0; i < 30; i++) b.run(100_000);
        long before = mx.getCurrentThreadAllocatedBytes();
        b.run(1_000_000);
        return (mx.getCurrentThreadAllocatedBytes() - before) / 1_000_000;
    }

    public static void main(String[] args) {
        System.out.println("local: " + bytesPerIteration(EscapeField::local) + " bytes/iter, escaping: " + bytesPerIteration(EscapeField::escaping) + " bytes/iter");
    }
}
```

Storing the `Point` in a static field makes it escape, so every iteration really allocates its 24 bytes. The only difference between the two methods is one assignment.
:::

:::drill code rating=1500
Write a program that triggers a deoptimisation on purpose and detects it from inside the program by timing: run a hot method with one receiver type, then introduce a second and third type, and print the per-call time in each phase.
---
```java run=c06-c-phases nondet
public class Phases {
    interface Op { long apply(long x); }
    static final class Inc implements Op { public long apply(long x) { return x + 1; } }
    static final class Dbl implements Op { public long apply(long x) { return x * 2; } }
    static final class Neg implements Op { public long apply(long x) { return -x; } }

    static long loop(Op op, int n) {
        long v = 0;
        for (int i = 0; i < n; i++) v = op.apply(v) & 0xFFFF;
        return v;
    }

    static void phase(String name, Op[] ops) {
        long sink = 0;
        long t0 = System.nanoTime();
        for (int r = 0; r < 200; r++) for (Op op : ops) sink += loop(op, 50_000);
        double ns = (System.nanoTime() - t0) / (200.0 * ops.length * 50_000);
        System.out.printf("%-26s %.2f ns per call (%d)%n", name, ns, sink & 1);
    }

    public static void main(String[] args) {
        phase("warm-up, Inc only", new Op[] {new Inc()});
        phase("steady, Inc only", new Op[] {new Inc()});
        phase("Inc + Dbl (bimorphic)", new Op[] {new Inc(), new Dbl()});
        phase("Inc + Dbl + Neg (megamorphic)", new Op[] {new Inc(), new Dbl(), new Neg()});
    }
}
```

The steady monomorphic phase is fastest; adding a second type deoptimises and recompiles `loop` with a type switch; a third type makes the call megamorphic. Run it with `-XX:+PrintCompilation` to see the "made not entrant" lines that match each slowdown.
:::

## Cheat sheet {#ch06-cheatsheet .th}

- Tiers: 0 interpreter, 1–3 C1 (3 = full profiling), 4 C2. Thresholds ≈ 200 calls → tier 3, ≈ 5,000 → tier 4, plus back-edge counters for loops.
- OSR (`%` in `PrintCompilation`) compiles a running loop and swaps the frame.
- Warm-up: first requests are slow; mitigate with warm-up traffic, CDS, Leyden AOT (JDK 24+), or `TieredStopAtLevel=1` for short-lived tools.
- Inlining: always below 35 bytecode bytes, hot methods up to 325; enables every other optimisation.
- Call sites: monomorphic/bimorphic inlined behind type guards; megamorphic = real virtual call.
- Escape analysis → scalar replacement (no allocation) and lock elision for objects that do not escape; measurable as 0 bytes allocated.
- Speculation + uncommon traps; failed guards → deoptimisation ("made not entrant") → interpreter → recompile.
- Benchmark with JMH: forks, warm-up, `Blackhole`, no constant folding; hand-written loops measure DCE and OSR.
- Inspect: `-XX:+PrintCompilation`, `-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining`, JFR, `-Xint` / `-XX:-DoEscapeAnalysis` for experiments.
