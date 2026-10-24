---
title: Memory management and garbage collection
part: Part B · Execution
lede: CPython frees most objects the instant their last reference disappears, using reference counting, and runs a separate generational collector only to find cycles that reference counting cannot. Underneath both, a small-object allocator called pymalloc carves memory into arenas, pools and blocks. This chapter explains all three layers, when `__del__` runs, how weak references avoid keeping objects alive, and why a Python process often does not give memory back to the OS.
desc: Refcounting, the cycle GC and its generations, weakref, __del__, pymalloc arenas/pools/blocks
hours: 3.5
prereqs: Chapters 1–3
---

## Reference counting {#ch04-refcount .th}

Every object's `ob_refcnt` counts the references to it. The interpreter increments it (`Py_INCREF`) whenever a new reference is created, by binding a name, storing into a container or pushing onto the value stack, and decrements it (`Py_DECREF`) when a reference goes away. When the count reaches zero, `Py_DECREF` immediately calls the type's deallocator, which decrements everything the object refers to (possibly freeing those too) and returns the memory.

```python run=c04-refcount
import sys

data = []
print(sys.getrefcount(data))      # +1 for the argument
alias = data
holder = [data, data]
print(sys.getrefcount(data))
del alias
holder.clear()
print(sys.getrefcount(data))
```

The consequences are what make CPython's memory behaviour predictable:

- **Deterministic destruction**: an object without cycles is freed at the exact moment its last reference goes, so files closed in `__del__` or by going out of scope are closed promptly (on CPython; other implementations do not promise this).
- **Cost on every operation**: each reference change is a memory write, which is why immortal objects (Chapter 1) and the free-threaded build's biased refcounting matter.
- **Cycles leak**: objects that refer to each other keep each other's counts above zero forever.

```python run=c04-del-timing
class Resource:
    def __init__(self, name):
        self.name = name
    def __del__(self):
        print("freed", self.name)

def work():
    r = Resource("local")
    print("returning")

work()
print("after call")
x = Resource("global")
x = None
print("after rebinding")
```

`"freed local"` is printed before `"after call"` because the frame's reference was the last one. Rebinding `x` frees the second object on the spot.

:::trap
"Python is garbage collected, so objects are freed at some later point" is wrong for CPython in the common case. Without cycles, freeing is immediate and happens inside the statement that dropped the last reference. Relying on that is still bad style: use `with` for files, locks and connections so the code also works on PyPy.
:::

## The cycle collector {#ch04-gc .th}

To reclaim cycles, CPython has a **tracing garbage collector** in the `gc` module. It only looks at **container** objects (lists, dicts, sets, instances, functions …) because only containers can form cycles. An int or a string can never be part of a cycle, so they are not tracked at all, and CPython even untracks containers that hold only atomic values:

```python run=c04-tracked
import gc
print(gc.is_tracked(42), gc.is_tracked("text"))
print(gc.is_tracked([]), gc.is_tracked({}), gc.is_tracked({"a": 1}), gc.is_tracked({"a": []}))
t = tuple(range(3))
print(gc.is_tracked(t), end=" ")
gc.collect()
print(gc.is_tracked(t), gc.is_tracked(([],)))
```

An empty `dict` and a dict of ints are not tracked; a dict that holds a list is. Tuples are handled lazily: a new tuple starts tracked, and the collector untracks it the first time a collection finds that it holds only atomic values.

### How it finds garbage

A collection works on a set of tracked containers:

1. Copy each object's refcount into a scratch field `gc_refs`.
2. For every object in the set, visit each object it references (`tp_traverse`) and subtract 1 from that target's `gc_refs`. After this, `gc_refs` counts only references coming from **outside** the set.
3. Objects with `gc_refs > 0` are definitely reachable from outside. Everything reachable from them is reachable too.
4. Whatever is left is only referenced from inside the set: unreachable cycles. Run their finalizers, then break the cycles with `tp_clear`, and normal refcounting frees them.

```python run=c04-cycle
import gc, weakref

class Node:
    def __init__(self, name):
        self.name = name
        self.other = None

a, b = Node("a"), Node("b")
a.other, b.other = b, a
probe = weakref.ref(a)
del a, b
print("alive after del:", probe() is not None)
print("collected:", gc.collect() >= 2)
print("alive after collect:", probe() is not None)
```

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 200" role="img" aria-label="Two nodes reference each other; after del the names are gone but each has refcount 1, so only the cycle collector frees them">
  <rect x="60" y="60" width="170" height="80" rx="10" class="d-acc"/><text x="145" y="92" text-anchor="middle" class="t-bold">Node a</text><text x="145" y="114" text-anchor="middle" class="t-mono">refcnt 1</text>
  <rect x="380" y="60" width="170" height="80" rx="10" class="d-acc"/><text x="465" y="92" text-anchor="middle" class="t-bold">Node b</text><text x="465" y="114" text-anchor="middle" class="t-mono">refcnt 1</text>
  <path d="M230 82 L 380 82" class="d-line-acc"/><text x="305" y="74" text-anchor="middle" class="t-small">a.other</text>
  <path d="M380 120 L 230 120" class="d-line-acc"/><text x="305" y="138" text-anchor="middle" class="t-small">b.other</text>
  <text x="600" y="90" class="t-small t-trap">no names left</text><text x="600" y="108" class="t-small t-trap">refcounts never 0</text>
  <text x="60" y="178" class="t-small">gc: gc_refs = refcnt − internal refs = 1 − 1 = 0 for both ⇒ unreachable ⇒ freed</text>
</svg></div><figcaption><b>A cycle survives refcounting.</b> Each node holds the other's only reference. The collector subtracts internal references and finds that nothing outside points in.</figcaption></figure>

### Generations

Most objects die young, so the collector is **generational**. New containers start in generation 0. Each collection that an object survives moves it to the next generation (0 → 1 → 2), and older generations are scanned less often:

- Generation 0 is collected when (allocations − deallocations) of tracked containers exceeds `threshold0` (700).
- Generation 1 is collected after `threshold1` (10) generation-0 collections, and generation 2 after `threshold2` (10) generation-1 collections, with an extra rule: a full collection only runs if the number of objects waiting in the young generations is at least 25% of the long-lived ones, which keeps it from going quadratic in programs with millions of objects.

```python run=c04-generations
import gc
print(gc.get_threshold())
gc.collect()
print(gc.get_count())
junk = [[] for _ in range(500)]
print(gc.get_count()[0] >= 500)
gc.collect()
print(gc.get_stats()[2]["collections"] >= 1)
```

`gc.get_count()` shows how many allocations each generation has accumulated since its last collection. `gc.freeze()` (3.7+) moves everything into a permanent generation that is never scanned, which pre-fork servers use so that the collector does not touch, and therefore copy, pages shared with child processes.

:::tip
Disabling the collector (`gc.disable()`) does not disable refcounting. Programs that create no cycles run fine without it, and some services disable it or raise the thresholds to avoid pauses. Any cycle created while it is off simply leaks until it is turned back on.
:::

## Finalizers and weak references {#ch04-del .th}

`__del__` is a **finalizer**: it runs when the object is about to be destroyed, either because its refcount hit zero or because the collector is freeing its cycle. Since 3.4 (PEP 442) objects with `__del__` inside cycles are collected normally; before that they were left in `gc.garbage`. A finalizer still has sharp edges:

- It can run at any point where a reference is dropped, including in the middle of another operation or during interpreter shutdown, when module globals may already be `None`.
- Exceptions raised in it are not propagated; they are printed to stderr as "Exception ignored in …".
- It can **resurrect** the object by storing `self` somewhere. PEP 442 guarantees `__del__` runs at most once per object.

```python run=c04-del-exc
class Bad:
    def __del__(self):
        raise RuntimeError("boom in __del__")

b = Bad()
del b
print("program continues")
```

`weakref.finalize` is the safer tool: it registers a callback that runs when the object dies or at exit, does not keep the object alive, and runs at most once.

### Weak references

A **weak reference** points at an object without increasing its refcount. Calling it returns the object while it is alive and `None` afterwards. Weak references are how caches and observer lists avoid keeping things alive just because they are cached:

```python run=c04-weakref
import weakref, gc

class Image:
    def __init__(self, name):
        self.name = name

cache = weakref.WeakValueDictionary()
img = Image("logo.png")
cache["logo"] = img
print(list(cache.keys()))
del img
print(list(cache.keys()))

events = []
obj = Image("tmp")
weakref.finalize(obj, events.append, "finalized tmp")
del obj
print(events)
try:
    weakref.ref(42)
except TypeError as e:
    print("TypeError:", e)
```

Not every type supports weak references: `int`, `str`, `tuple` and `list` do not, and a class with `__slots__` needs `"__weakref__"` in its slots to support them.

## pymalloc: arenas, pools and blocks {#ch04-pymalloc .th}

Python programs allocate huge numbers of small, short-lived objects, which general-purpose `malloc` handles poorly. CPython therefore sends every request of **512 bytes or less** to its own allocator, **pymalloc**, and passes larger ones to the system `malloc`:

- An **arena** is a 1 MiB chunk obtained from the OS with `mmap` (256 KiB before 3.10).
- An arena is divided into **pools** of 16 KiB (4 KiB before 3.10). Each pool serves exactly one **size class**.
- A pool is divided into **blocks** of its size class. Size classes are multiples of 16 bytes (16, 32, … 512), so there are 32 of them.

A request for 40 bytes is rounded up to the 48-byte class and served from a pool of 48-byte blocks. Freed blocks go onto that pool's free list and are reused for the next request of that class, which is very fast and explains the `id` reuse from Chapter 1.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 210" role="img" aria-label="An arena of 1 MiB contains pools of 16 KiB, each pool holds blocks of one size class">
  <rect x="20" y="30" width="680" height="60" rx="8" class="d-box"/><text x="30" y="24" class="t-small">arena · 1 MiB from mmap</text>
  <rect x="30" y="42" width="120" height="36" class="d-acc"/><text x="90" y="65" text-anchor="middle" class="t-mono">pool 16B</text>
  <rect x="156" y="42" width="120" height="36" class="d-key"/><text x="216" y="65" text-anchor="middle" class="t-mono">pool 48B</text>
  <rect x="282" y="42" width="120" height="36" class="d-acc"/><text x="342" y="65" text-anchor="middle" class="t-mono">pool 64B</text>
  <rect x="408" y="42" width="120" height="36" class="d-soft"/><text x="468" y="65" text-anchor="middle" class="t-mono">empty pool</text>
  <text x="560" y="65" class="t-mono">… 64 pools</text>
  <path d="M216 78 L 216 120" class="d-line"/>
  <rect x="100" y="120" width="520" height="50" rx="6" class="d-key"/><text x="110" y="114" class="t-small">one pool: header + blocks of 48 bytes</text>
  <rect x="110" y="130" width="60" height="30" class="d-soft"/><text x="140" y="150" text-anchor="middle" class="t-small">hdr</text>
  <rect x="176" y="130" width="60" height="30" class="d-acc"/><rect x="242" y="130" width="60" height="30" class="d-acc"/><rect x="308" y="130" width="60" height="30" class="d-box"/><rect x="374" y="130" width="60" height="30" class="d-acc"/><rect x="440" y="130" width="60" height="30" class="d-box"/><rect x="506" y="130" width="60" height="30" class="d-box"/>
  <text x="338" y="194" text-anchor="middle" class="t-small">white blocks are on the pool's free list; an arena is returned to the OS only when all its pools are empty</text>
</svg></div><figcaption><b>Three levels.</b> Requests up to 512 bytes are rounded to a 16-byte size class and served from a pool of that class.</figcaption></figure>

```python run=c04-tracemalloc
import tracemalloc

tracemalloc.start()
before = tracemalloc.get_traced_memory()[0]
items = [str(i) * 3 for i in range(10_000)]
after = tracemalloc.get_traced_memory()[0]
print("about", (after - before) // 10_000, "bytes per item")
snapshot = tracemalloc.take_snapshot()
top = snapshot.statistics("lineno")[0]
print(top.traceback[0].lineno, top.count >= 10_000)
tracemalloc.stop()
```

`tracemalloc` hooks the allocator and records where each block was allocated, which makes it the first tool to reach for when memory grows: take two snapshots and compare them with `snapshot.compare_to`.

### Why memory is not returned to the OS

pymalloc can give an arena back to the OS only when **every** pool in it is empty. A program that allocates a million small objects and frees 99% of them may still hold most of its arenas, because a few surviving objects are scattered across them. The process's resident memory then stays high even though Python considers the memory free and will reuse it for new objects. Large allocations (over 512 bytes) go to the system `malloc`, which has its own rules about returning memory.

:::key
"Memory did not go down after `del`" usually means fragmentation inside pymalloc or the C allocator, not a leak. A real leak shows up as memory that keeps growing under a steady workload; `tracemalloc` snapshot comparisons find it.
:::

## Concept and tricky questions {#ch04-concept .dr}

:::drill concept
What are the two mechanisms CPython uses to reclaim memory, and what does each one handle?
---
**Answer.** Reference counting frees an object immediately when its count reaches zero, which handles nearly all objects. The generational cycle collector (`gc`) periodically finds groups of containers that reference each other but are unreachable from outside, which refcounting alone can never free.

**Why.** Refcounting gives prompt, predictable freeing; the collector exists only for cycles. Disabling `gc` keeps refcounting working.
:::

:::drill tricky
Why does the cycle collector not track ints and strings, and why might it stop tracking a dict?
---
**Answer.** Ints and strings hold no references to other objects, so they can never be part of a cycle. CPython also untracks containers whose contents are all atomic (a dict of ints, a tuple of strings) because they cannot be in a cycle either, which makes collections cheaper.

**Why.** The cost of a collection is proportional to the number of tracked objects. Untracking is an optimisation; `gc.is_tracked` shows it.
:::

:::drill concept
Explain how the collector decides that a group of objects is unreachable.
---
**Answer.** It copies each object's refcount, then subtracts one for every reference that comes from another object in the same generation. Objects left with a positive count are referenced from outside and are roots; everything reachable from them is alive. What remains is referenced only from inside the group and is garbage.

**Why.** This avoids having to know all the program's roots (C stacks, extension modules): any reference the collector cannot explain must come from outside.
:::

:::drill concept
What are the default `gc` thresholds and what does each number mean?
---
**Answer.** `(700, 10, 10)`. Generation 0 is collected when net allocations of tracked containers exceed 700. Generation 1 is collected every 10 generation-0 collections, and generation 2 every 10 generation-1 collections (and only when enough new long-lived objects have piled up).

**Why.** Young objects die quickly, so frequent cheap young collections plus rare full ones give the best trade-off.
:::

:::drill tricky
Is it true that a cycle containing an object with `__del__` is never collected?
---
**Answer.** Not since Python 3.4. PEP 442 allows the collector to call finalizers of objects in a cycle and then free them. Before 3.4 such cycles were put in `gc.garbage` and leaked.

**Why.** It is still true that `__del__` order inside a cycle is undefined, and a finalizer can see other objects of the cycle already cleared.
:::

:::drill concept
What is a weak reference and give two uses.
---
**Answer.** A reference that does not increase the target's refcount, so it does not keep the target alive. Calling it returns the object or `None` once it has been freed. Uses: caches (`WeakValueDictionary`) that should not keep entries alive, observer or callback registries, and parent pointers in trees to avoid cycles.

**Why.** The weak reference is cleared (and its callback run) as part of the target's deallocation.
:::

:::drill tricky
A service frees most of a large data structure, yet its RSS stays high. Name two reasons that are not leaks.
---
**Answer.** pymalloc can only return an arena to the OS when all 64 of its pools are empty, so a few survivors pin whole arenas. The C allocator (glibc `malloc`) used for larger blocks also keeps freed memory in its own free lists and heap rather than returning it.

**Why.** The memory is free from Python's point of view and will be reused. A leak shows as growth under a steady load; check with `tracemalloc`.
:::

## Predict the output and find the bug {#ch04-reading .dr}

:::drill output
What does this print, and in what order?

```python run=c04-d-order
class T:
    def __init__(self, n):
        self.n = n
    def __del__(self):
        print("del", self.n)

def f():
    a = T(1)
    b = T(2)
    print("end of f")

f()
c = [T(3), T(4)]
c = None
print("done")
```
---
**Answer.** Both locals of `f` are freed when its frame is torn down, after `"end of f"`. Clearing a frame's locals releases them in order, so 1 then 2. Rebinding `c` frees the list, and the list's deallocator releases its items from the end, so 4 then 3, before `"done"`.

**Why.** CPython's list deallocation walks the item array backwards. These orders are CPython implementation details; only "before `done`" is something you could reasonably rely on, and even that only without cycles.
:::

:::drill output
What does this print?

```python run=c04-d-cycle
import gc, weakref

class A:
    pass

gc.disable()
a = A()
a.self = a
r = weakref.ref(a)
del a
print(r() is None)
gc.enable()
gc.collect()
print(r() is None)
```
---
**Answer.** `False` then `True`. With the collector disabled the self-cycle keeps the object alive; refcounting alone cannot free it. After a collection it is gone.

**Why.** `a.self = a` gives the object a reference to itself through its `__dict__`, so its count never reaches zero.
:::

:::drill output
What does this print?

```python run=c04-d-resurrect
saved = []

class Phoenix:
    def __del__(self):
        print("__del__ runs")
        saved.append(self)

p = Phoenix()
del p
print(len(saved))
saved.clear()
print("cleared")
```
---
**Answer.** `__del__` runs once when `p` is deleted and stores `self`, resurrecting the object. When `saved.clear()` drops it again, `__del__` does **not** run a second time.

**Why.** PEP 442 marks an object as finalized after its first `__del__` call. Resurrection is legal but almost always a bug.
:::

:::drill output
What does this print?

```python run=c04-d-weakdict
import weakref

class Key:
    def __init__(self, n):
        self.n = n

meta = weakref.WeakKeyDictionary()
k1, k2 = Key(1), Key(2)
meta[k1] = "first"
meta[k2] = "second"
del k1
print(sorted(v for v in meta.values()))
```
---
**Answer.** `['second']`: the entry for `k1` disappears as soon as `k1`'s last strong reference goes.

**Why.** `WeakKeyDictionary` is the standard way to attach extra data to objects you do not own without keeping them alive, for example per-request metadata.
:::

:::drill bug
This tree leaks memory in a long-running service that builds and drops many trees. Find the cause and fix it without disabling `gc`.

```python run=c04-d-bug-tree
import gc, weakref

class Node:
    def __init__(self, parent=None):
        self.parent = parent
        self.children = []
        if parent:
            parent.children.append(self)

root = Node()
child = Node(root)
probe = weakref.ref(root)
del root, child
print("freed without gc:", probe() is None)
```
---
**Answer.** Each child holds a strong reference to its parent and the parent holds the child, so every tree is a cycle that only the collector can free, and until it runs the trees pile up. Store the parent as a weak reference: `self._parent = weakref.ref(parent) if parent else None` with a `parent` property that calls it. Then dropping the root frees the whole tree by refcounting.

**Why.** Parent pointers are the most common source of cycles. Weak back-references make freeing immediate and cut gc work.
:::

:::drill bug
A temporary file wrapper deletes the file in `__del__`. On PyPy and sometimes at interpreter exit, files are left behind. What is wrong and what should replace it?

```python run=c04-d-bug-del
import os, tempfile, weakref

class TempFile:
    def __init__(self):
        fd, self.path = tempfile.mkstemp()
        os.close(fd)
        self._finalizer = weakref.finalize(self, os.remove, self.path)

    def close(self):
        self._finalizer()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()

with TempFile() as t:
    p = t.path
print(os.path.exists(p))
```
---
**Answer.** `__del__` timing is not guaranteed: other implementations free objects later, objects in cycles wait for the collector, and at shutdown globals such as `os` may already be gone. The fixed version above uses `weakref.finalize`, which is guaranteed to run at most once and also at exit, and gives a context manager for deterministic cleanup.

**Why.** Use explicit cleanup (`with`) as the main path and a finalizer only as a safety net.
:::

:::drill bug
A function caches results in a module-level dict keyed by request object, and memory grows forever. Why, and what is the fix?

```python run=c04-d-bug-cache
import weakref, gc

class Request:
    pass

_cache = {}

def compute(req):
    if req not in _cache:
        _cache[req] = object()
    return _cache[req]

for _ in range(1000):
    compute(Request())
print(len(_cache))

_wcache = weakref.WeakKeyDictionary()
def compute_weak(req):
    if req not in _wcache:
        _wcache[req] = object()
    return _wcache[req]

for _ in range(1000):
    compute_weak(Request())
print(len(_wcache))
```
---
**Answer.** The dict holds a strong reference to every request ever seen, so none can be freed. A `WeakKeyDictionary` drops each entry as soon as the request object dies.

**Why.** Unbounded caches are the most common real "leak" in Python services. Use weak keys, or a bounded cache such as `functools.lru_cache(maxsize=…)`.
:::

## Write the code {#ch04-coding .cd}

:::drill code rating=1300
Write a context manager `gc_report()` that, while active, records every collection the cycle collector runs (generation, objects collected) using `gc.callbacks`, and prints a summary on exit. Use it around code that creates many cycles.
---
`gc.callbacks` receives `("start" | "stop", info)` for every collection.

```python run=c04-c-gcreport nondet
import gc
from contextlib import contextmanager

@contextmanager
def gc_report():
    runs = []
    def cb(phase, info):
        if phase == "stop":
            runs.append((info["generation"], info["collected"]))
    gc.callbacks.append(cb)
    try:
        yield runs
    finally:
        gc.callbacks.remove(cb)
        by_gen = {g: sum(1 for x, _ in runs if x == g) for g in (0, 1, 2)}
        collected = sum(c for _, c in runs)
        print(f"collections per generation: {by_gen}, objects collected: {collected}")

class Pair:
    def __init__(self):
        self.me = self

with gc_report():
    for _ in range(20_000):
        Pair()
```

Every `Pair` is a self-cycle, so refcounting frees none of them. They are reclaimed by generation-0 collections triggered every 700 net allocations; the last few hundred are still waiting in generation 0 when the block ends, which is why the total is a little under 20,000. Exact counts vary slightly between runs and versions.
:::

:::drill code rating=1400
Write `LRUWeakCache(maxsize)`: a cache that keeps strong references to the `maxsize` most recently used values (so they stay alive) but still returns any older value that is alive elsewhere in the program, using a weak map.
---
Combine an `OrderedDict` for the strong, bounded part with a `WeakValueDictionary` for everything.

```python run=c04-c-lruweak
import weakref
from collections import OrderedDict

class LRUWeakCache:
    def __init__(self, maxsize):
        self.maxsize = maxsize
        self.strong = OrderedDict()
        self.weak = weakref.WeakValueDictionary()

    def get(self, key):
        value = self.weak.get(key)
        if value is not None:
            self._touch(key, value)
        return value

    def put(self, key, value):
        self.weak[key] = value
        self._touch(key, value)

    def _touch(self, key, value):
        self.strong[key] = value
        self.strong.move_to_end(key)
        while len(self.strong) > self.maxsize:
            self.strong.popitem(last=False)

class Blob:
    def __init__(self, name):
        self.name = name

cache = LRUWeakCache(2)
held = Blob("held")
cache.put("held", held)
for name in ["a", "b", "c"]:
    cache.put(name, Blob(name))
print([k for k in ["held", "a", "b", "c"] if cache.get(k)])
```

`held` fell out of the strong part when `b` was added, but it is still alive through the variable `held`, so the weak map returns it, and looking it up moves it back into the strong part. That evicts `b`, and since nothing else refers to `b` it is freed at once. `a` was evicted earlier and freed the same way. Only `held` and `c` are left.
:::

:::drill code rating=1200
Use `tracemalloc` to find which line of a function allocates the most memory. Write `top_allocations(fn, n)` that runs `fn` and returns the `n` source lines with the most bytes still allocated afterwards.
---
```python run=c04-c-topalloc
import tracemalloc

def top_allocations(fn, n=2):
    tracemalloc.start()
    try:
        result = fn()
        snap = tracemalloc.take_snapshot()
    finally:
        tracemalloc.stop()
    stats = snap.filter_traces([tracemalloc.Filter(True, __file__)]).statistics("lineno")
    return result, [(s.traceback[0].lineno, s.size // 1024) for s in stats[:n]]

def build():
    small = [i * 1000 for i in range(1000)]
    big = [str(i) * 20 for i in range(50_000)]
    return small, big

result, top = top_allocations(build)
print(top[0][0], top[0][1] > top[1][1], len(top))
```

Line 15 (`big = …`) comes out on top. Keeping `result` alive matters: memory freed before the snapshot does not appear in it, which is why `build` returns the lists instead of their lengths. To find a leak, take a snapshot before and after a repeated operation and use `after.compare_to(before, "lineno")`.
:::

:::drill code rating=1500
Show pymalloc's size classes: write a program that allocates many objects whose sizes fall on either side of a 16-byte boundary and uses `tracemalloc` to show that the memory per object jumps in steps of 16 bytes.
---
Bytes objects of length `n` need `sys.getsizeof(b"") + n` bytes; tracemalloc reports the requested size, while pymalloc rounds it up to the next multiple of 16. Measure the arena usage indirectly through `sys.getsizeof` and the size class formula.

```python run=c04-c-classes
import sys

def size_class(nbytes):
    return (nbytes + 15) // 16 * 16

base = sys.getsizeof(b"")
for n in [0, 14, 15, 16, 30, 31, 32]:
    request = sys.getsizeof(b"x" * n)
    print(f"len {n:2}: request {request:3} bytes -> block {size_class(request):3}")
print("small-object limit:", 512, "bytes; classes:", 512 // 16)
```

A `bytes` of length 15 requests 48 bytes and fits a 48-byte block exactly; length 16 requests 49 and needs a 64-byte block, wasting 15 bytes. This internal waste is what `sys._debugmallocstats()` reports as "bytes lost to quantization".
:::

## Cheat sheet {#ch04-cheatsheet .th}

- Refcounting frees an object the moment its count hits zero; deallocation cascades to what it referenced.
- Only containers are tracked by `gc`; containers of atomic values may be untracked (`gc.is_tracked`).
- Cycle detection: subtract internal references from refcount copies; whatever has zero external references is garbage.
- Generations 0/1/2 with thresholds `(700, 10, 10)`; full collections also need 25% growth of long-lived objects. `gc.freeze()` for pre-fork servers.
- `gc.disable()` stops only cycle collection; refcounting still runs.
- `__del__`: runs at most once (PEP 442), may resurrect, exceptions are only printed, timing not guaranteed outside CPython. Prefer `with` plus `weakref.finalize`.
- Weak references: `weakref.ref`, `WeakValueDictionary`, `WeakKeyDictionary`, `WeakSet`. `int`, `str`, `tuple`, `list` cannot be weakly referenced; `__slots__` classes need `__weakref__`.
- pymalloc: requests ≤ 512 bytes, 32 size classes of 16 bytes, 16 KiB pools, 1 MiB arenas (3.10+). Arenas go back to the OS only when completely empty.
- Find growth with `tracemalloc` snapshots and `compare_to`; RSS staying high after frees is usually fragmentation.
