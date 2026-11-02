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
// Digit Count in Range (LC 1067): how many times is digit d written for all x in [a, b]
// go returns {numbers completed, total occurrences}: a digit placed here occurs once per completion
pair<ll,ll> memo[20][2];
bool vis[20][2];

void Solve(){
    ll a,b,D;
    cin >> a >> b >> D;
    memset(vis,0,sizeof(vis));        // memo depends on D: reset when D changes
    string s;

    function<pi(ll,ll,ll)> go = [&](ll pos,ll tight,ll started)->pi{
        if(pos==(ll)s.size())return {1,0};
        ll rem=s.size()-pos;
        if(!tight && vis[rem][started])return memo[rem][started];
        ll lim=tight?s[pos]-'0':9;
        ll cnt=0,tot=0;
        for(ll d=0;d<=lim;d++){
            ll ns=started||d!=0;       // leading zeros are not written (matters for D=0)
            auto [c,t]=go(pos+1,tight&&d==lim,ns);
            cnt+=c;
            tot+=t+((ns && d==D)?c:0);
        }
        if(!tight)vis[rem][started]=1,memo[rem][started]={cnt,tot};
        return {cnt,tot};
    };
    auto f=[&](ll x)->ll{
        if(x<0)return 0;
        s=to_string(x);
        return go(0,1,0).second+(D==0);  // the number 0 itself is written "0" but never sets started
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
