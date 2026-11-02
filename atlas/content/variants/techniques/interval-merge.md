---
id: interval-merge
title: Interval Merging
signals:
  - "merge overlapping intervals / total length covered by a union of segments"
  - "insert an interval into a sorted disjoint list"
  - "intersection of two lists of intervals"
  - "the common part of all segments after removing one (prefix/suffix intersections)"
  - "free time / gaps between busy intervals"
idea: |
  **Sort by start.** Keep the last merged interval; a new one either **overlaps** it
  (`l <= last.r` for closed intervals) and extends it with `last.r = max(last.r, r)`, or
  starts a new block. Intersection of `[l1, r1]` and `[l2, r2]` is
  `[max(l1, l2), min(r1, r2)]`, non-empty iff `max <= min`. For two sorted lists, **advance
  whichever interval ends first**.
complexity: "O(n log n) for the sort, O(n) merge"
pitfalls:
  - "Extending with `r` instead of `max(last.r, r)`: [1,10] followed by [2,3] shrinks to [1,3]."
  - "Touching rule: closed intervals merge at l == last.r, half-open ones do not. Decide `<=` vs `<` from the statement."
  - "Integer points: [1,2] and [3,4] cover a contiguous set of integers. Merge on `l <= last.r + 1` if that's what is asked."
  - "Intersecting many segments: start with [-INF, INF], not with the first segment's values after you have already removed it."
related: [sweep-line-events, interval-greedy, difference-array]
---
### Merge loop
```cpp
sort(all(a));
for(auto [l,r]:a){
    if(!res.empty() && l<=res.back().second) res.back().second=max(res.back().second,r);
    else res.push_back({l,r});
}
```

### Sub-cases

| task | trick |
|---|---|
| union length | merge, then Σ (r - l) |
| insert one interval into a sorted list | copy those ending before it, merge the overlapping run, copy the rest |
| intersections of two sorted lists | two pointers, emit `[max l, min r]` when valid, advance the one with smaller `r` |
| intersection of all but one (CF 1029C) | prefix and suffix max of `l`, min of `r` |
| covered by at least k segments | not a merge any more: sweep with +1/-1 events |
