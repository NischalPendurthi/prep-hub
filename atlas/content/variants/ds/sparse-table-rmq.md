---
id: sparse-table-rmq
title: Static Range Min/Max
signals:
  - "array never changes, up to 1e6 min/max/gcd queries"
  - "range min used inside another loop (binary search, two pointers) and log² is too slow"
  - "LCA via Euler tour + RMQ"
  - "for each l, extend r while gcd/min stays above a threshold"
idea: |
  `sp[j][i]` = answer on `a[i .. i+2^j-1]`, built as `sp[j][i] = op(sp[j-1][i],
  sp[j-1][i+2^(j-1)])`. A query takes `k = lg[len]` and **two overlapping blocks**
  `sp[k][l]` and `sp[k][r-2^k+1]`. Overlap is fine because min, max, gcd, and, or are
  **idempotent**. Sum is not: either use disjoint blocks (O(log n)) or prefix sums.
complexity: "O(n log n) build and memory, O(1) query"
pitfalls:
  - "Using floor(log2()) from <cmath> per query: slow and off by one on exact powers; precompute lg[]."
  - "Using the overlap trick for sum or count: double counts."
  - "1-based queries into a 0-based table."
  - "Memory: 20 × 1e6 ll = 160 MB. Use int or vector<vector<int>> when n is 1e6."
  - "Any updates at all: switch to a segment tree."
related: [segtree-basic, lca-binary-lifting, monotonic-deque]
---
### Build and query
```cpp
for(ll i=2;i<=n;i++)lg[i]=lg[i/2]+1;
sp[0]=a;
for(ll j=1;(1LL<<j)<=n;j++)
    for(ll i=0;i+(1LL<<j)<=n;i++)
        sp[j][i]=min(sp[j-1][i],sp[j-1][i+(1LL<<(j-1))]);
ll k=lg[r-l+1];
ll ans=min(sp[k][l],sp[k][r-(1LL<<k)+1]);
```

### Pick the tool
| updates? | op | tool |
|---|---|---|
| none | min/max/gcd | sparse table, O(1) |
| none | sum/xor | prefix array |
| point | any associative | segment tree |
| sliding window of fixed width | min/max | monotonic deque, O(n) total |
