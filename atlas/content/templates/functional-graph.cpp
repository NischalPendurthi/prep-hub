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
// Binary lifting on a successor graph (CSES 1750 Planets Queries I): planet reached from x after k teleports
const ll LOG=30; // k <= 1e9 < 2^30
void Solve(){
    ll n,q;
    cin >> n >> q;
    vvi up(LOG,vi(n+1)); // up[j][x] = vertex reached from x after 2^j steps
    for(ll i=1;i<=n;i++)cin>>up[0][i];
    for(ll j=1;j<LOG;j++)
        for(ll x=1;x<=n;x++)
            up[j][x]=up[j-1][up[j-1][x]]; // 2^j steps = 2^(j-1) steps twice

    while(q--){
        ll x,k;cin>>x>>k;
        // decompose k into powers of two and jump once per set bit
        for(ll j=0;j<LOG;j++)
            if(k>>j&1)x=up[j][x];
        cout<<x<<"\n";
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
