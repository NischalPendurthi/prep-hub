---
id: heap-scheduling
title: Heap-Driven Scheduling Simulation
signals:
  - "tasks arrive over time; the CPU / server picks the shortest (or highest-priority) available one"
  - "minimum number of rooms / machines; assign each customer a room"
  - "servers become free at different times; pick the free server with the smallest id"
  - "simulate events in time order where time jumps between events"
idea: |
  **Sort the arrivals by time** and sweep them with a pointer. Keep a heap of **ready** jobs keyed by
  the scheduling rule (shortest first, then smallest index), and often a second heap of **busy**
  machines keyed by `(free time, id)`. At each step, move every arrival with `time <= now` into the
  ready heap, run the best one, and advance `now`. When nothing is ready, **jump `now` to the next
  arrival** instead of ticking one unit at a time.
complexity: "O(n log n)"
pitfalls:
  - "Not jumping the clock when idle: with times up to 1e9 a unit-step loop is TLE, and the ready heap is empty, so `top()` is UB."
  - "Tie-breaking: put the secondary key (index) in the heap key, e.g. `pair(proc, idx)`."
  - "Release before allocate: free every machine with `end <= start` (or `< start`, read the statement) before choosing one."
  - "Clock and finish times overflow int (sum of durations up to 1e14)."
  - "Room allocation: reuse the room that frees EARLIEST, and give a new room only if even that one is busy."
related: [scheduling-simulation, sweep-line-events, interval-greedy, heap-regret-greedy]
---
### Two common shapes

| problem | heaps | step |
|---|---|---|
| single CPU, shortest job first (LC 1834) | ready: (proc, idx) | push arrivals <= now, pop best, `now += proc` |
| min rooms + assignment (CSES 1164) | busy: (end, room) | sort by start; if `busy.top().end < start` reuse, else new room |
| servers with ids (LC 1882, 2402) | free: (weight/id), busy: (end, id) | move finished busy -> free, then assign; if none free, jump to `busy.top().end` |

### The main loop
```cpp
while(done<n){
    if(ready.empty() && now<en[ord[p]])now=en[ord[p]];   // idle: jump
    while(p<n && en[ord[p]]<=now){ready.push({pr[ord[p]],ord[p]});p++;}
    auto [d,id]=ready.top();ready.pop();
    now+=d; order.push_back(id); done++;
}
```

### Spotting it
The statement describes a process ("each second", "whenever a machine becomes free") and asks for
the resulting order or count. Simulate it, but driven by events: each job enters and leaves a heap
once.
