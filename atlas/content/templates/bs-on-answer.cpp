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
// Factory Machines (CSES 1620): min time T so that machines k_i make at least t products
void Solve(){
    ll n,t;
    cin >> n >> t;
    vi k(n);
    for(ll i=0;i<n;i++)cin>>k[i];

    // ok(T) is monotone: more time never makes fewer products
    auto ok=[&](ll T)->bool{
        ll made=0;
        for(ll i=0;i<n;i++){
            made+=T/k[i];
            if(made>=t)return true;       // stop early, the sum can overflow ll
        }
        return false;
    };
    ll lo=1,hi=*min_element(all(k))*t;    // the fastest machine alone is always enough
    while(lo<hi){                          // find the first T with ok(T)
        ll mid=lo+(hi-lo)/2;
        if(ok(mid))hi=mid;
        else lo=mid+1;
    }
    cout<<lo<<endl;
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
