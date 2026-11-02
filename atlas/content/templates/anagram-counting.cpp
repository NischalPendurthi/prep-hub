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
// Anagram Search (CF 144C): count windows of s (|p| long) that can become an anagram of p; '?' is a wildcard
void Solve(){
    string s,p;
    cin >> s >> p;
    ll n=s.size(),m=p.size();
    if(m>n){cout<<0<<endl;return;}

    vi need(26,0),have(26,0);
    for(char c:p)need[c-'a']++;
    // window is good iff no letter appears MORE often than in p; '?' fill the shortfall
    auto good = [&](){
        for(ll c=0;c<26;c++)if(have[c]>need[c])return false;
        return true;
    };

    ll ans=0;
    for(ll i=0;i<n;i++){
        if(s[i]!='?')have[s[i]-'a']++;                       // char enters
        if(i>=m && s[i-m]!='?')have[s[i-m]-'a']--;           // char leaves
        if(i>=m-1 && good())ans++;
    }
    cout<<ans<<endl;
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
