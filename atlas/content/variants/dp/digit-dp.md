---
id: digit-dp
title: "Digit DP: Count with a State"
signals:
  - "count x in [L, R] whose DIGITS satisfy a property, with R up to 1e18"
  - "contains / avoids certain digits, no two adjacent digits equal, digits non-decreasing"
  - "digit sum = K, at most K non-zero digits, x % M == 0"
  - "the K-th smallest number with such a property"
idea: |
  Write `f(x)` = count of good numbers in `[0, x]`, answer `f(R) - f(L-1)`.
  Walk the digits of `x` left to right with `go(pos, tight, started, STATE)`:
  **tight** means the prefix equals x's prefix, so the next digit is capped at `s[pos]`;
  **started** means a non-zero digit is placed (needed only when leading zeros would change
  STATE). STATE is the smallest summary of the prefix the property needs: a mask, a sum,
  a remainder, the previous digit. Memoise **only non-tight** states, indexed by
  **digits left** (`rem`), so one memo serves every query.
complexity: "O(digits × |STATE| × 10) per query; memo shared across queries"
pitfalls:
  - "Memoise only when !tight. A tight state depends on x's digits."
  - "Index memo by digits LEFT, not pos, or f(R) and f(L-1) (different lengths) can't share it."
  - "Memo depends on K or M: memset again whenever they change."
  - "Leading zeros: decide if 0 is good and whether zeros before `started` should touch STATE."
  - "f(L-1) with L = 0: f(-1) must return 0."
related: [digit-dp-aggregate, digit-dp-fix-target, bitmask-dp]
---
### The skeleton
```cpp
ll go(ll pos,ll tight,ll started,ll st){
    if(pos==s.size())return good(started,st);
    ll rem=s.size()-pos;
    ll &m=memo[rem][started][st];
    if(!tight && m!=-1)return m;
    ll lim=tight?s[pos]-'0':9, res=0;
    for(ll d=0;d<=lim;d++){
        ll ns=started||d!=0;
        res+=go(pos+1,tight&&d==lim,ns,next(st,d));
    }
    if(!tight)m=res;
    return res;
}
```

### STATE recipes (swap `next` / `good` / the loop)

| property | STATE | transition | end check | started? |
|---|---|---|---|---|
| contains each of 2,3,5,7 | 4-bit mask | `mask |= bit(d)` | `started && mask==15` | yes |
| digit sum == K | sum | `sum+d`, prune `sum>K` | `sum==K` | no (zeros add 0) |
| x % M == 0 | value mod M | `(r*10+d)%M` | `r==0` | no |
| digit sum % M == 0 | sum mod M | `(r+d)%M` | `r==0` | no |
| no two adjacent equal (template) | prev digit | skip `started && d==prev` | `1` | yes |
| ≤ K non-zero digits | count | `cnt+(d!=0)`, prune `cnt>K` | `1` | no |
| non-decreasing digits | prev digit | loop `d` from `prev` | `1` | no (prev=0 start) |
| strictly increasing | prev digit | loop `d > prev` once started | `1` | yes |

### K-th smallest good number
`f` is monotone, so binary search the smallest `x` with `f(x) - f(0) ≥ K`:
```cpp
ll lo=1,hi=2e18,base=f(0);
while(lo<hi){
    ll mid=lo+(hi-lo)/2;
    if(f(mid)-base>=K)hi=mid;
    else lo=mid+1;
}
```
Each step is one digit DP, and the memo is shared, so this costs ~60 DPs. You can also walk
the digits greedily using the counts from the memo, which is a single pass.
