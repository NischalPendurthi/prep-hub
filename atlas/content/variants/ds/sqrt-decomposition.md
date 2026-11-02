---
id: sqrt-decomposition
title: Sqrt Decomposition
signals:
  - "n, q ≤ 1e5 and the operation doesn't fit a segment tree merge"
  - "jumps i -> i + a[i] with updates to a (holes, bouncing ball)"
  - "range update + 'count elements ≥ x in [l, r]' (sorted blocks)"
  - "time limit is generous (2–5 s) and an O((n+q)·sqrt n) idea is obvious"
idea: |
  Cut the array into **blocks of size B ≈ sqrt n**. Each block keeps a **summary** that
  answers a whole block in O(1) (or O(log B)); a query touches **O(n/B) whole blocks plus
  O(B) loose elements**, and an update **rebuilds one block** in O(B). For jump chains, store
  per position where you **leave the block** and how many jumps it took; positions only point
  forward, so a block rebuilds right to left. Tune B when the two costs differ (e.g. sorted
  blocks: B ≈ sqrt(n log n)).
complexity: "O(B) per update, O(n/B) per query; B = sqrt n gives O(sqrt n) each"
pitfalls:
  - "Rebuilding only position p: every earlier position in the same block can point through p."
  - "Last partial block: compute block id as i / B and bound loops by min(n, (b+1)·B)."
  - "Constant factor: use arrays, not vectors of vectors, and avoid % and / in hot loops."
  - "B = 0 for tiny n: use max(1, sqrt(n))."
  - "If queries can be reordered and there are no updates, Mo's algorithm may be simpler."
related: [segtree-basic, prefix-sum-1d, functional-graph]
---
### Jump chains (CF 13E)
```cpp
auto calc=[&](ll i){
    ll j=i+a[i];
    if(j>=n || j/B!=i/B){nxt[i]=j;cnt[i]=1;last[i]=i;}
    else{nxt[i]=nxt[j];cnt[i]=cnt[j]+1;last[i]=last[j];}
};
// update a[p]: for(i=p; i>=block start; i--) calc(i)
// query: while(p<n){total+=cnt[p]; lst=last[p]; p=nxt[p];}
```

### Block summaries
| problem | per block | query |
|---|---|---|
| range sum, range add | sum + pending add | whole blocks O(1), edges O(B) |
| count ≥ x in [l, r] with range add | sorted copy + pending add | binary search per block |
| jump until leaving | exit position, jump count | follow exits |
| rebuild every √q queries | static structure + small buffer of recent updates | static answer + scan buffer |
