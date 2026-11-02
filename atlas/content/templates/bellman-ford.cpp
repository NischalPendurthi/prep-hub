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
// Cycle Finding (CSES 1197): print any negative cycle of a directed graph, or NO
void Solve(){
    ll n,m;
    cin >> n >> m;
    vector<tuple<ll,ll,ll>> edges(m);
    for(ll i=0;i<m;i++){
        ll a,b,c;
        cin>>a>>b>>c;
        edges[i]=tuple(a,b,c);
    }

    // dist all 0 = a virtual source with 0-edges to every node, so a cycle ANYWHERE is found
    vi dist(n+1,0),par(n+1,-1);
    ll x=-1;
    for(ll i=0;i<n;i++){            // n rounds: something still relaxing in round n => negative cycle
        x=-1;
        for(auto [a,b,c]:edges){
            if(dist[a]+c<dist[b]){
                dist[b]=dist[a]+c;
                par[b]=a;
                x=b;
            }
        }
        if(x==-1)break;             // nothing changed: distances are final
    }
    if(x==-1){
        cout<<"NO"<<endl;
        return;
    }

    // x may only hang off the cycle; n parent steps are sure to land ON it
    for(ll i=0;i<n;i++)x=par[x];
    vi cyc={x};
    for(ll v=par[x];v!=x;v=par[v])cyc.push_back(v);
    cyc.push_back(x);
    reverse(all(cyc));              // parents point backwards along edges
    cout<<"YES"<<endl;
    for(ll v:cyc)cout<<v<<" ";
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
