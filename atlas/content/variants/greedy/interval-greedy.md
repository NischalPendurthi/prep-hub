---
id: interval-greedy
title: Interval Greedy
signals:
  - "maximum number of non-overlapping intervals / meetings / movies you can attend"
  - "minimum number of points (arrows) that hit every interval"
  - "remove the fewest intervals so the rest don't overlap"
  - "cover a segment [0, L] with the fewest given intervals"
  - "assign intervals to k machines / rooms (max count or min rooms)"
idea: |
  **Sort by right end** and scan: take an interval if it starts after the last taken one
  ends. The earliest-ending interval leaves the most room, so it is always safe to take.
  The same scan answers **min points to stab** (put a point at each taken end) and
  **min removals** (`n − max kept`). Covering a segment is the opposite: sort by **left end**
  and, among intervals starting ≤ current reach, jump to the **farthest right end**.
complexity: "O(n log n) for the sort, O(n) scan (k machines: O(n log n) with a multiset)"
pitfalls:
  - "Closed vs half-open: `[1,2]` and `[2,3]` overlap if closed (arrows: one point hits both). Decide `>=` vs `>` from the statement."
  - "Sorting by start (or by length) for max non-overlapping is wrong: one long early interval blocks everything."
  - "Initial `last` must be below every start (LLONG_MIN or -1 when starts can be 0)."
  - "Segment cover: if no interval extends the reach, answer is -1; don't loop forever."
related: [exchange-argument, interval-merge, sweep-line-events, multiset-budget]
---
### Which sort, which rule

| goal | sort by | take / move when |
|---|---|---|
| max non-overlapping (Movie Festival) | end ↑ | `start >= lastEnd` |
| min arrows / stabbing points | end ↑ | `start > lastPoint` → new point at `end` |
| min removals to make disjoint | end ↑ | `n −` (max non-overlapping) |
| min intervals to cover `[s, t]` | start ↑ | best end among starts ≤ reach, then reach = best |
| min rooms for all | events (start +1, end −1) | max running count |
| max kept with k rooms (Movie Festival II) | end ↑ | multiset of room end-times: reuse the largest end ≤ start |

### Key loop (the template)
```cpp
sort(all(a));                        // pairs stored as {end, start}
for(auto [e,s]:a) if(s>=last){ ans++; last=e; }
```

### Spotting it
"Intervals" + "maximum count" or "minimum points" with n up to 2e5 is almost always
sort-by-end. If each interval also carries a weight, the greedy breaks and it becomes
dp over sorted ends + binary search.
