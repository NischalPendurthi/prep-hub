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
// Sliding Window Maximum (LC 239): n k, then a; print max of every window of length k
void Solve(){
    ll n,k;
    cin >> n >> k;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];

    // dq holds indices, values strictly decreasing front -> back.
    // the front is the window max; a smaller element behind a bigger, newer one can never be max again
    deque<ll> dq;
    vi ans;
    for(ll i=0;i<n;i++){
        while(!dq.empty() && a[dq.back()]<=a[i])dq.pop_back();
        dq.push_back(i);
        if(dq.front()<=i-k)dq.pop_front(); // fell out of the window (i-k+1 .. i)
        if(i>=k-1)ans.push_back(a[dq.front()]);
    }
    for(ll i=0;i<(ll)ans.size();i++)cout<<ans[i]<<" \n"[i+1==(ll)ans.size()];
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
