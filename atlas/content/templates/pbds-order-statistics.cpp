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
// Josephus Problem II (CSES 2163): n k; children 1..n in a circle, skip k and remove the next; print the removal order
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace __gnu_pbds;
// ordered set: find_by_order(i) = iterator to the i-th smallest (0-based), order_of_key(x) = #elements < x
// for a multiset store pairs (value, unique id) since this tree drops duplicates
typedef tree<ll,null_type,less<ll>,rb_tree_tag,tree_order_statistics_node_update> ordered_set;

void Solve(){
    ll n,k;
    cin >> n >> k;
    ordered_set s;
    for(ll i=1;i<=n;i++)s.insert(i);

    // pos = rank (0-based) of the child we are standing on; after an erase, the same rank is the next child
    ll pos=0;
    vi res;
    while(!s.empty()){
        pos=(pos+k)%(ll)s.size(); // k can be huge: reduce by the current size
        auto it=s.find_by_order(pos);
        res.push_back(*it);
        s.erase(it);
    }
    for(ll i=0;i<n;i++)cout<<res[i]<<" \n"[i+1==n];
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
