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
// Labyrinth (CF 1063B): count cells reachable using at most x left moves and at most y right moves
void Solve(){
    ll n,m,r0,c0,x,y;
    cin >> n >> m >> r0 >> c0 >> x >> y;
    r0--;c0--;
    vector<string> g(n);
    for(ll i=0;i<n;i++)cin>>g[i];

    // rights - lefts = col - c0 for ANY path, so minimising lefts minimises rights too.
    // Edge weight = 1 for a left move, 0 for up/down/right  ->  0-1 BFS on lefts used.
    ll dr[4]={-1,1,0,0},dc[4]={0,0,-1,1};
    vvi L(n,vi(m,LINF));
    deque<pi> dq;
    L[r0][c0]=0;
    dq.push_back({r0,c0});
    while(!dq.empty()){
        auto [r,c]=dq.front();
        dq.pop_front();
        for(ll k=0;k<4;k++){
            ll nr=r+dr[k],nc=c+dc[k];
            if(nr<0||nr>=n||nc<0||nc>=m||g[nr][nc]=='*')continue;
            ll w=(dc[k]==-1);
            if(L[r][c]+w<L[nr][nc]){
                L[nr][nc]=L[r][c]+w;
                if(w)dq.push_back({nr,nc});    // weight 1 -> back
                else dq.push_front({nr,nc});   // weight 0 -> front, same distance layer
            }
        }
    }

    ll ans=0;
    for(ll i=0;i<n;i++)for(ll j=0;j<m;j++){
        if(L[i][j]==LINF)continue;
        ll R=L[i][j]+(j-c0);
        if(L[i][j]<=x&&R<=y)ans++;
    }
    cout<<ans<<endl;
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
