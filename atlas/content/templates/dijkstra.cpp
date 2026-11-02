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
// Shortest Routes I (CSES 1671): shortest distance from city 1 to every city, directed, w >= 0
void Solve(){
    ll n,m;
    cin >> n >> m;
    vector<vpi> adj(n+1);
    for(ll i=0;i<m;i++){
        ll a,b,c;
        cin>>a>>b>>c;
        adj[a].push_back({b,c});
    }

    vi dist(n+1,LINF);
    priority_queue<pi,vpi,greater<pi>> pq;   // {dist, node}, smallest first
    dist[1]=0;
    pq.push({0,1});
    while(!pq.empty()){
        auto [d,u]=pq.top();
        pq.pop();
        if(d!=dist[u])continue;              // stale entry: u was already settled cheaper
        for(auto [v,w]:adj[u]){
            if(d+w<dist[v]){
                dist[v]=d+w;
                pq.push({dist[v],v});
            }
        }
    }
    for(ll i=1;i<=n;i++)cout<<dist[i]<<" ";
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
