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
// Grouping (AtCoder EDPC U): split n <= 16 rabbits into groups, maximise the sum of a[i][j] over pairs in a group
void Solve(){
    ll n;
    cin >> n;
    vvi a(n,vi(n));
    for(ll i=0;i<n;i++)for(ll j=0;j<n;j++)cin>>a[i][j];

    ll full=1LL<<n;
    // score[mask] = value of putting exactly this set in one group, built from mask minus its low bit
    vi score(full,0);
    for(ll mask=1;mask<full;mask++){
        ll i=__builtin_ctzll(mask), rest=mask&(mask-1);
        score[mask]=score[rest];
        for(ll j=0;j<n;j++)if(rest>>j&1)score[mask]+=a[i][j];
    }
    // dp[mask] = best split of mask; the group holding mask's low bit is a submask s.
    // Walking s=(s-1)&mask over all submasks of all masks costs 3^n in total
    vi dp(full,0);
    for(ll mask=1;mask<full;mask++){
        ll low=mask&-mask;
        ll best=LLONG_MIN;
        for(ll s=mask;s>0;s=(s-1)&mask){
            if(!(s&low))continue;          // fix the low bit's group, or each split is counted many times
            best=max(best,score[s]+dp[mask^s]);
        }
        dp[mask]=best;
    }
    cout<<dp[full-1]<<endl;
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
