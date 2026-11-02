---
id: bipartite-check
title: Bipartite Check (2-Colouring)
signals:
  - "split people into two teams so that no two friends are in the same team"
  - "is there an odd cycle?"
  - "orient / label every edge so endpoints get different types (direction, parity)"
  - "count colourings: each component gives 2 choices (or 0 if not bipartite)"
  - "graph must be bipartite before running matching / König"
idea: |
  BFS or DFS from every **uncoloured vertex** (the graph may be disconnected), give
  neighbours the **other colour** `3 - col[u]`. If an edge joins two vertices of the **same
  colour**, there is an odd cycle and the graph is not bipartite. Each connected bipartite
  component has exactly **two colourings** (swap), which is what counting problems use.
complexity: "O(n + m)"
pitfalls:
  - "Starting only from vertex 1. Loop over all vertices: other components need colouring too."
  - "Checking the conflict only for unvisited neighbours. The check is on already-coloured ones."
  - "Counting answers: multiply per component (CF 1093D: `2^a + 2^b` per component, a and b the class sizes), not over the whole graph at once."
  - "DFS recursion depth up to n = 1e5–2e5; BFS avoids it."
related: [bfs, dsu-parity, bipartite-matching]
---
### Key loop
```cpp
if(col[v]==0){ col[v]=3-col[u]; q.push(v); }
else if(col[v]==col[u]) /* odd cycle: not bipartite */;
```

### Variations
| Problem shape | Approach |
|---|---|
| Two teams, print assignment | BFS colouring (template) |
| Edges added online, "still bipartite?" | DSU with parity (dsu-parity) |
| Orient edges so no path of length 2 (CF 1144F) | colour, then direct every edge from colour 1 to colour 2 |
| Number of valid labelings | product over components of (ways for this component) |
| Max edges you can add keeping it bipartite (CF 862B) | `a·b − m` with a, b the colour class sizes |

### Spotting it
Any "two groups / two sides / alternating" constraint between adjacent things is a 2-colouring.
"No odd cycle" and "bipartite" are the same statement.
