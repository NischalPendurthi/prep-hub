---
title: Minimum Police Officers to Cover a DAG
url: ''
platform: OA
rating: 2100
date: '2026-10-22'
variants:
- min-path-cover
- bipartite-matching
tags:
- InMobi OA
- IIT Guwahati
insight: Split each v into v_out (left) and v_in (right), so edge u→v becomes u_out–v_in. Each matched edge joins two paths, so answer = N − max matching (Kuhn).
mistakes: Paths must be vertex-disjoint (no transitive closure). Reset vis before every left vertex.
star: true
status: solved
---

```cpp
void Solve(){
    ll n,m;
    cin >> n >> m;

    // left side = u_out, right side = v_in ; edge u->v becomes u_out -- v_in
    vvi adj(n+1,vi());
    for(ll i=0;i<m;i++){
        ll u,v;cin>>u>>v;
        adj[u].push_back(v);
    }

    vi matchR(n+1,0); // matchR[v] = left vertex matched to v_in, 0 if free
    vi vis(n+1,0);    // right vertices already tried in the current attempt

    // try to find an augmenting path starting from left vertex u
    function<bool(ll)> kuhn = [&](ll u)->bool{
        for(ll v:adj[u]){
            if(vis[v])continue;
            vis[v]=1;
            // v is free, or whoever holds v can move to some other right vertex
            if(matchR[v]==0 || kuhn(matchR[v])){
                matchR[v]=u;
                return true;
            }
        }
        return false;
    };

    ll matching=0;
    for(ll u=1;u<=n;u++){
        vis.assign(n+1,0);
        if(kuhn(u))matching++;
    }

    // every matched edge joins two paths into one
    cout<<n-matching<<endl;
}
```
