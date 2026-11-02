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
// Road Construction (CSES 1676): n m; after each new road print #components and the largest component size
struct DSU{
    vi p,sz;
    DSU(ll n): p(n+1),sz(n+1,1){ iota(all(p),0); }
    ll find(ll x){ return p[x]==x ? x : p[x]=find(p[x]); } // path compression
    bool unite(ll a,ll b){
        a=find(a);b=find(b);
        if(a==b)return false;
        if(sz[a]<sz[b])swap(a,b); // union by size: hang the smaller tree under the bigger
        p[b]=a;
        sz[a]+=sz[b];
        return true;
    }
};
void Solve(){
    ll n,m;
    cin >> n >> m;
    DSU d(n);
    ll comps=n,big=1;
    for(ll i=0;i<m;i++){
        ll a,b;cin>>a>>b;
        // component count drops only when the road joins two different components
        if(d.unite(a,b)){
            comps--;
            big=max(big,d.sz[d.find(a)]); // sizes only grow, so a running max is enough
        }
        cout<<comps<<" "<<big<<"\n";
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
