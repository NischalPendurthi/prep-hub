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
// Merge Intervals (LC 56), stdin: n, then n lines "l r"; print the count, then the merged intervals
void Solve(){
    ll n;
    cin >> n;
    vpi a(n);
    for(ll i=0;i<n;i++)cin>>a[i].first>>a[i].second;
    sort(all(a));                          // by start; ends in any order
    vpi res;
    for(auto [l,r]:a){
        // closed intervals: [1,3] and [3,5] touch and merge. Use < for half-open ones
        if(!res.empty() && l<=res.back().second)
            res.back().second=max(res.back().second,r);   // max: [1,10] swallows [2,3]
        else
            res.push_back({l,r});
    }
    cout<<res.size()<<"\n";
    for(auto [l,r]:res)cout<<l<<" "<<r<<"\n";
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
