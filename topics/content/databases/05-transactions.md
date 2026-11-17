---
title: Transactions and schedules
part: Part C · Transactions
lede: A transaction is a unit of work that must look atomic and isolated even when hundreds run at once and the machine can crash at any moment. This chapter covers ACID, what makes an interleaving of transactions correct (conflict and view serializability), which interleavings are safe to recover from, and what the weaker SQL isolation levels give up.
desc: ACID, transaction states, schedules, conflicts, conflict serializability, precedence graphs, view serializability, blind writes, recoverable and cascadeless schedules, isolation levels, dirty reads, non-repeatable reads, phantoms, lost updates
hours: 2.5
prereqs: basic SQL, graphs and topological sort
---

## ACID {#ch05-acid .th}

- **Atomicity**: either all of a transaction's operations are reflected in the database, or none are.
- **Consistency**: a transaction run alone on a consistent database leaves it consistent. Mid-transaction the database may be temporarily inconsistent. Consistency covers explicit constraints (primary and foreign keys) and implicit ones (the sum of all balances is unchanged by a transfer); the database enforces the first kind, and the application's logic is responsible for the second.
- **Isolation**: to each transaction Ti, every other Tj appears to have finished before Ti started or started after Ti finished.
- **Durability**: once a transaction commits, its changes survive any later failure.

Atomicity and durability are the recovery system's job (Chapter 7). Isolation is the concurrency-control system's job (Chapter 6).

A transaction moves through states: **active**, then **partially committed** after its last statement, then **committed** once its changes are safely durable. From active or partially committed it can become **failed**, then **aborted** once rolled back; an aborted transaction is restarted (if the failure was not a logic error in the transaction itself) or killed.

Why run transactions concurrently at all? Better use of CPU and disks (one waits on I/O while another computes), higher throughput, and lower average response time, since short transactions need not queue behind long ones.

## Schedules and conflicts {#ch05-schedules .th}

A **schedule** is the chronological order in which the instructions of a set of transactions run. It contains all their instructions and keeps each transaction's internal order. A schedule is **serial** if each transaction runs to completion before the next starts.

Interleaving without control loses work. A = 1000 and B = 2000. T1 moves 50 from A to B; T2 moves 10% of A to B. Any serial order keeps A + B = 3000:

```python run=db-c05-lost-update
A, B = 1000, 2000
t1_a = A; t1_a -= 50                         # T1: read A, compute
t2_a = A; tmp = t2_a * 0.1; t2_a -= tmp      # T2 reads the old A
A = t2_a; t2_b = B                           # T2: write A, read B
A = t1_a; t1_b = B; t1_b += 50; B = t1_b     # T1 overwrites A, updates B
t2_b += tmp; B = t2_b                        # T2 writes B from its stale read
print(A, B, A + B)
```

T2's write of A is overwritten, and money is created. The question is which interleavings are safe.

Two instructions from different transactions **conflict** if they access the same item and at least one is a write. Read-read does not conflict; read-write, write-read and write-write do. Swapping two adjacent non-conflicting instructions cannot change any result.

- Schedules S and S′ are **conflict equivalent** if one becomes the other through such swaps.
- S is **conflict serializable** if it is conflict equivalent to some serial schedule.

### The precedence graph

Draw a vertex per transaction, and an edge Ti → Tj when they conflict and Ti accessed the item first. **A schedule is conflict serializable if and only if its precedence graph is acyclic.** Any topological order of the graph is an equivalent serial order, and there may be several.

```python run=db-c05-precedence
from graphlib import TopologicalSorter, CycleError

def precedence(schedule):
    edges = set()
    for i, (ti, op_i, x) in enumerate(schedule):
        for tj, op_j, y in schedule[i + 1:]:
            if ti != tj and x == y and "W" in (op_i, op_j):
                edges.add((ti, tj))
    return edges

def classify(schedule):
    edges = precedence(schedule)
    g = {}
    for a, b in edges:
        g.setdefault(b, set()).add(a)
    try:
        order = list(TopologicalSorter(g).static_order())
        return sorted(edges), "serializable as " + " -> ".join(order)
    except CycleError:
        return sorted(edges), "not conflict serializable"

s1 = [("T1","R","A"),("T1","W","A"),("T2","R","A"),("T2","W","A"),("T1","R","B"),("T1","W","B"),("T2","R","B"),("T2","W","B")]
s2 = [("T3","R","Q"),("T4","W","Q"),("T3","W","Q")]
for s in (s1, s2):
    print(*classify(s))
```

The first schedule interleaves T1 and T2 but every conflict goes from T1 to T2, so it is equivalent to running T1 then T2. In the second, T3 reads Q before T4 writes it (T3 → T4), and T4 writes Q before T3 does (T4 → T3): a cycle.

### View serializability

S and S′ are **view equivalent** if, for every item Q:

1. the transaction that reads Q's initial value in S also does in S′;
2. each read gets its value from the same write in both;
3. the same transaction does the final write of Q in both.

Every conflict-serializable schedule is view serializable, but not the reverse. The extra schedules all contain **blind writes**, writes of an item the transaction never read:

`T27: R(Q), T28: W(Q), T27: W(Q), T29: W(Q)`

has a T27 ↔ T28 cycle, so it is not conflict serializable. But it is view equivalent to ⟨T27, T28, T29⟩: T27 reads the initial Q in both, nobody reads anyone else's write, and T29 writes last in both. T28's and T27's writes are never read, so their order does not matter.

Testing view serializability is NP-complete, so real systems use conflict serializability. Some schedules give the same result as a serial one yet are neither conflict nor view serializable, for example two transactions that only add to and subtract from balances, which commute. Detecting that needs to know the operations, not just reads and writes.

## Recoverability {#ch05-recoverability .th}

Serializability ignores failures. Suppose Tj reads an item that Ti wrote:

| Property | Requirement |
|---|---|
| **Recoverable** | Ti commits before Tj commits |
| **Cascadeless** | Ti commits before Tj reads the item |

If Tj commits first and Ti then aborts, Tj has committed a value that never existed, and nothing can fix that: the schedule is not recoverable. Even in a recoverable schedule, Ti aborting forces every reader of its uncommitted data to abort too, and their readers, a **cascading rollback**. Cascadeless schedules avoid that; every cascadeless schedule is recoverable.

Serializability and recoverability are independent: a schedule can be serializable and not recoverable.

```python run=db-c05-recoverable
def check(schedule):
    """schedule: list of (txn, op, item); op in R, W, C (commit)."""
    last_writer, commit_at, reads_from = {}, {}, []
    for pos, (t, op, x) in enumerate(schedule):
        if op == "W":
            last_writer[x] = t
        elif op == "R" and last_writer.get(x) not in (None, t):
            reads_from.append((t, last_writer[x], pos))
        elif op == "C":
            commit_at[t] = pos
    inf = float("inf")
    recoverable = all(commit_at.get(w, inf) < commit_at.get(r, inf) for r, w, _ in reads_from)
    cascadeless = all(commit_at.get(w, inf) < pos for _, w, pos in reads_from)
    return recoverable, cascadeless

s = [("T1","W","A"),("T2","R","A"),("T3","R","B"),("T2","W","B"),("T1","C",None),("T2","C",None),("T3","C",None)]
print("recoverable, cascadeless:", check(s))
s_bad = [("T1","W","A"),("T2","R","A"),("T2","C",None),("T1","C",None)]
print("T2 commits first:        ", check(s_bad))
```

In the first schedule T2 reads T1's uncommitted A, so it is not cascadeless, but T1 commits before T2, so it is recoverable.

:::key Exam checklist for "classify this schedule"
1. For each item, list the conflicting pairs in time order and draw the edges. Look for a cycle.
2. If there is a cycle, look for blind writes before declaring it not view serializable.
3. For each write-then-read pair, compare the writer's commit with the reader's commit (recoverable) and with the read itself (cascadeless).
4. Name the pair that decides each answer: the marks are in the justification.
:::

## Isolation levels in SQL {#ch05-isolation .th}

Serializability costs concurrency, so SQL offers weaker levels. Each one rules out more anomalies:

| Level | Dirty read | Non-repeatable read | Phantom |
|---|---|---|---|
| Read uncommitted | possible | possible | possible |
| Read committed | — | possible | possible |
| Repeatable read | — | — | possible |
| Serializable | — | — | — |

- **Dirty read**: reading a value written by a transaction that has not committed.
- **Non-repeatable read**: reading the same item twice and getting different committed values.
- **Phantom**: re-running a predicate query (`where dept = 'Physics'`) and seeing rows that another transaction inserted, or missing ones it deleted.
- **Lost update**: two transactions read, compute and write the same item, and one write disappears, as in the A/B example above.

The standard's default is serializable, but most systems default to read committed, and some systems' "serializable" is really snapshot isolation (Chapter 6), which allows anomalies that true serializability forbids. Weak levels are fine for approximate answers, such as statistics for the optimizer.

In SQL, a transaction begins implicitly and ends with `commit` or `rollback`. By default each statement commits on its own (**autocommit**); in JDBC turn this off with `setAutoCommit(false)`. Set the level with `set transaction isolation level serializable`.

Concurrency-control protocols do not build precedence graphs at runtime. They impose a discipline (locking, timestamps or versions) under which bad schedules cannot occur, and the precedence graph is how we prove that. Chapter 6 covers them.

```python run=db-c05-sqlite-isolation
import sqlite3, tempfile, os
path = os.path.join(tempfile.mkdtemp(), "bank.db")
a = sqlite3.connect(path, isolation_level=None)
a.execute("create table acct(id primary key, bal)")
a.execute("insert into acct values (1, 100)")
b = sqlite3.connect(path, isolation_level=None, timeout=0.1)

a.execute("begin immediate")                       # a takes the write lock
a.execute("update acct set bal = bal - 30 where id = 1")
print("b sees before a commits:", b.execute("select bal from acct").fetchone())
try:
    b.execute("begin immediate")
except sqlite3.OperationalError as e:
    print("b cannot start writing:", e)
a.execute("commit")
print("b sees after commit:   ", b.execute("select bal from acct").fetchone())
```

SQLite never shows uncommitted data to another connection, and it allows only one writer at a time, so its transactions are serializable. Engines with row-level locking or MVCC allow far more concurrency, and Chapter 6 shows how they keep it correct.

## Drills: transactions {#ch05-drills .dr}

:::drill concept
Which ACID property does each mechanism provide: the log, locks, constraints checked at commit, the commit record being forced to disk?
---
**Answer.** The log: atomicity (undo) and durability (redo). Locks: isolation. Constraints: consistency, the part the database can check. Forcing the commit record: durability, since a transaction counts as committed only once that record is on stable storage.
:::

:::drill output
Classify `T1:R(A) T2:W(A) T2:R(B) T1:W(B)`.
---
```python run=db-c05-d-cls
s = [("T1","R","A"),("T2","W","A"),("T2","R","B"),("T1","W","B")]
edges = {(a[0], b[0]) for i, a in enumerate(s) for b in s[i+1:] if a[0] != b[0] and a[2] == b[2] and "W" in (a[1], b[1])}
print(sorted(edges))
```

**Why.** T1 → T2 on A and T2 → T1 on B: a cycle, so not conflict serializable. It is not view serializable either, even though T1's write of B is blind: in the schedule both transactions read initial values, but in T1, T2 order T2 would read T1's B, and in T2, T1 order T1 would read T2's A.
:::

:::drill tricky
Is `T27:R(Q) T28:W(Q) T27:W(Q) T29:W(Q)` view serializable? Conflict serializable?
---
**Answer.** View serializable, equivalent to ⟨T27, T28, T29⟩: T27 reads the initial Q, no transaction reads another's write, and T29 does the final write in both. Not conflict serializable: T27 → T28 (R then W) and T28 → T27 (W then W) form a cycle. The difference comes from the blind writes of T28 and T29.
:::

:::drill concept
Why does every view-serializable schedule that is not conflict serializable contain a blind write?
---
**Answer.** Without blind writes, every write is preceded by a read of the same item in the same transaction, so the reads-from and final-write conditions pin down the order of every conflicting pair, and view equivalence coincides with conflict equivalence. Only a write whose value nobody reads, and which follows no read, can be reordered freely.
:::

:::drill output
`T1:W(A) T2:R(A) T3:R(B) T2:W(B) T1:commit T2:commit T3:commit`. Conflict serializable? Recoverable? Cascadeless?
---
```python run=db-c05-d-rec
s = [("T1","W","A"),("T2","R","A"),("T3","R","B"),("T2","W","B")]
edges = {(a[0], b[0]) for i, a in enumerate(s) for b in s[i+1:] if a[0] != b[0] and a[2] == b[2] and "W" in (a[1], b[1])}
print(sorted(edges))
```

**Why.** Edges T1 → T2 (A) and T3 → T2 (B), no cycle: serializable as T1, T3, T2 or T3, T1, T2. Recoverable: T2 reads T1's A and T1 commits before T2 does. Not cascadeless: T2 reads A before T1 commits.
:::

:::drill concept
Give a schedule that is conflict serializable but not recoverable.
---
**Answer.** `T1:W(A) T2:R(A) T2:commit T1:abort`. Serial order T1, T2 is equivalent, but T2 committed a value from T1, which then aborted.
:::

:::drill concept
What is a cascading rollback, and which property prevents it?
---
**Answer.** When Ti aborts, every transaction that read Ti's uncommitted writes must abort, and so must their readers, and so on. Cascadeless schedules, where a transaction reads only committed data, prevent it.
:::

:::drill concept
Name the anomaly: (a) T reads a balance written by an uncommitted transfer that later rolls back; (b) T counts Physics instructors twice and gets 5, then 6, because another transaction inserted one; (c) two transactions read stock = 10, each sells one and writes 9.
---
**Answer.** (a) dirty read. (b) phantom. (c) lost update.
:::

:::drill tricky
Repeatable read prevents non-repeatable reads. Why doesn't it prevent phantoms?
---
**Answer.** Repeatable read is typically implemented by holding read locks on the rows read until commit. A phantom is a row that did not exist when the query ran, so there was no lock on it, and another transaction can insert it. Preventing phantoms needs locks on the predicate or the index range (Chapter 6).
:::

:::drill concept
A swap of two adjacent instructions is allowed in a conflict-equivalence argument only if they don't conflict. Which pairs can always be swapped?
---
**Answer.** Instructions of the same transaction never swap. Instructions of different transactions swap if they touch different items, or if both are reads of the same item.
:::

:::drill concept
Why is the default isolation level in many systems read committed, even though the SQL standard says serializable?
---
**Answer.** Read committed has much less blocking and fewer aborts, and many applications tolerate its anomalies or avoid them with explicit locking (`select … for update`). It is a performance trade-off made by the vendor, and developers often don't realise they are not getting serializability.
:::

## Write the code {#ch05-coding .cd}

:::drill code
Write a view-serializability tester by brute force: compare a schedule's reads-from relation and final writes with every serial order.
---
```python run=db-c05-c-view
from itertools import permutations

def view_info(schedule):
    last, reads = {}, []
    for t, op, x in schedule:
        if op == "R":
            reads.append((t, x, last.get(x)))       # None = initial value
        else:
            last[x] = t
    return sorted(reads, key=str), dict(last)

def view_serializable(schedule):
    txns = sorted({t for t, _, _ in schedule})
    target = view_info(schedule)
    for order in permutations(txns):
        serial = [op for t in order for op in schedule if op[0] == t]
        if view_info(serial) == target:
            return order
    return None

s = [("T27","R","Q"), ("T28","W","Q"), ("T27","W","Q"), ("T29","W","Q")]
print(view_serializable(s))
print(view_serializable([("T1","R","A"), ("T2","W","A"), ("T1","W","A")]))
```

Trying every permutation is exponential, which matches the problem being NP-complete. The second schedule has no third transaction to hide T1's write, so it is not view serializable.
:::

:::drill code
Simulate the lost update between two "connections" at read committed, then fix it with an atomic update and with optimistic version checking.
---
```python run=db-c05-c-lost
db = {"stock": 10, "ver": 0}

def read():
    return dict(db)

t1, t2 = read(), read()                              # both see stock 10
db["stock"] = t1["stock"] - 1
db["stock"] = t2["stock"] - 1
print("naive read-modify-write:", db["stock"])

db = {"stock": 10, "ver": 0}
for _ in range(2):
    db["stock"] -= 1                                 # UPDATE … SET stock = stock - 1
print("atomic update:          ", db["stock"])

db = {"stock": 10, "ver": 0}
def try_write(snapshot, new):
    if db["ver"] != snapshot["ver"]:
        return False                                 # someone wrote since we read
    db.update(stock=new, ver=db["ver"] + 1)
    return True
t1, t2 = read(), read()
print("t1 writes:", try_write(t1, t1["stock"] - 1), "| t2 writes:", try_write(t2, t2["stock"] - 1))
t2 = read()
print("t2 retries:", try_write(t2, t2["stock"] - 1), "| stock", db["stock"])
```

The version check is `update … set stock = :new, ver = ver + 1 where id = :id and ver = :v`, and zero rows updated means retry. Frameworks such as Hibernate use it for transactions that span user interactions, where locks cannot be held.
:::

## Cheat sheet {#ch05-cheatsheet .th}

- ACID: atomicity and durability come from recovery; isolation from concurrency control; consistency partly from constraints, partly from correct transactions.
- Conflict: same item, different transactions, at least one write.
- Conflict serializable ⇔ precedence graph acyclic; a topological order is an equivalent serial schedule.
- View serializable ⊃ conflict serializable; the extra schedules have blind writes. Testing it is NP-complete.
- Recoverable: writer commits before reader commits. Cascadeless: writer commits before reader reads. Cascadeless ⊂ recoverable.
- Isolation levels: read uncommitted < read committed < repeatable read < serializable; repeatable read still allows phantoms.
- Many systems default to read committed, and some call snapshot isolation "serializable".
