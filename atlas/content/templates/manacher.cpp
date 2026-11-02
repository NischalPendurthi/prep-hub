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
// Longest Palindrome (CSES 1111): print a longest palindromic substring (leftmost one)
// Transform "abc" -> "@#a#b#c#$": sentinels differ, so expansion stops at the ends,
// and '#' between chars makes even palindromes odd. p[i] = palindrome length in s.
vi manacher(const string &s){
    string ms="@";
    for(char c:s)ms+="#"+string(1,c);
    ms+="#$";
    ll n=ms.size();
    vi p(n,0);
    ll l=0,r=0;
    for(ll i=1;i<n-1;i++){
        ll mirror=l+r-i;                     // mirror of i around centre (l+r)/2
        if(i<r)p[i]=min(r-i,p[mirror]);      // known part of the radius, for free
        while(ms[i+1+p[i]]==ms[i-1-p[i]])p[i]++;   // expand
        if(i+p[i]>r){l=i-p[i];r=i+p[i];}     // window reaching furthest right
    }
    return p;
}
void Solve(){
    string s;
    cin >> s;
    vi p=manacher(s);
    ll best=0,start=0;
    for(ll i=1;i+1<(ll)p.size();i++){
        ll st=(i-p[i])/2;                    // start index in the original string
        if(p[i]>best || (p[i]==best && st<start)){best=p[i];start=st;}
    }
    cout<<s.substr(start,best)<<endl;
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
