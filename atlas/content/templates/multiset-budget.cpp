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
// Divide an Array Into Subarrays With Minimum Cost II (LC 3013): n k dist, then nums.
// answer = nums[0] + min over windows nums[s..s+dist] (s>=1) of the sum of the k-1 smallest
ll need,sumLow;
multiset<ll> low,high; // low = the `need` smallest of the window, high = everything else

void fix(){
    // keep |low| == need (or all of the window) and every low <= every high
    while((ll)low.size()>need){
        auto it=prev(low.end());
        sumLow-=*it;high.insert(*it);low.erase(it);
    }
    while((ll)low.size()<need && !high.empty()){
        auto it=high.begin();
        sumLow+=*it;low.insert(*it);high.erase(it);
    }
}
void add(ll x){
    low.insert(x);sumLow+=x; // insert on the low side, then push the largest out if too many
    fix();
}
void rem(ll x){
    // erase ONE copy (erase(x) would drop every duplicate)
    if(!low.empty() && x<=*low.rbegin()){low.erase(low.find(x));sumLow-=x;}
    else high.erase(high.find(x));
    fix();
}
void Solve(){
    ll n,k,dist;
    cin >> n >> k >> dist;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];

    need=k-1;sumLow=0;low.clear();high.clear();
    ll w=dist+1; // i_2..i_k lie in a window of dist+1 indices (dist <= n-2, so one always fits)
    ll best=LLONG_MAX;
    for(ll i=1;i<n;i++){
        add(a[i]);
        if(i-w>=1)rem(a[i-w]);  // window is now a[max(1,i-w+1) .. i]
        if(i>=w)best=min(best,sumLow);
    }
    cout<<a[0]+best<<endl;
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
