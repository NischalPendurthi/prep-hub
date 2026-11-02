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
// Money Sums (CSES 1745): all distinct sums formed by non-empty subsets of n coins (n <= 100, x_i <= 1000)
const ll MAXS=100001;
void Solve(){
    ll n;
    cin >> n;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];

    // bit s of can = "sum s is reachable"; adding coin v is one shift-or over all sums at once (/64)
    bitset<MAXS> can;
    can[0]=1;
    for(ll i=0;i<n;i++)can|=can<<a[i];

    vi sums;
    for(ll s=1;s<MAXS;s++)if(can[s])sums.push_back(s);   // skip 0: the empty subset
    cout<<sums.size()<<"\n";
    for(ll i=0;i<(ll)sums.size();i++)cout<<sums[i]<<" \n"[i+1==(ll)sums.size()];
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
