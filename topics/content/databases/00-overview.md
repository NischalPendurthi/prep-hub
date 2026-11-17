---
name: Database internals
short: Databases
icon: DB
version: Silberschatz 7e ch 10, 12–23 · PostgreSQL and SQLite for examples
eyebrow: storage · indexing · query processing · optimization · transactions · recovery · distributed
headline: Know what the database <em>actually does</em> with your query.
lede: Nine chapters on how a relational database stores, finds, joins, protects and distributes data, following the storage-to-distributed half of a graduate DBMS course (Silberschatz 7e, chapters 10 and 12 to 23). Each chapter explains the mechanism, works the numericals in code, and ends with drills, coding problems with reference solutions and a cheat sheet.
card: Disks, RAID and buffer managers, B+-trees, LSM trees and bitmaps, external sort and hash joins, cost estimation and join ordering, serializability, 2PL, MVCC and snapshot isolation, ARIES, partitioning, 2PC, Raft and Spanner.
cta: Start with storage|#ch01; Jump to indexing|#ch02; Concurrency control|#ch06
search: Search: slotted page, B+-tree split, hybrid hash, write skew, PageLSN, 2PC…
---

:::hero A small predict-the-output drill
```python run=db-home-hero
import math
b_r, M = 10_000, 101                    # relation of 10,000 blocks, 101 memory buffers
runs = math.ceil(b_r / M)               # run creation: sort M blocks at a time
passes = math.ceil(math.log(runs, M - 1))
print(runs, passes, b_r * (2 * passes + 1))
```

External sort-merge with 101 buffers makes 100 sorted runs, and one 100-way merge pass finishes them. The block transfers are **30,000**: read and write once to make runs, then read once to merge, and the final write is not counted because the result can go straight to the next operator. Chapter 3 derives this formula and the seek count that comes with it.
:::

## How to use the drills

Answer each drill aloud or on paper before you open it. Numericals are computed in Python inside the answer, so you can check your method as well as your result. Many drills follow the style of a graduate DBMS endsem: change a known algorithm (turn hash join into a semijoin, run three group-bys from one sort), or say exactly when a rewrite is valid. Learning how each algorithm works pays off more than memorising its cost formula. Press <kbd>/</kbd> to search, and use the contents list on the right to move around a chapter.

## Suggested plan

| Sitting | Read | Drill |
|---|---|---|
| 1 | Ch 1 (disks, SSDs, RAID, pages, buffer manager, column stores) | RAID and disk-access numericals, then write the slotted page |
| 2 | Ch 2 (B+-trees, hashing, LSM, bitmaps, Bloom filters) | Trace B+-tree inserts and deletes by hand, then the LSM and Bloom numericals |
| 3 | Ch 3 (selection, sort, joins, aggregation, pipelining) | Every join cost on one example, then modify hash join three ways |
| 4 | Ch 4 (equivalences, estimation, join ordering, subqueries) | Size estimates and histograms, then decorrelate two queries |
| 5 | Ch 5 and 6 up to multiple granularity | Classify schedules, then run them under 2PL variants |
| 6 | Rest of Ch 6 (phantoms, timestamps, validation, MVCC, SI) | TSO, validation and snapshot-isolation traces, write skew |
| 7 | Ch 7 (logging, checkpoints, ARIES, remote backup) | Recover a log by hand, then the ARIES analysis drills |
| 8 | Ch 8 (architectures, partitioning, MapReduce, parallel joins) | Partitioning and skew questions, then the semijoin-with-bitmaps design |
| 9 | Ch 9 (2PC, persistent messaging, quorums, Raft, Spanner) | 2PC failure cases, majority protocol, commit wait |

## What this guide assumes

You can write SQL with joins, group-by and subqueries, and you know relational algebra notation (σ, Π, ⋈, γ). The [SQL MCQs](../../mcq/#/d/sql/basics) cover query writing, and the [DBMS videos](../../videos/#/dbms) give short lectures for each chapter here. Numbers such as "a random disk read costs about 10 ms" are orders of magnitude for orientation. Real hardware varies, so quote them as approximate in an interview. Examples use Python's built-in `sqlite3` where a real engine helps, and plain Python simulations elsewhere.
