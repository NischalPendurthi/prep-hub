---
title: Concurrency and the GIL
part: Part E · Control flow and concurrency
lede: CPython's Global Interpreter Lock lets only one thread execute Python bytecode at a time, which simplifies the interpreter and makes single-threaded code fast, but stops pure-Python threads from using more than one core. This chapter explains what the GIL protects and what it does not, when threads switch, why `counter += 1` is still a race, when threads do run in parallel, how to choose between threads, processes and asyncio, and what changes with the free-threaded build.
desc: What the GIL protects, switch interval, races, I/O vs CPU, multiprocessing, locks, free-threaded 3.13+
hours: 3.5
prereqs: Chapters 3, 4 and 10
---

## What the GIL is {#ch11-gil .th}

The **GIL** is a single lock per interpreter. A thread must hold it to run Python bytecode or touch Python objects through the C API. It exists because CPython's internals, starting with reference counting, are not thread-safe: two threads doing `Py_INCREF` on the same object at once could lose an increment and free a live object. Rather than locking every object, CPython locks the whole interpreter.

Consequences:

- At any instant, at most one thread per interpreter is executing Python code.
- Single-threaded code pays no locking cost, and C extensions are easy to write correctly.
- Threads still help for **I/O-bound** work, because a thread releases the GIL while it waits in a system call.
- Threads do **not** speed up **CPU-bound** pure-Python code.

```python run=c11-cpu-threads nondet
import threading, time

def spin(n):
    total = 0
    for i in range(n):
        total += i

N = 3_000_000
t0 = time.perf_counter()
spin(N); spin(N)
sequential = time.perf_counter() - t0

t0 = time.perf_counter()
threads = [threading.Thread(target=spin, args=(N,)) for _ in range(2)]
for t in threads: t.start()
for t in threads: t.join()
threaded = time.perf_counter() - t0
print(f"sequential {sequential:.2f}s, two threads {threaded:.2f}s")
print("threads gave a 1.5x speed-up:", threaded * 1.5 < sequential)
```

On a 16-core machine the two threads take as long as running the work back to back, because they take turns holding the GIL.

## When threads switch {#ch11-switching .th}

A thread that holds the GIL keeps it until one of these happens:

1. It **blocks**: `time.sleep`, reading a socket or file, waiting on a lock, `select`. Blocking calls release the GIL around the system call.
2. A C extension **explicitly releases** it (`Py_BEGIN_ALLOW_THREADS`) for a long computation: `hashlib`, `zlib`, NumPy operations and many database drivers do this.
3. Another thread has been **waiting longer than the switch interval** (5 ms by default). The waiting thread sets a "drop request" flag; the running thread checks the interpreter's "eval breaker" between bytecode instructions (at backward jumps and calls), sees the flag, and hands the GIL over.

```python run=c11-switchinterval
import sys
print(sys.getswitchinterval())
sys.setswitchinterval(0.001)
print(sys.getswitchinterval())
```

So a thread switch can happen **between any two bytecode instructions** of Python code, but never in the middle of one instruction.

### Why counter += 1 is a race

`counter += 1` on a global is several instructions: load the global, load the constant, add, store the global. If the thread is switched out after the load and before the store, another thread's update is overwritten. Putting a blocking call in the gap makes the lost updates happen every time:

```python run=c11-race
import dis, threading, time

def bump():
    global counter
    counter += 1

print([i.opname for i in dis.get_instructions(bump)][1:])

counter = 0
def unsafe(n):
    global counter
    for _ in range(n):
        value = counter
        time.sleep(0)          # gives up the GIL between read and write
        counter = value + 1

lock = threading.Lock()
safe_counter = 0
def safe(n):
    global safe_counter
    for _ in range(n):
        with lock:
            value = safe_counter
            time.sleep(0)
            safe_counter = value + 1

for target in (unsafe, safe):
    threads = [threading.Thread(target=target, args=(200,)) for _ in range(4)]
    for t in threads: t.start()
    for t in threads: t.join()
print("unsafe lost updates:", counter < 800, "| locked:", safe_counter)
```

Without the `sleep(0)`, the race still exists; it just shows up rarely, whenever the 5 ms switch lands between the load and the store. Rare races are worse than frequent ones, because they pass tests.

:::trap
"The GIL makes my code thread-safe" is false. The GIL makes **individual bytecode instructions** atomic with respect to each other. Any read-modify-write sequence that spans several instructions, such as `x += 1`, `if key not in d: d[key] = …`, or `lst[i] = lst[i] + 1`, needs a lock.
:::

### What is effectively atomic

Operations that run as a single C call on a built-in type cannot be interrupted by another Python thread: `list.append`, `list.pop`, `dict[key] = value`, `dict.get`, `set.add`, `deque.append` and `popleft`. That is why `queue.Queue` and `collections.deque` are safe to share between threads. This is a CPython implementation detail, not a language guarantee; the free-threaded build keeps these operations safe with per-object locks.

```python run=c11-append
import threading

items = []
def add(n):
    for i in range(n):
        items.append(i)

threads = [threading.Thread(target=add, args=(10_000,)) for _ in range(8)]
for t in threads: t.start()
for t in threads: t.join()
print(len(items))
```

No appends are lost, even without a lock.

## When threads do run in parallel {#ch11-parallel .th}

Threads overlap whenever the GIL is released:

- **Waiting on I/O.** A web scraper with 50 threads waits on 50 sockets at once.
- **C code that releases the GIL.** Hashing, compression, NumPy, image processing and `time.sleep` itself.

```python run=c11-hashlib nondet
import hashlib, threading, time

data = b"x" * 50_000_000

def digest():
    hashlib.sha256(data).digest()

t0 = time.perf_counter()
for _ in range(4):
    digest()
sequential = time.perf_counter() - t0

t0 = time.perf_counter()
threads = [threading.Thread(target=digest) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
threaded = time.perf_counter() - t0
print(f"sequential {sequential:.2f}s, 4 threads {threaded:.2f}s")
print("real parallel speed-up:", threaded * 2 < sequential)
```

`hashlib` releases the GIL while hashing large buffers, so four threads use four cores.

### Processes

For CPU-bound pure-Python work, use **processes**: each has its own interpreter, its own GIL and its own memory. `multiprocessing` and `concurrent.futures.ProcessPoolExecutor` send work and results between processes by **pickling** them, which costs time and requires picklable functions and arguments (no lambdas or local functions with the `spawn` start method).

```python run=c11-processes nondet
import time
from concurrent.futures import ProcessPoolExecutor

def spin(n):
    total = 0
    for i in range(n):
        total += i
    return total

if __name__ == "__main__":
    N = 3_000_000
    t0 = time.perf_counter()
    expected = [spin(N) for _ in range(4)]
    sequential = time.perf_counter() - t0
    t0 = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(spin, [N] * 4))
    parallel = time.perf_counter() - t0
    print(results == expected, f"sequential {sequential:.2f}s, 4 processes {parallel:.2f}s")
```

The `if __name__ == "__main__":` guard is required with the `spawn` and `forkserver` start methods (the default on macOS and Windows, and on Linux from 3.14), because each worker re-imports the main module.

| Workload | Use | Why |
|---|---|---|
| Many slow network or disk operations | `asyncio`, or threads | Waiting releases the GIL; asyncio scales to thousands of connections on one thread |
| Blocking libraries without async support | `ThreadPoolExecutor` | Simple, shares memory |
| CPU-bound pure Python | `ProcessPoolExecutor`, `multiprocessing` | One GIL per process |
| CPU-bound NumPy / hashing / compression | Threads | The C code releases the GIL |

## Synchronisation tools {#ch11-sync .th}

- `threading.Lock`: mutual exclusion; not re-entrant (acquiring it twice in the same thread deadlocks).
- `threading.RLock`: re-entrant; the owner can acquire it again, and must release it the same number of times.
- `threading.Condition`: wait for a predicate under a lock (`wait_for`), with `notify` / `notify_all`.
- `threading.Semaphore(n)`: allow at most n holders; `BoundedSemaphore` catches extra releases.
- `threading.Event`: a flag threads can wait on.
- `queue.Queue`: a thread-safe FIFO with blocking `get`/`put`, `maxsize` for back-pressure, and `task_done`/`join`.

```python run=c11-rlock
import threading

lock = threading.Lock()
rlock = threading.RLock()

def nested(l):
    with l:
        return l.acquire(timeout=0.1)

print("Lock re-acquired:", nested(lock))
print("RLock re-acquired:", nested(rlock))
rlock.release()
```

A plain `Lock` simply blocks (here until the timeout) when the holder tries to take it again; with no timeout that is a self-deadlock.

### Deadlock

Two threads that take two locks in opposite orders can each hold one and wait forever for the other. The standard prevention is a **global lock order**: always acquire locks in the same order, for example sorted by id. Timeouts (`lock.acquire(timeout=…)`) detect it but do not prevent it.

## Beyond the GIL {#ch11-future .th}

### Per-interpreter GIL (3.12)

PEP 684 gave each **sub-interpreter** its own GIL. Sub-interpreters in one process can run Python code in parallel, but they share no objects; they communicate by copying data, much like processes but with cheaper start-up. 3.14 exposes them in the standard library as `concurrent.interpreters` (PEP 734).

### Free-threaded CPython (3.13+)

PEP 703 added an optional build without the GIL (`python3.13t`), experimental in 3.13 and officially supported (still optional) from 3.14. Making it safe required:

- **Biased reference counting**: each object has a fast, non-atomic count for its owning thread and an atomic count for others.
- **Immortal objects** (Chapter 1) and **deferred reference counting** for objects that are shared heavily, such as functions and modules.
- **Per-object locks** inside built-in containers, so `list.append` and `dict` updates stay safe.
- **mimalloc** as the allocator, which supports the thread-safe lookups the new design needs.

Single-threaded code runs somewhat slower on the free-threaded build, and C extensions must be rebuilt and declare that they are safe without the GIL. The rule from this chapter does not change: compound operations such as `counter += 1` still need a lock. With the GIL gone they fail far more often.

:::key
In an interview, separate the three ideas: the **GIL** (one bytecode-running thread per interpreter in the default build), **thread safety** (your read-modify-write sequences, which always need locks), and **parallelism** (processes, GIL-releasing C code, sub-interpreters or the free-threaded build).
:::

## Concept and tricky questions {#ch11-concept .dr}

:::drill concept
What does the GIL protect, and why did CPython choose one global lock?
---
**Answer.** It protects the interpreter's internal state, most importantly reference counts and the internals of built-in objects, from concurrent modification. One lock makes single-threaded code fast (no per-object locking) and C extensions simpler to write.

**Why.** Fine-grained locking was tried (the "free-threading" patch of 1999) and made single-threaded code much slower; PEP 703 succeeded only with biased refcounting and other new techniques.
:::

:::drill concept
When does a thread release the GIL?
---
**Answer.** When it makes a blocking system call (I/O, sleep, lock waits), when a C extension releases it explicitly around long computations, and when another thread has waited longer than the switch interval (5 ms), detected at the eval breaker between bytecodes.

**Why.** That is why I/O-bound threading works well and CPU-bound pure-Python threading does not.
:::

:::drill tricky
`counter += 1` is a single line. Why is it not thread-safe in CPython?
---
**Answer.** It compiles to several bytecodes (load, add, store). A thread switch can occur between the load and the store, and the other thread's update is then lost.

**Why.** The GIL only guarantees that each bytecode runs without interruption. Protect the whole sequence with a `Lock`, or use a thread-safe structure.
:::

:::drill concept
Your service computes SHA-256 hashes of large uploads in a thread pool. Will more threads help on a multi-core machine?
---
**Answer.** Yes. `hashlib` releases the GIL while hashing data larger than a small threshold, so several threads hash in parallel on different cores.

**Why.** "Threads don't help with CPU work" applies to pure-Python code. Check whether the C library you call releases the GIL.
:::

:::drill concept
Why must multiprocessing code use the `if __name__ == "__main__":` guard on macOS and Windows?
---
**Answer.** Those platforms start workers with `spawn`, which launches a fresh interpreter that imports the main module to find the target function. Without the guard, each child would run the pool-creating code again and spawn its own children, recursively.

**Why.** Linux used `fork` by default, which copies the parent instead of re-importing, but 3.14 switches the Linux default to `forkserver` because `fork` is unsafe when the parent has threads. Always write the guard.
:::

:::drill tricky
Is `dict[key] = value` from many threads safe in CPython without a lock? Is `if key not in d: d[key] = make()` safe?
---
**Answer.** The single assignment is safe because it is one C-level operation under the GIL. The check-then-set is not: two threads can both see the key missing and both call `make()`, and one result overwrites the other.

**Why.** Use `d.setdefault(key, value)` (a single call) when the value is cheap, or a lock around the check and the creation.
:::

:::drill concept
What changes, and what does not, in the free-threaded build?
---
**Answer.** Python threads can run bytecode in parallel on several cores. Built-in containers keep their individual operations safe using per-object locks, and refcounting uses biased counting. What does not change: compound operations still need locks, and extensions must be built for it.

**Why.** Code that was "accidentally safe" under the GIL (rare race windows) will fail much more often without it.
:::

## Predict the output and find the bug {#ch11-reading .dr}

:::drill output
What does this print?

```python run=c11-d-daemon
import threading, time

done = []
def work():
    time.sleep(0.05)
    done.append("worker")

t = threading.Thread(target=work)
t.start()
print("main continues", done)
t.join()
print("after join", done)
```
---
**Answer.** `main continues []`, then `after join ['worker']`. `start()` returns immediately; `join()` waits for the thread to finish.

**Why.** A non-daemon thread keeps the process alive until it ends; a daemon thread (`daemon=True`) is killed abruptly when the main thread exits.
:::

:::drill output
What does this print?

```python run=c11-d-executor
from concurrent.futures import ThreadPoolExecutor

def risky(x):
    if x == 2:
        raise ValueError(f"bad {x}")
    return x * 10

with ThreadPoolExecutor(max_workers=2) as pool:
    futures = [pool.submit(risky, i) for i in range(4)]
    results = []
    for f in futures:
        try:
            results.append(f.result())
        except ValueError as e:
            results.append(str(e))
print(results)
```
---
**Answer.** `[0, 10, 'bad 2', 30]`. An exception raised in a worker is stored in its future and re-raised when you call `result()`.

**Why.** If you never call `result()` (or check `exception()`), errors in worker threads vanish silently. `pool.map` re-raises the first error while iterating.
:::

:::drill output
What does this print?

```python run=c11-d-condition
import threading

items = []
cond = threading.Condition()

def consumer(out):
    with cond:
        cond.wait_for(lambda: len(items) >= 3)
        out.append(list(items))

out = []
c = threading.Thread(target=consumer, args=(out,))
c.start()
for i in range(5):
    with cond:
        items.append(i)
        cond.notify_all()
c.join()
print(len(out[0]) >= 3, out[0][:3])
```
---
**Answer.** `True [0, 1, 2]`. The consumer sleeps until the predicate holds; it wakes after at least three items are added (possibly more, depending on scheduling).

**Why.** `wait_for` re-checks the predicate in a loop, which also handles spurious wake-ups. Always wait for a condition, never for a single notification.
:::

:::drill bug
Two threads transfer money between accounts and the program sometimes hangs. Find the bug and fix it.

```python run=c11-d-bug-deadlock
import threading

class Account:
    def __init__(self, name, balance):
        self.name, self.balance = name, balance
        self.lock = threading.Lock()

def transfer(src, dst, amount):
    first, second = sorted((src, dst), key=lambda a: a.name)
    with first.lock:
        with second.lock:
            src.balance -= amount
            dst.balance += amount

a, b = Account("a", 100), Account("b", 100)
threads = [threading.Thread(target=transfer, args=(a, b, 1)) for _ in range(50)]
threads += [threading.Thread(target=transfer, args=(b, a, 1)) for _ in range(50)]
for t in threads: t.start()
for t in threads: t.join()
print(a.balance, b.balance)
```
---
**Answer.** The original locked `src.lock` then `dst.lock`. A transfer a→b and one b→a could each take their first lock and wait forever for the second. The fix above always locks in a global order (sorted by name), so no cycle of waiting can form.

**Why.** Deadlock needs a cycle in the "waits for" graph; a total lock order makes cycles impossible.
:::

:::drill bug
A lazily created shared client is sometimes created twice under load. Fix it.

```python run=c11-d-bug-lazy
import threading, time

_client = None
_created = 0
_lock = threading.Lock()

def get_client():
    global _client, _created
    if _client is None:
        with _lock:
            if _client is None:
                time.sleep(0.01)
                _created += 1
                _client = object()
    return _client

threads = [threading.Thread(target=get_client) for _ in range(10)]
for t in threads: t.start()
for t in threads: t.join()
print("clients created:", _created)
```
---
**Answer.** The original checked `if _client is None` and created the client without a lock, so several threads passed the check during the slow creation. The fix takes a lock and checks **again** inside it (double-checked locking), so exactly one client is created.

**Why.** The first, unlocked check avoids taking the lock on every call once the client exists. `functools.cache` on a zero-argument function is *not* a safe alternative: it can call the function more than once under concurrency.
:::

## Write the code {#ch11-coding .cd}

:::drill code rating=1400
Write a thread-safe `BoundedBuffer(capacity)` with blocking `put` and `get`, using one lock and two `Condition`s (not `queue.Queue`). Test it with two producers and two consumers.
---
```python run=c11-c-buffer
import threading
from collections import deque

class BoundedBuffer:
    def __init__(self, capacity):
        self.items = deque()
        self.capacity = capacity
        lock = threading.Lock()
        self.not_full = threading.Condition(lock)
        self.not_empty = threading.Condition(lock)

    def put(self, item):
        with self.not_full:
            self.not_full.wait_for(lambda: len(self.items) < self.capacity)
            self.items.append(item)
            self.not_empty.notify()

    def get(self):
        with self.not_empty:
            self.not_empty.wait_for(lambda: self.items)
            item = self.items.popleft()
            self.not_full.notify()
            return item

buf = BoundedBuffer(3)
received = []
recv_lock = threading.Lock()

def producer(start):
    for i in range(start, start + 50):
        buf.put(i)

def consumer():
    for _ in range(50):
        x = buf.get()
        with recv_lock:
            received.append(x)

threads = [threading.Thread(target=producer, args=(s,)) for s in (0, 100)]
threads += [threading.Thread(target=consumer) for _ in range(2)]
for t in threads: t.start()
for t in threads: t.join()
print(len(received), sorted(received) == list(range(50)) + list(range(100, 150)))
```

Both conditions share one lock, so a single critical section protects the deque, and each side wakes only the threads that can make progress.
:::

:::drill code rating=1300
Write a `RateLimiter(rate, per)` usable from many threads: `acquire()` blocks until a call is allowed, allowing at most `rate` calls per `per` seconds (a token bucket). Show that 10 calls at 50 per second take about 0.2 seconds after the initial burst.
---
```python run=c11-c-ratelimit nondet
import threading, time

class RateLimiter:
    def __init__(self, rate, per):
        self.capacity = rate
        self.tokens = float(rate)
        self.fill_rate = rate / per
        self.updated = time.monotonic()
        self.lock = threading.Lock()

    def acquire(self):
        while True:
            with self.lock:
                now = time.monotonic()
                self.tokens = min(self.capacity, self.tokens + (now - self.updated) * self.fill_rate)
                self.updated = now
                if self.tokens >= 1:
                    self.tokens -= 1
                    return
                wait = (1 - self.tokens) / self.fill_rate
            time.sleep(wait)

limiter = RateLimiter(rate=5, per=0.1)
t0 = time.perf_counter()
threads = [threading.Thread(target=limiter.acquire) for _ in range(15)]
for t in threads: t.start()
for t in threads: t.join()
print(f"15 calls with a burst of 5 at 50/s took {time.perf_counter() - t0:.2f}s")
```

The first 5 calls use the full bucket; the other 10 are released at 50 per second, about 0.2 s. Sleeping **outside** the lock lets other threads refill and check.
:::

:::drill code rating=1500
Write `parallel_map(fn, items, workers)` that uses processes for CPU-bound work, keeps results in input order, and processes items in chunks to reduce pickling overhead. Compare one call with `chunksize=1` and one with a larger chunk size.
---
```python run=c11-c-pmap nondet
import time
from concurrent.futures import ProcessPoolExecutor

def square(x):
    return x * x

def parallel_map(fn, items, workers=4, chunksize=None):
    items = list(items)
    if chunksize is None:
        chunksize = max(1, len(items) // (workers * 4))
    with ProcessPoolExecutor(max_workers=workers) as pool:
        return list(pool.map(fn, items, chunksize=chunksize))

if __name__ == "__main__":
    data = range(4_000)
    for cs in (1, None):
        t0 = time.perf_counter()
        out = parallel_map(square, data, chunksize=cs)
        print(f"chunksize={cs}: {time.perf_counter() - t0:.2f}s, correct={out == [x * x for x in data]}")
```

With `chunksize=1`, each tiny task pays a full round trip of pickling and inter-process messaging; chunking sends batches and is several times faster. For work this small, a plain loop in one process beats both, which is the real lesson: parallelism only pays off when each task is much more expensive than sending it.
:::

:::drill code rating=1200
Use a `ThreadPoolExecutor` to "download" 20 URLs (simulated with `time.sleep(0.05)`), with at most 5 in flight, collecting results as they complete with `as_completed`, and print the total time.
---
```python run=c11-c-download nondet
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def download(url):
    time.sleep(0.05)
    return url, len(url)

urls = [f"https://example.com/page/{i}" for i in range(20)]
t0 = time.perf_counter()
sizes = {}
with ThreadPoolExecutor(max_workers=5) as pool:
    futures = {pool.submit(download, u): u for u in urls}
    for fut in as_completed(futures):
        url, size = fut.result()
        sizes[url] = size
print(len(sizes), f"{time.perf_counter() - t0:.2f}s for 20 x 50 ms with 5 workers")
```

20 waits of 50 ms in 4 rounds of 5 take about 0.2 s instead of 1 s: `sleep`, like a socket read, releases the GIL. `as_completed` yields futures in completion order, so slow downloads do not hold up processing of fast ones.
:::

## Cheat sheet {#ch11-cheatsheet .th}

- GIL: one lock per interpreter; one thread runs bytecode at a time; protects refcounts and object internals.
- Released on blocking I/O, `sleep`, lock waits, and by C code (`hashlib`, `zlib`, NumPy). Forced switch after `sys.getswitchinterval()` = 5 ms, checked between bytecodes.
- Single C-level operations on built-ins (`append`, `dict[k] = v`, `deque.popleft`) are atomic; multi-bytecode sequences (`x += 1`, check-then-set) are races.
- I/O-bound: threads or asyncio. CPU-bound pure Python: processes. CPU-bound in GIL-releasing C: threads.
- Processes pickle arguments and results; guard with `if __name__ == "__main__":`; use `chunksize` for many small tasks.
- `Lock` (not re-entrant), `RLock`, `Condition.wait_for`, `Semaphore`, `Event`, `queue.Queue`. Prevent deadlock with a global lock order.
- Exceptions in executor tasks surface only via `future.result()`.
- 3.12: per-interpreter GIL (PEP 684). 3.13: optional free-threaded build (PEP 703), officially supported from 3.14: biased refcounting, per-object locks, mimalloc. Locks are still needed.
