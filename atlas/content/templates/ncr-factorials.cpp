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
// Binomial Coefficients (CSES 1079): n queries of C(a, b) mod 1e9+7, a, b <= 1e6
ll modpow(ll x,ll e){
    ll res=1;
    x%=mod;
    while(e>0){
        if(e&1)res=res*x%mod;
        x=x*x%mod;
        e>>=1;
    }
    return res;
}

vi fact,invfact;
void init_fact(ll N){
    fact.assign(N+1,1);
    invfact.assign(N+1,1);
    for(ll i=1;i<=N;i++)fact[i]=fact[i-1]*i%mod;
    // one inverse by Fermat, then walk down: 1/(i-1)! = i * 1/i!
    invfact[N]=modpow(fact[N],mod-2);
    for(ll i=N;i>0;i--)invfact[i-1]=invfact[i]*i%mod;
}
ll nck(ll n,ll k){
    if(k<0||k>n)return 0;            // out of range is 0 ways, not 1
    return fact[n]*(invfact[k]*invfact[n-k]%mod)%mod;
}

void Solve(){
    init_fact(1000000);
    ll n;
    cin >> n;
    for(ll i=0;i<n;i++){
        ll a,b;
        cin>>a>>b;
        cout<<nck(a,b)<<"\n";
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
