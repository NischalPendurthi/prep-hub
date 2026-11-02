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
// Ferris Wheel (CSES 1090): gondolas hold <=2 children with total weight <=x; minimise gondolas
void Solve(){
    ll n,x;
    cin >> n >> x;
    vi p(n);
    for(ll i=0;i<n;i++)cin>>p[i];
    sort(all(p));
    // heaviest child p[r] always takes a gondola; pair it with the lightest if they fit.
    // if even the lightest doesn't fit, nobody does, so r rides alone.
    ll l=0,r=n-1,ans=0;
    while(l<=r){
        if(l<r && p[l]+p[r]<=x)l++;
        r--;
        ans++;
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
