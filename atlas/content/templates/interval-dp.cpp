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
// Removal Game (CSES 1097): players take from either end, maximise first player's score
void Solve(){
    ll n;
    cin >> n;
    vi a(n);
    ll sum=0;
    for(ll i=0;i<n;i++){
        cin>>a[i];
        sum+=a[i];
    }

    // dp[l][r] = (score of player to move) - (score of other player) on a[l..r]
    vvi dp(n,vi(n,0));
    for(ll len=1;len<=n;len++){          // smaller ranges first
        for(ll l=0;l+len-1<n;l++){
            ll r=l+len-1;
            if(len==1)dp[l][r]=a[l];
            else dp[l][r]=max(a[l]-dp[l+1][r],a[r]-dp[l][r-1]);
        }
    }
    // first + second = sum, first - second = dp[0][n-1]
    cout<<(sum+dp[0][n-1])/2<<endl;
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
