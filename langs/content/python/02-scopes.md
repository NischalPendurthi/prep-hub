---
title: Names, scopes and closures
part: Part A · The object model
lede: Python decides at compile time whether each name in a function is local, global, free or built in, and that one decision explains `UnboundLocalError`, the late-binding loop bug and the mutable-default-argument trap. This chapter covers the LEGB rule, how the compiler classifies names, how closures keep variables alive in cell objects, and what `global` and `nonlocal` really change.
desc: LEGB, compile-time scoping, UnboundLocalError, cells and closures, late binding, defaults
hours: 3
prereqs: Chapter 1
---

## Namespaces and the LEGB rule {#ch02-legb .th}

A **namespace** maps names to objects. Python has four kinds that matter for name lookup, searched in this order:

1. **Local**: the names assigned in the current function call.
2. **Enclosing**: the locals of any function that lexically contains this one.
3. **Global**: the module's namespace, a plain dict you can see as `globals()` or `module.__dict__`.
4. **Built-in**: the `builtins` module, which holds `len`, `print`, `ValueError` and the rest.

Scopes are **lexical**: what matters is where the function was *written*, not where it is called from. A function defined inside another one can see the outer function's names even after the outer call has returned.

```python run=c02-legb
x = "global"

def outer():
    x = "enclosing"
    def inner():
        return x
    return inner

def caller():
    x = "caller's local"
    return outer()()

print(caller())
print(len.__module__, "len" in dir(__builtins__))
```

`inner` returns `"enclosing"` even though it is called from `caller`, because lookup follows the nesting in the source code.

### Shadowing a built-in

Any assignment to a name such as `list`, `id` or `sum` at module level creates a global that hides the built-in for the rest of the module. Nothing warns you:

```python run=c02-shadow
list = [1, 2, 3]
try:
    print(list("abc"))
except TypeError as e:
    print("TypeError:", e)
del list
print(list("abc"))
```

`del list` removes the global, and lookup falls through to `builtins` again.

## The compiler decides the scope {#ch02-compile .th}

Python does not look a name up dynamically through all four scopes on every access. When it compiles a function, it reads the whole body and classifies every name **once**:

- A name that is **assigned anywhere** in the function (by `=`, `+=`, `for`, `import`, `def`, `class`, `with … as`, `except … as` or a walrus `:=`) is local to the whole function, unless declared `global` or `nonlocal`.
- A name that is only read, and is local in an enclosing function, is **free**: it is reached through a cell (below).
- Any other name that is only read is **global-or-built-in**.

The classification picks the bytecode: `LOAD_FAST` for locals (an index into an array in the frame), `LOAD_DEREF` for free variables and `LOAD_GLOBAL` for the rest. `LOAD_FAST` is just an array index, which is why local variables are faster than globals.

```python run=c02-symtable
import symtable

src = """
total = 0
def f(a):
    b = a + total
    def g():
        return b + len(a)
    return g
"""
mod = symtable.symtable(src, "<demo>", "exec")
f = mod.get_children()[0]
g = f.get_children()[0]
for table in (f, g):
    for s in sorted(table.get_symbols(), key=lambda s: s.get_name()):
        kind = ("local" if s.is_local() else "") + (" free" if s.is_free() else "") + (" global" if s.is_global() else "")
        print(table.get_name(), s.get_name(), kind.strip())
```

`b` is local in `f` and free in `g`. `total` and `len` are globals as far as the compiler knows; whether `len` is found in the module or in `builtins` is decided at run time.

### UnboundLocalError

Because an assignment anywhere makes a name local everywhere in the function, reading it *before* the assignment fails, even if a global of the same name exists:

```python run=c02-unbound
count = 0

def bump():
    try:
        count += 1
    except UnboundLocalError as e:
        print("UnboundLocalError:", e)

def show_then_set():
    try:
        print(count)
    except UnboundLocalError as e:
        print("UnboundLocalError:", e)
    count = 5

bump()
show_then_set()
```

In `show_then_set`, the `print` is on the line *before* the assignment, and it still fails. The compiler saw `count = 5` and made `count` local for the whole body. `UnboundLocalError` is a subclass of `NameError`.

:::key
The rule is per function and decided at compile time: "assigned anywhere in this function, therefore local everywhere in this function". It is not "assigned before this line".
:::

### What bytecode the compiler chose

```python run=c02-dis
import dis

g_value = 10

def f(a):
    b = a * 2
    return b + g_value + len("x")

dis.dis(f)
```

`a` and `b` are `LOAD_FAST`, while `g_value` and `len` use `LOAD_GLOBAL`, which checks the module dict and then the builtins dict. CPython caches global lookups per instruction and invalidates the cache when either dict changes, so in a hot loop `LOAD_GLOBAL` is cheap but still slower than `LOAD_FAST`.

## Closures and cell objects {#ch02-closures .th}

When an inner function uses a variable of the outer function, the outer local cannot live in the outer frame's array any more, because the inner function may outlive that frame. The compiler instead stores it in a **cell object**: a tiny heap object that holds one reference. The outer function and every inner function that uses the variable share the same cell, so they all see the latest value.

```python run=c02-cells
def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    def peek():
        return count
    return inc, peek

inc, peek = make_counter()
inc(); inc()
print(peek())
print(inc.__code__.co_freevars, inc.__closure__[0] is peek.__closure__[0])
print(inc.__closure__[0].cell_contents)
print(make_counter.__code__.co_cellvars)
```

`co_cellvars` lists the outer function's variables that live in cells, and `co_freevars` lists the inner function's references to them. `__closure__` is the tuple of cells a function object carries.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 210" role="img" aria-label="The outer frame and two inner function objects all point to one cell, which points to the int value">
  <rect x="20" y="40" width="190" height="130" rx="8" class="d-box"/><text x="115" y="32" text-anchor="middle" class="t-small">make_counter frame (gone after return)</text>
  <text x="36" y="72" class="t-mono">count → cell</text>
  <rect x="270" y="80" width="140" height="56" rx="8" class="d-acc"/><text x="340" y="104" text-anchor="middle" class="t-bold">cell</text><text x="340" y="124" text-anchor="middle" class="t-mono">contents</text>
  <path d="M150 68 C 220 68, 230 96, 270 100" class="d-line d-dash"/>
  <rect x="500" y="24" width="190" height="60" rx="8" class="d-box"/><text x="595" y="50" text-anchor="middle" class="t-mono">inc</text><text x="595" y="70" text-anchor="middle" class="t-small">__closure__ = (cell,)</text>
  <rect x="500" y="130" width="190" height="60" rx="8" class="d-box"/><text x="595" y="156" text-anchor="middle" class="t-mono">peek</text><text x="595" y="176" text-anchor="middle" class="t-small">__closure__ = (cell,)</text>
  <path d="M500 54 C 450 54, 440 90, 410 98" class="d-line-acc"/>
  <path d="M500 160 C 450 160, 440 124, 410 118" class="d-line-acc"/>
  <path d="M340 136 L 340 176" class="d-line"/><rect x="300" y="176" width="80" height="26" class="d-key"/><text x="340" y="194" text-anchor="middle" class="t-mono">2</text>
</svg></div><figcaption><b>One cell, shared.</b> Both closures hold the same cell, so <code>peek</code> sees what <code>inc</code> wrote. The cell keeps the value alive after the outer frame is gone.</figcaption></figure>

### Late binding: the loop-closure bug

A closure captures the **variable** (the cell), not the value the variable had when the function was created. Functions created in a loop therefore all see the variable's final value:

```python run=c02-late
fns = [lambda: i for i in range(3)]
print([f() for f in fns])

fixed = [lambda i=i: i for i in range(3)]
print([f() for f in fixed])

from functools import partial
def show(i):
    return i
parts = [partial(show, i) for i in range(3)]
print([p() for p in parts])
```

The default argument `i=i` is evaluated when each lambda is *created*, so it freezes the current value. `functools.partial` does the same by storing the argument. The same bug appears with callbacks registered in a loop (GUI handlers, `threading.Thread(target=lambda: work(i))`).

## global and nonlocal {#ch02-global .th}

`global x` says "the name `x` in this function refers to the module's `x`". Assignments then write to the module dict. `nonlocal x` says "`x` refers to the nearest enclosing function's variable", and it must already exist there; it never reaches the module level.

```python run=c02-nonlocal
total = 0

def add_global(n):
    global total
    total += n

def outer():
    level = "outer"
    def inner():
        nonlocal level
        level = "changed by inner"
    inner()
    return level

add_global(5)
print(total, outer())

try:
    exec("def f():\n    nonlocal missing\n")
except SyntaxError as e:
    print("SyntaxError:", e.msg)
```

Neither statement is needed to *mutate* an object: `items.append(x)` inside a function works on a global list without `global items`, because it reads the name and calls a method; it never assigns the name. You need `global` or `nonlocal` only to **rebind** the name.

:::trap
Mutable module-level state changed through `global` is hard to test and not thread-safe. In interviews, prefer an object with methods, a closure, or passing state in and returning it out.
:::

## Default arguments are evaluated once {#ch02-defaults .th}

`def f(x, items=[])` evaluates `[]` **once**, when the `def` statement runs, and stores the object in `f.__defaults__`. Every call that does not pass `items` gets that same list, so changes accumulate between calls:

```python run=c02-defaults
def append_to(x, items=[]):
    items.append(x)
    return items

print(append_to(1), append_to(2))
print(append_to.__defaults__)

def append_safe(x, items=None):
    if items is None:
        items = []
    items.append(x)
    return items

print(append_safe(1), append_safe(2))
```

Both calls return the *same* list object, which is why the first line prints `[1, 2]` twice: by the time `print` runs, the shared list holds both items. The `None` sentinel pattern creates a fresh list on each call. The same rule makes `def f(when=datetime.now())` freeze the time at import, and it is also why the `i=i` trick above works.

### Comprehensions and class bodies

A list comprehension has its own scope for its loop variable, so the variable does not leak. Since 3.12 (PEP 709), CPython inlines comprehensions into the enclosing function for speed, but it keeps the same visible semantics.

A **class body** is a namespace but not an enclosing scope for anything nested in it: methods cannot see class attributes as bare names, and neither can a comprehension in the class body (except in its first iterable, which is evaluated in the class scope):

```python run=c02-class-scope
class Config:
    base = 10
    try:
        scaled = [base * i for i in range(3)]
    except NameError as e:
        error = str(e)
    ok = [i for i in range(base, base + 2)]

print(Config.error)
print(Config.ok)

x = "module"
squares = [x for x in range(3)]
print(x, squares)
```

`range(base, base + 2)` is the first iterable, so it can see `base`. Inside the comprehension body, `base` is looked up as a global and not found. Use `self.base`, `cls.base` or `Config.base` inside methods.

## Concept and tricky questions {#ch02-concept .dr}

:::drill concept
State the LEGB rule. Is lookup decided by where a function is defined or where it is called?
---
**Answer.** Local, Enclosing, Global, Built-in, in that order. It is decided by where the function is **defined** (lexical scoping), not by the caller.

**Why.** The compiler knows the nesting of functions in the source and resolves local and free names at compile time. A call from another function does not add that function's locals to the search.
:::

:::drill tricky
Why does `print(count)` raise `UnboundLocalError` when it is the first line of a function, `count` is a global, and the assignment `count = 5` comes later?
---
**Answer.** The compiler saw the assignment and made `count` a local of the whole function, so the first line reads an unset local slot.

**Why.** Scope is decided per function at compile time, not line by line at run time. Add `global count` to use the module variable, or rename one of them.
:::

:::drill concept
Why are local variables faster to access than globals in CPython?
---
**Answer.** Locals are compiled to `LOAD_FAST`, an index into a fixed array in the frame. Globals use `LOAD_GLOBAL`, which must consult the module dict and then the builtins dict (with an inline cache that is invalidated when either dict changes).

**Why.** This is why old performance advice says to bind a global function to a local (`append = result.append`) before a tight loop. With the 3.11+ specialising interpreter the gap is smaller, but it still exists.
:::

:::drill concept
What is a cell object and when does CPython create one?
---
**Answer.** A small heap object holding one reference. CPython uses one for each local variable of a function that an inner function refers to, so the variable can outlive the outer frame and be shared by every closure that uses it.

**Why.** The outer function accesses it with `LOAD_DEREF` and `STORE_DEREF`, and each inner function carries the cell in `__closure__`.
:::

:::drill tricky
Does `items.append(x)` inside a function need `global items` when `items` is a module-level list? Does `items = items + [x]`?
---
**Answer.** `append` does not, because it only reads the name `items` and mutates the object. `items = items + [x]` does, because it assigns the name, which makes `items` local (and the read on the right then raises `UnboundLocalError`).

**Why.** `global` and `nonlocal` are about **rebinding** names, never about mutating objects.
:::

:::drill concept
When is the default value in `def f(x=[])` evaluated, and where is it stored?
---
**Answer.** Once, when the `def` statement is executed. It is stored in `f.__defaults__` (keyword-only defaults in `f.__kwdefaults__`).

**Why.** A `def` is an executable statement that builds a function object. Its default expressions run at that moment, so a mutable default is shared by every call.
:::

:::drill tricky
Can `nonlocal` refer to a module-level variable?
---
**Answer.** No. `nonlocal x` must refer to a variable of an enclosing *function*. If no enclosing function defines `x`, it is a `SyntaxError`, even when a global `x` exists.

**Why.** Module-level names are reached with `global`. `nonlocal` exists for closures, where the variable lives in a cell.
:::

## Predict the output and find the bug {#ch02-reading .dr}

:::drill output
What does this print?

```python run=c02-d-late
callbacks = {}
for name in ["a", "b", "c"]:
    callbacks[name] = lambda: name.upper()
print([callbacks[k]() for k in "abc"])
```
---
**Answer.** Every lambda looks up `name` when it is *called*, after the loop finished, so all three return `"C"`.

**Why.** At module level the lambdas read the global `name`. Inside a function they would share one cell. Either way the value is read late. Fix with `lambda name=name: name.upper()`.
:::

:::drill output
What does this print?

```python run=c02-d-defaults
def tag(x, seen=set()):
    seen.add(x)
    return len(seen)

print(tag("a"), tag("b"), tag("a"), tag("c", set()), tag("d"))
```
---
**Answer.** The default set is shared, so the counts grow 1, 2, 2. The explicit `set()` gives a fresh set (1). The next default call continues from the shared set and sees `a`, `b`, `d` (3).

**Why.** Passing an argument replaces the default only for that call; the stored default object is untouched.
:::

:::drill output
What does this print?

```python run=c02-d-scopes
x = 1
def f():
    x = 2
    def g():
        return x
    x = 3
    return g

def h():
    global x
    x = 4

g = f()
h()
print(g(), x)
```
---
**Answer.** `g` reads the cell for `f`'s `x`, which holds 3 by the time `f` returns. `h` rebinds the module `x` to 4. The output is `3 4`.

**Why.** The closure sees the variable's latest value in the enclosing function, not the value at the moment `g` was defined.
:::

:::drill output
What does this print?

```python run=c02-d-walrus
total = 0
results = [total := total + n for n in range(4)]
print(results, total)
```
---
**Answer.** A walrus inside a comprehension binds in the *containing* scope, so `total` is updated on every step and keeps its final value: `[0, 1, 3, 6] 6`.

**Why.** PEP 572 makes `:=` in a comprehension assign to the enclosing function or module scope, which makes running totals possible. The loop variable `n` itself still does not leak.
:::

:::drill output
What does this print?

```python run=c02-d-counter
def counter():
    n = 0
    def step():
        nonlocal n
        n += 1
        return n
    return step

a, b = counter(), counter()
print(a(), a(), b(), a.__closure__[0] is b.__closure__[0])
```
---
**Answer.** Each call to `counter()` creates a new frame and a new cell, so `a` and `b` count independently: `1 2 1 False`.

**Why.** A cell is created per call of the outer function, not per definition. That is what makes closures usable as lightweight objects.
:::

:::drill bug
This retry helper builds one callback per attempt, but every callback logs the last attempt number. Find the bug and fix it.

```python run=c02-d-bug-retry
def make_loggers(n):
    loggers = []
    for attempt in range(1, n + 1):
        def log():
            return f"attempt {attempt}"
        loggers.append(log)
    return loggers

print([f() for f in make_loggers(3)])
```
---
**Answer.** All the `log` functions share the cell for `attempt`, which ends at 3. Bind the value at creation time: `def log(attempt=attempt):`, or build each with a factory function such as `def make(a): return lambda: f"attempt {a}"`.

**Why.** A factory call creates a new cell per attempt, which is the cleanest fix when you do not want an extra parameter on the callback.
:::

:::drill bug
A timestamp default is wrong. Find the bug.

```python run=c02-d-bug-time nondet
import time

def log(msg, when=time.monotonic()):
    return round(when, 3)

first = log("a")
time.sleep(0.05)
second = log("b")
print(first == second)
```
---
**Answer.** `time.monotonic()` is evaluated once, when the `def` runs, so every call reports the same time. Use `when=None` and set `when = time.monotonic()` inside the body when it is `None`.

**Why.** Defaults are values, not expressions re-evaluated per call. Tools such as `ruff` (B008) flag function calls in defaults for this reason.
:::

:::drill bug
This class tries to precompute a lookup table in its body and crashes on import. Why?

```python run=c02-d-bug-class expect=error
class Units:
    factor = 1000
    table = {name: factor * i for i, name in enumerate(["k", "M", "G"], 1)}

print(Units.table)
```
---
**Answer.** The comprehension body cannot see class-scope names, so `factor` is looked up as a global and raises `NameError`. Compute the table after the class (`Units.table = …`), or pass the value into the first iterable, for example `{name: f * i for f in [factor] for i, name in …}`.

**Why.** The class body is a namespace, not an enclosing scope. Only the first iterable of a comprehension is evaluated in the class scope.
:::

## Write the code {#ch02-coding .cd}

:::drill code rating=1200
Write a `memoize` decorator using only a closure (no `functools`). It should cache results by positional arguments, expose the cache as `wrapped.cache`, and keep the original function's name.
---
The cache dict lives in the decorator's frame and is captured by the wrapper.

```python run=c02-c-memoize
def memoize(fn):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = fn(*args)
        return cache[args]
    wrapper.cache = cache
    wrapper.__name__ = fn.__name__
    wrapper.__doc__ = fn.__doc__
    wrapper.__wrapped__ = fn
    return wrapper

calls = 0
@memoize
def fib(n):
    global calls
    calls += 1
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(40), calls, fib.__name__, len(fib.cache))
```

Because `fib` the global name now points at the wrapper, the recursive calls inside `fib` also go through the cache, which turns the exponential recursion into 41 real calls.
:::

:::drill code rating=1300
Write `once(fn)`: a decorator that runs `fn` the first time it is called and returns the same result on every later call without running it again, even if the first call returned `None`.
---
Use a closure flag rather than testing the result, because `None` is a valid result.

```python run=c02-c-once
def once(fn):
    done = False
    result = None
    def wrapper(*args, **kwargs):
        nonlocal done, result
        if not done:
            result = fn(*args, **kwargs)
            done = True
        return result
    return wrapper

@once
def init():
    print("initialising")
    return None

print(init(), init())
```

`nonlocal` is needed because the wrapper rebinds both variables. For thread safety you would wrap the check in a `threading.Lock`.
:::

:::drill code rating=1400
Write `make_accumulators(n)` that returns `n` functions where the `i`-th adds `i` to its argument, then show that it is correct. Do it once with a default argument and once with a factory, and explain why the naive version fails.
---
```python run=c02-c-accum
def naive(n):
    return [lambda x: x + i for i in range(n)]

def with_default(n):
    return [lambda x, i=i: x + i for i in range(n)]

def with_factory(n):
    def make(i):
        return lambda x: x + i
    return [make(i) for i in range(n)]

for build in (naive, with_default, with_factory):
    print(build.__name__, [f(100) for f in build(3)])
```

The naive lambdas all share the comprehension's single `i` cell, which ends at 2. The default freezes the value per lambda (but exposes an extra parameter). The factory gives each lambda its own cell.
:::

:::drill code rating=1500
Write `scope_report(source)` that, for every function in a piece of source code, lists its local, free and global names, using the `symtable` module. Run it on a function with a nested closure.
---
```python run=c02-c-report
import symtable

def scope_report(source):
    def walk(table, depth=0):
        if table.get_type() == "function":
            groups = {"local": [], "free": [], "global": []}
            for s in table.get_symbols():
                if s.is_free():
                    groups["free"].append(s.get_name())
                elif s.is_local():
                    groups["local"].append(s.get_name())
                elif s.is_global():
                    groups["global"].append(s.get_name())
            parts = ", ".join(f"{k}={sorted(v)}" for k, v in groups.items() if v)
            print("  " * depth + f"{table.get_name()}: {parts}")
        for child in table.get_children():
            walk(child, depth + 1)
    walk(symtable.symtable(source, "<src>", "exec"))

scope_report("""
LIMIT = 10
def outer(data):
    seen = set()
    def check(x):
        if x in seen or x > LIMIT:
            return False
        seen.add(x)
        return True
    return [x for x in data if check(x)]
""")
```

This is the same information the compiler uses to choose `LOAD_FAST`, `LOAD_DEREF` and `LOAD_GLOBAL`. Notice that `seen` is local in `outer` (it is also a cell variable) and free in `check`. The comprehension variable `x` appears as a local of `outer` because 3.12 inlines comprehensions into the enclosing function (PEP 709); it is still invisible outside the comprehension.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- Lookup order: Local, Enclosing, Global, Built-in. Scoping is lexical (where the function is written).
- Any assignment in a function (`=`, augmented assignment, `for`, `import`, `def`, `class`, `as`, `:=`) makes the name local to the whole function.
- Reading a local before assigning it raises `UnboundLocalError`, even if a global exists.
- Bytecode: `LOAD_FAST` (locals, array index), `LOAD_DEREF` (cells), `LOAD_GLOBAL` (module dict, then builtins).
- Closures capture variables through shared **cell** objects (`__closure__`, `co_freevars`, `co_cellvars`), so they see the latest value.
- Loop closures: bind per iteration with `lambda i=i: …`, `functools.partial` or a factory function.
- `global x` rebinds the module variable. `nonlocal x` rebinds an enclosing function's variable and must find one. Neither is needed to mutate.
- Defaults are evaluated once at `def` time and stored in `__defaults__`; use `None` for mutable or time-based defaults.
- Comprehension variables do not leak; `:=` inside a comprehension binds in the enclosing scope.
- Class bodies are not enclosing scopes: methods and comprehensions in the class body cannot see class attributes by bare name.
