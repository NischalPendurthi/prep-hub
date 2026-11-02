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
// Forest Queries (CSES 1652): count '*' in the rectangle (y1,x1)-(y2,x2), 1-indexed
void Solve(){
    ll n,q;
    cin >> n >> q;
    // p[i][j] = count in rows 1..i, cols 1..j; row/col 0 stay 0 so no bounds checks
    vvi p(n+1,vi(n+1,0));
    for(ll i=1;i<=n;i++){
        string s;
        cin>>s;
        for(ll j=1;j<=n;j++){
            p[i][j]=p[i-1][j]+p[i][j-1]-p[i-1][j-1]+(s[j-1]=='*');
        }
    }
    while(q--){
        ll y1,x1,y2,x2;
        cin>>y1>>x1>>y2>>x2;
        // inclusion-exclusion: remove the strip above and the strip to the left, add back the corner
        cout<<p[y2][x2]-p[y1-1][x2]-p[y2][x1-1]+p[y1-1][x1-1]<<"\n";
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
