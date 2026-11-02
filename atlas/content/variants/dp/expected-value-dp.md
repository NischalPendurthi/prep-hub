---
id: expected-value-dp
title: Probability / Expected Value DP
signals:
  - "print the probability / expected value with absolute or relative error ≤ 1e-6"
  - "answer as P · Q^{-1} mod 998244353"
  - "each second / turn something happens with probability p"
  - "expected number of steps until a process stops (all coupons, reach the end)"
  - "random draws, dice, coins, mice from a bag"
idea: |
  Two styles. **Forward probability**: `dp[step][state]` = probability of being in
  `state`, push mass along transitions, then use **linearity**: `E[X] = Σ x · P(X = x)`.
  **Backward expectation**: `E[state] = cost + Σ p · E[next]` from terminal states
  (E = 0) back to the start. A **self-loop** (`E = 1 + p·E + …`) is solved
  algebraically: `E = (1 + …) / (1 - p)`. Under a modulus, divisions are modular inverses.
complexity: "O(steps · states · transitions)"
pitfalls:
  - "Self-loops: don't iterate them, solve the equation (divide by 1 - p_stay)."
  - "Printing: use fixed + setprecision(9 or more); default cout prints 6 significant digits."
  - "Modular answers: every '/k' is `* inv(k)`, and probabilities given as p/100 need inv(100)."
  - "Linearity of expectation: often E[sum of indicators] = Σ P(indicator) avoids a full DP."
  - "Absorbing states (queue empty, game over) must keep their mass, not drop it."
related: [binpow-modinv, ncr-factorials, matrix-exponentiation]
---
### Forward vs backward

| style | state | when |
|---|---|---|
| forward probability (template, CF 518D) | `P[t][j]` | fixed number of steps, then E via linearity |
| backward expectation | `E[state]` | process runs until absorption (coupons, CF 1265E) |
| "max of n rolls" (CF 453A) | `P(max ≤ k) = (k/m)^n` | closed form, no table |
| game between players (CF 148D, 540D) | `P[a][b]` remaining counts | memo by counts |

### Forward step (Ilya and Escalator)
```cpp
for(ll j=0;j<=n;j++){
    if(j==n){nd[n]+=dp[j];continue;}   // absorbing: queue empty
    nd[j+1]+=dp[j]*p;
    nd[j]+=dp[j]*(1-p);
}
```

### Self-loop trick
`E[i] = 1 + p·E[i+1] + (1-p)·E[0]` chains (CF 1265E): write `E[i] = a_i + b_i · E[0]`
from the end, then solve the single linear equation for `E[0]`.
