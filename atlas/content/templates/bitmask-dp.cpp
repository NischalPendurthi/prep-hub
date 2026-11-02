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
// Elevator Rides (CSES 1653): min rides to carry n<=20 people, weight limit x per ride
void Solve(){
    ll n,x;
    cin >> n >> x;
    vi w(n);
    for(ll i=0;i<n;i++)cin>>w[i];

    // best[mask] = {rides used, weight in the current (last) ride} for the set mask, minimised lexicographically
    vpi best(1LL<<n,{LINF,0});
    best[0]={1,0};
    for(ll mask=1;mask<(1LL<<n);mask++){
        for(ll i=0;i<n;i++){
            if(!(mask>>i&1))continue;
            pi p=best[mask^(1LL<<i)];      // i is the person who entered last
            if(p.second+w[i]<=x)p.second+=w[i];
            else p={p.first+1,w[i]};       // open a new ride for i
            best[mask]=min(best[mask],p);
        }
    }
    cout<<best[(1LL<<n)-1].first<<endl;
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
