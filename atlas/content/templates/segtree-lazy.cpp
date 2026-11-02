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
// XOR on Segment (CF 242E): xor x onto a[l..r], ask sum of a[l..r]
// each node keeps, per bit, how many elements in its range have that bit set
const ll B=20;                       // a[i], x < 2^20
struct SGT{
    ll n;
    vi arr;
    vvi tree;
    vi lazy;                         // xor still owed to the children
    SGT(ll n,vi arr):n(n),arr(arr),tree(4*n,vi(B,0)),lazy(4*n,0){build(1,1,n);}

    vi merge(const vi &left,const vi &right){
        vi res(B,0);
        for(ll b=0;b<B;b++)res[b]=left[b]+right[b];
        return res;
    }

    void build(ll node,ll st,ll end){
        if(st==end){
            for(ll b=0;b<B;b++)tree[node][b]=(arr[st]>>b&1);
            return;
        }
        ll mid=(st+end)/2;
        build(2*node,st,mid);
        build(2*node+1,mid+1,end);
        tree[node]=merge(tree[2*node],tree[2*node+1]);
    }

    // xor the whole range of node by x: every set bit of x flips its count
    void apply(ll node,ll st,ll end,ll x){
        ll len=end-st+1;
        for(ll b=0;b<B;b++){
            if(x>>b&1)tree[node][b]=len-tree[node][b];
        }
        lazy[node]^=x;               // xors compose by xor
    }

    void push(ll node,ll st,ll end){
        if(lazy[node]==0)return;
        ll mid=(st+end)/2;
        apply(2*node,st,mid,lazy[node]);
        apply(2*node+1,mid+1,end,lazy[node]);
        lazy[node]=0;
    }

    void update(ll l,ll r,ll x){update(1,1,n,l,r,x);}
    void update(ll node,ll st,ll end,ll l,ll r,ll x){
        if(st>r || end<l)return;
        if(l<=st && end<=r){
            apply(node,st,end,x);
            return;
        }
        push(node,st,end);           // children must be current before we recurse and re-merge
        ll mid=(st+end)/2;
        update(2*node,st,mid,l,r,x);
        update(2*node+1,mid+1,end,l,r,x);
        tree[node]=merge(tree[2*node],tree[2*node+1]);
    }

    ll query(ll l,ll r){
        vi bit=query(1,1,n,l,r);
        ll res=0;
        for(ll b=0;b<B;b++)res+=(bit[b]<<b);
        return res;
    }
    vi query(ll node,ll st,ll end,ll l,ll r){
        if(st>r || end<l)return vi(B,0);
        if(l<=st && end<=r)return tree[node];
        push(node,st,end);
        ll mid=(st+end)/2;
        return merge(query(2*node,st,mid,l,r),query(2*node+1,mid+1,end,l,r));
    }
};
void Solve(){
    ll n;
    cin >> n;
    vi a(n+1,0);
    for(ll i=1;i<=n;i++)cin>>a[i];
    SGT sgt(n,a);
    ll m;
    cin >> m;
    while(m--){
        ll type,l,r;
        cin>>type>>l>>r;
        if(type==1)cout<<sgt.query(l,r)<<"\n";
        else{
            ll x;
            cin>>x;
            sgt.update(l,r,x);
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
