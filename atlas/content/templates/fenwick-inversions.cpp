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
// Shift and Inversions (AtCoder ABC190 F): inversions of every cyclic shift of a permutation of 0..n-1
struct BIT{
    ll n;
    vi tree;
    BIT(ll n):n(n),tree(n+1,0){}
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
    ll n;
    cin >> n;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];
    // left to right: inversions ending at i = earlier values greater than a[i]
    BIT bit(n);
    ll inv=0;
    for(ll i=0;i<n;i++){
        ll v=a[i]+1;                 // values are 0-based, BIT is 1-based
        inv+=i-bit.query(v);         // seen so far minus those <= a[i]
        bit.update(v,1);
    }
    // moving the front value x to the back: loses x pairs (smaller after it), gains n-1-x
    for(ll k=0;k<n;k++){
        cout<<inv<<"\n";
        inv+=(n-1-a[k])-a[k];
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
