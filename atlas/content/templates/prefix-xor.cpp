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
// Range Xor Queries (CSES 1650): xor of a[l..r] for q queries, 1-indexed
void Solve(){
    ll n,q;
    cin >> n >> q;
    // p[i] = a[0]^...^a[i-1]; xor is its own inverse, so p[r]^p[l-1] cancels the prefix
    vi p(n+1,0);
    for(ll i=0;i<n;i++){
        ll x;
        cin>>x;
        p[i+1]=p[i]^x;
    }
    while(q--){
        ll l,r;
        cin>>l>>r;
        cout<<(p[r]^p[l-1])<<"\n";
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
