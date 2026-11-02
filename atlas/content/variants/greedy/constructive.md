---
id: constructive
title: Constructive Patterns
signals:
  - "\"print any array / permutation / string such that …\", or say it's impossible"
  - "output is not unique (\"if there are multiple answers, print any\")"
  - "parity / sum / xor conditions on the whole output"
  - "small n are special: the answer exists only for n ≥ 4, or only for n mod 4 ∈ {0, 3}"
  - "n up to 1e5 and a checker, so brute search is out but a pattern is in"
idea: |
  **Brute-force tiny n** (n ≤ 8) on paper or in Python and look for the pattern and for
  which n are **impossible**. Then reach for a standard shape: **evens then odds**,
  **alternate big/small** (`1 n 2 n-1 …`), **pair i with n+1−i**, **greedy from the
  largest**, or fix a **necessary condition** (parity, sum mod k, xor) and show it's sufficient.
  Handle the small exceptions explicitly before the general rule.
complexity: "usually O(n) output"
pitfalls:
  - "Small n: test 1, 2, 3, 4 by hand. Permutations: n=2,3 impossible but n=1 is fine."
  - "Two Sets: the sum n(n+1)/2 must be even; then greedily take from n downwards into one set."
  - "Multiple test cases with a printed array: reset buffers and print a newline per case."
  - "Write a validator for your own output (stress against an existence brute), since sample outputs won't match."
related: [bit-tricks, exchange-argument, interval-greedy]
---
### Standard shapes

| shape | gives | used in |
|---|---|---|
| evens, then odds | neighbours differ by ≥ 2 | Permutations (CSES 1070), Special Permutation (odds descending, then 4 2, then 6 8 …) |
| `i` ↔ `n+1−i` pairs | equal pair sums | Two Sets, balanced splits |
| greedy from the largest | hit an exact sum | Two Sets (take n, n−1, … while ≤ remaining) |
| change one cell per block | break every row/col/box at once | Anti-Sudoku (replace every 2 with 1) |
| `1, …, 1, x` / `x, x/2, x/2` | fix lcm / sum / parity | k-LCM |
| xor `u`, sum `v`: `[u, (v−u)/2, (v−u)/2]` | parity + `u ≤ v` decide | Ehab the Xorcist |

### Key loop (the template)
```cpp
if(n==1){cout<<1;return;}
if(n<=3){cout<<"NO SOLUTION";return;}
for(ll i=2;i<=n;i+=2) out(i);   // evens
for(ll i=1;i<=n;i+=2) out(i);   // odds; seam is (even ≥ 4, 1)
```

### Testing
Expected outputs can't be compared directly. The stress test runs an existence brute
for small n and checks the program's answer is valid, not equal.
