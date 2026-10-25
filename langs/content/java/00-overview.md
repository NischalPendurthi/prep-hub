---
name: Java internals
short: Java
icon: Jv
version: OpenJDK 21 (HotSpot)
eyebrow: bytecode · class loading · heap · GC · JIT · memory model · locks
headline: See inside the <em>JVM</em>.
lede: Twelve chapters on how the JVM runs Java, for interviews that go past syntax. Each chapter explains one part of HotSpot, the JVM in OpenJDK, proves every claim with a program and its real output (including `javap` bytecode), and then gives you about twenty drills: concept checks, tricky questions, predict-the-output and find-the-bug snippets, and coding problems with reference solutions.
card: How HotSpot runs Java: bytecode and class loading, object layout and the heap, G1 and ZGC, the JIT, generics erasure, HashMap internals, the memory model, locks and virtual threads.
cta: Start with bytecode|#ch01; Jump to GC|#ch05; Mock rounds|#ch13
search: Search: invokedynamic, safepoint, volatile, treeify…
---

:::hero A small predict-the-output drill
```java run=home-hero
public class Hero {
    public static void main(String[] args) {
        Integer a = 127, b = 127, c = 128, d = 128;
        System.out.println((a == b) + " " + (c == d) + " " + c.equals(d));
    }
}
```

Autoboxing calls `Integer.valueOf`, which returns cached objects for −128 to 127. `==` on two boxed 128s compares two different objects. The output is **true false true**. Chapter 3 explains the cache and the heap layout behind it.
:::

## How to use the drills

Answer each drill out loud or on paper before you open it, and treat a wrong answer as the thing to revise. Every program was compiled with `javac` and run on OpenJDK 21 with the default G1 collector. Where a result depends on the JVM implementation or on flags rather than the Java language, the answer says so. Press <kbd>/</kbd> to search, and use the contents list on the right to move around a chapter.

## Suggested plan

| Week | Read | Drill |
|---|---|---|
| 1 | Ch 1–3 (bytecode, class loading, object layout) | All drills, then read `javap -c` for your own classes |
| 2 | Ch 4–6 (strings, GC, JIT) | GC and JIT drills, then write the leak detector and the warm-up benchmark |
| 3 | Ch 7–8 (generics, collections) | Collections drills, then implement the LRU map and the open-addressing map |
| 4 | Ch 9–11 (memory model, locks, virtual threads) | Concurrency drills, then the bounded buffer and the striped counter |
| 5 | Ch 12–13 | Lambdas and exceptions, then two timed mock rounds |

## Language, JVM and HotSpot

The Java Language Specification (JLS) defines the language, and the Java Virtual Machine Specification (JVMS) defines class files and bytecode. HotSpot is OpenJDK's implementation of the JVM, with its interpreter, the C1 and C2 JIT compilers, and the G1, ZGC, Parallel and Serial collectors. Object header sizes, the Integer cache's upper bound, lock implementation and GC behaviour are HotSpot details, and the guide marks them that way, so you can say "in HotSpot" in an interview.
