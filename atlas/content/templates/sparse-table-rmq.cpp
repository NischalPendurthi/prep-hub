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
// Static Range Minimum Queries (CSES 1647): no updates, O(1) per query
struct Sparse{
    ll n,LOG;
    vvi sp;                          // sp[j][i] = min of a[i .. i+2^j-1]
    vi lg;
    Sparse(vi &a):n(a.size()){
        lg.assign(n+1,0);
        for(ll i=2;i<=n;i++)lg[i]=lg[i/2]+1;
        LOG=lg[n]+1;
        sp.assign(LOG,vi(n));
        sp[0]=a;
        for(ll j=1;j<LOG;j++){
            for(ll i=0;i+(1LL<<j)<=n;i++){
                sp[j][i]=min(sp[j-1][i],sp[j-1][i+(1LL<<(j-1))]);
            }
        }
    }
    // two blocks of length 2^k cover [l, r]; overlap is fine because min is idempotent
    ll query(ll l,ll r){             // 0-indexed, inclusive
        ll k=lg[r-l+1];
        return min(sp[k][l],sp[k][r-(1LL<<k)+1]);
    }
};
void Solve(){
    ll n,q;
    cin >> n >> q;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];
    Sparse st(a);
    while(q--){
        ll l,r;
        cin>>l>>r;
        cout<<st.query(l-1,r-1)<<"\n";
    }
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
