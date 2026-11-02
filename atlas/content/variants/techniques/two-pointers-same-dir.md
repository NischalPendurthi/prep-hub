---
id: two-pointers-same-dir
title: Same Direction
signals:
  - "all values positive: count / find subarrays with sum = x or ≤ x"
  - "for each i, the furthest j such that a[j] - a[i] ≤ d in a sorted array"
  - "merge-like scan over two sorted arrays (closest pairs, matching)"
  - "count tuples within a value window in sorted order (close tuples)"
  - "both pointers only ever move right as the answer changes monotonically"
idea: |
  Both pointers start on the left and **only move right**. It works when the condition is
  **monotone**: if `[l, r]` is fine then so is every `[l', r]` with `l' > l` (or the furthest valid
  `j` for `i` never decreases as `i` grows). Each pointer moves at most n times, so the whole scan is
  **O(n) amortized**, even with a `while` inside the `for`.
complexity: "O(n) amortized (plus sorting)"
pitfalls:
  - "Negative values break monotonicity (adding an element can lower the sum). Use prefix + hashmap or a sorted structure instead."
  - "Resetting l inside the loop gives O(n²). l must only increase."
  - "In 'for each i the furthest j', start j where it ended for i-1, and make sure j ≥ i."
  - "Updating the window state in the wrong order: add a[r] before shrinking, remove a[l] before l++."
related: [two-pointers-opposite, window-variable, prefix-hashmap-count, bs-bounds]
---
### The core (positive values, sum = x)
```cpp
ll l=0,sum=0,ans=0;
for(ll r=0;r<n;r++){
    sum+=a[r];
    while(sum>x){ sum-=a[l]; l++; }
    if(sum==x)ans++;
}
```

### Shapes of this pattern

| problem | what each pointer means |
|---|---|
| subarray sum = x, positives (CSES 1660) | window `[l, r]`, shrink while sum > x |
| max books read in time t (CF 279B) | longest window with sum ≤ t |
| close tuples, max - min ≤ k (CF 1462E2) | sort, for each i furthest j with `a[j] - a[i] ≤ k`, add C(j-i, m-1) |
| teams with spread ≤ 5 (CF 1133E) | sort, `j[i]` = first index out of range, then DP over it |
| min cost window covering all values 1..m (CF 1555E) | sort segments by weight, both pointers move right, segtree checks coverage |
| merge two sorted arrays | i on A, j on B, advance the smaller |
