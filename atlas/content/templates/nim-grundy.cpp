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
// Nim Game II (CSES 1098): n heaps, a move removes 1, 2 or 3 sticks from one heap
// grundy of a position = mex of the grundy values it can move to
ll mex(vi &v){
    set<ll> s(all(v));
    ll m=0;
    while(s.count(m))m++;
    return m;
}
// small table by definition; print it to find the pattern for big heaps
vi grundyTable(ll N,const vi &moves){
    vi g(N+1,0);
    for(ll x=0;x<=N;x++){
        vi nxt;
        for(ll mv:moves)if(x-mv>=0)nxt.push_back(g[x-mv]);
        g[x]=mex(nxt);
    }
    return g;
}

void Solve(){
    ll n;
    cin >> n;
    // grundyTable(20, {1,2,3}) reads 0 1 2 3 0 1 2 3 ..., so g(x) = x % 4
    ll x=0;
    for(ll i=0;i<n;i++){
        ll h;
        cin>>h;
        x^=h%4;            // Sprague-Grundy: a sum of games is the XOR of grundy values
    }
    cout<<(x?"first":"second")<<"\n";
}
int main() {
    #ifndef ONLINE_JUDGE
    freopen("../input.txt", "r", stdin);
    freopen("../output.txt", "w", stdout);
    #endif
    ios::sync_with_stdio(false);
    cin.tie(0);

    ll t=1;
    cin >> t;

    while (t--) {
        Solve();
    }
    return 0;
}
