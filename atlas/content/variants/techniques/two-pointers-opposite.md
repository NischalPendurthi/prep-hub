---
id: two-pointers-opposite
title: Opposite Ends
signals:
  - "sorted array (or you may sort): find / count pairs with sum = x, ≤ x, ≥ x"
  - "pair up elements, each group at most 2, minimise number of groups"
  - "max area / value depending on both ends of a segment (container with most water)"
  - "split the array into a prefix and a suffix with equal sums"
  - "shrink from both sides while the ends violate a condition"
idea: |
  Put **l at the start, r at the end** and move one of them inward each step, so the scan is O(n).
  The argument for which side to move is always the same: one end **can't be part of any
  better answer**, so discard it. Sorted pair sum: if `a[l] + a[r] > x`, then `r` is too big for
  every remaining `l`, so `r--`. Greedy pairing: the heaviest must ride, so pair it with the lightest if possible.
complexity: "O(n) after an O(n log n) sort"
pitfalls:
  - "Counting pairs with sum ≤ x: when a[l]+a[r] ≤ x add r-l (all of l+1..r pair with l), then l++. Adding 1 undercounts."
  - "Loop condition l < r vs l <= r: Ferris Wheel needs l <= r so a lone middle child still gets a gondola."
  - "Sorting loses original indices. Sort pairs (value, index) when the answer needs positions."
  - "Equal values in 'count pairs with sum exactly x': handle a block of duplicates at once, or use sum≤x minus sum≤x-1."
related: [two-pointers-same-dir, bs-bounds, exchange-argument]
---
### The two templates
```cpp
// pair with sum x on sorted a
ll l=0,r=n-1;
while(l<r){
    if(a[l]+a[r]==x)break;
    if(a[l]+a[r]<x)l++; else r--;
}
// count pairs i<j with a[i]+a[j] <= x
ll cnt=0; l=0; r=n-1;
while(l<r){
    if(a[l]+a[r]<=x){ cnt+=r-l; l++; }
    else r--;
}
```

### Sub-cases

| problem | rule for moving |
|---|---|
| pair with sum x (CSES 1640) | sum too big → `r--`, too small → `l++` |
| Ferris wheel / boats (CSES 1090) | heaviest always leaves, takes lightest if it fits |
| container with most water | move the shorter wall: the taller can't do better with a narrower width |
| count pairs `a_i + a_j > b_i + b_j` (CF 1324D) | define `c = a - b`, sort, count pairs with sum > 0 |
| equal prefix and suffix sums (CF 1006C) | grow the side with the smaller sum |
| 3-sum | fix the first element, opposite-ends on the rest: O(n²) |
