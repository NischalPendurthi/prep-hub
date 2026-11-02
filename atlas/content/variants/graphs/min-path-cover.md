---
id: min-path-cover
title: Minimum Path Cover in a DAG
signals:
  - "minimum number of people / police / chains to visit every vertex of a DAG"
  - "tasks with precedence, each worker follows a path, minimise workers"
  - "partial order: minimum number of chains (Dilworth: = maximum antichain)"
  - "n ≤ ~1000 vertices, and the graph is a DAG or an order relation"
idea: |
  Split every vertex v into **v_out (left)** and **v_in (right)**; DAG edge u→v becomes
  bipartite edge **u_out – v_in**. Start with n single-vertex paths; every matched edge
  **glues two paths**, so **answer = n − max matching** (vertex-disjoint paths). If paths may
  **share vertices**, first take the **transitive closure** (u→v whenever u reaches v), then do
  the same. That version equals the maximum antichain (**Dilworth**).
complexity: "Kuhn O(n·m); Hopcroft–Karp O(m√n). Transitive closure adds O(n³/64) with bitsets"
pitfalls:
  - "Mixing the two versions: vertex-disjoint needs plain edges, overlapping paths need the transitive closure."
  - "Matching u to v_in on the SAME vertex set: left and right are separate copies, both sized n+1."
  - "Reset `vis` before every left vertex."
  - "Only for DAGs. On a general graph collapse SCCs first (or the problem is different)."
related: [bipartite-matching, max-flow-dinic, topo-sort, scc]
---
### Rebuilding the paths
`matchR[v] = u` means the path goes u → v. Build `nxt[u] = v`; a path starts at every vertex
with no `matchR`:
```cpp
vi nxt(n+1,0);
for(ll v=1;v<=n;v++) if(matchR[v]) nxt[matchR[v]]=v;
for(ll v=1;v<=n;v++) if(!matchR[v]) for(ll x=v;x;x=nxt[x]) /* print x */;
```

### Which version?
| Paths may... | Graph to match on | Answer |
|---|---|---|
| not share vertices | DAG edges as given | n − matching |
| share vertices (chains in a poset) | transitive closure | n − matching = max antichain |
| be weighted / limited (k paths, max value) | min-cost flow on the split graph | see max-flow |

### InMobi OA
"Minimum police officers so every junction of a one-way (acyclic) network is patrolled,
each officer walks a path": the template exactly, vertex-disjoint version.
