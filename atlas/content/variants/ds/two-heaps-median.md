---
id: two-heaps-median
title: Two Heaps (Running Median)
signals:
  - "median after every insertion / of a data stream"
  - "minimise sum |a_i - x| over a dynamic set (x = median)"
  - "split the elements into a smaller half and a larger half and keep it split"
  - "sliding window median (add deletions: lazy heaps or two multisets)"
idea: |
  Split the elements into **lo** (a max-heap with the smaller half) and **hi** (a min-heap with the
  larger half). Keep the invariant **`|lo| == |hi|` or `|lo| == |hi| + 1`** and `lo.top() <= hi.top()`.
  Insert on the correct side by comparing with `lo.top()`, then **move one top** across if the sizes
  break. The lower median is `lo.top()`; for even sizes the average is `(lo.top()+hi.top())/2`. Keep
  **sums of both halves** to get `sum |a_i - median|` in O(1). Deletions (a sliding window) need
  two `multiset`s or heaps with lazy deletion.
complexity: "O(log n) per insert, O(1) per median query"
pitfalls:
  - "Rebalance after EVERY insert, and insert by comparing with `lo.top()` (empty lo goes to lo)."
  - "Even count: the LC answer is a double `(a+b)/2.0`. `(a+b)/2` in integers is wrong for odd sums and for negatives."
  - "Cost to the median: `med*|lo| - sumLo + sumHi - med*|hi|`. Keep the sums as ll."
  - "Sliding window: `multiset::erase(x)` removes all copies, use `erase(find(x))`."
  - "With lazy deletion the heap SIZE includes dead items; track live counts separately."
related: [heap-top-k, multiset-budget, pbds-order-statistics]
---
### Variants

| task | structure |
|---|---|
| median of a stream | two heaps |
| sliding window median (CSES 1076) | two multisets, erase one copy on leave |
| sliding window cost, sum of `abs(a - med)` (CSES 1077) | two multisets + their sums |
| median with arbitrary deletes | two multisets, or PBDS `find_by_order(size/2)` |

### Insert + rebalance
```cpp
if(lo.empty() || x<=lo.top())lo.push(x); else hi.push(x);
if(lo.size()>hi.size()+1){hi.push(lo.top());lo.pop();}
else if(hi.size()>lo.size()){lo.push(hi.top());hi.pop();}
// lower median: lo.top()
```

### Why the median
`f(x) = sum |a_i - x|` is convex, and its slope is `(#a_i < x) - (#a_i > x)`. The slope is zero at
any median, which is why "make all elements equal with +-1 operations" problems target the median and
use this split.
