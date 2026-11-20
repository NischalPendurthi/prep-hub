---
name: OS & Networks Guide
short: OS & Net
icon: OS
version: Linux, GCC, C++20
eyebrow: threads · races · mutexes · condition variables · deadlock · IP · TCP · sockets · HTTP
headline: What the <em>kernel and the network</em> are doing.
lede: Six chapters on operating-system threads and synchronisation and on computer networks, for systems interviews. Each chapter builds the picture from the ground up with compiled examples, then drills you on it. The C++ language itself, including `std::thread` and condition variables as an API, is in the [C++ guide](../cpp/).
card: Threads and the scheduler, races, futexes and mutex internals, condition variables and deadlock, network layers and addressing, TCP, UDP, sockets and HTTP.
cta: Start with threads|#ch01; Jump to networks|#ch04; Tricky questions|#ch06
search: Search: futex, deadlock, TIME_WAIT, subnet, epoll…
---

## How to use the drills

Answer each drill out loud or on paper before you open it, and treat a wrong answer as the main thing to revise. Code examples were compiled with GCC 16 and Clang 22 on Linux. Press <kbd>/</kbd> to search.

## Suggested plan

| Week | Read | Drill |
|---|---|---|
| 1 | Ch 1–3 (threads, locks, condition variables, deadlock) | Thread and lock drills, then write the bounded queue and the reader-writer lock |
| 2 | Ch 4–5 (layers, addressing, TCP, UDP, sockets, HTTP) | Network drills, then the echo server |
| 3 | Ch 6 | The tricky questions and the timed round, then redo every drill you missed |

The MCQ banks for [operating systems](../../mcq/) and networks are the place for numericals and quick recall.
