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
// Message Route (CSES 1667): fewest edges from 1 to n in an unweighted graph, print the path
void Solve(){
    ll n,m;
    cin >> n >> m;
    vvi adj(n+1);
    for(ll i=0;i<m;i++){
        ll a,b;
        cin>>a>>b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }

    vi dist(n+1,-1),par(n+1,-1);
    queue<ll> q;
    dist[1]=0;
    q.push(1);
    while(!q.empty()){
        ll u=q.front();
        q.pop();
        for(ll v:adj[u]){
            if(dist[v]!=-1)continue;   // mark when PUSHED, so nothing enters the queue twice
            dist[v]=dist[u]+1;         // first time reached = fewest edges
            par[v]=u;
            q.push(v);
        }
    }

    if(dist[n]==-1){
        cout<<"IMPOSSIBLE"<<endl;
        return;
    }
    vi path;
    for(ll v=n;v!=-1;v=par[v])path.push_back(v);   // walk parents back to the source
    reverse(all(path));
    cout<<path.size()<<endl;
    for(ll v:path)cout<<v<<" ";
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
