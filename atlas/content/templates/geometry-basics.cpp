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
// Point Location Test (CSES 2189): is p3 left of, right of, or on the line p1 -> p2?
struct P{ll x,y;};
P operator-(P a,P b){return {a.x-b.x,a.y-b.y};}
// cross > 0: b is counter-clockwise from a; < 0 clockwise; 0 collinear
ll cross(P a,P b){return a.x*b.y-a.y*b.x;}
// orientation of c relative to the directed line a -> b
ll orient(P a,P b,P c){
    ll v=cross(b-a,c-a);       // coords <= 1e9: each product <= 4e18, fits in ll
    return (v>0)-(v<0);
}

void Solve(){
    P a,b,c;
    cin >> a.x >> a.y >> b.x >> b.y >> c.x >> c.y;
    ll o=orient(a,b,c);
    if(o>0)cout<<"LEFT\n";
    else if(o<0)cout<<"RIGHT\n";
    else cout<<"TOUCH\n";
}
int main() {
    #ifndef ONLINE_JUDGE
    freopen("../input.txt", "r", stdin);
    freopen("../output.txt", "w", stdout);
    #endif
    ios::sync_with_stdio(false);
    cin.tie(0);

    ll t=1;
    cin >> t;

    while (t--) {
        Solve();
    }
    return 0;
}
