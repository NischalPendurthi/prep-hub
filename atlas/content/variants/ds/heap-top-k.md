---
id: heap-top-k
title: Top-K with a Heap
signals:
  - "k-th largest / k largest elements, in a stream or after each insertion"
  - "top k frequent elements, k closest points"
  - "choose k items; score = (sum of one attribute) * (min of another)"
  - "sort by one key, then keep the best k of the other key seen so far"
idea: |
  To keep the **k largest**, use a **min-heap of size k**: its top is the k-th largest, and a new value
  only enters if it beats the top (pop, push). Anything that falls out can never return. For k smallest,
  flip to a max-heap. The common 2-key pattern: **sort by key A descending**, sweep, and keep the
  **best k of key B** in a heap with its running sum. At step i, A[i] is the minimum A of the chosen
  set, so `sumB * A[i]` is a candidate answer.
complexity: "O(n log k) time, O(k) memory"
pitfalls:
  - "Heap direction: k LARGEST needs a MIN-heap (`greater<ll>`). The max-heap of everything is O(n log n) and memory-heavy."
  - "Keep the running sum in sync: subtract the popped value, add the pushed one."
  - "2-key pattern: push the current item before evaluating, and only evaluate when the heap has exactly k items."
  - "Fewer than k items so far: decide what to print (-1, nothing) before calling `top()` on a short heap."
  - "nth_element is O(n) for a single static query. Use the heap for streams or a sweep."
related: [two-heaps-median, k-way-merge, exchange-argument, heap-regret-greedy]
---
### Sub-cases

| task | structure | answer |
|---|---|---|
| k-th largest in a stream | min-heap, size k | `top()` |
| top k frequent | count map, then min-heap of (freq, val), size k | heap contents |
| k closest points | max-heap by distance, size k | heap contents |
| max `sum(B) * min(A)` over k items | sort by A desc, min-heap of B, size k | max over i of `sum * A[i]` |
| max `sum(B)` with A[i] <= limit | sort by A, heap of B | sweep the limit |

### The 2-key sweep (CF 1140C Playlist, LC 2542)
```cpp
sort by beauty descending;
priority_queue<ll,vi,greater<ll>> pq; ll sum=0, best=0;
for(auto [b,len]:items){
    pq.push(len); sum+=len;
    if((ll)pq.size()>k){sum-=pq.top();pq.pop();}   // drop the shortest
    best=max(best,sum*b);                          // b = min beauty of the chosen set
}
```
