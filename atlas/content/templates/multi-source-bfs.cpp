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
// Monsters (CSES 1194): reach the border strictly before any monster can reach the same cell
void Solve(){
    ll n,m;
    cin >> n >> m;
    vector<string> g(n);
    for(ll i=0;i<n;i++)cin>>g[i];

    ll dr[4]={-1,1,0,0},dc[4]={0,0,-1,1};
    string dirc="UDLR";
    vvi md(n,vi(m,LINF)),ad(n,vi(m,LINF)),how(n,vi(m,-1));

    // 1) ONE bfs from all monsters at once: md = time the nearest monster can be there
    queue<pi> q;
    for(ll i=0;i<n;i++)for(ll j=0;j<m;j++)if(g[i][j]=='M'){
        md[i][j]=0;
        q.push({i,j});
    }
    while(!q.empty()){
        auto [r,c]=q.front();
        q.pop();
        for(ll k=0;k<4;k++){
            ll nr=r+dr[k],nc=c+dc[k];
            if(nr<0||nr>=n||nc<0||nc>=m||g[nr][nc]=='#'||md[nr][nc]!=LINF)continue;
            md[nr][nc]=md[r][c]+1;
            q.push({nr,nc});
        }
    }

    // 2) bfs from A, only into cells A reaches strictly earlier than every monster
    for(ll i=0;i<n;i++)for(ll j=0;j<m;j++)if(g[i][j]=='A'){
        ad[i][j]=0;
        q.push({i,j});
    }
    while(!q.empty()){
        auto [r,c]=q.front();
        q.pop();
        if(r==0||r==n-1||c==0||c==m-1){   // on the border: walk back the moves
            string path;
            while(g[r][c]!='A'){
                ll k=how[r][c];
                path+=dirc[k];
                r-=dr[k];
                c-=dc[k];
            }
            reverse(all(path));
            cout<<"YES"<<endl<<path.size()<<endl<<path<<endl;
            return;
        }
        for(ll k=0;k<4;k++){
            ll nr=r+dr[k],nc=c+dc[k];
            if(nr<0||nr>=n||nc<0||nc>=m||g[nr][nc]=='#'||ad[nr][nc]!=LINF)continue;
            if(ad[r][c]+1>=md[nr][nc])continue;   // a monster gets there first (or at the same time)
            ad[nr][nc]=ad[r][c]+1;
            how[nr][nc]=k;
            q.push({nr,nc});
        }
    }
    cout<<"NO"<<endl;
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
