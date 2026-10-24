---
title: Attribute lookup, descriptors and the MRO
part: Part D · Classes and attributes
lede: "`obj.attr`" looks like a dictionary lookup, but it runs a precise algorithm that checks the class hierarchy, gives priority to data descriptors, then the instance dict, then everything else. That algorithm is what makes methods bind to `self`, what `property`, `classmethod` and `staticmethod` are built from, and why `__getattr__` and `__getattribute__` behave so differently. This chapter also covers the C3 method resolution order and what `super()` really calls.
desc: The lookup algorithm, data vs non-data descriptors, bound methods, property, __getattr__, C3 MRO, super()
hours: 4
prereqs: Chapter 7
---

## The lookup algorithm {#ch08-lookup .th}

`obj.name` calls `type(obj).__getattribute__(obj, "name")`. For ordinary objects that is `object.__getattribute__`, which does this:

1. Look `name` up in the **class and its bases**, following the MRO (below). Call the result `cls_attr`.
2. If `cls_attr` is a **data descriptor** (its type defines `__set__` or `__delete__`), return `cls_attr.__get__(obj, type(obj))`. Data descriptors win over the instance.
3. Otherwise, if `name` is in the **instance's `__dict__`**, return that value.
4. Otherwise, if `cls_attr` is a **non-data descriptor** (defines only `__get__`), return `cls_attr.__get__(obj, type(obj))`.
5. Otherwise, if `cls_attr` was found, return it as is.
6. Otherwise raise `AttributeError`, and if the class defines `__getattr__`, call `__getattr__(obj, name)` instead of failing.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 250" role="img" aria-label="Flowchart of attribute lookup: data descriptor on the class, then instance dict, then non-data descriptor, then plain class attribute, then __getattr__">
  <rect x="20" y="20" width="250" height="40" rx="8" class="d-soft"/><text x="145" y="45" text-anchor="middle" class="t-mono">find name in type(obj).__mro__</text>
  <path d="M145 60 L145 80" class="d-line"/>
  <rect x="20" y="80" width="250" height="40" rx="8" class="d-acc"/><text x="145" y="105" text-anchor="middle" class="t-small">data descriptor? (__set__/__delete__)</text>
  <path d="M270 100 L 330 100" class="d-line-acc"/><text x="300" y="92" text-anchor="middle" class="t-small">yes</text>
  <rect x="330" y="80" width="200" height="40" rx="8" class="d-key"/><text x="430" y="105" text-anchor="middle" class="t-mono">desc.__get__(obj, cls)</text>
  <path d="M145 120 L145 140" class="d-line"/><text x="160" y="134" class="t-small">no</text>
  <rect x="20" y="140" width="250" height="40" rx="8" class="d-acc"/><text x="145" y="165" text-anchor="middle" class="t-small">name in obj.__dict__?</text>
  <path d="M270 160 L 330 160" class="d-line-acc"/><text x="300" y="152" text-anchor="middle" class="t-small">yes</text>
  <rect x="330" y="140" width="200" height="40" rx="8" class="d-key"/><text x="430" y="165" text-anchor="middle" class="t-mono">obj.__dict__[name]</text>
  <path d="M145 180 L145 200" class="d-line"/><text x="160" y="194" class="t-small">no</text>
  <rect x="20" y="200" width="250" height="40" rx="8" class="d-acc"/><text x="145" y="225" text-anchor="middle" class="t-small">found on class? (__get__ → call it)</text>
  <path d="M270 220 L 330 220" class="d-line-acc"/>
  <rect x="330" y="200" width="200" height="40" rx="8" class="d-key"/><text x="430" y="225" text-anchor="middle" class="t-mono">__get__ result or value</text>
  <path d="M530 220 L 560 220" class="d-line d-dash"/>
  <rect x="560" y="200" width="150" height="40" rx="8" class="d-trap"/><text x="635" y="218" text-anchor="middle" class="t-small">not found:</text><text x="635" y="233" text-anchor="middle" class="t-mono">__getattr__</text>
</svg></div><figcaption><b>Precedence.</b> Data descriptors on the class beat the instance dict; the instance dict beats methods and other non-data descriptors.</figcaption></figure>

Setting an attribute (`obj.name = v`) is simpler: if the class has a data descriptor for `name`, call its `__set__`; otherwise store into `obj.__dict__`.

## Descriptors {#ch08-descriptors .th}

A **descriptor** is any object whose type defines `__get__`, `__set__` or `__delete__`, stored as a **class** attribute. When accessed through an instance, the lookup algorithm calls those methods instead of returning the object itself.

```python run=c08-descriptor
class Typed:
    def __set_name__(self, owner, name):
        self.name = name
        self.storage = "_" + name
    def __init__(self, kind):
        self.kind = kind
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.storage)
    def __set__(self, obj, value):
        if not isinstance(value, self.kind):
            raise TypeError(f"{self.name} must be {self.kind.__name__}, got {type(value).__name__}")
        setattr(obj, self.storage, value)

class Order:
    qty = Typed(int)
    price = Typed(float)
    def __init__(self, qty, price):
        self.qty = qty
        self.price = price

o = Order(3, 9.5)
print(o.qty * o.price, o.__dict__)
try:
    o.qty = "3"
except TypeError as e:
    print("TypeError:", e)
print(Order.qty)
```

`__set_name__` (3.6+) is called once when the class is created, telling the descriptor which attribute name it was assigned to. `__get__` receives `obj=None` when the attribute is accessed on the class itself, and returning `self` then is the convention.

### Functions are non-data descriptors

A function defined in a class body is just a function stored in the class dict. Functions have a `__get__` method, so accessing one through an instance returns a **bound method**: an object that remembers the function and the instance and inserts the instance as the first argument when called.

```python run=c08-bound
class Greeter:
    def hello(self, name):
        return f"hello {name} from {type(self).__name__}"

g = Greeter()
raw = Greeter.__dict__["hello"]
bound = raw.__get__(g, Greeter)
print(type(raw).__name__, type(bound).__name__)
print(bound("Ada"), bound.__self__ is g, bound.__func__ is raw)
print(Greeter.hello is raw, g.hello is g.hello, g.hello == g.hello)
```

`Greeter.hello` on the class returns the plain function (`__get__` with `obj=None`). Every `g.hello` creates a **new** bound-method object, so `g.hello is g.hello` is `False`, though they compare equal. Because functions are *non-data* descriptors, an instance attribute with the same name shadows the method.

### property, classmethod and staticmethod

All three are descriptors written in C:

- `property(fget, fset, fdel)` is a **data** descriptor (it always defines `__set__`, which raises if there is no setter), so it cannot be shadowed by the instance dict.
- `classmethod(f).__get__(obj, cls)` returns `f` bound to `cls`.
- `staticmethod(f).__get__` returns `f` unchanged, so no first argument is inserted.

```python run=c08-property
class Celsius:
    def __init__(self, c):
        self._c = c
    @property
    def fahrenheit(self):
        return self._c * 9 / 5 + 32
    @classmethod
    def from_f(cls, f):
        return cls((f - 32) * 5 / 9)
    @staticmethod
    def valid(c):
        return c >= -273.15

t = Celsius.from_f(212)
print(t._c, t.fahrenheit, Celsius.valid(-300))
try:
    t.fahrenheit = 0
except AttributeError as e:
    print("AttributeError:", e)
t.__dict__["fahrenheit"] = "shadow?"
print(t.fahrenheit)
```

Writing straight into `__dict__` does not shadow the property: data descriptors are checked before the instance dict.

### cached_property: a non-data descriptor on purpose

`functools.cached_property` defines only `__get__`. On first access it computes the value and stores it in the instance `__dict__` under the same name. From then on the instance dict wins (step 3 beats step 4), so the descriptor is never called again:

```python run=c08-cached
from functools import cached_property

class Report:
    calls = 0
    @cached_property
    def total(self):
        Report.calls += 1
        return sum(range(1000))

r = Report()
print(r.total, r.total, Report.calls, "total" in r.__dict__)
del r.total
print(r.total, Report.calls)
```

Deleting the cached value from the instance dict makes the next access recompute it. Because it needs an instance `__dict__`, `cached_property` does not work on classes with `__slots__`.

## __getattr__ and __getattribute__ {#ch08-getattr .th}

- `__getattribute__` is called for **every** attribute access. Overriding it intercepts everything, including access to your own methods and `__dict__`, and it is easy to recurse infinitely. Inside it, use `super().__getattribute__(name)` or `object.__getattribute__(self, name)`.
- `__getattr__` is called **only when normal lookup fails**. It is the safe hook for lazy attributes, proxies and default values.

```python run=c08-getattr
class Lazy:
    def __init__(self):
        self.loaded = []
    def __getattr__(self, name):
        if name.startswith("_"):
            raise AttributeError(name)
        value = f"<{name} loaded>"
        self.loaded.append(name)
        setattr(self, name, value)
        return value

class Audited:
    def __init__(self):
        self.x = 1
    def __getattribute__(self, name):
        if not name.startswith("__"):
            print("get", name)
        return super().__getattribute__(name)

lz = Lazy()
print(lz.config, lz.config, lz.loaded)
a = Audited()
print(a.x + a.x)
```

`Lazy.__getattr__` runs once per name: after `setattr`, normal lookup finds the instance attribute. Raising `AttributeError` for underscore names matters, because `copy`, `pickle` and `hasattr` probe for names like `__deepcopy__` or `__getstate__` and must see a missing attribute, not a fake value.

:::trap
An `AttributeError` raised by accident inside a **property getter** makes Python fall back to `__getattr__`, so a bug in the property appears as "attribute not found" (or as whatever `__getattr__` returns). If a class has both, debug property errors carefully.
:::

## Method resolution order (C3) {#ch08-mro .th}

With multiple inheritance, Python needs a single order in which to search classes. It uses the **C3 linearisation**, stored in `cls.__mro__`. C3 guarantees:

- A class comes before its bases.
- The order of bases in the class statement is preserved (`class C(A, B)` searches A before B).
- If a class precedes another in some base's MRO, it does so in every subclass's MRO (monotonicity).

The MRO of `C(B1, B2)` is `C` followed by a **merge** of the MROs of `B1` and `B2` and the list `[B1, B2]`: repeatedly take the first head that does not appear in the tail of any other list.

```python run=c08-mro
class A:
    def who(self): return "A"
class B(A):
    def who(self): return "B"
class C(A):
    def who(self): return "C"
class D(B, C):
    pass

print([k.__name__ for k in D.__mro__], D().who())

class X: pass
class Y: pass
class P(X, Y): pass
class Q(Y, X): pass
try:
    class R(P, Q): pass
except TypeError as e:
    print("TypeError:", e)
```

In the diamond, `A` comes only after both `B` and `C`, so `A`'s methods are not reached before `C`'s. `R(P, Q)` is impossible because `P` requires X before Y and `Q` requires Y before X, so C3 refuses to build the class.

### What super() does

`super()` does **not** mean "the parent class". `super().method()` inside class `K` means: take `type(self).__mro__`, find `K` in it, and look `method` up starting from the class **after** `K`. The next class depends on the runtime type of `self`, which is what makes cooperative multiple inheritance work:

```python run=c08-super
class Base:
    def __init__(self):
        print("Base")

class Logging(Base):
    def __init__(self):
        print("Logging ->", end=" ")
        super().__init__()

class Caching(Base):
    def __init__(self):
        print("Caching ->", end=" ")
        super().__init__()

class Service(Logging, Caching):
    def __init__(self):
        print("Service ->", end=" ")
        super().__init__()

Service()
print([k.__name__ for k in Service.__mro__])
Logging()
```

Inside `Logging.__init__`, `super()` refers to `Caching` when `self` is a `Service`, but to `Base` when `self` is a plain `Logging`. Each `__init__` runs exactly once. If `Logging` had called `Base.__init__(self)` directly, `Caching.__init__` would never run.

The zero-argument form works because the compiler gives every method that uses `super` (or `__class__`) a hidden cell named `__class__` that holds the class being defined, so `super()` is short for `super(__class__, self)`.

## Concept and tricky questions {#ch08-concept .dr}

:::drill concept
What is a descriptor, and what is the difference between a data and a non-data descriptor?
---
**Answer.** An object, stored as a class attribute, whose type defines `__get__`, `__set__` or `__delete__`. A data descriptor defines `__set__` or `__delete__` and takes priority over the instance `__dict__`; a non-data descriptor defines only `__get__` and is shadowed by an instance attribute of the same name.

**Why.** `property` is a data descriptor (cannot be shadowed); functions, `classmethod`, `staticmethod` and `cached_property` are non-data descriptors.
:::

:::drill concept
How does `obj.method(1)` turn into a call with `self`?
---
**Answer.** Lookup finds the function in the class dict. Functions are non-data descriptors, so `function.__get__(obj, type(obj))` returns a bound method holding the function and `obj`. Calling the bound method calls the function with `obj` prepended to the arguments.

**Why.** In 3.11+ the interpreter usually avoids creating the bound method object at all for direct calls (`LOAD_ATTR` with the method flag followed by `CALL`), but the semantics are those of the descriptor.
:::

:::drill tricky
Why is `obj.method is obj.method` `False`?
---
**Answer.** Each access runs `__get__` and creates a new bound-method object. They compare equal (`==` checks the same function and the same instance), but they are different objects.

**Why.** This matters when unregistering callbacks: `remove(obj.method)` works because `list.remove` uses `==`, but a `WeakSet` of bound methods empties immediately, because each bound method dies as soon as it is created.
:::

:::drill concept
When is `__getattr__` called and when is `__getattribute__` called?
---
**Answer.** `__getattribute__` is called on every attribute access. `__getattr__` is called only after normal lookup (via `__getattribute__`) raises `AttributeError`.

**Why.** Override `__getattr__` for fallbacks, proxies and lazy loading. Overriding `__getattribute__` slows down every access and needs `super().__getattribute__` to avoid infinite recursion.
:::

:::drill tricky
In `class D(B, C)` where both `B` and `C` inherit from `A` and all define `ping`, which `ping` does `D().ping()` call, and what does `super().ping()` inside `B.ping` call?
---
**Answer.** `D.__mro__` is `D, B, C, A, object`, so `D().ping()` calls `B.ping`. Inside it, `super().ping()` calls `C.ping`, not `A.ping`, because `super` continues from `B` in the MRO of `type(self)`.

**Why.** `super()` follows the instance's MRO, which is why every class in a cooperative hierarchy should call `super()` and accept `**kwargs` to pass along.
:::

:::drill concept
Why does `cached_property` work, and why can a plain `property` not cache the same way?
---
**Answer.** `cached_property` is a non-data descriptor: after it stores the value in the instance `__dict__`, the instance dict takes precedence and the descriptor is no longer called. A `property` is a data descriptor that always wins over the instance dict, so storing a value under its name would never be read.

**Why.** This is a direct application of the lookup order. It also explains why `cached_property` needs a `__dict__` and fails with `__slots__`.
:::

:::drill tricky
What does `super()` with no arguments rely on, and why does it fail in a function defined outside a class and attached later?
---
**Answer.** On a hidden `__class__` cell that the compiler creates for functions defined inside a class body that use `super` or `__class__`. A function defined outside the class has no such cell, so `super()` raises `RuntimeError: super(): __class__ cell not found`.

**Why.** Use the explicit `super(Cls, self)` form in such functions.
:::

## Predict the output and find the bug {#ch08-reading .dr}

:::drill output
What does this print?

```python run=c08-d-shadow
class K:
    def f(self):
        return "method"
    @property
    def p(self):
        return "property"

k = K()
k.__dict__["f"] = lambda: "instance"
k.__dict__["p"] = "instance"
print(k.f(), k.p, K.f(k))
```
---
**Answer.** `instance property method`. The instance dict shadows the method (a non-data descriptor) but not the property (a data descriptor). Calling through the class bypasses the instance dict.

**Why.** Lookup checks data descriptors, then the instance dict, then non-data descriptors.
:::

:::drill output
What does this print?

```python run=c08-d-classattr
class Counter:
    count = 0
    items = []
    def add(self, x):
        self.count += 1
        self.items.append(x)

a, b = Counter(), Counter()
a.add(1); b.add(2)
print(a.count, b.count, Counter.count, a.items, Counter.items is a.items)
```
---
**Answer.** `1 1 0 [1, 2] True`. `self.count += 1` reads the class attribute 0 and then **assigns** an instance attribute, so each instance gets its own count. `self.items.append` mutates the one list stored on the class, so both instances share it.

**Why.** Reading falls through to the class; assigning always writes the instance dict. Mutable class attributes are shared state.
:::

:::drill output
What does this print?

```python run=c08-d-mro
class A:
    def go(self):
        return "A"
class B(A):
    def go(self):
        return "B" + super().go()
class C(A):
    def go(self):
        return "C" + super().go()
class D(C, B):
    def go(self):
        return "D" + super().go()

print(D().go(), B().go())
```
---
**Answer.** `D.__mro__` is `D, C, B, A, object`, so the chain is `D → C → B → A`: `DCBA`. A plain `B` has MRO `B, A`, giving `BA`.

**Why.** The same `super().go()` line inside `C` calls `B.go` for a `D` instance and `A.go` for a `C` instance.
:::

:::drill output
What does this print?

```python run=c08-d-staticclass
class Shape:
    sides = 0
    @classmethod
    def describe(cls):
        return f"{cls.__name__} with {cls.sides} sides"
    @staticmethod
    def unit():
        return "cm"

class Square(Shape):
    sides = 4

print(Square.describe(), Square().describe(), Square.unit(), Shape.describe())
```
---
**Answer.** `Square with 4 sides Square with 4 sides cm Shape with 0 sides`. A classmethod receives the class it was called on (or the instance's class), so it sees the subclass's `sides`.

**Why.** This is why alternative constructors are written as classmethods: `Square.from_json(...)` builds a `Square`, not a `Shape`.
:::

:::drill bug
This lazy proxy recurses forever when `copy.copy` is used on it. Find and fix the bug.

```python run=c08-d-bug-proxy
import copy

class Proxy:
    def __init__(self, target):
        self._target = target
    def __getattr__(self, name):
        if name.startswith("__") or name == "_target":
            raise AttributeError(name)
        return getattr(self._target, name)

p = Proxy([1, 2, 3])
q = copy.copy(p)
print(q.count(2), p.index(3))
```
---
**Answer.** `copy.copy` creates the new object without calling `__init__`, so `_target` is missing. The original `__getattr__` then handled the lookup of `_target` by calling `getattr(self._target, …)` again, recursing until `RecursionError`. The fix above raises `AttributeError` for `_target` and for dunder names, so missing internals look missing.

**Why.** `copy` and `pickle` create instances with `cls.__new__(cls)` and probe for `__reduce_ex__`, `__setstate__` and friends. Every `__getattr__` should refuse names it does not own.
:::

:::drill bug
A mixin's `__init__` never runs. Fix the hierarchy.

```python run=c08-d-bug-coop
class Base:
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Named(Base):
    def __init__(self, name, **kwargs):
        self.name = name
        super().__init__(**kwargs)

class Timestamped(Base):
    def __init__(self, ts=0, **kwargs):
        self.ts = ts
        super().__init__(**kwargs)

class Event(Named, Timestamped):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

e = Event(name="deploy", ts=42)
print(e.name, e.ts, [k.__name__ for k in Event.__mro__])
```
---
**Answer.** The broken version had `Named.__init__` call `Base.__init__(self)` directly, which skipped `Timestamped` in the MRO, so `ts` was never set. The fix (above) is cooperative: every class calls `super().__init__(**kwargs)` and takes only the keyword arguments it understands.

**Why.** In multiple inheritance you do not know which class comes next, so you cannot name it. Passing the remaining keywords along is the standard pattern.
:::

## Write the code {#ch08-coding .cd}

:::drill code rating=1400
Write a `Bounded(min, max)` descriptor that validates numeric attributes, stores values in the instance `__dict__` under the attribute's own name, and still validates on every assignment.
---
Because it defines `__set__`, the descriptor is a data descriptor, so it wins even though the value lives in the instance dict under the same name.

```python run=c08-c-bounded
class Bounded:
    def __init__(self, lo, hi):
        self.lo, self.hi = lo, hi
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__[self.name]
    def __set__(self, obj, value):
        if not self.lo <= value <= self.hi:
            raise ValueError(f"{self.name}={value} not in [{self.lo}, {self.hi}]")
        obj.__dict__[self.name] = value

class Pixel:
    r = Bounded(0, 255)
    g = Bounded(0, 255)
    def __init__(self, r, g):
        self.r, self.g = r, g

p = Pixel(10, 200)
p.r = 255
print(p.r, p.g, p.__dict__)
try:
    p.g = 300
except ValueError as e:
    print("ValueError:", e)
```

Storing under the same name is safe here only because data descriptors are checked first. A non-data descriptor doing the same would be bypassed after the first assignment.
:::

:::drill code rating=1500
Implement `my_property`, a pure-Python version of `property` supporting `@my_property`, `.setter` and `.deleter`, and use it in a class.
---
```python run=c08-c-myproperty
class my_property:
    def __init__(self, fget=None, fset=None, fdel=None, doc=None):
        self.fget, self.fset, self.fdel = fget, fset, fdel
        self.__doc__ = doc or (fget.__doc__ if fget else None)
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        if self.fget is None:
            raise AttributeError(f"property {self.name!r} has no getter")
        return self.fget(obj)
    def __set__(self, obj, value):
        if self.fset is None:
            raise AttributeError(f"property {self.name!r} has no setter")
        self.fset(obj, value)
    def __delete__(self, obj):
        if self.fdel is None:
            raise AttributeError(f"property {self.name!r} has no deleter")
        self.fdel(obj)
    def setter(self, fset):
        return type(self)(self.fget, fset, self.fdel, self.__doc__)
    def deleter(self, fdel):
        return type(self)(self.fget, self.fset, fdel, self.__doc__)

class Account:
    def __init__(self):
        self._balance = 0
    @my_property
    def balance(self):
        "Current balance."
        return self._balance
    @balance.setter
    def balance(self, v):
        if v < 0:
            raise ValueError("negative")
        self._balance = v

a = Account()
a.balance = 50
print(a.balance, Account.balance.__doc__)
try:
    del a.balance
except AttributeError as e:
    print("AttributeError:", e)
```

`.setter` returns a *new* descriptor with both functions, which is why the setter must reuse the same name: the class body rebinds `balance` to the new object.
:::

:::drill code rating=1600
Implement the C3 linearisation: `c3(cls)` takes a class and returns its MRO computed from `__bases__` alone, and check it against `__mro__` for a diamond and a deeper hierarchy.
---
```python run=c08-c-c3
def c3(cls):
    if cls is object:
        return [object]
    seqs = [c3(b) for b in cls.__bases__] + [list(cls.__bases__)]
    result = [cls]
    while True:
        seqs = [s for s in seqs if s]
        if not seqs:
            return result
        for seq in seqs:
            head = seq[0]
            if not any(head in s[1:] for s in seqs):
                break
        else:
            raise TypeError(f"inconsistent hierarchy for {cls.__name__}")
        result.append(head)
        for s in seqs:
            if s[0] is head:
                del s[0]

class O: pass
class A(O): pass
class B(O): pass
class C(O): pass
class D(A, B): pass
class E(B, C): pass
class F(D, E): pass

for k in (D, F):
    print([x.__name__ for x in c3(k)], c3(k) == list(k.__mro__))
```

A candidate head is accepted only if it does not appear later in any other list, which is what keeps "subclass before base" and the declared base order.
:::

:::drill code rating=1300
Write `AttrDict`, a dict whose keys can also be read and written as attributes (`d.name`), that still raises `AttributeError` (not `KeyError`) for missing names so `hasattr` and `getattr(d, x, default)` work.
---
```python run=c08-c-attrdict
class AttrDict(dict):
    def __getattr__(self, name):
        try:
            return self[name]
        except KeyError:
            raise AttributeError(name) from None
    def __setattr__(self, name, value):
        self[name] = value
    def __delattr__(self, name):
        try:
            del self[name]
        except KeyError:
            raise AttributeError(name) from None

cfg = AttrDict(host="localhost")
cfg.port = 8080
print(cfg.host, cfg["port"], hasattr(cfg, "debug"), getattr(cfg, "debug", False))
print(cfg.keys(), cfg)
```

Real dict methods such as `keys` are found by normal lookup, so they win over keys with the same name, which is the main pitfall of this pattern: a key called `items` cannot be read as an attribute.
:::

## Cheat sheet {#ch08-cheatsheet .th}

- Lookup: class MRO search → data descriptor `__get__` → instance `__dict__` → non-data descriptor `__get__` → plain class attribute → `__getattr__`.
- Assignment: data descriptor `__set__` if present, else instance `__dict__`.
- Descriptor protocol: `__get__(self, obj, objtype)`, `__set__`, `__delete__`, `__set_name__(owner, name)`; return `self` when `obj is None`.
- Functions are non-data descriptors → bound methods (`__self__`, `__func__`), a new object per access.
- `property` = data descriptor (cannot be shadowed). `classmethod` binds the class, `staticmethod` binds nothing, `cached_property` = non-data descriptor that writes the instance dict.
- `__getattribute__` runs on every access; `__getattr__` only on failure. Raise `AttributeError` for names you do not own (dunders!).
- C3 MRO: subclasses before bases, declared base order kept, consistent across subclasses; inconsistent orders raise `TypeError`.
- `super()` = next class after the current one in `type(self).__mro__`; zero-arg form uses the `__class__` cell. Cooperative classes all call `super().__init__(**kwargs)`.
- `self.x += 1` on a class attribute creates an instance attribute; mutating a class-level list shares it across instances.
