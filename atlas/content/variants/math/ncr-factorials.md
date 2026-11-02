---
id: ncr-factorials
title: nCr with Factorials
signals:
  - "count ways to choose / arrange, answer mod 1e9+7, n up to 1e6"
  - "many queries of C(n, k)"
  - "paths in a grid moving right/down (C(r+c, r)), stars and bars"
  - "distribute identical items into boxes, multiset permutations n!/(a!b!...)"
idea: |
  Precompute `fact[i]` up to the max n, then **one** Fermat inverse for `fact[N]` and
  walk down: `invfact[i-1] = invfact[i] * i`. Then `C(n,k) = fact[n]·invfact[k]·invfact[n-k]`
  in O(1). Most counting reduces to a few binomials: **stars and bars** `C(n+k-1, k-1)`,
  **grid paths** `C(r+c, r)`, **multinomial** `n! / Π cnt!`, and **Catalan** `C(2n,n)/(n+1)`.
complexity: "O(N) precompute, O(1) per query"
pitfalls:
  - "Return 0 (not 1) when k < 0 or k > n; those terms show up in inclusion-exclusion sums."
  - "Precompute to the largest argument you call, e.g. 2n for Catalan or n+k for stars and bars."
  - "Rebuilding the factorial table per test case: build once in main for the max N."
  - "n ≥ p (like 1e18 choose k): factorials are 0 mod p, use Lucas or the product formula."
related: [binpow-modinv, inclusion-exclusion, expected-value-dp]
---
### Precompute
```cpp
fact[0]=1;
for(ll i=1;i<=N;i++)fact[i]=fact[i-1]*i%mod;
invfact[N]=modpow(fact[N],mod-2);
for(ll i=N;i>0;i--)invfact[i-1]=invfact[i]*i%mod;
ll nck(ll n,ll k){ if(k<0||k>n)return 0; return fact[n]*invfact[k]%mod*invfact[n-k]%mod; }
```

### Formula cheat sheet

| count | formula |
|---|---|
| k-subsets of n | `C(n, k)` |
| n identical balls into k boxes (≥ 0 each) | `C(n+k-1, k-1)` |
| same, each box ≥ 1 | `C(n-1, k-1)` |
| lattice paths (0,0) → (r,c), right/down | `C(r+c, r)` |
| arrangements of a multiset | `n! / (c1! c2! ...)` |
| balanced bracket strings of length 2n | `C(2n, n) / (n+1)` |
| paths avoiding a blocked cell | total − paths through it (sort cells, DP over blocked ones) |

### Small k, huge n
If `n` is up to 1e18 but `k` ≤ 1e6, use `C(n,k) = Π (n-i) / k!` for `i < k`, with each `n-i`
reduced mod p first.
