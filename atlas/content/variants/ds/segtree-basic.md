---
id: segtree-basic
title: Point Update, Range Query
signals:
  - "change a[k], ask min / max / gcd / sum over [l, r], mixed, up to 2e5"
  - "range query with an operation that has no inverse (min, max, gcd, and, or)"
  - "dp[i] = best dp[j] over j in a range of indices or values"
  - "Fenwick won't do because the operation isn't subtractable"
idea: |
  Node `node` covers `[st, end]`; children `2node` and `2node+1` split at `mid`. **Build**
  bottom-up, **update** walks to the leaf and re-merges on the way back, **query** returns the
  **identity** for disjoint nodes, the node value when fully inside, otherwise merges both
  children. Any **associative** `merge` with an identity works.
complexity: "O(n) build, O(log n) update/query, 4n nodes"
pitfalls:
  - "Size the tree 4n, not 2n, for the recursive layout."
  - "Wrong identity: min needs LINF, max needs -LINF (or NINF), gcd and sum need 0."
  - "1-based leaves with a 0-based input array: decide once and build from arr[st] accordingly."
  - "n = 0 never happens in input, but build(1,1,0) would recurse forever; guard if n can be 0."
related: [segtree-lazy, segtree-descent, segtree-custom-merge, sparse-table-rmq]
---
### Core
```cpp
ll query(ll node,ll st,ll end,ll l,ll r){
    if(st>r || end<l)return LINF;          // identity of min
    if(l<=st && end<=r)return tree[node];
    ll mid=(st+end)/2;
    return min(query(2*node,st,mid,l,r),query(2*node+1,mid+1,end,l,r));
}
```

### Swap the merge
| query | merge | identity |
|---|---|---|
| min / max | `min` / `max` | `LINF` / `-LINF` |
| sum | `+` | 0 |
| gcd | `__gcd` | 0 |
| and / or / xor | `&` / `\|` / `^` | all ones / 0 / 0 |
| min and its index | `min` on `pi{val,idx}` | `{LINF,-1}` |

### When something else is better
Static array: sparse table (O(1) query). Invertible op (sum, xor): Fenwick.
