---
id: dijkstra
title: Dijkstra
signals:
  - "shortest path / minimum cost with non-negative weights"
  - "single source, n and m up to 2e5"
  - "state graph with costs: (city, used coupon), (cell, fuel), k-th edge discount"
  - "minimise the max edge on a path (minimax), or maximise probability (multiply)"
  - "count shortest paths / find nodes on some shortest path"
idea: |
  Min-heap of `{dist, node}`. Pop the smallest; if it's **stale** (`d != dist[u]`) skip it,
  otherwise relax all out-edges and push improvements. The first valid pop of a node is
  final because weights are **non-negative**. For extra constraints, run it on a **state
  graph** (`dist[node][flag]`). Run from the target on the reversed graph for "to t" questions.
complexity: "O((n + m) log m)"
pitfalls:
  - "Missing the stale check: still correct but can degrade to O(m·deg) on dense graphs and TLE."
  - "Distances overflow int: 2e5 edges × 1e9 → use ll and LINF, and never add to LINF."
  - "Default priority_queue is a MAX-heap. Use `greater<pi>`, or push negated distances."
  - "Pair order: `{dist, node}`, not `{node, dist}`, or the heap sorts by node id."
  - "Negative edges break it silently. Use Bellman-Ford (or potentials)."
related: [bfs, zero-one-bfs, bellman-ford, floyd-warshall]
---
### Key loop

```cpp
dist[s]=0; pq.push({0,s});
while(!pq.empty()){
    auto [d,u]=pq.top(); pq.pop();
    if(d!=dist[u]) continue;              // stale
    for(auto [v,w]:adj[u]) if(d+w<dist[v]){ dist[v]=d+w; pq.push({dist[v],v}); }
}
```

### Variants

| ask | change |
|---|---|
| one coupon halves one edge (CSES 1195) | `dist[v][used]`, edges to `[v][1]` with `w/2` |
| count shortest paths | `cnt[v]=cnt[u]` on strict improve, `+=` on tie |
| k shortest walks (CSES 1196) | let each node pop k times |
| minimax path | relax with `max(d,w)` instead of `d+w` |
| edge on some shortest path | `d1[u]+w+dn[v]==d1[n]` with a run from each end |
