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
// Sliding Window Distinct Values (CSES 3222): number of distinct values in every window of size k
void Solve(){
    ll n,k;
    cin >> n >> k;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];
    // keep a frequency map of the window; distinct = number of keys with count>0
    mi cnt;
    ll distinct=0;
    for(ll i=0;i<n;i++){
        if(cnt[a[i]]++==0)distinct++;          // add the new right end
        if(i>=k){                              // drop a[i-k], which just left the window
            if(--cnt[a[i-k]]==0)distinct--;
        }
        if(i>=k-1)cout<<distinct<<" \n"[i==n-1];
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
