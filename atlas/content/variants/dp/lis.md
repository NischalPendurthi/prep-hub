---
id: lis
title: Longest Increasing Subsequence
signals:
  - "longest strictly increasing (or non-decreasing) subsequence, n up to 2e5"
  - "minimum number of elements to remove / change to make the array sorted"
  - "nest envelopes / boxes / towers: sort by one key, LIS on the other"
  - "minimum number of non-increasing chains covering the array (Dilworth)"
  - "count of LIS, or LIS ending at each position"
idea: |
  Keep `tails[len-1]` = **smallest last value** of an increasing subsequence of length `len`.
  `tails` is sorted, so each `a[i]` either **extends** it (bigger than all) or **replaces** the
  first tail `≥ a[i]` (found with `lower_bound`). The length of `tails` is the LIS. Use
  **`upper_bound`** for non-decreasing. For 2D (envelopes), sort by width ascending and **height
  descending** on ties, then LIS on heights.
complexity: "O(n log n) time, O(n) memory; the O(n²) dp[i] version for n ≤ 5000"
pitfalls:
  - "lower_bound gives strict, upper_bound gives non-decreasing. Duplicates break the other one."
  - "`tails` is NOT an actual subsequence. To rebuild one, store the position each element landed at and its predecessor."
  - "Envelopes: equal widths must be sorted by height descending, or two envelopes with the same width chain."
  - "Min deletions to sort = n - LIS (non-decreasing version if equal values are allowed)."
related: [lcs-edit-distance, fenwick-point-range, segtree-basic, coordinate-compression]
---
### The key loop
```cpp
vi tails;
for(ll x:a){
    auto it=lower_bound(all(tails),x);     // upper_bound for non-decreasing
    if(it==tails.end())tails.push_back(x);
    else *it=x;
}
// answer: tails.size()
```

### Variants

| task | how |
|---|---|
| strict LIS length (template) | `lower_bound` on tails |
| non-decreasing | `upper_bound` |
| LIS ending at each i | `pos = it - tails.begin()`, `len[i] = pos+1` |
| weighted LIS / count of LIS | compress values, Fenwick/segtree of (best, ways) over values `< a[i]` |
| 2D nesting | sort `(w asc, h desc)`, LIS on h |
| min chains of non-increasing | equals LIS length (Dilworth) |

### O(n²) fallback
`dp[i] = 1 + max(dp[j])` over `j < i, a[j] < a[i]`. Use it when the condition between j and i isn't a
plain comparison (divisibility, custom compatibility).
