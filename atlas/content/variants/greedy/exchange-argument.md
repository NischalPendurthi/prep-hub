---
id: exchange-argument
title: Exchange Argument / Sort by Key
signals:
  - "choose an ORDER for all items (tasks, strings, people) to minimise / maximise a total"
  - "cost of an item depends on what came before it (finish time, accumulated weight, prefix sum)"
  - "\"concatenate all strings to get the smallest / largest result\""
  - "n up to 2e5, so trying orders is impossible but one sort is fine"
  - "pick a subset AND an order (projects with rating requirements, deadlines): sort first, then dp"
idea: |
  Take an optimal order and look at two **adjacent** items `x, y`. Swapping them only
  changes their own contribution, so write `cost(x before y) ≤ cost(y before x)` and
  simplify it to a **key comparison** (`a.t*b.w < b.t*a.w`, `a+b < b+a`, `d_x < d_y`).
  If that relation is a strict weak order, **sorting by it is optimal**. When a subset is
  also chosen, sort by the exchange key first, then run a knapsack / dp in that order.
complexity: "O(n log n) for the sort (+ the dp if a subset is chosen)"
pitfalls:
  - "Comparator must be a strict weak order: `<=` or a non-transitive rule makes std::sort crash or misorder."
  - "Compare ratios by cross-multiplying (`a.t*b.w < b.t*a.w`), not with doubles; check the product fits in ll."
  - "Projects with +/- deltas: positive ones by required rating ascending, negative ones by (rating + delta) DESCENDING."
  - "String concat: sort by `a+b < b+a`, not plain `a < b` (\"9\" vs \"98\"); all-zeros must print \"0\"."
related: [heap-regret-greedy, interval-greedy, knapsack-01]
---
### Deriving the key

Write both orders for an adjacent pair, cancel what's shared, compare what's left.

| problem | cost of `x` then `y` vs `y` then `x` | sort by |
|---|---|---|
| sum of finish times / Tasks and Deadlines | `t_x` added to y's finish vs `t_y` added to x's | duration ascending |
| weighted completion `Σ w·C` | `t_x·w_y` vs `t_y·w_x` | `t_x·w_y < t_y·w_x` (Smith's rule) |
| smallest concatenation | `x+y` vs `y+x` | `a+b < b+a` |
| sh-pairs in "s…h" strings (Robot Vacuum) | `s_x·h_y` vs `s_y·h_x` | `s_a·h_b > s_b·h_a` |
| projects needing rating ≥ r, then rating += d (d<0) | `r_x ≤ R`, `r_y ≤ R+d_x` | `r + d` descending |

### Key loop (the template)
```cpp
sort(all(a));                 // shortest duration first
for(auto [d,dl]:a){ t+=d; ans+=dl-t; }
```
Deadlines are just a constant `Σd` here, which is the usual trap: the "deadline" makes
it look like EDF, but the order only affects `Σ finish`.

### Spotting it
If the answer is "sort, then a single pass", try writing the 2-element swap inequality
before guessing a key. If the inequality mentions only `x` and `y` (nothing else in the
array), sorting works.
