---
id: submask-enumeration
title: Submask Enumeration
signals:
  - "n ≤ 16 (sometimes 18): split items into groups, each group's value depends only on its set"
  - "dp[mask] = best over the LAST group s ⊆ mask: dp[mask ^ s] + cost[s]"
  - "assign tasks to workers / sessions / days with a per-set feasibility"
  - "for each mask, combine information about all its subsets (small n; for large n use SOS)"
idea: |
  `for(s=mask; s>0; s=(s-1)&mask)` visits every non-empty submask of `mask` in decreasing order.
  Over all masks this costs **3^n** in total (each element is out, in mask only, or in both),
  so n ≤ 16 is safe (4.3e7). Precompute `cost[set]` once in O(2^n · n) (or O(2^n) from
  `mask & (mask-1)`), then `dp[mask] = best over s of dp[mask^s] + cost[s]`. **Force the
  lowest bit of mask into s** so each partition is generated once.
complexity: "O(3^n) transitions + O(2^n · n) precompute"
pitfalls:
  - "The loop skips s = 0. If the empty submask matters, handle it after the loop."
  - "Not fixing the low bit: correct for max/min but 'counts' of partitions get multiplied by the group orders."
  - "n = 18 means 3.9e8: tight. n = 20 is too slow, look for SOS DP or a greedy instead."
  - "Computing cost[s] inside the 3^n loop (an O(n) loop there makes it n·3^n). Precompute."
  - "`1<<n` with ll masks: use `1LL<<n` and `__builtin_ctzll`."
related: [bitmask-dp, sos-dp, bit-tricks, meet-in-the-middle]
---
### The loop
```cpp
for(ll mask=1;mask<full;mask++){
    ll low=mask&-mask;
    for(ll s=mask;s>0;s=(s-1)&mask){
        if(!(s&low))continue;            // s is the group containing the lowest element
        dp[mask]=max(dp[mask],cost[s]+dp[mask^s]);
    }
}
```

### Other enumerations

| want | loop |
|---|---|
| all submasks incl. 0 | `for(s=mask;;s=(s-1)&mask){ ...; if(s==0)break; }` |
| all supermasks of mask | `for(s=mask;s<full;s=(s+1)|mask)` |
| all masks with exactly k bits | Gosper's hack: `c=x&-x, r=x+c, x=(((r^x)>>2)/c)|r` |
| sum over all submasks for every mask, large n | SOS DP, O(n · 2^n) |

### How to spot it
The answer is a partition of a small set into groups, and each group's cost can be
computed on its own.
