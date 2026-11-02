---
id: dp-prefix-opt
title: Prefix-Sum Optimisation
signals:
  - "dp[i][j] = Σ dp[i-1][k] over a contiguous RANGE of k (j-a..j, or k < j)"
  - "count ways to distribute K items with per-person caps (bounded knapsack counting)"
  - "count permutations with exactly k inversions"
  - "each step moves to any position within distance d / any smaller value"
  - "naive O(n·K²) is too slow by exactly one factor"
idea: |
  When a transition **sums a contiguous range** of the previous row, build that row's
  **prefix sums** once and answer each range in O(1): `nd[j] = pre[j+1] - pre[lo]`.
  This drops one factor of the range length. Range bounds that depend on `j` are fine
  as long as the range is contiguous. Under a modulus, **add mod before taking %**
  after subtracting.
complexity: "O(n · K) instead of O(n · K²)"
pitfalls:
  - "`(pre[r]-pre[l])%mod` can be negative: write `(pre[r]-pre[l]+mod)%mod`."
  - "Off-by-one in pre: with pre[0]=0, sum of dp[l..r] is pre[r+1]-pre[l]."
  - "Clamp the left bound at 0 (`max(0, j-a[i])`) and the right bound at K."
  - "Excluding the current cell (move to a DIFFERENT floor, CF 479E): subtract dp[j] from the range."
  - "Memory: two rows plus a prefix row, not n·K."
related: [knapsack-bounded, prefix-sum-1d, difference-array, dp-monotonic-queue]
---
### The pattern (Candies, the template)
```cpp
for(ll j=0;j<=k;j++)pre[j+1]=(pre[j]+dp[j])%mod;
for(ll j=0;j<=k;j++){
    ll lo=max(0LL,j-a[i]);
    nd[j]=(pre[j+1]-pre[lo]+mod)%mod;   // Σ dp[lo..j]
}
```

### Where it shows up

| problem | range summed |
|---|---|
| candies with caps a[i] | `dp[j-a[i] .. j]` |
| k inverse pairs (insert n-th element) | `dp[j-(n-1) .. j]` |
| riding in a lift (CF 479E) | floors with `|y-x| < |x-b|`, minus x itself |
| array without local maxima (CF 1067A) | values `< v` or `> v` per state |

Push version: add `+v` at `l` and `-v` at `r+1` of a **difference array**, then prefix-sum it.
