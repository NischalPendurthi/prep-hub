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
// Tree Distances I (CSES 1132): for every node, the distance to the farthest node
vvi adj;
vi in,out;   // in[u] = longest path down into u's subtree, out[u] = longest path that leaves via the parent
void down_dp(ll u,ll p){
    for(ll v:adj[u]){
        if(v==p)continue;
        down_dp(v,u);
        in[u]=max(in[u],1+in[v]);
    }
}
void reroot_dp(ll u,ll p){
    // top two child branches, so a child can ask "best branch that isn't me"
    ll mx1=-1,mx2=-1;
    for(ll v:adj[u]){
        if(v==p)continue;
        if(mx1<=1+in[v]){
            mx2=mx1;
            mx1=1+in[v];
        }
        else mx2=max(mx2,1+in[v]);
    }
    for(ll v:adj[u]){
        if(v==p)continue;
        // from v go up to u, then either further up (out[u]) or down a sibling branch
        if(in[v]+1==mx1)out[v]=1+max(out[u],mx2);
        else out[v]=1+max(out[u],mx1);
        reroot_dp(v,u);
    }
}
void Solve(){
    ll n;
    cin >> n;
    adj.assign(n+1,{});
    in.assign(n+1,0);
    out.assign(n+1,0);
    for(ll i=1;i<n;i++){
        ll u,v;cin>>u>>v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    down_dp(1,0);
    reroot_dp(1,0);
    for(ll i=1;i<=n;i++)cout<<max(in[i],out[i])<<" ";
    cout<<endl;
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
