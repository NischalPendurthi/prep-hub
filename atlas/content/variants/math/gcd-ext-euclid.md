---
id: gcd-ext-euclid
title: GCD & Extended Euclid
signals:
  - "find integers x, y with ax + by = c, or say it's impossible"
  - "gcd of a whole array after adding a constant / of differences a_i − a_1"
  - "two periodic events, when do they coincide (CRT, a·x ≡ b mod m)"
  - "modular inverse when the modulus is NOT prime"
  - "reachable values with steps of a and b are exactly the multiples of gcd(a, b)"
idea: |
  `gcd(a, b) = gcd(b, a % b)`. **Extended Euclid** carries coefficients back up the recursion:
  from `b·x1 + (a%b)·y1 = g` get `x = y1, y = x1 − (a/b)·y1`. Then `ax + by = c` has a solution
  **iff g | c**; scale by `c/g`, and all solutions are `x + k·b/g, y − k·a/g`. A gcd of a set is
  unchanged by subtracting one element from the others: **gcd(a, b) = gcd(a, b − a)**, so
  `gcd(a_i + x) = gcd(a_1 + x, gcd of differences)`.
complexity: "O(log min(a, b))"
pitfalls:
  - "Negative coefficients: run on |a|, |b| and flip the sign of x or y afterwards."
  - "Scaling x by c/g can overflow; reduce x mod b/g first, or use __int128."
  - "`__gcd` / `gcd` of negatives or with 0: gcd(0, b) = b, so gcd(0, 0) = 0 needs a guard before dividing."
  - "lcm(a, b) = a / gcd · b, divide first or it overflows."
  - "The smallest non-negative x is `((x % m) + m) % m` with m = b/g, not b."
related: [binpow-modinv, divisors, sieve-spf]
---
### Extended Euclid
```cpp
ll extgcd(ll a,ll b,ll &x,ll &y){
    if(b==0){ x=1; y=0; return a; }
    ll x1,y1, g=extgcd(b,a%b,x1,y1);
    x=y1; y=x1-(a/b)*y1;
    return g;
}
```

### Uses

| problem | move |
|---|---|
| `ax + by = c` | solvable iff `g | c`; `x0 = x·c/g` |
| smallest x ≥ 0 | `m = b/g`, `x = ((x0 % m) + m) % m` |
| `a·x ≡ b (mod m)` | same equation `a·x − m·y = b` |
| inverse mod non-prime m | `extgcd(a, m)`, needs g = 1 |
| CRT for two congruences | solve `r1 + m1·k ≡ r2 (mod m2)` for k |
| gcd of `a_i + x` for many x | precompute `G = gcd(a_i − a_1)`, answer `gcd(a_1 + x, G)` |
