---
id: digit-dp-aggregate
title: "Digit DP: Sum over All Numbers"
signals:
  - "SUM of something over every x in [L, R], not a count of good x"
  - "how many times is digit d written from L to R (number of digit one)"
  - "sum of digit sums of all numbers in a range, mod 1e9+7"
idea: |
  Same walk as the counting digit DP, but `go` returns a **pair**:
  `{numbers that complete this prefix, total of the quantity over them}`.
  A digit `d` placed at `pos` contributes its value once **per completion**, so
  `tot += t + contribution(d) * c`. The count `c` is exactly the plain counting DP.
complexity: "O(digits × |STATE| × 10) per query"
pitfalls:
  - "Leading zeros are not written: for digit 0 you need `started`, and only count `d==D` once started."
  - "Under mod, subtract as ((f(r) - f(l-1)) % MOD + MOD) % MOD."
  - "Memoise the pair with a separate vis[] array; {-1,-1} sentinels get confused with real values under mod."
  - "Memo depends on D: reset vis whenever D changes."
related: [digit-dp, contribution-technique]
---
### Why `d * c`
Every number counted below this position carries digit `d` at this position, so `d`
is added `c` times. The same goes for "occurrences of D": add `c` if `d == D`.

### Sum of digit sums in [L, R] (mod 1e9+7)
```cpp
pi go(ll pos,ll tight){
    if(pos==s.size())return {1,0};
    ll rem=s.size()-pos;
    if(!tight && vis[rem])return memo[rem];
    ll lim=tight?s[pos]-'0':9, cnt=0, sum=0;
    for(ll d=0;d<=lim;d++){
        auto [c,sm]=go(pos+1,tight&&d==lim);
        cnt=(cnt+c)%MOD;
        sum=(sum+sm+d*c)%MOD;
    }
    if(!tight)vis[rem]=1,memo[rem]={cnt,sum};
    return {cnt,sum};
}
```
No `started` here: leading zeros add 0 to a digit sum.

### Harder: sum of the numbers themselves
When the quantity is the number's value (sum of all good x), digit `d` at `pos`
adds `d * 10^(rem-1) * c`. Combine with a counting STATE (e.g. at most k distinct
digits) for CF 1073E.
