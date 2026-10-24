---
title: Classes are objects
part: Part D · Classes and attributes
lede: A `class` statement is executable code that builds a new object, an instance of a metaclass (usually `type`), at the moment it runs. This chapter walks through exactly what happens when a class is created, the difference between `__new__` and `__init__`, when a metaclass is the right tool and when `__init_subclass__` or a class decorator is simpler, and what `dataclasses`, `abc` and `enum` generate for you.
desc: type(), the class creation steps, __new__ vs __init__, metaclasses, __init_subclass__, dataclasses, ABCs, enums
hours: 3.5
prereqs: Chapters 7–8
---

## type builds classes {#ch09-type .th}

`type` has two roles. With one argument it returns an object's type. With three, `type(name, bases, namespace)`, it **creates a new class**. A `class` statement is a convenient way to make that call:

```python run=c09-type3
def greet(self):
    return f"hi, I am {self.name}"

Person = type("Person", (object,), {"species": "human", "greet": greet, "__init__": lambda self, n: setattr(self, "name", n)})
p = Person("Ada")
print(p.greet(), Person.__name__, Person.__bases__, type(Person))

class Person2:
    species = "human"
print(type(Person2) is type, isinstance(Person2, type), isinstance(type, type))
```

So every class is an object: you can pass it to functions, store it in a dict, add attributes to it and create it at run time. Its type is its **metaclass**, which for ordinary classes is `type`.

## What happens when a class statement runs {#ch09-creation .th}

For

```python
class Order(Base, metaclass=Meta, flag=True):
    qty = Field()
    def total(self): ...
```

Python does the following, in order:

1. **Resolve the metaclass**: the explicit `metaclass=`, or else the most derived metaclass of the bases (`type` if none). Conflicting metaclasses raise `TypeError`.
2. **Prepare the namespace**: call `Meta.__prepare__("Order", bases, flag=True)`, which returns the mapping the body will execute in (a plain `dict` by default).
3. **Execute the class body** in that namespace, like a function body. `qty = Field()` and `def total` simply store entries in it. `__module__` and `__qualname__` are set first.
4. **Create the class**: call `Meta("Order", bases, namespace, flag=True)`, which runs `Meta.__new__` and then `Meta.__init__`. Inside `type.__new__`:
   - the C slots are filled from the dunder methods;
   - `__set_name__(owner, name)` is called on every attribute that defines it (descriptors learn their names);
   - `__init_subclass__(**kwargs)` of the **parent** class is called with the extra keywords (`flag=True`).
5. **Apply class decorators**, innermost first, and bind the result to the name `Order`.

```python run=c09-steps
class Meta(type):
    @classmethod
    def __prepare__(mcls, name, bases, **kw):
        print("1. __prepare__", name, kw)
        return {}
    def __new__(mcls, name, bases, ns, **kw):
        print("3. Meta.__new__", sorted(k for k in ns if not k.startswith("__")))
        return super().__new__(mcls, name, bases, ns, **kw)
    def __init__(cls, name, bases, ns, **kw):
        print("5. Meta.__init__")
        super().__init__(name, bases, ns, **kw)

class Field:
    def __set_name__(self, owner, name):
        print("4a. __set_name__", name)

class Base:
    def __init_subclass__(cls, **kw):
        print("4b. __init_subclass__", cls.__name__, kw)

def decorate(cls):
    print("6. decorator")
    return cls

@decorate
class Order(Base, metaclass=Meta, flag=True):
    print("2. body runs")
    qty = Field()
```

`__set_name__` and `__init_subclass__` both run inside `type.__new__`, before the metaclass's `__init__`. The metaclass must pass the extra keywords (`flag=True`) on to `type.__new__`, or `__init_subclass__` never sees them.

## __new__ and __init__ {#ch09-new .th}

Calling a class, `Order(3)`, calls `type(Order).__call__(Order, 3)`, which does:

1. `obj = Order.__new__(Order, 3)`: allocate and return the new object. It is a static method that receives the class.
2. If `obj` is an instance of `Order`, call `obj.__init__(3)` to initialise it. If `__new__` returned something else, `__init__` is skipped.

Most classes only need `__init__`. You need `__new__` when the object must be configured **before** it exists, mainly for subclasses of immutable types, where `__init__` is too late, and for controlling instance creation (caching, singletons):

```python run=c09-new
class Celsius(float):
    def __new__(cls, value):
        if value < -273.15:
            raise ValueError("below absolute zero")
        return super().__new__(cls, round(value, 2))
    def __repr__(self):
        return f"{float(self)}°C"

class UpperInit(str):
    def __init__(self, s):
        self.original = s
        s = s.upper()          # too late: the str value is already fixed

class Upper(str):
    def __new__(cls, s):
        return super().__new__(cls, s.upper())

t = Celsius(21.456)
print(t, t + 1, isinstance(t, float))
print(UpperInit("abc"), UpperInit("abc").original, Upper("abc"))

class Cached:
    _cache = {}
    def __new__(cls, key):
        if key not in cls._cache:
            cls._cache[key] = super().__new__(cls)
        return cls._cache[key]
    def __init__(self, key):
        print("init", key)
        self.key = key

a, b = Cached("x"), Cached("x")
print(a is b)
```

Note that `Cached("x")` runs `__init__` **every** time, even when `__new__` returns the cached instance, because the returned object is an instance of the class. That re-initialisation is a common bug in naive singletons.

## Metaclasses and their lighter alternatives {#ch09-meta .th}

A metaclass customises **class creation** and **class-level behaviour**: methods on the metaclass become methods of the class object (not of instances). Uses in the standard library include `abc.ABCMeta` (tracks abstract methods), `enum.EnumType` (called `EnumMeta` before 3.11; it turns class attributes into members and makes the class iterable) and the old `typing` internals.

```python run=c09-meta-registry
class PluginMeta(type):
    registry = {}
    def __new__(mcls, name, bases, ns):
        cls = super().__new__(mcls, name, bases, ns)
        if bases:
            mcls.registry[ns.get("name", name.lower())] = cls
        return cls
    def __len__(cls):
        return len(PluginMeta.registry)
    def __iter__(cls):
        return iter(PluginMeta.registry)

class Plugin(metaclass=PluginMeta):
    pass

class Csv(Plugin):
    name = "csv"

class Json(Plugin):
    pass

print(dict(PluginMeta.registry).keys(), len(Plugin), list(Plugin))
```

`len(Plugin)` works because special method lookup goes to the type of `Plugin`, which is `PluginMeta` (Chapter 7).

### Prefer __init_subclass__ or a decorator

Most "register every subclass" or "validate subclasses" jobs no longer need a metaclass. `__init_subclass__` (3.6+, PEP 487) is a hook on the base class that runs for each new subclass, and it composes with other bases, while two unrelated metaclasses conflict:

```python run=c09-init-subclass
class Plugin:
    registry = {}
    def __init_subclass__(cls, /, name=None, **kw):
        super().__init_subclass__(**kw)
        if not hasattr(cls, "run"):
            raise TypeError(f"{cls.__name__} must define run()")
        Plugin.registry[name or cls.__name__.lower()] = cls

class Csv(Plugin, name="csv"):
    def run(self):
        return "parsing csv"

try:
    class Broken(Plugin):
        pass
except TypeError as e:
    print("TypeError:", e)

print(Plugin.registry, Plugin.registry["csv"]().run())

class M1(type): pass
class M2(type): pass
class A(metaclass=M1): pass
class B(metaclass=M2): pass
try:
    class C(A, B): pass
except TypeError as e:
    print("TypeError:", str(e)[:60])
```

:::key
Reach for tools in this order: a plain function or class decorator, then `__init_subclass__` or `__set_name__`, and only then a metaclass, when you need to change the namespace (`__prepare__`), the class's own behaviour (`len(cls)`, `cls[...]`) or how the class itself is called.
:::

## What dataclasses, abc and enum generate {#ch09-stdlib .th}

### dataclasses

`@dataclass` is a class decorator. It reads the class's `__annotations__` and **generates source code** for `__init__`, `__repr__` and `__eq__` (plus ordering, `__hash__`, `__slots__` and frozen behaviour on request), then compiles it with `exec`:

```python run=c09-dataclass
from dataclasses import dataclass, field, fields
import inspect

@dataclass(order=True, frozen=True, slots=True)
class Item:
    priority: int
    name: str = field(compare=False)
    tags: tuple = ()

a, b = Item(2, "b"), Item(1, "a")
print(sorted([a, b]), a == Item(2, "other"))
print([f.name for f in fields(Item)], hasattr(a, "__dict__"), hash(a) == hash(Item(2, "z")))
print(inspect.signature(Item.__init__))
try:
    a.priority = 5
except AttributeError as e:
    print(type(e).__name__)
```

`compare=False` removes `name` from equality, ordering and the hash. Mutable defaults must use `field(default_factory=list)`; `@dataclass` raises `ValueError` for a bare `[]` default, for the reason in Chapter 2.

### abc

`ABCMeta` records the names decorated with `@abstractmethod` in `__abstractmethods__`, and `object.__new__` refuses to instantiate a class while that set is non-empty. It also supports **virtual subclasses** through `register` and `__subclasshook__`, which is how `isinstance(x, collections.abc.Iterable)` can be true for classes that never inherited from it:

```python run=c09-abc
from abc import ABC, abstractmethod
from collections.abc import Sized, Iterable

class Store(ABC):
    @abstractmethod
    def get(self, key): ...
    def get_or(self, key, default):
        try:
            return self.get(key)
        except KeyError:
            return default

class DictStore(Store):
    def __init__(self):
        self.d = {}
    def get(self, key):
        return self.d[key]

try:
    Store()
except TypeError as e:
    print("TypeError:", e)
print(DictStore().get_or("x", 0), Store.__abstractmethods__)

class Bag:
    def __len__(self):
        return 0
print(isinstance(Bag(), Sized), isinstance(Bag(), Iterable), issubclass(list, Iterable))
```

`Sized.__subclasshook__` returns `True` for any class with `__len__`, so `Bag` counts as `Sized` without inheriting. That is structural ("duck") typing checked at run time.

### enum

`EnumType` uses `__prepare__` to give the class body a special namespace that rejects duplicate names, then turns each attribute into a singleton **member** instance. The class itself becomes iterable and indexable by name:

```python run=c09-enum
from enum import Enum, IntEnum, auto

class Color(Enum):
    RED = 1
    GREEN = 2
    CRIMSON = 1          # alias of RED

class Level(IntEnum):
    LOW = auto()
    HIGH = auto()

print(list(Color), Color(1), Color["GREEN"], Color.CRIMSON is Color.RED)
print(Color.RED == 1, Level.HIGH == 2, Level.HIGH > Level.LOW, type(Color).__name__)
try:
    Color.RED = 5
except AttributeError as e:
    print("AttributeError:", e)
```

A plain `Enum` member is not equal to its value, which prevents accidentally comparing a colour with an unrelated int; `IntEnum` members are ints and compare as such.

## Concept and tricky questions {#ch09-concept .dr}

:::drill concept
What is a metaclass, and what is the metaclass of an ordinary class?
---
**Answer.** The type of a class: the thing that creates the class object and defines class-level behaviour. For ordinary classes it is `type`. `type` is its own metaclass.

**Why.** Instances are created by calling a class; classes are created by calling a metaclass with `(name, bases, namespace)`.
:::

:::drill concept
List the steps between the start of a `class` statement and the class name being bound.
---
**Answer.** Resolve the metaclass, call `__prepare__` to get the namespace, run the body in it, call `metaclass(name, bases, ns, **kw)` (`__new__`, which fills slots and calls `__set_name__` and the parent's `__init_subclass__`, then `__init__`), apply class decorators, bind the name.

**Why.** Knowing the order explains why a descriptor's `__set_name__` runs before a class decorator sees the class, and why the class body cannot refer to the class by name (it does not exist yet).
:::

:::drill concept
When do you need `__new__` instead of `__init__`?
---
**Answer.** When the value must be fixed at allocation: subclasses of immutable types (`int`, `float`, `str`, `tuple`, `bytes`, `frozenset`), and when you want to return an existing object (caching, interning, singletons) or an object of a different class.

**Why.** By the time `__init__` runs, an immutable object's value is already set. `__new__` is a static method that receives the class and must return the object.
:::

:::drill tricky
A singleton returns a cached instance from `__new__`. Why are its fields reset every time someone calls the class?
---
**Answer.** `type.__call__` calls `__init__` on whatever `__new__` returns, as long as it is an instance of the class. So the cached instance is re-initialised on every call.

**Why.** Guard `__init__` with a flag, move initialisation into `__new__`, use a module-level instance, or use a metaclass whose `__call__` returns the cached instance without calling `__init__` again.
:::

:::drill concept
What does `__init_subclass__` replace, and why is it usually better than a metaclass?
---
**Answer.** It replaces metaclasses written only to react to subclass creation (registration, validation, adding attributes). It is an ordinary class method on the base, cooperates through `super()`, accepts keyword arguments from the class statement, and does not create metaclass conflicts when combined with other bases.

**Why.** Two bases with unrelated metaclasses cannot be combined (`TypeError: metaclass conflict`); two bases with `__init_subclass__` can.
:::

:::drill tricky
`isinstance(obj, collections.abc.Iterable)` is `True` for a class that never inherits from `Iterable`. How?
---
**Answer.** `Iterable` is an ABC whose metaclass `ABCMeta` calls `Iterable.__subclasshook__`, which returns `True` for any class with an `__iter__` method in its MRO. Classes can also be added explicitly with `Iterable.register(cls)`.

**Why.** It is run-time structural typing. Note the hook checks only for the method name; `Iterable` does not detect classes iterable through the `__getitem__` protocol.
:::

:::drill concept
What code does `@dataclass` generate, and how?
---
**Answer.** By default `__init__`, `__repr__` and `__eq__`; with options also `__lt__` and friends (`order=True`), `__hash__` (`frozen=True` or `unsafe_hash=True`), `__setattr__`/`__delattr__` that raise (`frozen=True`), `__slots__` (`slots=True`, which builds a new class) and `__match_args__`. It builds the source text of these methods from the annotated fields and compiles it with `exec`.

**Why.** Because it generates real methods, a dataclass has no per-call overhead compared with handwritten code.
:::

## Predict the output and find the bug {#ch09-reading .dr}

:::drill output
What does this print?

```python run=c09-d-order
class Tracker:
    def __set_name__(self, owner, name):
        print("set_name", name)

class Base:
    def __init_subclass__(cls):
        print("init_subclass", cls.__name__)

print("before")
class Child(Base):
    print("body")
    a = Tracker()
    b = Tracker()
print("after")
```
---
**Answer.** `before`, `body`, then `set_name a`, `set_name b` (in definition order), then `init_subclass Child`, then `after`.

**Why.** The body runs first; `type.__new__` then calls `__set_name__` on each attribute and, after that, the parent's `__init_subclass__`.
:::

:::drill output
What does this print?

```python run=c09-d-new
class Weird:
    def __new__(cls):
        return 42
    def __init__(self):
        print("init called")

class Child:
    def __new__(cls):
        print("new")
        return super().__new__(cls)
    def __init__(self):
        print("init")

print(Weird(), type(Weird()))
Child()
```
---
**Answer.** `42 <class 'int'>` with no `init called`, then `new`, `init`.

**Why.** `__init__` runs only if `__new__` returns an instance of the class. Returning anything else skips it.
:::

:::drill output
What does this print?

```python run=c09-d-classvar
from dataclasses import dataclass, field

@dataclass
class Team:
    name: str
    members: list = field(default_factory=list)
    count = 0

a, b = Team("a"), Team("b")
a.members.append("x")
print(a, b.members, Team.count, "count" in Team.__dataclass_fields__)
```
---
**Answer.** `Team(name='a', members=['x']) [] 0 False`. `default_factory` gives each instance its own list. `count` has no annotation, so it is a plain class attribute, not a field, and it is not in the repr or `__init__`.

**Why.** Dataclasses use annotations to find fields. `ClassVar[int]` annotations are also excluded.
:::

:::drill output
What does this print?

```python run=c09-d-enum
from enum import Enum

class Status(Enum):
    OK = "ok"
    FAIL = "fail"

print(Status("ok"), Status.OK.value, Status.OK == "ok", Status.OK.name)
print(isinstance(Status.OK, Status), len(Status), "OK" in Status.__members__)
```
---
**Answer.** `Status.OK ok False OK`, then `True 2 True`. Calling the enum class with a value looks up the member; members are instances of the enum class; plain `Enum` members do not equal their values.

**Why.** Use `StrEnum` (3.11+) or `IntEnum` when members must compare equal to their raw values, for example when they come from JSON.
:::

:::drill bug
This abstract base class can still be instantiated. Find the bug.

```python run=c09-d-bug-abc
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        ...

class NoArea(Shape):
    pass

class Square(Shape):
    def __init__(self, s):
        self.s = s
    def area(self):
        return self.s ** 2

try:
    NoArea()
except TypeError as e:
    print("TypeError:", e)
print(Square(3).area())
```
---
**Answer.** The original `Shape` did not inherit from `ABC` (or use `metaclass=ABCMeta`), so `@abstractmethod` had no effect and `NoArea()` succeeded. With `ABC` as a base, as above, instantiating a class with abstract methods raises `TypeError`.

**Why.** The check lives in `object.__new__` and only looks at `__abstractmethods__`, which only `ABCMeta` computes.
:::

:::drill bug
A config singleton loses its settings. Fix it.

```python run=c09-d-bug-singleton
class Config:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.settings = {}
        return cls._instance

c1 = Config()
c1.settings["debug"] = True
c2 = Config()
print(c2.settings, c1 is c2)
```
---
**Answer.** The buggy version created `self.settings = {}` in `__init__`, which runs on every `Config()` call and wiped the settings. The fix moves the one-time setup into `__new__`, inside the "first time" branch, as above.

**Why.** In Python the simplest singleton is a module-level instance: modules are imported once and cached in `sys.modules`.
:::

## Write the code {#ch09-coding .cd}

:::drill code rating=1500
Write a metaclass `OrderedFields` whose `__prepare__` returns a namespace that records the order in which **non-callable** class attributes were defined, and stores it on the class as `_field_order`, then raises `TypeError` if the same name is assigned twice in the class body.
---
```python run=c09-c-prepare
class RecordingNamespace(dict):
    def __init__(self):
        super().__init__()
        self.order = []
    def __setitem__(self, key, value):
        if key in self and not key.startswith("__"):
            raise TypeError(f"duplicate definition of {key!r}")
        if not key.startswith("__") and not callable(value):
            self.order.append(key)
        super().__setitem__(key, value)

class OrderedFields(type):
    @classmethod
    def __prepare__(mcls, name, bases):
        return RecordingNamespace()
    def __new__(mcls, name, bases, ns):
        cls = super().__new__(mcls, name, bases, dict(ns))
        cls._field_order = tuple(ns.order)
        return cls

class Row(metaclass=OrderedFields):
    id = 0
    name = ""
    def show(self):
        return "..."
    created = None

print(Row._field_order)
try:
    class Bad(metaclass=OrderedFields):
        x = 1
        x = 2
except TypeError as e:
    print("TypeError:", e)
```

`__prepare__` is the only hook that can see the body *while it executes*, which is why `enum` uses it to reject duplicate member names. Since 3.6 a plain dict already preserves definition order, so the recording is for the filtering and the duplicate check.
:::

:::drill code rating=1300
Write a class decorator `auto_repr` that adds a `__repr__` showing the arguments of `__init__` (using `inspect.signature`) and their current values on the instance.
---
```python run=c09-c-autorepr
import inspect

def auto_repr(cls):
    params = [p for p in inspect.signature(cls.__init__).parameters if p != "self"]
    def __repr__(self):
        args = ", ".join(f"{p}={getattr(self, p, '?')!r}" for p in params)
        return f"{type(self).__name__}({args})"
    cls.__repr__ = __repr__
    return cls

@auto_repr
class Job:
    def __init__(self, name, retries=3):
        self.name = name
        self.retries = retries

print(Job("backup"), [Job("a", 1)])
```

A decorator runs after the class exists, so it can inspect the finished class and add methods, which covers most cases people reach for metaclasses for.
:::

:::drill code rating=1600
Write `Singleton`, a metaclass whose `__call__` creates the instance once per class and returns it on later calls **without** calling `__init__` again. Show it works for two different classes and for a subclass.
---
```python run=c09-c-singleton
class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in Singleton._instances:
            Singleton._instances[cls] = super().__call__(*args, **kwargs)
        return Singleton._instances[cls]

class Database(metaclass=Singleton):
    def __init__(self, url="sqlite://"):
        print("connecting to", url)
        self.url = url

class Cache(metaclass=Singleton):
    pass

class TestDatabase(Database):
    pass

a = Database("postgres://prod")
b = Database("ignored")
print(a is b, b.url, Cache() is Cache(), TestDatabase() is a)
```

Overriding `__call__` on the metaclass intercepts `Database(...)` before `__new__` and `__init__`, which is the only way to skip `__init__` for the cached instance. Keying by `cls` gives each subclass its own instance.
:::

:::drill code rating=1400
Write a minimal `@record` decorator, a tiny dataclass: read `cls.__annotations__`, generate `__init__` with defaults taken from class attributes, plus `__repr__` and `__eq__`, by building source code and calling `exec`, as `dataclasses` does.
---
```python run=c09-c-record
def record(cls):
    names = list(cls.__annotations__)
    defaults = {n: getattr(cls, n) for n in names if hasattr(cls, n)}
    params = ", ".join(f"{n}=__d_{n}" if n in defaults else n for n in names)
    body = "\n".join(f"    self.{n} = {n}" for n in names) or "    pass"
    src = f"def __init__(self, {params}):\n{body}\n"
    ns = {f"__d_{n}": v for n, v in defaults.items()}
    exec(src, ns)
    cls.__init__ = ns["__init__"]
    cls.__repr__ = lambda self: f"{cls.__name__}(" + ", ".join(f"{n}={getattr(self, n)!r}" for n in names) + ")"
    cls.__eq__ = lambda self, other: type(other) is type(self) and all(getattr(self, n) == getattr(other, n) for n in names)
    cls.__hash__ = None
    return cls

@record
class Point:
    x: int
    y: int = 0

print(Point(1), Point(1, 2) == Point(1, 2), Point(x=3, y=4))
import inspect
print(inspect.signature(Point.__init__))
```

Generating and compiling real source gives a normal function with a proper signature, which is faster than a generic `__init__(self, *args, **kwargs)` loop and works with `inspect` and IDEs.
:::

## Cheat sheet {#ch09-cheatsheet .th}

- `type(obj)` gives the type; `type(name, bases, ns)` creates a class. Classes are instances of their metaclass (`type` by default).
- Class creation: metaclass → `__prepare__` → body runs → `Meta(name, bases, ns)` (`__new__`: slots, `__set_name__`, parent `__init_subclass__`; then `__init__`) → decorators → bind name.
- Calling a class: `type.__call__` → `__new__(cls, …)` → `__init__` only if the result is an instance of `cls`.
- `__new__` for immutable subclasses and instance control; returning a cached instance still triggers `__init__`.
- Metaclass methods are class-level behaviour (`len(cls)`, `cls[...]`); unrelated metaclasses conflict.
- Prefer decorators, `__init_subclass__` and `__set_name__` over metaclasses.
- `@dataclass` generates real methods via `exec`; use `field(default_factory=…)` for mutable defaults; un-annotated attributes are not fields.
- `ABCMeta`: `__abstractmethods__` blocks instantiation; `register` and `__subclasshook__` give virtual subclasses (`isinstance(x, Sized)`).
- `Enum` members are singleton instances, iterable via the class; plain members ≠ values, `IntEnum`/`StrEnum` members do equal them.
