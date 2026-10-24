---
id: bipartite-matching
title: Bipartite Matching (Kuhn)
signals:
  - "pair items from group A with items from group B, each used at most once (workers–jobs, boys–girls)"
  - "maximum number of compatible pairs"
  - "grid cells / dominoes: colour like a chessboard and match black to white"
  - "minimum path cover of a DAG, or minimum vertex cover in a bipartite graph"
  - "n, m up to ~1000 and edges up to ~1e4–1e5"
idea: |
  Process left vertices one by one. `kuhn(u)` tries every right neighbour `v`:
  take `v` if it is free, otherwise ask its current owner `matchR[v]` to move to a
  different right vertex (recursively). A successful chain is an **augmenting path**
  and grows the matching by one. Reset `vis` (which marks right vertices) before each
  new left vertex. Matching size = number of successful calls.
complexity: "O(V·E) for Kuhn; use Hopcroft–Karp, O(E·√V), when V and E reach 1e5"
pitfalls:
  - "Forgetting `vis.assign(...)` before each left vertex gives wrong answers. Never resetting it inside one attempt is what stops infinite recursion."
  - "`vis` and `matchR` are indexed by RIGHT vertices, so size them by m, not n."
  - "Only valid for bipartite graphs. A general graph needs Edmonds' blossom algorithm."
  - "Recursion depth can reach V. Fine for V ≤ ~1e4; beyond that use iterative DFS or Hopcroft–Karp."
related: [min-path-cover, max-flow-dinic, bipartite-check]
---
### Walk-through
Edges `L1–Ra, L1–Rb, L2–Ra`.
1. `kuhn(L1)`: Ra is free, so `matchR[a]=L1`.
2. `kuhn(L2)`: Ra is taken, so call `kuhn(L1)`. It skips Ra (already visited) and takes Rb. Back in `kuhn(L2)`, set `matchR[a]=L2`.

The matching has size 2, where a plain greedy would get stuck at 1.

### Theorems worth remembering
- **König:** in a bipartite graph, *minimum vertex cover = maximum matching*.
- *Maximum independent set = V − maximum matching.*
- **DAG minimum path cover** (vertex-disjoint) = `N − matching` on the split graph `u_out → v_in`. See the min-path-cover variant.
- Hall's condition: a perfect matching of the left side exists iff every subset S of the left side has at least |S| neighbours.

### Speed-up tip
Run a greedy pass first (match each left vertex to any free neighbour) and then run
Kuhn only for the unmatched ones. In practice this is often several times faster.
