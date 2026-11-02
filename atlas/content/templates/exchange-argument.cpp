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
// Tasks and Deadlines (CSES 1630): reward of a task = deadline - finish time, maximise the total
void Solve(){
    ll n;
    cin >> n;
    vpi a(n);   // {duration, deadline}
    for(ll i=0;i<n;i++)cin>>a[i].first>>a[i].second;

    // total = sum(d) - sum(finish times); deadlines don't depend on the order,
    // so only sum of finish times matters. Swapping adjacent x,y with dur[x] > dur[y]
    // lowers it by dur[x]-dur[y] -> shortest job first.
    sort(all(a));
    ll t=0,ans=0;
    for(ll i=0;i<n;i++){
        t+=a[i].first;
        ans+=a[i].second-t;
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
