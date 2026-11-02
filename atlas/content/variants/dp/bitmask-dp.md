---
id: bitmask-dp
title: Bitmask DP
signals:
  - "n ≤ 20 (or ≤ 16 with an extra factor n): the small n is the hint"
  - "visit every city / assign every person / cover every item exactly once"
  - "minimum number of groups (rides, bins, days) to split everyone into"
  - "order matters but only WHICH items are used so far affects the future"
  - "grid with width ≤ 10: profile of the current row as a mask"
idea: |
  The state is the **set of items already used**, stored as a mask: `dp[mask]` (or
  `dp[mask][last]` when the last item matters, as in TSP / Hamiltonian paths). Iterate
  masks in **increasing numeric order**: removing a bit always gives a smaller number,
  so every predecessor is done. For partition problems ("fewest groups") store a
  **pair** `{groups, load of the open group}` and minimise it lexicographically, which
  removes the `3^n` submask loop.
complexity: "O(2^n · n) for dp[mask] or pair-DP; O(2^n · n²) with [last]; O(3^n) over submasks"
pitfalls:
  - "`1<<n` with n ≥ 31 overflows int: write `1LL<<n`."
  - "dp[mask][last] with n=20 and `ll` is 2^20·20·8 = 160 MB. Use int, or drop [last]."
  - "Hamiltonian path with a fixed end: skip masks containing the end vertex unless it's the full mask, or you count paths that pass through it."
  - "Using `__builtin_popcount` on a long long mask: use `__builtin_popcountll`."
  - "Submask loop `for(s=m; s; s=(s-1)&m)` skips s=0; handle the empty submask separately."
related: [submask-enumeration, sos-dp, bit-tricks, digit-dp]
---
### State shapes

| problem | state | transition |
|---|---|---|
| assign n jobs to n people | `dp[mask]`, person = popcount(mask) | add one job bit |
| TSP / Hamiltonian path | `dp[mask][last]` | `dp[mask|1<<v][v] += dp[mask][u]` over edges u→v |
| fewest bins of capacity x (template) | `best[mask] = {bins, load}` | add item i last: fits → load+w, else new bin |
| split into groups with a cost per group | `dp[mask] = min over submask s` | `dp[mask^s] + cost[s]`, O(3^n) |
| grid tiling, width m ≤ 10 | profile mask of the frontier | fill cell by cell (broken profile) |

### Pair DP (Elevator Rides)
```cpp
best[0]={1,0};
for(ll mask=1;mask<(1LL<<n);mask++)
    for(ll i=0;i<n;i++) if(mask>>i&1){
        pi p=best[mask^(1LL<<i)];
        if(p.second+w[i]<=x)p.second+=w[i];
        else p={p.first+1,w[i]};
        best[mask]=min(best[mask],p);
    }
```
Taking fewer rides first and then the lightest open ride is always at least as good,
which is why a lexicographic min of the pair is safe.

### How to spot it
Brute force over orders is n!, over subsets is 2^n. If the future only depends on the
*set* chosen so far (plus maybe the last element), collapse orders into masks.
