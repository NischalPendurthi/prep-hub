---
id: scheduling-simulation
title: Scheduling Simulation
signals:
  - "tasks / requests arrive at given times; servers / CPUs / rooms pick them by a rule"
  - "tie-break spelled out: smallest weight, then smallest index, then earliest arrival"
  - "\"if no server is free, the task waits until one becomes free\""
  - "times up to 1e9, so you can't tick second by second"
  - "queue with a capacity: requests are rejected (-1) when the buffer is full"
idea: |
  Event-driven simulation with **two heaps**: `free` ordered by the pick rule and `busy`
  ordered by **release time**. For each task, advance `t = max(t, arrival)`; if nothing is
  free, **jump `t` to the earliest release**; then **release every server with
  `freeTime ≤ t`** before choosing, so ties go by the pick rule, not by who finished first.
  Never tick unit by unit, jump between events.
complexity: "O((n + m) log n)"
pitfalls:
  - "Releasing only one server before choosing: several may be free, and the pick rule (weight, index) must see all of them."
  - "When waiting, the task starts at the release time, not at its arrival time: `t = busy.top().time`."
  - "Ties in `busy` at the same release time still go into `free`, which re-sorts them by the rule."
  - "Processing Queries (644B): the server takes a queued query only when it finishes; count queue size without the one running."
  - "Durations up to 1e9 and many tasks: finish times overflow int."
related: [heap-scheduling, sweep-line-events, multiset-budget]
---
### Common rule sets

| problem | free heap key | busy heap key | jump when |
|---|---|---|---|
| Process Tasks Using Servers (template) | (weight, index) | (free time, weight, index) | no free server |
| Single-Threaded CPU | available tasks by (duration, index) | — (one CPU) | no task available: `t = next arrival` |
| Meeting Rooms III | room index | (end time, room) | no room free: delay the meeting by `end − start` |
| Processing Queries | FIFO queue of size b | one running query | arrival ≥ finish time pops the queue |

### Key loop (the template)
```cpp
t=max(t,j);
if(freeS.empty()) t=max(t,busy.top()[0]);
while(!busy.empty() && busy.top()[0]<=t){ release(busy.top()); busy.pop(); }
pick freeS.top(); busy.push({t+d[j], w, id});
```

### Testing
Brute force: tick one second at a time with a FIFO queue and scan servers linearly.
Small times (≤ 5) make ties frequent, which is where the bugs are.
