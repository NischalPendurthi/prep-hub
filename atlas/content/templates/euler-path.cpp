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
// Hierholzer (CSES 1693 Teleporters Path): directed path 1 -> n using every edge exactly once, or IMPOSSIBLE
void Solve(){
    ll n,m;
    cin >> n >> m;
    vvi adj(n+1,vi());
    vi indeg(n+1,0),outdeg(n+1,0);
    for(ll i=0;i<m;i++){
        ll u,v;cin>>u>>v;
        adj[u].push_back(v);
        outdeg[u]++;indeg[v]++;
    }

    // degree check: start has out = in+1, end has in = out+1, everyone else balanced
    bool ok=true;
    for(ll i=1;i<=n;i++){
        ll need=(i==1)-(i==n); // out - in required at i
        if(outdeg[i]-indeg[i]!=need)ok=false;
    }

    // iterative Hierholzer: walk until stuck, then back off and record the vertex
    vi path,stk={1},ptr(n+1,0);
    if(ok){
        while(!stk.empty()){
            ll u=stk.back();
            if(ptr[u]<(ll)adj[u].size()){
                stk.push_back(adj[u][ptr[u]++]); // use each edge once via the pointer
            }
            else{
                path.push_back(u);
                stk.pop_back();
            }
        }
        reverse(all(path));
    }
    // the walk misses edges if they're in a part not reachable from 1 (connectivity check)
    if(!ok || (ll)path.size()!=m+1 || path.back()!=n){
        cout<<"IMPOSSIBLE"<<"\n";
        return;
    }
    for(ll i=0;i<=m;i++)cout<<path[i]<<" \n"[i==m];
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
