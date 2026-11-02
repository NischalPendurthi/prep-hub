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
// Finding Periods (CSES 1733): every p such that s[i]==s[i+p] for all valid i
// z[j] = LCP of s and s[j..]
vi zFunction(const string &s){
    ll n=s.size();
    vi z(n,0);
    for(ll i=1,l=0,r=0;i<n;i++){
        if(i<r)z[i]=min(r-i,z[i-l]);       // reuse the box [l,r) that matches a prefix
        while(i+z[i]<n && s[z[i]]==s[i+z[i]])z[i]++;
        if(i+z[i]>r){l=i;r=i+z[i];}
    }
    return z;
}
void Solve(){
    string s;
    cin >> s;
    ll n=s.size();
    vi z=zFunction(s);
    // p is a period iff the suffix from p is a prefix: z[p] reaches the end
    for(ll p=1;p<n;p++)
        if(p+z[p]==n)cout<<p<<" ";
    cout<<n<<endl;                          // n itself is always a period
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
