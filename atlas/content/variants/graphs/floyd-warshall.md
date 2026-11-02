---
id: floyd-warshall
title: Floyd-Warshall
signals:
  - "all-pairs shortest paths, many (s, t) queries"
  - "n ≤ 400–500"
  - "transitive closure: can i reach j? (reachability, ordering from comparisons)"
  - "add vertices one by one and report the sum of all distances (reverse deletion order)"
  - "minimum weight cycle / graph diameter on a small graph"
idea: |
  `d[i][j]` starts as the direct edge (min over parallel edges, 0 on the diagonal). For each
  middle vertex **k in the OUTER loop**, try `d[i][k] + d[k][j]`. After round k, `d[i][j]` is
  the best path using only vertices 1..k inside. Negative edges are fine; **`d[i][i] < 0`**
  afterwards means i is on a negative cycle. Because k is "the vertices allowed so far",
  adding vertices in some order and querying after each is natural.
complexity: "O(n³) time, O(n²) memory"
pitfalls:
  - "Loop order: k must be outermost. `i,j,k` gives wrong answers."
  - "Parallel edges: take the min, don't overwrite with the last one read."
  - "INF + INF overflows: use 1e18 and skip when either side is INF, not LINF."
  - "Forgetting d[i][i] = 0."
  - "n = 500 with ll is fine (2 MB); n = 2000 is not O(n³). Run Dijkstra from each source instead."
related: [dijkstra, bellman-ford, bfs]
---
### Key loop

```cpp
for(ll k=1;k<=n;k++)
    for(ll i=1;i<=n;i++) if(d[i][k]<BIG)
        for(ll j=1;j<=n;j++) if(d[k][j]<BIG)
            d[i][j]=min(d[i][j],d[i][k]+d[k][j]);
```

### Variants

| ask | change |
|---|---|
| reachability | `bool`, `r[i][j] |= r[i][k] && r[k][j]` (or bitsets) |
| negative cycle on path i→j | some k with d[i][k], d[k][j] finite and d[k][k] < 0 |
| add vertices online (CF 295B) | reverse deletion order, k = newly added vertex |
| minimax / maximin path | replace `+` with `max`, `min` with `min` (or vice versa) |
| one new edge (u,v,w) | `d[i][j]=min(d[i][j], d[i][u]+w+d[v][j], d[i][v]+w+d[u][j])` in O(n²) |
