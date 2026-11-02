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
// Counting Divisors (CSES 1713): n queries, number of divisors of x <= 1e6
const ll MAX_N=1e6+5;
vi spf(MAX_N);

void sieveSPF(){
    for(ll i=0;i<MAX_N;i++)spf[i]=i;
    for(ll i=2;i*i<MAX_N;i++){
        if(spf[i]==i){                     // i is prime
            for(ll j=i*i;j<MAX_N;j+=i){    // smaller multiples already have a smaller factor
                if(spf[j]==j)spf[j]=i;
            }
        }
    }
}
// x = prod p^e in O(log x): keep dividing by the smallest prime factor
map<ll,ll> primeFactorization(ll x){
    map<ll,ll> f;
    while(x>1){
        f[spf[x]]++;
        x/=spf[x];
    }
    return f;
}

void Solve(){
    sieveSPF();
    ll n;
    cin >> n;
    for(ll i=0;i<n;i++){
        ll x;
        cin>>x;
        ll d=1;
        for(auto [p,e]:primeFactorization(x))d*=e+1;   // pick each exponent 0..e
        cout<<d<<"\n";
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
