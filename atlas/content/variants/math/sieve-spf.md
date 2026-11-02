---
id: sieve-spf
title: Sieve & Smallest Prime Factor
signals:
  - "values up to 1e6 or 1e7 and you need primes, factorizations or divisor counts of MANY numbers"
  - "number of distinct prime factors / sum of exponents for every x"
  - "is x prime / a T-prime (square of a prime) for many queries"
  - "Euler phi, Möbius or another multiplicative function for every value up to N"
idea: |
  **Sieve of Eratosthenes**: for each prime `i`, cross out multiples from `i*i`. Store the
  **smallest prime factor** instead of a bool and any `x ≤ N` factorizes in **O(log x)** by
  repeatedly dividing by `spf[x]`. Multiplicative functions fall out of the factorization:
  divisor count `Π(e+1)`, divisor sum `Π(p^(e+1)-1)/(p-1)`, `phi = x·Π(1-1/p)`. For one large
  x (up to 1e12), trial-divide up to √x instead.
complexity: "O(N log log N) sieve, O(log x) per factorization"
pitfalls:
  - "`i*i` overflows int for i near 1e5 when the loop variable is int; use ll."
  - "Inner loop starting at 2*i is fine but slower; starting at i*i needs the outer loop to stop at √N."
  - "Sieving per test case: sieve once to the max value in main."
  - "Trial division: after the loop, a leftover x > 1 is itself a prime factor."
  - "A vector<int> of size 1e7 is 40 MB; ll doubles that. Check the memory limit."
related: [divisors, inclusion-exclusion, gcd-ext-euclid]
---
### SPF and factorization
```cpp
for(ll i=0;i<MAX_N;i++)spf[i]=i;
for(ll i=2;i*i<MAX_N;i++)if(spf[i]==i)
    for(ll j=i*i;j<MAX_N;j+=i)if(spf[j]==j)spf[j]=i;
while(x>1){ f[spf[x]]++; x/=spf[x]; }
```

### What to compute from it

| want for every x ≤ N | how |
|---|---|
| number of prime factors with multiplicity | `f[x] = f[x/spf[x]] + 1` |
| distinct primes | `+1` only when `spf[x/spf[x]] != spf[x]` |
| Euler phi | sieve `phi[j] -= phi[j]/i` for each prime i |
| divisor count / sum | from the exponents, `Π(e+1)` |
| primes list | push every `i` with `spf[i]==i` |

### Spotting it
If a problem needs the prime factors of each array element and values are ≤ 1e7, SPF is the
default. When values go up to 1e12 but there are few of them, use √x trial division with the
primes list up to 1e6.
