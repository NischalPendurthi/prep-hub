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
// Distance Queries (CSES 1135): number of edges between a and b, many queries
void Solve(){
    ll n,q;
    cin >> n >> q;
    vvi adj(n+1);
    for(ll i=0;i<n-1;i++){
        ll u,v;cin>>u>>v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    const ll LOG=20;
    vvi up(LOG,vi(n+1,0));
    vi depth(n+1,0);       // for weighted edges keep dist[u] (root-to-u weight) the same way
    // BFS order: every parent is processed before its children
    vi order,vis(n+1,0);
    order.push_back(1);vis[1]=1;
    for(ll i=0;i<(ll)order.size();i++){
        ll u=order[i];
        for(ll v:adj[u]){
            if(vis[v])continue;
            vis[v]=1;
            up[0][v]=u;
            depth[v]=depth[u]+1;
            order.push_back(v);
        }
    }
    for(ll k=1;k<LOG;k++)
        for(ll u=1;u<=n;u++)
            up[k][u]=up[k-1][up[k-1][u]];

    auto lca = [&](ll a,ll b){
        if(depth[a]<depth[b])swap(a,b);
        ll diff=depth[a]-depth[b];
        for(ll k=0;k<LOG;k++)
            if(diff>>k&1)a=up[k][a];
        if(a==b)return a;
        for(ll k=LOG-1;k>=0;k--)
            if(up[k][a]!=up[k][b]){a=up[k][a];b=up[k][b];}
        return up[0][a];
    };

    while(q--){
        ll a,b;cin>>a>>b;
        // root->a and root->b share root->lca, which is counted twice
        cout<<depth[a]+depth[b]-2*depth[lca(a,b)]<<"\n";
    }
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
