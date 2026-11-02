---
id: dp-grid
title: Grid DP
signals:
  - "move only right / down (or down / down-left / down-right) from top-left to bottom-right"
  - "count paths avoiding blocked cells, mod 1e9+7"
  - "min / max path sum through a matrix"
  - "largest square (or rectangle) of 1s ending at each cell"
  - "n, m ≤ 1000–3000, so n×m states fit"
idea: |
  `dp[i][j]` = answer for paths that **end at cell (i, j)**. Because moves only go right/down,
  the only predecessors are `(i-1, j)` and `(i, j-1)`, and a **row-major loop** already has them
  ready. Blocked cells set `dp = 0` (or skip them). Seed the start cell, treat out-of-grid
  neighbours as 0 / INF, and **one rolling row** is enough when you only need the last row.
complexity: "O(n·m) time, O(n·m) or O(m) memory"
pitfalls:
  - "The start cell can itself be blocked: then the answer is 0, so check the wall before seeding dp[0][0]=1."
  - "First row / first column: an obstacle cuts off everything after it in that row. Don't init the whole row to 1."
  - "Mixing (i, j) with (x, y): grids are read row by row, g[i][j] is row i, column j."
  - "Max path sum with negatives: init with -INF, not 0, or empty paths win."
  - "Two walkers at once (cherry pickup): don't run the DP twice greedily; use dp[step][r1][r2]."
related: [dp-linear, prefix-sum-2d, dag-dp, grid-flood-fill]
---
### Variants

| task | transition |
|---|---|
| count paths (template) | `dp[i][j] = dp[i-1][j] + dp[i][j-1]`, 0 on walls |
| min path sum | `a[i][j] + min(dp[i-1][j], dp[i][j-1])` |
| largest square of 1s | `1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])` |
| triangle / falling path | `a[i][j] + min(dp[i-1][j-1..j+1])` |
| two paths at once | `dp[s][r1][r2]` with `c = s - r`, add cell once if `r1 == r2` |

### The key loop
```cpp
for(ll i=0;i<n;i++)for(ll j=0;j<n;j++){
    if(g[i][j]=='*'){dp[i][j]=0;continue;}
    if(i==0&&j==0){dp[i][j]=1;continue;}
    dp[i][j]=((i?dp[i-1][j]:0)+(j?dp[i][j-1]:0))%mod;
}
```

### How to spot it
Moves are monotone (never go back up or left), so the grid is a DAG in reading order.
If moves can go in all four directions, it's BFS / Dijkstra, not grid DP.
