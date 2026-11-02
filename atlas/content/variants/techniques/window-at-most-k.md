---
id: window-at-most-k
title: "Exactly K = AtMost(K) − AtMost(K−1)"
signals:
  - "count subarrays with EXACTLY k distinct values"
  - "count subarrays with exactly k odd numbers / exactly k ones"
  - "count binary subarrays with sum = goal"
  - "count subarrays with at most k ..., or all subarrays where a monotone condition holds"
idea: |
  "Exactly k" isn't monotone, so one window can't count it. **"At most k"** is: a valid window stays
  valid when shrunk. For each `r`, the shortest-`l` window gives **`r - l + 1` valid subarrays ending
  at r**, so a single pass counts all of them. Then **exactly(k) = atMost(k) − atMost(k−1)**.
  The same `r - l + 1` counting answers any "count subarrays with a monotone property".
complexity: "O(n) per atMost call (× log with a map), two calls"
pitfalls:
  - "atMost(-1) must return 0, or k = 0 crashes or loops."
  - "Adding 1 per r instead of r-l+1 counts windows, not subarrays."
  - "The total is up to n(n+1)/2 ≈ 2e10, so ll."
  - "Resetting the state between the two calls: use a fresh map inside the lambda."
related: [window-variable, prefix-hashmap-count, two-pointers-same-dir]
---
### The core
```cpp
auto atMost=[&](ll m)->ll{
    if(m<0)return 0;
    mi cnt; ll l=0,distinct=0,res=0;
    for(ll r=0;r<n;r++){
        if(cnt[a[r]]++==0)distinct++;
        while(distinct>m){ if(--cnt[a[l]]==0)distinct--; l++; }
        res+=r-l+1;          // every subarray [l'..r] with l' >= l
    }
    return res;
};
ll exactly=atMost(k)-atMost(k-1);
```

### Where it applies

| "exactly k" of | the at-most state |
|---|---|
| distinct values (LC 992) | `cnt` + distinct counter |
| odd numbers (LC 1248) | number of odds in the window |
| sum of a 0/1 array = goal (LC 930) | window sum (also solvable with prefix + hashmap) |
| at most k distinct, counted directly (CSES 2428) | one call, no subtraction |
| subarrays where `a[i] ≥ position` holds (CF 1736C1) | monotone condition, `r - l + 1` per r |

Exactly k with a 0/1 array is also `prefix + hashmap` (count `pre - k`), which is a single pass.
