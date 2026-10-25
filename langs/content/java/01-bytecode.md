---
title: From source to a running JVM
part: Part A · The JVM
lede: `javac` does not produce machine code. It produces class files full of bytecode for a stack-based virtual machine, and the JVM loads, verifies, interprets and eventually JIT-compiles that bytecode. This chapter takes a class file apart, teaches you to read `javap -c` output, explains frames, local variable slots and the operand stack, and walks through the instruction families, including the five kinds of method call.
desc: Class file format, javap -c, stack machine, frames and locals, typed instructions, invoke*
hours: 3
prereqs: basic Java
---

## What javac produces {#ch01-classfile .th}

Each class or interface (including every nested, local and anonymous class) compiles to its own `.class` file. A class file is a binary structure defined by the JVM specification:

1. The magic number `0xCAFEBABE`.
2. Minor and major version. Java 21 class files are version **65**; a JVM refuses class files newer than it understands with `UnsupportedClassVersionError`.
3. The **constant pool**: a table of every literal, class name, method name, field reference and type descriptor the class uses. Instructions refer to entries by index.
4. Access flags, the class's own name, its superclass and interfaces.
5. Fields and methods, each with attributes. A method's `Code` attribute holds its bytecode, its maximum operand stack depth, its number of local variable slots, and its exception table.

```java run=c01-header
import java.io.*;
import java.nio.file.*;

public class Header {
    static int answer() { return 42; }

    public static void main(String[] args) throws IOException {
        byte[] b = Files.readAllBytes(Path.of("Header.class"));
        DataInputStream in = new DataInputStream(new ByteArrayInputStream(b));
        System.out.printf("magic %08X%n", in.readInt());
        int minor = in.readUnsignedShort(), major = in.readUnsignedShort();
        System.out.println("version " + major + "." + minor);
        System.out.println("constant pool entries " + (in.readUnsignedShort() - 1));
        System.out.println("class file bytes " + b.length);
    }
}
```

The program reads its own compiled class file. The class file is small because names and types are stored once in the constant pool and shared by every instruction that needs them.

### Type descriptors

Inside a class file, types are written as **descriptors**: `I` int, `J` long, `Z` boolean, `D` double, `V` void, `Ljava/lang/String;` an object, `[I` an int array. A method descriptor lists parameter descriptors in brackets followed by the return descriptor, so `String format(String, Object[])` is `(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;`. You will see these in `javap` output and in error messages such as `NoSuchMethodError`.

## Reading javap -c {#ch01-javap .th}

`javap -c` disassembles the bytecode of each method. The JVM is a **stack machine**: instructions pop their operands from the current frame's **operand stack** and push their results, and values are stored in numbered **local variable slots**:

```java run=c01-javap cmd="javac -d . Calc.java && javap -c -p Calc"
public class Calc {
    static int add(int a, int b) {
        return a + b;
    }

    int scaled(int x) {
        int factor = 3;
        return x * factor + 1;
    }

    static long widen(int a, long b) {
        return a + b;
    }
}
```

Read `scaled` from top to bottom:

- `iconst_3` pushes the constant 3 and `istore_2` pops it into slot 2 (`factor`).
- In an **instance** method, slot 0 holds `this`, so `x` is slot 1 and `factor` slot 2. In a static method the parameters start at slot 0.
- `iload_1`, `iload_2`, `imul`, `iconst_1`, `iadd`, `ireturn`: the expression evaluated on the stack.
- The constructor `Calc()` that `javac` generated calls `Object.<init>` with `invokespecial`.

In `widen`, `i2l` converts the int to a long before `ladd`. Instructions are **typed**: `iadd`, `ladd`, `fadd` and `dadd` are different opcodes, and the JVM never decides at run time which kind of addition to do. A `long` or `double` occupies **two** local slots and two stack entries, which is why `b` in `widen` is loaded from slot 1 (`lload_1`) and the method needs 3 slots in total.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 200" role="img" aria-label="A JVM frame holds local variable slots and an operand stack, plus a reference to the class's constant pool">
  <rect x="20" y="20" width="680" height="160" rx="10" class="d-box"/><text x="32" y="40" class="t-small">frame for scaled(int) — one per method call, on the thread's Java stack</text>
  <text x="40" y="70" class="t-small">local variables (max_locals = 3)</text>
  <rect x="40" y="80" width="90" height="36" class="d-acc"/><text x="85" y="103" text-anchor="middle" class="t-mono">0: this</text>
  <rect x="130" y="80" width="90" height="36" class="d-acc"/><text x="175" y="103" text-anchor="middle" class="t-mono">1: x</text>
  <rect x="220" y="80" width="90" height="36" class="d-acc"/><text x="265" y="103" text-anchor="middle" class="t-mono">2: factor</text>
  <text x="380" y="70" class="t-small">operand stack (max_stack = 2)</text>
  <rect x="380" y="80" width="110" height="36" class="d-key"/><text x="435" y="103" text-anchor="middle" class="t-mono">x * factor</text>
  <rect x="490" y="80" width="80" height="36" class="d-key"/><text x="530" y="103" text-anchor="middle" class="t-mono">1</text>
  <text x="590" y="103" class="t-small">← next: iadd</text>
  <rect x="40" y="134" width="300" height="30" class="d-soft"/><text x="52" y="154" class="t-small">return address, link to the class's constant pool</text>
</svg></div><figcaption><b>A frame.</b> The sizes of both areas are computed by <code>javac</code> and stored in the method's <code>Code</code> attribute, so the JVM allocates the frame in one step.</figcaption></figure>

### Seeing the frame sizes

`javap -v` (verbose) prints the constant pool and, for each method, `stack=` and `locals=`:

```java run=c01-verbose cmd="javac -d . Sizes.java && javap -v -p Sizes | grep -E 'stack=|static|Sizes\(\)'"
public class Sizes {
    static int sum3(int a, int b, int c) { return a + b + c; }
    static double area(double w, double h) { return w * h; }
}
```

`area` takes two doubles, so it needs 4 local slots and a stack depth of 4.

## The instruction families {#ch01-families .th}

Roughly 200 opcodes fall into a handful of groups:

| Group | Examples | Notes |
|---|---|---|
| Constants | `iconst_0`…`iconst_5`, `bipush`, `sipush`, `ldc` | Small ints are encoded in the opcode; others come from the constant pool |
| Locals | `iload`, `istore`, `aload`, `astore` | Typed by `i`, `l`, `f`, `d`, `a` (reference) |
| Arithmetic | `iadd`, `lmul`, `idiv`, `irem`, `ineg`, `ishl` | `idiv` by zero throws `ArithmeticException`; float division does not |
| Conversion | `i2l`, `l2i`, `i2d`, `d2i` | `l2i` silently truncates |
| Objects | `new`, `getfield`, `putfield`, `getstatic`, `instanceof`, `checkcast` | `new` allocates; the constructor is a separate `invokespecial` |
| Arrays | `newarray`, `iaload`, `iastore`, `arraylength` | Every access is bounds-checked |
| Control | `if_icmpge`, `goto`, `tableswitch`, `lookupswitch` | Dense switches become a jump table |
| Calls | `invokestatic`, `invokevirtual`, `invokeinterface`, `invokespecial`, `invokedynamic` | See below |
| Exceptions, monitors | `athrow`, `monitorenter`, `monitorexit` | `try` uses the method's exception table, not instructions |

### Five kinds of call

```java run=c01-invoke cmd="javac -d . Calls.java && javap -c -p Calls | grep -E 'invoke|Method Calls'"
import java.util.*;
import java.util.function.*;

public class Calls {
    private void helper() {}

    void demo(List<String> list, ArrayList<String> array) {
        Math.max(1, 2);                  // static: no receiver
        array.add("x");                  // virtual: dispatch on the class
        list.add("y");                   // interface: dispatch through an interface
        helper();                        // special: private method, no dispatch
        Supplier<String> s = () -> "z";  // dynamic: call site linked at run time
    }
}
```

- `invokestatic`: a static method; no receiver, the target is fixed.
- `invokevirtual`: an instance method declared in a class; dispatched on the receiver's runtime class through its **vtable**.
- `invokeinterface`: a method declared in an interface; dispatched through the class's interface tables (**itables**), which is a slightly more expensive lookup.
- `invokespecial`: constructors (`<init>`), `super.method()` calls and, before Java 11, private methods; no dynamic dispatch. Since Java 11 (nestmates) private methods are often called with `invokevirtual` instead, as you can see above.
- `invokedynamic`: the call site is linked the first time it runs by a **bootstrap method**, which returns the target. Lambdas, string concatenation (Chapter 4), records' `toString` and pattern-matching `switch` use it (Chapter 12).

:::key
The JIT turns most virtual and interface calls into direct calls or inlines them when it observes only one or two receiver classes at a call site (Chapter 6). The bytecode kind tells you the language semantics, not the final machine-code cost.
:::

## Verification and the operand stack at run time {#ch01-verify .th}

Before a class's methods run, the **bytecode verifier** checks that every method is type-safe: the stack never overflows or underflows, every instruction gets operands of the right type, every jump lands on an instruction, and objects are initialised before use. Since Java 7 class files carry a `StackMapTable` attribute that records the expected types at branch targets, so verification is a single linear pass. This is what lets the JVM run untrusted bytecode safely and lets the interpreter skip type checks.

Each thread has its own **Java stack** of frames. Calling a method pushes a frame; returning pops it. A runaway recursion exhausts the thread's stack (sized by `-Xss`, 1 MB by default on 64-bit Linux) and throws `StackOverflowError`:

```java run=c01-stackoverflow nondet
public class Deep {
    static int depth = 0;

    static void recurse(long a, long b) {
        depth++;
        recurse(a + 1, b + 1);
    }

    static void recurseSmall() {
        depth++;
        recurseSmall();
    }

    public static void main(String[] args) {
        try { recurse(0, 0); } catch (StackOverflowError e) { System.out.println("two longs: depth " + depth); }
        depth = 0;
        try { recurseSmall(); } catch (StackOverflowError e) { System.out.println("no params: depth " + depth); }
    }
}
```

The depth varies between runs and machines (the JIT changes frame sizes as it compiles the method), but frames with more locals always allow fewer calls. Catching `StackOverflowError` is fine for a demo but rarely a good idea in real code: it is an `Error`, and the program's state at the point of overflow may be inconsistent.

## Concept and tricky questions {#ch01-concept .dr}

:::drill concept
What does `javac` produce, and what does the JVM do with it before your `main` runs?
---
**Answer.** One class file per class, containing a constant pool and bytecode for each method. The JVM loads the class, links it (verifies the bytecode, prepares static fields, resolves references lazily), initialises it (runs static initialisers), and then interprets `main`, JIT-compiling hot methods later.

**Why.** "Java is compiled" and "Java is interpreted" are both half-answers. The full answer has two compilers: `javac` ahead of time, the JIT at run time.
:::

:::drill concept
What is the constant pool and why do instructions refer to it?
---
**Answer.** A per-class table of literals (strings, numbers) and symbolic references (class, field and method names with their descriptors). Instructions such as `ldc`, `getfield` and `invokevirtual` carry an index into it instead of the full name.

**Why.** It keeps class files compact and lets the JVM resolve each symbolic reference once and cache the result.
:::

:::drill tricky
In an instance method `void f(long a, int b)`, which local variable slots do `this`, `a` and `b` occupy?
---
**Answer.** `this` is slot 0, `a` takes slots 1 and 2 (a `long` uses two slots), and `b` is slot 3.

**Why.** `long` and `double` are "category 2" values in the JVM: two slots in the locals array and two entries on the operand stack.
:::

:::drill concept
Name the five invoke instructions and when `javac` uses each one.
---
**Answer.** `invokestatic` for static methods, `invokevirtual` for instance methods declared in classes (and private methods since Java 11 nestmates), `invokeinterface` for methods called through an interface type, `invokespecial` for constructors and `super.` calls, and `invokedynamic` for call sites linked at run time (lambdas, string concatenation, records, pattern switches).

**Why.** The choice depends on the **static type** of the receiver expression: `list.add` on a `List` is `invokeinterface` even if the object is an `ArrayList`.
:::

:::drill tricky
Why does `new StringBuilder()` compile to two instructions, `new` and `invokespecial`?
---
**Answer.** `new` allocates an uninitialised object and pushes its reference; `invokespecial StringBuilder.<init>` runs the constructor on it. A `dup` in between keeps a copy of the reference on the stack for the caller to use afterwards.

**Why.** Allocation and initialisation are separate in the JVM, and the verifier forbids using an object between them. That gap is also why a constructor that leaks `this` exposes a partly initialised object.
:::

:::drill concept
What does the bytecode verifier guarantee?
---
**Answer.** That each method is type-safe: no stack overflow or underflow, operands of the right types, valid jump targets, no use of uninitialised objects, and correct access to fields and methods.

**Why.** It allows the JVM to run untrusted code safely and to execute bytecode without per-instruction type checks.
:::

:::drill tricky
A class compiled with JDK 21 fails on a Java 17 runtime with `UnsupportedClassVersionError: … class file version 65.0`. What does that mean and how do you fix it?
---
**Answer.** The class file's major version (65 = Java 21) is newer than the runtime supports (61 = Java 17). Compile with `javac --release 17`, which targets version 61 and also checks that you only use Java 17 APIs.

**Why.** `--release` is better than `-source`/`-target` because it compiles against the older platform's API signatures.
:::

## Predict the output and find the bug {#ch01-reading .dr}

:::drill output
What does this print?

```java run=c01-d-intdiv
public class IntDiv {
    public static void main(String[] args) {
        System.out.println(7 / 2 + " " + 7 / 2.0 + " " + (-7) / 2 + " " + (-7) % 2);
        System.out.println(1.0 / 0 + " " + 0.0 / 0);
        try {
            System.out.println(1 / 0);
        } catch (ArithmeticException e) {
            System.out.println("ArithmeticException: " + e.getMessage());
        }
    }
}
```
---
**Answer.** `3 3.5 -3 -1`, then `Infinity NaN`, then `ArithmeticException: / by zero`. Integer division truncates towards zero and `%` takes the sign of the dividend; floating-point division by zero follows IEEE 754 and does not throw.

**Why.** `idiv` and `irem` are separate opcodes from `ddiv`, with different rules. Only integer division by zero throws.
:::

:::drill output
What does this print?

```java run=c01-d-overflow
public class Overflow {
    public static void main(String[] args) {
        int big = Integer.MAX_VALUE;
        long wrong = big * 2;
        long right = big * 2L;
        System.out.println(wrong + " " + right + " " + (int) 3_000_000_000L);
        System.out.println(Math.abs(Integer.MIN_VALUE) + " " + (byte) 200);
    }
}
```
---
**Answer.** `-2 4294967294 -1294967296`, then `-2147483648 -56`. `big * 2` is computed as an `int` (it overflows to −2) before being widened. `Math.abs(MIN_VALUE)` has no positive int representation and returns `MIN_VALUE`. Narrowing casts keep the low bits.

**Why.** Arithmetic type is decided by the operands, not the variable you assign to. `Math.multiplyExact` throws on overflow if you need a check.
:::

:::drill output
What does this print?

```java run=c01-d-chars
public class Chars {
    public static void main(String[] args) {
        char c = 'A';
        System.out.println(c + 1);
        System.out.println((char) (c + 1));
        System.out.println("" + c + 1);
        System.out.println('a' + 'b' + "c");
    }
}
```
---
**Answer.** `66`, `B`, `A1`, `195c`. `char + int` is an `int`; casting back gives a char; once a `String` is on the left, `+` concatenates; `'a' + 'b'` is integer addition (97 + 98) before it meets the string.

**Why.** `+` is evaluated left to right and its meaning depends on the operand types at each step.
:::

:::drill output
What does this print?

```java run=c01-d-ternary
public class Ternary {
    public static void main(String[] args) {
        Object o = true ? 1 : "one";
        Object p = true ? 1 : 2.0;
        Integer n = null;
        System.out.println(o + " " + p);
        try {
            int x = false ? 1 : n;
        } catch (NullPointerException e) {
            System.out.println("NullPointerException");
        }
    }
}
```
---
**Answer.** `1 1.0`, then `NullPointerException`. When both branches are numeric, the conditional expression has a numeric type after binary numeric promotion, so `1` becomes `1.0`. In the last line the result type is `int`, so `n` is unboxed, and unboxing `null` throws.

**Why.** JLS §15.25 types the conditional operator from both branches, even the one that is not taken.
:::

:::drill bug
This loop never terminates. Find the bug.

```java run=c01-d-bug-loop
public class Loop {
    public static void main(String[] args) {
        int count = 0;
        for (byte b = 0; b < 200 && count < 1000; b++) {
            count++;
        }
        System.out.println("iterations: " + count);
        int fixed = 0;
        for (int i = 0; i < 200; i++) {
            fixed++;
        }
        System.out.println("fixed: " + fixed);
    }
}
```
---
**Answer.** A `byte` ranges from −128 to 127, so `b < 200` is always true: `b++` wraps from 127 to −128. The guard `count < 1000` above is the only thing stopping it. Use an `int` counter.

**Why.** `b++` on a byte is `b = (byte) (b + 1)`, a narrowing conversion that wraps silently.
:::

:::drill bug
After a dependency upgrade, the application fails at run time with `NoSuchMethodError: 'void Lib.log(java.lang.String)'`, although the code compiles. What happened?

```java run=c01-d-bug-nsme
public class Binary {
    static class Lib {
        static void log(Object message) { System.out.println("log " + message); }
    }
    public static void main(String[] args) {
        Lib.log("hello");
    }
}
```
---
**Answer.** The calling code was compiled against an old `Lib` whose method was `log(String)`, so its bytecode refers to the descriptor `(Ljava/lang/String;)V`. The new library changed it to `log(Object)`. Recompiling the caller (as above) picks the new descriptor, but the old compiled caller still asks for the old one, which no longer exists.

**Why.** Method calls are linked by exact name and descriptor. Changing a parameter type is source compatible but **binary incompatible**.
:::

## Write the code {#ch01-coding .cd}

:::drill code rating=1300
Write a tiny class-file reader that prints the class's own name, superclass and method names by parsing the constant pool of a compiled class. Handle the constant pool tags used by ordinary classes.
---
```java run=c01-c-reader
import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Reader {
    void sample() {}
    static int other(int x) { return x; }

    public static void main(String[] args) throws IOException {
        DataInputStream in = new DataInputStream(new ByteArrayInputStream(Files.readAllBytes(Path.of("Reader.class"))));
        in.readInt(); in.readUnsignedShort(); in.readUnsignedShort();
        int count = in.readUnsignedShort();
        Object[] pool = new Object[count];
        for (int i = 1; i < count; i++) {
            int tag = in.readUnsignedByte();
            switch (tag) {
                case 1 -> pool[i] = in.readUTF();                                  // Utf8
                case 7, 8, 16, 19, 20 -> pool[i] = in.readUnsignedShort();         // Class, String, MethodType, Module, Package
                case 3, 4 -> in.readInt();                                         // Integer, Float
                case 5, 6 -> { in.readLong(); i++; }                               // Long, Double take two slots
                case 9, 10, 11, 12, 17, 18 -> in.readInt();                        // refs, NameAndType, (Invoke)Dynamic
                case 15 -> { in.readUnsignedByte(); in.readUnsignedShort(); }      // MethodHandle
                default -> throw new IOException("unknown tag " + tag);
            }
        }
        in.readUnsignedShort();
        String self = (String) pool[(Integer) pool[in.readUnsignedShort()]];
        String sup = (String) pool[(Integer) pool[in.readUnsignedShort()]];
        int interfaces = in.readUnsignedShort();
        for (int i = 0; i < interfaces; i++) in.readUnsignedShort();
        skipMembers(in, pool, null);
        List<String> methods = new ArrayList<>();
        skipMembers(in, pool, methods);
        System.out.println(self + " extends " + sup + " " + methods);
    }

    static void skipMembers(DataInputStream in, Object[] pool, List<String> names) throws IOException {
        int n = in.readUnsignedShort();
        for (int i = 0; i < n; i++) {
            in.readUnsignedShort();
            String name = (String) pool[in.readUnsignedShort()];
            String desc = (String) pool[in.readUnsignedShort()];
            if (names != null) names.add(name + desc);
            int attrs = in.readUnsignedShort();
            for (int a = 0; a < attrs; a++) {
                in.readUnsignedShort();
                in.skipBytes(in.readInt());
            }
        }
    }
}
```

Note the trap in the constant pool: `long` and `double` entries take **two** indexes, a design decision the JVM spec itself calls "a poor choice". Libraries such as ASM and the new `java.lang.classfile` API (preview in 22, final in 24) do this parsing for you.
:::

:::drill code rating=1200
Write a method that checks whether `a * b` overflows an `int` without using `long` or `Math.multiplyExact`, and test it against `multiplyExact`.
---
```java run=c01-c-overflow
public class MulCheck {
    static boolean overflows(int a, int b) {
        if (a == 0 || b == 0) return false;
        int r = a * b;
        return r / b != a || (a == -1 && b == Integer.MIN_VALUE) || (b == -1 && a == Integer.MIN_VALUE);
    }

    public static void main(String[] args) {
        int[][] cases = {{46341, 46341}, {46340, 46340}, {-1, Integer.MIN_VALUE}, {Integer.MAX_VALUE, -1}, {1 << 16, 1 << 15}, {7, -3}};
        for (int[] c : cases) {
            boolean exact;
            try { Math.multiplyExact(c[0], c[1]); exact = false; } catch (ArithmeticException e) { exact = true; }
            System.out.println(c[0] + " * " + c[1] + " overflows: " + overflows(c[0], c[1]) + " (multiplyExact agrees: " + (exact == overflows(c[0], c[1])) + ")");
        }
    }
}
```

Dividing the wrapped product back by `b` recovers `a` only if nothing was lost. The two `MIN_VALUE` cases need special handling because `MIN_VALUE * -1` wraps to itself and the division check cannot see it.
:::

:::drill code rating=1400
Show that a `tableswitch` is used for a dense `switch` and a `lookupswitch` for a sparse one, by compiling two methods and grepping `javap` output.
---
```java run=c01-c-switch cmd="javac -d . Switches.java && javap -c -p Switches | grep -E 'switch|static'"
public class Switches {
    static int dense(int x) {
        switch (x) {
            case 1: return 10;
            case 2: return 20;
            case 3: return 30;
            case 4: return 40;
            default: return 0;
        }
    }

    static int sparse(int x) {
        switch (x) {
            case 1: return 10;
            case 1000: return 20;
            case 1_000_000: return 30;
            default: return 0;
        }
    }
}
```

A `tableswitch` is an array of jump targets indexed by `x - low`: O(1). A `lookupswitch` is a sorted list of keys searched by the JVM (binary search in HotSpot's interpreter). `javac` picks whichever costs less in space and time. A `switch` on strings compiles to a `lookupswitch` on `hashCode()` followed by `equals` checks.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- `javac` → one `.class` per class: `CAFEBABE`, version (Java 21 = 65), constant pool, fields, methods with `Code` (bytecode, max stack, max locals, exception table).
- Descriptors: `I J Z B C S F D V`, `Lpkg/Name;`, `[` arrays; method `(params)return`.
- Stack machine: operands on the per-frame operand stack, values in numbered local slots; `this` is slot 0 in instance methods; `long`/`double` take two slots.
- Instructions are typed (`iadd` vs `ladd`); `i2l`, `l2i` conversions; integer `/ 0` throws, floating `/ 0` gives Infinity/NaN.
- Calls: `invokestatic`, `invokevirtual` (vtable), `invokeinterface` (itable), `invokespecial` (constructors, `super`), `invokedynamic` (bootstrap-linked: lambdas, concat, records, pattern switch).
- `new` + `dup` + `invokespecial <init>`: allocation and construction are separate.
- Verifier: type-safe bytecode, single pass with `StackMapTable`.
- Each thread has a Java stack of frames; `-Xss` sets its size; `StackOverflowError` on overflow.
- Changing a method's parameter types breaks already-compiled callers (`NoSuchMethodError`); use `--release N` to target older JVMs.
