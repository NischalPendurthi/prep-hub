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
// Hotel Queries (CSES 1143): each group takes the FIRST hotel with >= r free rooms
struct SGT{
    ll n;
    vi arr,tree;                     // tree = max free rooms in the range
    SGT(ll n,vi arr):n(n),arr(arr),tree(4*n,0){build(1,1,n);}

    void build(ll node,ll st,ll end){
        if(st==end){
            tree[node]=arr[st];
            return;
        }
        ll mid=(st+end)/2;
        build(2*node,st,mid);
        build(2*node+1,mid+1,end);
        tree[node]=max(tree[2*node],tree[2*node+1]);
    }

    void add(ll node,ll st,ll end,ll idx,ll val){
        if(st==end){
            tree[node]+=val;
            return;
        }
        ll mid=(st+end)/2;
        if(idx<=mid)add(2*node,st,mid,idx,val);
        else add(2*node+1,mid+1,end,idx,val);
        tree[node]=max(tree[2*node],tree[2*node+1]);
    }

    // first index with value >= x, or 0. One root-to-leaf walk: O(log n)
    ll first(ll x){
        if(tree[1]<x)return 0;
        ll node=1,st=1,end=n;
        while(st<end){
            ll mid=(st+end)/2;
            if(tree[2*node]>=x){     // the left half has one, so the leftmost is there
                node=2*node;
                end=mid;
            }else{
                node=2*node+1;
                st=mid+1;
            }
        }
        return st;
    }
};
void Solve(){
    ll n,m;
    cin >> n >> m;
    vi h(n+1,0);
    for(ll i=1;i<=n;i++)cin>>h[i];
    SGT sgt(n,h);
    for(ll i=0;i<m;i++){
        ll r;
        cin>>r;
        ll idx=sgt.first(r);
        if(idx)sgt.add(1,1,n,idx,-r);
        cout<<idx<<(i+1<m?" ":"\n");
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
