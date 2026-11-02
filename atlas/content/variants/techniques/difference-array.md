---
id: difference-array
title: Difference Array
signals:
  - "many range updates 'add v to a[l..r]', and the final array is read only once at the end"
  - "count how many intervals cover each point, or points covered at least k times"
  - "operations are applied to ranges of operations (CF 295A: two layers of difference arrays)"
  - "choose which index gets the largest value: sort by how many queries hit each index"
  - "add an arithmetic progression to a range (second-order difference)"
idea: |
  Instead of updating every cell, record the change at the borders:
  **`d[l] += v; d[r+1] -= v`**. One **prefix sum over d** at the end rebuilds the array in O(n).
  It is the inverse of a prefix sum: updates are O(1), but you can only read after you stop
  updating. Updates on top of updates (or AP additions) just stack another layer of differences.
complexity: "O(1) per update, O(n + maxValue) to rebuild"
pitfalls:
  - "d needs size n+1 (or maxCoord+2), because r+1 can be past the end."
  - "Interleaved updates and reads mean the difference array is the wrong tool. Use a Fenwick tree over d (range add, point query)."
  - "Coordinates up to 1e9: compress first, or sort the +1/-1 events and sweep."
  - "Forgetting the second prefix when the question is 'how many good points in [a,b]'."
related: [prefix-sum-1d, sweep-line-events, fenwick-range-point, prefix-sum-2d]
---
### The core
```cpp
vi d(n+1,0);
for(auto [l,r,v]:upd){ d[l]+=v; d[r+1]-=v; }
vi a(n); ll run=0;
for(ll i=0;i<n;i++){ run+=d[i]; a[i]=run; }
```

### Variants

| situation | trick |
|---|---|
| cover count, then "how many points in [a,b] have cover ≥ k" (CF 816B) | diff → prefix → indicator → prefix again |
| m operations, k queries each applying a range of operations (CF 295A) | diff over operation indices gives how many times each op runs, then diff over the array |
| assign big values to most-queried indices (CF 276C) | diff gives the query frequency per index, sort both and pair |
| add `1, 2, 3, ...` on [l, r] | two layers: diff of diff, or keep a count and an offset array |
| pick x minimising changes over pairs (CF 1343D) | each pair gives a range of x costing 1 change and a point costing 0, so diff over x |
| 2D rectangle adds | four corners, then a 2D prefix sum |
