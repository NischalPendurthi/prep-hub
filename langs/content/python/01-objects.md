---
title: Everything is an object
part: Part A · The object model
lede: In CPython every value, including every int, function, class and module, is a C struct on the heap that starts with a reference count and a pointer to its type. This chapter covers what that header holds, what `is`, `==` and `id()` actually compare, which objects CPython caches and shares, and why assignment never copies anything. Interviewers use these questions to check that you can predict aliasing bugs before you write them.
desc: PyObject header, type, id/is/==, small-int cache, interning, aliasing, big ints
hours: 3
prereqs: basic Python, the idea of a pointer
---

## What a Python object is {#ch01-pyobject .th}

Every object CPython creates is a C struct allocated on the heap. Whatever else it holds, it begins with the same two fields, defined as `PyObject` in `Include/object.h`:

- `ob_refcnt`: how many references point at the object. When it drops to zero the object is freed immediately (Chapter 4).
- `ob_type`: a pointer to the object's **type object**, which is itself a Python object. The type decides what the object can do: how to add it, hash it, print it, get an attribute from it.

Objects whose size varies, such as `int`, `tuple`, `bytes` and `list`, use `PyVarObject`, which adds an `ob_size` field (the number of items or digits). After the header comes the type-specific payload: the digits of an int, the item pointers of a tuple, the bytes of a string.

A variable is not a box that holds a value. A **name** is an entry in a namespace (a dict, or a slot in a frame) that holds a *pointer* to an object. `x = 5` makes the name `x` point at an int object. The object does not know which names point at it, only how many references exist.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 230" role="img" aria-label="Two names point at one int object whose header holds a refcount and a type pointer to the int type object">
  <text x="20" y="62" class="t-mono">x</text>
  <text x="20" y="152" class="t-mono">y</text>
  <path d="M40 58 C 120 58, 150 90, 210 100" class="d-line-acc"/>
  <path d="M40 148 C 120 148, 150 125, 210 118" class="d-line-acc"/>
  <rect x="210" y="40" width="200" height="150" rx="8" class="d-box"/>
  <text x="310" y="32" text-anchor="middle" class="t-small">PyLongObject (an int)</text>
  <rect x="222" y="54" width="176" height="36" class="d-acc"/><text x="232" y="77" class="t-mono">ob_refcnt  2</text>
  <rect x="222" y="96" width="176" height="36" class="d-soft"/><text x="232" y="119" class="t-mono">ob_type   ─────┐</text>
  <rect x="222" y="138" width="176" height="40" class="d-key"/><text x="232" y="162" class="t-mono">digits: 5</text>
  <path d="M398 114 L 520 114" class="d-line"/>
  <rect x="520" y="60" width="180" height="110" rx="8" class="d-box"/>
  <text x="610" y="52" text-anchor="middle" class="t-small">PyTypeObject "int"</text>
  <text x="534" y="90" class="t-mono">tp_name  "int"</text>
  <text x="534" y="112" class="t-mono">tp_hash  long_hash</text>
  <text x="534" y="134" class="t-mono">tp_as_number …</text>
  <text x="534" y="156" class="t-mono">ob_type → type</text>
</svg></div><figcaption><b>Names hold pointers.</b> After <code>x = 5; y = x</code> there is one int object with two references. Its <code>ob_type</code> points at the <code>int</code> type object, whose own type is <code>type</code>.</figcaption></figure>

Because types are objects too, you can ask any type for its type. The chain stops at `type`, which is its own type, and every class including `type` inherits from `object`:

```python run=c01-type-chain
print(type(5), type(int), type(type))
print(int.__mro__)
print(isinstance(type, object), isinstance(object, type))
print(issubclass(type, object), issubclass(object, type))
```

### How big an object is

`sys.getsizeof` returns the size of the object's own struct in bytes, not counting objects it points to. On a 64-bit build the two header fields already take 16 bytes, so even an empty object is not small:

```python run=c01-sizes
import sys
for label, v in [("object()", object()), ("None", None), ("1.0", 1.0), ("0", 0), ("1", 1),
                 ("2**30", 2**30), ("2**60", 2**60), ('""', ""), ('"abc"', "abc"),
                 ("()", ()), ("[]", []), ("{}", {}), ("set()", set())]:
    print(f"{label:>9} {sys.getsizeof(v):4}")
```

An `int` stores its magnitude in 30-bit "digits". `0` and `1` both need one digit, so they are 28 bytes, and every 30 bits of magnitude adds 4 bytes. A list's 56 bytes hold only the header and a pointer to a separate array of item pointers, which is why `getsizeof` of a list never includes its items.

:::trap
`sys.getsizeof([1, 2, 3])` does not measure the ints. To estimate the real footprint of a container you have to walk it and add up the size of each distinct object, which is what tools such as `tracemalloc` and `pympler` do.
:::

### Immortal objects (3.12)

Before 3.12, `None`, `True`, small ints and interned strings had ordinary reference counts that every use incremented and decremented. That meant constant writes to shared memory, which hurts multi-core performance. PEP 683 made these objects **immortal**: their refcount is set to a huge sentinel value and `Py_INCREF` and `Py_DECREF` leave it alone.

```python run=c01-immortal
import sys
print(sys.getrefcount(None))
print(sys.getrefcount(7))
x = object()
print(sys.getrefcount(x))
```

`getrefcount` reports one more than you might expect for `x` because passing `x` as an argument creates a temporary reference.

## Identity, equality and is {#ch01-identity .th}

Python has two different questions about two objects:

- `a is b` asks whether they are the **same object**. In CPython this compares two pointers and cannot be overridden.
- `a == b` asks whether they are **equal**. It calls `a.__eq__(b)` (and may fall back to `b.__eq__(a)`), so a class decides what equality means.

`id(obj)` returns an integer that is unique among objects that exist at the same time. In CPython it is the object's memory address. Two objects with non-overlapping lifetimes may get the same `id`, because the memory of the first was reused:

```python run=c01-id-reuse nondet
print(id([]) == id([]))
a = []
b = []
print(id(a) == id(b))
```

In the first line, the first list is freed as soon as `id()` returns, and the second list is allocated at the same address. In the second pair both lists are alive at once, so their ids differ.

### When equality is not reflexive

`float("nan")` is not equal to itself, as IEEE 754 requires. Container comparisons, however, check identity before equality as an optimisation (`PyObject_RichCompare` with `Py_EQ` inside list comparison uses `is` first). So the same NaN object is "found" in a list even though it is not equal to itself:

```python run=c01-nan
x = float("nan")
print(x == x, x is x)
print([x] == [x], x in [x])
print(float("nan") in [float("nan")])
```

:::key
Use `is` only for singletons such as `None`, `True`, `False`, `Ellipsis` and sentinel objects you created yourself. Use `==` for everything else. Code that uses `is` on numbers or strings may pass on your machine and fail on another Python version.
:::

## Caches, constants and interning {#ch01-caches .th}

Some objects are shared because CPython creates them once and hands out the same object every time. This is an implementation detail, but interviewers love it because it makes `is` look inconsistent.

### The small-int cache

CPython pre-creates the ints from −5 to 256 when the interpreter starts. Any operation that produces one of these values returns the cached object. Values outside the range get a fresh object each time they are computed at run time:

```python run=c01-intcache
a = int("256"); b = int("256")
c = int("257"); d = int("257")
print(a is b, c is d)
e = 250 + 6; f = 251 + 6
print(e is int("256"), f)
```

### Constants in the same code object

The compiler collects the literals of a function or module into a tuple of constants, `co_consts`, and merges equal ones. Two literals `257` written in the same compilation unit therefore end up as the same object, even though 257 is outside the small-int cache. Compiled separately, they are different objects:

```python run=c01-consts
a = 257
b = 257
print(a is b)

ns = {}
exec("x = 257", ns)
exec("y = 257", ns)
print(ns["x"] is ns["y"])

def f():
    return 1000, 1000
p, q = f()
print(p is q, f.__code__.co_consts)
```

This is why `a is b` gives a different answer in a script, in the interactive prompt (where each line is compiled separately) and inside a function. None of these answers is a language guarantee.

### String interning

Strings that look like identifiers (letters, digits and underscores) and that appear as constants in code are **interned**: CPython keeps one copy in a global table so that attribute and variable lookups can compare pointers before comparing characters. Strings built at run time are not interned unless you call `sys.intern`:

```python run=c01-intern
import sys
a = "hello_world"
b = "hello_" + "world"          # folded at compile time, then interned
c = "".join(["hello_", "world"])  # built at run time
print(a is b, a is c, a == c)
print(sys.intern(c) is a)
s = "hello world!"
t = "hello world!"
print(s is t)
```

`s is t` is `True` here only because both literals live in the same code object, not because the string was interned (it contains a space and `!`).

:::tip
`sys.intern` is useful when you hold millions of repeated strings, such as the keys of parsed JSON records: it stores one copy of each and makes dictionary lookups on them slightly faster.
:::

## Assignment binds, it never copies {#ch01-binding .th}

`b = a` copies a pointer. After it, both names refer to the same object, and a change made through one name is visible through the other. This only matters for **mutable** objects (`list`, `dict`, `set`, most user classes). For immutable ones (`int`, `str`, `tuple`, `frozenset`) every "change" creates a new object, so sharing is invisible.

```python run=c01-alias
a = [1, 2, 3]
b = a
b.append(4)
print(a, a is b)

s = "abc"
t = s
t += "d"
print(s, t, s is t)
```

### `+=` is two different operations

`x += y` first tries `x.__iadd__(y)`, which mutable types implement by changing `x` in place and returning it. If there is no `__iadd__`, it falls back to `x = x + y`, which builds a new object and rebinds the name. Either way the name is assigned at the end, and that last step explains one of the strangest results in Python:

```python run=c01-tuple-iadd
t = ([1, 2], 3)
try:
    t[0] += [99]
except TypeError as e:
    print("error:", e)
print(t)
```

`t[0] += [99]` runs as: load `t[0]` (the list), call `list.__iadd__`, which appends 99 in place and succeeds, then store the result back with `t[0] = …`, which fails because tuples do not support item assignment. The exception is raised after the mutation has already happened.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 170" role="img" aria-label="A tuple holds a pointer to a list; the list is extended in place, then storing into the tuple raises">
  <rect x="30" y="50" width="160" height="70" rx="8" class="d-box"/><text x="110" y="42" text-anchor="middle" class="t-small">tuple t (immutable)</text>
  <rect x="42" y="64" width="64" height="40" class="d-acc"/><text x="74" y="89" text-anchor="middle" class="t-mono">[0]</text>
  <rect x="114" y="64" width="64" height="40" class="d-soft"/><text x="146" y="89" text-anchor="middle" class="t-mono">3</text>
  <path d="M106 84 L 300 84" class="d-line-acc"/>
  <rect x="300" y="50" width="200" height="70" rx="8" class="d-key"/><text x="400" y="42" text-anchor="middle" class="t-small">list (mutable)</text>
  <text x="400" y="90" text-anchor="middle" class="t-mono">[1, 2, 99]</text>
  <text x="530" y="74" class="t-small t-key">1. __iadd__ extends: OK</text>
  <text x="530" y="98" class="t-small t-trap">2. t[0] = result: TypeError</text>
  <text x="30" y="150" class="t-small">The tuple still points at the same list, so the 99 stays.</text>
</svg></div><figcaption><b>Mutate, then fail.</b> The in-place add succeeds on the list; only the final store into the tuple raises.</figcaption></figure>

### Copies: shallow and deep

`list(a)`, `a[:]`, `a.copy()` and `copy.copy(a)` make a **shallow** copy: a new outer container whose slots point at the same inner objects. `copy.deepcopy` recursively copies the inner objects too, and keeps a memo dict so that shared and cyclic references are copied once:

```python run=c01-copies
import copy
grid = [[0, 0], [0, 0]]
shallow = grid[:]
deep = copy.deepcopy(grid)
grid[0][0] = 1
print(shallow, deep)

row = [0] * 2
bad = [row] * 2
bad[0][0] = 7
good = [[0] * 2 for _ in range(2)]
good[0][0] = 7
print(bad, good)
```

`[row] * 2` repeats the *pointer* to one list, so both rows are the same object. The comprehension evaluates `[0] * 2` again on every iteration and builds independent rows.

## Ints have no fixed size {#ch01-ints .th}

A Python `int` never overflows. CPython stores the sign and magnitude as an array of 30-bit digits, so the cost of arithmetic grows with the number of digits: addition is linear, and multiplication uses Karatsuba above a threshold. Converting very large ints to and from decimal strings is quadratic, so since 3.11 CPython refuses conversions above 4300 digits by default to block denial-of-service inputs:

```python run=c01-bigint
import sys
n = 2**100
print(n, n.bit_length(), sys.getsizeof(n))
print(sys.int_info.bits_per_digit, sys.get_int_max_str_digits())
big = 10**5000
try:
    str(big)
except ValueError as e:
    print("ValueError:", str(e)[:60])
print(len(hex(big)))
```

Hexadecimal conversion is linear, so it is not limited. You can raise the limit with `sys.set_int_max_str_digits` or the `PYTHONINTMAXSTRDIGITS` environment variable.

Booleans are ints: `bool` is a subclass of `int`, `True == 1` and `True + True == 2`. That is why `{1: "a", True: "b"}` has a single key.

## Concept and tricky questions {#ch01-concept .dr}

:::drill concept
What two fields does every CPython object start with, and what is each one for?
---
**Answer.** `ob_refcnt`, the number of references to the object, and `ob_type`, a pointer to its type object.

**Why.** The refcount drives CPython's main memory management: when it reaches zero the object is deallocated at once. The type pointer is how the interpreter finds behaviour: `len(x)`, `x + y` and `x.attr` all go through slots of `type(x)`. Variable-size objects add `ob_size` after these two.
:::

:::drill concept
What is the difference between `a is b` and `a == b`? Which one can a class change?
---
**Answer.** `is` tests identity (the same object; in CPython, the same address). `==` tests equality by calling `__eq__`. A class can change `==` but never `is`.

**Why.** Identity is a pointer comparison done by the interpreter. Equality is a method call, so it can be anything: NumPy's `==` returns an array, and NaN is not equal to itself.
:::

:::drill tricky
Is it safe to write `if x is 0:` or `if name is "admin":`? What does Python 3.8+ do when it sees this?
---
**Answer.** No. The result depends on caching and interning details that differ between versions, implementations and how the code was compiled. Since 3.8 the compiler emits `SyntaxWarning: "is" with a literal. Did you mean "=="?`

**Why.** `x is 0` happens to be `True` for any `x` equal to 0 in CPython because 0 is in the small-int cache, but `x is 1000` usually is not. Comparing strings with `is` works only when both happen to be interned.
:::

:::drill tricky
`id(a) == id(b)` is `True`. Can `a` and `b` still be different objects?
---
**Answer.** Only if their lifetimes do not overlap. An id is unique among objects alive at the same moment, so if you saved `id(a)`, let `a` die and then created `b`, `b` may reuse the address.

**Why.** CPython's `id` is the address. When an object is freed, pymalloc puts its block back on a free list, and the next object of the same size class often gets it. That is why `id([]) == id([])` is usually `True`.
:::

:::drill concept
Which integers does CPython cache, and when are two equal ints outside that range still the same object?
---
**Answer.** −5 to 256 are cached for the life of the interpreter. Equal ints outside the range are the same object when they are constants in the same code object (the compiler merges equal entries in `co_consts`), or when you pass the same object around.

**Why.** The cache exists because small ints are created constantly (loop counters, indexes, lengths). Constant merging is a separate, compile-time effect.
:::

:::drill tricky
What does `sys.getrefcount(None)` print on 3.12, and why is it not the real number of references?
---
**Answer.** `4294967295` on a 64-bit build. `None` is immortal (PEP 683), so its count is a fixed sentinel that `Py_INCREF` and `Py_DECREF` do not change.

**Why.** Immortality removes the writes to `ob_refcnt` for objects that are used everywhere, which reduces cache-line traffic between cores and is a step towards the free-threaded build.
:::

:::drill concept
`b = a` where `a` is a list. Name every way to get an independent copy of the list, and say which ones also copy the items inside it.
---
**Answer.** `a[:]`, `list(a)`, `a.copy()`, `copy.copy(a)` and `[*a]` make shallow copies (a new list, the same item objects). Only `copy.deepcopy(a)` also copies the nested objects.

**Why.** A shallow copy duplicates the array of pointers. Whether that is enough depends on whether the items are mutable: a list of ints is fully independent after a shallow copy, a list of lists is not.
:::

## Predict the output and find the bug {#ch01-reading .dr}

:::drill output
What does this print?

```python run=c01-d-iadd
def add(x, item):
    x += [item]
    return x

a = [1]
b = add(a, 2)
c = (1,)
d = add(list(c), 2)
print(a, b, a is b, c, d)
```
---
**Answer.** The list passed in is extended in place, so `a` and `b` are the same object holding `[1, 2]`. `list(c)` is a fresh list, so the tuple `c` is untouched.

**Why.** `x += [item]` calls `list.__iadd__`, which mutates the caller's list. A function that wants to avoid this must write `x = x + [item]` or copy first.
:::

:::drill output
What does this print?

```python run=c01-d-keys
d = {1: "int", 1.0: "float", True: "bool"}
print(d)
print(len({0, False, 0.0, -0.0}))
```
---
**Answer.** `1`, `1.0` and `True` are equal and hash the same, so they are one key. The first key object inserted (`1`) is kept and the value is overwritten twice, giving `{1: 'bool'}`. The set has one element.

**Why.** Dict and set membership use hash and `==`. `hash(1) == hash(1.0) == hash(True) == 1` and `0 == False == 0.0 == -0.0`. When a key already exists, the dict keeps the old key object and replaces only the value.
:::

:::drill output
What does this print?

```python run=c01-d-grid
board = [[" "] * 3] * 3
board[1][1] = "X"
print(board)
```
---
**Answer.** All three rows show the `X`, because `[row] * 3` repeats one pointer three times.

**Why.** Sequence repetition copies references, not objects. Build independent rows with `[[" "] * 3 for _ in range(3)]`.
:::

:::drill output
What does this print?

```python run=c01-d-nan
import math
nan = math.nan
values = [nan, 1.0]
print(nan in values, float("nan") in values, values.index(nan))
print(sorted([3.0, nan, 1.0, 2.0]))
```
---
**Answer.** `nan in values` is `True` because containment checks identity first, and the same `math.nan` object is in the list. A new NaN object is not found. `index` finds position 0 the same way. `sorted` cannot order NaN, and because every comparison with NaN is `False`, the result is not fully sorted.

**Why.** Sorting assumes a total order. With NaN in the list, the output depends on where NaN starts, so filter it out (or sort with a key that maps NaN to infinity) before sorting.
:::

:::drill output
What does this print?

```python run=c01-d-bool
print(True + True, True * 10, isinstance(True, int))
print(sum([True, False, True]), ["no", "yes"][True])
print(hash(True) == hash(1), True is 1 == True)
```
---
**Answer.** `bool` is a subclass of `int`, so `True` behaves as 1 in arithmetic, indexing and hashing. The last expression is a chained comparison, `(True is 1) and (1 == True)`, and `True is 1` is `False` because they are different objects.

**Why.** Chained comparisons are a classic trap: `a is b == c` does not mean `(a is b) == c`. Python also emits a `SyntaxWarning` for `is` with a literal.
:::

:::drill bug
This function is meant to return a new list with `x` appended, leaving the caller's list alone. Find the bug.

```python run=c01-d-bug-append
def with_item(items, x):
    result = items
    result.append(x)
    return result

orig = [1, 2]
new = with_item(orig, 3)
print(orig, new)
```
---
**Answer.** `result = items` only copies the reference, so `append` changes the caller's list. Fix: `result = items.copy()` (or `return [*items, x]`).

**Why.** Python passes references by value ("call by sharing"). The function cannot rebind the caller's name, but it can mutate the object the name points at.
:::

:::drill bug
A config loader caches a default dict and hands it out. Users report that changing one config changes another. Find the bug.

```python run=c01-d-bug-default
DEFAULT = {"retries": 3, "hosts": ["a"]}

def load(overrides):
    cfg = dict(DEFAULT)
    cfg.update(overrides)
    return cfg

c1 = load({})
c1["hosts"].append("b")
c2 = load({})
print(c2["hosts"], DEFAULT["hosts"])
```
---
**Answer.** `dict(DEFAULT)` is a shallow copy, so every config shares the same `hosts` list, and appending to it changes `DEFAULT` for all later loads. Fix: `cfg = copy.deepcopy(DEFAULT)`.

**Why.** Shallow copies are fine for flat dicts of immutable values. As soon as a value is a list or dict, you need a deep copy or an immutable value (a tuple).
:::

:::drill bug
This check passes in tests that use small ids and fails in production. Why?

```python run=c01-d-bug-is
def same_user(a_id, b_id):
    return a_id is b_id

print(same_user(int("42"), int("42")))
print(same_user(int("4242"), int("4242")))
```
---
**Answer.** `is` compares identity. Ids up to 256 come from the small-int cache and are the same object; larger ids parsed from requests are different objects. Use `==`.

**Why.** The tests passed by accident of caching. Linters (`flake8` F632) and the compiler's `SyntaxWarning` catch the literal case, but not this one where both sides are variables.
:::

## Write the code {#ch01-coding .cd}

:::drill code rating=1200
Write `deep_size(obj)` that returns an estimate of the total memory used by an object and everything it references through lists, tuples, sets, dicts and instance `__dict__`s. Count each distinct object once, even if it is shared or part of a cycle.
---
Walk the object graph with an explicit stack and a set of ids already counted, and add `sys.getsizeof` for each new object.

```python run=c01-c-deepsize
import sys

def deep_size(obj):
    seen = set()
    stack = [obj]
    total = 0
    while stack:
        o = stack.pop()
        if id(o) in seen:
            continue
        seen.add(id(o))
        total += sys.getsizeof(o)
        if isinstance(o, dict):
            stack.extend(o.keys())
            stack.extend(o.values())
        elif isinstance(o, (list, tuple, set, frozenset)):
            stack.extend(o)
        if hasattr(o, "__dict__"):
            stack.append(o.__dict__)
    return total

shared = list(range(10))
data = [shared, shared, {"k": shared}]
data.append(data)              # a cycle
print(sys.getsizeof(data), deep_size(data))
print(deep_size([]), deep_size([[]]))
```

The `seen` set makes shared and cyclic references count once, which is the same trick `copy.deepcopy` uses with its memo dict. Keeping `id`s is safe here because every object stays alive (it is reachable from `obj`) for the whole walk.
:::

:::drill code rating=1300
Write `Sentinel(name)`, a class whose instances are unique markers you can test with `is`, such as `MISSING = Sentinel("MISSING")` for "no argument given". It should print as `<MISSING>`, stay a singleton per name, and survive `copy.copy` and `copy.deepcopy` as the same object.
---
Cache instances by name in `__new__` and return `self` from the copy hooks.

```python run=c01-c-sentinel
import copy

class Sentinel:
    _registry = {}

    def __new__(cls, name):
        if name not in cls._registry:
            obj = super().__new__(cls)
            obj._name = name
            cls._registry[name] = obj
        return cls._registry[name]

    def __repr__(self):
        return f"<{self._name}>"

    def __bool__(self):
        return False

    def __copy__(self):
        return self

    def __deepcopy__(self, memo):
        return self

MISSING = Sentinel("MISSING")

def get(d, key, default=MISSING):
    if key in d:
        return d[key]
    if default is MISSING:
        raise KeyError(key)
    return default

print(MISSING, Sentinel("MISSING") is MISSING)
print(copy.deepcopy([MISSING])[0] is MISSING, get({}, "a", None))
```

A sentinel beats `None` as a default when `None` is a valid value the caller might pass.
:::

:::drill code rating=1100
Write `freeze(obj)` that turns nested lists, dicts and sets into tuples, sorted tuples of key/value pairs and frozensets, so that the result can be used as a dict key or put in a set.
---
Recurse by type and convert each container to its immutable counterpart.

```python run=c01-c-freeze
def freeze(obj):
    if isinstance(obj, dict):
        return tuple(sorted((k, freeze(v)) for k, v in obj.items()))
    if isinstance(obj, (list, tuple)):
        return tuple(freeze(x) for x in obj)
    if isinstance(obj, (set, frozenset)):
        return frozenset(freeze(x) for x in obj)
    hash(obj)   # raises TypeError for anything else that is unhashable
    return obj

cache = {}
key = freeze({"b": [1, 2], "a": {3, 4}})
cache[key] = "result"
print(key)
print(cache[freeze({"a": {4, 3}, "b": [1, 2]})])
```

Sorting the dict items makes two dicts with the same contents but different insertion order produce the same key.
:::

:::drill code rating=1400
Show, with a program, that a list's `id` stays the same while it grows but its item array moves. Use `ctypes` to read the list's internal `ob_item` pointer before and after many appends.
---
A `PyListObject` is `PyObject_VAR_HEAD` (refcount, type, size) followed by `ob_item` and `allocated`. With a 64-bit build those are at byte offsets 24 and 32.

```python run=c01-c-obitem
import ctypes

def internals(lst):
    base = id(lst)
    ob_item = ctypes.c_void_p.from_address(base + 24).value
    allocated = ctypes.c_ssize_t.from_address(base + 32).value
    return ob_item, allocated

a = [0]
id_before = id(a)
item_before, cap_before = internals(a)
for i in range(10_000):
    a.append(i)
item_after, cap_after = internals(a)
print(id(a) == id_before, item_after != item_before)
print(cap_before, cap_after, len(a))
```

The list object (and its `id`) never moves. Growing the list calls `realloc` on the separate pointer array, which may move it. That is why holding the `id` of a list is safe but holding a raw pointer into its items is not.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- Every object starts with `ob_refcnt` and `ob_type`; variable-size ones add `ob_size`. A 64-bit `object()` is 16 bytes, an `int` 28.
- Names hold references. Assignment, argument passing and `return` copy references, never objects.
- `is` is identity (address in CPython), `==` calls `__eq__`. Use `is` only for `None`, `True`, `False` and your own sentinels.
- Cached: ints −5..256, `None`, `True`, `False`, the empty tuple, and interned identifier-like string constants. In 3.12 these are immortal.
- Equal constants in one code object are merged, so `a = 257; b = 257` in one file gives `a is b == True`. Not a guarantee.
- Containers check identity before equality, so `nan in [nan]` is `True` for the same NaN object.
- `x += y` calls `__iadd__` (in place for mutable types), then assigns. `t[0] += [1]` mutates the list and then raises.
- Shallow copy: `a[:]`, `list(a)`, `a.copy()`. Deep copy: `copy.deepcopy`. `[[0]*n]*m` shares rows.
- Ints are arbitrary precision in 30-bit digits; decimal conversion is limited to 4300 digits since 3.11.
- `bool` subclasses `int`: `True == 1`, and `1`, `1.0` and `True` are the same dict key.
