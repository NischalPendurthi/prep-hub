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
// Common Divisors (CSES 1081): max gcd(a_i, a_j) over pairs i < j, a_i <= 1e6
// helper for single numbers: all divisors of x in O(sqrt x), pairs (i, x/i)
vi getDivisors(ll x){
    vi d;
    for(ll i=1;i*i<=x;i++){
        if(x%i==0){
            d.push_back(i);
            if(i!=x/i)d.push_back(x/i);    // perfect square: add the root once
        }
    }
    sort(all(d));
    return d;
}

void Solve(){
    ll n;
    cin >> n;
    const ll MX=1e6;
    vi cnt(MX+1,0);
    for(ll i=0;i<n;i++){
        ll x;
        cin>>x;
        cnt[x]++;
    }
    // gcd >= d is possible iff two array elements are multiples of d
    // walking multiples of every d costs MX/1 + MX/2 + ... = O(MX log MX)
    for(ll d=MX;d>=1;d--){
        ll c=0;
        for(ll m=d;m<=MX && c<2;m+=d)c+=cnt[m];
        if(c>=2){
            cout<<d<<endl;
            return;
        }
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
