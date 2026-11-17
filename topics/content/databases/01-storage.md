---
title: Storage, files and the buffer manager
part: Part A · Storage
lede: Everything a database does sits on top of moving blocks between disk and memory. This chapter covers the storage hierarchy, disk and SSD performance, RAID and its failure arithmetic, how records are laid out in pages, how the buffer manager decides what stays in memory, and why analytics systems store columns instead of rows.
desc: hierarchy, disk access time, SSD and FTL, RAID levels and MTTDL, latent sector failures, fixed and variable records, slotted pages, TOAST, file organizations, buffer replacement, column stores
hours: 3
prereqs: basic OS ideas (pages, caching), binary XOR
---

## The storage hierarchy {#ch01-hierarchy .th}

A database keeps its data on nonvolatile storage and works on it in memory. The gap between the levels is the reason for almost every design decision in this guide. These are rough orders of magnitude:

| Level | Access time | Unit | Survives power loss |
|---|---|---|---|
| CPU cache | 1–5 ns | cache line | no |
| Main memory | 60–100 ns | cache line | no |
| Flash SSD | 20–100 µs read | page (4 KB) | yes |
| Magnetic disk | 5–10 ms | block (4–16 KB) | yes |
| Tape | seconds to minutes | sequential | yes |

Three kinds of storage matter for recovery later. **Volatile** storage (memory) loses its contents on a crash. **Nonvolatile** storage (disk, flash) survives a crash but can still fail. **Stable** storage is an ideal that never loses data, approximated by keeping copies on independent media, such as RAID plus a remote copy.

### Magnetic disks

A read on a disk is **seek** (move the arm to the track, typically 4–10 ms, average about half the worst case) plus **rotational latency** (wait for the sector, on average half a rotation) plus **transfer**. A disk does roughly 50–200 random block reads per second, but streams 25–200 MB/s sequentially. That gap, a factor of hundreds, is why databases prefer sequential I/O and why every cost formula in Chapter 3 counts seeks separately from transfers.

```python run=db-c01-disk
rpm, avg_seek_ms, track_to_track_ms = 10_000, 10, 2
sectors_per_track = 250
rotation_ms = 60_000 / rpm
latency_ms = rotation_ms / 2
sector_ms = rotation_ms / sectors_per_track
n = 1500
random_ms = n * (avg_seek_ms + latency_ms + sector_ms)
tracks = n / sectors_per_track
seq_ms = avg_seek_ms + latency_ms + n * sector_ms + tracks * track_to_track_ms
print(f"rotation {rotation_ms} ms, avg latency {latency_ms} ms, sector {sector_ms:.4f} ms")
print(f"1500 random reads {random_ms/1000:.2f} s, 1500 sequential reads {seq_ms:.2f} ms, ratio {random_ms/seq_ms:.0f}x")
```

### Flash and SSDs

NAND flash reads a page in tens of microseconds, with little difference between random and sequential reads. A page can be written only once before it is erased, and erasing works on a whole **erase block** (128–256 pages) and takes milliseconds. The **flash translation layer** (FTL) hides this: an update writes to an already-erased page and remaps the logical page number, so an update costs about a write, not an erase. Blocks wear out after thousands to around 100,000 erases, so **wear levelling** spreads erases across blocks.

SSDs also serve many requests at once. "QD-32" means 32 outstanding requests, and an NVMe drive can reach hundreds of thousands of IOPS that way, against about 10,000 with one request at a time. A query plan that issues one I/O, waits, then issues the next leaves most of that throughput unused. Chapter 3 shows how indexed nested loops join can batch its lookups to use it.

## RAID {#ch01-raid .th}

With many disks, failures become routine. If one disk has a mean time to failure (MTTF) of 100,000 hours, a system of 100 such disks loses a disk about every 1,000 hours (41 days). RAID uses redundancy so that a single failure loses no data.

**Mirroring** keeps two copies. Data is lost only if the second disk fails while the first is being repaired. With independent failures, the mean time to data loss is `MTTF² / (2 × MTTR)`:

```python run=db-c01-mttdl
mttf, mttr = 100_000, 10
mttdl = mttf**2 / (2 * mttr)
print(f"{mttdl:.0f} hours = {mttdl / 24 / 365:,.0f} years")
afr = 365 * 24 / 1_200_000 * 100
print(f"annual failure rate at MTTF 1,200,000 h: {afr:.2f}%")
```

That figure ignores correlated failures (same batch, same power event), which is why real systems are more careful than the formula suggests.

**Striping** spreads blocks across disks. With n disks, block i goes to disk `(i mod n) + 1`, so small requests run on different disks in parallel and a large request uses all of them.

**Parity** stores the XOR of a stripe's data blocks. If any one block is lost, XOR of all the others rebuilds it:

```python run=db-c01-parity
d1, d2, d3 = 0b1010, 0b0110, 0b0011
p = d1 ^ d2 ^ d3
rebuilt = d1 ^ d3 ^ p                    # disk 2 died
print(f"parity {p:04b}, rebuilt d2 {rebuilt:04b}, correct: {rebuilt == d2}")
```

| Level | Scheme | Small write cost | Use |
|---|---|---|---|
| 0 | striping, no redundancy | 1 write | data you can lose |
| 1 (1+0) | mirroring plus striping | 2 writes | logs, write-heavy OLTP |
| 4 | block parity on one disk | 2 reads + 2 writes | not used: parity disk is a bottleneck |
| 5 | block parity spread over all disks | 2 reads + 2 writes | read-heavy, large sequential writes |
| 6 | two parity blocks (P+Q) | 3 reads + 3 writes | large arrays, protection against two failures |

A small write on RAID 5 reads the old data and old parity, then writes the new data and `new parity = old parity ⊕ old data ⊕ new data`. A large sequential write fills whole stripes and computes parity from the new data alone, which is why RAID 5 suits it.

:::key Why RAID 6 when RAID 5 already survives one failure
A **latent sector failure** is a sector that went bad without anyone noticing, because nothing has read it since it was written. When a disk dies in RAID 5, rebuilding it reads every other disk in full. If one of those has a latent bad sector, that stripe now has two missing blocks and its data is lost. RAID 6 survives two failures, so a dead disk plus a latent bad sector loses nothing. **Data scrubbing** (reading everything periodically) finds latent failures early.
:::

Hardware RAID controllers keep a small nonvolatile RAM to record writes in progress. Without it, a power failure between writing a data block and its parity leaves the stripe inconsistent, and finding such stripes means scanning everything.

## Records and pages {#ch01-records .th}

### Fixed and variable-length records

With fixed-length records, record i lives at byte `n × (i − 1)`. Deleting one leaves a hole, which is best tracked on a **free list** threaded through the empty slots rather than by shifting records.

A variable-length record stores its fixed-size attributes first, then an `(offset, length)` pair for each variable attribute, then the variable data, plus a **null bitmap** with one bit per attribute.

### The slotted page

Records in a page move as they grow, shrink or get compacted, yet indices and other records need a stable way to refer to them. The **slotted page** solves this with one level of indirection. The page header holds the number of entries, the end of free space, and a slot array of `(offset, length)` per record. Records grow from the end of the page towards the header. A record ID is `(page number, slot number)`, and moving a record inside the page changes only its slot entry.

```python run=db-c01-slotted
class SlottedPage:
    def __init__(self, size=128):
        self.size, self.data, self.slots = size, bytearray(size), []
        self.free_end = size                    # records are packed at the end
    def free_space(self):
        header = 8 + 4 * (len(self.slots) + 1)  # count, free_end, one more slot
        return self.free_end - header
    def insert(self, rec: bytes):
        if len(rec) > self.free_space():
            return None
        self.free_end -= len(rec)
        self.data[self.free_end:self.free_end + len(rec)] = rec
        self.slots.append((self.free_end, len(rec)))
        return len(self.slots) - 1             # slot number is the stable id
    def get(self, slot):
        off, ln = self.slots[slot]
        return bytes(self.data[off:off + ln]) if ln else None
    def delete(self, slot):
        self.slots[slot] = (0, 0)
    def compact(self):                          # move records, update slots only
        end = self.size
        for i, (off, ln) in sorted(enumerate(self.slots), key=lambda s: -s[1][0]):
            if ln:
                rec = bytes(self.data[off:off + ln])
                end -= ln
                self.data[end:end + ln] = rec
                self.slots[i] = (end, ln)
        self.free_end = end

p = SlottedPage()
ids = [p.insert(s.encode()) for s in ["alice", "bob", "carol-the-long-name", "dave"]]
p.delete(ids[1]); p.delete(ids[2])
before = p.free_space(); p.compact()
print(ids, p.get(ids[3]), before, "->", p.free_space())
```

After the compaction, record 3 is still record 3 even though its bytes moved.

### Large objects

A record must fit in a page, so large values (`blob`, `clob`) are stored elsewhere: in files the database manages, or broken into pieces. PostgreSQL's **TOAST** breaks a large value into page-sized chunks and stores them in a separate relation, keyed by an ID for the value and a chunk sequence number. The main tuple keeps only a pointer, so scans that do not touch the large column stay fast.

## File organizations {#ch01-files .th}

| Organization | Idea | Notes |
|---|---|---|
| Heap | a record goes anywhere there is space | needs a free-space map |
| Sequential | ordered by a search key | overflow blocks on insert, periodic reorganization |
| Multitable clustering | related records of several relations share a block | fast `department ⋈ instructor`, slow scan of one relation |
| B+-tree file | records stored in the leaves of a B+-tree | stays ordered under inserts (Chapter 2) |
| Hash | block chosen by a hash of the key | Chapter 2 |

A **free-space map** keeps a few bits per block saying roughly how full it is, with a second level holding the maximum of each group so a search can skip whole groups. It is written to disk only now and then, so entries can be stale; the system detects and fixes that when it uses them.

**Table partitioning** splits a relation into smaller relations, for example by year. A query with `year = 2026` reads one partition, and old partitions can sit on cheaper storage.

The **data dictionary** (catalog) stores relation and attribute names and types, constraints, indices, users and statistics. It is itself stored in relations, and kept in memory while the system runs.

## The buffer manager {#ch01-buffer .th}

The buffer manager owns a pool of page frames in memory. When a block is requested: if it is in the pool, return its address; otherwise pick a victim frame, write it back if it is dirty, read the new block, and return its address.

- **Pinning**: a page being used cannot be evicted. Callers pin before access and unpin after. With concurrency, keep a pin count and evict only at zero.
- **Buffer locks** (latches): shared to read a page, exclusive to change it, so nobody sees a record halfway through a move.
- **Forced output**: the recovery system sometimes requires a block to be written now (Chapter 7).

### Why LRU is the wrong policy for some queries

LRU guesses that recently used pages will be used again. A nested loops join rescans the inner relation from the start for every outer tuple. If the inner relation is one block bigger than the pool, LRU evicts exactly the block that will be needed next, and every access misses. **MRU** evicts the most recently used block, which in a cyclic scan is the one needed furthest in the future.

```python run=db-c01-lru-mru
def misses(policy, frames, refs):
    pool, n = [], 0                      # pool[-1] is most recently used
    for b in refs:
        if b in pool:
            pool.remove(b)
        else:
            n += 1
            if len(pool) == frames:
                pool.pop(0 if policy == "LRU" else -1)
        pool.append(b)
    return n

inner = list("abcd")                     # inner relation: 4 blocks
refs = inner * 10                        # rescanned for 10 outer tuples
for frames in (3, 4):
    print(frames, "frames:", {p: misses(p, frames, refs) for p in ("LRU", "MRU")})
```

With 3 frames, LRU misses on all 40 accesses, while MRU keeps most of the inner relation resident. Once the inner relation fits, both are equal. A database knows its access patterns, so it can use **toss-immediate** (free a block as soon as its last tuple is processed) or MRU for such scans, and keep catalog pages always resident. PostgreSQL uses a small ring buffer for large sequential scans so one scan cannot flush the whole pool.

:::tip Why the database does not just use the OS page cache
The OS does not know which pages are dirty with respect to the log, so it may write a page before its log record reaches disk, breaking write-ahead logging (Chapter 7). If the buffer pool lives in virtual memory, the OS may swap out a dirty database page; the database must then read it back from swap only to write it to the database file, the **dual paging** problem.
:::

## Column stores {#ch01-columns .th}

A row store keeps each tuple together, which suits transaction processing: fetch or update one customer. A **column store** keeps each attribute in its own file, which suits analytics: `select avg(price) from sales where year = 2026` reads two columns out of perhaps fifty.

| Benefits of columnar | Drawbacks |
|---|---|
| reads only the columns the query uses | rebuilding a full row reads from many places |
| compresses well: one column has one type and often repeated values | inserts, updates and deletes touch many files |
| better cache use: every byte fetched is useful | decompression costs CPU |
| enables vector (SIMD) processing | |

```python run=db-c01-columnar
import random, zlib
random.seed(1)
rows = [(i, random.choice(["IN", "US", "JP", "DE"]), random.randint(1, 5)) for i in range(20_000)]
row_bytes = "".join(f"{i},{c},{r};" for i, c, r in rows).encode()
ids = [r[0] for r in rows]
cols = [
    ",".join(str(b - a) for a, b in zip([0] + ids, ids)).encode(),   # delta-encode a sorted column
    "".join(r[1] for r in rows).encode(),
    "".join(str(r[2]) for r in rows).encode(),
]
print("row store, compressed:   ", len(zlib.compress(row_bytes)))
print("column store, compressed:", sum(len(zlib.compress(c)) for c in cols))
print("bytes read for avg(rating), columnar:", len(zlib.compress(cols[2])))
```

Each column holds one type, so it can use its own encoding: the sorted ID column becomes a run of 1s after delta encoding, and the country column is four values over and over. The column layout comes out several times smaller, and a query on one column reads only that column's bytes. File formats such as **Parquet** and **ORC** store data in column chunks within row groups, so a reader can skip both unneeded columns and row groups whose min/max statistics rule them out. Hybrid systems keep recent data in a row format for fast updates and convert it to columns in the background.

## Drills: storage {#ch01-drills .dr}

:::drill concept
A disk spins at 7,200 rpm and has an average seek of 8 ms. Estimate the time for one random 4 KB read and the number of random reads per second, ignoring transfer time.
---
```python run=db-c01-d-iops
rotation = 60_000 / 7200
t = 8 + rotation / 2
print(round(rotation, 2), round(t, 2), round(1000 / t))
```

**Why.** Average rotational latency is half a rotation, 4.17 ms. About 12 ms per random read gives roughly 80 per second.
:::

:::drill tricky
Why is RAID 6 preferred over RAID 5 for large arrays, with latent sector failures in mind?
---
**Answer.** A latent sector failure is damage nobody has noticed yet. When one disk in RAID 5 fails, rebuilding reads all the others, and a latent bad sector on any of them means that stripe has lost two blocks, so data is lost. RAID 6 tolerates two failures in a stripe, so it survives a dead disk plus a latent failure. Larger disks take longer to rebuild and hold more sectors that might be bad, so the case grows with disk size.
:::

:::drill concept
On RAID 5 with 5 disks, how many I/Os does updating one block take, and why? What about RAID 1?
---
**Answer.** RAID 5: read old data and old parity, compute new parity = old parity ⊕ old data ⊕ new data, write new data and new parity, so 2 reads and 2 writes. RAID 1: write both copies, 2 writes. That difference is why logs and write-heavy tables go on RAID 1.
:::

:::drill output
Three data blocks are `0110`, `1011` and `0001`. What is the parity, and if the second disk dies, what is rebuilt?
---
```python run=db-c01-d-parity
a, b, c = 0b0110, 0b1011, 0b0001
p = a ^ b ^ c
print(f"{p:04b} {a ^ c ^ p:04b}")
```
:::

:::drill concept
A system has 1,000 disks, each with MTTF 1,200,000 hours. How often does a disk fail?
---
```python run=db-c01-d-mttf
h = 1_200_000 / 1000
print(h, "hours =", h / 24, "days;", round(365 * 24 / h, 1), "failures a year")
```
:::

:::drill concept
Why does an SSD update take about 100 µs when an erase takes milliseconds?
---
**Answer.** The flash translation layer writes the new version to a page that was erased earlier, and remaps the logical page number to it. The old page is marked invalid and erased later in the background, a whole erase block at a time, after copying out any valid pages (garbage collection).
:::

:::drill tricky
Why does a slotted page store `(offset, length)` in a header array instead of letting other structures point straight at the record bytes?
---
**Answer.** Records move within the page when the page is compacted or a record grows. With the slot array, a record ID `(page, slot)` stays valid and only the slot entry changes. Direct byte pointers would all need updating on every move, and some of them live in other pages and indices.
:::

:::drill concept
How does PostgreSQL store an attribute value larger than a page?
---
**Answer.** TOAST: the value is compressed if possible, then split into chunks that fit in a page, stored as rows of a separate TOAST relation with the value's ID and a chunk sequence number. The main tuple holds a pointer to the value. Queries that do not read that attribute never touch the TOAST relation.
:::

:::drill output
An inner relation of 5 blocks is scanned 4 times in a row (`abcde` four times). How many misses with 4 frames under LRU and under MRU?
---
```python run=db-c01-d-mru
def misses(policy, frames, refs):
    pool, n = [], 0
    for b in refs:
        if b in pool:
            pool.remove(b)
        else:
            n += 1
            if len(pool) == frames:
                pool.pop(0 if policy == "LRU" else -1)
        pool.append(b)
    return n
refs = list("abcde") * 4
print(misses("LRU", 4, refs), misses("MRU", 4, refs))
```

**Why.** LRU always throws out the block needed next, so every one of the 20 accesses misses. MRU keeps a fixed set of blocks resident and misses only about once per scan after the first.
:::

:::drill concept
Give two benefits of columnar storage for storage and query processing, and one drawback for row retrieval.
---
**Answer.** Better compression (one type per column, many repeats), so less storage and I/O. Analytic queries read only the columns they use, saving I/O and cache space. Drawback: fetching a whole row reads from as many places as there are columns, so point lookups and updates of full rows cost more.
:::

:::drill tricky
Why do columnar layouts cause fewer CPU cache misses for a query like `sum(price)`?
---
**Answer.** In a row layout each cache line brings in neighbouring attributes the query never uses, so most bytes fetched are wasted. In a column layout every byte of every fetched line is a price, and sequential access lets the hardware prefetcher stay ahead.
:::

:::drill concept
What problem does multitable clustering solve, and what does it make worse?
---
**Answer.** It stores each department record next to its instructors, so `department ⋈ instructor` on one department reads one block. A scan of `department` alone is slower, because its records are spread across many blocks among instructor records, and records have mixed sizes.
:::

:::drill concept
A buffer manager evicts a dirty page. What must happen first, according to write-ahead logging?
---
**Answer.** All log records describing changes to that page must be on stable storage before the page is written. Otherwise a crash could leave an uncommitted change on disk with no log record to undo it.
:::

:::drill tricky
Why do database systems often avoid the OS file cache (for example with `O_DIRECT`) or limit it?
---
**Answer.** Double caching wastes memory (the same page in the buffer pool and the OS cache). More importantly the database must control write order for write-ahead logging and know when a write is durable, and it knows access patterns (scans, joins) that a generic LRU does not.
:::

:::drill concept
Which RAID level for: a transaction log, a data warehouse loaded nightly in bulk, scratch space for sorting?
---
**Answer.** Log: RAID 1, since every commit is a small sequential write and mirroring gives the cheapest small writes. Warehouse: RAID 5 or 6, since writes are large and sequential and reads dominate, and parity uses less space than mirroring. Sort scratch: RAID 0, since the data can be regenerated and speed is all that matters.
:::

## Write the code {#ch01-coding .cd}

:::drill code
Write a free-space map: one byte per block giving free space in eighths, plus a second level with the maximum of each group of 4 entries. `find(need)` should return a block with at least `need` eighths free, skipping groups whose maximum is too small.
---
```python run=db-c01-c-fsm
class FreeSpaceMap:
    def __init__(self, free_eighths, group=4):
        self.leaf, self.group = list(free_eighths), group
        self.top = [max(self.leaf[i:i + group]) for i in range(0, len(self.leaf), group)]
    def update(self, block, eighths):
        self.leaf[block] = eighths
        g = block // self.group
        self.top[g] = max(self.leaf[g * self.group:(g + 1) * self.group])
    def find(self, need):
        for g, m in enumerate(self.top):
            if m >= need:                                # only now look inside the group
                for b in range(g * self.group, min((g + 1) * self.group, len(self.leaf))):
                    if self.leaf[b] >= need:
                        return b
        return None

fsm = FreeSpaceMap([0, 1, 0, 2, 1, 1, 0, 0, 7, 3, 0, 1])
print(fsm.top, fsm.find(3), fsm.find(8))
fsm.update(8, 0)
print(fsm.top, fsm.find(3))
```

The real PostgreSQL map is a tree of such levels stored in its own fork of the relation. Stale entries are fine, because the inserter checks the page and corrects the map if the page turns out to be full.
:::

:::drill code
Write a buffer pool with pin counts and a clock (second-chance) replacement policy. A pinned page must never be evicted.
---
```python run=db-c01-c-clock
class BufferPool:
    def __init__(self, nframes):
        self.frames = [None] * nframes          # page id per frame
        self.pins = [0] * nframes
        self.ref = [False] * nframes
        self.where, self.hand, self.reads = {}, 0, 0
    def pin(self, page):
        if page in self.where:
            f = self.where[page]
        else:
            f = self._victim()
            if self.frames[f] is not None:
                del self.where[self.frames[f]]  # a dirty page would be written here
            self.frames[f], self.where[page] = page, f
            self.reads += 1
        self.pins[f] += 1
        self.ref[f] = True
        return f
    def unpin(self, page):
        self.pins[self.where[page]] -= 1
    def _victim(self):
        for _ in range(2 * len(self.frames) + 1):
            f = self.hand
            self.hand = (self.hand + 1) % len(self.frames)
            if self.frames[f] is None:
                return f
            if self.pins[f] == 0:
                if not self.ref[f]:
                    return f
                self.ref[f] = False             # second chance
        raise RuntimeError("all frames pinned")

bp = BufferPool(3)
for p in "ABC":
    bp.pin(p); bp.unpin(p)
bp.pin("A")                                     # keep A pinned
bp.pin("D"); bp.unpin("D")
print(bp.frames, bp.reads)
try:
    bp.pin("E"); bp.pin("F"); bp.pin("G")
except RuntimeError as e:
    print("error:", e)
```

The clock hand clears reference bits on its first pass and evicts the first unpinned frame whose bit is already clear. When every frame is pinned there is no legal victim, which a real system reports as "no unpinned buffers available".
:::

## Cheat sheet {#ch01-cheatsheet .th}

- Disk access = seek + rotational latency (half a rotation on average) + transfer. Random reads: about 100 per second. Sequential: hundreds of MB/s.
- SSD: page reads in tens of µs; erase-before-write hidden by the FTL remapping; wear levelling; many requests in flight (QD-n).
- Mirroring MTTDL = MTTF² / (2·MTTR), assuming independent failures.
- RAID 5 small write: 2 reads + 2 writes. RAID 1: 2 writes. RAID 6 survives two failures, which covers a disk loss plus a latent sector failure.
- Slotted page: header with slot array `(offset, length)`, records packed from the end. Record ID = (page, slot).
- Large values: separate storage in chunks (TOAST), with a pointer in the tuple.
- Heap files need a free-space map; sequential files need reorganization; clustering helps joins and hurts scans.
- Buffer manager: pin counts, latches, forced output. LRU fails on cyclic scans; MRU or toss-immediate fit them.
- Columnar: read only needed columns, better compression and cache use; costly row reconstruction and updates. Parquet and ORC are columnar file formats.
