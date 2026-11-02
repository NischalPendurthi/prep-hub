---
id: lca-binary-lifting
title: LCA by Binary Lifting
signals:
  - "lowest common ancestor / nearest common boss of two nodes, many queries"
  - "k-th ancestor of a node (k up to n)"
  - "the k-th node on the path from u to v"
  - "max / min / sum of edge weights on the path between u and v (static tree)"
  - "first ancestor whose value is >= x (values monotone up the tree)"
idea: |
  `up[k][u]` = the `2^k`-th ancestor, built by **`up[k][u] = up[k-1][up[k-1][u]]`**. Any jump of
  length d is the binary digits of d. For `lca(a,b)`: **lift the deeper node to the same depth**,
  return if equal, then **for k from high to low jump both while `up[k][a] != up[k][b]`**; they
  stop just below the LCA, so the answer is `up[0][a]`. Store an aggregate `mx[k][u]` next to
  `up` to get path max/min in the same loops. Use **0 as the ancestor of the root** so jumps past it
  stay at 0.
complexity: "O(n log n) build and memory, O(log n) per query"
pitfalls:
  - "Jumping from low to high bits in the second loop. It must go from LOG-1 down to 0."
  - "Not lifting to equal depth first, or forgetting the `if(a==b) return a` check."
  - "LOG too small: 2^LOG must exceed the maximum depth (n). LOG = 20 is safe for n up to 1e6."
  - "Assuming a parent has a smaller id. Compute depth with BFS/DFS from the root, not a single forward loop."
  - "Building up[k] for a node before its parent's up[k-1] exists. Loop k outermost."
related: [tree-distance-queries, functional-graph, sparse-table-rmq, subtree-euler-tour]
---
### What binary lifting answers

| query | how |
|---|---|
| k-th ancestor | jump each set bit of k; 0 means it doesn't exist |
| lca(a,b) (template) | equalise depth, then descend bits while ancestors differ |
| path aggregate (max edge on u-v) | `mx[k][u]` = max over the 2^k edges above u, combine during both lifts |
| k-th node on u-v path | `l = lca`; if `k <= depth[u]-depth[l]` lift u by k, else lift v by `dist-k` |
| first ancestor with value >= x | descend bits, jump while `val[up[k][u]] < x` |

### The query
```cpp
if(depth[a]<depth[b])swap(a,b);
for(ll k=0;k<LOG;k++) if((depth[a]-depth[b])>>k&1) a=up[k][a];
if(a==b)return a;
for(ll k=LOG-1;k>=0;k--) if(up[k][a]!=up[k][b]){a=up[k][a];b=up[k][b];}
return up[0][a];
```
Compute `diff` before the loop if you write it as in the template: `depth[a]` changes as you lift.

### Alternatives
Euler tour + sparse table gives O(1) LCA after O(n log n); offline Tarjan with DSU is O(n α).
Binary lifting is the one to know: it also gives k-th ancestor and path aggregates.
