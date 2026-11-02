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
// Sum of Subarray Ranges (LC 2104): sum over all subarrays of (max - min). stdin: n, then the array
void Solve(){
    ll n;
    cin >> n;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];
    // sum(max-min) = sum(max) - sum(min). a[i] is the max of (i-L[i])*(R[i]-i) subarrays,
    // where L/R are the nearest blockers. Ties: strict on the left, non-strict on the right,
    // so each subarray is credited to exactly one of its equal extremes.
    auto total=[&](bool wantMax)->ll{
        auto beats=[&](ll x,ll y){ return wantMax? x>y : x<y; };   // x strictly better than y
        vi L(n,-1),R(n,n),st;
        for(ll i=0;i<n;i++){
            // pop everything a[i] is at least as good as: they find their right blocker
            while(!st.empty() && !beats(a[st.back()],a[i])){
                R[st.back()]=i;
                st.pop_back();
            }
            if(!st.empty())L[i]=st.back();   // left blocker is strictly better
            st.push_back(i);
        }
        ll s=0;
        for(ll i=0;i<n;i++)s+=a[i]*(i-L[i])*(R[i]-i);
        return s;
    };
    cout<<total(true)-total(false)<<"\n";
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
