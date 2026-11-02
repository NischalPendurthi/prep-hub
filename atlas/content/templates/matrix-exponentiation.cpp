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
// Throwing Dice (CSES 1096): ways to get sum n (n <= 1e18) with dice rolls, mod 1e9+7
typedef vector<vi> Mat;
Mat mul(const Mat &A,const Mat &B){
    ll n=A.size(),m=B[0].size(),K=B.size();
    Mat C(n,vi(m,0));
    for(ll i=0;i<n;i++)
        for(ll k=0;k<K;k++){
            if(A[i][k]==0)continue;
            for(ll j=0;j<m;j++)C[i][j]=(C[i][j]+A[i][k]*B[k][j])%mod;
        }
    return C;
}
Mat matpow(Mat A,ll e){
    ll n=A.size();
    Mat R(n,vi(n,0));
    for(ll i=0;i<n;i++)R[i][i]=1;      // identity
    while(e>0){
        if(e&1)R=mul(R,A);
        A=mul(A,A);
        e>>=1;
    }
    return R;
}

void Solve(){
    ll n;
    cin >> n;
    // state v_i = (f(i), f(i-1), ..., f(i-5)), f(i) = f(i-1) + ... + f(i-6), f(0) = 1
    Mat T(6,vi(6,0));
    for(ll j=0;j<6;j++)T[0][j]=1;      // new f = sum of the last six
    for(ll i=1;i<6;i++)T[i][i-1]=1;    // shift the window down
    // v_0 = (1, 0, 0, 0, 0, 0) (f of negatives is 0), so f(n) = (T^n)[0][0]
    Mat P=matpow(T,n);
    cout<<P[0][0]<<endl;
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
