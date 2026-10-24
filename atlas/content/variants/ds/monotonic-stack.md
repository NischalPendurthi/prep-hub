---
id: monotonic-stack
title: Monotonic Stack
signals:
  - "next / previous greater (or smaller) element for every index"
  - "sum over ALL subarrays of their min or max"
  - "largest rectangle in a histogram / maximal area"
  - "stock span, daily temperatures, how far can each element see"
  - "remove k digits / build lexicographically smallest subsequence"
idea: |
  Keep **indices** on a stack whose values stay monotonic. When a new element breaks
  the order, every popped index has just found its *next* smaller/greater element
  (the current index). After popping, the top of the stack is the current element's
  *previous* smaller/greater element. Each index is pushed and popped once, so the
  whole pass is linear.
complexity: "O(n) time, O(n) memory"
pitfalls:
  - "Duplicates: in contribution counting use strict on one side and non-strict on the other (`<` left, `<=` right), or equal values are counted twice."
  - "Push indices, not values. You need positions for widths and counts."
  - "Elements still on the stack at the end have no next smaller/greater, so initialise `right` to n (and `left` to -1)."
  - "`(i-left)*(right-i)` can reach about 2.5e9 and then multiplies by a[i], so reduce mod before multiplying."
related: [contribution-technique, monotonic-deque, stack-simulation]
---
### Which comparison to pop on

| you want for each i | pop while | after popping, the top is |
|---|---|---|
| next **greater** | `a[top] <  a[i]` | previous greater-or-equal |
| next **greater-or-equal** | `a[top] <= a[i]` | previous strictly greater |
| next **smaller** | `a[top] >  a[i]` | previous smaller-or-equal |
| next **smaller-or-equal** | `a[top] >= a[i]` | previous strictly smaller |

One pass gives you both directions: the popped indices get their *next*, and the
current index gets its *previous* from whatever is left on top.

### Contribution view (sum of subarray minimums/maximums)
`a[i]` is the minimum of every subarray that starts in `(left[i], i]` and ends in
`[i, right[i])`, which is `(i-left[i]) * (right[i]-i)` subarrays. Sum `a[i]` times that count.
For maximums, flip every comparison.

### Largest rectangle in histogram
For bar `i`, the widest rectangle of height `h[i]` spans `(left[i], right[i])` with
strictly-smaller boundaries on both sides. Here duplicates don't matter because we
take a max, not a sum.
