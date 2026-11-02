---
id: cycle-detection
title: Cycle Detection
signals:
  - "find any cycle / round trip and print it"
  - "is there a circular dependency (deadlock, course prerequisites)?"
  - "directed graph: 3-colour DFS; undirected: a visited neighbour that isn't the parent"
  - "lengths of all cycles in a graph that is a cactus / has few cycles"
  - "n, m up to 2e5"
idea: |
  **Directed:** DFS with colours `0` unseen, `1` on the current path, `2` finished. An edge
  into a colour-1 node is a **back edge** and closes a cycle; walk `par` from `u` back to
  `v` to print it. Edges into colour-2 nodes are harmless. **Undirected:** any visited
  neighbour other than the **parent** closes a cycle (skip the parent by edge id if
  multi-edges exist). With depths stored, cycle length = `depth[u]-depth[v]+1`.
complexity: "O(n + m)"
pitfalls:
  - "Directed graph with only a visited/unvisited flag: a cross edge into a finished subtree looks like a cycle. You need the 'on path' colour."
  - "Undirected with parallel edges: skipping by parent vertex misses the 2-cycle u-v-u. Skip by edge id instead."
  - "Forgetting to start DFS from every unvisited node: the cycle can be in another component."
  - "Printed cycle must start and end at the same node and go in edge direction; build it backwards via par, then reverse."
  - "Recursion depth up to n; fine at 1e5 on CF/CSES, use an iterative DFS above that."
related: [topo-sort, bellman-ford, functional-graph, scc]
---
### Directed (Round Trip II, the template)

```cpp
vis[u]=1;
for(ll v:adj[u]){
    if(vis[v]==0){ par[v]=u; if(dfs(v)) return true; }
    else if(vis[v]==1){ /* back edge u->v: v ... u is on the stack */ }
}
vis[u]=2;
```

### Which test

| graph | cycle exists iff | tool |
|---|---|---|
| directed | DFS finds an edge into a colour-1 node | 3-colour DFS |
| directed | Kahn's queue empties before all nodes are output | topo sort |
| undirected | a visited non-parent neighbour exists, or m > n - components | DFS / DSU |
| each node has one out-edge | always, per component | functional graph walk |
| weighted, want a negative one | relaxation in round n | Bellman-Ford |
