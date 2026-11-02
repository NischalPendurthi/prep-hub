---
id: monotonic-deque
title: Monotonic Deque (Window Max/Min)
signals:
  - "max / min of every window of size k (sliding window maximum)"
  - "longest subarray where max - min <= limit"
  - "dp[i] = best of dp[j] for j in [i-k, i-1] plus cost (jump at most k steps)"
  - "shortest subarray with sum >= K when values can be negative"
  - "window boundaries only move right, and you need an extreme of the window"
idea: |
  Keep **indices** in a deque with values **monotonic** front to back (decreasing for max). On a new
  index, **pop from the back** every element it dominates: an older, smaller value can never be the
  max again while the newer one is in the window. **Pop from the front** when the front index leaves
  the window. The front is then the window's extreme. Every index enters and leaves once, so the
  sweep is linear. The same deque gives an O(n) `dp[i] = max(dp[j]) + c` over a sliding range of `j`.
complexity: "O(n) time, O(k) memory"
pitfalls:
  - "Store indices, not values. Expiry (`front <= i-k`) needs the position."
  - "Push the new index before reading the front, or a window whose max is the new element reports a stale value."
  - "Output only once the first window is full (`i >= k-1`)."
  - "For max - min <= limit keep TWO deques and, when shrinking from the left, pop a front only if it equals the left index."
  - "Shortest subarray with sum >= K: the deque is over prefix sums; pop from the FRONT while `P[i] - P[front] >= K` (record the answer), pop from the back while `P[back] >= P[i]`."
related: [monotonic-stack, window-fixed, dp-monotonic-queue, sparse-table-rmq]
---
### Which order to keep

| you need | keep values | pop back while | front is |
|---|---|---|---|
| window max | decreasing | `a[back] <= a[i]` | max |
| window min | increasing | `a[back] >= a[i]` | min |
| dp max over last k | decreasing in `dp` | `dp[back] <= dp[i]` | best transition |
| shortest sum >= K | increasing prefix sums | `P[back] >= P[i]` | best left end |

### The loop
```cpp
deque<ll> dq;
for(ll i=0;i<n;i++){
    while(!dq.empty() && a[dq.back()]<=a[i])dq.pop_back();
    dq.push_back(i);
    if(dq.front()<=i-k)dq.pop_front();
    if(i>=k-1)ans.push_back(a[dq.front()]);
}
```
For a variable window (two pointers), replace the expiry check with
`while(dq.front()<l)dq.pop_front();` after moving `l`.

### Deque vs other tools
A static array with arbitrary ranges wants a sparse table. A window that only grows to the right but
needs an extreme, or a DP over the last k states, wants this deque. A window needing the k-th element
or the median wants two multisets.
