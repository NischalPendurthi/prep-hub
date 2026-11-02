---
id: dp-linear
title: 1D Linear DP
signals:
  - "number of ways to reach n / climb stairs / build a sum with ordered steps"
  - "at each position choose take / skip, and a choice blocks its neighbours (house robber)"
  - "minimum cost / steps to reach the end, jumps of bounded length (frog)"
  - "answer for prefix i depends only on a few earlier prefixes"
  - "n up to 1e6 and the answer is mod 1e9+7"
idea: |
  `dp[i]` = answer for the **prefix ending at i** (or for value i). Write the transition by
  asking **what was the last step**: the last throw, the last element taken, the last jump.
  Each choice of last step points to a smaller state, so `dp[i] = combine over choices of dp[i - step]`.
  Fix the **base case** (`dp[0]` = 1 for counting, 0 for cost) and fill in increasing i. When only
  the last k values are read, keep **k rolling variables** instead of the array.
complexity: "O(n × choices) time, O(n) or O(k) memory"
pitfalls:
  - "dp[0] = 1 for counting (the empty way), not 0, or every count comes out 0."
  - "Guard `s-d >= 0` in the inner loop (`d <= s`), or you read dp[-1]."
  - "Take mod inside the loop on every addition, not once at the end: the counts overflow ll quickly."
  - "Ordered vs unordered: looping sums outer and steps inner counts SEQUENCES. For multisets see knapsack-unbounded."
  - "Min-cost with unreachable states: init with a big value and skip it, don't add to INF."
related: [dp-grid, knapsack-unbounded, state-machine-dp, dp-monotonic-queue]
---
### Common shapes

| problem | state | transition |
|---|---|---|
| ways to sum n with steps 1..6 (template) | `dp[s]` | `dp[s] = Σ dp[s-d]` |
| frog: min cost, jump 1..k | `dp[i]` | `min(dp[i-j] + |h[i]-h[i-j]|)` |
| house robber (no two adjacent) | `dp[i]` | `max(dp[i-1], dp[i-2] + a[i])` |
| min steps, subtract a digit of x (CSES Removing Digits) | `dp[x]` | `1 + min dp[x-d]` over digits d of x |
| decode ways (1-26) | `dp[i]` | `dp[i-1]` if one digit valid `+ dp[i-2]` if two digits valid |

### The key loop
```cpp
vi dp(n+1,0);
dp[0]=1;
for(ll s=1;s<=n;s++)
    for(ll d=1;d<=6&&d<=s;d++)
        dp[s]=(dp[s]+dp[s-d])%mod;   // last throw was d
```

### When it's not enough
If a state also needs "what did I do last" (holding a stock, last colour used), add a small
second dimension: that's state-machine-dp. If the transition is `min over a window of dp[j]`,
a monotonic deque makes it O(n).
