---
id: bit-tricks
title: Bit Tricks & XOR Properties
signals:
  - "count set bits over 1..n, or over all pairs, n up to 1e15"
  - "XOR of a range / subarray, x ^ x = 0 cancels pairs"
  - "a & b vs a ^ b comparisons: depends only on the highest set bit"
  - "power of two checks, lowest set bit, highest set bit"
  - "find a, b with a xor b = u and a + b = v"
idea: |
  Think **one bit at a time**: bits are independent in `&`, `|`, `^`, so count each bit's
  contribution separately and multiply by `2^b`. Key identities: **`x & -x`** is the lowest
  set bit, **`x & (x-1)`** clears it, `__lg(x)` is the highest bit. XOR **cancels pairs**
  (`a^a=0`) and is its own inverse, so prefix xor works like prefix sums. `a+b = (a^b) + 2(a&b)`.
  Bit `b` of `0..n` repeats with **period `2^(b+1)`**.
complexity: "O(log V) per number, O(n log V) to count each bit over an array"
pitfalls:
  - "`1<<40` is int overflow. Write `1LL<<b`, and `__builtin_popcountll` / `__lg` for 64-bit."
  - "Operator precedence: `x & 1 == 0` means `x & (1==0)`. Parenthesise every bit expression."
  - "`__builtin_clz(0)` / `__lg(0)` are undefined. Check zero first."
  - "Right-shifting negative numbers / `~x` on signed types: mask to the bits you mean (`(~b)&want`)."
  - "Counting over 0..n: there are n+1 numbers, period counts use (n+1)."
related: [prefix-xor, bitwise-greedy, submask-enumeration, binary-trie-xor]
---
### Cheat sheet

| expression | meaning |
|---|---|
| `x & -x` | lowest set bit (Fenwick step) |
| `x & (x-1)` | clear lowest set bit; `== 0` ⇔ power of two (x > 0) |
| `__lg(x)`, `63-__builtin_clzll(x)` | index of the highest set bit |
| `__builtin_ctzll(x)` | index of the lowest set bit |
| `__builtin_popcountll(x)` | number of set bits |
| `a + b == (a ^ b) + 2*(a & b)` | xor is addition without carries |
| `a ^ b < a & b` ⇔ same highest bit | pairs counted by highest bit (CF 1420B) |
| `0^1^...^n` | `n, 1, n+1, 0` for `n%4 = 0,1,2,3` |

### Counting one bit over 0..n
```cpp
ll period=1LL<<(b+1), half=1LL<<b;
ones = (n+1)/period*half + max(0LL,(n+1)%period-half);
```

### Contribution per bit
Σ over pairs of `a_i ^ a_j` = Σ_b `2^b · cnt1_b · cnt0_b`. Same idea for `&` (`C(cnt1,2)`)
and `|` (all pairs minus `C(cnt0,2)`).
