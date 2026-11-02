---
id: kmp
title: KMP / Prefix Function
signals:
  - "count / list occurrences of pattern t in text s"
  - "all borders (prefix == suffix) of a string, or the longest one"
  - "smallest period: the shortest w such that s is a prefix of www..."
  - "how many times each prefix occurs in the string"
  - "shortest string to append so the result has some prefix/suffix property"
idea: |
  `pf[i]` = length of the **longest proper prefix of s[0..i] that is also its suffix**. Compute it
  by trying `j = pf[i-1]` and **falling back along `j = pf[j-1]`** until `s[i]==s[j]` or `j==0`.
  For matching, **run it on `t + '#' + s`**: every position with `pf == |t|` ends an occurrence.
  All borders of s are the **chain `pf[n-1], pf[pf[n-1]-1], …`**, and the **smallest period is
  `n - pf[n-1]`** (s is a full repetition iff that divides n).
complexity: "O(n + m)"
pitfalls:
  - "Separator must not occur in either string, or pf can exceed |t| and fake matches appear."
  - "Only pf[n-1] is the longest border. Other borders lie on the chain, not at arbitrary k <= pf[n-1]."
  - "Period p = n - pf[n-1] always exists, but s is (w)^k only when n % p == 0."
  - "Start the loop at i = 1 (pf[0] = 0), and fall back with pf[j-1], not pf[j]."
  - "Prefix occurrence counts: add ans[pf[i]]++ then push down ans[pf[i-1]] += ans[i] from long to short, then +1 each."
related: [z-function, rolling-hash, trie-strings]
---
### What pf gives you

| question | from pf |
|---|---|
| occurrences of t in s (template) | positions with `pf == m` in `t#s` |
| all borders | chain from `pf[n-1]` |
| smallest period | `n - pf[n-1]` |
| s = w^k ? | `n % (n - pf[n-1]) == 0` |
| prefix s[0..i] is a square XX | `p = i+1-pf[i]`, square iff `(i+1) % (2p) == 0` |
| occurrences of every prefix | count `pf` values, push down the chain |
| automaton for DP over strings avoiding t | `go[state][c]` built from pf |

### The loop
```cpp
for(ll i=1;i<m;i++){
    ll j=pf[i-1];
    while(j>0 && t[i]!=t[j]) j=pf[j-1];
    if(t[i]==t[j]) j++;
    pf[i]=j;
}
```

### KMP or Z?
Both solve matching, borders and periods. Z reads more naturally for "suffix starting at j
matches a prefix"; prefix function is the one to use for an automaton in a DP.
