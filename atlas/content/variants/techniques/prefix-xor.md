---
id: prefix-xor
title: Prefix XOR
signals:
  - "xor of a[l..r] for many queries"
  - "count subarrays whose xor equals k / is zero"
  - "split the array into parts with equal xor"
  - "xor of a subarray appears in a sum, max or parity condition"
  - "you may append xor of a suffix to the array (the answer is some subarray xor)"
idea: |
  `p[i] = a[0] ^ ... ^ a[i-1]`, `p[0] = 0`. Since **x ^ x = 0**, the xor of `a[l..r]` is
  **`p[r+1] ^ p[l]`**. Subarray xor problems become **pair-of-prefixes** problems:
  count pairs with `p[i] ^ p[j] = k` with a hashmap, maximise `p[i] ^ p[j]` with a binary
  trie, or count bits per position for sums of xors.
complexity: "O(n) build, O(1) per query"
pitfalls:
  - "Precedence: `p[r]^p[l-1]` inside `cout <<` needs brackets, because << binds tighter than ^."
  - "Count subarrays with xor k: start the map with cnt[0] = 1 for the empty prefix."
  - "Equal-xor split into parts: total xor 0 means any 2 parts work; otherwise you need an odd count of segments each equal to the total."
  - "Sum of xors over all subarrays: go bit by bit and count prefixes with bit 0 vs 1, or the O(n²) pairs blow up."
related: [prefix-sum-1d, prefix-hashmap-count, binary-trie-xor, bit-tricks]
---
### The core
```cpp
vi p(n+1,0);
for(ll i=0;i<n;i++)p[i+1]=p[i]^a[i];
ll x=(p[r+1]^p[l]);     // xor of a[l..r], brackets needed
```

### What to pair it with

| question | pair with |
|---|---|
| number of subarrays with xor = k | hashmap of prefix xors: add `cnt[p ^ k]` |
| max subarray xor | binary trie over prefixes (CSES 1655) |
| sum over subarrays of (xor × length) (CF 1879D) | per bit: count and index-sum of prefixes with bit 0 / 1 |
| subarray xor with even length only | split prefix counts by parity of index |
| xor of l..r over many queries with updates | Fenwick / segment tree with ^ instead of + |
