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
// Holes (CF 13E): ball jumps i -> i+a[i] until it leaves; set a[i], or ask last hole + jump count
void Solve(){
    ll n,m;
    cin >> n >> m;
    vi a(n);
    for(ll i=0;i<n;i++)cin>>a[i];
    ll B=max(1LL,(ll)sqrt(n));       // block size
    // per position, summary of the jumps that stay inside its own block:
    // nxt = first position outside the block, cnt = jumps to get there, last = last hole inside
    vi nxt(n),cnt(n),last(n);
    auto calc=[&](ll i){
        ll j=i+a[i];
        if(j>=n || j/B!=i/B){
            nxt[i]=j;
            cnt[i]=1;
            last[i]=i;
        }else{                       // j > i in the same block: already computed
            nxt[i]=nxt[j];
            cnt[i]=cnt[j]+1;
            last[i]=last[j];
        }
    };
    for(ll i=n-1;i>=0;i--)calc(i);
    while(m--){
        ll type;
        cin>>type;
        if(type==0){
            ll p,b;
            cin>>p>>b;
            p--;
            a[p]=b;
            // only positions <= p in p's block can change: rebuild them right to left, O(B)
            for(ll i=p;i>=(p/B)*B;i--)calc(i);
        }else{
            ll p;
            cin>>p;
            p--;
            ll total=0,lst=p;
            while(p<n){              // O(n/B) blocks
                total+=cnt[p];
                lst=last[p];
                p=nxt[p];
            }
            cout<<lst+1<<" "<<total<<"\n";
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
