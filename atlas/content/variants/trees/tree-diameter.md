---
id: tree-diameter
title: Tree Diameter
signals:
  - "longest path between any two nodes of a tree"
  - "for every node, the farthest node from it (max distance)"
  - "minimum time for something to spread / the best centre to place a station"
  - "add one edge or choose two nodes to maximise / minimise a path length"
  - "the answer depends only on the two ends of the longest path"
idea: |
  **Double BFS:** from any node find the farthest node `a`; the farthest node `b` from `a` gives the
  diameter `dist(a,b)`. It works because the farthest node from anywhere is always an end of some
  diameter. Weighted with non-negative weights: same thing with DFS sums. With **negative weights** or
  when you need per-subtree values, use the **tree DP**: at each node keep the two longest downward
  chains `d1 >= d2` and update `best = max(best, d1 + d2)`. Bonus: **every node's eccentricity is
  `max(dist(u,a), dist(u,b))`**, so two more BFS passes answer "farthest node from each u".
complexity: "O(n), two BFS passes"
pitfalls:
  - "Counting nodes instead of edges (or the reverse). Check what the problem means by length."
  - "Double BFS breaks with negative edge weights. Use the d1+d2 DP there."
  - "In the DP, a node with one child still forms a path d1+0. Initialise d1 = d2 = 0, not -INF."
  - "n = 1: the diameter is 0 and the max_element must skip index 0 of a 1-indexed array."
  - "Centre of the tree: the middle node(s) of the a-b path, found by walking parents from b."
related: [tree-dp, rerooting, bfs, tree-distance-queries]
---
### Two ways

| method | handles | gives |
|---|---|---|
| double BFS / DFS (template) | unweighted or weights >= 0 | diameter, its two ends, all eccentricities |
| DP with top-2 chains | any weights, forests per component | diameter, longest path through each node |
| rerooting | anything "farthest from every node" | down + up values per node |

### DP form
```cpp
ll best=0;
function<ll(ll,ll)> dfs = [&](ll u,ll p)->ll{
    ll d1=0,d2=0;                 // two longest chains going down
    for(ll v:adj[u]) if(v!=p){
        ll c=dfs(v,u)+1;          // +w for weighted edges
        if(c>d1){d2=d1;d1=c;} else d2=max(d2,c);
    }
    best=max(best,d1+d2);
    return d1;
};
```

### How to spot it
Anything about "farthest", "radius", "centre" or "the longest path" in a tree. The radius is
`(diameter+1)/2` edges, measured from the centre of the diameter path.
