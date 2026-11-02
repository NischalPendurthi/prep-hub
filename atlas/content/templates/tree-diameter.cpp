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
// Tree Diameter (CSES 1131): number of edges on the longest path
void Solve(){
    ll n;
    cin >> n;
    vvi adj(n+1);
    for(ll i=0;i<n-1;i++){
        ll u,v;cin>>u>>v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    // BFS distances from src (iterative: a path of 2e5 nodes would overflow a recursive dfs)
    auto bfs = [&](ll src){
        vi dist(n+1,-1);
        queue<ll> qu;
        dist[src]=0;qu.push(src);
        while(!qu.empty()){
            ll u=qu.front();qu.pop();
            for(ll v:adj[u]){
                if(dist[v]!=-1)continue;
                dist[v]=dist[u]+1;
                qu.push(v);
            }
        }
        return dist;
    };

    // farthest node from ANY start is one end of a diameter
    vi d1=bfs(1);
    ll a=max_element(d1.begin()+1,d1.end())-d1.begin();
    vi d2=bfs(a);
    ll b=max_element(d2.begin()+1,d2.end())-d2.begin();
    cout<<d2[b]<<endl;
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
