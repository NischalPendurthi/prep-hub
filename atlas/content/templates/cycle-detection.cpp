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
// Round Trip II (CSES 1678): find and print any cycle in a directed graph
void Solve(){
    ll n,m;
    cin >> n >> m;
    vvi adj(n+1);
    for(ll i=0;i<m;i++){
        ll a,b;
        cin>>a>>b;
        adj[a].push_back(b);
    }

    // vis: 0 = unseen, 1 = on the current dfs path, 2 = finished
    vi vis(n+1,0),par(n+1,0),cyc;
    function<bool(ll)> dfs=[&](ll u)->bool{
        vis[u]=1;
        for(ll v:adj[u]){
            if(vis[v]==0){
                par[v]=u;
                if(dfs(v))return true;
            }
            else if(vis[v]==1){        // back edge u->v: v..u is on the path, so v->...->u->v
                cyc.push_back(v);
                for(ll x=u;x!=v;x=par[x])cyc.push_back(x);
                cyc.push_back(v);
                reverse(all(cyc));
                return true;
            }
            // vis[v]==2: already fully explored, no cycle through it can involve u
        }
        vis[u]=2;
        return false;
    };

    for(ll i=1;i<=n;i++){
        if(vis[i]==0&&dfs(i)){
            cout<<cyc.size()<<endl;
            for(ll v:cyc)cout<<v<<" ";
            cout<<endl;
            return;
        }
    }
    cout<<"IMPOSSIBLE"<<endl;
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
