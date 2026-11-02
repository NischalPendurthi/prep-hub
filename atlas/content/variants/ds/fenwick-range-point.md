---
id: fenwick-range-point
title: Range Update, Point Query
signals:
  - "add x to every element in [l, r], then ask the value of one element"
  - "many range increments, values read one at a time (or only at the end)"
  - "each interval covers points, ask how many intervals cover point k online"
  - "range add AND range sum (two-BIT trick)"
idea: |
  Put a BIT over the **difference array** `d`: range add is **`add(l,x); add(r+1,-x)`**, and
  `a[k] = a0[k] + query(k)` because a prefix sum of `d` rebuilds the element. For **range add,
  range sum** keep two BITs `B1, B2`: add `x` at `l`, `-x` at `r+1` in B1 and `x*(l-1)`,
  `-x*r` in B2; then `prefix(i) = query1(i)*i - query2(i)`.
complexity: "O(log n) per update and query"
pitfalls:
  - "`add(r+1, -x)` with r = n: size the BIT n+1 or let update skip i > n. Never skip it for r < n."
  - "Forgetting the initial values: answer is a0[k] + query(k), not query(k) alone (or add a0 as differences)."
  - "Two-BIT formula signs: prefix(i) = sum1(i)*i - sum2(i). Test on n=1 by hand."
  - "Offline with no interleaved queries? A plain difference array + one prefix pass is enough."
related: [fenwick-point-range, difference-array, segtree-lazy]
---
### Range add, point query
```cpp
bit.update(l,u);
bit.update(r+1,-u);          // cancels the add after r
cout<<a[k]+bit.query(k);
```

### Range add, range sum (two BITs)
```cpp
void rangeAdd(ll l,ll r,ll x){
    b1.update(l,x);  b1.update(r+1,-x);
    b2.update(l,x*(l-1)); b2.update(r+1,-x*r);
}
ll prefix(ll i){return b1.query(i)*i-b2.query(i);}
// sum a[l..r] = prefix(r)-prefix(l-1)
```

### Which one?
| updates | queries | tool |
|---|---|---|
| all before any query | any | difference array, O(n) |
| range add, interleaved | point | 1 BIT on differences |
| range add, interleaved | range sum | 2 BITs or lazy segtree |
| range assign | anything | lazy segtree |
