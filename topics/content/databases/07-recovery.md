---
title: Recovery and ARIES
part: Part C · Transactions
lede: Recovery makes committed work survive crashes and makes aborted or interrupted work vanish. This chapter covers log records and write-ahead logging, the steal and no-force buffer policies, checkpoints, the redo-then-undo recovery algorithm worked on a real log, logical undo, ARIES with its LSNs and dirty page table, remote backup, and shadow paging.
desc: failure types, stable storage, log records, CLRs, WAL, steal/no-force, checkpoints, fuzzy checkpoints, repeating history, redo and undo passes, logical undo, ARIES, PageLSN, RecLSN, dirty page table, UndoNextLSN, remote backup, one-safe and two-safe, near-DR sites, shadow paging
hours: 3.5
prereqs: Chapters 1, 5 and 6
---

## Failures and storage {#ch07-failures .th}

- **Transaction failure**: a logical error (bad input, a constraint violation) or a system error (the DBMS kills it, for example as a deadlock victim).
- **System crash**: power, hardware or software failure. The **fail-stop** assumption: memory is lost, but nonvolatile storage is not corrupted.
- **Disk failure**: a head crash or similar, assumed detectable through checksums.

Recovery has two parts: work during normal processing that saves enough information, and work after a failure that restores atomicity and durability. It relies on **stable storage**, approximated by multiple copies (RAID, a remote site).

Notation: `input(B)` and `output(B)` move block B between disk and buffer. `read(X)` and `write(X)` move item X between the buffer and the transaction's private work area. An `output` need not follow a `write` immediately.

## The log {#ch07-log .th}

| Record | Meaning |
|---|---|
| `<Ti start>` | Ti begins |
| `<Ti, X, V1, V2>` | Ti updated X from old value V1 (for undo) to new value V2 (for redo); written before the update |
| `<Ti, X, V1>` | redo-only **compensation log record** (CLR), written when an update is undone |
| `<Ti commit>` | Ti is committed once this record reaches stable storage |
| `<Ti abort>` | the rollback of Ti is complete |

With **immediate modification**, uncommitted updates may reach the buffer and disk before commit, so the log record must be written first. With **deferred modification**, updates reach the database only at commit, which simplifies recovery but costs extra local copies.

Recovery assumes that no other transaction modifies an item Ti modified until Ti commits or aborts, which strict 2PL guarantees. Otherwise undo breaks: if T1 writes A, T2 writes A and commits, and T1 aborts, restoring T1's old value would wipe out T2's committed write.

- `undo(Ti)`: go backwards through Ti's log records, restore each old value V1, write a CLR `<Ti, X, V1>` for each, then write `<Ti abort>`.
- `redo(Ti)`: go forwards and set each new value V2. No logging.

### Write-ahead logging and log buffering

Log records collect in a memory buffer and are written out when a block fills or on a **log force**, which happens at commit. Many records go out in one I/O, which is why committing many small transactions together (group commit) is cheap. The rules:

1. Log records are output to stable storage in the order they were created.
2. Ti enters the commit state only once `<Ti commit>` is on stable storage.
3. **WAL**: before a data block is output to disk, all log records describing changes to it must be on stable storage. Strictly, only the undo information is required.

While a block is being output no update may be in progress on it, so a short exclusive **latch** is held. The order is: X-latch the block, flush the log up to its last record, output the block, release the latch. A latch is not a 2PL lock; it is held only for the physical operation.

### Steal and force

| Policy | Meaning | Consequence |
|---|---|---|
| **steal** | blocks with uncommitted updates may be written to disk | needs **undo**, and WAL |
| **no-force** | updated blocks need not be written at commit | needs **redo**; commit is cheap |
| force | every updated block is written at commit | expensive commit |

The algorithms here support steal and no-force, which give the buffer manager the most freedom.

## Checkpoints {#ch07-checkpoint .th}

Without checkpoints, recovery would scan the whole log. A simple checkpoint:

1. Output all log records in memory to stable storage.
2. Output all modified buffer blocks to disk.
3. Write `<checkpoint L>` to stable storage, where L lists the transactions active now.

All updates stop while the checkpoint runs. At recovery, find the last `<checkpoint L>`. Only transactions in L, or that started after it, need redo or undo. Undo may need to scan back past the checkpoint, to the `<Ti start>` of each Ti in L; log records before the earliest such start can be discarded.

A **fuzzy checkpoint** lets transactions resume before the blocks are written: stop updates briefly, write `<checkpoint L>` and force the log, note the list M of modified blocks, let transactions continue, then output the blocks in M (following WAL and holding latches). A pointer to the checkpoint record is kept at a fixed place on disk, `last_checkpoint`, and updated only at the end, so a crash during a checkpoint just uses the previous one.

## The recovery algorithm {#ch07-algorithm .th}

**Rolling back one transaction during normal processing**: scan backwards. For each `<Ti, Xj, V1, V2>`, write V1 to Xj and log the CLR `<Ti, Xj, V1>`. On reaching `<Ti start>`, stop and log `<Ti abort>`.

**After a crash**:

- **Redo pass**, forward from the last checkpoint: set undo-list = L. For every `<Ti, X, V1, V2>` or CLR `<Ti, X, V>`, redo it (write the new value). On `<Ti start>`, add Ti to undo-list. On `<Ti commit>` or `<Ti abort>`, remove Ti.
- **Undo pass**, backward from the end of the log: for each `<Ti, X, V1, V2>` with Ti in undo-list, write V1 and log the CLR `<Ti, X, V1>`. On `<Ti start>` with Ti in undo-list, log `<Ti abort>` and remove Ti. Stop when undo-list is empty. CLRs are skipped in this pass.

:::key Repeating history
The redo pass replays **every** update after the checkpoint, including those of transactions that later aborted and those that will be undone. An aborted transaction's CLRs are redone too, so its rollback is replayed exactly. A transaction with `<Ti abort>` in the log is therefore redone, not undone. This looks wasteful, but it means the undo pass starts from exactly the state at the crash and treats every incomplete transaction the same way, which makes recovery far simpler.
:::

Here is the algorithm run on a log at the moment of a crash:

```python run=db-c07-recover
log = [
    ("start", "T1"), ("upd", "T1", "I1", 5, 10), ("start", "T2"), ("upd", "T2", "I2", 7, 9),
    ("checkpoint", ["T1", "T2"]), ("clr", "T1", "I1", 5),
    ("upd", "T2", "I2", 9, 11), ("commit", "T2"), ("start", "T3"), ("upd", "T3", "I2", 11, 5),
]
db = {"I1": 10, "I2": 9}                    # disk state; anything is fine, redo fixes it

cp = max(i for i, r in enumerate(log) if r[0] == "checkpoint")
undo = set(log[cp][1])
for r in log[cp + 1:]:                      # redo pass: repeat history
    if r[0] == "upd":   db[r[2]] = r[4]
    elif r[0] == "clr": db[r[2]] = r[3]
    elif r[0] == "start": undo.add(r[1])
    elif r[0] in ("commit", "abort"): undo.discard(r[1])
print("after redo:", db, "undo-list:", sorted(undo))

written = []
for r in reversed(log):                     # undo pass
    if not undo:
        break
    if r[0] == "upd" and r[1] in undo:
        db[r[2]] = r[3]; written.append(f"<{r[1]},{r[2]},{r[3]}>")
    elif r[0] == "start" and r[1] in undo:
        undo.discard(r[1]); written.append(f"<{r[1]} abort>")
print("after undo:", db)
print("log records written:", " ".join(written))
```

The redo pass replays from the checkpoint: T1's CLR sets I1 to 5, T2's updates and T3's update are redone, T2 leaves the undo-list at its commit, and T3 joins at its start, leaving {T1, T3}. The undo pass, going backwards, undoes T3's update (I2 = 11) and logs `<T3 abort>` at T3's start, skips T1's CLR, ignores T2's record before the checkpoint because T2 is not in the list, undoes `<T1, I1, 5, 10>` (I1 = 5) and logs `<T1 abort>` at T1's start.

## Logical undo {#ch07-logical .th}

B+-tree inserts and deletes release their locks early (Chapter 6). If T1 inserts into a leaf and then T2 inserts into the same leaf and splits it, physically restoring T1's old page bytes would destroy T2's work. So such operations are undone **logically**: undo an insert with a delete, undo a deposit by subtracting the amount. Redo stays physical, because after a crash the disk state may not be operation-consistent, and a logical redo could see half an operation.

**Operation logging** brackets the physical records of a logical operation:

`<Ti, Oj, operation-begin>` … physical undo/redo records … `<Ti, Oj, operation-end, U>`

where U is the logical undo information, for example "delete key K5, record ID 7 from index I9". If the crash happens before operation-end, the operation is undone physically. After operation-end, it is undone logically with U, and its physical undo records are ignored.

Rollback with logical undo, scanning backwards:

- `<Ti, X, V1, V2>`: undo physically and log a CLR.
- `<Ti, Oj, operation-end, U>`: perform the logical undo (it is logged like a normal operation), then log `<Ti, Oj, operation-abort>` and skip back to the matching operation-begin.
- A redo-only record: ignore.
- `<Ti, Oj, operation-abort>`: skip back to its operation-begin, since that operation was already undone.
- `<Ti start>`: stop and log `<Ti abort>`.

The last two cases arise only if the crash happens during a rollback; skipping prevents undoing the same operation twice.

## ARIES {#ch07-aries .th}

The algorithm above is ARIES without its optimizations. ARIES adds:

- A **log sequence number** (LSN) on every record, increasing, usually the record's byte offset in the log.
- A **PageLSN** stored in each page: the LSN of the last log record applied to it. Updating a page means X-latch it, write the log record, update the page, set its PageLSN, release the latch. Flushing a page holds an S-latch, so the disk copy is consistent with its PageLSN. Redo applies a record only if `PageLSN < LSN`, which makes redo **idempotent**: a record is never applied to a page twice.
- **Physiological redo**: the page is identified physically, but the change inside it is logical, such as "insert this entry into slot 7". Inserting into a sorted B+-tree node shifts half the page; a physical log record would log all those bytes, while a physiological record logs just the inserted entry. This requires atomic page writes; a torn page is detected by a checksum and treated as a media failure.
- Log records carry `LSN, TransID, PrevLSN, RedoInfo, UndoInfo`. **PrevLSN** chains each transaction's records backwards.
- A **CLR** carries `LSN, TransID, UndoNextLSN, RedoInfo` and is redo-only. **UndoNextLSN** is the PrevLSN of the record being undone, so if a crash interrupts a rollback, the next undo skips straight past what was already undone. CLRs replace operation-abort records.
- A **dirty page table** (DPT): for each dirty page in the buffer, its PageLSN and its **RecLSN**, a point such that every log record before it is already reflected in the disk copy. RecLSN is set to the current end of log when the page first becomes dirty.
- A **checkpoint record** holds the DPT and the active transactions with their LastLSN. Dirty pages are **not** flushed at a checkpoint; a background process writes them continuously, so checkpoints are cheap and frequent.

### The three passes

| Pass | Direction | What it does |
|---|---|---|
| 1. Analysis | forward from the last checkpoint | Load the DPT and undo-list from the checkpoint. A record of a new transaction adds it to the undo-list; an end record removes it. An update to a page not in the DPT adds the page with RecLSN = PageLSN = that record's LSN. Track each transaction's last LSN. RedoLSN = minimum RecLSN in the DPT |
| 2. Redo | forward from RedoLSN | Repeat history. For each update record, skip it if the page is not in the DPT or LSN < the page's RecLSN, without even fetching the page. Otherwise fetch the page and redo only if PageLSN < LSN |
| 3. Undo | backward | Roll back undo-list transactions. Repeatedly take the largest next-to-undo LSN among them. An ordinary record: undo it, write a CLR, and next = its PrevLSN. A CLR: next = its UndoNextLSN |

A page not in the DPT at the end of analysis has not been changed since it was last written to disk, so it needs no recovery work at all. Transactions whose abort completed before the crash need no undo: their CLRs were redone.

```python run=db-c07-aries
# (lsn, txn, kind, page) ; checkpoint at LSN 30 records DPT {P1: RecLSN 10} and active {T1}
log = [(10, "T1", "update", "P1"), (20, "T2", "update", "P2"), (25, "T1", "update", "P1"),
       (30, None, "checkpoint", None), (40, "T2", "commit", None), (50, "T3", "update", "P3"),
       (60, "T1", "update", "P2"), (70, "T3", "update", "P1")]
dpt = {"P1": {"rec": 10, "page": 25}}
active = {"T1": 25}
for lsn, t, kind, page in log:
    if lsn <= 30:
        continue
    if kind == "commit":
        active.pop(t, None)
    elif kind == "update":
        active[t] = lsn
        if page not in dpt:
            dpt[page] = {"rec": lsn, "page": lsn}
        dpt[page]["page"] = lsn
print("DPT:", dpt)
print("undo-list with LastLSN:", active, "| RedoLSN:", min(p["rec"] for p in dpt.values()))

disk_page_lsn = {"P1": 25, "P2": 20, "P3": 0}
for lsn, t, kind, page in log:
    if kind != "update" or lsn < min(p["rec"] for p in dpt.values()):
        continue
    if page not in dpt or lsn < dpt[page]["rec"]:
        print(f"LSN {lsn}: skip, page {page} not fetched")
    elif disk_page_lsn[page] >= lsn:
        print(f"LSN {lsn}: fetch {page}, PageLSN {disk_page_lsn[page]} >= {lsn}, skip")
    else:
        disk_page_lsn[page] = lsn
        print(f"LSN {lsn}: redo on {page}")
```

Redo starts at RedoLSN = 10, the earliest RecLSN. The updates to P1 at LSN 10 and 25 are found already on disk by comparing PageLSNs, which needs a fetch. P2 entered the DPT only at LSN 60, so its record at LSN 20 was already on disk and is skipped without fetching the page. T1 and T3 are then undone in the undo pass.

Other ARIES features: **savepoints** and partial rollback (roll back just far enough to release a deadlocked lock); **recovery independence** (pages can be recovered separately, for example while others are in use); fine-grained (tuple-level) locking in indices thanks to logical undo; prefetching pages listed in the DPT; and out-of-order redo.

## Remote backup {#ch07-remote .th}

For high availability, a **remote backup** site receives every log record from the primary and applies it to its own copy. It detects a primary failure through **heartbeats** over several independent links, so a broken link is not mistaken for a dead site. On **takeover**, it finishes recovery with its copy and the log it has received (redo complete transactions, roll back incomplete ones) and becomes the primary. When the old primary returns, it catches up from the new primary's log.

To make takeover fast, the backup runs the redo pass **continuously** as log records arrive and checkpoints periodically. When the primary fails, it only needs to redo the last few records and run a short undo pass, since few transactions are active at any moment. A backup kept this ready is a **hot spare**.

| Mode | Commit when the commit record is at… | Trade-off |
|---|---|---|
| one-safe | the primary | fast, but committed updates can be lost if the backup takes over before receiving them |
| two-very-safe | the primary and the backup | no loss, but nothing commits if either is down: low availability |
| two-safe | both if both are up, otherwise the primary alone | the usual balance |

A remote site should be in a different seismic zone, which means tens of milliseconds of network delay. Under two-safe, every commit then waits that long, and so do transactions waiting for its locks. A **near-DR** site, a nearby building with sub-millisecond latency, also receives log records, and a transaction commits once its commit record is stable at the primary and the near site. The far site catches up from the near site. Losing the primary building loses no committed work, and commits stay fast.

A remote backup is simpler and cheaper than a replicated distributed database (no 2PC), but less fault-tolerant; Chapter 9 covers replication with consensus.

## Other techniques {#ch07-other .th}

**Loss of nonvolatile storage.** A **dump** copies the database to stable storage: with no transaction active, output the log and all buffer blocks, copy the database, and write `<dump>` to the log. To recover, restore the latest dump and redo committed transactions after it. A fuzzy (online) dump lets transactions continue.

**Main-memory databases** skip redo logging for indices (rebuild them on recovery), skip undo logging if only committed data ever reaches disk, and recover in parallel.

**Shadow paging** keeps a current and a shadow page table. On a page's first write, it copies the page and points the current table at the copy. To commit, flush the modified pages and the current table, then switch a fixed pointer from the shadow to the current table; that switch is the commit point. Recovery is trivial and there is no log, but copying the table is expensive (a B+-tree-shaped table helps), commit costs are high, data gets fragmented, old pages need garbage collection, and concurrent transactions are hard to support.

**Related ideas.** An LSM tree logs inserts into its in-memory level and replays them after a crash; its merges need no logging because their inputs stay on disk until the output is complete. Oracle builds snapshots from its undo log: scan back from the end, applying undo records of transactions that were active or committed after the snapshot point.

## Drills: recovery {#ch07-drills .dr}

:::drill concept
Which policy needs undo, which needs redo, and which combination do real systems use?
---
**Answer.** Steal (uncommitted data may reach disk) needs undo. No-force (committed data may not be on disk yet) needs redo. Systems use steal plus no-force, because it gives the buffer manager freedom and makes commit cheap: just force the log.
:::

:::drill concept
When exactly is a transaction committed?
---
**Answer.** When its `<Ti commit>` log record reaches stable storage. Its data blocks may still be only in the buffer.
:::

:::drill output
Log at the crash: `<T1 start> <T1,I1,5,10> <T2 start> <T2,I2,7,9> <checkpoint {T1,T2}> <T1,I1,5> <T2,I2,9,11> <T2 commit> <T3 start> <T3,I2,11,5>`. What is the undo-list after redo, and which log records does recovery write?
---
```python run=db-c07-d-undo
print(["T1", "T3"], "<T3,I2,11> <T3 abort> <T1,I1,5> <T1 abort>")
```

**Why.** Redo starts at the checkpoint with {T1, T2}, removes T2 at its commit and adds T3 at its start. Undo goes backwards: T3's update, then `<T3 abort>`; T1's CLR is skipped; T2's record before the checkpoint is ignored; T1's update; then `<T1 abort>` at T1's start, and the list is empty.
:::

:::drill tricky
Why does the redo pass redo the updates of a transaction that has `<Ti abort>` in the log?
---
**Answer.** Repeating history: its updates and the CLRs that undid them are all replayed, so the database ends in the same state as just before the crash, with the rollback complete. Undo then treats only the incomplete transactions. A transaction with `<Ti abort>` is redone, not undone.
:::

:::drill concept
What does WAL require, and why is only the undo part strictly necessary?
---
**Answer.** Before a block is output, all log records for changes to it must be on stable storage. The undo information is what lets recovery remove an uncommitted change that reached disk. Redo information for committed transactions is guaranteed anyway by forcing the log at commit.
:::

:::drill tricky
Why is ARIES' physiological logging better than physical logging for B+-tree node updates? Say what each logs.
---
**Answer.** Entries in a node are kept sorted, so inserting or deleting one shifts a large part of the page. Physical logging records every changed byte, a lot of log for a small change. Physiological logging names the page physically but logs the operation within it, such as "insert entry (k, p)", so the record holds only the entry.
:::

:::drill concept
How does ARIES use UndoNextLSN to make undo idempotent?
---
**Answer.** Each CLR written while undoing a record carries UndoNextLSN = that record's PrevLSN. If undo, possibly after another crash, meets the CLR, it jumps to UndoNextLSN, skipping the record the CLR already undid. No action is undone twice.
:::

:::drill concept
What do PageLSN and RecLSN mean for a page in the dirty page table?
---
**Answer.** PageLSN: the LSN of the latest log record applied to the page in the buffer. RecLSN: a point such that every log record before it is already reflected in the page on disk; it is set to the end of the log when the page first becomes dirty.
:::

:::drill concept
During analysis, how is the dirty page table updated? What can you conclude about a page not in the DPT at the end?
---
**Answer.** When analysis finds an update to a page not in the DPT, it adds the page with PageLSN and RecLSN both equal to that record's LSN. A page absent at the end has not been changed since it was last written, so it needs no recovery action.
:::

:::drill concept
Where does ARIES' redo pass start, and what three tests let it skip a record?
---
**Answer.** At RedoLSN, the minimum RecLSN in the DPT. Skip the record if its page is not in the DPT, or if its LSN is below the page's RecLSN; both checks avoid fetching the page. Otherwise fetch the page and skip if PageLSN ≥ LSN.
:::

:::drill tricky
An ARIES checkpoint flushes no data pages. Why is that safe?
---
**Answer.** The checkpoint records the DPT with each page's RecLSN, so recovery knows where redo must start for every dirty page. Nothing needs to be on disk at the checkpoint, because redo will reconstruct it from the log. A background writer flushes pages continuously so RecLSNs keep advancing.
:::

:::drill concept
Why must redo stay physical (or physiological) even when undo is logical?
---
**Answer.** After a crash, the disk may hold a partially completed operation, for example a B+-tree split where one page was written and its sibling was not. A logical redo would see an inconsistent structure. Physical redo replays the exact page changes in order, restoring an operation-consistent state before logical undo runs.
:::

:::drill concept
What does the remote backup do during normal processing to make takeover fast?
---
**Answer.** It continuously runs the redo pass on the log records it receives, and checkpoints. On takeover it only redoes the few remaining records and runs the undo pass, which is short because few transactions are active at once.
:::

:::drill tricky
What is a near-DR site for, given the goals of fast commits and zero loss of committed work if a whole location fails?
---
**Answer.** Under two-safe, a commit waits for the log to reach the remote site, tens of milliseconds away in another seismic zone, which delays the commit and every transaction waiting for its locks. A near-DR site in a nearby building has sub-millisecond latency, so a transaction commits once its log is stable at the primary and the near site. If the primary location fails, the near site still has every committed record, and the far site catches up from it.
:::

:::drill concept
Compare one-safe, two-very-safe and two-safe.
---
**Answer.** One-safe commits at the primary only: fastest, but updates committed just before a failure can be lost. Two-very-safe waits for both sites: no loss, but no commits while either is down. Two-safe waits for both when both are up and falls back to the primary alone otherwise: the usual compromise.
:::

:::drill concept
Give two advantages and three drawbacks of shadow paging.
---
**Answer.** Advantages: no log, and trivial recovery (the old table is still intact). Drawbacks: copying the page table on each commit is expensive, commit writes every modified page, data becomes fragmented, old pages need garbage collection, and concurrent transactions are hard to support.
:::

## Write the code {#ch07-coding .cd}

:::drill code
Write ARIES-style rollback of one transaction using PrevLSN chains, CLRs and UndoNextLSN, and show that a crash in the middle of the rollback does not undo anything twice.
---
```python run=db-c07-c-clr
log = {}
next_lsn = [1]
def append(rec):
    lsn = next_lsn[0]; next_lsn[0] += 1
    log[lsn] = rec; return lsn

db = {"A": 0, "B": 0, "C": 0}
last = None
for item, new in [("A", 1), ("B", 2), ("C", 3)]:
    last = append({"kind": "upd", "item": item, "old": db[item], "new": new, "prev": last})
    db[item] = new

def rollback(start, stop_after=None):
    global last
    nxt, done = start, 0
    while nxt is not None:
        rec = log[nxt]
        if rec["kind"] == "clr":
            nxt = rec["undo_next"]; continue
        db[rec["item"]] = rec["old"]
        last = append({"kind": "clr", "item": rec["item"], "new": rec["old"], "undo_next": rec["prev"], "prev": last})
        print(f"undo LSN {nxt}: {rec['item']} = {rec['old']}")
        nxt = rec["prev"]; done += 1
        if done == stop_after:
            print("-- crash --"); return

rollback(last, stop_after=1)        # undoes C, then crashes
rollback(last)                      # restarts from the CLR at the end of the log
print(db)
```

The second rollback starts from the latest record, a CLR, and jumps to its UndoNextLSN (B's update), so C's update is never undone twice.
:::

:::drill code
Write a checker for the WAL rule: given a sequence of log flushes and page writes, report any page written before the log record describing its latest change was flushed.
---
```python run=db-c07-c-wal
events = [
    ("log", 1, "P1"), ("log", 2, "P2"), ("flush", 1),
    ("write", "P1"),                     # ok: LSN 1 is flushed
    ("log", 3, "P1"),
    ("write", "P2"),                     # violation: LSN 2 not flushed
    ("flush", 3), ("write", "P1"),
]
flushed, page_lsn, problems = 0, {}, []
for e in events:
    if e[0] == "log":
        page_lsn[e[2]] = e[1]
    elif e[0] == "flush":
        flushed = max(flushed, e[1])
    elif e[0] == "write" and page_lsn.get(e[1], 0) > flushed:
        problems.append(f"{e[1]} written with PageLSN {page_lsn[e[1]]} > flushedLSN {flushed}")
print(problems or "WAL respected")
```

Real systems enforce this in the buffer manager: before writing a page, flush the log up to the page's PageLSN.
:::

## Cheat sheet {#ch07-cheatsheet .th}

- Commit point = commit record on stable storage. WAL: log before data. Steal → undo; no-force → redo.
- Log: `<Ti start>`, `<Ti, X, old, new>`, CLR `<Ti, X, old>` (redo-only), `<Ti commit>`, `<Ti abort>`.
- Recovery: redo forward from the checkpoint, repeating history (including aborted transactions and CLRs), building the undo-list; then undo backwards, writing CLRs, until every incomplete transaction reaches its start.
- Undo may scan back before the checkpoint, to the start of the oldest transaction in the list.
- Simple checkpoint flushes everything and stops updates; fuzzy lets updates resume; ARIES flushes no data pages.
- Logical undo with physical redo; operation-end records carry the undo info; skip back to operation-begin.
- ARIES: LSN, PageLSN (idempotent redo), PrevLSN chains, CLR UndoNextLSN, DPT with RecLSN; analysis → redo from min RecLSN → undo.
- Redo skips: page not in DPT, LSN < RecLSN (no fetch), PageLSN ≥ LSN (after fetch).
- Remote backup: continuous redo; one-safe may lose commits; two-very-safe hurts availability; two-safe is the norm; near-DR keeps commits fast.
- Shadow paging: no log, trivial recovery, expensive commits and fragmentation.
