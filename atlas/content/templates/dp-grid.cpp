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
// Grid Paths I (CSES 1638): paths from top-left to bottom-right moving right/down, avoiding '*', mod 1e9+7
void Solve(){
    ll n;
    cin >> n;
    vector<string> g(n);
    for(ll i=0;i<n;i++)cin>>g[i];

    // dp[i][j] = number of paths from (0,0) to (i,j)
    vvi dp(n,vi(n,0));
    for(ll i=0;i<n;i++){
        for(ll j=0;j<n;j++){
            if(g[i][j]=='*'){dp[i][j]=0;continue;}   // a trap kills every path through it (even (0,0))
            if(i==0&&j==0){dp[i][j]=1;continue;}
            ll up=(i>0)?dp[i-1][j]:0;                 // came from above
            ll left=(j>0)?dp[i][j-1]:0;               // came from the left
            dp[i][j]=(up+left)%mod;
        }
    }
    cout<<dp[n-1][n-1]<<endl;
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
