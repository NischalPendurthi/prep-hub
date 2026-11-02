---
id: divisors
title: Divisors
signals:
  - "enumerate all divisors of x (x up to 1e12): k-th divisor, divisors with a property"
  - "max gcd over pairs, count pairs with gcd = g, for values up to 1e6"
  - "for every value, look at all its multiples (harmonic sum)"
  - "sum over i of floor(n / i) or of σ(i) for n up to 1e12"
idea: |
  Divisors come in **pairs (i, x/i)** with `i ≤ √x`, so one number takes O(√x).
  For all numbers up to N at once, **flip the loop**: for each `d`, walk its multiples
  `d, 2d, ...`; the total is N/1 + N/2 + ... = **O(N log N)**. That also answers
  "how many array values are multiples of d", which gives max gcd, gcd counts and lcm tricks.
  `floor(n/i)` takes only **O(√n) distinct values**, so sums over it go block by block.
complexity: "O(√x) per number; O(N log N) for all multiples; O(√n) for floor-division blocks"
pitfalls:
  - "Perfect squares: add √x once, not twice."
  - "`i*i <= x` with int i overflows for x near 1e12; use ll."
  - "A divisor list for every number up to 1e6 is ~1.4e7 entries; prefer counting over storing."
  - "Floor blocks: the block for i ends at `n/(n/i)`; reduce products mod p before multiplying."
related: [sieve-spf, gcd-ext-euclid, inclusion-exclusion, contribution-technique]
---
### Harmonic loop (template: max gcd of a pair)
```cpp
for(ll d=MX;d>=1;d--){
    ll c=0;
    for(ll m=d;m<=MX && c<2;m+=d)c+=cnt[m];   // values that d divides
    if(c>=2){ cout<<d; return; }
}
```

### Sub-cases

| task | technique |
|---|---|
| all divisors of one x ≤ 1e12 | pairs up to √x |
| number of divisors of many x ≤ 1e6 | SPF, `Π(e+1)` |
| count pairs with gcd exactly g | `c[g] = C(mult(g), 2) − Σ c[kg]` for k ≥ 2, from large g down |
| `Σ_{i≤n} floor(n/i)` (= Σ d(i)) | blocks `[i, n/(n/i)]` |
| `Σ_{i≤n} σ(i)` | each d contributes `d · floor(n/d)`; sum d over each block |

### Floor-division blocks
```cpp
for(ll i=1;i<=n;){
    ll q=n/i, j=n/q;       // every i' in [i, j] has n/i' == q
    // add q * (sum of f over [i, j])
    i=j+1;
}
```
