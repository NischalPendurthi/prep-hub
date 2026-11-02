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
// Book Shop (CSES 1158): n books with price h and pages s, budget x, each book at most once, max pages
void Solve(){
    ll n,x;
    cin >> n >> x;
    vi h(n),s(n);
    for(ll i=0;i<n;i++)cin>>h[i];
    for(ll i=0;i<n;i++)cin>>s[i];

    // dp[c] = max pages with total price <= c, using the items processed so far
    vector<int> dp(x+1,0);                // int: 1e5 entries touched 1e8 times, keep it cache-friendly
    for(ll i=0;i<n;i++){
        // capacity DESCENDING: dp[c-h[i]] is still the value WITHOUT item i, so it's taken once
        for(ll c=x;c>=h[i];c--){
            dp[c]=max(dp[c],dp[c-h[i]]+(int)s[i]);
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
