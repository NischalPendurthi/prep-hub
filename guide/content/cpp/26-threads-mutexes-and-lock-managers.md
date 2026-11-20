---
title: C++ threads, mutexes and lock managers
part: Part F · Concurrency in C++
lede: The C++ concurrency model starts from tasks, computations that can run alongside each other, and `std::thread`, which runs a task as an operating-system thread. This chapter covers the API from the language side: launching threads from functions, function objects and member functions, `join`, `sleep_for`, `sleep_until` and `yield`, then mutual exclusion with `std::mutex` and the four mutex managers on the course whiteboard: lock guards, unique locks, recursive mutexes and `try_lock`. Each course program that hangs, crashes or does not compile is traced to its cause.
desc: tasks vs threads, std::thread with functions, functors and members, argument passing, join and terminate, this_thread, mutex, lock_guard, unique_lock, scoped_lock, recursive_mutex, try_lock, dining philosophers
hours: 4
prereqs: [Ch 24](#ch24) (lambdas); the [OS guide's thread chapters](../os/#ch01) explain what the kernel does underneath
---

## Tasks and threads {#ch26-model .th}

The course defines two words:

- A **task** is a computation that can potentially run concurrently with other tasks. In C++ it is anything callable: a function, a function object, a lambda, or a member function together with an object.
- A **thread** is the system-level representation of a task: a schedulable stream of execution with its own stack, created by the operating system. On Linux, `std::thread` wraps a pthread.

`std::thread t{task, args...};` starts running the task immediately on a new thread. The program's own thread continues in parallel. Before the `std::thread` object is destroyed, you must either **`join()`** it (wait for it to finish) or **`detach()`** it (let it run on its own). Destroying a thread object that is still *joinable* calls `std::terminate()`.

```cpp run=c26-launch
#include <iostream>
#include <thread>
#include <vector>
using namespace std;

void f(int n, vector<int>& out) { for (int i = 1; i <= n; ++i) out.push_back(i * i); }   // a function

struct Counter {                                    // a function object
  int limit;
  void operator()(vector<int>& out) const { for (int i = 0; i < limit; ++i) out.push_back(i); }
};

class A {
  int val;
public:
  A(int v) : val(v) {}
  void run(int times, vector<int>& out) { for (int i = 0; i < times; ++i) out.push_back(val + i); }   // a member
};

int main() {
  vector<int> r1, r2, r3, r4;
  A a(100);
  thread t1{f, 4, ref(r1)};                         // function + arguments
  thread t2{Counter{3}, ref(r2)};                   // function object
  thread t3{&A::run, &a, 2, ref(r3)};               // member function: pointer to member, then the object
  thread t4{[&r4] { r4 = {7, 8, 9}; }};             // lambda
  t1.join(); t2.join(); t3.join(); t4.join();       // wait for all four before reading the results

  for (auto* v : {&r1, &r2, &r3, &r4}) {
    for (int x : *v) cout << x << ' ';
    cout << '\n';
  }
}
```

Each thread writes only its own vector, and `main` reads them only after `join`, so there is no data race and the output is the same every run.

### How arguments are passed

The `std::thread` constructor **copies** (or moves) every argument into storage owned by the new thread, then calls the task with those copies. So a function taking `vector<int>&` would bind to the thread's private copy, not your variable; it does not even compile, because the copy is passed as an rvalue. To pass a reference on purpose, wrap it in `std::ref` (or `std::cref`), as above. That also makes you responsible for keeping the referenced object alive until the thread is done.

For a member function, the first argument after `&A::run` is the object: a pointer (`&a`, or `a` if it is already a pointer as in the course's `new A()` examples), a reference wrapper, or a copy of the object.

### join, detach and jthread

| | `join()` | `detach()` |
|---|---|---|
| Effect | blocks until the thread finishes | the thread keeps running independently |
| After the call | `joinable()` is false | `joinable()` is false |
| Risk | a thread that never finishes blocks `join` forever (the course's `while (1)` examples never get past the first `join`) | the thread may still be using locals or globals after they are destroyed |

C++20 `std::jthread` joins automatically in its destructor and supports cooperative cancellation through a `std::stop_token`. Prefer it in new code; the course uses `std::thread`, which is what exam questions test.

## The this_thread functions {#ch26-thisthread .th}

`std::this_thread` provides four functions that act on the calling thread:

| Function | Meaning |
|---|---|
| `get_id()` | an opaque `thread::id` for the current thread; printable, comparable, hashable |
| `yield()` | a hint that the scheduler may run another thread now; the implementation may ignore it |
| `sleep_for(duration)` | sleep at least that long |
| `sleep_until(time_point)` | sleep until at least that point in time |

Durations come from `<chrono>`. With `using namespace std;` the literals `300ms` and `2s` are available because `std::chrono_literals` is an inline namespace inside `std`; otherwise write `using namespace std::chrono_literals;` or `chrono::milliseconds(300)`. Use `steady_clock` for measuring intervals, because `system_clock` can jump when the wall clock is adjusted.

```cpp run=c26-sleep
#include <chrono>
#include <iostream>
#include <thread>
using namespace std;

int main() {
  auto start = chrono::steady_clock::now();
  this_thread::sleep_until(start + 50ms);          // the course's sleepuntil.cpp, shortened
  auto waited = chrono::duration_cast<chrono::milliseconds>(chrono::steady_clock::now() - start);
  cout << "waited at least 50 ms: " << boolalpha << (waited >= 50ms) << '\n';
  cout << "same id as main: " << (this_thread::get_id() == this_thread::get_id()) << '\n';
}
```

Sleeping guarantees a *minimum* delay, not an exact one, which is why the course's "Waited 200.12 ms" output varies from run to run.

### Interleaving

With two threads printing in loops, the output **interleaves unpredictably**. Each `<<` on `cout` is a separate call. The standard guarantees that concurrent output to `cout` is not a data race (when synchronised with stdio), but the characters of different statements can mix, and the order between threads is up to the scheduler.

```cpp run=c26-interleave nondet
#include <iostream>
#include <thread>
using namespace std;

void f() { for (int i = 1; i <= 3; i++) { cout << "hello " << i << endl; this_thread::sleep_for(40ms); } }
void g() { for (int i = 21; i <= 23; i++) { cout << "hi " << i << endl; this_thread::sleep_for(30ms); } }

int main() {
  thread t1{f}, t2{g};
  t1.join();
  t2.join();
}
```

The sleeps in the course's `threadedtasks2*.cpp` make the pattern regular (hello every 400 ms, hi every 300 ms), but that is timing, not a guarantee. `yield()` in `yield.cpp` gives the scheduler a chance to switch at chosen points; on an idle multicore machine both threads run in parallel anyway, so yield changes little.

## Mutual exclusion with std::mutex {#ch26-mutex .th}

A **data race** is two threads accessing the same memory location without synchronisation, at least one of them writing. It is undefined behaviour. `counter++` is a read, an add and a write, so two threads incrementing a shared counter lose updates. (The [OS guide's chapter 2](../os/#ch02) shows why at the instruction level.)

A `std::mutex` provides **mutual exclusion**: `lock()` blocks until the calling thread owns the mutex, and `unlock()` releases it. The code between them, the **critical section**, runs in one thread at a time. Which waiting thread gets the mutex next is not specified: the course slide calls this non-deterministic.

```cpp run=c26-counter
#include <iostream>
#include <mutex>
#include <thread>
using namespace std;

long counter = 0;
mutex m;

void work() {
  for (int i = 0; i < 100000; ++i) {
    m.lock();
    ++counter;                 // critical section
    m.unlock();
  }
}

int main() {
  thread t1(work), t2(work);
  t1.join(); t2.join();
  cout << counter << '\n';     // always 200000 with the mutex
}
```

Two bugs in the course's `mutex.cpp` are worth knowing:

1. It does not compile. The mutex is a private member of class `A`, and class `B`'s function uses `mtx` too, where no such name exists.
2. The intent is still wrong. Even if each class had its own mutex, two *different* mutexes do not exclude each other. Threads only exclude each other if they lock the **same** mutex object. The usual fix is one shared mutex (a global, or passed to both) guarding the shared resource, here `cout`.

Calling `lock()` and `unlock()` by hand has a deeper problem: if the critical section throws or returns early, `unlock()` never runs, and every other thread blocks forever. The mutex managers fix that.

## Mutex managers: lock_guard and unique_lock {#ch26-managers .th}

A mutex manager is an RAII object: its constructor locks and its destructor unlocks, so the mutex is released on every path out of the scope, including exceptions. (The course notes spell it "RAAI"; it is RAII, resource acquisition is initialisation.)

| Manager | Lock / unlock by hand | Movable | Notes |
|---|---|---|---|
| `lock_guard<M>` | no | no | the simplest; owns the lock for the whole scope |
| `unique_lock<M>` | yes: `lock()`, `unlock()`, `try_lock()` | yes | can start unlocked (`defer_lock`), try (`try_to_lock`), adopt; needed by `condition_variable` |
| `scoped_lock<Ms...>` (C++17) | no | no | locks several mutexes at once with a deadlock-avoidance algorithm |
| `shared_lock<M>` | yes | yes | shared (reader) ownership of a `shared_mutex` |

`lock_guard` deliberately has no `lock()` or `unlock()` member: the course's commented-out `lg.unlock()` does not compile. In `lock_guards.cpp`, `f` and `g` lock the same member mutex, so one prints all four lines before the other starts.

`unique_lock` allows unlocking in the middle of a scope, letting another thread in while this one sleeps, and relocking later. The destructor unlocks only if the lock is still owned at that point.

```cpp run=c26-unique
#include <iostream>
#include <mutex>
#include <system_error>
#include <thread>
#include <vector>
using namespace std;

mutex m;
vector<string> log_;

void worker(const string& name) {
  unique_lock<mutex> ul(m);          // locked here
  log_.push_back(name + " step 1");
  ul.unlock();                       // let others in while we do unshared work
  this_thread::sleep_for(10ms);
  ul.lock();                         // relock before touching shared data again
  log_.push_back(name + " step 2");
}                                    // destructor unlocks because ul owns the mutex

int main() {
  thread a(worker, "a"), b(worker, "b");
  a.join(); b.join();
  cout << log_.size() << " entries\n";

  unique_lock<mutex> ul(m);
  try {
    ul.lock();                       // already owned by this unique_lock
  } catch (const system_error& e) {
    cout << "relock: " << e.what() << '\n';
  }
}
```

The course file `unique_lock-undefined-behavior-possible-deadlock.cpp` calls `ul.lock()` in every iteration but `ul.unlock()` only in odd ones, so in iteration 0 it locks a `unique_lock` that already owns its mutex. Its comments call that undefined behaviour. For `unique_lock` it is not: the standard says `lock()` throws `std::system_error` with `resource_deadlock_would_occur` when the lock already owns the mutex, and since nothing catches it, the program terminates with "Resource deadlock avoided", as above. What **is** undefined is calling `lock()` on a plain `std::mutex` that the calling thread already holds (in practice, a self-deadlock).

`std::scoped_lock lk(m1, m2);` locks both mutexes without deadlocking, whatever order other threads name them in. Use it whenever a critical section needs two locks.

## recursive_mutex {#ch26-recursive .th}

A thread that already owns a `std::mutex` and locks it again has undefined behaviour, which usually means it deadlocks with itself. That happens naturally with recursion, or when one locked member function calls another. A `std::recursive_mutex` lets the **owning** thread lock it again: it keeps a count, and the mutex is released only when `unlock()` has been called as many times as `lock()`.

The course's `problem-code-recursive_mutex.cpp` uses a recursive mutex in a recursive function, and it hangs:

```cpp
recursive_mutex m;
int f(int x) {
  m.lock();
  if (x == 1) { /* print */ return 1; }        // returns while still locked
  else { int tmp = x + f(x - 1); /* print */ return tmp; }
  m.unlock();                                  // unreachable: both branches return
}
```

Both branches return before `m.unlock()`, so the unlock never runs. Thread 1's `f(10)` locks the mutex ten times and unlocks it zero times, so it finishes still owning the mutex. Thread 2's `f(8)` blocks on its first `lock()` forever, and `t2.join()` never returns. The output is the ten lines of thread 1 (1, 3, 6, … 55), then nothing. The fix is the same as always: a manager, `lock_guard<recursive_mutex> g(m);`, which unlocks once per level as each call returns.

```cpp run=c26-recursive-fixed
#include <iostream>
#include <mutex>
#include <thread>
using namespace std;

recursive_mutex m;
int f(int x) {
  lock_guard<recursive_mutex> g(m);      // released at every return
  return x == 1 ? 1 : x + f(x - 1);
}

int main() {
  int r1 = 0, r2 = 0;
  thread t1([&] { r1 = f(10); });
  thread t2([&] { r2 = f(8); });
  t1.join(); t2.join();
  cout << r1 << ' ' << r2 << '\n';
}
```

A recursive mutex is often a sign that the locking design is unclear. The usual alternative is a public function that locks and a private helper that assumes the lock is held.

## try_lock and the dining philosophers {#ch26-trylock .th}

`m.try_lock()` takes the mutex if it is free and returns `true`, or returns `false` at once without blocking. It is for code that has something better to do than wait, or that must avoid deadlock by backing off. Calling `try_lock` on a `std::mutex` the calling thread already owns is undefined behaviour.

The course's `trylock.cpp` spins `while (!m.try_lock());` and then never unlocks. The first thread to get the mutex prints once, sleeps, loops, and calls `try_lock` on the mutex it already owns: undefined behaviour, in practice `false` forever. Both threads end up spinning, burning two CPU cores, and nothing more is printed. Two lessons: every successful `try_lock` needs an `unlock`, and a `try_lock` busy-loop is a spinlock that wastes CPU; a plain `lock()` sleeps.

`trylock-erroneous.cpp` is two dining philosophers sharing forks `f1` and `f2`. P1 locks `f1` then `f2`. P2 does:

```cpp
if (f2.try_lock()) f2.lock(); else break;
```

If `try_lock` succeeds, P2 already owns `f2`, and the following `f2.lock()` locks it again: undefined behaviour, in practice P2 deadlocks with itself while holding `f2`, and P1 then blocks forever on `f2`. If `try_lock` fails, P2 leaves the loop and never eats again. Either way the program does not do what was meant. (The course's screenshot, where only "Phil 1 eating" ever appears, is the second case.) The underlying issue is the classic one: P1 and P2 take the forks in **opposite orders**, which allows circular wait.

Three correct versions:

1. **Lock ordering.** Every thread takes `f1` before `f2`. Circular wait becomes impossible.
2. **Lock both at once.** `std::scoped_lock lk(f1, f2);` (or `std::lock(f1, f2)`) acquires both without deadlock.
3. **Back off.** Take one fork, `try_lock` the other, and if that fails release the first and retry. Correct, but it can livelock without some randomness.

```cpp run=c26-philosophers
#include <iostream>
#include <mutex>
#include <thread>
using namespace std;

mutex f1, f2;
int meals1 = 0, meals2 = 0;

void P1() { for (int i = 0; i < 1000; ++i) { scoped_lock lk(f1, f2); ++meals1; } }
void P2() { for (int i = 0; i < 1000; ++i) { scoped_lock lk(f2, f1); ++meals2; } }   // opposite order is fine here

int main() {
  thread t1(P1), t2(P2);
  t1.join(); t2.join();
  cout << "P1 ate " << meals1 << ", P2 ate " << meals2 << '\n';
}
```

The four conditions for deadlock (mutual exclusion, hold and wait, no preemption, circular wait) and the strategies against each are covered in the [OS guide's chapter 3](../os/#ch03).

## Drills: threads and locks {#ch26-drills .dr}

:::drill concept
What is the difference between a task and a thread in the C++ model?
---
A task is a computation that may run concurrently with others: any callable (function, function object, lambda, member function plus object). A thread is the system-level representation that actually runs a task, created by `std::thread` and scheduled by the OS.
:::

:::drill tricky
`void f() { while (1) cout << "hello\n"; }` and `main` does `thread t1{f}; thread t2{g}; t1.join(); t2.join();`. Does `t2.join()` ever run? Does `g` run?
---
`g` runs: `t2` starts as soon as it is constructed, in parallel with `t1`. But `t1.join()` waits for a thread that never ends, so `main` never reaches `t2.join()`. The program prints forever until it is killed.
:::

:::drill output
What happens?

```cpp run=c26-d-nojoin expect=error
#include <iostream>
#include <thread>
int main() {
  std::thread t([] {});
}
```
---
`t` is still joinable when its destructor runs at the end of `main`, so the destructor calls `std::terminate()`. GCC prints "terminate called without an active exception" and aborts. Call `join()` or `detach()` first, or use `std::jthread`.
:::

:::drill concept
How do you start a thread running member function `f(int)` of an object `A* a` with the argument 90?
---
`std::thread t{&A::f, a, 90};`. The pointer to member comes first, then the object (a pointer, a reference wrapper or a copy), then the arguments. A lambda works too: `std::thread t{[a] { a->f(90); }};`.
:::

:::drill bug
Why does this not compile, and what is the fix?

```cpp
void fill(std::vector<int>& v) { v.push_back(1); }
std::vector<int> data;
std::thread t(fill, data);
```
---
`std::thread` copies its arguments and passes the copies as rvalues, and a non-const lvalue reference cannot bind to an rvalue. Even if it compiled, `fill` would modify the copy. Pass `std::ref(data)` and make sure `data` outlives the thread.
:::

:::drill concept
Does `this_thread::sleep_for(300ms)` sleep exactly 300 ms? What does `yield()` guarantee?
---
It sleeps at least 300 ms; the thread then has to be scheduled again, so it is often a little longer. `yield()` guarantees nothing: it is a hint that another thread may be run now, and the implementation may return immediately.
:::

:::drill bug
Class `A` has a private `mutex mtx` and locks it in `f`. Class `B`'s `g` also calls `mtx.lock()`. Two threads run `a->f()` and `b->g()`. What is wrong, at compile time and in the design?
---
It does not compile: `mtx` is a member of `A`, so the name does not exist in `B`. If each class had its own mutex, it would compile, but the threads would lock different mutexes and still run their critical sections at the same time. Mutual exclusion needs both threads to lock the same mutex object.
:::

:::drill concept
Why prefer `lock_guard` to calling `lock()` and `unlock()` yourself?
---
RAII: the destructor unlocks on every exit from the scope, including early returns and exceptions. A forgotten or skipped `unlock()` leaves the mutex locked forever and blocks every other thread.
:::

:::drill concept
Name three things `unique_lock` can do that `lock_guard` cannot.
---
Unlock and relock within its scope; start without locking (`defer_lock`) or try (`try_to_lock`) or with a timeout; be moved (returned from a function, stored). It is also the lock type `condition_variable::wait` requires.
:::

:::drill output
`unique_lock<mutex> ul(m);` then, with no unlock in between, `ul.lock();`. What happens?
---
`lock()` throws `std::system_error` with the error condition `resource_deadlock_would_occur` (message "Resource deadlock avoided" on GCC), because the `unique_lock` already owns the mutex. Uncaught, it terminates the program. This is defined behaviour for `unique_lock`; locking a raw `std::mutex` twice from the same thread is undefined.
:::

:::drill tricky
In the course's recursive-mutex program, why does thread 2 never print anything?
---
Every path through `f` returns before `m.unlock()`, so thread 1 locks the recursive mutex ten times and never unlocks it. It finishes still owning the mutex, so thread 2 blocks on its first `lock()` forever. Use `lock_guard<recursive_mutex>`.
:::

:::drill concept
When is a `recursive_mutex` needed, and what is the usual alternative?
---
When the same thread may lock a mutex it already holds, as in recursion or a locked member function calling another locked member function. The alternative is to split each operation into a public function that locks and a private helper that assumes the lock is held.
:::

:::drill bug
What is wrong with `while (1) { while (!m.try_lock()); cout << "f\n"; sleep_for(300ms); }`?
---
There is no `unlock()`. After the first iteration the thread calls `try_lock` on a mutex it already owns (undefined behaviour, in practice it fails forever), and the other thread can never get it either, so both spin at full CPU and nothing else prints. Add `m.unlock()` after the critical section, or use a `lock_guard` and plain blocking `lock()`.
:::

:::drill bug
P2 runs `if (f2.try_lock()) f2.lock(); else break;`. What happens in each branch?
---
If `try_lock` succeeds, P2 owns `f2` and then calls `f2.lock()` again: undefined behaviour, in practice a self-deadlock while holding `f2`, which then blocks P1 too. If it fails, P2 leaves its loop and stops eating. The intended logic was "if I can get `f2`, also take `f1`", and the real fix is a consistent lock order or `std::scoped_lock(f1, f2)`.
:::

:::drill concept
Give two ways to make two philosophers who need forks `f1` and `f2` deadlock-free.
---
Impose a global order (everyone locks `f1` before `f2`), which removes circular wait, or acquire both atomically with `std::scoped_lock` / `std::lock`, which uses a try-and-back-off algorithm internally.
:::

## Write the code {#ch26-coding .cd}

:::drill code rating=1400
Write a thread-safe `Account` class with `deposit`, `withdraw` (returns `false` if funds are short) and a `transfer(Account& from, Account& to, int amount)` free function that cannot deadlock even when two threads transfer in opposite directions. Test with two threads doing 1000 transfers each way.
---
```cpp run=c26-c-account
#include <iostream>
#include <mutex>
#include <thread>
using namespace std;

class Account {
  mutable mutex m;
  int balance;
  friend bool transfer(Account&, Account&, int);
public:
  explicit Account(int b) : balance(b) {}
  void deposit(int x) { lock_guard g(m); balance += x; }
  bool withdraw(int x) { lock_guard g(m); if (balance < x) return false; balance -= x; return true; }
  int get() const { lock_guard g(m); return balance; }
};

bool transfer(Account& from, Account& to, int amount) {
  if (&from == &to) return true;
  scoped_lock lk(from.m, to.m);            // both locks, no deadlock whatever the order
  if (from.balance < amount) return false;
  from.balance -= amount;
  to.balance += amount;
  return true;
}

int main() {
  Account a(10000), b(10000);
  thread t1([&] { for (int i = 0; i < 1000; ++i) transfer(a, b, 3); });
  thread t2([&] { for (int i = 0; i < 1000; ++i) transfer(b, a, 2); });
  t1.join(); t2.join();
  cout << a.get() << ' ' << b.get() << " total " << a.get() + b.get() << '\n';
}
```

Calling `from.withdraw` and then `to.deposit` would take the locks one at a time, so another thread could see the money in neither account. Locking both with `scoped_lock` makes the transfer atomic and deadlock-free. Both accounts start with enough money that every transfer succeeds whatever the interleaving, so the result is deterministic: A ends at 10000 − 3000 + 2000 = 9000. With small balances, some transfers would fail depending on timing, and the final split would vary from run to run (the total would still be conserved).
:::

:::drill code rating=1500
Run N worker threads that each print their own id-tagged line, but make the lines come out strictly in the order thread 0, 1, 2, … using only a mutex, a shared turn counter and `yield()` (no condition variable yet).
---
```cpp run=c26-c-turns
#include <iostream>
#include <mutex>
#include <thread>
#include <vector>
using namespace std;

mutex m;
int turn = 0;

void worker(int id) {
  while (true) {
    {
      lock_guard g(m);
      if (turn == id) { cout << "worker " << id << '\n'; ++turn; return; }
    }
    this_thread::yield();          // not my turn: let others run, then check again
  }
}

int main() {
  vector<thread> ts;
  for (int i = 0; i < 4; ++i) ts.emplace_back(worker, i);
  for (auto& t : ts) t.join();
}
```

This is correct but it busy-waits: each waiting thread keeps waking up, locking and checking. [Ch 27](#ch27) replaces the yield loop with a condition variable, which sleeps until the turn actually changes.
:::

## Cheat sheet {#ch26-cheatsheet .th}

- Task = callable; thread = OS-level runner. `std::thread t{f, args...}` starts now; `join` or `detach` before destruction, or `terminate`.
- Arguments are copied; use `std::ref` for references. Member: `thread t{&A::f, obj_ptr, args...}`.
- `this_thread`: `get_id`, `yield` (a hint), `sleep_for`, `sleep_until` (at least). Output from threads interleaves unpredictably.
- Mutual exclusion only works on the **same** mutex. Raw `lock`/`unlock` leaks the lock on exceptions.
- `lock_guard`: no manual unlock. `unique_lock`: unlock/relock, deferred, movable, for condition variables; relocking an owned `unique_lock` throws `system_error`. `scoped_lock`: several mutexes, deadlock-free.
- `recursive_mutex`: same thread may relock; unlock as many times as locked (use a guard).
- `try_lock`: non-blocking; must still unlock; spinning on it wastes CPU. Opposite lock orders deadlock: order locks or use `scoped_lock`.
