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
// Subarray Sum Queries (CSES 1190): set a[k]=x, then print the max subarray sum (empty allowed)
struct Node{
    ll sum,pref,suf,best;            // best prefix / suffix / subarray, all >= 0 (empty allowed)
};
Node makeLeaf(ll v){
    ll p=max(v,0LL);
    return {v,p,p,p};
}
Node merge(const Node &L,const Node &R){
    Node res;
    res.sum=L.sum+R.sum;
    res.pref=max(L.pref,L.sum+R.pref);           // stays in L, or takes all of L
    res.suf=max(R.suf,R.sum+L.suf);
    res.best=max({L.best,R.best,L.suf+R.pref});  // the answer may cross the middle
    return res;
}
struct SGT{
    ll n;
    vector<Node> tree;
    SGT(ll n,vi &arr):n(n),tree(4*n){build(1,1,n,arr);}

    void build(ll node,ll st,ll end,vi &arr){
        if(st==end){
            tree[node]=makeLeaf(arr[st]);
            return;
        }
        ll mid=(st+end)/2;
        build(2*node,st,mid,arr);
        build(2*node+1,mid+1,end,arr);
        tree[node]=merge(tree[2*node],tree[2*node+1]);
    }

    void update(ll node,ll st,ll end,ll idx,ll val){
        if(st==end){
            tree[node]=makeLeaf(val);
            return;
        }
        ll mid=(st+end)/2;
        if(idx<=mid)update(2*node,st,mid,idx,val);
        else update(2*node+1,mid+1,end,idx,val);
        tree[node]=merge(tree[2*node],tree[2*node+1]);
    }

    // merge is not commutative: always combine left part first, right part second
    Node query(ll node,ll st,ll end,ll l,ll r){
        if(l<=st && end<=r)return tree[node];
        ll mid=(st+end)/2;
        if(r<=mid)return query(2*node,st,mid,l,r);
        if(l>mid)return query(2*node+1,mid+1,end,l,r);
        return merge(query(2*node,st,mid,l,r),query(2*node+1,mid+1,end,l,r));
    }
};
void Solve(){
    ll n,m;
    cin >> n >> m;
    vi a(n+1,0);
    for(ll i=1;i<=n;i++)cin>>a[i];
    SGT sgt(n,a);
    while(m--){
        ll k,x;
        cin>>k>>x;
        sgt.update(1,1,n,k,x);
        cout<<sgt.tree[1].best<<"\n";
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
