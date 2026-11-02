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
// Ilya and Escalator (CF 518D): n people queue, each second the front one enters w.p. p; expected count on it after t s
void Solve(){
    ll n,t;
    double p;
    cin >> n >> p >> t;

    // dp[j] = probability that exactly j people have entered after the current second
    vector<double> dp(n+1,0.0);
    dp[0]=1;
    for(ll s=0;s<t;s++){
        vector<double> nd(n+1,0.0);
        for(ll j=0;j<=n;j++){
            if(dp[j]==0)continue;
            if(j==n){nd[n]+=dp[j];continue;}   // queue empty, nothing changes
            nd[j+1]+=dp[j]*p;
            nd[j]+=dp[j]*(1-p);
        }
        dp=nd;
    }
    // linearity: E[count] = sum j * P(count = j)
    double ans=0;
    for(ll j=0;j<=n;j++)ans+=j*dp[j];
    cout<<fixed<<setprecision(9)<<ans<<endl;
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
