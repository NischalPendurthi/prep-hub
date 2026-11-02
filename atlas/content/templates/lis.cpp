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
// Increasing Subsequence (CSES 1145): length of the longest STRICTLY increasing subsequence, n <= 2e5
void Solve(){
    ll n;
    cin >> n;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];

    // tails[len-1] = smallest possible last value of an increasing subsequence of length len
    // tails stays sorted, so each element is placed by binary search
    vi tails;
    for(ll i=0;i<n;i++){
        // lower_bound: equal value replaces (strict). Use upper_bound for non-decreasing.
        auto it=lower_bound(all(tails),a[i]);
        if(it==tails.end())tails.push_back(a[i]);   // extends the longest one
        else *it=a[i];                              // same length, smaller tail: strictly better
    }
    cout<<tails.size()<<endl;
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
