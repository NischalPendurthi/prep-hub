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
// Subarrays with K Different Integers (LC 992): count subarrays with EXACTLY k distinct values.
// stdin: n k, then the array
void Solve(){
    ll n,k;
    cin >> n >> k;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];
    // "at most m distinct" is monotone (shrinking keeps it true), so a window counts it.
    // every r adds r-l+1 subarrays: all valid ones that END at r.
    auto atMost=[&](ll m)->ll{
        if(m<0)return 0;
        mi cnt;
        ll l=0,distinct=0,res=0;
        for(ll r=0;r<n;r++){
            if(cnt[a[r]]++==0)distinct++;
            while(distinct>m){
                if(--cnt[a[l]]==0)distinct--;
                l++;
            }
            res+=r-l+1;
        }
        return res;
    };
    // exactly k is NOT monotone, but it is the difference of two monotone counts
    cout<<atMost(k)-atMost(k-1)<<"\n";
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
