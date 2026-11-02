---
id: multi-source-bfs
title: Multi-Source BFS
signals:
  - "distance from every cell to the NEAREST source (nearest 0, nearest exit, nearest shop)"
  - "fire / water / monsters / rot spreads from several places at once, one step per second"
  - "can the player get somewhere before the spreading thing does?"
  - "minimum time until everything is infected / reached"
  - "grid up to 1000×1000, so a BFS per source is too slow"
idea: |
  Push **all sources into the queue at distance 0** before the loop, then run an ordinary
  BFS. It is the same as BFS from one virtual super-source joined to every source, so
  `dist[v]` = distance to the **nearest** source in one O(n+m) pass. For races (escape the
  fire), run it once for the spreaders, then BFS the player and only enter a cell when
  **`player_time + 1 < spread_time`**.
complexity: "O(n + m), or O(R·C) on a grid, independent of the number of sources"
pitfalls:
  - "Running one BFS per source: O(k·n), TLE when there are many sources."
  - "Race condition `<` vs `<=`: arriving at the same time as the monster is death in CSES Monsters. Read the statement."
  - "Starting cell already on the border: answer is YES with 0 moves; check on pop, before expanding."
  - "Cells the spreader never reaches have dist INF, so the player may enter them; don't initialise to 0 or -1 and compare blindly."
  - "Rotting-oranges style: answer is the max dist, and -1 if some target is never reached."
related: [bfs, grid-flood-fill, zero-one-bfs]
---
### Key change from plain BFS

```cpp
for(every source s){ dist[s]=0; q.push(s); }   // all at once, before the loop
// ...then the usual BFS loop, unchanged
```

### Race against spreaders (Monsters, the template)
1. Multi-source BFS from all `M` gives `md[cell]`.
2. BFS from `A`, entering `v` only if `ad[u]+1 < md[v]`.
3. The first border cell popped wins; rebuild the path from the stored move direction.

This works because if a monster can reach a cell no later than you, it can just wait there.

### Variants

| ask | answer |
|---|---|
| distance to nearest source for every node | dist array |
| time until everything is reached | max dist (or -1 if some INF) |
| which source is nearest | carry `owner[v]=owner[u]` along with dist |
| two closest sources of different owners | edge (u,v) with owner[u]≠owner[v] gives dist[u]+1+dist[v] |
