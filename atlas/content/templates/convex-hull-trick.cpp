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
// CF 319C Kalila and Dimna in the Logging Industry
// dp[i] = min over j<i of dp[j] + b[j]*a[i]   (cut tree i completely while j is the best cut tree)
// line j: slope b[j] (decreasing), intercept dp[j]; queries a[i] increasing -> monotonic deque
struct Line{ ll m,c; ll eval(ll x){ return m*x+c; } };
// b is useless if a and c cross no later than a and b do
bool bad(Line a,Line b,Line c){
    return (__int128)(c.c-a.c)*(a.m-b.m) <= (__int128)(b.c-a.c)*(a.m-c.m);
}
void Solve(){
    ll n;
    cin >> n;
    vi a(n),b(n);
    for(ll i=0;i<n;i++)cin>>a[i];
    for(ll i=0;i<n;i++)cin>>b[i];

    vi dp(n,0);
    deque<Line> dq;
    dq.push_back({b[0],0});   // tree 1 has height 1 and the saw starts charged
    for(ll i=1;i<n;i++){
        // queries only move right, so a line beaten at the front is beaten forever
        while(dq.size()>=2 && dq[1].eval(a[i])<=dq[0].eval(a[i]))dq.pop_front();
        dp[i]=dq[0].eval(a[i]);
        Line cur={b[i],dp[i]};
        while(dq.size()>=2 && bad(dq[dq.size()-2],dq.back(),cur))dq.pop_back();
        dq.push_back(cur);
    }
    cout<<dp[n-1]<<endl;
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
