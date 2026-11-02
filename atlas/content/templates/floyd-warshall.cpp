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
// Shortest Routes II (CSES 1672): answer q shortest-distance queries in an undirected graph, n <= 500
void Solve(){
    ll n,m,q;
    cin >> n >> m >> q;
    const ll BIG=1e18;
    vvi d(n+1,vi(n+1,BIG));
    for(ll i=1;i<=n;i++)d[i][i]=0;
    for(ll i=0;i<m;i++){
        ll a,b,c;
        cin>>a>>b>>c;
        d[a][b]=min(d[a][b],c);     // parallel roads: keep the cheapest
        d[b][a]=min(d[b][a],c);
    }

    // k OUTERMOST: after round k, d[i][j] uses only 1..k as middle nodes
    for(ll k=1;k<=n;k++)
        for(ll i=1;i<=n;i++){
            if(d[i][k]==BIG)continue;
            for(ll j=1;j<=n;j++)
                if(d[k][j]!=BIG)d[i][j]=min(d[i][j],d[i][k]+d[k][j]);
        }

    while(q--){
        ll a,b;
        cin>>a>>b;
        cout<<(d[a][b]==BIG?-1:d[a][b])<<"\n";
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
