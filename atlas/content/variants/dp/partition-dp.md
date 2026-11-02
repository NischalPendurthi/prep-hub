---
id: partition-dp
title: Partition DP
signals:
  - "split the array into contiguous segments (exactly k, at most k, or any number)"
  - "cost of a segment = its max, sum², distinct count, palindrome check, …"
  - "minimise the total (or the max) cost over all ways to cut"
  - "each day / machine takes a contiguous block of jobs"
  - "n ≤ 500–5000 and k ≤ ~100, so O(k·n²) or O(n²) fits"
idea: |
  `dp[i]` = best answer for the **prefix of length i**, and the transition picks **where the last
  segment starts**: `dp[i] = min over j < i of dp[j] + cost(j, i)`. If the number of segments is fixed,
  add a dimension: `dp[k][i]` from `dp[k-1][j]`. Walk **j from i-1 down** so the last segment's
  cost (max, sum, set) updates in O(1). When `cost` has the right structure, the inner min speeds up
  with **monotone deque, CHT, or divide-and-conquer** optimisation.
complexity: "O(n²) for any number of parts, O(k·n²) for exactly k; faster with dp-opt tricks"
pitfalls:
  - "Each segment must be non-empty: j runs to k-1 at least, and dp[k][i] for i < k stays INF."
  - "dp[0][0] = 0 and dp[0][i>0] = INF. Forgetting that lets 0 segments cover elements."
  - "Adding to INF overflows: skip INF states or use LLONG_MAX/4."
  - "Recomputing cost(j, i) from scratch makes it O(n³); grow the segment leftwards instead."
  - "'At most k' vs 'exactly k': at most k = min over dp[1..k][n]."
related: [interval-dp, dp-prefix-opt, convex-hull-trick, dp-monotonic-queue]
---
### The key loop (exactly d segments, cost = segment max)
```cpp
dp[0][0]=0;
for(ll k=1;k<=d;k++)
    for(ll i=k;i<=n;i++){
        ll mx=0;
        for(ll j=i-1;j>=k-1;j--){             // last segment = a[j..i-1]
            mx=max(mx,a[j]);
            if(dp[k-1][j]<BIG)dp[k][i]=min(dp[k][i],dp[k-1][j]+mx);
        }
    }
```

### Speed-ups by cost shape

| cost(j, i) | trick |
|---|---|
| anything, n ≤ 500 | plain O(k·n²) |
| `dp[j] + f(j)·g(i)` (linear in i) | convex hull trick / Li Chao |
| `dp[j]` over a sliding window of j | monotonic deque |
| opt(i) monotone in i (sum², quadrangle inequality) | divide & conquer, O(k·n log n) |
| minimise the max segment | binary search on the answer + greedy |

### Partition vs interval DP
Partition DP only cuts a prefix (state = one index). If a segment's cost depends on how its inside
is itself split or merged, you need the range as the state: that's interval DP.
