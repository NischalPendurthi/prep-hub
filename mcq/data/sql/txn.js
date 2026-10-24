/* SQL / DBMS — Transactions & Concurrency */
window.QUESTIONS.push(
  {
    id: "sql-txn-001", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "easy", type: "concept",
    question: "What does ACID stand for?",
    options: ["Availability, Consistency, Isolation, Distribution", "Accuracy, Consistency, Indexing, Durability", "Atomicity, Concurrency, Integrity, Durability", "Atomicity, Consistency, Isolation, Durability"],
    answer: 3,
    explanation: "Atomicity: all of a transaction's changes happen or none do. Consistency: a transaction moves the database from one valid state to another (constraints hold). Isolation: concurrent transactions don't see each other's intermediate states (to the degree of the isolation level). Durability: once committed, changes survive crashes.",
    optionExplanations: ["Availability and Distribution belong to CAP-style discussions.", "Accuracy and Indexing aren't ACID properties.", "C is Consistency and I is Isolation.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-txn-002", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "easy", type: "concept",
    question: "A bank transfer debits account A and credits account B. The server crashes after the debit but before the credit. Which ACID property guarantees the debit is undone on recovery?",
    options: ["Consistency", "Durability", "Isolation", "Atomicity"],
    answer: 3,
    explanation: "Atomicity means the transaction is all-or-nothing. On restart, the recovery manager uses the log to roll back (undo) changes of transactions that never committed, so the half-finished transfer disappears.",
    optionExplanations: ["Consistency is the goal, but the all-or-nothing guarantee is atomicity.", "Durability concerns committed transactions surviving crashes.", "Isolation concerns concurrent transactions.", "Correct."]
  },
  {
    id: "sql-txn-003", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "easy", type: "concept",
    question: "Which DBMS component is primarily responsible for each of Atomicity/Durability vs Isolation?",
    options: ["Query optimizer vs index manager", "Buffer manager vs parser", "Both are handled by the application", "Recovery manager (logging: undo/redo) vs concurrency control (locks/MVCC)"],
    answer: 3,
    explanation: "Write-ahead logging lets the recovery manager undo uncommitted work (atomicity) and redo committed work after a crash (durability). Concurrency control (locking or MVCC) provides isolation. Consistency is shared by constraints, triggers and correct application logic.",
    optionExplanations: ["Those components affect performance, not ACID.", "Those components don't provide these guarantees.", "The DBMS provides these guarantees.", "Correct."]
  },
  {
    id: "sql-txn-004", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "easy", type: "query",
    question: "t starts empty. Which rows exist after this script?",
    code: "BEGIN;\nINSERT INTO t VALUES (1);\nSAVEPOINT s1;\nINSERT INTO t VALUES (2);\nROLLBACK TO SAVEPOINT s1;\nINSERT INTO t VALUES (3);\nCOMMIT;",
    options: ["1, 2, 3", "None", "3", "1, 3"],
    answer: 3,
    explanation: "ROLLBACK TO SAVEPOINT undoes only the work done after the savepoint (inserting 2) while keeping the transaction open. The later insert and the COMMIT persist rows 1 and 3.",
    optionExplanations: ["Row 2 was rolled back.", "The transaction commits.", "Row 1 was inserted before the savepoint.", "Correct."]
  },
  {
    id: "sql-txn-005", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "easy", type: "concept",
    question: "What is a dirty read?",
    options: ["Reading data from a corrupted disk", "Reading the same row twice and getting different committed values", "Reading data written by another transaction that has NOT yet committed (and may still roll back)", "Seeing new rows appear in a repeated range query"],
    answer: 2,
    explanation: "If T2 reads T1's uncommitted change and T1 then rolls back, T2 acted on data that never officially existed. Only READ UNCOMMITTED allows dirty reads.",
    optionExplanations: ["It's a concurrency anomaly, not hardware corruption.", "That's a non-repeatable read.", "Correct.", "That's a phantom read."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-txn-006", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "T1 reads row 7 (salary 5000). T2 updates row 7 to 6000 and COMMITS. T1 reads row 7 again and sees 6000. Which anomaly is this, and which is the lowest standard isolation level that prevents it?",
    options: ["Non-repeatable read; REPEATABLE READ", "Dirty read; READ COMMITTED", "Phantom read; SERIALIZABLE", "Lost update; READ UNCOMMITTED"],
    answer: 0,
    explanation: "A non-repeatable read is the same row returning different COMMITTED values within one transaction. READ COMMITTED allows it (each statement sees the latest committed data); REPEATABLE READ prevents it.",
    optionExplanations: ["Correct.", "T2 had committed, so it isn't a dirty read.", "A phantom involves new rows matching a predicate.", "No update was overwritten."]
  },
  {
    id: "sql-txn-007", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "T1 runs `SELECT COUNT(*) FROM orders WHERE amount > 100` and gets 10. T2 inserts a qualifying order and commits. T1 repeats the query and gets 11. Which anomaly is this?",
    options: ["Dirty read", "Non-repeatable read", "Phantom read", "Write skew"],
    answer: 2,
    explanation: "A phantom is a NEW (or deleted) row appearing in the result of a repeated predicate query. Row-level locks on existing rows can't prevent it; it needs predicate/range locks (e.g. InnoDB next-key locks) or snapshot/serializable isolation.",
    optionExplanations: ["T2 had committed.", "Existing rows didn't change; a new row appeared.", "Correct.", "Write skew involves two transactions writing based on overlapping reads."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-txn-008", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "According to the SQL standard, which anomalies does each isolation level PREVENT?",
    options: ["READ COMMITTED: dirty reads; REPEATABLE READ: dirty + non-repeatable reads; SERIALIZABLE: dirty, non-repeatable and phantom reads", "READ UNCOMMITTED: dirty reads; READ COMMITTED: none", "All levels prevent all anomalies", "REPEATABLE READ prevents phantoms but allows dirty reads"],
    answer: 0,
    explanation: "Standard table: READ UNCOMMITTED allows all three anomalies; READ COMMITTED prevents dirty reads; REPEATABLE READ also prevents non-repeatable reads; SERIALIZABLE prevents phantoms too (results are equivalent to some serial order). Real engines often exceed the minimum (e.g. PostgreSQL's REPEATABLE READ also prevents phantoms).",
    optionExplanations: ["Correct.", "READ UNCOMMITTED prevents nothing; READ COMMITTED prevents dirty reads.", "Lower levels trade anomalies for concurrency.", "Higher levels always prevent dirty reads."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-txn-009", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "What are the DEFAULT isolation levels of MySQL InnoDB and PostgreSQL?",
    options: ["Both SERIALIZABLE", "MySQL InnoDB: READ COMMITTED; PostgreSQL: REPEATABLE READ", "MySQL InnoDB: REPEATABLE READ; PostgreSQL: READ COMMITTED", "Both READ UNCOMMITTED"],
    answer: 2,
    explanation: "InnoDB defaults to REPEATABLE READ (using consistent snapshots plus next-key locking). PostgreSQL, Oracle and SQL Server default to READ COMMITTED. Applications ported between them can behave differently under concurrency.",
    optionExplanations: ["SERIALIZABLE is too costly to be the default.", "Reversed.", "Correct.", "No major database defaults to READ UNCOMMITTED."],
    tags: ["trap"]
  },
  {
    id: "sql-txn-010", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "numerical",
    question: "balance = 100. T1 and T2 each run `read balance; balance = balance + 50; write balance` concurrently with this interleaving: T1 reads, T2 reads, T1 writes, T2 writes. What is the final balance, and what is the anomaly called?",
    options: ["200; no anomaly", "250; phantom read", "100; dirty read", "150; lost update"],
    answer: 3,
    explanation: "Both read 100 and compute 150. T1 writes 150, then T2 overwrites it with 150, so T1's increment is lost: 150 instead of 200. Fixes: atomic UPDATE ... SET balance = balance + 50, SELECT ... FOR UPDATE, optimistic version checks, or a stricter isolation level.",
    optionExplanations: ["One of the increments is overwritten.", "No rows were added.", "Both writes happened; nothing uncommitted was read.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-txn-011", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "numerical",
    question: "Is this schedule conflict-serializable?  R1(A) W2(A) W1(A)",
    options: ["Yes, equivalent to T1 then T2", "Yes, equivalent to T2 then T1", "No: the precedence graph has a cycle T1 → T2 → T1", "Yes, because it has only two transactions"],
    answer: 2,
    explanation: "Conflicting pairs (same item, different transactions, at least one write): R1(A) before W2(A) gives T1 → T2; W2(A) before W1(A) gives T2 → T1. A cycle means no serial order is conflict-equivalent. This is exactly the lost-update pattern.",
    optionExplanations: ["W2(A) before W1(A) contradicts T1 then T2.", "R1(A) before W2(A) contradicts T2 then T1.", "Correct.", "Two transactions can still form a cycle."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-txn-012", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "numerical",
    question: "Is this schedule conflict-serializable, and if so to which serial order?  R1(A) W1(A) R2(A) W2(A) R1(B) W1(B) R2(B) W2(B)",
    options: ["No, it has a cycle", "Yes, T1 → T2", "Yes, T2 → T1", "Only view-serializable"],
    answer: 1,
    explanation: "Every conflict on A and on B has T1's operation before T2's, so the precedence graph has the single edge T1 → T2: acyclic and equivalent to the serial schedule T1, T2. Interleaving doesn't matter as long as conflicts all point the same way.",
    optionExplanations: ["All edges point from T1 to T2.", "Correct.", "No conflict has T2 before T1.", "It's conflict-serializable, which implies view-serializable."]
  },
  {
    id: "sql-txn-013", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "hard", type: "numerical",
    question: "Draw the precedence graph for this schedule. Is it conflict-serializable, and in which order?  R2(A) R1(B) W2(A) R3(A) W1(B) W3(A) R2(B) W2(B)",
    options: ["Serializable as T1, T2, T3", "Not serializable (cycle)", "Serializable as T2, T1, T3", "Serializable as T3, T2, T1"],
    answer: 0,
    explanation: "On B: R1(B) and W1(B) precede R2(B)/W2(B) → T1 → T2. On A: R2(A)/W2(A) precede R3(A)/W3(A) → T2 → T3. No edge points backwards, so the graph is acyclic and the topological order T1, T2, T3 is the equivalent serial schedule.",
    optionExplanations: ["Correct.", "There's no back edge.", "T1 must precede T2 because of B.", "T2 must precede T3 because of A."]
  },
  {
    id: "sql-txn-014", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "hard", type: "numerical",
    question: "Is this schedule conflict-serializable?  R1(A) R2(B) W1(B) W2(A)",
    options: ["Yes, as T1, T2", "Yes, as T2, T1", "No: R1(A) → W2(A) gives T1 → T2 and R2(B) → W1(B) gives T2 → T1", "Yes, because no transaction writes the same item twice"],
    answer: 2,
    explanation: "Each transaction reads an item the other later writes, creating edges in both directions. With a cycle there's no equivalent serial order. Under 2PL, this interleaving couldn't occur (it would block, or deadlock).",
    optionExplanations: ["R2(B) before W1(B) forces T2 before T1.", "R1(A) before W2(A) forces T1 before T2.", "Correct.", "Serializability depends on conflict order, not repeated writes."]
  },
  {
    id: "sql-txn-015", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "hard", type: "concept",
    question: "Schedule S: R1(A) W2(A) W1(A) W3(A) (all transactions commit). Which statement is true?",
    options: ["S is conflict-serializable", "S is neither conflict- nor view-serializable", "S is not conflict-serializable, but it is VIEW-serializable (equivalent to T1, T2, T3) because of the blind writes", "S is serial"],
    answer: 2,
    explanation: "Conflict graph: T1 → T2 (R1 before W2), T2 → T1 (W2 before W1), plus edges into T3 → cycle. View-equivalence only needs the same reads-from relationships and the same final writer: T1 reads the initial A (as in T1, T2, T3) and T3 writes A last (as in T1, T2, T3). T2 and T1's writes are 'blind' and overwritten, so S is view-serializable. Every conflict-serializable schedule is view-serializable, but not vice versa.",
    optionExplanations: ["T1 → T2 → T1 is a cycle.", "It matches T1, T2, T3 in view terms.", "Correct.", "Operations of T1 and T2 interleave."]
  },
  {
    id: "sql-txn-016", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "hard", type: "concept",
    question: "T1 writes X; T2 reads X (written by T1) and COMMITS; then T1 aborts. What property does this schedule violate?",
    options: ["It's NOT recoverable: T2 committed based on data from a transaction that later aborted, and T2 can't be undone", "It's recoverable but not cascadeless", "It's strict", "It violates only durability"],
    answer: 0,
    explanation: "Recoverable: if T2 reads from T1, T1 must commit before T2 commits. Cascadeless: transactions read only committed data (avoiding cascading aborts). Strict: no transaction reads or overwrites uncommitted data. Strict ⊂ cascadeless ⊂ recoverable. Strict 2PL produces strict schedules.",
    optionExplanations: ["Correct.", "Because T2 committed first, it isn't even recoverable.", "Strict schedules forbid reading uncommitted data.", "The problem is the commit order, i.e. recoverability."]
  },
  {
    id: "sql-txn-017", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "easy", type: "concept",
    question: "In a standard lock compatibility matrix, which lock pairs can be held on the same item by different transactions at the same time?",
    options: ["Shared + Shared only", "Shared + Exclusive", "Exclusive + Exclusive", "All combinations"],
    answer: 0,
    explanation: "Shared (S, read) locks are compatible with each other, so many readers can proceed together. An Exclusive (X, write) lock is incompatible with any other lock, so a writer needs sole access.",
    optionExplanations: ["Correct.", "A writer can't coexist with readers under locking.", "Two writers would conflict.", "Exclusive locks conflict with everything."]
  },
  {
    id: "sql-txn-018", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "What does Two-Phase Locking (2PL) guarantee, and what doesn't it guarantee?",
    options: ["Guarantees conflict-serializable schedules, but NOT freedom from deadlocks (and basic 2PL allows cascading aborts)", "Guarantees deadlock freedom but not serializability", "Guarantees both serializability and deadlock freedom", "Guarantees neither"],
    answer: 0,
    explanation: "In 2PL each transaction acquires locks in a growing phase and releases them in a shrinking phase, never acquiring after releasing. This ensures serializability (by lock-point order). Transactions can still wait on each other in a cycle (deadlock). STRICT 2PL holds exclusive locks until commit/abort, preventing cascading aborts.",
    optionExplanations: ["Correct.", "It's the other way round.", "Deadlocks are still possible.", "Serializability is guaranteed."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-txn-019", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "How does strict 2PL differ from rigorous 2PL?",
    options: ["They're the same", "Strict 2PL holds all EXCLUSIVE locks until commit/abort; rigorous 2PL holds ALL locks (shared too) until commit/abort", "Strict 2PL never uses shared locks", "Rigorous 2PL releases locks immediately after use"],
    answer: 1,
    explanation: "Both ensure strict (and hence cascadeless) schedules. Rigorous 2PL additionally makes the serialization order equal to the commit order. Most lock-based databases implement strict 2PL for writes.",
    optionExplanations: ["They differ in which locks are held to the end.", "Correct.", "Strict 2PL uses shared locks for reads.", "Holding locks until the end is the point."]
  },
  {
    id: "sql-txn-020", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "T1 locks row A and then requests row B; T2 locks row B and then requests row A. What happens in PostgreSQL or MySQL?",
    options: ["Both wait forever", "A deadlock is detected (cycle in the wait-for graph) and one transaction is aborted as the victim with an error; the other proceeds", "Both transactions are committed", "The database merges the two transactions"],
    answer: 1,
    explanation: "Databases detect deadlocks by periodically checking the wait-for graph for cycles (InnoDB immediately, PostgreSQL after deadlock_timeout). The victim gets an error and should be retried by the application. Acquiring locks in a consistent order (e.g. by id) prevents such deadlocks.",
    optionExplanations: ["Deadlock detection breaks the wait.", "Correct.", "One must be aborted.", "Transactions are never merged."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-txn-021", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "hard", type: "concept",
    question: "Deadlock PREVENTION with timestamps: T_old (older, smaller timestamp) requests a lock held by T_young. What happens under wait-die and under wound-wait?",
    options: ["Wait-die: T_old waits; wound-wait: T_old wounds (aborts) T_young", "Wait-die: T_old dies; wound-wait: T_old waits", "Both: T_old waits", "Both: T_young waits"],
    answer: 0,
    explanation: "Wait-die (non-preemptive): an older requester WAITS; a younger requester DIES (aborts and restarts with its original timestamp). Wound-wait (preemptive): an older requester WOUNDS (aborts) the younger holder; a younger requester waits. Both avoid cycles because waits only go in one age direction, and older transactions eventually complete (no starvation).",
    optionExplanations: ["Correct.", "Older transactions are favoured in both schemes.", "In wound-wait the older one preempts.", "The older requester doesn't simply let the younger wait."]
  },
  {
    id: "sql-txn-022", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "hard", type: "concept",
    question: "Under basic timestamp ordering, TS(T1) = 5 and TS(T2) = 10. T2 has already read X (read-timestamp of X = 10). Now T1 tries to WRITE X. What happens?",
    options: ["The write succeeds", "The write is ignored (Thomas write rule)", "T2 is aborted", "T1 is aborted (and restarted with a new timestamp), because a younger transaction already read the old value of X"],
    answer: 3,
    explanation: "Timestamp ordering enforces the serial order by timestamps. If TS(T) < R-timestamp(X), a younger transaction has already read X; writing now would invalidate that read, so T is rolled back. The Thomas write rule only ignores OBSOLETE writes when TS(T) < W-timestamp(X) (a younger WRITE, not a read, already happened).",
    optionExplanations: ["It would violate timestamp order.", "Thomas' rule applies to a younger write, not a younger read.", "The violating (older) writer is aborted.", "Correct."]
  },
  {
    id: "sql-txn-023", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "What is optimistic concurrency control, typically implemented with a version column?",
    options: ["Reading without locks, then updating with `... WHERE id = ? AND version = ?` (incrementing version); if 0 rows are affected, someone else changed the row and the app retries or reports a conflict", "Locking every row before reading it", "Disabling transactions", "Using SERIALIZABLE for every query"],
    answer: 0,
    explanation: "Optimistic control assumes conflicts are rare: no locks are held while the user thinks, and conflicts are detected at write time. Pessimistic control (SELECT ... FOR UPDATE) locks up front and suits high-contention hotspots.",
    optionExplanations: ["Correct.", "That's pessimistic locking.", "Transactions are still used.", "SERIALIZABLE is a separate mechanism."]
  },
  {
    id: "sql-txn-024", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "What does `SELECT ... FOR UPDATE` do inside a transaction?",
    options: ["It updates the selected rows", "It's a hint that changes the query plan", "It locks the selected rows exclusively until the transaction ends, so other transactions can't update/lock them (pessimistic locking)", "It reads uncommitted data"],
    answer: 2,
    explanation: "It's the standard way to implement read-modify-write safely: e.g. lock an account row, check the balance, then update it. Other writers (and other FOR UPDATE readers) block until commit. Variants: FOR SHARE, NOWAIT, SKIP LOCKED (great for job queues).",
    optionExplanations: ["It only locks; you still run UPDATE.", "It changes locking behaviour, not just the plan.", "Correct.", "It reads committed data."]
  },
  {
    id: "sql-txn-025", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "How does MVCC (multi-version concurrency control) in PostgreSQL let readers and writers avoid blocking each other?",
    options: ["It locks every row on read", "Updates create new row versions; each transaction reads from a consistent snapshot of committed versions, so readers don't block writers and writers don't block readers", "It serializes all transactions", "It keeps only one version of each row"],
    answer: 1,
    explanation: "Each row version carries creation/expiry transaction ids; visibility rules pick the version valid for the reader's snapshot. Writers still block other writers on the same row. Old versions are cleaned up later (VACUUM in PostgreSQL, purge in InnoDB).",
    optionExplanations: ["MVCC avoids read locks.", "Correct.", "Transactions run concurrently.", "Multiple versions are the core idea."]
  },
  {
    id: "sql-txn-026", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "hard", type: "concept",
    question: "Two doctors are on call; the rule is 'at least one must remain on call'. Under SNAPSHOT isolation, T1 and T2 each check that 2 doctors are on call and then each removes a DIFFERENT doctor. Both commit. What anomaly is this?",
    options: ["Dirty read", "Lost update", "Write skew: each transaction's decision relied on data the other changed, but they wrote different rows, so snapshot isolation saw no write-write conflict", "Phantom read only"],
    answer: 2,
    explanation: "Snapshot isolation prevents dirty, non-repeatable and phantom reads and blocks concurrent writes to the SAME row, but it isn't fully serializable. Write skew leaves zero doctors on call. Fixes: SERIALIZABLE (PostgreSQL's SSI detects it), SELECT ... FOR UPDATE on the rows checked, or a materialized constraint.",
    optionExplanations: ["Each transaction read committed data.", "Different rows were updated, so nothing was overwritten.", "Correct.", "The core problem is the invalidated check, i.e. write skew."]
  },
  {
    id: "sql-txn-027", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "What is write-ahead logging (WAL)?",
    options: ["Writing data pages to disk before logging them", "Writing log records describing a change to stable storage BEFORE the modified data pages are written, so the DB can redo committed and undo uncommitted work after a crash", "A backup performed every night", "A log of SQL errors"],
    answer: 1,
    explanation: "The WAL rule allows lazy, batched data-page writes for performance while keeping ACID: at commit only the log must be flushed. After a crash, recovery (e.g. ARIES) redoes logged changes and undoes incomplete transactions. WAL also powers replication and point-in-time recovery.",
    optionExplanations: ["That's the opposite order.", "Correct.", "Backups are separate from WAL.", "WAL records data changes, not errors."]
  },
  {
    id: "sql-txn-028", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "What is the purpose of a checkpoint in a log-based recovery system?",
    options: ["To commit all active transactions", "To lock the database", "To delete the log", "To flush dirty pages and record a point in the log so that crash recovery can start from there instead of from the beginning of the log"],
    answer: 3,
    explanation: "Without checkpoints, recovery would need to scan and redo the entire log since startup. Checkpoints bound recovery time and allow old log segments to be recycled. Frequent checkpoints shorten recovery but add I/O during normal operation.",
    optionExplanations: ["Active transactions continue.", "Checkpoints don't lock the database.", "Only obsolete log segments can be recycled.", "Correct."]
  },
  {
    id: "sql-txn-029", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "During crash recovery, which transactions are REDONE and which are UNDONE?",
    options: ["All transactions are undone", "Only the last transaction is undone", "Committed ones are undone; uncommitted ones are redone", "Transactions that committed before the crash are redone (their effects must persist); transactions active (uncommitted) at the crash are undone"],
    answer: 3,
    explanation: "Redo ensures durability for committed work whose pages may not have reached disk. Undo ensures atomicity for unfinished work whose pages may have reached disk. The log provides before-images (undo) and after-images (redo).",
    optionExplanations: ["Committed work must persist.", "Every in-flight transaction is undone.", "Reversed.", "Correct."]
  },
  {
    id: "sql-txn-030", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "Which statement describes shadow paging?",
    options: ["A form of write-ahead logging", "A replication protocol", "A type of index", "A recovery technique that writes changes to new copies of pages and switches a page-table pointer atomically at commit, so no undo/redo log is needed (but it fragments data and complicates concurrency)"],
    answer: 3,
    explanation: "The original ('shadow') page table remains untouched until commit; aborting just discards the new pages. The idea survives in copy-on-write file systems and some embedded databases (e.g. LMDB), but WAL is preferred in general-purpose DBMSs.",
    optionExplanations: ["Shadow paging avoids a log.", "It's local to one database.", "It's a recovery technique.", "Correct."]
  },
  {
    id: "sql-txn-031", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "hard", type: "concept",
    question: "In two-phase commit (2PC) across several databases, what happens if the coordinator crashes after participants have voted YES (prepared) but before sending the decision?",
    options: ["Participants are blocked holding locks in the prepared state until they learn the decision — 2PC's main weakness", "Participants commit automatically", "Participants abort automatically", "The transaction is split"],
    answer: 0,
    explanation: "Phase 1: the coordinator asks 'prepare'; each participant makes its changes durable and votes. Phase 2: commit if all voted YES, else abort. A prepared participant has promised to commit if told to, so it can't decide unilaterally. That blocking is why systems use 3PC/consensus (Paxos, Raft) or avoid distributed transactions (sagas).",
    optionExplanations: ["Correct.", "They can't know whether everyone voted YES.", "They might abort a transaction the coordinator decided to commit.", "There's no such recovery action."]
  },
  {
    id: "sql-txn-032", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "In MySQL, you run `BEGIN; INSERT INTO t VALUES (1); CREATE TABLE x (id INT); ROLLBACK;`. Is the inserted row still there?",
    options: ["No, ROLLBACK undoes everything", "Yes: CREATE TABLE causes an implicit COMMIT, which commits the INSERT before the ROLLBACK runs", "Only the table x is removed", "The script fails"],
    answer: 1,
    explanation: "In MySQL, DDL statements (CREATE, ALTER, DROP, TRUNCATE...) implicitly commit the current transaction before (and after) executing. PostgreSQL supports transactional DDL, so there the ROLLBACK would undo both. Also note autocommit: without BEGIN, each statement commits on its own.",
    optionExplanations: ["The implicit commit already persisted the insert.", "Correct.", "The table also persists, since DDL committed.", "All statements are valid."],
    tags: ["trap"]
  },
  {
    id: "sql-txn-033", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "easy", type: "concept",
    question: "What is the correct order of a transaction's states when it completes successfully?",
    options: ["Active → Committed → Partially committed", "Active → Partially committed → Committed", "Active → Failed → Committed", "Partially committed → Active → Committed"],
    answer: 1,
    explanation: "Active (executing) → Partially committed (final statement executed, but changes not yet durable) → Committed (log flushed, durable). On error: Active/Partially committed → Failed → Aborted (rolled back), after which it may be restarted or killed.",
    optionExplanations: ["Partially committed comes before committed.", "Correct.", "A failed transaction is aborted, not committed.", "Every transaction starts Active."]
  },
  {
    id: "sql-txn-034", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "medium", type: "concept",
    question: "Why do lock managers use INTENTION locks (IS, IX) at table level when transactions lock individual rows?",
    options: ["To make row locks unnecessary", "So that a request for a table-level lock (e.g. to ALTER or lock the table) can detect conflicting row locks by checking one table-level entry, instead of scanning every row lock", "To allow dirty reads", "To speed up SELECT queries without locks"],
    answer: 1,
    explanation: "Multi-granularity locking: before locking a row in X mode, a transaction places IX on the table. A request for a table S or X lock conflicts with IX, so it waits without inspecting millions of row locks. Coarser granularity reduces locking overhead; finer granularity increases concurrency.",
    optionExplanations: ["Row locks are still taken.", "Correct.", "They don't change read visibility.", "They help lock conflict detection, not lock-free reads."]
  },
  {
    id: "sql-txn-035", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "hard", type: "numerical",
    question: "T1 has 2 operations and T2 has 3 operations. How many distinct schedules (interleavings that preserve each transaction's internal order) exist, and how many of them are serial?",
    options: ["10 schedules, 2 serial", "120 schedules, 2 serial", "6 schedules, 1 serial", "5 schedules, 2 serial"],
    answer: 0,
    explanation: "Choosing which 2 of the 5 positions belong to T1 determines the interleaving: C(5, 2) = 5! / (2! · 3!) = 10. Only 2 are serial (T1 then T2, or T2 then T1). In general n transactions have n! serial schedules.",
    optionExplanations: ["Correct.", "5! = 120 ignores each transaction's fixed internal order.", "C(5, 2) is 10, and there are 2 serial orders.", "5 is the total number of operations."]
  },
  {
    id: "sql-txn-036", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "hard", type: "numerical",
    question: "Is this schedule conflict-serializable?  R1(X) R2(Y) R3(X) W2(X) W1(Y) W3(Y)",
    options: ["Yes, as T1, T2, T3", "Yes, as T3, T2, T1", "No: for example R2(Y) → W1(Y) gives T2 → T1, while R1(X) → W2(X) gives T1 → T2", "Yes, as T2, T3, T1"],
    answer: 2,
    explanation: "Edges: R1(X) before W2(X) → T1 → T2; R3(X) before W2(X) → T3 → T2; R2(Y) before W1(Y) → T2 → T1; R2(Y) before W3(Y) → T2 → T3; W1(Y) before W3(Y) → T1 → T3. T1 ⇄ T2 and T2 ⇄ T3 form cycles, so it's not conflict-serializable.",
    optionExplanations: ["T2 → T1 contradicts this order.", "T1 → T2 contradicts this order.", "Correct.", "T1 → T2 contradicts this order."]
  },
  {
    id: "sql-txn-037", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "easy", type: "concept",
    question: "In MySQL and PostgreSQL clients, what is the default 'autocommit' behaviour?",
    options: ["All statements are buffered until you type COMMIT", "Each statement outside an explicit transaction (BEGIN/START TRANSACTION) is its own transaction and commits automatically when it succeeds", "Autocommit is always off", "Only SELECT statements are committed"],
    answer: 1,
    explanation: "With autocommit on (the default), a single UPDATE is atomic and durable as soon as it succeeds. To group several statements atomically, start an explicit transaction. Some tools (and Oracle's SQL*Plus) default to manual commit.",
    optionExplanations: ["That's autocommit off.", "Correct.", "It's on by default in MySQL/PostgreSQL.", "All statements are committed individually."]
  },
  {
    id: "sql-txn-038", subject: "sql", subtopic: "Transactions & Concurrency", difficulty: "hard", type: "concept",
    question: "Under InnoDB's default REPEATABLE READ, why doesn't `SELECT ... WHERE amount > 100 FOR UPDATE` suffer from phantom inserts by other transactions?",
    options: ["InnoDB disables inserts during reads", "It takes NEXT-KEY locks (record + gap locks) on the scanned index range, blocking inserts into those gaps until commit", "Phantoms are impossible in any database", "It copies the table"],
    answer: 1,
    explanation: "Locking reads in InnoDB lock both the matching index records and the gaps between them, so other transactions can't insert rows that would satisfy the predicate. Plain (non-locking) SELECTs avoid phantoms differently: they read from a consistent MVCC snapshot.",
    optionExplanations: ["Inserts elsewhere in the table proceed normally.", "Correct.", "Weaker isolation levels allow phantoms.", "No copying is involved."]
  }
);
