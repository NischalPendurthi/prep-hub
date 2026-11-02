---
id: mst-kruskal
title: Kruskal
signals:
  - "connect all cities / computers with minimum total cost"
  - "edge list given directly, m up to ~2e5, sparse graph"
  - "minimise the maximum edge on a path between u and v (minimax path = path in the MST)"
  - "add edges in increasing weight and ask when components merge"
  - "\"is edge e in some / every MST?\""
idea: |
  **Sort edges by weight** and scan them; add an edge iff its endpoints are in **different
  DSU components** (cut property: the cheapest edge leaving a component is always safe).
  The MST has exactly **n−1 edges**; fewer means the graph is disconnected. For maximum
  spanning tree, sort descending. Virtual vertex trick: "build a station at i for c_i" is an
  edge `0–i` of weight `c_i`.
complexity: "O(m log m) for the sort, DSU is ~O(α(n)) per edge"
pitfalls:
  - "Not checking `used == n-1`: a disconnected graph silently prints a forest's cost."
  - "Total cost overflows int (2e5 edges × 1e9). Use `ll`."
  - "DSU without path compression (`return find(p[x])`) degrades to O(n) per find on long chains."
  - "Sorting `{u,v,w}` sorts by u. Store the weight first, or use a comparator."
  - "Grid / points problems: building all O(n²) edges for Kruskal can be too slow; use O(n²) Prim instead."
related: [mst-prim, dsu-basic, dsu-offline-reverse, lca-binary-lifting]
---
### Key loop
```cpp
sort(all(edges));                       // {w,u,v}
for(auto [w,u,v]:edges) if(dsu.unite(u,v)) cost+=w, used++;
if(used!=n-1) /* disconnected */;
```

### Common twists
| Twist | Trick |
|---|---|
| Cost to "open" a vertex (power station, well) | extra vertex 0 with edge `0–i` of cost `c_i` |
| MST containing a forced edge e | unite e's endpoints first, then run Kruskal |
| For each edge, best MST that contains it (CF 609E) | MST + max edge on the tree path u–v (binary lifting): `MST − maxOnPath + w` |
| Is edge in some MST? (CF 891C) | process equal weights as a group; edge is usable iff endpoints differ before the group |
| Minimax path between u, v | max edge on the MST path |
| Edges given implicitly (gcd, xor, complete graph) | find which O(n) candidate edges suffice, then Kruskal |

### Spotting it
Kruskal is the default MST when an edge list is given. Reach for Prim only when the graph is
dense or implicit (all pairs of points), where generating and sorting n² edges is the
bottleneck.
