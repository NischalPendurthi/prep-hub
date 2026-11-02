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
// Network Breakdown (CSES 1677): n m k, m edges, then k edges removed in order; print #components after each removal
struct DSU{
    vi p,sz;
    DSU(ll n): p(n+1),sz(n+1,1){ iota(all(p),0); }
    ll find(ll x){ return p[x]==x ? x : p[x]=find(p[x]); }
    bool unite(ll a,ll b){
        a=find(a);b=find(b);
        if(a==b)return false;
        if(sz[a]<sz[b])swap(a,b);
        p[b]=a;sz[a]+=sz[b];
        return true;
    }
};
void Solve(){
    ll n,m,k;
    cin >> n >> m >> k;
    vpi e(m);
    map<pi,ll> alive; // multiplicity of each undirected edge still present at the end
    for(ll i=0;i<m;i++){
        ll a,b;cin>>a>>b;
        if(a>b)swap(a,b);
        e[i]={a,b};
        alive[e[i]]++;
    }
    vpi del(k);
    for(ll i=0;i<k;i++){
        ll a,b;cin>>a>>b;
        if(a>b)swap(a,b); // removals may name the edge in the other direction
        del[i]={a,b};
        alive[del[i]]--;
    }

    // DSU can't delete, so run time backwards: start from the final graph and ADD removed edges
    DSU d(n);
    ll comps=n;
    for(auto &[ed,c]:alive)if(c>0 && d.unite(ed.first,ed.second))comps--;
    vi ans(k);
    for(ll i=k-1;i>=0;i--){
        ans[i]=comps; // state right after removal i = final graph + removals i+1..k-1 added back
        if(d.unite(del[i].first,del[i].second))comps--;
    }
    for(ll i=0;i<k;i++)cout<<ans[i]<<" \n"[i+1==k];
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
