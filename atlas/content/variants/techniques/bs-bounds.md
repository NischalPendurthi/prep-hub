---
id: bs-bounds
title: Lower / Upper Bound
signals:
  - "count elements <= x / in [l, r] in a sorted array, many queries"
  - "for each query find the nearest / largest value not exceeding x"
  - "count pairs i < j with a_i + a_j in a range (sort, then bound for each i)"
  - "take the best item <= budget and remove it (multiset + upper_bound)"
  - "first position where a monotone prefix (prefix sum, prefix max) passes x"
idea: |
  On a sorted range, `lower_bound(x)` is the first element **>= x** and `upper_bound(x)`
  the first **> x**. Everything else is arithmetic on these two iterators:
  count in `[l, r]` = `upper_bound(r) - lower_bound(l)`, largest `<= x` is **one step before
  `upper_bound(x)`**, smallest `>= x` is `lower_bound(x)`. For a set/multiset use the
  **member** `s.lower_bound`, and check `begin()` / `end()` before you step or dereference.
complexity: "O(log n) per query after an O(n log n) sort"
pitfalls:
  - "`std::lower_bound(all(s), x)` on a set/multiset is O(n) per call (no random access). Use `s.lower_bound(x)`."
  - "Largest <= x: `prev(upper_bound(x))` is undefined when the iterator is `begin()`. Check first."
  - "`ms.erase(value)` removes every copy. Erase the iterator: `ms.erase(it)`."
  - "Mixing up which bound: for `< x` count use `lower_bound(x)`, for `<= x` use `upper_bound(x)`."
  - "Pair counting with a fixed i: search only in `[i+1, n)` or you count i with itself and every pair twice."
related: [bs-on-answer, two-pointers-opposite, coordinate-compression]
---
### Bound cheat sheet (sorted `a`)

| want | expression |
|---|---|
| # elements `< x` | `lower_bound(all(a),x)-a.begin()` |
| # elements `<= x` | `upper_bound(all(a),x)-a.begin()` |
| # elements in `[l, r]` | `upper_bound(r) - lower_bound(l)` |
| smallest `>= x` | `*lower_bound(x)` if `!= end` |
| largest `<= x` | `*prev(upper_bound(x))` if `!= begin` |
| largest `< x` | `*prev(lower_bound(x))` if `!= begin` |
| first index with `a[i] > x` in descending `a` | `upper_bound(all(a),x,greater<ll>())` |

### Multiset "take the best one that fits"
```cpp
auto it=s.upper_bound(t);
if(it==s.begin()) none;
else { --it; use(*it); s.erase(it); }
```

### Pairs with sum in [L, R]
Sort. For each `i`, the partners `j > i` with `L - a[i] <= a[j] <= R - a[i]` form one contiguous
block: `upper_bound(a+i+1, a+n, R-a[i]) - lower_bound(a+i+1, a+n, L-a[i])`. Two pointers
does the same in O(n) after the sort.
