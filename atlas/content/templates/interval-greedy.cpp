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
// Movie Festival (CSES 1629): max number of non-overlapping movies [a,b) you can watch fully
void Solve(){
    ll n;
    cin >> n;
    vpi a(n);   // stored as {end, start} so sort() orders by end
    for(ll i=0;i<n;i++)cin>>a[i].second>>a[i].first;

    // the movie that ends first leaves the most room for the rest -> take it, repeat
    sort(all(a));
    ll ans=0,last=LLONG_MIN;   // end time of the last taken movie
    for(ll i=0;i<n;i++){
        if(a[i].second>=last){ // half-open: starting exactly when the last one ends is fine
            ans++;
            last=a[i].first;
        }
    }
    cout<<ans<<endl;
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
