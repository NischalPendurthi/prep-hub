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
// Counting Bits (CSES 1146): total number of one bits in the binary forms of 1..n (n <= 1e15)
void Solve(){
    ll n;
    cin >> n;
    ll ans=0;
    // bit b repeats with period 2^(b+1): 2^b zeros then 2^b ones, counting from 0
    for(ll b=0;(1LL<<b)<=n;b++){
        ll period=1LL<<(b+1), half=1LL<<b;
        ll full=(n+1)/period;              // n+1 numbers in 0..n
        ans+=full*half;
        ans+=max(0LL,(n+1)%period-half);   // ones in the last partial period
    }
    cout<<ans<<endl;
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
