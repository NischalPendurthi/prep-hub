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
// The Number of Imposters (CF 1594D): t tests; n m, then m lines "i j imposter|crewmate"; max #imposters or -1
// par[x] = parity of x relative to its parent; after find, relative to the root
vi p,par,sz;
ll find(ll x){
    if(p[x]==x)return x;
    ll r=find(p[x]);
    par[x]^=par[p[x]]; // p[x] now points at r, so par[p[x]] is p[x]'s parity to the root
    p[x]=r;
    return r;
}
// add constraint parity(a) ^ parity(b) == w; false if it contradicts what we know
bool unite(ll a,ll b,ll w){
    ll ra=find(a),rb=find(b);
    if(ra==rb)return (par[a]^par[b])==w;
    if(sz[ra]<sz[rb]){swap(ra,rb);swap(a,b);}
    p[rb]=ra;
    par[rb]=par[a]^par[b]^w; // chosen so that par(a)^par(b) == w through the new edge
    sz[ra]+=sz[rb];
    return true;
}
void Solve(){
    ll n,m;
    cin >> n >> m;
    p.assign(n+1,0);par.assign(n+1,0);sz.assign(n+1,1);
    iota(all(p),0);
    bool ok=true;
    for(ll i=0;i<m;i++){
        ll a,b;string c;
        cin>>a>>b>>c;
        // "a says b is crewmate" => same role (an honest crewmate or a lying imposter); "imposter" => different
        if(!unite(a,b,c=="imposter"))ok=false;
    }
    if(!ok){cout<<-1<<"\n";return;}
    // each component has two consistent colourings: imposters = parity-1 nodes or parity-0 nodes
    vi one(n+1,0);
    for(ll i=1;i<=n;i++){ find(i); if(par[i])one[p[i]]++; }
    ll ans=0;
    for(ll i=1;i<=n;i++)if(p[i]==i)ans+=max(one[i],sz[i]-one[i]);
    cout<<ans<<"\n";
}
int main() {
    #ifndef ONLINE_JUDGE
    freopen("../input.txt", "r", stdin);
    freopen("../output.txt", "w", stdout);
    #endif
    ios::sync_with_stdio(false);
    cin.tie(0);

    ll t=1;
    cin >> t;

    while (t--) {
        Solve();
    }
    return 0;
}
