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
// Find Median from Data Stream (LC 295), lower-median version: after each insert print the lower median
void Solve(){
    ll n;
    cin >> n;

    // lo = max-heap with the smaller half, hi = min-heap with the larger half
    // invariant: lo.size() == hi.size() or lo.size() == hi.size()+1, and lo.top() <= hi.top()
    priority_queue<ll> lo;
    priority_queue<ll,vi,greater<ll>> hi;
    for(ll i=0;i<n;i++){
        ll x;cin>>x;
        if(lo.empty() || x<=lo.top())lo.push(x);
        else hi.push(x);
        // rebalance sizes; at most one move each way
        if(lo.size()>hi.size()+1){hi.push(lo.top());lo.pop();}
        else if(hi.size()>lo.size()){lo.push(hi.top());hi.pop();}
        // lower median = lo.top(); the LC double median would be (lo.top()+hi.top())/2.0 when sizes match
        cout<<lo.top()<<" \n"[i+1==n];
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
