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
// Playlist (CSES 1141): longest subarray with all values distinct
void Solve(){
    ll n;
    cin >> n;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];
    // invariant: a[l..r] has no duplicates. Grow r, shrink l until the invariant holds again.
    mi cnt;
    ll l=0,best=0;
    for(ll r=0;r<n;r++){
        cnt[a[r]]++;
        while(cnt[a[r]]>1){     // only a[r] can be duplicated, since the window was valid before
            cnt[a[l]]--;
            l++;
        }
        best=max(best,r-l+1);
    }
    cout<<best<<"\n";
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
