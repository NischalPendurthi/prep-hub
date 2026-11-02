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
// Buy Low Sell High (CF 865D): each day buy one share, sell one, or do nothing; max profit
void Solve(){
    ll n;
    cin >> n;
    vi p(n);
    for(ll i=0;i<n;i++)cin>>p[i];

    // min-heap of prices we could "buy" at. Selling today at p against the cheapest c
    // earns p-c. Pushing p back lets a later day q undo it: (p-c)+(q-p) = q-c,
    // i.e. today becomes a pass-through instead of a sale (the regret move).
    priority_queue<ll,vi,greater<ll>> pq;
    ll ans=0;
    for(ll i=0;i<n;i++){
        if(!pq.empty() && pq.top()<p[i]){
            ans+=p[i]-pq.top();
            pq.pop();
            pq.push(p[i]);   // regret token: can be "re-sold" later
        }
        pq.push(p[i]);       // today is also a candidate buy day
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
