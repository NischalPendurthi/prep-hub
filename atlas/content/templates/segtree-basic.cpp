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
// Dynamic Range Minimum Queries (CSES 1649): set a[k]=u, ask min of a[l..r]
struct SGT{
    ll n;
    vi arr,tree;
    SGT(ll n,vi arr):n(n),arr(arr),tree(4*n,LINF){build(1,1,n);}

    ll merge(ll left,ll right){return min(left,right);}   // swap for sum / max / gcd

    void build(ll node,ll st,ll end){
        if(st==end){
            tree[node]=arr[st];
            return;
        }
        ll mid=(st+end)/2;
        build(2*node,st,mid);
        build(2*node+1,mid+1,end);
        tree[node]=merge(tree[2*node],tree[2*node+1]);
    }

    void update(ll idx,ll val){update(1,1,n,idx,val);}
    void update(ll node,ll st,ll end,ll idx,ll val){
        if(st==end){
            tree[node]=val;
            return;
        }
        ll mid=(st+end)/2;
        if(idx<=mid)update(2*node,st,mid,idx,val);
        else update(2*node+1,mid+1,end,idx,val);
        tree[node]=merge(tree[2*node],tree[2*node+1]);
    }

    ll query(ll l,ll r){return query(1,1,n,l,r);}
    ll query(ll node,ll st,ll end,ll l,ll r){
        if(st>r || end<l)return LINF;                  // identity of min
        if(l<=st && end<=r)return tree[node];
        ll mid=(st+end)/2;
        return merge(query(2*node,st,mid,l,r),query(2*node+1,mid+1,end,l,r));
    }
};
void Solve(){
    ll n,q;
    cin >> n >> q;
    vi a(n+1,0);
    for(ll i=1;i<=n;i++)cin>>a[i];
    SGT sgt(n,a);
    while(q--){
        ll type;
        cin>>type;
        if(type==1){
            ll k,u;
            cin>>k>>u;
            sgt.update(k,u);
        }else{
            ll l,r;
            cin>>l>>r;
            cout<<sgt.query(l,r)<<"\n";
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
