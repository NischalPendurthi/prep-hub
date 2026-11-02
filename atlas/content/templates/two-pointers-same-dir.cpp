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
// Subarray Sums I (CSES 1660): count subarrays with sum exactly x, all a[i] >= 1
void Solve(){
    ll n,x;
    cin >> n >> x;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];
    // positive values: moving r right only grows the sum, so l never has to move back
    ll l=0,sum=0,ans=0;
    for(ll r=0;r<n;r++){
        sum+=a[r];
        while(sum>x){
            sum-=a[l];
            l++;
        }
        if(sum==x)ans++;
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
