---
id: tree-distance-queries
title: Distance Queries
signals:
  - "number of edges / total weight on the path between u and v, many queries"
  - "is node x on the path from u to v?"
  - "sum over pairs of distances, or count pairs at distance k (small k)"
  - "path from a to b and from c to d: do they intersect / meet"
  - "add 1 to every node on a path, then read node values (offline)"
idea: |
  Root the tree, store `depth[u]` (or `dist[u]` = root-to-u weight). Then
  **`dist(u,v) = depth[u] + depth[v] - 2*depth[lca(u,v)]`**, because the shared part root→lca is
  counted twice. Most path questions reduce to this: **x is on path(u,v) iff
  `dist(u,x)+dist(x,v)==dist(u,v)`**. For **path updates offline**, add +1 at u and v, -1 at lca and
  -1 at parent(lca), then a subtree sum gives each node's count.
complexity: "O(n log n) preprocessing, O(log n) per query"
pitfalls:
  - "Weighted trees: keep dist[] (weights) separately from depth[] (levels). Lifting needs depth."
  - "Path counting with the difference trick: the lca gets -1 and parent(lca) gets -1 (for nodes); for edges use -2 at the lca."
  - "Weighted distances overflow int: ll for dist[]."
  - "u == v must give 0. Check queries where a node is its own lca."
related: [lca-binary-lifting, subtree-euler-tour, tree-diameter, bfs]
---
### Sub-cases

| question | formula |
|---|---|
| edges on path u-v (template) | `depth[u]+depth[v]-2*depth[l]` |
| weight on path u-v | `dist[u]+dist[v]-2*dist[l]` |
| x on path u-v | `d(u,x)+d(x,v)==d(u,v)` |
| paths a-b and c-d intersect | let `x`=deeper of `lca(a,b)`, `lca(c,d)`; they meet iff x is on the other path |
| +1 on every node of many paths, read all | diff at u, v, lca, par(lca), then subtree sums |
| sum of all pairwise distances | per edge: `sz[v]*(n-sz[v])`, no LCA needed |

### Path difference trick
```cpp
cnt[u]++; cnt[v]++; cnt[l]--; if(up[0][l]) cnt[up[0][l]]--;
// after all paths: process nodes deepest first, cnt[parent]+=cnt[child]
```

### How to spot it
"Distance between two nodes" in a tree is never BFS per query: n, q up to 2e5 means LCA.
