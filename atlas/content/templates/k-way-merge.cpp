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
// Smallest Range Covering Elements from K Lists (LC 632): k lists (len then sorted values); print the range [a b]
void Solve(){
    ll k;
    cin >> k;
    vvi L(k);
    for(ll i=0;i<k;i++){
        ll m;cin>>m;
        L[i].resize(m);
        for(ll j=0;j<m;j++)cin>>L[i][j];
    }

    // heap holds one pointer per list (the frontier of a k-way merge): (value, list, index)
    // the current range is [heap min, max of frontier]; only advancing the min can shrink it
    priority_queue<tuple<ll,ll,ll>,vector<tuple<ll,ll,ll>>,greater<tuple<ll,ll,ll>>> pq;
    ll mx=LLONG_MIN;
    for(ll i=0;i<k;i++){
        pq.push({L[i][0],i,0});
        mx=max(mx,L[i][0]);
    }
    ll ba=LLONG_MIN/4,bb=LLONG_MAX/4;
    while(true){
        auto [v,i,j]=pq.top();pq.pop();
        if(mx-v<bb-ba){ba=v;bb=mx;} // strict: on ties keep the earlier (smaller a) range
        if(j+1==(ll)L[i].size())break; // list i exhausted: no range can cover it any more
        pq.push({L[i][j+1],i,j+1});
        mx=max(mx,L[i][j+1]);
    }
    cout<<ba<<" "<<bb<<endl;
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
