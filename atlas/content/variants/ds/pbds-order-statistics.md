---
id: pbds-order-statistics
title: Order Statistics (PBDS)
signals:
  - "k-th smallest element of a set that changes (insert / erase)"
  - "how many existing elements are < x (count smaller to the left, inversions online)"
  - "remove the element at position p from a list, repeatedly (Josephus, list removals)"
  - "rank of x among the current elements; median with deletions"
idea: |
  GNU `tree` with `tree_order_statistics_node_update` is a balanced BST that knows subtree sizes:
  **`find_by_order(k)`** returns an iterator to the k-th smallest (0-based) and **`order_of_key(x)`**
  returns the number of elements `< x`, both O(log n). It behaves like a `set`, so for a **multiset store
  pairs `(value, unique id)`**. For "delete the p-th element of a list", store the positions
  `1..n` and erase `find_by_order(p)`; the remaining ranks shift by themselves. A Fenwick tree with
  binary lifting does the same offline when values are compressible.
complexity: "O(log n) per operation (larger constant than std::set)"
pitfalls:
  - "`less<ll>` drops duplicates. Use `pair<ll,ll>` with a counter, or `less_equal` (which breaks erase and find)."
  - "`find_by_order(k)` is 0-based; on `k >= size` it returns `end()`, and dereferencing it is UB."
  - "Josephus with huge k: reduce `(pos + k) % size` with the CURRENT size."
  - "`order_of_key(x)` counts strictly smaller. For <= x use `order_of_key(x+1)` (ints) or `{x, INF}` with pairs."
  - "Needs the two `ext/pb_ds` includes and `using namespace __gnu_pbds;`. Not available on MSVC or LeetCode."
related: [fenwick-kth, fenwick-inversions, two-heaps-median, multiset-budget]
---
### Declaration
```cpp
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace __gnu_pbds;
typedef tree<ll,null_type,less<ll>,rb_tree_tag,tree_order_statistics_node_update> ordered_set;
// multiset: tree<pi, null_type, less<pi>, ...>, insert {x, id++}
```

### Uses

| task | call |
|---|---|
| count elements < x | `s.order_of_key(x)` |
| k-th smallest | `*s.find_by_order(k)` |
| remove the p-th item of a list | `s.erase(s.find_by_order(p))` |
| count smaller to the right | sweep right to left: `order_of_key({a[i], -1})`, then insert `{a[i], i}` |
| median | `*s.find_by_order((s.size()-1)/2)` |

### PBDS or Fenwick?
If all values are known in advance, compress them and use a Fenwick tree with prefix counts and
`fenwick-kth`. It is faster and has no duplicate trap. PBDS wins when values arrive online or you
want a few lines of code.
