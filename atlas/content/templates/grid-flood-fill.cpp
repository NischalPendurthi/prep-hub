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
// Counting Rooms (CSES 1192): number of connected components of '.' cells in a grid
void Solve(){
    ll n,m;
    cin >> n >> m;
    vector<string> g(n);
    for(ll i=0;i<n;i++)cin>>g[i];

    ll dr[4]={-1,1,0,0},dc[4]={0,0,-1,1};
    ll rooms=0;
    for(ll i=0;i<n;i++)for(ll j=0;j<m;j++){
        if(g[i][j]!='.')continue;
        rooms++;
        // explicit stack: a 1000x1000 room would overflow a recursive dfs
        vpi st={{i,j}};
        g[i][j]='#';                   // mark when pushed, reuse the grid as visited
        while(!st.empty()){
            auto [r,c]=st.back();
            st.pop_back();
            for(ll k=0;k<4;k++){
                ll nr=r+dr[k],nc=c+dc[k];
                if(nr<0||nr>=n||nc<0||nc>=m||g[nr][nc]!='.')continue;
                g[nr][nc]='#';
                st.push_back({nr,nc});
            }
        }
    }
    cout<<rooms<<endl;
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
