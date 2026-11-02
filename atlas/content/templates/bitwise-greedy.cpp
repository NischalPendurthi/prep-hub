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
// Maximum AND (CF 1721D): reorder b to maximise AND of (a_i xor b_i)
void Solve(){
    ll n;
    cin >> n;
    vi a(n),b(n);
    for(ll i=0;i<n;i++)cin>>a[i];
    for(ll i=0;i<n;i++)cin>>b[i];

    // can every bit of `want` be 1 in all a_i^b_i? Only if a pairing exists with
    // a_i & want == ~b_i & want, i.e. the two multisets of masked values are equal
    auto ok=[&](ll want)->bool{
        vi x(n),y(n);
        for(ll i=0;i<n;i++){
            x[i]=a[i]&want;
            y[i]=(~b[i])&want;
        }
        sort(all(x));
        sort(all(y));
        return x==y;
    };
    ll ans=0;
    for(ll bit=29;bit>=0;bit--){           // high bit first: it beats all lower bits together
        if(ok(ans|(1LL<<bit)))ans|=1LL<<bit;   // keep earlier bits fixed while testing this one
    }
    cout<<ans<<"\n";
}
int main() {
    #ifndef ONLINE_JUDGE
    freopen("../input.txt", "r", stdin);
    freopen("../output.txt", "w", stdout);
    #endif
    ios::sync_with_stdio(false);
    cin.tie(0);

    ll t=1;
    cin >> t;

    while (t--) {
        Solve();
    }
    return 0;
}
