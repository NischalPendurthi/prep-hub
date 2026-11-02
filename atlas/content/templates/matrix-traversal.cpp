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
// Spiral Matrix (LC 54): print an n x m grid in clockwise spiral order
// input: n m, then the grid
void Solve(){
    ll n,m;
    cin >> n >> m;
    vvi g(n,vi(m));
    for(ll i=0;i<n;i++)for(ll j=0;j<m;j++)cin>>g[i][j];

    // four shrinking walls; after each side, move that wall inward
    ll top=0,bot=n-1,lef=0,rig=m-1;
    vi out;
    while(top<=bot && lef<=rig){
        for(ll j=lef;j<=rig;j++)out.push_back(g[top][j]);
        top++;
        for(ll i=top;i<=bot;i++)out.push_back(g[i][rig]);
        rig--;
        // a single row / column left: the bottom and left sides would repeat cells
        if(top<=bot){
            for(ll j=rig;j>=lef;j--)out.push_back(g[bot][j]);
            bot--;
        }
        if(lef<=rig){
            for(ll i=bot;i>=top;i--)out.push_back(g[i][lef]);
            lef++;
        }
    }
    for(ll i=0;i<(ll)out.size();i++)cout<<out[i]<<" \n"[i+1==(ll)out.size()];
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
