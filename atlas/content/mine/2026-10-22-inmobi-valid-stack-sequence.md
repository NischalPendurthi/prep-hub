---
title: Min Removals to Make a Valid Stack Sequence
url: ''
platform: OA
rating: 2000
date: '2026-10-22'
variants:
- interval-dp
tags:
- InMobi OA
- IIT Guwahati
insight: 'Each value is an interval [first, second], and a sequence is valid iff the kept intervals never cross. dp[i][j]: delete a[i] (cost 1 per element) or pair a[i] with its partner k ≤ j → dp[i+1][k-1] + dp[k+1][j]. Elements removed / 2 = values removed.'
mistakes: The second occurrence got paired with itself (needed next <= i, not < i). Forgot that the dp counts elements, not values (divide by 2). Input gives N, so the length is 2N.
star: true
status: solved
---

```cpp
void Solve(){
    ll n;
    cin >> n;
    n=2*n;
    vi a(n+1,0);
    map<ll,ll> next;
    for(int i=1;i<=n;i++){
        cin>>a[i];
        if(next[a[i]]==0)next[a[i]]=1;
        else next[a[i]]=i;
    }

    vvi dp(n+1,vi(n+1,INF));
    for(int len=1;len<=n;len++){
        for(int i=1;i<=n;i++){
            int j=len+i-1;
            if(j>n)continue;
            if(len==1)dp[i][j]=1;
            else{
                // eliminate a[i]
                dp[i][j]=min(dp[i][j],1+dp[i+1][j]);
                // pair a[i] with other a[i]
                if(next[a[i]]<=i)continue;
                int k=next[a[i]];
                if(k>j)continue;
                // i i+1 k-1 k k+1 j
                ll mid=0,right=0;
                if(i+1<=k-1)mid=dp[i+1][k-1];
                if(k+1<=j)right=dp[k+1][j];
                dp[i][j]=min(dp[i][j],mid+right);
            }
        }
    }
    cout<<dp[1][n]/2<<endl;

}
```
