---
id: nim-grundy
title: Nim & Grundy Numbers
signals:
  - "two players alternate, the one who can't move loses, both play optimally"
  - "several independent piles / boards / tokens, a move touches one of them"
  - "remove 1..k stones, remove a value from a set S, split a pile in two"
  - "who wins for every n up to 1e6, or n up to 1e18 (look for a period)"
idea: |
  A position with no moves is **losing**. Its **Grundy number** is the **mex** of the Grundy
  numbers it can reach, and it is losing iff that number is 0. **Sprague–Grundy**: a sum of
  independent games has Grundy number equal to the **XOR** of the parts, so the first player
  wins iff the XOR ≠ 0 (plain Nim: Grundy of a pile is its size). For big piles, print the
  table for small sizes and **find the pattern** (period, `x % (k+1)` for "remove 1..k").
complexity: "O(N · |moves|) for the Grundy table; O(n) to XOR the piles"
pitfalls:
  - "XORing win/lose flags instead of Grundy values: two winning games can sum to a loss."
  - "Misère (last mover loses): Nim answer flips only when every pile is ≤ 1."
  - "Splitting a pile creates two games: the move's value is g(a) XOR g(b)."
  - "Grundy values can exceed the number of moves you'd guess; size mex buffers by the max out-degree."
  - "Staircase Nim: only the odd-indexed stairs matter."
related: [interval-dp, dag-dp, bitmask-dp]
---
### Grundy table
```cpp
for(ll x=0;x<=N;x++){
    set<ll> s;
    for(ll mv:moves)if(x>=mv)s.insert(g[x-mv]);
    ll m=0; while(s.count(m))m++;
    g[x]=m;
}
```

### Known patterns

| game | Grundy of a pile x |
|---|---|
| Nim (take any amount) | `x` |
| take 1..k | `x % (k+1)` |
| take from a set S | table; periodic eventually |
| split into two unequal piles (Grundy's Game) | table; non-zero for all large x |
| staircase Nim | XOR of piles on odd steps |
| one move = take from a pile, or split it | table with `g[a]^g[b]` among the options |

### When it isn't a sum
A single game on a graph or DAG (one token, both players move it) is just win/lose DP:
a state is winning iff some move reaches a losing state. Grundy numbers are only needed when
independent games are played side by side.
