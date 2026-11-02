---
id: binpow-modinv
title: Binary Power & Modular Inverse
signals:
  - "print the answer modulo 1e9+7 / 998244353 and the formula has a DIVISION in it"
  - "a^b with b up to 1e18, or a tower a^(b^c)"
  - "expected value / probability as P·Q^-1 mod p"
  - "average, fraction or 1/k that must be taken mod a prime"
idea: |
  **Binary power**: walk the bits of `e`, square the base each step and multiply it into
  the result when the bit is set, O(log e). For a prime `p`, **Fermat** gives
  `x^-1 = x^(p-2) mod p` for `x % p != 0`, so dividing becomes multiplying by `modpow(x, p-2)`.
  Exponents live **mod p-1**, not mod p (`a^(p-1) = 1`), which is how towers like
  `a^(b^c)` reduce. For a non-prime modulus, invert with extended Euclid (needs gcd(x, m) = 1).
complexity: "O(log e) per power / inverse"
pitfalls:
  - "Reducing the exponent mod p instead of mod p-1 (Fermat's little theorem)."
  - "`x*x` overflows when the modulus is above ~3e9; use __int128 or a mod near 1e9."
  - "Forgetting `x %= m` first: a negative or huge base breaks the products."
  - "Inverting 0 (or a multiple of p): Fermat silently returns 0."
  - "Subtraction mod p goes negative: write `(a - b + mod) % mod`."
related: [ncr-factorials, gcd-ext-euclid, matrix-exponentiation, expected-value-dp]
---
### The loop
```cpp
ll modpow(ll x,ll e,ll m){
    ll res=1; x%=m;
    while(e>0){
        if(e&1)res=res*x%m;
        x=x*x%m;
        e>>=1;
    }
    return res;
}
ll inv(ll x){ return modpow(x,mod-2,mod); }   // mod must be prime
```

### Which inverse to use

| situation | inverse |
|---|---|
| prime modulus, a few inverses | `modpow(x, p-2)` |
| inverses of 1..n all at once | `inv[i] = -(p/i) * inv[p % i] % p` (then `+p`) |
| inverse factorials | one Fermat for `n!`, then walk down (see ncr-factorials) |
| non-prime modulus | extended Euclid, exists only if `gcd(x, m) = 1` |

### Fractions mod p
Keep `p/q` as `p * inv(q)`. Sums of fractions: add numerators over a common denominator, or
just convert each term immediately. The answer `P·Q^-1` is what problems mean by
"print the probability modulo 998244353".
