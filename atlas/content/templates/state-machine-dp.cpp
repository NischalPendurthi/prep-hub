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
// Vacations (CF 698A): each day rest / contest / gym, never the same activity twice in a row; min rest days
void Solve(){
    ll n;
    cin >> n;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];

    // state = what you did today: 0 rest, 1 contest, 2 gym. dp[s] = min rests so far ending in s
    const ll BIG=1e9;
    vi dp={0,BIG,BIG};
    for(ll i=0;i<n;i++){
        vi nd(3,BIG);
        ll best=min({dp[0],dp[1],dp[2]});
        nd[0]=best+1;                                  // rest is always allowed
        if(a[i]&1)nd[1]=min(dp[0],dp[2]);              // contest open today (a=1 or 3)
        if(a[i]&2)nd[2]=min(dp[0],dp[1]);              // gym open today (a=2 or 3)
        dp=nd;
    }
    cout<<min({dp[0],dp[1],dp[2]})<<endl;
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
