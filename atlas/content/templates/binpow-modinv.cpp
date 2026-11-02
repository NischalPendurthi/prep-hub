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
// Exponentiation II (CSES 1712): a^(b^c) mod 1e9+7 for n queries
// binary power: square the base, multiply it in when the exponent's low bit is set
ll modpow(ll x,ll e,ll m){
    ll res=1;
    x%=m;
    while(e>0){
        if(e&1)res=res*x%m;
        x=x*x%m;
        e>>=1;
    }
    return res;
}
// Fermat: x^(p-2) is x^-1 mod a prime p, valid only when x % p != 0
ll modInverse(ll x){
    return modpow(x,mod-2,mod);
}

void Solve(){
    ll n;
    cin >> n;
    for(ll i=0;i<n;i++){
        ll a,b,c;
        cin>>a>>b>>c;
        // a^(p-1) = 1 mod p, so the exponent lives mod p-1 (not mod p)
        ll e=modpow(b,c,mod-1);
        cout<<modpow(a,e,mod)<<"\n";
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
