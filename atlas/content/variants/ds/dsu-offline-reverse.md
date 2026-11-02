---
id: dsu-offline-reverse
title: Offline DSU (Reverse Deletions)
signals:
  - "edges (or vertices / cells) are REMOVED one by one; report connectivity after each removal"
  - "destroy array elements in a given order, max segment sum after each step"
  - "all queries known in advance, and the operation is easy to add but hard to undo"
  - "answer queries 'using only edges with weight <= w': sort queries and edges together"
idea: |
  DSU can merge but not split. If all operations are known up front, **reverse time**: start from the
  **final state** (everything that is never removed), then **add the removed items back in reverse
  order**. The answer for "after removal i" is the state **before** adding item i back, so **record
  first, then unite**. The same offline idea covers threshold queries: **sort queries by threshold**,
  and add edges with weight <= threshold as the sweep passes them.
complexity: "O((m + k) α(n)) plus sorting"
pitfalls:
  - "Off by one: store the answer BEFORE re-adding item i, since 'after removal i' still lacks it."
  - "The starting graph must exclude every edge that is removed at some point."
  - "Removals may name the edge as (b, a). Normalise to (min, max) before matching."
  - "Vertex deletions (CF 722C): a re-added vertex is active only now; merge it only with ACTIVE neighbours."
  - "The output is in forward order; fill `ans[i]` going backwards and print from 0."
related: [dsu-basic, mst-kruskal, sweep-line-events]
---
### Typical shapes

| removed thing | final state | re-add step |
|---|---|---|
| edges (CSES 1677) | edges never removed | `unite(u,v)`, components drop on a merge |
| array cells (CF 722C) | nothing active | activate i, unite with active i-1, i+1, track max sum |
| grid cells / walls | cells never removed | activate cell, unite with active neighbours |
| threshold queries (CF 1213G) | empty | sort edges by w, add those with `w <= q` before answering q |

### The reverse loop
```cpp
// d already contains every edge that is never removed
for(ll i=k-1;i>=0;i--){
    ans[i]=comps;                          // state right after removal i
    if(d.unite(del[i].first,del[i].second))comps--;
}
```

### Spotting it
"After each deletion" plus all deletions given in the input is the signal. If the queries are online
(each depends on the previous answer), this does not work; you need a dynamic connectivity structure
instead.
