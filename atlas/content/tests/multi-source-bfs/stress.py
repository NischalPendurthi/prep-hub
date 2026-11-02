import random, subprocess, sys
from collections import deque

exe = sys.argv[1]
D = {"U": (-1, 0), "D": (1, 0), "L": (0, -1), "R": (0, 1)}


def bfs1(g, n, m, s):  # single-source bfs from one monster
    d = {s: 0}
    q = deque([s])
    while q:
        r, c = q.popleft()
        for dr, dc in D.values():
            v = (r + dr, c + dc)
            if 0 <= v[0] < n and 0 <= v[1] < m and g[v[0]][v[1]] != "#" and v not in d:
                d[v] = d[(r, c)] + 1
                q.append(v)
    return d


for it in range(600):
    n, m = random.randint(1, 6), random.randint(1, 6)
    g = [[random.choice(".....#M") for _ in range(m)] for _ in range(n)]
    ar, ac = random.randrange(n), random.randrange(m)
    g[ar][ac] = "A"
    # brute: min over monsters of separate bfs, then search over (cell, time) states
    md = {}
    for i in range(n):
        for j in range(m):
            if g[i][j] == "M":
                for k, v in bfs1(g, n, m, (i, j)).items():
                    md[k] = min(md.get(k, 10**9), v)
    border = lambda r, c: r in (0, n - 1) or c in (0, m - 1)
    seen = {(ar, ac, 0)}
    st = [(ar, ac, 0)]
    can = False
    while st:
        r, c, t = st.pop()
        if border(r, c):
            can = True
            break
        for dr, dc in D.values():
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < m and g[nr][nc] != "#" and t + 1 < md.get((nr, nc), 10**9) \
                    and t + 1 <= n * m and (nr, nc, t + 1) not in seen:
                seen.add((nr, nc, t + 1))
                st.append((nr, nc, t + 1))
    inp = f"{n} {m}\n" + "".join("".join(row) + "\n" for row in g)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if not can:
        ok = got == ["NO"]
    else:
        ok = False
        try:
            if got[0] == "YES":
                k = int(got[1]); path = got[2] if k > 0 else ""
                ok = len(path) == k and len(got) == (3 if k > 0 else 2)
                r, c = ar, ac
                for t, ch in enumerate(path, 1):
                    r, c = r + D[ch][0], c + D[ch][1]
                    if not (0 <= r < n and 0 <= c < m) or g[r][c] == "#" or t >= md.get((r, c), 10**9):
                        ok = False
                        break
                ok = ok and border(r, c)
        except (ValueError, IndexError, KeyError):
            ok = False
    if not ok:
        print("mismatch\n" + inp + "escape possible:", can, "got", got)
        sys.exit(1)
