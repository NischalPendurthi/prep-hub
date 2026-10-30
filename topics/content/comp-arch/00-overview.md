---
name: Computer architecture & performance
short: Comp arch
icon: CA
version: x86-64 and ARMv8, GCC, Linux
eyebrow: pipelines · caches · coherence · memory ordering · SIMD · profiling
headline: Know why the <em>same code</em> can run ten times slower.
lede: Four chapters on what the processor does with your C and C++, written so you can explain each idea and handle the follow-up questions. Every example is a program with its real output, and every numerical is worked in code. Each chapter ends with at least fifteen drills, coding problems with reference solutions and a cheat sheet.
card: Pipelines and branch prediction, cache numericals and cache-friendly code, MESI and the C++ memory model, SIMD, NUMA, Amdahl and Little's law, perf and honest benchmarking.
cta: Start with pipelines|#ch01; Jump to caches|#ch02; Memory ordering|#ch03
search: Search: forwarding, MESI, AMAT, false sharing, acquire…
---

:::hero A small predict-the-output drill
```python run=ca-home-hero
cache = {}                         # 4 KB, direct-mapped, 64-byte lines: 64 sets
hits = 0
for addr in [0x1000, 0x2000, 0x1000, 0x1040]:
    index = (addr >> 6) & 63
    tag = addr >> 12
    hits += cache.get(index) == tag
    cache[index] = tag
print(hits)
```

`0x1000` and `0x2000` have the same index and different tags, so each one evicts the other, and `0x1040` is the first access to its set. The output is **0**, even though the program touches only two nearby regions of memory and the cache has 64 lines. Chapter 2 teaches you to work this out by hand and explains why a little associativity fixes it.
:::

## How to use the drills

Answer each drill out loud or on paper before you open it, and treat a wrong answer as the thing to revise. Numericals are computed in Python inside the answer, so you can check your method as well as your result. Timing examples depend on the machine they ran on. They are marked as varying, they print ratios, and the text around them says what the effect usually looks like. Run them on your own laptop too. Press <kbd>/</kbd> to search, and use the contents list on the right to move around a chapter.

## Suggested plan

| Sitting | Read | Drill |
|---|---|---|
| 1 | Ch 1 (pipelines, hazards, CPI, predictors) | Draw the pipeline diagram from memory, then do every CPI numerical |
| 2 | Ch 2 (caches, AMAT, TLB, loop order) | Do the tag/index/offset and AMAT drills by hand, then write the cache simulator |
| 3 | Ch 3 up to the store buffer (MESI, false sharing, TSO) | Trace the MESI transitions, then explain the store-buffering litmus test aloud |
| 4 | Rest of Ch 3 (C++ atomics, lock-free basics) | Atomics drills, then write the spinlock and the single-producer queue |
| 5 | Ch 4 (SIMD, NUMA, laws, perf, benchmarking) | Amdahl and Little's law numericals, then benchmark something of your own and defend the numbers |

## What this guide assumes

You know C or C++, pointers, threads and basic OS ideas such as virtual memory. Allocation patterns, struct layout and `alignas` are covered in the C++ guide's chapter on [cache-friendly allocation](../../guide/#ch19), and this guide links there instead of repeating it. Numbers such as "a memory access costs about 100 ns" are rough orders of magnitude for orientation. Real figures differ between processors, so quote them in an interview as approximate.
