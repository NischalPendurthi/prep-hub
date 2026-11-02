import random, subprocess, sys

exe = sys.argv[1]
for it in range(300):
    n, m = random.randint(1, 6), random.randint(1, 6)
    g = [[random.randint(-9, 99) for _ in range(m)] for _ in range(n)]
    # brute: walk and turn right when the next cell is outside or already seen
    seen = [[0] * m for _ in range(n)]
    dr, dc = [0, 1, 0, -1], [1, 0, -1, 0]
    r = c = d = 0
    out = []
    for _ in range(n * m):
        out.append(g[r][c]); seen[r][c] = 1
        nr, nc = r + dr[d], c + dc[d]
        if not (0 <= nr < n and 0 <= nc < m) or seen[nr][nc]:
            d = (d + 1) % 4
            nr, nc = r + dr[d], c + dc[d]
        r, c = nr, nc
    inp = f"{n} {m}\n" + "".join(" ".join(map(str, row)) + "\n" for row in g)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != list(map(str, out)):
        print("mismatch", g, "expected", out, "got", got)
        sys.exit(1)
