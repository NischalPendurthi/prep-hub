---
title: Generics and type erasure
part: Part C · The type system
lede: Java generics are checked by the compiler and then erased: at run time a `List<String>` and a `List<Integer>` are the same class, and the compiler quietly inserts casts and bridge methods to make the erased code behave. This chapter shows what erasure leaves in the bytecode, why you cannot write `new T()` or `instanceof List<String>`, how heap pollution lets a `ClassCastException` appear far from its cause, and how wildcards, PECS and the variance of arrays and generics fit together.
desc: Erasure, inserted casts, bridge methods, heap pollution, wildcards and PECS, arrays vs generics, type tokens
hours: 3
prereqs: Chapter 1
---

## Erasure {#ch07-erasure .th}

Generics were added in Java 5 in a way that kept old class files and old JVMs working. The compiler type-checks generic code, then **erases** the type parameters: each type variable becomes its bound (`Object`, or the first bound in `<T extends Number>`), and parameterised types become their raw class. To keep the program type-correct after erasure, `javac` inserts **casts** where values come out of generic code.

```java run=c07-erasure cmd="javac -d . Erasure.java && java -cp . Erasure && javap -c -p Erasure | grep -E 'checkcast|invokeinterface'"
import java.util.*;

public class Erasure {
    static <T extends Number> double first(List<T> xs) {
        return xs.get(0).doubleValue();
    }

    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("ada"));
        List<Integer> nums = new ArrayList<>(List.of(1));
        System.out.println(names.getClass() == nums.getClass());
        String s = names.get(0);
        System.out.println(s.toUpperCase() + " " + first(nums));
    }
}
```

The `checkcast java/lang/String` after `List.get` is the cast the compiler inserted for `String s = names.get(0)`; inside `first`, `T` erased to `Number`, so the cast is to `Number`. At run time both lists are plain `ArrayList`s.

### What erasure forbids

Because the type argument does not exist at run time:

- `new T()`, `new T[10]`: there is no class to instantiate. Pass a `Supplier<T>` or a `Class<T>` instead.
- `x instanceof List<String>`: not checkable (allowed only as `instanceof List<?>`).
- Overloads that differ only in type arguments: `void f(List<String>)` and `void f(List<Integer>)` erase to the same signature, a compile error ("name clash").
- Primitive type arguments: `List<int>` is impossible, hence boxing (Chapter 3). Project Valhalla aims to lift this.
- A static field cannot use the class's type parameter, because all parameterisations share one class and one static field.

```java run=c07-forbidden
import java.util.*;
import java.util.function.Supplier;

public class Forbidden {
    static <T> List<T> filled(int n, Supplier<T> make) {
        List<T> out = new ArrayList<>(n);
        for (int i = 0; i < n; i++) out.add(make.get());
        return out;
    }

    @SuppressWarnings("unchecked")
    static <T> T[] newArray(Class<T> type, int n) {
        return (T[]) java.lang.reflect.Array.newInstance(type, n);
    }

    public static void main(String[] args) {
        System.out.println(filled(3, StringBuilder::new).size() + " " + newArray(String.class, 2).getClass().getSimpleName());
        Object o = List.of("x");
        System.out.println(o instanceof List<?> l && !l.isEmpty() && l.get(0) instanceof String);
    }
}
```

### What survives: signatures

Erasure removes type arguments from the **bytecode that runs**, but class files keep generic **signatures** of classes, fields and methods as metadata, which reflection can read. That is how frameworks such as Jackson know that a field is a `List<Address>`:

```java run=c07-signatures
import java.lang.reflect.*;
import java.util.*;

public class Signatures {
    static class Customer {
        List<String> tags;
        Map<String, List<Integer>> scores;
    }

    static abstract class TypeRef<T> {
        final Type type = ((ParameterizedType) getClass().getGenericSuperclass()).getActualTypeArguments()[0];
    }

    public static void main(String[] args) throws Exception {
        for (Field f : Customer.class.getDeclaredFields()) System.out.println(f.getName() + ": " + f.getGenericType());
        System.out.println(new TypeRef<Map<String, Integer>>() {}.type);
    }
}
```

The `TypeRef` trick (a "super type token") works because an anonymous subclass records its generic superclass, `TypeRef<Map<String, Integer>>`, in its class file. Jackson's `TypeReference` and Guava's `TypeToken` are built this way.

## Bridge methods {#ch07-bridges .th}

When a class implements a generic interface, erasure can make its method signature differ from the interface's erased one. `Comparable<T>` erases to `compareTo(Object)`, but `Version implements Comparable<Version>` declares `compareTo(Version)`. To make the override work for callers that only know `Comparable`, `javac` generates a synthetic **bridge method** `compareTo(Object)` that casts and calls the real one:

```java run=c07-bridge cmd="javac -d . -XDsuppressNotes Bridge.java && java -cp . Bridge && javap -p 'Bridge$Version' | grep compareTo"
import java.lang.reflect.Method;

public class Bridge {
    record Version(int major, int minor) implements Comparable<Version> {
        public int compareTo(Version o) {
            return major != o.major ? Integer.compare(major, o.major) : Integer.compare(minor, o.minor);
        }
    }

    public static void main(String[] args) {
        for (Method m : Version.class.getDeclaredMethods())
            if (m.getName().equals("compareTo"))
                System.out.println(m.getParameterTypes()[0].getSimpleName() + " bridge=" + m.isBridge());
        Comparable raw = new Version(1, 2);
        try {
            raw.compareTo("not a version");
        } catch (ClassCastException e) {
            System.out.println("ClassCastException from the bridge's cast");
        }
    }
}
```

The bridge is why a raw `Comparable` call with the wrong type fails with `ClassCastException` instead of silently comparing nonsense. Bridges also implement **covariant return types**: overriding `Object clone()` with `Point clone()` generates a bridge `Object clone()`.

## Heap pollution {#ch07-pollution .th}

**Heap pollution** happens when a variable of a parameterised type refers to an object that is not of that type, which is only possible through raw types, unchecked casts or generic varargs. The compiler warns ("unchecked"), and the program fails later, at the inserted cast, far from the line that caused it:

```java run=c07-pollution
import java.util.*;

public class Pollution {
    @SuppressWarnings({"unchecked", "rawtypes"})
    static void legacyAdd(List list) {
        list.add(42);                    // raw type: no check
    }

    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("ada");
        legacyAdd(names);                // heap pollution happens here
        System.out.println(names.size() + " " + names);
        try {
            for (String n : names) System.out.println(n.length());
        } catch (ClassCastException e) {
            System.out.println("ClassCastException: " + e.getMessage().split(" \\(")[0]);
        }
        List<String> safe = Collections.checkedList(new ArrayList<>(), String.class);
        try {
            legacyAdd(safe);
        } catch (ClassCastException e) {
            System.out.println("checkedList caught it at insertion time");
        }
    }
}
```

`println(names)` works because `toString` does not cast; the crash happens in the `for` loop, where the compiler inserted a cast to `String`. `Collections.checkedList` moves the check to the insertion, which is useful when passing collections to legacy code.

## Variance: wildcards and arrays {#ch07-variance .th}

### Generics are invariant

`Integer` is a subtype of `Number`, but `List<Integer>` is **not** a subtype of `List<Number>`. If it were, you could add a `Double` to a list of integers through the `List<Number>` view. Wildcards express the safe forms of variance:

- `List<? extends Number>`: a list of some subtype of `Number`. You can **read** `Number`s from it, but you cannot add anything except `null`. It is a **producer**.
- `List<? super Integer>`: a list of some supertype of `Integer`. You can **add** `Integer`s, but reading gives only `Object`. It is a **consumer**.

That is **PECS**: *Producer `extends`, Consumer `super`*. `Collections.copy(List<? super T> dest, List<? extends T> src)` is the textbook example.

```java run=c07-pecs
import java.util.*;

public class Pecs {
    static double sum(Collection<? extends Number> xs) {
        double s = 0;
        for (Number n : xs) s += n.doubleValue();
        return s;
    }

    static void fill(List<? super Integer> out, int n) {
        for (int i = 0; i < n; i++) out.add(i);
    }

    static <T extends Comparable<? super T>> T max(Collection<? extends T> xs) {
        Iterator<? extends T> it = xs.iterator();
        T best = it.next();
        while (it.hasNext()) { T x = it.next(); if (x.compareTo(best) > 0) best = x; }
        return best;
    }

    public static void main(String[] args) {
        List<Integer> ints = List.of(1, 2, 3);
        List<Double> doubles = List.of(1.5, 2.5);
        System.out.println(sum(ints) + " " + sum(doubles));
        List<Number> numbers = new ArrayList<>();
        List<Object> objects = new ArrayList<>();
        fill(numbers, 3);
        fill(objects, 2);
        System.out.println(numbers + " " + objects + " " + max(ints) + " " + max(List.of("pear", "apple")));
    }
}
```

`<T extends Comparable<? super T>>` lets `max` work for a class that inherits `compareTo` from a superclass, such as `java.sql.Timestamp`, which is `Comparable<Date>`.

### Arrays are covariant

Arrays went the other way: `Integer[]` **is** a subtype of `Object[]`. To keep that safe, arrays know their element type at run time (they are **reified**) and check every store, throwing `ArrayStoreException`:

```java run=c07-arrays
import java.util.*;

public class Arrays2 {
    public static void main(String[] args) {
        Object[] objects = new Integer[2];
        objects[0] = 1;
        try {
            objects[1] = "two";
        } catch (ArrayStoreException e) {
            System.out.println("ArrayStoreException: " + e.getMessage());
        }
        List<Integer> ints = new ArrayList<>();
        // List<Object> objs = ints;        // does not compile: generics are invariant
        List<? extends Object> view = ints;  // fine, but read-only
        System.out.println(view.size() + " " + objects.getClass().getSimpleName());
    }
}
```

This difference is why generic arrays are a mess: `new List<String>[10]` is illegal, because the array could not check that its elements are `List<String>` rather than any `List`. Prefer `List<List<String>>`.

## Concept and tricky questions {#ch07-concept .dr}

:::drill concept
What is type erasure, and what does the compiler add to make erased code type-safe?
---
**Answer.** After type-checking, the compiler replaces type variables with their bounds and parameterised types with raw types. It inserts casts (`checkcast`) where values of a type variable are used as a specific type, and bridge methods where erasure changes an overriding method's signature.

**Why.** Erasure gave binary compatibility with pre-generics code and JVMs; the price is that type arguments are not available at run time.
:::

:::drill tricky
Why can you not write `if (x instanceof List<String>)`, and what can you write instead?
---
**Answer.** At run time the object is just a `List`; the type argument was erased, so the JVM cannot check it. Use `x instanceof List<?>` and check the elements, or keep the type information elsewhere (a `Class<T>` token or a wrapper type).

**Why.** Only reifiable types (raw types, unbounded wildcards, non-generic types, arrays of those) can be used with `instanceof`.
:::

:::drill concept
What is a bridge method? Give an example where `javac` generates one.
---
**Answer.** A synthetic method that `javac` adds so that a method overriding a generic or covariant signature also overrides the erased one. `class V implements Comparable<V> { int compareTo(V o) }` gets a bridge `compareTo(Object o) { return compareTo((V) o); }`.

**Why.** Without it, code calling `Comparable.compareTo(Object)` would not dispatch to your method. Reflection shows bridges with `Method.isBridge()`.
:::

:::drill concept
Explain PECS with the signature of `Collections.copy`.
---
**Answer.** `copy(List<? super T> dest, List<? extends T> src)`: the source **produces** `T`s (read only, so `extends`), the destination **consumes** `T`s (write only, so `super`). That lets you copy a `List<Integer>` into a `List<Number>`.

**Why.** Wildcards make APIs flexible for callers while keeping them type-safe; if a parameter is both read and written, use an exact type.
:::

:::drill tricky
`Integer[]` is a subtype of `Object[]`, but `List<Integer>` is not a subtype of `List<Object>`. Why the difference?
---
**Answer.** Arrays are covariant and reified: they check each store at run time and throw `ArrayStoreException`. Generics are erased, so they cannot check at run time and must instead be invariant at compile time to stay safe.

**Why.** Covariant arrays were a decision made in Java 1.0 so that methods like `Arrays.sort(Object[])` could work before generics existed.
:::

:::drill concept
What is heap pollution and how do you usually cause it?
---
**Answer.** A situation where a variable of a parameterised type refers to an object of the wrong type. It is caused by raw types, unchecked casts, or generic varargs (`T...` creates a `T[]` that is really an `Object[]`). The error appears later as a `ClassCastException` at a compiler-inserted cast.

**Why.** Every "unchecked" warning is a place where heap pollution is possible; `@SafeVarargs` asserts that a varargs method does not pollute.
:::

:::drill tricky
How do frameworks like Jackson deserialise into `List<Address>` if generics are erased?
---
**Answer.** Generic **signatures** of fields, methods and superclasses are kept in class files as metadata. Reflection (`Field.getGenericType`, `Class.getGenericSuperclass`) returns `ParameterizedType`s. Callers pass a super type token, an anonymous subclass like `new TypeReference<List<Address>>() {}`, whose superclass signature records the full type.

**Why.** Erasure affects what objects know at run time, not what declarations say.
:::

## Predict the output and find the bug {#ch07-reading .dr}

:::drill output
What does this print?

```java run=c07-d-static
import java.util.*;

public class StaticShared {
    static class Box<T> {
        static int created = 0;
        final T value;
        Box(T value) { this.value = value; created++; }
    }

    public static void main(String[] args) {
        new Box<String>("a");
        new Box<Integer>(1);
        new Box<List<String>>(List.of());
        System.out.println(Box.created + " " + (new Box<>("x").getClass() == new Box<>(2).getClass()));
    }
}
```
---
**Answer.** `3 true`, and after the last line `created` is 5. All parameterisations share one class, so one static counter, and their `getClass()` is the same object.

**Why.** There is exactly one `Box` class at run time.
:::

:::drill output
What does this print?

```java run=c07-d-overload
import java.util.*;

public class Overload {
    static String kind(Collection<?> c) { return "collection"; }
    static String kind(List<?> l) { return "list"; }
    static String kind(Object o) { return "object"; }

    public static void main(String[] args) {
        Collection<String> c = new ArrayList<>();
        List<String> l = new ArrayList<>();
        Object o = l;
        System.out.println(kind(c) + " " + kind(l) + " " + kind(o) + " " + kind(new HashSet<>()));
    }
}
```
---
**Answer.** `collection list object collection`. Overloads are chosen at compile time from the **static** types of the arguments, not the runtime class, so the `ArrayList` declared as `Collection` picks the `Collection` overload.

**Why.** Overloading is static; only overriding is dynamic. This is a common trap when helper methods are overloaded on collection types.
:::

:::drill output
What does this print?

```java run=c07-d-varargs
import java.util.*;

public class Varargs {
    @SafeVarargs
    static <T> List<T> listOf(T... items) {
        return new ArrayList<>(Arrays.asList(items));
    }

    static <T> T[] toArray(T... items) {
        return items;
    }

    public static void main(String[] args) {
        System.out.println(listOf("a", "b") + " " + listOf(1, 2.0).get(1).getClass().getSimpleName());
        String[] fine = toArray("x", "y");
        System.out.println(fine.length + " " + fine.getClass().getSimpleName());
    }
}
```
---
**Answer.** `[a, b] Double`, then `2 String[]`. With `listOf(1, 2.0)`, `T` is inferred as a common supertype (`Number & Comparable<…>`), and element 1 is a `Double`. Called with literal strings, the varargs array really is a `String[]`.

**Why.** The danger case is calling `toArray` from *another* generic method, where `T` is a type variable: the array created is then an `Object[]`, and returning it as `String[]` throws `ClassCastException` at the caller.
:::

:::drill bug
This method compiles with an "unchecked" warning and later crashes in unrelated code. Fix the design.

```java run=c07-d-bug-unchecked
import java.util.*;

public class Unchecked {
    static <T> T get(Map<String, Object> config, String key, Class<T> type) {
        Object value = config.get(key);
        if (!type.isInstance(value))
            throw new IllegalArgumentException(key + " is " + (value == null ? "missing" : value.getClass().getSimpleName()) + ", expected " + type.getSimpleName());
        return type.cast(value);
    }

    public static void main(String[] args) {
        Map<String, Object> config = Map.of("port", "8080", "debug", true);
        System.out.println(get(config, "debug", Boolean.class));
        try {
            int port = get(config, "port", Integer.class);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}
```
---
**Answer.** The original was `@SuppressWarnings("unchecked") static <T> T get(Map<String, Object> c, String k) { return (T) c.get(k); }`. The cast to `T` is erased to nothing, so a `String` was returned as an `Integer` and the crash happened at the caller's inserted cast. Passing a `Class<T>` lets the method check with `isInstance`/`cast` and fail at the right place with a clear message.

**Why.** An unchecked cast to a type variable checks nothing at run time.
:::

:::drill bug
A utility does not compile when called with a `List<Integer>`. Fix the signature.

```java run=c07-d-bug-pecs
import java.util.*;

public class SumAll {
    static double sumAll(List<? extends Number> values) {
        double s = 0;
        for (Number v : values) s += v.doubleValue();
        return s;
    }

    public static void main(String[] args) {
        List<Integer> a = List.of(1, 2);
        List<Double> b = List.of(0.5);
        System.out.println(sumAll(a) + sumAll(b));
    }
}
```
---
**Answer.** The original took `List<Number>`, and a `List<Integer>` is not a `List<Number>` (invariance). Since the method only reads, accept `List<? extends Number>`.

**Why.** Use `extends` wildcards for parameters you read from; the method body did not need to add anything.
:::

## Write the code {#ch07-coding .cd}

:::drill code rating=1400
Write a type-safe heterogeneous container (Bloch's `Favorites`): `put(Class<T>, T)` and `T get(Class<T>)`, where the stored value for each class is checked at insertion, so a raw-type caller cannot corrupt it.
---
```java run=c07-c-favorites
import java.util.*;

public class Favorites {
    private final Map<Class<?>, Object> values = new HashMap<>();

    <T> void put(Class<T> type, T value) {
        values.put(Objects.requireNonNull(type), type.cast(value));
    }

    <T> T get(Class<T> type) {
        return type.cast(values.get(type));
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    public static void main(String[] args) {
        Favorites f = new Favorites();
        f.put(String.class, "Java");
        f.put(Integer.class, 0xCAFE);
        System.out.println(f.get(String.class) + " " + Integer.toHexString(f.get(Integer.class)));
        Class raw = Integer.class;
        try {
            f.put(raw, "not an int");
        } catch (ClassCastException e) {
            System.out.println("rejected at insertion");
        }
    }
}
```

The `Class` object acts as a run-time type token for each key, replacing what erasure removed. `type.cast` is a checked cast that throws for the wrong type.
:::

:::drill code rating=1300
Write a generic `Pair<A, B>` with `swap()`, a static factory with inference, and a method `static <T extends Comparable<? super T>> Pair<T, T> minMax(Iterable<T>)`, then use it on strings and on `java.sql.Timestamp` (which is `Comparable<Date>`).
---
```java run=c07-c-minmax
import java.sql.Timestamp;
import java.util.*;

public class MinMax {
    record Pair<A, B>(A first, B second) {
        static <A, B> Pair<A, B> of(A a, B b) { return new Pair<>(a, b); }
        Pair<B, A> swap() { return new Pair<>(second, first); }
    }

    static <T extends Comparable<? super T>> Pair<T, T> minMax(Iterable<T> items) {
        Iterator<T> it = items.iterator();
        T min = it.next(), max = min;
        while (it.hasNext()) {
            T x = it.next();
            if (x.compareTo(min) < 0) min = x;
            if (x.compareTo(max) > 0) max = x;
        }
        return Pair.of(min, max);
    }

    public static void main(String[] args) {
        System.out.println(minMax(List.of("kiwi", "apple", "pear")) + " " + Pair.of(1, "one").swap());
        List<Timestamp> times = List.of(new Timestamp(3000), new Timestamp(1000), new Timestamp(2000));
        Pair<Timestamp, Timestamp> mm = minMax(times);
        System.out.println(mm.first().getTime() + " " + mm.second().getTime());
    }
}
```

With the simpler bound `<T extends Comparable<T>>`, the `Timestamp` call would not compile, because `Timestamp` implements `Comparable<Date>`, not `Comparable<Timestamp>`. `? super T` accepts comparability inherited from a supertype.
:::

:::drill code rating=1500
Write `TypeRef<T>`, a super type token that captures a full generic type, and a tiny `convert(Object, TypeRef<T>)` that turns a `List` of numeric strings into `List<Integer>` or `List<Long>` depending on the token.
---
```java run=c07-c-typeref
import java.lang.reflect.*;
import java.util.*;

public class TypeTokens {
    static abstract class TypeRef<T> {
        final Type type;
        protected TypeRef() {
            Type sup = getClass().getGenericSuperclass();
            if (!(sup instanceof ParameterizedType p)) throw new IllegalStateException("missing type argument");
            type = p.getActualTypeArguments()[0];
        }
    }

    @SuppressWarnings("unchecked")
    static <T> T convert(List<String> raw, TypeRef<T> ref) {
        if (!(ref.type instanceof ParameterizedType p) || p.getRawType() != List.class)
            throw new IllegalArgumentException("only List<X> supported: " + ref.type);
        Type element = p.getActualTypeArguments()[0];
        List<Object> out = new ArrayList<>();
        for (String s : raw) {
            if (element == Integer.class) out.add(Integer.valueOf(s));
            else if (element == Long.class) out.add(Long.valueOf(s));
            else throw new IllegalArgumentException("unsupported element " + element);
        }
        return (T) out;
    }

    public static void main(String[] args) {
        List<String> raw = List.of("1", "20", "300");
        List<Integer> ints = convert(raw, new TypeRef<List<Integer>>() {});
        List<Long> longs = convert(raw, new TypeRef<List<Long>>() {});
        System.out.println(ints.get(2).getClass().getSimpleName() + " " + longs.get(2).getClass().getSimpleName() + " " + new TypeRef<Map<String, List<Integer>>>() {}.type);
    }
}
```

`{}` creates an anonymous subclass, and only subclasses record their superclass's type arguments; `new TypeRef<List<Integer>>()` without braces would not compile here because the class is abstract, which protects against forgetting them.
:::

## Cheat sheet {#ch07-cheatsheet .th}

- Erasure: type variables → bounds, `List<String>` → `List`; compiler inserts `checkcast` and bridge methods. All parameterisations share one class and its statics.
- Not allowed: `new T()`, `new T[]`, `instanceof List<String>`, `List<int>`, overloads differing only in type arguments.
- Generic signatures remain in class files: reflection (`getGenericType`, `getGenericSuperclass`) and super type tokens (`new TypeRef<…>() {}`).
- Bridge methods: synthetic overrides for erased or covariant signatures (`compareTo(Object)`); `Method.isBridge()`.
- Heap pollution via raw types, unchecked casts, generic varargs; fails later at an inserted cast. `Collections.checkedList`, `Class.cast`, `@SafeVarargs`.
- Generics are invariant; wildcards: `? extends T` read (producer), `? super T` write (consumer) — PECS. `<T extends Comparable<? super T>>`.
- Arrays are covariant and reified: `ArrayStoreException`; no generic array creation.
- Overloads are chosen by static type at compile time; overriding is chosen at run time.
