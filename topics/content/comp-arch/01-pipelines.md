---
title: Pipelines and branch prediction
part: Part A · The processor
lede: A processor overlaps instructions the way an assembly line overlaps cars. This chapter covers the classic five-stage pipeline, the hazards that break the overlap, how to compute CPI by hand, how out-of-order cores run far ahead of the program, and why a mispredicted branch is expensive enough to change how you write loops.
desc: 5-stage pipeline, hazards, forwarding, CPI numericals, superscalar, out-of-order, speculation, predictors, branchless code
hours: 3
prereqs: C or C++, what a register and an instruction are
---

## The five-stage pipeline {#ch01-pipeline .th}

Executing an instruction takes several steps. The classic teaching design, a simple RISC processor, splits them into five stages with a latch between each pair:

- **IF**: fetch the instruction from memory at the program counter.
- **ID**: decode it and read its source registers.
- **EX**: run the ALU, for arithmetic or to compute an address.
- **MEM**: read or write data memory (loads and stores only).
- **WB**: write the result into the destination register.

One instruction still takes five cycles, and its latency is slightly worse than a single long cycle because of latch overhead. The gain is **throughput**: once the pipeline is full, one instruction finishes every cycle. For `n` instructions on `k` stages with no stalls, the total is `k + n - 1` cycles, so CPI (cycles per instruction) approaches 1 as `n` grows.

The clock period is set by the slowest stage plus the latch delay, so the real speedup is below `k`. With stage delays of 200, 100, 150, 200 and 100 ps and a 20 ps latch, the period is 220 ps against 750 ps for a single-cycle design, a speedup of about 3.4 for a five-stage pipeline.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 200" role="img" aria-label="Pipeline diagram over eight cycles. A load, then an add that uses the loaded value and stalls one cycle, then a subtract that uses the add result. Arrows show forwarding from MEM to EX and from EX to EX.">
  <text x="20" y="24" class="t-small">cycle</text>
  <text x="172" y="24" text-anchor="middle" class="t-mono">1</text><text x="240" y="24" text-anchor="middle" class="t-mono">2</text><text x="308" y="24" text-anchor="middle" class="t-mono">3</text><text x="376" y="24" text-anchor="middle" class="t-mono">4</text><text x="444" y="24" text-anchor="middle" class="t-mono">5</text><text x="512" y="24" text-anchor="middle" class="t-mono">6</text><text x="580" y="24" text-anchor="middle" class="t-mono">7</text><text x="648" y="24" text-anchor="middle" class="t-mono">8</text>
  <text x="14" y="56" class="t-mono">lw  x1,0(x2)</text>
  <rect x="140" y="36" width="64" height="30" class="d-soft"/><text x="172" y="56" text-anchor="middle" class="t-mono">IF</text><rect x="208" y="36" width="64" height="30" class="d-soft"/><text x="240" y="56" text-anchor="middle" class="t-mono">ID</text><rect x="276" y="36" width="64" height="30" class="d-soft"/><text x="308" y="56" text-anchor="middle" class="t-mono">EX</text><rect x="344" y="36" width="64" height="30" class="d-acc"/><text x="376" y="56" text-anchor="middle" class="t-mono">MEM</text><rect x="412" y="36" width="64" height="30" class="d-soft"/><text x="444" y="56" text-anchor="middle" class="t-mono">WB</text>
  <text x="14" y="106" class="t-mono">add x3,x1,x4</text>
  <rect x="208" y="86" width="64" height="30" class="d-soft"/><text x="240" y="106" text-anchor="middle" class="t-mono">IF</text><rect x="276" y="86" width="64" height="30" class="d-soft"/><text x="308" y="106" text-anchor="middle" class="t-mono">ID</text><rect x="344" y="86" width="64" height="30" class="d-trap"/><text x="376" y="106" text-anchor="middle" class="t-mono">stall</text><rect x="412" y="86" width="64" height="30" class="d-acc"/><text x="444" y="106" text-anchor="middle" class="t-mono">EX</text><rect x="480" y="86" width="64" height="30" class="d-soft"/><text x="512" y="106" text-anchor="middle" class="t-mono">MEM</text><rect x="548" y="86" width="64" height="30" class="d-soft"/><text x="580" y="106" text-anchor="middle" class="t-mono">WB</text>
  <text x="14" y="156" class="t-mono">sub x5,x3,x6</text>
  <rect x="276" y="136" width="64" height="30" class="d-soft"/><text x="308" y="156" text-anchor="middle" class="t-mono">IF</text><rect x="344" y="136" width="64" height="30" class="d-trap"/><text x="376" y="156" text-anchor="middle" class="t-mono">stall</text><rect x="412" y="136" width="64" height="30" class="d-soft"/><text x="444" y="156" text-anchor="middle" class="t-mono">ID</text><rect x="480" y="136" width="64" height="30" class="d-acc"/><text x="512" y="156" text-anchor="middle" class="t-mono">EX</text><rect x="548" y="136" width="64" height="30" class="d-soft"/><text x="580" y="156" text-anchor="middle" class="t-mono">MEM</text><rect x="616" y="136" width="64" height="30" class="d-soft"/><text x="648" y="156" text-anchor="middle" class="t-mono">WB</text>
  <path d="M390 66 L 426 86" class="d-line-acc"/><polygon points="426,86 417,85 421,78" class="d-fill-acc"/><path d="M458 116 L 494 136" class="d-line-acc"/><polygon points="494,136 485,135 489,128" class="d-fill-acc"/>
  <text x="14" y="188" class="t-small">Each arrow is a forwarding path: a value goes from a pipeline latch straight to the ALU input, ahead of WB.</text>
</svg></div><figcaption><b>Load-use stall and forwarding.</b> A loaded value exists only after MEM, so the next instruction waits one cycle even with forwarding. The ALU result of <code>add</code> is ready after EX, so <code>sub</code> takes it with no stall.</figcaption></figure>

## Hazards and forwarding {#ch01-hazards .th}

A **hazard** is anything that stops the next instruction from starting in the next cycle. There are three kinds:

- **Structural**: two instructions need the same hardware in one cycle, such as a single memory port for fetch and data. Separate instruction and data caches remove the classic case.
- **Data**: an instruction needs a value that is not ready. The real dependence is **RAW** (read after write). **WAR** and **WAW** only reuse a register name. In this in-order pipeline they cannot cause trouble, because reads happen in ID and writes happen in WB, always in program order.
- **Control**: the processor does not yet know the next PC because a branch has not been resolved.

**Forwarding** (bypassing) sends a result from the EX/MEM or MEM/WB latch directly to the ALU input, so a dependent instruction need not wait for WB. Without it, and assuming the register file writes in the first half of a cycle and reads in the second, an ALU instruction followed by a dependent one costs 2 stalls. With it, the cost is 0, except for a load followed immediately by a use of the loaded value, which costs 1.

This simulator applies those rules. A consumer's EX must come at least 1 cycle after an ALU producer's EX and 2 after a load's with forwarding, or 3 after either without it:

```python run=ca-c01-timeline
def timeline(prog, forward):
    rows, ready, prev_id, prev_ex = [], {}, 1, 2
    for name, dest, srcs, is_load in prog:
        ex = prev_ex + 1
        for s in srcs:
            if s in ready:
                p_ex, p_load = ready[s]
                ex = max(ex, p_ex + (3 if not forward else 2 if p_load else 1))
        fetch, ident = prev_id, max(prev_id + 1, prev_ex)   # waits in IF while the one ahead holds ID
        cells = {c: "**" for c in range(fetch, ex)}
        cells.update({fetch: "IF", ident: "ID", ex: "EX", ex + 1: "MM", ex + 2: "WB"})
        rows.append((name, cells))
        ready[dest] = (ex, is_load)
        prev_id, prev_ex = ident, ex
    last = prev_ex + 2
    print("forwarding" if forward else "no forwarding", f"total {last} cycles")
    for name, cells in rows:
        print(f"{name:13}" + " ".join(cells.get(c, "..") for c in range(1, last + 1)))

prog = [("lw  x1,0(x2)", "x1", ["x2"], True),
        ("add x3,x1,x4", "x3", ["x1", "x4"], False),
        ("sub x5,x3,x6", "x5", ["x3", "x6"], False)]
timeline(prog, True)
timeline(prog, False)
```

A compiler can remove a load-use stall by moving an unrelated instruction into the gap, which is called instruction scheduling.

For **control hazards**, assume the processor keeps fetching the next sequential instruction. If a branch is resolved in stage `s` and turns out taken, the `s - 1` instructions fetched after it are wrong and must be flushed. That gives a penalty of 2 if resolved in EX and 1 if resolved in ID.

:::trap
"Forwarding removes all data hazards" is wrong. A load's value does not exist until the end of MEM, and no wire can send it back in time to the EX of the next instruction. The answer also changes if the question changes the pipeline, so state your assumptions before you start counting stalls.
:::

## CPI and the performance equation {#ch01-cpi .th}

Everything reduces to one equation:

`time = instruction count × CPI × clock period`

Real CPI is ideal CPI plus stall cycles per instruction, added up by cause. Each cause contributes `(fraction of instructions) × (how often it stalls) × (penalty)`. This example also shows why a deeper pipeline is a gamble: it raises the clock, and it also raises the misprediction penalty.

```python run=ca-c01-cpi
def cpi(branch_frac, miss_rate, penalty):
    return 1 + branch_frac * miss_rate * penalty

for label, miss in [("good predictor", 0.05), ("poor predictor", 0.30)]:
    a = cpi(0.20, miss, 3)      # short pipeline, 2 GHz
    b = cpi(0.20, miss, 15)     # deep pipeline, 3 GHz
    print(f"{label}: short CPI {a:.2f} -> {2 / a:.2f} G instr/s, deep CPI {b:.2f} -> {3 / b:.2f} G instr/s")
```

With a good predictor the deep pipeline wins, and with a poor one it loses, even with a 50% faster clock. The clock rate alone tells you nothing, and neither does CPI alone.

## Superscalar and out-of-order execution {#ch01-ooo .th}

A **superscalar** core fetches, decodes and completes several instructions per cycle, so CPI can drop below 1. People then quote IPC (instructions per cycle), the reciprocal. A 4-wide core has a best-case IPC of 4, and real code reaches far less because of dependences and memory.

An **out-of-order** core runs each instruction when its inputs are ready, whatever the program order. The main parts are:

- **Register renaming** maps architectural registers onto a larger physical file. This removes WAR and WAW, which are only name clashes. RAW stays, since it carries real data.
- **Reservation stations** (the scheduler) hold instructions until their operands arrive.
- **The reorder buffer (ROB)** records program order. Instructions may finish in any order but **retire** in order. A result becomes architectural state only at retirement, which is what makes exceptions precise.

So the limit on speed in a modern core is usually the longest chain of real dependences. In this program, both functions do the same number of multiplications. One forms a single chain, and the other forms two chains that can overlap:

```cpp run=ca-c01-chains nondet
#include <algorithm>
#include <chrono>
#include <cstdint>
#include <cstdio>
using Clock = std::chrono::steady_clock;
static volatile uint64_t opaque = 0x9E3779B97F4A7C15ULL;

static uint64_t one_chain(uint64_t k, long n) {
    uint64_t a = 1;
    for (long i = 0; i < n; i++) { a = (a * k) ^ i; a = (a * k) ^ i; }
    return a;
}
static uint64_t two_chains(uint64_t k, long n) {
    uint64_t a = 1, b = 2;
    for (long i = 0; i < n; i++) { a = (a * k) ^ i; b = (b * k) ^ i; }
    return a ^ b;
}
template <class F> static double best(F f) {
    double b = 1e9;
    for (int r = 0; r < 3; r++) {
        auto t = Clock::now();
        volatile uint64_t sink = f(opaque, 20'000'000); (void)sink;
        b = std::min(b, std::chrono::duration<double>(Clock::now() - t).count());
    }
    return b;
}
int main() {
    printf("same multiplies, one chain took %.1fx as long as two chains\n", best(one_chain) / best(two_chains));
}
```

On an out-of-order core the single chain typically takes about twice as long, because no multiply can start until the one before it finishes. The source looks equally expensive either way, which is the point to remember: count dependence chains as well as operations.

## Speculation {#ch01-speculation .th}

A deep, wide core may have hundreds of instructions in flight, far beyond the next branch. It cannot wait to resolve each one, so it **predicts** the direction and target, then executes along that path. Results stay in the ROB until the branch is confirmed. On a misprediction, everything younger than the branch is thrown away and fetch restarts on the right path.

The cost is roughly the pipeline depth from fetch to resolution, on the order of 10 to 20 cycles on a modern desktop core. A 4-wide core also loses up to four instruction slots in each of those cycles.

:::trap
"A squashed instruction leaves no trace" is true only for architectural state: registers and memory. Microarchitectural state such as the cache can keep the changes. Spectre-class attacks use this: a mispredicted path reads a secret and touches a cache line chosen by that secret, and the attacker later measures which line is fast.
:::

## Branch predictors {#ch01-predictors .th}

The predictor runs at fetch, before the instruction is even decoded, so it needs two answers: taken or not, and where to.

- **Branch target buffer (BTB)**: a cache from branch address to target address.
- **Return address stack**: a small stack that predicts `ret`, pushed on `call`.
- **1-bit table**: remembers the last outcome. A loop branch mispredicts twice per loop: at the exit, and again on re-entry.
- **2-bit saturating counter**: it takes two wrong outcomes in a row to flip the prediction, so a loop branch mispredicts once per loop.
- **Correlating predictors** such as gshare hash the recent branch history into the table index, so they can learn patterns. Modern cores use larger relatives of this idea, such as TAGE and perceptron predictors.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 170" role="img" aria-label="Four states of a two-bit counter in a row: strongly not taken, weakly not taken, weakly taken, strongly taken. Taken moves right, not taken moves left.">
  <rect x="30" y="60" width="120" height="56" rx="8" class="d-soft"/><text x="90" y="84" text-anchor="middle" class="t-mono">00</text><text x="90" y="102" text-anchor="middle" class="t-small">strongly not taken</text>
  <rect x="210" y="60" width="120" height="56" rx="8" class="d-soft"/><text x="270" y="84" text-anchor="middle" class="t-mono">01</text><text x="270" y="102" text-anchor="middle" class="t-small">weakly not taken</text>
  <rect x="390" y="60" width="120" height="56" rx="8" class="d-acc"/><text x="450" y="84" text-anchor="middle" class="t-mono">10</text><text x="450" y="102" text-anchor="middle" class="t-small">weakly taken</text>
  <rect x="570" y="60" width="120" height="56" rx="8" class="d-acc"/><text x="630" y="84" text-anchor="middle" class="t-mono">11</text><text x="630" y="102" text-anchor="middle" class="t-small">strongly taken</text>
  <path d="M150 74 L 204 74" class="d-line-acc"/><polygon points="210,74 202,70 202,78" class="d-fill-acc"/><path d="M330 74 L 384 74" class="d-line-acc"/><polygon points="390,74 382,70 382,78" class="d-fill-acc"/><path d="M510 74 L 564 74" class="d-line-acc"/><polygon points="570,74 562,70 562,78" class="d-fill-acc"/>
  <path d="M210 102 L 156 102" class="d-line-trap"/><polygon points="150,102 158,98 158,106" class="d-fill-trap"/><path d="M390 102 L 336 102" class="d-line-trap"/><polygon points="330,102 338,98 338,106" class="d-fill-trap"/><path d="M570 102 L 516 102" class="d-line-trap"/><polygon points="510,102 518,98 518,106" class="d-fill-trap"/>
  <text x="180" y="66" text-anchor="middle" class="t-small t-acc">T</text><text x="360" y="66" text-anchor="middle" class="t-small t-acc">T</text><text x="540" y="66" text-anchor="middle" class="t-small t-acc">T</text>
  <text x="180" y="118" text-anchor="middle" class="t-small t-trap">N</text><text x="360" y="118" text-anchor="middle" class="t-small t-trap">N</text><text x="540" y="118" text-anchor="middle" class="t-small t-trap">N</text>
  <text x="180" y="32" text-anchor="middle" class="t-small">predict not taken</text><text x="540" y="32" text-anchor="middle" class="t-small">predict taken</text>
  <text x="90" y="140" text-anchor="middle" class="t-small">N keeps it here</text><text x="630" y="140" text-anchor="middle" class="t-small">T keeps it here</text>
</svg></div><figcaption><b>A 2-bit saturating counter.</b> One surprising outcome moves a strong state to a weak one without changing the prediction.</figcaption></figure>

This simulation runs three predictors on three branch patterns, with random outcomes from a fixed seed:

```python run=ca-c01-predictors
import random

def one_bit(seq):
    last, miss = True, 0
    for t in seq:
        miss += last != t
        last = t
    return miss

def two_bit(seq, state=2):
    miss = 0
    for t in seq:
        miss += (state >= 2) != t
        state = min(state + 1, 3) if t else max(state - 1, 0)
    return miss

def gshare(seq, bits):
    table, hist, miss = [1] * (1 << bits), 0, 0
    for t in seq:
        miss += (table[hist] >= 2) != t
        table[hist] = min(table[hist] + 1, 3) if t else max(table[hist] - 1, 0)
        hist = ((hist << 1) | t) & ((1 << bits) - 1)
    return miss

rng = random.Random(7)
patterns = {"loop of 10": ([True] * 9 + [False]) * 100,
            "alternating": [True, False] * 500,
            "random": [rng.random() < 0.5 for _ in range(1000)]}
print(f"{'pattern':12} {'1-bit':>6} {'2-bit':>6} {'gshare8':>8} {'gshare12':>9}   (mispredicts per 1000)")
for name, seq in patterns.items():
    print(f"{name:12} {one_bit(seq):6} {two_bit(seq):6} {gshare(seq, 8):8} {gshare(seq, 12):9}")
print("alternating, 2-bit starting in state 1:", two_bit(patterns["alternating"], state=1))
```

The 1-bit and 2-bit columns on the loop row show the expected 2 versus 1 misprediction per loop. On the alternating pattern a 2-bit counter is wrong half the time, and wrong every time if it happens to start in state 1, while gshare learns the pattern after a short warm-up. The loop row also shows a limit: an 8-bit history cannot tell the ninth iteration from the tenth of a 10-iteration loop, so that entry keeps flipping, and a 12-bit history fixes it. No predictor can do better than chance on truly random data, and that is the case where a branch costs the most.

## Branchless code {#ch01-branchless .th}

If a branch is unpredictable, you can remove it by turning the control dependence into a data dependence. Common tools are a conditional move, a mask, or an index computed from a comparison:

- `sum += v & -(v >= 128);` adds `v` or adds 0.
- `base += (a[half - 1] < x) * half;` is the core of a branchless binary search.

The classic experiment compares a sum over random and sorted data. At `-O1` and above, GCC often converts this `if` to a conditional move on its own and at `-O3` may vectorise it, so the empty `asm` statement in the branch keeps a real branch in the machine code:

```cpp run=ca-c01-sorted nondet
#include <algorithm>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <vector>
using Clock = std::chrono::steady_clock;
enum { N = 1 << 16, REPS = 150 };

static int64_t branchy(const std::vector<int>& v) {
    int64_t s = 0;
    for (int r = 0; r < REPS; r++)
        for (int x : v)
            if (x >= 128) { s += x; asm volatile(""); }
    return s;
}
static int64_t branchless(const std::vector<int>& v) {
    int64_t s = 0;
    for (int r = 0; r < REPS; r++)
        for (int x : v) s += x & -(x >= 128);
    return s;
}
template <class F> static double best(F f, const std::vector<int>& v, int64_t& out) {
    double b = 1e9;
    for (int r = 0; r < 3; r++) {
        auto t = Clock::now();
        volatile int64_t sink = f(v);        // the store keeps the work inside the timed region
        out = sink;
        b = std::min(b, std::chrono::duration<double>(Clock::now() - t).count());
    }
    return b;
}
int main() {
    std::vector<int> rnd(N);
    uint32_t seed = 1;
    for (int& x : rnd) { seed = seed * 1664525u + 1013904223u; x = seed >> 24; }
    auto sorted = rnd;
    std::sort(sorted.begin(), sorted.end());
    int64_t a, b, c, d;
    double t1 = best(branchy, rnd, a), t2 = best(branchy, sorted, b);
    double t3 = best(branchless, rnd, c), t4 = best(branchless, sorted, d);
    printf("all four sums equal: %s\n", a == b && b == c && c == d ? "yes" : "no");
    printf("branch:     random data took %.1fx as long as sorted\n", t1 / t2);
    printf("branchless: random data took %.1fx as long as sorted\n", t3 / t4);
    printf("on random data, branch took %.1fx as long as branchless\n", t1 / t3);
}
```

Typically the branchy loop is several times slower on random data than on sorted data, because about half its branches mispredict. The branchless loop barely cares about the order of the data. On perfectly predictable data, a well-predicted branch can match or beat the branchless form.

:::trap
Branchless is not automatically faster. A conditional move has to wait for both inputs and the condition, so it adds a dependence that a correctly predicted branch would skip. Use it when the branch is unpredictable, and measure. Also, the compiler decides what your source becomes: writing `?:` does not guarantee a `cmov`, and writing `if` does not guarantee a branch.
:::

## Drills: pipelines and prediction {#ch01-drills .dr}

:::drill concept
A five-stage pipeline does not give a 5x speedup. Give three reasons.
---
**Answer.** Stages are unbalanced, so the clock follows the slowest one. Latches add delay to every stage. Hazards add stall cycles, so CPI is above 1. Startup also costs `k - 1` cycles, though that fades for long programs.
:::

:::drill concept
Stage delays are 200, 150, 100, 250 and 100 ps, with a 10 ps latch. Find the clock period, the time for one million instructions with no stalls, and the speedup over a single-cycle design.
---
```python run=ca-c01-d-period
stages = [200, 150, 100, 250, 100]
period = max(stages) + 10
n = 1_000_000
pipelined = (len(stages) + n - 1) * period
single = n * sum(stages)
print(period, "ps;", pipelined / 1e6, "us; speedup", round(single / pipelined, 3))
```

**Why.** The period is the slowest stage plus the latch. A single-cycle design needs the sum of all stages, 800 ps, for each instruction.
:::

:::drill concept
Count the total cycles for this code with forwarding and without it, using the rules in the hazards section: `add x1,x2,x3`, `sub x4,x1,x5`, `lw x6,0(x4)`, `add x7,x6,x1`.
---
```python run=ca-c01-d-stalls
prog = [("x1", ["x2", "x3"], False), ("x4", ["x1", "x5"], False),
        ("x6", ["x4"], True), ("x7", ["x6", "x1"], False)]
for forward in (True, False):
    ex, ready = [], {}
    for dest, srcs, load in prog:
        e = ex[-1] + 1 if ex else 3
        for s in srcs:
            if s in ready:
                p, l = ready[s]
                e = max(e, p + (3 if not forward else 2 if l else 1))
        ex.append(e)
        ready[dest] = (e, load)
    total = ex[-1] + 2
    print("forward" if forward else "none", "total", total, "stalls", total - (5 + len(prog) - 1))
```

**Why.** With forwarding, only the load-use pair stalls. Without it, each of the three dependent neighbours stalls for 2 cycles and that stall delays everything behind it.
:::

:::drill tricky
Which dependence does renaming remove in `add x1,x2,x3` / `add x4,x1,x5` / `add x1,x6,x7`, and which can it never remove?
---
**Answer.** The second instruction reading `x1` is a RAW on the first, and it stays. The third writing `x1` is WAW with the first and WAR with the second, and renaming removes both by giving the third its own physical register.

**Why.** RAW carries a value that has to be computed first. The other two exist only because there are few register names.
:::

:::drill concept
A program has 20% loads, and 40% of loads are followed by a use of the value. Branches are 15% of instructions, 10% of them mispredict, and the penalty is 3 cycles. Base CPI is 1. Find CPI, and the runtime of 10<sup>9</sup> instructions at 2 GHz.
---
```python run=ca-c01-d-cpi
load_use = 0.20 * 0.40 * 1
branch = 0.15 * 0.10 * 3
cpi = 1 + load_use + branch
print(round(load_use, 3), round(branch, 3), round(cpi, 3), round(1e9 * cpi / 2e9, 4), "s")
```

**Why.** Add stall cycles per instruction by cause. Each term is a fraction of instructions times the chance of stalling times the penalty.
:::

:::drill concept
Machine A runs at 3 GHz with CPI 1.5. Machine B runs at 2.5 GHz with CPI 1.2. Which is faster on the same binary, and by how much?
---
```python run=ca-c01-d-ab
a, b = 3e9 / 1.5, 2.5e9 / 1.2
print(round(a / 1e9, 3), round(b / 1e9, 3), round(b / a, 4))
```

**Why.** Instruction rate is frequency divided by CPI. B is about 4% faster despite the lower clock. The comparison only holds for the same instruction count, so it fails across different instruction sets or compilers.
:::

:::drill concept
A 4-wide core has an ideal CPI of 0.25. It suffers 5 branch mispredictions per 1000 instructions, each costing 15 cycles. Find the CPI and the share of time spent recovering.
---
```python run=ca-c01-d-mpki
stall = 5 / 1000 * 15
cpi = 0.25 + stall
print(round(stall, 3), round(cpi, 3), round(stall / cpi * 100, 1), "%")
```

**Why.** Mispredictions per thousand instructions look small, but a wide core wastes many slots on each one. Here about a quarter of the time goes to recovery. Wider cores need better predictors.
:::

:::drill concept
Why do instructions execute out of order but retire in order?
---
**Answer.** Executing out of order uses idle hardware and avoids waiting. Retiring in order means that when an exception or misprediction occurs, every older instruction is complete and every younger one has left no architectural effect. The state seen by a handler matches a one-at-a-time execution.
:::

:::drill tricky
Can a speculative load change something an attacker can observe, even though it is squashed?
---
**Answer.** Yes. Registers and memory are restored, but the load may have filled a cache line. Timing an access to that line later reveals whether the load ran, and which address it used. That is the channel used by Spectre.
:::

:::drill output
Each predictor starts favouring taken. How many mispredictions does each make on a 10-iteration loop branch run twice?

```python run=ca-c01-d-loop
seq = ([True] * 9 + [False]) * 2
last, state, m1, m2 = True, 3, 0, 0
for t in seq:
    m1 += last != t; last = t
    m2 += (state >= 2) != t
    state = min(state + 1, 3) if t else max(state - 1, 0)
print(m1, m2)
```
---
**Answer.** The 1-bit predictor misses at the first exit, on re-entry, and at the second exit, which is 3. The 2-bit counter only misses at the two exits, which is 2. Over many runs that becomes 2 versus 1 per loop.
:::

:::drill tricky
What does `if (x) [[likely]]` do to the branch predictor?
---
**Answer.** Nothing directly. It is a hint to the compiler, which uses it to lay out code so the expected path falls through and stays together. That helps the instruction cache and fetch. The hardware predictor still learns from outcomes at run time.
:::

:::drill tricky
A colleague's sorted-versus-unsorted benchmark shows no difference at `-O3`. Does this disprove branch misprediction costs?
---
**Answer.** No. At that level the compiler has probably replaced the branch with a conditional move or vector code, so no branch remains. Check the disassembly, and use `perf stat -e branches,branch-misses` to see whether the machine ran the branch you think it did.
:::

:::drill output
What does this print?

```c run=ca-c01-d-select
#include <stdio.h>
static int pick(int a, int b, int cond) {
    int m = -(cond != 0);
    return (a & m) | (b & ~m);
}
int main(void) {
    printf("%d %d %d\n", pick(7, 9, 1), pick(7, 9, 0), pick(-1, 5, 42));
    return 0;
}
```
---
**Answer.** `m` is all ones when `cond` is non-zero and all zeros otherwise, so the function returns `a` or `b` with no branch in the source.
:::

:::drill bug
This branchless `min` passes all small tests. Find the bug: `int m(int a, int b) { int d = a - b; return b + (d & (d >> 31)); }`
---
**Answer.** `a - b` can overflow, for example with `a = INT_MAX` and `b = -2`, and signed overflow is undefined behaviour. Compute the difference in a wider type. Before C++20 and in C, right-shifting a negative value is also implementation-defined, although GCC does an arithmetic shift.

```cpp run=ca-c01-d-minfix
#include <climits>
#include <cstdint>
#include <cstdio>
static int m(int a, int b) {
    int64_t d = int64_t(a) - b;
    return int(b + (d & (d >> 63)));
}
int main() { printf("%d %d %d\n", m(INT_MAX, -2), m(-2, INT_MAX), m(3, 3)); }
```
:::

:::drill bug
You make this code branchless by loading first. What did you break? `int r = p ? *p : 0;` becomes `int v = *p; int r = p ? v : 0;`
---
**Answer.** The second form dereferences `p` when it is null, which is undefined behaviour and usually a crash. A branch protects a load that a conditional move cannot protect, since both inputs of a `cmov` are evaluated. This is also why the compiler cannot make that conversion for you unless it can prove `p` is valid.
:::

## Write the code {#ch01-coding .cd}

:::drill code
Write a table of 2-bit counters indexed by the low bits of the branch address. Show that two branches with colliding indexes hurt each other.
---
The two branches have opposite behaviour. In a 16-entry table they share a counter if their addresses agree in the low 4 bits, and each undoes the other's training. With the counter starting at 1, the colliding pair is wrong every time.

```python run=ca-c01-c-table
class Predictor:
    def __init__(self, bits):
        self.mask = (1 << bits) - 1
        self.table = [1] * (1 << bits)
    def predict_and_update(self, pc, taken):
        i = pc & self.mask
        correct = (self.table[i] >= 2) == taken
        self.table[i] = min(self.table[i] + 1, 3) if taken else max(self.table[i] - 1, 0)
        return correct

def run(pc_a, pc_b):
    p = Predictor(4)
    good = 0
    for _ in range(500):
        good += p.predict_and_update(pc_a, True)
        good += p.predict_and_update(pc_b, False)
    return good

print("no collision:", run(0x100, 0x101), "of 1000")
print("collision:   ", run(0x100, 0x110), "of 1000")
```

This effect is called aliasing. Larger tables, tagged entries and history hashing all reduce it.
:::

:::drill code
Write a branchless `lower_bound` and test it against `std::lower_bound` on random data.
---
Each step halves the range and advances `base` only through arithmetic, so the loop has a fixed number of steps for a given `n` and no data-dependent branch in the source.

```cpp run=ca-c01-c-lb
#include <algorithm>
#include <cstdint>
#include <cstdio>
#include <vector>
static const int* lb(const int* base, size_t n, int x) {
    if (n == 0) return base;
    while (n > 1) {
        size_t half = n / 2;
        base += (base[half - 1] < x) * half;
        n -= half;
    }
    return base + (*base < x);
}
int main() {
    uint32_t s = 42;
    auto next = [&] { s = s * 1664525u + 1013904223u; return int(s >> 20); };
    int bad = 0, checks = 0;
    for (size_t n : {0, 1, 2, 3, 7, 8, 100, 1023, 1024}) {
        std::vector<int> v(n);
        for (int& x : v) x = next();
        std::sort(v.begin(), v.end());
        for (int q = 0; q < 2000; q++, checks++) {
            int x = next();
            bad += lb(v.data(), n, x) != std::lower_bound(v.data(), v.data() + n, x);
        }
    }
    printf("%d checks, %d disagreements\n", checks, bad);
}
```

On large arrays the loads dominate. Branchless search removes mispredictions, but it also gives up the speculative loads that a predicted branch would start early, so the winner depends on the array size and the cache.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- Stages: IF, ID, EX, MEM, WB. `n` instructions take `k + n - 1` cycles with no stalls. Clock period = slowest stage + latch.
- `time = IC × CPI × period`. `CPI = ideal + Σ fraction × stall chance × penalty`. IPC = 1 / CPI.
- Hazards: structural, data (RAW is real; WAR and WAW are name clashes), control.
- Forwarding (classic rules): ALU to next instruction 0 stalls; load to next instruction 1 stall. Without forwarding, 2 stalls.
- Branch resolved in stage `s`: flush `s - 1` instructions if the guess was wrong.
- Out-of-order: renaming removes WAR and WAW, the scheduler waits for operands, the ROB retires in order and gives precise exceptions.
- Speculation: squashing restores architectural state, while caches keep the trace (Spectre).
- Predictors: BTB for targets, return stack for `ret`, 1-bit misses twice per loop, 2-bit once, gshare hashes history. Random data defeats them all.
- Misprediction cost: roughly 10 to 20 cycles on a modern desktop core, as an order of magnitude.
- Branchless: good for unpredictable conditions; can lose on predictable ones. The compiler decides the final form, so check the disassembly.
