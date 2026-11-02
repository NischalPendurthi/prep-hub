---
id: fenwick-kth
title: K-th Element by Binary Lifting
signals:
  - "remove the k-th remaining element, repeatedly (Josephus, list removals)"
  - "dynamic multiset: insert, erase, ask k-th smallest / median"
  - "first index where the prefix sum reaches k, with point updates"
  - "find position of the k-th free slot / seat"
idea: |
  Keep counts in a BIT (1 = present). To find the smallest `i` with `prefix(i) ≥ k`,
  **walk powers of two from the top**: if `tree[pos+pw] < k`, the answer is past it, so
  **`pos += pw; k -= tree[pos]`**. Answer `pos+1`. One O(log n) pass, no binary search over
  `query` (that is O(log² n)). Needs **non-negative** values so prefixes are monotone.
complexity: "O(log n) per k-th query and update"
pitfalls:
  - "Start pw at the highest power of two ≤ n, and check `pos+pw <= n`."
  - "Use `< k`, not `<= k`, or you land one past the answer."
  - "k larger than the total count returns n+1: check bounds first."
  - "Values must be ≥ 0; with negatives the prefix isn't monotone and the walk is wrong."
  - "Over values ≤ 1e9: compress first (offline), or switch to PBDS / a trie."
related: [fenwick-point-range, pbds-order-statistics, segtree-descent]
---
### The walk
```cpp
ll kth(ll k){                    // smallest i with sum(1..i) >= k
    ll pos=0;
    for(ll pw=LOG;pw>0;pw>>=1)   // LOG = highest power of 2 <= n
        if(pos+pw<=n && tree[pos+pw]<k){pos+=pw;k-=tree[pos];}
    return pos+1;
}
```
Why it works: when `pos` is a multiple of `2pw`, `tree[pos+pw]` covers exactly `(pos, pos+pw]`.

### Uses
| task | BIT holds | query |
|---|---|---|
| remove p-th remaining (CSES 1749) | 1 per alive index | `kth(p)`, then `update(idx,-1)` |
| Josephus with step k | 1 per alive person | `kth((cur+k-1) % alive + 1)` |
| k-th smallest in a multiset | count per compressed value | `kth(k)` |
| median of a stream | count per value | `kth((size+1)/2)` |
