---
title: Bytecode and the eval loop
part: Part B · Execution
lede: CPython does not run your source code directly. It compiles it to bytecode for a stack machine, stores that in code objects, and runs it in a big C loop that 3.11 and later rewrite on the fly into faster specialised instructions. This chapter walks the pipeline from source to bytecode, shows how to read `dis` output, explains frames and the value stack, and covers constant folding, zero-cost exceptions and the specialising interpreter.
desc: Tokens to AST to bytecode, code objects, dis, frames, stack machine, specialisation, folding
hours: 3.5
prereqs: Chapters 1–2
---

## From source to code object {#ch03-pipeline .th}

When you import a module or run a script, CPython goes through these stages:

1. **Tokenise**: split the text into tokens (`NAME`, `OP`, `NUMBER`, `INDENT` …).
2. **Parse**: build an abstract syntax tree (AST) with the PEG parser introduced in 3.9.
3. **Symbol table**: classify every name as local, free, cell or global (Chapter 2).
4. **Compile**: turn the AST into a control-flow graph of instructions, optimise it, and assemble it into **bytecode**.
5. **Execute**: the interpreter loop in `Python/ceval.c` runs the bytecode.

The result of step 4 is a **code object**: an immutable bundle of the bytecode plus everything needed to run it: constants, names, local variable names, the stack size it needs, line-number and exception tables. Every function, class body, module and comprehension has its own code object.

```python run=c03-stages
import ast, tokenize, io

src = "total = price * 3"
toks = [tokenize.tok_name[t.type] for t in tokenize.generate_tokens(io.StringIO(src).readline)]
print(toks[:5])
print(ast.dump(ast.parse(src).body[0]))
code = compile(src, "<demo>", "exec")
print(type(code).__name__, code.co_names, code.co_consts)
```

`compile()` exposes steps 1–4 directly. Its mode argument is `"exec"` for a module or statements, `"eval"` for a single expression and `"single"` for one interactive statement (which prints expression results, as the REPL does).

### What a code object holds

```python run=c03-codeobj
def area(w, h=2, *, unit="m"):
    scale = 1.0
    return f"{w * h * scale}{unit}"

c = area.__code__
print(c.co_name, c.co_argcount, c.co_kwonlyargcount, c.co_nlocals)
print(c.co_varnames)
print(c.co_consts, c.co_names, c.co_stacksize)
print(len(c.co_code), "bytes of bytecode")
```

`co_varnames` lists the parameters first, then other locals, which is the order of the frame's local slots. A **function object** wraps a code object together with the things that vary per `def` execution: its globals dict, defaults, closure cells and `__dict__`. Many function objects can share one code object, for example the closures created by repeated calls of a factory.

:::tip
The `.pyc` files in `__pycache__` are simply the module's code object serialised with `marshal`, plus a header with a magic number (which changes with each bytecode format) and the source's modification time or hash. Chapter 12 covers when they are used.
:::

## Reading dis output {#ch03-dis .th}

CPython bytecode is a sequence of 2-byte units: one byte of opcode and one byte of argument (larger arguments use `EXTENDED_ARG` prefixes). Many instructions are followed by **cache** entries that the specialising interpreter uses, which is why offsets in `dis` output sometimes jump by more than 2.

The machine is a **stack machine**: instructions push values onto a per-frame value stack and pop them off. `a + b * c` becomes "push a, push b, push c, multiply the top two, add the top two":

```python run=c03-dis-expr
import dis

def calc(a, b, c):
    return a + b * c

dis.dis(calc)
```

Each line shows the source line number (only when it changes), the byte offset, the instruction name, the numeric argument and a human-readable meaning in brackets. `BINARY_OP 5 (*)` and `BINARY_OP 0 (+)` are one generic instruction for all binary operators, selected by the argument.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 190" role="img" aria-label="The value stack after each instruction for a + b * c">
  <text x="20" y="24" class="t-small">value stack after each instruction (top on the right)</text>
  <g>
    <text x="20" y="62" class="t-mono">LOAD_FAST a</text><rect x="230" y="44" width="70" height="28" class="d-acc"/><text x="265" y="63" text-anchor="middle" class="t-mono">a</text>
    <text x="20" y="98" class="t-mono">LOAD_FAST b, c</text><rect x="230" y="80" width="70" height="28" class="d-acc"/><text x="265" y="99" text-anchor="middle" class="t-mono">a</text><rect x="300" y="80" width="70" height="28" class="d-acc"/><text x="335" y="99" text-anchor="middle" class="t-mono">b</text><rect x="370" y="80" width="70" height="28" class="d-acc"/><text x="405" y="99" text-anchor="middle" class="t-mono">c</text>
    <text x="20" y="134" class="t-mono">BINARY_OP *</text><rect x="230" y="116" width="70" height="28" class="d-acc"/><text x="265" y="135" text-anchor="middle" class="t-mono">a</text><rect x="300" y="116" width="140" height="28" class="d-key"/><text x="370" y="135" text-anchor="middle" class="t-mono">b*c</text>
    <text x="20" y="170" class="t-mono">BINARY_OP +</text><rect x="230" y="152" width="210" height="28" class="d-key"/><text x="335" y="171" text-anchor="middle" class="t-mono">a + b*c</text>
    <text x="470" y="171" class="t-small">RETURN_VALUE pops it and returns</text>
  </g>
</svg></div><figcaption><b>A stack machine.</b> Operands are pushed, an operator pops its inputs and pushes its result. <code>co_stacksize</code> is the deepest this stack ever gets (3 here).</figcaption></figure>

### Control flow

`if`, `while` and `for` become conditional and unconditional jumps. A `for` loop calls `iter()` once (`GET_ITER`) and then `FOR_ITER` repeatedly, which calls `next()` and jumps out of the loop when the iterator is exhausted:

```python run=c03-dis-loop
import dis

def count_pos(xs):
    n = 0
    for x in xs:
        if x > 0:
            n += 1
    return n

dis.dis(count_pos)
```

`COMPARE_OP` pushes the result of `x > 0`. In 3.12 the compiler lays the loop out so that `POP_JUMP_IF_TRUE` jumps forward to the increment, while the fall-through `JUMP_BACKWARD` goes straight back to `FOR_ITER`. The augmented assignment is `BINARY_OP 13 (+=)`, the in-place variant of addition. `END_FOR` is where `FOR_ITER` jumps when the iterator raises `StopIteration`; the exception itself is never created for built-in iterators.

## Frames and the eval loop {#ch03-frames .th}

Each call to a Python function needs a **frame**: the state of one running code object. It holds the instruction pointer, the local variable slots (including cells), the value stack, and references to the function's globals and builtins. Since 3.11 CPython allocates these frames in a contiguous per-thread "data stack" rather than as separate heap objects, and only creates a full `frame` *object* when something asks for it (a traceback, `sys._getframe`, a debugger). That change is a large part of why 3.11 calls are faster.

```python run=c03-frames
import sys

def inner():
    f = sys._getframe()
    chain = []
    while f is not None:
        chain.append(f"{f.f_code.co_name}:{f.f_lineno}")
        f = f.f_back
    return chain

def middle():
    return inner()

def outer():
    return middle()

print(outer())
print(sys.getrecursionlimit())
```

`f_back` links each frame to its caller, which is exactly the chain a traceback prints. The recursion limit (1000 by default) caps how deep this chain can grow so that a runaway recursion raises `RecursionError` instead of overflowing the C stack.

### The loop itself

The core of `ceval.c` is conceptually:

```text
for (;;) {
    opcode, oparg = next instruction
    switch (opcode) {
        case LOAD_FAST:  push(locals[oparg]); break;
        case BINARY_OP:  right = pop(); left = pop(); push(binary_op(left, right, oparg)); break;
        case RETURN_VALUE: return pop();
        ...
    }
    every so often: check for signals, pending calls and a GIL drop request
}
```

In reality it uses computed `goto`s where the compiler supports them (each instruction jumps straight to the next handler, which branch predictors handle better than a single `switch`), and the handlers are generated from a domain-specific language in `Python/bytecodes.c`. The "every so often" check is how a long-running loop still responds to Ctrl-C and lets other threads take the GIL (Chapter 11).

## The specialising interpreter (3.11+) {#ch03-specialise .th}

PEP 659 made CPython's interpreter **adaptive**. Generic instructions such as `LOAD_ATTR`, `BINARY_OP`, `LOAD_GLOBAL` and `CALL` start in a counting mode. After an instruction has run a few times (the warm-up), the interpreter looks at the types it actually saw and replaces the instruction in place with a **specialised** version, using the inline cache entries after it to store what it learned (a type version, a dict key index, a slot offset):

```python run=c03-adaptive
import dis

class Point:
    def __init__(self, x):
        self.x = x

def get_x(p):
    return p.x

def add(a, b):
    return a + b

for _ in range(100):
    get_x(Point(1))
    add(1, 2)

dis.dis(get_x, adaptive=True)
dis.dis(add, adaptive=True)
```

`LOAD_ATTR_INSTANCE_VALUE` reads the attribute straight from the instance's value array after checking that the type has not changed, skipping the general attribute-lookup machinery. `BINARY_OP_ADD_INT` adds two ints without the generic dispatch, and `LOAD_FAST__LOAD_FAST` is a "superinstruction" that does two loads in one step.

If the guess later turns out wrong (say `add` is suddenly called with strings), the specialised instruction fails its guard, falls back to the generic path, and after enough misses it is **de-specialised** and can re-specialise for the new types:

```python run=c03-despecialise
import dis

def add(a, b):
    return a + b

for _ in range(100):
    add(1, 2)
for _ in range(100):
    add("a", "b")

for ins in dis.get_instructions(add, adaptive=True):
    if ins.opname.startswith("BINARY_OP"):
        print(ins.opname)
```

:::key
Type-stable code is faster in 3.11+. A function that is always called with the same types stays specialised. A function that sees ints, floats and strings at the same call site keeps falling back to the generic instructions. This is the same idea a JIT uses, applied inside the interpreter without generating machine code.
:::

## Compile-time optimisations {#ch03-optimise .th}

The compiler does some optimisation before any code runs:

- **Constant folding**: expressions made only of constants are computed at compile time, as long as the result is small (to avoid building a 10 MB string at compile time).
- **Tuple constants**: a literal list or set used only for membership (`x in [1, 2, 3]`) or iteration becomes a constant tuple or frozenset.
- **Dead code**: code after `return` or inside `if 0:` is removed.
- **Jump threading** and removal of redundant `NOP`s.

```python run=c03-folding
import dis

def consts(x):
    a = 24 * 60 * 60
    b = "ab" * 3
    c = x in [1, 2, 3]
    d = x in {1, 2, 3}
    if 0:
        print("never compiled")
    return a, b, c, d

print(consts.__code__.co_consts)
print([i.opname for i in dis.get_instructions(consts) if "CALL" in i.opname or "PRINT" in i.opname])
```

The constants already hold `86400`, `'ababab'`, the tuple `(1, 2, 3)` and the frozenset, and no call to `print` survives.

### Zero-cost exceptions

Before 3.11, entering a `try` block executed a `SETUP_FINALLY` instruction that pushed a block onto a stack, so even a `try` that never raised cost something. Since 3.11 the compiler instead records an **exception table** in the code object: ranges of instruction offsets and the handler to jump to. Entering a `try` block costs nothing; the table is consulted only when an exception is actually raised.

```python run=c03-exctable
import dis

def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

dis.dis(safe_div)
```

The `ExceptionTable` at the bottom says "if anything between offsets 4 and 10 raises, jump to 14". There is no setup instruction at the start of the `try` (only a `NOP` that keeps the line number for tracing).

:::trap
"Exceptions are slow, so check first" (look before you leap) is only half true in 3.11+. A `try` that does not raise is free. Raising and catching *is* still much slower than an `if`, so use exceptions for exceptional cases, not as the normal path of a hot loop.
:::

## Concept and tricky questions {#ch03-concept .dr}

:::drill concept
Name the stages CPython goes through between source text and running code.
---
**Answer.** Tokenising, parsing into an AST (PEG parser), building the symbol table, compiling the AST into bytecode (via a control-flow graph that is optimised and assembled), and executing that bytecode in the eval loop.

**Why.** Interviewers ask this to see whether you know Python is compiled (to bytecode) and then interpreted, and that `.pyc` files skip the first four stages on later imports.
:::

:::drill concept
What is the difference between a code object and a function object?
---
**Answer.** A code object is the immutable compiled body: bytecode, constants, names, variable names, stack size and line and exception tables. A function object wraps a code object with the run-time context of one `def` execution: its globals, defaults, closure cells, name and `__dict__`.

**Why.** Each call of a factory creates a new function object, but they all share one code object. That is how closures can be cheap.
:::

:::drill tricky
Is CPython bytecode stable? Could you ship `.pyc` files built with 3.11 to users on 3.12?
---
**Answer.** No. Bytecode is an implementation detail and changes in almost every minor release (3.11 added specialisation and caches, 3.12 changed more instructions). Each `.pyc` header carries a magic number, and an interpreter ignores `.pyc` files whose magic number does not match.

**Why.** `dis` output in tutorials written for 3.8 looks different from 3.12 output for the same function. Answers that rely on specific opcodes should name the version.
:::

:::drill concept
What is a stack machine, and what does `co_stacksize` record?
---
**Answer.** A machine whose instructions take operands from and push results onto a value stack instead of naming registers. `co_stacksize` is the maximum depth that stack reaches for the code object, so the frame can allocate the right space up front.

**Why.** A stack machine makes the compiler simple: an expression tree turns into a post-order walk. The JVM and WebAssembly are also stack machines.
:::

:::drill concept
What does the specialising adaptive interpreter do, and which PEP introduced it?
---
**Answer.** PEP 659 (3.11). It replaces generic instructions (`LOAD_ATTR`, `BINARY_OP`, `CALL`, `LOAD_GLOBAL` …) in place with specialised versions based on the types observed at that instruction, storing guard data in inline caches, and de-specialises if the guards keep failing.

**Why.** It gives JIT-like gains for type-stable code without generating machine code, and it is the foundation the experimental JIT in 3.13 builds on.
:::

:::drill tricky
Does an empty `try`/`except` around a hot loop body slow down the loop in 3.12?
---
**Answer.** Not measurably when nothing is raised. Since 3.11, entering a `try` block executes no instruction; handlers are found through the code object's exception table only when an exception occurs.

**Why.** The cost moved entirely to the raising path, which is now somewhat more expensive because it searches the table.
:::

:::drill concept
Why does `x in [1, 2, 3]` inside a function not build a list each time it runs?
---
**Answer.** The compiler sees that the list literal is only used for a membership test and replaces it with a constant tuple `(1, 2, 3)`. A set literal used the same way becomes a constant `frozenset`, which makes the test O(1).

**Why.** This is a peephole optimisation on the bytecode. It only applies when every element is a constant.
:::

## Predict the output and find the bug {#ch03-reading .dr}

:::drill output
What does this print?

```python run=c03-d-folding
def f():
    return 2 ** 10, "-" * 5, (1, 2) + (3,)

g = lambda: 2 ** 10
print(f.__code__.co_consts)
print(f.__code__.co_code == g.__code__.co_code, g.__code__.co_consts)
```
---
**Answer.** Every element is a constant expression, so the compiler folds the whole return value into **one** constant tuple, `(1024, '-----', (1, 2, 3))`. Both functions then compile to the same two instructions (`RESUME`, `RETURN_CONST 1`), so their `co_code` bytes are equal; only their constant tables differ.

**Why.** Folding happens during compilation, before any code runs. Comparing `co_code` alone says nothing about what a function returns: the meaning is split between the bytecode and `co_consts`. The exact contents of `co_consts` (such as whether `None` is present) vary between versions.
:::

:::drill output
What does this print?

```python run=c03-d-names
def f(a):
    b = len(a)
    return b + c

code = f.__code__
print(code.co_varnames, code.co_names)
try:
    f([1])
except NameError as e:
    print("NameError:", e)
```
---
**Answer.** `co_varnames` holds the locals `('a', 'b')`, `co_names` holds the global names the bytecode uses, `('len', 'c')`. The function compiles fine, and the missing global `c` is only noticed at run time.

**Why.** Python resolves globals when the `LOAD_GLOBAL` runs. A typo in a rarely-taken branch is not caught until that branch executes, which is one reason linters and type checkers are useful.
:::

:::drill output
What does this print?

```python run=c03-d-recursion
import sys
sys.setrecursionlimit(60)

def depth(n=0):
    try:
        return depth(n + 1)
    except RecursionError:
        return n

print(depth() < 60)
```
---
**Answer.** `True`: the function catches the `RecursionError` at whatever depth hit the limit, and that depth is below 60 because the frames already on the stack (the module and `print`'s caller chain) count too.

**Why.** The limit counts all Python frames on the current thread's stack, not just the recursive function's. Raising the limit very high risks crashing the C stack in pure C recursion paths, which is why it exists.
:::

:::drill output
How many `BINARY_OP` instructions survive in this function, and which constant does the compiler create?

```python run=c03-d-count
import dis

def seconds(days):
    return days * 24 * 60 * 60

ops = [i.argrepr for i in dis.get_instructions(seconds) if i.opname == "BINARY_OP"]
print(ops, seconds.__code__.co_consts)
```
---
**Answer.** Three multiplications, and no folded constant: `days * 24 * 60 * 60` is parsed as `((days * 24) * 60) * 60`, and none of those sub-expressions is all constants.

**Why.** Folding needs a sub-tree made entirely of constants. Writing `days * (24 * 60 * 60)` gives one multiplication by the folded `86400`. The compiler will not reorder operations for you, because `*` can be overloaded and is not guaranteed to be associative.
:::

:::drill bug
A developer "optimised" this function by checking for zero before dividing, to avoid the cost of `try`. In 3.12, which version is faster when `b` is almost never 0, and why?

```python run=c03-d-bug-lbyl nondet
import timeit

def lbyl(a, b):
    if b == 0:
        return None
    return a / b

def eafp(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

t1 = timeit.timeit(lambda: lbyl(10, 3), number=200_000)
t2 = timeit.timeit(lambda: eafp(10, 3), number=200_000)
print("eafp not slower:", t2 < t1 * 1.25)
```
---
**Answer.** They are about the same, and `eafp` can be slightly faster, because a `try` that does not raise costs nothing in 3.11+ while `lbyl` always runs an extra comparison. The "optimisation" gains nothing when zero is rare.

**Why.** With zero-cost exceptions, the choice between the styles should be about clarity and how often the failure happens. If `b == 0` were common, the `if` would win because raising is expensive.
:::

:::drill bug
This code tries to make a function faster by editing its bytecode-level constants and crashes. Why can you not assign to `co_consts`, and what is the supported way to get a modified code object?

```python run=c03-d-bug-replace
def greet():
    return "hello"

try:
    greet.__code__.co_consts = (None, "hi")
except AttributeError as e:
    print("AttributeError:", e)

greet.__code__ = greet.__code__.replace(co_consts=tuple("hi" if c == "hello" else c for c in greet.__code__.co_consts))
print(greet())
```
---
**Answer.** Code objects are immutable, so their attributes are read-only. `code.replace(...)` (3.8+) returns a new code object with some fields changed, and a function's `__code__` attribute can be reassigned.

**Why.** Immutability lets code objects be shared and cached safely. Tools such as coverage and some decorators use `replace` to build modified copies.
:::

## Write the code {#ch03-coding .cd}

:::drill code rating=1200
Write `opcode_histogram(fn)` that returns a `Counter` of the instruction names used by a function, including the code objects of nested functions and comprehensions. Run it on a function that has a nested function.
---
Walk `co_consts` recursively, because nested code objects are stored there.

```python run=c03-c-hist
import dis, types
from collections import Counter

def opcode_histogram(fn):
    counts = Counter()
    stack = [fn.__code__]
    while stack:
        code = stack.pop()
        for ins in dis.get_instructions(code):
            counts[ins.opname] += 1
        stack.extend(c for c in code.co_consts if isinstance(c, types.CodeType))
    return counts

def sample(xs):
    def key(x):
        return -x
    return sorted([x * 2 for x in xs if x], key=key)

print(opcode_histogram(sample).most_common(4))
```

Since 3.12 the comprehension is inlined into `sample`, so its loop instructions appear in `sample`'s own code; the nested `key` function still has its own code object.
:::

:::drill code rating=1500
Write a tiny stack-machine interpreter for arithmetic expressions: compile a Python expression such as `"(a + 2) * b"` to a list of `("LOAD", name)`, `("CONST", value)` and `("OP", symbol)` instructions using `ast`, then execute it with an explicit stack.
---
A post-order walk of the AST emits instructions in stack order, which is exactly how CPython's compiler handles expressions.

```python run=c03-c-vm
import ast, operator

OPS = {ast.Add: "+", ast.Sub: "-", ast.Mult: "*", ast.Div: "/"}
FUNCS = {"+": operator.add, "-": operator.sub, "*": operator.mul, "/": operator.truediv}

def compile_expr(src):
    out = []
    def emit(node):
        if isinstance(node, ast.BinOp):
            emit(node.left)
            emit(node.right)
            out.append(("OP", OPS[type(node.op)]))
        elif isinstance(node, ast.Name):
            out.append(("LOAD", node.id))
        elif isinstance(node, ast.Constant):
            out.append(("CONST", node.value))
        else:
            raise SyntaxError(f"unsupported: {ast.dump(node)}")
    emit(ast.parse(src, mode="eval").body)
    return out

def run(code, env):
    stack, depth = [], 0
    for op, arg in code:
        if op == "LOAD":
            stack.append(env[arg])
        elif op == "CONST":
            stack.append(arg)
        else:
            right, left = stack.pop(), stack.pop()
            stack.append(FUNCS[arg](left, right))
        depth = max(depth, len(stack))
    return stack.pop(), depth

prog = compile_expr("(a + 2) * b - a / 4")
print(prog)
print(run(prog, {"a": 8, "b": 3}))
```

The second number is this program's equivalent of `co_stacksize`.
:::

:::drill code rating=1300
Write a decorator `trace_lines` that prints each line number of the decorated function as it executes, using `sys.settrace`. Show it on a small loop.
---
`sys.settrace` installs a global trace function that is called on each new frame. Returning a local trace function from the `"call"` event turns on `"line"` events for that frame.

```python run=c03-c-trace
import sys, functools

def trace_lines(fn):
    code = fn.__code__
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        lines = []
        def local(frame, event, arg):
            if event == "line":
                lines.append(frame.f_lineno - code.co_firstlineno)
            return local
        def global_trace(frame, event, arg):
            return local if frame.f_code is code else None
        old = sys.gettrace()
        sys.settrace(global_trace)
        try:
            return fn(*args, **kwargs), lines
        finally:
            sys.settrace(old)
    return wrapper

@trace_lines
def total(n):
    s = 0
    for i in range(n):
        s += i
    return s

print(total(3))
```

Line offsets are relative to the `def` line. Debuggers and coverage tools are built on this hook (3.12 also adds the lower-overhead `sys.monitoring` API from PEP 669).
:::

:::drill code rating=1400
Show the effect of specialisation with a measurement: time a function that is always called with ints against the same function called alternately with ints and floats, and print which `BINARY_OP` variant each ends up with.
---
```python run=c03-c-stable nondet
import dis, timeit

def stable(a, b, c):
    return a + b + c

def mixed(a, b, c):
    return a + b + c

for _ in range(1000):
    stable(1, 2, 3)
    mixed(1, 2, 3)
    mixed(1.5, 2.5, 3.5)

def variants(fn):
    return sorted({i.opname for i in dis.get_instructions(fn, adaptive=True) if i.opname.startswith("BINARY_OP")})

print(variants(stable), variants(mixed))
t_stable = timeit.timeit(lambda: stable(1, 2, 3), number=300_000)
t_mixed = timeit.timeit(lambda: (mixed(1, 2, 3), mixed(1.5, 2.5, 3.5)), number=150_000)
print("stable not slower:", t_stable <= t_mixed * 1.2)
```

Both report `BINARY_OP_ADD_INT`. The mixed function specialised for ints first, and every float call then fails the instruction's type guard and runs the slow generic path. CPython only re-specialises after a run of misses, with an exponential back-off, so a call site whose types keep alternating never settles on a good specialisation. That is the real cost of mixing types, and the timing shows it.

The two functions are written separately on purpose. Specialisation is stored in the code object's bytecode, so two function objects that share one code object (for example closures made by the same factory) also share their specialisation state.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- Pipeline: tokens → AST (PEG parser) → symbol table → CFG → bytecode in a code object → eval loop in `ceval.c`.
- Code objects are immutable (`co_code`, `co_consts`, `co_names`, `co_varnames`, `co_stacksize`, `co_exceptiontable`); use `code.replace()` for a modified copy.
- Function object = code object + globals + defaults + closure + `__dict__`.
- CPython is a stack machine; `dis.dis(fn)` shows instructions, `dis.dis(fn, adaptive=True)` shows specialised ones.
- 3.11+: frames live on a per-thread data stack; frame objects are created lazily for tracebacks and debuggers.
- PEP 659 specialisation: `LOAD_ATTR_INSTANCE_VALUE`, `BINARY_OP_ADD_INT`, `LOAD_GLOBAL_MODULE`… guarded by type versions, de-specialised on repeated misses. Keep hot code type-stable.
- Compile-time: constant folding (small results only), list/set literals in `in` become tuple/frozenset constants, dead code removed. No reordering of `a * 24 * 60`.
- 3.11+ zero-cost `try`: an exception table replaces `SETUP_FINALLY`; raising is still expensive.
- Bytecode and `.pyc` magic numbers change every minor version; never rely on them across versions.
