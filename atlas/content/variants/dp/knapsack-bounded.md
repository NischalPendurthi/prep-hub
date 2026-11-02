---
id: knapsack-bounded
title: Bounded Knapsack
signals:
  - "item i is available k_i times (copies, stock, limited supply)"
  - "multiple identical coins with counts, can we pay exactly x"
  - "n × W × k is too slow but n × W × log k fits"
  - "counts k_i up to 1e3–1e9"
idea: |
  **Binary splitting**: replace k copies by bundles of size `1, 2, 4, …, 2^p, rest`. Every count
  from 0 to k is a sum of a subset of these bundles, so a plain **0/1 knapsack** over the bundles is
  exact and has only `Σ log k_i` items. For pure feasibility (can we reach sum s), there is a simpler
  O(n·W) trick: `used[s]` = copies of the current item used to reach s, and only extend while
  `used[s-w] < k`.
complexity: "O(W · Σ log k_i) with binary splitting; O(n·W) with the used-count or monotone-queue trick"
pitfalls:
  - "The last bundle is the remainder `k - (2^p - 1)`, not the next power of two, or you allow more than k copies."
  - "Bundle weight `take * w` can exceed W; the loop `c >= w` skips it, but it must not overflow int."
  - "After splitting it's 0/1: loop capacity DOWNWARD."
  - "Expanding all k copies one by one is O(W · Σ k): TLE when k ~ 1000."
related: [knapsack-01, knapsack-unbounded, subset-sum-bitset, dp-monotonic-queue]
---
### Binary splitting
```cpp
for(ll i=0;i<n;i++){
    ll left=k[i];
    for(ll b=1;left>0;b*=2){
        ll take=min(b,left);              // 1,2,4,...,rest
        items.push_back({take*h[i],take*s[i]});
        left-=take;
    }
}
// then 0/1 knapsack over items
```

### Choosing the method

| need | method |
|---|---|
| max value, W ~1e5, k ~1e3 (template) | binary splitting + 0/1 |
| only feasibility of sums | `used[s]` counter, O(n·W) |
| feasibility, large W | binary splitting + bitset `can |= can << w` |
| max value, tight limits | monotone deque per residue `c mod w`, O(n·W) |
