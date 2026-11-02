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
// Dynamic Range Sum Queries (CSES 1648): set a[k]=u, ask sum of a[l..r]
struct BIT{
    ll n;
    vi tree;
    BIT(ll n):n(n),tree(n+1,0){}
    void update(ll i,ll val){        // a[i]+=val, 1-indexed
        for(;i<=n;i+=i&-i)tree[i]+=val;
    }
    ll query(ll i){                  // a[1]+...+a[i]
        ll res=0;
        for(;i>0;i-=i&-i)res+=tree[i];
        return res;
    }
    ll query(ll l,ll r){return query(r)-query(l-1);}
};
void Solve(){
    ll n,q;
    cin >> n >> q;
    vi a(n+1,0);
    BIT bit(n);
    for(ll i=1;i<=n;i++){
        cin>>a[i];
        bit.update(i,a[i]);
    }
    while(q--){
        ll type;
        cin>>type;
        if(type==1){
            ll k,u;
            cin>>k>>u;
            bit.update(k,u-a[k]);    // BIT only adds, so "set" = add the difference
            a[k]=u;
        }else{
            ll l,r;
            cin>>l>>r;
            cout<<bit.query(l,r)<<"\n";
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
