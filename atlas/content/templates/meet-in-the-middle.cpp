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
// Meet in the Middle (CSES 1628): count subsets of n <= 40 numbers with sum exactly x
void Solve(){
    ll n,x;
    cin >> n >> x;
    vi t(n);
    for(ll i=0;i<n;i++)cin>>t[i];

    // all 2^k subset sums of a[l..r), each new element doubles the list
    auto sums=[&](ll l,ll r)->vi{
        vi s={0};
        for(ll i=l;i<r;i++){
            ll sz=s.size();
            for(ll j=0;j<sz;j++)s.push_back(s[j]+t[i]);
        }
        sort(all(s));
        return s;
    };
    vi A=sums(0,n/2), B=sums(n/2,n);
    // two pointers: A ascending, B descending; count equal blocks on both sides
    ll ans=0, j=B.size()-1;
    for(ll i=0;i<(ll)A.size();){
        while(j>=0 && A[i]+B[j]>x)j--;
        if(j<0)break;
        if(A[i]+B[j]<x){i++;continue;}
        ll ca=0,cb=0,va=A[i],vb=B[j];
        while(i<(ll)A.size() && A[i]==va){i++;ca++;}
        while(j>=0 && B[j]==vb){j--;cb++;}
        ans+=ca*cb;                        // every pair from the two blocks hits x
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
