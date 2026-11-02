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
// Finding Borders (CSES 1732): every k < n with prefix of length k == suffix of length k
// double hash mod two primes; base is random so anti-hash tests can't target it
const ll M1=1000000007,M2=998244353;
struct Hash{
    ll n;
    vi h1,h2,p1,p2;
    Hash(const string &s,ll B){
        n=s.size();
        h1.assign(n+1,0);h2.assign(n+1,0);p1.assign(n+1,1);p2.assign(n+1,1);
        for(ll i=0;i<n;i++){
            h1[i+1]=(h1[i]*B+s[i])%M1;
            h2[i+1]=(h2[i]*B+s[i])%M2;
            p1[i+1]=p1[i]*B%M1;
            p2[i+1]=p2[i]*B%M2;
        }
    }
    // hash of s[l..r) : h[r] - h[l]*B^(r-l), kept non-negative
    pi get(ll l,ll r){
        ll a=((h1[r]-h1[l]*p1[r-l])%M1+M1)%M1;
        ll b=((h2[r]-h2[l]*p2[r-l])%M2+M2)%M2;
        return {a,b};
    }
};
void Solve(){
    string s;
    cin >> s;
    ll n=s.size();
    mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());
    ll B=rng()%100000+300;            // > alphabet size
    Hash H(s,B);
    vi res;
    for(ll k=1;k<n;k++)
        if(H.get(0,k)==H.get(n-k,n))res.push_back(k);
    for(ll i=0;i<(ll)res.size();i++)cout<<res[i]<<" ";
    cout<<endl;
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
