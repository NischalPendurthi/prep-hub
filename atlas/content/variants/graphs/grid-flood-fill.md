---
id: grid-flood-fill
title: Grid Flood Fill
signals:
  - "count rooms / islands / lakes / connected regions in a character grid"
  - "size of the largest region, or size of each region"
  - "fill everything connected to a cell (paint bucket)"
  - "regions touching the border vs enclosed (surrounded regions, closed islands)"
  - "grid up to 1000×1000"
idea: |
  Scan every cell; each unvisited open cell **starts a new component**, and a DFS/BFS from
  it marks the whole region. Count starts for the number of regions, count marks for the
  size. Use a **direction array** `dr/dc` and one bounds check. **Mark when pushing** and
  reuse the grid itself as `visited` when allowed. For "enclosed" questions, first flood
  from all border cells and discard what they reach.
complexity: "O(R·C)"
pitfalls:
  - "Recursive DFS on a 1000×1000 open grid is 1e6 deep and overflows the stack. Use an explicit stack or a queue."
  - "Marking on pop with an explicit stack pushes cells many times; mark on push."
  - "Bounds check before indexing: `nr<0||nr>=n||nc<0||nc>=m` first, then the grid char."
  - "4- vs 8-connectivity: read which neighbours count."
  - "Reading rows with `cin >> s` is fine; with getline mind the leftover newline."
related: [bfs, multi-source-bfs, dsu-basic]
---
### Key loop (explicit stack)

```cpp
for(cells (i,j)) if(g[i][j]=='.'){
    rooms++;
    vpi st={{i,j}}; g[i][j]='#';
    while(!st.empty()){
        auto [r,c]=st.back(); st.pop_back();
        for(k<4){ nr=r+dr[k]; nc=c+dc[k];
            if(in bounds && g[nr][nc]=='.'){ g[nr][nc]='#'; st.push_back({nr,nc}); } }
    }
}
```

### Variants

| ask | change |
|---|---|
| number of regions | count the starts |
| largest region | count pops per start, take max |
| enclosed regions only | flood from every border cell first, then count |
| regions under online additions | DSU over cell ids `i*m+j` instead |
