---
id: manacher
title: Manacher
signals:
  - "longest palindromic substring, n up to 1e6"
  - "count all palindromic substrings in O(n)"
  - "for every centre, the radius of the longest palindrome"
  - "is s[l..r] a palindrome, many queries (O(1) after Manacher)"
  - "longest palindrome that is a prefix / suffix of s"
idea: |
  Insert `#` between characters (`@#a#b#a#$`) so **every palindrome has odd length** and one loop
  handles both. Keep the palindrome `[l, r]` reaching furthest right. For a new centre i inside it,
  **its mirror `l + r - i` already knows a radius**, so start at `min(r - i, p[mirror])` and expand.
  Each expansion pushes r right, so it is O(n). In the transformed string, **`p[i]` equals the
  palindrome's length in the original** and it **starts at `(i - p[i]) / 2`**.
complexity: "O(n) time and memory"
pitfalls:
  - "Sentinels: '@' and '$' must differ from each other and from the alphabet, or the while loop runs off the ends."
  - "Mixing up radius in ms with length in s. With the '#' transform p[i] is already the original length."
  - "s[l..r] is a palindrome iff p at centre l+r+2 (in ms indices) is >= r-l+1. Check the index map with a tiny case."
  - "Number of palindromic substrings = Σ (p[i]+1)/2 over all centres; it can reach n²/2, so use ll."
related: [palindrome-dp, rolling-hash, z-function]
---
### Index map (`ms = "@#" + s[0] + "#" + s[1] + ... + "#$"`)

| in s | in ms |
|---|---|
| character s[j] | index `2j + 2` |
| gap before s[j] | index `2j + 1` |
| centre of s[l..r] | index `l + r + 2` |
| palindrome at ms index i | start `(i - p[i]) / 2`, length `p[i]` |

### Counting
```cpp
ll total=0;
for(ll i=1;i+1<(ll)p.size();i++) total+=(p[i]+1)/2;   // palindromes centred at i
```

### Manacher or DP?
Manacher answers centre-based questions in O(n). When the question is about arbitrary
intervals (count palindromes inside [l, r], min cuts), the O(n²) [palindrome DP](#palindrome-dp) is the tool.
