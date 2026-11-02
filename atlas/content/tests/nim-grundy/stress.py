import random, subprocess, sys
from functools import lru_cache

exe = sys.argv[1]

@lru_cache(None)
def win(s):  # brute game search on the sorted heap tuple
    for i, h in enumerate(s):
        for t in (1, 2, 3):
            if h >= t and not win(tuple(sorted(s[:i] + (h - t,) + s[i + 1:]))):
                return True
    return False

for it in range(100):
    tests = [[random.randint(0, 9) for _ in range(random.randint(1, 4))] for _ in range(random.randint(1, 6))]
    inp = f"{len(tests)}\n" + "".join(f"{len(h)}\n{' '.join(map(str, h))}\n" for h in tests)
    exp = ["first" if win(tuple(sorted(h))) else "second" for h in tests]
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != exp:
        print("mismatch", tests, "expected", exp, "got", got)
        sys.exit(1)
