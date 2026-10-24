---
title: How the built-in containers work
part: Part C · Data structures inside
lede: "Use a dict, lookups are O(1)" is the start of the answer, not the answer. This chapter opens up `list`, `tuple`, `dict`, `set` and `deque`: how each is laid out in memory, how it grows, what its operations really cost, and where the worst cases come from. You will see the over-allocation pattern of lists, the compact ordered dict with its separate index table, why sets are not ordered, and why `hash(-1)` is `-2`.
desc: List over-allocation, tuples, the compact ordered dict, sets, deque, hashing, real costs
hours: 4
prereqs: Chapters 1 and 4
---

## list: a dynamic array of pointers {#ch05-list .th}

A `list` object is a header plus a pointer, `ob_item`, to a separate C array of `PyObject*`. `ob_size` is the number of items in use and `allocated` is the capacity of the array. Items are never stored inline; a list of a million ints is a million pointers to int objects.

When an `append` finds the array full, CPython grows it to roughly 1.125 times the new size plus a small constant, rounded to a multiple of 4. In 3.12 the formula in `list_resize` is `(newsize + (newsize >> 3) + 6) & ~3`. Growing by a fixed *factor* is what makes `append` **amortised O(1)**: the total copying done over n appends is proportional to n.

```python run=c05-growth
import sys

items = []
caps = []
last = None
for i in range(80):
    cap = (sys.getsizeof(items) - sys.getsizeof([])) // 8
    if cap != last:
        caps.append(cap)
        last = cap
    items.append(i)
print(caps)
```

Each capacity is the size reached when the previous one filled up. The small 1.125 factor wastes little memory, at the cost of more frequent reallocations than, say, the factor of 2 many C++ standard libraries use for `std::vector`.

### What each operation costs

| Operation | Cost | Why |
|---|---|---|
| `a[i]`, `a[i] = x`, `len(a)` | O(1) | Index into the pointer array |
| `a.append(x)`, `a.pop()` | O(1) amortised | Use spare capacity at the end |
| `a.insert(0, x)`, `a.pop(0)` | O(n) | Shift every pointer one slot (`memmove`) |
| `x in a`, `a.index(x)`, `a.remove(x)` | O(n) | Linear scan calling `==` |
| `a[i:j]` | O(j − i) | New list, copies the pointers |
| `a.sort()` | O(n log n) | Timsort: stable, O(n) on already-sorted runs |
| `a + b`, `a * k` | O(len of result) | New list |

```python run=c05-popfront nondet
import timeit
from collections import deque

n = 50_000
t_list = timeit.timeit("while a: a.pop(0)", setup=f"a = list(range({n}))", number=1)
t_deque = timeit.timeit("while a: a.popleft()", setup=f"from collections import deque; a = deque(range({n}))", number=1)
print("list.pop(0) at least 5x slower:", t_list > 5 * t_deque)
```

Using a list as a FIFO queue turns a linear algorithm quadratic. `collections.deque` is the fix (below).

### Timsort

`list.sort` and `sorted` use Timsort (since 2.3; the merge policy was improved to "powersort" in 3.11). It scans for **runs** that are already ascending (or strictly descending, which it reverses), extends short runs to a minimum length with binary insertion sort, and merges runs using a stack with rules that keep merges balanced. Merging uses **galloping**: when one run keeps winning, it switches to exponential search to copy whole chunks. The result is stable, O(n) on sorted or reverse-sorted input, and very fast on partially ordered real-world data.

```python run=c05-stable
records = [("bob", 2), ("amy", 1), ("cat", 2), ("dan", 1)]
by_score = sorted(records, key=lambda r: r[1])
print(by_score)
print(sorted(sorted(records), key=lambda r: r[1]) == sorted(records, key=lambda r: (r[1], r[0])))
```

Stability means equal keys keep their input order, so sorting by a secondary key first and then by the primary key gives a correct multi-key sort.

## tuple: fixed-size and inline {#ch05-tuple .th}

A `tuple` stores its item pointers **inside** the object, right after the header, because its size never changes. That saves the separate allocation a list needs and makes a tuple smaller:

```python run=c05-tuple-size
import sys
print(sys.getsizeof((1, 2, 3)), sys.getsizeof([1, 2, 3]))
print(sys.getsizeof(()), sys.getsizeof((1,)))
empty_a, empty_b = (), tuple()
print(empty_a is empty_b, tuple([]) is empty_a)
```

The empty tuple is a singleton. CPython also keeps **free lists** of recently freed tuples for each length below 20, so creating and destroying small tuples (as function arguments and multiple returns do) rarely touches the allocator.

"Immutable" means the tuple's slots cannot be rebound. The objects in them can still be mutable, and a tuple is only hashable if all its items are:

```python run=c05-tuple-hash
t = (1, [2, 3])
t[1].append(4)
print(t)
try:
    hash(t)
except TypeError as e:
    print("TypeError:", e)
print(hash((1, (2, 3))) == hash((1, (2, 3))))
```

## dict: the compact ordered hash table {#ch05-dict .th}

Since 3.6 (and guaranteed by the language since 3.7), a dict keeps keys in **insertion order**. CPython does it with a layout called the **compact dict**, which uses two arrays:

- An **index table** of size 2<sup>k</sup>, where each slot holds a small integer (1, 2, 4 or 8 bytes depending on the table size) pointing into the entries array, or a marker for "empty" or "deleted".
- A dense **entries array** of `(hash, key, value)` triples, appended to in insertion order.

A lookup hashes the key, uses the low bits to pick an index slot, follows it to an entry, and compares the stored hash and then the key with `is` and `==`. On a collision it probes another slot. Iteration just walks the entries array, which is why it is ordered and fast.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 220" role="img" aria-label="A sparse index table of small integers points into a dense array of hash, key, value entries in insertion order">
  <text x="20" y="28" class="t-small">indices (8 slots, 1 byte each)</text>
  <g>
    <rect x="20" y="40" width="44" height="34" class="d-soft"/><text x="42" y="62" text-anchor="middle" class="t-mono">–</text>
    <rect x="64" y="40" width="44" height="34" class="d-acc"/><text x="86" y="62" text-anchor="middle" class="t-mono">1</text>
    <rect x="108" y="40" width="44" height="34" class="d-soft"/><text x="130" y="62" text-anchor="middle" class="t-mono">–</text>
    <rect x="152" y="40" width="44" height="34" class="d-acc"/><text x="174" y="62" text-anchor="middle" class="t-mono">0</text>
    <rect x="196" y="40" width="44" height="34" class="d-soft"/><text x="218" y="62" text-anchor="middle" class="t-mono">–</text>
    <rect x="240" y="40" width="44" height="34" class="d-acc"/><text x="262" y="62" text-anchor="middle" class="t-mono">2</text>
    <rect x="284" y="40" width="44" height="34" class="d-soft"/><text x="306" y="62" text-anchor="middle" class="t-mono">–</text>
    <rect x="328" y="40" width="44" height="34" class="d-soft"/><text x="350" y="62" text-anchor="middle" class="t-mono">–</text>
  </g>
  <text x="420" y="28" class="t-small">entries (dense, insertion order)</text>
  <rect x="420" y="40" width="280" height="34" class="d-key"/><text x="430" y="62" class="t-mono">0: hash("x") "x" → 10</text>
  <rect x="420" y="78" width="280" height="34" class="d-key"/><text x="430" y="100" class="t-mono">1: hash("y") "y" → 20</text>
  <rect x="420" y="116" width="280" height="34" class="d-key"/><text x="430" y="138" class="t-mono">2: hash("z") "z" → 30</text>
  <path d="M174 74 C 200 150, 380 60, 420 57" class="d-line-acc"/>
  <path d="M86 74 C 120 170, 380 100, 420 95" class="d-line-acc"/>
  <path d="M262 74 C 290 190, 390 140, 420 133" class="d-line-acc"/>
  <text x="20" y="200" class="t-small">slot = hash &amp; 7, then probe with the perturbed recurrence on collisions; iteration walks the entries array</text>
</svg></div><figcaption><b>Two arrays.</b> The sparse part holds only small integers, so leaving a third of it empty costs little; the 24-byte entries are stored densely.</figcaption></figure>

The compact layout uses less memory than the old one (which kept a full 24-byte entry in every slot, mostly empty), and it keeps ordering for free.

### Probing, load factor and resizing

CPython uses **open addressing**: all entries live in the one table, and a collision is resolved by probing other slots. The probe sequence is `i = (5*i + 1 + perturb) mod size`, with `perturb` starting as the full hash and shifted right by 5 bits each step, so every bit of the hash eventually influences the probe, not just the low bits.

The table is kept at most **two-thirds full**. When an insert would pass that, the dict is resized to the next power of two that leaves room (roughly 3× the number of items) and every entry is re-inserted:

```python run=c05-dict-resize
import sys

d = {}
last = sys.getsizeof(d)
print(0, last)
for i in range(50):
    d[i] = i
    size = sys.getsizeof(d)
    if size != last:
        print(len(d), size)
        last = size
```

A dict never shrinks when you delete keys. Deleted entries become "dummy" markers so that probe chains stay intact, and the space is reclaimed only on the next resize, by `clear()`, or by building a new dict:

```python run=c05-dict-shrink
import sys
d = {i: i for i in range(1000)}
full = sys.getsizeof(d)
for i in range(990):
    del d[i]
print(sys.getsizeof(d) == full, len(d))
print(sys.getsizeof(dict(d)) < full)
```

### Hashing

`hash(x)` must satisfy one rule: **if `a == b` then `hash(a) == hash(b)`**. The reverse is not required; different objects may share a hash (a collision) and only cost extra probes. A few details show up in interviews:

```python run=c05-hash
print(hash(1), hash(1.0), hash(True))
print(hash(-1), hash(-2))
print(hash(2**61 - 1), hash(2**61))
print(hash(float("inf")), hash(0.5))
```

- Numbers that are equal hash equally across types, so `1`, `1.0` and `True` are one dict key.
- Integer hashes are computed modulo the Mersenne prime 2<sup>61</sup> − 1, so huge ints wrap around.
- `-1` is reserved as the error return value of the C-level hash function, so `hash(-1)` is replaced with `-2`.
- `str` and `bytes` hashes are **randomised** per process (SipHash with a random key) to stop attackers from crafting keys that all collide. Set `PYTHONHASHSEED` to make them repeatable.

A type with a constant `__hash__` turns every insertion into a long probe chain, and the dict degrades to O(n) per operation:

```python run=c05-badhash nondet
import timeit

class Key:
    def __init__(self, v):
        self.v = v
    def __eq__(self, other):
        return self.v == other.v

class BadKey(Key):
    def __hash__(self):
        return 42

class GoodKey(Key):
    def __hash__(self):
        return hash(self.v)

for cls in (GoodKey, BadKey):
    t = timeit.timeit(lambda: {cls(i): i for i in range(400)}, number=5)
    print(cls.__name__, "slow" if t > 0.05 else "fast")
```

### Key-sharing dicts and instance attributes

Instances of the same class usually have the same attribute names. PEP 412 (3.3) let their `__dict__`s share one table of keys and store only the values per instance. In 3.11 and 3.12 CPython goes further: an instance's attributes are stored in an inline **values array** laid out according to the class's shared keys, and a real `__dict__` object is created only if someone asks for it. This is what makes `LOAD_ATTR_INSTANCE_VALUE` (Chapter 3) possible. Adding attributes in a different order in different instances, or adding many attributes outside `__init__`, can defeat the sharing.

## set and frozenset {#ch05-set .th}

A set is a hash table of keys only, using the same equal-means-equal-hash rule. It does **not** use the compact layout: it keeps a single sparse table and probes linearly for a few slots before jumping, which is good for the cache when testing membership. Because there is no entries array, iteration follows table order, which is why sets are unordered:

```python run=c05-set-order
print({3, 1, 2})
print({100, 33, 1, 64})
print(list({"b": 1, "a": 2}), list(dict.fromkeys([3, 1, 3, 2])))
```

Small ints hash to themselves, so a set of small ints often looks sorted. That is a coincidence of the table layout, not a guarantee; strings appear in a different order on every run because of hash randomisation.

:::tip
`dict.fromkeys(items)` is the idiomatic way to remove duplicates **while keeping order**, because dicts are ordered and sets are not.
:::

Set operations cost what you would expect from hashing: `x in s` is O(1) on average, `a | b` is O(len(a) + len(b)), and `a & b` iterates over the **smaller** set and probes the larger one, so it is O(min(len(a), len(b))).

## deque and the rest of collections {#ch05-deque .th}

`collections.deque` is a doubly linked list of **blocks**, each holding 64 item pointers. Appending or popping at either end only touches the end block, so both ends are O(1). Indexing near the middle has to walk blocks from the nearer end, so `d[i]` is O(n) in the worst case, and there is no slicing.

```python run=c05-deque
from collections import deque

d = deque(range(5), maxlen=5)
d.append(5)
d.appendleft(-1)
print(d)
d.rotate(2)
print(d, d[0], d[-1])
```

With `maxlen` set, adding at one end silently drops an item from the other, which makes a bounded deque a ready-made sliding window or "last N items" buffer.

Other tools worth knowing:

- `heapq`: a binary min-heap stored in a plain list (`heap[k] <= heap[2k+1]`, `heap[2k+2]`). `heappush`/`heappop` are O(log n); `heapify` is O(n).
- `bisect`: binary search on a sorted list. Finding the position is O(log n), but `insort` is O(n) because inserting into the list shifts items.
- `Counter`, `defaultdict` and `OrderedDict` are dict subclasses. `OrderedDict` still matters for `move_to_end` and order-sensitive equality.

```python run=c05-heap
import heapq, bisect

tasks = [(3, "write"), (1, "plan"), (2, "test")]
heapq.heapify(tasks)
print([heapq.heappop(tasks)[1] for _ in range(3)])
print(heapq.nlargest(2, [5, 1, 9, 3]))
scores = [10, 20, 30, 40]
print(bisect.bisect_left(scores, 25), bisect.bisect_right(scores, 30))
```

## Concept and tricky questions {#ch05-concept .dr}

:::drill concept
Why is `list.append` amortised O(1) when it sometimes has to copy the whole array?
---
**Answer.** Because the capacity grows by a constant factor (about 1.125× plus a constant in CPython), the expensive copies happen at sizes that form a geometric series. Their total cost over n appends is O(n), so each append costs O(1) on average.

**Why.** Growing by a fixed amount (say +10 each time) would make the copies total O(n²). The factor trades memory slack for fewer copies.
:::

:::drill concept
Describe CPython's dict layout since 3.6 and explain how it keeps insertion order.
---
**Answer.** A sparse index table of small integers plus a dense entries array of `(hash, key, value)`. New entries are appended to the entries array, and the index table points into it. Iteration walks the entries array, so it follows insertion order.

**Why.** Ordering was a side effect of a memory optimisation (Raymond Hettinger's compact dict). It became a language guarantee in 3.7.
:::

:::drill concept
State the contract between `__eq__` and `__hash__`, and what Python does to `__hash__` when you define only `__eq__`.
---
**Answer.** Objects that compare equal must have equal hashes. If a class defines `__eq__` but not `__hash__`, Python sets `__hash__ = None`, which makes instances unhashable.

**Why.** The default identity hash would break the contract for objects your `__eq__` considers equal. If instances are mutable and equality depends on mutable fields, leaving them unhashable is correct.
:::

:::drill tricky
Why is `hash(-1)` equal to `-2`?
---
**Answer.** In the C API, a hash function returns `-1` to signal an error. So a genuine hash of `-1` is replaced by `-2`.

**Why.** It is a detail of `PyObject_Hash`, but it shows that hashes are allowed to collide: `-1` and `-2` are different keys with the same hash and still work as dict keys.
:::

:::drill tricky
A set of small integers prints in sorted order. Is iteration order of a set guaranteed?
---
**Answer.** No. Small ints hash to themselves, so they land in slots in numeric order in a small table. That looks sorted by coincidence. Strings appear in a different order each run because their hashes are randomised.

**Why.** Sets have no entries array, so their order is the order of the hash table. Only dicts guarantee insertion order.
:::

:::drill concept
Why do dicts and sets have a worst case of O(n) per lookup, and what protects against it in practice?
---
**Answer.** If many keys collide (same hash or same probe sequence), a lookup must walk a long probe chain comparing keys. Good hash functions, perturbation that mixes in all hash bits, a load factor of at most 2/3 and randomised `str`/`bytes` hashes (against crafted inputs) make long chains very unlikely.

**Why.** Before hash randomisation (3.3 by default), web servers could be attacked by POSTing form fields whose names all collided.
:::

:::drill concept
When would you use a `deque` instead of a list, and what does a deque do badly?
---
**Answer.** For queues and sliding windows: O(1) appends and pops at both ends. A deque is bad at random access in the middle (O(n) walking its 64-item blocks) and has no slicing or `sort`.

**Why.** A list's front operations shift every pointer. A deque never shifts; it allocates a new block at the end that needs one.
:::

## Predict the output and find the bug {#ch05-reading .dr}

:::drill output
What does this print?

```python run=c05-d-order
d = {"a": 1, "b": 2, "c": 3}
del d["a"]
d["a"] = 1
d["b"] = 20
print(list(d.items()))
```
---
**Answer.** Deleting `a` removes its entry; re-inserting appends a new entry at the end. Updating an existing key keeps its position. Result: `[('b', 20), ('c', 3), ('a', 1)]`.

**Why.** Order is insertion order of the key's current entry. Assigning to an existing key replaces the value in place.
:::

:::drill output
What does this print?

```python run=c05-d-mutate-iter
d = {1: "a", 2: "b"}
try:
    for k in d:
        d[k + 10] = "new"
except RuntimeError as e:
    print("RuntimeError:", e)

items = [1, 2, 3, 4]
for x in items:
    if x % 2 == 0:
        items.remove(x)
print(items)
```
---
**Answer.** Adding keys while iterating a dict raises `RuntimeError: dictionary changed size during iteration`. A list does not detect changes; removing `2` shifts `3` into its slot, so the loop skips it. `4` is then visited and removed, giving `[1, 3]`. With `[2, 4, 6, 8]` the same loop would wrongly keep `4` and `8`.

**Why.** Iterate over a copy (`for x in items[:]`) or build a new list with a comprehension.
:::

:::drill output
What does this print?

```python run=c05-d-key-mutation
class Point:
    def __init__(self, x):
        self.x = x
    def __eq__(self, other):
        return self.x == other.x
    def __hash__(self):
        return hash(self.x)

p = Point(1)
s = {p}
p.x = 2
print(p in s, Point(1) in s, Point(2) in s, len(s))
```
---
**Answer.** `False False False 1`. After mutation `p` hashes to the slot for 2, where nothing is stored. `Point(1)` finds the old slot, but the stored object no longer compares equal to it. The element is still in the set but unreachable by lookup.

**Why.** Never mutate the fields that `__hash__` depends on while the object is in a set or used as a dict key. Make such classes immutable (`@dataclass(frozen=True)`).
:::

:::drill output
What does this print?

```python run=c05-d-sizes
import sys
a = [0] * 10
b = [0 for _ in range(10)]
c = list(range(10))
print(sys.getsizeof(a), sys.getsizeof(b), sys.getsizeof(c))
```
---
**Answer.** `[0] * 10` and `list(range(10))` know the final length and allocate exactly 10 slots. The comprehension appends one item at a time and ends with over-allocated capacity, so it is larger.

**Why.** Pre-sizing avoids waste. It rarely matters, but it explains why two equal lists can report different `getsizeof` values.
:::

:::drill output
What does this print?

```python run=c05-d-intersection
small = {1, 2}
big = set(range(10**6))
print(len(small & big), len(big & small), (small & big) == (big & small))
print(small.isdisjoint(big), {1, 2} <= big)
```
---
**Answer.** `2 2 True`, then `False True`. Both intersections are cheap, because CPython iterates over whichever set is smaller and probes the other.

**Why.** Intersection is O(min(len(a), len(b))). Subset testing iterates over the left operand, so `{1, 2} <= big` is O(2).
:::

:::drill bug
This BFS is correct but slow on large graphs. Find the performance bug.

```python run=c05-d-bug-bfs
from collections import deque

def bfs_slow(adj, start):
    seen, order, queue = [start], [], [start]
    while queue:
        node = queue.pop(0)
        order.append(node)
        for nxt in adj[node]:
            if nxt not in seen:
                seen.append(nxt)
                queue.append(nxt)
    return order

def bfs(adj, start):
    seen, order, queue = {start}, [], deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in adj[node]:
            if nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)
    return order

adj = {i: [i + 1, i + 2] if i < 2000 else [] for i in range(2003)}
print(bfs_slow(adj, 0) == bfs(adj, 0))
```
---
**Answer.** Two quadratic operations: `queue.pop(0)` shifts the whole list, and `nxt not in seen` scans a list. Use a `deque` for the queue and a `set` for `seen`, as in `bfs`.

**Why.** Each mistake turns an O(V + E) algorithm into O(V²). This is the most common performance bug in interview solutions.
:::

:::drill bug
A team used `@dataclass(unsafe_hash=True)` for grid cells used as dict keys, and lookups randomly failed after cells were updated. The version below is the fix. What was the bug, and why does `frozen=True` fix it?

```python run=c05-d-bug-dataclass
from dataclasses import dataclass

@dataclass(frozen=True)
class Cell:
    row: int
    col: int

grid = {Cell(0, 0): "start"}
try:
    next(iter(grid)).row = 5
except Exception as e:
    print(type(e).__name__)
print(grid[Cell(0, 0)])
```
---
**Answer.** `unsafe_hash=True` generates a hash from the fields but leaves them mutable, so code that changed `row` or `col` on a key moved it to the wrong hash slot (the mutated-key problem from the drill above). `frozen=True` generates the same hash and also makes assignment raise `FrozenInstanceError`, so a key can never change after it is stored.

**Why.** A plain `@dataclass` (with the default `eq=True`) sets `__hash__` to `None`, making instances unhashable. That is deliberately safe; `unsafe_hash` is named that way for a reason.

A hashable key must not change in a way that changes its hash or equality.
:::

## Write the code {#ch05-coding .cd}

:::drill code rating=1400
Implement `LRUCache(capacity)` with O(1) `get(key)` (returning -1 if missing) and `put(key, value)` that evicts the least recently used key when full. Use `OrderedDict`, then explain how you would do it without it.
---
```python run=c05-c-lru
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)

c = LRUCache(2)
c.put(1, 1); c.put(2, 2)
print(c.get(1))
c.put(3, 3)
print(c.get(2), c.get(3), list(c.data))
```

Without `OrderedDict`, keep a dict from key to a node of a doubly linked list. `get` unlinks the node and moves it to the head; `put` adds at the head and removes the tail node and its dict entry when over capacity. `OrderedDict` is implemented exactly this way in C.
:::

:::drill code rating=1600
Write a tiny open-addressing hash map, `ProbeMap`, with `__setitem__`, `__getitem__`, `__delitem__` and `__len__`, using CPython's probe recurrence `i = (5*i + 1 + perturb) % size; perturb >>= 5`, tombstones for deletes and resizing at 2/3 load.
---
```python run=c05-c-probemap
_EMPTY, _DELETED = object(), object()

class ProbeMap:
    def __init__(self):
        self._slots = [_EMPTY] * 8
        self._used = 0      # live entries
        self._filled = 0    # live + tombstones

    def _probe(self, key):
        h = hash(key)
        mask = len(self._slots) - 1
        perturb = h & 0xFFFFFFFFFFFFFFFF
        i = h & mask
        while True:
            yield i
            perturb >>= 5
            i = (5 * i + 1 + perturb) & mask

    def _find(self, key):
        first_free = None
        for i in self._probe(key):
            slot = self._slots[i]
            if slot is _EMPTY:
                return (first_free if first_free is not None else i), False
            if slot is _DELETED:
                if first_free is None:
                    first_free = i
            elif slot[0] is key or slot[0] == key:
                return i, True

    def __setitem__(self, key, value):
        i, found = self._find(key)
        if not found:
            if self._slots[i] is _EMPTY:
                self._filled += 1
            self._used += 1
        self._slots[i] = (key, value)
        if self._filled * 3 >= len(self._slots) * 2:
            self._resize()

    def __getitem__(self, key):
        i, found = self._find(key)
        if not found:
            raise KeyError(key)
        return self._slots[i][1]

    def __delitem__(self, key):
        i, found = self._find(key)
        if not found:
            raise KeyError(key)
        self._slots[i] = _DELETED
        self._used -= 1

    def __len__(self):
        return self._used

    def _resize(self):
        old = [s for s in self._slots if s is not _EMPTY and s is not _DELETED]
        size = 8
        while size <= self._used * 3:
            size *= 2
        self._slots = [_EMPTY] * size
        self._used = self._filled = 0
        for k, v in old:
            self[k] = v

m = ProbeMap()
for i in range(100):
    m[f"k{i}"] = i
for i in range(0, 100, 2):
    del m[f"k{i}"]
print(len(m), m["k51"], len(m._slots))
try:
    m["k50"]
except KeyError as e:
    print("KeyError", e)
```

Tombstones keep probe chains intact: if a deleted slot were reset to empty, a lookup for a key further down the same chain would stop early and wrongly report it missing.
:::

:::drill code rating=1300
Write `top_k_frequent(words, k)` returning the `k` most common words, ties broken alphabetically, in O(n log k). Do not sort the whole vocabulary.
---
Count with a `Counter`, then keep a heap of size k.

```python run=c05-c-topk
import heapq
from collections import Counter

def top_k_frequent(words, k):
    counts = Counter(words)
    return heapq.nsmallest(k, counts, key=lambda w: (-counts[w], w))

text = "the cat and the hat and the bat sat on the mat and cat".split()
print(top_k_frequent(text, 3))
```

`heapq.nsmallest(k, …)` keeps a heap of k items while scanning, so it is O(n log k). For k close to n, `sorted` is just as good.
:::

:::drill code rating=1500
Write `SlidingMax(k)` with `push(x)` that returns the maximum of the last `k` values pushed, in amortised O(1), using a deque of indices kept in decreasing order of value.
---
```python run=c05-c-slidingmax
from collections import deque

class SlidingMax:
    def __init__(self, k):
        self.k = k
        self.i = 0
        self.vals = {}
        self.dq = deque()        # indices, values decreasing

    def push(self, x):
        while self.dq and self.vals[self.dq[-1]] <= x:
            self.vals.pop(self.dq.pop())
        self.dq.append(self.i)
        self.vals[self.i] = x
        if self.dq[0] <= self.i - self.k:
            self.vals.pop(self.dq.popleft())
        self.i += 1
        return self.vals[self.dq[0]]

sm = SlidingMax(3)
print([sm.push(x) for x in [1, 3, -1, -3, 5, 3, 6, 7]])
```

Each index enters and leaves the deque once, so the total work is O(n). A plain list would make `popleft` O(k).
:::

## Cheat sheet {#ch05-cheatsheet .th}

- `list`: header + separate array of pointers; growth `(n + (n >> 3) + 6) & ~3` → capacities 0, 4, 8, 16, 24, 32, 40, 52, 64, 76…; append amortised O(1); front insert/pop O(n).
- Timsort: stable, finds runs, galloping merges; O(n) on sorted input. Multi-key sort = sort by secondary, then by primary.
- `tuple`: items inline, empty tuple singleton, free lists for lengths below 20; hashable only if all items are.
- `dict`: compact layout (sparse index table + dense entries), insertion-ordered, load ≤ 2/3, resize to a power of two, never shrinks on delete, tombstones for deleted keys.
- Probing: `i = (5*i + 1 + perturb) mod 2^k`, `perturb >>= 5`.
- Hash rules: equal ⇒ same hash; `hash(1) == hash(1.0) == hash(True)`; `hash(-1) == -2`; ints mod 2^61 − 1; `str`/`bytes` randomised per process.
- Defining `__eq__` without `__hash__` makes instances unhashable. Never mutate a key's hashed fields.
- `set`: keys-only sparse table, unordered; `&` iterates the smaller set. Use `dict.fromkeys` for ordered de-duplication.
- `deque`: blocks of 64 pointers, O(1) at both ends, O(n) in the middle, `maxlen` for windows.
- `heapq` (min-heap in a list), `bisect` (O(log n) search, O(n) insert), `Counter`, `defaultdict`, `OrderedDict.move_to_end`.
