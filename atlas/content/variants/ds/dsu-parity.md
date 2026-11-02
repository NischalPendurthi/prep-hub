---
id: dsu-parity
title: DSU with Parity / Weights
signals:
  - "statements 'x and y are the same / different'; check consistency or count the max of one kind"
  - "xor of a subarray is given; detect the first contradiction (prefix xor as nodes)"
  - "a / b = k equations, answer c / d (weighted ratios)"
  - "is the graph still bipartite after each added edge"
  - "relative differences `x_v - x_u = w`; check all constraints"
idea: |
  Store at each node its **offset to the parent** (`par[x]`: a parity bit, an xor, a difference or a
  ratio). **`find` compresses the path and accumulates offsets**, so afterwards `par[x]` is relative
  to the root. To add `val(a) ^ val(b) = w`: if they share a root, **check** `par[a]^par[b]==w`
  (a mismatch is a contradiction); otherwise link the roots with `par[rb] = par[a]^par[b]^w`. Each
  component then has two colourings (flip everything), so "max of one kind" takes
  **`max(#parity1, size - #parity1)` per component**.
complexity: "O(α(n)) amortised per operation"
pitfalls:
  - "In find, read `par[p[x]]` AFTER the recursive call has compressed the parent; save the root, then update, then reassign `p[x]`."
  - "Linking formula: the offset goes on the OLD root `rb`, equal to `par[a]^par[b]^w`, not just w."
  - "Swapping roots for union by size: swap `a` and `b` too (xor is symmetric; differences need a sign flip)."
  - "Counting per component: call find(i) on every node first so all offsets are relative to the root."
  - "Subarray xor [l, r]: the nodes are prefixes l-1 and r, so allocate n+1 nodes starting at 0."
related: [dsu-basic, bipartite-check, prefix-xor]
---
### Weight types

| relation | `par[x]` holds | combine in find | link roots |
|---|---|---|---|
| same / different | bit | `^=` | `par[a]^par[b]^w` |
| xor of range = w | xor | `^=` | same as above |
| `x_b - x_a = w` | difference to parent | `+=` | `par[rb] = par[a] + w - par[b]` |
| `a / b = k` | ratio to parent | `*=` | `par[rb] = par[a] / (k * par[b])` (doubles) |

### find with offsets
```cpp
ll find(ll x){
    if(p[x]==x)return x;
    ll r=find(p[x]);
    par[x]^=par[p[x]];   // p[x] is now a child of r, par[p[x]] is relative to r
    p[x]=r;
    return r;
}
```

### Parity DSU or BFS 2-colouring?
With all constraints known up front, a BFS colouring of the constraint graph is just as good (CF
1594D can be solved either way). The DSU wins when constraints arrive online and you need the first
contradiction, or when the relation carries a value (xor, difference).
