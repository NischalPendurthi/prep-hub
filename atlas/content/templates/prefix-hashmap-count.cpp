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
// Subarray Sums II (CSES 1661): count subarrays with sum exactly x (values may be negative)
void Solve(){
    ll n,x;
    cin >> n >> x;
    // sum(l..r)=x  <=>  pre[l-1] = pre[r]-x, so count earlier prefixes equal to pre-x
    // map, not unordered_map: anti-hash tests exist for this problem
    mi cnt;
    cnt[0]=1;               // the empty prefix, so subarrays starting at index 0 count
    ll pre=0,ans=0;
    for(ll i=0;i<n;i++){
        ll a;
        cin>>a;
        pre+=a;
        auto it=cnt.find(pre-x);
        if(it!=cnt.end())ans+=it->second;
        cnt[pre]++;         // add AFTER querying, or x=0 counts the empty subarray
    }
    cout<<ans<<"\n";
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
