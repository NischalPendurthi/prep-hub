---
id: small-to-large
title: Small-to-Large Merging
signals:
  - "for every subtree: number of distinct colours / most frequent colour"
  - "for each node, count nodes in its subtree with some property relative to it"
  - "merge sets (or maps) repeatedly and answer about each merged set"
  - "n up to 2e5 and an O(n * subtree) answer is too slow"
idea: |
  Give each node a set (or map of counts). Process children before parents and merge each
  child's set into the parent's, but **always pour the smaller set into the larger** and
  **`swap` the containers first (O(1))** when the child's is bigger. An element only moves when it
  lands in a set at least twice as big as its old one, so **each element moves O(log n) times**:
  O(n log² n) total with std::set. Record the answer for a node **as soon as all its children are
  merged**, before the node is merged upward and its set is reused.
complexity: "O(n log² n) with set/map; O(n log n) with unordered_map or DSU-on-tree"
pitfalls:
  - "Merging without the swap: always copying the child into the parent is O(n²) on a path."
  - "Reading ans[u] after u's set was moved into the parent. Record it when u finishes."
  - "Copying a set by value (`set<ll> s = st[v]`) instead of swapping. That alone is O(n²)."
  - "Map of counts: after merging, the per-node answer (e.g. max frequency) must be updated during the inserts of the small side only."
related: [tree-dp, subtree-euler-tour, dsu-basic]
---
### Variants

| task | container | per-node answer |
|---|---|---|
| distinct colours (template) | `set<ll>` | `size()` |
| sum of dominating colours (CF 600E) | `map<colour,count>` + current max and its sum | update while inserting the small side |
| count of nodes at depth d below u | `map<depth,count>` or deque by depth | lookup |
| sets in DSU union (not a tree) | vector per root, merge smaller | union by size is the same idea |

### The merge
```cpp
if(st[u].size()>st[p].size()) swap(st[u],st[p]);   // O(1) pointer swap
for(ll x:st[u]) st[p].insert(x);
st[u].clear();
```
With maps the parent's answer variables must follow the swap too: keep them in a struct
together with the map and swap the whole struct.

### Offline alternative
Distinct values in a subtree is also a range-distinct query on the Euler tour array
(sort queries by right end, BIT over last occurrences). Small-to-large is shorter to write.
