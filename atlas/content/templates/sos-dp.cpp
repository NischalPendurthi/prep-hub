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
// SOS Bit Problem (CSES 1654): for each x count y with x|y==x, x&y==x, x&y!=0
const ll B=20;
void Solve(){
    ll n;
    cin >> n;
    vi a(n);
    vi sub(1LL<<B,0),sup(1LL<<B,0);
    for(ll i=0;i<n;i++){
        cin>>a[i];
        sub[a[i]]++;
        sup[a[i]]++;
    }

    // after bit b, sub[m] counts the a[i] that are submasks of m and differ from m only in bits 0..b
    for(ll b=0;b<B;b++){
        for(ll m=0;m<(1LL<<B);m++){
            if(m>>b&1)sub[m]+=sub[m^(1LL<<b)];  // y is a submask of x
            else sup[m]+=sup[m|(1LL<<b)];       // y is a supermask of x
        }
    }
    ll full=(1LL<<B)-1;
    for(ll i=0;i<n;i++){
        // x&y==0  <=>  y is a submask of ~x
        cout<<sub[a[i]]<<" "<<sup[a[i]]<<" "<<n-sub[full^a[i]]<<"\n";
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
