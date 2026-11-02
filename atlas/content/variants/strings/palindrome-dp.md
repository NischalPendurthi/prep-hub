---
id: palindrome-dp
title: Palindrome DP
signals:
  - "minimum cuts to split s into palindromes / count such splits"
  - "number of palindromic substrings inside s[l..r], many queries, n <= 5000"
  - "longest palindromic SUBSEQUENCE / min insertions or deletions to make s a palindrome"
  - "is s[i..j] a palindrome, needed inside another DP"
  - "n up to ~5000, so O(n²) is allowed"
idea: |
  **`pal[l][r] = s[l]==s[r] && (r-l < 2 || pal[l+1][r-1])`**, filled by increasing length (or l
  from right to left). That table drives everything else: **min cuts** `cut[i] = min cut[j-1]+1` over
  palindromic `s[j..i]`; **palindromes inside a range** by inclusion-exclusion
  `cnt[l][r] = cnt[l+1][r] + cnt[l][r-1] - cnt[l+1][r-1] + pal[l][r]`. For **subsequences**,
  `lps[l][r] = s[l]==s[r] ? lps[l+1][r-1]+2 : max(lps[l+1][r], lps[l][r-1])`, and
  **min insertions = n - lps**.
complexity: "O(n²) time; O(n²) memory (use char/int tables at n = 5000)"
pitfalls:
  - "Filling l from left to right: pal[l][r] needs pal[l+1][r-1], so iterate by length or l from n-1 down."
  - "Memory: two 5000×5000 ll tables are 400MB. Use vector<char> for pal and int for counts."
  - "Inclusion-exclusion with len 2: cnt[l+1][r-1] is an empty range, treat it as 0."
  - "Substring vs subsequence: LPS (subsequence) is not the longest palindromic substring."
  - "Min cuts counts cuts, not pieces: answer is cut[n-1] with cut of a palindrome prefix = 0."
related: [interval-dp, manacher, lcs-edit-distance, partition-dp]
---
### Recurrences

| problem | state | transition |
|---|---|---|
| palindromes in [l, r] (template) | `cnt[l][r]` | inclusion-exclusion + `pal[l][r]` |
| min palindrome cuts | `cut[i]` for prefix 0..i | `min(cut[j-1]+1)` over `pal[j][i]`, 0 if `pal[0][i]` |
| longest palindromic subsequence | `lps[l][r]` | `+2` on matching ends, else max of the two shrinks |
| min insertions / deletions to palindrome | | `n - lps[0][n-1]` |
| count palindromic subsequences | `c[l][r]` | `c[l+1][r]+c[l][r-1]-c[l+1][r-1]` (+ `c[l+1][r-1]+1` if ends match) |

### The table
```cpp
for(ll len=1;len<=n;len++)
    for(ll l=0;l+len-1<n;l++){
        ll r=l+len-1;
        pal[l][r]= s[l]==s[r] && (len<=2 || pal[l+1][r-1]);
    }
```
