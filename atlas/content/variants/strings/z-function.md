---
id: z-function
title: Z-Function
signals:
  - "for every position, how long the substring starting there matches a prefix"
  - "all periods of a string, or all suffixes that are also prefixes"
  - "occurrences of a pattern (z on t + '#' + s)"
  - "split s into a prefix that repeats / count prefixes that occur at a position"
  - "number of distinct substrings for small n (z on each suffix reversed)"
idea: |
  `z[i]` = **LCP of s and s[i..]**. Keep the box `[l, r)` with the largest r that matches a prefix;
  for i inside it, **start from `min(r-i, z[i-l])`** and extend by brute force. Every extension
  moves r right, so it is linear. Then **suffix s[i..] is a prefix of s iff `i + z[i] == n`**, which
  gives borders, and **p is a period iff `p + z[p] == n`** (and n is always a period).
complexity: "O(n)"
pitfalls:
  - "z[0] is undefined (set to 0 or n by convention). Don't use it as a match of length n."
  - "Matching with t + '#' + s: the separator must be absent from both strings."
  - "Using `i <= r` with a half-open box. Keep `[l, r)` and the test `i < r` consistent."
  - "Periods are not only divisors of n: p is a period whenever the shift by p matches, even if n % p != 0."
related: [kmp, rolling-hash, two-pointers-same-dir]
---
### Uses

| question | from z |
|---|---|
| periods (template) | p with `p + z[p] == n`, plus n |
| borders | lengths `n - i` with `i + z[i] == n` |
| occurrences of t in s | positions in `t#s` with `z == m` |
| longest prefix occurring elsewhere | `max z[i]` for i >= 1 |
| compress s into w^k | smallest p with `n % p == 0` and `p + z[p] == n` |

### The loop
```cpp
for(ll i=1,l=0,r=0;i<n;i++){
    if(i<r) z[i]=min(r-i,z[i-l]);
    while(i+z[i]<n && s[z[i]]==s[i+z[i]]) z[i]++;
    if(i+z[i]>r){l=i;r=i+z[i];}
}
```
