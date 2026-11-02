---
id: sweep-line-events
title: Sweep Line over Events
signals:
  - "maximum number of overlapping intervals / people present at the same moment"
  - "for each point, how many segments cover it (coordinates up to 1e9)"
  - "minimum number of rooms / platforms / machines"
  - "count points covered by exactly k segments"
  - "skyline, union area, events at times with + and - effects"
idea: |
  Turn each interval into two **events**: `(start, +1)` and `(end, -1)`. **Sort the events**
  and walk them, keeping a running count (or a multiset of active items). The answer only
  changes at event coordinates, so you never touch the 1e9 empty positions in between.
  The **tie order** at equal coordinates decides whether touching intervals overlap:
  `-1` first for half-open `[l, r)`, `+1` first for closed `[l, r]` (or use `r+1` as the end).
complexity: "O(n log n) for the sort, O(n) sweep (O(n log n) with a multiset of active items)"
pitfalls:
  - "Ties: with closed intervals [1,3] and [3,5] overlap at 3. Put the end event at r+1, or sort +1 before -1."
  - "Reading the count between events: lengths covered by exactly k are `(next_x - x)` times the count AFTER processing x."
  - "Forgetting to process all events at the same x before recording, when the answer is per coordinate."
  - "Using a map<ll,ll> diff is fine, but iterating it while also inserting into it is not."
related: [difference-array, coordinate-compression, interval-greedy, heap-scheduling]
---
### Event loop
```cpp
vpi ev;                                   // (x, delta)
for(auto [l,r]:seg){ev.push_back({l,+1});ev.push_back({r+1,-1});}  // closed [l,r]
sort(all(ev));                            // -1 before +1 at the same x
ll cur=0;
for(ll i=0;i<(ll)ev.size();i++){
    cur+=ev[i].second;
    if(i+1<(ll)ev.size() && ev[i+1].first!=ev[i].first)
        len[cur]+=ev[i+1].first-ev[i].first;    // [x, next_x) has exactly cur covers
}
```

### Variants

| task | what you keep while sweeping |
|---|---|
| max overlap, min rooms | a counter |
| points covered by exactly k (CF 1000C) | counter + gap lengths |
| which segment to drop when coverage > k (CF 1249D2) | set of active segments by right end |
| skyline | multiset of active heights, output when max changes |
| count pairs of intersecting segments | counter of active ones at each start |

### How to spot it
Coordinates are huge but there are few intervals, and the question is about what is
"active" at some moment.
