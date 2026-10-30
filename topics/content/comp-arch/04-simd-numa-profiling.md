---
title: SIMD, NUMA and profiling
part: Part D · Measuring and scaling
lede: This chapter covers how one instruction can do several operations, what stops the compiler from vectorising a loop, why the thread that first touches a page matters on large machines, the two laws that limit scaling, how to find the slow part with perf and flame graphs, and how to benchmark without fooling yourself.
desc: vectorisation, auto-vectorisation conditions, intrinsics, alignment, NUMA first-touch, Amdahl, Little's law, perf, flame graphs, honest benchmarks
hours: 4
prereqs: Chapters 1 to 3, basic statistics (median, percentile)
---

## SIMD {#ch04-simd .th}

A SIMD instruction applies one operation to every **lane** of a wide register. Register widths are 128 bits for SSE and NEON, 256 for AVX2 and 512 for AVX-512. ARM's SVE lets the hardware choose the width. So a 256-bit register holds 8 `int32_t` or 4 `double` values.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 150" role="img" aria-label="One 128-bit add acts on four 32-bit lanes at once: a0 plus b0, a1 plus b1, a2 plus b2 and a3 plus b3.">
  <text x="20" y="38" class="t-mono">a</text><text x="20" y="84" class="t-mono">+ b</text><text x="20" y="130" class="t-mono">= s</text>
  <rect x="70" y="16" width="150" height="34" class="d-soft"/><rect x="220" y="16" width="150" height="34" class="d-soft"/><rect x="370" y="16" width="150" height="34" class="d-soft"/><rect x="520" y="16" width="150" height="34" class="d-soft"/>
  <text x="145" y="38" text-anchor="middle" class="t-mono">a0</text><text x="295" y="38" text-anchor="middle" class="t-mono">a1</text><text x="445" y="38" text-anchor="middle" class="t-mono">a2</text><text x="595" y="38" text-anchor="middle" class="t-mono">a3</text>
  <rect x="70" y="62" width="150" height="34" class="d-soft"/><rect x="220" y="62" width="150" height="34" class="d-soft"/><rect x="370" y="62" width="150" height="34" class="d-soft"/><rect x="520" y="62" width="150" height="34" class="d-soft"/>
  <text x="145" y="84" text-anchor="middle" class="t-mono">b0</text><text x="295" y="84" text-anchor="middle" class="t-mono">b1</text><text x="445" y="84" text-anchor="middle" class="t-mono">b2</text><text x="595" y="84" text-anchor="middle" class="t-mono">b3</text>
  <rect x="70" y="108" width="150" height="34" class="d-acc"/><rect x="220" y="108" width="150" height="34" class="d-acc"/><rect x="370" y="108" width="150" height="34" class="d-acc"/><rect x="520" y="108" width="150" height="34" class="d-acc"/>
  <text x="145" y="130" text-anchor="middle" class="t-mono">a0+b0</text><text x="295" y="130" text-anchor="middle" class="t-mono">a1+b1</text><text x="445" y="130" text-anchor="middle" class="t-mono">a2+b2</text><text x="595" y="130" text-anchor="middle" class="t-mono">a3+b3</text>
</svg></div><figcaption><b>Four lanes, one instruction.</b> The 128-bit <code>_mm_add_epi32</code> does all four additions at once, with no carry between lanes.</figcaption></figure>

The speedup is usually below the lane count. Memory bandwidth may be the real limit, loop setup and tail handling cost time, and some processors lower their clock under heavy wide-vector code. Data layout matters too: struct-of-arrays data loads straight into a vector register, and array-of-structs data needs shuffling ([Chapter 2](#ch02)).

## Auto-vectorisation {#ch04-autovec .th}

GCC vectorises with `-O3`, and with a cautious cost model at `-O2` since version 12. A loop has to meet these conditions:

- It is **countable**: the trip count is known on entry, so there are no early exits. (Newer compilers can handle some early-exit loops.)
- It has **no loop-carried dependence** that vector lanes would break, as in `a[i] = a[i-1] + 1`.
- Pointers **do not alias**, or the compiler can add a run-time overlap check. `restrict` in C removes the need for that check.
- It has **no opaque calls** in the body, unless they can be inlined or have vector versions.
- **Floating-point sums** can only use parallel additions with permission to reorder, because reordering changes rounding.

This script compiles each loop and asks GCC whether it vectorised it, so the answers come from this compiler at this version:

```bash run=ca-c04-autovec nondet
check() {
    printf '%s\n' "$3" > t.c
    if gcc -std=c17 -O3 $2 -fopt-info-vec-optimized -c t.c -o t.o 2>&1 | grep -q vectorized
    then r=yes; else r=no; fi
    printf '%-34s %s\n' "$1" "$r"
}
gcc --version | head -1 | awk '{print "gcc", $NF}'
check "add, restrict" "" 'void f(int n, int *restrict a, const int *restrict b) { for (int i = 0; i < n; i++) a[i] += b[i]; }'
check "add, may alias (run-time check)" "" 'void f(int n, int *a, const int *b) { for (int i = 0; i < n; i++) a[i] += b[i]; }'
check "a[i] = a[i-1] + 1" "" 'void f(int n, int *a) { for (int i = 1; i < n; i++) a[i] = a[i-1] + 1; }'
check "a[i] = a[i+1] + 1" "" 'void f(int n, int *a) { for (int i = 0; i + 1 < n; i++) a[i] = a[i+1] + 1; }'
check "int sum" "" 'int f(int n, const int *a) { int s = 0; for (int i = 0; i < n; i++) s += a[i]; return s; }'
check "float sum" "" 'float f(int n, const float *a) { float s = 0; for (int i = 0; i < n; i++) s += a[i]; return s; }'
check "float sum, -ffast-math" "-ffast-math" 'float f(int n, const float *a) { float s = 0; for (int i = 0; i < n; i++) s += a[i]; return s; }'
check "opaque call in body" "" 'int g(int); void f(int n, int *a) { for (int i = 0; i < n; i++) a[i] = g(a[i]); }'
check "early exit" "" 'int f(int n, const int *a) { for (int i = 0; i < n; i++) if (a[i] == 7) return i; return -1; }'
fsum='float f(int n, const float *a) { float s = 0; for (int i = 0; i < n; i++) s += a[i]; return s; }'
printf '%s\n' "$fsum" > t.c
echo "addps (4 additions at once) in float sum: $(gcc -O3 -S -o - t.c | grep -c addps)"
echo "addps with -ffast-math: $(gcc -O3 -ffast-math -S -o - t.c | grep -c addps)"
```

Read the float lines with care. GCC can report a plain float sum as vectorised because it loads vectors and then adds the lanes one by one in the original order, which gains little. Only with permission to reorder does it use parallel `addps`, as the last two lines show, and "vectorised" in a compiler report does not always mean faster.

To see why a loop was rejected, use `-fopt-info-vec-missed`. Vectorisation also depends on the target: plain `-O3` on x86-64 uses SSE2 only, and `-march=native` allows wider vectors, but the binary may then crash on an older processor.

:::trap
`-ffast-math` does more than allow vectorised sums. It assumes no NaNs or infinities and permits reordering and other value-changing transforms, so results can differ, and NaN checks can be removed. Prefer narrower flags, or an explicit reduction such as `#pragma omp simd reduction(+:s)` with `-fopenmp-simd`, and know what you gave up.
:::

## Intrinsics and alignment {#ch04-intrinsics .th}

Intrinsics are C functions that map almost one-to-one onto vector instructions. You write the lanes yourself, and you must handle the tail that does not fill a register. This example has a plain fallback so it builds on any target, and it shows two common patterns: adding up lanes, and counting matches through a comparison mask.

```c run=ca-c04-sse
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#ifdef __SSE2__
#include <emmintrin.h>
static int32_t sum32(const int32_t *a, size_t n) {
    __m128i acc = _mm_setzero_si128();
    size_t i = 0;
    for (; i + 4 <= n; i += 4) acc = _mm_add_epi32(acc, _mm_loadu_si128((const __m128i *)(a + i)));
    int32_t l[4];
    _mm_storeu_si128((__m128i *)l, acc);
    int32_t s = l[0] + l[1] + l[2] + l[3];
    for (; i < n; i++) s += a[i];       // the tail
    return s;
}
static size_t count_byte(const char *p, size_t n, char c) {
    __m128i needle = _mm_set1_epi8(c);
    size_t i = 0, total = 0;
    for (; i + 16 <= n; i += 16) {
        __m128i eq = _mm_cmpeq_epi8(_mm_loadu_si128((const __m128i *)(p + i)), needle);
        total += __builtin_popcount(_mm_movemask_epi8(eq));
    }
    for (; i < n; i++) total += p[i] == c;
    return total;
}
#else
static int32_t sum32(const int32_t *a, size_t n) { int32_t s = 0; for (size_t i = 0; i < n; i++) s += a[i]; return s; }
static size_t count_byte(const char *p, size_t n, char c) { size_t t = 0; for (size_t i = 0; i < n; i++) t += p[i] == c; return t; }
#endif
int main(void) {
    int32_t a[10] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    const char *s = "the quick brown fox jumps over the lazy dog";
    printf("%d %zu\n", sum32(a, 10), count_byte(s, strlen(s), 'o'));
    return 0;
}
```

Here is the same sum timed against a scalar loop. The build uses `-O1`, which does not auto-vectorise, so the scalar loop stays scalar:

```cpp run=ca-c04-sse-time nondet
#include <algorithm>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <vector>
#ifdef __SSE2__
#include <emmintrin.h>
static int32_t vec(const int32_t* a, size_t n) {
    __m128i acc = _mm_setzero_si128();
    for (size_t i = 0; i + 4 <= n; i += 4) acc = _mm_add_epi32(acc, _mm_loadu_si128((const __m128i*)(a + i)));
    int32_t l[4];
    _mm_storeu_si128((__m128i*)l, acc);
    return l[0] + l[1] + l[2] + l[3];
}
#endif
static int32_t scalar(const int32_t* a, size_t n) {
    int32_t s = 0;
    for (size_t i = 0; i < n; i++) s += a[i];
    return s;
}
static volatile int32_t sink;
template <class F> static double best(F f, const std::vector<int32_t>& v) {
    double b = 1e9;
    for (int r = 0; r < 5; r++) {
        auto t = std::chrono::steady_clock::now();
        for (int k = 0; k < 20000; k++) sink = f(v.data(), v.size());
        b = std::min(b, std::chrono::duration<double>(std::chrono::steady_clock::now() - t).count());
    }
    return b;
}
int main() {
    std::vector<int32_t> v(4096, 1);    // small enough to stay in cache
#ifdef __SSE2__
    printf("sums equal: %s; scalar took %.1fx as long as SSE2\n", scalar(v.data(), v.size()) == vec(v.data(), v.size()) ? "yes" : "no", best(scalar, v) / best(vec, v));
#else
    printf("no SSE2 on this target\n");
#endif
}
```

With data that fits in cache, the ratio usually approaches the lane count of 4. On data far larger than the caches it is often much less, since memory becomes the bottleneck.

**Alignment.** `_mm_load_si128` requires a 16-byte aligned address and faults otherwise, while `_mm_loadu_si128` accepts any address. On recent x86 cores an unaligned load that stays within a cache line costs about the same as an aligned one, and crossing a line costs more. Get aligned memory with `alignas`, or with `aligned_alloc(64, size)` where `size` is a multiple of 64. The C++ guide's [chapter 19](../../guide/#ch19) covers the layout rules.

## NUMA {#ch04-numa .th}

On a multi-socket server, and on some large single-socket parts, memory is attached to specific nodes. Any core can reach any memory, but remote access crosses an interconnect, so it has higher latency and shares bandwidth. As a rough order of magnitude, remote latency is often tens of percent to about twice local.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 190" role="img" aria-label="Two NUMA nodes joined by an interconnect. A core on node 0 reaches its own memory directly, and reaches node 1 memory through the interconnect.">
  <rect x="30" y="20" width="260" height="60" rx="8" class="d-box"/><text x="160" y="46" text-anchor="middle" class="t-mono">Node 0: cores and caches</text><text x="160" y="66" text-anchor="middle" class="t-small">thread T runs here</text>
  <rect x="430" y="20" width="260" height="60" rx="8" class="d-box"/><text x="560" y="46" text-anchor="middle" class="t-mono">Node 1: cores and caches</text>
  <rect x="30" y="126" width="260" height="46" rx="8" class="d-key"/><text x="160" y="154" text-anchor="middle" class="t-mono">Memory on node 0</text>
  <rect x="430" y="126" width="260" height="46" rx="8" class="d-trap"/><text x="560" y="154" text-anchor="middle" class="t-mono">Memory on node 1</text>
  <path d="M120 80 L 120 126" class="d-line-key"/><polygon points="120,126 116,118 124,118" class="d-fill-key"/><text x="112" y="108" text-anchor="end" class="t-small t-key">local</text>
  <path d="M290 50 L 430 50" class="d-line"/><text x="360" y="42" text-anchor="middle" class="t-small">interconnect</text>
  <path d="M290 62 L 400 62 L 500 126" class="d-line-trap"/><polygon points="500,126 490,124 495,117" class="d-fill-trap"/><text x="295" y="100" class="t-small t-trap">remote: slower, shared link</text>
</svg></div><figcaption><b>Where a page lives decides the cost.</b> The same load instruction has a different cost depending on which node holds the page.</figcaption></figure>

Linux normally uses **first-touch**: `malloc` or `mmap` only reserves addresses, and a physical page is allocated at the first access, on the node of the CPU that touches it. This program shows the mechanism underneath: mapping costs almost no page faults, and touching costs about one per page.

```cpp run=ca-c04-touch nondet
#include <sys/mman.h>
#include <sys/resource.h>
#include <cstdio>
static long faults() { rusage u; getrusage(RUSAGE_SELF, &u); return u.ru_minflt; }
int main() {
    const size_t bytes = 64 << 20, page = 4096;
    long f0 = faults();
    auto* p = (volatile char*)mmap(nullptr, bytes, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    if (p == MAP_FAILED) return 1;
    madvise((void*)p, bytes, MADV_NOHUGEPAGE);
    long f1 = faults();
    for (size_t i = 0; i < bytes; i += page) p[i] = 1;
    long f2 = faults();
    printf("pages: %zu; faults from mapping: %ld; faults from touching: %ld\n", bytes / page, f1 - f0, f2 - f1);
}
```

The classic bug follows directly: the main thread `memset`s a big array, so every page lands on its node, and then worker threads on all nodes hammer it. All traffic goes to one node, and scaling stalls. The fix is to initialise in parallel, with the same thread-to-data partition used in the real work.

Useful tools (these need a multi-node machine to show anything interesting, so no output is recorded here):

```bash
numactl --hardware                              # nodes, sizes, distance table
numactl --cpunodebind=0 --membind=0 ./app       # keep threads and memory on node 0
numactl --interleave=all ./app                  # spread pages evenly across nodes
numastat -p "$(pidof app)"                      # where this process's memory lives
```

Interleaving helps a shared structure that all threads use evenly, since it spreads bandwidth, even though average latency is not the best possible.

## Amdahl and Little {#ch04-laws .th}

**Amdahl's law.** If a fraction `p` of the work can run in parallel on `n` processors, `speedup = 1 / ((1 - p) + p / n)`, and it can never exceed `1 / (1 - p)`. **Gustafson's** view complements this: with more processors people usually grow the problem, so the serial share may shrink. Amdahl fixes the problem size, and Gustafson fixes the running time.

**Little's law.** For any stable system, `L = λ × W`: the average number in the system equals the arrival rate times the average time in the system. It holds with no assumption about distributions. The simulation below measures both sides independently. It also prints the waiting-time formula for random arrivals at one server (M/M/1), `W = S / (1 - ρ)`, where `S` is the service time and `ρ` the utilisation, to show why latency explodes as a server approaches capacity:

```python run=ca-c04-laws
import bisect, random

print("Amdahl, p = 0.95:", {n: round(1 / (0.05 + 0.95 / n), 2) for n in (2, 4, 8, 16, 64, 1024)}, "limit", round(1 / 0.05, 1))

rng = random.Random(3)
arrive, finish, t, free = [], [], 0.0, 0.0
for _ in range(200_000):
    t += rng.expovariate(0.8)               # arrival rate 0.8 per unit time
    start = max(t, free)
    free = start + rng.expovariate(1.0)     # mean service time 1
    arrive.append(t); finish.append(free)
span = finish[-1]
lam = len(arrive) / span
W = sum(f - a for f, a in zip(finish, arrive)) / len(arrive)
samples = [i * span / 50_000 for i in range(50_000)]
L = sum(bisect.bisect_right(arrive, s) - bisect.bisect_right(finish, s) for s in samples) / len(samples)
print(f"measured L = {L:.2f}, lambda x W = {lam * W:.2f}")

for rho in (0.5, 0.8, 0.9, 0.95, 0.99):
    print(f"utilisation {rho:.2f}: W = {1 / (1 - rho):6.1f} x service time")
```

## perf and flame graphs {#ch04-perf .th}

Measure before you optimise. Start with counters to learn what kind of problem you have:

```bash
perf stat -e cycles,instructions,branches,branch-misses,cache-references,cache-misses ./app
perf stat -r 5 ./app                      # repeat and report the variation
perf record -F 99 -g ./app                # sample stacks at 99 Hz
perf report --stdio                       # hottest functions
perf annotate                             # hottest instructions in a function
perf c2c record ./app                     # contended cache lines (false sharing)
```

These numbers are invented to show the arithmetic. Compute the ratios, since raw counts mean little:

```python run=ca-c04-perf-math
cycles, instr = 12e9, 9e9
branches, br_miss = 2e9, 1.2e8
llc_miss = 2e7
print("IPC", round(instr / cycles, 2))
print("branch miss %", round(br_miss / branches * 100, 2), " branch MPKI", round(br_miss / instr * 1000, 2))
print("LLC MPKI", round(llc_miss / instr * 1000, 2))
print("share of cycles if each branch miss costs ~15 cycles:", round(br_miss * 15 / cycles * 100, 1), "%")
print("share of cycles if each LLC miss costs ~200 cycles:  ", round(llc_miss * 200 / cycles * 100, 1), "%")
```

Low IPC with many cache misses points to memory, and many branch misses point to prediction. Those cost estimates are rough, because out-of-order cores overlap some miss time.

Things to remember about the tool:

- `cache-misses` is a generic event whose meaning varies by processor, so check which level it counts.
- Counters are often unavailable inside virtual machines. `perf_event_paranoid` can also block them.
- When you ask for more events than hardware counters, perf time-slices and scales them. The percentage it prints shows this.
- Sample attribution can land an instruction or more after the real cause, called skid.

A **flame graph** draws sampled stacks. Width is the share of samples, the vertical axis is stack depth, and horizontal order is alphabetical, so it does *not* show time passing. The wide bars at the top are where the CPU spends its own time. Build with `-g` and `-fno-omit-frame-pointer` for reliable stacks, or use `--call-graph dwarf`. A CPU flame graph shows nothing about time spent blocked on locks or I/O. That needs off-CPU analysis.

```bash
perf record -F 99 -g -- ./app
perf script | stackcollapse-perf.pl | flamegraph.pl > flame.svg     # scripts from the FlameGraph project
```

## Latency, throughput and percentiles {#ch04-latency .th}

**Throughput** is work per second, and **latency** is the time for one piece of work. They are related but separate. Batching and queues raise throughput and add latency. Pipelines (Chapter 1) do the same at the instruction level. Report latency as a distribution, because the mean hides the slow requests that users notice.

```python run=ca-c04-latency
import random
rng = random.Random(5)
xs = sorted(rng.gauss(1.0, 0.1) if rng.random() < 0.98 else rng.gauss(50, 5) for _ in range(100_000))
pct = lambda s, p: s[int(len(s) * p / 100)]
print(f"mean {sum(xs) / len(xs):.2f} ms, p50 {pct(xs, 50):.2f}, p99 {pct(xs, 99):.2f}, p99.9 {pct(xs, 99.9):.2f}")
print("chance a request fanning out to 20 servers hits a p99-slow one:", round((1 - 0.99 ** 20) * 100, 1), "%")

# Coordinated omission: the server stalls for 10 s in a 100 s test, and each request takes 1 ms.
closed, t = [], 0.0                         # closed loop: next request only after the last one returns
while t < 100_000:
    d = 10_000 if 50_000 <= t < 50_001 else 1
    closed.append(d); t += d
opened, free = [], 0.0                      # open loop: a request is due every 2 ms regardless
for i in range(50_000):
    due = i * 2.0
    start = max(due, free)
    if start < 60_000 and start >= 50_000: start = 60_000
    free = start + 1
    opened.append(free - due)
closed.sort(); opened.sort()
print(f"closed loop: {len(closed)} samples, p50 {pct(closed, 50):.0f} ms, p99 {pct(closed, 99):.0f} ms")
print(f"open loop:   {len(opened)} samples, p50 {pct(opened, 50):.0f} ms, p99 {pct(opened, 99):.0f} ms")
```

The closed-loop client stops sending during the stall, so it records one slow sample and hides the problem. This is **coordinated omission**. An open-loop client measures from when each request was due, which is what a user would have seen. Never average percentiles from different machines either, since the result is not a percentile of anything.

## How to benchmark honestly {#ch04-benchmark .th}

- **Build as you ship**: with optimisation and the same flags. A `-O0` number tells you nothing.
- **Keep the work alive**: use the result so that the compiler cannot remove the code. Also make sure the work stays between the two clock readings, since a side-effect-free loop can move past a timer call. Chapter 2's pointer-chase example stores its result to a volatile for this reason: without that store, GCC at `-O1` moves the loop past the timer and every working set looks equally fast. A flat or tiny result is a warning sign.
- **Warm up, then repeat**: the first runs pay for cold caches and page faults. Report the spread as well as one number, and use `perf stat -r` or your own loop.
- **Use a monotonic clock**: `steady_clock` or `CLOCK_MONOTONIC`, and make the measured region long compared to the clock's resolution.
- **Control the machine**: other load, frequency scaling and thermal limits all move results. Pin with `taskset` where you can, and interleave the A and B runs so drift affects both.
- **Choose inputs carefully**: data size relative to the caches, and predictable versus random data, can reverse a conclusion. Use real data if possible.
- **Check that the numbers make sense**: compare with counters and with the disassembly, and explain the result in terms of the hardware. Code layout and even environment size can shift timings by a few percent, so treat small differences with suspicion.

This shows the first point. Both runs use `-O2`, and the first discards its result:

```cpp run=ca-c04-dce nondet cmd="g++ -std=c++20 -O2 -Wall -pthread -o main main.cpp && ./main"
#include <chrono>
#include <cstdio>
using Clock = std::chrono::steady_clock;
static long work(long n) {
    long s = 0;
    for (long i = 0; i < n; i++) s += i * i;
    return s;
}
int main() {
    const long n = 200'000'000;
    auto t0 = Clock::now();
    work(n);                                        // result discarded: the call can vanish
    auto t1 = Clock::now();
    long r = work(n);
    asm volatile("" : : "r"(r) : "memory");         // the compiler must assume r is used
    auto t2 = Clock::now();
    double gone = std::chrono::duration<double>(t1 - t0).count(), kept = std::chrono::duration<double>(t2 - t1).count();
    printf("discarded version took under 1%% of the kept version: %s\n", gone < kept / 100 ? "yes" : "no");
}
```

:::trap
"My change made it 3% faster" means little from one run each. If the spread between identical runs is 5%, you measured noise. State the spread, repeat, and if the claim matters, run A and B alternately many times. In an interview, say how you would rule out noise before quoting any speedup.
:::

## Drills: SIMD, NUMA, laws and measurement {#ch04-drills .dr}

:::drill concept
How many `float` lanes fit in an AVX2 register? Give two reasons why the real speedup is usually below that.
---
**Answer.** 256 / 32 = 8. Memory bandwidth may limit the loop, and only part of the program may be vectorised (Amdahl again). Tail handling, shuffles and possible clock reductions under wide vectors also take some of it back.
:::

:::drill output
Why can't a compiler add a float array four values at a time without permission? Predict whether these two sums print the same value.

```c run=ca-c04-d-fp
#include <stdio.h>
int main(void) {
    float fwd = 0, rev = 0;
    for (int i = 1; i <= 1000000; i++) fwd += 1.0f / i;
    for (int i = 1000000; i >= 1; i--) rev += 1.0f / i;
    printf("%.4f %.4f\n", fwd, rev);
    return 0;
}
```
---
**Answer.** They differ. Float addition is not associative, because a small value added to a large total loses low bits. Adding the small terms first keeps more accuracy, so the reverse sum is the better one (the true value is about 14.3927). Adding lanes in parallel reorders the sum, so the compiler needs permission.
:::

:::drill tricky
Which of these can vectorise, as written? (a) `a[i] = b[i] * 2`, with possibly overlapping `a` and `b`; (b) `a[i] = a[i+1] + 1`; (c) `a[i] = a[i-1] + 1`.
---
**Answer.** (a) Yes, with a run-time overlap check or `restrict`. (b) Yes in principle: each lane reads an older value that the loop has not yet overwritten, and vector loads see the same values as scalar order. (c) No: each iteration needs the result of the previous one, a true loop-carried dependence.
:::

:::drill concept
How does array-of-structs layout hurt vectorisation?
---
**Answer.** The values you want are not next to each other, so the compiler needs gathers or shuffles, or it decides the loop is not worth vectorising. With struct of arrays one load fills a register with the field you need.
:::

:::drill tricky
`_mm_load_si128` crashes on a pointer from a plain `char` buffer. Why, and what are two fixes?
---
**Answer.** That intrinsic requires 16-byte alignment, and the aligned form of the instruction faults otherwise. Use `_mm_loadu_si128`, or align the buffer with `alignas(16)` or `aligned_alloc`.
:::

:::drill output
Round each address up to a 64-byte boundary. What does this print?

```python run=ca-c04-d-align
for addr in (0, 1, 63, 64, 65, 4096, 4097):
    print(addr, (addr + 63) & ~63)
```
---
**Answer.** Adding 63 and then clearing the low 6 bits rounds up, and multiples of 64 stay put. This only works for power-of-two alignments.
:::

:::drill bug
This parallel code scales badly on a two-socket machine. Why, and what is the fix?

```cpp
double* a = (double*)malloc(N * sizeof(double));
memset(a, 0, N * sizeof(double));      // on the main thread
#pragma omp parallel for
for (size_t i = 0; i < N; i++) a[i] = compute(a[i], i);
```
---
**Answer.** First-touch puts every page on the main thread's node, so threads on the other socket always access remote memory, and all of them share one memory controller. Initialise inside a parallel loop with the same schedule as the real work, and pin the threads so they do not migrate afterwards.
:::

:::drill tricky
A program runs identically with `numactl --interleave=all` and without it on your laptop. Does this show that NUMA does not matter for it?
---
**Answer.** No. A laptop usually has one node, so the flag has nothing to do. Test on the target topology. `numactl --hardware` tells you how many nodes exist.
:::

:::drill concept
With `p = 0.9` and 10 processors, what is the Amdahl speedup and the limit? What `p` do you need for a 4x speedup on 8 processors?
---
```python run=ca-c04-d-amdahl
print(round(1 / (0.1 + 0.9 / 10), 2), round(1 / (1 - 0.9), 2))
target, n = 4, 8
p = (1 - 1 / target) / (1 - 1 / n)
print(round(p, 4), round(1 / ((1 - p) + p / n), 3))
```

**Why.** The 10% serial part dominates: 10 processors give barely over half of their potential. For the second part, rearrange `1/S = 1 - p(1 - 1/n)`.
:::

:::drill concept
A service handles 2000 requests per second with an average latency of 50 ms. How many requests are in flight on average? If each request holds a thread, and you have 40 threads, what is the maximum throughput at that latency?
---
```python run=ca-c04-d-little
print(2000 * 0.050, 40 / 0.050)
```

**Why.** `L = λW` gives 100 in flight. Rearranged, `λ = L / W`, so 40 threads at 50 ms each cap the service at 800 per second. At 2000 per second, the 40-thread pool would be overwhelmed and a queue would grow until something fails.
:::

:::drill tricky
A team reduces average service time so their server runs at 80% utilisation instead of 95%. Under the M/M/1 model, compare time in the system in units of the service time.
---
```python run=ca-c04-d-util
for rho in (0.95, 0.80):
    print(rho, round(1 / (1 - rho), 1))
```

**Why.** In this model, waiting grows sharply near capacity, so the same server is about four times more responsive at 80% relative to its service time. Real systems differ, but the shape holds, which is why capacity plans leave headroom.
:::

:::drill concept
A run shows 8×10<sup>9</sup> instructions, 10<sup>10</sup> cycles, 1.6×10<sup>9</sup> branches and 4×10<sup>7</sup> branch misses. Find IPC, the branch miss rate and MPKI. With a 20-cycle penalty, what share of cycles do those misses cost?
---
```python run=ca-c04-d-perf
instr, cycles, br, miss = 8e9, 1e10, 1.6e9, 4e7
print(instr / cycles, miss / br * 100, miss / instr * 1000, miss * 20 / cycles * 100)
```

**Why.** A 2.5% miss rate looks low, yet it costs about 8% of the cycles. Treat that share as a rough estimate.
:::

:::drill tricky
A function has IPC 3.5, the highest in your program. Does it mean the function is efficient?
---
**Answer.** No. A spin-wait or a badly written loop can have high IPC while doing nothing useful, and a memory-heavy function may be doing necessary work with low IPC. IPC describes how smoothly instructions run. Compare work done per unit of time, such as records per second.
:::

:::drill tricky
In a flame graph, `parse` sits left of `render`, and `parse` is twice as wide. What can you conclude? What can't you?
---
**Answer.** `parse` and its callees took about twice the CPU samples of `render`. You cannot conclude that it ran first, since order is alphabetical. You also cannot tell whether a single call is slow or a cheap function was called many times, and time blocked off-CPU does not appear.
:::

:::drill bug
List what is wrong with this benchmark.

```cpp
auto t0 = std::chrono::system_clock::now();
for (int i = 0; i < 1000; i++) { double x = std::sqrt(i); }
auto t1 = std::chrono::system_clock::now();
std::cout << (t1 - t0).count() << " ticks: sqrt is fast\n";
```
---
**Answer.** `x` is unused, so an optimised build removes the loop. `system_clock` can jump, so use `steady_clock`. 1000 iterations may be close to the clock's resolution. It runs only once, with no warm-up or spread. It also uses an arbitrary input range and prints raw ticks with no unit.
:::

:::drill concept
Your p50 latency improved after adding batching, but p99 got worse. Is that a contradiction, and which matters?
---
**Answer.** It is no contradiction. Batching gives most requests an efficiency gain, and some wait for a batch to fill or sit behind a long one. Which number matters depends on the requirement. A request that fans out to many servers is held back by its slowest branch, so high percentiles often decide what users see.
:::

## Write the code {#ch04-coding .cd}

:::drill code
Given folded stacks such as `main;parse;read 30`, as produced for flame graphs, print each function's total and self share of the samples.
---
A frame's total includes samples where it appears anywhere on the stack, and self counts only samples where it is the leaf. Count a frame once per stack, or recursion would inflate its total.

```python run=ca-c04-c-fold
from collections import Counter

folded = """main;parse;read 30
main;parse;tokenize 20
main;render;layout;measure 25
main;render;paint 15
main;parse 5
main;idle 5"""

total, self_ = Counter(), Counter()
samples = 0
for line in folded.splitlines():
    stack, n = line.rsplit(" ", 1)
    n = int(n)
    frames = stack.split(";")
    samples += n
    for f in dict.fromkeys(frames):   # each frame once per stack, in a stable order
        total[f] += n
    self_[frames[-1]] += n

for f, t in total.most_common():
    print(f"{f:10} total {t / samples * 100:5.1f}%  self {self_[f] / samples * 100:5.1f}%")
```

`parse` has a large total and little self time, so look inside it. `read` has its entire share as self time, so it is the code that actually ran.
:::

:::drill code
Write a small benchmark harness: warm up, run a function repeatedly, keep the result alive, and report the median and the spread as ratios.
---
Reporting `max / min` makes noise visible. If it is large relative to the effect you are after, the benchmark needs more care before you trust a comparison.

```cpp run=ca-c04-c-harness nondet
#include <algorithm>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <vector>
using Clock = std::chrono::steady_clock;
static volatile uint64_t sink;

template <class F> static std::vector<double> bench(F f, int warmup, int runs) {
    for (int i = 0; i < warmup; i++) sink = f();
    std::vector<double> t;
    for (int i = 0; i < runs; i++) {
        auto a = Clock::now();
        sink = f();
        t.push_back(std::chrono::duration<double>(Clock::now() - a).count());
    }
    std::sort(t.begin(), t.end());
    return t;
}
int main() {
    std::vector<uint64_t> v(1 << 16, 3);
    auto t = bench([&] { uint64_t s = 0; for (auto x : v) s += x * x; return s; }, 5, 51);
    double median = t[t.size() / 2];
    printf("median / min: %.2f, max / min: %.2f\n", median / t.front(), t.back() / t.front());
}
```

Use the minimum or median for CPU-bound micro-benchmarks, where noise only adds time. For a service, keep the whole distribution, because the slow tail is part of what you measure.
:::

## Cheat sheet {#ch04-cheatsheet .th}

- SIMD widths: SSE and NEON 128, AVX2 256, AVX-512 512 bits. Lanes = width / element size. Handle the tail.
- Auto-vectorises when: countable, no loop-carried dependence, no aliasing (or a run-time check), no opaque calls. Parallel float sums need reordering permission.
- `-O3`, `-march=native`, `-fopt-info-vec`, `-fopt-info-vec-missed`. `-ffast-math` changes semantics.
- Aligned load faults on misaligned data, unaligned load accepts anything. Use `alignas` or `aligned_alloc`.
- NUMA first-touch: the page lands on the node of the first toucher. Initialise in parallel. Tools: `numactl`, `numastat`.
- Amdahl: `1 / ((1 - p) + p / n)`, limit `1 / (1 - p)`. Gustafson: grow the problem with `n`.
- Little: `L = λW`, for any stable system. M/M/1: `W = S / (1 - ρ)`.
- perf: IPC, branch miss rate, MPKI. `perf stat`, `perf record -g`, `perf report`, `perf annotate`, `perf c2c`.
- Flame graph: width is samples, alphabetical order, no timeline, on-CPU only.
- Percentiles over means. Coordinated omission hides stalls in closed-loop tests. Do not average percentiles.
- Honest benchmarks: optimised build, keep the result alive, keep the work between the timers, warm up, repeat, show the spread, use a monotonic clock, check with counters.
