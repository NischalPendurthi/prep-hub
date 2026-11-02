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
// Karen and Coffee (CF 816B): n recipes [l,r]; a temp is admissible if >=k recipes cover it;
// each query [a,b] asks how many admissible temps lie in it
void Solve(){
    ll n,k,q;
    cin >> n >> k >> q;
    const ll M=200002;
    // diff[l]++, diff[r+1]--: prefix sum of diff = how many recipes cover t
    vi diff(M+1,0);
    for(ll i=0;i<n;i++){
        ll l,r;
        cin>>l>>r;
        diff[l]++;
        diff[r+1]--;
    }
    // second prefix pass: good[t] = number of admissible temps in [1,t]
    vi good(M+1,0);
    ll cover=0;
    for(ll t=1;t<=M;t++){
        cover+=diff[t];
        good[t]=good[t-1]+(cover>=k);
    }
    while(q--){
        ll a,b;
        cin>>a>>b;
        cout<<good[b]-good[a-1]<<"\n";
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
