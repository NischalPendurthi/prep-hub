---
title: Strings
part: Part B · Runtime
lede: `String` is the most used class in Java and the one with the most hidden machinery: a constant pool and a runtime string table, compile-time folding, compact Latin-1 storage, cached hash codes and, since Java 9, concatenation compiled to `invokedynamic`. This chapter explains when two strings are the same object, what `intern` really does, how `+` is compiled, when `StringBuilder` still matters, and the Unicode details behind `length()` and `charAt`.
desc: String pool and intern, constant folding, compact strings, hashCode, indy concatenation, StringBuilder, UTF-16
hours: 3
prereqs: Chapters 1 and 3
---

## Literals, the string pool and intern {#ch04-pool .th}

A `String` is an immutable object holding a `byte[]` of characters, a coder flag and a cached hash. String **literals** are special: every literal in a class file is a constant-pool entry, and when the JVM first resolves it, it looks the text up in a global **string table** (the "string pool") and reuses the existing `String` object if there is one. So all identical literals in all classes of the program refer to one object.

```java run=c04-pool
public class Pool {
    static final String PREFIX = "hel";

    public static void main(String[] args) {
        String a = "hello";
        String b = "hel" + "lo";          // constant expression: folded by javac
        String part = "hel";
        String c = part + "lo";           // computed at run time: a new object
        String d = PREFIX + "lo";         // PREFIX is a constant variable: folded too
        String e = new String("hello");   // always a new object
        System.out.println((a == b) + " " + (a == c) + " " + (a == d) + " " + (a == e));
        System.out.println((a == c.intern()) + " " + (a == e.intern()) + " " + a.equals(c));
    }
}
```

- `"hel" + "lo"` and `PREFIX + "lo"` are **constant expressions**, so `javac` folds them into the single literal `"hello"`.
- `part + "lo"` uses a local variable that is not `final`, so the concatenation happens at run time and produces a new object.
- `new String("hello")` always copies.
- `intern()` returns the canonical object from the string table, adding the string first if it is not there.

Since Java 7 the string table lives in the **heap** (it was in PermGen before), so interned strings are garbage collected like other objects once nothing refers to them. Its default bucket count is 65,536 and can be changed with `-XX:StringTableSize`.

:::trap
Compare strings with `equals`, never `==`. `==` "works" for literals and constants, which is why the bug survives code review, and fails for any string read from a file, a request or a database.
:::

### When to intern

Interning saves memory when a program holds many equal strings that were built at run time, such as repeated field names in parsed records, at the cost of a hash-table lookup per call. G1 also offers automatic **string deduplication** (`-XX:+UseStringDeduplication`): during collections it finds strings with equal contents and makes them share one `byte[]`, without changing identity.

## How a String is stored {#ch04-compact .th}

Before Java 9 a `String` held a `char[]`, two bytes per character. **Compact strings** (JEP 254, Java 9) changed the field to a `byte[] value` plus a `coder`: if every character fits in Latin-1 (U+0000 to U+00FF), the string uses one byte per character; otherwise it uses UTF-16, two bytes per `char`. Most strings in typical programs are Latin-1, so this roughly halves their memory.

```java run=c04-compact
import java.lang.management.ManagementFactory;

public class Compact {
    static long allocated() {
        return ((com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean()).getCurrentThreadAllocatedBytes();
    }

    static long cost(String template) {
        String[] keep = new String[1000];
        for (int i = 0; i < keep.length; i++) keep[i] = new String(template.toCharArray());
        long t0 = allocated();
        for (int i = 0; i < keep.length; i++) keep[i] = new String(template.toCharArray());
        return (allocated() - t0) / keep.length;
    }

    public static void main(String[] args) throws Exception {
        System.out.println(String.class.getDeclaredField("value").getType().getSimpleName());
        String latin = "a".repeat(100);
        String greek = "α".repeat(100);
        System.out.println("100 Latin-1 chars: " + cost(latin) + " bytes allocated (incl. a temporary char[])");
        System.out.println("100 Greek chars:   " + cost(greek) + " bytes allocated (incl. a temporary char[])");
        String mixed = "a".repeat(99) + "α";
        System.out.println(mixed.length() + " chars, one non-Latin-1 char makes the whole string UTF-16: " + cost(mixed));
    }
}
```

Each measurement includes the temporary `char[]` that `toCharArray` creates (16 + 200 bytes), the `String` object itself, and its `value` array: 100 bytes for the Latin-1 string, 200 for the others. As in Python, a single wide character widens the whole string.

### Immutability and the cached hash

A `String` never changes after construction, which allows sharing (the pool), safe use as a `HashMap` key, safe sharing between threads without synchronisation, and caching of the hash code. `hashCode()` is computed on first call as `s[0]*31^(n-1) + … + s[n-1]` and stored in a field; a string whose hash happens to be 0 is recomputed every time unless the `hashIsZero` flag is set (added in Java 13).

```java run=c04-hash
public class Hash {
    public static void main(String[] args) {
        System.out.println("Aa".hashCode() + " " + "BB".hashCode() + " " + "AaAa".hashCode() + " " + "BBBB".hashCode() + " " + "AaBB".hashCode());
        int h = 0;
        for (char ch : "abc".toCharArray()) h = 31 * h + ch;
        System.out.println(h + " " + "abc".hashCode());
        System.out.println("".hashCode() + " " + "polygenelubricants".hashCode());
    }
}
```

`"Aa"` and `"BB"` collide, and so does every string built from those two blocks, which is how hash-flooding attacks against Java web servers were built. The last line shows another classic: `"polygenelubricants".hashCode()` is `Integer.MIN_VALUE`, and `Math.abs(Integer.MIN_VALUE)` is still negative, so code that picks a shard with `Math.abs(key.hashCode()) % n` can get a negative index. Use `Math.floorMod(h, n)` instead. `HashMap` defends itself by turning long collision chains into balanced trees (Chapter 8).

## How + is compiled {#ch04-concat .th}

Before Java 9, `javac` compiled `a + b + c` into `new StringBuilder().append(a).append(b).append(c).toString()`. Since Java 9 (JEP 280) it emits a single `invokedynamic` call to `StringConcatFactory.makeConcatWithConstants`, passing a recipe such as `"\u0001 has \u0001 items"`, where each `\u0001` marks an argument. On first execution the bootstrap method builds an optimised method handle that sizes the result exactly and copies each part once.

```java run=c04-indy cmd="javac -d . Concat.java && javap -c -p Concat | grep -E 'invokedynamic|StringBuilder' && java -cp . Concat"
public class Concat {
    static String describe(String name, int count) {
        return name + " has " + count + " items";
    }

    static String loop(int n) {
        String s = "";
        for (int i = 0; i < n; i++) s += i;
        return s;
    }

    public static void main(String[] args) {
        System.out.println(describe("cart", 3) + " | " + loop(5));
    }
}
```

Both methods use `invokedynamic`, and neither mentions `StringBuilder`. The new strategy makes single expressions fast, but it does not fix concatenation **in a loop**: each `s += i` still creates a new string and copies everything built so far, so the loop is O(n²).

```java run=c04-loop nondet
public class LoopConcat {
    public static void main(String[] args) {
        int n = 20_000;
        for (int round = 0; round < 2; round++) {
            long t0 = System.nanoTime();
            String s = "";
            for (int i = 0; i < n; i++) s += 'x';
            long plus = System.nanoTime() - t0;
            t0 = System.nanoTime();
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < n; i++) sb.append('x');
            String t = sb.toString();
            long builder = System.nanoTime() - t0;
            System.out.printf("+= %.1f ms, StringBuilder %.2f ms, same=%b%n", plus / 1e6, builder / 1e6, s.equals(t));
        }
    }
}
```

`StringBuilder` keeps a growable byte array (doubling plus 2 when full) and copies each appended part once, so the loop is linear. Give it an initial capacity when you know the approximate size.

:::key
Use `+` for single expressions (it compiles to the fastest code), `StringBuilder` for loops, and `String.join` or `Collectors.joining` for lists. `StringBuffer` is the synchronised legacy version and is almost never what you want.
:::

## Characters, code points and UTF-16 {#ch04-unicode .th}

A Java `char` is a 16-bit **UTF-16 code unit**, not a character. Characters outside the Basic Multilingual Plane (emoji, many CJK extensions, historic scripts) take two `char`s, a **surrogate pair**. `length()` and `charAt()` count code units:

```java run=c04-utf16
import java.nio.charset.StandardCharsets;

public class Utf16 {
    public static void main(String[] args) {
        String s = "a😀é";
        System.out.println(s.length() + " " + s.codePointCount(0, s.length()));
        System.out.println(Integer.toHexString(s.charAt(1)) + " " + Character.isHighSurrogate(s.charAt(1)));
        s.codePoints().forEach(cp -> System.out.print(Character.getName(cp) + "; "));
        System.out.println();
        System.out.println(s.getBytes(StandardCharsets.UTF_8).length + " UTF-8 bytes, " + s.getBytes(StandardCharsets.UTF_16BE).length + " UTF-16 bytes");
        System.out.println(new StringBuilder(s).reverse() + " " + new StringBuilder("ab😀").reverse().codePointAt(0));
        System.out.println("é".equals("é") + " " + java.text.Normalizer.normalize("é", java.text.Normalizer.Form.NFC).equals("é"));
    }
}
```

`StringBuilder.reverse` is careful to keep surrogate pairs together, but naive code that reverses `char`s splits them. The same normalisation issue as in Python applies: `é` can be one or two code points.

## Concept and tricky questions {#ch04-concept .dr}

:::drill concept
Where do string literals live, and why does `"a" == "a"` compare true across different classes?
---
**Answer.** Literals are constant-pool entries; when resolved, the JVM looks them up in the global string table (on the heap since Java 7) and reuses the existing object, so every identical literal in the program is the same `String`.

**Why.** The JLS requires literals and constant expressions to be interned (§3.10.5).
:::

:::drill tricky
`String s = "hel"; String t = s + "lo";` Is `t == "hello"`? What if `s` is declared `final`?
---
**Answer.** Not with a plain local: the concatenation runs at run time and creates a new object. If `s` is `final` (and initialised with a constant), it is a constant variable, `s + "lo"` becomes a constant expression folded to `"hello"`, and `==` is true.

**Why.** Constant folding depends on whether each operand is a compile-time constant (JLS §15.29).
:::

:::drill concept
What changed in String's internal representation in Java 9, and why?
---
**Answer.** Compact strings: the `char[]` became a `byte[]` plus a `coder`. Strings whose characters all fit in Latin-1 store one byte per character; others use UTF-16 with two bytes per `char`.

**Why.** Heap dumps showed most strings were Latin-1, so this cut their memory roughly in half, and also made many operations faster due to less memory traffic.
:::

:::drill concept
How is `a + b + c` compiled since Java 9, and does that make `+=` in a loop efficient?
---
**Answer.** As one `invokedynamic` to `StringConcatFactory.makeConcatWithConstants` with a recipe; the bootstrap method links an optimised concatenation. It does not fix loops: each `+=` is a separate concatenation that copies the whole accumulated string, O(n²) in total.

**Why.** The JIT cannot merge iterations of the loop into one builder. Use `StringBuilder` in loops.
:::

:::drill tricky
Why is the `String` hash code cached, and why can a string with hash 0 be slower?
---
**Answer.** Strings are immutable, so the hash cannot change; it is computed lazily on the first `hashCode()` call and stored in the `hash` field. Before Java 13 a string whose hash was genuinely 0 looked "not computed yet" and was rehashed on every call; Java 13 added a `hashIsZero` flag to fix that.

**Why.** Cached hashes make strings cheap `HashMap` keys after the first lookup.
:::

:::drill concept
What is the difference between `length()`, `codePointCount()` and the number of bytes in UTF-8?
---
**Answer.** `length()` counts UTF-16 code units (`char`s); `codePointCount` counts Unicode code points (a surrogate pair counts once); UTF-8 byte length depends on each code point (1 to 4 bytes).

**Why.** Database column limits and protocol headers are usually in bytes, validation rules in characters, and UI limits in graphemes. Mixing them up truncates text in the middle of an emoji.
:::

:::drill tricky
Is `String.intern()` a good way to save memory?
---
**Answer.** Sometimes. It helps when many equal strings are created at run time and kept for a long time. It costs a hash lookup in the string table per call, the table needs sizing (`-XX:StringTableSize`) for very many strings, and G1's string deduplication often gives most of the saving automatically.

**Why.** Interned strings are collectable since Java 7, so interning no longer leaks PermGen, which was the old objection.
:::

## Predict the output and find the bug {#ch04-reading .dr}

:::drill output
What does this print?

```java run=c04-d-identity
public class Identity {
    public static void main(String[] args) {
        String a = "java";
        String b = new String("java");
        String c = b.intern();
        String d = "ja" + "va";
        String half = "ja";
        String e = half + "va";
        System.out.println((a == b) + " " + (a == c) + " " + (a == d) + " " + (a == e) + " " + a.equals(e));
    }
}
```
---
**Answer.** `false true true false true`. `new String` copies; `intern` returns the pooled literal; `"ja" + "va"` is folded at compile time; `half + "va"` is computed at run time.

**Why.** Only literals, constant expressions and `intern()` results are guaranteed to be the pooled object.
:::

:::drill output
What does this print?

```java run=c04-d-plus
public class Plus {
    public static void main(String[] args) {
        System.out.println(1 + 2 + "3" + 4 + 5);
        System.out.println("" + null + 'c' + 1.0f + true);
        char[] chars = {'h', 'i'};
        System.out.println("chars: " + String.valueOf(chars) + " " + chars.length);
        Object nothing = null;
        System.out.println("value=" + nothing);
    }
}
```
---
**Answer.** `3345`, then `nullc1.0true`, `chars: hi 2`, `value=null`. `+` is left-associative: `1 + 2` is integer addition before the string appears. Concatenation converts `null` to `"null"` instead of throwing.

**Why.** Concatenating a `char[]` directly (`"x" + chars`) would print the array's identity, like `[C@1b6d3586`; `String.valueOf(char[])` builds the text.
:::

:::drill output
What does this print?

```java run=c04-d-split
import java.util.Arrays;

public class Split {
    public static void main(String[] args) {
        System.out.println(Arrays.toString("a,b,,c,,".split(",")));
        System.out.println(Arrays.toString("a,b,,c,,".split(",", -1)));
        System.out.println(Arrays.toString("1.2.3".split(".")) + " " + Arrays.toString("1.2.3".split("\\.")));
        System.out.println("  x  ".trim().length() + " " + " x ".trim().length() + " " + " x ".strip().length());
    }
}
```
---
**Answer.** `[a, b, , c]` (trailing empty strings removed), `[a, b, , c, , ]` with a negative limit, `[] [1, 2, 3]` because `split` takes a regex and `.` matches every character, then `1 3 1`: `trim` removes only characters ≤ U+0020, while `strip` (Java 11) removes all Unicode whitespace, including the em space U+2003.

**Why.** `split` is regex-based and drops trailing empties by default, two surprises that cause real parsing bugs.
:::

:::drill output
What does this print?

```java run=c04-d-switch
public class SwitchString {
    static String kind(String s) {
        return switch (s) {
            case "Aa" -> "first";
            case "BB" -> "second";
            default -> "other";
        };
    }

    public static void main(String[] args) {
        System.out.println(kind("Aa") + " " + kind("BB") + " " + kind("Ab") + " " + ("Aa".hashCode() == "BB".hashCode()));
    }
}
```
---
**Answer.** `first second other true`. A string `switch` first switches on `hashCode()` and then confirms with `equals`, so colliding hashes still pick the right case.

**Why.** `javap -c` on such a switch shows a `lookupswitch` on the hash followed by `equals` calls; a `null` selector throws `NullPointerException` unless there is a `case null` (Java 21 pattern switch).
:::

:::drill bug
A log formatter is the top CPU consumer in a profile. Find the problem and fix it.

```java run=c04-d-bug-log
import java.util.*;

public class LogFormat {
    static String formatSlow(List<String> fields) {
        String line = "";
        for (String f : fields) line += f + "|";
        return line;
    }

    static String format(List<String> fields) {
        StringBuilder sb = new StringBuilder(fields.size() * 16);
        for (String f : fields) sb.append(f).append('|');
        return sb.toString();
    }

    public static void main(String[] args) {
        List<String> fields = new ArrayList<>();
        for (int i = 0; i < 5000; i++) fields.add("field" + i);
        System.out.println(formatSlow(fields).equals(format(fields)) + " " + format(fields).length());
    }
}
```
---
**Answer.** `line += …` in a loop copies the whole line on every iteration, O(n²) in the number of fields. Build it with a `StringBuilder` (pre-sized when possible), or `String.join("|", fields) + "|"`.

**Why.** Indy concatenation optimises each expression, not the loop around it.
:::

:::drill bug
A truncation helper corrupts names containing emoji. Fix it.

```java run=c04-d-bug-truncate
public class Truncate {
    static String truncateBroken(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }

    static String truncate(String s, int maxCodePoints) {
        if (s.codePointCount(0, s.length()) <= maxCodePoints) return s;
        return s.substring(0, s.offsetByCodePoints(0, maxCodePoints));
    }

    public static void main(String[] args) {
        String name = "Ana😀Bo";
        String broken = truncateBroken(name, 4);
        System.out.println(broken.length() + " " + Character.isHighSurrogate(broken.charAt(3)));
        System.out.println(truncate(name, 4) + " " + truncate(name, 4).codePointCount(0, truncate(name, 4).length()));
    }
}
```
---
**Answer.** `substring(0, 4)` cuts between the two halves of the emoji's surrogate pair, leaving a lone high surrogate, which prints as `?` or breaks encoders. Count in code points with `offsetByCodePoints`.

**Why.** `char` indexes are UTF-16 code units. For user-visible limits, graphemes (`BreakIterator`) are even more correct.
:::

## Write the code {#ch04-coding .cd}

:::drill code rating=1300
Write `Interner<T>`, a thread-safe canonicalising map (like `String.intern` for any immutable value) that returns the first instance seen for each equal value, using `ConcurrentHashMap.putIfAbsent`. Show that it de-duplicates strings built at run time.
---
```java run=c04-c-interner
import java.util.concurrent.ConcurrentHashMap;

public class InternerDemo {
    static final class Interner<T> {
        private final ConcurrentHashMap<T, T> map = new ConcurrentHashMap<>();
        T intern(T value) {
            T existing = map.putIfAbsent(value, value);
            return existing == null ? value : existing;
        }
        int size() { return map.size(); }
    }

    public static void main(String[] args) {
        Interner<String> interner = new Interner<>();
        String[] built = new String[6];
        for (int i = 0; i < built.length; i++) built[i] = interner.intern(new StringBuilder("status-").append(i % 2).toString());
        System.out.println((built[0] == built[2]) + " " + (built[1] == built[3]) + " " + (built[0] == built[1]) + " size=" + interner.size());
    }
}
```

Unlike the JVM's string table, this map keeps every value alive forever; Guava's `Interners.newWeakInterner()` uses weak references to avoid that.
:::

:::drill code rating=1400
Write `reverseGraphemeSafe(String)` that reverses a string by code points (keeping surrogate pairs and combining marks with their base character) using `BreakIterator.getCharacterInstance()`, and compare it with reversing `char`s naively.
---
```java run=c04-c-reverse
import java.text.BreakIterator;
import java.util.*;

public class Reverse {
    static String naive(String s) {
        char[] c = s.toCharArray();
        for (int i = 0, j = c.length - 1; i < j; i++, j--) { char t = c[i]; c[i] = c[j]; c[j] = t; }
        return new String(c);
    }

    static String graphemes(String s) {
        BreakIterator it = BreakIterator.getCharacterInstance();
        it.setText(s);
        List<String> parts = new ArrayList<>();
        for (int start = it.first(), end = it.next(); end != BreakIterator.DONE; start = end, end = it.next())
            parts.add(s.substring(start, end));
        Collections.reverse(parts);
        return String.join("", parts);
    }

    public static void main(String[] args) {
        String s = "aé😀z";
        String n = naive(s);
        System.out.println(n.codePoints().anyMatch(cp -> cp >= Character.MIN_SURROGATE && cp <= Character.MAX_SURROGATE));
        String g = graphemes(s);
        System.out.println(g.equals("z😀éa") + " " + g.codePointCount(0, g.length()));
    }
}
```

The naive reversal swaps the two halves of the emoji, leaving an invalid sequence, and moves the combining accent onto the wrong letter. Reversing grapheme clusters keeps `e` + accent and the emoji intact.
:::

:::drill code rating=1200
Show that string `switch` and `String.hashCode` collisions do not break correctness: generate 8 strings that all have the same hash code using the "Aa"/"BB" blocks, put them in a `HashSet`, and check they are all distinct and all found.
---
```java run=c04-c-collide
import java.util.*;

public class Collide {
    public static void main(String[] args) {
        List<String> strings = new ArrayList<>();
        for (int mask = 0; mask < 8; mask++) {
            StringBuilder sb = new StringBuilder();
            for (int bit = 0; bit < 3; bit++) sb.append((mask >> bit & 1) == 0 ? "Aa" : "BB");
            strings.add(sb.toString());
        }
        Set<Integer> hashes = new HashSet<>();
        for (String s : strings) hashes.add(s.hashCode());
        Set<String> set = new HashSet<>(strings);
        boolean all = true;
        for (String s : strings) all &= set.contains(s);
        System.out.println(strings + " distinct hashes=" + hashes.size() + " set size=" + set.size() + " all found=" + all);
    }
}
```

Because `"Aa"` and `"BB"` have equal hashes and the hash is a polynomial in 31, any concatenation of k such blocks gives 2<sup>k</sup> strings with one hash. `HashMap` still works, only slower, and since Java 8 a bucket with many keys becomes a red-black tree ordered by `compareTo` when the keys are `Comparable`, so lookups stay O(log n).
:::

## Cheat sheet {#ch04-cheatsheet .th}

- Literals and constant expressions are pooled (string table on the heap since Java 7); `new String(…)` and run-time concatenation create new objects; `intern()` returns the pooled one.
- Constant variables (`final` + constant initialiser) fold: `final String p = "a"; p + "b"` is the literal `"ab"`.
- Compact strings (Java 9): `byte[] value` + `coder`; Latin-1 = 1 byte/char, otherwise UTF-16 = 2 bytes/char; one wide char widens the string.
- `hashCode` = Σ s[i]·31^(n−1−i), cached; `"Aa"` and `"BB"` collide.
- `+` compiles to `invokedynamic` `makeConcatWithConstants` (Java 9+); `+=` in a loop is still O(n²) — use `StringBuilder` (pre-size it).
- `char` = UTF-16 code unit; emoji are surrogate pairs; use `codePoints()`, `codePointCount`, `offsetByCodePoints`; `BreakIterator` for graphemes.
- `split` takes a regex and drops trailing empties (use limit −1); `strip()` handles Unicode whitespace, `trim()` does not.
- String `switch` = `hashCode` switch + `equals`; `null` selector throws unless `case null`.
- Compare with `equals`; `==` works only by accident of pooling.
