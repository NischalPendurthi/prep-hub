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
// Display Table of Food Orders in a Restaurant (LC 1418)
// input: n, then n lines "customer table food" (single-word names)
// output: header "Table" + foods sorted by name, then one row per table (numeric order) with counts
void Solve(){
    ll n;
    cin >> n;
    map<ll,map<string,ll>> cnt;   // table -> food -> count ; map keeps tables numerically sorted
    set<string> foods;            // sorted by string, which is what the header needs
    for(ll i=0;i<n;i++){
        string name,food;ll tb;
        cin>>name>>tb>>food;      // customer name is ignored
        cnt[tb][food]++;
        foods.insert(food);
    }

    cout<<"Table";
    for(auto &f:foods)cout<<","<<f;
    cout<<"\n";
    for(auto &[tb,mp]:cnt){
        cout<<tb;
        // every column for every row, 0 when missing (mp.count avoids inserting keys)
        for(auto &f:foods)cout<<","<<(mp.count(f)?mp[f]:0);
        cout<<"\n";
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
