---
id: topo-sort
title: Topological Sort
signals:
  - "order tasks so every prerequisite / dependency comes first"
  - "is the dependency graph acyclic? (course schedule, build order)"
  - "lexicographically smallest valid order"
  - "DP over a DAG: longest path, number of paths, earliest finish time"
  - "orient the undirected edges so the graph stays acyclic"
idea: |
  **Kahn's algorithm:** count indegrees, queue every node with indegree 0, and repeatedly
  pop a node, output it and decrement its out-neighbours, queueing any that hit 0. If
  **fewer than n** nodes come out, the rest sit on a cycle. Swap the queue for a **min-heap**
  to get the lexicographically smallest order. DAG DPs run in this order (or reverse DFS
  finish order).
complexity: "O(n + m), O((n + m) log n) with a heap"
pitfalls:
  - "Not checking `order.size() == n`: a cyclic input silently prints a partial order."
  - "Edge direction: 'a must be before b' is a→b, indeg[b]++. Mixing it up reverses the order."
  - "Lexicographically smallest order needs a min-heap. Smallest position for node 1 first is different: reverse graph + max-heap, then reverse."
  - "DFS-based sort: push on exit and reverse at the end; it still needs 3-colour cycle detection."
  - "Unique order iff the queue never holds more than one node."
related: [cycle-detection, dag-dp, scc]
---
### Key loop

```cpp
for(ll i=1;i<=n;i++) if(indeg[i]==0) q.push(i);
while(!q.empty()){
    ll u=q.front(); q.pop(); order.push_back(u);
    for(ll v:adj[u]) if(--indeg[v]==0) q.push(v);
}
if(order.size()!=n) // cycle
```

### Variants

| ask | change |
|---|---|
| any order / detect cycle | plain queue |
| lexicographically smallest | `priority_queue<ll,vi,greater<ll>>` |
| is the order unique | check `q.size()<=1` at every pop |
| longest path / count paths in DAG | dp in `order`: `dp[v]=max(dp[v],dp[u]+1)` |
| mixed graph, orient undirected edges | topo-sort the directed part, point each undirected edge from earlier to later |
