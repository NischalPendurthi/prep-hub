---
id: rolling-hash
title: Rolling Hash
signals:
  - "compare two substrings for equality, many times, in O(1)"
  - "longest substring that appears twice / in both strings (binary search on length)"
  - "number of DISTINCT substrings of length k, or distinct substrings with a property"
  - "is s[l..r] a palindrome (hash of s and of reversed s)"
  - "cyclic shifts / rotations equal, string periods and borders"
idea: |
  `h[i+1] = h[i]*B + s[i] (mod M)`, `pw[i] = B^i`. Then **`hash(s[l..r)) = h[r] - h[l]*pw[r-l]`**,
  so any substring hash is O(1) after O(n) setup. Equal hashes mean equal strings with high
  probability: use **two moduli (or one 61-bit modulus)** and a **random base**, because CF hacks
  break fixed single hashes. Hashing turns comparisons into numbers you can **put in a set**,
  **binary search** (LCP of two suffixes, longest repeated substring), or compare with a reversed copy.
complexity: "O(n) build, O(1) per substring hash; LCP by binary search O(log n)"
pitfalls:
  - "Negative result from the subtraction: add M before the final % M."
  - "Single 32-bit modulus with fixed base: birthday collisions at ~1e5 substrings and anti-hash tests. Use double hashing."
  - "Base not larger than the alphabet values, or using s[i]-'a' which maps 'a' to 0 (then 'a' and 'aa' collide)."
  - "Overflow: h*B must fit in ll, so keep M around 1e9 and B < M."
  - "unordered_set of hashes is hackable on CF; a sorted vector or set is safe."
related: [kmp, z-function, bs-on-answer, anagram-counting]
---
### What to hash for

| task | how |
|---|---|
| borders / periods (template) | compare `get(0,k)` with `get(n-k,n)` |
| substring equality queries | compare two `get` pairs |
| LCP of suffixes i, j | binary search the largest L with equal hashes |
| longest repeated substring | binary search L, put all length-L hashes in a set |
| palindrome check of s[l..r) | forward hash of s vs hash of the matching range in reversed s |
| distinct substrings of length k | sort the n-k+1 hashes, count unique |
| lexicographic compare of substrings | LCP by hashing, then compare the next char |

### Substring hash
```cpp
pi get(ll l,ll r){                     // s[l..r)
    ll a=((h1[r]-h1[l]*p1[r-l])%M1+M1)%M1;
    ll b=((h2[r]-h2[l]*p2[r-l])%M2+M2)%M2;
    return {a,b};
}
```

### How to spot it
When the problem needs "are these two pieces equal" inside another algorithm (binary
search, DP, set), and KMP or Z don't fit the shape directly.
