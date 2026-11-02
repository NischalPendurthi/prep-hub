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
// Process Tasks Using Servers (LC 1882): task j arrives at second j and goes to the free
// server with the smallest (weight, index); if none is free, wait for the earliest one.
// input: n m, n weights, m durations. output: server index for every task
void Solve(){
    ll n,m;
    cin >> n >> m;
    vi w(n),d(m);
    for(ll i=0;i<n;i++)cin>>w[i];
    for(ll j=0;j<m;j++)cin>>d[j];

    priority_queue<pi,vpi,greater<pi>> freeS;                 // {weight, index}
    priority_queue<array<ll,3>,vector<array<ll,3>>,greater<array<ll,3>>> busy; // {free time, weight, index}
    for(ll i=0;i<n;i++)freeS.push({w[i],i});

    ll t=0;
    vi ans(m);
    for(ll j=0;j<m;j++){
        t=max(t,j);                        // time never goes back; task j exists from second j
        if(freeS.empty())t=max(t,busy.top()[0]); // nobody free: jump to the next release
        // release EVERY server done by now before choosing (ties go by weight, not finish time)
        while(!busy.empty() && busy.top()[0]<=t){
            auto [ft,ww,id]=busy.top();busy.pop();
            freeS.push({ww,id});
        }
        auto [ww,id]=freeS.top();freeS.pop();
        ans[j]=id;
        busy.push({t+d[j],ww,id});
    }
    for(ll j=0;j<m;j++)cout<<ans[j]<<" \n"[j==m-1];
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
