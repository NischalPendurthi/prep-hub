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
// CSES 2085 Monster Game II
// dp[i] = min over j<i of dp[j] + s[i]*f[j]  (f[0] = x), but s and f are in any order now.
// Li Chao tree over the query range [1, 1e6]: insert any line, ask min at any point.
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
struct LiChao{
    ll lo,hi;
    vector<Line> t;   // t[node] = the line that wins at this node's midpoint
    LiChao(ll lo,ll hi):lo(lo),hi(hi),t(4*(hi-lo+1),{0,LLONG_MAX/4}){}
    void insert(Line ln,ll node,ll l,ll r){
        ll mid=(l+r)/2;
        bool lef=ln.eval(l)<t[node].eval(l), mi=ln.eval(mid)<t[node].eval(mid);
        if(mi)swap(t[node],ln);   // keep the midpoint winner here
        if(l==r)return;
        // the loser can only win on the side where it was still better at the end
        if(lef!=mi)insert(ln,2*node,l,mid);
        else insert(ln,2*node+1,mid+1,r);
    }
    ll query(ll x,ll node,ll l,ll r){
        ll res=t[node].eval(x);
        if(l==r)return res;
        ll mid=(l+r)/2;
        if(x<=mid)return min(res,query(x,2*node,l,mid));
        return min(res,query(x,2*node+1,mid+1,r));
    }
    void insert(Line ln){ insert(ln,1,lo,hi); }
    ll query(ll x){ return query(x,1,lo,hi); }
};
void Solve(){
    ll n,x;
    cin >> n >> x;
    vi s(n),f(n);
    for(ll i=0;i<n;i++)cin>>s[i];
    for(ll i=0;i<n;i++)cin>>f[i];

    LiChao lc(1,1000000);
    lc.insert({x,0});
    ll dp=0;
    for(ll i=0;i<n;i++){
        dp=lc.query(s[i]);
        lc.insert({f[i],dp});
    }
    cout<<dp<<endl;
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
