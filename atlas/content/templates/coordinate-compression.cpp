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
// Salary Queries (CSES 1144): point updates "! k x", count salaries in [a,b] with "? a b"
struct BIT {
    ll n;
    vi tree;
    BIT(ll n) : n(n), tree(n + 1, 0) {}
    void update(ll i, ll val) {
        for (; i <= n; i += i & (-i)) tree[i] += val;
    }
    ll query(ll i) {                       // sum over [1, i]
        ll res = 0;
        for (; i > 0; i -= i & (-i)) res += tree[i];
        return res;
    }
};

void Solve(){
    ll n,q;
    cin >> n >> q;
    vi p(n);
    for(ll i=0;i<n;i++)cin>>p[i];
    // read every query first: values set later must be in the compressed set too
    vector<char> typ(q);
    vi qa(q),qb(q);
    vi vals(all(p));
    for(ll i=0;i<q;i++){
        cin >> typ[i] >> qa[i] >> qb[i];
        if(typ[i]=='!')vals.push_back(qb[i]);
    }
    sort(all(vals));
    vals.erase(unique(all(vals)),vals.end());
    // 1-based rank for the BIT
    auto id=[&](ll v)->ll{return lower_bound(all(vals),v)-vals.begin()+1;};

    BIT bit(vals.size());
    for(ll i=0;i<n;i++)bit.update(id(p[i]),1);
    for(ll i=0;i<q;i++){
        if(typ[i]=='!'){
            ll k=qa[i]-1;
            bit.update(id(p[k]),-1);
            p[k]=qb[i];
            bit.update(id(p[k]),1);
        }else{
            // query bounds need not be in vals: map [a,b] to ranks with lower/upper bound
            ll l=lower_bound(all(vals),qa[i])-vals.begin();      // ranks 1..l are < a
            ll r=upper_bound(all(vals),qb[i])-vals.begin();      // ranks 1..r are <= b
            cout<<bit.query(r)-bit.query(l)<<"\n";
        }
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
