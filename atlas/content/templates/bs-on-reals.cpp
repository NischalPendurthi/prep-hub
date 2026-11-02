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
// The Meeting Place Cannot Be Changed (CF 780B): min time for all friends to meet at one point
void Solve(){
    ll n;
    cin >> n;
    vi x(n),v(n);
    for(ll i=0;i<n;i++)cin>>x[i];
    for(ll i=0;i<n;i++)cin>>v[i];

    // in time T friend i covers [x-vT, x+vT]; they can meet iff all these intervals intersect
    auto ok=[&](double T)->bool{
        double L=-1e18,R=1e18;
        for(ll i=0;i<n;i++){
            L=max(L,x[i]-v[i]*T);
            R=min(R,x[i]+v[i]*T);
        }
        return L<=R;
    };
    double lo=0,hi=1e9;
    for(ll it=0;it<100;it++){             // fixed iterations, never while(hi-lo>eps)
        double mid=(lo+hi)/2;
        if(ok(mid))hi=mid;
        else lo=mid;
    }
    cout<<fixed<<setprecision(9)<<hi<<endl;
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
