---
id: segtree-descent
title: Descent (First Index with Property)
signals:
  - "first index with a[i] ≥ x, with updates (hotel queries, first fit)"
  - "first position in [l, n] whose value exceeds x"
  - "k-th one / k-th alive element with updates"
  - "smallest r such that sum(l..r) ≥ s, many queries"
idea: |
  Store an aggregate that tells you **whether a subtree contains an answer** (max for "≥ x",
  count for k-th, sum for prefix ≥ s). At each node, **go left if the left child qualifies**,
  otherwise go right (subtracting the left's count/sum for k-th or prefix queries). One
  root-to-leaf walk: **O(log n)**, versus O(log² n) for a binary search over range queries.
  For "first index ≥ l", recurse, skip nodes that end before `l` or whose max fails.
complexity: "O(log n) per descent (O(log n) amortised for the ≥ l version)"
pitfalls:
  - "Check the root first: if no element qualifies, return 0 / -1 before descending."
  - "k-th / prefix descent: subtract the left child's value when you go right."
  - "Restricted to [l, n]: a node that is fully inside but fails must be pruned in O(1) using its max, or it degrades to O(n)."
  - "Binary search + range query is O(log² n): often fine, but TLE for 1e6 queries."
related: [segtree-basic, fenwick-kth, bs-on-answer]
---
### First index with value ≥ x (whole array)
```cpp
if(tree[1]<x)return 0;
ll node=1,st=1,end=n;
while(st<end){
    ll mid=(st+end)/2;
    if(tree[2*node]>=x){node=2*node;end=mid;}
    else{node=2*node+1;st=mid+1;}
}
return st;
```

### First index ≥ l with value ≥ x
```cpp
ll first(ll node,ll st,ll end,ll l,ll x){
    if(end<l || tree[node]<x)return -1;   // prune whole subtree
    if(st==end)return st;
    ll mid=(st+end)/2;
    ll res=first(2*node,st,mid,l,x);
    return res!=-1?res:first(2*node+1,mid+1,end,l,x);
}
```

| aggregate | question | go right means |
|---|---|---|
| max | first ≥ x | left max < x |
| count of ones | k-th one | `k -= cnt(left)` |
| sum (non-negative) | first prefix ≥ s | `s -= sum(left)` |
