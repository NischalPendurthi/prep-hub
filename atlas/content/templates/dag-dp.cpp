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
// Game Routes (CSES 1681): number of paths 1 -> n in a DAG, mod 1e9+7
void Solve(){
    ll n,m;
    cin >> n >> m;
    vvi adj(n+1);
    vi indeg(n+1,0);
    for(ll i=0;i<m;i++){
        ll a,b;cin>>a>>b;
        adj[a].push_back(b);
        indeg[b]++;
    }

    // Kahn's order: every predecessor of v is finalised before v is popped
    vi q;
    for(ll i=1;i<=n;i++)if(indeg[i]==0)q.push_back(i);
    vi ways(n+1,0);
    ways[1]=1;
    for(ll k=0;k<(ll)q.size();k++){
        ll u=q[k];
        for(ll v:adj[u]){
            ways[v]=(ways[v]+ways[u])%mod;   // push: every path to u extends to v
            if(--indeg[v]==0)q.push_back(v);
        }
    }
    cout<<ways[n]<<endl;
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
