---
id: rerooting
title: Rerooting
signals:
  - "for EVERY vertex, compute something as if the tree were rooted there"
  - "farthest node / sum of distances from each node"
  - "choose the best root (capital, starting vertex) to maximise / minimise a value"
  - "n up to 2e5, so n separate DFSs (O(n²)) are too slow"
  - "a subtree DP already exists and the answer for the root is easy"
idea: |
  Two passes. **Down pass**: `in[u]` = DP of u's subtree (normal tree DP from root 1).
  **Up pass** (pre-order): `out[v]` = DP of everything **outside** v's subtree, seen from v,
  built from `out[u]` of the parent and u's **other children**. The answer at v merges
  `in[v]` and `out[v]`. For max-type DPs keep the **top two** child values so a child
  can ask for "best excluding me"; for sum-type DPs **subtract** the child's contribution.
complexity: "O(n) (O(n log n) or prefix/suffix arrays when 'excluding me' isn't invertible)"
pitfalls:
  - "Max-type: comparing `in[v]+1==mx1` with ties. If two children share the max, mx2 must equal mx1 (use `<=` when shifting)."
  - "Sum-type: the 'outside' value for child v is ans[u] minus v's contribution, so subtract exactly what v added in the down pass."
  - "Leaf-only star / n = 1: mx1 and mx2 start at -1 (or 0 for distances) so the formulas stay valid."
  - "Recursion depth on a 2e5 path: CSES is fine, CF may need an iterative order."
  - "Overflow: sum of distances reaches n²/2 ≈ 2e10, use ll."
related: [tree-dp, tree-diameter, tree-distance-queries]
---
### Max-type (Tree Distances I, the template)
```cpp
// in[u] = longest path down; out[v] = longest path starting v -> parent
for(ll v:children(u))
    out[v] = 1 + max(out[u], (in[v]+1==mx1) ? mx2 : mx1);
ans[v] = max(in[v], out[v]);
```

### Sum-type (Tree Distances II, CF 1187E, LC Sum of Distances)
```cpp
// down: sz[u], down[u] = Σ dist(u, x) for x in subtree
// reroot u -> v: the sz[v] nodes get 1 closer, the other n - sz[v] get 1 farther
ans[v] = ans[u] - sz[v] + (n - sz[v]);
```

### Recognising which one
| combine is | "excluding child v" |
|---|---|
| `+` (sums, counts) | subtract v's term |
| `max` / `min` | top-2 values |
| `*` mod p, or anything not invertible | prefix and suffix products over children |
