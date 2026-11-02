---
id: euler-path
title: Euler Path / Circuit
signals:
  - "use every edge (road, ticket, domino, teleporter) exactly once"
  - "reconstruct a string from all its overlapping k-substrings (de Bruijn style)"
  - "chain pairs so the end of one equals the start of the next"
  - "orient edges so in-degree equals out-degree at as many vertices as possible"
idea: |
  Existence is a **degree check + connectivity**. Undirected: 0 odd-degree vertices (circuit)
  or 2 (path between them). Directed: all `out == in`, or start has `out = in + 1` and end has
  `in = out + 1`. Build it with **Hierholzer**: walk from the start, using each edge once via a
  **per-vertex pointer**; when stuck, pop the vertex into the answer. **Reverse** at the end.
  Check the answer has **m + 1 vertices**; fewer means some edges were unreachable.
complexity: "O(n + m)"
pitfalls:
  - "Only checking degrees: edges in another component pass the degree test. Check `path.size() == m+1`."
  - "Undirected: an edge appears in both lists; mark it used by edge id, or it's walked twice."
  - "Without the `ptr[u]` pointer (rescanning adj each time) it becomes O(m²)."
  - "Recursive Hierholzer overflows the stack at m = 2e5; use the explicit stack."
  - "Lexicographically smallest route (LC Reconstruct Itinerary): sort adjacency lists first."
related: [cycle-detection, topo-sort, constructive]
---
### Iterative Hierholzer (directed)
```cpp
vi stk={start}, path, ptr(n+1,0);
while(!stk.empty()){
    ll u=stk.back();
    if(ptr[u]<adj[u].size()) stk.push_back(adj[u][ptr[u]++]);
    else { path.push_back(u); stk.pop_back(); }
}
reverse(all(path));   // check path.size()==m+1
```
Undirected: store `{v, id}`, keep `used[id]`, and skip used edges while advancing `ptr[u]`.

### Existence table
| Graph | Circuit | Path |
|---|---|---|
| Undirected | every degree even | exactly 2 odd vertices (they are the ends) |
| Directed | `in == out` everywhere | one `out−in = 1` (start), one `in−out = 1` (end) |

Both also need all edges in one connected component (isolated vertices are fine).

### Modelling tricks
- k-substrings / passwords (CF 508D): vertex = (k−1)-prefix, edge = substring.
- Make degrees even (CF 723E): add a dummy vertex joined to every odd vertex, then take a circuit.
