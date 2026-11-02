---
id: prefix-sum-2d
title: 2D Prefix Sum
signals:
  - "many queries: sum / count of marked cells inside an axis-aligned rectangle"
  - "grid up to 1000 × 1000 with q up to 2e5 queries"
  - "find the largest k × k square with some property (binary search + rectangle sums)"
  - "count rectangles / submatrices with sum condition on a small grid"
idea: |
  `p[i][j]` = sum of the rectangle rows `1..i`, cols `1..j`, with **row 0 and column 0 left as
  zeros** so no bounds checks. Build with **inclusion-exclusion**:
  `p[i][j] = p[i-1][j] + p[i][j-1] - p[i-1][j-1] + a[i][j]`.
  A query `(r1,c1)-(r2,c2)` is `p[r2][c2] - p[r1-1][c2] - p[r2][c1-1] + p[r1-1][c1-1]`.
  For "biggest square that works", the check is O(1) per square, so **binary search the side**
  or slide it.
complexity: "O(n·m) build, O(1) per query, O(n·m) memory"
pitfalls:
  - "Forgetting the + p[r1-1][c1-1] corner (it was subtracted twice)."
  - "Mixing (row, col) with (x, y): CSES Forest Queries gives y1 x1 y2 x2, which is row first."
  - "vector<vector<ll>> of 1e3 × 1e3 is fine, 5e3 × 5e3 ll is 200 MB: use int when the counts fit."
  - "Reading a char grid: compare s[j-1] because the string is 0-indexed while p is 1-indexed."
related: [prefix-sum-1d, difference-array, bs-on-answer]
---
### Build and query
```cpp
vvi p(n+1,vi(m+1,0));
for(ll i=1;i<=n;i++)for(ll j=1;j<=m;j++)
    p[i][j]=p[i-1][j]+p[i][j-1]-p[i-1][j-1]+a[i][j];
auto rect=[&](ll r1,ll c1,ll r2,ll c2){
    return p[r2][c2]-p[r1-1][c2]-p[r2][c1-1]+p[r1-1][c1-1];
};
```

### Related tricks

| task | approach |
|---|---|
| range add on rectangles, then read every cell | 2D difference: `+v` at (r1,c1) and (r2+1,c2+1), `-v` at (r1,c2+1) and (r2+1,c1) then 2D prefix |
| count submatrices with sum = K, small n | fix top and bottom rows (O(n²)), run 1D prefix + hashmap on columns |
| largest k × k square all good | binary search k, check every square with `rect` |
| count rectangles with sum in range per query, tiny values (CF 1722E) | prefix over the value grid (h, w ≤ 1000) |
