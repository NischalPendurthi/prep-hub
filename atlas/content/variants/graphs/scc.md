---
id: scc
title: Strongly Connected Components
signals:
  - "directed graph: groups where every vertex can reach every other"
  - "can you get from any city to any other? (one SCC)"
  - "cycles in a directed graph are free / collapse them, then DP on the result"
  - "minimum edges to add so everything is reachable / cost to cover all cycles"
  - "2-SAT (implication graph, x and ¬x in the same SCC = unsatisfiable)"
idea: |
  **Tarjan:** one DFS with `tin`/`low` and an explicit stack. `low[u]` takes `tin[v]` only for
  `v` **still on the stack**. When `low[u] == tin[u]`, u is an SCC root: pop the stack down to
  u. SCCs come out in **reverse topological order**. Then **condense**: one node per SCC, edge
  `comp[u]→comp[v]` when they differ. The condensation is a DAG, so run topo/DAG DP on it.
  (Kosaraju is the alternative: order by finish time, then DFS the reversed graph.)
complexity: "O(n + m)"
pitfalls:
  - "Updating `low` from a visited vertex that is NOT on the stack (already in a finished SCC) merges SCCs wrongly."
  - "Recursion depth n = 1e5 on a long chain: fine on CF/CSES usually, but iterative or bigger stack if it crashes."
  - "Forgetting that Tarjan ids are reverse topo order; DP on the condensation must go the right way."
  - "Condensed graph gets duplicate edges; harmless for DP, but dedupe if counting in/out degrees by edges."
related: [topo-sort, dag-dp, cycle-detection]
---
### Key lines
```cpp
if(!tin[v]){ dfs(v); low[u]=min(low[u],low[v]); }
else if(onStk[v]) low[u]=min(low[u],tin[v]);
if(low[u]==tin[u]) { k++; pop until u, comp[x]=k; }
```

### After you have comp[]
| Question | Answer from the condensation |
|---|---|
| Is the graph strongly connected? | `k == 1` |
| Min edges to add to make it strongly connected | `max(#sources, #sinks)` (0 if k == 1) |
| Max coins on a path, cycles free (CSES 1686) | sum weights per SCC, longest path DP on the DAG |
| Vertices reachable from all others | the unique sink SCC, if exactly one sink |
| Min cost to guard every cycle (CF 427C) | min per SCC, multiply counts of the min |
| 2-SAT | `comp[x] == comp[¬x]` → impossible; else `x = comp[x] < comp[¬x]` in Tarjan order |
