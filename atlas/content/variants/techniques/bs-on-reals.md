---
id: bs-on-reals
title: Binary Search on Reals
signals:
  - "print a real answer with absolute or relative error 1e-6"
  - "minimum time / radius / speed so that a geometric condition holds"
  - "maximise an average or ratio (sum a / sum b ≥ mid ⇔ Σ(a - mid·b) ≥ 0)"
  - "everyone can meet / a circle can cover all points / intervals intersect after time T"
idea: |
  Same as on integers, but the check is on a **double** and you run a **fixed number of
  iterations** (60–100) instead of `while(hi-lo>eps)`. Each iteration halves the range, so
  100 steps take 1e9 down far below 1e-9. **Ratio/average** problems become a
  feasibility check by moving the ratio into the sum: `Σ(a_i - mid·b_i) ≥ 0`.
  Print with `fixed << setprecision(9)` (or more).
complexity: "O(iterations × cost of ok), iterations ≈ 100"
pitfalls:
  - "`while(hi-lo>1e-9)` can loop forever when the values are large (doubles cannot get that close at 1e9). Use a fixed count."
  - "Default cout prints 6 significant digits: 123456.789 becomes 123457. Always `fixed<<setprecision(9)`."
  - "Upper bound too small: for 'meet in time T' with x up to 1e9 and v ≥ 1, hi = 1e9 is just enough. Be generous."
  - "Too many iterations × an O(n) check can TLE when there are many test cases. 60 is often enough."
  - "Using float, or ints in the check (`x[i]-v[i]*T` with ll * double is fine, ll*ll then cast is not)."
related: [bs-on-answer, geometry-basics, interval-merge]
---
### The loop
```cpp
double lo=0,hi=1e9;
for(ll it=0;it<100;it++){
    double mid=(lo+hi)/2;
    if(ok(mid))hi=mid; else lo=mid;
}
cout<<fixed<<setprecision(9)<<hi;
```

### Common checks

| problem | ok(T) |
|---|---|
| friends at x_i, speed v_i, meet in time T | `max(x_i - v_i T) <= min(x_i + v_i T)` |
| max average of a subarray with length ≥ k | prefix sums of `a_i - T`, some window ≥ 0 |
| max Σa/Σb over a chosen subset of size k | top-k of `a_i - T·b_i` sums to ≥ 0 |
| circle touching y=0 covers all points, radius R | intersection of x-ranges for every point is non-empty |

### Ternary search
For a unimodal f (one peak or valley), shrink by comparing `f(m1)` and `f(m2)` at thirds,
again for a fixed ~100 iterations. "Meeting on the Line" is solvable both ways.
