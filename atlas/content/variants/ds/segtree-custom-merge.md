---
id: segtree-custom-merge
title: Custom Node Merge
signals:
  - "max subarray sum with point updates / over a range"
  - "longest run of equal / increasing / 1s in a range, with updates"
  - "longest balanced bracket subsequence in [l, r]"
  - "the answer for [l, r] is not a simple min/sum but can be built from two halves"
idea: |
  Make the node a **struct** with exactly enough fields that `merge(L, R)` can be computed
  from the two halves alone. Max subarray: **sum, best prefix, best suffix, best**, and the
  answer may **cross the middle** (`L.suf + R.pref`). Brackets: matched, unmatched open,
  unmatched close; `m = min(L.open, R.close)`. The merge is usually **not commutative**, so
  always merge left then right, also in queries.
complexity: "O(log n · merge cost) per update/query"
pitfalls:
  - "Querying with an identity node that isn't neutral (e.g. pref=0 when empty is not allowed). Split the query by mid instead, as the template does."
  - "Merging right then left in query: wrong for any non-commutative merge."
  - "Empty subarray allowed or not: leaf pref/suf/best = max(v,0) vs v."
  - "Forgetting a field: if merge needs something that isn't stored, add it to the node."
related: [segtree-basic, segtree-lazy, dp-linear]
---
### Merge
```cpp
Node merge(const Node &L,const Node &R){
    return {L.sum+R.sum,
            max(L.pref,L.sum+R.pref),
            max(R.suf,R.sum+L.suf),
            max({L.best,R.best,L.suf+R.pref})};
}
```

### Node recipes
| query | fields | key merge |
|---|---|---|
| max subarray sum | sum, pref, suf, best | `best = max(L.best, R.best, L.suf+R.pref)` |
| longest run of 1s | len, pref, suf, best | `pref = L.pref==L.len ? L.len+R.pref : L.pref` |
| bracket subsequence (CF 380C) | match, open, close | `m=min(L.open,R.close)`, `match=L.match+R.match+2m` |
| sorted? / count of descents | first, last, bad | `bad = L.bad+R.bad+(L.last>R.first)` |
| polynomial hash of range | hash, len | `hash = L.hash*p^R.len + R.hash` |
