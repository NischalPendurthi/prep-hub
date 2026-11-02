---
id: dp-monotonic-queue
title: Monotonic-Queue Optimisation
signals:
  - "dp[i] = a[i] + max (or min) of dp[j] over a sliding window j ∈ [i-k, i-1]"
  - "jump at most k steps forward, maximise the score"
  - "every k consecutive elements must contain at least one chosen"
  - "subsequence where adjacent chosen indices differ by at most k"
  - "n·k too big, but the window only slides forward"
idea: |
  When the transition takes a **max/min over a window that slides right**, keep a
  **deque of indices** whose dp values are **monotonic**: push the new candidate after
  popping worse ones from the back, pop indices that left the window from the front;
  the **front is the optimum**. Each index enters and leaves once, so a row costs O(n).
  With an extra dimension (exactly x picks) run one deque pass per layer.
complexity: "O(n) per layer → O(n · x) total; O(n) memory with rolling rows"
pitfalls:
  - "Window bounds: decide exactly which j are allowed (i-k ≤ j ≤ i-1) and pop the front with `<`, not `<=`."
  - "Insert the new candidate BEFORE reading the front when j = i-1 is allowed."
  - "Unreachable dp values (-INF) inside the deque: check before adding a[i], or -INF + a[i] looks valid."
  - "The answer must also satisfy the constraint at the end (last pick within the final k)."
  - "Memory: 5000×5000 ll = 200 MB. Roll two rows."
related: [monotonic-deque, window-fixed, dp-prefix-opt, convex-hull-trick]
---
### One layer (Pictures with Kittens, the template)
```cpp
deque<ll> dq;
for(ll i=1;i<=n;i++){
    while(!dq.empty() && prv[dq.back()]<=prv[i-1])dq.pop_back();
    dq.push_back(i-1);                       // j = i-1 enters the window
    while(dq.front()<i-k)dq.pop_front();     // j < i-k left it
    if(prv[dq.front()]!=NEG)cur[i]=prv[dq.front()]+a[i];
}
```

### When it applies

| transition | tool |
|---|---|
| max/min of dp[j] over a sliding window | monotonic deque (this) |
| sum of dp[j] over a window | prefix sums ([dp-prefix-opt]) |
| min of dp[j] + b[j]·a[i] (linear in i) | convex hull trick |
| window max where dp[j] + cost(j,i) with cost = f(i) + g(j) | deque on dp[j] + g(j) |
