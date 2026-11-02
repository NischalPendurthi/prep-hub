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
// Coin Combinations II (CSES 1636): number of UNORDERED ways to make sum x from coins (unlimited), mod 1e9+7
void Solve(){
    ll n,x;
    cin >> n >> x;
    vi c(n);
    for(ll i=0;i<n;i++)cin>>c[i];

    // dp[s] = ways to make s using only the coins processed so far
    vector<int> dp(x+1,0);
    dp[0]=1;
    // coins OUTER: every combination is counted once, in coin order (swap loops -> ordered count, CSES 1635)
    for(ll i=0;i<n;i++){
        // sum ASCENDING: dp[s-c[i]] may already use coin i, so it can be reused any number of times
        for(ll s=c[i];s<=x;s++){
            dp[s]+=dp[s-c[i]];
            if(dp[s]>=mod)dp[s]-=mod;
        }
    }
    cout<<dp[x]<<endl;
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
