/* Python — Memory, GIL & Concurrency */
window.QUESTIONS.push(
  {
    id: "py-memory-001", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "easy", type: "concept",
    question: "What is CPython's primary mechanism for freeing memory?",
    options: ["Manual free() calls by the programmer", "The operating system reclaims each object individually", "A garbage collector that runs only when the program exits", "Reference counting: an object is freed as soon as its reference count drops to zero, with a cyclic garbage collector as backup"],
    answer: 3,
    explanation: "Every CPython object stores a count of references to it. When the count reaches zero, the object is deallocated immediately. Reference counting can't reclaim cycles (objects referring to each other), so the `gc` module's generational cyclic collector periodically finds and frees unreachable cycles.",
    optionExplanations: ["Python manages memory automatically.", "The interpreter manages its private heap; the OS isn't involved per object.", "Collection happens continuously during execution.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-memory-002", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2]\nb = a\ndel a\nprint(b)",
    options: ["NameError", "[]", "[1, 2]", "None"],
    answer: 2,
    explanation: "`del a` removes the NAME a (decrementing the list's reference count), not the object. The list is still referenced by b, so it stays alive and unchanged.",
    optionExplanations: ["b is still defined.", "del doesn't empty the list.", "Correct.", "b still refers to the list."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-memory-003", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "easy", type: "concept",
    question: "What is the Global Interpreter Lock (GIL) in CPython?",
    options: ["A lock that prevents two Python programs from running at the same time", "A lock that each function must acquire before running", "A security feature that encrypts global variables", "A mutex that allows only one thread at a time to execute Python bytecode within a process"],
    answer: 3,
    explanation: "The GIL protects CPython's internals (notably reference counts) from concurrent modification. As a result, threads in one process can't run Python bytecode in parallel on multiple cores, though they can overlap while waiting on I/O. Separate processes each have their own GIL.",
    optionExplanations: ["Separate processes aren't affected by each other's GIL.", "It's a single process-wide lock, not per-function.", "It's about thread safety, not encryption.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-memory-004", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "easy", type: "concept",
    question: "For a CPU-bound task (e.g. resizing thousands of images in pure Python) on a standard CPython build, which approach gives real multi-core speedup?",
    options: ["threading", "asyncio", "multiprocessing (or ProcessPoolExecutor)", "Adding more `await` statements"],
    answer: 2,
    explanation: "Because of the GIL, threads can't execute Python bytecode in parallel, so CPU-bound threads give no speedup. Multiple processes each have their own interpreter and GIL and can use all cores. Threads and asyncio shine for I/O-bound work.",
    optionExplanations: ["The GIL serialises CPU-bound Python threads.", "asyncio is single-threaded concurrency for I/O.", "Correct.", "await doesn't add parallelism."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-memory-005", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "easy", type: "concept",
    question: "Which best describes asyncio?",
    options: ["Runs each coroutine on its own CPU core", "Single-threaded cooperative multitasking: an event loop switches between coroutines at `await` points while they wait for I/O", "A replacement for the GIL", "A library for parallel numeric computation"],
    answer: 1,
    explanation: "asyncio runs coroutines on one thread. A coroutine voluntarily yields control at each await (e.g. waiting for a socket), letting the event loop run others. It handles thousands of concurrent I/O operations cheaply but doesn't speed up CPU-bound code.",
    optionExplanations: ["It's single-threaded by default.", "Correct.", "It doesn't change the GIL.", "That's numpy/multiprocessing territory."]
  },
  {
    id: "py-memory-006", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import sys\nx = []\nbefore = sys.getrefcount(x)\ny = x\nz = [x, x]\nprint(sys.getrefcount(x) - before)",
    options: ["1", "2", "3", "0"],
    answer: 2,
    explanation: "Each new reference increments the count: the name y adds 1, and the list z holds two references to x, adding 2 more. Comparing differences cancels out the temporary reference created by passing x to getrefcount itself.",
    optionExplanations: ["z adds two references too.", "Each slot in z is a separate reference.", "Correct: y + two list slots = 3.", "References were added."]
  },
  {
    id: "py-memory-007", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "concept",
    question: "After `a = []; a.append(a); del a`, how is the list's memory reclaimed in CPython?",
    options: ["Immediately by reference counting", "It's never reclaimed (a permanent leak)", "By the cyclic garbage collector, because the list references itself and its refcount never reaches zero", "Only when the program exits"],
    answer: 2,
    explanation: "The list contains a reference to itself, so after `del a` its reference count is still 1 even though nothing can reach it. Reference counting alone can't free it; the gc module's cycle detector finds such unreachable groups and frees them (automatically, or via gc.collect()).",
    optionExplanations: ["The self-reference keeps the count above zero.", "The cyclic GC handles it.", "Correct.", "The cycle collector runs periodically during execution."]
  },
  {
    id: "py-memory-008", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "code-output",
    question: "What is the output in CPython?",
    code: "import weakref\n\nclass A:\n    pass\n\na = A()\nr = weakref.ref(a)\nprint(r() is a, end=' ')\ndel a\nprint(r())",
    options: ["True None", "True <A object>", "False None", "TypeError"],
    answer: 0,
    explanation: "A weak reference doesn't increase the reference count. While a strong reference exists, calling the weakref returns the object. After `del a`, the count drops to zero, the object is freed, and the weakref returns None. Weakrefs are used for caches and observers that shouldn't keep objects alive.",
    optionExplanations: ["Correct.", "The weakref doesn't keep the object alive.", "Before deletion, r() returns the same object.", "Instances of normal classes support weak references."]
  },
  {
    id: "py-memory-009", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "concept",
    question: "Two threads each run a pure-Python loop doing heavy arithmetic. On standard CPython, compared with running the two loops sequentially in one thread, the threaded version is typically:",
    options: ["About 2× faster", "Infinitely faster thanks to async I/O", "About the same speed or slightly slower, because only one thread runs bytecode at a time and they contend for the GIL", "Impossible: CPython doesn't allow two threads"],
    answer: 2,
    explanation: "With the GIL, CPU-bound threads take turns rather than running in parallel; the switching overhead can even make it slightly slower. Libraries written in C (numpy, hashlib, zlib) can release the GIL during heavy work, and the free-threaded build (3.13+) removes this limitation.",
    optionExplanations: ["Parallel speedup needs separate processes or GIL-free code.", "Async doesn't help CPU-bound work.", "Correct.", "CPython supports threads; they just don't run bytecode in parallel."]
  },
  {
    id: "py-memory-010", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "concept",
    question: "Why do threads still help for downloading 100 web pages in CPython despite the GIL?",
    options: ["Blocking I/O calls release the GIL while waiting, so other threads can run during that time", "Network I/O doesn't need the CPU at all", "The GIL is disabled for network code", "Each thread gets its own interpreter"],
    answer: 0,
    explanation: "Socket reads, file I/O and time.sleep release the GIL while the thread blocks in the operating system, so other threads proceed. Most time in downloading is waiting, so threads overlap those waits efficiently. asyncio achieves the same overlap with a single thread.",
    optionExplanations: ["Correct.", "Some CPU is used; the point is that waiting releases the GIL.", "The GIL isn't disabled; it's released during blocking calls.", "Threads share one interpreter (subinterpreters are a separate feature)."]
  },
  {
    id: "py-memory-011", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "concept",
    question: "Two threads each execute `counter += 1` 1,000,000 times on a shared global without a lock. Which statement is true?",
    options: ["The result is always exactly 2,000,000 because of the GIL", "The result can be less than 2,000,000: `counter += 1` is several bytecode steps (load, add, store), and a thread switch between them loses updates", "Python raises a RaceConditionError", "The result is always 1,000,000"],
    answer: 1,
    explanation: "The GIL makes individual bytecode instructions atomic, not compound operations. A thread can be preempted after loading the old value and before storing the new one, so another thread's increment gets overwritten. Protect shared state with `threading.Lock` (e.g. `with lock: counter += 1`).",
    optionExplanations: ["The GIL doesn't make read-modify-write sequences atomic.", "Correct.", "Python doesn't detect races.", "Some increments are lost, not exactly half."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-memory-012", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "import threading\n\ndef work():\n    print('worker', end=' ')\n\nt = threading.Thread(target=work)\nt.start()\nt.join()\nprint('main')",
    options: ["main worker", "worker", "main", "worker main"],
    answer: 3,
    explanation: "`start()` launches the thread and `join()` blocks the main thread until the worker finishes. So 'worker' is guaranteed to be printed before 'main'. Without join, the order wouldn't be guaranteed.",
    optionExplanations: ["join() makes main wait for the worker.", "main prints after join returns.", "The worker runs and prints.", "Correct."]
  },
  {
    id: "py-memory-013", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "concept",
    question: "What happens to a thread created with `daemon=True` when the main program finishes?",
    options: ["It is abruptly stopped when the interpreter exits, without cleanup", "The program waits for it to finish", "It becomes a separate process", "It raises an exception in the main thread"],
    answer: 0,
    explanation: "The interpreter waits for all non-daemon threads before exiting, but daemon threads are killed at shutdown wherever they are (finally blocks and context managers may not run). Use them for background helpers whose work can be safely abandoned.",
    optionExplanations: ["Correct.", "That's the behaviour for non-daemon threads.", "Threads never turn into processes.", "No exception is raised."]
  },
  {
    id: "py-memory-014", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import multiprocessing as mp\n\ncounter = 0\n\ndef inc():\n    global counter\n    counter += 1\n\nif __name__ == '__main__':\n    p = mp.Process(target=inc)\n    p.start()\n    p.join()\n    print(counter)",
    options: ["1", "2", "0", "RuntimeError"],
    answer: 2,
    explanation: "A child process has its OWN memory space (a copy of the parent's state). It increments its own counter, which disappears when it exits; the parent's counter is still 0. Share data across processes with Queue, Pipe, Value/Array or a Manager.",
    optionExplanations: ["The increment happened in the child's memory, not the parent's.", "Only one increment ran, in the child.", "Correct.", "This is a normal Process usage."],
    tags: ["trap"]
  },
  {
    id: "py-memory-015", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from multiprocessing import Pool\n\ndef square(x):\n    return x * x\n\nif __name__ == '__main__':\n    with Pool(2) as pool:\n        print(pool.map(square, [3, 1, 2]))",
    options: ["[1, 4, 9]", "[9, 1, 4]", "The order varies between runs", "PicklingError"],
    answer: 1,
    explanation: "Pool.map distributes items across worker processes but returns results in the SAME ORDER as the input, regardless of which worker finishes first. (imap_unordered gives completion order.) Top-level functions can be pickled and sent to workers.",
    optionExplanations: ["map doesn't sort; it preserves input order.", "Correct.", "map preserves input order.", "Module-level functions are picklable."]
  },
  {
    id: "py-memory-016", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "import asyncio\n\nasync def main():\n    print('a', end=' ')\n    await asyncio.sleep(0)\n    print('b')\n\nasyncio.run(main())",
    options: ["a b", "b a", "a", "Nothing; coroutines don't run"],
    answer: 0,
    explanation: "`asyncio.run()` creates an event loop, runs the coroutine to completion and closes the loop. `await asyncio.sleep(0)` yields control to the loop once and then continues.",
    optionExplanations: ["Correct.", "Code runs top to bottom within a coroutine.", "The coroutine continues after the await.", "asyncio.run executes the coroutine."]
  },
  {
    id: "py-memory-017", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import asyncio\n\nasync def f(x, delay):\n    await asyncio.sleep(delay)\n    return x\n\nasync def main():\n    print(await asyncio.gather(f(1, 0.2), f(2, 0.1)))\n\nasyncio.run(main())",
    options: ["[2, 1]", "[1, 2]", "(1, 2)", "The order is random"],
    answer: 1,
    explanation: "gather runs the coroutines concurrently and returns their results as a list in the order the awaitables were PASSED, not the order they finished. f(2, ...) finishes first, but its result is still placed second.",
    optionExplanations: ["Results follow argument order, not completion order.", "Correct.", "gather returns a list.", "The result order is deterministic."]
  },
  {
    id: "py-memory-018", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "numerical",
    question: "Each call `fetch()` does `await asyncio.sleep(1)`. Approximately how long does `await asyncio.gather(fetch(), fetch(), fetch())` take, compared with three sequential `await fetch()` calls?",
    options: ["3 s vs 3 s", "1 s vs 1 s", "1 s vs 3 s", "0.33 s vs 1 s"],
    answer: 2,
    explanation: "gather schedules all three coroutines at once; their 1-second waits overlap on the event loop, so the total is about max(1, 1, 1) = 1 s. Awaiting them one after another adds the waits: 1 + 1 + 1 = 3 s.",
    optionExplanations: ["gather overlaps the waits.", "Sequential awaits don't overlap.", "Correct.", "Each wait still takes a full second."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-memory-019", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "async def f():\n    return 1\n\nx = f()\nprint(type(x).__name__)\nx.close()",
    options: ["int", "generator", "function", "coroutine"],
    answer: 3,
    explanation: "Calling an `async def` function doesn't run its body; it creates a coroutine object that must be awaited (or scheduled with asyncio.run / create_task). Forgetting to await produces a 'coroutine was never awaited' RuntimeWarning and the code silently never runs.",
    optionExplanations: ["The body never ran, so there's no return value yet.", "Coroutines are a distinct type.", "x is the result of calling f.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-memory-020", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "hard", type: "numerical",
    question: "Two coroutines each call `time.sleep(1)` (not `asyncio.sleep`) and are run with `asyncio.gather`. Approximately how long does the gather take?",
    options: ["1 s", "It raises RuntimeError", "0 s", "2 s"],
    answer: 3,
    explanation: "`time.sleep` is a BLOCKING call: it freezes the whole thread, including the event loop, and has no await point. The second coroutine can't start until the first finishes, so the total is about 2 s. Use `await asyncio.sleep()` or run blocking code in a thread (`asyncio.to_thread`).",
    optionExplanations: ["Blocking calls can't overlap on a single-threaded event loop.", "It runs; it's just slow.", "Each sleep really blocks for 1 s.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-memory-021", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "import asyncio\n\nasync def task(name):\n    print(name, 1, end=' | ')\n    await asyncio.sleep(0)\n    print(name, 2, end=' | ')\n\nasync def main():\n    await asyncio.gather(task('A'), task('B'))\n\nasyncio.run(main())",
    options: ["A 1 | A 2 | B 1 | B 2 |", "A 1 | B 1 | B 2 | A 2 |", "B 1 | A 1 | B 2 | A 2 |", "A 1 | B 1 | A 2 | B 2 |"],
    answer: 3,
    explanation: "gather wraps both coroutines in tasks scheduled in order. A runs until its first await, then B runs until its await; then the loop resumes A, then B. Coroutines only switch at await points, so the interleaving is deterministic here.",
    optionExplanations: ["A yields at its await, letting B start.", "Resumption follows the same FIFO order.", "Tasks start in the order passed to gather.", "Correct."]
  },
  {
    id: "py-memory-022", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import asyncio\n\nasync def child():\n    print('child', end=' ')\n\nasync def main():\n    t = asyncio.create_task(child())\n    print('main', end=' ')\n    await t\n    print('done')\n\nasyncio.run(main())",
    options: ["child main done", "main child done", "main done child", "child done main"],
    answer: 1,
    explanation: "`create_task` schedules the coroutine, but it can't run until the current coroutine yields control to the event loop. main keeps running until `await t`, so 'main' prints first, then the task runs, then main resumes.",
    optionExplanations: ["The task only starts when main awaits.", "Correct.", "'done' waits for the task to complete.", "main prints before awaiting the task."]
  },
  {
    id: "py-memory-023", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "hard", type: "code-output",
    question: "What is the output (Python 3.11+)?",
    code: "import asyncio\n\nasync def slow():\n    await asyncio.sleep(1)\n    return 'finished'\n\nasync def main():\n    try:\n        print(await asyncio.wait_for(slow(), timeout=0.05))\n    except TimeoutError:\n        print('timeout')\n\nasyncio.run(main())",
    options: ["finished", "timeout", "None", "CancelledError"],
    answer: 1,
    explanation: "`wait_for` cancels the awaited coroutine if it doesn't finish within the timeout and raises TimeoutError (asyncio.TimeoutError is an alias of the built-in TimeoutError since 3.11). The CancelledError inside slow() is internal and replaced by TimeoutError for the caller.",
    optionExplanations: ["slow() needs 1 s but the timeout is 0.05 s.", "Correct.", "An exception is raised, not None returned.", "The caller sees TimeoutError, not CancelledError."]
  },
  {
    id: "py-memory-024", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from concurrent.futures import ThreadPoolExecutor\nimport time\n\ndef job(n):\n    time.sleep(0.05 * (3 - n))\n    return n * 10\n\nwith ThreadPoolExecutor(max_workers=3) as ex:\n    print(list(ex.map(job, [0, 1, 2])))",
    options: ["[0, 10, 20]", "[20, 10, 0]", "The order varies", "[0, 1, 2]"],
    answer: 0,
    explanation: "Executor.map returns results in INPUT order, even though job(2) finishes first here. Use `as_completed()` on submitted futures to process results in completion order. The with block waits for all work (shutdown(wait=True)).",
    optionExplanations: ["Correct.", "That would be completion order.", "map's result order is deterministic.", "job returns n * 10."]
  },
  {
    id: "py-memory-025", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "concept",
    question: "Match each workload to the best default concurrency tool in CPython: (1) handling 10,000 idle websocket connections, (2) computing SHA-256 of 50 large files in pure Python, (3) calling a blocking legacy library 20 times concurrently.",
    options: ["(1) multiprocessing (2) asyncio (3) asyncio", "(1) asyncio (2) multiprocessing (3) threads", "(1) threads (2) threads (3) multiprocessing", "(1) multiprocessing (2) threads (3) asyncio"],
    answer: 1,
    explanation: "asyncio scales to huge numbers of mostly-idle I/O connections cheaply. CPU-heavy work in Python needs processes for multi-core parallelism. Blocking libraries that can't be awaited fit a thread pool (or asyncio.to_thread), since blocking I/O releases the GIL.",
    optionExplanations: ["Processes per connection don't scale, and asyncio doesn't speed up CPU work.", "Correct.", "Threads don't parallelise pure-Python CPU work.", "Processes are heavy for idle connections."]
  },
  {
    id: "py-memory-026", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import queue, threading\n\nq = queue.Queue()\n\ndef producer():\n    for i in range(3):\n        q.put(i)\n    q.put(None)\n\nthreading.Thread(target=producer).start()\nout = []\nwhile (item := q.get()) is not None:\n    out.append(item)\nprint(out)",
    options: ["[0, 1, 2]", "[]", "[0, 1, 2, None]", "Deadlock"],
    answer: 0,
    explanation: "queue.Queue is a thread-safe FIFO: put() and get() handle the locking, and get() blocks until an item is available. A sentinel value (None) tells the consumer to stop. This producer-consumer pattern avoids manual locks.",
    optionExplanations: ["Correct.", "get() blocks until the producer puts items.", "The sentinel ends the loop and isn't appended.", "The consumer stops at the sentinel; nothing waits forever."]
  },
  {
    id: "py-memory-027", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "import threading\n\nlock = threading.Lock()\nlock.acquire()\nprint(lock.acquire(timeout=0.1), end=' ')\n\nrlock = threading.RLock()\nrlock.acquire()\nprint(rlock.acquire(timeout=0.1))",
    options: ["True True", "False True", "False False", "Deadlock forever"],
    answer: 1,
    explanation: "A plain Lock isn't re-entrant: a thread that already holds it blocks when acquiring again (here the timeout returns False; without a timeout this is a self-deadlock). An RLock tracks its owner and recursion depth, so the same thread can acquire it again.",
    optionExplanations: ["A Lock can't be re-acquired by its holder.", "Correct.", "RLock is re-entrant for the owning thread.", "The timeout prevents waiting forever."],
    tags: ["trap"]
  },
  {
    id: "py-memory-028", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "concept",
    question: "What changed with PEP 703 (the 'free-threaded' CPython build available since 3.13)?",
    options: ["The GIL was removed from all CPython builds", "Reference counting was removed", "Threads were replaced by asyncio", "An optional build can run without the GIL, letting threads execute Python bytecode in parallel; the default build still has the GIL"],
    answer: 3,
    explanation: "Python 3.13 introduced an experimental free-threaded build (python3.13t), and 3.14 made it officially supported, though still optional. It uses techniques like biased reference counting so the GIL isn't needed. The regular build keeps the GIL for compatibility.",
    optionExplanations: ["The default build still has a GIL.", "Reference counting remains, in a modified form.", "threading still exists and benefits from this.", "Correct."]
  },
  {
    id: "py-memory-029", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "hard", type: "code-output",
    question: "What is the output in CPython?",
    code: "class A:\n    def __del__(self):\n        print('freed', end=' ')\n\na = A()\nb = a\ndel a\nprint('after del a', end=' ')\ndel b\nprint('end')",
    options: ["freed after del a end", "after del a end", "after del a end freed", "after del a freed end"],
    answer: 3,
    explanation: "In CPython, an object is finalised the moment its reference count hits zero. `del a` leaves one reference (b), so nothing happens. `del b` drops the count to zero, so __del__ runs immediately, before 'end' is printed.",
    optionExplanations: ["b still refers to the object after del a.", "__del__ does run when the last reference disappears.", "Reference counting frees it immediately at del b.", "Correct."]
  },
  {
    id: "py-memory-030", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "hard", type: "code-output",
    question: "What is the output in CPython 3.4+?",
    code: "import gc\n\nclass A:\n    def __del__(self):\n        print('freed', end=' ')\n\na = A()\na.me = a\ndel a\nprint('deleted', end=' ')\ngc.collect()\nprint('collected')",
    options: ["deleted freed collected", "freed deleted collected", "deleted collected", "deleted collected freed"],
    answer: 0,
    explanation: "The object refers to itself, so `del a` doesn't free it (refcount stays 1). The cyclic garbage collector finds the unreachable cycle during gc.collect() and finalises it. Since Python 3.4 (PEP 442), objects with __del__ in cycles are collected instead of leaking in gc.garbage.",
    optionExplanations: ["Correct.", "The self-reference prevents immediate freeing.", "The cycle collector does free it.", "It's freed during gc.collect(), before 'collected' prints."]
  },
  {
    id: "py-memory-031", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "import sys\nbig = list(range(10000))\nwrapper = [big]\nprint(sys.getsizeof(wrapper) < sys.getsizeof(big), sys.getsizeof('') < sys.getsizeof('abc'))",
    options: ["False True", "True False", "True True", "False False"],
    answer: 2,
    explanation: "`sys.getsizeof` reports the SHALLOW size of an object only: a one-element list is small even if the element is huge, because it stores just a pointer. To measure total memory you must traverse referenced objects (or use tracemalloc).",
    optionExplanations: ["The wrapper list stores only one pointer.", "Longer strings occupy more bytes.", "Correct.", "Both comparisons are True."]
  },
  {
    id: "py-memory-032", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "hard", type: "concept",
    question: "Why does `Pool().map(lambda x: x * 2, data)` typically fail with a pickling error?",
    options: ["Arguments and functions sent to worker processes must be pickled, and lambdas (and nested functions) can't be pickled by reference", "Lambdas are slower than functions", "Pool only accepts built-in functions", "map requires a list, not a lambda"],
    answer: 0,
    explanation: "Processes don't share memory, so multiprocessing serialises tasks with pickle. Functions are pickled by their importable module-level name; anonymous lambdas and locally defined functions have no such name. Define worker functions at module level (and use the `__main__` guard).",
    optionExplanations: ["Correct.", "Speed isn't the issue.", "Any picklable top-level function works.", "The function argument comes first; data is the iterable."]
  },
  {
    id: "py-memory-033", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "easy", type: "concept",
    question: "Where do Python objects live in memory in CPython?",
    options: ["On the C call stack of each function", "On a private heap managed by the interpreter (with the pymalloc allocator for small objects); names are just references to them", "In CPU registers", "In a file on disk"],
    answer: 1,
    explanation: "All Python objects are allocated on the interpreter's private heap. Small objects (≤ 512 bytes) use pymalloc's pools for speed. Variables (names in frames and namespaces) hold references to these heap objects, which is why objects can outlive the function that created them.",
    optionExplanations: ["Frames hold references, but the objects are on the heap.", "Correct.", "Registers only hold transient values during execution.", "Objects live in RAM, not files."]
  },
  {
    id: "py-memory-034", subject: "python", subtopic: "Memory, GIL & Concurrency", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import threading\n\ncounter = 0\nlock = threading.Lock()\n\ndef add():\n    global counter\n    for _ in range(100000):\n        with lock:\n            counter += 1\n\nthreads = [threading.Thread(target=add) for _ in range(4)]\nfor t in threads: t.start()\nfor t in threads: t.join()\nprint(counter)",
    options: ["400000", "100000", "Some number ≤ 400000 that varies", "0"],
    answer: 0,
    explanation: "Holding the lock around the read-modify-write makes each increment atomic with respect to the other threads, and join() waits for all threads to finish before printing. So all 4 × 100,000 increments are counted.",
    optionExplanations: ["Correct.", "Each of the four threads adds 100,000.", "The lock prevents lost updates.", "The threads are joined before printing."]
  }
);
