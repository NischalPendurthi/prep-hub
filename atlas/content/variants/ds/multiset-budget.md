---
id: multiset-budget
title: "Two Multisets: K Smallest under a Budget"
signals:
  - "sum of the k smallest (or largest) elements in every sliding window"
  - "pick k - 1 more starts within distance dist, minimise the total (LC 3013)"
  - "how many items fit in budget B if you take the cheapest ones, with items added and removed"
  - "elements are inserted AND deleted, and you need an order statistic plus a sum"
idea: |
  Split the current multiset into **low** (the `need` smallest) and **high** (the rest), and keep
  **sumLow**. Insert into low, then `fix()`: **move low's max to high** while low is too big, and
  **move high's min to low** while low is too small. Delete by checking which side holds the value
  and **erase one copy**, then `fix()`. Each operation moves O(1) elements, so a sliding window costs
  O(log n) per step. For "as many as fit in budget B", the boundary is the count instead of k:
  pull from high while `sumLow + min(high) <= B`, push back while `sumLow > B`.
complexity: "O(log n) per insert/erase"
pitfalls:
  - "`ms.erase(x)` removes every copy; use `ms.erase(ms.find(x))`."
  - "Deciding the side: compare with `*low.rbegin()`, and handle an empty low."
  - "Keep sumLow in sync on EVERY move between the sets, not only on insert/erase."
  - "Windows: remove the outgoing element before reading the answer, and read only when the window is full."
  - "Budget version with a changing budget per query can move many elements; it is amortised only when the budget is fixed or monotone."
related: [two-heaps-median, pbds-order-statistics, window-fixed, heap-top-k]
---
### What the split answers

| need | boundary | read |
|---|---|---|
| sum of k smallest in window | `low.size() == k` | `sumLow` |
| median / sum of deviations | `low.size() == ceil(w/2)` | `max(low)`, sums of both |
| most items under budget B | largest prefix with `sumLow <= B` | `low.size()` |
| k-th smallest only | `low.size() == k` | `max(low)` (PBDS also works) |

### fix()
```cpp
while((ll)low.size()>need){auto it=prev(low.end());sumLow-=*it;high.insert(*it);low.erase(it);}
while((ll)low.size()<need && !high.empty()){auto it=high.begin();sumLow+=*it;low.insert(*it);high.erase(it);}
```

### Spotting it
A plain heap works when items only arrive. Once items also leave (a sliding window, or "remove item
x"), you need deletions by value, so use two multisets. When values are small (CF 1185C2 has
t_i <= 100), a count array per value is simpler.
