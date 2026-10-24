/* Operating Systems — Process Synchronization */
window.QUESTIONS.push(
  {
    id: "os-sync-001", subject: "os", subtopic: "Process Synchronization", difficulty: "easy", type: "concept",
    question: "What is a race condition?",
    options: ["A situation where the outcome depends on the unpredictable timing/interleaving of concurrent accesses to shared data, at least one of which is a write", "Two processes competing for the fastest CPU", "A deadlock between two threads", "A process running faster than expected"],
    answer: 0,
    explanation: "Example: two threads execute counter++ (load, add, store). If both load the same old value, one update is lost. Race conditions are timing-dependent, so they may appear rarely and vanish under a debugger.",
    optionExplanations: ["Correct.", "It's about shared-data interleavings, not CPU speed.", "Deadlock is a different hazard.", "Speed itself isn't the problem."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sync-002", subject: "os", subtopic: "Process Synchronization", difficulty: "easy", type: "concept",
    question: "What three requirements must a correct solution to the critical-section problem satisfy?",
    options: ["Mutual exclusion, progress, and bounded waiting", "Speed, fairness, simplicity", "Atomicity, consistency, isolation", "Deadlock, starvation, livelock"],
    answer: 0,
    explanation: "Mutual exclusion: at most one process in its critical section at a time. Progress: if none is inside, only processes trying to enter take part in deciding who goes next, and the decision can't be postponed forever. Bounded waiting: there's a limit on how many times others can enter before a waiting process gets its turn (no starvation).",
    optionExplanations: ["Correct.", "These are desirable but not the formal requirements.", "Those are transaction properties.", "Those are problems to avoid."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sync-003", subject: "os", subtopic: "Process Synchronization", difficulty: "easy", type: "concept",
    question: "What is a critical section?",
    options: ["The first part of a program", "Code that runs in kernel mode", "A segment of code that accesses shared resources and must not be executed by more than one process/thread at the same time", "A section of memory reserved for the OS"],
    answer: 2,
    explanation: "The typical structure is: entry section (acquire permission/lock) → critical section → exit section (release) → remainder section. Synchronisation primitives implement the entry and exit sections.",
    optionExplanations: ["Position in the program is irrelevant.", "User code can have critical sections.", "Correct.", "It's a code region, not a memory region."]
  },
  {
    id: "os-sync-004", subject: "os", subtopic: "Process Synchronization", difficulty: "easy", type: "concept",
    question: "What do the semaphore operations wait() (P) and signal() (V) do?",
    options: ["wait() increments; signal() decrements", "Both just read the value", "wait() decrements the semaphore and blocks the caller if the value would become negative (no resource available); signal() increments it and wakes a waiting process if any", "wait() kills a process; signal() restarts it"],
    answer: 2,
    explanation: "Both operations must execute atomically. P comes from Dutch 'proberen' (try) and V from 'verhogen' (increase), from Dijkstra. A counting semaphore initialised to N allows up to N concurrent holders.",
    optionExplanations: ["Reversed.", "They modify the value atomically.", "Correct.", "They block and wake processes; they don't kill them."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sync-005", subject: "os", subtopic: "Process Synchronization", difficulty: "easy", type: "concept",
    question: "What's the difference between a counting semaphore and a binary semaphore?",
    options: ["A counting semaphore can take any non-negative value (e.g. number of free buffer slots or connections); a binary semaphore takes only 0 or 1 and is used like a lock", "Counting semaphores can only be used by two processes", "Binary semaphores are faster but unsafe", "There is no difference"],
    answer: 0,
    explanation: "Counting semaphores control access to a pool of N identical resources. A binary semaphore (initialised to 1) provides mutual exclusion; initialised to 0, it's used for signalling/ordering between processes.",
    optionExplanations: ["Correct.", "Any number of processes can use either kind.", "Both are safe when used correctly.", "Their value ranges and uses differ."]
  },
  {
    id: "os-sync-006", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "How does a mutex differ from a binary semaphore?",
    options: ["A mutex has OWNERSHIP: only the thread that locked it may unlock it (enabling features like priority inheritance and error checking); a semaphore has no owner, so any thread may signal it, which suits signalling between threads", "They're identical", "A semaphore can only be used once", "A mutex can count resources"],
    answer: 0,
    explanation: "Use a mutex to protect a critical section; use a semaphore for counting resources or signalling events (e.g. 'data is ready'). Recursive mutexes additionally allow the owner to lock again.",
    optionExplanations: ["Correct.", "Ownership semantics differ.", "Semaphores can be reused indefinitely.", "Counting is a semaphore feature."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sync-007", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "numerical",
    question: "A counting semaphore S is initialised to 10. Then 6 wait (P) operations and 4 signal (V) operations are performed (none blocks). What is the final value of S?",
    options: ["0", "20", "12", "8"],
    answer: 3,
    explanation: "Each P (wait) decrements S by 1 and each V (signal) increments it by 1. The order doesn't matter as long as nothing blocks: 10 − 6 + 4 = 8.",
    optionExplanations: ["Recompute: 10 − 6 + 4.", "That adds every operation.", "P operations decrease the value.", "Correct."]
  },
  {
    id: "os-sync-008", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "numerical",
    question: "A semaphore (implementation where the value may go negative and |value| = number of blocked processes) is initialised to 5. Then 8 processes each call wait(S) and nobody calls signal. What is the final value, and how many processes are blocked?",
    options: ["0 and 3", "−8 and 8", "−3 and 3", "5 and 0"],
    answer: 2,
    explanation: "The first 5 wait() calls succeed (5 → 0); the next 3 decrement to −1, −2, −3 and block. In this textbook implementation, a negative value's magnitude equals the number of waiting processes.",
    optionExplanations: ["In this implementation the value continues below 0.", "Only 3 calls exceed the initial value.", "Correct.", "8 waits were performed."]
  },
  {
    id: "os-sync-009", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "Semaphore S is initialised to 0. Process P1 runs `print(\"A\"); signal(S);` and P2 runs `wait(S); print(\"B\");`. What is guaranteed?",
    options: ["B is printed before A", "Both block forever", "The output order is random", "A is always printed before B, regardless of which process starts first"],
    answer: 3,
    explanation: "Initialising a semaphore to 0 makes it an event signal: P2's wait blocks until P1 signals, which happens only after printing A. This enforces ordering constraints (precedence graphs) between processes.",
    optionExplanations: ["P2 must wait for P1's signal.", "P1 never waits, so it signals P2.", "The semaphore enforces the order.", "Correct."]
  },
  {
    id: "os-sync-010", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "In the bounded-buffer producer-consumer solution with semaphores, what are the correct initial values of mutex, empty and full for a buffer of N slots?",
    options: ["mutex = 0, empty = 0, full = N", "mutex = 1, empty = N, full = 0", "mutex = N, empty = 1, full = 1", "mutex = 1, empty = 0, full = N"],
    answer: 1,
    explanation: "mutex = 1 protects the buffer data structure; empty counts free slots (initially all N); full counts filled slots (initially 0). Producer: wait(empty); wait(mutex); add; signal(mutex); signal(full). Consumer: wait(full); wait(mutex); remove; signal(mutex); signal(empty).",
    optionExplanations: ["mutex = 0 would block everyone.", "Correct.", "mutex must be binary (1).", "The buffer starts empty."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sync-011", subject: "os", subtopic: "Process Synchronization", difficulty: "hard", type: "concept",
    question: "In bounded-buffer producer-consumer, a producer is written as `wait(mutex); wait(empty); add item; signal(mutex); signal(full);` (it takes mutex BEFORE empty). What can go wrong?",
    options: ["Nothing; the order doesn't matter", "Deadlock: if the buffer is full, the producer holds mutex while blocked on empty; the consumer then blocks on mutex and can never free a slot", "Starvation of producers only", "Buffer overflow"],
    answer: 1,
    explanation: "Always wait on the counting semaphore (empty/full) BEFORE acquiring the mutex. Holding a lock while waiting for a condition that only another lock-holder can change is a classic deadlock pattern.",
    optionExplanations: ["The order of waits matters.", "Correct.", "Both sides get stuck.", "The empty semaphore still prevents overflow."],
    tags: ["trap"]
  },
  {
    id: "os-sync-012", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "Two processes use a shared variable `turn` (initially 0): Pi waits `while (turn != i);`, runs its critical section, then sets `turn = 1 − i`. Which requirement does this 'strict alternation' violate?",
    options: ["Progress: if P0 wants to enter twice in a row while P1 is busy in its remainder section, P0 must wait for P1, even though the critical section is free", "Mutual exclusion", "It violates nothing", "It causes data races"],
    answer: 0,
    explanation: "Strict alternation forces turns to alternate. A process not interested in the critical section can block the other, violating progress (also, it uses busy waiting).",
    optionExplanations: ["Correct.", "Only the process whose turn it is can enter.", "Progress is violated.", "Mutual exclusion is guaranteed."]
  },
  {
    id: "os-sync-013", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "Two processes use only flags: Pi sets `flag[i] = true; while (flag[j]);` then enters, and sets `flag[i] = false` on exit. What can happen?",
    options: ["If both set their flags before either checks, both loop forever: progress (liveness) is violated, a deadlock-like livelock", "It's a correct solution", "Both can be in the critical section together", "It requires hardware support"],
    answer: 0,
    explanation: "Mutual exclusion holds, but simultaneous intent causes both to wait for each other forever. Peterson's algorithm fixes this by adding the `turn` variable to break ties.",
    optionExplanations: ["Correct.", "Both can get stuck.", "Mutual exclusion holds.", "It uses only ordinary variables."]
  },
  {
    id: "os-sync-014", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "Peterson's solution for process i uses: `flag[i] = true; turn = j; while (flag[j] && turn == j);` What does it achieve, and what caveat applies on modern hardware?",
    options: ["It guarantees only mutual exclusion", "It works for any number of processes without changes", "It satisfies mutual exclusion, progress and bounded waiting for two processes, but on modern CPUs/compilers that reorder memory operations it needs memory barriers (or atomics) to work", "It requires disabling interrupts"],
    answer: 2,
    explanation: "Giving the turn to the other process breaks ties politely. The proof assumes sequentially consistent memory; store–load reordering could let both enter. That's why real systems use hardware atomic instructions.",
    optionExplanations: ["It satisfies all three requirements.", "The classic version is for 2 processes (generalisations exist).", "Correct.", "It's a pure software solution."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sync-015", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "How does a test-and-set (TAS) instruction enable a spinlock?",
    options: ["It disables all interrupts", "It atomically reads a memory word and sets it to 1, returning the old value; `while (test_and_set(&lock));` spins until the old value was 0, meaning this thread acquired the lock", "It sends a message to other CPUs", "It sorts waiting threads"],
    answer: 1,
    explanation: "Atomic read-modify-write instructions (test-and-set, compare-and-swap, fetch-and-add, LL/SC) are the hardware basis of locks. Release is simply `lock = 0` (with appropriate memory ordering). Plain TAS doesn't guarantee bounded waiting without extra logic.",
    optionExplanations: ["Disabling interrupts is a different technique.", "Correct.", "It's a single atomic memory instruction.", "TAS doesn't order waiters."]
  },
  {
    id: "os-sync-016", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "What does compare-and-swap, CAS(addr, expected, new), do?",
    options: ["Always writes new to addr", "Swaps two registers", "Atomically: if *addr equals expected, set *addr = new and report success; otherwise leave it unchanged and report failure (often returning the current value)", "Compares two strings"],
    answer: 2,
    explanation: "CAS powers lock-free algorithms: read the value, compute a new one, and CAS it in; retry if someone else changed it meanwhile. Beware the ABA problem (value changes A → B → A unnoticed), solved with version tags.",
    optionExplanations: ["It writes only if the expected value matches.", "It operates on memory atomically.", "Correct.", "It operates on a memory word."]
  },
  {
    id: "os-sync-017", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "Why is disabling interrupts NOT an acceptable general way to implement critical sections?",
    options: ["On multiprocessors it doesn't stop other CPUs from entering the critical section; it's also privileged, and letting user code disable interrupts could freeze the system", "It's too slow on uniprocessors", "Interrupts can't be disabled", "It causes race conditions"],
    answer: 0,
    explanation: "Disabling interrupts on one CPU prevents preemption on that CPU only. Kernels use it briefly for very short sections (often combined with spinlocks), never as a user-level mechanism.",
    optionExplanations: ["Correct.", "It's actually cheap on a uniprocessor.", "Kernels can disable interrupts.", "It prevents preemption, not races on other CPUs."]
  },
  {
    id: "os-sync-018", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "When is a spinlock (busy-waiting) preferable to a blocking mutex?",
    options: ["On multiprocessors when the critical section is very short, so spinning briefly costs less than two context switches (block + wake-up)", "When critical sections are long", "On a single-CPU system", "When the lock holder may sleep"],
    answer: 0,
    explanation: "On a uniprocessor, spinning just wastes the time slice the lock holder needs to finish. Many mutexes are adaptive: they spin briefly, then block (e.g. Linux futex-based mutexes).",
    optionExplanations: ["Correct.", "Long sections make spinning wasteful.", "On one CPU, the holder can't run while you spin.", "Never hold a spinlock while sleeping."]
  },
  {
    id: "os-sync-019", subject: "os", subtopic: "Process Synchronization", difficulty: "hard", type: "numerical",
    question: "Shared x = 5. P1 executes x = x + 1 and P2 executes x = x − 2, each compiled as load → compute → store, running concurrently without synchronisation. Which set contains ALL possible final values of x?",
    options: ["{3, 4, 6}", "{4}", "{3, 6}", "{3, 4, 5, 6}"],
    answer: 0,
    explanation: "Serial executions give 4. If both load 5 before either stores: P1 stores 6 and P2 stores 3 → the last store wins: 3 or 6. So the possible results are {3, 4, 6}. 5 is impossible because both updates can't be lost.",
    optionExplanations: ["Correct.", "Lost updates are possible.", "The serial result 4 is also possible.", "Getting 5 would require both updates to be lost."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sync-020", subject: "os", subtopic: "Process Synchronization", difficulty: "hard", type: "numerical",
    question: "Shared x = 0. Two processes each execute `x = x + 1` three times (load, add, store, no synchronisation). What is the MINIMUM possible final value of x?",
    options: ["0", "1", "2", "3"],
    answer: 2,
    explanation: "Adversarial interleaving: A loads 0; B runs two full increments (x = 2); A stores 1 (overwriting); B loads 1; A completes its remaining two increments (x = 3); B stores 2. Final value 2. It can't be 1 because the very last store follows at least one completed increment by the other process. Possible values are 2 through 6.",
    optionExplanations: ["At least one update survives.", "The last writer's value reflects at least two increments.", "Correct.", "Lower values are possible through lost updates."],
    tags: ["trap"]
  },
  {
    id: "os-sync-021", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "In a monitor, what happens when a thread calls wait() on a condition variable?",
    options: ["It busy-waits while holding the monitor lock", "It atomically releases the monitor lock and sleeps until signalled; when woken it re-acquires the lock before continuing", "It terminates", "It signals all other threads"],
    answer: 1,
    explanation: "Releasing the lock is essential: otherwise no other thread could enter the monitor to change the condition. signal() wakes one waiter (broadcast/notifyAll wakes all). A signal with no waiters is lost — unlike a semaphore's V, which is remembered.",
    optionExplanations: ["Waiting releases the lock.", "Correct.", "The thread only sleeps.", "wait() blocks the caller."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sync-022", subject: "os", subtopic: "Process Synchronization", difficulty: "hard", type: "concept",
    question: "Why should condition-variable waits be written as `while (!condition) cond_wait(&cv, &m);` rather than `if (!condition) cond_wait(...)`?",
    options: ["while is faster than if", "if causes a compile error", "With Mesa semantics (pthreads, Java), a woken thread isn't guaranteed the condition still holds: another thread may run first and change it, and spurious wakeups are allowed. Re-checking in a loop is required", "while prevents deadlock automatically"],
    answer: 2,
    explanation: "Hoare semantics hand the monitor directly to the woken thread (condition guaranteed), but practical systems use Mesa semantics: signal is just a hint. The while loop makes code correct under both.",
    optionExplanations: ["Performance isn't the reason.", "Both compile.", "Correct.", "It handles stale wake-ups, not deadlock."],
    tags: ["trap"]
  },
  {
    id: "os-sync-023", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "In the 'first' readers-writers solution (readers have priority), what problem can arise?",
    options: ["Readers can starve", "Writers can starve: as long as at least one reader is reading, new readers keep entering and a waiting writer never gets access", "Two writers can write simultaneously", "Readers corrupt the data"],
    answer: 1,
    explanation: "The 'second' readers-writers variant gives writers priority (new readers wait if a writer is waiting), which can starve readers instead. Fair solutions queue arrivals in order. Read-write locks (pthread_rwlock) implement these policies.",
    optionExplanations: ["Readers are favoured in this variant.", "Correct.", "Writers always get exclusive access.", "Readers only read."]
  },
  {
    id: "os-sync-024", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "In the dining philosophers problem, each philosopher picks up the left fork, then the right fork. What can happen, and which change prevents it?",
    options: ["Nothing bad happens", "If all five pick up their left fork simultaneously, each waits forever for the right fork (deadlock). Fixes: allow at most four philosophers at the table, make one philosopher pick right-first (asymmetric ordering), or pick up both forks atomically", "Philosophers eat too much", "Forks are duplicated"],
    answer: 1,
    explanation: "Each fork is a resource; the circular wait is the root cause. Breaking any Coffman condition prevents deadlock. Even deadlock-free solutions should be checked for starvation.",
    optionExplanations: ["A circular wait can form.", "Correct.", "Not a synchronisation issue.", "Forks are exclusive resources."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sync-025", subject: "os", subtopic: "Process Synchronization", difficulty: "hard", type: "concept",
    question: "A low-priority task L holds a mutex needed by high-priority task H. A medium-priority task M (not needing the mutex) becomes ready and preempts L. What's this problem called, and the standard fix?",
    options: ["Deadlock; kill M", "Convoy effect; use FCFS", "Starvation; aging", "Priority inversion: H effectively waits for M. Fix: priority inheritance (L temporarily runs at H's priority while holding the mutex) or priority ceiling protocols"],
    answer: 3,
    explanation: "This famously reset the Mars Pathfinder lander in 1997 until priority inheritance was enabled remotely. Inheritance makes L finish its critical section quickly, releasing the mutex to H.",
    optionExplanations: ["No circular wait exists.", "It's not FCFS-related.", "It's a specific inversion of priorities.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sync-026", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "What distinguishes livelock from deadlock?",
    options: ["They're identical", "Livelock only happens with one process", "In deadlock, processes are blocked waiting; in livelock, processes keep changing state (e.g. repeatedly backing off and retrying in sync) but make no progress", "Deadlock involves busy-waiting"],
    answer: 2,
    explanation: "Example: two people in a corridor both step aside to the same side repeatedly. Randomised back-off (as in Ethernet) breaks the symmetry. Starvation differs again: the system progresses, but one process never gets served.",
    optionExplanations: ["Livelocked processes are active.", "It needs at least two interacting processes.", "Correct.", "Deadlocked processes are blocked."]
  },
  {
    id: "os-sync-027", subject: "os", subtopic: "Process Synchronization", difficulty: "hard", type: "concept",
    question: "Thread A writes `data = 42; ready = 1;` and thread B runs `while (!ready); print(data);`. On a weakly ordered CPU (e.g. ARM) with plain variables, why might B print a stale value of data?",
    options: ["It can't; the code is correct", "The compiler or CPU may reorder the two stores (or B's loads), so B can see ready == 1 before data == 42 is visible; use atomics with release/acquire ordering or memory barriers", "Because print is buffered", "Because ready is an int"],
    answer: 1,
    explanation: "Without synchronisation the program also has a data race (undefined behaviour in C/C++). An atomic store-release of ready paired with a load-acquire guarantees that writes before the release are visible after the acquire. Locks include the necessary barriers.",
    optionExplanations: ["It's a data race under modern memory models.", "Correct.", "Output buffering doesn't change memory visibility.", "The type isn't the issue."]
  },
  {
    id: "os-sync-028", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "Which hardware instruction can implement an atomic counter increment without any lock?",
    options: ["A plain load followed by a store", "Disabling the cache", "A function call", "Fetch-and-add (e.g. x86 `lock xadd`), exposed in C11 as atomic_fetch_add / in C++ as std::atomic<int>::fetch_add"],
    answer: 3,
    explanation: "Atomic read-modify-write instructions make the whole increment indivisible across CPUs. They're cheaper than a mutex for simple counters, though heavily contended atomics still bounce cache lines between cores.",
    optionExplanations: ["Separate load and store can be interleaved.", "Caches aren't the issue.", "Calls aren't atomic.", "Correct."]
  },
  {
    id: "os-sync-029", subject: "os", subtopic: "Process Synchronization", difficulty: "hard", type: "concept",
    question: "Semaphores S and Q are both initialised to 1. P0 runs `wait(S); wait(Q); ... signal(S); signal(Q);` while P1 runs `wait(Q); wait(S); ... signal(Q); signal(S);`. What can happen?",
    options: ["Nothing; semaphores prevent all problems", "Starvation of P0 only", "Both enter the critical section together", "Deadlock: P0 holds S and waits for Q while P1 holds Q and waits for S"],
    answer: 3,
    explanation: "Acquiring multiple locks in different orders is the classic recipe for deadlock. Impose a global lock ordering (always S before Q) to make circular wait impossible.",
    optionExplanations: ["Misused semaphores can deadlock.", "Both processes can get stuck.", "Mutual exclusion still holds.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sync-030", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "What's the main drawback of busy waiting with a simple spinlock on a uniprocessor system?",
    options: ["It uses too much memory", "The waiting process consumes its whole time slice spinning, while the lock holder can't run to release the lock; CPU time is wasted", "It causes data corruption", "It can't provide mutual exclusion"],
    answer: 1,
    explanation: "Blocking primitives put the waiting thread to sleep and let the holder run. That's why uniprocessor kernels disable preemption instead of spinning, and user-space code prefers blocking or adaptive locks.",
    optionExplanations: ["Spinning uses CPU, not memory.", "Correct.", "Spinlocks still protect data correctly.", "They do provide mutual exclusion."]
  },
  {
    id: "os-sync-031", subject: "os", subtopic: "Process Synchronization", difficulty: "hard", type: "numerical",
    question: "Shared x = 1. P1 executes x = x * 2 and P2 executes x = x + 1 (each: load, compute, store; no synchronisation). How many DIFFERENT final values of x are possible?",
    options: ["3", "2", "4", "1"],
    answer: 0,
    explanation: "Serial P1 then P2: (1 × 2) + 1 = 3. Serial P2 then P1: (1 + 1) × 2 = 4. Both load 1 before storing: the last store wins, giving 2 (P1's) or 2 (P2's: 1 + 1). So the possible values are {2, 3, 4}: three distinct values.",
    optionExplanations: ["Correct.", "Both serial orders plus the lost-update case give 3 values.", "Both lost-update cases produce the same value, 2.", "Different interleavings give different results."]
  },
  {
    id: "os-sync-032", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "How can you ensure process P2's statement S2 executes only after P1's S1 AND P3's S3 have both executed, using semaphores?",
    options: ["One semaphore initialised to 2", "Two semaphores a and b initialised to 0: P1 does S1; signal(a). P3 does S3; signal(b). P2 does wait(a); wait(b); S2", "A mutex around all three statements", "It's impossible with semaphores"],
    answer: 1,
    explanation: "Each precedence edge in a precedence graph can be implemented with one semaphore initialised to 0: the predecessor signals after its statement, and the successor waits before its own. (A single semaphore initialised to 0 with P2 calling wait twice also works.)",
    optionExplanations: ["Starting at 2 lets P2 proceed immediately.", "Correct.", "A mutex doesn't enforce ordering.", "Semaphores handle such constraints easily."]
  },
  {
    id: "os-sync-033", subject: "os", subtopic: "Process Synchronization", difficulty: "hard", type: "concept",
    question: "A semaphore's wait() is implemented as `while (S <= 0); S--;` using ordinary (non-atomic) reads and writes. What's wrong?",
    options: ["Nothing", "It deadlocks immediately", "The check and the decrement aren't atomic: two processes can both see S = 1, both exit the loop, and both decrement, so both enter the critical section (mutual exclusion is violated)", "It's too slow but correct"],
    answer: 2,
    explanation: "Semaphore operations must be atomic. Real implementations use atomic instructions or a lock around the check-and-decrement, plus a wait queue so processes block instead of spinning.",
    optionExplanations: ["The check-then-act sequence races.", "It doesn't deadlock; it fails to exclude.", "Correct.", "It's incorrect, not just slow."],
    tags: ["trap"]
  },
  {
    id: "os-sync-034", subject: "os", subtopic: "Process Synchronization", difficulty: "easy", type: "concept",
    question: "What is a monitor?",
    options: ["A display device", "A type of semaphore initialised to N", "A kernel debugger", "A high-level synchronisation construct that bundles shared data with the procedures that operate on it, guaranteeing only one thread executes inside at a time; condition variables handle waiting"],
    answer: 3,
    explanation: "Java's synchronized methods with wait()/notify() and C#'s lock + Monitor are monitor implementations. Monitors reduce errors like forgetting to release a lock or calling P/V in the wrong order.",
    optionExplanations: ["Not a screen.", "It provides mutual exclusion plus condition variables.", "It's a programming construct.", "Correct."]
  },
  {
    id: "os-sync-035", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "In the sleeping barber problem, what does the barber do when no customers are waiting, and what happens to customers when all waiting chairs are full?",
    options: ["The barber leaves; customers wait outside forever", "Both block forever", "The barber cuts imaginary hair; customers queue without limit", "The barber sleeps until a customer arrives and wakes him; a customer who finds all chairs full leaves"],
    answer: 3,
    explanation: "It models a server with a bounded queue: semaphores track waiting customers and barber availability, with a mutex protecting the waiting-count. Related classic problems include the cigarette smokers problem and the bounded buffer.",
    optionExplanations: ["Neither leaves permanently.", "Correct solutions avoid deadlock.", "The queue is bounded.", "Correct."]
  },
  {
    id: "os-sync-036", subject: "os", subtopic: "Process Synchronization", difficulty: "hard", type: "concept",
    question: "Readers-writers with semaphores: rw_mutex = 1, mutex = 1, read_count = 0. A reader does `wait(mutex); read_count++; if (read_count == 1) wait(rw_mutex); signal(mutex); ...read...; wait(mutex); read_count--; if (read_count == 0) signal(rw_mutex); signal(mutex);`. Why do only the FIRST and LAST readers touch rw_mutex?",
    options: ["To save memory", "The first reader locks writers out on behalf of all readers, letting further readers enter concurrently; the last reader to leave lets writers back in. Readers share, writers get exclusive access", "Because only one reader may read at a time", "It's a bug"],
    answer: 1,
    explanation: "mutex protects read_count itself. This is the readers-preference solution, which allows writer starvation if readers keep arriving.",
    optionExplanations: ["Memory isn't the concern.", "Correct.", "Many readers can read concurrently.", "It's the intended design."]
  },
  {
    id: "os-sync-037", subject: "os", subtopic: "Process Synchronization", difficulty: "medium", type: "concept",
    question: "Is a deadlock-free solution to the dining philosophers problem automatically starvation-free?",
    options: ["Yes, always", "Starvation can't happen with semaphores", "Deadlock and starvation are the same thing", "No: e.g. a philosopher can be repeatedly overtaken by neighbours who keep grabbing the forks, so fairness (bounded waiting) needs extra design"],
    answer: 3,
    explanation: "Deadlock freedom means the system as a whole keeps progressing; starvation freedom means every individual eventually progresses. Some solutions (like 'pick both forks atomically if available') can starve a philosopher whose neighbours alternate eating.",
    optionExplanations: ["Starvation is a separate property.", "Semaphore solutions can still starve processes.", "They're different liveness failures.", "Correct."]
  },
  {
    id: "os-sync-038", subject: "os", subtopic: "Process Synchronization", difficulty: "easy", type: "concept",
    question: "Which statement about mutual exclusion is correct?",
    options: ["It allows all processes in the critical section if they only read", "It prevents all deadlocks", "It guarantees processes run in FIFO order", "It guarantees at most one process executes in the critical section at any time"],
    answer: 3,
    explanation: "Mutual exclusion is the safety property of a critical-section solution. Ordering guarantees and deadlock freedom are separate properties; readers-writers locks deliberately relax exclusivity for readers.",
    optionExplanations: ["That's a readers-writers relaxation.", "Locks can still deadlock.", "Ordering is a fairness property.", "Correct."]
  }
);
