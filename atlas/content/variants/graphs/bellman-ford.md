---
id: bellman-ford
title: Bellman-Ford / Negative Cycles
signals:
  - "edge weights can be negative"
  - "detect or print a negative cycle (arbitrage, infinite score)"
  - "maximise score where some path can loop forever: answer -1 if unbounded"
  - "shortest path using at most k edges"
  - "n ≤ 2500, m ≤ 5000: O(n·m) fits"
idea: |
  Relax **every edge, n-1 rounds**; afterwards distances are final unless a negative cycle
  exists. If **some edge still relaxes in round n**, there is one. To print it: take the
  last relaxed node, walk `par` **n times** to be sure you are on the cycle, then follow
  `par` until you return. Start with **all dist = 0** to find a cycle anywhere (virtual
  source). For "is the answer unbounded", only cycles **reachable from s and reaching t** count.
complexity: "O(n·m)"
pitfalls:
  - "Not walking par n steps first: the last relaxed node may hang off the cycle and the loop never returns to it."
  - "dist init INF with source 1 only finds cycles reachable from 1. CSES Cycle Finding wants any cycle: init all to 0."
  - "Relaxing from an INF node: `INF + negative` looks smaller. Guard `dist[a] != INF` when using INF."
  - "Max-score problems (CSES 1673): negate weights, and a negative cycle only matters if it can reach n. Check with a reverse reachability pass."
  - "At most k edges: relax from a copy of the previous round, otherwise one round can use several edges."
related: [dijkstra, floyd-warshall, cycle-detection]
---
### Key loop

```cpp
vi dist(n+1,0), par(n+1,-1); ll x=-1;
for(ll i=0;i<n;i++){
    x=-1;
    for(auto [a,b,c]:edges) if(dist[a]+c<dist[b]){ dist[b]=dist[a]+c; par[b]=a; x=b; }
}
if(x!=-1){ for(ll i=0;i<n;i++) x=par[x]; /* x is on the cycle */ }
```

### Which question

| ask | init | check |
|---|---|---|
| any negative cycle | dist all 0 | relax in round n |
| shortest from s, negatives allowed | INF, dist[s]=0 | guard INF |
| path s→t unbounded | INF, dist[s]=0 | node relaxed in round n that can reach t |
| ≤ k edges | INF, dist[s]=0 | k rounds, each from a copy |
