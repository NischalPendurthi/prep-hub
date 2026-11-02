---
id: stack-simulation
title: Stack Simulation & Matching
signals:
  - "balanced / regular bracket sequence, longest valid parentheses, min insertions to balance"
  - "adjacent equal (or opposite) pairs cancel: asteroid collisions, remove adjacent duplicates, 'AB'/'CD' deletions"
  - "evaluate an expression, decode `3[a2[c]]`, simplify a Unix path"
  - "undo / backspace editor, nested structure where the newest open thing closes first"
idea: |
  The rule "the **most recent** unfinished thing is the one that reacts next" is a stack. Walk the
  input once: push openers, and on a closer **pop and match**. For cancel-in-pairs problems, push
  each item and **pop while the top cancels** the incoming one; what is left on the stack is the
  final state. For lengths, push **indices** and keep a **sentinel** (the last unmatched position) at
  the bottom so `i - st.back()` is the length of the balanced block ending at `i`.
complexity: "O(n) time, O(n) memory"
pitfalls:
  - "Popping an empty stack on an unmatched ')': check `empty()` first, or keep a sentinel and re-push the current index."
  - "Balanced means depth never goes negative AND ends at 0. Checking only the final count accepts `)(`."
  - "Nested decode (`k[...]`): push the current string and the repeat count together, multi-digit counts included."
  - "Expression evaluation: unary minus and operator precedence. Apply pending `*`/`/` before pushing, sum the stack at the end."
  - "Longest valid parentheses: after a pop, the length is `i - st.back()`, not the matched pair `i - popped + 1`, or `()()` gives 2."
related: [monotonic-stack, prefix-sum-1d, interval-dp]
---
### Which stack for which problem

| problem | stack holds | on a new item |
|---|---|---|
| is it balanced / min fixes | open count (or opener chars for `([{`) | `)` with empty stack: count one fix |
| longest valid substring | indices, sentinel `-1` at bottom | pop; empty: push `i` as new wall; else `len = i - top` |
| pairs cancel (asteroids, `AB`) | surviving items | pop while top and new cancel; push if new survives |
| decode `3[ab]` | (string so far, repeat count) | `[` push, `]` pop and append `cur * k` |
| expression `2+3*4` | signed terms | `+`/`-` push `±num`, `*`/`/` combine with top |

### Longest balanced substring (the key loop)
```cpp
vi st{-1};                       // last unmatched position
for(ll i=0;i<n;i++){
    if(s[i]=='('){st.push_back(i);continue;}
    st.pop_back();
    if(st.empty()){st.push_back(i);continue;}   // unmatched ')' becomes the wall
    best=max(best,i-st.back());
}
```

### Balance without a stack
For a single bracket type the stack is just a counter: `bal += (c=='(') ? 1 : -1`. The minimum
prefix balance tells you how many `(` must be added in front, and the final balance how many `)` at
the end. Use a real stack only when the type of bracket or the position matters.
