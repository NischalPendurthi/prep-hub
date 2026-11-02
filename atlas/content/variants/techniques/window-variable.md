---
id: window-variable
title: Variable-Size Window
signals:
  - "longest / shortest subarray (substring) such that ..."
  - "longest segment with all distinct values / at most k distinct values"
  - "max - min in the window ≤ d"
  - "smallest window containing all required characters / values"
  - "the condition stays true when you shrink a valid window"
idea: |
  Grow `r` one step at a time, then **shrink `l` until the window is valid again**, and update the
  answer. It needs the condition to be **monotone**: if a window is valid, every sub-window is too
  (for "longest"), or every super-window is (for "shortest"). For **longest**, record after
  shrinking. For **shortest**, record *while* shrinking a valid window.
complexity: "O(n) amortized (× log for a map or multiset)"
pitfalls:
  - "Longest vs shortest record at different points: longest after the while loop, shortest inside it before removing a[l]."
  - "Shrinking with if instead of while: one step may not restore validity."
  - "Non-monotone conditions (sum = k with negatives, exactly k distinct) don't work with one window. Use prefix + hashmap or AtMost(k) - AtMost(k-1)."
  - "max - min in the window needs two monotonic deques or a multiset, because a plain max variable can't shrink."
related: [window-fixed, window-at-most-k, two-pointers-same-dir, monotonic-deque]
---
### The core (longest valid)
```cpp
ll l=0,best=0;
for(ll r=0;r<n;r++){
    add(a[r]);
    while(!valid()){ remove(a[l]); l++; }
    best=max(best,r-l+1);
}
```
Shortest valid:
```cpp
for(ll r=0;r<n;r++){
    add(a[r]);
    while(valid()){ best=min(best,r-l+1); remove(a[l]); l++; }
}
```

### Common conditions

| condition | state |
|---|---|
| all distinct (CSES 1141) | `cnt[x]`, invalid when `cnt[a[r]] > 1` |
| at most k distinct (CF 616D) | `cnt` + distinct counter |
| shortest containing 1, 2, 3 (CF 1354B) | count of each, valid when all > 0 |
| max - min ≤ 1 (CF 602B) / ≤ k (CF 6E) | multiset or two deques |
| prefix balance stays ≥ 0 (CF 1611F) | window sum ≥ -s, positive part via prefix sums |
