---
title: Timed mock rounds
part: Part G · Mixed practice
lede: Five rounds that mix the whole guide the way real interviews do: a question about default arguments turns into one about the bytecode, a dict question turns into hashing and resizing, and a threading question turns into the GIL. Set a timer, answer before opening anything, and score yourself honestly.
desc: Mixed question sets under a timer, with an answer key
hours: 3
prereqs: Chapters 1–12
---

## How to run a round {#ch13-how-to .th}

- Give yourself the time shown for each round, and answer every question out loud or in writing before you open the answer.
- For predict-the-output questions, write the exact output, including order and formatting. Half right counts as wrong in an interview.
- Score 1 for a correct answer with the right reason, ½ for the right answer with a vague reason, 0 otherwise. 80% or more on a round means the topic is ready.
- After each round, go back to the chapter behind every miss. The chapter is named in each answer.

| Round | Focus | Time |
|---|---|---|
| 1 | Generalist warm-up | 15 min |
| 2 | Predict the output | 20 min |
| 3 | Internals deep dive | 20 min |
| 4 | Debugging | 20 min |
| 5 | Coding | 45 min |

## Round 1: generalist warm-up {#ch13-round-1 .dr}

:::drill concept
Is Python compiled or interpreted?
---
**Answer.** Both. CPython compiles source to bytecode (cached in `.pyc` files) and then interprets that bytecode in its eval loop; since 3.11 the interpreter also specialises instructions at run time. (Chapter 3.)

**Why.** "Interpreted" alone suggests the source is re-parsed line by line, which is not what happens.
:::

:::drill concept
Is Python pass-by-value or pass-by-reference?
---
**Answer.** Neither, exactly: it is "pass by object reference" (call by sharing). The function receives references to the same objects, so it can mutate them, but rebinding a parameter does not affect the caller's variable. (Chapter 1.)

**Why.** The two classic demos: `items.append(1)` inside a function is visible outside; `items = [1]` inside a function is not.
:::

:::drill concept
What is the time complexity of `x in some_list`, `x in some_set` and `some_list.pop(0)`?
---
**Answer.** O(n), O(1) on average, and O(n). (Chapter 5.)

**Why.** Lists scan and shift pointers; sets hash.
:::

:::drill tricky
Why are dictionary keys required to be hashable, and why is a list not hashable?
---
**Answer.** A dict finds a key by its hash, so the hash must not change while the key is stored and equal keys must hash equally. A list is mutable and equality depends on its contents, so any hash based on contents could change after insertion. `list.__hash__` is therefore `None`. (Chapter 5.)

**Why.** Tuples are hashable only when everything inside them is.
:::

:::drill concept
What does the GIL prevent, and what does it not prevent?
---
**Answer.** It prevents two threads from executing Python bytecode at the same time in one interpreter, protecting refcounts and object internals. It does not prevent race conditions in your code, because a thread can be switched out between any two bytecodes of a compound operation. (Chapter 11.)

**Why.** "GIL means thread-safe" is the most common wrong answer.
:::

:::drill concept
What is the difference between a generator and a list comprehension?
---
**Answer.** A list comprehension builds the whole list immediately. A generator expression produces one value at a time on demand, uses constant memory and can only be iterated once. (Chapter 10.)

**Why.** Use a generator for large or infinite streams and pipelines; use a list when you need indexing, `len` or several passes.
:::

:::drill tricky
What is `__slots__` for, and what is its main downside?
---
**Answer.** It replaces the per-instance `__dict__` with fixed fields, saving memory and making attribute access faster. Downsides: no new attributes, no weak references unless `__weakref__` is listed, and every subclass must declare slots to keep the benefit. (Chapter 7.)

**Why.** Interviewers expect "use it for millions of small objects", not "use it everywhere".
:::

:::drill concept
What happens when the refcount of an object reaches zero, and what handles the cases refcounting cannot?
---
**Answer.** The object is deallocated immediately: its type's `tp_dealloc` decrements everything it references and frees its memory (back to pymalloc for small objects). Reference cycles never reach zero; the generational cycle collector finds and frees them. (Chapter 4.)

**Why.** Deterministic freeing is a CPython property; other implementations may free later.
:::

## Round 2: predict the output {#ch13-round-2 .dr}

:::drill output
What does this print?

```python run=c13-r2-defaults
def f(x, acc=[]):
    acc.append(x)
    return acc

print(f(1), f(2, []), f(3))
```
---
**Answer.** `[1, 3] [2] [1, 3]`: the first and third calls share the default list, and both print the same object after both appends. (Chapter 2.)

**Why.** Default values are evaluated once at `def` time. `print` receives the shared list twice and shows its final state.
:::

:::drill output
What does this print?

```python run=c13-r2-closure
def make():
    return [lambda: i * 10 for i in range(3)]

print([fn() for fn in make()])
print([fn() for fn in [lambda i=i: i * 10 for i in range(3)]])
```
---
**Answer.** `[20, 20, 20]`, then `[0, 10, 20]`. All lambdas in the first list share the comprehension's `i`, which ends at 2; the default argument freezes each value. (Chapter 2.)

**Why.** Closures capture variables, not values.
:::

:::drill output
What does this print?

```python run=c13-r2-identity
a = 256
b = int("256")
c = 257
d = int("257")
print(a is b, c is d, c == d)
t = ([],)
t[0].append(1)
print(t, len(t[0]))
```
---
**Answer.** `True False True`, then `([1],) 1`. 256 is in the small-int cache; 257 parsed at run time is a new object. Tuples cannot be rebound but their mutable contents can change. (Chapter 1.)

**Why.** `is` reflects caching; `==` is the only correct numeric comparison.
:::

:::drill output
What does this print?

```python run=c13-r2-mro
class A:
    def hi(self):
        return "A"

class B(A):
    def hi(self):
        return "B>" + super().hi()

class C(A):
    def hi(self):
        return "C>" + super().hi()

class D(B, C):
    pass

print(D().hi(), [k.__name__ for k in D.__mro__])
```
---
**Answer.** `B>C>A ['D', 'B', 'C', 'A', 'object']`. `super()` inside `B` follows the MRO of the `D` instance, so it reaches `C` before `A`. (Chapter 8.)

**Why.** `super()` means "next in the MRO of `type(self)`", not "my parent".
:::

:::drill output
What does this print?

```python run=c13-r2-gen
def g():
    try:
        yield 1
        yield 2
    finally:
        print("cleanup")

it = g()
print(next(it))
it.close()
print(list(g()))
```
---
**Answer.** `1`, `cleanup` (from `close()`), then the second generator runs to completion: `cleanup` is printed during `list()`, then `[1, 2]`. (Chapter 10.)

**Why.** `close()` raises `GeneratorExit` at the paused `yield`, so `finally` runs. A generator that finishes normally also runs it.
:::

:::drill output
What does this print?

```python run=c13-r2-dict
d = {}
d[1] = "a"
d[1.0] = "b"
d[True] = "c"
keys = list(d)
print(d, type(keys[0]).__name__)
s = {"x", "y"}
print(len(s | {"x"}), sorted(s & {"y", "z"}))
```
---
**Answer.** `{1: 'c'} int`, then `2 ['y']`. `1`, `1.0` and `True` are equal with equal hashes, so they are one key; the first key object is kept and the value is replaced. (Chapter 5.)

**Why.** Dict lookup uses hash and `==`, not type.
:::

:::drill output
What does this print?

```python run=c13-r2-asyncio
import asyncio

async def step(name, log):
    log.append(f"{name}1")
    await asyncio.sleep(0)
    log.append(f"{name}2")

async def main():
    log = []
    await asyncio.gather(step("a", log), step("b", log))
    await step("c", log)
    print(log)

asyncio.run(main())
```
---
**Answer.** `['a1', 'b1', 'a2', 'b2', 'c1', 'c2']`. `gather` runs `a` and `b` as tasks that interleave at each `await`; `c` runs after both are done. (Chapter 10.)

**Why.** Tasks switch only at awaits that are not ready; `sleep(0)` always yields once.
:::

:::drill output
What does this print?

```python run=c13-r2-iadd
x = [1, 2]
y = x
x += [3]
z = x
x = x + [4]
print(x, y, z, y is z)
```
---
**Answer.** `[1, 2, 3, 4] [1, 2, 3] [1, 2, 3] True`. `+=` extends the shared list in place; `x + [4]` builds a new list and rebinds only `x`. (Chapters 1 and 7.)

**Why.** `__iadd__` mutates; `__add__` creates.
:::

## Round 3: internals deep dive {#ch13-round-3 .dr}

:::drill concept
Walk through what happens, inside CPython, when you write `d[k] = v` for a dict that is two-thirds full.
---
**Answer.** Compute `hash(k)`; use its low bits to choose a slot in the index table and probe with the perturbed recurrence until finding the key or an empty slot. Since inserting would exceed the 2/3 load factor, the dict first resizes: allocate a larger power-of-two index table and entries array, and re-insert every live entry (dropping tombstones). Then append the new `(hash, key, value)` entry and store its index in the slot. (Chapter 5.)

**Why.** This is why appends to a dict are amortised O(1) and iteration order is insertion order.
:::

:::drill concept
Explain how `obj.method()` finds and calls the method.
---
**Answer.** `object.__getattribute__` searches `type(obj).__mro__` and finds a function in a class dict. It checks for a data descriptor (no), then the instance `__dict__` (no `method` there), then calls the function's `__get__(obj, type(obj))`, which produces a bound method; calling it passes `obj` as `self`. In 3.11+ the interpreter's `LOAD_ATTR` method form skips creating the bound method object. (Chapters 3 and 8.)

**Why.** The descriptor protocol is what makes `self` work.
:::

:::drill tricky
A long-running service's memory stays at its peak after a big batch job finishes and all the data is deleted. Is it a leak? How would you find out?
---
**Answer.** Probably not. pymalloc can return an arena to the OS only when all its pools are empty, and the C allocator keeps freed memory too, so RSS stays high while Python reuses the space. To check for a leak, run the job repeatedly: a leak keeps growing; fragmentation plateaus. Use `tracemalloc` snapshots before and after to see which lines still hold memory. (Chapter 4.)

**Why.** Distinguishing fragmentation from leaks is a common senior-level question.
:::

:::drill concept
What is the specialising adaptive interpreter and how can you see it?
---
**Answer.** PEP 659 (3.11+): instructions such as `LOAD_ATTR`, `BINARY_OP` and `CALL` are rewritten in place into type-specific versions after warming up, with guards stored in inline caches; they de-specialise if the guards keep failing. `dis.dis(fn, adaptive=True)` after calling `fn` many times shows names like `BINARY_OP_ADD_INT`. (Chapter 3.)

**Why.** It rewards type-stable code and is the basis for the 3.13 experimental JIT.
:::

:::drill tricky
Why is `"".join(parts)` preferred over `s += piece` in a loop, if CPython can make `+=` fast?
---
**Answer.** The `+=` optimisation applies only when the string has exactly one reference and is a local variable; attributes, globals and shared strings defeat it, and other implementations do not have it, making the loop O(n²). `join` is O(total length) everywhere. (Chapter 6.)

**Why.** Relying on a refcount-dependent optimisation is fragile.
:::

:::drill concept
How does the cycle collector decide which objects are garbage, without knowing the program's roots?
---
**Answer.** For each tracked container in the generation, it copies the refcount and subtracts the references coming from other objects in the same set. Objects with a remaining count are referenced from outside (roots); everything reachable from them survives. The rest are unreachable cycles and are finalised and cleared. (Chapter 4.)

**Why.** Any reference not explained by the set must come from outside, so the collector never needs a list of roots.
:::

:::drill tricky
Why can `from module import name` give you a stale value, and how does that affect mocking?
---
**Answer.** It binds a new name to the object at import time. If `module.name` is later rebound (reload, monkeypatching, `mock.patch("module.name")`), your binding still points at the old object. Patch the name where it is used, for example `mock.patch("myapp.client.name")`. (Chapter 12.)

**Why.** Names are references, and `from … import` is just an assignment.
:::

## Round 4: debugging {#ch13-round-4 .dr}

:::drill bug
This cache is supposed to be per instance but is shared by all instances. Find the bug.

```python run=c13-r4-classattr
class Service:
    cache = {}
    def get(self, key):
        if key not in self.cache:
            self.cache[key] = f"value for {key}"
        return self.cache[key]

a, b = Service(), Service()
a.get("x")
print(b.cache)

class FixedService:
    def __init__(self):
        self.cache = {}
    get = Service.get

c, d = FixedService(), FixedService()
c.get("x")
print(d.cache)
```
---
**Answer.** `cache = {}` is a class attribute, so `self.cache` reads the one dict shared by every instance and mutates it. Create it in `__init__`. (Chapter 8.)

**Why.** Reading `self.attr` falls through to the class; only assignment would create an instance attribute.
:::

:::drill bug
A background thread updates a progress counter; the final count is sometimes wrong. Find the bug.

```python run=c13-r4-race
import threading

class Progress:
    def __init__(self):
        self.done = 0
        self._lock = threading.Lock()
    def step(self):
        with self._lock:
            self.done += 1

p = Progress()
threads = [threading.Thread(target=lambda: [p.step() for _ in range(10_000)]) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(p.done)
```
---
**Answer.** The original `step` did `self.done += 1` without the lock. That is a load-add-store sequence, and a thread switch in the middle loses updates. The fixed version holds a lock around it. (Chapter 11.)

**Why.** The GIL makes each bytecode atomic, not the sequence.
:::

:::drill bug
This parser's error handling hides real bugs. What is wrong?

```python run=c13-r4-except
def parse_port(text):
    try:
        port = int(text)
    except ValueError:
        return None
    if not 0 < port < 65536:
        raise ValueError(f"port out of range: {port}")
    return port

print(parse_port("8080"), parse_port("http"))
try:
    parse_port("70000")
except ValueError as e:
    print("ValueError:", e)
```
---
**Answer.** The original wrapped everything in `try: … except Exception: return None`, so a typo (`NameError`), a range error and bad input all looked like "no port". The fix catches only the expected `ValueError` from `int()`, around only that line, and lets other errors propagate. (Chapter 3 shows that `try` is free; the cost is in what it hides.)

**Why.** Keep `try` blocks small and catch specific exceptions.
:::

:::drill bug
An async web handler makes every request slow under load. Find the bug.

```python run=c13-r4-async nondet
import asyncio, time

def legacy_lookup(user):
    time.sleep(0.05)
    return {"user": user}

async def handler(user):
    return await asyncio.to_thread(legacy_lookup, user)

async def main():
    t0 = time.perf_counter()
    await asyncio.gather(*(handler(u) for u in range(10)))
    print("10 requests concurrently:", time.perf_counter() - t0 < 0.3)

asyncio.run(main())
```
---
**Answer.** The original handler called `legacy_lookup(user)` directly. That blocking call froze the event loop, so 10 requests took 10 × 50 ms one after another. Running it with `asyncio.to_thread` (or using an async client) lets the loop serve other requests while it waits. (Chapter 10.)

**Why.** Every blocking call inside a coroutine serialises the whole server.
:::

:::drill bug
Equal `Point`s are not found in a set. Find the bug.

```python run=c13-r4-hash
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __eq__(self, other):
        return isinstance(other, Point) and (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))

seen = {Point(1, 2)}
print(Point(1, 2) in seen)
```
---
**Answer.** The original defined `__eq__` but its `__hash__` was `return id(self)` (or it inherited the identity hash through an explicit `__hash__ = object.__hash__`), so equal points landed in different slots. Hash the same fields that `__eq__` compares. (Chapter 5.)

**Why.** Equal objects must have equal hashes, or sets and dicts silently fail.
:::

:::drill bug
A plugin system registers plugins in a module, but the registry is always empty when read from the main script. Why?

```python run=c13-r4-registry
import sys, os, tempfile, subprocess

d = tempfile.mkdtemp()
files = {
    "registry.py": "PLUGINS = []\n",
    "plugin_a.py": "import registry\nregistry.PLUGINS.append('a')\n",
    "main.py": "import registry\nimport plugin_a\nprint(registry.PLUGINS)\n",
}
for name, src in files.items():
    with open(os.path.join(d, name), "w") as f:
        f.write(src)
print(subprocess.run([sys.executable, "-s", "main.py"], cwd=d, capture_output=True, text=True).stdout.strip())
```
---
**Answer.** The original kept `PLUGINS` in `main.py`, and plugins did `import main`. That imported the script a second time as a separate module named `main` (the running script is `__main__`), so plugins appended to a different list. Moving the registry into its own module that both sides import fixes it. (Chapter 12.)

**Why.** Never import the entry-point script; it is not the same module object.
:::

## Round 5: coding {#ch13-round-5 .cd}

:::drill code rating=1500
Write a decorator `retry(times, exceptions)` that retries a function on the listed exceptions with exponential back-off (sleep 0.01, 0.02, 0.04 …), re-raises the last exception after the final attempt, preserves the function's metadata, and records the number of attempts on the wrapper.
---
```python run=c13-r5-retry
import functools, time

def retry(times=3, exceptions=(Exception,), base_delay=0.01):
    def decorate(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            delay = base_delay
            for attempt in range(1, times + 1):
                wrapper.attempts = attempt
                try:
                    return fn(*args, **kwargs)
                except exceptions:
                    if attempt == times:
                        raise
                    time.sleep(delay)
                    delay *= 2
        wrapper.attempts = 0
        return wrapper
    return decorate

calls = {"n": 0}

@retry(times=4, exceptions=(ConnectionError,))
def flaky():
    "Fails twice, then works."
    calls["n"] += 1
    if calls["n"] < 3:
        raise ConnectionError("try again")
    return "ok"

print(flaky(), flaky.attempts, flaky.__name__, flaky.__doc__)

@retry(times=2, exceptions=(ValueError,))
def always_bad():
    raise ValueError("permanent")

try:
    always_bad()
except ValueError as e:
    print("gave up after", always_bad.attempts, "attempts:", e)
```

Bare `raise` inside the `except` block re-raises with the original traceback. Catching only the listed exceptions means a `KeyError` bug is not retried.
:::

:::drill code rating=1600
Implement `TTLCache(maxsize, ttl)`, a mapping where entries expire `ttl` seconds after being set, and the least recently used entry is evicted when full. Inject the clock so it can be tested without sleeping.
---
```python run=c13-r5-ttl
from collections import OrderedDict

class TTLCache:
    def __init__(self, maxsize, ttl, clock):
        self.maxsize, self.ttl, self.clock = maxsize, ttl, clock
        self.data = OrderedDict()       # key -> (expires_at, value)

    def __setitem__(self, key, value):
        self.data[key] = (self.clock() + self.ttl, value)
        self.data.move_to_end(key)
        while len(self.data) > self.maxsize:
            self.data.popitem(last=False)

    def __getitem__(self, key):
        expires, value = self.data[key]
        if self.clock() >= expires:
            del self.data[key]
            raise KeyError(key)
        self.data.move_to_end(key)
        return value

    def get(self, key, default=None):
        try:
            return self[key]
        except KeyError:
            return default

    def __len__(self):
        now = self.clock()
        for k in [k for k, (exp, _) in self.data.items() if exp <= now]:
            del self.data[k]
        return len(self.data)

now = [0.0]
cache = TTLCache(maxsize=2, ttl=10, clock=lambda: now[0])
cache["a"] = 1
cache["b"] = 2
cache.get("a")              # a is now most recently used
cache["c"] = 3              # evicts b
now[0] = 5
print(cache.get("a"), cache.get("b"), cache.get("c"), len(cache))
now[0] = 12
print(cache.get("a"), len(cache))
```

Passing the clock in (instead of calling `time.monotonic()` inside) is what makes time-based code testable, and `monotonic` rather than `time.time` is the right real clock because it never jumps backwards.
:::

:::drill code rating=1700
Write `async def bounded_gather(coros, limit)` that runs coroutines concurrently with at most `limit` running at once, returns results in input order, and cancels the rest if one fails. Show the peak concurrency.
---
```python run=c13-r5-bounded
import asyncio

async def bounded_gather(coros, limit):
    sem = asyncio.Semaphore(limit)
    async def run(c):
        try:
            async with sem:
                return await c
        finally:
            c.close()       # a coroutine cancelled before it started was never awaited
    async with asyncio.TaskGroup() as tg:       # 3.11+: cancels siblings on failure
        tasks = [tg.create_task(run(c)) for c in coros]
    return [t.result() for t in tasks]

active = 0
peak = 0

async def job(i, fail=False):
    global active, peak
    active += 1
    peak = max(peak, active)
    await asyncio.sleep(0.01)
    active -= 1
    if fail:
        raise ValueError(f"job {i} failed")
    return i * i

async def main():
    print(await bounded_gather([job(i) for i in range(10)], limit=3), "peak:", peak)
    try:
        await bounded_gather([job(i, fail=(i == 4)) for i in range(10)], limit=3)
    except* ValueError as eg:
        print("failed:", [str(e) for e in eg.exceptions])

asyncio.run(main())
```

`TaskGroup` cancels the remaining tasks when one raises and reports errors as an `ExceptionGroup`, handled with `except*`. The semaphore limits how many coroutines are *inside* `await c` at once, even though all tasks exist from the start. When the group cancels tasks still waiting on the semaphore, their coroutines were never started; closing them in `finally` avoids the "coroutine was never awaited" warning (closing a finished coroutine does nothing).
:::
