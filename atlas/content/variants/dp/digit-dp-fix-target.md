---
id: digit-dp-fix-target
title: "Digit DP: Fix the Unknown Target"
signals:
  - "x divisible by its OWN digit sum (or by each of its digits)"
  - "the modulus / target depends on the whole number, so it isn't known while walking digits"
  - "small range of possible targets: digit sum ≤ 9×18 = 162, LCM of digits divides 2520"
idea: |
  The property compares the number with something only known at the end. **Fix** that
  value as an outer loop (`S = 1..9*len`) and run one ordinary digit DP per `S` with
  state `(sum so far, value mod S)`. At the end require `sum == S && r == 0`. When the
  targets share a common multiple, keep `value mod LCM` instead and test the real
  target only at the end (2520 for "divisible by each non-zero digit").
complexity: "O(162 × digits × 162 × 162 × 10) per query: heavy, fine for one or two queries"
pitfalls:
  - "Memo depends on S: memset inside the S loop."
  - "The memo is large (20×172×172 ll = 4.7 MB): make it global, not a local array."
  - "Prune `sum > S` and `sum + 9*rem < S`, or it is several times slower."
  - "x = 0 has digit sum 0: exclude it (return 0 for x ≤ 0)."
related: [digit-dp]
---
### Two ways to handle an unknown target

| target | trick | state |
|---|---|---|
| digit sum S (≤ 162) | loop over S outside the DP | `(sum, value mod S)` |
| each non-zero digit divides x | all digit LCMs divide 2520 | `(value mod 2520, lcm so far)` with lcm indexed among the 48 divisors of 2520 |

For the 2520 version the memo doesn't depend on anything outside the DP, so a single
memo answers every query (CF 55D has up to 10 tests).
