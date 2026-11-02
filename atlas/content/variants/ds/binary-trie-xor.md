---
id: binary-trie-xor
title: Binary Trie (Max XOR)
signals:
  - "maximum a[i] xor a[j] over pairs, or max xor with a query value"
  - "maximum xor subarray: prefix xors + max pair"
  - "multiset with insert / erase / max xor query"
  - "count pairs (or subarrays) with xor < k / ≥ k"
  - "minimum xor pair"
idea: |
  Insert numbers as **30-bit strings from the top bit**. For max `x xor y`, walk from the top
  and **greedily take the child with the opposite bit** if it exists, since a higher bit beats
  all lower bits together. Keep **pass counts** per node to support erase (a child exists only
  if its count > 0) and to count numbers in a subtree for "xor < k". Subarray xor = **prefix
  xor pair**, so insert `pre[0] = 0` first.
complexity: "O(BITS) per operation, up to n·BITS nodes"
pitfalls:
  - "Erase leaves empty nodes: check cnt > 0, not just that the child pointer is non-zero."
  - "Too few bits: values up to 1e9 need 30 bits, up to 1e18 need 60 (and 1LL<<b)."
  - "Memory: 2e5 × 31 nodes with ll arrays is big; use int children."
  - "Max xor subarray: forgetting to insert prefix 0, which misses subarrays starting at index 0."
  - "Querying an empty trie: guarantee one element first (706D starts with 0)."
related: [trie-strings, prefix-xor, bitwise-greedy]
---
### Greedy query
```cpp
for(ll b=BITS-1;b>=0;b--){
    ll c=x>>b&1;
    int want=nxt[v][c^1];
    if(want && cnt[want]>0){res|=1LL<<b;v=want;}
    else v=nxt[v][c];
}
```

### Variants
| task | how |
|---|---|
| max xor of a pair | insert all, query each |
| max xor subarray | prefixes; query then insert `pre[i]` |
| count pairs with `x xor y < k` | walk along k: at bits where k has 1, add the count of the subtree matching x's bit, then follow the other side |
| min xor pair | sort, answer is min of adjacent xors (no trie needed) |
| max xor with y ≤ m (offline) | sort queries by m, insert as m grows |
