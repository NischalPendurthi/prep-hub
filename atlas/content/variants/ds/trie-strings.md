---
id: trie-strings
title: String Trie
signals:
  - "a dictionary of words; for each position of s, which words start here"
  - "count words with a given prefix, longest common prefix among many strings"
  - "split a string into dictionary words (word break) with |s| ~ 5000, total dict 1e6"
  - "autocomplete / prefix queries over many inserts"
idea: |
  Each node is a prefix; `nxt[v][c]` goes to the child, node 0 is the root. Insert walks and
  creates nodes; mark `end` (or a count) at the last node, and keep `pass` counts for
  "how many words have this prefix". For **word break**, `dp[i]` = ways for `s[i..]`: from
  each `i` **walk the trie along s** and add `dp[j+1]` at every word end, stopping at the
  first missing edge. That's O(|s| · longest word) instead of hashing every substring.
complexity: "O(total length · 26) memory with arrays, O(length) per insert/lookup"
pitfalls:
  - "Taking a reference to nxt[v] and then push_back: reallocation invalidates it."
  - "Memory: 1e6 nodes × 26 ll = 208 MB. Use int, or map children if the alphabet is large."
  - "Duplicate words: a bool end counts them once, a counter counts each."
  - "Not stopping the walk at a missing edge: index 0 means 'none', and also the root."
related: [binary-trie-xor, rolling-hash, kmp, dp-linear]
---
### Walk from every start
```cpp
for(ll i=n-1;i>=0;i--){
    ll v=0;
    for(ll j=i;j<n;j++){
        v=trie.nxt[v][s[j]-'a'];
        if(!v)break;
        if(trie.end[v])dp[i]=(dp[i]+dp[j+1])%mod;
    }
}
```

### What to store per node
| question | field |
|---|---|
| does word w exist | `end` flag |
| how many words have prefix p | `pass` count, incremented on every node during insert |
| longest common prefix of all words | walk while one child and no `end` |
| distinct substrings of s (n ≤ 5000) | insert every suffix, count nodes |
| all dictionary words occurring in a text | Aho-Corasick (trie + failure links) |
