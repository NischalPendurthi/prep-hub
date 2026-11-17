---
title: Distributed transactions and consensus
part: Part D · Distributed
lede: A transaction that touches several sites must commit everywhere or nowhere, and replicated data must stay consistent while machines fail and networks split. This chapter covers two-phase commit and its blocking problem, persistent messaging with exactly-once delivery, distributed locking and deadlock, quorum replication, weak consistency with version vectors and Merkle trees, Raft and replicated state machines, and how Spanner uses clock bounds to give external consistency.
desc: local and global transactions, 2PC, failure handling, in-doubt transactions, 3PC, persistent messaging, exactly-once processing, Kafka, distributed lock managers, global deadlock, leases, logical clocks, primary copy, majority protocol, quorums, chain replication, CAP, BASE, version vectors, Merkle trees, coordinator election, Paxos, Raft, replicated state machines, Spanner, commit wait
hours: 4
prereqs: Chapters 6 to 8
---

## Setting {#ch09-setting .th}

A **local** transaction touches one site; a **global** transaction touches several. Each site runs a **transaction manager** (log, local commit and abort) and a **transaction coordinator** (starts transactions, sends subtransactions out, and decides how they end).

Failures: a site fails; a message is lost (TCP retransmits); a link fails (the network reroutes); or the network **partitions** into groups that cannot reach each other. A remote site failure and a partition look the same from outside. Protocols assume **fail-stop** sites: a failed site stops, and nobody sends malicious messages.

## Two-phase commit {#ch09-2pc .th}

For transaction T coordinated by Ci:

**Phase 1.** Ci logs and forces `<prepare T>` and sends `prepare T` to every site. A site that cannot commit logs `<no T>` and replies `abort T`. A site that can commit forces all of T's log records and `<ready T>` to stable storage, then replies `ready T`. From then on the site is in the **ready state**: it has promised to commit if told to, and it cannot change its mind.

**Phase 2.** If every site replied ready, Ci logs and forces `<commit T>`; otherwise `<abort T>`. Once that record is on stable storage the decision is irrevocable; this is the **atomic point of commit**. Ci sends the decision to all sites, which act on it locally.

### Handling failures

| A participant Sk recovers and finds in its log | It does |
|---|---|
| `<commit T>` | redo(T) |
| `<abort T>` | undo(T) |
| `<ready T>` only | ask Ci (or other sites) for the decision; until then T is **in doubt** |
| no control records | it failed before replying, so Ci must have aborted T: undo(T) |

| The coordinator fails, and an active site has | Decision |
|---|---|
| `<commit T>` | commit |
| `<abort T>` | abort |
| no `<ready T>` | abort: Ci cannot have decided to commit |
| every active site has only `<ready T>` | **wait** for Ci to recover: the blocking problem |

In-doubt transactions hold their locks while they wait, which can block other work for a long time. To let a recovering site resume new work quickly, it logs `<ready T, L>` with the list L of T's write locks (read locks can be omitted), re-acquires them during recovery, and then accepts new transactions while T waits.

During a partition, sites in the coordinator's part run the protocol normally; the others behave as if the coordinator failed. Nothing goes wrong, but they may wait.

**Three-phase commit** avoids blocking under some assumptions (no partitions, bounded delays) but is complex and rarely used. Modern systems instead record the commit decision through a **consensus** protocol, so it is known as long as a majority of a replica group is reachable; Spanner coordinates 2PC from a leader of a Paxos group.

```python run=db-c09-2pc
def two_pc(votes, coordinator_crash_after_prepare=False):
    log = {"C": ["<prepare T>"]}
    for site, vote in votes.items():
        log[site] = ["<ready T>"] if vote else ["<no T>"]
    if coordinator_crash_after_prepare:
        return log, "coordinator down: sites with only <ready T> must wait"
    decision = "commit" if all(votes.values()) else "abort"
    log["C"].append(f"<{decision} T>")                     # forced: the decision point
    for site in votes:
        log[site].append(f"<{decision} T>")
    return log, decision

print(two_pc({"S1": True, "S2": True})[1])
print(two_pc({"S1": True, "S2": False})[1])
print(two_pc({"S1": True, "S2": True}, coordinator_crash_after_prepare=True)[1])
```

:::trap 2PL is not 2PC
Two-phase locking is a concurrency-control protocol: grow, then shrink. Two-phase commit is an atomic commit protocol: prepare, then decide. A distributed transaction typically uses both.
:::

## Persistent messaging {#ch09-messaging .th}

2PC is unsuitable between organizations: a participant blocks on another organization's coordinator, and every commit waits for the slowest site. **Persistent messaging** guarantees that a message is delivered exactly once if and only if the sending transaction commits. It gives atomic delivery but not isolation: intermediate states are visible, and failures must be handled with **compensating** transactions.

For example, a transfer between banks debits the account and sends a "credit" message in one transaction; the other bank credits on receipt. If the credit is impossible because the account was closed, a compensating message credits the money back, and if that fails, people resolve it.

**Sending**: the transaction writes the message into a `messages_to_send` relation, atomically with its other updates. A delivery process watches that relation, sends each message, resends periodically until it is acknowledged, and then deletes it. Since the message is in the relation only if the transaction committed, nothing is sent for an aborted transaction.

**Receiving**: each message has a unique ID. On receipt, a transaction adds it to `received_messages` **if not already present** and commits, then sends the acknowledgement; if it is already present, the receiver just acknowledges again. Another transaction processes unprocessed messages and marks them processed. Very late duplicates are handled by timestamping messages, rejecting those older than a cutoff, and deleting stored IDs past it.

```python run=db-c09-exactly-once
import random
random.seed(1)
outbox = {101: "credit 50"}            # written in the sender's committed transaction
received, processed, acct = set(), set(), {"bal": 0}
deliveries = 0

def receive(msg_id, body):
    global deliveries
    deliveries += 1
    if msg_id not in received:          # one transaction: dedupe and record
        received.add(msg_id)
        acct["bal"] += 50; processed.add(msg_id)
    return "ack"

attempts = 0
while outbox:
    attempts += 1
    for mid, body in list(outbox.items()):
        delivered = random.random() < 0.5
        if delivered:
            ack = receive(mid, body)
            if random.random() < 0.5:   # the ack itself may be lost
                outbox.pop(mid)
print("send attempts:", attempts, "| deliveries:", deliveries, "| balance:", acct["bal"])
```

The message is delivered several times, because messages and acknowledgements are lost, yet the account is credited once.

### Exactly once from a log such as Kafka

An application consuming a numbered message stream, with no gaps, processes messages in sequence order and stores **the sequence number of the last processed message in the database, inside the same transaction** that applies the message. After a crash it reads that number and resumes from the next one, fetching any missing numbers from the log by sequence number. Because the number and the effects commit atomically, no message is skipped or applied twice.

### Example: selling concert tickets

Using 2PC between the ticket site and a payment site would block the ticket transaction until payment is confirmed, and worse, block the payment site on the ticket site's coordinator. Blocking on an external organization is unacceptable. With persistent messaging, the ticket site sends a payment request and waits for a reply message; the payment site processes it and replies with success or failure.

With UPI, say: the ticket site sends the payment service a message with the payee, payer, a unique transaction ID and the amount; the payment service sends the payer's phone a request to approve; the phone sends the approval back; the payment service settles with the banks and sends the ticket site a success or failure message.

Error cases that 2PC would never have: the payment succeeds but the seats were sold meanwhile (if not held), so a refund is needed; the ticket site holds the seat, times out and releases it, then the payment succeeds late, so a refund is needed; and the refund itself, also a persistent message, can fail (the account was closed), needing manual resolution.

## Distributed locking and deadlock {#ch09-locking .th}

A **single lock manager** at one site is simple and makes deadlock handling simple, but it is a bottleneck and a single point of failure. A **distributed lock manager** lets each site manage the locks on its own items; then a deadlock can span sites with no local cycle anywhere.

**Centralized detection**: a coordinator builds a global wait-for graph from the sites' local graphs, updated on each change, after a batch of changes, or when a check is needed. A cycle means choosing a victim and telling every site. Message delays can cause **false cycles**: if T1 → T2 is removed (T2 released a lock) but that message arrives after the insertion of T2 → T3, the coordinator sees T1 → T2 → T3 → T1 that never existed. This cannot happen under 2PL, because T2 cannot release a lock and then request another; but unnecessary rollbacks can still happen when a victim was chosen just as the deadlock resolved itself. Fully distributed detection is expensive and rarely used.

A **lease** is a lock granted for a fixed time, renewed if needed, used for example to ensure only one coordinator exists. The holder must check that the lease's expiry is at least some margin ahead before acting, to cover processing and network delay. Leases depend on clocks being roughly synchronized, and messages from an old lease must be ignored.

**Timestamps** in a distributed system are `(local counter or clock, site ID)`, which are unique. A site with a slow clock gives its transactions old timestamps and disadvantages them. NTP fixes most of it; **logical clocks** fix ordering: when a site receives a request with timestamp ⟨x, y⟩ and x is above its own counter, it advances its counter to x + 1.

Distributed timestamp ordering applies the usual checks at each site. Distributed validation validates at every site the transaction touched and needs 2PC; the writes happen only after the decision, and a reader of a prepared item's old value must wait or take a commit dependency. Fully distributed validation is rare; a simplified form, optimistic writes conditional on an unchanged version number, is common (`checkAndPut` in HBase).

## Replication with strong consistency {#ch09-replication .th}

**Primary copy**: one replica of each item is the primary; all reads and writes go through it, which is cheap. If the primary fails, the data is unavailable until a new primary takes over, and its lock state is lost.

**Majority protocol**: with n replicas, a transaction locks a majority of them for both reads and writes.

- Each replica stores a **version number**, incremented by every write.
- **Read**: lock and read a majority, compare their version numbers, and use any copy with the **highest** version. Read and write majorities always overlap, so at least one copy read has the latest write; possibly only one.
- **Write**: lock a majority, find the highest version among them, and write the new value with version = highest + 1 to all of them.
- Commit with 2PC on the locked replicas, or with consensus.

Failures are tolerated as long as a majority is up, and a recovered replica needs no special reintegration, since stale replicas are detected by their versions (and can be repaired on read). The cost is high, especially for reads, which touch a majority.

```python run=db-c09-majority
import random
random.seed(5)
replicas = [{"v": 0, "val": "init"} for _ in range(5)]
def majority():
    return random.sample(range(5), 3)
def write(val):
    m = majority()
    v = max(replicas[i]["v"] for i in m) + 1
    for i in m:
        replicas[i] = {"v": v, "val": val}
def read():
    m = majority()
    best = max((replicas[i] for i in m), key=lambda r: r["v"])
    return best["val"], [replicas[i]["v"] for i in m]
write("a"); write("b"); write("c")
print("replica versions:", [r["v"] for r in replicas])
for _ in range(3):
    print("read:", read())
```

Some replicas are stale, yet every read returns "c", because any 3 of 5 replicas include at least one holding version 3. Reading the most common value instead of the highest version would be wrong.

**Quorum consensus** generalizes this. Give replicas weights totalling S, and choose a read quorum Qr and a write quorum Qw with `Qr + Qw > S` (every read overlaps every write) and `2·Qw > S` (writes overlap each other). Majority is `Qr = Qw = ⌊S/2⌋ + 1`. The **biased** protocol reads any one replica and writes all of them: `Qr = 1, Qw = S`, which is cheap for reads but blocks writes if any replica is down. Majority locking can deadlock even on one item, when two transactions each lock different replicas; locking replicas in a fixed order avoids it.

**Read one, write all available** is incorrect: a site that was down and comes back holds old values without knowing it, and two partitions can each update their own replicas.

**Chain replication** reduces read cost: writes enter at the head and pass down the chain; reads go to the tail, which only sees fully replicated writes. Any failure reconfigures the chain.

**Reconfiguration** after a failure aborts transactions active at the failed site, updates the catalog, and elects replacements for central roles, while making sure two partitions do not each elect their own coordinator or both update an item (majority rules prevent that). **Reintegration** of a recovered site cannot stop all updates; instead, lock all replicas of its items, bring them up to date, and release, one partition at a time.

Compared with remote backup (Chapter 7), majority replication needs no failure detection or switchover and keeps running through failures, at the cost of more messages per operation.

**Linearizability** is a consistency guarantee for a single item: operations appear in one order in which each read sees the latest preceding write, and an operation that finished before another started comes first. It is different from serializability, which is about transactions over many items.

## Weak consistency {#ch09-weak .th}

The CAP theorem forces a choice during partitions, and low latency is another reason to serve possibly stale data. Weak quorums (`Qr + Qw ≤ S`, as configurable in Cassandra and MongoDB) allow stale reads. **Asynchronous replication** commits at the primary and propagates later; **multimaster** systems accept updates anywhere. Updates propagate through persistent messaging or a log such as Kafka, in order and fault-tolerantly, giving **eventual consistency**: with no new updates, all replicas converge. The style is called **BASE**: basically available, soft state, eventually consistent.

Applications often need weaker guarantees than full consistency: **read your writes**, **session consistency**, **monotonic reads and writes**. Sticky sessions, which send one session's requests to one replica, provide them cheaply.

**Asynchronous view maintenance**: a global secondary index is a materialized view (a projection of r on (C, A), partitioned on C) maintained after the base transaction commits. If (a1, b1, c1) is updated to (a1, b1, c2), two messages are published: delete (c1, a1) and insert (c2, a1). The topic is partitioned by C value, one partition per index tablet, and each index tablet subscribes to its partition, so each message reaches the tablet that holds that C value. Processing must be exactly once, and queries see an index that is eventually, not transactionally, consistent.

### Detecting conflicts: version vectors

Each item carries a vector of (node, counter) pairs; a node updating it increments its own counter. Vector V1 is newer than V2 if it is at least as large in every position and larger in one; otherwise they are **concurrent**, meaning conflicting updates happened at different replicas. Reads return all concurrent versions, and the application reconciles them and writes a merged version whose vector is the element-wise maximum.

```python run=db-c09-vv
def compare(a, b):
    ge = all(x >= y for x, y in zip(a, b)); le = all(x <= y for x, y in zip(a, b))
    return "equal" if ge and le else "newer" if ge else "older" if le else "concurrent"
d1 = [1, 0, 0]
n1 = [2, 0, 0]                     # N1 updates
n2, n3 = [2, 1, 0], [2, 0, 1]      # N2 and N3 update concurrently
print(compare(n1, d1), compare(n2, n3))
print("merged:", [max(x, y) for x, y in zip(n2, n3)])
```

Merging by state alone has traps: merging two shopping carts as a union resurrects an item that one replica deleted, because a deletion at one site looks the same as an addition at the other. Merging operation histories, or using operations that give the same result in any order, avoids that.

### Finding divergence: Merkle trees

To compare two replicas of a large relation, each maintains a **Merkle tree**: leaves hold the hash of the tuples mapped to them, and each internal node holds the hash of its children's hashes. If the root hashes match, the replicas agree. If not, fetch and compare the children's hashes and descend only into those that differ; at a differing leaf, compare the individual tuple hashes. Finding m differences among N tuples costs about O(m log N) hash comparisons, and wider trees mean fewer network round trips.

```python run=db-c09-merkle
import hashlib
def H(s): return hashlib.sha256(s.encode()).hexdigest()[:8]

def build(tuples, fanout=4, leaves=16):
    buckets = [[] for _ in range(leaves)]
    for t in tuples:
        buckets[int(H(t[0]), 16) % leaves].append(t)
    level = [H("".join(H(repr(t)) for t in sorted(b))) for b in buckets]
    tree = [level]
    while len(level) > 1:
        level = [H("".join(level[i:i + fanout])) for i in range(0, len(level), fanout)]
        tree.append(level)
    return tree[::-1], buckets

def diff(a, b, fanout=4):
    (ta, ba), (tb, bb) = a, b
    nodes, compared = [0], 0
    for depth in range(1, len(ta)):
        nodes = [c for n in nodes for c in range(n * fanout, n * fanout + fanout)
                 if (compared := compared + 1) and ta[depth][c] != tb[depth][c]]
    rows = [t for leaf in nodes for t in set(ba[leaf]) ^ set(bb[leaf])]
    return sorted(rows), compared

r1 = [(f"k{i}", i) for i in range(1000)]
r2 = list(r1); r2[123] = ("k123", -1); r2[777] = ("k777", -7)
print(build(r1)[0][0] == build(r2)[0][0])
print(diff(build(r1), build(r2)))
```

Only the subtrees that differ are explored. Comparing replicas should use a **snapshot** of each, not read locks: walking the tree takes time, and locking the whole relation that long would block updates. The snapshots must also be of the same point in the serialization order, which Spanner's timestamps provide (below).

## Consensus and Raft {#ch09-raft .th}

**Consensus** makes all nodes agree on a value, even with failures, without blocking as long as a majority is reachable. Multiple consensus maintains a **replicated log**: nodes act on an entry only once its position in the log is decided.

**Coordinator election** can use a fault-tolerant lock service (ZooKeeper, Chubby) to grant a coordinator lease, or an election: candidates ask for votes, a majority wins, and **term numbers** (one above the last known) make stale messages from old terms easy to ignore. A **split brain**, an old coordinator that is disconnected but still believes it leads, is handled by terms and leases.

**Paxos** (numbered proposals, acceptors, a majority decides) is correct but hard to understand; Multi-Paxos handles sequences, and ZooKeeper uses Zab. **Raft** is designed to be understandable:

- A **leader** is essential. Time is divided into **terms**, each with at most one leader. A follower that hears nothing from a leader becomes a candidate, increments the term, and requests votes; each node votes once per term; randomized election timeouts reduce split votes.
- A node votes only for a candidate whose log is **at least as up to date** as its own. Since a committed entry is on a majority and a winner has votes from a majority, the new leader has every committed entry.
- Clients send requests to the leader, which appends them and sends `AppendEntries(term, prevLogIndex, prevLogTerm, entries, leaderCommitIndex)`. An entry is committed once a majority has stored it.

On `AppendEntries`, a follower:

1. replies false if `term < currentTerm`;
2. replies false if it has no entry at `prevLogIndex` with term `prevLogTerm`;
3. if an existing entry conflicts with a new one (same index, different term), deletes it and everything after it;
4. appends any new entries not already in its log;
5. if `leaderCommitIndex > commitIndex`, sets `commitIndex = min(leaderCommitIndex, index of last new entry)`;
6. replies true.

A false reply with a higher term makes the leader step down; otherwise the follower is behind, and the leader retries from an earlier position until the logs match. A new leader cannot declare an entry from an earlier term committed just by counting replicas; it commits it indirectly, by replicating an entry of its own term.

```python run=db-c09-raft
def append_entries(log, term, current_term, prev_idx, prev_term, entries, leader_commit, commit):
    """log is a list of (term, cmd); indices are 1-based like the paper."""
    if term < current_term:
        return False, log, commit
    if prev_idx > 0 and (len(log) < prev_idx or log[prev_idx - 1][0] != prev_term):
        return False, log, commit
    log = list(log)
    for k, e in enumerate(entries):
        i = prev_idx + k                       # 0-based slot
        if i < len(log) and log[i][0] != e[0]:
            log = log[:i]                      # conflict: drop it and everything after
        if i >= len(log):
            log.append(e)
    if leader_commit > commit:
        commit = min(leader_commit, prev_idx + len(entries))
    return True, log, commit

follower = [(1, "x=1"), (1, "y=2"), (2, "x=9")]           # stale entry from a deposed leader
leader_log = [(1, "x=1"), (1, "y=2"), (3, "y=5"), (3, "z=1")]
print(append_entries(follower, 3, 2, 3, leader_log[2][0], leader_log[3:], 4, 1))   # entry 3 differs
print(append_entries(follower, 3, 2, 2, leader_log[1][0], leader_log[2:], 4, 1))   # retry one earlier
```

The first call fails because the follower's entry 3 is from term 2, not what the leader has. The leader retries one entry earlier; this time the logs agree at position 2, the conflicting entry is discarded, and the follower adopts the leader's entries and commit index.

### Replicated state machines

A **replicated state machine** is a state plus deterministic transitions, replicated by feeding every replica the same sequence of inputs from a replicated log. Each replica executes the committed log records in log order. Under Raft, a replica may execute a record once the leader has told it the record is committed (its position is at most `leaderCommitIndex`) and all earlier records have been executed. **Determinism** is essential: if executing the same records could lead to different states (random numbers, local clocks, thread timing), the replicas would diverge.

Examples: a fault-tolerant lock manager (the state is the lock table, and the centralized algorithm runs on it), or a key-value store, where even `get()` goes through the log to see the latest committed state. In Spanner, each partition's replicas form a Paxos group with a leader.

## Spanner {#ch09-spanner .th}

Spanner runs **MV2PL** across data centres: update transactions use 2PL and get their timestamps at commit; read-only transactions get a timestamp at start and read the versions as of that timestamp without locks. With many machines, a central timestamp counter would be a bottleneck, and unsynchronized clocks could give a later commit a smaller timestamp.

Spanner uses **real time**. GPS receivers and atomic clocks bound each machine's clock error: when the local clock reads t′, the true time t satisfies `t′ − ε ≤ t ≤ t′ + ε`, where ε is an upper bound computed at that moment (typically a few milliseconds).

**Commit wait**: an update transaction, after acquiring all its locks, reads the clock as t′ and takes `ts = t′ + ε` as its commit timestamp, then waits until the clock reads past `t′ + 2ε` before releasing its locks and making its writes visible. Whether the clock was fast or slow by up to ε, the true time has then definitely passed t′ + ε, so the locks were definitely held at real time ts. A version with timestamp ts therefore really was the value at real time ts.

```python run=db-c09-commit-wait
eps = 4                                   # ms, clock uncertainty
for true_offset in (-eps, 0, +eps):       # local clock is slow, exact, or fast
    t_true_at_read = 1000
    t_local = t_true_at_read + true_offset
    ts = t_local + eps
    release_local = t_local + 2 * eps
    release_true = release_local - true_offset
    print(f"clock off by {true_offset:+} ms: commit ts {ts}, locks held from true time {t_true_at_read} "
          f"to {release_true}; covers ts: {t_true_at_read <= ts <= release_true}")
```

The result is **external consistency**: if T1 commits before T2 starts in real time, T1's timestamp is smaller. A read at timestamp t, at any replica, sees exactly the transactions that committed before t, the same point in the serialization order everywhere. That makes consistent snapshots across replicas cheap, for comparing replicas with Merkle trees, for backups or for analytics.

Read-only transactions choose a timestamp below which every transaction is resolved, so they never wait for locks, though they may read slightly old data. A replica can serve a read at t if t is below its **t_safe**, the point up to which it has received all updates.

## Drills: distributed transactions {#ch09-drills .dr}

:::drill concept
In 2PC, when is a transaction committed, and how do all sites end up following the same decision?
---
**Answer.** When the coordinator's `<commit T>` record reaches stable storage. A site that voted ready has logged `<ready T>` and must obtain the decision from the coordinator (or another site that knows it) and follow it; it cannot decide on its own.
:::

:::drill concept
A participant recovers and finds only `<ready T>` in its log. What does it do? What if it finds no control records for T?
---
**Answer.** Only `<ready T>`: T is in doubt, so it asks the coordinator or other sites for the decision and holds T's locks until it learns it. No control records: it failed before voting, so the coordinator cannot have committed T; it undoes T.
:::

:::drill tricky
The coordinator fails. Every active site has `<ready T>` and none has a decision. Why can't they decide by themselves?
---
**Answer.** The coordinator may have already logged `<commit T>` (and perhaps told a site that has since failed), or it may have logged `<abort T>`. The surviving sites cannot tell which, and any choice could contradict a decision already made. They must wait for the coordinator: the blocking problem. Recording the decision through consensus removes it.
:::

:::drill concept
How do persistent messaging systems deliver each message exactly once after the sending transaction commits, and how does the receiver process it exactly once?
---
**Answer.** Each message has a unique ID. The sending transaction writes it to a messages-to-send relation, so it exists only if the transaction committed. A delivery process sends it and keeps retrying until acknowledged. The receiver, in one transaction, adds the message to a received-messages relation only if absent, processes it (or queues it), commits, and then acknowledges; if it is already present, it acknowledges immediately.
:::

:::drill tricky
An application consumes numbered messages from Kafka. After a crash, how does it make sure every message is processed exactly once?
---
**Answer.** Process messages in sequence order with no gaps, and in each transaction also store the sequence number of the last message processed, so the number and the effects commit together. On recovery, read that number and resume from the next one, fetching any missing messages from Kafka by sequence number.
:::

:::drill concept
Why is 2PC a poor fit for buying a concert ticket and paying through a separate payment service? What error cases does persistent messaging introduce?
---
**Answer.** With 2PC the ticket transaction blocks until payment completes, and the payment service blocks on the ticket site's coordinator; blocking on another organization is unacceptable. With messaging: payment may succeed after the seats were sold, or after the hold timed out and the seat was released, requiring a refund; and the refund can itself fail, needing manual resolution.
:::

:::drill concept
In the majority protocol, a reader finds different values in different replicas. Which does it use, and how does it know?
---
**Answer.** The one with the highest version number. Every write increments the version, and read and write majorities overlap, so at least one replica read has the latest version, even if it is the only one.
:::

:::drill output
S = 7 replicas of equal weight. Which (Qr, Qw) pairs are valid: (4, 4), (1, 7), (3, 5), (2, 5), (4, 3)?
---
```python run=db-c09-d-quorum
S = 7
for qr, qw in [(4, 4), (1, 7), (3, 5), (2, 5), (4, 3)]:
    print((qr, qw), qr + qw > S and 2 * qw > S)
```

**Why.** Need Qr + Qw > S so reads see the latest write, and 2·Qw > S so two writes cannot both succeed on disjoint replicas.
:::

:::drill concept
Why is "read one, write all available" incorrect?
---
**Answer.** A replica that was down misses writes and, on returning, serves old values without knowing it is stale. In a partition, each side writes to the replicas it can reach, so the two sides diverge.
:::

:::drill concept
What is the key idea of a replicated state machine, and why must it be deterministic?
---
**Answer.** Every replica receives the same log of operations (transactions) and executes the committed ones in log order, so all replicas pass through the same states. If execution were not deterministic, replicas applying the same log could end in different states.
:::

:::drill concept
With Raft, when can a replicated state machine execute a logged transaction?
---
**Answer.** When the leader has told it the entry is committed, that is, its position is at or before `leaderCommitIndex`, and all earlier entries have been executed.
:::

:::drill output
Five nodes have Raft logs of length 7, 5, 7, 3 and 6, all agreeing on common prefixes. Which entries are on a majority?
---
```python run=db-c09-d-raftmaj
lengths = [7, 5, 7, 3, 6]
print([i for i in range(1, 8) if sum(l >= i for l in lengths) >= 3])
```

**Why.** Entries 1–6 are on at least three nodes. Entry 7 is on two, so it is not yet committed.
:::

:::drill tricky
How does Spanner assign timestamps to update transactions, what is commit wait, and what does ε represent?
---
**Answer.** At commit, after all locks are held, from the real clock. ε is an upper bound on the clock's error at that moment, computed from GPS and atomic clock references. The transaction reads the clock as t′ and waits 2ε before releasing its locks. Whether t′ was fast or slow by up to ε, the locks were then certainly held at real time t′ + ε, which is the timestamp, so that version truly was the value at that real time.
:::

:::drill tricky
Why compare replicas with Merkle trees on snapshots rather than under read locks, and how does Spanner help get matching snapshots?
---
**Answer.** Walking the trees takes time, and read-locking a whole relation that long blocks updates; snapshots do not affect other transactions. Spanner's external consistency means a snapshot at the same timestamp on every replica is the same point in the serialization order, so the replicas can be compared exactly at that timestamp.
:::

:::drill output
Version vectors [2, 1, 0] and [2, 0, 1]: which is newer? What does the merged version carry?
---
```python run=db-c09-d-vv
a, b = [2, 1, 0], [2, 0, 1]
print(all(x >= y for x, y in zip(a, b)), all(y >= x for x, y in zip(a, b)), [max(x, y) for x, y in zip(a, b)])
```

**Why.** Neither dominates, so the updates were concurrent and the application must reconcile them; the merged write carries [2, 1, 1].
:::

:::drill concept
Record (a1, b1, c1) of r(A, B, C) becomes (a1, b1, c2). The secondary index on C is maintained asynchronously through a pub-sub system. What messages are published, and how do index partitions receive the right ones?
---
**Answer.** Delete (c1, a1) and insert (c2, a1). The topic is partitioned by C value, one topic partition per index tablet; each message is routed by its C value, and each index tablet subscribes to its own topic partition.
:::

:::drill concept
How can a false deadlock cycle appear in centralized global deadlock detection?
---
**Answer.** If a "remove edge T1 → T2" message is delayed while an "insert edge T2 → T3" message arrives first, the coordinator may see T1 → T2 → T3 → T1, which never existed at any instant. Under 2PL this specific case cannot occur, since T2 cannot release a lock and then wait for another, but victims can still be chosen unnecessarily.
:::

## Write the code {#ch09-coding .cd}

:::drill code
Write a Raft leader election simulation with randomized timeouts and the "log at least as up to date" voting rule, and show that a node with a stale log cannot win.
---
```python run=db-c09-c-election
nodes = {
    "A": {"term": 3, "log": [(1,), (2,), (3,)]},
    "B": {"term": 3, "log": [(1,), (2,)]},          # stale
    "C": {"term": 3, "log": [(1,), (2,), (3,)]},
    "D": {"term": 3, "log": [(1,), (2,), (3,)]},
    "E": {"term": 3, "log": [(1,)]},                # very stale
}
def up_to_date(cand, voter):
    lc, lv = cand["log"], voter["log"]
    return (lc[-1][0], len(lc)) >= (lv[-1][0], len(lv))
def election(cand_name):
    cand = nodes[cand_name]
    term = cand["term"] + 1
    votes = 1 + sum(up_to_date(cand, v) for n, v in nodes.items() if n != cand_name)
    return term, votes, votes > len(nodes) // 2

for name in ["B", "E", "A"]:
    term, votes, won = election(name)
    print(f"{name} runs for term {term}: {votes} votes, {'wins' if won else 'loses'}")
```

A stale candidate gets votes only from nodes at least as stale as itself, never from the majority holding the committed entry 3, so only an up-to-date node such as A can win. In a real cluster, randomized election timeouts decide which node runs first.
:::

:::drill code
Write a two-phase commit coordinator that recovers from its own log after a crash and resends the decision, and participants that answer status queries.
---
```python run=db-c09-c-2pc-recover
class Site:
    def __init__(self, name, can_commit=True):
        self.name, self.can, self.log = name, can_commit, []
    def prepare(self):
        self.log.append("ready" if self.can else "no")
        return self.can
    def decide(self, d):
        if self.log[-1] == "ready": self.log.append(d)
    def status(self):
        return self.log[-1] if self.log else "unknown"

class Coordinator:
    def __init__(self, sites): self.sites, self.log = sites, []
    def run(self, crash_before_sending=False):
        self.log.append("prepare")
        d = "commit" if all(s.prepare() for s in self.sites) else "abort"
        self.log.append(d)                               # forced to stable storage
        if crash_before_sending:
            return "crashed"
        for s in self.sites: s.decide(d)
        return d
    def recover(self):
        d = self.log[-1] if self.log[-1] in ("commit", "abort") else "abort"
        for s in self.sites:
            if s.status() == "ready": s.decide(d)
        return d

sites = [Site("S1"), Site("S2")]
c = Coordinator(sites)
print(c.run(crash_before_sending=True), [s.status() for s in sites])
print("after coordinator recovery:", c.recover(), [s.status() for s in sites])
```

While the coordinator is down, both sites sit in the ready state, the blocking window. On recovery the coordinator finds its forced decision and resends it. Had it crashed before forcing a decision, recovery would abort, which is safe because no site can have been told to commit.
:::

## Cheat sheet {#ch09-cheatsheet .th}

- 2PC: prepare → ready (forced) → decision (forced at coordinator = commit point) → act. Ready sites can't decide alone; coordinator failure blocks them. Log `<ready T, L>` to re-acquire locks and resume.
- Persistent messaging: messages in a relation written by the sending transaction; resend until acked; dedupe by ID at the receiver. Atomic delivery, no isolation, compensate for failures.
- Exactly once from a log: process in order, store the last sequence number in the same transaction.
- Global deadlocks need a global wait-for graph; delayed messages can create false cycles. Leases need synchronized clocks.
- Majority protocol: lock a majority, version numbers, read the highest version, write highest + 1. Quorums: Qr + Qw > S, 2·Qw > S. Biased: Qr = 1, Qw = S. Read-one-write-all-available is wrong.
- CAP: choose C or A during partitions. Eventual consistency, BASE, session guarantees.
- Version vectors detect concurrent updates; Merkle trees find differences in O(m log N).
- Raft: terms, one vote per term, vote only for up-to-date logs, commit on a majority, AppendEntries consistency check. Replicated state machines execute committed entries in order, deterministically.
- Spanner: MV2PL with real-time timestamps; ε bounds clock error; commit wait 2ε so locks were held at the timestamp; external consistency gives consistent snapshots everywhere.
