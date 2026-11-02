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
// Book Shop II (CSES 1159): book i has price h, pages s and k copies; budget x; max pages
void Solve(){
    ll n,x;
    cin >> n >> x;
    vi h(n),s(n),k(n);
    for(ll i=0;i<n;i++)cin>>h[i];
    for(ll i=0;i<n;i++)cin>>s[i];
    for(ll i=0;i<n;i++)cin>>k[i];

    // binary splitting: k copies -> bundles 1,2,4,...,rest. Any count 0..k is a subset of bundles.
    vpi items;                            // {price, pages} of one bundle
    for(ll i=0;i<n;i++){
        ll left=k[i];
        for(ll b=1;left>0;b*=2){
            ll take=min(b,left);
            items.push_back({take*h[i],take*s[i]});
            left-=take;
        }
    }

    // then it's plain 0/1 knapsack over the bundles
    vector<int> dp(x+1,0);
    for(auto [w,v]:items){
        for(ll c=x;c>=w;c--){
            dp[c]=max(dp[c],dp[c-w]+(int)v);
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
