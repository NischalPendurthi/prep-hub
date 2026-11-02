import random, subprocess, sys

exe = sys.argv[1]
for it in range(400):
    n, m = random.randint(1, 4), random.randint(1, 8)
    w = [random.randint(1, 3) for _ in range(n)]
    d = [random.randint(1, 5) for _ in range(m)]
    # brute: tick one second at a time with a FIFO queue of waiting tasks
    free_at = [0] * n
    ans = [None] * m
    q, t, nxt = [], 0, 0
    while None in ans:
        while nxt < m and nxt <= t:
            q.append(nxt); nxt += 1
        while q:
            cand = [i for i in range(n) if free_at[i] <= t]
            if not cand: break
            s = min(cand, key=lambda i: (w[i], i))
            j = q.pop(0)
            ans[j] = s; free_at[s] = t + d[j]
        t += 1
    inp = f"{n} {m}\n{' '.join(map(str, w))}\n{' '.join(map(str, d))}\n"
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != list(map(str, ans)):
        print("mismatch", w, d, "expected", ans, "got", got)
        sys.exit(1)
