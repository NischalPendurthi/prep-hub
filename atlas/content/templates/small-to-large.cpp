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
// Distinct Colors (CSES 1139): number of distinct colours in every subtree
void Solve(){
    ll n;
    cin >> n;
    vi col(n+1);
    for(ll i=1;i<=n;i++)cin>>col[i];
    vvi adj(n+1);
    for(ll i=0;i<n-1;i++){
        ll u,v;cin>>u>>v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    // parent before child order, so children can be merged into parents bottom-up
    vi order,par(n+1,0);
    order.push_back(1);par[1]=-1;
    for(ll i=0;i<(ll)order.size();i++){
        ll u=order[i];
        for(ll v:adj[u]){
            if(v==par[u])continue;
            par[v]=u;
            order.push_back(v);
        }
    }

    vector<set<ll>> st(n+1);
    vi ans(n+1);
    for(ll i=n-1;i>=0;i--){
        ll u=order[i];
        st[u].insert(col[u]);
        ans[u]=st[u].size();               // u is finished: all children merged already
        if(par[u]<=0)continue;
        ll p=par[u];
        // keep the bigger set, pour the smaller one in: each element moves O(log n) times
        if(st[u].size()>st[p].size())swap(st[u],st[p]);   // swap is O(1)
        for(ll x:st[u])st[p].insert(x);
        st[u].clear();
    }
    for(ll i=1;i<=n;i++)cout<<ans[i]<<" \n"[i==n];
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
