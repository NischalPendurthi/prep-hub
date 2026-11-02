---
id: bridges-articulation
title: Bridges & Articulation Points
signals:
  - "which roads / cables, if removed, disconnect the network? (bridges)"
  - "which cities are critical / single points of failure? (articulation points)"
  - "orient edges so the graph stays strongly connected (exists iff no bridges)"
  - "2-edge-connected components, then a tree of components (bridge tree)"
idea: |
  DFS with `tin[u]` (entry time) and `low[u]` = smallest `tin` reachable from u's subtree
  using one back edge. For tree edge u→v: **bridge iff `low[v] > tin[u]`**, and u is an
  **articulation point iff `low[v] >= tin[u]`** (non-root). The **root** is a cut vertex iff it
  has **2+ DFS children**. Skip the parent **edge by id**, not the parent vertex, so parallel
  edges work. Bridges split the graph into 2-edge-connected components; compressing them
  gives a tree (bridge tree).
complexity: "O(n + m)"
pitfalls:
  - "Skipping the parent vertex instead of the parent edge: a doubled edge u–v is wrongly reported as a bridge."
  - "Mixing the two conditions: bridge uses `>`, articulation uses `>=`."
  - "Forgetting the root special case for articulation points."
  - "In the user's notes the back edge updated `low` from the parent too: that makes every tree edge look non-bridge."
  - "Graph may be disconnected: start a DFS from every unvisited vertex."
related: [cycle-detection, tree-diameter, subtree-euler-tour]
---
### Key loop
```cpp
for(auto [v,id]:adj[u]){
    if(id==pe) continue;                       // the edge we came from
    if(tin[v]){ low[u]=min(low[u],tin[v]); continue; }
    dfs(v,id); children++;
    low[u]=min(low[u],low[v]);
    if(low[v]>tin[u]) bridge[id]=1;
    if(pe!=-1 && low[v]>=tin[u]) cut[u]=1;
}
if(pe==-1 && children>1) cut[u]=1;
```

### Uses
| Problem | Idea |
|---|---|
| Necessary Roads / Cities (CSES 2076/2077) | print bridges / cut vertices |
| Orient every edge, stay strongly connected (CF 118E) | possible iff no bridges; orient tree edges down, back edges up |
| Max bosses on any s–t path (CF 1000E) | bridge tree, answer = its diameter |
| Best orientation maximizing min reach (CF 732F) | largest 2-edge-connected component as root, orient towards it |
