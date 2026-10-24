/* Operating Systems — Deadlocks */
window.QUESTIONS.push(
  {
    id: "os-deadlock-001", subject: "os", subtopic: "Deadlocks", difficulty: "easy", type: "concept",
    question: "What is a deadlock?",
    options: ["A process that runs forever", "A process waiting for I/O", "A set of processes each waiting for an event (usually a resource release) that only another process in the set can cause, so none can ever proceed", "A crashed process"],
    answer: 2,
    explanation: "Classic example: P1 holds resource A and waits for B, while P2 holds B and waits for A. Neither will release what it holds, so both wait forever.",
    optionExplanations: ["That's an infinite loop.", "I/O waits complete eventually.", "Correct.", "A crash isn't a mutual wait."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-deadlock-002", subject: "os", subtopic: "Deadlocks", difficulty: "easy", type: "concept",
    question: "Which four conditions (Coffman conditions) must ALL hold simultaneously for a deadlock to occur?",
    options: ["Mutual exclusion, hold and wait, no preemption, circular wait", "Starvation, preemption, aging, priority", "Race condition, critical section, semaphore, monitor", "Paging, segmentation, swapping, thrashing"],
    answer: 0,
    explanation: "Mutual exclusion: resources are non-shareable. Hold and wait: a process holds resources while requesting more. No preemption: resources can't be forcibly taken away. Circular wait: a cycle of processes, each waiting for the next. Breaking any one prevents deadlock.",
    optionExplanations: ["Correct.", "Those are scheduling concepts.", "Those are synchronisation concepts.", "Those are memory-management concepts."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-deadlock-003", subject: "os", subtopic: "Deadlocks", difficulty: "easy", type: "concept",
    question: "In a resource allocation graph (RAG), what do the two kinds of edges mean?",
    options: ["A request edge P → R means process P is waiting for resource R; an assignment edge R → P means an instance of R is held by P", "Both mean 'is waiting for'", "Edges show CPU scheduling order", "R → P means P is requesting R"],
    answer: 0,
    explanation: "Processes are circles, resource types are rectangles with dots for instances. When a request is granted, the request edge flips into an assignment edge.",
    optionExplanations: ["Correct.", "The directions have different meanings.", "RAGs model resources, not scheduling.", "That's an assignment edge."]
  },
  {
    id: "os-deadlock-004", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "concept",
    question: "A resource allocation graph contains a cycle. When does this cycle GUARANTEE a deadlock?",
    options: ["Always", "When every resource type in the cycle has exactly ONE instance; with multiple instances, a cycle is necessary but not sufficient", "Never", "Only when there are more than three processes"],
    answer: 1,
    explanation: "With single-instance resources, a cycle means each process waits for a resource held by the next one with no alternative source, so deadlock is certain. With multiple instances, a process outside the cycle may release an instance and break the wait.",
    optionExplanations: ["Multiple instances can break the cycle.", "Correct.", "With single instances, a cycle is a deadlock.", "The number of processes doesn't matter."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-deadlock-005", subject: "os", subtopic: "Deadlocks", difficulty: "hard", type: "concept",
    question: "Resource type R has 2 instances: one held by P1, one held by P3. P1 requests R1 (single instance), which is held by P2, and P2 requests R. P3 isn't waiting for anything. Is there a deadlock?",
    options: ["Yes: the cycle P1 → R1 → P2 → R → P1 means deadlock", "Yes, because R has two instances", "No: there is a cycle, but P3 can finish and release its instance of R, which is then given to P2; P2 finishes and releases R1 for P1", "It's impossible to tell"],
    answer: 2,
    explanation: "With multi-instance resources, check whether some ordering lets processes finish (like the detection algorithm): P3 completes → R freed → P2 gets R → P2 completes → R1 freed → P1 proceeds. No deadlock despite the cycle.",
    optionExplanations: ["A cycle isn't sufficient with multiple instances.", "Multiple instances make deadlock less likely, not certain.", "Correct.", "The detection procedure gives a definite answer."],
    tags: ["trap"]
  },
  {
    id: "os-deadlock-006", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "concept",
    question: "Which deadlock PREVENTION technique attacks the circular-wait condition?",
    options: ["Allow resource sharing", "Make processes request all resources at once", "Impose a total ordering on resource types and require every process to request resources in increasing order", "Preempt resources from waiting processes"],
    answer: 2,
    explanation: "If everyone acquires locks in the same global order (e.g. by lock address or id), a cycle can't form. Requesting everything at once attacks hold-and-wait; preemption attacks no-preemption; sharing (e.g. read-only files) attacks mutual exclusion.",
    optionExplanations: ["That targets mutual exclusion.", "That targets hold-and-wait.", "Correct.", "That targets no-preemption."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-deadlock-007", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "concept",
    question: "What's the drawback of preventing deadlock by requiring processes to request ALL their resources before starting (breaking hold-and-wait)?",
    options: ["It causes deadlock", "It requires circular waits", "Low resource utilisation (resources sit allocated but unused for long periods) and possible starvation of processes needing many popular resources; processes may not know all needs in advance", "It's impossible to implement"],
    answer: 2,
    explanation: "An alternative is to require a process to release everything it holds before requesting more. Both approaches are safe but wasteful, which is why resource ordering is more common in practice.",
    optionExplanations: ["It prevents deadlock.", "It eliminates hold-and-wait.", "Correct.", "It's simple to implement."]
  },
  {
    id: "os-deadlock-008", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "concept",
    question: "In deadlock avoidance, what is the relationship between UNSAFE states and deadlock?",
    options: ["Every unsafe state is a deadlock", "An unsafe state is not necessarily deadlocked, but it MAY lead to deadlock; a safe state guarantees deadlock can be avoided. Avoidance algorithms never enter unsafe states", "Safe states always contain a deadlock", "They're unrelated"],
    answer: 1,
    explanation: "A state is safe if there exists a sequence in which every process can obtain its maximum remaining need and finish. Deadlocked states are a subset of unsafe states. Banker's algorithm grants a request only if the resulting state is still safe.",
    optionExplanations: ["Deadlocks are a subset of unsafe states.", "Correct.", "Safe states contain no deadlock.", "Avoidance depends on this relationship."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-deadlock-009", subject: "os", subtopic: "Deadlocks", difficulty: "easy", type: "concept",
    question: "In Banker's algorithm, how is the Need matrix computed?",
    options: ["Need = Max + Allocation", "Need = Available − Allocation", "Need = Max − Allocation", "Need = Allocation − Max"],
    answer: 2,
    explanation: "Each process declares its maximum demand. Need[i][j] is how many more instances of resource j process i may still request. A process can finish if Need[i] ≤ Available (componentwise).",
    optionExplanations: ["Need is what remains to be requested.", "Available is shared, not per-process.", "Correct.", "That's negative of the correct value."]
  },
  {
    id: "os-deadlock-010", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "numerical",
    question: "Resources A, B, C. Available = (3, 3, 2). Allocation: P0 (0,1,0), P1 (2,0,0), P2 (3,0,2), P3 (2,1,1), P4 (0,0,2). Max: P0 (7,5,3), P1 (3,2,2), P2 (9,0,2), P3 (2,2,2), P4 (4,3,3). What is P0's Need?",
    options: ["(7, 5, 3)", "(7, 4, 3)", "(4, 4, 1)", "(0, 1, 0)"],
    answer: 1,
    explanation: "Need = Max − Allocation = (7 − 0, 5 − 1, 3 − 0) = (7, 4, 3). The full Need matrix: P0 (7,4,3), P1 (1,2,2), P2 (6,0,0), P3 (0,1,1), P4 (4,3,1).",
    optionExplanations: ["That's Max.", "Correct.", "That subtracts Available instead of Allocation.", "That's the Allocation."]
  },
  {
    id: "os-deadlock-011", subject: "os", subtopic: "Deadlocks", difficulty: "hard", type: "numerical",
    question: "Same system: Available (3,3,2); Need: P0 (7,4,3), P1 (1,2,2), P2 (6,0,0), P3 (0,1,1), P4 (4,3,1); Allocation: P0 (0,1,0), P1 (2,0,0), P2 (3,0,2), P3 (2,1,1), P4 (0,0,2). Which is a SAFE sequence?",
    options: ["P1, P3, P4, P0, P2", "P0, P1, P2, P3, P4", "P2, P1, P3, P4, P0", "P4, P3, P1, P0, P2"],
    answer: 0,
    explanation: "Work = (3,3,2). P1 needs (1,2,2) ≤ work → finish, work = (5,3,2). P3 (0,1,1) → work (7,4,3). P4 (4,3,1) → work (7,4,5). P0 (7,4,3) → work (7,5,5). P2 (6,0,0) → work (10,5,7). All finish: safe. The others fail at the first step: P0 needs 7 A, P2 needs 6 A, P4 needs 4 A, but only 3 are available.",
    optionExplanations: ["Correct.", "P0's need (7,4,3) exceeds Available.", "P2 needs 6 of A, but only 3 are available.", "P4 needs 4 of A, but only 3 are available."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-deadlock-012", subject: "os", subtopic: "Deadlocks", difficulty: "hard", type: "numerical",
    question: "Same system (Available (3,3,2), the system is safe). P1 requests (1, 0, 2). Should Banker's algorithm grant it?",
    options: ["No: Request exceeds P1's Need", "Yes: Request ≤ Need (1,2,2) and ≤ Available; after pretending to allocate, Available = (2,3,0) and the sequence P1, P3, P4, P0, P2 still works, so the state is safe", "No: the resulting state is unsafe", "Yes, always grant requests that fit in Available"],
    answer: 1,
    explanation: "Resource-request algorithm: (1) Request ≤ Need, else error; (2) Request ≤ Available, else wait; (3) tentatively allocate and run the safety algorithm. With P1's allocation now (3,0,2) and need (0,2,0), P1 can finish first from (2,3,0), and the rest follow. Safe → grant.",
    optionExplanations: ["(1,0,2) ≤ (1,2,2).", "Correct.", "The safety check succeeds.", "Fitting in Available is necessary but not sufficient."]
  },
  {
    id: "os-deadlock-013", subject: "os", subtopic: "Deadlocks", difficulty: "hard", type: "numerical",
    question: "After granting P1's request, Available = (2,3,0); Allocation P0 (0,1,0), P1 (3,0,2), P2 (3,0,2), P3 (2,1,1), P4 (0,0,2); Need P0 (7,4,3), P1 (0,2,0), P2 (6,0,0), P3 (0,1,1), P4 (4,3,1). Now P0 requests (0, 2, 0). Should it be granted?",
    options: ["Yes: it fits in Available and Need", "No: although (0,2,0) ≤ Need and ≤ Available, the resulting state (Available (2,1,0)) is UNSAFE — no process's Need fits, so P0 must wait", "No: it exceeds P0's Need", "Yes: P0 has the highest priority"],
    answer: 1,
    explanation: "Tentatively: P0 allocation (0,3,0), need (7,2,3), Available (2,1,0). Check each need: P0 (7,2,3) ✗, P1 (0,2,0) ✗ (B: 2 > 1), P2 (6,0,0) ✗, P3 (0,1,1) ✗ (C: 1 > 0), P4 (4,3,1) ✗. Nobody can finish → unsafe → deny (P0 waits).",
    optionExplanations: ["Fitting isn't enough; safety must be checked.", "Correct.", "(0,2,0) ≤ (7,4,3).", "Banker's algorithm doesn't use priorities."]
  },
  {
    id: "os-deadlock-014", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "numerical",
    question: "12 tape drives total. P0: max 10, holds 5. P1: max 4, holds 2. P2: max 9, holds 2. Is the current state safe?",
    options: ["Unsafe", "Safe only with P2 first", "Safe, with sequence P1, P0, P2", "Deadlocked"],
    answer: 2,
    explanation: "Allocated = 9, so Available = 3. Needs: P0 5, P1 2, P2 7. P1 (2 ≤ 3) finishes → Available 5; P0 (5 ≤ 5) finishes → Available 10; P2 (7 ≤ 10) finishes. Safe sequence ⟨P1, P0, P2⟩.",
    optionExplanations: ["A safe sequence exists.", "P2 needs 7 but only 3 are available initially.", "Correct.", "Nobody is blocked in a cycle."]
  },
  {
    id: "os-deadlock-015", subject: "os", subtopic: "Deadlocks", difficulty: "hard", type: "numerical",
    question: "Same 12 tape drives (P0: max 10, holds 5; P1: max 4, holds 2; P2: max 9, holds 2). P2 requests 1 more drive. If granted, is the resulting state safe?",
    options: ["Safe: P1, P0, P2", "Safe: P2, P1, P0", "Unsafe: Available becomes 2; P1 can finish (→ 4 available), but then P0 needs 5 and P2 needs 6, so neither can finish", "Deadlocked immediately"],
    answer: 2,
    explanation: "After granting: holds 5, 2, 3 → Available = 2. Needs: P0 5, P1 2, P2 6. Only P1 can finish, freeing 2 → Available 4. P0 needs 5 and P2 needs 6 → stuck. Unsafe, so Banker's algorithm makes P2 wait even though a drive is free. (Unsafe doesn't mean deadlocked yet.)",
    optionExplanations: ["After P1, only 4 drives are free.", "P2 needs 6 drives, not available.", "Correct.", "Unsafe isn't the same as deadlocked."]
  },
  {
    id: "os-deadlock-016", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "numerical",
    question: "3 processes share identical resource units; each process needs at most 4 units to complete. What is the MINIMUM number of units that guarantees deadlock can never occur?",
    options: ["10", "9", "12", "4"],
    answer: 0,
    explanation: "Worst case: each process holds (max − 1) = 3 units and waits for one more: 3 × 3 = 9 units allocated with nobody able to finish. One more unit lets some process complete and release its units. Minimum = Σ(maxᵢ − 1) + 1 = 9 + 1 = 10.",
    optionExplanations: ["Correct.", "With 9, all three can hold 3 and wait forever.", "12 is enough but not the minimum.", "4 units can't even satisfy all processes in turn without risk."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-deadlock-017", subject: "os", subtopic: "Deadlocks", difficulty: "hard", type: "numerical",
    question: "A system has 6 identical resource units, and each process needs at most 2 units. What is the MAXIMUM number of processes for which the system is guaranteed deadlock-free?",
    options: ["3", "4", "6", "5"],
    answer: 3,
    explanation: "Deadlock-free if units ≥ n(max − 1) + 1 → 6 ≥ n(1) + 1 → n ≤ 5. With 5 processes, even if each holds 1 unit, 1 unit remains for someone to finish. With 6 processes each holding 1, all wait forever.",
    optionExplanations: ["More processes are still safe.", "5 is still safe.", "6 processes could each hold 1 unit and wait.", "Correct."]
  },
  {
    id: "os-deadlock-018", subject: "os", subtopic: "Deadlocks", difficulty: "hard", type: "numerical",
    question: "Processes P1, P2, P3 need at most 3, 4 and 5 units of a resource respectively. What is the minimum number of units that guarantees no deadlock?",
    options: ["10", "12", "9", "13"],
    answer: 0,
    explanation: "Worst case: each holds one less than its maximum: (3 − 1) + (4 − 1) + (5 − 1) = 2 + 3 + 4 = 9, all waiting. One extra unit (total 10) lets some process complete. Minimum = 9 + 1 = 10.",
    optionExplanations: ["Correct.", "12 is the sum of maximums, more than needed.", "With 9 units all three can be stuck.", "Far more than needed."]
  },
  {
    id: "os-deadlock-019", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "concept",
    question: "For single-instance resources, what graph does a deadlock detection algorithm typically use, and what does it look for?",
    options: ["A precedence graph; topological order", "A process tree; orphan nodes", "A page table; invalid entries", "A wait-for graph (processes only: an edge Pi → Pj means Pi waits for a resource held by Pj); a cycle means deadlock"],
    answer: 3,
    explanation: "The wait-for graph collapses resource nodes out of the RAG. Cycle detection costs O(n²) (or O(n + e) with DFS). For multiple instances, a Banker's-like algorithm using current Requests (instead of maximum Needs) is used.",
    optionExplanations: ["That's used for serializability in databases.", "Process trees show parentage, not waiting.", "Page tables are unrelated.", "Correct."]
  },
  {
    id: "os-deadlock-020", subject: "os", subtopic: "Deadlocks", difficulty: "hard", type: "numerical",
    question: "Detection algorithm, resources A, B, C with Available (0,0,0). Allocation: P0 (0,1,0), P1 (2,0,0), P2 (3,0,3), P3 (2,1,1), P4 (0,0,2). Request: P0 (0,0,0), P1 (2,0,2), P2 (0,0,0), P3 (1,0,0), P4 (0,0,2). Is the system deadlocked?",
    options: ["Yes, all processes are deadlocked", "It can't be determined without Max", "Yes: P1 and P4 are deadlocked", "No: P0 and P2 request nothing and can finish, releasing (3,1,3); then P3, P4 and P1 can all finish"],
    answer: 3,
    explanation: "Work = (0,0,0). P0 (request 0) finishes → work (0,1,0). P2 (request 0) → work (3,1,3). P3 needs (1,0,0) ✓ → (5,2,4). P4 needs (0,0,2) ✓ → (5,2,6). P1 needs (2,0,2) ✓ → (7,2,6). All finish: no deadlock. Detection uses current requests, not maximum needs.",
    optionExplanations: ["Several processes can finish.", "Detection uses Request, not Max.", "P1 and P4 can finish once others release resources.", "Correct."]
  },
  {
    id: "os-deadlock-021", subject: "os", subtopic: "Deadlocks", difficulty: "hard", type: "numerical",
    question: "Same detection scenario, but now P2 additionally requests one instance of C, so Request P2 = (0,0,1). Which processes are deadlocked?",
    options: ["P1, P2, P3 and P4", "None", "Only P2", "All five, including P0"],
    answer: 0,
    explanation: "Work = (0,0,0). Only P0 can finish (request 0) → work (0,1,0). Now P1 needs (2,0,2), P2 (0,0,1), P3 (1,0,0), P4 (0,0,2): none fits in (0,1,0). P1, P2, P3 and P4 remain unfinished → they are deadlocked.",
    optionExplanations: ["Correct.", "The new request blocks the chain.", "Others also can't proceed.", "P0 can still finish."]
  },
  {
    id: "os-deadlock-022", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "concept",
    question: "After detecting a deadlock, which recovery options exist?",
    options: ["Only rebooting", "Abort all deadlocked processes, or abort them one at a time until the cycle breaks (choosing victims by cost: priority, work done, resources held), or preempt resources and roll processes back to a safe checkpoint", "Wait for the deadlock to resolve itself", "Increase the time quantum"],
    answer: 1,
    explanation: "Victim selection should minimise cost and avoid repeatedly choosing the same process (starvation), e.g. by counting rollbacks in the cost. Databases recover from deadlocks by aborting a victim transaction.",
    optionExplanations: ["Finer-grained options exist.", "Correct.", "A deadlock never resolves by itself.", "Scheduling parameters don't break deadlocks."]
  },
  {
    id: "os-deadlock-023", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "concept",
    question: "Most general-purpose operating systems (Linux, Windows) handle deadlocks in user programs how?",
    options: ["With Banker's algorithm for every lock", "They largely ignore them (the 'ostrich algorithm'), leaving prevention to application developers, because avoidance/detection is costly and deadlocks are relatively rare", "They detect and kill deadlocked threads automatically", "Deadlocks can't happen on these systems"],
    answer: 1,
    explanation: "Banker's algorithm needs maximum demands in advance, which programs rarely know. Tools such as lock-order validators (Linux lockdep for the kernel, ThreadSanitizer) help developers find potential deadlocks instead.",
    optionExplanations: ["Max demands are unknown in practice.", "Correct.", "User-level deadlocks aren't resolved automatically.", "They definitely can happen."]
  },
  {
    id: "os-deadlock-024", subject: "os", subtopic: "Deadlocks", difficulty: "easy", type: "concept",
    question: "Two threads: T1 locks mutex A then mutex B; T2 locks mutex B then mutex A. What's the simplest way to make deadlock impossible?",
    options: ["Make both threads acquire the locks in the same order (e.g. always A before B)", "Add sleep() calls", "Use more threads", "Increase CPU speed"],
    answer: 0,
    explanation: "A consistent global lock order eliminates the circular-wait condition. Other options: acquire both with a try-lock and back off on failure, or use a single coarser lock.",
    optionExplanations: ["Correct.", "Timing tweaks only make it rarer.", "More threads don't help.", "Speed doesn't remove the circular wait."]
  },
  {
    id: "os-deadlock-025", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "concept",
    question: "How do starvation and deadlock differ?",
    options: ["They're the same", "Deadlock only affects one process", "Starvation only happens with semaphores", "In deadlock, a set of processes waits on each other forever and none progress; in starvation, a process waits indefinitely while others continue to make progress (e.g. always losing to higher priorities)"],
    answer: 3,
    explanation: "Deadlock is a global standstill of the involved processes; starvation is unfairness. Aging addresses starvation; breaking Coffman conditions addresses deadlock. Livelock is a third case: processes are active but make no progress.",
    optionExplanations: ["They're different failure modes.", "Deadlock involves at least two processes (a cycle).", "Starvation arises in scheduling and locking generally.", "Correct."]
  },
  {
    id: "os-deadlock-026", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "concept",
    question: "Why can't deadlock usually be prevented by breaking the MUTUAL EXCLUSION condition?",
    options: ["Because mutual exclusion isn't one of the conditions", "Many resources are intrinsically non-shareable (a mutex, a printer, a write lock); you can only avoid mutual exclusion for shareable resources like read-only files", "Because it would make programs faster", "Because the OS forbids it"],
    answer: 1,
    explanation: "Spooling makes some devices appear shareable (a printer spooler), and lock-free algorithms avoid mutual exclusion for some data structures, but in general exclusive access is required for correctness.",
    optionExplanations: ["It's the first Coffman condition.", "Correct.", "Speed isn't the reason.", "It's a property of resources, not a policy."]
  },
  {
    id: "os-deadlock-027", subject: "os", subtopic: "Deadlocks", difficulty: "hard", type: "concept",
    question: "Banker's algorithm is rarely used in general-purpose OS kernels. Which is NOT a reason?",
    options: ["Processes must declare maximum resource needs in advance", "The number of processes and resources changes dynamically", "Running the safety algorithm on every request costs O(m·n²)", "It cannot guarantee deadlock freedom"],
    answer: 3,
    explanation: "When its assumptions hold, Banker's algorithm DOES guarantee the system never enters an unsafe state, so deadlock can't occur. The practical problems are its assumptions (known maximums, fixed sets of processes/resources) and its runtime cost.",
    optionExplanations: ["This is a real limitation.", "This is a real limitation.", "This is a real cost.", "Correct: this statement is false; it does guarantee deadlock freedom."]
  },
  {
    id: "os-deadlock-028", subject: "os", subtopic: "Deadlocks", difficulty: "medium", type: "concept",
    question: "How can resource preemption be used to break deadlocks, and what are its challenges?",
    options: ["Take resources away from some process (the victim) and give them to others; challenges include choosing the victim, rolling the victim back to a safe state (or restarting it), and avoiding starving the same victim repeatedly", "It can't be used", "It always works without cost", "Only for CPU time"],
    answer: 0,
    explanation: "Preemption works naturally for resources whose state can be saved and restored (CPU registers, memory pages via swapping). For things like a half-printed document or a held lock protecting inconsistent data, rollback is required.",
    optionExplanations: ["Correct.", "It's a standard recovery technique.", "Rollback and victim choice have costs.", "Other resources can be preempted too."]
  },
  {
    id: "os-deadlock-029", subject: "os", subtopic: "Deadlocks", difficulty: "hard", type: "concept",
    question: "Processes P1, P2, P3 each hold one lock and request another: P1 holds L1 wants L2; P2 holds L2 wants L3; P3 holds L3 wants nothing more and is running. What is the state?",
    options: ["Deadlock among all three", "Livelock", "Deadlock between P1 and P2", "No deadlock: P3 can finish and release L3, letting P2 finish and release L2, which lets P1 proceed — the waits form a chain, not a cycle"],
    answer: 3,
    explanation: "Draw the wait-for graph: P1 → P2 → P3, with no edge back to P1. Without a cycle there's no circular wait, so no deadlock. If P3 instead wanted L1, the cycle P1 → P2 → P3 → P1 would be a deadlock.",
    optionExplanations: ["There's no cycle.", "The processes are blocked waiting, not spinning.", "P2 can eventually get L3.", "Correct."]
  },
  {
    id: "os-deadlock-030", subject: "os", subtopic: "Deadlocks", difficulty: "easy", type: "concept",
    question: "Which statement about deadlock prevention vs avoidance is correct?",
    options: ["They're the same", "Prevention detects deadlocks after they occur", "Avoidance requires no knowledge of future requests", "Prevention structurally rules out one of the four Coffman conditions (e.g. lock ordering); avoidance allows all conditions but checks each request at runtime against future needs to stay in a safe state (Banker's algorithm)"],
    answer: 3,
    explanation: "The overall strategies are: prevention, avoidance, detection + recovery, and ignoring the problem. Prevention is static and conservative; avoidance is dynamic and needs advance knowledge; detection allows deadlocks and fixes them afterwards.",
    optionExplanations: ["They work differently.", "That's detection.", "Avoidance needs maximum demands.", "Correct."]
  }
);
