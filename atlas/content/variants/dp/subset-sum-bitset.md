---
id: subset-sum-bitset
title: Subset Sum with Bitset
signals:
  - "which sums can be formed by a subset of the items (yes/no, not max value)"
  - "split into two groups with sums as close as possible / exactly equal"
  - "total sum S up to ~1e6 and n up to ~1e3–1e5, so n × S / 64 fits"
  - "sizes of components / groups, can some of them add up to exactly k"
  - "list all distinct reachable sums"
idea: |
  Keep `bitset<S> can` where bit s means "sum s is reachable". Adding an item of size v is
  **one shift-or**: `can |= can << v`, which processes 64 sums per word. When many items share a
  size (component sizes summing to n), there are only **O(√S) distinct sizes**; fold duplicates
  with binary splitting (or turn 3 copies of v into 1 copy of v and 1 of 2v) to keep it fast.
complexity: "O(n · S / 64); with distinct-size reduction O(S√S / 64)"
pitfalls:
  - "bitset size must be a compile-time constant: size it for the max total sum + 1."
  - "Shift LEFT (`<<`) moves bit s to s+v. `>>` goes the wrong way."
  - "Bit 0 (the empty subset) is set; exclude it when the problem wants non-empty subsets."
  - "A huge bitset as a local in a recursive function blows the stack; make it global or static."
related: [knapsack-01, knapsack-bounded, bit-tricks]
---
### The key loop
```cpp
bitset<MAXS> can;
can[0]=1;
for(ll v:a)can|=can<<v;            // all sums with v added, 64 at a time
```

### Uses

| task | after the loop |
|---|---|
| list reachable sums (template) | every s ≥ 1 with `can[s]` |
| equal partition | `S` even and `can[S/2]` |
| min difference of two groups | smallest `|S - 2s|` over `can[s]` |
| exactly k from group sizes | `can[k]` after reducing duplicate sizes |

### Many equal sizes
If sizes come from a partition of n (component sizes, cycle lengths), count each size first. Go
through sizes in increasing order: if size v has count c ≥ 3, keep 1 or 2 copies (same parity as c)
and add the other `(c-1)/2` pairs to the count of `2v`. Reachable sums stay the same, and only
O(√n) items are left for the shift-or loop.
