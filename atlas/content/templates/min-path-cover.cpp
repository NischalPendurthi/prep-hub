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
// DAG min vertex-disjoint path cover (InMobi OA: min police officers to cover a DAG): answer = n - max matching
void Solve(){
    ll n,m;
    cin >> n >> m;

    // left side = u_out, right side = v_in ; edge u->v becomes u_out -- v_in
    vvi adj(n+1,vi());
    for(ll i=0;i<m;i++){
        ll u,v;cin>>u>>v;
        adj[u].push_back(v);
    }

    vi matchR(n+1,0); // matchR[v] = u means the path goes u -> v (v_in is taken by u_out)
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

    // start with n single-vertex paths; every matched edge glues two of them together
    cout<<n-matching<<"\n";
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
