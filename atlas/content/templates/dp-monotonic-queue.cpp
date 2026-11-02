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
// Pictures with Kittens (hard version) (CF 1077F2): repost exactly x pictures, every k in a row has one; max beauty
void Solve(){
    ll n,k,x;
    cin >> n >> k >> x;
    vi a(n+1);
    for(ll i=1;i<=n;i++)cin>>a[i];

    // dp[i] (for j reposts) = best sum with j reposts, the last one at i. Index 0 = virtual start.
    const ll NEG=-1e18;
    vi prv(n+1,NEG);
    prv[0]=0;
    for(ll j=1;j<=x;j++){
        vi cur(n+1,NEG);
        deque<ll> dq;   // indices of prv, values decreasing: front = max of the window
        for(ll i=1;i<=n;i++){
            // previous repost must be in [i-k, i-1], otherwise k pictures in a row are skipped
            ll in=i-1;
            while(!dq.empty() && prv[dq.back()]<=prv[in])dq.pop_back();
            dq.push_back(in);
            while(dq.front()<i-k)dq.pop_front();
            if(prv[dq.front()]!=NEG)cur[i]=prv[dq.front()]+a[i];
        }
        prv=cur;
    }
    // the last repost must be within the final k pictures
    ll ans=NEG;
    for(ll i=n-k+1;i<=n;i++)if(i>=1)ans=max(ans,prv[i]);
    cout<<(ans==NEG?-1:ans)<<endl;
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
