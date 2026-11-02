import random, subprocess, sys

exe = sys.argv[1]
for it in range(400):
    n = random.randint(1, 12)
    p = [random.randint(1, 10) for _ in range(n)]
    # brute dp: dp[k] = best cash while holding k shares
    NEG = float("-inf")
    dp = [0] + [NEG] * n
    for x in p:
        nd = dp[:]
        for k in range(n + 1):
            if dp[k] == NEG:
                continue
            if k + 1 <= n: nd[k + 1] = max(nd[k + 1], dp[k] - x)
            if k > 0: nd[k - 1] = max(nd[k - 1], dp[k] + x)
        dp = nd
    exp = dp[0]
    got = subprocess.run([exe], input=f"{n}\n{' '.join(map(str, p))}\n", capture_output=True, text=True).stdout.split()
    if got != [str(exp)]:
        print("mismatch", p, "expected", exp, "got", got)
        sys.exit(1)
