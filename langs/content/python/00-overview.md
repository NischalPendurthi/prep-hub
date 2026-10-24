---
name: Python internals
short: Python
icon: Py
version: CPython 3.12
eyebrow: objects · bytecode · memory · data model · generators · GIL
headline: See what <em>CPython</em> really does.
lede: Twelve chapters on how CPython works underneath, written for interviews where "it just works" is not an answer. Each chapter explains one layer of the interpreter, proves every claim with a program and its real output, and then gives you about twenty drills: concept checks, tricky questions, predict-the-output and find-the-bug snippets, and coding problems with reference solutions.
card: How CPython runs your code: objects and refcounts, bytecode and the eval loop, dict and list internals, descriptors and metaclasses, generators, asyncio and the GIL.
cta: Start with objects|#ch01; Jump to memory|#ch04; Mock rounds|#ch13
search: Search: refcount, LOAD_ATTR, __slots__, GIL…
---

:::hero A small predict-the-output drill
```python run=home-hero
a = [1, 2]
b = a
a += [3]
a = a + [4]
print(a, b)
```

`+=` on a list calls `__iadd__`, which extends the list in place, so `b` sees the 3. `a + [4]` builds a new list and rebinds only `a`. The output is **[1, 2, 3, 4] [1, 2, 3]**. Chapter 1 explains why.
:::

## How to use the drills

Answer each drill out loud or on paper before you open it, and treat a wrong answer as the thing to revise. Predict-the-output snippets were run with CPython 3.12. Where a result depends on the version or on CPython rather than the language, the answer says so. Press <kbd>/</kbd> to search, and use the contents list on the right to move around a chapter.

## Suggested plan

| Week | Read | Drill |
|---|---|---|
| 1 | Ch 1–3 (objects, names, bytecode) | All drills in Ch 1–3, then use `dis` on your own functions |
| 2 | Ch 4–6 (memory, containers, strings) | Memory and container drills, then write the LRU cache and the interning pool |
| 3 | Ch 7–9 (data model, attributes, classes) | Descriptor and metaclass drills, then write a validated-field descriptor |
| 4 | Ch 10–12 (generators, GIL, imports) | Generator, asyncio and threading drills, then the rate limiter and the mini event loop |
| 5 | Ch 13 | Two timed mock rounds, then redo every drill you missed |

## What "CPython" means here

Python is a language specification, and CPython is the reference implementation written in C. Most interview questions about "how Python works" are really about CPython: reference counting, the GIL, `id()` returning an address and the small-int cache are all CPython details. PyPy, for example, uses a tracing JIT and a moving garbage collector instead. The guide marks these points as CPython behaviour so you can say so in an interview.
