---
id: prefix-hashmap-count
title: Prefix + Hashmap Counting
signals:
  - "count subarrays with sum exactly k, and values can be negative"
  - "count subarrays whose sum is divisible by m"
  - "count subarrays where #A equals #B (map A to +1, B to -1)"
  - "sum of a[l..r] equals its length (subtract 1 from every value)"
  - "count pairs i < j with a[j] - j = a[i] - i (same key after a transform)"
idea: |
  `sum(l..r) = k` means **`pre[r] - pre[l-1] = k`**, so while scanning r, add the number of
  earlier prefixes equal to **`pre[r] - k`**, then insert `pre[r]`. Seed the map with
  **`cnt[0] = 1`** for the empty prefix. Most problems first **transform each value** (−1, ±1,
  mod m, xor) so the condition becomes "two prefix keys are equal".
complexity: "O(n log n) with map, O(n) expected with unordered_map"
pitfalls:
  - "Forgetting cnt[0] = 1, which drops every subarray starting at index 0."
  - "Inserting pre[r] before querying, which counts the empty subarray when k = 0."
  - "unordered_map on Codeforces gets hacked with anti-hash tests. Use map or a custom hash."
  - "Divisible-by-m keys: ((pre % m) + m) % m, since C++ % can be negative."
  - "The answer can be about n²/2 = 2e10, so the counter must be ll."
related: [prefix-sum-1d, prefix-xor, two-pointers-same-dir, anagram-counting]
---
### The core
```cpp
mi cnt; cnt[0]=1;
ll pre=0,ans=0;
for(ll i=0;i<n;i++){
    pre+=a[i];
    ans+=cnt[pre-k];   // or find(), to avoid inserting zeros
    cnt[pre]++;
}
```

### Transforms that reduce to "equal keys"

| condition on a[l..r] | value / key |
|---|---|
| sum = k | key `pre`, look up `pre - k` |
| sum % m == 0 (CSES 1662) | key `pre mod m` |
| sum = length (CF 1398C) | value `a[i] - 1`, k = 0 |
| equal 0s and 1s | value `0 → -1`, k = 0 |
| xor = k | key `prefix xor`, look up `px ^ k` |
| a[j] - j == a[i] - i (CF 1520D) | key `a[i] - i` directly, no prefix |
| even count of every letter | key = bitmask of letter parities |

### When not to use it
All values positive and you need sum = k: two pointers is simpler and O(1) memory.
Sum ≤ k or ≥ k with negatives: you need a sorted structure (Fenwick on compressed prefixes), not a hashmap.
