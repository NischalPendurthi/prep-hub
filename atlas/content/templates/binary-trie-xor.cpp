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
// Vasiliy's Multiset (CF 706D): insert / erase x, ask max of x xor y over y in the multiset
const ll BITS=30;                    // x < 2^30
struct BinTrie{
    // int, not ll: up to 31 nodes per insert, ~6e6 nodes
    vector<array<int,2>> nxt;
    vector<int> cnt;                 // how many stored numbers pass through this node
    BinTrie(){newNode();}
    int newNode(){
        nxt.push_back({0,0});
        cnt.push_back(0);
        return nxt.size()-1;
    }
    void add(ll x,ll d){             // d = +1 insert, -1 erase
        int v=0;
        cnt[v]+=d;
        for(ll b=BITS-1;b>=0;b--){
            ll c=x>>b&1;
            if(!nxt[v][c]){
                int u=newNode();
                nxt[v][c]=u;
            }
            v=nxt[v][c];
            cnt[v]+=d;
        }
    }
    // greedy from the top bit: take the opposite bit whenever a live number has it
    ll maxXor(ll x){
        int v=0;
        ll res=0;
        for(ll b=BITS-1;b>=0;b--){
            ll c=x>>b&1;
            int want=nxt[v][c^1];
            if(want && cnt[want]>0){
                res|=1LL<<b;
                v=want;
            }else v=nxt[v][c];
        }
        return res;
    }
};
void Solve(){
    ll q;
    cin >> q;
    BinTrie trie;
    trie.add(0,1);                   // the multiset always contains 0
    while(q--){
        char op;
        ll x;
        cin>>op>>x;
        if(op=='+')trie.add(x,1);
        else if(op=='-')trie.add(x,-1);
        else cout<<trie.maxXor(x)<<"\n";
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
