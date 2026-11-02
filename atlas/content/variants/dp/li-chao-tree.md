---
id: li-chao-tree
title: Li Chao Tree
signals:
  - "same dp[j] + f(j)*g(i) shape as CHT, but slopes or queries arrive in no useful order"
  - "lines are inserted online and queried at arbitrary x (insert a line / ask min at x)"
  - "line sets need merging (tree DP: small-to-large) or undoing (offline deletions)"
  - "queries are integers in a known range, or all known in advance so you can compress them"
idea: |
  A segment tree over the x range where each node stores **one line**: the one that wins at the
  node's midpoint. Inserting compares the new line with the stored one at the midpoint and keeps
  the winner. The loser can only still win on one side (the side where it was better at the end
  of the range), so it recurses into that child. A query walks from the root to the leaf of x and
  takes the best of the lines it passes. Both are O(log C), and there is no geometry, no `bad()`, and no sorting.
complexity: "O(log C) per insert and query (C = size of the x range, or n after compressing the queries)"
pitfalls:
  - "Pick the x range from the queries, not the lines. Compress them when they're large or sparse (660F, 631E, 678F) so an array of 4*X nodes fits."
  - "Use a dynamic node pool for per-vertex or mergeable trees: an insert creates at most one node."
  - "With negative ranges, `(l+r)/2` rounds toward zero. Use `l+(r-l)/2`."
  - "An empty node needs a sentinel: a `has` flag, or the line (0, ±BIG). Make sure eval(sentinel) can't overflow."
  - "Max vs min: flip both comparisons in insert and the min/max in query. Mixing them gives silently wrong answers."
  - "Rollback (offline deletions): log (node, old line) on every overwrite and undo in reverse."
related: [convex-hull-trick, small-to-large, segtree-basic]
---
### Why the loser only goes one way
Two lines cross at most once. If the new line loses at the midpoint but wins at the left end,
the crossing is in the left half, so it can only win there. If it loses at both, it is useless
on the left and might win on the right. So `lef != mi` means go left, otherwise go right.

### Deque or Li Chao?
Li Chao is the safe default: it doesn't care about order, and the same code handles every case.
The deque is faster (O(1)) and needs both orders sorted. In contests, reach for Li Chao the moment either order is unsorted.

## Solutions

The same disclaimer as the CHT page applies. Each one is stress-tested against a brute force on random inputs and timed
at max constraints, but not judge-submitted from here, and the CF statements are from memory.

<details><summary><b>CSES 2085</b> Monster Game II</summary>

Same DP as Monster Game I, but `s` and `f` are unsorted, so insert line `(f[i], dp[i])` and query
at `s[i]` in a Li Chao tree over `[1, 1e6]`. This is the template. Matches the official sample.

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
struct LiChao{
    ll lo,hi;
    vector<Line> t;   // t[node] = the line that wins at this node's midpoint
    LiChao(ll lo,ll hi):lo(lo),hi(hi),t(4*(hi-lo+1),{0,LLONG_MAX/4}){}
    void insert(Line ln,ll node,ll l,ll r){
        ll mid=(l+r)/2;
        bool lef=ln.eval(l)<t[node].eval(l), mi=ln.eval(mid)<t[node].eval(mid);
        if(mi)swap(t[node],ln);   // keep the midpoint winner here
        if(l==r)return;
        // the loser can only win on the side where it was still better at the end
        if(lef!=mi)insert(ln,2*node,l,mid);
        else insert(ln,2*node+1,mid+1,r);
    }
    ll query(ll x,ll node,ll l,ll r){
        ll res=t[node].eval(x);
        if(l==r)return res;
        ll mid=(l+r)/2;
        if(x<=mid)return min(res,query(x,2*node,l,mid));
        return min(res,query(x,2*node+1,mid+1,r));
    }
    void insert(Line ln){ insert(ln,1,lo,hi); }
    ll query(ll x){ return query(x,1,lo,hi); }
};
void Solve(){
    ll n,x;
    cin >> n >> x;
    vi s(n),f(n);
    for(ll i=0;i<n;i++)cin>>s[i];
    for(ll i=0;i<n;i++)cin>>f[i];

    LiChao lc(1,1000000);
    lc.insert({x,0});
    ll dp=0;
    for(ll i=0;i<n;i++){
        dp=lc.query(s[i]);
        lc.insert({f[i],dp});
    }
    cout<<dp<<endl;
}
```

</details>

<details><summary><b>660F</b> Bear and Bowling 4: 2500</summary>

With `P` = prefix of `a` and `W` = prefix of `i*a[i]`, subarray `j+1..r` scores
`W[r] - W[j] - j*(P[r]-P[j])`. For each r it is the max over lines (slope `-j`, intercept
`j*P[j] - W[j]`) at `x = P[r]`. P is not monotonic, so use a Li Chao tree over the compressed P values. The empty subarray scores 0.

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
struct LiChao{
    vi xs;            // only these x are ever queried
    vector<Line> t;
    vector<bool> has;
    LiChao(vi v):xs(v),t(4*v.size()),has(4*v.size(),false){}
    void insert(Line ln,ll node,ll l,ll r){
        if(!has[node]){ t[node]=ln; has[node]=true; return; }
        ll mid=(l+r)/2;
        bool lef=ln.eval(xs[l])>t[node].eval(xs[l]), mi=ln.eval(xs[mid])>t[node].eval(xs[mid]);
        if(mi)swap(t[node],ln);
        if(l==r)return;
        if(lef!=mi)insert(ln,2*node,l,mid);
        else insert(ln,2*node+1,mid+1,r);
    }
    ll query(ll i,ll node,ll l,ll r){   // i = index into xs
        ll res=has[node]?t[node].eval(xs[i]):LLONG_MIN;
        if(l==r)return res;
        ll mid=(l+r)/2;
        if(i<=mid)return max(res,query(i,2*node,l,mid));
        return max(res,query(i,2*node+1,mid+1,r));
    }
    void insert(Line ln){ insert(ln,1,0,xs.size()-1); }
    ll query(ll x){ return query(lower_bound(all(xs),x)-xs.begin(),1,0,xs.size()-1); }
};
void Solve(){
    ll n;
    cin >> n;
    vi a(n+1),P(n+1,0),W(n+1,0);
    for(ll i=1;i<=n;i++){
        cin>>a[i];
        P[i]=P[i-1]+a[i];
        W[i]=W[i-1]+i*a[i];
    }
    vi xs(P.begin()+1,P.end());
    sort(all(xs));
    xs.erase(unique(all(xs)),xs.end());

    LiChao lc(xs);
    ll ans=0;   // the empty subarray is allowed
    for(ll r=1;r<=n;r++){
        ll j=r-1;
        lc.insert({-j,j*P[j]-W[j]});
        ans=max(ans,W[r]+lc.query(P[r]));
    }
    cout<<ans<<endl;
}
```

</details>

<details><summary><b>631E</b> Product Sum: 2600</summary>

Moving `a[i]` to `j < i` changes the sum by `a[i]*j - P[j-1] - a[i]*i + P[i-1]`, and to
`j > i` by `a[i]*j - P[j] - a[i]*i + P[i]`. Each is a max over lines with slope j at `x = a[i]`.
Do one left-to-right pass (j ≤ i) and one right-to-left pass (j ≥ i). `j = i` gives 0, the "no move" option.

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
struct LiChao{
    vi xs;
    vector<Line> t;
    vector<bool> has;
    LiChao(vi v):xs(v),t(4*v.size()),has(4*v.size(),false){}
    void insert(Line ln,ll node,ll l,ll r){
        if(!has[node]){ t[node]=ln; has[node]=true; return; }
        ll mid=(l+r)/2;
        bool lef=ln.eval(xs[l])>t[node].eval(xs[l]), mi=ln.eval(xs[mid])>t[node].eval(xs[mid]);
        if(mi)swap(t[node],ln);
        if(l==r)return;
        if(lef!=mi)insert(ln,2*node,l,mid);
        else insert(ln,2*node+1,mid+1,r);
    }
    ll query(ll i,ll node,ll l,ll r){
        ll res=has[node]?t[node].eval(xs[i]):LLONG_MIN;
        if(l==r)return res;
        ll mid=(l+r)/2;
        if(i<=mid)return max(res,query(i,2*node,l,mid));
        return max(res,query(i,2*node+1,mid+1,r));
    }
    void insert(Line ln){ insert(ln,1,0,xs.size()-1); }
    ll query(ll x){ return query(lower_bound(all(xs),x)-xs.begin(),1,0,xs.size()-1); }
};
void Solve(){
    ll n;
    cin >> n;
    vi a(n+1),P(n+1,0);
    ll base=0;
    for(ll i=1;i<=n;i++){
        cin>>a[i];
        P[i]=P[i-1]+a[i];
        base+=a[i]*i;
    }
    vi xs(a.begin()+1,a.end());
    sort(all(xs));
    xs.erase(unique(all(xs)),xs.end());

    ll best=0;
    LiChao L(xs);
    for(ll i=1;i<=n;i++){
        L.insert({i,-P[i-1]});
        best=max(best,L.query(a[i])-a[i]*i+P[i-1]);
    }
    LiChao R(xs);
    for(ll i=n;i>=1;i--){
        R.insert({i,-P[i]});
        best=max(best,R.query(a[i])-a[i]*i+P[i]);
    }
    cout<<base+best<<endl;
}
```

</details>

<details><summary><b>932F</b> Escape Through Leaf: 2700</summary>

`dp[x] = min over y in subtree(x) of a[x]*b[y] + dp[y]`. Every node is the line `(b[y], dp[y])`.
Keep one dynamic Li Chao tree per subtree plus its list of lines, and merge **small-to-large**:
re-insert the smaller list into the bigger tree. O(n log^2 n). The tree is processed in reverse BFS order, so there's no deep recursion.

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
const ll LO=-100000,HI=100000;
struct Node{ Line ln; int l,r; };
vector<Node> pool;
int newNode(Line ln){ pool.push_back({ln,-1,-1}); return pool.size()-1; }
int insertLine(int node,Line ln,ll l,ll r){
    if(node==-1)return newNode(ln);
    ll mid=l+(r-l)/2;   // (l+r)/2 rounds toward zero, which breaks on negative ranges
    bool lef=ln.eval(l)<pool[node].ln.eval(l), mi=ln.eval(mid)<pool[node].ln.eval(mid);
    if(mi)swap(pool[node].ln,ln);
    if(l==r)return node;
    if(lef!=mi){ int c=insertLine(pool[node].l,ln,l,mid); pool[node].l=c; }
    else { int c=insertLine(pool[node].r,ln,mid+1,r); pool[node].r=c; }
    return node;
}
ll queryMin(int node,ll x,ll l,ll r){
    if(node==-1)return LLONG_MAX;
    ll res=pool[node].ln.eval(x);
    if(l==r)return res;
    ll mid=l+(r-l)/2;
    if(x<=mid)return min(res,queryMin(pool[node].l,x,l,mid));
    return min(res,queryMin(pool[node].r,x,mid+1,r));
}
void Solve(){
    ll n;
    cin >> n;
    vi a(n+1),b(n+1);
    for(ll i=1;i<=n;i++)cin>>a[i];
    for(ll i=1;i<=n;i++)cin>>b[i];
    vvi g(n+1);
    for(ll i=0;i<n-1;i++){
        ll u,v;
        cin>>u>>v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    // BFS order from the root; walking it backwards visits children before parents
    vi order,par(n+1,0);
    order.push_back(1);
    par[1]=-1;
    for(ll i=0;i<(ll)order.size();i++){
        ll v=order[i];
        for(ll to:g[v])if(to!=par[v]){ par[to]=v; order.push_back(to); }
    }
    pool.reserve(4000000);
    vi dp(n+1,0);
    vector<int> root(n+1,-1);
    vector<vector<Line>> lines(n+1);   // the lines stored in root[v], for re-inserting
    for(ll i=n-1;i>=0;i--){
        ll v=order[i];
        bool leaf=true;
        for(ll c:g[v])if(c!=par[v]){
            leaf=false;
            if(lines[c].size()>lines[v].size()){ swap(lines[c],lines[v]); swap(root[c],root[v]); }
            for(auto &ln:lines[c]){ root[v]=insertLine(root[v],ln,LO,HI); lines[v].push_back(ln); }
            vector<Line>().swap(lines[c]);
        }
        dp[v]=leaf?0:queryMin(root[v],a[v],LO,HI);
        Line ln={b[v],dp[v]};
        root[v]=insertLine(root[v],ln,LO,HI);
        lines[v].push_back(ln);
    }
    for(ll v=1;v<=n;v++)cout<<dp[v]<<" \n"[v==n];
}
```

</details>

<details><summary><b>1179D</b> Fedor Runs for President: 2700</summary>

The new edge closes the u–v path into a cycle. Vertices hanging off the cycle form pieces of
sizes `s1..sk`. Pairs inside one piece have 1 path and other pairs have 2, so the answer is
`n(n-1)/2 + (n^2 - sum s^2)/2`, and you minimise `sum s^2`. Let `down[v]` be the best value for a path
going down from v. At v, joining children a and b costs `down[a] + down[b] + (n-sz[a]-sz[b])^2`.
For fixed a that is a line in `sz[b]` evaluated at `n - sz[a]`, so build a fresh Li Chao over `[0, n]` per vertex
(total size O(n)). Don't forget the path that ends at v: `down[c] + (n-sz[c])^2`.

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
struct Node{ Line ln; int l,r; };
vector<Node> pool;
int insertLine(int node,Line ln,ll l,ll r){
    if(node==-1){ pool.push_back({ln,-1,-1}); return pool.size()-1; }
    ll mid=(l+r)/2;
    bool lef=ln.eval(l)<pool[node].ln.eval(l), mi=ln.eval(mid)<pool[node].ln.eval(mid);
    if(mi)swap(pool[node].ln,ln);
    if(l==r)return node;
    if(lef!=mi){ int c=insertLine(pool[node].l,ln,l,mid); pool[node].l=c; }
    else { int c=insertLine(pool[node].r,ln,mid+1,r); pool[node].r=c; }
    return node;
}
ll queryMin(int node,ll x,ll l,ll r){
    if(node==-1)return LLONG_MAX/4;
    ll res=pool[node].ln.eval(x);
    if(l==r)return res;
    ll mid=(l+r)/2;
    if(x<=mid)return min(res,queryMin(pool[node].l,x,l,mid));
    return min(res,queryMin(pool[node].r,x,mid+1,r));
}
void Solve(){
    ll n;
    cin >> n;
    vvi g(n+1);
    for(ll i=0;i<n-1;i++){
        ll u,v;
        cin>>u>>v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vi order,par(n+1,0),sz(n+1,1),down(n+1,0);
    order.push_back(1);
    for(ll i=0;i<(ll)order.size();i++){
        ll v=order[i];
        for(ll to:g[v])if(to!=par[v]){ par[to]=v; order.push_back(to); }
    }
    ll best=LLONG_MAX;
    pool.reserve(n+5);
    for(ll i=n-1;i>=0;i--){
        ll v=order[i];
        for(ll c:g[v])if(c!=par[v])sz[v]+=sz[c];
        down[v]=sz[v]*sz[v];   // the path stops at v
        pool.clear();
        int root=-1;
        for(ll c:g[v])if(c!=par[v]){
            down[v]=min(down[v],down[c]+(sz[v]-sz[c])*(sz[v]-sz[c]));
            // v is an endpoint: everything outside sz[c] is v's piece
            best=min(best,down[c]+(n-sz[c])*(n-sz[c]));
            // v joins c with an earlier child b
            ll x=n-sz[c];
            best=min(best,queryMin(root,x,0,n)+down[c]+x*x);
            root=insertLine(root,{-2*sz[c],down[c]+sz[c]*sz[c]},0,n);
        }
    }
    cout<<n*(n-1)/2+(n*n-best)/2<<endl;
}
```

</details>

<details><summary><b>1303G</b> Sum of Prefix Sums: 2700</summary>

Centroid decomposition. Split a path `u -> c -> v` into a first part `u..c` (sum S1, value F1)
and a second part after c (length L2, value G2). The total is `F1 + S1*L2 + G2`. On the first part, a
node at depth d (c at depth 1) is counted in d prefix sums, so F1 grows by `a*d`. Insert
lines `(S1, F1)` from earlier child subtrees and query at L2. Go through the children forwards, then
backwards, to cover both directions. O(n log^2 n).

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
struct Node{ Line ln; int l,r; };
vector<Node> pool;
int insertLine(int node,Line ln,ll l,ll r){
    if(node==-1){ pool.push_back({ln,-1,-1}); return pool.size()-1; }
    ll mid=(l+r)/2;
    bool lef=ln.eval(l)>pool[node].ln.eval(l), mi=ln.eval(mid)>pool[node].ln.eval(mid);
    if(mi)swap(pool[node].ln,ln);
    if(l==r)return node;
    if(lef!=mi){ int c=insertLine(pool[node].l,ln,l,mid); pool[node].l=c; }
    else { int c=insertLine(pool[node].r,ln,mid+1,r); pool[node].r=c; }
    return node;
}
ll queryMax(int node,ll x,ll l,ll r){
    if(node==-1)return LLONG_MIN;
    ll res=pool[node].ln.eval(x);
    if(l==r)return res;
    ll mid=(l+r)/2;
    if(x<=mid)return max(res,queryMax(pool[node].l,x,l,mid));
    return max(res,queryMax(pool[node].r,x,mid+1,r));
}
void Solve(){
    ll n;
    cin >> n;
    vvi g(n+1);
    for(ll i=0;i<n-1;i++){
        ll u,v;
        cin>>u>>v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vi a(n+1);
    for(ll i=1;i<=n;i++)cin>>a[i];

    vector<bool> removed(n+1,false);
    vi sz(n+1);
    ll ans=0;
    for(ll i=1;i<=n;i++)ans=max(ans,a[i]);

    function<void(ll,ll)> calcSize=[&](ll v,ll p){
        sz[v]=1;
        for(ll to:g[v])if(to!=p && !removed[to]){ calcSize(to,v); sz[v]+=sz[to]; }
    };
    function<ll(ll,ll,ll)> findCentroid=[&](ll v,ll p,ll tot){
        for(ll to:g[v])if(to!=p && !removed[to] && 2*sz[to]>tot)return findCentroid(to,v,tot);
        return v;
    };
    // per node of a child subtree: {L2, G2} as a second part, {S1, F1} as a first part
    struct Info{ ll L2,G2,S1,F1; };
    function<void(ll,ll,ll,ll,ll,ll,ll,vector<Info>&)> collect=
        [&](ll v,ll p,ll d,ll S2,ll G2,ll S1,ll F1,vector<Info>& out){
        S2+=a[v]; G2+=S2;          // second part excludes c
        S1+=a[v]; F1+=a[v]*d;      // first part includes c
        out.push_back({d-1,G2,S1,F1});
        for(ll to:g[v])if(to!=p && !removed[to])collect(to,v,d+1,S2,G2,S1,F1,out);
    };
    function<void(ll)> decompose=[&](ll start){
        calcSize(start,0);
        ll c=findCentroid(start,0,sz[start]);
        vector<vector<Info>> parts;
        ll maxL=1;
        for(ll to:g[c])if(!removed[to]){
            parts.emplace_back();
            collect(to,c,2,0,0,a[c],a[c],parts.back());
            for(auto &x:parts.back())maxL=max(maxL,x.L2);
        }
        for(ll pass=0;pass<2;pass++){
            pool.clear();
            int root=insertLine(-1,{a[c],a[c]},0,maxL);   // first part is just c
            for(auto &part:parts){
                for(auto &x:part)ans=max(ans,queryMax(root,x.L2,0,maxL)+x.G2);
                for(auto &x:part)root=insertLine(root,{x.S1,x.F1},0,maxL);
            }
            reverse(all(parts));
        }
        // paths that end at c: u -> c
        for(auto &part:parts)for(auto &x:part)ans=max(ans,x.F1);
        removed[c]=true;
        for(ll to:g[c])if(!removed[to])decompose(to);
    };
    decompose(1);
    cout<<ans<<endl;
}
```

</details>

<details><summary><b>678F</b> Lena and Queries: 2500</summary>

Deletions are the obstacle, so go offline. A pair is alive during an interval of query indices, so put it
on the O(log n) segment-tree-over-time nodes covering that interval. DFS the time tree with one Li Chao (max,
over the compressed query x values) that **logs every overwrite**: insert at the node, recurse,
roll back. Print `EMPTY SET` when nothing is alive. O(n log^2 n).

```cpp
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
vi xs;                      // all queried x, sorted
vector<Line> lt;
vector<bool> has;
vector<tuple<ll,Line,bool>> hist;   // (node, old line, old has) for rollback
void lcInsert(Line ln,ll node,ll l,ll r){
    if(!has[node]){ hist.push_back({node,lt[node],false}); lt[node]=ln; has[node]=true; return; }
    ll mid=(l+r)/2;
    bool lef=ln.eval(xs[l])>lt[node].eval(xs[l]), mi=ln.eval(xs[mid])>lt[node].eval(xs[mid]);
    if(mi){ hist.push_back({node,lt[node],true}); swap(lt[node],ln); }
    if(l==r)return;
    if(lef!=mi)lcInsert(ln,2*node,l,mid);
    else lcInsert(ln,2*node+1,mid+1,r);
}
ll lcQuery(ll i,ll node,ll l,ll r){
    ll res=has[node]?lt[node].eval(xs[i]):LLONG_MIN;
    if(l==r)return res;
    ll mid=(l+r)/2;
    if(i<=mid)return max(res,lcQuery(i,2*node,l,mid));
    return max(res,lcQuery(i,2*node+1,mid+1,r));
}
void Solve(){
    ll n;
    cin >> n;
    vi type(n),A(n),B(n),endAt(n,n);
    for(ll i=0;i<n;i++){
        cin>>type[i];
        if(type[i]==1)cin>>A[i]>>B[i];
        else if(type[i]==2){ ll j; cin>>j; endAt[j-1]=i; }
        else { cin>>A[i]; xs.push_back(A[i]); }
    }
    if(xs.empty())return;
    sort(all(xs));
    xs.erase(unique(all(xs)),xs.end());
    ll X=xs.size();
    lt.assign(4*X,{0,0});
    has.assign(4*X,false);

    vector<vector<Line>> seg(4*n);
    function<void(ll,ll,ll,ll,ll,Line)> addRange=[&](ll node,ll l,ll r,ll ql,ll qr,Line ln){
        if(qr<l || r<ql)return;
        if(ql<=l && r<=qr){ seg[node].push_back(ln); return; }
        ll mid=(l+r)/2;
        addRange(2*node,l,mid,ql,qr,ln);
        addRange(2*node+1,mid+1,r,ql,qr,ln);
    };
    for(ll i=0;i<n;i++)if(type[i]==1 && i+1<=endAt[i]-1)addRange(1,0,n-1,i+1,endAt[i]-1,{A[i],B[i]});

    vector<string> out;
    function<void(ll,ll,ll)> dfs=[&](ll node,ll l,ll r){
        size_t mark=hist.size();
        for(auto &ln:seg[node])lcInsert(ln,1,0,X-1);
        if(l==r){
            if(type[l]==3){
                ll res=lcQuery(lower_bound(all(xs),A[l])-xs.begin(),1,0,X-1);
                out.push_back(res==LLONG_MIN?"EMPTY SET":to_string(res));
            }
        }else{
            ll mid=(l+r)/2;
            dfs(2*node,l,mid);
            dfs(2*node+1,mid+1,r);
        }
        while(hist.size()>mark){
            auto [nd,ln,h]=hist.back(); hist.pop_back();
            lt[nd]=ln; has[nd]=h;
        }
    };
    dfs(1,0,n-1);
    for(auto &s:out)cout<<s<<"\n";
}
```

</details>
