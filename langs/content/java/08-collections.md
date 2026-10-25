---
title: equals, hashCode and collection internals
part: Part C · The type system
lede: Most Java interview rounds end up inside `HashMap`. This chapter opens up the collections you use every day: the `equals`/`hashCode` contract they depend on, how `HashMap` spreads hashes, resizes and turns crowded buckets into trees, how `ArrayList` grows, how `LinkedHashMap` becomes an LRU cache, what `TreeMap` needs from `compareTo`, and why iterators throw `ConcurrentModificationException`. The internals are read with reflection on the real JDK classes.
desc: equals/hashCode contract, HashMap buckets, spreading, resize and treeify, ArrayList growth, LinkedHashMap, TreeMap, fail-fast
hours: 4
prereqs: Chapters 3 and 7
---

## The equals and hashCode contract {#ch08-contract .th}

Every hash-based collection relies on two methods from `Object`:

- `equals` must be **reflexive**, **symmetric**, **transitive**, **consistent** (same answer while the objects do not change) and return `false` for `null`.
- If `a.equals(b)`, then `a.hashCode() == b.hashCode()`. Unequal objects may share a hash code; that only costs performance.

`Object`'s defaults use identity: two distinct objects are never equal, and `hashCode` is an identity hash stored in the object header once computed. Override **both or neither**. Overriding only `equals` breaks every `HashMap` and `HashSet` lookup:

```java run=c08-contract
import java.util.*;

public class Contract {
    static class OnlyEquals {
        final String id;
        OnlyEquals(String id) { this.id = id; }
        @Override public boolean equals(Object o) { return o instanceof OnlyEquals other && id.equals(other.id); }
    }

    record Both(String id) {}          // records generate equals, hashCode and toString from their components

    public static void main(String[] args) {
        Set<OnlyEquals> a = new HashSet<>(List.of(new OnlyEquals("x")));
        Set<Both> b = new HashSet<>(List.of(new Both("x")));
        System.out.println(new OnlyEquals("x").equals(new OnlyEquals("x")) + " " + a.contains(new OnlyEquals("x")));
        System.out.println(b.contains(new Both("x")) + " " + new Both("x").hashCode() + " " + "x".hashCode());
    }
}
```

`a.contains` looks in the bucket chosen by the identity hash of the new object, which is almost certainly a different bucket, so it never even calls `equals`. Records implement both methods from their components. For a record with a single `String` component the hash happens to equal the component's own hash (120 for `"x"`) in the current JDK, but the exact formula is deliberately unspecified, so never persist or depend on it.

### Mutable keys

The bucket a key goes into is chosen when it is inserted. If you then change a field used by `hashCode`, the key is in the wrong bucket and can never be found again, though it still occupies space and shows up in iteration:

```java run=c08-mutable-key
import java.util.*;

public class MutableKey {
    static class Point {
        int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }
        @Override public boolean equals(Object o) { return o instanceof Point p && p.x == x && p.y == y; }
        @Override public int hashCode() { return Objects.hash(x, y); }
    }

    public static void main(String[] args) {
        Map<Point, String> labels = new HashMap<>();
        Point p = new Point(1, 2);
        labels.put(p, "A");
        p.x = 10;
        System.out.println(labels.get(p) + " " + labels.get(new Point(1, 2)) + " " + labels.size() + " " + labels.containsValue("A"));
    }
}
```

Make key classes immutable (records are perfect), or never mutate an object while it is a key.

## How HashMap works {#ch08-hashmap .th}

A `HashMap` holds a `table` array of **bins** whose length is always a power of two. To put a key:

1. Compute `h = key.hashCode()` and **spread** it: `h ^ (h >>> 16)`, folding the high 16 bits into the low ones.
2. The bin index is `h & (table.length - 1)`, which uses only the low bits; spreading means keys whose hashes differ only in high bits (common for `Float`s and some objects) still land in different bins.
3. If the bin is empty, store a new `Node(hash, key, value, next)`. Otherwise walk the bin's linked list comparing the stored hash, then `==`, then `equals`; replace the value on a match or append a node.
4. If the size now exceeds `capacity × loadFactor` (0.75 by default), **resize**: double the table.

The table is created lazily on the first `put` with 16 bins, so the first resize happens at the 13th entry:

```java run=c08-resize cmd="javac -d . Resize.java && java --add-opens java.base/java.util=ALL-UNNAMED -cp . Resize"
import java.lang.reflect.Field;
import java.util.*;

public class Resize {
    public static void main(String[] args) throws Exception {
        Field table = HashMap.class.getDeclaredField("table");
        table.setAccessible(true);
        Map<Integer, Integer> map = new HashMap<>();
        int last = 0;
        System.out.println("before first put: table = " + table.get(map));
        for (int i = 0; i < 100; i++) {
            map.put(i, i);
            int length = ((Object[]) table.get(map)).length;
            if (length != last) {
                System.out.println("size " + map.size() + " -> " + length + " bins (threshold " + (int) (length * 0.75) + ")");
                last = length;
            }
        }
        Map<Integer, Integer> presized = HashMap.newHashMap(100);     // Java 19+
        presized.put(1, 1);
        System.out.println("newHashMap(100) starts with " + ((Object[]) table.get(presized)).length + " bins");
    }
}
```

Reading `HashMap`'s private field requires `--add-opens java.base/java.util=ALL-UNNAMED`, because since Java 16/17 the JDK's internals are strongly encapsulated (JEP 396, JEP 403). `new HashMap<>(100)` is a classic mistake: the argument is the *capacity*, so 100 entries would still trigger a resize at 75; `HashMap.newHashMap(100)` (Java 19) sizes for 100 *entries*.

Resizing is O(n), but because the table length is a power of two, each bin splits into exactly two: entries stay at index `i` or move to `i + oldLength`, depending on one bit of their hash, and their relative order is preserved.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 210" role="img" aria-label="HashMap table of 16 bins; one bin holds a linked list of nodes, another bin with many colliding keys has become a red-black tree">
  <text x="20" y="22" class="t-small">table (length 16): index = (h ^ h &gt;&gt;&gt; 16) &amp; 15</text>
  <g>
    <rect x="20" y="34" width="36" height="30" class="d-soft"/><rect x="56" y="34" width="36" height="30" class="d-acc"/><rect x="92" y="34" width="36" height="30" class="d-soft"/><rect x="128" y="34" width="36" height="30" class="d-soft"/>
    <rect x="164" y="34" width="36" height="30" class="d-trap"/><rect x="200" y="34" width="36" height="30" class="d-soft"/><rect x="236" y="34" width="36" height="30" class="d-acc"/><rect x="272" y="34" width="36" height="30" class="d-soft"/>
    <text x="74" y="54" text-anchor="middle" class="t-mono">1</text><text x="182" y="54" text-anchor="middle" class="t-mono">4</text><text x="254" y="54" text-anchor="middle" class="t-mono">6</text>
    <text x="330" y="54" class="t-small">… 16 bins</text>
  </g>
  <path d="M74 64 L 74 92" class="d-line"/>
  <rect x="44" y="92" width="60" height="26" class="d-key"/><text x="74" y="110" text-anchor="middle" class="t-mono">k1</text>
  <path d="M74 118 L 74 136" class="d-line"/>
  <rect x="44" y="136" width="60" height="26" class="d-key"/><text x="74" y="154" text-anchor="middle" class="t-mono">k2</text>
  <text x="20" y="190" class="t-small">collisions: linked list (next pointers)</text>
  <path d="M182 64 L 182 90 L 430 90" class="d-line-trap"/>
  <circle cx="470" cy="100" r="16" class="d-trap"/><text x="470" y="105" text-anchor="middle" class="t-mono">k</text>
  <circle cx="430" cy="146" r="16" class="d-trap"/><circle cx="510" cy="146" r="16" class="d-trap"/>
  <circle cx="405" cy="188" r="14" class="d-trap"/><circle cx="455" cy="188" r="14" class="d-trap"/><circle cx="535" cy="188" r="14" class="d-trap"/>
  <path d="M460 112 L 438 132 M480 112 L 502 132 M424 160 L 410 176 M436 160 L 450 176 M516 160 L 530 176" class="d-line"/>
  <text x="560" y="120" class="t-small">≥ 8 entries in a bin and</text><text x="560" y="138" class="t-small">table ≥ 64: red-black tree</text><text x="560" y="156" class="t-small">(TreeNode), O(log n)</text>
</svg></div><figcaption><b>Bins.</b> Most bins hold zero or one entry. A bin with many collisions becomes a balanced tree, so the worst case is O(log n) instead of O(n).</figcaption></figure>

### Treeification

Since Java 8, when a single bin reaches **8** entries and the table has at least **64** bins, the bin is converted into a red-black tree of `TreeNode`s (with a smaller table, `HashMap` resizes instead). The tree is ordered by hash, then by `compareTo` if the keys are `Comparable`, then by a tie-breaking identity order. If a bin shrinks to **6** entries, it turns back into a list. This defends against hash-flooding attacks with colliding keys (Chapter 4):

```java run=c08-treeify cmd="javac -d . Treeify.java && java --add-opens java.base/java.util=ALL-UNNAMED -cp . Treeify"
import java.lang.reflect.Field;
import java.util.*;

public class Treeify {
    record Key(int id) implements Comparable<Key> {
        @Override public int hashCode() { return 42; }               // every key collides
        @Override public int compareTo(Key o) { return Integer.compare(id, o.id); }
    }

    public static void main(String[] args) throws Exception {
        Field table = HashMap.class.getDeclaredField("table");
        table.setAccessible(true);
        Map<Key, Integer> map = new HashMap<>(64);
        for (int i = 1; i <= 10; i++) {
            map.put(new Key(i), i);
            Object[] t = (Object[]) table.get(map);
            Object bin = t[42 & (t.length - 1)];
            System.out.print(i + ":" + bin.getClass().getSimpleName() + " ");
        }
        System.out.println();
        System.out.println(map.get(new Key(7)) + " " + map.size());
    }
}
```

The bin is a list of `Node`s up to 8 entries; the 9th insertion treeifies it into `TreeNode`s. Lookups still work because colliding keys are told apart by `equals` (in a list) or `compareTo` (in a tree).

:::key
HashMap's average cost is O(1) for `get` and `put` because the load factor keeps bins short and the hash is spread; its worst case is O(log n) per bin since Java 8 (O(n) before). Iteration order is unspecified and changes after a resize. Use `LinkedHashMap` when you need order.
:::

## ArrayList and LinkedList {#ch08-lists .th}

`ArrayList` wraps an `Object[] elementData`. A new list shares an empty array and allocates 10 slots on the first `add`; when full, it grows by 50% (`old + (old >> 1)`) and copies. Removing from the middle shifts later elements left with `System.arraycopy`.

```java run=c08-arraylist cmd="javac -d . Growth.java && java --add-opens java.base/java.util=ALL-UNNAMED -cp . Growth"
import java.lang.reflect.Field;
import java.util.*;

public class Growth {
    public static void main(String[] args) throws Exception {
        Field data = ArrayList.class.getDeclaredField("elementData");
        data.setAccessible(true);
        ArrayList<Integer> list = new ArrayList<>();
        List<Integer> caps = new ArrayList<>();
        caps.add(((Object[]) data.get(list)).length);
        for (int i = 0; i < 100; i++) {
            list.add(i);
            int cap = ((Object[]) data.get(list)).length;
            if (cap != caps.get(caps.size() - 1)) caps.add(cap);
        }
        System.out.println(caps);
        list.subList(10, 100).clear();
        list.trimToSize();
        System.out.println(list.size() + " " + ((Object[]) data.get(list)).length);
    }
}
```

`LinkedList` is a doubly linked list of node objects (24 bytes each plus the element). It wins only for frequent insertions and removals through an iterator in the middle of a list; for everything else, including queue use (`ArrayDeque` is better), `ArrayList` is faster because of memory locality.

## LinkedHashMap and TreeMap {#ch08-ordered .th}

`LinkedHashMap` extends `HashMap` and threads a doubly linked list through all entries. In the default **insertion order** mode, iteration follows insertion. In **access order** mode (`new LinkedHashMap<>(16, 0.75f, true)`), every `get` moves the entry to the end, and overriding `removeEldestEntry` evicts the head when the map grows too big, which gives an LRU cache in a few lines:

```java run=c08-lru
import java.util.*;

public class Lru {
    static <K, V> Map<K, V> lru(int capacity) {
        return new LinkedHashMap<>(16, 0.75f, true) {
            @Override protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                return size() > capacity;
            }
        };
    }

    public static void main(String[] args) {
        Map<String, Integer> cache = lru(3);
        cache.put("a", 1); cache.put("b", 2); cache.put("c", 3);
        cache.get("a");                // a becomes most recently used
        cache.put("d", 4);             // evicts b, the least recently used
        System.out.println(cache.keySet());
    }
}
```

`TreeMap` is a red-black tree ordered by `compareTo` or a `Comparator`: O(log n) operations, sorted iteration and range views (`headMap`, `ceilingKey`). It uses **only the comparison**, never `equals`, to decide whether two keys are the same, so a comparator that is inconsistent with `equals` makes `TreeMap` and `HashMap` disagree:

```java run=c08-treemap
import java.util.*;

public class TreeOrder {
    public static void main(String[] args) {
        Comparator<String> caseInsensitive = String.CASE_INSENSITIVE_ORDER;
        Set<String> tree = new TreeSet<>(caseInsensitive);
        Set<String> hash = new HashSet<>();
        for (String s : List.of("Apple", "apple", "APPLE", "banana")) { tree.add(s); hash.add(s); }
        System.out.println(tree + " " + hash.size());
        TreeMap<Integer, String> grades = new TreeMap<>(Map.of(90, "A", 80, "B", 70, "C"));
        System.out.println(grades.floorEntry(85) + " " + grades.headMap(80, true) + " " + grades.firstKey());
    }
}
```

## Fail-fast iterators {#ch08-failfast .th}

Most `java.util` collections keep a `modCount`, incremented on every structural change. An iterator remembers the value it started with and throws `ConcurrentModificationException` on `next()` if it has changed, so that a loop that modifies its own collection fails fast instead of silently skipping elements. Despite the name, this has nothing to do with threads; it is a best-effort bug detector and is **not** guaranteed to fire.

```java run=c08-cme
import java.util.*;

public class FailFast {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        try {
            for (Integer n : nums) if (n % 2 == 0) nums.remove(n);
        } catch (ConcurrentModificationException e) {
            System.out.println("ConcurrentModificationException");
        }
        System.out.println(nums);

        List<Integer> fixed = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        fixed.removeIf(n -> n % 2 == 0);
        Iterator<Integer> it = new ArrayList<>(List.of(1, 2, 3)).iterator();
        System.out.println(fixed);

        List<String> two = new ArrayList<>(List.of("a", "b"));
        for (String s : two) if (s.equals("a")) two.remove(s);   // no exception!
        System.out.println(two);
    }
}
```

The last loop removes `"a"` while the iterator is at index 1, `hasNext()` then sees size 1 and returns false, so the check in `next()` never runs and the bug goes unnoticed. Use `removeIf`, `Iterator.remove()` or a new collection.

### Unmodifiable vs immutable

`Collections.unmodifiableList(list)` is a read-only **view**: changes to the underlying list show through. `List.of`, `Set.of`, `Map.of` and `List.copyOf` (Java 9/10) are truly immutable, reject `null` elements, and `Set.of`/`Map.of` deliberately **randomise iteration order per JVM run** (using a salt chosen at start-up) so that code does not come to depend on it.

## Concept and tricky questions {#ch08-concept .dr}

:::drill concept
State the `equals`/`hashCode` contract and what breaks if you override only `equals`.
---
**Answer.** `equals` is reflexive, symmetric, transitive, consistent and false for `null`; equal objects must have equal hash codes. Overriding only `equals` leaves the identity hash, so equal objects go to different buckets and `HashSet.contains`/`HashMap.get` fail.

**Why.** Records, Lombok's `@EqualsAndHashCode` and IDE generators produce both together for this reason.
:::

:::drill concept
Walk through `HashMap.put(k, v)`.
---
**Answer.** Spread the hash (`h ^ h >>> 16`), index with `h & (n - 1)`, create the table lazily if needed; if the bin is empty insert a node, otherwise search the list or tree comparing hash, `==` and `equals`, replacing on a match or adding a node (treeifying at 8 if the table has 64+ bins); finally increment size and `modCount` and resize (double) if size > capacity × 0.75.

**Why.** Each detail (power-of-two table, spreading, load factor, treeify thresholds) is a common follow-up question.
:::

:::drill tricky
Why is the `HashMap` table size a power of two, and why does that make hash spreading necessary?
---
**Answer.** A power of two lets the index be computed with a mask (`h & (n - 1)`) instead of a modulo, and lets resizing split each bin into two predictable bins. But the mask uses only the low bits, so hashes that differ only in high bits would collide; XORing in `h >>> 16` mixes the high bits into the low ones.

**Why.** It is a speed/quality trade-off; `Hashtable` used a prime size and `%` instead.
:::

:::drill concept
When does a `HashMap` bin become a tree, and why was this added?
---
**Answer.** When a bin reaches 8 nodes and the table has at least 64 bins (otherwise it resizes); it reverts to a list at 6. It was added in Java 8 so that many colliding keys (accidental or a hash-flooding attack) degrade lookups to O(log n) instead of O(n).

**Why.** Trees are ordered by hash, then `compareTo` for `Comparable` keys, so they work best when keys are comparable.
:::

:::drill tricky
`new HashMap<>(100)`: how many entries can you add before it resizes?
---
**Answer.** 96. The argument is an initial capacity, rounded up to a power of two (128), and the threshold is 128 × 0.75 = 96. To hold 100 entries without resizing, use `HashMap.newHashMap(100)` (Java 19+), which computes the capacity for you.

**Why.** Pre-sizing helps when you know the size, but the constructor's meaning is a common source of off-by-a-factor errors.
:::

:::drill concept
What is a fail-fast iterator and is it a concurrency mechanism?
---
**Answer.** An iterator that throws `ConcurrentModificationException` if the collection was structurally modified (other than through the iterator) since the iterator was created, detected through `modCount`. It is a bug detector for single-threaded misuse, not a concurrency mechanism, and it is best-effort: it can miss modifications.

**Why.** Concurrent collections (`ConcurrentHashMap`, `CopyOnWriteArrayList`) have weakly consistent iterators that never throw it.
:::

:::drill tricky
A `TreeSet<String>` built with `String.CASE_INSENSITIVE_ORDER` contains "Apple" and you add "apple". What happens, and why might that surprise someone using `Set` semantics?
---
**Answer.** The add is ignored, because `TreeSet` considers two elements the same when `compare` returns 0, without calling `equals`. A `HashSet` of the same strings would keep both.

**Why.** `SortedSet` and `SortedMap` document that their comparator should be consistent with `equals`; when it is not, they violate the general `Set` contract.
:::

## Predict the output and find the bug {#ch08-reading .dr}

:::drill output
What does this print?

```java run=c08-d-nullkey
import java.util.*;

public class NullKey {
    public static void main(String[] args) {
        Map<String, Integer> hm = new HashMap<>();
        hm.put(null, 1);
        hm.put(null, 2);
        System.out.println(hm.get(null) + " " + hm.size() + " " + hm.containsKey(null));
        try {
            new TreeMap<String, Integer>().put(null, 1);
        } catch (NullPointerException e) {
            System.out.println("TreeMap: NPE");
        }
        try {
            Map.of("a", 1).get(null);
        } catch (NullPointerException e) {
            System.out.println("Map.of: NPE");
        }
    }
}
```
---
**Answer.** `2 1 true`, `TreeMap: NPE`, `Map.of: NPE`. `HashMap` allows one `null` key (stored in bin 0); `TreeMap` must compare keys and throws; the immutable `Map.of` maps reject `null` even in lookups.

**Why.** `ConcurrentHashMap` also rejects `null` keys and values, because `null` from `get` must unambiguously mean "absent" under concurrency.
:::

:::drill output
What does this print?

```java run=c08-d-aslist
import java.util.*;

public class AsList {
    public static void main(String[] args) {
        String[] array = {"b", "a", "c"};
        List<String> view = Arrays.asList(array);
        Collections.sort(view);
        System.out.println(Arrays.toString(array));
        try {
            view.add("d");
        } catch (UnsupportedOperationException e) {
            System.out.println("UnsupportedOperationException");
        }
        int[] prims = {3, 1, 2};
        System.out.println(Arrays.asList(prims).size() + " " + List.of(3, 1, 2).size());
    }
}
```
---
**Answer.** `[a, b, c]` (sorting the view sorts the array), then `UnsupportedOperationException` (the view is fixed-size), then `1 3`: `Arrays.asList(int[])` creates a list with one element, the array itself, because generics cannot hold primitives.

**Why.** `Arrays.asList` is a view backed by the array, not a copy; use `new ArrayList<>(Arrays.asList(…))` or `List.of` as appropriate.
:::

:::drill output
What does this print?

```java run=c08-d-iteration
import java.util.*;

public class Iteration {
    public static void main(String[] args) {
        Map<String, Integer> lhm = new LinkedHashMap<>();
        Map<String, Integer> tm = new TreeMap<>();
        for (String k : List.of("pear", "apple", "fig")) { lhm.put(k, k.length()); tm.put(k, k.length()); }
        lhm.put("pear", 99);
        System.out.println(lhm + " " + tm);
        List<Integer> sortedSet = new ArrayList<>(Set.of(3, 1, 2));
        Collections.sort(sortedSet);
        System.out.println(sortedSet);
    }
}
```
---
**Answer.** `{pear=99, apple=5, fig=3} {apple=5, fig=3, pear=4}`, then `[1, 2, 3]`. Re-putting an existing key keeps its insertion position. `TreeMap` iterates in key order. `Set.of`'s iteration order is randomised per run, so the demo sorts it before printing.

**Why.** Never print or compare an unordered collection's iteration order in tests; it is the classic flaky test.
:::

:::drill bug
Duplicate customers appear in a `HashSet`. Find the bug.

```java run=c08-d-bug-hash
import java.util.*;

public class Customers {
    static final class Customer {
        private final String email;
        private final String name;
        Customer(String email, String name) { this.email = email; this.name = name; }
        @Override public boolean equals(Object o) {
            return o instanceof Customer c && c.email.equalsIgnoreCase(email);
        }
        @Override public int hashCode() {
            return email.toLowerCase(Locale.ROOT).hashCode();
        }
    }

    public static void main(String[] args) {
        Set<Customer> set = new HashSet<>();
        set.add(new Customer("Ada@Example.com", "Ada"));
        set.add(new Customer("ada@example.com", "Ada L."));
        System.out.println(set.size());
    }
}
```
---
**Answer.** The original `hashCode` returned `Objects.hash(email, name)`, while `equals` compared only the email, ignoring case. Two customers that are "equal" had different hash codes, so the set never compared them. The hash must depend only on what `equals` uses, normalised the same way, as fixed above.

**Why.** Every field or normalisation used in `equals` must be reflected in `hashCode`, and no other field may affect it.
:::

:::drill bug
This code removes expired sessions and sometimes throws `ConcurrentModificationException`. Fix it.

```java run=c08-d-bug-cme
import java.util.*;

public class Sessions {
    public static void main(String[] args) {
        Map<String, Long> expiresAt = new HashMap<>(Map.of("a", 10L, "b", 50L, "c", 5L, "d", 70L));
        long now = 20;
        expiresAt.entrySet().removeIf(e -> e.getValue() < now);
        System.out.println(new TreeMap<>(expiresAt));
    }
}
```
---
**Answer.** The original looped `for (String id : expiresAt.keySet()) if (…) expiresAt.remove(id);`, a structural modification during iteration. Use `entrySet().removeIf(…)` (or `Iterator.remove()`), which removes through the iterator.

**Why.** Whether the broken loop throws depends on which element is removed last, which made the failure look random.
:::

## Write the code {#ch08-coding .cd}

:::drill code rating=1500
Implement `SimpleHashMap<K, V>` with separate chaining: a power-of-two table, `spread(h) = h ^ (h >>> 16)`, `put`, `get`, `remove`, resize at load factor 0.75 that splits each bin into "low" and "high" lists, and support for a `null` key.
---
```java run=c08-c-hashmap
import java.util.*;

public class SimpleHashMap<K, V> {
    static final class Node<K, V> {
        final int hash; final K key; V value; Node<K, V> next;
        Node(int hash, K key, V value, Node<K, V> next) { this.hash = hash; this.key = key; this.value = value; this.next = next; }
    }

    private Node<K, V>[] table = newTable(16);
    private int size;

    @SuppressWarnings("unchecked")
    private static <K, V> Node<K, V>[] newTable(int n) { return (Node<K, V>[]) new Node[n]; }

    static int spread(Object key) {
        int h = key == null ? 0 : key.hashCode();
        return h ^ (h >>> 16);
    }

    public V get(K key) {
        int h = spread(key);
        for (Node<K, V> n = table[h & (table.length - 1)]; n != null; n = n.next)
            if (n.hash == h && Objects.equals(n.key, key)) return n.value;
        return null;
    }

    public V put(K key, V value) {
        int h = spread(key), i = h & (table.length - 1);
        for (Node<K, V> n = table[i]; n != null; n = n.next)
            if (n.hash == h && Objects.equals(n.key, key)) { V old = n.value; n.value = value; return old; }
        table[i] = new Node<>(h, key, value, table[i]);
        if (++size > table.length * 3 / 4) resize();
        return null;
    }

    public V remove(K key) {
        int h = spread(key), i = h & (table.length - 1);
        for (Node<K, V> prev = null, n = table[i]; n != null; prev = n, n = n.next)
            if (n.hash == h && Objects.equals(n.key, key)) {
                if (prev == null) table[i] = n.next; else prev.next = n.next;
                size--;
                return n.value;
            }
        return null;
    }

    private void resize() {
        Node<K, V>[] old = table;
        Node<K, V>[] next = newTable(old.length * 2);
        for (int i = 0; i < old.length; i++) {
            Node<K, V> lo = null, hi = null;
            for (Node<K, V> n = old[i], following; n != null; n = following) {
                following = n.next;
                if ((n.hash & old.length) == 0) { n.next = lo; lo = n; } else { n.next = hi; hi = n; }
            }
            next[i] = lo;
            next[i + old.length] = hi;
        }
        table = next;
    }

    public int size() { return size; }
    int capacity() { return table.length; }

    public static void main(String[] args) {
        SimpleHashMap<String, Integer> m = new SimpleHashMap<>();
        for (int i = 0; i < 1000; i++) m.put("k" + i, i);
        m.put(null, -1);
        for (int i = 0; i < 1000; i += 2) m.remove("k" + i);
        System.out.println(m.size() + " " + m.get("k999") + " " + m.get("k998") + " " + m.get(null) + " capacity=" + m.capacity());
    }
}
```

The split uses one bit, `hash & oldLength`, to decide whether each node stays at `i` or moves to `i + oldLength`, so no hash has to be recomputed. (For brevity this version prepends to each list, which reverses order; the JDK appends to keep it.)
:::

:::drill code rating=1300
Implement `equals` and `hashCode` correctly for a class `Money(long cents, String currency)` written as a regular class (not a record), including symmetry with a subclass problem: show why `getClass() != o.getClass()` vs `instanceof` matters when a `TaggedMoney` subclass adds a field.
---
```java run=c08-c-money
import java.util.*;

public class MoneyEq {
    static class Money {
        final long cents; final String currency;
        Money(long cents, String currency) { this.cents = cents; this.currency = Objects.requireNonNull(currency); }
        @Override public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Money m = (Money) o;
            return cents == m.cents && currency.equals(m.currency);
        }
        @Override public int hashCode() { return Objects.hash(cents, currency); }
    }

    static class TaggedMoney extends Money {
        final String tag;
        TaggedMoney(long c, String cur, String tag) { super(c, cur); this.tag = tag; }
        @Override public boolean equals(Object o) {
            return super.equals(o) && tag.equals(((TaggedMoney) o).tag);
        }
        @Override public int hashCode() { return 31 * super.hashCode() + tag.hashCode(); }
    }

    public static void main(String[] args) {
        Money a = new Money(500, "EUR");
        Money b = new TaggedMoney(500, "EUR", "refund");
        System.out.println(a.equals(b) + " " + b.equals(a) + " " + a.equals(new Money(500, "EUR")));
        System.out.println(new HashSet<>(List.of(a, b)).size());
    }
}
```

With `getClass()`, a `Money` never equals a `TaggedMoney`, so `equals` stays symmetric. With `instanceof Money` in the base class, `a.equals(b)` would be `true` but `b.equals(a)` `false`, breaking symmetry. There is no way to extend an instantiable class with a new value field and keep the `equals` contract (Effective Java, Item 10); records and final classes avoid the question.
:::

:::drill code rating=1400
Write `LruCache<K, V>` without `LinkedHashMap`: a `HashMap<K, Node>` plus your own doubly linked list with sentinel head and tail, O(1) `get` and `put`, and eviction of the least recently used entry.
---
```java run=c08-c-lru
import java.util.*;

public class LruCache<K, V> {
    private final class Node { K key; V value; Node prev, next; }
    private final Map<K, Node> index = new HashMap<>();
    private final Node head = new Node(), tail = new Node();
    private final int capacity;

    LruCache(int capacity) { this.capacity = capacity; head.next = tail; tail.prev = head; }

    private void unlink(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
    private void addFront(Node n) { n.next = head.next; n.prev = head; head.next.prev = n; head.next = n; }

    V get(K key) {
        Node n = index.get(key);
        if (n == null) return null;
        unlink(n);
        addFront(n);
        return n.value;
    }

    void put(K key, V value) {
        Node n = index.get(key);
        if (n != null) { n.value = value; unlink(n); addFront(n); return; }
        if (index.size() == capacity) {
            Node lru = tail.prev;
            unlink(lru);
            index.remove(lru.key);
        }
        n = new Node();
        n.key = key; n.value = value;
        addFront(n);
        index.put(key, n);
    }

    List<K> order() {
        List<K> keys = new ArrayList<>();
        for (Node n = head.next; n != tail; n = n.next) keys.add(n.key);
        return keys;
    }

    public static void main(String[] args) {
        LruCache<Integer, String> c = new LruCache<>(2);
        c.put(1, "one"); c.put(2, "two");
        c.get(1);
        c.put(3, "three");
        System.out.println(c.get(2) + " " + c.get(1) + " " + c.order());
    }
}
```

The sentinels remove every null check from `unlink` and `addFront`. This is exactly the structure `LinkedHashMap` keeps internally in access-order mode.
:::

## Cheat sheet {#ch08-cheatsheet .th}

- Contract: equal ⇒ same hash; override `equals` and `hashCode` together; use only the fields `equals` compares. Records do it for you. Never mutate a key.
- `HashMap`: power-of-two table (lazy, 16 bins), `spread = h ^ h >>> 16`, index `h & (n-1)`, load factor 0.75 → resize (double) at 12, 24, 48…; bins split lo/hi on resize.
- Treeify a bin at 8 nodes if table ≥ 64 (else resize); untreeify at 6. Worst case O(log n) since Java 8.
- One `null` key in `HashMap`; `TreeMap`, `ConcurrentHashMap`, `Map.of` reject nulls. `new HashMap<>(n)` is a capacity; `HashMap.newHashMap(n)` (19+) sizes for n entries.
- `ArrayList`: default 10 on first add, grows ×1.5, middle removal shifts; `LinkedList` rarely wins; `ArrayDeque` for queues.
- `LinkedHashMap` insertion or access order; `removeEldestEntry` → LRU. `TreeMap`: red-black tree, uses only `compare` (should be consistent with `equals`).
- Fail-fast iterators: `modCount` → `ConcurrentModificationException`, best effort, single-threaded bug detector. Use `removeIf` / `Iterator.remove`.
- `Arrays.asList` is a fixed-size view; `Collections.unmodifiableX` is a view; `List.of` etc. are immutable, null-hostile, and `Set.of`/`Map.of` order is randomised per run.
- Reading JDK internals needs `--add-opens java.base/java.util=ALL-UNNAMED` (strong encapsulation since 16/17).
