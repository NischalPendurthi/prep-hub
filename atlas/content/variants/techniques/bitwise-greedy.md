---
id: bitwise-greedy
title: Bit-by-Bit Greedy
signals:
  - "maximise the AND / OR / XOR of something you get to choose or arrange"
  - "minimise the OR (or XOR) of a partition, values < 2^30"
  - "find x ≤ limit maximising (a xor x) or some bitwise expression"
  - "k operations each setting one bit of one element: best AND"
  - "answer is built bit by bit; the condition 'answer contains these bits' is checkable"
idea: |
  A higher bit is worth more than **all lower bits combined**, so decide bits from the top:
  try `cand = ans | (1<<b)`, and keep the bit iff a **feasibility check for all bits of `cand`
  together** passes. Bits already fixed stay fixed, which is why the check takes the whole
  `cand`, not just bit b. For minimising, try to keep each bit **0**.
complexity: "O(B × cost of check), B = 30 or 60"
pitfalls:
  - "Checking bit b alone instead of `ans | bit`: the earlier bits' constraints disappear and you take incompatible bits."
  - "Starting from the low bit. Greedy only works top-down."
  - "`~b` on signed values sets all high bits. Mask it: `(~b) & cand`."
  - "Loop must start at the true top bit (29 for values < 2^30, 60 for 1e18) and use 1LL."
related: [bit-tricks, binary-trie-xor, bs-on-answer]
---
### The skeleton
```cpp
ll ans=0;
for(ll b=29;b>=0;b--)
    if(ok(ans|(1LL<<b))) ans|=1LL<<b;
```

### Checks for common problems

| problem | ok(cand) |
|---|---|
| reorder b, max AND of a_i^b_i (CF 1721D) | multiset `{a_i & cand}` == multiset `{~b_i & cand}` |
| max AND after ≤ k bit sets (CF 1669H) | Σ over bits of cand of (# elements missing that bit) ≤ k (bits independent here) |
| max AND of any k elements | # elements with `(a & cand) == cand` ≥ k |
| min OR splitting into k segments | greedy: can we cut into ≥ k parts each with OR ⊆ ~(bits we forbid) |
| max x ≤ r with best a^x (digit-like) | walk bits from the top, track `tight` like digit DP |

### Why it works
Choosing bit b set gains `2^b`, and all lower bits together give at most `2^b - 1`. So the
best answer containing bit b (if any is feasible) beats every answer without it.
