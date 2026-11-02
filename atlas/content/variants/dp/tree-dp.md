---
id: tree-dp
title: Tree DP
signals:
  - "a tree (n-1 edges, connected) and a max / min / count over choices of vertices or edges"
  - "independent set, matching, vertex cover, colouring with constraints on adjacent nodes"
  - "answer for every SUBTREE (size, sum, number of subordinates)"
  - "longest / best path through the tree with node weights"
  - "number of ways to cut edges so each component has some property"
idea: |
  Root the tree. `dp[u][state]` describes the **subtree of u**, with `state` saying what
  the parent needs to know about `u` (taken / not taken, matched / free, colour).
  Compute children first (**post-order**), then combine them at `u`, usually as a sum
  over children of the best compatible child state. "Exactly one child is special"
  (u matched to one child) is a **base + best gain** over children. For paths, combine
  the **two best child branches** at `u`.
complexity: "O(n · states²) usually; O(n·k) knapsack-on-tree with the size bound"
pitfalls:
  - "Recursion depth: a path of 2e5 nodes can overflow the stack on CF. Iterative order (BFS/stack, then reverse) is safe."
  - "Passing `parent` and skipping it, but the root's parent sentinel collides with a real node (use 0 or -1 with 1-indexed nodes)."
  - "Leaf base case for 'matched to a child' must be impossible (-INF), not 0."
  - "Tree knapsack: loop merged sizes only up to the current subtree size, or it becomes O(n·k²)."
  - "Answer for ALL roots asked? That's rerooting, not n separate DFSs."
related: [rerooting, tree-diameter, subtree-euler-tour, small-to-large]
---
### Common states

| problem | state | combine at u |
|---|---|---|
| subtree size / subordinates | `sz[u]` | `1 + Σ sz[v]` |
| max independent set | `dp[u][0/1]` (u not taken / taken) | `dp0 += max(c0,c1)`, `dp1 += c0` |
| max matching (template) | `dp0[u]` u free, `dp1[u]` u matched | `dp1 = dp0 + max_v(dp0[v] + 1 - max(dp0[v],dp1[v]))` |
| min vertex cover | `dp[u][0/1]` | `dp0 += c1`, `dp1 += min(c0,c1)` |
| best path with weights (CF 1083A) | best downward chain | top two chains + w[u] |
| count colourings | `dp[u][colour]` | product over children of compatible sums |

### Iterative post-order
```cpp
vi order,st={1}; par[1]=-1;
while(!st.empty()){ ll u=st.back();st.pop_back(); order.push_back(u);
    for(ll v:adj[u]) if(v!=par[u]){par[v]=u;st.push_back(v);} }
for(ll k=n-1;k>=0;k--){ ll u=order[k]; /* all children of u are done */ }
```
