---
id: dsu-basic
title: DSU with Size / Components
signals:
  - "edges are only ADDED; after each one report the #components or the largest component"
  - "are u and v connected? with merges interleaved"
  - "group items that share something (a language, an email, a value) and count/size groups"
  - "minimum edges to add to connect everything = components - 1"
  - "Kruskal, or processing edges sorted by weight while merging"
idea: |
  `p[x]` points to a parent, roots represent components. **`find` with path compression** and
  **union by size** make each operation nearly O(1). Keep **per-root data** (size, sum, min, edge count)
  and combine it in `unite` when two roots merge. `unite` returns whether a merge happened: that is the
  moment the component count drops, and a `false` means the edge closes a cycle. To group items by a
  shared attribute, **union each item with the first item that had that attribute**.
complexity: "O(α(n)) amortised per operation"
pitfalls:
  - "Using `p[x]` instead of `find(x)` when reading per-component data; only roots hold valid sizes."
  - "Updating size on the wrong root after the swap: `p[b]=a; sz[a]+=sz[b];` with `a` the bigger one."
  - "Self-loops and repeated edges: `unite` returns false, so don't decrement the component count."
  - "Recursive find can overflow the stack on long chains without union by size; keep union by size (or write find iteratively)."
  - "Forgetting to reset per test case: rebuild `p` and `sz` for each t."
related: [mst-kruskal, dsu-offline-reverse, dsu-parity, bfs]
---
### The struct
```cpp
struct DSU{
    vi p,sz;
    DSU(ll n): p(n+1),sz(n+1,1){ iota(all(p),0); }
    ll find(ll x){ return p[x]==x ? x : p[x]=find(p[x]); }
    bool unite(ll a,ll b){
        a=find(a);b=find(b);
        if(a==b)return false;
        if(sz[a]<sz[b])swap(a,b);
        p[b]=a; sz[a]+=sz[b];
        return true;
    }
};
```

### Per-root data you can carry

| store at root | merge as | answers |
|---|---|---|
| size | `sz[a]+=sz[b]` | largest component, pairs inside = `sz*(sz-1)/2` |
| edge count | `e[a]+=e[b]+1` (and `e[a]++` on a cycle edge) | is the component a tree / has a cycle |
| sum / min / max | combine | segment sums (CF 722C) |
| member list | small-to-large | list the members, relabel |

### DSU or BFS?
If the graph is static and you need components once, BFS/DFS is fine. Use DSU when edges arrive over
time and you query in between, or when edges come in sorted order (Kruskal, "connect while weight <= w").
