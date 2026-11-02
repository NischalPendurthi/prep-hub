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
// Longest Regular Bracket Sequence (CF 5C): length of the longest balanced substring and how many there are
void Solve(){
    string s;
    cin >> s;
    ll n=s.size();

    // stack holds indices of unmatched characters; -1 is a sentinel "last unmatched ')'"
    // so after a match, i - st.back() is the length of the balanced block ending at i
    vi st;
    st.push_back(-1);
    ll best=0,cnt=1; // "0 1" when there is no balanced substring
    for(ll i=0;i<n;i++){
        if(s[i]=='('){
            st.push_back(i);
            continue;
        }
        st.pop_back();
        if(st.empty()){
            st.push_back(i); // unmatched ')': new left wall
            continue;
        }
        ll len=i-st.back();
        if(len>best){best=len;cnt=1;}
        else if(len==best)cnt++;
    }
    cout<<best<<" "<<cnt<<endl;
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
