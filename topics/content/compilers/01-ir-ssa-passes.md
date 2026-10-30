---
title: IRs, SSA and optimisation passes
part: Part A · The classic compiler
lede: A compiler spends most of its effort on an intermediate representation that is easy to analyse. This chapter covers the phases of a compiler, three-address code, control-flow graphs, dominators and SSA form, then builds constant folding, dead code elimination, common subexpression elimination, liveness analysis and graph-colouring register allocation as small programs you can run and explain.
desc: phases, three-address code, CFG, dominators, SSA and phi, folding, DCE, CSE, inlining, liveness, register colouring
hours: 5
prereqs: C++ or Python, graphs and BFS/DFS, what a CPU register is
---

## Compiler phases {#ch01-phases .th}

A compiler is a pipeline of translations. The **front end** reads source text and checks it: the lexer produces tokens, the parser builds a syntax tree, and semantic analysis resolves names and types. It then emits an **intermediate representation** (IR). The **middle end** rewrites the IR to make it better without changing what it computes. The **back end** selects machine instructions, schedules them, assigns registers and writes the object file.

The IR is what makes this economical. With M source languages and N target machines, a shared IR means writing M front ends and N back ends, which is far less work than M × N separate compilers. All optimisations written against the IR benefit every language and target.

## Three-address code and the CFG {#ch01-tac .th}

**Three-address code** (TAC) is an IR in which each instruction does one operation and has at most three operands, as in `t1 = a + b`. Nested expressions become a sequence of steps with temporaries, so `x = (a + b) * c` becomes `t1 = a + b` then `x = t1 * c`. Every intermediate value now has a name that an analysis can talk about.

A **basic block** is a straight run of instructions with one entry at the top and one exit at the bottom. If the first instruction runs, all of them run. A **control-flow graph** (CFG) has basic blocks as nodes and possible jumps as edges. To find blocks, mark the *leaders*: the first instruction, every jump target, and every instruction right after a jump. Each block runs from a leader up to the next leader.

```python run=cc-c01-cfg
PROG = """
    i = 0
    s = 0
L1: if i >= n goto L2
    s = s + i
    i = i + 1
    goto L1
L2: return s
""".strip("\n").splitlines()

labels = {}
code = []
for pc, line in enumerate(PROG):
    head, sep, rest = line.partition(":")
    if sep:
        labels[head.strip()] = pc
    code.append((rest if sep else line).strip())

is_jump = lambda s: s.startswith(("goto", "if", "return"))
leaders = {0} | set(labels.values())
leaders |= {pc + 1 for pc, s in enumerate(code) if is_jump(s) and pc + 1 < len(code)}
starts = sorted(leaders)
block_of = {pc: b for b, pc in enumerate(starts)}

for b, start in enumerate(starts):
    end = starts[b + 1] if b + 1 < len(starts) else len(code)
    last = code[end - 1]
    succ = []
    if "goto" in last:
        succ.append(block_of[labels[last.split()[-1]]])
    if not last.startswith(("goto", "return")) and end < len(code):
        succ.append(block_of[end])
    print(f"B{b}: {code[start:end]} -> {['B%d' % s for s in succ]}")
```

The output has four blocks, with `B2` jumping back to `B1`. That back edge is the loop.

## Dominators and where phis go {#ch01-dom .th}

Block A **dominates** block B if every path from the entry to B passes through A. Every block dominates itself. The **immediate dominator** (idom) of B is the closest strict dominator, and these links form the dominator tree. Compilers use dominators to find loops (an edge whose target dominates its source is a back edge) and to check that a definition is available at a use.

The **dominance frontier** of A is the set of blocks where A's dominance stops: A dominates a predecessor of the block, but does not strictly dominate the block itself. This is where two different definitions can first meet, which is exactly where SSA needs a merge. The program below computes dominators with the standard iterative dataflow algorithm, then places phis for a variable `x` assigned in `entry` and `b`.

```python run=cc-c01-dom
CFG = {"entry": ["a"], "a": ["b", "c"], "b": ["d"], "c": ["d"], "d": ["a", "exit"], "exit": []}
preds = {n: [p for p in CFG if n in CFG[p]] for n in CFG}

dom = {n: set(CFG) for n in CFG}
dom["entry"] = {"entry"}
changed = True
while changed:
    changed = False
    for n in CFG:
        if n == "entry":
            continue
        new = {n} | set.intersection(*(dom[p] for p in preds[n]))
        if new != dom[n]:
            dom[n], changed = new, True

idom = {}
for n in CFG:
    strict = dom[n] - {n}
    for d in strict:
        if all(o in dom[d] for o in strict):
            idom[n] = d

df = {n: set() for n in CFG}
for n in CFG:
    if len(preds[n]) >= 2:
        for p in preds[n]:
            r = p
            while r != idom[n]:
                df[r].add(n)
                r = idom[r]

for n in CFG:
    print(f"{n:6} idom={idom.get(n, '-'):6} DF={sorted(df[n])}")

work, phis = ["entry", "b"], set()
while work:
    for f in df[work.pop()]:
        if f not in phis:
            phis.add(f)
            work.append(f)
print("phi for x at:", sorted(phis))
```

`x` is defined in `b`, so the frontier of `b` gives a phi at `d`. A phi is itself a new definition, so the frontier of `d` gives another at `a`. This is why the placement uses the *iterated* dominance frontier.

## SSA form and phi nodes {#ch01-ssa .th}

In **static single assignment** form, each variable has exactly one assignment in the program text. Each new assignment gets a new version, so `x = 1; x = x + 1` becomes `x1 = 1; x2 = x1 + 1`. Every use has one definition you can point to, and that makes many analyses simple: "is this value a constant?" only needs a look at its one definition.

Control flow creates a problem when two branches assign the same variable. SSA resolves it with a **phi node** at the join, which selects a value according to the edge the program arrived on:

```text
if (c) x = 1; else x = 2;        then:  x1 = 1          else:  x2 = 2
y = x + 1;                       join:  x3 = phi(x1 from then, x2 from else)
                                        y1 = x3 + 1
```

A phi is not a real instruction. No CPU has one, so the back end removes phis by placing copies on the incoming edges or letting register allocation give the versions one register. All phis in a block conceptually run at once, on block entry.

Construction has two steps: place phis at the iterated dominance frontier of each variable's definitions, then walk the dominator tree and rename each variable to its current version. **Pruned SSA** also skips phis for variables that are dead at the join. The Chapter 2 LLVM samples show phis in a real IR.

:::trap
"Single assignment" refers to the text of the program. In a loop, `i2 = i1 + 1` runs many times and produces a different value each time. The static single definition is what SSA guarantees.
:::

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 220" role="img" aria-label="A diamond control-flow graph where two branches define x1 and x2 and a phi node in the join block selects between them">
  <rect x="270" y="14" width="180" height="40" rx="8" class="d-box"/><text x="360" y="39" text-anchor="middle" class="t-mono">if c</text>
  <rect x="90" y="88" width="180" height="40" rx="8" class="d-soft"/><text x="180" y="113" text-anchor="middle" class="t-mono">x1 = 1</text>
  <rect x="450" y="88" width="180" height="40" rx="8" class="d-soft"/><text x="540" y="113" text-anchor="middle" class="t-mono">x2 = 2</text>
  <rect x="220" y="160" width="280" height="50" rx="8" class="d-acc"/><text x="360" y="181" text-anchor="middle" class="t-mono">x3 = phi(x1, x2)</text><text x="360" y="200" text-anchor="middle" class="t-mono">y1 = x3 + 1</text>
  <path d="M300 54 L 200 88" class="d-line"/><path d="M420 54 L 520 88" class="d-line"/>
  <path d="M180 128 L 290 160" class="d-line"/><path d="M540 128 L 430 160" class="d-line"/>
</svg></div><figcaption><b>A phi merges by incoming edge.</b> Each block's versions have one definition each. The join is in the dominance frontier of both branches, so the phi goes there.</figcaption></figure>

## Constant folding, DCE, CSE and inlining {#ch01-passes .th}

**Constant folding** evaluates operations whose inputs are known at compile time. **Constant propagation** replaces uses of a known variable with its value. They feed each other, so implementations usually do both. **Dead code elimination** (DCE) deletes instructions whose result is never used and which have no side effect. It works backward from what must be kept, such as returns, stores and calls that may do I/O.

```python run=cc-c01-fold-dce
OPS = {"+": lambda a, b: a + b, "-": lambda a, b: a - b, "*": lambda a, b: a * b}
is_const = lambda v: isinstance(v, int)

def show(code):
    return [f"{d} = {a} {op} {b}" if op in OPS else f"{op} {a}" for d, op, a, b in code]

def fold(code):
    known, out = {}, []
    for dest, op, a, b in code:
        a, b = known.get(a, a), known.get(b, b)
        if op in OPS and is_const(a) and is_const(b):
            known[dest] = OPS[op](a, b)
        elif op == "*" and 0 in (a, b):     # valid for integers only
            known[dest] = 0
        elif op == "+" and b == 0:
            known[dest] = a
        else:
            out.append((dest, op, a, b))
    return out

def dce(code):
    live, out = set(), []
    for dest, op, a, b in reversed(code):
        if op in OPS and dest not in live:
            continue                        # result unused, no side effect
        live |= {v for v in (a, b) if isinstance(v, str)}
        out.append((dest, op, a, b))
    return out[::-1]

CODE = [("a", "+", 2, 2), ("b", "*", "a", 3), ("c", "*", "x", "b"), ("d", "-", "a", 4),
        ("e", "*", "d", "y"), ("f", "+", "c", "e"), ("g", "*", "x", "y"), ("h", "+", "g", 1),
        (None, "ret", "f", None)]
folded = fold(CODE)
clean = dce(folded)
print(len(CODE), show(CODE))
print(len(folded), show(folded))
print(len(clean), show(clean))
```

Follow `e`. `d = 4 - 4` folds to 0, so `e = 0 * y` folds to 0, and `f = c + 0` becomes a copy of `c`, so the return uses `c` directly. Folding alone leaves `g` and `h` behind, since they are not constant. DCE removes them because `h` is unused, which in turn leaves `g` unused. One backward sweep catches this chain.

**Common subexpression elimination** (CSE) reuses a value that has already been computed. Within one block the usual algorithm is **local value numbering**: give each distinct value a number and look up `(op, number of left, number of right)` in a table. Because numbers track values, reassigning a variable invalidates old matches automatically.

```python run=cc-c01-lvn
COMMUTATIVE = {"+", "*"}

def lvn(code):
    num = {}            # variable -> value number
    table = {}          # (op, n1, n2) -> (value number, variable holding it)
    next_n = [0]
    def number(v):
        if v not in num:
            num[v] = next_n[0]; next_n[0] += 1
        return num[v]
    out = []
    for dest, op, a, b in code:
        key = (number(a), number(b))
        if op in COMMUTATIVE:
            key = tuple(sorted(key))
        key = (op, *key)
        hit = table.get(key)
        if hit and num.get(hit[1]) == hit[0]:     # holder still has that value
            num[dest] = hit[0]
            out.append(f"{dest} = {hit[1]}")
        else:
            num[dest] = next_n[0]; next_n[0] += 1
            table[key] = (num[dest], dest)
            out.append(f"{dest} = {a} {op} {b}")
    return out

print(lvn([("t1", "+", "b", "c"), ("t2", "+", "c", "b"), ("t3", "-", "b", "c"),
           ("b", "*", "t1", "t1"), ("t4", "+", "b", "c"), ("t5", "*", "t2", "t1")]))
```

`t2` reuses `t1` even though the operands are swapped, because `+` commutes. `t3` stays because `-` does not. After `b` is reassigned, `t4 = b + c` has a new value number and stays. `t5` reuses `b` because `t2` and `t1` share a value number.

**Inlining** replaces a call with a copy of the callee, with the parameters substituted. The direct saving is the call overhead. The larger benefit is that folding, DCE and CSE can now see through the call: `square(3)` becomes `3 * 3`, then `9`. The cost is code size, which can hurt the instruction cache, so compilers use a size-and-benefit heuristic. Recursive functions and calls through unknown pointers cannot be inlined in the plain way.

:::trap
Folding must match the semantics of the target. Integer folds have to use the program's width and overflow rules. Division by zero must stay as run-time behaviour. `x * 0 → 0` is legal for integers and illegal for IEEE floats, which the drills show.
:::

## Liveness and register allocation {#ch01-regalloc .th}

A variable is **live** at a point if its current value may be read later. Liveness is a backward dataflow problem. For each block, `use` is the set of variables read before being written, and `def` is the set written:

`out[B] = union of in[S] for successors S` and `in[B] = use[B] ∪ (out[B] − def[B])`.

Iterate until nothing changes. The sets only grow, and they are bounded, so this terminates. Two variables **interfere** if one is live where the other is defined, which means they cannot share a register. Register allocation then becomes colouring the interference graph with k colours for k registers. Chaitin's method simplifies the graph: a node with fewer than k neighbours can always be coloured later, so remove it and push it on a stack. If every node has at least k neighbours, choose a spill candidate, remove it optimistically, and carry on. Then pop the stack and give each node the lowest free colour.

```python run=cc-c01-regalloc
# (defined variable or None, [used variables])
BLOCKS = {
    "B0": ([("a", []), ("b", [])], ["B1"]),
    "B1": ([("c", ["a", "b"]), (None, ["c"])], ["B2", "B3"]),
    "B2": ([("a", ["a", "c"])], ["B1"]),
    "B3": ([("d", ["c", "b"]), (None, ["d"])], []),
}
live_in = {b: set() for b in BLOCKS}
live_out = {b: set() for b in BLOCKS}
changed = True
while changed:
    changed = False
    for b in reversed(BLOCKS):
        code, succ = BLOCKS[b]
        out = set().union(*(live_in[s] for s in succ)) if succ else set()
        live = set(out)
        for d, uses in reversed(code):
            live.discard(d)
            live |= set(uses)
        if live != live_in[b] or out != live_out[b]:
            live_in[b], live_out[b], changed = live, out, True
for b in BLOCKS:
    print(b, "in", sorted(live_in[b]), "out", sorted(live_out[b]))

edges = set()
for b, (code, _) in BLOCKS.items():
    live = set(live_out[b])
    for d, uses in reversed(code):
        if d:
            edges |= {tuple(sorted((d, o))) for o in live if o != d}
            live.discard(d)
        live |= set(uses)
print("interference:", sorted(edges))

def colour(k):
    nodes = {v for b in BLOCKS.values() for d, u in b[0] for v in ([d] if d else []) + u}
    adj = {n: {y if x == n else x for x, y in edges if n in (x, y)} for n in nodes}
    left, stack = set(nodes), []
    while left:
        degree = lambda n: len(adj[n] & left)
        easy = sorted(n for n in left if degree(n) < k)
        n = easy[0] if easy else max(sorted(left), key=degree)  # spill candidate
        stack.append(n)
        left.remove(n)
    regs, spilled = {}, []
    for n in reversed(stack):
        used = {regs[m] for m in adj[n] if m in regs}
        free = [r for r in range(k) if r not in used]
        if free:
            regs[n] = free[0]
        else:
            spilled.append(n)
    return dict(sorted(regs.items())), spilled

print("k=3", colour(3))
print("k=2", colour(2))
```

`a`, `b` and `c` are all live together in the loop, so they form a triangle and need three registers. With `k=2`, one must spill. Spilling means storing the value to the stack after its definition and loading it before each use, which splits it into short ranges. The allocator then rebuilds the graph and tries again. `d` interferes with nothing because nothing is live after it, so it can share a register.

Graph colouring is NP-complete in general, which is why these allocators are heuristics. Real allocators add **coalescing**, which merges the two sides of a copy when they do not interfere, so the copy disappears. JIT compilers often use the faster **linear scan**, and LLVM's default allocator for optimised code, called greedy, works with live-range splitting and priorities instead of the classic stack algorithm. A useful fact for follow-ups: the interference graph of a program in SSA form is chordal, and chordal graphs can be coloured optimally in polynomial time.

## Drills {#ch01-drills .dr}

:::drill concept
Why does a compiler use an IR at all? Give two reasons.
---
**Answer.** It splits M languages and N targets into M front ends plus N back ends, and it gives optimisations one simple form to work on.

**Why.** Syntax trees carry source details and machine code carries target details. A form such as SSA TAC makes each value and each control-flow edge explicit, so a pass does not need to know C++ or x86.
:::

:::drill tricky
In a loop, `i2 = i1 + 1` runs a thousand times. Does that violate SSA?
---
**Answer.** No. SSA requires a single assignment in the program text. Dynamically, `i2` takes many values.

**Why.** The loop header has `i1 = phi(0 from preheader, i2 from body)`, which selects the initial value on the first entry and the updated value after that.
:::

:::drill concept
Why are phi nodes needed, and how do they disappear before machine code?
---
**Answer.** They name the merged value at a join, where a use could see different definitions. They are lowered to copies on incoming edges, which are often removed by coalescing.

**Why.** Copies on a *critical edge* (from a block with several successors to a block with several predecessors) would run on other paths too, so compilers split such an edge by inserting a new block.
:::

:::drill output
What does this print? Think about IEEE 754 rules.

```python run=cc-c01-d-float
nan, inf = float("nan"), float("inf")
print(nan * 0.0, inf * 0.0, -1.0 * 0.0)
print(0.1 + 0.2 - 0.2 == 0.1, (0.1 + 0.2) + 0.3 == 0.1 + (0.2 + 0.3))
```
---
**Answer.** `x * 0.0` gives NaN for NaN and infinity, and `-0.0` for a negative `x`. Neither of the last two comparisons holds for these values, as the output shows.

**Why.** This is why `x * 0 → 0` and reassociation are illegal for floats unless you opt in with flags like `-ffast-math`. Vectorising a float sum needs reassociation, so `-O2` alone may leave it scalar.
:::

:::drill bug
This DCE removes too much. Find the bug.

```python run=cc-c01-d-dce-bug
def dce(code):
    live, out = {"ret"}, []
    for dest, op, a, b in reversed(code):
        if dest in live:
            live |= {a, b}
            out.append((dest, op, a, b))
    return out[::-1]

print(dce([("x", "add", "p", "q"), (None, "store", "x", "addr"), ("ret", "add", "p", "q")]))
```
---
**Answer.** It only keeps instructions whose destination is live, so the `store` has `dest=None` and is deleted. Then `x` looks unused and goes too.

**Why.** Instructions with side effects (stores, volatile access, I/O calls) are roots of liveness. Fix: `if dest in live or op in SIDE_EFFECTS`.
:::

:::drill concept
Why is liveness computed backward and "reaching definitions" forward?
---
**Answer.** Liveness asks about *future* reads, so information flows from uses back to earlier points. Reaching definitions asks which *past* writes can arrive here, so information flows forward.

**Why.** Both fit the same dataflow framework: a transfer function per block, a merge at joins (union in both of these), and iteration to a fixed point.
:::

:::drill tricky
Two variables are both live at some point in the same block, but they hold the same value because `b = a` just ran. Must they get different registers?
---
**Answer.** No. A copy does not create interference between its source and destination, so as long as neither changes while both are live, they can share a register and the copy can be deleted.

**Why.** Standard interference-graph construction skips the edge between `a` and `b` at the copy. This is what makes coalescing possible. The toy program above has no copies, so it does not need the rule.
:::

:::drill concept
A node has degree 5 and you have 4 registers. Is it uncolourable?
---
**Answer.** Not necessarily. Degree at least k only means the simple rule cannot guarantee a colour. If two neighbours happen to share a colour, a free one remains.

**Why.** This is Briggs's optimistic colouring: push the node anyway, and spill only if no colour is free when it is popped. It can spill fewer values than Chaitin's original, which committed to the spill at simplification.
:::

:::drill tricky
Does running DCE before folding give the same result as running it after? What do compilers do about this?
---
**Answer.** Not in general. Folding creates dead code, and removing code can enable further improvements. The order changes the outcome, which is the **phase-ordering problem**.

**Why.** No fixed order is best for all programs. Compilers repeat cheap cleanups such as DCE and instruction combining several times in the pipeline, as the LLVM pass list in Chapter 2 shows.
:::

:::drill output
Three values are used as `a = 1`, `b = a + 1`, `c = b + 1`, `return c`, with no other uses. How many registers does the code need, and what does this print?

```python run=cc-c01-d-chain
code = [("a", []), ("b", ["a"]), ("c", ["b"]), (None, ["c"])]
live, peak = set(), 0
for d, uses in reversed(code):
    live.discard(d)
    live |= set(uses)
    peak = max(peak, len(live))
    print(d, sorted(live))
print("peak live", peak)
```
---
**Answer.** One register is enough. Each value dies at the instruction that defines the next, so at most one is live between instructions.

**Why.** An instruction can read and write the same register, so `b = a + 1` can become `add r0, r0, 1`. Live sets between instructions are what matter, which is why the chain has no interference edges.
:::

:::drill concept
What does inlining cost, and when does it make code slower?
---
**Answer.** Code growth. A larger hot path can miss more in the instruction cache, and more live values can cause more spills.

**Why.** Heuristics weigh size against expected benefit, such as a constant argument that will fold or a very small callee. Profile data makes this decision much better.
:::

:::drill bug
A student's CSE replaces the second load with the first result. When is that wrong?

```text
t1 = load p
store q, 5
t2 = load p      ; replaced by: t2 = t1
```
---
**Answer.** It is wrong if `p` and `q` may point to the same address, since the store changes what the second load reads.

**Why.** Memory operations need alias analysis, which is why CSE on arithmetic is easy and on loads is hard. C's `restrict` and type-based aliasing rules exist to give the compiler this information.
:::

## Write the code {#ch01-coding .cd}

:::drill code rating=1400
Finish SSA construction for straight-line code plus one diamond. Given a block list with assignments, rename each variable to a numbered version and insert a phi at the join. Use the dominator tree walk with one stack of versions per variable.
---
The walk visits a block, renames its phi destinations and instructions, fills phi arguments in its CFG successors, recurses on dominator-tree children, and then pops the versions it pushed.

```python run=cc-c01-c-ssa
BLOCKS = {
    "entry": [("x", ["p"]), ("y", ["x"])],
    "then": [("x", ["x", "y"])],
    "else": [("y", ["y"])],
    "join": [("z", ["x", "y"])],
}
SUCC = {"entry": ["then", "else"], "then": ["join"], "else": ["join"], "join": []}
TREE = {"entry": ["then", "else", "join"], "then": [], "else": [], "join": []}
PHIS = {"join": {"x": {}, "y": {}}}     # chosen from the dominance frontiers

count, stacks, result = {}, {}, {}

def new(v):
    count[v] = count.get(v, 0) + 1
    name = f"{v}{count[v]}"
    stacks.setdefault(v, []).append(name)
    return name

def walk(b):
    pushed, lines, phi_names = [], [], {}
    for v in PHIS.get(b, {}):
        phi_names[v] = new(v)
        pushed.append(v)
    for dest, uses in BLOCKS[b]:
        args = [stacks[u][-1] if u in stacks else u for u in uses]
        lines.append(f"{new(dest)} = f({', '.join(args)})")
        pushed.append(dest)
    result[b] = (phi_names, lines)
    for s in SUCC[b]:
        for v, args in PHIS.get(s, {}).items():
            args[b] = stacks[v][-1]
    for child in TREE[b]:
        walk(child)
    for v in pushed:
        stacks[v].pop()

walk("entry")
for b, (phi_names, lines) in result.items():
    print(b)
    for v, name in phi_names.items():
        print(f"  {name} = phi({PHIS[b][v]})")
    for line in lines:
        print(" ", line)
```

The stacks hold the version visible at each point in the dominator tree. The parameter `p` has no definition in the program, so it keeps its name.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- Pipeline: lex, parse, semantic analysis, IR, optimise, select instructions, schedule, allocate registers, emit.
- TAC: one operation per instruction. Basic block: single entry, single exit. CFG: blocks and possible jumps.
- A dominates B if all entry-to-B paths pass through A. Back edge: target dominates source.
- Dominance frontier: where a block's dominance ends. Phis go on the *iterated* frontier of a variable's definitions.
- SSA: one static definition per name. Phis select by incoming edge and run on block entry, and they are lowered to copies.
- Folding plus propagation, then DCE: folding exposes dead code. Roots of DCE are side effects and returns.
- LVN: `(op, n1, n2)` table gives local CSE, and reassigning kills matches. Loads need alias analysis.
- Inlining enables other passes, at a code-size cost.
- Liveness: backward, `in = use ∪ (out − def)`, `out = ∪ in[succ]`, iterate to a fixed point.
- Interference plus k colours: simplify nodes with degree under k, spill optimistically, select. Coalescing removes copies. Linear scan is the fast alternative.
- Float rules block many integer identities. Phase ordering is why cleanup passes run repeatedly.
