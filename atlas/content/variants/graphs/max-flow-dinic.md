---
id: max-flow-dinic
title: Max Flow (Dinic)
signals:
  - "maximum throughput / download speed from s to t with capacities"
  - "minimum cost (sum of edge weights) to cut s from t: min cut = max flow"
  - "maximum number of edge-disjoint or vertex-disjoint paths"
  - "assignment with capacities on both sides (generalised matching)"
  - "n ≤ ~500–5000, m ≤ ~1e4–1e5, and nothing greedy works"
idea: |
  Each **phase**: BFS from s builds **levels** in the residual graph; then DFS pushes flow only
  along edges going **exactly one level deeper**, with a **per-vertex pointer `ptr[u]`** so
  saturated edges aren't retried. Each push lowers `cap[e]` and raises the paired **reverse
  edge `e^1`**, which lets later paths undo earlier choices. Stop when t is unreachable. The
  vertices still reachable from s then form the **min cut**.
complexity: "O(V²E) in general; O(E√V) on unit-capacity bipartite graphs"
pitfalls:
  - "Forgetting the reverse edge, or not storing edges in pairs, so `id^1` points at the wrong edge."
  - "Undirected edge: add it as two directed edges with capacity c each (or one pair with cap c both ways)."
  - "Resetting `ptr` only once instead of every phase; or not resetting it at all."
  - "Flow sums overflow int with capacities 1e9. Use `ll` and LINF as the initial push."
  - "Vertex capacities / vertex-disjoint paths: split v into v_in → v_out with capacity 1 (or c)."
related: [bipartite-matching, min-path-cover, bfs]
---
### Modelling cheat sheet
| Want | Build |
|---|---|
| Edge-disjoint s–t paths (CSES 1711) | capacity 1 per edge, flow = count; walk saturated edges to print |
| Vertex-disjoint paths | split v into `v_in → v_out` cap 1 |
| Min cut edges (CSES 1695) | after max flow, BFS residual from s; cut = edges from reached to unreached |
| Bipartite matching with capacities | s → left (cap a_i), left → right (cap ∞ or 1), right → t (cap b_j) |
| Pick projects with profits, tools with costs (CF 1082G) | s → project (profit), project → tool (∞), tool → t (cost); answer = Σprofit − maxflow |
| Max flow with time / binary search on answer (CF 653D) | binary search the per-path load, flow on scaled capacities |

### Key DFS
```cpp
for(ll &i=ptr[u]; i<g[u].size(); i++){
    ll id=g[u][i], v=e[id].to;
    if(level[v]!=level[u]+1 || e[id].cap==0) continue;
    if(ll p=dfs(v,t,min(f,e[id].cap))){ e[id].cap-=p; e[id^1].cap+=p; return p; }
}
```
