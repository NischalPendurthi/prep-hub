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
// Prime Multiples (CSES 2185): count x in [1, n] divisible by at least one of k primes
void Solve(){
    ll n,k;
    cin >> n >> k;
    vi a(k);
    for(ll i=0;i<k;i++)cin>>a[i];
    ll ans=0;
    for(ll mask=1;mask<(1LL<<k);mask++){
        ll prod=1;
        bool over=false;
        for(ll i=0;i<k;i++){
            if(mask>>i&1){
                // prod*a[i] > n would overflow first, so test by division
                if(prod>n/a[i]){over=true;break;}
                prod*=a[i];
            }
        }
        if(over)continue;                       // n/prod = 0, adds nothing
        ll bits=__builtin_popcountll(mask);
        if(bits&1)ans+=n/prod;                  // odd-sized subsets add,
        else ans-=n/prod;                       // even-sized ones subtract
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
