---
id: segtree-lazy
title: Lazy Propagation
signals:
  - "add / assign / xor / flip over a RANGE, and ask range sum / min / count"
  - "range assign and range add mixed (CSES Range Updates and Sums)"
  - "flip all bits in [l, r], count ones; xor x onto [l, r], ask sum"
  - "paint segments with colours, ask how much of a colour"
idea: |
  A fully covered node takes the update **immediately** (`apply`: fix its value, remember the
  tag) and stops. Before going **below** a node, **`push`** its tag to both children. After
  recursing, re-merge. You need: how a tag changes a node's value **given its length**, and how
  two tags **compose** (add+add = add, xor^xor = xor, assign overrides everything). Xor onto a
  sum: keep **per-bit counts** so a flip of bit b is `cnt = len - cnt`.
complexity: "O(log n) per range update and query, O(n · state) memory"
pitfalls:
  - "Forgetting push() in query as well as update."
  - "Sum with add: value += x * (end - st + 1), not += x."
  - "Assign + add: an assign must clear the pending add; an add on top of an assign adds to the assign value."
  - "Using 0 as 'no tag' for assign when 0 is a valid value: keep a separate flag."
  - "Re-merge after recursing (tree[node] = merge(children)), or parents keep stale values."
related: [segtree-basic, segtree-custom-merge, fenwick-range-point]
---
### apply / push
```cpp
void apply(ll node,ll st,ll end,ll x){   // xor x onto the whole node
    ll len=end-st+1;
    for(ll b=0;b<B;b++)if(x>>b&1)tree[node][b]=len-tree[node][b];
    lazy[node]^=x;
}
void push(ll node,ll st,ll end){
    if(!lazy[node])return;
    ll mid=(st+end)/2;
    apply(2*node,st,mid,lazy[node]);
    apply(2*node+1,mid+1,end,lazy[node]);
    lazy[node]=0;
}
```

### Tag recipes
| update | node value | value change | compose new tag onto old |
|---|---|---|---|
| range add, sum | sum | `+= x*len` | `lazy += x` |
| range add, min | min | `+= x` | `lazy += x` |
| range assign, sum | sum | `= x*len` | replace, set flag |
| assign + add | sum | assign then add | assign clears add |
| xor x, sum | 20 bit counts | flip bits of x | `lazy ^= x` |
| flip 0/1, count ones | count | `= len - cnt` | `lazy ^= 1` |
