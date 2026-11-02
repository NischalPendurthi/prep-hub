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
// List Removals (CSES 1749): repeatedly remove and print the p-th remaining element
struct BIT{
    ll n,LOG;
    vi tree;
    BIT(ll n):n(n),tree(n+1,0){
        LOG=1;
        while(LOG*2<=n)LOG*=2;       // highest power of two <= n
    }
    void update(ll i,ll val){
        for(;i<=n;i+=i&-i)tree[i]+=val;
    }
    // smallest i with a[1]+...+a[i] >= k (all a[i] >= 0)
    ll kth(ll k){
        ll pos=0;
        for(ll pw=LOG;pw>0;pw>>=1){
            // tree[pos+pw] = sum of (pos, pos+pw]; jump if it still stays below k
            if(pos+pw<=n && tree[pos+pw]<k){
                pos+=pw;
                k-=tree[pos];
            }
        }
        return pos+1;
    }
};
void Solve(){
    ll n;
    cin >> n;
    vi x(n+1);
    for(ll i=1;i<=n;i++)cin>>x[i];
    BIT bit(n);
    for(ll i=1;i<=n;i++)bit.update(i,1);   // 1 = still in the list
    for(ll i=0;i<n;i++){
        ll p;
        cin>>p;
        ll idx=bit.kth(p);
        cout<<x[idx]<<(i+1<n?" ":"\n");
        bit.update(idx,-1);
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
