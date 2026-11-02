---
id: anagram-counting
title: Frequency Counting / Anagrams
signals:
  - "can the letters of s be rearranged into t / into a palindrome"
  - "count substrings of s that are anagrams (permutations) of p"
  - "group words that are anagrams of each other"
  - "minimum changes so that two strings have the same multiset of letters"
  - "substrings where every letter appears an even number of times / at most k times"
idea: |
  Two strings are anagrams iff their **26-count arrays are equal**. For windows of fixed length
  |p|, **slide the count array**: one letter enters, one leaves, O(1) per step (plus a 26-check, or
  keep a `matches` counter of letters whose counts agree). Wildcards like '?' just need **no letter
  to exceed its count in p**. For "rearrange into a palindrome", **at most one letter has an odd
  count**; parity of every letter is a **26-bit mask**, so "substring with all counts even" is
  equal prefix masks, counted with a hashmap.
complexity: "O(26·n) sliding window, or O(n) with a matches counter"
pitfalls:
  - "Window shorter than p (|p| > |s|): the answer is 0; don't index s[i-m] with negative i."
  - "Comparing by sorting each window: O(n·m log m), too slow for n = 1e5."
  - "Grouping anagrams: the key is the sorted word (or the count array as a string), not the word."
  - "Uppercase or digits in the input: size the count array for the real alphabet."
  - "Parity-mask counting: start the map with mask 0 seen once, for substrings starting at index 0."
related: [window-fixed, prefix-hashmap-count, prefix-xor, rolling-hash]
---
### Sub-cases

| question | check |
|---|---|
| s, t anagrams | `cnt_s == cnt_t` |
| windows of s that are anagrams of p | slide counts, compare (template: '?' allowed, check `have <= need`) |
| min replacements to make t an anagram of s | `Σ max(0, cnt_s[c] - cnt_t[c])` |
| can rearrange into palindrome | number of odd counts `<= 1` |
| substrings with every count even | equal prefix parity masks: `Σ C(freq[mask], 2)` |
| substrings with at most one odd count | for each prefix mask m, add `freq[m] + Σ freq[m ^ (1<<c)]` |
| group anagrams | `map<string, vector<string>>` keyed by the sorted word |

### Sliding window
```cpp
for(ll i=0;i<n;i++){
    have[s[i]-'a']++;
    if(i>=m) have[s[i-m]-'a']--;
    if(i>=m-1 && have==need) ans++;
}
```
