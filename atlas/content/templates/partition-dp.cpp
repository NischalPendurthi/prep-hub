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
// Minimum Difficulty of a Job Schedule (LC 1335), stdin "n d" then n values:
// cut the array into exactly d non-empty segments, minimise the sum of segment maxima (-1 if d > n)
void Solve(){
    ll n,d;
    cin >> n >> d;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];
    if(d>n){cout<<-1<<endl;return;}

    const ll BIG=LLONG_MAX/4;
    // dp[k][i] = best cost to split the first i elements into exactly k segments
    vvi dp(d+1,vi(n+1,BIG));
    dp[0][0]=0;
    for(ll k=1;k<=d;k++){
        for(ll i=k;i<=n;i++){                       // need at least k elements for k segments
            ll mx=0;
            // last segment is a[j..i-1]; walk j leftwards so its max updates in O(1)
            for(ll j=i-1;j>=k-1;j--){
                mx=max(mx,a[j]);
                if(dp[k-1][j]<BIG)dp[k][i]=min(dp[k][i],dp[k-1][j]+mx);
            }
        }
    }
    cout<<dp[d][n]<<endl;
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
