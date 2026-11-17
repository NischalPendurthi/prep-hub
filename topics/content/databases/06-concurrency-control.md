---
title: Concurrency control
part: Part C · Transactions
lede: Concurrency control produces only serializable (or deliberately weaker) schedules without inspecting them. This chapter covers two-phase locking and its variants, deadlock handling, multiple-granularity and phantom-safe locking, timestamp ordering, optimistic validation, multiversion schemes, snapshot isolation and its write-skew anomaly, and how indices are kept consistent under concurrency.
desc: lock modes, 2PL, strict and rigorous 2PL, lock manager, wait-die, wound-wait, wait-for graph, multiple granularity, intention locks, phantoms, index and next-key locking, timestamp ordering, Thomas' write rule, validation, MVTO, MV2PL, snapshot isolation, write skew, SSI, crabbing, latch-free structures
hours: 5
prereqs: Chapter 5
---

## Lock-based protocols {#ch06-locks .th}

A transaction must hold a **shared** (S) lock to read an item and an **exclusive** (X) lock to write it. S is compatible only with S; X is compatible with nothing. A request is granted only if it is compatible with every lock other transactions hold on the item; otherwise the requester waits.

Locking alone does not give serializability: a transaction that unlocks A and later locks B can let another transaction slip in between.

### Two-phase locking

**2PL**: each transaction has a **growing phase**, in which it may acquire locks but not release any, followed by a **shrinking phase**, in which it may release locks but not acquire any. The point where it holds its last new lock is its **lock point**.

:::key Why 2PL guarantees conflict serializability
Suppose Ti → Tj in the precedence graph because of item Q. Tj's conflicting lock on Q was granted after Ti released Q. At that moment Ti was shrinking, so it had passed its lock point, while Tj was still acquiring, so it had not reached its own. Every edge therefore goes from an earlier lock point to a later one, so there can be no cycle, and ordering transactions by lock point gives an equivalent serial schedule.
:::

2PL is not necessary for serializability in general, but without extra knowledge of how data is accessed it is necessary in this sense: for any non-2PL transaction Ti, there is a 2PL transaction Tj that can run with it non-serializably. 2PL does not prevent deadlock, and on its own it does not prevent cascading rollback.

| Variant | Holds until commit or abort | Adds |
|---|---|---|
| basic 2PL | nothing in particular | conflict serializability |
| **strict** 2PL | all X locks | recoverable and cascadeless schedules |
| **rigorous** 2PL | all locks | the serial order is the commit order |

Most systems implement rigorous 2PL and call it "2PL". **Lock conversion** is allowed: upgrade S → X only in the growing phase, downgrade X → S only in the shrinking phase. **Automatic locking** gets an S lock on `read(D)`, gets or upgrades to X on `write(D)`, and releases everything at commit or abort.

```
T1: r(A) r(B) w(B)          T2: w(A) commit        T1: commit
```

Is this possible under strict 2PL? Yes: T1 can release its S lock on A once it holds X on B (its lock point), so T2 gets X on A, while T1 keeps X on B until commit. Under rigorous 2PL, no: T1 holds S on A until it commits, so T2 cannot write A first.

A non-recoverable schedule can still follow basic 2PL: `T1: lock-X(A), W(A), unlock(A)`; `T2: lock-S(A), R(A), commit`; then T1 aborts. T2 committed a value that never existed. Strict 2PL forbids this.

### The lock manager

The lock manager keeps an in-memory **lock table**: per item, a queue of granted and waiting requests. A new request joins the end of the queue and is granted only if it is compatible with all earlier requests, including waiting ones. That rule prevents starvation: otherwise a stream of S requests could keep overtaking a waiting X request forever. On unlock the request is removed and later ones are rechecked. On abort, all of the transaction's requests are removed, found through a per-transaction list.

## Deadlocks {#ch06-deadlock .th}

T3 holds X(B) and T4 holds S(A). T4 requests S(B) and waits for T3; T3 requests X(A) and waits for T4. One must be rolled back.

**Prevention** with timestamps (assigned at start, kept on restart):

| Requester is | Wait-die (non-preemptive) | Wound-wait (preemptive) |
|---|---|---|
| older than the holder | waits | wounds the holder (rolls it back) |
| younger than the holder | dies (rolls itself back) | waits |

Waits only go one way by age, so the wait-for graph cannot have a cycle. A restarted transaction keeps its original timestamp, so it eventually becomes the oldest and cannot starve. Wound-wait usually causes fewer rollbacks; under wait-die a young transaction may die several times before it gets the lock.

Other prevention schemes: declare and lock everything up front, or lock items in a fixed global order. **Timeouts** are simple and resolve any deadlock, but they may roll back transactions that were not deadlocked, a good interval is hard to choose, and starvation is possible.

**Detection** builds a **wait-for graph** with an edge Ti → Tj if Ti waits for a lock that Tj holds in a conflicting mode. There is a deadlock if and only if the graph has a cycle. The system checks periodically, picks a victim of minimum cost (but never the same one forever, to avoid starvation), and rolls it back, entirely or just far enough to release the needed lock.

```python run=db-c06-waitfor
def find_cycle(waits_for):
    state = {}
    def dfs(t, path):
        state[t] = "active"
        for u in waits_for.get(t, ()):
            if state.get(u) == "active":
                return path[path.index(u):] + [u]
            if u not in state and (c := dfs(u, path + [u])):
                return c
        state[t] = "done"
    for t in waits_for:
        if t not in state and (c := dfs(t, [t])):
            return c

print(find_cycle({"T1": ["T2"], "T2": ["T3"], "T3": ["T4"]}))
print(find_cycle({"T1": ["T2"], "T2": ["T3"], "T3": ["T1"], "T4": ["T1"]}))
```

:::trap Two different graphs
A **precedence graph** has edges from conflicts in a finished schedule and tests serializability. A **wait-for graph** has edges from current lock waits and tests for deadlock.
:::

The **tree protocol** is a non-2PL alternative for data organized as a tree. Only X locks are used. The first lock may be anywhere; after that, a node can be locked only if its parent is currently locked by the same transaction. Locks can be released at any time but never re-acquired. It is conflict serializable and deadlock-free and allows early unlocking, but it may lock nodes it doesn't need, and it is not recoverable or cascadeless without extra commit dependencies.

## Multiple granularity {#ch06-granularity .th}

Items form a hierarchy: database → area → file → record. Locking a node implicitly locks all its descendants in the same mode. Fine granularity gives more concurrency and more locking overhead; coarse granularity the reverse.

To check a request for S on a file without inspecting every record, **intention locks** mark the ancestors:

- **IS**: explicit S locks will be taken below.
- **IX**: explicit X (or S) locks will be taken below.
- **SIX**: the whole subtree in S, plus explicit X locks below.

|  | IS | IX | S | SIX | X |
|---|---|---|---|---|---|
| IS | ✓ | ✓ | ✓ | ✓ | — |
| IX | ✓ | ✓ | — | — | — |
| S | ✓ | — | ✓ | — | — |
| SIX | ✓ | — | — | — | — |
| X | — | — | — | — | — |

Rules: lock the root first. To lock Q in S or IS, the parent must be held in IS or IX. To lock Q in X, SIX or IX, the parent must be held in IX or SIX. Follow 2PL. Unlock Q only after its children are unlocked. So locks are acquired root to leaf and released leaf to root.

S and IX conflict for a reason: T1 holding S on a relation has implicitly read-locked every record, and T2 holding IX intends to X-lock some record. If they were compatible, T2 could update a record that T1 has read-locked.

**Lock escalation**: when a transaction holds too many locks at one level, replace them with a single S or X lock on the parent. Optimizers often choose the granularity up front: few matching tuples estimated from statistics means tuple locks, many means a relation lock.

```python run=db-c06-mgl
C = {"IS": "IS IX S SIX", "IX": "IS IX", "S": "IS S", "SIX": "IS", "X": ""}
def ok(held, req):
    return req in C[held].split()

T1 = {"db": "IS", "file": "IS", "rec1": "S"}      # reads one record
T2 = {"db": "IX", "file": "IX", "rec2": "X"}      # updates another record
T3 = {"db": "IX", "file": "SIX", "rec3": "X"}     # scans the file, updates a few
T4 = {"db": "S"}                                  # reads everything
for a, b, name in [(T1, T2, "T1/T2"), (T1, T3, "T1/T3"), (T2, T3, "T2/T3"), (T2, T4, "T2/T4")]:
    clash = [n for n in a if n in b and not ok(a[n], b[n])]
    print(name, "compatible" if not clash else f"conflict on {clash}")
```

## Phantoms {#ch06-phantoms .th}

`select count(*) from instructor where dept = 'Physics'` in T1, and `insert into instructor values (…, 'Physics', …)` in T2, share no tuple, yet they conflict: whether T1 sees the new row depends on the order. The conflict is on the **information about which tuples exist**, and tuple locks cannot see it.

A crude fix is a per-relation data item locked in S by scans and in X by inserts and deletes, which kills concurrency. Better:

**Index locking.** Every relation has at least one index, and tuples are found only through indices. A lookup S-locks every index leaf it reads, even if it finds no match. An insert, update or delete X-locks every leaf it changes, in every index. A scan's range is covered by leaves it locked, so any insert into that range must X-lock one of the same leaves, and the hidden conflict becomes a real lock conflict. The cost is locking a whole leaf.

**Next-key locking** is finer: a lookup locks every key value that satisfies it **plus the next key** in the index. An insert or delete locks the value and its next key in X.

```python run=db-c06-nextkey
import bisect
keys = [3, 5, 8, 11, 14, 18, 24, 38, 55]
def scan_locks(lo, hi):
    i = bisect.bisect_left(keys, lo)
    j = bisect.bisect_right(keys, hi)
    return set(keys[i:j]) | ({keys[j]} if j < len(keys) else {"+inf"})
def insert_locks(v):
    j = bisect.bisect_right(keys, v)
    return {v, keys[j] if j < len(keys) else "+inf"}

held = scan_locks(7, 16)
print("scan 7..16 S-locks:", sorted(held))
for v in (15, 7, 20):
    clash = held & insert_locks(v)
    print(f"insert {v} X-locks {sorted(insert_locks(v), key=str)}:", f"waits on {clash}" if clash else "proceeds")
```

Inserting 15 or 7 would create a phantom for the scan, and in both cases the insert's next key is one the scan locked.

:::tip The "max + 1" pattern
Two transactions each read `max(orderno)` and insert max + 1. With plain tuple locks, both S-lock the max tuple, which does not conflict, and both insert the same number, a result no serial order allows. With next-key locking both also S-lock the key after the max (+∞), and each insert needs X on +∞, so the conflict is detected. A primary key constraint catches it differently, by rolling one back on the duplicate.
:::

## Timestamp ordering {#ch06-tso .th}

Each transaction gets a unique, increasing timestamp TS(Ti) when it starts (clock or counter). The schedule must be equivalent to the serial schedule in timestamp order. Each item Q records W-TS(Q) and R-TS(Q), the largest timestamps of successful writes and reads.

| Operation by Ti | Check | Action |
|---|---|---|
| read(Q) | TS(Ti) < W-TS(Q) | reject and roll back: the value Ti needed is already overwritten |
|  | otherwise | read; R-TS(Q) = max(R-TS(Q), TS(Ti)) |
| write(Q) | TS(Ti) < R-TS(Q) | reject and roll back: a later transaction already read the old value |
|  | TS(Ti) < W-TS(Q) | reject and roll back (obsolete write); **Thomas' write rule**: just ignore it |
|  | otherwise | write; W-TS(Q) = TS(Ti) |

A rolled-back transaction restarts with a **new** timestamp; the old one would fail again. All edges in the precedence graph go from smaller to larger timestamps, so TSO is serializable, and nobody waits, so it is deadlock-free. But it may not be cascade-free or even recoverable. Fixes: perform all writes together at the end; or make readers wait for data to commit; or track **commit dependencies**, where a reader of uncommitted data commits only after the writer and aborts if the writer does.

**Thomas' write rule** drops a write that is already obsolete: a later transaction has written Q and nobody between them read it, so in timestamp order this write would be overwritten unread anyway. It admits some view-serializable schedules that are not conflict serializable, such as `T27:R(Q) T28:W(Q) T27:W(Q)` with T27's write dropped.

```python run=db-c06-tso
def run_tso(schedule, ts, thomas=False):
    R, W, log = {}, {}, []
    dead = set()
    for t, op, q in schedule:
        if t in dead:
            continue
        if op == "R":
            if ts[t] < W.get(q, 0):
                dead.add(t); log.append(f"{t} rolls back on R({q})")
            else:
                R[q] = max(R.get(q, 0), ts[t])
        else:
            if ts[t] < R.get(q, 0):
                dead.add(t); log.append(f"{t} rolls back on W({q}): read by a later txn")
            elif ts[t] < W.get(q, 0):
                if thomas:
                    log.append(f"{t}'s W({q}) ignored (Thomas)")
                else:
                    dead.add(t); log.append(f"{t} rolls back on W({q}): obsolete")
            else:
                W[q] = ts[t]
    return log or ["all ok"]

s = [("T27", "R", "Q"), ("T28", "W", "Q"), ("T27", "W", "Q")]
print(run_tso(s, {"T27": 27, "T28": 28}))
print(run_tso(s, {"T27": 27, "T28": 28}, thomas=True))
s2 = [("T1", "W", "X"), ("T2", "R", "X"), ("T2", "W", "Y"), ("T1", "R", "Y")]
print(run_tso(s2, {"T1": 1, "T2": 2}))
```

In the last schedule T1 rolls back because T2, which is later in timestamp order, already wrote Y. And since T2 read T1's uncommitted X, T2 must follow it through its commit dependency.

## Validation (optimistic concurrency control) {#ch06-validation .th}

When conflicts are rare, checking every access is wasted work. Each transaction runs in three phases:

1. **Read and execute**: read from the database, write only to local copies.
2. **Validation**: check that applying the writes keeps the schedule serializable.
3. **Write**: if validation passed, apply the writes; otherwise restart.

Each transaction records StartTS, ValidationTS and FinishTS, and TS(Ti) = ValidationTS(Ti), so the serial order is the validation order. Validation and writing are assumed to happen atomically and serially.

**The test for Tj**: for every Ti with TS(Ti) < TS(Tj), one of these must hold:

- FinishTS(Ti) < StartTS(Tj): Ti finished before Tj started, so they were not concurrent; or
- StartTS(Tj) < FinishTS(Ti) < ValidationTS(Tj), and **writeset(Ti) ∩ readset(Tj) = ∅**.

Otherwise Tj is rolled back.

Only Tj's read set needs checking. Ti did all its writes in its write phase, which ended before Tj's validation, and Tj writes only after validating, so Tj's writes cannot reach Ti's reads. The only hazard is that Tj read an item that Ti wrote during the overlap, possibly getting the old value.

```python run=db-c06-validation
def validate(tj, committed):
    for ti in committed:
        if ti["finish"] < tj["start"]:
            continue                                     # not concurrent
        if ti["writes"] & tj["reads"]:
            return f"{tj['name']} rolls back: read {sorted(ti['writes'] & tj['reads'])} written by concurrent {ti['name']}"
    return f"{tj['name']} validates"

T1 = {"name": "T1", "start": 1, "finish": 6, "reads": {"Y"}, "writes": {"X"}}
T2 = {"name": "T2", "start": 2, "reads": {"X"}, "writes": {"Y"}}
T3 = {"name": "T3", "start": 7, "reads": {"X"}, "writes": {"Z"}}
print(validate(T2, [T1]))
print(validate(T3, [T1]))
```

Validation gives more concurrency than locking or TSO when conflicts are rare, avoids cascading rollbacks, and suits real-time systems because nobody blocks. Long transactions may starve, being rolled back again and again.

## Multiversion schemes {#ch06-mvcc .th}

Each write creates a new **version** of the item instead of overwriting it, and a read picks a suitable version, so reads never wait.

**Multiversion timestamp ordering (MVTO).** Version Qk holds its content, W-TS(Qk) (the creator's timestamp) and R-TS(Qk). For Ti, let Qk be the version with the largest W-TS ≤ TS(Ti).

- read(Q): return Qk, and raise R-TS(Qk) to TS(Ti) if lower. Reads always succeed.
- write(Q): if TS(Ti) < R-TS(Qk), roll back: a later transaction already read Qk and should have seen Ti's write. If TS(Ti) = W-TS(Qk), overwrite. Otherwise create a new version with both timestamps TS(Ti).

**Multiversion two-phase locking (MV2PL).** Update transactions follow rigorous 2PL and read the latest version. Their first write creates a version with W-TS = ∞. At commit, TS(Ti) = ts-counter + 1, every version Ti created gets W-TS = TS(Ti), and ts-counter is incremented (the counter itself is locked two-phase). **Read-only** transactions take TS = ts-counter at start, take no locks, and read the latest version with W-TS ≤ TS. So update transactions get their timestamps at commit, after all locks are held; read-only transactions get theirs at start, reading the counter without changing it.

Old versions are garbage-collected: with versions Q5 and Q9 and the oldest active transaction above 9, Q5 can go. Costs include storage, extra fields in every tuple, and complications for key checks and indices.

```python run=db-c06-mvto
versions = {"Q": [{"w": 5, "r": 7, "val": "a"}, {"w": 9, "r": 9, "val": "b"}]}
def pick(q, ts):
    return max((v for v in versions[q] if v["w"] <= ts), key=lambda v: v["w"])
def read(q, ts):
    v = pick(q, ts); v["r"] = max(v["r"], ts); return v["val"]
def write(q, ts, val):
    v = pick(q, ts)
    if ts < v["r"]:
        return f"T{ts} rolls back (version {v['w']} already read by T{v['r']})"
    if ts == v["w"]:
        v["val"] = val; return f"T{ts} overwrites its own version"
    versions[q].append({"w": ts, "r": ts, "val": val}); return f"T{ts} creates version {ts}"

print("T8 reads", read("Q", 8))
print(write("Q", 6, "x"))
print(write("Q", 10, "y"))
print(sorted(v["w"] for v in versions["Q"]))
```

T8 reads version 5 and raises its R-TS to 8. T6 then cannot write: T8 should have seen T6's value but already read the older one.

## Snapshot isolation {#ch06-si .th}

**Snapshot isolation** (SI) gives each transaction a snapshot of the committed data as of its start. It reads and writes only its snapshot (its own writes are visible to it; concurrent transactions' writes are not), and its writes become visible to others at commit. Write-write conflicts are resolved by:

- **First committer wins**: T commits only if no concurrent transaction has already committed a write to an item T wrote; otherwise T aborts.
- **First updater wins** (Oracle, PostgreSQL): checked at write time by locking the item; the lock is held until the concurrent transactions finish. The only difference is when the abort happens.

Benefits: reads never block and are never blocked, performance is close to read committed, and there are no dirty reads, lost updates or non-repeatable reads.

### Implementing SI with version timestamps

- Store with each committed version the **commit timestamp** of the transaction that created it. A snapshot read at time t returns the latest version with timestamp below t.
- The creator's **start** timestamp would be wrong: a version with an earlier start time may not yet have been committed when the snapshot was taken, so the snapshot would miss it, or worse, see it later.
- Uncommitted versions carry timestamp ∞ (or a flag), so snapshot reads skip them.
- At commit, write the commit timestamp into every version the transaction created. PostgreSQL avoids touching many tuples at commit: it stores the transaction ID in the tuple, keeps the transaction-ID-to-commit status in a separate structure, and fixes up the tuples lazily later.
- **Validation**: note the transaction's start timestamp. For each item it wrote, if the latest committed version has a commit timestamp greater than the start timestamp, a concurrent transaction wrote it, so roll back. A version number per item works the same way.

### SI is not serializable: write skew

Serializability needs, for any two concurrent transactions, one to see the other's effects. Under SI neither sees the other. If they write different items, first-committer-wins never fires:

```python run=db-c06-write-skew
class SI:
    def __init__(self, data):
        self.versions = {k: [(0, v)] for k, v in data.items()}   # (commit_ts, value)
        self.clock = 0
    def begin(self):
        self.clock += 1
        return {"start": self.clock, "writes": {}}
    def read(self, t, k):
        if k in t["writes"]:
            return t["writes"][k]
        return max((c, v) for c, v in self.versions[k] if c <= t["start"])[1]
    def write(self, t, k, v):
        t["writes"][k] = v
    def commit(self, t):
        for k in t["writes"]:
            if self.versions[k][-1][0] > t["start"]:
                return "abort: first committer wins"
        self.clock += 1
        for k, v in t["writes"].items():
            self.versions[k].append((self.clock, v))
        return "commit"
    def latest(self):
        return {k: vs[-1][1] for k, vs in self.versions.items()}

db = SI({"A": 3, "B": 17})
ti, tj = db.begin(), db.begin()
db.write(ti, "A", db.read(ti, "B"))          # Ti: A := B
db.write(tj, "B", db.read(tj, "A"))          # Tj: B := A
print(db.commit(ti), db.commit(tj), db.latest())

db = SI({"X": 0})
t1, t2 = db.begin(), db.begin()
db.write(t1, "X", db.read(t1, "X") + 1)
db.write(t2, "X", db.read(t2, "X") + 1)
print(db.commit(t1), "|", db.commit(t2))
```

Run serially, A := B and B := A leave both 17 or both 3. Under SI they swap, A = 17 and B = 3, a state no serial order produces. The second run shows SI does stop the lost update, because both write X.

Write skew appears in real schemas: two doctors each check "at least one other doctor is on call" and both go off call. It also appears with inserts (two transactions both compute `max(orderno) + 1`), and read-only transactions can observe anomalies too. Integrity checks such as primary and foreign keys must be done on the current data, outside the snapshot.

**Workarounds.** `select … for update` treats the read as a write, so a concurrent write of that item causes a conflict. It does not help with phantoms or predicate reads.

**Serializable snapshot isolation (SSI)**, in PostgreSQL 9.1 and later at the `serializable` level, also tracks read-write dependencies (Ti reads a version that a concurrent Tj overwrites) and rolls back a transaction when two such dependencies in a row could form a cycle, using predicate locks to handle phantoms. Oracle's "serializable", and PostgreSQL's before 9.1, are plain SI.

| Scheme | Version timestamp | Writers | Serializable? |
|---|---|---|---|
| MVTO | creator's start TS | may abort on a late write | yes |
| MV2PL | commit counter | rigorous 2PL | yes |
| SI | commit time | first committer (or updater) wins | no: write skew |
| SSI | commit time | SI plus rw-dependency checks | yes |

## Weak consistency in practice {#ch06-weak .th}

- **Degree-two consistency**: S locks may be released at any time (and acquired at any time), X locks are held to the end. Not serializable.
- **Cursor stability**: lock a tuple, read it, release it at once; X locks held to the end. Most systems implement read committed this way, or with versions.
- **Across user interactions** locks cannot be held for minutes. Keep a version number per tuple, note it when reading, and write with `update r set …, version = version + 1 where id = 23 and version = :v`; zero rows updated means someone else changed it. This is optimistic concurrency control without read-set validation: it prevents lost updates but does not guarantee serializability.

## Concurrency in indices {#ch06-index .th}

Index access does not need to be serializable, as long as every lookup lands on the correct leaf. Applying 2PL to tree nodes would serialize every transaction through the root.

**Crabbing**: S-lock the root; lock the needed child, then release the parent. For insert and delete, X-lock the leaf; if it must split or merge, X-lock the parent and propagate upwards. Searches going down and splits going up can deadlock; the search is then aborted and restarted, without aborting the transaction.

**B-link trees** release the parent before locking the child, and give every node a right-sibling pointer, so a search that lands on a node that has just split simply follows the pointer to the right.

**Main-memory databases** can hold a short lock on a whole index per operation, because nothing waits for disk. Many use **latch-free** structures with compare-and-swap: to insert at the head of a list, set `node.next = head` and retry `CAS(head, old, node)` until it succeeds. Deletion has the **ABA problem**: P1 reads head N1 with next N2; P2 deletes N1 and N2 and reinserts N1 with next N3; P1's CAS sees head = N1 and succeeds, wrongly setting head to N2. Solutions include version counters on the pointer and safe memory reclamation.

**Operation locks.** Increments commute, so an **increment** lock mode can be compatible with itself (but not with S or X), and its undo is a decrement. A conditional increment, such as "decrement tickets if more than 0", does not commute.

**Online index creation** builds the index on a snapshot while recording later updates, applies those updates to catch up, briefly locks the relation to block updates while finishing, and then adds the index to the catalog.

## Drills: concurrency control {#ch06-drills .dr}

:::drill concept
Explain in three sentences why 2PL produces only conflict-serializable schedules.
---
**Answer.** If Ti → Tj on item Q, Tj got its conflicting lock after Ti released Q. Then Ti was shrinking (past its lock point) and Tj was growing (before its lock point), so Ti's lock point comes first. Every edge goes forward in lock-point order, so the graph is acyclic and lock-point order is an equivalent serial order.
:::

:::drill tricky
`T1: r(A) r(B) w(B)`, `T2: w(A) commit`, `T1: commit`. Possible under strict 2PL? Under rigorous 2PL?
---
**Answer.** Strict: yes. Once T1 holds X(B) it has all its locks and may release its S lock on A, so T2 can X-lock and write A; T1 keeps X(B) until commit. Rigorous: no. T1 holds S(A) until it commits, so T2 cannot write A before T1 commits.
:::

:::drill concept
Give a non-recoverable schedule that follows basic 2PL, and say which variant prevents it.
---
**Answer.** `T1: lock-X(A) W(A) unlock(A)`, `T2: lock-S(A) R(A) commit`, `T1: abort`. T2 committed after reading T1's uncommitted write. Strict 2PL prevents it: T1 would hold X(A) until it commits or aborts.
:::

:::drill concept
Under wait-die and wound-wait, what happens when an older transaction requests a lock held by a younger one, and vice versa?
---
**Answer.** Wait-die: older requester waits; younger requester dies. Wound-wait: older requester wounds (rolls back) the younger holder; younger requester waits. Both keep the original timestamp on restart, so nobody starves.
:::

:::drill output
Waits: T1 → T2, T2 → T4, T3 → T1, T4 → T3, T5 → T4. Is there a deadlock?
---
```python run=db-c06-d-wfg
g = {"T1": ["T2"], "T2": ["T4"], "T3": ["T1"], "T4": ["T3"], "T5": ["T4"]}
seen, t = [], "T1"
while t not in seen:
    seen.append(t); t = g[t][0]
print(seen[seen.index(t):] + [t])
```

**Why.** T1 → T2 → T4 → T3 → T1 is a cycle. T5 is waiting but not part of it, so rolling back T5 would not help.
:::

:::drill concept
Why are S and IX incompatible?
---
**Answer.** S on a relation implicitly read-locks every record in it. IX means the holder will X-lock some record below. If both were granted, the IX holder could update a record that the S holder has read-locked.
:::

:::drill concept
T3 scans a file and updates a few of its records. Which locks does it take, and does it conflict with T1, which reads one record of the file, and with T2, which updates another record?
---
**Answer.** IX on the database, SIX on the file, X on the records it updates. T1 holds IS on the file, compatible with SIX. T2 holds IX on the file, which conflicts with SIX, so T2 waits.
:::

:::drill tricky
`T1: read all s with 3 ≤ B ≤ 5`, `T2: insert (1, 5, 2), insert (2, 10, 2), commit`, `T1: read s where B = 10, commit`. Is it conflict serializable? Possible under strict 2PL with tuple locks only? Under next-key locking with index keys 1, 3, 5, 8, 12?
---
**Answer.** Not serializable: T1's range read conflicts with the first insert (T1 → T2, a phantom) and T2's second insert with T1's later read (T2 → T1). With tuple locks only it is possible: T1 locks only existing tuples, T2's new tuples conflict with nothing, and T2's locks are gone when T1 reads B = 10. With next-key locking it is not possible: T1 locks keys 3 and 5 and the next key 8; inserting B = 5 needs X on 5 and its next key 8, so T2 waits until T1 finishes.
:::

:::drill output
TSO with timestamps T1 = 1 and T2 = 2, all item timestamps 0: `T1: W(X)`, `T2: R(X)`, `T2: W(Y)`, `T1: R(Y)`. What happens?
---
```python run=db-c06-d-tso
W, R = {}, {}
W["X"] = 1
assert 2 >= W["X"]; R["X"] = 2
assert 2 >= R.get("Y", 0); W["Y"] = 2
print("T1 R(Y) allowed?", 1 >= W["Y"])
```

**Why.** T1's read of Y fails because W-TS(Y) = 2 > 1: the value T1 should see has been overwritten. T1 rolls back, and T2, which read T1's X, must roll back too through its commit dependency.
:::

:::drill tricky
In Thomas' write rule, which check changes and which stays? Why is ignoring the write safe?
---
**Answer.** Only the W-TS check changes: if TS(Ti) < W-TS(Q), the write is ignored instead of rolling Ti back. If TS(Ti) < R-TS(Q), Ti still rolls back. Ignoring is safe because a later transaction has already written Q and no transaction between them read it, so in timestamp order Ti's value would be overwritten unread.
:::

:::drill concept
What steps does the validation test perform for Ti, assuming serial validation?
---
**Answer.** For each Tj that validated before Ti and was concurrent with it (Tj finished after Ti started), check that writeset(Tj) ∩ readset(Ti) = ∅. If any check fails, Ti restarts. Transactions that finished before Ti started need no check.
:::

:::drill output
`T1: start, W(X)`, `T2: start, R(X), W(Y)`, `T1: R(Y), validate`, `T2: validate`. Who rolls back under validation?
---
```python run=db-c06-d-val
t1_writes, t2_reads = {"X"}, {"X"}
print("T2 rolls back" if t1_writes & t2_reads else "both commit")
```

**Why.** T1 validates first (it read Y before T2 wrote it, and T2's writes aren't applied yet). T2 was concurrent with T1 and read X, which T1 wrote, so T2 rolls back.
:::

:::drill concept
In MV2PL, how are timestamps assigned to update and read-only transactions, and which version does a read-only transaction read?
---
**Answer.** Update transactions: at commit, after all locks are held, by incrementing the counter. Read-only transactions: at start, by reading the counter without changing it. A read-only transaction reads the latest version with timestamp ≤ its own.
:::

:::drill tricky
Under snapshot isolation, which timestamp should a committed version carry, and why not the creator's start timestamp?
---
**Answer.** The creator's commit timestamp. A snapshot at time t must include exactly the transactions that committed before t. A transaction that started before t but committed after it would be included by its start timestamp even though its data was not committed at t, and a reader would see the version change under it. Uncommitted versions carry ∞ and are skipped.
:::

:::drill concept
How does SI validation use version timestamps?
---
**Answer.** Record the transaction's start timestamp. At commit, for each item it wrote, check the latest committed version: if its commit timestamp is greater than the start timestamp, a concurrent transaction wrote the item and committed first, so roll back.
:::

:::drill output
A = 3, B = 17. Ti: A := B and Tj: B := A run concurrently under SI. What is the result, and why isn't it serializable?
---
```python run=db-c06-d-skew
A, B = 3, 17
snap_i, snap_j = (A, B), (A, B)
A, B = snap_i[1], snap_j[0]
print(A, B)
```

**Why.** Both read the original values and write different items, so first-committer-wins never triggers. Serial orders give (17, 17) or (3, 3).
:::

:::drill concept
Why does `select … for update` fix some write-skew cases but not phantoms?
---
**Answer.** It treats the rows read as written, so a concurrent transaction writing those rows now conflicts. A phantom involves rows that did not exist when the query ran, so there is nothing to lock.
:::

:::drill tricky
Strict 2PL is required for the simple recovery scheme of Chapter 7. Show what goes wrong without it, with a log where T1 writes B from 30 to 20 and then T2 writes B from 20 to 40 and commits.
---
**Answer.** If the system crashes before T1 commits, recovery undoes T1 by restoring B = 30, the old value in T1's log record, and T2's committed write of 40 is lost. Strict 2PL prevents T2 from writing B until T1 commits or aborts.
:::

:::drill concept
Describe the ABA problem in a latch-free stack.
---
**Answer.** P1 reads head = N1 with next = N2 and prepares CAS(head, N1, N2). Meanwhile P2 pops N1 and N2 and pushes N1 back with next = N3. P1's CAS sees head = N1 and succeeds, setting head to N2, which is no longer in the list. A version counter on the head pointer, or delaying reuse of freed nodes, prevents it.
:::

## Write the code {#ch06-coding .cd}

:::drill code
Write a lock manager with FIFO queues: grant a request only if compatible with every earlier request in the queue, and on release grant waiting requests in order. Show that a waiting X request is not starved by later S requests.
---
```python run=db-c06-c-lockmgr
from collections import defaultdict
COMPAT = {("S", "S")}

class LockManager:
    def __init__(self):
        self.q = defaultdict(list)          # item -> [txn, mode, granted]
    def request(self, t, item, mode):
        queue = self.q[item]
        ok = all((m, mode) in COMPAT for _, m, _ in queue)
        queue.append([t, mode, ok])
        return "granted" if ok else "waits"
    def release(self, t, item):
        self.q[item] = [r for r in self.q[item] if r[0] != t]
        granted = []
        for i, r in enumerate(self.q[item]):
            if not r[2] and all((m, r[1]) in COMPAT for _, m, _ in self.q[item][:i]):
                r[2] = True
                granted.append(r[0])
        return granted

lm = LockManager()
print("T1 S:", lm.request("T1", "A", "S"))
print("T2 X:", lm.request("T2", "A", "X"))
print("T3 S:", lm.request("T3", "A", "S"), "(queued behind the X request)")
print("T1 releases, granted:", lm.release("T1", "A"))
print("T2 releases, granted:", lm.release("T2", "A"))
```

T3's S request is compatible with T1's S lock, but granting it would let readers overtake T2 indefinitely. Checking against every earlier request, granted or waiting, keeps the queue fair.
:::

:::drill code
Simulate wait-die and wound-wait on the same sequence of lock requests and count rollbacks.
---
```python run=db-c06-c-prevent
def run(scheme, events, ts):
    holder, log = {}, []
    for t, item in events:
        h = holder.get(item)
        if h is None or h == t:
            holder[item] = t; log.append(f"{t} gets {item}"); continue
        older = ts[t] < ts[h]
        if scheme == "wait-die":
            log.append(f"{t} waits for {h}" if older else f"{t} dies")
        else:
            if older:
                log.append(f"{t} wounds {h}"); holder = {k: v for k, v in holder.items() if v != h}
                holder[item] = t
            else:
                log.append(f"{t} waits for {h}")
    return log

ts = {"T1": 1, "T2": 2, "T3": 3}
events = [("T2", "A"), ("T1", "B"), ("T3", "B"), ("T1", "A"), ("T2", "B")]
for scheme in ("wait-die", "wound-wait"):
    print(f"{scheme:10}", "; ".join(run(scheme, events, ts)))
```

In wait-die the young T3 dies on its request; in wound-wait it waits, while old T1 wounds T2 to take A. In both, every wait goes one direction by age, so no cycle can form.
:::

## Cheat sheet {#ch06-cheatsheet .th}

- S compatible only with S. 2PL: growing then shrinking; serial order = lock-point order.
- Strict: hold X to commit (cascadeless). Rigorous: hold all to commit (order = commit order). 2PL alone gives neither recoverability nor deadlock freedom.
- Lock queue: grant only if compatible with all earlier requests (no starvation).
- Wait-die: old waits, young dies. Wound-wait: old wounds, young waits. Keep the original timestamp on restart. Detection: cycle in the wait-for graph.
- Intention locks: IS, IX, SIX; lock root to leaf, unlock leaf to root. S and IX conflict.
- Phantoms: index locking (lock leaves, even with no match) or next-key locking (inserts lock the next key too). Repeatable read doesn't stop phantoms.
- TSO: read fails if TS < W-TS; write fails if TS < R-TS or TS < W-TS (Thomas: ignore the latter). Restart with a new timestamp. Not recoverable without commit dependencies.
- Validation: for concurrent earlier validators, writeset(Ti) ∩ readset(Tj) = ∅.
- MVTO: versions labelled with the creator's TS; a write fails if a later transaction read the version it would supersede.
- MV2PL: update transactions get TS at commit; read-only at start, read latest version ≤ TS.
- SI: versions carry commit timestamps, uncommitted = ∞; first committer wins; stops lost updates, allows write skew. SSI adds rw-dependency tracking.
- Indices: crabbing or B-link trees, not 2PL. Latch-free CAS has the ABA problem.
