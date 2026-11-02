---
id: knapsack-01
title: 0/1 Knapsack
signals:
  - "each item has a weight and a value, pick a subset with total weight ≤ W, maximise value"
  - "each item used AT MOST ONCE"
  - "capacity W up to ~1e5 and n × W ≤ ~1e8"
  - "can we split into two groups with equal sum / target difference"
  - "values are small but weights are huge: swap roles (dp over value)"
idea: |
  `dp[c]` = best value with total weight ≤ c using the items seen so far. For each item, loop
  **capacity downward**: `dp[c] = max(dp[c], dp[c-w] + v)`. Going down means `dp[c-w]` still
  holds the value **without** this item, so each item is used at most once. If weights are huge
  but values small, flip it: `dp[v]` = **min weight** to get value exactly v, answer = largest v with
  `dp[v] ≤ W`.
complexity: "O(n·W) time, O(W) memory"
pitfalls:
  - "Looping capacity ascending turns it into unbounded knapsack (items reused)."
  - "`dp[c]` = 'weight ≤ c' needs init all 0; 'weight exactly c' needs -INF except dp[0]=0. Mixing them gives wrong answers."
  - "2D `dp[n][W]` with n=1000, W=1e5 is 1e8 ll = 800 MB. Use the 1D array."
  - "Weights up to 1e9: dp over weight is impossible, use dp over value (or meet-in-the-middle for n ≤ 40)."
related: [knapsack-unbounded, knapsack-bounded, subset-sum-bitset, meet-in-the-middle]
---
### Variants

| task | state | init | answer |
|---|---|---|---|
| max value, weight ≤ W (template) | `dp[c]` max value | all 0 | `dp[W]` |
| exactly W | `dp[c]` max value | `-INF`, `dp[0]=0` | `dp[W]` |
| count subsets with sum S | `dp[s]` ways | `dp[0]=1` | `dp[S]` |
| huge weights, small values | `dp[v]` min weight | `INF`, `dp[0]=0` | max v with `dp[v] ≤ W` |
| split into two near-equal halves | reachable sums | `dp[0]=1` | closest s to total/2 |

### The key loop
```cpp
for(ll i=0;i<n;i++)
    for(ll c=x;c>=h[i];c--)          // DOWN: item i used once
        dp[c]=max(dp[c],dp[c-h[i]]+s[i]);
```

### Recovering the chosen items
Keep the 2D table (or a `took[i][c]` bitset), then walk back from `(n, W)`: if
`dp[i][c] != dp[i-1][c]`, item i was taken, so `c -= w[i]`.
