---
id: mst-prim
title: Prim
signals:
  - "complete graph on points: cost between every pair (Manhattan / Euclidean distance)"
  - "n ≤ ~5000 with all n² edges implicit, so an edge list doesn't fit"
  - "connect everything with minimum cost and the adjacency list is already built"
  - "grow a tree from one start vertex, always taking the cheapest edge out"
idea: |
  Grow one tree from vertex 1. Keep a **min-heap of (w, v)** for edges leaving the tree; pop,
  **skip if v is already in the tree** (stale entry), otherwise add v and push its edges.
  It is Dijkstra with `dist = w` instead of `dist[u] + w`. For dense / complete graphs use the
  **O(n²) array version**: `best[v]` = cheapest edge from the tree to v, pick the min unvisited
  each round, no heap and no edge list.
complexity: "Heap: O(m log m). Array version: O(n²), the best choice for complete graphs"
pitfalls:
  - "Using `dist[u]+w` out of Dijkstra habit. Prim's key is the edge weight alone."
  - "Not skipping popped vertices already in the tree, so the same vertex is added twice."
  - "Disconnected graph: check `taken == n`, not just that the heap ran empty."
  - "Building n² edges into a heap for a complete graph (memory/TLE). Use the O(n²) array form."
related: [mst-kruskal, dijkstra, dsu-basic]
---
### O(n²) version for complete graphs (points)
```cpp
vi best(n,LINF),in(n,0); best[0]=0; ll cost=0;
for(ll it=0;it<n;it++){
    ll u=-1;
    for(ll v=0;v<n;v++) if(!in[v] && (u==-1 || best[v]<best[u])) u=v;
    in[u]=1; cost+=best[u];
    for(ll v=0;v<n;v++) if(!in[v]) best[v]=min(best[v],dist(u,v)); // dist computed on the fly
}
```

### Prim vs Kruskal
| Situation | Pick |
|---|---|
| Edge list, m ~ 2e5 | Kruskal (simpler, also gives components) |
| Complete graph, n ≤ 5000 | Prim O(n²) |
| Complete graph minus a few edges (CF 1242B 0-1 MST) | BFS/Prim over a set of unvisited vertices |
| Need the order the tree grows from a root | Prim |
