import random, subprocess, sys

exe = sys.argv[1]
names = ["Ann", "bob", "Cy"]
foods = ["Ceviche", "Beef", "beef", "Water", "Fried", "Z9", "a"]
for it in range(300):
    n = random.randint(1, 15)
    orders = [(random.choice(names), random.choice([1, 2, 3, 10, 11, 100, 500]), random.choice(foods)) for _ in range(n)]
    fs = sorted({f for _, _, f in orders})  # Python sorts strings by code point, same as std::string
    tables = sorted({t for _, t, _ in orders})
    lines = [",".join(["Table"] + fs)]
    for t in tables:
        lines.append(",".join([str(t)] + [str(sum(1 for _, tt, f in orders if tt == t and f == x)) for x in fs]))
    inp = f"{n}\n" + "".join(f"{a} {b} {c}\n" for a, b, c in orders)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != lines:
        print("mismatch", orders, "expected", lines, "got", got)
        sys.exit(1)
