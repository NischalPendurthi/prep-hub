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
// Tarjan SCC (CSES 1683 Planets and Kingdoms): number of SCCs and a kingdom label per planet
void Solve(){
    ll n,m;
    cin >> n >> m;
    vvi adj(n+1,vi());
    for(ll i=0;i<m;i++){
        ll u,v;cin>>u>>v;
        adj[u].push_back(v);
    }

    vi tin(n+1,0),low(n+1,0),onStk(n+1,0),comp(n+1,0);
    vi stk;
    ll timer=0,k=0;
    function<void(ll)> dfs = [&](ll u){
        tin[u]=low[u]=++timer;
        stk.push_back(u);onStk[u]=1;
        for(ll v:adj[u]){
            if(!tin[v]){
                dfs(v);
                low[u]=min(low[u],low[v]);
            }
            // only vertices still on the stack belong to an open SCC; finished SCCs are ignored
            else if(onStk[v])low[u]=min(low[u],tin[v]);
        }
        if(low[u]==tin[u]){
            // u is the root of its SCC: pop everything above it
            k++;
            while(true){
                ll x=stk.back();stk.pop_back();
                onStk[x]=0;
                comp[x]=k;
                if(x==u)break;
            }
        }
    };
    for(ll i=1;i<=n;i++)if(!tin[i])dfs(i);
    // Tarjan finds SCCs in reverse topological order (sinks first): comp ids are a reverse topo order

    // relabel by first appearance so the output is deterministic (any labelling is accepted)
    vi id(k+1,0);
    ll c=0;
    for(ll i=1;i<=n;i++)if(!id[comp[i]])id[comp[i]]=++c;
    cout<<k<<"\n";
    for(ll i=1;i<=n;i++)cout<<id[comp[i]]<<" \n"[i==n];
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
