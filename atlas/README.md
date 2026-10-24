# CP Atlas

My map of competitive-programming patterns: data structure → algorithm → variant. Each variant has
recognition signals, the core idea, a tested template in my style, and the standard problems for it.
Every problem I solve gets logged under its variant with the one-line insight, and a spaced-repetition
queue brings it back before I forget it.

Part of the Prep Hub repo: run these from `atlas/`, then push the repo to deploy.

```bash
python3 tools/add.py https://codeforces.com/contest/1900/problem/C sol.cpp -v bs-on-answer -i "answer is monotone in k"
../build.sh --serve                 # preview the whole hub at http://localhost:8000/atlas/
python3 tools/verify.py             # templates compile + pass samples, every link is real
```

Needs Python 3 with PyYAML (`pip install pyyaml`) and g++ for `verify.py`.
