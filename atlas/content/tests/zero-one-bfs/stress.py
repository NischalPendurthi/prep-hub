import random, subprocess, sys

exe = sys.argv[1]
for it in range(500):
    n, m = random.randint(1, 6), random.randint(1, 6)
    g = [[random.choice("...*") for _ in range(m)] for _ in range(n)]
    r0, c0 = random.randrange(n), random.randrange(m)
    g[r0][c0] = "."
    x, y = random.choice([0, 1, 2, 3, 6]), random.choice([0, 1, 2, 3, 6])
    # brute: search over (cell, lefts used, rights used) with both budgets enforced
    seen = {(r0, c0, 0, 0)}
    st = [(r0, c0, 0, 0)]
    while st:
        r, c, l, rr = st.pop()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            nl, nrr = l + (dc == -1), rr + (dc == 1)
            if 0 <= nr < n and 0 <= nc < m and g[nr][nc] == "." and nl <= x and nrr <= y \
                    and (nr, nc, nl, nrr) not in seen:
                seen.add((nr, nc, nl, nrr))
                st.append((nr, nc, nl, nrr))
    exp = len({(r, c) for r, c, _, _ in seen})
    inp = f"{n} {m}\n{r0 + 1} {c0 + 1}\n{x} {y}\n" + "".join("".join(row) + "\n" for row in g)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != [str(exp)]:
        print("mismatch\n" + inp + "expected", exp, "got", got)
        sys.exit(1)
