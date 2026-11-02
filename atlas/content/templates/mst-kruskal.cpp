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
// Kruskal (CSES 1675 Road Reparation): min total cost to connect all n cities, or IMPOSSIBLE
struct DSU{
    vi p,r;
    DSU(ll n):p(n+1),r(n+1,0){ for(ll i=0;i<=n;i++)p[i]=i; }
    ll find(ll x){ return p[x]==x ? x : p[x]=find(p[x]); } // path compression
    bool unite(ll a,ll b){
        a=find(a); b=find(b);
        if(a==b)return false; // already connected: this edge would close a cycle
        if(r[a]<r[b])swap(a,b);
        p[b]=a;
        if(r[a]==r[b])r[a]++;
        return true;
    }
};
void Solve(){
    ll n,m;
    cin >> n >> m;
    vector<array<ll,3>> edges(m); // {w,u,v} so sort orders by weight
    for(ll i=0;i<m;i++){
        ll u,v,w;cin>>u>>v>>w;
        edges[i]={w,u,v};
    }
    sort(all(edges));

    DSU dsu(n);
    ll cost=0,used=0;
    for(auto [w,u,v]:edges){
        // cheapest edge joining two different components is always safe (cut property)
        if(dsu.unite(u,v)){
            cost+=w;
            used++;
        }
    }
    if(used!=n-1)cout<<"IMPOSSIBLE"<<"\n"; // graph is disconnected
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
