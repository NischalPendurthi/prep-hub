---
id: bfs
title: BFS Shortest Path
signals:
  - "minimum number of moves / steps / edges / transfers"
  - "unweighted graph, or every move costs the same"
  - "print one shortest route, not just its length"
  - "state graph: (position, extra info) with unit-cost transitions (knight moves, word ladder, lock combos)"
  - "n, m up to 2e5: needs O(n + m)"
idea: |
  A queue visits nodes in order of distance, so the **first time a node is reached is
  its shortest distance**. Set `dist[v]` and `par[v]` **when pushing**, not when popping,
  so each node enters the queue once. To print the path, walk `par` back from the target
  and reverse. If the "node" is a state (cell + keys, number + digit), BFS the state graph.
complexity: "O(n + m) time and memory"
pitfalls:
  - "Marking visited on pop instead of push: a node gets queued many times, O(n·m) on dense graphs."
  - "Using BFS with weights other than all-equal. Weights 0/1 need 0-1 BFS; anything else needs Dijkstra."
  - "Undirected input: add both directions."
  - "Path reconstruction: stop at the source (par = -1) and reverse at the end; the CSES answer counts nodes, so it's dist + 1."
  - "State BFS: size the visited array by the full state, e.g. vis[cell][mask]."
related: [multi-source-bfs, zero-one-bfs, dijkstra, grid-flood-fill]
---
### Key loop

```cpp
dist[s]=0; q.push(s);
while(!q.empty()){
    ll u=q.front(); q.pop();
    for(ll v:adj[u]) if(dist[v]==-1){
        dist[v]=dist[u]+1; par[v]=u; q.push(v);   // mark on push
    }
}
```

### Which shortest-path tool

| edge weights | tool | time |
|---|---|---|
| all equal | BFS | O(n+m) |
| 0 or 1 (or 0 / k) | 0-1 BFS (deque) | O(n+m) |
| non-negative | Dijkstra | O(m log n) |
| negative allowed | Bellman-Ford | O(n·m) |
| all pairs, n ≤ 500 | Floyd-Warshall | O(n³) |

### Spotting it
"Minimum operations to turn X into Y" where each operation costs 1 is BFS over the
states, even if no graph is mentioned. Bound the state space first (values ≤ 1e6, masks ≤ 2^k).
