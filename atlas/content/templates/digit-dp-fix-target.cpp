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
// Digit Sum Divisible (AtCoder ABC336 E): count x in [a, b] with x % digitsum(x) == 0
// The digit sum is unknown until the end, so fix it as S = 1..9*len and run one DP per S
ll memo[20][172][172];   // 9*19 = 171 is the largest digit sum; global, it is 4.7 MB
ll S;

void Solve(){
    ll a,b;
    cin >> a >> b;
    string s;

    // state: digit sum so far, value mod S so far
    function<ll(ll,ll,ll,ll)> go = [&](ll pos,ll tight,ll sum,ll r)->ll{
        if(sum>S)return 0;
        if(pos==(ll)s.size())return sum==S && r==0;
        ll rem=s.size()-pos;
        if(sum+9*rem<S)return 0;          // can't reach S any more
        ll &m=memo[rem][sum][r];
        if(!tight && m!=-1)return m;
        ll lim=tight?s[pos]-'0':9;
        ll res=0;
        for(ll d=0;d<=lim;d++){
            res+=go(pos+1,tight&&d==lim,sum+d,(r*10+d)%S);
        }
        if(!tight)m=res;
        return res;
    };
    auto f=[&](ll x)->ll{
        if(x<=0)return 0;                 // 0 has digit sum 0, never counted
        s=to_string(x);
        ll res=0;
        for(S=1;S<=9*(ll)s.size();S++){
            memset(memo,-1,sizeof(memo)); // memo depends on S
            res+=go(0,1,0,0);
        }
        return res;
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
