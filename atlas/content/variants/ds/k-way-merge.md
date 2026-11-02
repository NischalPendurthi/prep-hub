---
id: k-way-merge
title: K-Way Merge
signals:
  - "merge k sorted lists / arrays"
  - "k-th smallest in a sorted matrix, k smallest pair sums from two sorted arrays"
  - "smallest range that includes at least one element from each of k lists"
  - "the k best combinations (choose one item from each group) in order"
  - "generate numbers in order: ugly numbers, super ugly numbers"
idea: |
  Keep **one frontier pointer per list** in a min-heap of `(value, list, index)`. Pop the global
  minimum, output it, and **push its successor** from the same list. The heap never has more than k
  entries. For "k best sums", the lists are implicit: the state is an index tuple and the successors
  are the tuple **with one index bumped**; push each neighbour once (dedupe with a set, or use the
  canonical "only bump from the last changed index" rule). For smallest range, also track the **max of
  the frontier**; the range is `[heap min, max]`, and the scan stops when any list runs out.
complexity: "O(N log k) for N total elements; O(K log K) for the first K combinations"
pitfalls:
  - "Pushing duplicate states in the combination search. Mark visited tuples, or the heap blows up."
  - "Smallest range: stop as soon as the popped element's list is exhausted, not when the heap is empty."
  - "Empty lists in the input: skip them when seeding the heap."
  - "Pair sums: seed with (a[i] + b[0], i, 0) for i < k, not all n pairs."
  - "Heap of tuples needs `greater<>`; the default `priority_queue` is a max-heap."
related: [heap-top-k, two-pointers-same-dir, bs-on-answer]
---
### Shapes of the frontier

| problem | heap state | successors |
|---|---|---|
| merge k lists | (val, list, idx) | (list, idx+1) |
| k-th in sorted matrix | (val, row, col), seed column 0 | (row, col+1) |
| k smallest pair sums | (a[i]+b[j], i, j), seed j=0 | (i, j+1) |
| k best builds (CF 1574D) | (sum, index tuple) | each tuple with one index moved, dedupe with a set |
| smallest range of k lists | (val, list, idx) + current max | (list, idx+1), stop when a list ends |

### Smallest range loop
```cpp
while(true){
    auto [v,i,j]=pq.top();pq.pop();
    if(mx-v<bb-ba){ba=v;bb=mx;}
    if(j+1==(ll)L[i].size())break;
    pq.push({L[i][j+1],i,j+1});
    mx=max(mx,L[i][j+1]);
}
```

### Alternative
When only the k-th value is needed and values are bounded, **binary search the answer** and count
how many elements are <= mid (two pointers per list). This beats the heap when k is huge.
