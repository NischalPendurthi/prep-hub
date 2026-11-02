---
id: matrix-traversal
title: Matrix Traversal
signals:
  - "print / return the grid in spiral, zigzag or diagonal order"
  - "rotate the matrix 90° (in place), transpose, mirror"
  - "every cell updates from its 8 neighbours at the same time (Game of Life)"
  - "sum along both diagonals through a cell (bishop / X-sum)"
  - "n × m grid where n ≠ m, or a single row / column, is in the tests"
idea: |
  Pick a traversal that can't double-visit. **Spiral:** keep four walls `top, bot, lef, rig`
  and shrink one after each side, re-checking `top ≤ bot` / `lef ≤ rig` before the bottom and
  left passes. **Diagonals:** cells on one diagonal share **`i+j`** (anti) or **`i−j`** (main;
  offset by `m−1`). **Rotate 90° clockwise = transpose, then reverse each row.** Simultaneous
  updates need a **copy** or an encoded second bit.
complexity: "O(n·m)"
pitfalls:
  - "Spiral on a single row/column repeats cells unless you re-check the walls before the 3rd and 4th sides."
  - "Swapping n and m: the rotated grid of an n×m matrix is m×n. In-place rotation only works when square."
  - "`i-j` is negative; index diagonals with `i-j+m-1`."
  - "Game of Life in place: read the old state with `&1`, write the new one in bit 1, then shift."
related: [grid-flood-fill, prefix-sum-2d, dp-grid]
---
### Recipes

| task | how |
|---|---|
| spiral | four walls, shrink after each side (template) |
| rotate 90° cw | transpose, reverse each row (ccw: reverse rows, then transpose) |
| diagonal zigzag (LC 498) | bucket by `i+j`; reverse every even bucket |
| X-sum / bishop | `d1[i+j] += g`, `d2[i-j+m-1] += g`, answer `d1+d2-g` |
| mirror symmetry (Mirror Grid) | for each cell, its 4 rotations `(i,j) (j,n-1-i) (n-1-i,n-1-j) (n-1-j,i)` must match |
| simultaneous update | `dx/dy` arrays of 8 neighbours, write into a copy |

### Key loop (spiral)
```cpp
while(top<=bot && lef<=rig){
    for(j=lef..rig) take(top,j);  top++;
    for(i=top..bot) take(i,rig);  rig--;
    if(top<=bot){ for(j=rig..lef) take(bot,j); bot--; }
    if(lef<=rig){ for(i=bot..top) take(i,lef); lef++; }
}
```

### Testing
Brute with "walk, turn right when blocked or seen" and compare. Always include 1×1,
1×m, n×1 and a non-square grid.
