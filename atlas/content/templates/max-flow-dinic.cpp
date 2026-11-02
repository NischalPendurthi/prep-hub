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
// Dinic (CSES 1694 Download Speed): max flow from computer 1 to computer n
struct Dinic{
    struct E{ ll to,cap; };
    vector<E> e;    // edge i and i^1 are a forward/reverse pair
    vvi g;
    vi level,ptr;
    Dinic(ll n):g(n+1),level(n+1),ptr(n+1){}
    void addEdge(ll u,ll v,ll c){
        g[u].push_back(e.size()); e.push_back({v,c});
        g[v].push_back(e.size()); e.push_back({u,0}); // residual edge starts empty
    }
    bool bfs(ll s,ll t){
        fill(all(level),-1);
        level[s]=0;
        queue<ll> q;q.push(s);
        while(!q.empty()){
            ll u=q.front();q.pop();
            for(ll id:g[u])if(e[id].cap>0 && level[e[id].to]==-1){
                level[e[id].to]=level[u]+1;
                q.push(e[id].to);
            }
        }
        return level[t]!=-1;
    }
    ll dfs(ll u,ll t,ll f){
        if(u==t || f==0)return f;
        // ptr[u] skips edges already saturated in this phase: this is what makes Dinic fast
        for(ll &i=ptr[u];i<(ll)g[u].size();i++){
            ll id=g[u][i],v=e[id].to;
            if(level[v]!=level[u]+1 || e[id].cap==0)continue; // only go one level deeper
            ll pushed=dfs(v,t,min(f,e[id].cap));
            if(pushed){
                e[id].cap-=pushed;
                e[id^1].cap+=pushed;
                return pushed;
            }
        }
        return 0;
    }
    ll maxflow(ll s,ll t){
        ll flow=0;
        while(bfs(s,t)){           // one phase per level graph
            fill(all(ptr),0);
            while(ll f=dfs(s,t,LINF))flow+=f;
        }
        return flow;
    }
};
void Solve(){
    ll n,m;
    cin >> n >> m;
    Dinic d(n);
    for(ll i=0;i<m;i++){
        ll a,b,c;cin>>a>>b>>c;
        d.addEdge(a,b,c); // directed; for an undirected edge add both directions with cap c
    }
    cout<<d.maxflow(1,n)<<"\n";
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
