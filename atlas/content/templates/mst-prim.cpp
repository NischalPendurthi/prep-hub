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
// Prim with a lazy heap (CSES 1675 Road Reparation): min cost to connect all n cities, or IMPOSSIBLE
void Solve(){
    ll n,m;
    cin >> n >> m;
    vector<vpi> adj(n+1); // adj[u] = {v,w}
    for(ll i=0;i<m;i++){
        ll u,v,w;cin>>u>>v>>w;
        adj[u].push_back({v,w});
        adj[v].push_back({u,w});
    }

    vi inTree(n+1,0);
    priority_queue<pi,vpi,greater<pi>> pq; // {w,v}: cheapest edge from the tree to v
    pq.push({0,1});
    ll cost=0,taken=0;
    while(!pq.empty()){
        auto [w,u]=pq.top();pq.pop();
        if(inTree[u])continue; // stale entry: u was already reached by a cheaper edge
        inTree[u]=1;
        cost+=w;
        taken++;
        for(auto [v,wv]:adj[u]){
            if(!inTree[v])pq.push({wv,v});
        }
    }
    if(taken!=n)cout<<"IMPOSSIBLE"<<"\n"; // some city never reached
    else cout<<cost<<"\n";
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
