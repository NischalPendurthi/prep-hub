---
id: fenwick-point-range
title: Point Update, Range Sum
signals:
  - "change one element, ask the sum of a range, both up to 2e5 times"
  - "running prefix sums while the array keeps changing"
  - "count how many earlier elements are ≤ x (BIT over values)"
  - "dp[i] = sum of dp[j] over j with smaller key: BIT over keys, mod p"
idea: |
  `tree[i]` stores the sum of `a(i - lowbit(i), i]`. **Update** climbs with `i += i&-i`,
  **prefix query** descends with `i -= i&-i`, both O(log n). A range is
  **`query(r) - query(l-1)`**. A "set" is an add of **`new - old`**, so keep the plain
  array beside the BIT. Works for any invertible operation (sum, xor, sum mod p), not for min/max.
complexity: "O(n log n) build by n adds (O(n) possible), O(log n) per update/query, O(n) memory"
pitfalls:
  - "Index 0: `i -= i&-i` never leaves 0 and `i += i&-i` loops forever. Shift to 1-based."
  - "Point SET done as `add(k,u)`, forgetting to subtract the old value and update a[k]."
  - "Sums of 2e5 values up to 1e9 overflow int; use ll for the tree."
  - "Mod version: `query(r)-query(l-1)` can be negative, add mod before %."
  - "Min/max BIT only works if values only improve; for general min use a segment tree."
related: [fenwick-range-point, fenwick-inversions, segtree-basic, prefix-sum-1d]
---
### Core
```cpp
void update(ll i,ll val){for(;i<=n;i+=i&-i)tree[i]+=val;}
ll query(ll i){ll r=0;for(;i>0;i-=i&-i)r+=tree[i];return r;}
// sum a[l..r] = query(r)-query(l-1)
```

### BIT or segment tree?

| need | use |
|---|---|
| point add, range sum / xor | BIT (shorter, ~3x faster) |
| range add, point query | BIT on the difference array |
| range add, range sum | two BITs, or a lazy segtree |
| min / max with arbitrary updates | segment tree |
| k-th smallest / first prefix ≥ k | BIT binary lifting |

### Over values instead of positions
Index the BIT by (compressed) value: `add(v,1)` when you see `v`, `query(v)` = how many seen ≤ v.
This is the base of inversion counting and "count smaller before me" DP.
