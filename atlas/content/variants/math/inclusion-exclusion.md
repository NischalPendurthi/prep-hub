---
id: inclusion-exclusion
title: Inclusion–Exclusion
signals:
  - "count numbers in [1, n] divisible by AT LEAST ONE of k numbers (k ≤ 20)"
  - "count coprime pairs / subsequences with gcd exactly 1"
  - "count with upper bounds: x1 + ... + xk = n with xi ≤ ci"
  - "count derangements / arrangements where no forbidden thing happens"
  - "\"exactly\" is hard but \"at least these\" is easy"
idea: |
  `|A1 ∪ ... ∪ Ak| = Σ over non-empty subsets S of (−1)^(|S|+1) · |∩ S|`. Pick the sets so the
  **intersection is easy to count** (divisible by the lcm, the chosen boxes overflow, the chosen
  positions are fixed). With k ≤ 20 loop over **bitmasks**. For gcd problems over values the
  subsets become divisors and the signs become the **Möbius function**: `exact[d] = f(d) −
  Σ exact[kd]`, computed from large d down.
complexity: "O(2^k · k) over subsets; O(N log N) for the divisor (Möbius) form"
pitfalls:
  - "Product of the chosen numbers overflows ll: check `prod > n / a[i]` before multiplying and skip the subset."
  - "Use the lcm, not the product, when the numbers aren't pairwise coprime."
  - "Sign by parity of the subset size; the empty subset is the total, only if you count the complement."
  - "Mod arithmetic: subtracting goes negative, add mod back."
related: [ncr-factorials, divisors, sieve-spf, bitmask-dp]
---
### Subset loop
```cpp
for(ll mask=1;mask<(1LL<<k);mask++){
    ll prod=1; bool over=false;
    for(ll i=0;i<k;i++)if(mask>>i&1){
        if(prod>n/a[i]){over=true;break;}
        prod*=a[i];
    }
    if(over)continue;
    if(__builtin_popcountll(mask)&1)ans+=n/prod; else ans-=n/prod;
}
```

### Common shapes

| count | sets A_i | intersection |
|---|---|---|
| divisible by some a_i | multiples of a_i | `n / lcm(S)` |
| `x1+..+xk = n`, `0 ≤ xi ≤ ci` | xi > ci | stars and bars on `n − Σ(ci+1)` |
| derangements | i is a fixed point | `(n − |S|)!`, depends only on |S| |
| coprime to m | multiples of each prime of m | `n / Π p`, ≤ 2^(#primes) terms |
| pairs/subsets with gcd 1 | from large d down | `exact[d] = f(cnt multiples of d) − Σ exact[kd]` |

When the intersection depends only on `|S|`, replace the mask loop by `Σ (−1)^j C(k, j) · g(j)`.
