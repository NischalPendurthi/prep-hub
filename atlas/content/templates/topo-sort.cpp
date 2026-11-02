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
// Course Schedule (CSES 1679): order courses so every prerequisite comes first (Kahn's algorithm)
void Solve(){
    ll n,m;
    cin >> n >> m;
    vvi adj(n+1);
    vi indeg(n+1,0);
    for(ll i=0;i<m;i++){
        ll a,b;
        cin>>a>>b;
        adj[a].push_back(b);
        indeg[b]++;
    }

    queue<ll> q;              // swap for a min-heap if the smallest order is required
    for(ll i=1;i<=n;i++)if(indeg[i]==0)q.push(i);
    vi order;
    while(!q.empty()){
        ll u=q.front();
        q.pop();
        order.push_back(u);
        for(ll v:adj[u]){
            indeg[v]--;
            if(indeg[v]==0)q.push(v);   // all prerequisites of v are placed
        }
    }

    // nodes on a cycle never reach indegree 0
    if((ll)order.size()!=n){
        cout<<"IMPOSSIBLE"<<endl;
        return;
    }
    for(ll v:order)cout<<v<<" ";
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
