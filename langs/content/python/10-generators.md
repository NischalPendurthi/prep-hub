---
title: Iterators, generators and coroutines
part: Part E · Control flow and concurrency
lede: A generator is a function whose frame can be paused and resumed, and that one mechanism underlies lazy pipelines, `yield from` delegation, `async`/`await` and the asyncio event loop. This chapter covers the iterator protocol, what a suspended generator holds, `send`, `throw` and `close`, how coroutines are built on the same machinery, and how asyncio schedules them on a single thread.
desc: Iterator protocol, generator frames, send/throw/close, yield from, coroutines, the asyncio loop
hours: 4
prereqs: Chapters 2–3
---

## The iterator protocol {#ch10-protocol .th}

Two roles, two methods:

- An **iterable** is anything with `__iter__` that returns an iterator (lists, dicts, files, ranges). It can usually be iterated many times.
- An **iterator** has `__next__`, which returns the next value or raises `StopIteration`, and an `__iter__` that returns itself. It is single-pass and keeps its position.

A `for` loop is shorthand for calling `iter()` once and then `next()` until `StopIteration`:

```python run=c10-protocol
items = [10, 20]
it = iter(items)
print(it is iter(it), next(it), next(it))
try:
    next(it)
except StopIteration:
    print("exhausted")
print(list(it), list(items))

it = iter(items)
for x in it:
    print("loop", x)
    break
print("resumed:", list(it))
```

Iterating the iterator again gives nothing, while the list can be iterated any number of times. Breaking out of a `for` loop leaves the iterator where it was, so a second loop over the same iterator continues.

:::trap
A function that loops over its argument twice works with a list and silently gets an empty second pass with a generator or file. If you need two passes, convert to a list first or use `itertools.tee`.
:::

## Generators {#ch10-generators .th}

A function containing `yield` is a **generator function**. Calling it runs no code; it returns a **generator object** holding a fresh frame. Each `next()` resumes the frame until the next `yield`, which hands a value out and suspends the frame again with all its locals and its instruction pointer intact.

```python run=c10-gen-state
import inspect

def countdown(n):
    print("started")
    while n > 0:
        yield n
        n -= 1
    print("finished")
    return "liftoff"

g = countdown(2)
print(inspect.getgeneratorstate(g))
print(next(g), inspect.getgeneratorstate(g), g.gi_frame.f_locals)
print(next(g))
try:
    next(g)
except StopIteration as stop:
    print("return value:", stop.value)
print(inspect.getgeneratorstate(g), g.gi_frame)
```

Nothing prints until the first `next`. When the function returns, the generator raises `StopIteration` carrying the return value, and its frame is released. Since 3.11 a suspended generator's frame lives inside the generator object itself, so creating one is cheap.

### Laziness

Because values are produced on demand, a pipeline of generators processes one item at a time and never builds the intermediate lists:

```python run=c10-lazy
import sys

def read_numbers(n):
    for i in range(n):
        yield i

squares_list = [x * x for x in range(1_000_000)]
squares_gen = (x * x for x in range(1_000_000))
print(sys.getsizeof(squares_list) > 8_000_000, sys.getsizeof(squares_gen) < 300)

pipeline = (x * x for x in read_numbers(10**12) if x % 3 == 0)
print([next(pipeline) for _ in range(4)])
```

A pipeline over a trillion numbers still answers instantly, because only four values are ever computed.

A generator expression evaluates its **first iterable immediately** (when the expression is created), and everything else lazily. That is why an error in the outermost iterable appears at once, while errors in the rest appear only when you iterate.

### send, throw and close

`yield` is an expression. `gen.send(value)` resumes the generator and makes the paused `yield` evaluate to `value`. The first resume must be `next(gen)` or `gen.send(None)`, to run up to the first `yield`.

```python run=c10-send
def running_average():
    total, count = 0.0, 0
    average = None
    while True:
        value = yield average
        total += value
        count += 1
        average = total / count

avg = running_average()
next(avg)                  # prime it
print(avg.send(10), avg.send(20), avg.send(60))
```

`gen.throw(exc)` raises an exception at the paused `yield`, and `gen.close()` throws `GeneratorExit` there, which lets `finally` blocks and `with` statements inside the generator clean up. Close is called automatically when a generator is garbage collected:

```python run=c10-close
def reader():
    print("open resource")
    try:
        while True:
            yield "line"
    finally:
        print("close resource")

r = reader()
print(next(r), next(r))
r.close()
print("--")
r2 = reader()
next(r2)
del r2
print("after del")
```

A generator must not yield after catching `GeneratorExit`; doing so raises `RuntimeError: generator ignored GeneratorExit`.

### PEP 479: StopIteration inside a generator

Before 3.7, a `StopIteration` that leaked out of code called inside a generator (for example an unguarded `next(it)`) silently ended the generator, hiding the bug. Since 3.7 it is converted into a `RuntimeError`:

```python run=c10-pep479
def firsts(iterables):
    for it in iterables:
        yield next(iter(it))

try:
    print(list(firsts([[1], [], [3]])))
except RuntimeError as e:
    print("RuntimeError:", e)
```

## yield from {#ch10-yieldfrom .th}

`yield from sub` delegates to another generator: every value `sub` yields passes straight to the caller, every `send` and `throw` is forwarded into `sub`, and when `sub` returns, its return value becomes the value of the `yield from` expression.

```python run=c10-yield-from
def tokens(line):
    for word in line.split():
        yield word
    return len(line.split())

def document(lines):
    total = 0
    for line in lines:
        total += yield from tokens(line)
    return total

g = document(["a b", "c d e"])
out = []
while True:
    try:
        out.append(next(g))
    except StopIteration as stop:
        print(out, "count =", stop.value)
        break

def flatten(xs):
    for x in xs:
        if isinstance(x, list):
            yield from flatten(x)
        else:
            yield x
print(list(flatten([1, [2, [3, [4]], 5]])))
```

`yield from` is what made generator-based coroutines possible before `async`/`await`, because a whole chain of generators could be suspended and resumed through the outermost one.

## Coroutines and async/await {#ch10-coroutines .th}

`async def` defines a **coroutine function**. Calling it returns a **coroutine object**, which is built on the same suspended-frame machinery as a generator. `await x` suspends the coroutine until `x` (another coroutine, a `Future` or any object with `__await__`) completes, in the way `yield from` would.

A coroutine does nothing by itself. Something must drive it by calling its `send` method, and that something is an **event loop**:

```python run=c10-coroutine-manual
import types

@types.coroutine
def suspend(tag):
    reply = yield tag          # hands control to whoever drives us
    return reply

async def worker():
    a = await suspend("need A")
    b = await suspend("need B")
    return a + b

coro = worker()
print(type(coro).__name__)
print(coro.send(None))
print(coro.send(10))
try:
    coro.send(5)
except StopIteration as stop:
    print("result:", stop.value)
```

The coroutine yields a request up through the `await` chain, the driver decides what to do and sends the answer back in. asyncio does exactly this: what reaches it are `Future` objects, and it resumes the coroutine when the future completes.

### The asyncio event loop

An asyncio program runs on **one thread**. The loop keeps:

- a queue of **ready** callbacks to run now;
- a heap of **scheduled** callbacks ordered by time (from `sleep`, timeouts);
- a **selector** (`epoll` on Linux, `kqueue` on macOS) watching sockets and pipes.

Each iteration it runs every ready callback, then waits in the selector until a socket is ready or the next timer is due, and moves the corresponding callbacks to the ready queue. A **Task** wraps a coroutine: its step function calls `coro.send(None)`, and when the coroutine awaits a pending future, the task adds a "wake me" callback to that future and returns to the loop.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 230" role="img" aria-label="The event loop runs ready callbacks, then blocks in the selector, then moves completed I/O and due timers back to the ready queue">
  <rect x="270" y="20" width="180" height="50" rx="10" class="d-acc"/><text x="360" y="42" text-anchor="middle" class="t-bold">ready queue</text><text x="360" y="60" text-anchor="middle" class="t-small">task steps, callbacks</text>
  <rect x="500" y="100" width="190" height="56" rx="10" class="d-key"/><text x="595" y="124" text-anchor="middle" class="t-bold">selector.select()</text><text x="595" y="142" text-anchor="middle" class="t-small">epoll: sockets, pipes</text>
  <rect x="30" y="100" width="190" height="56" rx="10" class="d-rs"/><text x="125" y="124" text-anchor="middle" class="t-bold">timer heap</text><text x="125" y="142" text-anchor="middle" class="t-small">sleep, timeouts</text>
  <rect x="270" y="170" width="180" height="50" rx="10" class="d-box"/><text x="360" y="192" text-anchor="middle" class="t-bold">task.step()</text><text x="360" y="210" text-anchor="middle" class="t-small">coro.send(None) until await</text>
  <path d="M450 45 C 560 45, 600 70, 595 100" class="d-line-acc"/><text x="560" y="64" class="t-small">queue empty: wait</text>
  <path d="M500 128 C 450 128, 420 100, 400 70" class="d-line-key"/><text x="430" y="104" class="t-small">fd ready</text>
  <path d="M220 128 C 270 128, 300 100, 320 70" class="d-line-trap"/><text x="232" y="104" class="t-small">timer due</text>
  <path d="M360 70 L 360 170" class="d-line"/><text x="368" y="122" class="t-small">run</text>
</svg></div><figcaption><b>One thread, cooperative.</b> A task runs until it awaits something that is not ready; only then can another task run. Anything that blocks without awaiting stops every task.</figcaption></figure>

```python run=c10-asyncio nondet
import asyncio, time

async def fetch(name, delay):
    print("start", name)
    await asyncio.sleep(delay)
    print("done", name)
    return name.upper()

async def main():
    t0 = time.perf_counter()
    results = await asyncio.gather(fetch("a", 0.2), fetch("b", 0.1), fetch("c", 0.15))
    elapsed = time.perf_counter() - t0
    print(results, "concurrent:", elapsed < 0.3)

asyncio.run(main())
```

All three start before any finishes, and the total time is about the longest delay, not the sum, because each `await asyncio.sleep` hands control back to the loop. `gather` returns results in argument order, not completion order.

### Blocking the loop

`time.sleep`, CPU-heavy loops, synchronous HTTP clients and most file APIs do not await, so they freeze the whole loop:

```python run=c10-blocking nondet
import asyncio, time

async def ticker(log):
    for _ in range(3):
        log.append(round(time.perf_counter() - START, 1))
        await asyncio.sleep(0.1)

async def bad():
    time.sleep(0.3)              # blocks the loop

async def good():
    await asyncio.to_thread(time.sleep, 0.3)

async def run(blocker):
    log = []
    await asyncio.gather(ticker(log), blocker())
    return log

START = time.perf_counter()
bad_log = asyncio.run(run(bad))
START = time.perf_counter()
good_log = asyncio.run(run(good))
print("blocked ticks delayed:", bad_log[1] >= 0.3, "| thread kept ticking:", good_log[1] < 0.2)
```

`asyncio.to_thread` (3.9+) runs a blocking function in a thread pool and gives the loop an awaitable for its result; `loop.run_in_executor` does the same with a chosen executor, including process pools for CPU work.

:::key
`async` gives concurrency, not parallelism. It is ideal for many slow I/O operations (thousands of sockets on one thread), useless for CPU-bound work, and every blocking call inside a coroutine is a bug.
:::

## Concept and tricky questions {#ch10-concept .dr}

:::drill concept
What is the difference between an iterable and an iterator?
---
**Answer.** An iterable has `__iter__` returning an iterator and can usually be iterated many times. An iterator has `__next__` (and `__iter__` returning itself), keeps its position, and is exhausted after one pass.

**Why.** `for` calls `iter()` on the iterable once. A list is iterable; `iter(list)` is an iterator; a generator is an iterator.
:::

:::drill concept
What happens when you call a generator function?
---
**Answer.** None of its body runs. It returns a generator object holding a new frame positioned at the start. The body runs only when `next()` or `send()` resumes it, up to the next `yield`.

**Why.** That is why argument validation in a generator function is delayed until the first `next`. Wrap the generator in a normal function that validates first and then returns the generator.
:::

:::drill concept
What do `send`, `throw` and `close` do to a suspended generator?
---
**Answer.** `send(v)` resumes it and makes the current `yield` expression return `v`. `throw(exc)` resumes it by raising `exc` at the `yield`. `close()` raises `GeneratorExit` at the `yield` so that `finally` blocks run; the generator must then finish without yielding again.

**Why.** These three methods are the whole interface an event loop needs to drive coroutines.
:::

:::drill tricky
Why does a `StopIteration` raised inside a generator become a `RuntimeError`?
---
**Answer.** PEP 479 (default since 3.7). Previously it silently terminated the generator as if it had returned, which hid bugs such as an unguarded `next()` on an empty iterator.

**Why.** To end a generator, `return`. To handle an empty iterator, use `next(it, default)` or catch `StopIteration` explicitly.
:::

:::drill concept
What does `yield from` do that a `for` loop with `yield` does not?
---
**Answer.** It forwards `send`, `throw` and `close` into the sub-generator, and it evaluates to the sub-generator's return value. A `for … yield` loop only passes values out.

**Why.** Full delegation is what let chains of generator-based coroutines be suspended as one unit, which `await` now does for native coroutines.
:::

:::drill tricky
Calling `fetch()` where `fetch` is an `async def` function seems to do nothing. Why, and what warning appears?
---
**Answer.** Calling a coroutine function only creates a coroutine object; nothing runs until it is awaited or wrapped in a task. When the unused coroutine is garbage collected, Python warns `RuntimeWarning: coroutine 'fetch' was never awaited`.

**Why.** Use `await fetch()` inside a coroutine, `asyncio.create_task(fetch())` to run it concurrently, or `asyncio.run(fetch())` at the top level.
:::

:::drill concept
Is asyncio parallel? When does a task give up control?
---
**Answer.** No. All tasks run on one thread, so only one runs at a time. A task gives up control only at an `await` on something that is not ready yet (a pending future, `asyncio.sleep`, I/O). Between awaits it runs uninterrupted.

**Why.** This makes many race conditions impossible between awaits, but one blocking call stalls everything.
:::

## Predict the output and find the bug {#ch10-reading .dr}

:::drill output
What does this print?

```python run=c10-d-twice
def numbers():
    yield 1
    yield 2

gen = numbers()
print(sum(gen), sum(gen))
nums = [1, 2]
print(sum(nums), sum(nums))
print(3 in (x for x in [1, 2, 3, 4]), list(x for x in range(3)))
```
---
**Answer.** `3 0`: the second `sum` gets an exhausted generator. The list sums to 3 twice. Membership on a generator consumes it until it finds the value.

**Why.** Generators are single-pass iterators. `in` on an iterator is a linear search that leaves the iterator positioned after the match.
:::

:::drill output
What does this print?

```python run=c10-d-lazy-eval
def gen():
    print("gen body starts")
    yield 1

g = gen()
print("created")
x = (i * 2 for i in [print("first iterable"), 1][1:])
print("genexp created")
print(next(g), list(x))
```
---
**Answer.** `created`, then `first iterable` (the outermost iterable of a generator expression is evaluated immediately), then `genexp created`, then `gen body starts` and `1 [2]`.

**Why.** A generator function runs nothing until `next`; a generator expression evaluates its first `for` clause's iterable at creation time.
:::

:::drill output
What does this print?

```python run=c10-d-send
def echo():
    received = []
    while True:
        x = yield len(received)
        if x is None:
            break
        received.append(x)
    return received

e = echo()
print(next(e), e.send("a"), e.send("b"))
try:
    e.send(None)
except StopIteration as s:
    print(s.value)
```
---
**Answer.** `0 1 2` then `['a', 'b']`. Priming yields 0; each `send` appends and yields the new length; sending `None` breaks the loop and the return value travels in `StopIteration.value`.

**Why.** The value of a `yield` expression is whatever the next `send` passes in; `next()` is `send(None)`.
:::

:::drill output
What does this print, and in what order?

```python run=c10-d-order
import asyncio

async def job(name, n):
    for i in range(n):
        print(name, i)
        await asyncio.sleep(0)
    return name

async def main():
    t = asyncio.create_task(job("A", 2))
    print("created")
    r = await job("B", 2)
    print("B done", await t)

asyncio.run(main())
```
---
**Answer.** `created`, `B 0`, `A 0`, `B 1`, `A 1`, `B done A`. Creating the task schedules it but does not run it; it first runs when `main` reaches its first `await` (inside `job("B")`). After that, every `sleep(0)` lets the other task take a step.

**Why.** `asyncio.sleep(0)` is the idiomatic "yield to the loop". Awaiting a coroutine directly (`await job("B", 2)`) runs it in the current task, without creating a new one.
:::

:::drill bug
This async crawler takes as long as the sum of the delays instead of the maximum. Why?

```python run=c10-d-bug-sequential nondet
import asyncio, time

async def fetch(delay):
    await asyncio.sleep(delay)
    return delay

async def crawl_slow(delays):
    return [await fetch(d) for d in delays]

async def crawl(delays):
    return await asyncio.gather(*(fetch(d) for d in delays))

for fn in (crawl_slow, crawl):
    t0 = time.perf_counter()
    asyncio.run(fn([0.1, 0.1, 0.1]))
    print(fn.__name__, round(time.perf_counter() - t0, 1))
```
---
**Answer.** `await` inside the list comprehension awaits each fetch before starting the next, so they run one after another. Start them all first, with `gather` or `create_task`, and then await the results.

**Why.** `await` means "wait for this to finish". Concurrency comes from having several tasks in flight, not from writing `async`.
:::

:::drill bug
A generator that reads a file leaks the file handle when the consumer stops early. Fix it.

```python run=c10-d-bug-leak
import os, tempfile

path = os.path.join(tempfile.mkdtemp(), "data.txt")
with open(path, "w") as f:
    f.write("a\nb\nc\n")

opened = []

def lines(p):
    with open(p) as fh:
        opened.append(fh)
        for line in fh:
            yield line.strip()

for line in lines(path):
    if line == "a":
        break
gen = lines(path)
next(gen)
gen.close()
print([fh.closed for fh in opened])
```
---
**Answer.** With a `with` block inside the generator (as above), the file closes when the generator is closed, either explicitly with `close()` or when it is garbage collected after the `break`. The buggy version used `fh = open(p)` without `with` or `try/finally`, so an early `break` left the file open until interpreter exit.

**Why.** `close()` raises `GeneratorExit` at the paused `yield`, which runs the `with` block's exit. In CPython the abandoned generator in the `for` loop is collected immediately; on other implementations call `close()` or use `contextlib.closing`.
:::

## Write the code {#ch10-coding .cd}

:::drill code rating=1300
Write `chunked(iterable, n)` that yields lists of up to `n` items from any iterable, lazily, including infinite iterators, then use it on `itertools.count()`.
---
```python run=c10-c-chunked
from itertools import islice, count

def chunked(iterable, n):
    if n < 1:
        raise ValueError("n must be >= 1")
    it = iter(iterable)
    while chunk := list(islice(it, n)):
        yield chunk

print(list(chunked(range(7), 3)))
inf = chunked(count(), 4)
print(next(inf), next(inf))
```

Calling `iter()` once is essential: `islice` on a list would restart from the beginning every time. Python 3.12 adds `itertools.batched`, which does the same and yields tuples.
:::

:::drill code rating=1500
Write a minimal round-robin scheduler for generator-based tasks: each task is a generator that yields to give up control. `run(tasks)` interleaves them until all finish and returns their return values.
---
```python run=c10-c-scheduler
from collections import deque

def run(tasks):
    queue = deque(enumerate(tasks))
    results = [None] * len(tasks)
    while queue:
        i, task = queue.popleft()
        try:
            next(task)
        except StopIteration as stop:
            results[i] = stop.value
        else:
            queue.append((i, task))
    return results

def worker(name, steps, log):
    for s in range(steps):
        log.append(f"{name}{s}")
        yield
    return f"{name} done"

log = []
print(run([worker("A", 3, log), worker("B", 1, log), worker("C", 2, log)]))
print(log)
```

This is the core of every cooperative scheduler, including asyncio: a queue of runnable tasks, each resumed until it voluntarily suspends. asyncio adds futures, timers and a selector to decide *when* a suspended task is ready again.
:::

:::drill code rating=1600
Write a tiny event loop that supports `await sleep(seconds)` for native `async def` coroutines, using a heap of wake-up times and the `types.coroutine` trick to yield the wake-up time to the loop. Run three coroutines with different sleeps and record the order they finish.
---
```python run=c10-c-loop
import heapq, time, types, itertools

@types.coroutine
def sleep(seconds):
    yield seconds

def run(*coros):
    clock = 0.0                      # simulated time, so the demo is instant
    seq = itertools.count()
    ready = [(0.0, next(seq), c) for c in coros]
    heapq.heapify(ready)
    finished = []
    while ready:
        when, _, coro = heapq.heappop(ready)
        clock = when
        try:
            delay = coro.send(None)
        except StopIteration as stop:
            finished.append((round(clock, 2), stop.value))
        else:
            heapq.heappush(ready, (clock + delay, next(seq), coro))
    return finished

async def task(name, *sleeps):
    for s in sleeps:
        await sleep(s)
    return name

print(run(task("slow", 0.5), task("fast", 0.1, 0.1), task("medium", 0.3)))
```

The sequence counter breaks ties so the heap never compares two coroutine objects. A real loop would also sleep in `selector.select(timeout)` until the next wake-up time instead of jumping the clock.
:::

:::drill code rating=1400
Write an async producer/consumer pipeline with `asyncio.Queue(maxsize=2)`: one producer puts 6 items, two consumers process them, and the program shuts down cleanly when all items are done using `queue.join()` and task cancellation.
---
```python run=c10-c-queue
import asyncio

async def producer(q):
    for i in range(6):
        await q.put(i)          # waits when the queue is full (back-pressure)

async def consumer(name, q, out):
    while True:
        item = await q.get()
        await asyncio.sleep(0.01)
        out.append((name, item))
        q.task_done()

async def main():
    q = asyncio.Queue(maxsize=2)
    out = []
    workers = [asyncio.create_task(consumer(n, q, out)) for n in ("c1", "c2")]
    await producer(q)
    await q.join()               # every item has been marked task_done
    for w in workers:
        w.cancel()
    await asyncio.gather(*workers, return_exceptions=True)
    return sorted(item for _, item in out), len({n for n, _ in out})

print(asyncio.run(main()))
```

`maxsize` gives back-pressure: a fast producer is suspended at `put` instead of filling memory. Cancelling raises `CancelledError` at the consumers' `await q.get()`, and `return_exceptions=True` collects those instead of raising.
:::

## Cheat sheet {#ch10-cheatsheet .th}

- Iterable: `__iter__` → iterator. Iterator: `__next__` + `__iter__` returning self; single pass. `for` = `iter()` once + `next()` until `StopIteration`.
- Generator function call runs nothing; returns a generator with its own frame. States: CREATED, RUNNING, SUSPENDED, CLOSED.
- `return v` in a generator → `StopIteration(v)`; PEP 479 turns leaked `StopIteration` into `RuntimeError`.
- `send(v)` sets the value of the paused `yield` (prime with `next`), `throw(exc)` raises there, `close()` raises `GeneratorExit` (runs `finally`).
- Genexps evaluate their first iterable eagerly. Generators save memory; pipelines compute only what is consumed.
- `yield from sub`: forwards values, `send`, `throw`, `close`; evaluates to `sub`'s return value.
- `async def` → coroutine object; nothing runs until awaited or wrapped in a task; "never awaited" warning.
- asyncio: one thread; ready queue + timer heap + selector; tasks step via `coro.send(None)` until awaiting a pending future.
- Concurrency needs several tasks (`gather`, `create_task`, `TaskGroup`); `await` in a loop is sequential.
- Never block the loop: use `await asyncio.sleep`, async libraries, `asyncio.to_thread` / `run_in_executor`.
