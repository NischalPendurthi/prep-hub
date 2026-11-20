---
name: C++ Guide
short: C++
icon: C++
version: GCC and Clang, C++20
eyebrow: OOP · namespaces · exceptions · memory · move semantics · templates · concurrency · patterns
headline: Know it, then <em>drill it</em>.
lede: Thirty chapters of C++ interview material. Each chapter explains a topic from the ground up, walks through compiled code examples, then gives you drills: concept checks, tricky questions, predict-the-output and find-the-bug snippets, and write-the-code problems with reference solutions. Operating systems and networking have their own guide, the [OS & Networks guide](../os/).
card: Objects and vtables, copy control and casts, namespaces and ADL, exceptions, memory management, move semantics, templates and lambdas, C++ threads and condition variables, and design patterns.
cta: Start with OOP|#ch01; Jump to memory management|#ch07; C++ concurrency|#ch26; Tricky questions|#ch29
search: Search: vtable, ADL, noexcept, NRVO, unique_lock…
---

:::hero A small predict-the-output drill
```cpp run=home-hero
#include <cstdio>
#include <vector>

struct S {
  S()                  { std::puts("ctor"); }
  S(const S&)          { std::puts("copy"); }
  S(S&&) noexcept      { std::puts("move"); }
};
S make() { S s; return s; }

int main() {
  std::vector<S> v;
  v.push_back(make());   // what prints?
}
```

With NRVO, `make()` builds `s` directly in the returned temporary, and `push_back` then moves the temporary into the vector. The usual output is **ctor, move**. Chapters 18 to 22 explain every line.
:::

## How to use the drills

Answer each drill out loud or on paper before you open it, and treat a wrong answer as the main thing to revise. Chapters 1–3 and 7–30 were compiled with GCC 16 and Clang 22 (libc++) in C++20 mode. Programs in chapters 4–6 and 23–28 are run by the site build with GCC, and the output under each is what it printed. Where the answer is undefined behaviour or implementation-defined, the drill says so. Each coding problem has an estimated Codeforces-style rating. Press <kbd>/</kbd> to search.

## Suggested plan

| Week | Read | Drill |
|---|---|---|
| 1 | Ch 1–6 (OOP, copy control, casts, namespaces, exceptions) | All drills, then redo the ones you missed; write the naming service and the fail-safe transfer |
| 2 | Ch 7–11 (new/delete, fragmentation, smart pointers) | The smart-pointer coding problems |
| 3 | Ch 12–17 (allocators, cache) | Write a pool, an arena and an SoA benchmark |
| 4 | Ch 18–25 (moves, elision, templates, lambdas, variadics) | Every predict-the-output drill; write the template set with map, filter and reduce |
| 5 | Ch 26–28 (C++ threads, condition variables, patterns), then Ch 29–30 | Write the bounded-buffer monitor and the State LIFO, then the mock rounds |

## Where the CS 787 material is

Chapters 4–6 and 23–28 cover the CS 787 C++ course: copy constructors and virtual destructors, casts, namespaces and Koenig lookup, exception models for fail-safe programs, templates, traits and lambdas, variadics, the C++ concurrency model with monitors, and the Proxy/RPC, State and Visitor patterns. Each of those chapters reworks the course's example programs, fixes the ones that do not compile, and ends with the course's design exercises.
