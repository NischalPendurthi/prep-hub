---
title: Indexing
part: Part A · Storage
lede: An index turns a scan of the whole relation into a handful of page reads. This chapter covers ordered indices, the B+-tree in full (search, insert, delete, bulk loading and its height arithmetic), hashing, the write-optimized LSM tree with Bloom filters, bitmap indices, and the spatial and vector indices that turn up in modern systems.
desc: clustering vs secondary, dense vs sparse, B+-tree structure, splits and merges, bulk loading, secondary indices storing keys, hashing, LSM trees, stepped merge, Bloom filters, bitmap indices, R-trees, HNSW
hours: 4
prereqs: Chapter 1, binary search, logarithms
---

## Index basics {#ch02-basics .th}

An index maps search-key values to records. Two classifications matter:

- **Clustering** (primary) index: the file is stored sorted on the index's search key. A relation can have at most one. The search key need not be the primary key.
- **Secondary** (nonclustering) index: the file is in some other order. Records with the same key can be anywhere, so each match may cost a random I/O.

- **Dense**: an entry for every search-key value.
- **Sparse**: entries for only some values. This works only when records are sorted on the key: find the largest entry ≤ K, then scan forward. A common compromise is one entry per block.

Secondary indices must be dense, because the file order says nothing about where an unindexed key lives.

A **composite** index on `(dept, salary)` orders entries lexicographically. It answers `dept = 'Finance' and salary = 80000` and `dept = 'Finance' and salary < 80000` with one range scan, but not `dept < 'Finance' and salary = 80000` efficiently, because matching salaries are scattered across all the departments before Finance.

A **covering** index stores extra attributes in its leaves, so a query that needs only those attributes skips the record fetch. This matters most for secondary indices, where the fetch is a random I/O per match. In PostgreSQL this is `create index … include (…)` and the plan shows an "Index Only Scan".

```python run=db-c02-sqlite-plan
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("create table emp(id integer primary key, dept text, salary int, name text)")
db.executemany("insert into emp(dept, salary, name) values (?,?,?)",
               [(f"d{i % 50}", 1000 + i % 997, f"n{i}") for i in range(20_000)])
def plan(q):
    return " | ".join(r[3] for r in db.execute("explain query plan " + q))
q = "select salary from emp where dept = 'd7' and salary < 1200"
print("no index:      ", plan(q))
db.execute("create index emp_dept_sal on emp(dept, salary)")
print("composite:     ", plan(q))
print("leading column missing:", plan("select salary from emp where salary < 1200"))
```

SQLite's planner uses the composite index as a covering index for the first query, since `dept` and `salary` are both in it. Without a condition on the leading column, it can only scan the whole index (or the table), because the entries are not ordered by `salary` alone.

## The B+-tree {#ch02-bptree .th}

A B+-tree of order n is a balanced tree of disk pages. Every root-to-leaf path has the same length.

| Node | Holds |
|---|---|
| internal (not root) | between ⌈n/2⌉ and n children |
| leaf (not root) | between ⌈(n−1)/2⌉ and n−1 keys |
| root, internal | at least 2 children |
| root, leaf | 0 to n−1 keys |

In an internal node with keys K1 < … < Km−1 and pointers P1 … Pm, the subtree under Pi holds keys ≥ Ki−1 and < Ki. Leaves hold `(key, record pointer)` pairs, or the records themselves in a B+-tree file organization, and each leaf points to the next leaf so range scans walk the leaf chain.

### Height

With K keys, the height is at most `⌈log⌈n/2⌉ K⌉`. Pages are large, so n is large, and the tree is shallow:

```python run=db-c02-height
import math
page, entry = 4096, 40
n = page // entry
for K in (10**6, 10**9):
    worst = math.ceil(math.log(K, math.ceil(n / 2)))
    full = math.ceil(math.log(K, n))
    print(f"n={n}, K={K:,}: at most {worst} levels, about {full} when nodes are full; binary tree ~{math.ceil(math.log2(K))}")
```

The top levels are almost always in the buffer pool, so a lookup usually costs one or two I/Os.

### Insertion

1. Find the leaf. If it has room, insert in sorted order.
2. Otherwise split it: put the n keys (including the new one) in order, keep the first ⌈n/2⌉, move the rest to a new leaf, and insert `(smallest key of new leaf, pointer)` into the parent. The key is **copied up**: it stays in the leaf.
3. If the parent overflows, split it too: it now has n+1 pointers. Keep the first ⌈n/2⌉ pointers and the ⌈n/2⌉−1 keys between them, move the next key **up** to the grandparent (it appears in neither half), and put the rest in a new node. Some editions keep ⌈(n+1)/2⌉ pointers instead; both give a valid tree.
4. A root split adds a level.

### Deletion

Remove the entry. If the node is now under-full:

- If it and a sibling fit in one node, **merge** them and delete the separator from the parent (recursively). Merging internal nodes pulls the parent's separator down into the merged node.
- Otherwise **redistribute** entries with a sibling and update the separator in the parent. For internal nodes, the separator rotates: the parent's key moves down into the under-full node and the sibling's boundary key moves up.
- If the root ends up with one child, that child becomes the root.

Here is a small B+-tree with inserts, splits and range scans. Run it and check the printed tree against the rules above:

```python run=db-c02-insert
import bisect

class Node:
    def __init__(self, leaf):
        self.leaf, self.keys, self.kids, self.next = leaf, [], [], None

class BPlusTree:
    def __init__(self, n):                   # n = max pointers per node
        self.n, self.root = n, Node(True)
    def _leaf(self, k):
        node, path = self.root, []
        while not node.leaf:
            path.append(node)
            node = node.kids[bisect.bisect_right(node.keys, k)]
        return node, path
    def insert(self, k):
        leaf, path = self._leaf(k)
        bisect.insort(leaf.keys, k)
        if len(leaf.keys) <= self.n - 1:
            return
        half = (self.n + 1) // 2             # ceil(n/2) keys stay
        new = Node(True)
        new.keys, leaf.keys = leaf.keys[half:], leaf.keys[:half]
        new.next, leaf.next = leaf.next, new
        self._up(path, leaf, new.keys[0], new)          # copied up
    def _up(self, path, left, key, right):
        if not path:
            self.root = Node(False)
            self.root.keys, self.root.kids = [key], [left, right]
            return
        parent = path.pop()
        i = parent.kids.index(left)
        parent.keys.insert(i, key)
        parent.kids.insert(i + 1, right)
        if len(parent.kids) <= self.n:
            return
        half = (self.n + 1) // 2             # ceil(n/2) pointers stay
        new = Node(False)
        up = parent.keys[half - 1]           # moved up, kept in neither half
        new.keys, new.kids = parent.keys[half:], parent.kids[half:]
        parent.keys, parent.kids = parent.keys[:half - 1], parent.kids[:half]
        self._up(path, parent, up, new)
    def range(self, lo, hi):
        leaf, _ = self._leaf(lo)
        out = []
        while leaf:
            for k in leaf.keys:
                if k > hi:
                    return out
                if k >= lo:
                    out.append(k)
            leaf = leaf.next
        return out
    def show(self, node=None, depth=0):
        node = node or self.root
        lines = ["  " * depth + str(node.keys)]
        for c in node.kids:
            lines += self.show(c, depth + 1)
        return lines if depth else "\n".join(lines)

t = BPlusTree(4)                             # at most 3 keys per node
for k in [1, 3, 5, 2, 7, 4, 6, 8, 9, 10]:
    t.insert(k)
print(t.show())
print("range 4..8:", t.range(4, 8))
```

The final tree has root `[5]`: the internal split of `[3, 5, 7, 9]` kept `[3]` on the left, moved 5 up and put `[7, 9]` on the right. The leaf splits, by contrast, kept their separators (3, 5, 7, 9) in the leaves.

### Average occupancy and bulk loading

Random inserts leave nodes about 2/3 full on average. Inserting in sorted order leaves every split-off left node exactly half full, the worst case.

Inserting a large batch one key at a time costs at least one random I/O per key once the tree is bigger than memory. **Bulk loading** sorts the entries first and builds the tree **bottom-up**: fill leaves sequentially, then build each internal level from the level below. Everything is sequential I/O.

:::key Why a bottom-up build leaves free space
If every leaf is packed full, the next insert into any leaf splits it into two half-full leaves. With random inserts, nearly every leaf splits soon after the build: space utilization drops sharply to about half, and inserts are slow during the burst of splits. Leaving, say, 10–30% free (PostgreSQL's `fillfactor`) lets leaves absorb inserts gradually and spreads the splits out over time.
:::

### Records that move, and secondary indices

In a B+-tree file organization the records live in the leaves, so a leaf split moves half of them to a new page. Every secondary index that stored a physical record pointer would need updating for each moved record, which makes splits very expensive. The fix: secondary indices store the **primary key** (the B+-tree file's search key) instead of a pointer. A secondary lookup then costs a second traversal, of the primary tree, but splits touch nothing else. MySQL InnoDB works this way. The same idea reappears in Chapter 8: a global secondary index in a partitioned store also stores the primary key.

### Other variations

- **Non-unique keys**: make the key unique by appending the primary key or record ID, so `(dept, id)`, and look up `dept = v` as the range `(v, −∞)` to `(v, +∞)`.
- **Strings**: nodes hold a variable number of keys, so split by bytes used. **Prefix compression** keeps only as much of an internal key as needed to separate its neighbours ("Silb" for "Silberschatz").
- **B-tree** (no plus): each key appears once, in an internal node or a leaf. Slightly less space, but deletion and sequential scans are more complicated.
- **Flash**: random reads are cheap but writes cause erases, so write-optimized structures help more than smaller nodes.

## Hashing {#ch02-hashing .th}

A hash index puts entries in **buckets** (usually one disk block each) chosen by `h(key)`. A lookup reads one bucket, unless it has overflowed. A bucket can hold different keys, so the whole bucket is searched.

Buckets overflow when there are too few of them or when keys are skewed (many records with one key, or a poor hash function). **Overflow chaining** links extra blocks to the bucket. Open addressing, which puts the entry in another bucket, is not used in databases.

**Static hashing** fixes the number of buckets, which breaks when the data grows. Dynamic schemes grow it:

- **Extendable hashing** uses a directory of `2^i` entries indexed by the first i bits of the hash. Several entries can share a bucket. A full bucket splits, and the directory doubles only when the splitting bucket was already using all i bits.
- **Linear hashing** splits buckets one at a time in a fixed order, with no directory.

Hash indices answer equality only. A B+-tree answers equality and ranges, has similar point-lookup cost once the top levels are cached, and handles skew. That is why most systems use B+-trees for nearly everything.

## Write-optimized indices: LSM trees {#ch02-lsm .th}

A B+-tree insert into a large tree costs a random leaf read and write. A magnetic disk manages fewer than 100 of those per second. An **LSM tree** (log-structured merge tree) turns inserts into sequential I/O:

1. Inserts go to an in-memory tree L0 (and to a log, for recovery).
2. When L0 fills, merge it with L1 on disk, writing a new L1 sequentially with a bottom-up build.
3. When Li exceeds its size limit (k times that of Li−1), merge it into Li+1.

Deletes insert a **tombstone**; lookups treat it as "not found", and merges drop both. An update is a delete plus an insert. A lookup must check every level, newest first.

**Stepped merge** keeps up to k trees per level and merges them together only when there are k, writing each entry fewer times at the cost of more trees to search. **Bloom filters**, one per tree, let a lookup skip trees that cannot hold the key.

LSM trees are used in BigTable, HBase, Cassandra, LevelDB and RocksDB. BigTable stores its files on GFS, where a file cannot be modified once written; LSM trees never update a file in place, and they handle high insert rates, which is why BigTable stores every table this way.

### Bloom filters

A Bloom filter is a bit array plus k hash functions. Insert sets k bits; a lookup checks those bits. If any is 0 the key is definitely absent. If all are 1 it is probably present: no false negatives, some false positives. With m bits for n keys, the false-positive rate is about `(1 − e^(−kn/m))^k`, minimised at k = (m/n)·ln 2:

```python run=db-c02-bloom
import math, hashlib

def fp_rate(bits_per_key, k):
    return (1 - math.exp(-k / bits_per_key)) ** k
for k in (1, 2, 3, 7):
    print(f"10 bits/key, {k} hash(es): {fp_rate(10, k):.3%}")

class Bloom:
    def __init__(self, m, k):
        self.m, self.k, self.bits = m, k, bytearray(m)
    def _pos(self, key):
        d = hashlib.sha256(str(key).encode()).digest()
        return [int.from_bytes(d[4*i:4*i+4], "little") % self.m for i in range(self.k)]
    def add(self, key):
        for p in self._pos(key): self.bits[p] = 1
    def __contains__(self, key):
        return all(self.bits[p] for p in self._pos(key))

b = Bloom(10_000, 7)
for i in range(1000): b.add(i)
fps = sum(i in b for i in range(1000, 101_000))
print("missed inserted keys:", sum(i not in b for i in range(1000)), " measured FP rate:", f"{fps / 100_000:.3%}")
```

At 10 bits per key with the best k, about 1% of lookups for absent keys are false positives.

```python run=db-c02-lsm-cost
levels, trees_per_level, height = 4, 10, 3
no_bloom = levels * trees_per_level * height
fp = 0.01
with_bloom = height * (1 + (levels * trees_per_level - 1) * fp)
print("stepped merge lookup, no Bloom filters:", no_bloom, "random I/Os")
print(f"with 1% Bloom filters, key in one tree: {with_bloom:.2f} I/Os")
```

## Bitmap indices {#ch02-bitmap .th}

For an attribute with few distinct values (gender, country, rating), a bitmap index keeps one bitmap per value with one bit per record, with records numbered sequentially. Multi-attribute conditions become bitwise operations:

```python run=db-c02-bitmap
ratings = [5, 3, 5, 1, 4, 5, 2, 5]
country = ["IN", "IN", "US", "IN", "JP", "IN", "US", "IN"]
def bitmap(col, v):
    return sum(1 << i for i, x in enumerate(col) if x == v)
m = bitmap(ratings, 5) & bitmap(country, "IN")
print(f"{bitmap(ratings, 5):08b} AND {bitmap(country, 'IN'):08b} = {m:08b}, count {m.bit_count()}")
```

Bitmaps are small: with 100-byte records, a bitmap is 1/800 of the relation's size. They are ANDed a machine word at a time, and counting set bits is a single instruction or a 256-entry table lookup per byte. A bitmap can also replace the list of record IDs for a common key in a B+-tree leaf: once more than 1/64 of the records have the value, one bit per record beats 64-bit IDs.

## Spatial and vector indices {#ch02-spatial .th}

- **k-d tree**: each level splits space in two on one dimension, cycling through the dimensions. The **k-d-B tree** gives each node many children for disk.
- **Quadtree**: each node splits its region into four equal quadrants.
- **R-tree**: a B+-tree for rectangles. Each node stores the bounding box of its children, and boxes may overlap. A search descends into **every** child whose box intersects the query, so several paths may be followed; the worst case is linear, but it works well in practice.

**HNSW** (hierarchical navigable small world) indexes vectors for approximate nearest-neighbour search, as in vector databases. Level 0 holds every vector; each higher level holds a random subset. A new vector's top level L is drawn so that `P(level ≥ L) = 1/k^L`, making each level about 1/k the size of the one below. To search, start at the top level, move greedily to whichever neighbour is closest to the query, and when no neighbour is closer, drop a level and continue. Inserting runs that search, and on each level the new node belongs to, it is linked to the nearest few nodes found.

```python run=db-c02-hnsw-levels
import random
random.seed(7)
k, n = 4, 100_000
def level():
    L = 0
    while random.random() < 1 / k:
        L += 1
    return L
counts = {}
for _ in range(n):
    for l in range(level() + 1):
        counts[l] = counts.get(l, 0) + 1
print({l: counts[l] for l in sorted(counts)})
```

Each level ends up about a quarter the size of the one below, like a skip list.

## Drills: indexing {#ch02-drills .dr}

:::drill concept
Why must a secondary index be dense, while a clustering index can be sparse?
---
**Answer.** A sparse index works by finding the nearest smaller entry and scanning forward, which only finds the record if the file is sorted on that key. A secondary index's key has no relation to file order, so every value needs its own entry.
:::

:::drill output
A B+-tree has n = 6. How many keys can a non-root leaf hold, and how many children can a non-root internal node have?
---
```python run=db-c02-d-occupancy
import math
n = 6
print("leaf keys:", math.ceil((n - 1) / 2), "to", n - 1, "| internal children:", math.ceil(n / 2), "to", n)
```
:::

:::drill concept
A B+-tree with n = 4 (at most 3 keys per node) has a single leaf `[1, 3, 5]`. Insert 2. What does the tree look like?
---
**Answer.** The leaf would hold 1 2 3 5, so it splits: ⌈4/2⌉ = 2 keys stay, giving leaves `[1, 2]` and `[3, 5]`. The new root is `[3]`, with 3 copied up and still present in the right leaf.
:::

:::drill tricky
In a leaf split the separator is copied up; in an internal split it moves up. Why the difference?
---
**Answer.** Leaves must contain every key, because they hold the record pointers and the leaf chain is used for scans, so the key stays in the leaf. An internal node's keys are only routing information, and after the split the middle key is exactly the boundary between the two halves, so it belongs in the parent and nowhere else.
:::

:::drill concept
An internal node P1 holds `… P11 10 P12` and its right sibling P2 holds `P23 30 …`. The parent separator between them is 20. P2 is under-full and borrows from P1. What do the three nodes look like afterwards?
---
**Answer.** The keys rotate through the parent. The parent's 20 moves down into P2, P1's last key 10 moves up to the parent, and pointer P12 moves to P2. Parent: `… P1 10 P2 …`. P1: `… P11`. P2: `P12 20 P23 30 …`.
:::

:::drill output
4 KB pages and 40-byte entries. How many levels at most for 1,000,000 keys? How many for 10^9?
---
```python run=db-c02-d-height
import math
n = 4096 // 40
print([math.ceil(math.log(K, math.ceil(n / 2))) for K in (10**6, 10**9)])
```

**Why.** Height ≤ ⌈log⌈n/2⌉ K⌉ with ⌈n/2⌉ = 51.
:::

:::drill tricky
Bulk-loading by sorting and then inserting in order is much faster than random inserts, but it has a cost. What is it, and how does a bottom-up build avoid it?
---
**Answer.** In-order inserts always split the rightmost leaf, leaving every left half exactly half full, so occupancy is 50%. A bottom-up build writes leaves directly at the chosen fill level and builds each internal level from the one below, with only sequential I/O.
:::

:::drill concept
Why do secondary indices on a B+-tree file organization usually store the primary key instead of a record pointer? What does that cost?
---
**Answer.** Records in a B+-tree file move whenever a leaf splits or merges, so pointers in secondary indices would all need updating, making splits very expensive. Storing the primary key avoids that. The cost: a secondary lookup also traverses the primary B+-tree.
:::

:::drill concept
Which queries can an index on `(dept, salary)` serve efficiently: (a) `dept = 'X'`, (b) `salary = 5`, (c) `dept = 'X' and salary > 5`, (d) `dept > 'X' and salary = 5`?
---
**Answer.** (a) yes, a prefix. (b) not by a range scan, since salary is the second column (some systems do a skip scan or a full index scan). (c) yes, one contiguous range. (d) only partly: the range on dept is contiguous, but the salary condition must be checked on every entry in it.
:::

:::drill concept
Which index on `r(A, B)` answers `select max(B) from r where A = ?` with one traversal?
---
**Answer.** A B+-tree on `(A, B)`: search for the largest entry below `(a, +∞)`, which is the last entry with A = a.
:::

:::drill tricky
Give the two properties of LSM trees that made BigTable, which stores data in GFS, use them for every table.
---
**Answer.** LSM trees never update data in place: merges write new files and delete old ones, which fits GFS, where a file cannot be modified once written. And they support very high insert and update rates, because inserts go to memory and reach disk through sequential merges.
:::

:::drill output
A stepped-merge index has 4 levels with 10 trees each, every tree of height 3, and no Bloom filters. How many random I/Os does a lookup for an absent key take? With 1% Bloom filters?
---
```python run=db-c02-d-lsm
print(4 * 10 * 3, round(4 * 10 * 0.01 * 3, 2))
```

**Why.** Without filters every tree is searched. With them, each tree is searched only on a false positive, about 0.4 trees on average.
:::

:::drill concept
An LSM tree has a 1% false-positive Bloom filter per run. Why is a lookup for a key that exists still more expensive than in a B+-tree?
---
**Answer.** It searches every run from newest to oldest until the key is found. Filters skip most absent runs, but each run that is searched costs a traversal. Range queries are worse: Bloom filters do not help, and every run must be merged on the fly.
:::

:::drill concept
How do you delete from an LSM tree?
---
**Answer.** Insert a delete entry (tombstone) for the key. A lookup that finds the tombstone in a newer run reports the key absent even if an older run has it. When a merge sees both, it drops them. The tombstone can be discarded once it reaches the last level.
:::

:::drill output
Bitmaps for `rating = 5` and `country = 'IN'` are `10100111` and `11101001`. Which records match both, and how many?
---
```python run=db-c02-d-bits
a, b = 0b10100111, 0b11101001
print(f"{a & b:08b}", (a & b).bit_count())
```
:::

:::drill tricky
An R-tree query asks for all objects inside rectangle R. Why must it visit children whose bounding box only overlaps R, not just those contained in it?
---
**Answer.** A bounding box that overlaps R partly can still hold an object lying entirely inside R. Only children whose box does not intersect R at all can be skipped. Because boxes overlap, the worst case visits many nodes, linear in the number of objects.
:::

:::drill concept
How does HNSW choose the top level of a new entry so that each level is about 1/k the size of the one below?
---
**Answer.** It draws a random level with `P(level ≥ L) = (1/k)^L`, for example by promoting with probability 1/k repeatedly. The entry goes in that level and all levels below, like a skip list.
:::

## Write the code {#ch02-coding .cd}

:::drill code
Write extendable hashing with a global depth, local depths and bucket splits. Insert keys and show the directory doubling.
---
```python run=db-c02-c-extendable
class Extendable:
    def __init__(self, cap):
        self.cap, self.gd = cap, 0
        self.dir = [{"ld": 0, "keys": []}]
    def _idx(self, k):
        return hash(k) & ((1 << self.gd) - 1)            # low gd bits
    def insert(self, k):
        b = self.dir[self._idx(k)]
        if len(b["keys"]) < self.cap:
            b["keys"].append(k); return
        if b["ld"] == self.gd:                           # directory must double
            self.dir += self.dir
            self.gd += 1
        b["ld"] += 1
        new = {"ld": b["ld"], "keys": []}
        bit = 1 << (b["ld"] - 1)
        for i, x in enumerate(self.dir):
            if x is b and i & bit:
                self.dir[i] = new
        old, b["keys"] = b["keys"], []
        for x in old + [k]:
            self.insert(x)

h = Extendable(cap=2)
for k in [0, 4, 8, 1, 5, 2]:
    h.insert(k)
print("global depth", h.gd, "| directory size", len(h.dir), "| buckets", len({id(b) for b in h.dir}))
for i, b in enumerate(h.dir):
    print(f"{i:03b} ld={b['ld']} {sorted(b['keys'])}")
```

Python's `hash` of a small integer is the integer itself, so the bits are easy to follow. Keys 0, 4 and 8 share their low two bits, so their bucket keeps splitting until three bits leave at most two keys per bucket, and buckets that never overflowed keep a smaller local depth and are shared by several directory entries.
:::

:::drill code
Write a two-level LSM tree: a memtable flushed into sorted runs, lookups newest-first with tombstones, and a compaction that merges all runs into one.
---
```python run=db-c02-c-lsm
import heapq
TOMB = object()

class LSM:
    def __init__(self, memcap):
        self.mem, self.memcap, self.runs = {}, memcap, []   # runs: newest first
    def put(self, k, v):
        self.mem[k] = v
        if len(self.mem) >= self.memcap:
            self.runs.insert(0, sorted(self.mem.items()))
            self.mem = {}
    def delete(self, k):
        self.put(k, TOMB)
    def get(self, k):
        for source in [self.mem] + [dict(r) for r in self.runs]:
            if k in source:
                v = source[k]
                return None if v is TOMB else v
        return None
    def compact(self):
        merged = {}
        for run in reversed(self.runs):      # oldest first, newer overwrite
            merged.update(run)
        self.runs = [sorted((k, v) for k, v in merged.items() if v is not TOMB)]

db = LSM(memcap=2)
db.put("a", 1); db.put("b", 2)                # flush -> run 1
db.put("a", 10); db.delete("b")               # flush -> run 2
db.put("c", 3)
print(len(db.runs), db.get("a"), db.get("b"), db.get("c"))
db.compact()
print(db.runs, db.get("a"))
```

The real thing merges runs with a streaming k-way merge (`heapq.merge`) instead of a dictionary, writes each run as a bottom-up B+-tree or sorted table with a Bloom filter, and logs memtable inserts so a crash loses nothing. The merges themselves need no logging, because their inputs stay on disk until the output is complete.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- Clustering index: file sorted on its key, one per relation. Secondary: dense, one random I/O per match.
- Composite keys are lexicographic: equality on a prefix plus a range on the next column.
- B+-tree: internal ⌈n/2⌉..n children, leaves ⌈(n−1)/2⌉..n−1 keys, height ≤ ⌈log⌈n/2⌉ K⌉.
- Leaf split copies the key up; internal split moves it up. Merge pulls the separator down; redistribution rotates it.
- Random inserts: about 2/3 full. Sorted inserts: 1/2. Bulk load bottom-up, and leave free space.
- Secondary indices on a B+-tree file store the primary key, so splits stay cheap.
- Hashing: equality only; extendable hashing doubles the directory, not the buckets. B+-trees dominate in practice.
- LSM: memtable → sorted runs → merges; sequential writes, tombstones for deletes, lookups check every level. Stepped merge trades read cost for write cost.
- Bloom filter: no false negatives; about 1% false positives at 10 bits per key with k ≈ 7.
- Bitmaps: one per value, AND/OR a word at a time, tiny for low-cardinality columns.
- R-tree search follows every overlapping child. HNSW: random levels with P(≥L) = 1/k^L, greedy descent.
