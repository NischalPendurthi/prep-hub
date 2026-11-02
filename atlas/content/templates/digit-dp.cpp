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
// Counting Numbers (CSES 2220): count x in [a, b] with no two adjacent digits equal
// memo is indexed by digits LEFT, not pos, so f(b) and f(a-1) share it
ll memo[20][2][10];

void Solve(){
    ll a,b;
    cin >> a >> b;
    memset(memo,-1,sizeof(memo));
    string s;

    // go = count ways to fill s[pos..] given the state so far
    function<ll(ll,ll,ll,ll)> go = [&](ll pos,ll tight,ll started,ll prev)->ll{
        if(pos==(ll)s.size())return 1;
        ll rem=s.size()-pos;
        ll &m=memo[rem][started][prev];
        if(!tight && m!=-1)return m;      // a tight state depends on s, never share it
        ll lim=tight?s[pos]-'0':9;
        ll res=0;
        for(ll d=0;d<=lim;d++){
            if(started && d==prev)continue;
            ll ns=started||d!=0;           // leading zeros are not real digits
            res+=go(pos+1,tight&&d==lim,ns,d);
        }
        if(!tight)m=res;
        return res;
    };
    // f(x) = count of good numbers in [0, x]
    auto f=[&](ll x)->ll{
        if(x<0)return 0;
        s=to_string(x);
        return go(0,1,0,0);
    };
    cout<<f(b)-f(a-1)<<endl;
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
