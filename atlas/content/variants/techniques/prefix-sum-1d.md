---
id: prefix-sum-1d
title: 1D Prefix Sum
signals:
  - "many queries: sum of a[l..r] on an array that never changes"
  - "split the array into parts with equal / given sums"
  - "best subarray sum under a condition on its length or endpoints"
  - "average or count over a range, asked again and again"
  - "sum of something over all prefixes / suffixes"
idea: |
  Build `p[i] = a[0] + ... + a[i-1]` with **p of size n+1 and p[0] = 0**. Then any range sum is
  **`p[r+1] - p[l]`** (0-indexed) or `p[r] - p[l-1]` (1-indexed), in O(1). Every subarray
  question becomes a question about a **pair of prefix values**: fix the right end and
  look for the best or matching left prefix (keep a running min, a count, a hashmap).
complexity: "O(n) build, O(1) per query"
pitfalls:
  - "Off-by-one: with p of size n+1, sum(l..r) 0-indexed is p[r+1]-p[l]. Mixing the 1-indexed formula in gives wrong answers on l=0."
  - "Overflow: n=2e5 values up to 1e9 sum to 2e14. The prefix array must be ll even when a[i] is int."
  - "Prefix sums only work on a static array. With point updates, use a Fenwick tree."
  - "Mod prefix sums: (p[r]-p[l]) % M can be negative in C++, so add M before taking % again."
related: [prefix-sum-2d, difference-array, prefix-hashmap-count, fenwick-point-range]
---
### The core
```cpp
vi p(n+1,0);
for(ll i=0;i<n;i++)p[i+1]=p[i]+a[i];
// sum of a[l..r], 0-indexed inclusive
ll s=p[r+1]-p[l];
```

### Patterns built on top

| question | what to keep while scanning r |
|---|---|
| max subarray sum | min of `p[0..r]` so far, answer `p[r+1] - minPref` |
| max sum with length ≥ k | min of `p[0..r+1-k]` (it lags k behind) |
| count subarrays with sum = x | hashmap of prefix counts, see prefix-hashmap-count |
| split into 3 equal parts (CF 466C) | count of earlier cuts where `p = total/3` |
| sum of all prefix sums / range of p | prefix sums of p (a second level) |

### How to spot it
Static array plus "sum over a range" or "for every subarray". If the array changes between
queries, it is a Fenwick or segment tree problem. If the updates come all at once before the
queries, it is a difference array.
