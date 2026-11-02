---
id: fenwick-inversions
title: Counting Inversions
signals:
  - "count pairs i < j with a[i] > a[j]"
  - "minimum adjacent swaps to sort / to turn one permutation into another"
  - "for each element, how many smaller elements are to its right"
  - "inversions after each cyclic shift / after moving one element"
  - "pairs i < j with a condition on values only (a[i] + something > a[j])"
idea: |
  Sweep left to right with a **BIT over values**: before inserting `a[i]`, the number of
  earlier values greater than it is **`i - query(a[i])`**. Values up to 1e9 need
  **coordinate compression** first. Adjacent-swap distance = inversions; "transform p into q"
  = relabel by positions in q, then count. Moving the front `x` of a permutation of
  `0..n-1` to the back changes the count by **`(n-1-x) - x`**.
complexity: "O(n log n)"
pitfalls:
  - "Answer up to n²/2 ≈ 2e10 for n = 2e5: needs ll."
  - "Equal values are NOT inversions: count strictly greater, i.e. `i - query(v)` where query is ≤ v."
  - "0-based values into a 1-based BIT: insert v+1."
  - "Forgot to compress values up to 1e9, so the BIT gets 1e9 slots."
  - "Merge sort gives the same count; pick whichever you can write without bugs."
related: [fenwick-point-range, coordinate-compression, pbds-order-statistics]
---
### Core loop
```cpp
for(ll i=0;i<n;i++){
    ll v=rank[i];            // compressed, 1-based
    inv+=i-bit.query(v);     // earlier ones that are strictly bigger
    bit.update(v,1);
}
```

### Variants
| question | how |
|---|---|
| min adjacent swaps to sort | inversion count |
| swaps to turn s into t (same multiset) | map each char of s to its next position in t (queue per char), count inversions |
| count smaller to the right of each i | sweep right to left, `query(v-1)` |
| inversions of all cyclic shifts | count once, then `inv += (n-1-x) - x` per rotation |
| pairs with a[i] > 2·a[j] | sweep, query count of values > 2·a[j] (compress both sets) |
