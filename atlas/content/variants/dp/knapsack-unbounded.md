---
id: knapsack-unbounded
title: Unbounded Knapsack / Coin Change
signals:
  - "coins / items can be used ANY number of times"
  - "minimum number of coins to make x, or -1 if impossible"
  - "number of ways to make x: does order matter? (1+2 vs 2+1)"
  - "rod cutting: cut a length into pieces with given prices"
  - "x up to 1e6 and few coin types"
idea: |
  Same as 0/1 knapsack but loop the sum **upward**, so `dp[s-c]` may already include coin c
  and it can be reused. For **counting**, the loop order decides what you count: **coins outer,
  sums inner** counts each multiset once (combinations); **sums outer, coins inner** counts
  ordered sequences (permutations). For min coins, both orders work.
complexity: "O(n·x) time, O(x) memory"
pitfalls:
  - "Combinations vs permutations: swapping the two loops silently changes the answer (CSES 1636 vs 1635)."
  - "Min coins: init `dp[s] = INF`, `dp[0] = 0`, and skip `dp[s-c] == INF` before adding 1, or INF+1 overflows."
  - "Print -1 when dp[x] is still INF."
  - "Greedy (largest coin first) is wrong for arbitrary coin sets, e.g. {1,3,4} for 6."
  - "Counting with mod on 1e6 × 100 updates: use `int` and subtract mod instead of `%` to stay in time."
related: [knapsack-01, dp-linear, knapsack-bounded]
---
### Which loop order

| task | outer loop | inner loop | init |
|---|---|---|---|
| ways, unordered (template) | coins | sum ascending | `dp[0]=1` |
| ways, ordered sequences | sum | coins | `dp[0]=1` |
| min coins | either | sum ascending | `INF`, `dp[0]=0` |
| max value (rod cutting) | either | length ascending | 0 |

### The key loop
```cpp
dp[0]=1;
for(ll i=0;i<n;i++)                  // coins outer: each multiset counted once
    for(ll s=c[i];s<=x;s++)          // UP: coin i can be reused
        dp[s]=(dp[s]+dp[s-c[i]])%mod;
```

### Why the order matters
With coins outer, after processing coin i, `dp` only knows coins 0..i, so every combination is
built in coin order and seen once. With sums outer, each `dp[s]` adds "last coin = c" for every c,
which is exactly a sequence count, like dice combinations.
