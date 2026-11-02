---
id: matrix-exponentiation
title: Matrix Exponentiation
signals:
  - "linear recurrence (Fibonacci, tribonacci, f(n) = Σ c_i f(n−i)) with n up to 1e18"
  - "number of walks of length exactly k in a small graph (≤ 100 nodes)"
  - "DP with few states that repeats the same transition n times"
  - "ways to tile / roll dice / build strings of length n ≤ 1e18 with a small alphabet automaton"
idea: |
  Write one step of the DP as `v_{i+1} = T · v_i` with a **fixed** `d×d` matrix `T`. Then
  `v_n = T^n · v_0`, and `T^n` comes from **binary power** on matrices in O(d³ log n). For a
  recurrence of order d, the state is the last d values and `T` is the **companion matrix**
  (top row = coefficients, a shifted identity below). For walks in a graph, `T` is the
  adjacency matrix and `(T^k)[u][v]` counts walks u → v.
complexity: "O(d³ log n)"
pitfalls:
  - "Off-by-one in the power: check `n = 0, 1, 2` against the brute DP by hand."
  - "Overflow in `A[i][k]*B[k][j]`: reduce after every product (each is < 1e18, but the sum isn't)."
  - "Starting R as zero instead of the identity."
  - "d ≈ 200 with many queries is too slow; precompute T^(2^j) and multiply vectors instead."
  - "Constant terms (f(n) = f(n−1) + 5): add a state that is always 1."
related: [binpow-modinv, dp-linear, dag-dp]
---
### Building T

| recurrence | state vector | T |
|---|---|---|
| `f(n) = f(n−1) + f(n−2)` | `(f(n), f(n−1))` | `[[1,1],[1,0]]` |
| `f(n) = Σ_{j=1..6} f(n−j)` (template) | last 6 values | row 0 all ones, `T[i][i−1] = 1` |
| `f(n) = a·f(n−1) + b` | `(f(n), 1)` | `[[a,b],[0,1]]` |
| walks of length k | one entry per node | adjacency matrix |
| prefix sum of f too | add `S(n)` | `S(n) = S(n−1) + f(n)` row |

### Multiply
```cpp
for(ll i=0;i<n;i++)for(ll k=0;k<n;k++){
    if(A[i][k]==0)continue;
    for(ll j=0;j<n;j++)C[i][j]=(C[i][j]+A[i][k]*B[k][j])%mod;
}
```
`i-k-j` order is cache-friendly and the zero skip helps for sparse automata.

### Min-plus variant
Replace `+` by `min` and `*` by `+` to get shortest walks with exactly k edges (CSES Graph Paths II).
Identity becomes 0 on the diagonal and INF elsewhere.
