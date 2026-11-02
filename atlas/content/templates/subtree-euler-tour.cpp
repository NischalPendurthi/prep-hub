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
// Subtree Queries (CSES 1137): set value of node s / sum of values in subtree of s
struct BIT {
    vi tree;
    ll n;
    BIT(ll n) : tree(n + 1, 0), n(n) {}
    void update(ll i, ll val) {
        for (; i <= n; i += i & (-i)) tree[i] += val;
    }
    ll query(ll i) {
        ll res = 0;
        for (; i > 0; i -= i & (-i)) res += tree[i];
        return res;
    }
};
void Solve(){
    ll n,q;
    cin >> n >> q;
    vi val(n+1);
    for(ll i=1;i<=n;i++)cin>>val[i];
    vvi adj(n+1);
    for(ll i=0;i<n-1;i++){
        ll u,v;cin>>u>>v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    // tin[u]..tout[u] is a contiguous block holding exactly u's subtree
    vi tin(n+1),tout(n+1),sz(n+1,1);
    ll timer=0;
    function<void(ll,ll)> dfs = [&](ll u,ll p){
        tin[u]=++timer;
        for(ll v:adj[u]){
            if(v==p)continue;
            dfs(v,u);
            sz[u]+=sz[v];
        }
        tout[u]=timer;      // == tin[u]+sz[u]-1
    };
    dfs(1,0);

    BIT bit(n);
    for(ll u=1;u<=n;u++)bit.update(tin[u],val[u]);   // position = tin, not the node id
    while(q--){
        ll type;cin>>type;
        if(type==1){
            ll s,x;cin>>s>>x;
            bit.update(tin[s],x-val[s]);   // point SET = add the difference
            val[s]=x;
        }
        else{
            ll s;cin>>s;
            cout<<bit.query(tout[s])-bit.query(tin[s]-1)<<"\n";
        }
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
