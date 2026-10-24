/* Operating Systems — Threads */
window.QUESTIONS.push(
  {
    id: "os-threads-001", subject: "os", subtopic: "Threads", difficulty: "easy", type: "concept",
    question: "Which resources do threads of the same process SHARE, and which does each thread have privately?",
    options: ["They share nothing", "Each thread has its own address space", "They share stacks but not the heap", "Shared: code, global/static data, heap, open files, signal handlers, address space. Private: thread ID, program counter, registers, stack (and thread-local storage)"],
    answer: 3,
    explanation: "Because threads share the address space, communication is as cheap as reading a shared variable — and that's exactly why they need synchronisation. Each thread needs its own stack and registers to have an independent flow of execution.",
    optionExplanations: ["Threads share most process resources.", "Separate address spaces describe processes.", "Each thread has its own stack.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-threads-002", subject: "os", subtopic: "Threads", difficulty: "easy", type: "concept",
    question: "Why is creating and switching between threads cheaper than doing so with processes?",
    options: ["Threads don't use the CPU", "Threads share their process's address space and resources, so creation doesn't duplicate memory mappings or file tables, and switching between threads of the same process doesn't change page tables or flush the TLB", "Threads run in kernel mode", "Threads have no registers"],
    answer: 1,
    explanation: "A process switch changes the memory context (page-table base register, often TLB flushes without ASIDs); a thread switch within one process only saves/restores registers and stack pointer. That's why threads are called 'lightweight processes'.",
    optionExplanations: ["Threads execute on the CPU.", "Correct.", "User threads run in user mode.", "Each thread has its own register set."]
  },
  {
    id: "os-threads-003", subject: "os", subtopic: "Threads", difficulty: "easy", type: "concept",
    question: "Which is a key DISADVANTAGE of using threads instead of separate processes?",
    options: ["Threads can't share data", "Weaker isolation: a bug in one thread (e.g. a segmentation fault or memory corruption) can crash or corrupt the whole process, and shared data requires careful synchronisation", "Threads are slower to create", "Threads can't run on multiple cores"],
    answer: 1,
    explanation: "Browsers like Chrome use separate processes per site/tab for isolation and security, accepting higher memory usage. Threads trade isolation for efficiency.",
    optionExplanations: ["Sharing is easy, which is part of the risk.", "Correct.", "Threads are faster to create.", "Kernel threads can run in parallel on multiple cores."]
  },
  {
    id: "os-threads-004", subject: "os", subtopic: "Threads", difficulty: "easy", type: "concept",
    question: "What is the difference between user-level threads and kernel-level threads?",
    options: ["User-level threads are always faster at everything", "User-level threads are managed by a runtime library in user space (the kernel sees one process); kernel-level threads are known to and scheduled by the OS kernel", "Kernel threads can't run user code", "There is no difference"],
    answer: 1,
    explanation: "User-level threads switch very fast (no system call) but the kernel can't schedule them on multiple cores or preempt them individually; a blocking system call can block them all. Kernel threads can run in parallel and block independently but cost more to create and switch.",
    optionExplanations: ["They're faster to switch but have significant limitations.", "Correct.", "Kernel-level threads run user code too.", "Who manages and schedules them differs."]
  },
  {
    id: "os-threads-005", subject: "os", subtopic: "Threads", difficulty: "easy", type: "concept",
    question: "What is the difference between concurrency and parallelism?",
    options: ["They are the same", "Concurrency is about dealing with multiple tasks that make progress in overlapping time periods (possibly interleaved on one core); parallelism is executing multiple tasks literally at the same instant on multiple cores", "Parallelism requires a single core", "Concurrency requires multiple machines"],
    answer: 1,
    explanation: "A single-core system can be concurrent (time-slicing) but not parallel. Concurrency is a program-structure property; parallelism is an execution property that needs hardware support.",
    optionExplanations: ["They're distinct concepts.", "Correct.", "Parallelism needs multiple execution units.", "Concurrency can exist on one core."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-threads-006", subject: "os", subtopic: "Threads", difficulty: "easy", type: "concept",
    question: "What do pthread_create() and pthread_join() do?",
    options: ["pthread_create starts a new thread running a given function with an argument; pthread_join blocks the caller until that thread terminates and collects its return value", "Create a process; kill a process", "Both create threads", "pthread_join merges two threads into one"],
    answer: 0,
    explanation: "Joining is the thread analogue of wait() for processes: it synchronises with the thread's completion and frees its resources. A thread that's never joined (and not detached) leaks resources, like a zombie.",
    optionExplanations: ["Correct.", "They work with threads, not processes.", "join waits; it doesn't create.", "Threads aren't merged."]
  },
  {
    id: "os-threads-007", subject: "os", subtopic: "Threads", difficulty: "medium", type: "concept",
    question: "In the many-to-one threading model, what happens when one user thread makes a blocking system call (e.g. read() on a socket)?",
    options: ["Only that thread blocks", "The kernel creates a new kernel thread automatically", "The entire process blocks, because all user threads map to a single kernel thread", "The call fails"],
    answer: 2,
    explanation: "Many-to-one (old green threads) can't use multiple cores and a blocking call stalls everything. One-to-one (Linux NPTL, Windows) avoids both problems at the cost of a kernel thread per user thread. Many-to-many (and two-level) multiplex many user threads over several kernel threads.",
    optionExplanations: ["The kernel only knows about one thread.", "Many-to-one runtimes can't do that.", "Correct.", "The call succeeds, but everything waits."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-threads-008", subject: "os", subtopic: "Threads", difficulty: "medium", type: "concept",
    question: "Which multithreading model do Linux (NPTL) and Windows use for threads created with pthread_create / CreateThread?",
    options: ["Many-to-one", "Zero-to-one", "Many-to-many", "One-to-one: each user thread maps to its own kernel thread"],
    answer: 3,
    explanation: "One-to-one gives true parallelism and independent blocking. Runtimes such as Go's goroutines and Java's virtual threads implement M:N scheduling in user space on top of these kernel threads.",
    optionExplanations: ["Many-to-one is used by old green-thread libraries.", "Not a real model.", "M:N appears in language runtimes, not the base OS thread API.", "Correct."]
  },
  {
    id: "os-threads-009", subject: "os", subtopic: "Threads", difficulty: "medium", type: "concept",
    question: "How does Linux implement threads internally?",
    options: ["As tasks created by clone() with flags that share the address space, file table and signal handlers (CLONE_VM, CLONE_FILES, CLONE_SIGHAND, CLONE_THREAD...); the kernel schedules threads and processes the same way", "With a separate scheduler for threads", "Threads are emulated entirely in user space", "Threads are processes without memory"],
    answer: 0,
    explanation: "Linux has a unified 'task' abstraction (task_struct). fork() is essentially clone() without sharing flags. Threads of one process form a thread group whose TGID is the PID that getpid() returns; each thread has its own TID.",
    optionExplanations: ["Correct.", "The same scheduler handles all tasks.", "NPTL threads are kernel-scheduled.", "Threads share their process's memory."]
  },
  {
    id: "os-threads-010", subject: "os", subtopic: "Threads", difficulty: "medium", type: "concept",
    question: "Why do servers use a THREAD POOL instead of creating a new thread for every request?",
    options: ["Thread pools make requests more secure", "Threads can only be created at startup", "Reusing a fixed set of threads avoids per-request creation/destruction overhead and bounds the number of concurrent threads, preventing resource exhaustion under load spikes", "Pools remove the need for synchronisation"],
    answer: 2,
    explanation: "Tasks wait in a queue until a worker is free. The pool size is tuned to the workload (≈ number of cores for CPU-bound work, larger for I/O-bound work). Java's ExecutorService and Python's ThreadPoolExecutor implement this pattern.",
    optionExplanations: ["Security isn't the main benefit.", "Threads can be created anytime.", "Correct.", "Shared state still needs synchronisation."]
  },
  {
    id: "os-threads-011", subject: "os", subtopic: "Threads", difficulty: "medium", type: "numerical",
    question: "90% of a program's execution can be parallelised. According to Amdahl's law, what is the speedup on 4 cores?",
    options: ["4.00", "3.60", "3.08", "2.50"],
    answer: 2,
    explanation: "Speedup = 1 / ((1 − P) + P / N) = 1 / (0.1 + 0.9 / 4) = 1 / (0.1 + 0.225) = 1 / 0.325 ≈ 3.08. The 10% serial part limits the gain.",
    optionExplanations: ["Perfect speedup would require 100% parallel code.", "That incorrectly multiplies 0.9 by 4.", "Correct.", "Recompute the denominator: 0.1 + 0.225 = 0.325."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-threads-012", subject: "os", subtopic: "Threads", difficulty: "medium", type: "numerical",
    question: "If 90% of a program is parallelisable, what is the MAXIMUM speedup achievable with an unlimited number of cores (Amdahl's law)?",
    options: ["10×", "9×", "90×", "Unlimited"],
    answer: 0,
    explanation: "As N → ∞, P / N → 0, so speedup → 1 / (1 − P) = 1 / 0.1 = 10. The serial fraction sets a hard ceiling regardless of how many cores you add.",
    optionExplanations: ["Correct.", "The limit is 1 / 0.1.", "The serial 10% caps it.", "The serial fraction bounds the speedup."]
  },
  {
    id: "os-threads-013", subject: "os", subtopic: "Threads", difficulty: "hard", type: "numerical",
    question: "You want an 8× speedup on 16 cores. According to Amdahl's law, roughly what fraction of the program must be parallelisable?",
    options: ["50%", "87.5%", "93.3%", "99%"],
    answer: 2,
    explanation: "Solve 1 / ((1 − P) + P / 16) = 8 → (1 − P) + P / 16 = 0.125 → 1 − (15/16)P = 0.125 → P = 0.875 × 16 / 15 ≈ 0.933. Even 93% parallel code gives only half the ideal 16× speedup.",
    optionExplanations: ["Far too little parallel code.", "That ignores the P/16 term.", "Correct.", "99% would give about 13.9×."]
  },
  {
    id: "os-threads-014", subject: "os", subtopic: "Threads", difficulty: "medium", type: "concept",
    question: "Why is the C function strtok() unsafe to use from multiple threads, and what's the fix?",
    options: ["It keeps hidden static state between calls, so concurrent calls from different threads corrupt each other's parsing; use the reentrant strtok_r(), which takes the state as an explicit argument", "It's slow", "It can't parse strings", "It allocates memory"],
    answer: 0,
    explanation: "A REENTRANT function doesn't rely on shared static data, so it can be safely interleaved (even re-entered by a signal handler). THREAD-SAFE functions may use locks internally. Functions with _r suffixes (strtok_r, rand_r, localtime_r) are reentrant variants.",
    optionExplanations: ["Correct.", "Performance isn't the problem.", "It parses fine in a single thread.", "It doesn't allocate memory."]
  },
  {
    id: "os-threads-015", subject: "os", subtopic: "Threads", difficulty: "medium", type: "concept",
    question: "What is thread-local storage (TLS), e.g. C's `_Thread_local int x;` or `__thread`?",
    options: ["Memory shared by all threads", "A cache for thread stacks", "Memory allocated on another machine", "A variable for which each thread has its own separate instance, even though it looks like a global (errno is implemented this way)"],
    answer: 3,
    explanation: "TLS lets code keep per-thread state without passing it around, avoiding races. errno is thread-local so a failure in one thread doesn't overwrite another thread's error code.",
    optionExplanations: ["It's per-thread, not shared.", "It's per-thread variable storage.", "It's local to the process.", "Correct."]
  },
  {
    id: "os-threads-016", subject: "os", subtopic: "Threads", difficulty: "hard", type: "code-output",
    question: "A process has 4 threads (main + 3 workers). The main thread calls fork(). How many threads does the CHILD process have?",
    code: "for (int i = 0; i < 3; i++)\n    pthread_create(&t, NULL, worker, NULL);\nif (fork() == 0) {\n    /* count threads in the child */\n}",
    options: ["4", "1", "3", "0"],
    answer: 1,
    explanation: "POSIX fork() duplicates only the CALLING thread. The child gets a copy of the whole address space, but the other threads don't exist there — any mutexes they held stay locked forever. That's why multithreaded programs should only call async-signal-safe functions between fork() and exec().",
    optionExplanations: ["Only the calling thread is duplicated.", "Correct.", "The worker threads aren't copied.", "The calling thread continues in the child."],
    tags: ["trap"]
  },
  {
    id: "os-threads-017", subject: "os", subtopic: "Threads", difficulty: "medium", type: "concept",
    question: "What is the difference between asynchronous and deferred thread cancellation?",
    options: ["They're identical", "Deferred cancellation never cancels", "Asynchronous cancellation terminates the target thread immediately (possibly mid-update, leaving locks held or data inconsistent); deferred cancellation lets the target terminate only at defined cancellation points, where it can clean up safely", "Asynchronous cancellation waits for the thread to finish"],
    answer: 2,
    explanation: "Pthreads default to deferred cancellation; blocking calls like read() or pthread_testcancel() act as cancellation points. Cleanup handlers (pthread_cleanup_push) release resources. Many teams avoid cancellation entirely and use cooperative stop flags.",
    optionExplanations: ["Their timing and safety differ.", "Deferred cancellation happens at the next cancellation point.", "Correct.", "That's the opposite."]
  },
  {
    id: "os-threads-018", subject: "os", subtopic: "Threads", difficulty: "medium", type: "concept",
    question: "What does simultaneous multithreading (SMT, Intel 'Hyper-Threading') provide?",
    options: ["Two physical cores in one", "Software threads without kernel support", "One physical core exposes two (or more) logical CPUs by duplicating architectural state (registers, PC), so two hardware threads can share the core's execution units and fill idle slots, e.g. while one waits on memory", "Faster single-threaded performance always"],
    answer: 2,
    explanation: "SMT typically yields 10–30% more throughput, not 2×, because the two threads compete for the same execution units and caches. The OS schedules on logical CPUs and tries to place threads on separate physical cores first.",
    optionExplanations: ["There's still one physical core.", "SMT is a hardware feature.", "Correct.", "Per-thread performance can decrease."]
  },
  {
    id: "os-threads-019", subject: "os", subtopic: "Threads", difficulty: "medium", type: "concept",
    question: "How do goroutines (Go) or Java virtual threads achieve millions of concurrent tasks?",
    options: ["Each one is a kernel thread", "They use separate processes", "They run only one at a time", "The language runtime multiplexes many lightweight user-space threads with small, growable stacks onto a small pool of OS threads (M:N scheduling), parking them cheaply when they block on I/O"],
    answer: 3,
    explanation: "A kernel thread has a large fixed stack and kernel-managed context switches; user-space runtime threads start with a few KB of stack and switch in user space. The runtime integrates with non-blocking I/O (epoll/kqueue) so a blocked goroutine doesn't block its OS thread.",
    optionExplanations: ["That wouldn't scale to millions.", "Processes are even heavier.", "They run concurrently, often in parallel.", "Correct."]
  },
  {
    id: "os-threads-020", subject: "os", subtopic: "Threads", difficulty: "medium", type: "code-output",
    question: "What does this program print?",
    code: "#include <stdio.h>\n#include <pthread.h>\n\nint g = 0;\nvoid *work(void *arg) {\n    int local = 10;\n    local += *(int *)arg;\n    g += *(int *)arg;\n    printf(\"local=%d\\n\", local);\n    return NULL;\n}\nint main(void) {\n    pthread_t a, b; int x = 1, y = 2;\n    pthread_create(&a, NULL, work, &x); pthread_join(a, NULL);\n    pthread_create(&b, NULL, work, &y); pthread_join(b, NULL);\n    printf(\"g=%d\\n\", g);\n}",
    options: ["local=11, local=13, g=3", "local=11, local=12, g=3", "local=11, local=12, g=2", "local=13, local=13, g=3"],
    answer: 1,
    explanation: "Each thread gets its own stack, so `local` starts at 10 in every thread (11 and 12). The global g is shared: 0 + 1 + 2 = 3. The threads are joined one after another, so there's no race here.",
    optionExplanations: ["local isn't shared between threads.", "Correct.", "Both threads add to the shared global.", "Each thread has its own local starting at 10."]
  },
  {
    id: "os-threads-021", subject: "os", subtopic: "Threads", difficulty: "medium", type: "concept",
    question: "In a multithreaded C program, one worker thread calls exit(0). What happens?",
    options: ["Only that thread ends", "exit() is ignored in threads", "The ENTIRE process terminates, including all other threads; to end only the calling thread, use pthread_exit() or return from the thread function", "The main thread restarts"],
    answer: 2,
    explanation: "exit() terminates the process (running atexit handlers and flushing stdio). Similarly, returning from main() ends the process and kills all threads — unless main calls pthread_exit() to wait for the others.",
    optionExplanations: ["exit() affects the whole process.", "It isn't ignored.", "Correct.", "Nothing restarts."],
    tags: ["trap"]
  },
  {
    id: "os-threads-022", subject: "os", subtopic: "Threads", difficulty: "medium", type: "concept",
    question: "What does pthread_detach() do?",
    options: ["It kills the thread", "It pauses the thread", "It moves the thread to another process", "It marks the thread so its resources are automatically released when it terminates; the thread can no longer be joined"],
    answer: 3,
    explanation: "Use detached threads for fire-and-forget work whose result you don't need. A thread must be either joined or detached to avoid leaking its resources (stack, descriptor).",
    optionExplanations: ["Detaching doesn't stop the thread.", "It doesn't pause the thread.", "Threads can't change processes.", "Correct."]
  },
  {
    id: "os-threads-023", subject: "os", subtopic: "Threads", difficulty: "hard", type: "concept",
    question: "Two threads each execute `counter++` 1,000,000 times on a shared int without synchronisation, on a multi-core machine. Which statement is true?",
    options: ["counter always ends at 2,000,000", "counter can end anywhere from as low as 2 up to 2,000,000, because the load–increment–store sequences interleave and updates are lost", "The program always crashes", "counter always ends at 1,000,000"],
    answer: 1,
    explanation: "counter++ compiles to load, add, store. If both threads load the same value, one increment is lost. In practice results are usually somewhat below 2,000,000 and vary between runs; adversarial interleavings can make it as low as 2. Use a mutex or atomic increments.",
    optionExplanations: ["Lost updates make it nondeterministic.", "Correct.", "Data races don't necessarily crash.", "The loss isn't exactly half."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-threads-024", subject: "os", subtopic: "Threads", difficulty: "hard", type: "concept",
    question: "In a one-to-one threading model on a 4-core machine, why can a CPU-bound program with 64 threads run SLOWER than the same work with 4 threads?",
    options: ["Threads can't run in parallel", "The kernel refuses to run more than 4 threads", "64 threads use 64 cores automatically", "Only 4 threads can run at once; the extra threads add context-switch overhead, cache/TLB thrashing and lock contention without adding compute capacity"],
    answer: 3,
    explanation: "For CPU-bound work, the useful parallelism is the number of cores (or hardware threads). Oversubscription wastes time switching. For I/O-bound work, more threads than cores can help because many are waiting.",
    optionExplanations: ["4 threads can run in parallel.", "The kernel time-shares them.", "There are only 4 cores.", "Correct."]
  },
  {
    id: "os-threads-025", subject: "os", subtopic: "Threads", difficulty: "medium", type: "concept",
    question: "One thread in a process dereferences a NULL pointer (segmentation fault). What happens to the other threads?",
    options: ["They continue normally", "The other threads are paused", "Only the faulting thread restarts", "The whole process (all threads) is terminated by SIGSEGV, since threads share the address space and the default action applies to the process"],
    answer: 3,
    explanation: "Threads give no fault isolation. Architectures needing resilience run risky work in separate processes (browser renderers, worker processes in servers) so a crash doesn't take down everything.",
    optionExplanations: ["The signal's default action terminates the process.", "The process ends.", "There's no automatic restart.", "Correct."]
  },
  {
    id: "os-threads-026", subject: "os", subtopic: "Threads", difficulty: "hard", type: "concept",
    question: "A user-level thread library (many-to-one) runs on a 4-core machine. What's the maximum number of its threads that can execute simultaneously?",
    options: ["1", "4", "As many as the library creates", "2"],
    answer: 0,
    explanation: "The kernel sees and schedules only one kernel thread for the process, so only one user thread runs at any instant, regardless of the number of cores. That's the main reason pure user-level threading fell out of favour.",
    optionExplanations: ["Correct.", "The kernel can only place the single kernel thread on one core.", "Concurrency without parallelism.", "Still just one kernel thread."]
  },
  {
    id: "os-threads-027", subject: "os", subtopic: "Threads", difficulty: "medium", type: "numerical",
    question: "A program is 60% parallelisable. What speedup does it get on 2 cores (Amdahl's law)?",
    options: ["1.43", "1.60", "2.00", "1.20"],
    answer: 0,
    explanation: "Speedup = 1 / (0.4 + 0.6 / 2) = 1 / (0.4 + 0.3) = 1 / 0.7 ≈ 1.43.",
    optionExplanations: ["Correct.", "That just adds the parallel fraction.", "Perfect scaling needs 100% parallel code.", "Recompute: 1 / 0.7 ≈ 1.43."]
  },
  {
    id: "os-threads-028", subject: "os", subtopic: "Threads", difficulty: "hard", type: "concept",
    question: "A signal such as SIGINT is sent to a multithreaded process (not to a specific thread). Which thread handles it?",
    options: ["Any one thread that doesn't have the signal blocked (chosen by the kernel); signal handlers and dispositions are process-wide, while each thread has its own signal mask", "Always the main thread", "Every thread handles it once", "The most recently created thread"],
    answer: 0,
    explanation: "A common robust design blocks signals in all threads (pthread_sigmask) and dedicates one thread to sigwait() for them, turning asynchronous signals into synchronous events. Synchronous signals like SIGSEGV go to the faulting thread.",
    optionExplanations: ["Correct.", "Delivery isn't restricted to the main thread.", "Process-directed signals are delivered once.", "There's no such rule."]
  }
);
