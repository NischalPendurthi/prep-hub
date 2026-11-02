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
// Tree Matching (CSES 1130): max number of disjoint edges in a tree
void Solve(){
    ll n;
    cin >> n;
    vvi adj(n+1);
    for(ll i=1;i<n;i++){
        ll u,v;cin>>u>>v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    // dp0[u] = best in subtree of u with u free, dp1[u] = best with u matched to a child
    vi dp0(n+1,0),dp1(n+1,0);
    // iterative DFS order: a path of 2e5 nodes would overflow the recursion stack on some judges
    vi order,par(n+1,0),st={1};
    par[1]=-1;
    while(!st.empty()){
        ll u=st.back();st.pop_back();
        order.push_back(u);
        for(ll v:adj[u])if(v!=par[u]){par[v]=u;st.push_back(v);}
    }
    for(ll k=n-1;k>=0;k--){           // reverse order = children before parents
        ll u=order[k];
        ll gain=NINF;
        for(ll v:adj[u]){
            if(v==par[u])continue;
            dp0[u]+=max(dp0[v],dp1[v]);
            // matching u-v: v must be free, so swap v's best for dp0[v] and add the edge
            gain=max(gain,dp0[v]+1-max(dp0[v],dp1[v]));
        }
        if(gain!=NINF)dp1[u]=dp0[u]+gain;
    }
    cout<<max(dp0[1],dp1[1])<<endl;
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
