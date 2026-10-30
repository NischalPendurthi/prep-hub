---
title: LLVM and MLIR
part: Part A · The classic compiler
lede: LLVM is the compiler infrastructure behind Clang, Rust and many other languages. MLIR, part of the same project, extends the idea to many levels of abstraction, which suits ML compilers. This chapter teaches you to read LLVM IR, describes the pass pipeline and the back end, then covers MLIR's dialects, operations, progressive lowering and pattern rewrites. Small Python programs model instruction selection, a greedy rewrite driver and a checked lowering.
desc: reading LLVM IR, pass pipeline, instruction selection, MLIR dialects, progressive lowering, pattern rewrites
hours: 4
prereqs: Chapter 1 (SSA, CFG, passes), a little C
---

## Reading LLVM IR {#ch02-ir .th}

LLVM IR is a typed, SSA-based, three-address IR. It has a text form (`.ll`) and a binary form (`.bc`), and the two are equivalent. It has unlimited virtual registers, and every value has an explicit type. Here is a summing loop written in the shape an optimiser produces. This and the other LLVM samples are **illustrative**: they cannot run in this site's build, though they follow the real syntax.

```llvm
; illustrative: int sum(int n) { int s = 0; for (int i = 0; i < n; i++) s += i; return s; }
define i32 @sum(i32 %n) {
entry:
  %cmp = icmp sgt i32 %n, 0
  br i1 %cmp, label %loop, label %exit

loop:
  %i = phi i32 [ 0, %entry ], [ %i.next, %loop ]
  %acc = phi i32 [ 0, %entry ], [ %acc.next, %loop ]
  %acc.next = add nsw i32 %acc, %i
  %i.next = add nuw nsw i32 %i, 1
  %done = icmp eq i32 %i.next, %n
  br i1 %done, label %exit, label %loop

exit:
  %r = phi i32 [ 0, %entry ], [ %acc.next, %loop ]
  ret i32 %r
}
```

Read it block by block. The rules you need are few:

| Syntax | Meaning |
|---|---|
| `@sum`, `%n` | `@` is a global name (function or global variable), `%` is a local value |
| `i32`, `i1`, `float`, `ptr`, `<4 x float>` | Types: integers of any width, floats, an opaque pointer, a vector |
| `add nsw i32 %a, %b` | Integer add. `nsw` promises no signed wrap, `nuw` no unsigned wrap |
| `icmp sgt`, `fcmp olt` | Compares. `s`/`u` are signed/unsigned, and `o` means ordered (false if NaN) |
| `br i1 %c, label %t, label %f` | Conditional branch. Every block ends in one terminator |
| `phi i32 [ v1, %b1 ], [ v2, %b2 ]` | Value depends on the predecessor block |
| `load`, `store`, `alloca` | Memory read, write, stack slot |
| `getelementptr` | Address arithmetic only. It never touches memory |

If `nsw` is present and the add overflows, the result is **poison**. Poison spreads through later arithmetic, and using it as a branch condition or an address is undefined behaviour. That is how C's undefined signed overflow reaches the optimiser, and it lets the compiler assume a loop counter does not wrap.

Memory is the one part that is not in SSA form. Clang takes advantage of this. It gives each local variable a stack slot with `alloca`, and emits a `load` and `store` for each access. It does not build SSA form for local variables. The `mem2reg` pass (or `sroa`) then promotes the slots to SSA values, running the phi-placement algorithm from Chapter 1.

```llvm
; illustrative: Clang at -O0 for the same loop, shortened
%s.addr = alloca i32, align 4
store i32 0, ptr %s.addr, align 4
%0 = load i32, ptr %s.addr, align 4
%1 = add nsw i32 %0, %i.val
store i32 %1, ptr %s.addr, align 4
```

:::trap
`getelementptr` looks like a load because it uses indexes. It only computes an address. `getelementptr inbounds i32, ptr %p, i64 1` means `p + 4` bytes, and a separate `load` reads the memory. Interviewers also ask why it has so many indexes: it walks types, so the first index steps over whole objects and later indexes step into struct fields or array elements.
:::

## The pass pipeline {#ch02-passes .th}

An optimisation level such as `-O2` is a long, fixed list of passes. A **transform pass** changes IR. An **analysis pass** computes facts, such as dominators or loop info, which are cached and invalidated when a transform changes what they depend on. The pass manager schedules passes at module, call-graph (SCC), function and loop level. Running at SCC level means callees are optimised before callers consider inlining them.

```bash
# illustrative commands, for a machine with LLVM installed
clang -S -emit-llvm -O0 -Xclang -disable-O0-optnone sum.c -o sum.ll
opt -passes='mem2reg,instcombine,simplifycfg' -S sum.ll -o out.ll
opt -passes='default<O2>' -print-pipeline-passes -disable-output sum.ll
llc -O2 out.ll -o out.s
```

Common passes you can name in an interview:

| Pass | Job |
|---|---|
| `sroa`, `mem2reg` | Turn stack slots and aggregates into SSA values |
| `early-cse`, `gvn` | Remove redundant computations. `early-cse` is the cheap one, `gvn` the stronger one |
| `instcombine` | Many small algebraic rewrites, such as `x * 2` to `x << 1` |
| `simplifycfg` | Merge blocks, remove unreachable code, turn branches into selects |
| `inline` | Inline calls according to a cost model |
| `licm` | Move loop-invariant code out of loops |
| `indvars`, `loop-unroll` | Canonicalise induction variables, unroll loops |
| `loop-vectorize`, `slp-vectorizer` | Loop and straight-line vectorisation |
| `dse`, `adce` | Dead store elimination, aggressive dead code elimination |

Cleanup passes such as `instcombine` and `simplifycfg` appear many times, because each major transform leaves new opportunities. Chapter 1 called this the phase-ordering problem.

## The back end and instruction selection {#ch02-backend .th}

The back end turns target-independent IR into machine code. In LLVM's main path (SelectionDAG), each basic block becomes a DAG of operations. The DAG goes through **legalisation**, which rewrites types and operations the target lacks (for example, a 64-bit add on a 32-bit machine becomes two adds with carry). **Instruction selection** then covers the DAG with target instructions. Next come scheduling, register allocation, prologue and epilogue insertion, and encoding by the MC layer. GlobalISel is a newer selector that works on a whole function. FastISel is a quick selector for `-O0`. Targets describe their instructions and many of the patterns in TableGen `.td` files.

Instruction selection is a covering problem. The IR is a tree or DAG, each instruction covers a pattern of nodes, and the goal is the cheapest set of patterns that covers everything. A C function like `int f(int a, int b, int c) { return a * b + c; }` compiled for AArch64 becomes one instruction, since a single pattern covers both the multiply and the add:

```text
; illustrative: AArch64 output for a * b + c
madd w0, w1, w0, w2
ret
```

The program below does tree covering with dynamic programming, the idea behind BURG-style selectors. The cost table is made up for the example. Each node takes the cheapest pattern, counting the best cost of its operands.

```python run=cc-c02-isel
PATTERNS = [
    (("add", "$a", ("imm", "$i")), 1, "addi {d}, {a}, #{i}"),
    (("add", ("mul", "$a", "$b"), "$c"), 3, "madd {d}, {a}, {b}, {c}"),
    (("add", "$a", "$b"), 1, "add  {d}, {a}, {b}"),
    (("mul", "$a", "$b"), 3, "mul  {d}, {a}, {b}"),
    (("load", ("add", "$a", ("imm", "$i"))), 2, "ldr  {d}, [{a}, #{i}]"),
    (("load", "$a"), 2, "ldr  {d}, [{a}]"),
    (("imm", "$i"), 1, "li   {d}, #{i}"),
]

def match(pat, t, binds):
    if isinstance(pat, str) and pat[0] == "$":
        binds[pat[1:]] = t
        return True
    if not isinstance(pat, tuple) or not isinstance(t, tuple) or len(pat) != len(t):
        return False
    return pat[0] == t[0] and all(match(p, c, binds) for p, c in zip(pat[1:], t[1:]))

def best(t, patterns):
    if t[0] == "reg":
        return 0, None, {}
    choice = (float("inf"), None, {})
    for pat, cost, text in patterns:
        binds = {}
        if match(pat, t, binds):
            total = cost + sum(best(c, patterns)[0] for c in binds.values() if isinstance(c, tuple))
            if total < choice[0]:
                choice = (total, text, binds)
    return choice

def emit(t, patterns, out):
    if t[0] == "reg":
        return t[1]
    _, text, binds = best(t, patterns)
    names = {k: emit(v, patterns, out) if isinstance(v, tuple) else v for k, v in binds.items()}
    dest = f"t{len(out)}"
    out.append(text.format(d=dest, **names))
    return dest

x, y, z = ("reg", "x"), ("reg", "y"), ("reg", "z")
tree = ("add", ("mul", ("load", ("add", x, ("imm", 4))), y), z)     # x[4] * y + z
plain = [p for p in PATTERNS if "madd" not in p[2] and "#{i}]" not in p[2] and "addi" not in p[2]]
for name, patterns in [("all patterns", PATTERNS), ("no fused patterns", plain)]:
    out = []
    emit(tree, patterns, out)
    print(name, "cost", best(tree, patterns)[0])
    for line in out:
        print("  ", line)
```

With every pattern available, the load absorbs the address add, and `madd` absorbs the multiply. Removing those patterns leaves one simple instruction per node, at a higher cost. Real selectors handle DAGs, where a shared node might be covered twice or forced into a register, and that makes optimal selection hard. LLVM's DAG selector is greedy, and matches patterns in priority order.

## Why MLIR exists {#ch02-why .th}

LLVM IR is a good level for scalar code and loops, and a poor level for a neural network. Once a `Conv` is lowered to loops of loads and multiplies, the compiler no longer sees a convolution. Recovering that structure to fuse layers or map them onto an accelerator is much harder than keeping it. So each framework built its own high-level graph IR, along with its own passes, verifiers and printers. That duplicated a lot of infrastructure and made it hard to move between levels.

**MLIR** (Multi-Level Intermediate Representation) is a framework for defining IRs. It gives you one data structure, one text format, one pass manager and one pattern-rewrite engine, and lets many sets of operations live in the same module. A set of operations and types is a **dialect**. A compiler lowers step by step, from high-level dialects to low-level ones, and keeps high-level structure while it is still useful.

Everything is an **operation**. An operation has a name with a dialect prefix, operands, results, attributes (compile-time constants), and possibly regions that hold blocks of further operations. Even `func.func` is an operation with one region. The result is SSA, but a block takes **block arguments** where LLVM would use phis.

```mlir
// illustrative
func.func @pick(%c: i1, %a: i32, %b: i32) -> i32 {
  cf.cond_br %c, ^then, ^else
^then:
  cf.br ^join(%a : i32)
^else:
  cf.br ^join(%b : i32)
^join(%x: i32):
  return %x : i32
}
```

The branch passes a value to `^join`, and `%x` receives it. That is equivalent to `%x = phi`, with the value listed on the branch.

These are upstream dialects you should recognise:

| Dialect | Level | Examples |
|---|---|---|
| `tosa` | ML operators with defined semantics | `tosa.add`, `tosa.conv2d` |
| `linalg` | Structured computation on tensors or buffers | `linalg.matmul`, `linalg.generic` |
| `tensor` | Immutable tensor values | `tensor.empty`, `tensor.extract_slice` |
| `memref` | Buffers with a shape and layout | `memref.load`, `memref.alloc` |
| `arith` | Scalar and vector arithmetic | `arith.addi`, `arith.mulf`, `arith.constant` |
| `scf`, `cf` | Structured loops, then branches | `scf.for`, `cf.br` |
| `func` | Functions | `func.func`, `func.return` |
| `llvm` | Direct mapping to LLVM IR | `llvm.add` |

:::key
LLVM is a compiler with one fixed IR. MLIR is a toolkit for building compilers that use many IRs, and it can lower to LLVM IR at the end. They are complementary, and MLIR is a subproject of LLVM.
:::

## Progressive lowering {#ch02-lowering .th}

Progressive lowering means each pass removes a small amount of abstraction, and the IR can mix dialects while this happens. A typical CPU path looks like the following, using real passes (the pipeline varies by project):

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 280" role="img" aria-label="A ladder from the tosa dialect through linalg on tensors, linalg on memrefs, scf loops, cf branches and the llvm dialect">
  <rect x="30" y="10" width="220" height="32" rx="6" class="d-acc"/><text x="140" y="31" text-anchor="middle" class="t-mono">tosa.add</text>
  <rect x="30" y="58" width="220" height="32" rx="6" class="d-acc"/><text x="140" y="79" text-anchor="middle" class="t-mono">linalg on tensors</text>
  <rect x="30" y="106" width="220" height="32" rx="6" class="d-soft"/><text x="140" y="127" text-anchor="middle" class="t-mono">linalg on memrefs</text>
  <rect x="30" y="154" width="220" height="32" rx="6" class="d-soft"/><text x="140" y="175" text-anchor="middle" class="t-mono">scf.for + memref.load</text>
  <rect x="30" y="202" width="220" height="32" rx="6" class="d-key"/><text x="140" y="223" text-anchor="middle" class="t-mono">cf.br + block arguments</text>
  <rect x="30" y="242" width="220" height="32" rx="6" class="d-key"/><text x="140" y="263" text-anchor="middle" class="t-mono">llvm dialect, LLVM IR</text>
  <path d="M140 42 L 140 58" class="d-line"/><path d="M140 90 L 140 106" class="d-line"/><path d="M140 138 L 140 154" class="d-line"/><path d="M140 186 L 140 202" class="d-line"/><path d="M140 234 L 140 242" class="d-line"/>
  <text x="264" y="54" class="t-mono">tosa-to-linalg</text><text x="500" y="54" class="t-small">graph rewrites happen above</text>
  <text x="264" y="102" class="t-mono">one-shot-bufferize</text><text x="500" y="102" class="t-small">values become buffers</text>
  <text x="264" y="150" class="t-mono">convert-linalg-to-loops</text><text x="500" y="150" class="t-small">tiling and fusion before this</text>
  <text x="264" y="198" class="t-mono">convert-scf-to-cf</text><text x="500" y="198" class="t-small">loop structure is gone</text>
  <text x="264" y="244" class="t-mono">convert-*-to-llvm family</text><text x="500" y="244" class="t-small">hand off to LLVM</text>
</svg></div><figcaption><b>Lower one step at a time.</b> Each level keeps the information its own optimisations need. Accelerator compilers usually leave this path partway down and lower into their own dialect.</figcaption></figure>

The key step is **bufferization**. A `tensor` is an immutable value with no address, which makes rewrites safe and simple. A `memref` is memory that can be written. The bufferizer decides which tensor values can share a buffer and which need a copy, and it is the same reasoning as the in-place analysis in Chapter 4. Here is the same matrix multiply at three levels. The last has the shape MLIR's `convert-linalg-to-loops` pass prints, with the values renamed for reading:

```mlir
// illustrative: tensors, with an output operand that supplies the shape
%0 = linalg.matmul ins(%A, %B : tensor<2x3xf32>, tensor<3x4xf32>)
                   outs(%init : tensor<2x4xf32>) -> tensor<2x4xf32>

// illustrative: buffers, with no result because it writes into %C
linalg.matmul ins(%A, %B : memref<2x3xf32>, memref<3x4xf32>)
              outs(%C : memref<2x4xf32>)

// illustrative: loops
scf.for %i = %c0 to %c2 step %c1 {
  scf.for %j = %c0 to %c4 step %c1 {
    scf.for %k = %c0 to %c3 step %c1 {
      %a = memref.load %A[%i, %k] : memref<2x3xf32>
      %b = memref.load %B[%k, %j] : memref<3x4xf32>
      %c = memref.load %C[%i, %j] : memref<2x4xf32>
      %m = arith.mulf %a, %b : f32
      %s = arith.addf %c, %m : f32
      memref.store %s, %C[%i, %j] : memref<2x4xf32>
    }
  }
}
```

The next program models this path in Python. It lowers a `matmul` to loops, then to flat memory with a computed offset. It runs each level with a small interpreter, and checks each against NumPy. Checking semantics after each lowering is a habit worth having in your own passes.

```python run=cc-c02-lowering
import numpy as np

def to_loops(A, B, C, shape):
    n, m, p = shape
    body = [("load", "a", A, ("i", "k")), ("load", "b", B, ("k", "j")), ("load", "c", C, ("i", "j")),
            ("mul", "x", "a", "b"), ("add", "s", "c", "x"), ("store", "s", C, ("i", "j"))]
    return [("for", "i", n, [("for", "j", p, [("for", "k", m, body)])])]

def to_flat(ops, widths):
    out = []
    for op in ops:
        if op[0] == "for":
            out.append(("for", op[1], op[2], to_flat(op[3], widths)))
        elif op[0] == "load":
            out.append(("load", op[1], op[2], f"{op[3][0]}*{widths[op[2]]}+{op[3][1]}"))
        elif op[0] == "store":
            out.append(("store", op[1], op[2], f"{op[3][0]}*{widths[op[2]]}+{op[3][1]}"))
        else:
            out.append(op)
    return out

def show(ops, depth=0):
    for op in ops:
        if op[0] == "for":
            print("  " * depth + f"for {op[1]} in 0..{op[2]}:")
            show(op[3], depth + 1)
        else:
            print("  " * depth + " ".join(str(x) for x in op))

def index(i, env):
    return eval(i, {}, env) if isinstance(i, str) else tuple(env[v] for v in i)

def run(ops, mem, env):
    for op in ops:
        if op[0] == "for":
            for v in range(op[2]):
                run(op[3], mem, {**env, op[1]: v})
        elif op[0] == "load":
            env[op[1]] = mem[op[2]][index(op[3], env)]
        elif op[0] == "store":
            mem[op[2]][index(op[3], env)] = env[op[1]]
        elif op[0] == "mul":
            env[op[1]] = env[op[2]] * env[op[3]]
        elif op[0] == "add":
            env[op[1]] = env[op[2]] + env[op[3]]

A = np.arange(6.0).reshape(2, 3)
B = np.arange(12.0).reshape(3, 4)
want = A @ B

loops = to_loops("A", "B", "C", (2, 3, 4))
mem = {"A": A, "B": B, "C": np.zeros((2, 4))}
run(loops, mem, {})
print("loops match NumPy:", np.array_equal(mem["C"], want))

flat = to_flat(loops, {"A": 3, "B": 4, "C": 4})
show(flat)
mem = {"A": A.ravel(), "B": B.ravel(), "C": np.zeros(8)}
run(flat, mem, {})
print("flat match NumPy:", np.array_equal(mem["C"].reshape(2, 4), want))
```

## Pattern rewrites {#ch02-patterns .th}

Most MLIR transformations are written as **rewrite patterns**: match a small piece of IR, and replace it. A greedy driver applies patterns until none match. Canonicalisation works this way, using patterns registered with each op. Lowering between dialects uses **dialect conversion**, in which you declare which ops are legal in the target, and the framework applies patterns until no illegal ops remain, or reports failure.

```cpp
// illustrative: a rewrite pattern in MLIR's C++ API
struct AddZero : public OpRewritePattern<arith::AddIOp> {
  using OpRewritePattern::OpRewritePattern;
  LogicalResult matchAndRewrite(arith::AddIOp op, PatternRewriter &rewriter) const override {
    if (!matchPattern(op.getRhs(), m_Zero()))
      return failure();
    rewriter.replaceOp(op, op.getLhs());
    return success();
  }
};
```

`arith.addi` already folds this case, so you would not write this exact pattern in practice. Here is the same idea as a toy driver. It removes a pair of cancelling transposes (which exporters often leave behind) and an add of zero, and uses NumPy to check the rewrite kept the meaning.

```python run=cc-c02-rewrite
import numpy as np

def add_zero(op, ir):
    if op[0] == "add" and ir.get(op[2], ("",))[:2] == ("const", 0):
        return op[1]

def cancel_transpose(op, ir):
    if op[0] == "transpose" and ir.get(op[1], ("",))[0] == "transpose":
        inner = ir[op[1]]
        if tuple(inner[2][i] for i in op[2]) == tuple(range(len(op[2]))):
            return inner[1]

def greedy(ir, outputs, patterns):
    changed = True
    while changed:
        changed = False
        for name, op in list(ir.items()):
            for pat in patterns:
                new = pat(op, ir)
                if new:
                    print(f"  {pat.__name__}: replace {name} with {new}")
                    del ir[name]
                    for n, o in ir.items():
                        ir[n] = tuple(new if a == name else a for a in o)
                    outputs[:] = [new if o == name else o for o in outputs]
                    changed = True
                    break
            if changed:
                break
    used = set(outputs)
    for name in reversed(list(ir)):         # drop ops nothing reads
        if name in used:
            used |= {a for a in ir[name][1:] if isinstance(a, str)}
        else:
            del ir[name]
    return ir, outputs

def run(ir, outputs, x):
    env = {"%x": x}
    for name, op in ir.items():
        if op[0] == "const": env[name] = op[1]
        if op[0] == "transpose": env[name] = env[op[1]].transpose(op[2])
        if op[0] == "add": env[name] = env[op[1]] + env[op[2]]
        if op[0] == "mul": env[name] = env[op[1]] * env[op[2]]
    return env[outputs[0]]

IR = {"%zero": ("const", 0),
      "%t1": ("transpose", "%x", (0, 2, 3, 1)),
      "%t2": ("transpose", "%t1", (0, 3, 1, 2)),
      "%a": ("add", "%t2", "%zero"),
      "%b": ("mul", "%a", "%a")}
x = np.arange(24.0).reshape(1, 2, 3, 4)
before = run(IR, ["%b"], x)
ir, outs = greedy(dict(IR), ["%b"], [add_zero, cancel_transpose])
print(ir, outs)
print("same result:", np.array_equal(before, run(ir, outs, x)))
```

:::trap
A set of greedy patterns can loop forever if one pattern undoes another. Canonicalisation avoids this by rewriting only towards one agreed form. MLIR's driver also has an iteration limit and can report that it did not converge.
:::

## Drills {#ch02-drills .dr}

:::drill concept
What do `nsw` and `nuw` mean on an LLVM `add`, and why would a compiler want them?
---
**Answer.** "No signed wrap" and "no unsigned wrap". If the promise is broken, the result is poison. They let the optimiser reason as if the arithmetic does not overflow.

**Why.** For example, knowing `i + 1 > i` holds lets it compute a loop's trip count and widen a 32-bit index to 64 bits. C's undefined signed overflow is the source of `nsw` on `int` arithmetic.
:::

:::drill concept
Why can Clang emit `alloca`, `load` and `store` for locals and leave SSA construction to a pass?
---
**Answer.** Memory in LLVM IR need not be in SSA form, so unoptimised code is valid IR. `mem2reg` or `sroa` promotes slots to SSA values when their address does not escape.

**Why.** Every front end gets SSA construction for free. If a slot's address is passed to a call, it may stay in memory.
:::

:::drill tricky
Clang 15 at `-O2` compiled the `sum` loop to no loop at all. The IR has a multiply and a shift. What happened?
---
**Answer.** A loop analysis found that the final value is a closed-form expression of `n`, roughly `n * (n - 1) / 2`, and final-value replacement removed the loop.

**Why.** LLVM's scalar evolution analysis models how values change per iteration. Clang's output computes the product in a 33-bit type (`i33`), so the low bit that the shift discards is kept and the 32-bit result is correct.
:::

:::drill concept
What are SelectionDAG legalisation and instruction selection?
---
**Answer.** Legalisation rewrites types and operations the target cannot do into ones it can. Selection then covers the DAG with real target instructions.

**Why.** For example, `i64` add on a 32-bit target becomes add-with-carry pairs, and an unsupported vector width gets split. Selection can then rely on every node having some valid pattern.
:::

:::drill output
This loop's phis swap two values: `a = phi [0, entry], [b, loop]` and `b = phi [1, entry], [a, loop]`. A student lowers them to plain copies, one after the other. What does each version print?

```python run=cc-c02-d-swap
def run(parallel, iters=3):
    a, b = 0, 1
    seen = [(a, b)]
    for _ in range(iters):
        if parallel:
            a, b = b, a
        else:
            a = b
            b = a
        seen.append((a, b))
    return seen

print("parallel:  ", run(True))
print("sequential:", run(False))
```
---
**Answer.** The parallel version alternates between `(0, 1)` and `(1, 0)`. The sequential version overwrites `a` before `b` reads it, so it stays at `(1, 1)` from the first iteration on.

**Why.** All phis in a block read their inputs at the same instant. This is the classic **swap problem** of leaving SSA: the copies form a cycle, so the lowering needs a temporary register or a swap instruction.
:::

:::drill concept
What is an MLIR dialect, and what must every operation have?
---
**Answer.** A dialect is a namespace of operations, types and attributes. An operation has a name, operands, results, attributes and regions, any of which except the name may be empty.

**Why.** All tools work on this common structure. The optimiser can move or delete ops from a dialect it has never seen, using declared traits and interfaces such as "this op has no side effects".
:::

:::drill tricky
Why does MLIR use block arguments in place of phi nodes?
---
**Answer.** They express the same merge, with the values listed at each branch. Passing values on the branch avoids a special case for "instructions at the start of a block", and handles a branch with the same target twice.

**Why.** A region's entry block can also receive arguments, such as a function's parameters and `scf.for` induction variables. So one concept covers all of them.
:::

:::drill concept
What is the difference between `tensor<4xf32>` and `memref<4xf32>`?
---
**Answer.** A tensor is an immutable value with no storage identity. A memref refers to a buffer that can be read and written.

**Why.** Tensors make rewrites such as fusion easy, because no aliasing is possible. Hardware needs buffers, so bufferization converts one to the other, deciding where to reuse memory and where a copy is required.
:::

:::drill bug
A student's lowering pattern produces wrong results on a shared value. What did it assume?

```text
// illustrative, before lowering
%a = tosa.add %x, %y : ...
%b = tosa.add %a, %z : ...
%c = tosa.add %a, %a : ...
// lowering of %b writes its result into the buffer of %a to "save memory"
```
---
**Answer.** It assumed `%a` had no other users. `%c` still reads `%a` after `%b` runs, so overwriting it corrupts `%c`.

**Why.** In-place reuse is legal only at the last use of the buffer. This is exactly the analysis one-shot bufferization performs, and the same rule returns in Chapter 4.
:::

:::drill output
This models rewriting until nothing changes. What does it print, and what would go wrong with a third rule that rewrites `x+x` to `x*2`?

```python run=cc-c02-d-fixpoint
rules = [("x*2", "x<<1"), ("x<<1", "x+x")]
expr, steps = "x*2", 0
while steps < 6:
    for a, b in rules:
        if expr == a:
            expr, steps = b, steps + 1
            print(steps, expr)
            break
    else:
        break
```
---
**Answer.** It reaches `x+x` after two steps and stops. With the third rule, it would cycle forever through the three forms, and this loop would stop only because of the limit of 6 steps.

**Why.** Patterns need a direction, such as "fewer ops" or "one canonical form". Mutually inverse patterns are a classic bug in rewrite systems.
:::

:::drill concept
A pass needs a `tosa.conv2d` to stay recognisable so an accelerator can run it. Why should you not lower through LLVM IR first?
---
**Answer.** LLVM IR would turn it into loops of loads and multiplies. Recovering the convolution from them is hard and unreliable.

**Why.** MLIR's principle is to do each optimisation at the level where the needed information is explicit, and lower only afterward.
:::

:::drill tricky
What is the difference between a greedy rewrite and a dialect conversion?
---
**Answer.** A greedy rewrite applies patterns until none match, and leaves whatever remains. A dialect conversion declares a target with legal and illegal ops. Both of its modes fail if an illegal op cannot be converted. A full conversion also requires every op to be legal, and a partial one tolerates ops of unknown legality.

**Why.** Lowering needs a guarantee that nothing was missed. Conversion also supports changing value types through a type converter, such as `tensor` to `memref`.
:::

## Write the code {#ch02-coding .cd}

:::drill code rating=1300
Write a toy "mem2reg" for a single basic block. Given `alloca`, `load` and `store` tuples for stack slots, remove all three kinds by forwarding the last stored value to each load. Print the remaining arithmetic.
---
Keep a map from slot to current value. A store updates it, a load records an alias, and the arithmetic uses the aliases.

```python run=cc-c02-c-mem2reg
CODE = [("alloca", "s"), ("store", "s", "0"), ("load", "t0", "s"), ("add", "t1", "t0", "n"),
        ("store", "s", "t1"), ("load", "t2", "s"), ("add", "t3", "t2", "n"), ("store", "s", "t3"),
        ("load", "t4", "s"), ("ret", "t4")]
slot_value, alias, out = {}, {}, []
for op, *args in CODE:
    if op == "alloca":
        continue
    if op == "store":
        slot_value[args[0]] = alias.get(args[1], args[1])
    elif op == "load":
        alias[args[0]] = slot_value[args[1]]
    else:
        out.append((op, *[alias.get(a, a) for a in args]))
print(out)
```

With several blocks, this needs phis at joins, using the frontier algorithm from Chapter 1. A slot whose address escapes (passed to a call, for example) cannot be promoted.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- LLVM IR: typed SSA with unlimited registers. `%` local, `@` global. Blocks end in a terminator. Memory is outside SSA.
- `nsw`/`nuw`: overflow gives poison. `icmp`/`fcmp` have predicates. `getelementptr` computes addresses only.
- Clang emits `alloca`, then `mem2reg`/`sroa` builds SSA. Cleanups such as `instcombine` repeat through the pipeline.
- Analyses are cached and invalidated. `opt -passes='default<O2>'` runs the standard pipeline.
- Back end: SelectionDAG (legalise, select), scheduling, register allocation, MC. Also GlobalISel, and FastISel at `-O0`. Selection is pattern covering by cost.
- MLIR: a framework for IRs. Dialect = namespace of ops and types. Op = name, operands, results, attributes, regions. Block arguments replace phis.
- Remember: `tosa`, `linalg`, `tensor`, `memref`, `arith`, `scf`, `cf`, `func`, `llvm`.
- Progressive lowering: optimise at the level with the needed information, and then go down. Bufferization turns tensors into memrefs.
- Patterns: `matchAndRewrite`, greedy driver to a fixed point. Conversion: legal target, fails if illegal ops remain. Avoid mutually inverse patterns.
