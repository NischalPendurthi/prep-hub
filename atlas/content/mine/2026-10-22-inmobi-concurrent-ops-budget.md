---
title: Max Concurrent Operations Under a Budget
url: ''
platform: OA
rating: 1850
date: '2026-10-22'
variants:
- multiset-budget
- sweep-line-events
tags:
- InMobi OA
- IIT Guwahati
insight: 'The max is reached at some start time. Sweep events (ends before starts, since end is exclusive) and keep two multisets: chosen = cheapest ops whose sum ≤ B, rest = the others. Answer = max chosen.size().'
mistakes: rest.erase(c) deletes ALL copies, so use rest.erase(rest.find(c)). Use prev(chosen.end()), not rbegin(), to erase the max. Skip ops with start >= end or the delete hits end().
star: true
status: solved
---

```cpp
void Solve(){
    ll n,b;
    cin >> n >> b;

    // {time, type, cost} ; type 0 = end, 1 = start -> ends come first at same time
    vector<array<ll,3>> ev;
    for(ll i=0;i<n;i++){
        ll st,en,c;cin>>st>>en>>c;
        if(st>=en)continue; // empty interval [st,en) -> never active
        ev.push_back({st,1,c});
        ev.push_back({en,0,c});
    }
    sort(all(ev));

    // chosen = cheapest ops that fit in budget, rest = everything else
    // invariant: every element of chosen <= every element of rest
    multiset<ll> chosen,rest;
    ll sum=0;

    auto fix = [&](){
        while(!chosen.empty() && sum>b){
            auto it=prev(chosen.end());
            sum-=*it;
            rest.insert(*it);
            chosen.erase(it);
        }
        while(!rest.empty() && sum+*rest.begin()<=b){
            sum+=*rest.begin();
            chosen.insert(*rest.begin());
            rest.erase(rest.begin());
        }
    };

    ll ans=0;
    for(auto [t,type,c]:ev){
        if(type==1){
            if(!chosen.empty() && c<*chosen.rbegin()){
                chosen.insert(c);
                sum+=c;
            }
            else rest.insert(c);
        }
        else{
            auto it=chosen.find(c);
            if(it!=chosen.end()){
                sum-=c;
                chosen.erase(it);
            }
            else rest.erase(rest.find(c));
        }
        fix();
        ans=max(ans,(ll)chosen.size());
    }
    cout<<ans<<endl;
}
```
