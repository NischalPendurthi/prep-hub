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
// Concert Tickets (CSES 1091): each customer buys the priciest ticket <= their max, or -1
void Solve(){
    ll n,m;
    cin >> n >> m;
    multiset<ll> s;
    for(ll i=0;i<n;i++){
        ll h;
        cin >> h;
        s.insert(h);
    }
    for(ll i=0;i<m;i++){
        ll t;
        cin >> t;
        // upper_bound = first ticket > t, so the one just before it is the largest <= t
        auto it=s.upper_bound(t);          // member upper_bound: std:: one is O(n) on a set
        if(it==s.begin()){
            cout<<-1<<"\n";
            continue;
        }
        --it;
        cout<<*it<<"\n";
        s.erase(it);                       // erase the iterator, erase(value) removes every copy
    }
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
