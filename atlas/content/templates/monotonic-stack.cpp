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
// Sum of subarray minimums (LC 907)
void Solve(){
    ll n;
    cin >> n;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];

    // left[i]  = previous index with a <  a[i]  (-1 if none)
    // right[i] = next index     with a <= a[i]  (n if none)
    // strict on one side only -> equal values are counted once
    vi left(n,-1),right(n,n);
    vi st;
    for(ll i=0;i<n;i++){
        while(!st.empty() && a[st.back()]>=a[i]){
            right[st.back()]=i;   // a[i] is the first element <= the popped one
            st.pop_back();
        }
        if(!st.empty())left[i]=st.back();
        st.push_back(i);
    }

    // a[i] is the minimum of (i-left[i])*(right[i]-i) subarrays
    ll ans=0;
    for(ll i=0;i<n;i++){
        ll cnt=(i-left[i])*(right[i]-i)%mod;
        ans=(ans+a[i]%mod*cnt)%mod;
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
