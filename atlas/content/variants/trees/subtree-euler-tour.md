---
id: subtree-euler-tour
title: Subtree Sizes & Euler Tour
signals:
  - "for every node, the number of nodes / sum of values in its subtree"
  - "update a node's value, then ask the sum (min, max, count) over a whole subtree"
  - "is u an ancestor of v? asked many times"
  - "add x to every node in the subtree of u, then query a single node"
  - "count employees under each manager (subordinates)"
idea: |
  One DFS from the root gives `sz[u] = 1 + Σ sz[child]` and an entry time `tin[u]=++timer`.
  Because DFS finishes a subtree before leaving it, **u's subtree is exactly the positions
  `[tin[u], tout[u]]`** with `tout[u] = tin[u]+sz[u]-1`. That **flattens the tree into an array**:
  store node u at position `tin[u]` and every subtree query becomes a range query on a Fenwick or
  segment tree. **u is an ancestor of v iff `tin[u] <= tin[v] && tout[v] <= tout[u]`.**
complexity: "O(n) for the tour, then O(log n) per subtree update/query with a BIT"
pitfalls:
  - "Indexing the BIT by node id instead of tin[u]. The value of node u lives at position tin[u]."
  - "Point SET with a BIT: add `x - val[s]` and then update val[s], or later updates are wrong."
  - "Recursive DFS on a 2e5 path can overflow the stack on some judges. Use an iterative order or raise the stack."
  - "Setting tout before visiting the children. It must be the timer after the last child returns."
  - "Sums of 2e5 values up to 1e9 overflow int, so the BIT must be ll."
related: [fenwick-point-range, segtree-basic, tree-dp, lca-binary-lifting]
---
### Which structure on the flattened array

| query on the tree | on the array | structure |
|---|---|---|
| subtree sum, point update | range sum `[tin, tout]`, point add | Fenwick (template) |
| add to subtree, query node | range add, point query | Fenwick on a difference array |
| add to subtree, subtree sum | range add, range sum | lazy segtree |
| path root→u sum, point update | add `+x` at `tin`, `-x` at `tout+1`, prefix sum at `tin[u]` | Fenwick |
| distinct values in subtree | offline range-distinct queries | BIT + sort by right end, or [small-to-large](#small-to-large) |

### The tour
```cpp
function<void(ll,ll)> dfs = [&](ll u,ll p){
    tin[u]=++timer;
    for(ll v:adj[u]) if(v!=p){ dfs(v,u); sz[u]+=sz[v]; }
    tout[u]=timer;
};
```
Store `order[tin[u]] = u` too if you need "which node sits at position i".

### How to spot it
The query names a subtree and asks for something a range structure can do on an array.
If the question is about a path between two arbitrary nodes instead, it is LCA work.
