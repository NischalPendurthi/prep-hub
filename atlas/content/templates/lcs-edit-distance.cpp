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
// Edit Distance (CSES 1639): min insert / delete / replace to turn string a into b, |a|,|b| <= 5000
void Solve(){
    string a,b;
    cin >> a >> b;
    ll n=a.size(),m=b.size();

    // dp[i][j] = distance between a[0..i) and b[0..j); only row i-1 is needed, so keep two rows
    // (a full 5001x5001 ll table is 200 MB)
    vi prev(m+1),cur(m+1);
    for(ll j=0;j<=m;j++)prev[j]=j;                  // "" -> b[0..j): j inserts
    for(ll i=1;i<=n;i++){
        cur[0]=i;                                   // a[0..i) -> "": i deletes
        for(ll j=1;j<=m;j++){
            ll same=(a[i-1]==b[j-1])?0:1;
            cur[j]=min({prev[j]+1,                  // delete a[i-1]
                        cur[j-1]+1,                 // insert b[j-1]
                        prev[j-1]+same});           // match / replace
        }
        swap(prev,cur);
    }
    cout<<prev[m]<<endl;
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
