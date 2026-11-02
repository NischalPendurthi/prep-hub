---
id: meet-in-the-middle
title: Meet in the Middle
signals:
  - "n ≤ 40 (sometimes 35-45) and you'd like to try all 2^n subsets"
  - "count subsets with sum exactly x / max subset sum mod m / closest subset sum to a goal"
  - "paths in a grid with ~40 steps where a xor/sum along the path must hit a target"
  - "split into two halves, each half's options can be listed and sorted"
idea: |
  Split the items into **two halves of n/2**. List all `2^(n/2)` results of each half,
  **sort one list**, then for each result of the other half look up its complement with
  **binary search or two pointers**. 2^40 work becomes about `2^20 · 20`. For paths, walk
  from the start for half the steps and from the end for the rest, and meet on the
  **middle diagonal** keyed by (cell, value).
complexity: "O(2^(n/2) · n) time, O(2^(n/2)) memory"
pitfalls:
  - "unordered_map / map for counting 2^20 sums is slow (and hackable). Sort vectors and use two pointers or equal_range."
  - "Counting pairs: equal values on both sides form blocks, add cntA × cntB, not 1."
  - "Sums up to 40 × 1e9 need ll, and the empty subset belongs to both halves."
  - "Odd n: halves n/2 and n - n/2. Both lists must cover every element exactly once."
  - "Memory: 2^20 ll values per list is 8 MB each, fine; 2^23 starts to hurt."
related: [submask-enumeration, bs-bounds, two-pointers-opposite, knapsack-01]
---
### Generating subset sums without recursion
```cpp
vi s={0};
for(ll i=l;i<r;i++){
    ll sz=s.size();
    for(ll j=0;j<sz;j++)s.push_back(s[j]+t[i]);
}
```

### Combining the halves

| goal | after sorting B |
|---|---|
| count A_i + B_j == x | two pointers (A up, B down) with block counting, or `equal_range(x - A_i)` |
| max (A_i + B_j) mod m | sort both mod m; for each A_i take the largest B_j < m - A_i, also the overall max of B |
| min abs(A_i + B_j - goal) | for each A_i, lower_bound(goal - A_i) and its predecessor |
| equal-size partition, min difference | group sums by subset size k, match size k with n/2 - k |
| xor path in an n×m grid (CF 1006F) | map per diagonal cell of xor values from the start, query from the end |
