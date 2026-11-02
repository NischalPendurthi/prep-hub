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
// Dice Combinations (CSES 1633): ordered ways to reach sum n with throws 1..6, mod 1e9+7
void Solve(){
    ll n;
    cin >> n;
    // dp[s] = number of throw sequences whose sum is exactly s
    vi dp(n+1,0);
    dp[0]=1;                              // empty sequence: the one way to make 0
    for(ll s=1;s<=n;s++){
        for(ll d=1;d<=6&&d<=s;d++){
            dp[s]=(dp[s]+dp[s-d])%mod;    // condition on the LAST throw d
        }
    }
    cout<<dp[n]<<endl;
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
