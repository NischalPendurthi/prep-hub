---
id: convex-hull-trick
title: Convex Hull Trick (Monotonic Deque)
signals:
  - "dp[i] = min/max over j < i of dp[j] + f(j)*g(i) + (terms of only i or only j)"
  - "a product term mixing a j-value and an i-value, n up to 1e5..1e6 so O(n^2) is too slow"
  - "the j-values (slopes) come in sorted order, often after sorting the input"
  - "the i-values (queries) are also sorted, or you can afford a binary search"
  - "partition into k groups where a group's cost is (something at its end) * (size or sum)"
idea: |
  Write each candidate j as a **line** `y = m_j*x + c_j` (m_j = the factor of j, c_j = dp[j] plus
  j-only terms) and each state i as a **query** at `x = g(i)`. Then dp[i] is the lower (or
  upper) envelope of the lines at x. With slopes added in sorted order the envelope is a
  deque: pop the back while the middle line is never on top (`bad`), and push. With sorted
  queries the best line only moves forward, so pop the front while the next line is at least
  as good. Every line is pushed and popped once, so the whole DP is O(n).
complexity: "O(n) with sorted slopes and queries, O(n log n) with sorted slopes but binary-searched queries"
pitfalls:
  - "`bad()` cross-multiplies an intercept difference (~1e18) by a slope difference (~1e9). Use `__int128`, or long double when the DP is in reals."
  - "Equal slopes break `bad()` (it divides by m1-m2 in disguise). Keep only the better of two parallel lines before calling it."
  - "Min vs max flips the comparison in `bad()` (`<=` vs `>=`) and in the front-pop. Write the inequality down from the intersection points instead of guessing."
  - "Queries not monotonic? Don't pop the front. Binary search the deque (values along the hull are unimodal at a fixed x), or switch to a Li Chao tree."
  - "Add the j line only when it becomes legal for i (for j < i: after computing dp[i-1]). In k-layer DPs skip lines whose dp is infinity."
  - "Base case is a line too: 'nothing chosen before' (j = 0) or a dummy line (0, 0) for max(0, ...)."
related: [li-chao-tree, dp-monotonic-queue, partition-dp, geometry-basics]
---
### Spotting it
Expand the cost until it splits into three kinds of terms:

```
dp[i] = min over j of ( A(j) * B(i)  +  C(j)  +  D(i) )
                        slope   x       intercept  added after the query
```

`A(j)` is the slope, `C(j)` (which includes `dp[j]`) is the intercept, `B(i)` is where you query.
If a square like `(h[i]-h[j])^2` appears, expand it: `h[i]^2` goes to D, `h[j]^2` goes to C,
and the cross term `-2h[j]*h[i]` is the line.

### Which version
| slopes added | queries | use |
|---|---|---|
| sorted | sorted | deque, pop front (this template) |
| sorted | any order | deque, binary search for the query |
| any order | any order | [Li Chao tree](#/v/li-chao-tree), or a set-based dynamic hull |
| fixed set, range of j | any | segment tree with one hull per node (455E below) |

### The `bad()` test
For a min hull with slopes `m1 > m2 > m3`, line 2 is useless when lines 1 and 3 cross at or before
lines 1 and 2 cross:

```
x13 <= x12   <=>   (c3-c1)*(m1-m2) <= (c2-c1)*(m1-m3)
```

For a max hull with decreasing slopes it is the same expression with `>=`.

## Solutions

Each one is my solution in your template style: only `Solve()` and helpers, so drop it into the skeleton.
All of them are **stress-tested against a brute force** on random small inputs and timed on
max-size inputs. None has been submitted to the judge from here. The CF statements came from
memory because Codeforces blocks automated fetches, so read the statement before trusting an edge case.

<details><summary><b>Frog 3</b> (AtCoder DP Z), the warm-up</summary>

`dp[j] = min over i<j of dp[i] + (h[j]-h[i])^2 + C`. Expand the square: the line for i is slope
`-2h[i]`, intercept `dp[i]+h[i]^2`, queried at `h[j]`, then add `h[j]^2 + C`. Heights increase,
so the slopes decrease and the queries increase, which is the textbook case. Matches all three official samples.

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
bool bad(Line a,Line b,Line c){
    return (__int128)(c.c-a.c)*(a.m-b.m) <= (__int128)(b.c-a.c)*(a.m-c.m);
}
void Solve(){
    ll n,C;
    cin >> n >> C;
    vi h(n);
    for(ll i=0;i<n;i++)cin>>h[i];

    vi dp(n,0);
    deque<Line> dq;
    dq.push_back({-2*h[0],h[0]*h[0]});
    for(ll j=1;j<n;j++){
        while(dq.size()>=2 && dq[1].eval(h[j])<=dq[0].eval(h[j]))dq.pop_front();
        dp[j]=dq[0].eval(h[j])+h[j]*h[j]+C;
        Line cur={-2*h[j],dp[j]+h[j]*h[j]};
        while(dq.size()>=2 && bad(dq[dq.size()-2],dq.back(),cur))dq.pop_back();
        dq.push_back(cur);
    }
    cout<<dp[n-1]<<endl;
}
```

</details>

<details><summary><b>CSES 2084</b> Monster Game I</summary>

`dp[i] = min over j<i of dp[j] + s[i]*f[j]` with `f[0] = x`. `f` is non-increasing (slopes) and
`s` is non-decreasing (queries). `f` can repeat, so drop a parallel line before calling `bad()`.
Matches the official sample.

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
bool bad(Line a,Line b,Line c){
    return (__int128)(c.c-a.c)*(a.m-b.m) <= (__int128)(b.c-a.c)*(a.m-c.m);
}
void Solve(){
    ll n,x;
    cin >> n >> x;
    vi s(n),f(n);
    for(ll i=0;i<n;i++)cin>>s[i];
    for(ll i=0;i<n;i++)cin>>f[i];

    deque<Line> dq;
    dq.push_back({x,0});
    ll dp=0;
    for(ll i=0;i<n;i++){
        while(dq.size()>=2 && dq[1].eval(s[i])<=dq[0].eval(s[i]))dq.pop_front();
        dp=dq[0].eval(s[i]);
        Line cur={f[i],dp};
        // f can repeat: of two parallel lines only the lower one matters (bad() needs distinct slopes)
        if(dq.back().m==cur.m){
            if(dq.back().c<=cur.c)continue;
            dq.pop_back();
        }
        while(dq.size()>=2 && bad(dq[dq.size()-2],dq.back(),cur))dq.pop_back();
        dq.push_back(cur);
    }
    cout<<dp<<endl;   // dp of the last monster, which must be killed
}
```

</details>

<details><summary><b>319C</b> Kalila and Dimna in the Logging Industry: 2100</summary>

**It's a DP, not a greedy.** Once tree n is fully cut every recharge is free (`b[n] = 0`), so only
the chain of trees you finish *before* n costs anything. While tree j is the best finished tree,
every cut of tree i uses a charge bought at `b[j]`, so finishing i costs `a[i]*b[j]`:
`dp[i] = min over j<i of dp[j] + b[j]*a[i]`, with `dp[1] = 0` (height 1, starts charged).
`b` decreases and `a` increases. This is the template.

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
// b is useless if a and c cross no later than a and b do
bool bad(Line a,Line b,Line c){
    return (__int128)(c.c-a.c)*(a.m-b.m) <= (__int128)(b.c-a.c)*(a.m-c.m);
}
void Solve(){
    ll n;
    cin >> n;
    vi a(n),b(n);
    for(ll i=0;i<n;i++)cin>>a[i];
    for(ll i=0;i<n;i++)cin>>b[i];

    vi dp(n,0);
    deque<Line> dq;
    dq.push_back({b[0],0});   // tree 1 has height 1 and the saw starts charged
    for(ll i=1;i<n;i++){
        // queries only move right, so a line beaten at the front is beaten forever
        while(dq.size()>=2 && dq[1].eval(a[i])<=dq[0].eval(a[i]))dq.pop_front();
        dp[i]=dq[0].eval(a[i]);
        Line cur={b[i],dp[i]};
        while(dq.size()>=2 && bad(dq[dq.size()-2],dq.back(),cur))dq.pop_back();
        dq.push_back(cur);
    }
    cout<<dp[n-1]<<endl;
}
```

</details>

<details><summary><b>1083E</b> The Fair Nut and Rectangles: 2400</summary>

No nesting means that after sorting by x, the y values decrease. Taking i right after j adds the
strip `(x[i]-x[j])*y[i]`, so `dp[i] = x[i]*y[i] - a[i] + max(0, max over j of dp[j] - x[j]*y[i])`.
Lines have slope `-x[j]` (decreasing) and the queries `y[i]` decrease. Use a max hull, popping from the front.
A dummy line `(0, 0)` gives the `max(0, ...)`. n = 1e6, so use fast IO (already in the skeleton).

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
// for a max hull with decreasing slopes, b is useless if a and c cross no earlier than a and b
bool bad(Line a,Line b,Line c){
    return (__int128)(c.c-a.c)*(a.m-b.m) >= (__int128)(b.c-a.c)*(a.m-c.m);
}
void Solve(){
    ll n;
    cin >> n;
    vector<array<ll,3>> r(n);
    for(ll i=0;i<n;i++)cin>>r[i][0]>>r[i][1]>>r[i][2];
    sort(all(r));

    deque<Line> dq;
    dq.push_back({0,0});   // "nothing taken before": the max(0, ...)
    ll ans=0;
    for(ll i=0;i<n;i++){
        ll x=r[i][0],y=r[i][1],a=r[i][2];
        while(dq.size()>=2 && dq[1].eval(y)>=dq[0].eval(y))dq.pop_front();
        ll dp=x*y-a+dq[0].eval(y);
        ans=max(ans,dp);
        Line cur={-x,dp};
        while(dq.size()>=2 && bad(dq[dq.size()-2],dq.back(),cur))dq.pop_back();
        dq.push_back(cur);
    }
    cout<<ans<<endl;
}
```

</details>

<details><summary><b>311B</b> Cats Transport: 2400</summary>

Shift each cat to `a = t - D[h]`, the departure time at which it waits 0. A feeder leaving at T
makes it wait `T - a`. Sort the a values. Each feeder takes a contiguous block and leaves at the
block's max, so block `j+1..i` costs `a[i]*(i-j) - (S[i]-S[j])`. Run p layers, each with its own
deque. The line is slope `-j`, intercept `dp[j]+S[j]`, queried at `a[i]` (sorted). O(p*m).

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
bool bad(Line a,Line b,Line c){
    return (__int128)(c.c-a.c)*(a.m-b.m) <= (__int128)(b.c-a.c)*(a.m-c.m);
}
void Solve(){
    ll n,m,p;
    cin >> n >> m >> p;
    vi D(n+1,0);
    for(ll i=2;i<=n;i++){ ll d; cin>>d; D[i]=D[i-1]+d; }
    vi a(m+1,0);
    for(ll i=1;i<=m;i++){ ll h,t; cin>>h>>t; a[i]=t-D[h]; }
    sort(a.begin()+1,a.end());
    vi S(m+1,0);
    for(ll i=1;i<=m;i++)S[i]=S[i-1]+a[i];

    p=min(p,m);   // extra feeders never help
    const ll BIG=LLONG_MAX/4;
    vi prv(m+1,BIG),cur(m+1,BIG);
    prv[0]=0;
    ll ans=BIG;
    for(ll k=1;k<=p;k++){
        deque<Line> dq;
        cur[0]=BIG;
        for(ll i=1;i<=m;i++){
            ll j=i-1;   // line j becomes available for i
            if(prv[j]<BIG){
                Line ln={-j,prv[j]+S[j]};
                while(dq.size()>=2 && bad(dq[dq.size()-2],dq.back(),ln))dq.pop_back();
                dq.push_back(ln);
            }
            cur[i]=BIG;
            if(dq.empty())continue;
            while(dq.size()>=2 && dq[1].eval(a[i])<=dq[0].eval(a[i]))dq.pop_front();
            cur[i]=dq[0].eval(a[i])+a[i]*i-S[i];
        }
        ans=min(ans,cur[m]);
        swap(prv,cur);
    }
    cout<<ans<<endl;
}
```

</details>

<details><summary><b>643C</b> Levels and Regions: 2400</summary>

Level i in a region starting at l takes `(t[l]+...+t[i]) / t[i]` expected time (geometric
distribution). With prefix sums P (of t), R (of 1/t) and Q (of P[i]/t[i]):
`cost(j+1..r) = Q[r]-Q[j] - P[j]*(R[r]-R[j])`. Lines are slope `-P[j]` (decreasing) queried at
`R[r]` (increasing), over k layers. Everything is in `long double`, including `bad()`. Divide and conquer also passes.

```cpp
typedef long double ld;
struct Line{ ld m,c; ld eval(ld x){ return m*x+c; } };
bool bad(Line a,Line b,Line c){
    return (c.c-a.c)*(a.m-b.m) <= (b.c-a.c)*(a.m-c.m);
}
void Solve(){
    ll n,k;
    cin >> n >> k;
    vector<ld> t(n+1),P(n+1,0),R(n+1,0),Q(n+1,0);
    for(ll i=1;i<=n;i++){
        cin>>t[i];
        P[i]=P[i-1]+t[i];
        R[i]=R[i-1]+1/t[i];
        Q[i]=Q[i-1]+P[i]/t[i];
    }
    const ld BIG=1e30;
    vector<ld> prv(n+1,BIG),cur(n+1,BIG);
    prv[0]=0;
    for(ll layer=1;layer<=k;layer++){
        deque<Line> dq;
        cur[0]=BIG;
        for(ll r=1;r<=n;r++){
            ll j=r-1;
            if(prv[j]<BIG){
                Line ln={-P[j],prv[j]-Q[j]+P[j]*R[j]};
                while(dq.size()>=2 && bad(dq[dq.size()-2],dq.back(),ln))dq.pop_back();
                dq.push_back(ln);
            }
            cur[r]=BIG;
            if(dq.empty())continue;
            while(dq.size()>=2 && dq[1].eval(R[r])<=dq[0].eval(R[r]))dq.pop_front();
            cur[r]=dq[0].eval(R[r])+Q[r];
        }
        swap(prv,cur);
    }
    cout<<fixed<<setprecision(10)<<(double)prv[n]<<endl;
}
```

</details>

<details><summary><b>1715E</b> Long Way Home: 2400</summary>

k ≤ 20 flight rounds. Each round does one flight layer, then a full Dijkstra over the roads from every city at once.
The flight layer is `new[v] = min over u of d[u] + (u-v)^2 = v^2 + min over u of (-2u)*v + (u^2+d[u])`.
Cities in index order give decreasing slopes and increasing queries, so it is O(n) per round.
Skip cities with `d = inf`. O(k*(n+m) log n).

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
bool bad(Line a,Line b,Line c){
    return (__int128)(c.c-a.c)*(a.m-b.m) <= (__int128)(b.c-a.c)*(a.m-c.m);
}
void Solve(){
    ll n,m,k;
    cin >> n >> m >> k;
    vector<vpi> g(n+1);
    for(ll i=0;i<m;i++){
        ll u,v,w;
        cin>>u>>v>>w;
        g[u].push_back({v,w});
        g[v].push_back({u,w});
    }
    const ll BIG=LLONG_MAX/4;
    vi d(n+1,BIG);
    d[1]=0;

    // multi-source Dijkstra from whatever d currently holds
    auto dijkstra=[&](){
        priority_queue<pi,vpi,greater<pi>> pq;
        for(ll v=1;v<=n;v++)if(d[v]<BIG)pq.push({d[v],v});
        while(!pq.empty()){
            auto [dv,v]=pq.top(); pq.pop();
            if(dv>d[v])continue;
            for(auto [to,w]:g[v])if(dv+w<d[to]){
                d[to]=dv+w;
                pq.push({d[to],to});
            }
        }
    };

    dijkstra();
    for(ll round=0;round<k;round++){
        deque<Line> dq;
        for(ll u=1;u<=n;u++)if(d[u]<BIG){
            Line ln={-2*u,u*u+d[u]};
            while(dq.size()>=2 && bad(dq[dq.size()-2],dq.back(),ln))dq.pop_back();
            dq.push_back(ln);
        }
        vi nd=d;
        for(ll v=1;v<=n;v++){
            while(dq.size()>=2 && dq[1].eval(v)<=dq[0].eval(v))dq.pop_front();
            nd[v]=min(nd[v],dq[0].eval(v)+v*v);
        }
        d=nd;
        dijkstra();
    }
    for(ll v=1;v<=n;v++)cout<<d[v]<<" \n"[v==n];
}
```

</details>

### Hull variants
These keep a convex hull directly instead of running a DP over lines.

<details><summary><b>1137E</b> Train Car Selection: 2700</summary>

Adding `b + s*(i-1)` hurts later cars more, so a car that is beaten by an earlier car never
recovers. Cars added at the **head** reset everything: car 1 with value 0 wins from then on.
Keep the candidate cars as points `(x, y)` under a lazy `B, S` (value = `y + B + S*x`). Only the
lower convex hull can ever hold the minimum, and the values decrease along it, so the answer is
the last point. Pop it while it is no better than the one before. The stored y reaches about 1e29, so use `__int128`.

```cpp
typedef __int128 L;
void Solve(){
    ll n,m;
    cin >> n >> m;
    vector<pair<L,L>> hull;   // (x, stored y)
    L B=0,S=0,len=n;
    hull.push_back({0,0});
    auto val=[&](pair<L,L> p){ return p.second+B+S*p.first; };
    // b is not strictly below the segment a-c
    auto bad=[&](pair<L,L> a,pair<L,L> b,pair<L,L> c){
        return (b.second-a.second)*(c.first-a.first) >= (c.second-a.second)*(b.first-a.first);
    };
    for(ll q=0;q<m;q++){
        ll type;
        cin>>type;
        if(type==1){
            ll k; cin>>k;
            len+=k;
            hull.clear();
            hull.push_back({0,0});
            B=S=0;
        }else if(type==2){
            ll k; cin>>k;
            pair<L,L> p={len,-(B+S*len)};   // new car with value 0
            len+=k;
            // a car already at value 0 is earlier and ties -> the new one never wins
            if(val(hull.back())>0){
                while(hull.size()>=2 && bad(hull[hull.size()-2],hull.back(),p))hull.pop_back();
                hull.push_back(p);
            }
        }else{
            ll b,s; cin>>b>>s;
            B+=b; S+=s;
        }
        // the last point must be strictly better than the one before it
        while(hull.size()>=2 && val(hull.back())>=val(hull[hull.size()-2]))hull.pop_back();
        cout<<(ll)(hull.back().first+1)<<" "<<(ll)val(hull.back())<<"\n";
    }
}
```

</details>

<details><summary><b>455E</b> Function: 2900</summary>

`f(x,y)` is a path of x cells ending at column y, moving right by at most 1 per row. It covers
columns `l..y` once and repeats one of them, and repeating the leftmost one is optimal. So
`f(x,y) = pre[y] + min over l in [y-x+1, y] of a[l]*(x-y) + (a[l]*(l-1) - pre[l-1])`.
That's a min over a **range** of lines, so build a segment tree whose nodes store a lower hull,
and binary search each node's hull at `x-y`. O((n + m) log^2 n).

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
bool bad(Line a,Line b,Line c){   // slopes a.m > b.m > c.m, min hull
    return (__int128)(c.c-a.c)*(a.m-b.m) <= (__int128)(b.c-a.c)*(a.m-c.m);
}
vector<vector<Line>> tr;
void build(ll node,ll l,ll r,vector<Line>& ls){
    vector<Line> v(ls.begin()+l,ls.begin()+r+1);
    // slopes descending; for equal slopes keep the smaller intercept
    sort(all(v),[](const Line& p,const Line& q){ return p.m!=q.m?p.m>q.m:p.c<q.c; });
    auto &h=tr[node];
    for(auto &ln:v){
        if(!h.empty() && h.back().m==ln.m)continue;
        while(h.size()>=2 && bad(h[h.size()-2],h.back(),ln))h.pop_back();
        h.push_back(ln);
    }
    if(l==r)return;
    ll mid=(l+r)/2;
    build(2*node,l,mid,ls);
    build(2*node+1,mid+1,r,ls);
}
ll hullMin(vector<Line>& h,ll x){
    // values along the hull are unimodal at x: binary search where the next line stops helping
    ll lo=0,hi=h.size()-1;
    while(lo<hi){
        ll mid=(lo+hi)/2;
        if(h[mid+1].eval(x)<=h[mid].eval(x))lo=mid+1;
        else hi=mid;
    }
    return h[lo].eval(x);
}
ll query(ll node,ll l,ll r,ll ql,ll qr,ll x){
    if(qr<l || r<ql)return LLONG_MAX;
    if(ql<=l && r<=qr)return hullMin(tr[node],x);
    ll mid=(l+r)/2;
    return min(query(2*node,l,mid,ql,qr,x),query(2*node+1,mid+1,r,ql,qr,x));
}
void Solve(){
    ll n;
    cin >> n;
    vi a(n+1),pre(n+1,0);
    for(ll i=1;i<=n;i++){ cin>>a[i]; pre[i]=pre[i-1]+a[i]; }
    vector<Line> ls(n+1);
    for(ll l=1;l<=n;l++)ls[l]={a[l],a[l]*(l-1)-pre[l-1]};
    tr.assign(4*(n+1),{});
    build(1,1,n,ls);
    ll m;
    cin >> m;
    while(m--){
        ll x,y;
        cin>>x>>y;
        cout<<pre[y]+query(1,1,n,y-x+1,y,x-y)<<"\n";
    }
}
```

</details>
