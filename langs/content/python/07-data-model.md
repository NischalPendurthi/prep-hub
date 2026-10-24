---
title: The data model and special methods
part: Part D · Classes and attributes
lede: Python's syntax is a thin layer over special ("dunder") methods: `a + b`, `len(x)`, `x[i]`, `if x:` and `with` all become calls to methods on the object's type. This chapter covers how those calls are dispatched (on the type, not the instance), how binary operators choose between `__add__` and `__radd__`, what returning `NotImplemented` does, how truthiness, containment and comparison fall back, and what `__slots__` changes in an object's memory layout.
desc: Dunder lookup on the type, operator dispatch and NotImplemented, truthiness, comparisons, __slots__
hours: 3.5
prereqs: Chapters 1, 3 and 5
---

## Syntax is method calls on the type {#ch07-dispatch .th}

Every operator and many built-in functions translate into a special method:

| You write | Python calls |
|---|---|
| `len(x)` | `type(x).__len__(x)` |
| `x[k]`, `x[k] = v`, `del x[k]` | `__getitem__`, `__setitem__`, `__delitem__` |
| `a + b` | `type(a).__add__(a, b)`, then maybe `type(b).__radd__(b, a)` |
| `if x:` | `__bool__`, else `__len__` |
| `k in x` | `__contains__`, else iteration |
| `for v in x` | `__iter__`, else `__getitem__` with 0, 1, 2… |
| `x()` | `type(x).__call__(x)` |
| `with x:` | `__enter__` and `__exit__` |
| `repr(x)`, `str(x)`, `f"{x}"` | `__repr__`, `__str__`, `__format__` |

The important detail is in the first column of every row: CPython looks special methods up **on the type**, skipping the instance's own `__dict__`. At the C level each type has slots (`tp_as_number->nb_add`, `tp_as_sequence->sq_length` …) that are filled from the class's dunder methods when the class is created or modified, and the interpreter calls the slot directly.

```python run=c07-type-lookup
class Box:
    def __len__(self):
        return 3

b = Box()
b.__len__ = lambda: 99          # an instance attribute
print(len(b), b.__len__())

Box.__len__ = lambda self: 7    # changing the class updates the slot
print(len(b))
```

`len(b)` ignores the instance attribute, while the explicit `b.__len__()` is an ordinary attribute lookup and finds it. Assigning to the class works because `type.__setattr__` notices dunder names and refreshes the C slot.

:::key
Because special methods are found on the type, you cannot give one instance its own operator behaviour by assigning a method to it, and `__getattr__` on the instance's class is never consulted for implicit special method calls.
:::

```python run=c07-getattr-bypass
class Proxy:
    def __init__(self, target):
        self._target = target
    def __getattr__(self, name):
        return getattr(self._target, name)

p = Proxy([1, 2, 3])
print(p.count(2), p.__len__())
try:
    len(p)
except TypeError as e:
    print("TypeError:", e)
```

A transparent proxy has to define every special method it wants to forward explicitly, which is why libraries such as `wrapt` exist.

## Binary operators and NotImplemented {#ch07-operators .th}

For `a + b`, Python follows these rules:

1. If `type(b)` is a **subclass** of `type(a)` and overrides `__radd__`, try `b.__radd__(a)` first. This lets a subclass control mixed operations with its base.
2. Otherwise try `a.__add__(b)`.
3. If that method is missing or returns the special singleton **`NotImplemented`**, try `b.__radd__(a)` (only if the types differ).
4. If both give `NotImplemented`, raise `TypeError`.

Returning `NotImplemented` (not raising `NotImplementedError`) is how a method says "I do not know how to handle this type, ask the other operand".

```python run=c07-radd
class Money:
    def __init__(self, cents):
        self.cents = cents
    def __add__(self, other):
        if isinstance(other, Money):
            return Money(self.cents + other.cents)
        if isinstance(other, int):
            return Money(self.cents + other)
        return NotImplemented
    def __radd__(self, other):
        return self.__add__(other)
    def __repr__(self):
        return f"Money({self.cents})"

print(Money(5) + Money(7), Money(5) + 3, 3 + Money(5))
print(sum([Money(1), Money(2)]))
try:
    Money(1) + "x"
except TypeError as e:
    print("TypeError:", e)
```

`3 + Money(5)` works because `int.__add__` returns `NotImplemented` for a `Money`, so Python calls `Money.__radd__`. `sum` starts from `0`, so it also relies on `__radd__`.

### Augmented assignment

`a += b` tries `a.__iadd__(b)` first. If it is missing or returns `NotImplemented`, Python falls back to `a = a + b` (with the full `__add__`/`__radd__` dance). Mutable types implement `__iadd__` to modify themselves and return `self`; immutable types do not define it, so `+=` creates a new object (Chapter 1).

### The subclass rule

```python run=c07-subclass-first
class Base:
    def __add__(self, other):
        return "Base.__add__"
    def __radd__(self, other):
        return "Base.__radd__"

class Derived(Base):
    def __radd__(self, other):
        return "Derived.__radd__"

print(Base() + Derived())
print(Derived() + Base())
```

Even though `Base` is on the left, `Derived.__radd__` wins, because the right operand's type is a subclass that overrides the reflected method.

## Comparisons, truthiness and containment {#ch07-compare .th}

### Rich comparisons

`==`, `!=`, `<`, `<=`, `>`, `>=` call `__eq__`, `__ne__`, `__lt__`, `__le__`, `__gt__`, `__ge__`. Their reflections are swapped: if `a < b` gets `NotImplemented`, Python tries `b > a`. For `==`, the final fallback when both sides return `NotImplemented` is an identity comparison, so `==` never raises `TypeError`. `__ne__` by default inverts `__eq__`.

```python run=c07-compare
from functools import total_ordering

@total_ordering
class Version:
    def __init__(self, text):
        self.parts = tuple(int(p) for p in text.split("."))
    def __eq__(self, other):
        if not isinstance(other, Version):
            return NotImplemented
        return self.parts == other.parts
    def __lt__(self, other):
        if not isinstance(other, Version):
            return NotImplemented
        return self.parts < other.parts
    def __hash__(self):
        return hash(self.parts)
    def __repr__(self):
        return ".".join(map(str, self.parts))

vs = [Version("1.10"), Version("1.2"), Version("1.9.1")]
print(sorted(vs), max(vs), Version("1.2") >= Version("1.2.0"))
print(Version("1.0") == "1.0", Version("1.0") != Version("1.0"))
```

`total_ordering` derives `<=`, `>` and `>=` from `__eq__` and `__lt__`. Comparing tuples of ints gives the natural version order (1.2 < 1.9.1 < 1.10), which string comparison gets wrong. Note the `False` for `1.2 >= 1.2.0`: the tuples `(1, 2)` and `(1, 2, 0)` differ, and a shorter tuple that is a prefix of a longer one sorts first. A real version class would strip or pad trailing zeros before comparing.

### Truthiness

`if x:` calls `type(x).__bool__`. If the class has no `__bool__`, Python uses `__len__` and treats zero as false. If it has neither, the object is always true.

```python run=c07-bool
class Empty:
    def __len__(self):
        return 0

class Plain:
    pass

class Strict:
    def __bool__(self):
        return 1

print(bool(Empty()), bool(Plain()), bool([]), bool([0]), bool(0.0), bool("0"))
try:
    bool(Strict())
except TypeError as e:
    print("TypeError:", e)
```

`__bool__` must return a real `bool`; returning `1` raises `TypeError`.

### Containment and iteration fallbacks

`x in obj` uses `__contains__` if defined. Otherwise Python iterates over `obj` with `__iter__`, and if there is no `__iter__` either, it uses the **old sequence protocol**: call `__getitem__(0)`, `__getitem__(1)` … until `IndexError`. So defining only `__getitem__` is enough to make an object iterable and searchable:

```python run=c07-getitem-protocol
class Squares:
    def __getitem__(self, i):
        if i >= 5:
            raise IndexError(i)
        return i * i

s = Squares()
print(list(s), 9 in s, 10 in s)
print(iter(s))
```

## Representations {#ch07-repr .th}

- `__repr__` should be unambiguous, for developers. Containers use the repr of their items, and the REPL and debuggers show it. If possible it looks like an expression that rebuilds the object.
- `__str__` is the readable form used by `print` and `str()`. It defaults to `__repr__`.
- `__format__(spec)` handles format specs in f-strings and `format()`.

```python run=c07-repr
from datetime import date

class Temp:
    def __init__(self, c):
        self.c = c
    def __repr__(self):
        return f"Temp({self.c!r})"
    def __str__(self):
        return f"{self.c}°C"
    def __format__(self, spec):
        if spec == "f":
            return f"{self.c * 9 / 5 + 32:.1f}°F"
        return format(str(self), spec)

t = Temp(21.5)
print(t, repr(t), [t])
print(f"{t:f} | {t:>8} | {date(2026, 1, 2):%d %b}")
```

## __slots__ {#ch07-slots .th}

By default each instance has a `__dict__` for its attributes (stored as inline values with shared keys in 3.11+, Chapter 5, but still with room for a dict). Declaring `__slots__` replaces the per-instance dict with fixed fields at known offsets in the object, accessed through **member descriptors** on the class:

```python run=c07-slots
import sys, tracemalloc

class Plain:
    def __init__(self, x, y):
        self.x, self.y = x, y

class Slotted:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y

def measure(cls, n=10_000):
    tracemalloc.start()
    objs = [cls(i, i) for i in range(n)]
    size = tracemalloc.get_traced_memory()[0]
    tracemalloc.stop()
    return size // n

print("bytes per object:", measure(Plain), measure(Slotted))
s = Slotted(1, 2)
print(type(Slotted.__dict__["x"]).__name__, hasattr(s, "__dict__"))
try:
    s.z = 3
except AttributeError as e:
    print("AttributeError:", e)
```

The rules that trip people up:

- Slots save memory per instance and make attribute access slightly faster, but you can no longer add arbitrary attributes.
- A subclass without its own `__slots__` gets a `__dict__` again, so every class in the hierarchy must declare slots to keep the saving.
- Slotted instances cannot be weakly referenced unless `"__weakref__"` is in the slots.
- A slot name cannot also be a class attribute (the descriptor would be overwritten), so defaults go in `__init__`. `@dataclass(slots=True)` (3.10+) handles this for you.

## Concept and tricky questions {#ch07-concept .dr}

:::drill concept
Why does `len(obj)` ignore a `__len__` attribute set on the instance?
---
**Answer.** Implicit special method calls look the method up on the type (`type(obj).__len__`), not on the instance. CPython calls the C slot of the type directly.

**Why.** It is faster, and it avoids a metaclass confusion: `len(SomeClass)` must use `type(SomeClass).__len__`, not the `__len__` that `SomeClass` defines for its instances.
:::

:::drill concept
What is the difference between returning `NotImplemented` and raising `NotImplementedError`?
---
**Answer.** `NotImplemented` is a singleton returned by binary special methods to say "I cannot handle this operand type"; Python then tries the reflected method of the other operand. `NotImplementedError` is an exception for abstract methods that a subclass must override.

**Why.** Raising `NotImplementedError` from `__add__` stops the dispatch and the other operand never gets a chance. Returning `NotImplementedError` (the class) would be truthy and treated as a real result.
:::

:::drill concept
Describe the steps Python takes to evaluate `a + b`.
---
**Answer.** If `type(b)` is a proper subclass of `type(a)` and provides a different `__radd__`, call `b.__radd__(a)` first. Otherwise call `a.__add__(b)`; if it is missing or returns `NotImplemented`, call `b.__radd__(a)`; if that also fails, raise `TypeError`.

**Why.** The subclass rule lets a more specific type take control of mixed arithmetic, which NumPy and `fractions.Fraction` rely on.
:::

:::drill tricky
What does `bool(x)` do for an object whose class defines `__len__` but not `__bool__`, and for one that defines neither?
---
**Answer.** With only `__len__`, it is false when the length is 0. With neither, it is always true.

**Why.** That is why `if items:` is the idiomatic emptiness check for any container, and why a class whose instances are always truthy can surprise you when you expected `if result:` to test for "no data".
:::

:::drill tricky
A class defines only `__getitem__`. Can you iterate over it and use `in` with it?
---
**Answer.** Yes. Without `__iter__`, `iter()` falls back to the sequence protocol, calling `__getitem__` with 0, 1, 2… until `IndexError`. `in` without `__contains__` iterates the same way.

**Why.** It is a legacy protocol kept for compatibility, and it can surprise you with a mapping-like class, where `__getitem__(0)` raises `KeyError`, not `IndexError`, so iteration fails with a `KeyError`.
:::

:::drill concept
What does `__slots__` change about an instance, and name two things you lose.
---
**Answer.** The instance stores the listed attributes at fixed offsets instead of in a `__dict__`, which saves memory and speeds up access. You lose the ability to add other attributes, weak-reference support (unless `__weakref__` is listed), and class-level default values for the slot names.

**Why.** The class gets a member descriptor per slot that reads and writes the fixed offset. Subclasses must also declare `__slots__`, or they get a `__dict__` back.
:::

:::drill tricky
Why does `x == y` never raise `TypeError` for unrelated types, while `x < y` does?
---
**Answer.** If both `__eq__` calls return `NotImplemented`, Python falls back to identity (`x is y`). Ordering comparisons have no such fallback, so they raise `TypeError: '<' not supported`.

**Why.** Equality between unrelated objects has an obvious answer (not equal) but ordering does not. Python 2 used to order arbitrary objects by type name, which hid bugs.
:::

## Predict the output and find the bug {#ch07-reading .dr}

:::drill output
What does this print?

```python run=c07-d-radd
class V:
    def __init__(self, n):
        self.n = n
    def __add__(self, other):
        return V(self.n + getattr(other, "n", other))
    def __repr__(self):
        return f"V({self.n})"

print(V(1) + V(2), V(1) + 5)
try:
    print(5 + V(1))
except TypeError as e:
    print("TypeError:", e)
```
---
**Answer.** `V(3) V(6)`, then a `TypeError` for `5 + V(1)`: `int.__add__` returns `NotImplemented` and `V` has no `__radd__`.

**Why.** Defining `__add__` alone only covers the case where your object is on the left. Add `__radd__ = __add__` when the operation is commutative.
:::

:::drill output
What does this print?

```python run=c07-d-eq
class A:
    def __eq__(self, other):
        print("A.__eq__")
        return NotImplemented

class B:
    def __eq__(self, other):
        print("B.__eq__")
        return NotImplemented

print(A() == B())
print(A() != B())
```
---
**Answer.** For `==`: `A.__eq__`, then the reflected `B.__eq__`, then `False` from the identity fallback. For `!=`: there is no `__ne__`, so the default `__ne__` calls `__eq__` and inverts it, printing `A.__eq__` and `B.__eq__` again, then `True`.

**Why.** `object.__ne__` delegates to `__eq__` and inverts any result that is not `NotImplemented`; when both sides decline, `!=` also falls back to identity.
:::

:::drill output
What does this print?

```python run=c07-d-iadd
class Acc:
    def __init__(self):
        self.items = []
    def __add__(self, x):
        new = Acc()
        new.items = self.items + [x]
        return new
    def __iadd__(self, x):
        self.items.append(x)
        return self

a = Acc()
b = a
a += 1
c = a + 2
print(a is b, a.items, c.items, c is a)
```
---
**Answer.** `__iadd__` mutates and returns `self`, so `a` is still `b` with `[1]`. `a + 2` builds a new object with `[1, 2]`. Output: `True [1] [1, 2] False`.

**Why.** If `__iadd__` forgot to `return self`, `a` would be rebound to `None`, which is a very common bug.
:::

:::drill output
What does this print?

```python run=c07-d-slots-inherit
class P:
    __slots__ = ("x",)

class C(P):
    pass

class D(P):
    __slots__ = ("y",)

c, d = C(), D()
c.anything = 1
print(hasattr(c, "__dict__"), hasattr(d, "__dict__"))
try:
    d.anything = 1
except AttributeError as e:
    print("AttributeError:", e)
```
---
**Answer.** `C` declares no slots, so its instances get a `__dict__` and accept any attribute. `D` declares slots, so its instances do not have a `__dict__` and reject `anything`.

**Why.** Each class in the chain decides for itself whether to add a `__dict__`. A single slot-less subclass undoes the memory saving.
:::

:::drill output
What does this print?

```python run=c07-d-truth
class Result:
    def __init__(self, rows):
        self.rows = rows
    def __len__(self):
        return len(self.rows)

r = Result([])
print("found" if r else "empty", r is not None, bool(Result([0])))
```
---
**Answer.** `empty True True`. With `__len__` defined, an empty result is falsy even though the object exists; a result holding one row (even the falsy `0`) is truthy.

**Why.** This is why code that means "did the query return an object?" should test `is not None`, not truthiness.
:::

:::drill bug
This `__eq__` makes comparisons with other types crash. Fix it.

```python run=c07-d-bug-eq
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return (self.x, self.y) == (other.x, other.y)
    __hash__ = None

class BrokenPoint(Point):
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)

print(Point(1, 2) == Point(1, 2), Point(1, 2) == "p", Point(1, 2) in [None, Point(1, 2)])
try:
    BrokenPoint(1, 2) == None
except AttributeError as e:
    print("AttributeError:", e)
```
---
**Answer.** `BrokenPoint.__eq__` assumes `other` has `x` and `y`, so comparing with `None` or a string raises `AttributeError`, and so does `x in list_with_none`. Check the type and return `NotImplemented`, as `Point.__eq__` does.

**Why.** `__eq__` is called implicitly by `in`, `list.index`, `dict` lookups and `assertEqual`, often with objects of other types. It should never raise for an unexpected type.
:::

:::drill bug
A vector class supports `v * 3` but `3 * v` crashes, and `sum(vectors)` fails. Find the missing methods.

```python run=c07-d-bug-vector
class Vec:
    def __init__(self, *xs):
        self.xs = xs
    def __add__(self, other):
        if isinstance(other, Vec):
            return Vec(*(a + b for a, b in zip(self.xs, other.xs)))
        if other == 0:
            return self
        return NotImplemented
    __radd__ = __add__
    def __mul__(self, k):
        if isinstance(k, (int, float)):
            return Vec(*(a * k for a in self.xs))
        return NotImplemented
    __rmul__ = __mul__
    def __repr__(self):
        return f"Vec{self.xs}"

v = Vec(1, 2)
print(v * 3, 3 * v, sum([v, v, v]))
```
---
**Answer.** It was missing `__rmul__` (for `3 * v`) and `__radd__` plus handling of `0` (for `sum`, which starts with `0 + v`). The fixed version above aliases both reflected methods and treats adding `0` as the identity.

**Why.** Any class used with built-ins such as `sum` must cope with the start value. Alternatively, call `sum(vectors, Vec(0, 0))`.
:::

## Write the code {#ch07-coding .cd}

:::drill code rating=1300
Write a `Matrix` class with `__getitem__` taking `(row, col)` tuples, `__matmul__` for `@`, `__eq__`, `__repr__` and `__iter__` over rows. Show `a @ b` and `a[1, 0]`.
---
```python run=c07-c-matrix
class Matrix:
    def __init__(self, rows):
        self.rows = [list(r) for r in rows]
        self.n, self.m = len(self.rows), len(self.rows[0])

    def __getitem__(self, idx):
        r, c = idx
        return self.rows[r][c]

    def __matmul__(self, other):
        if not isinstance(other, Matrix) or self.m != other.n:
            return NotImplemented
        cols = list(zip(*other.rows))
        return Matrix([[sum(a * b for a, b in zip(row, col)) for col in cols] for row in self.rows])

    def __eq__(self, other):
        return isinstance(other, Matrix) and self.rows == other.rows

    __hash__ = None

    def __iter__(self):
        return iter(self.rows)

    def __repr__(self):
        return f"Matrix({self.rows})"

a = Matrix([[1, 2], [3, 4]])
b = Matrix([[0, 1], [1, 0]])
print(a @ b, a[1, 0], list(a)[0], a @ b == Matrix([[2, 1], [4, 3]]))
```

`a[1, 0]` passes the tuple `(1, 0)` as a single key. `@` (PEP 465) maps to `__matmul__`, with `__rmatmul__` and `__imatmul__` as its reflected and in-place versions.
:::

:::drill code rating=1400
Write a `Range`-like class `Span(start, stop)` that supports `len`, `in` in O(1), indexing with negative indexes and slices returning a new `Span`, and iteration, without storing the elements.
---
```python run=c07-c-span
class Span:
    def __init__(self, start, stop):
        self.start, self.stop = start, max(start, stop)

    def __len__(self):
        return self.stop - self.start

    def __contains__(self, x):
        return isinstance(x, int) and self.start <= x < self.stop

    def __getitem__(self, i):
        if isinstance(i, slice):
            lo, hi, step = i.indices(len(self))
            if step != 1:
                raise ValueError("step not supported")
            return Span(self.start + lo, self.start + max(lo, hi))
        if i < 0:
            i += len(self)
        if not 0 <= i < len(self):
            raise IndexError("Span index out of range")
        return self.start + i

    def __iter__(self):
        return iter(range(self.start, self.stop))

    def __repr__(self):
        return f"Span({self.start}, {self.stop})"

s = Span(10, 20)
print(len(s), 15 in s, 20 in s, s[-1], s[2:5], list(s[2:5]))
```

Without `__contains__`, `15 in s` would still work through `__iter__`, but in O(n). `slice.indices` handles `None` and negative bounds for you.
:::

:::drill code rating=1500
Write a `Frozen` mixin that makes instances immutable after `__init__` finishes: assignments and deletions raise `AttributeError`, but `__init__` itself can still set attributes. It should work with `__slots__` subclasses too.
---
Override `__setattr__` and `__delattr__`, and let `__init__` write through `object.__setattr__` until a flag is set.

```python run=c07-c-frozen
class Frozen:
    __slots__ = ("_frozen",)

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        original = cls.__init__
        def __init__(self, *args, **kw):
            object.__setattr__(self, "_frozen", False)
            original(self, *args, **kw)
            object.__setattr__(self, "_frozen", True)
        cls.__init__ = __init__

    def __setattr__(self, name, value):
        if getattr(self, "_frozen", False):
            raise AttributeError(f"{type(self).__name__} is frozen")
        object.__setattr__(self, name, value)

    def __delattr__(self, name):
        raise AttributeError(f"{type(self).__name__} is frozen")

class Point(Frozen):
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
print(p.x, p.y)
for action in (lambda: setattr(p, "x", 5), lambda: delattr(p, "y")):
    try:
        action()
    except AttributeError as e:
        print("AttributeError:", e)
```

`__init_subclass__` (Chapter 9) wraps each subclass's `__init__` so the flag is set after construction. `@dataclass(frozen=True)` uses the same `object.__setattr__` trick in its generated `__init__`.
:::

:::drill code rating=1200
Write a callable `Counter`-style class `Tally` whose instances can be called with an item to count it, support `+` to merge two tallies, `in`, `len`, and `bool` (false when empty).
---
```python run=c07-c-tally
class Tally:
    def __init__(self, counts=None):
        self.counts = dict(counts or {})

    def __call__(self, item):
        self.counts[item] = self.counts.get(item, 0) + 1
        return self

    def __add__(self, other):
        if not isinstance(other, Tally):
            return NotImplemented
        merged = dict(self.counts)
        for k, v in other.counts.items():
            merged[k] = merged.get(k, 0) + v
        return Tally(merged)

    def __contains__(self, item):
        return item in self.counts

    def __len__(self):
        return len(self.counts)

    def __repr__(self):
        return f"Tally({self.counts})"

t = Tally()
for word in "a b a c a".split():
    t(word)
u = Tally()("c")("d")
print(t, t + u, "a" in t, len(t + u), bool(Tally()))
```

Returning `self` from `__call__` allows chaining, and `bool` comes for free from `__len__`.
:::

## Cheat sheet {#ch07-cheatsheet .th}

- Implicit special method calls look on the **type**, not the instance, and bypass `__getattr__`. Changing the class's dunder updates the C slot.
- `a + b`: subclass's `__radd__` first if it overrides; else `a.__add__(b)`, then `b.__radd__(a)` on `NotImplemented`; else `TypeError`.
- Return `NotImplemented` for unsupported operand types; never raise `NotImplementedError` from an operator.
- `a += b`: `__iadd__` (must `return self`), else `a = a + b`.
- `==` falls back to identity and never raises; `<` raises `TypeError` when both sides decline. `__ne__` inverts `__eq__`. `functools.total_ordering` fills in the rest.
- Truthiness: `__bool__` (must return `bool`), else `__len__ != 0`, else true.
- `in`: `__contains__`, else `__iter__`, else `__getitem__(0, 1, …)` until `IndexError`.
- `__repr__` for developers, `__str__` for users (defaults to repr), `__format__` for f-string specs.
- `__slots__`: fixed fields via member descriptors, no `__dict__`, less memory; subclasses must redeclare, add `__weakref__` for weak refs, no class-level defaults for slot names.
