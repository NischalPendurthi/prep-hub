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
// Kuhn's algorithm (CSES 1696 School Dance): n left, m right, k edges
void Solve(){
    ll n,m,k;
    cin >> n >> m >> k;
    vvi adj(n+1,vi());
    for(ll i=0;i<k;i++){
        ll u,v;cin>>u>>v;
        adj[u].push_back(v);
    }

    vi matchR(m+1,0); // matchR[v] = left vertex holding right vertex v, 0 if free
    vi vis(m+1,0);    // right vertices tried in the current attempt

    function<bool(ll)> kuhn = [&](ll u)->bool{
        for(ll v:adj[u]){
            if(vis[v])continue;
            vis[v]=1;
            // v is free, or its owner can move to another right vertex
            if(matchR[v]==0 || kuhn(matchR[v])){
                matchR[v]=u;
                return true;
            }
        }
        return false;
    };

    ll cnt=0;
    for(ll u=1;u<=n;u++){
        vis.assign(m+1,0);
        if(kuhn(u))cnt++;
    }
    cout<<cnt<<endl;
    for(ll v=1;v<=m;v++){
        if(matchR[v])cout<<matchR[v]<<" "<<v<<endl;
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
