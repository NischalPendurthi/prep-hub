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
// String Matching (CSES 1753): number of occurrences of pattern t in text s
// pf[i] = length of longest proper prefix of t that is also a suffix of t[0..i]
vi prefixFunction(const string &t){
    ll m=t.size();
    vi pf(m,0);
    for(ll i=1;i<m;i++){
        ll j=pf[i-1];
        while(j>0 && t[i]!=t[j])j=pf[j-1];   // fall back along the border chain
        if(t[i]==t[j])j++;
        pf[i]=j;
    }
    return pf;
}
void Solve(){
    string s,t;
    cin >> s >> t;
    ll m=t.size();
    // '#' is in neither string, so no border can cross it and pf <= m everywhere
    vi pf=prefixFunction(t+"#"+s);
    ll cnt=0;
    for(ll i=2*m;i<(ll)pf.size();i++)
        if(pf[i]==m)cnt++;                 // a match of t ends at s[i-2m]
    cout<<cnt<<endl;
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
