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
// Company Queries II (CSES 1688): boss of 2..n given, answer LCA(a,b) queries
void Solve(){
    ll n,q;
    cin >> n >> q;
    const ll LOG=20;                      // 2^20 > 2e5
    vvi up(LOG,vi(n+1,0));                // up[k][u] = 2^k-th ancestor, 0 = above root
    vvi ch(n+1);
    for(ll i=2;i<=n;i++){
        cin>>up[0][i];
        ch[up[0][i]].push_back(i);
    }

    // depth by BFS from the root (parents need not have smaller ids)
    vi depth(n+1,0);
    queue<ll> qu;qu.push(1);
    while(!qu.empty()){
        ll u=qu.front();qu.pop();
        for(ll v:ch[u]){depth[v]=depth[u]+1;qu.push(v);}
    }
    for(ll k=1;k<LOG;k++)
        for(ll u=1;u<=n;u++)
            up[k][u]=up[k-1][up[k-1][u]];  // up[*][0]=0 keeps jumps past the root safe

    auto lca = [&](ll a,ll b){
        if(depth[a]<depth[b])swap(a,b);
        ll diff=depth[a]-depth[b];
        for(ll k=0;k<LOG;k++)              // lift a to b's depth
            if(diff>>k&1)a=up[k][a];
        if(a==b)return a;
        for(ll k=LOG-1;k>=0;k--)           // jump while ancestors differ, high bits first
            if(up[k][a]!=up[k][b]){a=up[k][a];b=up[k][b];}
        return up[0][a];
    };

    while(q--){
        ll a,b;cin>>a>>b;
        cout<<lca(a,b)<<"\n";
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
