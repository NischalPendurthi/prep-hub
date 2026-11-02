---
id: coordinate-compression
title: Coordinate Compression
signals:
  - "values up to 1e9 but only n ≤ 2e5 of them, and you want a Fenwick / segment tree indexed by value"
  - "only the relative ORDER of values matters (inversions, ranks, count smaller)"
  - "offline queries mention new values: read all of them first"
  - "grid or segment endpoints up to 1e9 with few distinct coordinates"
idea: |
  Collect **every value that will ever be indexed** (initial array, update values,
  sometimes query bounds), **sort + unique**, and replace each value by its rank
  `lower_bound(all(vals), v) - vals.begin()` (+1 for a 1-based BIT). Order is preserved,
  so `<`, `<=` and range counts still work. A query bound that was not collected maps through
  **lower_bound / upper_bound** instead of an exact rank.
complexity: "O(n log n) to build, O(log n) per lookup"
pitfalls:
  - "Forgetting values that appear only in updates: their rank lands on a neighbour. Read all queries first."
  - "Off by one: BIT wants ranks 1..m, so add 1 to the lower_bound index."
  - "Mapping a query bound with lower_bound for both ends. Use lower_bound(a) for >= a and upper_bound(b) for <= b."
  - "Using a map<ll,ll> rank in a hot loop: correct but often 3-5× slower than a sorted vector."
  - "Compressing segment endpoints for lengths: keep the original values to compute the gaps."
related: [fenwick-point-range, fenwick-inversions, sweep-line-events, bs-bounds]
---
### The three lines
```cpp
sort(all(vals));
vals.erase(unique(all(vals)),vals.end());
auto id=[&](ll v){return lower_bound(all(vals),v)-vals.begin()+1;};   // 1..m
```

### Mapping a range [a, b] that was not compressed
```cpp
ll l=lower_bound(all(vals),a)-vals.begin();   // ranks 1..l are < a
ll r=upper_bound(all(vals),b)-vals.begin();   // ranks 1..r are <= b
count = bit.query(r)-bit.query(l);
```

### When endpoints are compressed for lengths
For segments on 1e9 coordinates, put every `l` and `r+1` in `vals`. Cell `i` of the
compressed array stands for the real interval `[vals[i], vals[i+1])`, so its length is
`vals[i+1]-vals[i]`, not 1.
