---
id: window-fixed
title: Fixed-Size Window
signals:
  - "for every window of length k: sum, distinct count, max, number of mismatches"
  - "find the k consecutive items with min / max total"
  - "minimum changes so that some length-k substring matches a pattern"
  - "binary search a length, then check every window of that length"
idea: |
  Keep the window's summary and update it in O(1) (or O(log)) per step:
  **add `a[i]`, remove `a[i-k]`**, report once `i ≥ k-1`. Sums use a running total, distinct
  counts use a frequency map plus a counter of non-zero keys, max/min use a **monotonic deque**.
  When the length isn't given, **binary search it** and run a fixed window in the check.
complexity: "O(n) (O(n log n) with a map or multiset)"
pitfalls:
  - "Off-by-one at the start: output only when i ≥ k-1, and remove a[i-k] only when i ≥ k."
  - "Distinct count: increment when a count goes 0→1 and decrement when it goes 1→0, not on every add."
  - "Recomputing the window from scratch is O(nk), which TLEs at 2e5."
  - "Cyclic windows: double the array or index mod n."
related: [window-variable, monotonic-deque, prefix-sum-1d, bs-on-answer]
---
### The core
```cpp
for(ll i=0;i<n;i++){
    add(a[i]);
    if(i>=k)remove(a[i-k]);
    if(i>=k-1)answer(i-k+1);   // window a[i-k+1..i]
}
```

### What to keep in the window

| asked per window | state | add / remove |
|---|---|---|
| sum, average | running sum | `+a`, `-a` |
| distinct values (CSES 3222) | `map cnt` + `distinct` | on 0→1 / 1→0 |
| max / min (CSES 3221) | monotonic deque of indices | pop back while worse, pop front when out |
| mismatches with a periodic pattern (CF 1196D2) | count of `s[i] != pat[(i+shift)%3]` for each shift | `±1` |
| median / k-th (CSES 1076) | two multisets | rebalance after each step |
| length found by binary search (CF 1073C) | prefix counts | check each window in O(1) |
