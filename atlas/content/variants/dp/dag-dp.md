---
id: dag-dp
title: DP on DAG / Path Counting
signals:
  - "directed graph with NO cycles (guaranteed, or edges only go a < b / to higher cells)"
  - "number of distinct paths from s to t, mod 1e9+7"
  - "longest path / max score path in a DAG, and print it"
  - "a state graph where every move strictly increases something (value, time, position)"
  - "longest increasing path in a grid"
idea: |
  Any DP over a DAG works once states are processed in **topological order**. Use
  **Kahn's algorithm** (indegree queue) and **push** values forward along edges:
  `ways[v] += ways[u]`, `len[v] = max(len[v], len[u]+1)`. Or recurse with **memo** from
  the source (pull: `f(u) = combine over u→v of f(v)`), which visits only reachable
  states. Keep a `par[]` array to rebuild the best path.
complexity: "O(n + m)"
pitfalls:
  - "Longest path: unreachable nodes must stay at -INF, not 0, or paths that don't start at 1 count."
  - "Path counting: initialise only ways[source]=1; push from every node in topo order even if ways is 0 (indegrees must still drop)."
  - "If a cycle is possible, Kahn's queue ends with fewer than n nodes: detect it (answer -1 / infinite)."
  - "Memo DFS on 1e5 nodes in a chain: recursion depth. Prefer Kahn."
  - "Multiple edges between the same pair are separate paths; don't dedupe."
related: [topo-sort, cycle-detection, dp-linear, bs-on-answer]
---
### Push along Kahn's order (Game Routes, the template)
```cpp
for(ll k=0;k<(ll)q.size();k++){
    ll u=q[k];
    for(ll v:adj[u]){
        ways[v]=(ways[v]+ways[u])%mod;
        if(--indeg[v]==0)q.push_back(v);
    }
}
```

### Variations

| task | value | combine |
|---|---|---|
| count paths s→t | `ways` | `+=` mod p |
| longest path (CSES 1680) | `len`, `par` | `max`, -INF unreachable |
| max letter frequency on a path (CF 919D) | `dp[v][26]` | `max` per letter; cycle → -1 |
| shortest/longest with ≤ T cost (CF 721C) | `dp[v][k]` = min time with k nodes | `min` |
| "max ≤ X on a path of length k" (CF 1679D) | binary search X, then longest path on allowed edges | |
