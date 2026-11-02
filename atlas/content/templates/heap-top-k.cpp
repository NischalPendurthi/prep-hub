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
// Kth Largest Element in a Stream (LC 703): n k, then n numbers; after each, print the k-th largest so far (-1 if fewer than k)
void Solve(){
    ll n,k;
    cin >> n >> k;

    // min-heap of the k largest seen: its top is the k-th largest.
    // anything smaller than the top can never come back into the top k
    priority_queue<ll,vi,greater<ll>> pq;
    for(ll i=0;i<n;i++){
        ll x;cin>>x;
        if((ll)pq.size()<k)pq.push(x);
        else if(x>pq.top()){pq.pop();pq.push(x);}
        cout<<((ll)pq.size()==k?pq.top():-1)<<" \n"[i+1==n];
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
