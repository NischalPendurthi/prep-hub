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
// Restaurant Customers (CSES 1619): max number of customers in the restaurant at the same time
void Solve(){
    ll n;
    cin >> n;
    vpi ev;
    for(ll i=0;i<n;i++){
        ll a,b;
        cin >> a >> b;
        ev.push_back({a,+1});              // arrival
        ev.push_back({b,-1});              // leaving
    }
    // sort by time; on a tie pair sorts -1 before +1, so a leave at time x
    // is processed before an arrival at x (half-open stays). Flip it for closed intervals.
    sort(all(ev));
    ll cur=0,best=0;
    for(auto [tm,d]:ev){
        cur+=d;
        best=max(best,cur);
    }
    cout<<best<<endl;
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
