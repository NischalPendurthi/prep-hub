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
// Single-Threaded CPU (LC 1834): n tasks (enqueueTime processingTime); print the order the CPU runs them (0-based)
void Solve(){
    ll n;
    cin >> n;
    vi en(n),pr(n);
    for(ll i=0;i<n;i++)cin>>en[i]>>pr[i];

    // sweep tasks by arrival; the heap holds the ones that have arrived, keyed by (processing, index)
    vi ord(n);
    iota(all(ord),0);
    sort(all(ord),[&](ll a,ll b){return en[a]<en[b];});
    priority_queue<pi,vpi,greater<pi>> ready;
    ll time=0,p=0;
    vi res;
    while((ll)res.size()<n){
        // CPU idle with nothing ready: jump the clock to the next arrival instead of ticking
        if(ready.empty() && time<en[ord[p]])time=en[ord[p]];
        while(p<n && en[ord[p]]<=time){ready.push({pr[ord[p]],ord[p]});p++;}
        auto [d,id]=ready.top();ready.pop();
        time+=d;
        res.push_back(id);
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
