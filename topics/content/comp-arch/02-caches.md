---
title: Caches and cache-friendly code
part: Part B · Memory
lede: Many slow programs are slow because they wait for memory. This chapter covers how a cache finds a line, how to split an address into tag, index and offset by hand, what replacement and write policies do, how to compute AMAT, why the TLB matters, and how loop order and data layout decide your miss rate.
desc: hierarchy, lines, associativity, tag/index/offset, replacement, write policies, AMAT, TLB, AoS vs SoA, loop order, blocking
hours: 3
prereqs: pointers and arrays in C, virtual memory basics, Chapter 1 for CPI
---

## The hierarchy {#ch02-hierarchy .th}

DRAM is far slower than the processor, and fast memory has to be small. So a modern machine keeps several levels of cache and relies on **locality**: programs tend to reuse recent data (temporal) and touch data near recent data (spatial). These figures are rough orders of magnitude and vary a lot between processors, so say "roughly" when you quote them:

| Level | Rough size | Rough latency |
|---|---|---|
| L1 | tens of KB per core | about 1 ns, a few cycles |
| L2 | hundreds of KB to a few MB | a few ns, around 10 to 20 cycles |
| L3 | several MB and up, usually shared | tens of ns |
| DRAM | GB | around 100 ns |
| SSD | TB | tens of microseconds and up |

The C++ guide's chapter on [cache-friendly allocation](../../guide/#ch19) covers contiguous containers, hot/cold splitting, struct padding and allocation patterns. This chapter covers the hardware rules and the numericals behind them.

You can see the levels by chasing pointers through a random cycle. Each load depends on the one before, and random order defeats the prefetcher:

```cpp run=ca-c02-chase nondet
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <utility>
#include <vector>
struct Node { Node* next; char pad[56]; };

static double ns_per_load(size_t bytes) {
    size_t n = bytes / sizeof(Node);
    std::vector<Node> v(n);
    std::vector<size_t> perm(n);
    for (size_t i = 0; i < n; i++) perm[i] = i;
    uint64_t s = 12345;
    for (size_t i = n - 1; i > 0; i--) {        // Sattolo's shuffle: one big cycle
        s = s * 6364136223846793005ULL + 1442695040888963407ULL;
        std::swap(perm[i], perm[(s >> 33) % i]);
        v[i].next = &v[perm[i]];
    }
    v[0].next = &v[perm[0]];
    Node* p = &v[0];
    for (size_t i = 0; i < n; i++) p = p->next;  // warm up
    const long steps = 4'000'000;
    auto t = std::chrono::steady_clock::now();
    for (long i = 0; i < steps; i++) p = p->next;
    Node* volatile sink = p; (void)sink;       // without this store, GCC moves the loop past the timer
    double sec = std::chrono::duration<double>(std::chrono::steady_clock::now() - t).count();
    return sec * 1e9 / steps;
}
int main() {
    double base = ns_per_load(16 << 10);
    for (size_t kb : {16, 256, 4096, 65536})
        printf("%6zu KB working set: %5.1fx the 16 KB cost per load\n", kb, ns_per_load(kb << 10) / base);
}
```

The cost per load usually climbs in steps as the working set outgrows each level, and the largest set is commonly tens of times slower than the smallest. TLB misses add to the large sizes too.

## Lines, sets and the address split {#ch02-address .th}

A cache moves whole **lines** (commonly 64 bytes). It is organised as `sets`, each holding `ways` lines, so:

`sets = cache size / (ways × line size)`

An address divides into three fields:

- **Offset**: `log2(line size)` low bits, the byte within the line.
- **Index**: `log2(sets)` next bits, which set to look in.
- **Tag**: all remaining bits, compared against every way in that set.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 250" role="img" aria-label="A 48-bit physical address split into a 36-bit tag, 6-bit index and 6-bit offset. The index selects one of 64 sets. The tag is compared with all 8 ways of that set.">
  <text x="30" y="24" class="t-small">48-bit address, for a 32 KB, 8-way cache with 64-byte lines</text>
  <rect x="30" y="34" width="400" height="38" class="d-soft"/><text x="230" y="58" text-anchor="middle" class="t-mono">tag: 36 bits [47:12]</text>
  <rect x="430" y="34" width="130" height="38" class="d-acc"/><text x="495" y="58" text-anchor="middle" class="t-mono">index: 6 [11:6]</text>
  <rect x="560" y="34" width="130" height="38" class="d-key"/><text x="625" y="58" text-anchor="middle" class="t-mono">offset: 6 [5:0]</text>
  <text x="30" y="118" class="t-small">set 0</text><text x="30" y="154" class="t-small">set i</text><text x="30" y="190" class="t-small">set 63</text>
  <rect x="80" y="100" width="130" height="28" class="d-soft"/><rect x="214" y="100" width="130" height="28" class="d-soft"/><text x="360" y="118" class="t-mono">…</text><rect x="390" y="100" width="130" height="28" class="d-soft"/>
  <rect x="80" y="136" width="130" height="28" class="d-acc"/><text x="145" y="155" text-anchor="middle" class="t-mono">tag | 64 B</text><rect x="214" y="136" width="130" height="28" class="d-acc"/><text x="279" y="155" text-anchor="middle" class="t-mono">tag | 64 B</text><text x="360" y="154" class="t-mono">…</text><rect x="390" y="136" width="130" height="28" class="d-acc"/><text x="455" y="155" text-anchor="middle" class="t-mono">tag | 64 B</text>
  <rect x="80" y="172" width="130" height="28" class="d-soft"/><rect x="214" y="172" width="130" height="28" class="d-soft"/><text x="360" y="190" class="t-mono">…</text><rect x="390" y="172" width="130" height="28" class="d-soft"/>
  <path d="M495 72 L 495 86 L 540 86 L 540 150 L 520 150" class="d-line-acc"/>
  <text x="550" y="146" class="t-small t-acc">index picks the set</text>
  <text x="550" y="164" class="t-small">tags of all 8 ways are</text><text x="550" y="180" class="t-small">compared in parallel</text>
  <text x="80" y="226" class="t-small">Hit: a valid way has a matching tag, and the offset selects the bytes. Miss: fetch the whole line, evicting one way.</text>
</svg></div><figcaption><b>Finding a line.</b> Sets = 32768 / (8 × 64) = 64, so the index takes 6 bits. The tag is what remains. A virtual address has the same offset and index bits here, which matters for the point below.</figcaption></figure>

```python run=ca-c02-split
from math import log2

def split(size, ways, line, addr_bits):
    sets = size // (ways * line)
    off, idx = int(log2(line)), int(log2(sets))
    return sets, off, idx, addr_bits - idx - off

print("32 KB 8-way 64 B, 48 bits:", split(32 << 10, 8, 64, 48))
print(" 1 MB 16-way 64 B, 48 bits:", split(1 << 20, 16, 64, 48))

addr, off, idx = 0x4ABCD, 6, 6
print(hex(addr), "offset", addr & 63, "index", (addr >> off) & 63, "tag", hex(addr >> (off + idx)))
```

**Why L1 caches are often 8 ways of 4 KB.** L1 is commonly *virtually indexed, physically tagged* (VIPT). With 4 KB pages the low 12 bits of an address do not change in translation. If index and offset fit in those 12 bits, the set can be read while the TLB translates, and there is no aliasing between virtual names for the same physical line. 32 KB / 8 ways = 4 KB per way, which fits exactly. Growing L1 under this scheme means adding ways or using other tricks.

## Associativity and the three Cs {#ch02-assoc .th}

- **Direct-mapped** (1 way): fast and simple, but two hot lines with the same index evict each other.
- **Set-associative** (N ways): the usual compromise.
- **Fully associative** (1 set): no conflicts, but every tag must be compared. Used for small structures such as some TLBs.

Misses come in three kinds, the **three Cs**:

- **Cold** (compulsory): first access to a line. Larger lines or prefetching help.
- **Capacity**: the working set is larger than the cache. A larger cache or less data helps.
- **Conflict**: enough total room, but too many lines map to one set. More ways help.

Coherence misses are a fourth kind on multicore machines ([Chapter 3](#ch03)).

```python run=ca-c02-assoc
class Cache:
    def __init__(self, size, ways, line=64):
        self.line, self.ways, self.nsets = line, ways, size // (ways * line)
        self.sets = [[] for _ in range(self.nsets)]
        self.hits = self.misses = 0
    def access(self, addr):
        block = addr // self.line
        s = self.sets[block % self.nsets]
        if block in s:
            s.remove(block); s.append(block); self.hits += 1     # most recent is last
        else:
            if len(s) == self.ways: s.pop(0)                     # evict the oldest
            s.append(block); self.misses += 1

trace = [0x0000, 0x8000] * 500          # two addresses 32 KB apart
for ways in (1, 2):
    c = Cache(32 << 10, ways)
    for a in trace: c.access(a)
    print(f"{ways}-way: {c.hits} hits, {c.misses} misses")
```

The two addresses are the same distance apart as the size of the cache, so with one way they fight over a set forever. With two ways they coexist.

## Replacement and write policies {#ch02-policies .th}

**Replacement** picks the victim when a set is full. LRU evicts the least recently used way. Exact LRU is costly at high associativity, so hardware often uses pseudo-LRU. Random is cheap and has no worst-case pattern to fall into:

```python run=ca-c02-replace
import random
rng = random.Random(1)

def run(policy, ways=4, n=5, rounds=1000):
    s, hits = [], 0
    for _ in range(rounds):
        for b in range(n):
            if b in s:
                hits += 1
                if policy == "LRU": s.remove(b); s.append(b)
            else:
                if len(s) == ways: s.pop(rng.randrange(ways) if policy == "random" else 0)
                s.append(b)
    return hits

for p in ("LRU", "FIFO", "random"):
    print(f"{p:7} {run(p)} hits of 5000")
```

Cycling through one more line than the set holds gives LRU and FIFO zero hits, since each evicts exactly the line needed next. Random still hits sometimes. This is why "LRU is always best" is a wrong answer.

**Writes** involve two separate choices.

| On a write hit | Behaviour | Trade-off |
|---|---|---|
| Write-through | Update the cache and the next level | Simple, next level always current, lots of traffic; needs a write buffer |
| Write-back | Update the cache only and set a dirty bit; write the line out on eviction | Far less traffic, but evictions can be slower and lines need dirty state |

| On a write miss | Behaviour | Usually paired with |
|---|---|---|
| Write-allocate | Fetch the line, then write it | Write-back |
| No-write-allocate | Write to the next level only | Write-through |

## AMAT {#ch02-amat .th}

Average memory access time is the one formula you must know, and it nests:

`AMAT = hit time + miss rate × miss penalty`

The miss penalty of L1 is the AMAT of L2. Keep **local** miss rate (misses per access reaching this level) separate from **global** miss rate (misses per access by the CPU).

```python run=ca-c02-amat
l1_hit, l1_miss = 1, 0.05
l2_hit, l2_local = 10, 0.20
mem = 100
l2_amat = l2_hit + l2_local * mem
amat = l1_hit + l1_miss * l2_amat
print("L2 AMAT", l2_amat, "total AMAT", round(amat, 3), "L2 global miss rate", round(l1_miss * l2_local, 4))

# Stalls in CPI: base 1, 1.3 memory accesses per instruction, 2% miss, 100 cycle penalty
cpi = 1 + 1.3 * 0.02 * 100
print("CPI", round(cpi, 3), "stall share", round((cpi - 1) / cpi * 100, 1), "%")
```

A 2% miss rate looks harmless and here costs most of the running time. That is the key message for an interview.

## The TLB {#ch02-tlb .th}

Every virtual address must be translated, and a page-table walk needs several memory accesses (four levels on typical x86-64 and ARMv8 setups). The **TLB** caches recent translations. **TLB coverage** is entries × page size: 64 entries of 4 KB covers only 256 KB, so a program that touches a few MB at random can miss constantly even when its data is in cache. Huge pages (2 MB) raise coverage by a factor of 512 and shorten the walk. Context switches used to flush the TLB, and address-space tags (ASID, PCID) now limit that cost. The C++ guide's chapter 19 has a section on TLB and huge pages in practice.

## Cache-friendly code {#ch02-friendly .th}

### Loop order

C stores 2D arrays in row-major order.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 190" role="img" aria-label="A row-major array laid out in memory as consecutive cache lines. A row walk moves through neighbouring elements in one line. A column walk jumps one full row per access and lands in a different line each time.">
  <text x="20" y="22" class="t-small">row-major layout in memory: row 0, then row 1, then row 2</text>
  <rect x="20" y="34" width="220" height="40" class="d-acc"/><text x="130" y="59" text-anchor="middle" class="t-mono">row 0</text><rect x="240" y="34" width="220" height="40" class="d-soft"/><text x="350" y="59" text-anchor="middle" class="t-mono">row 1</text><rect x="460" y="34" width="220" height="40" class="d-soft"/><text x="570" y="59" text-anchor="middle" class="t-mono">row 2</text>
  <path d="M30 88 L 228 88" class="d-line-key"/><polygon points="236,88 228,84 228,92" class="d-fill-key"/><text x="30" y="106" class="t-small t-key">row walk: small steps, many hits in each line</text>
  <path d="M30 128 C 110 150, 170 150, 250 128" class="d-line-trap"/><polygon points="250,128 241,129 245,136" class="d-fill-trap"/><path d="M250 128 C 330 150, 390 150, 470 128" class="d-line-trap"/><polygon points="470,128 461,129 465,136" class="d-fill-trap"/>
  <text x="30" y="172" class="t-small t-trap">column walk: every access jumps one full row, usually a new line and possibly a new page</text>
</svg></div><figcaption><b>Same elements, different walk.</b> Both loops touch every element once. Only the row walk gets to reuse each line it fetches.</figcaption></figure>

Walking along a row uses each line many times, and walking along a column jumps a full row on each access. This simulator counts the misses for both walks of a 256×256 array of doubles on a 32 KB, 8-way cache, and the matrix multiply used in the blocking section below on a 4 KB, 4-way cache:

```python run=ca-c02-sim
class Cache:
    def __init__(self, size, ways, line=64):
        self.line, self.ways, self.nsets = line, ways, size // (ways * line)
        self.sets = [[] for _ in range(self.nsets)]
        self.misses = 0
    def access(self, addr):
        b = addr // self.line
        s = self.sets[b % self.nsets]
        if b in s: s.remove(b)
        else:
            self.misses += 1
            if len(s) == self.ways: s.pop(0)
        s.append(b)

N = 256
row, col = Cache(32 << 10, 8), Cache(32 << 10, 8)
for i in range(N):
    for j in range(N):
        row.access((i * N + j) * 8)
        col.access((j * N + i) * 8)
print("row-major misses", row.misses, "column-major misses", col.misses, "of", N * N)

def matmul(N, order, BS=0):                 # C[i][j] += A[i][k] * B[k][j], 3 accesses per step
    c = Cache(4096, 4)
    A, B, C = 0, 1 << 20, 2 << 20
    def step(i, j, k):
        c.access(A + (i * N + k) * 8); c.access(B + (k * N + j) * 8); c.access(C + (i * N + j) * 8)
    if order == "ijk":
        for i in range(N):
            for j in range(N):
                for k in range(N): step(i, j, k)
    elif order == "ikj":
        for i in range(N):
            for k in range(N):
                for j in range(N): step(i, j, k)
    else:
        for ii in range(0, N, BS):
            for kk in range(0, N, BS):
                for jj in range(0, N, BS):
                    for i in range(ii, min(ii + BS, N)):
                        for k in range(kk, min(kk + BS, N)):
                            for j in range(jj, min(jj + BS, N)): step(i, j, k)
    return c.misses

print("N=60: ijk", matmul(60, "ijk"), "ikj", matmul(60, "ikj"), "blocked(12)", matmul(60, "blocked", 12))
print("N=64: ikj", matmul(64, "ikj"), "blocked(8)", matmul(64, "blocked", 8))
```

Row order misses once per 8 doubles. Column order misses on every access: the array is larger than the cache, and the 2048-byte stride also maps onto very few sets, because it is a power of two. The last two lines belong to the blocking section. The real machine shows the same direction, and the prefetcher adds to the row-major advantage:

```cpp run=ca-c02-loop-real nondet
#include <algorithm>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <vector>
using Clock = std::chrono::steady_clock;
static volatile int64_t sink;           // storing here keeps each loop inside its timed region
template <class F> static double secs(F f) {
    auto t = Clock::now();
    sink = f();
    return std::chrono::duration<double>(Clock::now() - t).count();
}
int main() {
    const size_t N = 2048;
    std::vector<int64_t> a(N * N, 1);
    double rows = 1e9, cols = 1e9;
    for (int r = 0; r < 3; r++) {
        rows = std::min(rows, secs([&] { int64_t s = 0;
            for (size_t i = 0; i < N; i++) for (size_t j = 0; j < N; j++) s += a[i * N + j];
            return s; }));
        cols = std::min(cols, secs([&] { int64_t s = 0;
            for (size_t j = 0; j < N; j++) for (size_t i = 0; i < N; i++) s += a[i * N + j];
            return s; }));
    }
    printf("column order took %.1fx as long as row order\n", cols / rows);
}
```

Expect a multiple, often several times. The exact ratio depends on the array size against your caches and on how far the compiler optimises.

### Array of structs and struct of arrays

If a loop reads one field out of a 64-byte struct, each line brings in 60 bytes it does not want. A struct of arrays packs the hot field together, which also suits SIMD ([Chapter 4](#ch04)):

```cpp run=ca-c02-soa nondet
#include <algorithm>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <vector>
using Clock = std::chrono::steady_clock;
struct Particle { int32_t x, y, z, vx, vy, vz; char name[40]; };
static volatile int64_t sink;
template <class F> static double secs(F f) {
    auto t = Clock::now();
    sink = f();
    return std::chrono::duration<double>(Clock::now() - t).count();
}
int main() {
    const size_t N = 1'000'000;
    std::vector<Particle> aos(N, Particle{1, 2, 3, 0, 0, 0, {}});
    std::vector<int32_t> xs(N, 1);
    double ta = 1e9, ts = 1e9;
    for (int r = 0; r < 10; r++) {
        ta = std::min(ta, secs([&] { int64_t s = 0; for (const Particle& p : aos) s += p.x; return s; }));
        ts = std::min(ts, secs([&] { int64_t s = 0; for (int32_t x : xs) s += x; return s; }));
    }
    printf("sizeof(Particle) = %zu; array of structs took %.1fx as long as struct of arrays\n", sizeof(Particle), ta / ts);
}
```

The gap depends on the sizes and on the prefetcher, and it shrinks or reverses when a loop uses most fields of each element. Choose the layout to match the hot loop.

### Blocking

When data does not fit in the cache, **blocking** (tiling) works on small sub-blocks that do fit, so each block is reused before it is evicted. The last two lines of the simulator output above show matrix multiply with three matrices of doubles on a 4 KB cache. Swapping the loops so the innermost one walks along rows (`ikj`) already removes most of the misses, and with `N = 60` a block size of 12 removes most of what is left. A 12×12 block of doubles is 1152 bytes, so the three blocks in use fit in the cache together.

The `N = 64` line is a warning: with block size 8 the rows of each block are 512 bytes apart, a power of two, so they map onto very few sets and the blocked version does worse than plain `ikj`. Conflict misses can erase the gain, so pick the block size with the set mapping in mind, or measure a few sizes.

:::trap
"Sequential access is fast because of spatial locality" is half of the answer. It also matters that the hardware prefetcher recognises the stride and fetches lines early, and that a page boundary or a very large stride can stop it. A linked list whose nodes are scattered around the heap gets no help from a stride prefetcher, and each load must finish before the next address is known.
:::

## Drills: caches {#ch02-drills .dr}

:::drill concept
A 256 KB, 4-way cache has 64-byte lines and 32-bit addresses. Find the sets and the offset, index and tag widths.
---
```python run=ca-c02-d-bits
size, ways, line, bits = 256 << 10, 4, 64, 32
sets = size // (ways * line)
off, idx = line.bit_length() - 1, sets.bit_length() - 1
print(sets, off, idx, bits - off - idx)
```

**Why.** Sets = 2<sup>18</sup> / (2<sup>2</sup> × 2<sup>6</sup>) = 2<sup>10</sup>. Working in powers of two lets you do this in your head.
:::

:::drill concept
A 16 KB, 4-way cache has 32-byte lines. For the 32-bit address `0x7FFE1234`, what are the tag, index and offset?
---
```python run=ca-c02-d-decode
a = 0x7FFE1234
sets = (16 << 10) // (4 * 32)
print("sets", sets, "offset", a & 31, "index", (a >> 5) & (sets - 1), "tag", hex(a >> 12))
```

**Why.** 32 bytes needs 5 offset bits, and 128 sets needs 7 index bits, so the tag starts at bit 12.
:::

:::drill concept
How many bits of metadata does a 32 KB direct-mapped, write-back cache need, with 32-byte lines and 32-bit addresses? Count tag, valid and dirty bits for each line.
---
```python run=ca-c02-d-meta
lines = (32 << 10) // 32
tag = 32 - 15        # offset 5 + index 10 = 15 bits, since 32 KB = 2**15
print(lines, "lines,", tag, "tag bits,", lines * (tag + 2), "bits,", lines * (tag + 2) // 8, "bytes")
```

**Why.** Direct-mapped means sets = lines, so index + offset = log2(size) = 15 bits. The metadata costs about 7% on top of the 32 KB of data.
:::

:::drill output
This direct-mapped cache has 4 lines of 16 bytes. Work out the hits and misses for the trace by hand before running.

```python run=ca-c02-d-trace
cache = [None] * 4
for a in [0x00, 0x04, 0x10, 0x40, 0x00, 0x14, 0x44]:
    block = a // 16
    i = block % 4
    print(hex(a), "index", i, "hit" if cache[i] == block else "miss")
    cache[i] = block
```
---
**Answer.** `0x04` shares a line with `0x00`, so it hits. `0x40` has the same index as `0x00` and evicts it, so the next `0x00` misses and evicts `0x40`, which makes the last access to `0x44` a miss too. `0x14` shares a line with `0x10` and hits.
:::

:::drill concept
Name the three Cs and say what reduces each one.
---
**Answer.** Cold: larger lines or prefetching. Capacity: a bigger cache or a smaller working set. Conflict: more ways, or avoiding bad strides. A fully associative cache of the same size has no conflict misses, and comparing against it is how you classify a miss.
:::

:::drill tricky
If larger lines exploit spatial locality, why not use 1 KB lines?
---
**Answer.** Each miss then has to move more data, so the penalty and the bus traffic rise. Fewer lines fit, so conflict and capacity misses go up when locality is weak. On multicore machines, more unrelated data shares a line, so false sharing gets worse. Miss rate falls at first with line size and then rises.
:::

:::drill concept
You sum a cold `int a[4096]` (4-byte ints, aligned to a 64-byte line). How many cache misses occur, and what is the hit rate? Ignore prefetching.
---
```python run=ca-c02-d-sum
n, per_line = 4096, 64 // 4
misses = n // per_line
print(misses, (n - misses) / n * 100)
```

**Why.** There are 16 ints per line, so the first in each line misses and the other 15 hit. Prefetching would reduce the misses further on a real machine.
:::

:::drill concept
L1: hit time 1 cycle, 10% miss rate. L2: hit time 10 cycles, 20% local miss rate. Memory: 100 cycles. Find the AMAT and the global L2 miss rate. What is the AMAT without L2, where L1 misses go straight to memory?
---
```python run=ca-c02-d-amat
with_l2 = 1 + 0.10 * (10 + 0.20 * 100)
no_l2 = 1 + 0.10 * 100
print(round(with_l2, 3), round(0.10 * 0.20, 3), round(no_l2, 3))
```

**Why.** L2 hides 80% of the expensive trips, so AMAT falls from 11 to 4 cycles.
:::

:::drill tricky
Base CPI is 1, there are 1.3 memory accesses per instruction, the miss rate is 2% and the miss penalty is 100 ns. At 1 GHz that is 100 cycles. If you double the clock to 2 GHz with the same memory, how much faster does the program run?
---
```python run=ca-c02-d-clock
cpi_1 = 1 + 1.3 * 0.02 * 100
cpi_2 = 1 + 1.3 * 0.02 * 200
t1, t2 = cpi_1 / 1, cpi_2 / 2
print(round(cpi_1, 2), round(cpi_2, 2), round(t1 / t2, 3))
```

**Why.** Memory time in nanoseconds does not change, so the penalty doubles in cycles. The speedup is about 1.16x for a 2x clock, which is the memory wall in one line.
:::

:::drill concept
Compute TLB coverage for 64 entries with 4 KB pages, 1536 entries with 4 KB pages, and 64 entries with 2 MB pages.
---
```python run=ca-c02-d-tlb
for entries, page_kb in [(64, 4), (1536, 4), (64, 2048)]:
    print(entries, page_kb, "KB ->", entries * page_kb / 1024, "MB")
```

**Why.** Coverage is entries × page size. A random-access workload larger than the coverage misses the TLB often, whatever the data cache does. These entry counts are examples, and real ones vary.
:::

:::drill tricky
An L1 is 64 KB, 8-way and VIPT with 4 KB pages. What problem appears, and how could hardware deal with it?
---
**Answer.** 64 KB / 8 = 8 KB per way, so index and offset need 13 bits, one more than the 12 unchanged bits. Two virtual addresses for one physical line can then land in different sets (synonyms). Fixes include more ways (16 ways gives 4 KB per way), checking or invalidating the other possible set in hardware, or the OS colouring pages so that the extra bit always matches.
:::

:::drill concept
A variable is written 1000 times in a tight loop and then evicted. Compare the writes reaching the next level under write-through and write-back.
---
**Answer.** Write-through sends 1000 word writes, unless a write buffer merges them. Write-back sends one line, once, at eviction. That is why caches for ordinary memory are nearly always write-back at L2 and beyond, and usually also at L1.
:::

:::drill output
An `int` array is walked with a stride of 4 elements. The lines are 64 bytes, the array is cold and aligned, and there is no prefetching. How many of 1024 accesses miss? What if the stride is 16 or 32 elements?

```python run=ca-c02-d-stride
for stride in (4, 16, 32):
    lines = {(i * stride * 4) // 64 for i in range(1024)}
    print(stride, len(lines))
```
---
**Answer.** With stride 4 each line holds 4 accessed elements, so 256 miss. With stride 16 or more, every access starts a new line, so all 1024 miss. Beyond one line per access, a wider stride does not change a cold-miss count.
:::

:::drill output
What does this print on x86-64 or ARM64? Then, how many lines does a pass over one million elements of each touch, reading field `d`?

```c run=ca-c02-d-layout
#include <stdio.h>
struct A { char c; double d; int i; };
struct B { double d; int i; char c; };
int main(void) {
    printf("%zu %zu\n", sizeof(struct A), sizeof(struct B));
    printf("%zu %zu\n", sizeof(struct A) * 1000000 / 64, sizeof(struct B) * 1000000 / 64);
    return 0;
}
```
---
**Answer.** Padding makes `A` 24 bytes and `B` 16. Just reordering the members reduces the lines touched by a third. Layout rules are covered in the [C++ guide](../../guide/#ch19).
:::

:::drill bug
This runs, but much more slowly than expected for large `N`. What should change?

```c
double total = 0;
for (int j = 0; j < N; j++)
    for (int i = 0; i < N; i++)
        total += grid[i][j];
```
---
**Answer.** It walks columns of a row-major array, so each access jumps a full row. Swap the loops so `j` is the inner index. The sum is the same if `grid` holds integers. With floating point the order of addition can change the rounding slightly, so the compiler will not swap the loops for you unless told it may reorder.
:::

:::drill tricky
Why can an array of size 4096 × 4096 run worse than one of 4100 × 4100 in a column-order loop?
---
**Answer.** A stride that is a large power of two maps successive accesses onto very few sets, because the index bits barely change. So the cache behaves as if it were much smaller, and conflict misses rise. A slightly different size spreads across more sets. Real L2 and L3 caches may hash the index, which softens the effect.
:::

## Write the code {#ch02-coding .cd}

:::drill code
Write a set-associative LRU cache simulator with write-back, write-allocate behaviour. Report hits, misses and write-backs.
---
Keep a dirty flag per way. A write-back happens only when a dirty line is evicted. Lines still dirty at the end stay uncounted unless you flush.

```python run=ca-c02-c-sim
from collections import OrderedDict

class Cache:
    def __init__(self, size, ways, line):
        self.line, self.ways, self.nsets = line, ways, size // (ways * line)
        self.sets = [OrderedDict() for _ in range(self.nsets)]
        self.hits = self.misses = self.writebacks = 0
    def access(self, addr, write=False):
        block = addr // self.line
        s = self.sets[block % self.nsets]
        if block in s:
            self.hits += 1
            s.move_to_end(block)
        else:
            self.misses += 1
            if len(s) == self.ways:
                _, dirty = s.popitem(last=False)
                self.writebacks += dirty
            s[block] = False
        s[block] = s[block] or write

c = Cache(64, 1, 16)                     # 4 lines, direct-mapped
for addr, w in [(0, True), (0, True), (64, False), (0, False), (64, True), (128, False)]:
    c.access(addr, w)
print(c.hits, c.misses, c.writebacks)
```

Trace: `0` writes (miss, dirty), writes again (hit). `64` maps to the same set and evicts dirty `0` (write-back). `0` comes back clean and evicts clean `64`. `64` is written (miss, evict clean `0`, now dirty). `128` evicts dirty `64` (write-back).
:::

:::drill code
Write a blocked matrix multiply in C++. Check it against the naive version, and compare times.
---
Use `ikj` inside each block so the inner loop runs along rows.

```cpp run=ca-c02-c-block nondet
#include <algorithm>
#include <chrono>
#include <cstdio>
#include <vector>
using Mat = std::vector<double>;
const int N = 512, BS = 64;

static void naive(const Mat& A, const Mat& B, Mat& C) {
    for (int i = 0; i < N; i++) for (int j = 0; j < N; j++) for (int k = 0; k < N; k++)
        C[i * N + j] += A[i * N + k] * B[k * N + j];
}
static void blocked(const Mat& A, const Mat& B, Mat& C) {
    for (int ii = 0; ii < N; ii += BS) for (int kk = 0; kk < N; kk += BS) for (int jj = 0; jj < N; jj += BS)
        for (int i = ii; i < std::min(ii + BS, N); i++) for (int k = kk; k < std::min(kk + BS, N); k++) {
            double a = A[i * N + k];
            for (int j = jj; j < std::min(jj + BS, N); j++) C[i * N + j] += a * B[k * N + j];
        }
}
template <class F> static double secs(F f, Mat& C) {
    std::fill(C.begin(), C.end(), 0.0);
    auto t = std::chrono::steady_clock::now();
    f();
    asm volatile("" : : "r"(C.data()) : "memory");      // the writes to C must happen before the clock stops
    return std::chrono::duration<double>(std::chrono::steady_clock::now() - t).count();
}
int main() {
    Mat A(N * N), B(N * N), C1(N * N), C2(N * N);
    for (int i = 0; i < N * N; i++) { A[i] = (i % 7) + 1; B[i] = (i % 5) + 1; }
    double t1 = secs([&] { naive(A, B, C1); }, C1), t2 = secs([&] { blocked(A, B, C2); }, C2);
    printf("results equal: %s; naive took %.1fx as long as blocked\n", C1 == C2 ? "yes" : "no", t1 / t2);
}
```

The inputs here are small integers, so every product and sum is exact and the two orders give identical results. With general floating-point inputs, compare with a tolerance. Much of the gain comes from `ikj` order alone, so try that as a third version.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- `sets = size / (ways × line)`. Offset = log2(line), index = log2(sets), tag = the rest.
- VIPT without aliasing needs index + offset within the page offset: size / ways ≤ page size.
- Three Cs: cold, capacity, conflict. A fourth on multicore: coherence.
- LRU has bad cases: cycling through ways + 1 lines gives zero hits. Hardware often uses pseudo-LRU.
- Write-through with no-write-allocate, or write-back with write-allocate. Write-back keeps a dirty bit.
- `AMAT = hit + miss rate × penalty`, and it nests. Local rate = misses / accesses at this level; global = misses / CPU accesses.
- Memory stall CPI = accesses per instruction × miss rate × penalty. A faster clock makes the penalty larger in cycles.
- TLB coverage = entries × page size. Huge pages raise it and shorten walks.
- Loop order: match the layout (row-major in C). Stride beyond a line means one miss per access when cold.
- AoS vs SoA: choose by the hot loop. Blocking: work on sub-blocks that fit in the cache.
- Rough scale only: L1 about 1 ns, DRAM about 100 ns.
