---
title: Exceptions, lambdas and invokedynamic
part: Part E · Language features underneath
lede: Exceptions, lambdas and the newer pattern-matching features all look like syntax, but each has a precise run-time cost and mechanism: exception tables and stack-trace capture, synthetic methods and `LambdaMetafactory`, and `invokedynamic` call sites linked by bootstrap methods. This chapter covers checked versus unchecked exceptions, what `finally` and try-with-resources really do, why exceptions are slow and when HotSpot drops their stack traces, how lambdas are compiled and when they allocate, and how `switch` patterns over sealed types work.
desc: Exception tables, finally and try-with-resources, stack-trace cost, lambdas via indy, capture, sealed types and pattern switch
hours: 3.5
prereqs: Chapters 1 and 6
---

## Exceptions in the JVM {#ch12-exceptions .th}

Everything that can be thrown is a `Throwable`. Its two branches mean different things:

- `Error` (`OutOfMemoryError`, `StackOverflowError`, `NoClassDefFoundError`): problems the application usually cannot recover from.
- `Exception`: conditions a program may handle. Subclasses of `RuntimeException` are **unchecked**; all other exceptions are **checked**, meaning the compiler requires them to be caught or declared in `throws`.

Checked exceptions are purely a **compiler** rule. The JVM does not know about them: bytecode can throw any `Throwable` from anywhere, which is why "sneaky throw" tricks and other JVM languages such as Kotlin can throw checked exceptions without declaring them.

```java run=c12-sneaky
import java.io.IOException;

public class Sneaky {
    @SuppressWarnings("unchecked")
    static <E extends Throwable> void sneakyThrow(Throwable t) throws E {
        throw (E) t;                       // erased: the compiler thinks E is RuntimeException at the call site
    }

    static void readConfig() {             // no "throws IOException"
        Sneaky.<RuntimeException>sneakyThrow(new IOException("disk not found"));
    }

    public static void main(String[] args) {
        try {
            readConfig();
        } catch (Exception e) {
            System.out.println(e.getClass().getName() + ": " + e.getMessage());
        }
    }
}
```

### How try/catch is compiled

A `try` block costs nothing at run time. The method's **exception table** lists ranges of bytecode, the exception class each handler catches, and the handler's offset. When something throws, the JVM searches the current method's table for a matching entry; if none matches, it pops the frame and searches the caller's, and so on (stack unwinding).

```java run=c12-table cmd="javac -d . Table.java && javap -c -p Table | sed -n '/int parse/,/^$/p'"
public class Table {
    static int parse(String s) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            return -1;
        } finally {
            System.out.println("finally");
        }
    }
}
```

The `finally` block appears **three times** in the bytecode: after the normal path, after the catch handler, and in an `any` handler that runs it and rethrows any other exception. `javac` duplicates `finally` code on every exit path rather than calling a subroutine (the old `jsr` instruction was removed from class files in Java 7).

### finally semantics

`finally` runs on every exit: normal completion, `return`, `break`, `continue` and thrown exceptions. A `return` inside `finally` replaces whatever the `try` was returning **and swallows any exception in flight**:

```java run=c12-finally
public class Finally {
    @SuppressWarnings("finally")
    static int returnsInFinally() {
        try { return 1; } finally { return 2; }
    }

    @SuppressWarnings("finally")
    static String swallows() {
        try { throw new IllegalStateException("lost"); } finally { return "no exception reaches the caller"; }
    }

    static int valueSnapshot() {
        int x = 10;
        try { return x; } finally { x = 20; }     // the return value was already saved
    }

    public static void main(String[] args) {
        System.out.println(returnsInFinally() + " | " + swallows() + " | " + valueSnapshot());
    }
}
```

`valueSnapshot` returns 10: the value of `x` is copied to a local slot before `finally` runs, so changing `x` afterwards does not change the result (mutating an *object* it refers to would show, though).

### try-with-resources

`try (A a = …; B b = …) { body }` closes resources in **reverse** order of declaration, and if both the body and `close()` throw, the body's exception wins and the close exception is attached to it as a **suppressed** exception rather than replacing it:

```java run=c12-twr
public class Resources {
    record Res(String name, boolean failOnClose) implements AutoCloseable {
        Res { System.out.println("open " + name); }
        @Override public void close() {
            System.out.println("close " + name);
            if (failOnClose) throw new IllegalStateException("close failed: " + name);
        }
    }

    public static void main(String[] args) {
        try (Res a = new Res("a", false); Res b = new Res("b", true)) {
            throw new RuntimeException("body failed");
        } catch (RuntimeException e) {
            System.out.println("caught: " + e.getMessage());
            for (Throwable s : e.getSuppressed()) System.out.println("  suppressed: " + s.getMessage());
        }
    }
}
```

Before Java 7, the usual hand-written `finally { b.close(); }` let the `close` exception replace the original one, hiding the real cause.

## The cost of exceptions {#ch12-cost .th}

Creating a `Throwable` calls `fillInStackTrace()`, which walks the thread's stack and records every frame; that dominates the cost, and it grows with stack depth. Throwing and catching within a JIT-compiled method that inlines both can be cheap, but in general exceptions are much slower than a returned value or a branch:

```java run=c12-cost nondet
public class Cost {
    static final class NoTrace extends RuntimeException {
        NoTrace() { super("no trace", null, false, false); }      // no suppression, no stack trace
    }

    static int depth(int n, RuntimeException toThrow) {
        if (n == 0) throw toThrow != null ? toThrow : new IllegalStateException("deep");
        return depth(n - 1, toThrow) + 1;
    }

    static double nsPer(Runnable r, int n) {
        for (int i = 0; i < n / 10; i++) r.run();
        long t0 = System.nanoTime();
        for (int i = 0; i < n; i++) r.run();
        return (System.nanoTime() - t0) / (double) n;
    }

    public static void main(String[] args) {
        Runnable normal = () -> { try { depth(50, null); } catch (IllegalStateException e) { } };
        RuntimeException shared = new NoTrace();
        Runnable noTrace = () -> { try { depth(50, shared); } catch (NoTrace e) { } };
        System.out.printf("new exception at depth 50: %.0f ns, preallocated without trace: %.0f ns%n", nsPer(normal, 50_000), nsPer(noTrace, 50_000));
    }
}
```

Exceptions created with `writableStackTrace = false` (the four-argument constructor) skip the stack walk, which some libraries use for control-flow exceptions. For ordinary error handling the trace is the whole point, so keep it.

### OmitStackTraceInFastThrow

For "implicit" exceptions thrown by the JVM itself in compiled code, such as `NullPointerException`, `ArithmeticException`, `ArrayIndexOutOfBoundsException` and `ClassCastException`, C2 eventually switches to throwing a **preallocated exception with no stack trace** if the same site throws repeatedly. That keeps a hot failing path cheap, and it is why production logs sometimes show `java.lang.NullPointerException` with no message and no stack:

```java run=c12-fastthrow cmd="javac -d . FastThrow.java && echo 'default:' && java -cp . FastThrow && echo '-XX:-OmitStackTraceInFastThrow:' && java -XX:-OmitStackTraceInFastThrow -cp . FastThrow"
public class FastThrow {
    static int length(String s) { return s.length(); }

    public static void main(String[] args) {
        int withTrace = 0, withoutTrace = 0;
        for (int i = 0; i < 200_000; i++) {
            try {
                length(null);
            } catch (NullPointerException e) {
                if (e.getStackTrace().length == 0) withoutTrace++; else withTrace++;
            }
        }
        System.out.println("  with stack trace: " + (withTrace > 0) + ", some without: " + (withoutTrace > 0));
    }
}
```

If you see trace-less exceptions in logs, search earlier in the log for the first occurrence of the same exception, which still had its trace, or run with `-XX:-OmitStackTraceInFastThrow`.

## How lambdas are compiled {#ch12-lambdas .th}

A lambda is **not** compiled to an anonymous inner class file. `javac` moves its body into a private synthetic method (`lambda$main$0`) and emits an `invokedynamic` instruction whose bootstrap method is `LambdaMetafactory.metafactory`. The first time that instruction runs, the bootstrap method spins a small hidden class implementing the functional interface and links the call site to a factory for it; later executions just call the factory.

```java run=c12-lambda-bytecode cmd="javac -d . Lambdas.java && javap -c -p Lambdas | grep -E 'invokedynamic|lambda\$|private static'"
import java.util.function.*;

public class Lambdas {
    public static void main(String[] args) {
        int base = 10;
        IntUnaryOperator addBase = x -> x + base;          // captures base
        Supplier<String> hello = () -> "hello";            // captures nothing
        Function<String, Integer> len = String::length;    // unbound method reference
        System.out.println(addBase.applyAsInt(5) + " " + hello.get() + " " + len.apply("four"));
    }
}
```

Each lambda body became a `private static` method; a capturing lambda's captured values become extra leading parameters (`lambda$main$0(int, int)`). Method references such as `String::length` need no synthetic method; the call site points straight at `String.length`.

### Capture and allocation

- A **non-capturing** lambda evaluates to the **same object** every time: the call site returns a constant singleton.
- A **capturing** lambda creates a new object per evaluation holding the captured values (escape analysis may remove it in hot code, Chapter 6).
- Captured local variables must be **effectively final**, because the lambda copies their values; there is no shared cell as in Python closures (Python chapter 2).
- Inside a lambda, `this` means the **enclosing** instance; inside an anonymous class, `this` is the anonymous object.

```java run=c12-capture
import java.util.*;
import java.util.function.*;

public class Capture {
    String name = "outer";

    void show() {
        Runnable lambda = () -> System.out.println("lambda this: " + this.name);
        Runnable anon = new Runnable() {
            String name = "anonymous";
            public void run() { System.out.println("anonymous this: " + this.name); }
        };
        lambda.run();
        anon.run();
    }

    static Supplier<String> make() { return () -> "constant"; }
    static IntSupplier capture(int x) { return () -> x; }

    public static void main(String[] args) {
        new Capture().show();
        System.out.println("non-capturing reused: " + (make() == make()) + ", capturing reused: " + (capture(1) == capture(1)));
        int[] counter = {0};                       // the classic workaround: capture a mutable holder
        Runnable inc = () -> counter[0]++;
        inc.run(); inc.run();
        System.out.println("counter " + counter[0]);
    }
}
```

The array trick works because the *reference* to the array is effectively final while the array contents are not, but it is not thread-safe; use an `AtomicInteger` if the lambda may run on several threads.

## invokedynamic beyond lambdas {#ch12-indy .th}

`invokedynamic` (Java 7, JSR 292) lets a language define its own linkage: the first execution calls a **bootstrap method**, which returns a `CallSite` holding a `MethodHandle`; subsequent executions jump straight to that handle, and the JIT inlines through it like an ordinary call. The JDK uses it for:

- lambdas and method references (`LambdaMetafactory`);
- string concatenation (`StringConcatFactory`, Chapter 4);
- records' `toString`, `equals` and `hashCode` (`ObjectMethods.bootstrap`);
- pattern-matching `switch` (`SwitchBootstraps.typeSwitch`), Java 21.

```java run=c12-records cmd="javac -d . Shapes.java && java -cp . Shapes && javap -c -p Shapes | grep -E 'invokedynamic' | sed -E 's/ +#[0-9]+, +0 +//'"
public class Shapes {
    sealed interface Shape permits Circle, Square, Rect {}
    record Circle(double r) implements Shape {}
    record Square(double side) implements Shape {}
    record Rect(double w, double h) implements Shape {}

    static double area(Shape s) {
        return switch (s) {                        // exhaustive: no default needed for a sealed type
            case Circle c -> Math.PI * c.r() * c.r();
            case Square(double side) -> side * side;               // record pattern (Java 21)
            case Rect(double w, double h) when w == h -> w * w;   // guarded pattern
            case Rect(double w, double h) -> w * h;
        };
    }

    public static void main(String[] args) {
        System.out.printf("%.2f %.1f %.1f %s%n", area(new Circle(1)), area(new Square(3)), area(new Rect(2, 5)), new Rect(2, 5));
    }
}
```

The `switch` over `Shape` compiles to `invokedynamic` `typeSwitch` calls that return the index of the first matching case, each followed by an ordinary `tableswitch`. There are three of them here because when a nested record pattern or the `when` guard fails, the generated code re-enters the type switch starting after the case that failed. Because `Shape` is **sealed** (only the listed classes may implement it), the compiler knows the cases are exhaustive, needs no `default`, and reports an error if a new permitted subclass is added and not handled. The record's `toString` (in the `printf`) is also generated by an `invokedynamic` bootstrap rather than by compiled code.

## Concept and tricky questions {#ch12-concept .dr}

:::drill concept
What is the difference between checked and unchecked exceptions, and does the JVM enforce it?
---
**Answer.** Checked exceptions (subclasses of `Exception` that are not `RuntimeException`s) must be caught or declared; unchecked ones (`RuntimeException`, `Error` and their subclasses) need not be. Only `javac` enforces it; the JVM lets any method throw any `Throwable`.

**Why.** That is why sneaky throws, `Class.newInstance` (deprecated for this reason) and other JVM languages can surface checked exceptions without declarations.
:::

:::drill concept
Does an empty `try` block slow down the code inside it?
---
**Answer.** No. `try`/`catch` compiles to an exception-table entry, consulted only when something is thrown. The normal path runs the same instructions with or without the `try`.

**Why.** The cost of exceptions is in creating them (stack-trace capture) and unwinding, not in `try` blocks.
:::

:::drill tricky
What does a method return if its `try` returns 1 and its `finally` returns 2? What happens to an exception thrown in the `try`?
---
**Answer.** It returns 2. A `return` in `finally` overrides the `try`'s result and also discards any exception that was propagating, so the caller never sees it.

**Why.** `javac -Xlint:finally` warns about it; never return or throw from `finally` unless you intend to replace the outcome.
:::

:::drill concept
What are suppressed exceptions?
---
**Answer.** Exceptions attached to another exception with `addSuppressed`, retrieved with `getSuppressed()`. try-with-resources uses them: if the body throws and then a resource's `close()` also throws, the close exception is suppressed into the body's exception instead of replacing it.

**Why.** It preserves the original failure, which hand-written `finally { close(); }` code used to lose.
:::

:::drill tricky
A production log shows thousands of `java.lang.NullPointerException` lines with no stack trace. Why, and how do you get the trace back?
---
**Answer.** HotSpot's `OmitStackTraceInFastThrow` optimisation: after an implicit exception is thrown repeatedly from the same compiled site, C2 throws a preallocated instance without a stack trace. The first occurrences, earlier in the log, still have full traces; `-XX:-OmitStackTraceInFastThrow` disables the optimisation.

**Why.** It makes a hot failing path cheap, at the cost of diagnostics.
:::

:::drill concept
How is a lambda compiled, and how does that differ from an anonymous class?
---
**Answer.** `javac` puts the lambda body in a private synthetic method and emits an `invokedynamic` linked by `LambdaMetafactory`, which generates a hidden implementation class at run time on first use. An anonymous class is compiled to its own `Outer$1.class` file at compile time, always creates a new object, and has its own `this`.

**Why.** Deferring class generation to run time keeps JARs small and lets the JDK change the strategy without recompiling code.
:::

:::drill tricky
Why must variables captured by a lambda be effectively final, while Python closures can see later changes?
---
**Answer.** A Java lambda copies the captured values into the generated object when it is created. If the variable could change later, the copy and the variable would disagree, so the language forbids it. Python shares a cell object between the closure and the enclosing function, so both see the same, latest value.

**Why.** Copying keeps lambdas simple and thread-confined; to share mutable state, capture a reference to a mutable object.
:::

## Predict the output and find the bug {#ch12-reading .dr}

:::drill output
What does this print?

```java run=c12-d-finally-order
public class FinallyOrder {
    static String trace = "";

    static int f() {
        try {
            trace += "try ";
            throw new RuntimeException("x");
        } catch (RuntimeException e) {
            trace += "catch ";
            return 1;
        } finally {
            trace += "finally ";
        }
    }

    public static void main(String[] args) {
        int r = f();
        System.out.println(trace + "-> " + r);
    }
}
```
---
**Answer.** `try catch finally -> 1`. The catch block's `return 1` is evaluated, then `finally` runs, then the method returns the saved value.

**Why.** `finally` always runs after the `try` or `catch` block completes, however it completes.
:::

:::drill output
What does this print?

```java run=c12-d-catch-order
public class CatchOrder {
    static String classify(Exception e) {
        try {
            throw e;
        } catch (IllegalArgumentException ex) {
            return "IAE";
        } catch (RuntimeException ex) {
            return "runtime";
        } catch (Exception ex) {
            return "checked";
        }
    }

    public static void main(String[] args) {
        System.out.println(classify(new NumberFormatException()) + " " + classify(new IllegalStateException()) + " " + classify(new java.io.IOException()));
    }
}
```
---
**Answer.** `IAE runtime checked`. Handlers are tried in order, and `NumberFormatException` is a subclass of `IllegalArgumentException`.

**Why.** A catch clause for a superclass placed before a subclass's makes the subclass clause unreachable, which is a compile error.
:::

:::drill output
What does this print?

```java run=c12-d-lambda-loop
import java.util.*;
import java.util.function.*;

public class LambdaLoop {
    public static void main(String[] args) {
        List<IntSupplier> suppliers = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            int copy = i;
            suppliers.add(() -> copy * 10);
        }
        StringBuilder sb = new StringBuilder();
        for (IntSupplier s : suppliers) sb.append(s.getAsInt()).append(' ');
        for (String name : List.of("a", "b")) suppliers.add(name::length);
        System.out.println(sb.toString().trim() + " | " + suppliers.size() + " " + suppliers.get(3).getAsInt());
    }
}
```
---
**Answer.** `0 10 20 | 5 1`. Each lambda captured its own copy of `copy`, unlike Python's late-binding closures; the loop variable `i` itself could not be captured because it is not effectively final. The enhanced-`for` variable `name` *is* effectively final per iteration, and `name::length` is a bound method reference.

**Why.** Java's copy-capture makes the "late binding loop bug" impossible.
:::

:::drill bug
Errors from closing a file are lost and the original exception is never logged. Find the bug in the original style, and show the fix.

```java run=c12-d-bug-close
public class CloseBug {
    static final class Stream implements AutoCloseable {
        void read() { throw new IllegalStateException("read failed"); }
        @Override public void close() { throw new IllegalStateException("close failed"); }
    }

    static String withFinally() {
        Stream s = new Stream();
        try {
            s.read();
            return "ok";
        } finally {
            s.close();
        }
    }

    static String withResources() {
        try (Stream s = new Stream()) {
            s.read();
            return "ok";
        }
    }

    public static void main(String[] args) {
        try { withFinally(); } catch (IllegalStateException e) { System.out.println("finally version reports: " + e.getMessage()); }
        try { withResources(); } catch (IllegalStateException e) {
            System.out.println("try-with-resources reports: " + e.getMessage() + ", suppressed: " + e.getSuppressed()[0].getMessage());
        }
    }
}
```
---
**Answer.** In `withFinally`, `close()` throws while the read exception is propagating, and the new exception replaces it, so the real cause ("read failed") is lost. try-with-resources reports the body's exception and keeps the close failure as suppressed.

**Why.** Prefer try-with-resources for every `AutoCloseable`.
:::

:::drill bug
A validation layer uses exceptions for normal control flow and becomes the top CPU cost under load. Fix it.

```java run=c12-d-bug-flow
import java.util.*;

public class Validation {
    static Optional<Integer> parseAge(String s) {
        if (s == null || s.isEmpty() || s.length() > 3) return Optional.empty();
        for (int i = 0; i < s.length(); i++) if (!Character.isDigit(s.charAt(i))) return Optional.empty();
        int v = Integer.parseInt(s);
        return v <= 150 ? Optional.of(v) : Optional.empty();
    }

    public static void main(String[] args) {
        List<String> inputs = List.of("42", "abc", "", "999", "7");
        List<Object> out = new ArrayList<>();
        for (String s : inputs) out.add(parseAge(s).map(Object.class::cast).orElse("invalid"));
        System.out.println(out);
    }
}
```
---
**Answer.** The original called `Integer.parseInt` inside `try`/`catch (NumberFormatException)` for every input, and most inputs were invalid, so each one created an exception with a full stack trace. Checking the format first and returning `Optional.empty()` makes the common invalid case a few comparisons.

**Why.** Exceptions are for exceptional situations; when failure is expected and frequent, return a value that encodes it.
:::

## Write the code {#ch12-coding .cd}

:::drill code rating=1300
Write a `Result<T>` sealed type with `Ok` and `Err` records, a `map` method, and a static `attempt(Supplier<T>)` that catches exceptions, then use a pattern-matching `switch` to print each result.
---
```java run=c12-c-result
import java.util.*;
import java.util.function.*;

public class Results {
    sealed interface Result<T> permits Ok, Err {
        default <U> Result<U> map(Function<? super T, ? extends U> f) {
            return switch (this) {
                case Ok<T> ok -> new Ok<>(f.apply(ok.value()));
                case Err<T> err -> new Err<>(err.error());
            };
        }
        static <T> Result<T> attempt(Supplier<T> s) {
            try { return new Ok<>(s.get()); } catch (RuntimeException e) { return new Err<>(e.getMessage()); }
        }
    }
    record Ok<T>(T value) implements Result<T> {}
    record Err<T>(String error) implements Result<T> {}

    public static void main(String[] args) {
        for (String input : List.of("21", "x", "100000000000")) {
            Result<Integer> r = Result.attempt(() -> Integer.parseInt(input)).map(n -> n * 2);
            String text = switch (r) {
                case Ok<Integer>(Integer v) -> "ok " + v;
                case Err<Integer>(String msg) -> "error: " + msg;
            };
            System.out.println(input + " -> " + text);
        }
    }
}
```

Because `Result` is sealed with exactly two records, both switches are exhaustive without a `default`, and adding a third variant would make them fail to compile, which is the main advantage over exceptions or `null` for expected failures.
:::

:::drill code rating=1400
Write a "memoising" `Function` wrapper and prove, with `==`, which lambdas the JVM reuses: a non-capturing lambda returned from a method twice, a capturing one, and a method reference bound to the same receiver.
---
```java run=c12-c-identity
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.*;

public class LambdaIdentity {
    static <T, R> Function<T, R> memoize(Function<T, R> f) {
        Map<T, R> cache = new ConcurrentHashMap<>();
        return x -> cache.computeIfAbsent(x, f);
    }

    static Function<Integer, Integer> square() { return x -> x * x; }
    static Function<Integer, Integer> plus(int n) { return x -> x + n; }

    public static void main(String[] args) {
        int[] calls = {0};
        Function<Integer, Integer> slow = x -> { calls[0]++; return x * 10; };
        Function<Integer, Integer> fast = memoize(slow);
        fast.apply(1); fast.apply(1); fast.apply(2);
        String text = "abc";
        Supplier<Integer> r1 = text::length, r2 = text::length;
        System.out.println("calls=" + calls[0]
            + " square()==square(): " + (square() == square())
            + " plus(1)==plus(1): " + (plus(1) == plus(1))
            + " text::length twice: " + (r1 == r2));
    }
}
```

Only the non-capturing lambda is a cached singleton. Bound method references capture their receiver, so each evaluation allocates a new object. None of this is specified by the language, which only promises that lambda identity is not guaranteed; never use `==` on lambdas in real code.
:::

:::drill code rating=1500
Use `MethodHandles` and `invokedynamic`-style linking by hand: create a `MutableCallSite` whose target is a method handle to one implementation, call it through `dynamicInvoker()`, then retarget it to a second implementation and show the same invoker now calls the new code.
---
```java run=c12-c-callsite
import java.lang.invoke.*;

public class CallSites {
    static String english(String name) { return "hello " + name; }
    static String french(String name) { return "bonjour " + name; }

    public static void main(String[] args) throws Throwable {
        MethodHandles.Lookup lookup = MethodHandles.lookup();
        MethodType type = MethodType.methodType(String.class, String.class);
        MethodHandle en = lookup.findStatic(CallSites.class, "english", type);
        MethodHandle fr = lookup.findStatic(CallSites.class, "french", type);

        MutableCallSite site = new MutableCallSite(en);
        MethodHandle invoker = site.dynamicInvoker();
        System.out.println((String) invoker.invokeExact("Ada"));
        site.setTarget(fr);
        System.out.println((String) invoker.invokeExact("Ada"));
        MethodHandle shout = MethodHandles.filterReturnValue(fr, lookup.findVirtual(String.class, "toUpperCase", MethodType.methodType(String.class)));
        System.out.println((String) shout.invokeExact("Ada"));
    }
}
```

This is the mechanism under every `invokedynamic`: a bootstrap method returns a `CallSite` whose target is a `MethodHandle`, and the JIT inlines through the handle. Dynamic languages on the JVM (JRuby, Nashorn) retarget call sites when their assumptions about types change, just as here; `MutableCallSite.setTarget` invalidates compiled code that inlined the old target.
:::

## Cheat sheet {#ch12-cheatsheet .th}

- `Throwable` → `Error` (don't catch) and `Exception`; `RuntimeException`s are unchecked. Checked-ness is enforced only by `javac`.
- `try` costs nothing: handlers live in the exception table; `finally` is duplicated on every exit path.
- `return` in `finally` overrides the result and swallows exceptions; the `try`'s return value is saved before `finally` runs.
- try-with-resources: close in reverse order; close failures become **suppressed** exceptions of the body's exception.
- Exception cost = stack-trace capture (`fillInStackTrace`), proportional to depth; use `writableStackTrace = false` for control-flow exceptions; don't use exceptions for expected failures.
- `OmitStackTraceInFastThrow`: hot implicit NPE/AIOOBE/CCE lose their traces; disable with `-XX:-OmitStackTraceInFastThrow`.
- Lambdas: body → private synthetic method; `invokedynamic` + `LambdaMetafactory` spins a hidden class on first use. Non-capturing = singleton; capturing = new object (maybe scalar-replaced). Captures are copies of effectively final locals; `this` is the enclosing instance.
- `invokedynamic` also powers string concat, records' methods and `switch` patterns (`SwitchBootstraps.typeSwitch`).
- Sealed types + records + pattern `switch` (Java 21) = exhaustive matching without `default`.
