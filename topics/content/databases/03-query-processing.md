---
title: Query processing
part: Part B · Queries
lede: A query plan is a tree of operators, and each operator has several algorithms with very different costs. This chapter covers the cost model, selection with and without indices, external sort-merge, every join algorithm with its cost, how to adapt hash join to outer joins, semijoins and aggregation, and how operators pass tuples to each other.
desc: cost model, selection algorithms, bitmap index scan, external sort-merge, nested loops, block NL, indexed NL, merge join, hash join, hybrid hash, skew, outer and semijoins via hashing, aggregation, iterators, pipelining, async I/O
hours: 4
prereqs: Chapters 1 and 2, relational algebra
---

## Steps and the cost model {#ch03-cost .th}

A query is parsed and translated to relational algebra, the optimizer (Chapter 4) picks an **evaluation plan** (an algebra tree annotated with an algorithm for each operator), and the engine runs it.

Cost is measured in disk work, ignoring CPU for simplicity:

`cost = b × tT + S × tS` for b block transfers and S seeks.

On a magnetic disk with 4 KB blocks, roughly tS = 4 ms and tT = 0.1 ms. On an SSD, tS is 20–90 µs and tT 2–10 µs. Writes count the same as reads. Two conventions apply to every formula in this chapter:

- Writing the **final** output is never counted, since it may go straight to the next operator.
- Estimates are worst case: nothing is in the buffer and only the minimum memory is available.

Notation: `br`, `bs` are blocks of r and s; `nr`, `ns` are tuples; `M` is the number of memory blocks; `hi` is the height of an index; `bb` is the number of buffer blocks per run or partition.

## Selection {#ch03-selection .th}

| Algorithm | Cost |
|---|---|
| A1 linear scan | `br` transfers + 1 seek; equality on a key: `br/2` on average. Works for any condition |
| A2 clustering index, equality on a key | `(hi + 1)(tT + tS)` |
| A3 clustering index, equality on a non-key | `hi(tT + tS) + tS + b·tT` for b consecutive matching blocks |
| A4 secondary index, equality | key: `(hi + 1)(tT + tS)`; non-key: `(hi + n)(tT + tS)`, since each of n records may be on its own block |
| A5 clustering index, comparison | `A ≥ v`: find the first match, scan forward. `A ≤ v`: just scan from the start |
| A6 secondary index, comparison | one I/O per matching record; often worse than a scan |

Conjunctions use the cheapest single-condition access and test the rest in memory (A7), a composite index (A8), or intersect the record-ID sets from several indices (A9). A disjunction can use a union of record-ID sets (A10), but only if **every** term has an index; otherwise one linear scan does it all.

A secondary index pays off only for few matches:

```python run=db-c03-index-vs-scan
tT, tS = 0.1, 4.0                         # ms
b_r, h_i = 10_000, 4
for matches in (10, 100, 1000):
    index_ms = (h_i + matches) * (tT + tS)
    scan_ms = b_r * tT + tS
    print(f"{matches:5} matches: index {index_ms/1000:6.2f} s, scan {scan_ms/1000:.2f} s")
```

The break-even here is around 240 matching records out of perhaps a million, which is why the optimizer needs good estimates of how many rows match.

**Bitmap index scan** (PostgreSQL) hedges against a bad estimate. It scans the index and sets one bit per **page** that holds a match, then reads only the marked pages in physical order. With few matches it behaves like an index scan; with many it degrades to a sequential scan of most pages rather than a random I/O per record. It is never far from the better of the two.

## External sort-merge {#ch03-sort .th}

Sorting is needed for `order by`, merge join, duplicate elimination and grouping. When the relation is larger than memory:

1. **Run creation**: read M blocks, sort them in memory, write them out as a run. This makes ⌈br/M⌉ runs.
2. **Merge**: with bb buffer blocks per run, merge up to ⌊M/bb⌋ − 1 runs at a time (one buffer is for output). Each pass divides the number of runs by that fan-in. Repeat until one run remains.

```python run=db-c03-sort
import math

def sort_cost(b_r, M, bb=1):
    runs = math.ceil(b_r / M)
    fan_in = M // bb - 1
    passes = math.ceil(math.log(runs, fan_in)) if runs > 1 else 0
    transfers = b_r * (2 * passes + 1)
    seeks = 2 * runs + math.ceil(b_r / bb) * (2 * passes - 1)
    return runs, passes, transfers, seeks

for b_r, M, bb in [(12, 3, 1), (10_000, 101, 1), (10_000, 22, 2), (10_000, 22, 1)]:
    runs, passes, t, s = sort_cost(b_r, M, bb)
    print(f"br={b_r:>6} M={M:>3} bb={bb}: {runs:>4} runs, {passes} merge passes, {t:>6} transfers, {s:>6} seeks")
```

Transfers: run creation reads and writes every block (2br), each merge pass reads and writes (2br), and the last pass does not write, so `br(2·passes + 1)`. Seeks: 2 per run during creation, then `2⌈br/bb⌉` per merge pass, minus the final writes.

Larger bb means fewer seeks per pass but a smaller fan-in, so possibly more passes. On disks, where seeks dominate, systems choose bb to balance the two.

Sorting can be split into two operators: run generation consumes its input as it arrives (pipelined from below) and merge produces sorted output as it goes (pipelined upwards). If the data is range-partitioned so that each partition fits in memory, each partition can be sorted in memory and the results concatenated, with no merge at all; Chapter 8 uses this for parallel sort.

## Join algorithms {#ch03-joins .th}

| Algorithm | Block transfers | Seeks | Works for |
|---|---|---|---|
| Nested loops, worst case | `nr·bs + br` | `nr + br` | any condition |
| Nested loops, s fits in memory | `br + bs` | 2 | any condition |
| Block nested loops, worst | `br·bs + br` | `2br` | any condition |
| Block NL with M blocks | `⌈br/(M−2)⌉·bs + br` | `2⌈br/(M−2)⌉` | any condition |
| Indexed NL | `br(tT + tS) + nr·c` in time | | equi-join with an index on s |
| Merge join (inputs sorted) | `br + bs` | `⌈br/bb⌉ + ⌈bs/bb⌉` | equi- and natural joins |
| Hash join | `3(br + bs) + 4nh` | `2(⌈br/bb⌉ + ⌈bs/bb⌉) + 2nh` | equi- and natural joins |
| Hash join, build fits in memory | `br + bs` | | equi- and natural joins |

In indexed NL, c is the cost of one index lookup and fetch on s.

**Block nested loops** reads M−2 blocks of the outer relation at once and scans the inner relation once per chunk. Put the smaller relation on the outside, since its block count is what divides.

**Merge join** walks two sorted inputs together. Each block is read once as long as all tuples with the same join value fit in memory. Add the cost of sorting if the inputs are not already sorted. With r sorted and a secondary B+-tree on s, a **hybrid merge join** merges r with the index leaves, sorts the result on s's record addresses, and then fetches s in physical order.

**Hash join** partitions both relations with a hash function h on the join attributes, so matching tuples land in partitions with the same number. Then for each i it loads the **build** partition si into memory, builds a hash table on it with a second hash function, and streams the **probe** partition ri through it. Only the build partitions must fit in memory; choose `nh = ⌈bs/M⌉ × f` with a fudge factor f ≈ 1.2. The "3" in the cost is: read and write each relation while partitioning, then read it again to build and probe. The `4nh` term covers partly filled partition blocks.

```python run=db-c03-join-costs
import math
n_student, b_student, n_takes, b_takes = 5000, 100, 10_000, 400
M = 22
print("NL, student outer:       ", n_student * b_takes + b_student)
print("NL, takes outer:         ", n_takes * b_student + b_takes)
print("block NL, worst, student outer:", b_student * b_takes + b_student)
print("block NL, M=22:          ", math.ceil(b_student / (M - 2)) * b_takes + b_student)
nh = 6
print("hash join, nh=6:         ", 3 * (b_student + b_takes) + 4 * nh)
print("merge join, pre-sorted:  ", b_student + b_takes)
```

Plain nested loops costs millions of transfers; block NL with 22 buffers is 2,100 and hash join about 1,500.

### Recursive partitioning, skew and hybrid hash

If nh is larger than M − 1, one partitioning pass cannot produce enough partitions, so each partition is split again with a different hash function. One pass suffices when M is at least about √(f·bs): 2 MB of memory (512 blocks of 4 KB) handles build relations up to about 1 GB.

**Skew** (many duplicates of one join value, or a bad hash function) can make a build partition too big for memory. The fix is to repartition that si and ri with another hash function; if a single value has more duplicates than fit, fall back to block nested loops for that partition.

**Hybrid hash join** keeps the first build partition s0 in memory while partitioning s, and probes it directly while partitioning r, so s0 and r0 are never written or reread:

```python run=db-c03-hybrid
b_s, b_r, M = 100, 400, 25             # build: instructor (100), probe: teaches (400)
parts, part_size = 5, 20               # 5 partitions of 20 blocks
plain = 3 * (b_s + b_r)
# partition 0 stays in memory (20 blocks), 1 block input, 4 output buffers for the others
saved = 2 * (b_s // parts) + 2 * (b_r // parts)
print("plain hash join:", plain, " hybrid:", plain - saved)
```

It pays off most when memory is large relative to √bs, which today it often is.

:::trap Two common slips in join costs
Build on the **smaller** relation: only build partitions must fit in memory. And merge join's `br + bs` excludes sorting: add the sort cost unless the inputs are already sorted, for example by an index or an earlier operator.
:::

## Changing hash join {#ch03-modify .th}

Exam questions often ask you to adapt hash join to compute something else. Partitioning stays the same; only the build-probe step changes.

| Compute | Build on | During probe, and at the end of each partition |
|---|---|---|
| left outer join r ⟕ s | s | a probe tuple from r with no match is output padded with nulls |
| left outer join r ⟕ s | r | keep a `matched` flag per build tuple; set it on a match; at the end output the unmatched r tuples padded with nulls |
| semijoin r ⋉ s | r | set `matched` on a match; at the end output flagged tuples. Or output on the first match and delete the tuple from the hash table |
| anti-semijoin r ▷ s | r | at the end output the tuples never matched |
| multiset difference t − u | u, with counts | on a probe from t: if u has a copy, decrement it; otherwise output t's tuple |
| multiset intersection r ∩ s | s, with counts | on a match, output and decrement; delete at 0 |

```python run=db-c03-semijoin
from collections import defaultdict

def semijoin_build_r(r, s, key_r, key_s):
    table = defaultdict(list)
    for t in r:                               # build on r
        table[key_r(t)].append([t, False])
    for u in s:                               # probe with s
        for entry in table.get(key_s(u), []):
            entry[1] = True
    return [t for bucket in table.values() for t, hit in bucket if hit]

r = [(1, "a"), (2, "b"), (3, "c"), (3, "c2")]
s = [(3, "x"), (3, "y"), (1, "z"), (9, "w")]
print(semijoin_build_r(r, s, lambda t: t[0], lambda u: u[0]))
```

Each r tuple appears once, however many s tuples match it, which is exactly what makes a semijoin different from a join followed by a projection.

### Aggregation and duplicate elimination

Grouping and duplicate elimination use sorting or hashing to bring equal values together. **Partial aggregation** combines tuples of a group as early as possible: during run generation and every merge, or when a hash partition is built. `count`, `sum`, `min` and `max` combine directly; `avg` keeps a sum and a count. If the number of groups is small, an in-memory hash table aggregates a huge input with no partitioning at all.

When the number of groups slightly exceeds memory, the hybrid hash idea applies: aggregate the groups of partition 0 in memory while partitioning, writing only the other partitions to disk with one buffer block each. Size partition 0 so that its aggregates plus those buffers fit.

Several group-bys that share a prefix can come from one sort:

```python run=db-c03-rollup
rows = sorted([("x", 1, "p", 5), ("x", 1, "q", 2), ("x", 2, "p", 4), ("y", 1, "p", 7), ("y", 1, "p", 1)])
out = {"ABC": [], "AB": [], "A": []}
cur = None
for a, b, c, d in rows + [(None, None, None, 0)]:          # sentinel flushes all
    if cur:
        if (a, b, c) != cur["abc"]: out["ABC"].append((cur["abc"], cur["s_abc"])); cur["s_abc"] = 0
        if (a, b) != cur["ab"]:     out["AB"].append((cur["ab"], cur["s_ab"]));    cur["s_ab"] = 0
        if a != cur["a"]:           out["A"].append((cur["a"], cur["s_a"]));       cur["s_a"] = 0
    else:
        cur = {"s_abc": 0, "s_ab": 0, "s_a": 0}
    cur.update(abc=(a, b, c), ab=(a, b), a=a)
    cur["s_abc"] += d; cur["s_ab"] += d; cur["s_a"] += d
for k, v in out.items():
    print(k, v)
```

Sorting on (A, B, C) also sorts on (A, B) and on A. Keep one running aggregate per level; when C changes output the (A,B,C) group, when B changes output (A,B,C) and (A,B), and when A changes output all three.

### Set operations and outer joins

With hashing, partition both inputs and build on ri. For ∪, add si tuples not already present and output the table. For ∩, output si tuples found in the table. For r − s, delete from the table the tuples found in si and output what remains.

## Evaluating a whole plan {#ch03-pipeline .th}

**Materialization** evaluates bottom-up, writing each operator's result to a temporary relation. It always works; its cost is the operator costs plus writing and reading the intermediates. Double buffering (two output buffers, one filling while the other is written) overlaps I/O with computation.

**Pipelining** passes tuples from one operator straight to the next. It saves the intermediate I/O but is not always possible: sort and the partitioning phase of hash join must see all their input before producing output.

- **Demand-driven** (pull, iterator model): every operator implements `open()`, `next()` and `close()`, and the root pulls tuples by calling `next()` on its children. Each operator keeps state between calls.
- **Producer-driven** (push): operators fill a buffer for their parent and wait when it is full. This suits parallel systems.

```python run=db-c03-iterators
class Scan:
    def __init__(self, rows): self.rows = rows
    def open(self): self.i = 0
    def next(self):
        if self.i == len(self.rows): return None
        self.i += 1; return self.rows[self.i - 1]
    def close(self): pass

class Select:
    def __init__(self, child, pred): self.child, self.pred = child, pred
    def open(self): self.child.open()
    def next(self):
        while (t := self.child.next()) is not None:
            if self.pred(t): return t
        return None
    def close(self): self.child.close()

class Limit:
    def __init__(self, child, n): self.child, self.n = child, n
    def open(self): self.child.open(); self.k = 0
    def next(self):
        if self.k == self.n: return None
        self.k += 1; return self.child.next()
    def close(self): self.child.close()

scan = Scan(list(range(1, 1_000_001)))
plan = Limit(Select(scan, lambda x: x % 7 == 0), 3)
plan.open()
out = []
while (t := plan.next()) is not None: out.append(t)
plan.close()
print(out, "tuples scanned:", scan.i)
```

The pull model stops early for free: the limit asked for three tuples, so only 21 of the million rows were ever read.

**Blocking operators** such as sort and hash aggregation are often split into two operators (run generation and merge; partition and build-probe), so a plan becomes a series of **pipeline stages**: operators within a stage run concurrently, and a stage starts when the stages it depends on finish. For example, a hash join of r and s whose output is then sorted runs as: partition r, partition s, then build-probe feeding run generation, then merge.

### Batched asynchronous I/O for indexed nested loops

SSDs serve many outstanding requests at once (QD-n), but a plain indexed NL join issues one lookup, waits, then the next. With the internal nodes of the B+-tree in memory, the join can traverse them for many outer tuples, issue leaf reads for all of them without waiting, and as each leaf arrives issue record fetches for its pointers, matching each fetched record with its outer tuple when it arrives. Keeping many I/Os in flight uses the device's internal parallelism and can speed the join up several times.

### Main memory and the CPU cache

When data is in memory, CPU cost dominates. Systems **compile** queries to machine code (often through LLVM, or JVM bytecode) to avoid interpreting expressions tuple by tuple; column stores process vectors of values at a time. Algorithms become **cache-conscious**: sort runs the size of the L3 cache, hash join subpartitions small enough that each build subpartition and its hash table fit in cache.

## Drills: query processing {#ch03-drills .dr}

:::drill concept
r has 10,000 blocks. A secondary index of height 4 on A returns 1,000 matching records. With tT = 0.1 ms and tS = 4 ms, compare an index scan with a file scan.
---
```python run=db-c03-d-sel
tT, tS = 0.1, 4
print(round((4 + 1000) * (tT + tS) / 1000, 2), "s vs", round((10_000 * tT + tS) / 1000, 2), "s")
```

**Why.** Each matching record may be on its own block, so 1,000 random I/Os. The scan wins by four times.
:::

:::drill output
External sort of 12 blocks with M = 3 and bb = 1. How many runs, merge passes, transfers and seeks?
---
```python run=db-c03-d-sort
import math
b_r, M = 12, 3
runs = math.ceil(b_r / M)
passes = math.ceil(math.log(runs, M - 1))
print(runs, passes, b_r * (2 * passes + 1), 2 * runs + b_r * (2 * passes - 1))
```

**Why.** 4 runs of 3 blocks; pass 1 merges pairs into 2 runs of 6; pass 2 gives 1 run of 12.
:::

:::drill concept
With 88 KB of memory, 4 KB blocks and 2-block buffers per run, what is the merge fan-in?
---
**Answer.** M = 22 blocks and bb = 2, so 22/2 − 1 = 10 runs per merge (one 2-block buffer is reserved for output).
:::

:::drill concept
Block nested loops join with M = 4: P has 300 blocks, Q has 600. Which should be outer, and what is the cost with tT = 0.1 ms and tS = 4 ms?
---
```python run=db-c03-d-bnl
import math
tT, tS, M = 0.1, 4, 4
for name, bo, bi in [("P outer", 300, 600), ("Q outer", 600, 300)]:
    it = math.ceil(bo / (M - 2))
    transfers, seeks = it * bi + bo, 2 * it
    print(name, transfers, seeks, round((transfers * tT + seeks * tS) / 1000, 2), "s")
```

**Why.** The smaller relation outside makes fewer passes over the larger one.
:::

:::drill tricky
Why must only the build partitions of a hash join fit in memory, not the probe partitions?
---
**Answer.** The build partition becomes an in-memory hash table. The probe partition is streamed through it one block at a time, and each tuple is looked up and then discarded, so it needs only one input buffer.
:::

:::drill concept
Explain how to compute r ⋉ s with hash join when r is the build relation.
---
**Answer.** Partition both as usual. Build the hash table on ri with a `matched` flag per tuple, initially false. Probe with si; on each match set the flag. After the probe, output the r tuples whose flag is true. Alternatively, output an r tuple on its first match and delete it from the table (or output only if the flag was false, then set it). Each r tuple appears once however many s tuples match.
:::

:::drill concept
How do you compute r ⟕ s with hash join when r is the build relation?
---
**Answer.** Build on ri with a `matched` flag. On each probe match output the joined tuple and set the flag. At the end of the partition, output every r tuple whose flag is still false, padded with nulls.
:::

:::drill tricky
Hash aggregation where the number of groups exceeds memory by a small factor: how can the hybrid hash idea avoid writing some of the tuples to disk?
---
**Answer.** While partitioning, aggregate the tuples of partition 0 directly in an in-memory hash table instead of writing them out; write only the other partitions to disk, one buffer block each, and aggregate them later as usual. Size partition 0 so that its aggregate table plus one block per other partition fits in memory.
:::

:::drill tricky
r(A, B, C, D). Compute `A,B,C γ sum(D)`, `A,B γ sum(D)` and `A γ sum(D)` together with sort-based aggregation. How? And to do it in parallel, how should r be partitioned?
---
**Answer.** Sort once on (A, B, C), keep a running sum for the current (A,B,C), (A,B) and (A) groups. When C changes, output (A,B,C); when B changes, output (A,B,C) and (A,B); when A changes, output all three, and start new groups. In parallel, partition on A alone: every (A), (A,B) and (A,B,C) group then lies entirely on one node.
:::

:::drill concept
What does a bitmap index scan do, and why is it a safe choice when the number of matches is uncertain?
---
**Answer.** It scans the index and sets a bit per page containing a match, then reads only the marked pages in physical order. With few matches it costs about as much as an index scan; with many it becomes a sequential scan of the marked pages instead of one random I/O per record. It is never much worse than the better choice.
:::

:::drill concept
Which join algorithm would you choose: (a) a non-equi condition `r.A < s.B`, (b) a few outer tuples with an index on the inner join attribute, (c) both inputs already sorted on the join attribute, (d) two large unsorted relations, equi-join?
---
**Answer.** (a) block nested loops (or NL with the inner relation in memory). (b) indexed nested loops. (c) merge join. (d) hash join, or hybrid hash if the build input is a little larger than memory.
:::

:::drill output
Hash join with instructor (100 blocks, build) and teaches (400 blocks), M = 25, in 5 partitions of 20 blocks. What does plain hash join cost in transfers, ignoring the 4nh term, and what does hybrid hash save?
---
```python run=db-c03-d-hybrid
plain = 3 * (100 + 400)
hybrid = plain - 2 * 20 - 2 * 80
print(plain, hybrid)
```

**Why.** Partition 0 of instructor (20 blocks) and the matching 80 blocks of teaches are never written or reread, saving two transfers per block.
:::

:::drill tricky
Explain how to change indexed nested loops join to use batched asynchronous I/O, and why that matters on SSDs.
---
**Answer.** For each outer tuple, traverse the in-memory internal nodes and issue the leaf read without waiting; move on to the next outer tuple, up to the concurrency limit. When a leaf arrives, issue fetches for its record pointers. When a record arrives, match it with its outer tuple and output. SSDs process many requests in parallel (QD-n), so keeping many in flight uses throughput that a one-at-a-time loop leaves idle.
:::

:::drill concept
A plan hash-joins r and s and sorts the result. List its pipeline stages.
---
**Answer.** Partition r; partition s; build-probe feeding run generation of the sort; merge. Partitioning must finish before build-probe starts, and run generation must finish before the merge starts.
:::

:::drill concept
Why does the pull (iterator) model handle `LIMIT` well?
---
**Answer.** Work happens only when a parent calls `next()`. Once the limit has returned its tuples it stops calling, so scans below it stop early; nothing is computed that is not needed. Blocking operators below the limit, such as a sort, still consume all their input.
:::

## Write the code {#ch03-coding .cd}

:::drill code
Write a Grace hash join: partition both inputs to "disk" (lists) with one hash function, then build and probe each partition pair with another. Check the result against a nested loops join.
---
```python run=db-c03-c-grace
import random
random.seed(3)
r = [(random.randint(1, 50), f"r{i}") for i in range(300)]
s = [(random.randint(1, 60), f"s{i}") for i in range(200)]

def grace(r, s, nparts=4):
    h1 = lambda k: hash(("p", k)) % nparts
    rp, sp = [[] for _ in range(nparts)], [[] for _ in range(nparts)]
    for t in r: rp[h1(t[0])].append(t)          # partition phase
    for t in s: sp[h1(t[0])].append(t)
    out = []
    for ri, si in zip(rp, sp):                   # build on s, probe with r
        table = {}
        for t in si: table.setdefault(t[0], []).append(t)
        for t in ri:
            out += [(t, u) for u in table.get(t[0], [])]
    return out

nl = [(t, u) for t in r for u in s if t[0] == u[0]]
g = grace(r, s)
print(len(g), sorted(g) == sorted(nl))
```

The second hash function is the dictionary's own hashing. Using the same function for partitioning and the in-memory table would put every tuple of a partition into the same few buckets.
:::

:::drill code
Write a k-way merge for external sort: given sorted runs, produce one sorted output using a heap, and count how many passes a fan-in of 3 needs for 10 runs.
---
```python run=db-c03-c-merge
import heapq, random
random.seed(5)

def merge(runs):
    heap = [(run[0], i, 0) for i, run in enumerate(runs) if run]
    heapq.heapify(heap)
    out = []
    while heap:
        v, i, j = heapq.heappop(heap)
        out.append(v)
        if j + 1 < len(runs[i]):
            heapq.heappush(heap, (runs[i][j + 1], i, j + 1))
    return out

runs = [sorted(random.sample(range(1000), 8)) for _ in range(10)]
passes = 0
while len(runs) > 1:
    runs = [merge(runs[k:k + 3]) for k in range(0, len(runs), 3)]
    passes += 1
print(passes, runs[0] == sorted(runs[0]), len(runs[0]))
```

Ten runs with fan-in 3 go 10 → 4 → 2 → 1: three passes, ⌈log₃ 10⌉.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- Cost = transfers·tT + seeks·tS. Don't count the final write. Assume worst-case memory.
- Selection: linear scan works always; clustering index (hi + 1) I/Os for a key; secondary index one I/O per match, so only for few matches. Bitmap index scan hedges.
- External sort: ⌈br/M⌉ runs, fan-in ⌊M/bb⌋−1, transfers br(2·passes + 1).
- Joins: NL nr·bs + br; block NL ⌈br/(M−2)⌉·bs + br; merge br + bs plus sorting; hash 3(br + bs) + 4nh.
- Hash join: build on the smaller input; one pass when M ≳ √(f·bs); skew → repartition or block NL; hybrid keeps partition 0 in memory.
- Modify hash join by changing only build-probe: matched flags for outer joins and semijoins, counts for multiset operations.
- Aggregation: sort or hash; partial aggregation early; one sort serves (A,B,C), (A,B), (A).
- Pipelining avoids temporaries; sort and hash partitioning block. Iterators: open/next/close.
- SSDs need many I/Os in flight: batch the lookups of indexed NL.
