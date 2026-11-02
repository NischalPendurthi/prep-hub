---
id: bs-on-answer
title: Binary Search on Answer
signals:
  - "minimise the maximum / maximise the minimum (time, distance, load, height)"
  - "find the smallest T such that something can be done within T"
  - "checking a FIXED answer is easy (greedy, a count), finding it directly is not"
  - "answer up to 1e9 or 1e18, n up to 2e5"
  - "k-th smallest value among a huge implicit set (count how many are <= mid)"
idea: |
  If `ok(x)` is **monotone** (false ... false true ... true), binary search the first true
  instead of constructing the answer. Write `ok` as a greedy or counting check for a
  **fixed** candidate, then `lo<hi`, `mid=lo+(hi-lo)/2`, `ok(mid) ? hi=mid : lo=mid+1`.
  For "last true" use `mid=lo+(hi-lo+1)/2` with `ok(mid) ? lo=mid : hi=mid-1`. Pick `hi` so
  that it is **certainly feasible**.
complexity: "O(log(range) × cost of ok)"
pitfalls:
  - "Overflow inside ok: sums like Σ T/k_i or mid*count blow past 1e18. Cap and return early."
  - "Infinite loop: searching the LAST true with `mid=(lo+hi)/2` and `lo=mid` never moves when hi=lo+1. Round mid up."
  - "hi too small (answer never reached) or lo too big. Prove hi is feasible: e.g. min(k)*t."
  - "ok is not actually monotone (e.g. 'exactly k'). Rephrase as 'at least k' / 'at most k'."
  - "`(lo+hi)/2` with negative values rounds toward 0. Use `lo+(hi-lo)/2` or floor division."
related: [bs-bounds, bs-on-reals, interval-greedy]
---
### Two templates

```cpp
// first x with ok(x)            // last x with ok(x)
while(lo<hi){                    while(lo<hi){
  ll mid=lo+(hi-lo)/2;             ll mid=lo+(hi-lo+1)/2;
  if(ok(mid))hi=mid;               if(ok(mid))lo=mid;
  else lo=mid+1;                   else hi=mid-1;
}                                }
```

### Typical checks

| problem shape | ok(mid) |
|---|---|
| machines make t products in time T | `Σ T/k_i >= t` |
| split array into ≤ k parts, max part sum ≤ mid | greedy cut when the sum would exceed mid |
| place k cows, min gap ≥ mid | greedy place at the first allowed position |
| max median after k increments | cost to lift upper half to mid ≤ k |
| k-th smallest in a multiplication table | `Σ min(m, mid/i) >= k` |
| min-max path / max-min edge | BFS/DSU using only edges ≤ mid |

### How to spot it
The statement says "minimum possible maximum" or "maximum possible minimum", and if someone
handed you the answer you could verify it with a single greedy pass.
