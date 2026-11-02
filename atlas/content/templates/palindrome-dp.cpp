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
// Queries for Number of Palindromes (CF 245H): count palindromic substrings inside s[l..r]
void Solve(){
    string s;
    cin >> s;
    ll n=s.size();
    // n=5000: n*n ll tables are 200MB each, so int/char here (counts fit in int)
    vector<vector<char>> pal(n,vector<char>(n,0));
    vector<vector<int>> cnt(n,vector<int>(n,0));
    for(ll len=1;len<=n;len++){              // shorter intervals first
        for(ll l=0;l+len-1<n;l++){
            ll r=l+len-1;
            // ends match and the inside is a palindrome (empty / single char counts)
            pal[l][r]= s[l]==s[r] && (len<=2 || pal[l+1][r-1]);
            if(len==1){cnt[l][r]=1;continue;}
            // inclusion-exclusion over [l+1,r] and [l,r-1], plus s[l..r] itself
            cnt[l][r]=cnt[l+1][r]+cnt[l][r-1]-(len>2?cnt[l+1][r-1]:0)+pal[l][r];
        }
    }
    ll q;cin>>q;
    while(q--){
        ll l,r;cin>>l>>r;
        cout<<cnt[l-1][r-1]<<"\n";
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
