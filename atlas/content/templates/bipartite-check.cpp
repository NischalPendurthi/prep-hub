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
// BFS 2-colouring (CSES 1668 Building Teams): print team 1/2 for each pupil, or IMPOSSIBLE
void Solve(){
    ll n,m;
    cin >> n >> m;
    vvi adj(n+1,vi());
    for(ll i=0;i<m;i++){
        ll u,v;cin>>u>>v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    vi col(n+1,0); // 0 = unvisited, else 1 or 2
    for(ll s=1;s<=n;s++){
        if(col[s])continue;
        // every component is coloured on its own; its smallest vertex gets team 1
        col[s]=1;
        queue<ll> q;
        q.push(s);
        while(!q.empty()){
            ll u=q.front();q.pop();
            for(ll v:adj[u]){
                if(col[v]==0){
                    col[v]=3-col[u]; // neighbours take the other colour
                    q.push(v);
                }
                else if(col[v]==col[u]){
                    cout<<"IMPOSSIBLE"<<"\n"; // edge inside one colour = odd cycle
                    return;
                }
            }
        }
    }
    for(ll i=1;i<=n;i++)cout<<col[i]<<" \n"[i==n];
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
