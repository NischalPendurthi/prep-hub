---
id: zero-one-bfs
title: 0-1 BFS
signals:
  - "some moves are free and others cost 1 (follow the arrow free, change it for 1)"
  - "minimum number of walls to break / cells to flip / edges to reverse"
  - "limited budget of one kind of move only (left moves ≤ x)"
  - "cost depends on turning, switching lines or changing direction"
  - "Dijkstra would work but n·m is 1e6+ and log factor hurts"
idea: |
  Dijkstra with only weights 0 and 1, using a **deque**: relax `u→v` with weight `w`; on
  improvement **push_front for w=0, push_back for w=1**. The deque then always holds
  at most two distance layers in order, so pops come out in nondecreasing distance.
  A node can be pushed more than once; only accept strict improvements. Model the
  problem so the costly move has weight 1 and everything else 0.
complexity: "O(n + m)"
pitfalls:
  - "Pushing weight-0 edges to the back: still terminates but loses the ordering, giving wrong answers or SPFA-like slowness."
  - "Marking visited on push like plain BFS: wrong, a later 0-edge can improve a node already seen."
  - "Grid moves with different costs: build the weight per direction, not per cell."
  - "Labyrinth: right moves = left moves + (col - start col), so only minimise lefts. Tracking both as a pair is wrong."
  - "Weights 0 and k (not 1) still work; weights 1 and 2 do NOT, use Dijkstra or split edges."
related: [bfs, dijkstra, multi-source-bfs]
---
### Key loop

```cpp
dist[s]=0; dq.push_back(s);
while(!dq.empty()){
    ll u=dq.front(); dq.pop_front();
    for(auto [v,w]:adj[u]) if(dist[u]+w<dist[v]){
        dist[v]=dist[u]+w;
        if(w) dq.push_back(v); else dq.push_front(v);
    }
}
```

### Common modelling

| problem | weight 0 | weight 1 |
|---|---|---|
| arrow grid (LC 1368) | follow the arrow | any other direction |
| break walls | step to empty cell | step into wall |
| reverse edges to reach n | original edge | reversed edge |
| Labyrinth (CF 1063B) | up, down, right | left |
