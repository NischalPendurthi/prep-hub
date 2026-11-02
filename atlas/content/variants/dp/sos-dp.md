---
id: sos-dp
title: SOS (Sum over Subsets) DP
signals:
  - "for every mask, sum / count / max of f over all its SUBMASKS (or supermasks)"
  - "values up to 1e6 ≈ 2^20, and you need pairs with x & y == 0 or x | y == x"
  - "count subsets whose AND is 0 (SOS + inclusion–exclusion)"
  - "for each a[i], find some a[j] with a[i] & a[j] == 0"
  - "O(3^n) submask enumeration is too slow, n around 20"
idea: |
  `F[m] = Σ f[s]` over submasks `s ⊆ m`. Process **one bit at a time**: for bit `b`,
  every mask with bit `b` set absorbs the value of the mask without it,
  `F[m] += F[m ^ (1<<b)]`. After all bits, each submask was added exactly once (its path
  of removed bits is unique). **Supermask** sums are the mirror image: if bit `b` is
  **not** set, `F[m] += F[m | (1<<b)]`. Questions about `x & y == 0` become "y is a
  **submask of ~x**".
complexity: "O(B · 2^B) time, O(2^B) memory (B = 20 → 2·10^7)"
pitfalls:
  - "Loop order: bits OUTSIDE, masks inside. Swapping them double counts."
  - "B must cover the max value: 1e6 needs B = 20, not 19."
  - "x & y == 0 counts: complement within B bits (`full ^ x`), not `~x`, which is negative."
  - "Counting pairs (i, j) from the same array: an element can pair with itself (x & x == 0 only when x = 0); subtract if i ≠ j is required."
  - "For max/any-index instead of sums, store the best (or any) index and merge with max, not +."
related: [bitmask-dp, submask-enumeration, inclusion-exclusion]
---
### The two loops
```cpp
for(ll b=0;b<B;b++)
    for(ll m=0;m<(1LL<<B);m++){
        if(m>>b&1) sub[m]+=sub[m^(1LL<<b)];   // sum over submasks
        else       sup[m]+=sup[m|(1LL<<b)];   // sum over supermasks
    }
```
Undo (Möbius / inverse): same loops with `-=`.

### What each question becomes (Bit Problem template)

| asked for each x | answer |
|---|---|
| #y with `x | y == x` | y ⊆ x: `sub[x]` |
| #y with `x & y == x` | y ⊇ x: `sup[x]` |
| #y with `x & y != 0` | `n - sub[full ^ x]` |
| some y with `x & y == 0` (CF 165E) | store any index in `sub`, look up `full ^ x` |
| #subsets with AND = 0 (CF 449D) | `g[m] = 2^{sup[m]} - 1`, then inclusion–exclusion over popcount |
