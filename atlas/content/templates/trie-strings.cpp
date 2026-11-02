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
// Word Combinations (CSES 1731): ways to split s into dictionary words, mod 1e9+7
struct Trie{
    vector<array<ll,26>> nxt;        // nxt[v][c] = child, 0 = none (node 0 is the root)
    vector<bool> end;                // a word ends at this node
    Trie(){newNode();}
    ll newNode(){
        array<ll,26> e;
        e.fill(0);
        nxt.push_back(e);
        end.push_back(false);
        return nxt.size()-1;
    }
    void insert(const string &w){
        ll v=0;
        for(char ch:w){
            ll c=ch-'a';
            if(!nxt[v][c]){
                ll u=newNode();      // push_back may reallocate: don't hold a reference across it
                nxt[v][c]=u;
            }
            v=nxt[v][c];
        }
        end[v]=true;
    }
};
void Solve(){
    string s;
    cin >> s;
    ll k;
    cin >> k;
    Trie trie;
    for(ll i=0;i<k;i++){
        string w;
        cin>>w;
        trie.insert(w);
    }
    ll n=s.size();
    // dp[i] = ways to build s[i..]; walk the trie from i, every word end at j adds dp[j+1]
    vi dp(n+1,0);
    dp[n]=1;
    for(ll i=n-1;i>=0;i--){
        ll v=0;
        for(ll j=i;j<n;j++){
            v=trie.nxt[v][s[j]-'a'];
            if(!v)break;             // no word continues with s[i..j]
            if(trie.end[v])dp[i]=(dp[i]+dp[j+1])%mod;
        }
    }
    cout<<dp[0]<<"\n";
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
