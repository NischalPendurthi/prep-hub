---
id: functional-graph
title: Successor Graph + Binary Lifting
signals:
  - "every vertex has exactly one outgoing edge: next[i], teleporter, permutation, f(x)"
  - "where are you after k steps, with k up to 1e9 or 1e18"
  - "repeat an operation many times (apply a permutation / function k times)"
  - "length of the cycle you end up in, or steps until you first repeat"
  - "n, q up to 2e5"
idea: |
  Each component is **one cycle with trees hanging into it** (rho shape). For "position after k
  steps", precompute **`up[j][x]` = vertex after 2^j steps** with `up[j][x] = up[j-1][up[j-1][x]]`,
  then jump once per **set bit of k**. For cycle questions, walk from each unvisited vertex,
  mark vertices **on the current path**; meeting one of them closes a cycle, meeting a finished
  vertex reuses its answer (`dist to cycle + cycle length`).
complexity: "O(n log K) build, O(log K) per query, O(n log K) memory"
pitfalls:
  - "LOG too small: k ≤ 1e9 needs 30 levels, k ≤ 1e18 needs 60."
  - "Memory: 60 × 2e5 `ll` = 96 MB. Use `int` tables when k is huge, or store `up` as `vector<vector<int>>`."
  - "Index order `up[x][j]` vs `up[j][x]`: the build loop must fill level j for all x before level j+1."
  - "Cycle walk with recursion on n = 2e5 overflows; iterate with an explicit path vector."
related: [lca-binary-lifting, cycle-detection, matrix-exponentiation]
---
### Cycle lengths for every vertex (CSES 1751 Planets Cycles)
```cpp
vi ans(n+1,0), state(n+1,0);       // 0 new, 1 on current path, 2 done
for(ll s=1;s<=n;s++) if(!state[s]){
    vi path; ll x=s;
    while(!state[x]){ state[x]=1; path.push_back(x); x=t[x]; }
    ll extra = state[x]==2 ? ans[x] : 0;  // ran into a solved vertex
    if(state[x]==1){                       // closed a new cycle at x
        ll len = path.end()-find(all(path),x);
        for(ll i=path.size()-len;i<path.size();i++) ans[path[i]]=len, state[path[i]]=2;
        path.resize(path.size()-len); extra=len;
    }
    for(ll i=path.size()-1;i>=0;i--) ans[path[i]]=++extra, state[path[i]]=2;
}
```

### Shapes
| Question | Tool |
|---|---|
| Vertex after k steps (CSES 1750) | binary lifting (template) |
| Min steps from a to b (CSES 1160) | distance to cycle + position on cycle; a must reach b's tree or cycle |
| First vertex visited twice (CF 1020B) | walk and mark, O(n) per start is enough for n ≤ 1000 |
| Sum / min along k steps (CF 702E) | lift `sum[j][x]`, `mn[j][x]` next to `up[j][x]` |
| Permutation applied k times | each cycle rotates by `k mod len` |
