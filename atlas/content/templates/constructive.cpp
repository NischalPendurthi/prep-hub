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
// Permutations (CSES 1070): permutation of 1..n with no two adjacent values differing by 1
void Solve(){
    ll n;
    cin >> n;
    // small cases first: n=2,3 are impossible (checked by hand / brute)
    if(n==1){cout<<1<<endl;return;}
    if(n<=3){cout<<"NO SOLUTION"<<endl;return;}

    // evens then odds: inside each block neighbours differ by 2,
    // at the seam the last even (>=4) next to 1 differs by >=3
    vi ans;
    for(ll i=2;i<=n;i+=2)ans.push_back(i);
    for(ll i=1;i<=n;i+=2)ans.push_back(i);
    for(ll i=0;i<n;i++)cout<<ans[i]<<" \n"[i==n-1];
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
