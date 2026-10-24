---
id: interval-dp
title: Interval DP
signals:
  - "the answer for a range [l..r] is built from answers of smaller ranges inside it"
  - "take/remove from either END of an array (two-player games, removal game)"
  - "merge / burst / remove adjacent elements with a cost (merge stones, burst balloons)"
  - "pairs that must not cross: valid bracket / stack sequences, non-crossing chords"
  - "n ≤ 500 (O(n³) split point) or n ≤ 5000 (O(n²) peel an end)"
idea: |
  `dp[l][r]` = best answer for the subarray `a[l..r]`. Fill it by **increasing length**,
  so every smaller range is ready. A transition either **peels an end** (`l` or `r`),
  **pairs** `l` with a matching position `k` (`dp[l+1][k-1] + dp[k+1][r]`), or
  **splits** at `k` (`dp[l][k] + dp[k+1][r] + cost`). For "burst/remove" problems, pick
  which element is handled **last** in the range, not first.
complexity: "O(n²) states; O(1) transitions → O(n²), split point → O(n³)"
pitfalls:
  - "Loop order: by length, or l descending with r ascending. Looping l ascending reads values that aren't computed yet."
  - "Memory: 5000×5000 `ll` is 200 MB. Use `int`, or fewer states."
  - "Base cases: length 1, and the empty range (l > r) when pairing adjacent elements."
  - "Burst balloons: pad with 1 on both ends and choose the LAST balloon to burst in (l, r)."
related: [partition-dp, palindrome-dp, stack-simulation]
---
### Three transition shapes

```
peel an end:   dp[l][r] = best( f(a[l]) ⊕ dp[l+1][r],  f(a[r]) ⊕ dp[l][r-1] )
pair l with k: dp[l][r] = dp[l+1][k-1] + dp[k+1][r]          (k = partner of l, k ≤ r)
split at k:    dp[l][r] = min over k of dp[l][k] + dp[k+1][r] + cost(l,k,r)
```

### Game version (Removal Game, the template)
Store the *difference* (player to move − other player). Then the opponent's best on
the remaining range is simply subtracted: `dp[l][r] = max(a[l]-dp[l+1][r], a[r]-dp[l][r-1])`.
At the end, first player = `(sum + dp[0][n-1]) / 2`.

### Non-crossing pairs (InMobi: valid stack sequence)
Each value gives an interval `[first, second]`. A valid sequence is exactly a set of
pairwise **non-crossing** intervals, so either delete `a[l]` or pair it with its partner
`k` and solve the inside and the outside independently.
