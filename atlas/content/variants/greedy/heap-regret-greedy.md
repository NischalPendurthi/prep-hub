---
id: heap-regret-greedy
title: Greedy with Regret (Heap)
signals:
  - "process items left to right, take as many as possible while a running total stays ≥ 0 / ≤ limit"
  - "a choice made now can be \"undone\" later if something better shows up"
  - "buy/sell one unit per day for max profit (unlimited transactions, one share per day)"
  - "courses with durations and deadlines: maximise how many you finish"
  - "fewest refuelling stops / potions: drink everything, drop the worst when you go negative"
idea: |
  Scan in the forced order and **take greedily**, pushing what you took into a heap.
  When a constraint breaks, **pop the worst choice so far** (most negative potion, longest
  course). Each item is taken and dropped at most once, so it's O(n log n). In the
  **regret-token** form (Buy Low Sell High), a sale at `p` also pushes `p` back so a later
  higher price can "re-sell" it, turning the earlier day into a pass-through.
complexity: "O(n log n)"
pitfalls:
  - "Pop the worst item only when the constraint is actually violated, and pop exactly one per new item."
  - "Course Schedule III: sort by deadline FIRST; the heap only fixes choices within that order."
  - "Buy Low Sell High: push p twice when you sell (once as the regret token, once as a fresh buy), once otherwise."
  - "Totals overflow int quickly (2e5 × 1e9): keep sums in ll."
related: [exchange-argument, heap-top-k, interval-greedy]
---
### Two shapes

| shape | loop | example |
|---|---|---|
| take, then drop the worst | push item; if invalid, pop max-cost | Potions (pop most negative while health < 0), Course Schedule III (pop longest while time > deadline), Refuelling (pop biggest station when stuck) |
| regret token | sell against the cheapest, push the sale price back | Buy Low Sell High, Least Cost Bracket Sequence (turn a `(` back into `)` cheapest) |

### Key loop (the template, CF 865D)
```cpp
for(ll x:p){
    if(!pq.empty() && pq.top()<x){
        ans+=x-pq.top(); pq.pop();
        pq.push(x);          // regret: lets a later q replace this sale (x-c)+(q-x)=q-c
    }
    pq.push(x);
}
```

### Why it works
An exchange argument at every step: the heap holds exactly the choices you could swap
out, and swapping the worst one is never worse than any other swap. If the brute force
is a dp over "how many taken so far", this greedy is usually its shortcut.
