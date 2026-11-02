---
id: contribution-technique
title: Count Each Element's Contribution
signals:
  - "sum over ALL subarrays / subsequences / pairs of some value (max, min, range, xor, ...)"
  - "n up to 2e5 but the number of subarrays is n²"
  - "sum of |a_i - a_j| over all pairs, or sum of distances between all pairs of points"
  - "expected value summed over all configurations"
  - "count unique characters over all substrings"
idea: |
  Swap the order of summation: instead of iterating over the n² objects, **iterate over elements
  and count how many objects each one contributes to**. `total = Σ a[i] · (number of objects where a[i]
  counts)`. For subarrays, an element at i lies in **`(i+1)·(n−i)`** of them. For it to be the max/min, the count
  is **`(i − L[i])·(R[i] − i)`**, with L/R the nearest blockers from a monotonic stack. Break bit
  problems down by bit, and break pair problems down by sorting.
complexity: "O(n) or O(n log n) instead of O(n²)"
pitfalls:
  - "Ties for max/min: blockers strict on one side and non-strict on the other, or equal values get counted twice."
  - "Overflow: a[i]·(i+1)·(n-i) is up to 1e9·1e10. Reduce mod before the second multiply, or check the range fits in ll."
  - "Sum of |a_i - a_j|: sort first, then a[i] contributes +a[i]·i - (sum of earlier). Forgetting the sort gives wrong signs."
  - "Per-bit counting: (1 << b) needs 1LL << b for b ≥ 31."
related: [monotonic-stack, prefix-xor, ncr-factorials, prefix-sum-1d]
---
### Counting recipes

| sum over | contribution of a[i] |
|---|---|
| all subarray sums | `a[i] · (i+1) · (n-i)` |
| all subarray maxima / minima (LC 907, LC 2104) | `a[i] · (i-L[i]) · (R[i]-i)` with monotonic stack blockers |
| all pairs `|a_i - a_j|` (CF 1648A per coordinate) | sort, `a[i] · i - prefix[i]` |
| all subsequence widths (max - min) | sort, `a[i] · (2^i - 2^(n-1-i))` |
| all subarray xors × length (CF 1879D) | per bit, count prefix pairs with differing bit, weighted by index |
| unique chars over all substrings | for each occurrence: `(i - prev) · (next - i)` |

### Max/min blockers in one pass
```cpp
vi L(n,-1),R(n,n),st;
for(ll i=0;i<n;i++){
    while(!st.empty() && a[st.back()]<=a[i]){ R[st.back()]=i; st.pop_back(); }  // max version
    if(!st.empty())L[i]=st.back();
    st.push_back(i);
}
// a[i] is the max of (i-L[i])*(R[i]-i) subarrays
```

### How to spot it
The statement says "for all subarrays" or "for all pairs" and n is too big for n². Ask which element
is responsible for the value of each object (the max, the first occurrence, the bit that differs),
then count objects per element.
