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
// Line (CF 7C): an integer point on Ax + By + C = 0, or -1
// returns g = gcd(a, b) >= 0 and sets x, y with a*x + b*y = g (a, b >= 0)
ll extgcd(ll a,ll b,ll &x,ll &y){
    if(b==0){
        x=1;y=0;
        return a;
    }
    ll x1,y1;
    ll g=extgcd(b,a%b,x1,y1);
    // b*x1 + (a%b)*y1 = g and a%b = a - (a/b)*b
    x=y1;
    y=x1-(a/b)*y1;
    return g;
}

void Solve(){
    ll A,B,C;
    cin >> A >> B >> C;
    ll x,y;
    ll g=extgcd(abs(A),abs(B),x,y);   // work on |A|, |B|, then fix the signs
    if(A<0)x=-x;
    if(B<0)y=-y;
    // A*x + B*y = g, need A*X + B*Y = -C: solvable iff g | C
    if(C%g!=0){
        cout<<-1<<endl;
        return;
    }
    ll k=-C/g;                        // |x| <= |B|, |k| <= 2e9, so the product fits
    cout<<x*k<<" "<<y*k<<endl;
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
