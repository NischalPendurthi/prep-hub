import subprocess, sys
from itertools import permutations

# output isn't unique, so: brute decides if an answer exists, then we validate the program's answer
exe = sys.argv[1]
for n in range(1, 60):
    if n <= 8:
        exists = any(all(abs(p[i] - p[i + 1]) != 1 for i in range(n - 1)) for p in permutations(range(1, n + 1)))
    else:
        exists = True  # brute shows every n >= 4 works; checking validity below is the real test
    got = subprocess.run([exe], input=f"{n}\n", capture_output=True, text=True).stdout.split()
    if not exists:
        if got != ["NO", "SOLUTION"]:
            print("n", n, "expected NO SOLUTION, got", got); sys.exit(1)
        continue
    try:
        p = list(map(int, got))
    except ValueError:
        print("n", n, "expected a permutation, got", got); sys.exit(1)
    if sorted(p) != list(range(1, n + 1)) or any(abs(p[i] - p[i + 1]) == 1 for i in range(n - 1)):
        print("n", n, "invalid answer", got); sys.exit(1)
