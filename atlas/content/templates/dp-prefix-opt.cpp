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
// Candies (AtCoder EDPC M): ways to give K candies to N children, child i gets 0..a[i], mod 1e9+7
void Solve(){
    ll n,k;
    cin >> n >> k;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];

    // dp[j] = ways to hand out exactly j candies to the children seen so far
    vi dp(k+1,0);
    dp[0]=1;
    for(ll i=0;i<n;i++){
        // nd[j] = dp[j-a[i]] + ... + dp[j]: a window sum, so take it from prefix sums in O(1)
        vi pre(k+2,0);
        for(ll j=0;j<=k;j++)pre[j+1]=(pre[j]+dp[j])%mod;
        vi nd(k+1,0);
        for(ll j=0;j<=k;j++){
            ll lo=max(0LL,j-a[i]);
            nd[j]=(pre[j+1]-pre[lo]+mod)%mod;
        }
        dp=nd;
    }
    cout<<dp[k]<<endl;
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
