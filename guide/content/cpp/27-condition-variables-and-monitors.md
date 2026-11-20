---
title: Condition variables and monitors
part: Part F · Concurrency in C++
lede: A mutex stops two threads from being in a critical section at once, but it cannot make a thread wait until something becomes true, such as "the buffer has an item" or "it is my turn". Condition variables do that. They are also where most concurrency bugs in exams live: notifications sent before anyone waits, waits with no condition, and wake-ups that happen for no reason. This chapter traces each of the course's problematic programs, then builds the correct patterns (ping-pong, bounded buffer, rendezvous), compares semaphores with monitors, and finishes with the course workout: a bounded-buffer monitor served to clients over sockets.
desc: wait and notify, lost and spurious wakeups, wait with a predicate, the problematic cond-var programs, producer-consumer, rendezvous and barriers, semaphores vs monitors, monitor bounded-buffer server over TCP
hours: 4
prereqs: [Ch 26](#ch26) (threads, mutexes, unique_lock); [OS guide ch 3](../os/#ch03) covers the kernel side
---

## What a condition variable does {#ch27-cv .th}

A `std::condition_variable` lets a thread sleep until another thread tells it that something may have changed. It always works together with a mutex and some **shared state** that the mutex protects; the condition variable itself stores no state at all.

- `cv.wait(ul)` must be called with `ul` (a `unique_lock`) holding the mutex. It **atomically** releases the mutex and puts the thread to sleep. When the thread wakes up, `wait` re-acquires the mutex before returning.
- `cv.notify_one()` wakes one waiting thread (if any). `cv.notify_all()` wakes all of them; they then take turns acquiring the mutex.
- A notification is **not remembered**. If no thread is waiting at the moment of `notify`, the notification is simply lost.
- A waiting thread may also wake up with no notification at all: a **spurious wakeup**. The standard allows it, and real implementations do it.

Those last two facts mean a bare `cv.wait(ul)` is almost always a bug. The thread must wait for a **condition on the shared state**, and check it again after every wakeup:

```cpp
unique_lock ul(m);
while (!ready) cv.wait(ul);        // re-check after every wakeup
// or, equivalently:
cv.wait(ul, [] { return ready; });
```

If the condition is already true, the thread does not wait at all, so a notification sent "too early" does no harm, because the state change it announced is still visible in `ready`. And a spurious wakeup just loops back to sleep.

`wait` needs a `unique_lock` rather than a `lock_guard` because it must unlock and relock the mutex internally.

:::key The rule
Change the shared state while holding the mutex, then notify. Wait in a loop on a predicate over that state, never on the notification alone.
:::

## The problematic programs {#ch27-problems .th}

The course's three `problematic-cond-var` programs all run this function in two threads. Each thread locks the mutex, waits, prints four lines when woken, notifies the other thread, and waits again:

```cpp
void f() {
  unique_lock<mutex> ul(m);
  while (1) {
    cv.wait(ul);                       // no condition: waits for a notification, full stop
    for (int i = 0; i < 4; i++) { cout << this_thread::get_id() << " " << i << endl; sleep_for(300ms); }
    cv.notify_one();
  }
}
```

**Version 0** never notifies from `main`. Both threads wait for a notification that nobody sends. The program prints nothing and hangs forever.

**Version 1** calls `cv.notify_one()` in `main` right after creating the threads. At that moment the threads have usually not reached `wait` yet, so the notification is lost, and the program hangs with no output, exactly like version 0. On some runs one thread is already waiting: it prints its four lines and calls `notify_one()`. But the other thread may still be blocked *acquiring the mutex* in `unique_lock ul(m)` rather than waiting on the condition variable. That notification is lost too, both threads end up in `wait`, and the program hangs after four lines. The screenshot that comes with the course files shows this: one thread's four lines, then nothing.

**Version 2** sleeps 100 ms in `main` before notifying, so both threads are almost certainly waiting by then. Now it ping-pongs: thread A prints four lines and notifies; B wakes, but cannot return from `wait` until A releases the mutex inside its own next `wait`; then B prints and notifies A, and so on. It "works", but only because of the sleep, and a spurious wakeup could still let both threads believe it is their turn. The program is correct by timing, not by design.

The fix for all three: put the turn in shared state and wait on it.

```cpp run=c27-pingpong
#include <condition_variable>
#include <iostream>
#include <mutex>
#include <thread>
using namespace std;

mutex m;
condition_variable cv;
int turn = 0;                          // shared state: whose turn it is

void player(int me, const char* name) {
  for (int round = 0; round < 3; ++round) {
    unique_lock<mutex> ul(m);
    cv.wait(ul, [&] { return turn == me; });     // safe against lost and spurious wakeups
    for (int i = 0; i < 2; ++i) cout << name << ' ' << i << '\n';
    turn = 1 - me;                     // change the state under the lock...
    cv.notify_all();                   // ...then wake the other player
  }
}

int main() {
  thread a(player, 0, "A"), b(player, 1, "B");   // no sleeps, no lucky timing
  a.join(); b.join();
}
```

The output is identical on every run, whichever thread starts first: if B arrives first, its predicate is false, so it waits; if A notifies before B waits, B's predicate is already true and it never blocks.

### The rendezvous programs

`rendezvous-prob0.cpp` starts three threads that each wait (bare `wait` again), sleeps 300 ms, and calls `notify_one()`. The woken thread prints, then calls `notify_all()`, which releases the other two in turn. Two bugs:

1. Only `t1` and `t2` are joined. When `main` returns, `t3` is still a joinable `std::thread`, its destructor calls `std::terminate`, and the program aborts ("terminate called without an active exception"), typically in the middle of the third thread's output.
2. It depends on the 300 ms sleep. A thread that has not reached `wait` by then misses the notification and waits forever.

`rendezvous-prob1.cpp`: thread 0 prints and calls `notify_all()`; thread 1 calls `wait`. Thread 0 is created first and usually finishes before thread 1 even reaches `wait`, so the notification is lost and thread 1 (and `t2.join()`) waits forever. The output is 0, 1, 2, 3 and then a hang. The fix is a flag (`bool done`), set by thread 0 under the lock and tested by thread 1 in its predicate.

## Producer and consumer {#ch27-boundedbuffer .th}

A **bounded buffer** holds at most N items. Producers must wait while it is full, consumers while it is empty. The course's `2prodcon-one-prob.cpp` does this with one mutex, one condition variable and predicates:

```cpp
cv.wait(ul, [] { return NITEMS < CAP; });   // producer
cv.wait(ul, [] { return NITEMS != 0; });    // consumer
```

It is correct for one producer and one consumer. Its weaknesses show up when you scale it (the "one problem" in the file name):

- It keeps a counter `NITEMS` next to `buff.size()`: two variables that must always agree. Use one.
- One condition variable serves two different conditions ("not full" and "not empty"), so it must use `notify_all`, waking every thread of both kinds even though at most one can proceed. With `notify_one` and several producers and consumers, a producer could wake another producer and the only consumer would sleep on: a lost wakeup in disguise.
- The global array `A[5]` is never used.

The clean version is a class with two condition variables, so each notification goes to a thread that can use it:

```cpp run=c27-bounded
#include <condition_variable>
#include <iostream>
#include <mutex>
#include <queue>
#include <thread>
#include <vector>
using namespace std;

class BoundedBuffer {                         // a monitor: every public function holds the lock
  mutex m;
  condition_variable notFull, notEmpty;
  queue<int> q;
  const size_t cap;
  size_t maxSeen = 0;
public:
  explicit BoundedBuffer(size_t c) : cap(c) {}
  void produce(int x) {
    unique_lock ul(m);
    notFull.wait(ul, [&] { return q.size() < cap; });
    q.push(x);
    maxSeen = max(maxSeen, q.size());
    notEmpty.notify_one();                    // exactly one consumer can use one new item
  }
  int consume() {
    unique_lock ul(m);
    notEmpty.wait(ul, [&] { return !q.empty(); });
    int x = q.front();
    q.pop();
    notFull.notify_one();                     // one slot freed: one producer can proceed
    return x;
  }
  size_t peak() { lock_guard g(m); return maxSeen; }
};

int main() {
  BoundedBuffer buf(5);
  const int perProducer = 10000;
  long sums[2] = {0, 0};
  vector<thread> ts;
  for (int p = 0; p < 2; ++p)
    ts.emplace_back([&, p] { for (int i = 1; i <= perProducer; ++i) buf.produce(p * perProducer + i); });
  for (int c = 0; c < 2; ++c)
    ts.emplace_back([&, c] { for (int i = 0; i < perProducer; ++i) sums[c] += buf.consume(); });
  for (auto& t : ts) t.join();

  long n = 2L * perProducer;
  cout << "consumed total " << sums[0] + sums[1] << ", expected " << n * (n + 1) / 2 << '\n';
  cout << "buffer never exceeded capacity: " << boolalpha << (buf.peak() <= 5) << '\n';
}
```

Which consumer gets which item varies from run to run, so the program prints only facts that are true on every run: every item was consumed exactly once, and the buffer never held more than five.

## Rendezvous and barriers {#ch27-barrier .th}

A **rendezvous** (or barrier) makes N threads wait until all N have arrived, then releases them together. The condition is "the count of arrivals reached N", and a **generation** number lets the same barrier be reused for the next phase without a fast thread lapping a slow one:

```cpp run=c27-barrier
#include <condition_variable>
#include <iostream>
#include <mutex>
#include <thread>
#include <vector>
using namespace std;

class Barrier {
  mutex m;
  condition_variable cv;
  const int n;
  int arrived = 0, generation = 0;
public:
  explicit Barrier(int count) : n(count) {}
  void arriveAndWait() {
    unique_lock ul(m);
    int gen = generation;
    if (++arrived == n) { arrived = 0; ++generation; cv.notify_all(); return; }   // last one releases everyone
    cv.wait(ul, [&] { return gen != generation; });
  }
};

int main() {
  const int N = 3, PHASES = 3;
  Barrier bar(N);
  mutex lm;
  vector<int> order;                       // phase number of each completed step, in completion order
  vector<thread> ts;
  for (int id = 0; id < N; ++id)
    ts.emplace_back([&] {
      for (int ph = 0; ph < PHASES; ++ph) {
        { lock_guard g(lm); order.push_back(ph); }
        bar.arriveAndWait();               // nobody starts phase ph+1 until all finished phase ph
      }
    });
  for (auto& t : ts) t.join();
  for (int ph : order) cout << ph;
  cout << '\n';
}
```

The output is always `000111222`: every thread finishes a phase before any thread begins the next. C++20 provides this as `std::barrier` (reusable) and `std::latch` (single use), in `<barrier>` and `<latch>`.

## Semaphores and monitors {#ch27-monitors .th}

The course's monitor lecture contrasts two classic tools.

A **semaphore** is an integer `S` with two atomic operations. **P** (wait, "proberen") blocks while `S` is 0, then decrements it. **V** (signal, "verhogen") increments it and wakes a waiter. With `S = 1` it is a lock: `S.P(); critical section; S.V();`. With `S = k` it lets k threads in at once. If the semaphore is **fair** (waiters are woken in FIFO order), no thread waits forever; if not, a thread can be passed over repeatedly, which is **starvation**. Unlike a mutex, a semaphore has no owner: any thread may call V. C++20 has `std::counting_semaphore<Max>` and `std::binary_semaphore` with `acquire()` (P) and `release()` (V).

A **monitor** is an object that packages shared data with the only procedures allowed to touch it. Its **entries** (public operations) run with mutual exclusion on the whole monitor, and inside an entry a thread can wait on a condition until another entry wakes it. In C++ a monitor is a class with a private mutex, private condition variables and private data, in which every public member function starts by locking: `BoundedBuffer` above is exactly the course's bounded-buffer server:

```text
entry produce() { if full, wait for a free slot; add an item; wake one waiting consumer }
entry consume() { if empty, wait for an item; take an item; wake one waiting producer }
```

(The slide's `consume` says "if full, wait for a producer"; it means if *empty*.)

| | Semaphore | Monitor |
|---|---|---|
| What it is | a counter with P and V | an object: data + entries + conditions |
| Mutual exclusion | by convention: every caller must pair P and V correctly | automatic for every entry |
| Waiting for a condition | encode it in counters (`empty`, `full` semaphores) | wait on a condition variable with a predicate |
| Typical mistakes | a missing V, P and V in the wrong order, deadlock | forgetting to re-check the condition after waking |

A semaphore is lower level and scattered across every caller; a monitor keeps the protocol inside one class, which is why the course builds servers as monitors.

```cpp run=c27-semaphore
#include <atomic>
#include <iostream>
#include <semaphore>
#include <thread>
#include <vector>
using namespace std;

counting_semaphore<3> slots(3);            // at most 3 threads inside at once
atomic<int> inside{0}, peak{0};

void job() {
  slots.acquire();                         // P
  int now = ++inside;
  int p = peak.load();
  while (now > p && !peak.compare_exchange_weak(p, now)) {}
  this_thread::sleep_for(5ms);
  --inside;
  slots.release();                         // V
}

int main() {
  vector<thread> ts;
  for (int i = 0; i < 10; ++i) ts.emplace_back(job);
  for (auto& t : ts) t.join();
  cout << "never more than 3 inside: " << boolalpha << (peak.load() <= 3) << '\n';
}
```

## Design: a monitor server over sockets {#ch27-server .th}

The course workout: using the networking code from earlier classes, implement a bounded-buffer monitor and test it with simultaneously executing clients from a different machine.

The design has three layers:

1. **The monitor**: `BoundedBuffer` as above. It knows nothing about networking.
2. **The server**: listens on a TCP port and starts one thread per accepted connection. Each connection thread reads one request per line, calls the matching monitor entry, and writes the reply. A `GET` on an empty buffer simply blocks inside `consume()`, so the client waits for its reply until a producer client adds something. The monitor's waiting becomes the network's waiting.
3. **The protocol**: text lines. `PUT 42` → `OK`, `GET` → `42`, `QUIT` closes the connection. Text is easy to test with `nc` and avoids byte-order issues; a binary protocol would send integers with `htonl`.

The program below runs the server and four clients in one process over the loopback interface, so it can be tested anywhere. Two clients produce 100 items each and two consume 100 each, all at the same time, through a buffer of capacity 4. To use a second machine, run the server part alone, bind to `INADDR_ANY`, and point the clients at the server's IP address.

```cpp run=c27-server timeout=60
#include <arpa/inet.h>
#include <condition_variable>
#include <iostream>
#include <mutex>
#include <netinet/in.h>
#include <queue>
#include <string>
#include <sys/socket.h>
#include <thread>
#include <unistd.h>
#include <vector>
using namespace std;

class BoundedBuffer {                              // the monitor
  mutex m;
  condition_variable notFull, notEmpty;
  queue<int> q;
  const size_t cap;
public:
  explicit BoundedBuffer(size_t c) : cap(c) {}
  void produce(int x) {
    unique_lock ul(m);
    notFull.wait(ul, [&] { return q.size() < cap; });
    q.push(x);
    notEmpty.notify_one();
  }
  int consume() {
    unique_lock ul(m);
    notEmpty.wait(ul, [&] { return !q.empty(); });
    int x = q.front();
    q.pop();
    notFull.notify_one();
    return x;
  }
};

// Read one '\n'-terminated line from a socket. Returns false on EOF.
bool readLine(int fd, string& line) {
  line.clear();
  char c;
  while (true) {
    ssize_t n = recv(fd, &c, 1, 0);
    if (n <= 0) return false;
    if (c == '\n') return true;
    line += c;
  }
}
void sendLine(int fd, const string& s) {
  string out = s + "\n";
  for (size_t sent = 0; sent < out.size();) {
    ssize_t n = send(fd, out.data() + sent, out.size() - sent, MSG_NOSIGNAL);
    if (n <= 0) return;
    sent += n;
  }
}

void serveClient(int fd, BoundedBuffer& buf) {      // one thread per connection
  string req;
  while (readLine(fd, req)) {
    if (req.rfind("PUT ", 0) == 0) { buf.produce(stoi(req.substr(4))); sendLine(fd, "OK"); }
    else if (req == "GET") sendLine(fd, to_string(buf.consume()));   // may block until a producer PUTs
    else if (req == "QUIT") break;
    else sendLine(fd, "ERR");
  }
  close(fd);
}

int connectTo(int port) {
  int fd = socket(AF_INET, SOCK_STREAM, 0);
  sockaddr_in addr{};
  addr.sin_family = AF_INET;
  addr.sin_port = htons(port);
  inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr);
  if (connect(fd, (sockaddr*)&addr, sizeof addr) < 0) { perror("connect"); exit(1); }
  return fd;
}

int main() {
  // --- server: socket, bind, listen, then accept in a loop
  int lfd = socket(AF_INET, SOCK_STREAM, 0);
  int yes = 1;
  setsockopt(lfd, SOL_SOCKET, SO_REUSEADDR, &yes, sizeof yes);
  sockaddr_in addr{};
  addr.sin_family = AF_INET;
  addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);   // INADDR_ANY to accept other machines
  addr.sin_port = 0;                               // let the kernel pick a free port
  bind(lfd, (sockaddr*)&addr, sizeof addr);
  listen(lfd, 16);
  socklen_t len = sizeof addr;
  getsockname(lfd, (sockaddr*)&addr, &len);
  int port = ntohs(addr.sin_port);

  BoundedBuffer buf(4);
  const int CLIENTS = 4;
  thread acceptor([&] {
    vector<thread> workers;
    for (int i = 0; i < CLIENTS; ++i) {
      int cfd = accept(lfd, nullptr, nullptr);
      workers.emplace_back(serveClient, cfd, ref(buf));
    }
    for (auto& w : workers) w.join();
  });

  // --- clients: two producers and two consumers, running at the same time
  const int N = 100;
  long got[2] = {0, 0};
  vector<thread> clients;
  for (int p = 0; p < 2; ++p)
    clients.emplace_back([&, p] {
      int fd = connectTo(port);
      string reply;
      for (int i = 1; i <= N; ++i) { sendLine(fd, "PUT " + to_string(p * N + i)); readLine(fd, reply); }
      sendLine(fd, "QUIT");
      close(fd);
    });
  for (int c = 0; c < 2; ++c)
    clients.emplace_back([&, c] {
      int fd = connectTo(port);
      string reply;
      for (int i = 0; i < N; ++i) { sendLine(fd, "GET"); readLine(fd, reply); got[c] += stol(reply); }
      sendLine(fd, "QUIT");
      close(fd);
    });
  for (auto& t : clients) t.join();
  acceptor.join();
  close(lfd);

  cout << "consumers received a total of " << got[0] + got[1] << " (expected " << (2 * N) * (2 * N + 1) / 2 << ")\n";
}
```

Points to make when presenting the design:

- **Separation.** The monitor does the synchronisation; the server only translates lines into entry calls. You can unit-test the monitor without sockets.
- **Blocking is per connection.** A `GET` that blocks holds up only its own connection thread, while other clients' requests proceed. A single-threaded server would deadlock as soon as a consumer blocked before any producer had connected.
- **Thread-per-connection** is simple and fine for a handful of clients. For thousands, use a thread pool or an event loop with `epoll` (see the [OS guide's chapter 5](../os/#ch05)).
- **Failure.** A client that disconnects while its `GET` is blocked will get its reply sent to a closed socket; `MSG_NOSIGNAL` stops that from killing the server with `SIGPIPE`. A real server would also need timeouts and a way to shut down.

## Drills: condition variables {#ch27-drills .dr}

:::drill concept
What exactly does `cv.wait(ul)` do, in order?
---
With `ul` holding the mutex, it atomically releases the mutex and blocks the thread on the condition variable. When the thread is woken (by a notify or spuriously), it re-acquires the mutex, and only then does `wait` return. The atomic release is what prevents a notification from slipping in between unlocking and sleeping.
:::

:::drill concept
What are a lost wakeup and a spurious wakeup, and what single coding rule protects against both?
---
A lost wakeup is a `notify` sent when no thread is waiting yet; condition variables do not remember notifications, so a thread that waits afterwards sleeps forever. A spurious wakeup is a return from `wait` with no notify. The rule: wait for a predicate on shared state, `cv.wait(ul, pred)` (or `while (!pred) cv.wait(ul);`). An early notify is harmless because the state already says "go", and a spurious wakeup just re-checks and sleeps again.
:::

:::drill output
Two threads run `unique_lock ul(m); while (1) { cv.wait(ul); …print…; cv.notify_one(); }`. `main` creates them and joins them, with no notify anywhere else. What is printed?
---
Nothing, ever. Both threads wait for a notification that no one sends, and `main` blocks in `join` forever. This is the course's version 0.
:::

:::drill tricky
Same threads, but `main` calls `cv.notify_one()` right after creating them. Why does it usually hang with no output, and how can it hang after printing exactly four lines?
---
The threads usually have not reached `wait` when `main` notifies, so the notification is lost. If one thread was already waiting, it wakes, prints four lines and notifies, but the second thread may still be blocked acquiring the mutex in its `unique_lock` constructor rather than waiting on the condition variable, so that notification is lost too and both threads then wait forever.
:::

:::drill tricky
Version 2 sleeps 100 ms in `main` before notifying and then ping-pongs correctly. Why is it still wrong?
---
It relies on timing: on a loaded machine a thread might not reach `wait` within 100 ms, and the notification would be lost. It also has no state saying whose turn it is, so a spurious wakeup could let a thread print out of turn. Correctness should come from a predicate (`turn == me`), not from sleeps.
:::

:::drill bug
`rendezvous-prob0.cpp` starts `t1`, `t2` and `t3` but joins only `t1` and `t2`. What happens at the end of `main`?
---
`t3` is still joinable when `main` returns, so its destructor calls `std::terminate()` and the program aborts with "terminate called without an active exception", usually in the middle of the last thread's output. Join every thread (or use `jthread`).
:::

:::drill bug
Thread 0 prints and calls `notify_all()`. Thread 1 calls `cv.wait(l)` with no predicate. Why does the program usually hang?
---
Thread 0 is created first and usually notifies before thread 1 reaches `wait`. The notification is lost, so thread 1 waits forever and the `join` never returns. Add `bool done = false;`, set it under the lock in thread 0, and have thread 1 wait with `[] { return done; }`.
:::

:::drill concept
Why does a bounded buffer with one condition variable for both "not full" and "not empty" need `notify_all` rather than `notify_one` when there are several producers and consumers?
---
With one shared condition variable, `notify_one` might wake a thread of the wrong kind: a producer's notification meant for consumers could wake another producer, which finds the buffer still full and goes back to sleep, while the consumers sleep on. `notify_all` avoids that at the cost of waking everyone. Two condition variables (`notFull`, `notEmpty`) let each `notify_one` reach a thread that can proceed.
:::

:::drill concept
Should you notify while holding the mutex or after releasing it?
---
Either is correct, as long as the state change was made under the mutex. Notifying after unlocking can avoid a woken thread immediately blocking on the mutex the notifier still holds. Notifying under the lock is simpler to reason about and needed if the condition variable might be destroyed right after the state change. The state change itself must always be under the lock.
:::

:::drill concept
Why does a reusable barrier keep a generation counter instead of just waiting for `arrived == n`?
---
The last thread resets `arrived` to 0 so the barrier can be reused. A woken thread checking `arrived == n` would see 0 and go back to sleep. Worse, a fast thread could re-enter for the next phase and increment `arrived` before slow threads have woken. Waiting for "the generation changed" is unaffected by both.
:::

:::drill concept
Compare a semaphore and a mutex. Can a semaphore be used as a lock?
---
A binary semaphore initialised to 1 gives mutual exclusion with P before and V after the critical section. But a semaphore has no owner: any thread may call V, so a bug can release a lock someone else holds. A mutex is owned by the locking thread, which allows error checking and priority inheritance. Counting semaphores also allow k threads in, which a mutex cannot.
:::

:::drill concept
What makes an object a monitor, and how do you write one in C++?
---
Its shared data is private, every entry (public operation) executes with mutual exclusion on the whole object, and entries can wait on conditions until another entry signals them. In C++: a class with a private mutex, private condition variables and private data, where every public member function begins by locking the mutex (`unique_lock` when it may wait) and waits with predicates.
:::

:::drill tricky
In the monitor server, why is one thread per client connection needed, rather than one server thread handling every client in turn?
---
A `GET` on an empty buffer blocks inside `consume()` until a producer adds an item. With one server thread, that block would stop the server from reading the producer's `PUT`, so it could never be unblocked: a deadlock. With a thread per connection, a blocked consumer holds up only its own connection.
:::

## Write the code {#ch27-coding .cd}

:::drill code rating=1500
Write three threads that print `1 2 3 1 2 3 1 2 3` in order, thread k printing only the number k, using one mutex, one condition variable and a shared counter.
---
```cpp run=c27-c-123
#include <condition_variable>
#include <iostream>
#include <mutex>
#include <thread>
#include <vector>
using namespace std;

mutex m;
condition_variable cv;
int next_ = 1;                         // who prints next

void printer(int me) {
  for (int round = 0; round < 3; ++round) {
    unique_lock ul(m);
    cv.wait(ul, [&] { return next_ == me; });
    cout << me << ' ';
    next_ = me % 3 + 1;
    cv.notify_all();                   // all: only the right thread's predicate becomes true
  }
}

int main() {
  vector<thread> ts;
  for (int k = 3; k >= 1; --k) ts.emplace_back(printer, k);   // started in reverse: order still correct
  for (auto& t : ts) t.join();
  cout << '\n';
}
```

`notify_one` would be a bug here: it might wake the thread whose turn it is not, which re-checks, sleeps again, and leaves the right thread asleep.
:::

:::drill code rating=1600
Implement a `Semaphore` class (P/V, or `acquire`/`release`) with a mutex and a condition variable, then use two of them, `empty` and `full`, plus a mutex to build the bounded buffer in the classic semaphore style.
---
```cpp run=c27-c-sem
#include <condition_variable>
#include <iostream>
#include <mutex>
#include <queue>
#include <thread>
using namespace std;

class Semaphore {
  mutex m;
  condition_variable cv;
  int count;
public:
  explicit Semaphore(int c) : count(c) {}
  void P() { unique_lock ul(m); cv.wait(ul, [&] { return count > 0; }); --count; }
  void V() { { lock_guard g(m); ++count; } cv.notify_one(); }
};

const int CAP = 3;
Semaphore emptySlots(CAP), fullSlots(0);
mutex qm;
queue<int> q;

void producer() {
  for (int i = 1; i <= 1000; ++i) {
    emptySlots.P();                         // wait for a free slot
    { lock_guard g(qm); q.push(i); }
    fullSlots.V();                          // one more item
  }
}

long consumer() {
  long sum = 0;
  for (int i = 0; i < 1000; ++i) {
    fullSlots.P();                          // wait for an item
    { lock_guard g(qm); sum += q.front(); q.pop(); }
    emptySlots.V();                         // one more free slot
  }
  return sum;
}

int main() {
  long sum = 0;
  thread p(producer), c([&] { sum = consumer(); });
  p.join(); c.join();
  cout << sum << '\n';
}
```

The order of the P operations matters. If the producer locked `qm` first and then called `emptySlots.P()` on a full buffer, it would sleep holding the queue lock, and the consumer could never take an item: deadlock. That ordering trap is a standard exam question, and one reason monitors are easier to get right.
:::

## Cheat sheet {#ch27-cheatsheet .th}

- `wait(ul)` atomically unlocks and sleeps, then relocks before returning. Needs `unique_lock`.
- Notifications are not stored (lost wakeups) and wakeups can be spurious: always `cv.wait(ul, predicate)` over state changed under the mutex.
- Bare-wait programs hang (nobody notifies, or the notify comes before the wait); sleeps only hide the race.
- Join every thread: a joinable `std::thread` destroyed at the end of `main` terminates the program.
- Bounded buffer: two condition variables (`notFull`, `notEmpty`) with `notify_one`, or one with `notify_all`.
- Barrier: count arrivals; the last one bumps a generation and notifies all; others wait for the generation to change. C++20: `std::barrier`, `std::latch`.
- Semaphore: counter with P/V, no owner, fairness affects starvation (`std::counting_semaphore`). Monitor: class with private data, locked entries and condition variables.
- Monitor server: monitor + one thread per connection + a line protocol; a blocking `GET` blocks only its connection.
