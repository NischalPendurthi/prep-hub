---
id: state-machine-dp
title: State-Machine DP
signals:
  - "each day/position you are in one of a FEW modes (holding, cooldown, rest, gym)"
  - "can't do the same action twice in a row / must wait after an action"
  - "buy and sell stock with cooldown, fee, or at most k transactions"
  - "choose at most one subarray to multiply / flip / delete, then maximise the sum"
  - "the answer only depends on the last element's 'type', not the full history"
idea: |
  Draw the **modes as nodes** and the allowed moves between consecutive positions as
  **edges**. `dp[i][s]` = best value after position `i` ending in mode `s`; each step
  computes the new row from the previous one along the edges. Only the last row is
  needed, so keep **O(#states)** memory. For "one special segment" problems the modes
  are **before / inside / after** the segment.
complexity: "O(n · S²) worst case, O(n · S) with sparse edges; O(S) memory"
pitfalls:
  - "Updating dp in place: the new 'hold' reads the old 'free' that you already overwrote. Compute a fresh row."
  - "Impossible states need ±INF, not 0 (e.g. 'holding' before any buy)."
  - "Before/inside/after segment: allow an EMPTY segment (answer at least the plain max)."
  - "At most k transactions: count a transaction on buy OR on sell, not both."
  - "Final answer: min/max over the allowed END states only (e.g. not holding stock)."
related: [dp-linear, knapsack-01, prefix-sum-1d]
---
### Vacations (template): rest / contest / gym
```cpp
nd[0]=min({dp[0],dp[1],dp[2]})+1;          // rest
if(a[i]&1)nd[1]=min(dp[0],dp[2]);          // contest, not after contest
if(a[i]&2)nd[2]=min(dp[0],dp[1]);          // gym, not after gym
```

### Machines worth remembering

| problem | states | edges |
|---|---|---|
| stock with cooldown | hold, sold (cooldown), free | free→hold (−p), hold→sold (+p), sold→free |
| stock with fee | hold, free | sell pays fee |
| at most k transactions | `hold[j]`, `free[j]` | buy moves j→j+1 |
| multiply one subarray by x (CF 1155D) | before, inside, after | `in = max(before, in) + a·x` |
| colour/parity constraints (CF 1286A) | last parity × counts used | |
