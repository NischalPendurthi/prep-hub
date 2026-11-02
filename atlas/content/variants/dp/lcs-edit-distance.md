---
id: lcs-edit-distance
title: LCS / Edit Distance
signals:
  - "two strings / arrays, align them: longest common subsequence"
  - "min insertions / deletions / replacements to turn a into b"
  - "min deletions to make two strings equal, shortest common supersequence"
  - "|a|, |b| ≤ 5000, so |a|·|b| states fit but not in ll memory"
  - "longest palindromic subsequence (= LCS of s and reverse(s))"
idea: |
  `dp[i][j]` = answer for **prefixes** `a[0..i)` and `b[0..j)`. Look at the last characters: if
  they match, take the diagonal `dp[i-1][j-1]` (+1 for LCS, +0 for edit); otherwise drop one of them
  (`dp[i-1][j]`, `dp[i][j-1]`) and for edit distance also **replace** (`dp[i-1][j-1] + 1`). Base row
  and column are `0` for LCS, `i` / `j` for edit distance. Row i only reads row i-1, so keep **two rows**.
complexity: "O(n·m) time, O(min(n, m)) memory with rolling rows"
pitfalls:
  - "Base cases for edit distance are dp[i][0] = i and dp[0][j] = j, not 0."
  - "5000×5000 ll is 200 MB: use two rows, or int."
  - "Rolling rows: set cur[0] at the start of each row, and swap after the row, then read prev[m]."
  - "Recovering the actual LCS needs the full table (or Hirschberg); rolling rows lose it."
  - "LCS of two permutations is LIS after relabelling: O(n log n), don't do O(n²)."
related: [lis, palindrome-dp, rolling-hash]
---
### Recurrences

| task | match | mismatch | base |
|---|---|---|---|
| LCS length | `dp[i-1][j-1] + 1` | `max(dp[i-1][j], dp[i][j-1])` | 0 |
| edit distance (template) | `dp[i-1][j-1]` | `1 + min(up, left, diag)` | `i`, `j` |
| min deletions to equalise | `dp[i-1][j-1]` | `1 + min(up, left)` | `i`, `j` |
| shortest supersequence | `n + m - LCS` | | |
| longest palindromic subseq | LCS(s, reverse(s)) | | |

### The key loop (two rows)
```cpp
for(ll j=0;j<=m;j++)prev[j]=j;
for(ll i=1;i<=n;i++){
    cur[0]=i;
    for(ll j=1;j<=m;j++)
        cur[j]=min({prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]!=b[j-1])});
    swap(prev,cur);
}
// answer prev[m]
```
