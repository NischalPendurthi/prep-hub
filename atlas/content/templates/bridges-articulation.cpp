#include <bits/stdc++.h>
#define all(x) x.begin(),x.end()
using namespace std;
typedef long long ll;
using ull = unsigned long long;
typedef vector<ll> vi;
typedef vector<vi> vvi;
typedef pair<ll,ll> pi;
typedef vector<pi> vpi;
typedef map<ll,ll> mi;
typedef map<pi,ll> mpi;
#define mod 1000000007
#define INF INT_MAX
#define NINF INT_MIN
#define LINF INT64_MAX
// Low-link (CSES 2076 Necessary Roads): print every bridge. isCut[] also gives CSES 2077 Necessary Cities
void Solve(){
    ll n,m;
    cin >> n >> m;
    vector<vpi> adj(n+1); // adj[u] = {v, edge id}
    vpi edges(m);
    for(ll i=0;i<m;i++){
        ll u,v;cin>>u>>v;
        edges[i]={u,v};
        adj[u].push_back({v,i});
        adj[v].push_back({u,i});
    }

    vi tin(n+1,0),low(n+1,0),isCut(n+1,0),isBridge(m,0);
    ll timer=0;
    // low[u] = smallest tin reachable from u's subtree using at most one back edge
    function<void(ll,ll)> dfs = [&](ll u,ll pe){
        tin[u]=low[u]=++timer;
        ll children=0;
        for(auto [v,id]:adj[u]){
            if(id==pe)continue; // skip the edge we came by (by id, so parallel edges still count)
            if(tin[v]){
                low[u]=min(low[u],tin[v]); // back edge
                continue;
            }
            dfs(v,id);
            children++;
            low[u]=min(low[u],low[v]);
            if(low[v]>tin[u])isBridge[id]=1;           // v's subtree can't get above u-v
            if(pe!=-1 && low[v]>=tin[u])isCut[u]=1;    // v's subtree can't get above u
        }
        if(pe==-1 && children>1)isCut[u]=1;            // root: cut iff 2+ dfs children
    };
    for(ll i=1;i<=n;i++)if(!tin[i])dfs(i,-1);

    vpi ans;
    for(ll i=0;i<m;i++){
        if(!isBridge[i])continue;
        auto [u,v]=edges[i];
        ans.push_back({min(u,v),max(u,v)});
    }
    sort(all(ans)); // any order is accepted; sorted keeps the output deterministic
    cout<<ans.size()<<"\n";
    for(auto [u,v]:ans)cout<<u<<" "<<v<<"\n";
}
int main() {
    #ifndef ONLINE_JUDGE
    freopen("../input.txt", "r", stdin);
    freopen("../output.txt", "w", stdout);
    #endif
    ios::sync_with_stdio(false);
    cin.tie(0);

    ll t=1;
    // cin >> t;

    while (t--) {
        Solve();
    }
    return 0;
}
