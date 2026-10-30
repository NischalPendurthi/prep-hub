---
name: Compilers & ML compilers
short: Compilers
icon: CC
version: Toy compilers in Python 3.12, NumPy and C
eyebrow: IRs · SSA · LLVM · MLIR · ONNX · scheduling · memory planning · quantization · NPUs
headline: From <em>source code and model graphs</em> to instructions a chip can run.
lede: Five chapters for students who know C++, Python and basic neural networks but have not taken a compilers course. Each chapter explains one stage of the path from a program or a trained model down to hardware, and builds a small working version of it. You write a constant folder, a register colourer, a shape-inference pass, a scheduler, a memory planner and an integer-only quantized multiply, and every output shown comes from running that code.
card: Compiler phases, SSA and register allocation, reading LLVM IR and MLIR, ONNX and TFLite graphs, operator scheduling, tensor memory planning, integer quantization and NPU dataflow, with toy implementations you can run.
cta: Start with IRs and SSA|#ch01; Jump to memory planning|#ch04; Quantization|#ch05
search: Search: phi node, liveness, broadcasting, NHWC, zero point…
---

:::hero A compiler you already use
```python run=cc-home-hero
def seconds_in_a_day():
    return 60 * 60 * 24

print(seconds_in_a_day.__code__.co_consts)
print(seconds_in_a_day())
```

CPython's compiler multiplied the numbers before the function ever ran, so the function stores **86400** and no multiplication happens at run time. That transformation is called constant folding. Chapter 1 builds it from scratch, and Chapter 3 applies the same idea to neural network graphs.
:::

## What this guide covers

A classic compiler takes source code, turns it into an intermediate representation (IR), improves the IR, and emits machine code. An ML compiler does the same job with a different input: its source is a graph of tensor operators exported from a framework, and its target is often an accelerator with fixed-function units and small on-chip memory. The two share more than you might expect. Dead code elimination, topological ordering, lifetime analysis and pattern rewriting appear in both.

| Chapter | Topic | You build |
|---|---|---|
| [1](#ch01) | IRs, SSA and optimisation passes | CFG builder, phi placement, constant folder and DCE, value numbering, register colouring |
| [2](#ch02) | LLVM and MLIR | Tree-covering instruction selector, greedy pattern rewriter, a checked lowering from matmul to loops |
| [3](#ch03) | ONNX and TFLite graphs, shapes, layouts | Broadcasting, shape inference, topological sort, a tracing exporter, operator fusion |
| [4](#ch04) | Lowering, scheduling, memory planning | List scheduler, schedule-versus-peak search, greedy memory planner, tiling, spilling |
| [5](#ch05) | Quantization and NPU / PIM dataflow | Integer-only multiply, per-channel weights, systolic array simulator, bit-sliced crossbar model, co-simulation against a reference |

## Suggested plan

| Sessions | Read | Drill |
|---|---|---|
| 1 and 2 | Ch 1 | Trace the liveness and colouring program by hand, then do all drills |
| 3 | Ch 2 | Read the LLVM IR and MLIR samples out loud, line by line |
| 4 | Ch 3 | Do shape inference on paper for a network you know |
| 5 and 6 | Ch 4 | Write the memory planner without looking, then change its ordering heuristic |
| 7 and 8 | Ch 5 | Derive the quantized multiply formula on paper, then do the overflow drills |

## How to use the drills

Answer each drill out loud before opening it, and include the reason. Follow-up questions in these interviews usually ask what breaks, for example "when is this fold illegal?" or "why can't that tensor be updated in place?". Press <kbd>/</kbd> to search, and use the contents list on the right to move around a chapter.

## What is real and what is illustrative

Every block with an output below it was executed when the site was built, and the output is the real one. The Python and C programs are toys: they are small enough to read in one sitting and they skip most of what production compilers handle, such as error recovery, aliasing and control flow in graphs.

LLVM IR, MLIR, ONNX and TFLite samples cannot run in this site's build, so they appear as plain code blocks labelled **illustrative**. Their syntax follows the real formats, but tool versions differ, and printed details such as attribute spelling change between releases. The material on NPUs and processing-in-memory describes a general model. Each chip differs, so treat it as a vocabulary for asking good questions about a specific design.
