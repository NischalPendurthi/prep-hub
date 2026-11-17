---
title: Parallel storage and query processing
part: Part D · Distributed
lede: Once data outgrows one machine, it must be partitioned, replicated and processed in parallel. This chapter covers database architectures and the limits of speedup, partitioning and skew, distributed file systems and key-value stores, global secondary indices, MapReduce and Spark, and the parallel versions of sort, join and aggregation, including semijoins with bitmaps and the exchange operator.
desc: shared memory, shared disk, shared nothing, speedup and scaleup, Amdahl, round-robin, hash and range partitioning, skew, virtual nodes, tablets, replication, HDFS, sharding, BigTable, global secondary indices, MapReduce, Spark, streaming, parallel sort, partitioned and broadcast joins, partial aggregation, exchange operator, distributed semijoins
hours: 4
prereqs: Chapters 2 to 4
---

## Architectures {#ch08-arch .th}

A **centralized** server runs many server processes or threads over shared memory holding the buffer pool, the lock table, the log buffer and cached plans. Background processes include a database writer (outputs dirty pages), a log writer (servers only append to the log buffer; this process flushes it), a checkpoint process and a process monitor (detects failed processes, aborts their transactions and restarts them). Mutual exclusion uses atomic instructions: `test-and-set(M)` sets M to 1 and returns the old value; `CAS(M, V1, V2)` sets M to V2 only if it equals V1.

**Data servers** ship data items (not pages, today usually JSON or binary objects) to clients, which cache them between transactions. Caching needs coherence: a cached item is checked when its lock is requested, and **lock caching** keeps locks at the client across transactions until the server calls them back.

### Parallel architectures

| Architecture | Shared | Strength | Limit |
|---|---|---|---|
| shared memory | memory and disks | very efficient communication between cores | does not scale past about 64–128 cores |
| shared disk | disks only | fault tolerance: another node takes over, since the data is on shared disks (a SAN) | the disk interconnect is a bottleneck |
| shared nothing | nothing; each node has CPU, memory and disks | scales to thousands of nodes | communication and non-local data access cost |
| hierarchical | top level shared nothing, nodes shared memory or disk | combines them | complexity |

Large shared-memory machines are internally NUMA, behaving partly like shared nothing. Interconnects: a bus does not scale; a mesh needs up to 2n hops on an n × n grid; a hypercube gives each of n nodes log n neighbours and at most log n hops; data centres use a tree-like **fat tree** of top-of-rack, aggregation and core switches.

### Speedup and scaleup

- **Speedup**: the same problem on an N-times-larger system. Linear speedup means time falls by N.
- **Scaleup**: an N-times-larger problem on an N-times-larger system. Linear scaleup means time stays the same. **Batch** scaleup grows one large job; **transaction** scaleup grows the number of users and the database together, which parallelizes well.

Both are usually sublinear because of **startup costs**, **interference** (contention for the interconnect, disks and locks) and **skew** (the slowest task decides the total time). Amdahl's law bounds speedup when a fraction p of the work parallelizes:

```python run=db-c08-amdahl
def amdahl(p, n):
    return 1 / ((1 - p) + p / n)
for n in (10, 100, 1000):
    print(f"p=0.9, n={n:>4}: speedup <= {amdahl(0.9, n):.2f}")
print("limit as n -> inf:", round(1 / (1 - 0.9), 2))
```

## Partitioning {#ch08-partitioning .th}

**I/O parallelism** partitions tuples horizontally across n nodes:

- **Round-robin**: the i-th inserted tuple goes to node `i mod n`.
- **Hash**: `h(partitioning attributes)` in 0 … n−1.
- **Range**: a vector [v0, …, vn−2]: v < v0 → node 0, vi ≤ v < vi+1 → node i+1, v ≥ vn−2 → node n−1. With [5, 11]: 2 → 0, 8 → 1, 20 → 2.

| | Full scan | Point query on the attribute | Range query on the attribute |
|---|---|---|---|
| round-robin | best, perfectly balanced | all nodes | all nodes |
| hash | good | one node | all nodes |
| range | good | one node | one or a few nodes, leaving others free; but a large result loses parallelism |

Small relations live on one node or are replicated everywhere; medium ones on a number of nodes chosen by size; large ones on all.

### Skew

- **Attribute-value skew**: many tuples share a value, so they land in one partition. Affects range and hash.
- **Partition skew**: a badly chosen range vector, even without value skew; much less likely with hashing.
- **Execution skew** without data skew: range-partitioned on date, but most queries ask about recent dates.

A balanced range vector comes from sorting on the attribute and taking a boundary after every 1/n of the tuples, or more cheaply from a random sample or an equi-depth histogram.

**Virtual node partitioning** uses 10–20 times as many virtual nodes as real ones, mapped to real nodes by round-robin or a table. Skew spreads over many virtual nodes, and moving virtual nodes between machines fixes both data and execution skew and gives elasticity (add machines, move virtual nodes onto them). **Dynamic repartitioning** splits virtual nodes that grow too large, like B+-tree leaves, and moves them off loaded machines. Virtual nodes used this way are called **tablets**.

```python run=db-c08-skew
import random, zlib
from collections import Counter
random.seed(2)
h = lambda k: zlib.crc32(k.encode())                 # stable across runs, unlike hash(str)
keys = [random.choice(["hot"] * 30 + [f"k{i}" for i in range(70)]) for _ in range(100_000)]
nodes = 4
direct = Counter(h(k) % nodes for k in keys)
print("hash on 4 nodes:  ", sorted(direct.values()))
vnodes = 64
vload = Counter(h(k) % vnodes for k in keys)
assign, load = {}, [0] * nodes
for v, c in sorted(vload.items(), key=lambda x: -x[1]):       # greedy: biggest first, lightest node
    tgt = load.index(min(load)); assign[v] = tgt; load[tgt] += c
print("64 virtual nodes: ", sorted(load))
```

Virtual nodes even out the cold keys, but one key holding 30% of the data still lands on one node: no partitioning can split a single value. That is the case for partial aggregation and skew-aware joins below.

### Routing and replication

The partition table lives at a master and at several routers; a query goes to a router, which forwards it. The fully peer-to-peer alternative is **consistent hashing**, on which distributed hash tables are built, with no master or routers.

Replicas (usually 3) give availability; the unit of replication is a partition or tablet, and requests to a failed node are rerouted to a replica. Replicas in the same data centre handle machine failure; replicas in other data centres handle the loss of a whole site and reduce latency for nearby users. Reads must see the latest value, which the **primary copy** scheme gives by sending all reads and writes to a master replica. Updates reach replicas through 2PC (assumes all replicas are up), persistent messaging (asynchronous, eventually consistent), or consensus (Chapter 9).

### Parallel indices

A **local** index covers only its node's data. A **global** index covers all the data and is itself partitioned. A **global primary** index is partitioned on the index attribute, like the data. A **global secondary** index is on an attribute the data is not partitioned on. For r partitioned on Kp, a global secondary index on Ki is built like this:

1. Create a relation `ris(Ki, Kp)` (adding more attributes if Kp is not unique).
2. Partition ris on Ki, and index each partition locally on Ki.
3. Index each r partition locally on Kp.
4. Keep ris updated whenever r changes.

A lookup on Ki goes to one ris partition, finds the primary keys, and then fetches the records by Kp. This is the same idea as a secondary index on a B+-tree file organization (Chapter 2): the index stores the primary key instead of a record pointer, because records can move between nodes.

## Big data storage {#ch08-bigdata .th}

**Distributed file systems** (GFS, HDFS, and the newer Colossus) hold millions of large files. In HDFS, a NameNode maps file names to block IDs and block IDs to DataNodes; blocks are about 64 MB and replicated three times. A client asks the NameNode for block locations and then reads the DataNodes directly. Files are write-once, append-only. The NameNode is a bottleneck and its in-memory metadata limits the number of files, which makes a DFS bad for billions of small objects. There are no consistency guarantees across cached blocks, so a DFS suits write-once data or serves as the layer under a storage system.

**Sharding** spreads data over many ordinary databases by a shard key, with the application routing each query. It is easy to build and scales reads and writes, but it is not transparent: the application handles routing, cross-shard queries and replication; moving load off an overloaded shard is hard; and there are no cross-shard queries or transactions.

**Key-value stores** hold billions of small records, partitioned and replicated, with the system routing requests: `get(key)`, `put(key, value)`, `delete(key)`, sometimes range queries and versions. Variants store uninterpreted bytes (S3, Dynamo), wide columns (BigTable, HBase, Cassandra), relational rows (Spanner, PNUTS) or JSON documents (MongoDB). Most offer no multi-item transactions, so secondary indices are missing or maintained asynchronously, and applications do their own joins and keep their own materialized views, for example copying a post's summary to every follower.

**BigTable** stores data in columnar form keyed by (record ID, attribute name), with records sorted by key, so a prefix or range query fetches a whole record. Hierarchical record IDs such as the reversed URL `edu.yale.cs.www/people/…` keep all of cs.yale.edu, and all of yale.edu, together. A table is split into tablets of 100–200 MB, each served by exactly one tablet server; servers split tablets that grow too big, and a master balances load and handles failures. All data and logs live in GFS, which replicates them, and tablets are stored as LSM trees because GFS files cannot be updated.

The **CAP theorem**: during a network partition, a system cannot be both consistent and available. Traditional databases choose consistency; most web applications choose availability, except for parts such as order processing. Chapter 9 covers the consistency models.

## MapReduce, Spark and streams {#ch08-mapreduce .th}

In **MapReduce** the programmer writes `map(k, v) → list(k1, v1)` and `reduce(k1, list(v1)) → v2`. The system runs one map task per input partition, groups map output by key (a **shuffle** across machines), runs reducers, and handles parallelism and failures. Map output goes to local files; reducers fetch and sort it. A **combiner** is a local reducer run on map output to cut network traffic, so the reducer must handle partial results (sum the values, not count the records).

Writing relational queries this way: selections and projections go in map; the group-by attributes become the reduce key; for a join, the join attribute becomes the reduce key and each value is tagged with its source relation.

```python run=db-c08-mapreduce
from collections import defaultdict

def mapreduce(records, mapper, reducer):
    groups = defaultdict(list)
    for rec in records:
        for k, v in mapper(rec):
            groups[k].append(v)                       # the shuffle
    return [out for k in sorted(groups, key=str) for out in reducer(k, groups[k])]

r = [("r", 1, "x"), ("r", 2, "y"), ("r", 3, "x")]            # r(A, B)
s = [("s", "x", 10, 20), ("s", "z", 30, 40)]                 # s(B, C, D)
def m(rec):
    if rec[0] == "r": yield rec[2], ("r", rec[1])
    else:             yield rec[1], ("s", rec[2], rec[3])
def red(b, vals):
    rs = [v for v in vals if v[0] == "r"]
    ss = [v for v in vals if v[0] == "s"]
    for x in rs:
        if not ss: yield (x[1], b, None, None)                # left outer join
        for y in ss: yield (x[1], b, y[1], y[2])
print(mapreduce(r + s, m, red))

packets = [(0.2, "a", 100), (0.7, "a", 50), (1.1, "a", 10), (0.5, "b", 5)]
print(mapreduce(packets, lambda p: [((p[1], int(p[0])), p[2])], lambda k, v: [(k, sum(v))]))
```

The first job is a reduce-side left outer join of r(A, B) with s(B, C, D); the second computes bytes per source per second.

Writing everything as map and reduce is cumbersome, so **Hive** and **Pig** compile SQL-like queries to MapReduce. **Spark** goes further: an **RDD** is a distributed collection built from others by algebraic operations, evaluated lazily, so nothing runs until an action such as `collect()` or `saveAsTextFile()`, which lets the whole operator tree be optimized first. A **DataFrame** is an RDD of rows with a schema, with filter, join, groupBy and `spark.sql(…)`. Parquet files carry their schema; for CSV pass `header=True, inferSchema=True`. Spark recovers lost partitions by recomputing them from their lineage instead of materializing intermediates.

**Streams** are data that keeps arriving. Queries run over **windows**: tumbling (non-overlapping), hopping (fixed size, starting every few minutes, overlapping), sliding (around each tuple) or session. A window is complete when a **punctuation** says no earlier timestamps will come. Stream-stream joins need a bound on the time gap. Systems route tuples through a DAG of operators (Storm) or **publish-subscribe** topics split into partitions (Kafka), and give at-least-once, at-most-once or exactly-once semantics. The **lambda architecture** sends data both to a stream processor and to a database.

**Graph processing** at scale uses **BSP** (Pregel, Giraph, GraphX): vertex state stays in memory, partitioned across machines; in each superstep a vertex processes incoming messages, updates its state and sends messages or votes to halt; the job ends when all vertices have halted and no messages remain. Its per-iteration overhead is far below MapReduce's.

## Parallel query processing {#ch08-pqp .th}

**Interquery** parallelism runs different queries at once. **Intraquery** parallelism runs one query in parallel, either **intraoperation** (each operator over partitions, high degree) or **interoperation** (different operators at once, limited degree). With partitioning, assembling and skew, the time is about `Tpart + Tasm + max(T1, …, Tn)`.

### Sort

- **Range-partitioning sort**: choose a range vector, redistribute, sort locally. Concatenating the outputs is the final merge, because everything at node i precedes everything at node j for i < j.
- **Parallel external sort-merge**: each node sorts its local data, then the sorted runs are range-partitioned across nodes, each receiver merges its incoming streams, and the results are concatenated. Sending in sorted order means every node sends to node 1, then all to node 2, a skew; sending a block at a time to each node in turn avoids it.

### Joins

| Method | How | Works for |
|---|---|---|
| partitioned | partition r and s on the join attributes with the same function, join locally | equi-joins |
| asymmetric fragment-and-replicate (broadcast) | partition r any way, replicate s to every node | any condition |
| general fragment-and-replicate | split r into m parts and s into n, send each pair to one of m·n nodes | any condition |

A **partitioned parallel hash join** sends each s tuple to a node by h1, where it is partitioned locally by h2, then does the same for r, then builds and probes at each node; hybrid hash applies, caching incoming tuples in memory. Broadcasting can beat partitioning even for equi-joins: when s is small and r is large and already partitioned, replicating s is cheaper than repartitioning both.

A left outer join `r ⟕ s` works with asymmetric fragment-and-replicate only if the preserved side r is partitioned and s replicated: if s were partitioned, a missing match at one node would not mean no match anywhere.

### Aggregation and partial aggregation

Partition on the grouping attributes and aggregate locally. **Partial aggregation** first aggregates locally at each node, then repartitions the partial results and combines them. With `B γ sum(C) (r)` and r partitioned on A, repartitioning raw tuples on B with few distinct B values risks one node receiving most of them (execution skew). Aggregating first leaves at most V(B, r) tuples per node to send, so far fewer tuples cross the network or arrive at the slowest node.

```python run=db-c08-partial
import random, zlib
from collections import Counter, defaultdict
random.seed(4)
h = lambda k: zlib.crc32(k.encode())
nodes = 4
data = [[(random.choice("aaaaaabc"), 1) for _ in range(25_000)] for _ in range(nodes)]   # B is skewed

raw = Counter()
for part in data:
    for b, _ in part: raw[h(b) % nodes] += 1
pre = Counter()
partial = []
for part in data:
    local = defaultdict(int)
    for b, c in part: local[b] += c
    partial.append(local)
    for b in local: pre[h(b) % nodes] += 1
print("tuples received per node, raw repartition:", sorted(raw.values()))
print("tuples received per node, partial agg:     ", sorted(pre.values()))
final = defaultdict(int)
for local in partial:
    for b, c in local.items(): final[b] += c
print(dict(sorted(final.items())))
```

Partial aggregation needs a distributive (or algebraic) aggregate: sums combine with sums, counts with sums of counts, averages through sum and count.

### The exchange operator

All repartitioning is wrapped in an **exchange** operator: partition by hash, range or broadcast, or send everything to one node; at the receiver, merge randomly or in order. Other operators stay unaware of parallelism:

| Plan | Built from |
|---|---|
| range-partitioning sort | exchange (range) → local sort |
| parallel external sort-merge | local sort → exchange (ordered merge) |
| partitioned join | exchange (hash or range) on both inputs → local join |
| asymmetric fragment-and-replicate | exchange (broadcast) on one input → local join |

Plans also use **pipelined** parallelism (operators run concurrently, passing tuples, with batches to cut messages) and **independent** parallelism (r1 ⋈ r2 on one node, r3 ⋈ r4 on another, then join the results), which helps only at low degrees.

### Fault tolerance and shared memory

With hundreds of machines, re-running the whole query on a failure is fine when failures are rare relative to the query's length. At larger scale, re-execute only the failed node's work, which is easy if consumers use a producer's output only once it is complete, as in MapReduce: map output is on local disk, a failed map is rerun elsewhere and its partial output discarded, a failed reducer is rerun and re-fetches its input. Stragglers are treated like failures and given a duplicate task. Pipelined consumers are harder, because re-execution must regenerate tuples in the same order.

On a shared-memory machine, threads replace nodes and the small relation need not be replicated: a hash join can partition the build input per thread, or build one shared hash table (using test-and-set or CAS on bucket lists) and probe it in morsels. Work stealing is cheap, and NUMA-aware scheduling keeps each thread on data in its local memory.

### Distributed query processing

When data sits at different sites, network transfer dominates. To compute r1 ⋈ r2 with r1 at S1, r2 at S2 and the result needed at S1, the **semijoin strategy** ships less:

1. At S1, compute `temp1 = Π R1∩R2 (r1)`, the join attribute values of r1.
2. Ship temp1 to S2.
3. At S2, compute `temp2 = r2 ⋈ temp1`, which is r2 ⋉ r1.
4. Ship temp2 to S1.
5. At S1, compute `r1 ⋈ temp2`.

It pays off when few r2 tuples match. A **bitmap** or Bloom filter of the join values is a cheaper, approximate temp1: a false positive just ships an extra tuple.

```python run=db-c08-bitmap-semijoin
import random
random.seed(9)
n_s_parts, bits = 3, 8192
r_parts = [[(a, random.randint(0, 9_999)) for a in range(i * 300, i * 300 + 300)] for i in range(2)]   # r(A, B), partitioned on A
s = [(b, f"c{b}") for b in range(10_000)]                                                            # s(B, C), most unmatched
s_parts = [[t for t in s if t[0] % n_s_parts == j] for j in range(n_s_parts)]                       # partitioned on B

received, shipped = [[] for _ in r_parts], 0
for i, rp in enumerate(r_parts):
    bitmaps = [0] * n_s_parts                                  # one bitmap per s partition
    for _, b in rp:
        bitmaps[b % n_s_parts] |= 1 << (hash(b) % bits)
    for j, sp in enumerate(s_parts):                           # send bitmap j to s partition j
        back = [t for t in sp if bitmaps[j] >> (hash(t[0]) % bits) & 1]
        shipped += len(back); received[i] += back
result = [(a, b, c) for i, rp in enumerate(r_parts) for a, b in rp for b2, c in received[i] if b == b2]
naive = [(a, b, c) for rp in r_parts for a, b in rp for b2, c in s if b == b2]
print(f"s tuples shipped with bitmaps: {shipped} of {len(s) * len(r_parts)}; result correct: {sorted(result) == sorted(naive)}")
```

Each r partition builds one bitmap per s partition from its B values and sends it; each s partition returns only the tuples matching each bitmap, so si ⋉ rj goes to rj, and the join happens at the r partitions, keeping the result partitioned like r. With 8,192 bits for about 100 values per bitmap, false positives are rare; a real system sizes the bitmap by the number of distinct values, or uses a Bloom filter.

**Federated** databases put a global schema over heterogeneous local databases through **wrappers**; a **mediator** offers a common schema without updates; **data virtualization** skips the common schema; a warehouse migrates data to one schema; a **data lake** keeps varied formats in one system.

## Drills: parallel processing {#ch08-drills .dr}

:::drill output
p = 0.9 of a query parallelizes. What is the best speedup on 10 nodes, and the limit with unlimited nodes?
---
```python run=db-c08-d-amdahl
p, n = 0.9, 10
print(round(1 / ((1 - p) + p / n), 2), round(1 / (1 - p), 1))
```
:::

:::drill concept
Which partitioning is best for: (a) full scans only; (b) point lookups on the partitioning attribute; (c) range queries on it, with most queries hitting recent data?
---
**Answer.** (a) round-robin, perfectly balanced. (b) hash or range, one node. (c) range partitioning answers ranges on few nodes, but recent data on one node causes execution skew; virtual nodes, or hash partitioning when ranges are rare, help.
:::

:::drill concept
Distinguish attribute-value skew, partition skew and execution skew.
---
**Answer.** Attribute-value skew: many tuples share one value and land together (range or hash). Partition skew: a poor range vector leaves partitions uneven even without value skew. Execution skew: partitions are even but the work is not, for example all queries hitting the current month's partition.
:::

:::drill concept
How do virtual nodes help with skew and elasticity?
---
**Answer.** With many more virtual nodes than machines, skew is spread across many small units, and an overloaded machine can hand some of its virtual nodes to others. Adding a machine just moves some virtual nodes onto it, with no global repartitioning.
:::

:::drill tricky
r(A, B, C) has primary key A and is partitioned on A. Explain how a global secondary index on B is stored, and why it resembles a secondary index on a B+-tree file organization.
---
**Answer.** Store a relation of (B, A) pairs, partitioned on B and indexed locally on B at each partition, so a lookup on B goes to one node and finds the primary keys quickly, then fetches the records from the r partitions by A. Like a secondary index on a B+-tree file, it stores the primary key instead of a record pointer, because records can move.
:::

:::drill concept
Why is HDFS a poor store for billions of small objects?
---
**Answer.** The NameNode keeps all file and block metadata in memory, so the number of files is limited, and every file carries per-file overhead. A key-value store, which packs many small records into large tablets, suits that workload.
:::

:::drill concept
Sharding versus a key-value store: who routes queries, and what does sharding not give you?
---
**Answer.** In sharding the application routes; in a key-value store the system does. Sharding gives no cross-shard queries or transactions, no transparent replication, and moving load off an overloaded shard is hard.
:::

:::drill output
Write the map and reduce functions for "bytes per source per second" over packets `(time, src, dst, size)`, and run them on `(0.2, a, 100) (0.7, a, 50) (1.1, a, 10) (0.5, b, 5)`.
---
```python run=db-c08-d-mr
from collections import defaultdict
g = defaultdict(int)
for t, src, size in [(0.2, "a", 100), (0.7, "a", 50), (1.1, "a", 10), (0.5, "b", 5)]:
    g[(src, int(t))] += size                 # map emits ((src, floor(time)), size); reduce sums
print(dict(g))
```
:::

:::drill concept
Why must a reducer sum values instead of counting records when a combiner is used?
---
**Answer.** A combiner runs reduce logic locally on map output, so a reducer may receive ("a", 3) standing for three occurrences rather than three ("a", 1) records. Counting records would give the wrong total.
:::

:::drill tricky
r(A, B, C) is partitioned on A. To compute `B γ sum(C) (r)`, why does repartitioning on B risk execution skew when B has few distinct values, and how does partial aggregation help?
---
**Answer.** With few distinct B values, one node may receive the tuples of a very common value, a large share of the relation, and become the bottleneck. Partial aggregation computes the sum per B locally at each node first, so each node sends at most V(B, r) tuples. Far fewer tuples cross the network, and the node handling the common value receives one tuple per source node instead of millions.
:::

:::drill tricky
r(A, B) is partitioned on A, s(B, C) on B, and most s tuples match no r tuple. Compute r ⋈ s with the result partitioned like r, shipping as little as possible.
---
**Answer.** Use semijoins with bitmaps. Each r partition builds one bitmap per s partition: for each r tuple, find the s partition its B maps to and set the bit for B's hash in that bitmap. It sends each bitmap to its s partition. Each s partition returns only the tuples whose B bit is set, so si ⋉ rj goes back to rj. Each r partition joins its tuples with what it received. False positives only add a few extra tuples.
:::

:::drill concept
When can a left outer join r ⟕ s use asymmetric fragment-and-replicate?
---
**Answer.** When r, the preserved side, stays partitioned and s is replicated to every node. Each node then sees all of s, so a missing match there truly means no match. If r were replicated and s partitioned, every node would output its own null-padded copy of r tuples that matched elsewhere.
:::

:::drill concept
Express a partitioned hash join and a parallel external sort-merge with exchange operators.
---
**Answer.** Partitioned join: exchange(hash on the join attributes) under each input, then a local hash join at each node. Parallel external sort-merge: a local sort at each node, then exchange(range partitioning with an ordered merge at the receiver), then concatenate.
:::

:::drill concept
Why is Spark lazy, and what triggers execution?
---
**Answer.** Transformations only build an operator tree, so the whole tree can be optimized and pipelined before running. Execution starts at an action such as `collect()`, `count()` or `saveAsTextFile()`.
:::

:::drill concept
What is the difference between a tumbling and a hopping window?
---
**Answer.** Tumbling windows divide time into non-overlapping intervals, such as each hour. Hopping windows have a fixed size but start more often, such as an hour-long window every 20 minutes, so they overlap.
:::

## Write the code {#ch08-coding .cd}

:::drill code
Write a range-partitioning parallel sort: pick split points from a sample, redistribute to 4 "nodes", sort locally, and check that concatenation gives a sorted result. Report how balanced the partitions are.
---
```python run=db-c08-c-psort
import random
random.seed(12)
data = [int(random.expovariate(1 / 1000)) for _ in range(200_000)]   # skewed values
n = 4
sample = sorted(random.sample(data, 400))
vector = [sample[len(sample) * i // n] for i in range(1, n)]
def node_of(v):
    for i, b in enumerate(vector):
        if v < b: return i
    return n - 1
parts = [[] for _ in range(n)]
for v in data: parts[node_of(v)].append(v)
out = [x for p in parts for x in sorted(p)]
print("vector", vector, "| sizes", [len(p) for p in parts], "| sorted:", out == sorted(data))
naive = [i * max(data) // n for i in range(1, n)]
print("equal-width vector", naive, "| sizes", [sum(1 for v in data if (sum(v >= b for b in naive)) == i) for i in range(n)])
```

Split points from a sample follow the data's distribution, so the partitions come out close to equal. Splitting the value range evenly puts most of an exponential distribution on the first node.
:::

:::drill code
Simulate a broadcast join versus a partitioned join and count the tuples each moves, for a large r already partitioned on its join attribute and a small s partitioned on something else.
---
```python run=db-c08-c-broadcast
nodes = 8
r_size, s_size = 1_000_000, 2_000
r_already_ok = True                       # r is partitioned on the join attribute
partitioned = s_size * (nodes - 1) // nodes + (0 if r_already_ok else r_size * (nodes - 1) // nodes)
broadcast = s_size * (nodes - 1)
print("partitioned join moves", partitioned, "tuples; broadcast moves", broadcast)
r_already_ok = False
partitioned = s_size * (nodes - 1) // nodes + r_size * (nodes - 1) // nodes
print("if r must be repartitioned too:", partitioned, "vs broadcast", broadcast)
```

When r is already partitioned on the join attribute, only s moves either way and repartitioning it is cheapest. When r would also have to move, broadcasting the small s is far cheaper, even for an equi-join.
:::

## Cheat sheet {#ch08-cheatsheet .th}

- Shared memory: fast, ≤ ~128 cores. Shared disk: failover. Shared nothing: scales to thousands. Linear speedup = N, linear scaleup = 1. Amdahl: 1/((1−p) + p/n).
- Round-robin: best scans, worst lookups. Hash: point lookups, bad ranges. Range: ranges, execution skew.
- Skew: attribute-value, partition, execution. Fix with sampled range vectors, virtual nodes, tablets that split.
- Global secondary index: (Ki, Kp) partitioned on Ki, locally indexed; stores the primary key.
- HDFS: NameNode metadata, 64 MB blocks, 3 replicas, append-only, bad for small files. BigTable: tablets on GFS as LSM trees. Sharding: app routes; KV store: system routes. CAP: choose C or A during a partition.
- MapReduce: σ/π in map; group-by and join attributes as the reduce key; tag join inputs by relation. Combiners → reducers must sum. Spark is lazy.
- Parallel join: partitioned (equi), broadcast (any condition, small s), general fragment-and-replicate. Left outer join: replicate the non-preserved side.
- Partial aggregation before repartitioning cuts traffic and skew. Exchange operator hides all repartitioning.
- Semijoin strategy and bitmaps ship only join values and matching tuples.
