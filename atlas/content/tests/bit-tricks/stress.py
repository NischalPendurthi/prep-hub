import random, subprocess, sys


def brute(inp):
    n = int(inp)
    return str(sum(bin(i).count("1") for i in range(1, n + 1)))


if __name__ == "__main__":
    for it in range(400):
        n = random.choice([random.randint(1, 70), random.randint(1, 3000), 2 ** random.randint(0, 11) + random.choice([-1, 0, 1])])
        n = max(n, 1)
        inp = f"{n}\n"
        exp = brute(inp).split()
        got = subprocess.run([sys.argv[1]], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch", n, "expected", exp, "got", got)
            sys.exit(1)
