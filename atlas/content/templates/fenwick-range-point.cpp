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
// Range Update Queries (CSES 1651): add u to a[l..r], ask a[k]
struct BIT{
    ll n;
    vi tree;
    BIT(ll n):n(n),tree(n+2,0){}
    void update(ll i,ll val){
        for(;i<=n;i+=i&-i)tree[i]+=val;
    }
    ll query(ll i){
        ll res=0;
        for(;i>0;i-=i&-i)res+=tree[i];
        return res;
    }
};
void Solve(){
    ll n,q;
    cin >> n >> q;
    vi a(n+1,0);
    for(ll i=1;i<=n;i++)cin>>a[i];
    // BIT over the difference array: d[l]+=u, d[r+1]-=u, and a[k] = a0[k] + (d[1]+...+d[k])
    BIT bit(n);
    while(q--){
        ll type;
        cin>>type;
        if(type==1){
            ll l,r,u;
            cin>>l>>r>>u;
            bit.update(l,u);
            bit.update(r+1,-u);      // r+1 may be n+1: update() just skips it
        }else{
            ll k;
            cin>>k;
            cout<<a[k]+bit.query(k)<<"\n";
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
