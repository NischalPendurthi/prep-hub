---
title: Exceptions and fail-safe design
part: Part B · Language features
lede: An exception transfers control from the point of failure to the nearest handler that matches, destroying every fully built object on the way. That one sentence explains most exam questions: which handler catches, why a throw from a destructor or a `noexcept` function kills the program, why a constructor that throws never gets its destructor called, and why a constructor's function-try-block cannot swallow the exception. The chapter then uses exceptions to design a money transfer that retries, rolls back, and never reports a false success.
desc: throw and catch matching, catch order, noexcept and terminate, destructors, throwing constructors, function-try-blocks, assert and NDEBUG, exception safety, fail-safe transfer design
hours: 4.5
prereqs: [Ch 1](#ch01) (constructors, destructors, RAII), [Ch 2](#ch02) (inheritance)
---

## Throw, catch and matching {#ch06-matching .th}

`throw expr;` copies (or moves) `expr` into an exception object managed by the runtime and starts **stack unwinding**: the runtime leaves each function in turn, destroying its fully constructed local objects, until it finds a `try` block with a handler that matches. Handlers are tried **in the order they are written**, and the first match wins, not the best match.

A handler `catch (T)` matches an exception of type `E` only if:

- `E` is `T` (ignoring top-level `const` and references), or
- `T` is an unambiguous public base class of `E`, or
- both are pointers and `E*` converts to `T*` by a derived-to-base or qualification conversion.

**No other conversions apply.** A thrown `int` is not caught by `catch (char)` or `catch (long)`, and a thrown `const char*` string literal is not caught by `catch (std::string)`. `catch (...)` matches everything and must come last.

```cpp run=c06-match
#include <iostream>
using namespace std;

int main() {
  try {
    throw 10;                       // an int
  } catch (char c) {
    cout << "char handler\n";       // not a match: no int -> char conversion
  } catch (long l) {
    cout << "long handler\n";       // not a match either
  } catch (...) {
    cout << "default handler\n";
  }
}
```

The course's `exception.cpp` shows why the *type* of what you throw matters for readability. Its constructor throws the character `'n'` when the opening balance is too small, and the `catch (char)` handler prints "balance is low", so a failed constructor reports itself as a low balance. Throwing an exception class that names the problem (`InvalidOpeningBalance`) avoids that.

### Catch order with a hierarchy

Because the first match wins, a base-class handler written before a derived-class handler catches the derived exceptions too, and the derived handler can never run. GCC warns ("exception of type 'C' will be caught by earlier handler for 'B'"). Always order handlers from most derived to most general.

```cpp run=c06-order
#include <iostream>
using namespace std;

class A {};
class B {};
class C : public B {};
class D {};

void f(int x) {
  if (x == 0) throw A();
  if (x == 1) throw C();
  throw D();
}

int main() {
  for (int i : {0, 1, 2}) {
    try {
      f(i);
    } catch (const A&) { cout << "caught A\n"; }
      catch (const B&) { cout << "caught B\n"; }    // a C is a B
      catch (const D&) { cout << "caught D\n"; }
  }
}
```

**Catch by reference** (`const B&`), not by value. By value, a derived exception is sliced into a copy of the base part, so virtual functions such as `what()` report the base's message, and a `throw;` that follows rethrows the original object but your copy is a different one.

### Rethrowing and uncaught exceptions

Inside a handler, `throw;` rethrows the *current* exception object unchanged, keeping its dynamic type. `throw e;` throws a new copy of the static type of `e`, which can slice. If no handler anywhere matches, the runtime calls `std::terminate()`, which by default calls `abort()`. Whether the stack is unwound first is implementation-defined (GCC does not unwind), so destructors may not run.

## noexcept, destructors and terminate {#ch06-noexcept .th}

`noexcept` on a function is a promise that no exception escapes it. The compiler does not check the promise. If an exception does try to leave a `noexcept` function, the program calls `std::terminate()` **at the boundary**: the exception never reaches the caller's handler.

```cpp run=c06-noexcept expect=error
#include <iostream>
using namespace std;

class Account {
  int bal;
public:
  Account(int a) : bal(a) {}
  void deposit(int a) noexcept { bal += a; if (a < 10) throw 0; }   // breaks the promise
};

int main() {
  Account acct(10);
  try {
    acct.deposit(5);
  } catch (int) {
    cout << "never printed: the exception cannot leave deposit\n";
  }
}
```

That is the course's `exception1.2.cpp`: the "exception thrown from noexcept function" message never appears, because `terminate` runs before control reaches `main`'s handler.

Why use `noexcept` at all? It is part of the function's type and can be queried at compile time with `noexcept(expr)`. `std::vector` moves its elements during reallocation only if the move constructor is `noexcept`; otherwise it copies, to keep its strong guarantee. So marking move constructors `noexcept` is a real performance decision ([Ch 18](#ch18)).

### Destructors are noexcept

Since C++11, every destructor is implicitly `noexcept(true)` unless it is declared `noexcept(false)` or a member's destructor is. An exception that escapes a destructor therefore calls `std::terminate`. Even with `noexcept(false)`, throwing from a destructor *while the stack is already unwinding* because of another exception terminates, because the runtime cannot handle two exceptions at once.

The fix is the course's `exception7.cpp` pattern: catch inside the destructor and log or record the failure.

```cpp run=c06-dtor-catch
#include <iostream>
using namespace std;

class Engine {
  int capacity;
public:
  Engine(int x) : capacity(x) {}
  ~Engine() {
    try {
      cout << "removing engine " << capacity << '\n';
      throw 1;                          // cleanup failed
    } catch (...) {}                    // swallowed inside: nothing escapes
  }
};

class HighSpeedTrain {
  Engine e1, e2;
public:
  HighSpeedTrain() : e1(100), e2(200) {}
};

int main() {
  try {
    cout << "creating fast train\n";
    HighSpeedTrain t;
    cout << "created\n";
  } catch (...) { cout << "junked\n"; }
}
```

Members are destroyed in reverse order of declaration, so `e2` (200) goes first. Nothing is junked, because neither destructor lets the exception out. Delete the inner `try`/`catch` and the program terminates at the first destructor.

## Constructors that throw {#ch06-ctor .th}

A constructor has no return value, so throwing is **the** way to report that an object could not be built. The rules:

1. If a constructor throws, the object's lifetime never started, so **its destructor is not called**.
2. Members and base classes that were already fully constructed **are** destroyed, in reverse order.
3. For `new T(...)`, if the constructor throws, the new-expression frees the memory it allocated, and the pointer you were assigning to is never assigned.

Rule 1 is why a constructor that acquires two raw resources leaks the first if acquiring the second throws: there is no destructor to free it. Holding each resource in its own RAII member fixes that, because rule 2 then cleans up the first one.

```cpp run=c06-ctor-members
#include <iostream>
#include <stdexcept>
using namespace std;

struct Part {
  const char* name;
  Part(const char* n) : name(n) { cout << "build " << name << '\n'; }
  ~Part() { cout << "destroy " << name << '\n'; }
};

struct Car {
  Part engine{"engine"};
  Part wheels{"wheels"};
  Car() { throw runtime_error("no chassis"); }
  ~Car() { cout << "~Car\n"; }           // never runs: the Car never existed
};

int main() {
  try { Car c; } catch (const exception& e) { cout << "caught: " << e.what() << '\n'; }
}
```

The course's `exception8.1.cpp` combines rule 3 with a bug: `a = new A();` throws, the handler prints "caught", and then `a->f()` is called anyway. `a` was never assigned, so it is an uninitialised pointer, and the call is undefined behaviour. The output "1 makes sense?" that it often prints is luck.

### Catching inside the constructor body

If the constructor catches the exception itself and finishes normally, the object **is** constructed, whatever state it is in. In `exception8.cpp` the body is `try { throw 1; } catch (...) { cout << "caught\n"; }`, so `A a;` succeeds and `a.f()` runs. In `exception8.2.cpp` the throw skips the line that would have set the pointer member `j`, so the object is "constructed" with `j` uninitialised. Swallowing a construction error is almost always wrong: the caller now holds a half-built object it cannot detect.

## Function-try-blocks {#ch06-fn-try .th}

A **function-try-block** wraps the whole function body, and for constructors also the **member initialiser list**:

```cpp
A::A() try : member(make()) {
  // body
} catch (...) {
  // runs if the initialiser list or the body throws
}
```

That is its reason to exist: an ordinary `try` inside the body cannot catch an exception thrown while initialising a base class or a member, because those run before the body starts.

The key rule for constructors (and destructors): **if the handler finishes normally, the exception is rethrown automatically.** The members are already destroyed by the time the handler runs, so there is no object to return; the handler can log, translate the exception into another type, or clean up non-member resources, but it cannot recover.

```cpp run=c06-fn-try
#include <iostream>
#include <stdexcept>
using namespace std;

class A {
public:
  A() try {
    throw runtime_error("original");
  } catch (const exception& e) {
    cout << "A handler: " << e.what() << '\n';
    // falls off the end: the exception is rethrown
  }
  void f() { cout << "never called\n"; }
};

class B {
public:
  B() try {
    throw runtime_error("original");
  } catch (const exception& e) {
    cout << "B handler: " << e.what() << '\n';
    throw logic_error("translated");   // replaces the exception
  }
};

int main() {
  try { A a; a.f(); } catch (const exception& e) { cout << "main: " << e.what() << '\n'; }
  try { B b; }        catch (const exception& e) { cout << "main: " << e.what() << '\n'; }
  cout << "program continues\n";
}
```

The course's `exception9.cpp` declares `A a;` with **no** `try` around it in `main`. The constructor's handler prints "caught", the exception is rethrown, nothing catches it, and the program terminates. People expect "calling a.f" to follow; it never does.

For an **ordinary function**, the handler of a function-try-block does *not* rethrow automatically. Falling off the end of the handler is like falling off the end of the function: fine for a `void` function (`exception11.cpp` prints "f returned normally"), undefined behaviour for a function that should return a value.

| Function-try-block on | Handler falls off the end |
|---|---|
| constructor or destructor | exception rethrown automatically |
| ordinary `void` function | function returns normally |
| function returning a value | undefined behaviour (no return value) |

## assert vs exceptions {#ch06-assert .th}

`assert(cond)` from `<cassert>` checks a condition that should be impossible if the program is correct. When it fails, it prints the expression, file and line to `stderr` and calls `abort()`: no unwinding, no destructors, no handler. When the macro `NDEBUG` is defined **before** `<cassert>` is included, `assert(cond)` expands to nothing, and `cond` is not even evaluated.

- Use `assert` for **programmer errors**: broken invariants, impossible states, preconditions inside your own code. They are bugs to fix, not situations to handle.
- Use **exceptions** for failures that can happen in a correct program: a network timeout, a missing file, a declined payment. Callers can catch and recover.

Two traps from the course files:

- `assert(bal > 100)` before `bal -= a` checks the balance before the withdrawal, not whether the withdrawal is affordable. With `bal = 10` it aborts, which is correct by accident; with `bal = 150` and `a = 200` it lets the balance go to −50.
- `assert-working.cpp` writes `#define NDEBUG` *after* `#include <assert.h>`. That define does not disable `assert` (the header has already been processed), but the file's own `#ifndef NDEBUG` block *is* disabled, so the check is skipped, the withdrawal goes ahead and the balance prints as −190. Define `NDEBUG` on the command line (`-DNDEBUG`) so it applies consistently.
- Never put side effects in an assert: `assert(init() == 0)` stops calling `init` in release builds.

## Exception safety and the standard hierarchy {#ch06-safety .th}

Every function that can see an exception gives one of these guarantees:

| Guarantee | Promise | Typical technique |
|---|---|---|
| No-throw | never throws | `noexcept`; only non-throwing operations |
| Strong | succeeds, or state is unchanged (commit or rollback) | do the work on a copy, then swap in with non-throwing operations |
| Basic | no leaks, invariants hold, but state may have changed | RAII for every resource |
| None | anything goes | avoid |

Standard exceptions derive from `std::exception`, whose virtual `what()` returns a message. `std::logic_error` (with `invalid_argument`, `out_of_range`, `length_error`) is for errors a caller could have prevented. `std::runtime_error` (with `range_error`, `overflow_error`, `system_error`) is for errors detectable only at run time. `std::bad_alloc` comes from a failed `new`, `std::bad_cast` from a failed reference `dynamic_cast`. Derive your own exception types from one of these so a generic `catch (const std::exception&)` can log them.

## Design: a fail-safe bank transfer {#ch06-transfer .th}

The course scenario: transfer money from account A to account B.

1. Retry when a temporary failure occurs (a timeout from the authentication server or from the receiving bank).
2. If crediting B fails after A was debited, undo the debit.
3. If the undo itself fails, stop and report that manual recovery is needed.
4. If an unexpected exception occurs, keep its diagnostic information and let it reach the outermost handler.
5. Never report success unless every step completed.

Start with the **exception hierarchy**, because the handlers are built around it. Retryable failures share a base so one handler can retry all of them, and the failure that needs a human is its own type that nothing below the top level catches.

```text
std::runtime_error
 ├── TransferError                 business failures the caller should see
 │    ├── DebitFailed
 │    ├── CreditFailed
 │    └── RollbackFailed           money is in limbo: manual recovery
 └── TransientError                worth retrying
      ├── AuthTimeout
      └── BankTimeout
```

```cpp run=c06-transfer
#include <functional>
#include <iostream>
#include <stdexcept>
#include <string>
using namespace std;

struct TransientError : runtime_error { using runtime_error::runtime_error; };
struct AuthTimeout   : TransientError { AuthTimeout()  : TransientError("auth server timeout") {} };
struct BankTimeout   : TransientError { BankTimeout()  : TransientError("bank server timeout") {} };
struct TransferError : runtime_error { using runtime_error::runtime_error; };
struct CreditFailed  : TransferError { using TransferError::TransferError; };
struct RollbackFailed : TransferError { using TransferError::TransferError; };

// Calls op, retrying transient failures up to `tries` times in total.
template <class F> void withRetry(F op, int tries) {
  for (int attempt = 1;; ++attempt) {
    try { return op(); }
    catch (const TransientError& e) {
      cout << "  attempt " << attempt << " failed: " << e.what() << '\n';
      if (attempt == tries) throw;              // give up: rethrow the same object
    }
  }
}

struct Bank {                    // a fake bank: each script entry decides what one call does
  int a = 1000, b = 0;
  string script;                 // per call: 'o' ok, 'a' auth timeout, 'b' bank timeout, 'x' hard failure
  size_t step = 0;
  void next() {
    char c = step < script.size() ? script[step] : 'o';
    ++step;
    if (c == 'a') throw AuthTimeout();
    if (c == 'b') throw BankTimeout();
    if (c == 'x') throw runtime_error("hardware fault");
  }
  void authenticate()  { next(); }
  void debitA(int n)   { next(); a -= n; }
  void creditB(int n)  { next(); b += n; }
  void undoDebitA(int n) { next(); a += n; }
};

bool transfer(Bank& bank, int amount) {
  withRetry([&] { bank.authenticate(); }, 3);
  withRetry([&] { bank.debitA(amount); }, 3);
  try {
    withRetry([&] { bank.creditB(amount); }, 3);
  } catch (...) {                                // credit failed after the debit: roll back
    try {
      withRetry([&] { bank.undoDebitA(amount); }, 3);
    } catch (...) {
      throw RollbackFailed("debit of " + to_string(amount) + " could not be undone: manual recovery required");
    }
    throw CreditFailed("credit failed; debit rolled back");
  }
  return true;                                   // reached only if every step succeeded
}

void run(const string& name, const string& script) {
  Bank bank;
  bank.script = script;
  cout << name << '\n';
  try {
    transfer(bank, 300);
    cout << "  SUCCESS";
  } catch (const RollbackFailed& e) { cout << "  ALERT: " << e.what(); }
    catch (const TransferError& e)  { cout << "  FAILED: " << e.what(); }
    catch (const TransientError& e) { cout << "  FAILED after retries: " << e.what(); }
    catch (const exception& e)      { cout << "  UNEXPECTED: " << e.what(); }     // rule 4: preserved, reported at the top
  cout << "  (A=" << bank.a << ", B=" << bank.b << ")\n";
}

int main() {
  run("clean transfer", "");
  run("auth times out once", "a");
  run("credit times out three times, undo works", "oobbbo");
  run("credit and undo both fail", "oobbbbbb");
  run("unexpected fault during debit", "ox");
}
```

Things to point out when you explain the design:

- `withRetry` catches only `TransientError`. A hard failure passes straight through it, which satisfies rule 4 without any extra code.
- `throw;` rethrows the original object, so the outer handler still sees the precise type (`BankTimeout`) and message.
- The rollback is attempted for *any* credit failure (`catch (...)`), because once money has left A, whatever went wrong must be undone. A rollback failure becomes `RollbackFailed`, the one exception that triggers the manual-recovery alert.
- `return true` is the last line, so it is reachable only if no step threw. That is rule 5 by construction. In the "credit and undo both fail" run, A is down 300 and B has nothing, which is exactly why a human is alerted.
- In a real system the debit, the credit and the undo must also be **idempotent** (a retried credit must not credit twice), usually by sending a transfer id with every request.

The second course scenario, ticket booking with a payment timeout, two retries and refunds, uses the same tools: a `PaymentDeclined` exception that is retried twice, a `PaymentTimeout` that cancels the booking, and a refund path that runs whenever money arrived but no seat was confirmed (including a late payment notification after the timeout). It is the coding exercise at the end of the chapter.

## Drills: exceptions {#ch06-drills .dr}

:::drill output
`withdraw` throws an `int` (the balance). `main` has `catch (char b)` followed by `catch (...)`. What prints?
---
"Default Exception handler". A thrown `int` does not match `catch (char)`: handlers allow no arithmetic conversions, only exact type, public base class and pointer conversions.
:::

:::drill output
What does this print?

```cpp run=c06-d-slice
#include <iostream>
#include <stdexcept>
using namespace std;
int main() {
  try {
    throw out_of_range("index 7");
  } catch (exception e) {
    cout << "1: " << e.what() << '\n';
  }
  try {
    throw out_of_range("index 7");
  } catch (const exception& e) {
    cout << "2: " << e.what() << '\n';
  }
}
```
---
Catching by value slices the `out_of_range` into a plain `std::exception`, whose `what()` returns an implementation-defined string (`std::exception` on GCC). By reference, the virtual `what()` reaches the real object.
:::

:::drill tricky
Handlers are written `catch (B&)` then `catch (C&)`, where `C` derives from `B`. What happens when a `C` is thrown?
---
The `B&` handler catches it, because handlers are tried in order and the first match wins. The `C&` handler is unreachable (GCC warns). Put derived handlers first.
:::

:::drill concept
What is the difference between `throw;` and `throw e;` inside `catch (Base& e)`?
---
`throw;` rethrows the current exception object itself, with its full dynamic type. `throw e;` copy-initialises a new exception of the static type `Base`, slicing a derived exception. Use `throw;`.
:::

:::drill output
`deposit` is declared `noexcept` and throws `0`. The call is inside `try { … } catch (int) { cout << "caught"; }`. What prints?
---
Nothing from the handler. The exception cannot leave a `noexcept` function, so `std::terminate()` runs at that boundary. GCC prints "terminate called after throwing an instance of 'int'" and aborts.
:::

:::drill concept
Why are destructors `noexcept` by default, and how should a destructor deal with a failing cleanup step?
---
Destructors run during stack unwinding. A second exception escaping while one is already in flight cannot be handled, so the language terminates. Making destructors `noexcept` by default turns every escaping exception into a clear `terminate` instead. Catch inside the destructor and log or set a flag, or offer an explicit `close()` that can throw and that callers can call first.
:::

:::drill output
What does this print?

```cpp run=c06-d-train
#include <iostream>
using namespace std;
struct Engine {
  int c;
  Engine(int x) : c(x) { cout << "+" << c << ' '; }
  ~Engine() { cout << "-" << c << ' '; }
};
struct Train {
  Engine e1{1}, e2{2}, e3{3};
};
int main() { { Train t; } cout << '\n'; }
```
---
Members are built in declaration order and destroyed in reverse.
:::

:::drill output
What does this print?

```cpp run=c06-d-ctor
#include <iostream>
using namespace std;
struct M { ~M() { cout << "~M "; } };
struct A {
  M m;
  A() { cout << "A() "; throw 1; }
  ~A() { cout << "~A "; }
};
int main() {
  try { A a; } catch (int) { cout << "caught"; }
  cout << '\n';
}
```
---
The member `m` was fully constructed, so it is destroyed during unwinding. `A`'s own destructor never runs, because `A`'s constructor never completed.
:::

:::drill bug
What is wrong here?

```cpp
A* a;
try { a = new A(); }      // A's constructor throws
catch (...) { cout << "caught\n"; }
a->f();
```
---
When the constructor throws, the new-expression frees the memory and `a` is never assigned, so it is still uninitialised. `a->f()` is undefined behaviour even if it happens to print something. Either return or rethrow from the handler, or initialise `a` to `nullptr` and check it.
:::

:::drill output
A constructor has a function-try-block whose handler prints "caught" and does nothing else. `main` has `try { A a; cout << "calling a.f\n"; a.f(); } catch (...) { cout << "here..\n"; }`. What prints?
---
`caught` then `here..`. A constructor's function-try-block handler that finishes normally rethrows automatically, so `a` never exists, the next two statements are skipped and `main`'s handler runs.
:::

:::drill tricky
Same constructor, but `main` declares `A a;` with no `try` around it. What happens?
---
The handler prints "caught", the exception is rethrown, nothing catches it, and `std::terminate` aborts the program. "calling a.f" never prints.
:::

:::drill concept
What can a function-try-block on a constructor catch that a `try` inside the constructor body cannot?
---
Exceptions thrown while constructing base classes and members in the initialiser list, which run before the body starts. That was the reason for adding the feature.
:::

:::drill output
`void f() try { throw runtime_error("x"); } catch (const exception& e) { cout << "f handler\n"; }`. `main` calls `f()` then prints "f returned normally", inside a `try` with `catch (...)`. What prints?
---
`f handler` then `f returned normally`. For an ordinary function the handler does not rethrow; falling off its end returns from `f`. (For a non-`void` function it would be undefined behaviour.)
:::

:::drill concept
When should you use `assert` and when an exception?
---
`assert` for conditions that are impossible in a correct program (bugs), checked in debug builds and compiled out with `NDEBUG`. Exceptions for failures a correct program must expect and possibly recover from, such as timeouts, bad input and missing files. An assert aborts without unwinding; an exception unwinds and can be handled.
:::

:::drill tricky
A file does `#include <assert.h>` and then `#define NDEBUG`. Is `assert` disabled?
---
No. `NDEBUG` is checked when `<assert.h>` is included, so defining it afterwards has no effect on `assert`. (Re-including `<assert.h>` would re-apply it.) Define it before the include, or better, with `-DNDEBUG` on the command line.
:::

:::drill concept
State the basic, strong and no-throw guarantees in one line each.
---
Basic: on failure, no leaks and invariants still hold, but the state may have changed. Strong: on failure, the state is exactly as before (commit or rollback). No-throw: the operation never fails.
:::

:::drill tricky
In the transfer design, why does the retry helper catch `TransientError&` instead of `std::exception&`?
---
Only temporary failures are worth retrying. Catching everything would retry a hardware fault or a business rejection three times and, worse, could hide unexpected exceptions, violating "preserve diagnostics and propagate unexpected exceptions to the outermost handler".
:::

## Write the code {#ch06-coding .cd}

:::drill code rating=1500
Implement the ticket-booking rules: a payment can be declined (retry at most twice, then cancel the booking and block that bank account), can time out (cancel the booking), and can arrive late after a timeout (refund it). Book only when payment succeeded and the seat is still free; if the seat was taken meanwhile, refund. Drive it with scripted payment outcomes.
---
```cpp run=c06-c-ticket
#include <iostream>
#include <set>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;

struct PaymentDeclined : runtime_error { PaymentDeclined() : runtime_error("declined") {} };
struct PaymentTimeout  : runtime_error { PaymentTimeout()  : runtime_error("timed out") {} };
struct BookingFailed   : runtime_error { using runtime_error::runtime_error; };

struct Gateway {                       // scripted: 'o' ok, 'd' declined, 't' timeout
  string script; size_t i = 0;
  void pay(const string&) {
    char c = i < script.size() ? script[i++] : 'o';
    if (c == 'd') throw PaymentDeclined();
    if (c == 't') throw PaymentTimeout();
  }
};

class Booking {
  set<int> taken;
  set<string> blocked;
public:
  vector<string> refunds;
  void takeSeat(int s) { taken.insert(s); }
  int book(Gateway& g, const string& account, int seat) {
    if (blocked.count(account)) throw BookingFailed("account blocked");
    for (int attempt = 0;; ++attempt) {
      try { g.pay(account); break; }
      catch (const PaymentDeclined&) {
        if (attempt == 2) { blocked.insert(account); throw BookingFailed("declined 3 times: booking cancelled"); }
      }
      catch (const PaymentTimeout&) { throw BookingFailed("payment timeout: booking cancelled"); }
    }
    if (!taken.insert(seat).second) {           // paid, but someone else got the seat
      refunds.push_back(account);
      throw BookingFailed("seat taken: refunded");
    }
    return seat;
  }
  void latePayment(const string& account) { refunds.push_back(account); }   // money arrived after a timeout
};

int main() {
  Booking b;
  b.takeSeat(7);
  auto attempt = [&](string script, string acct, int seat) {
    Gateway g{script};
    try { int got = b.book(g, acct, seat); cout << acct << ": booked seat " << got << '\n'; }
    catch (const BookingFailed& e) { cout << acct << ": " << e.what() << '\n'; }
  };
  attempt("o", "acc1", 3);
  attempt("ddo", "acc2", 4);     // two declines, third try works
  attempt("ddd", "acc3", 5);     // third decline: cancelled and blocked
  attempt("o", "acc3", 5);       // blocked account
  attempt("t", "acc4", 6);       // timeout
  b.latePayment("acc4");         // ... and the bank's money shows up later
  attempt("o", "acc5", 7);       // seat already taken
  cout << "refunds:";
  for (auto& r : b.refunds) cout << ' ' << r;
  cout << '\n';
}
```

The rule "the payment account number is saved for refund" is the `account` string carried through every path. A real system would also lock the seat (or the row of seats for that class) between checking and taking it, which the single-threaded `set::insert` returning `false` stands in for here.
:::

:::drill code rating=1300
Write a class `File` that opens a `FILE*` in its constructor, throws `std::runtime_error` with the file name if `fopen` fails, and closes in a destructor that cannot throw. Show that a failing second file does not leak the first.
---
```cpp run=c06-c-file
#include <cstdio>
#include <iostream>
#include <stdexcept>
#include <string>

class File {
  std::FILE* f;
  std::string name;
public:
  File(const std::string& n, const char* mode) : f(std::fopen(n.c_str(), mode)), name(n) {
    if (!f) throw std::runtime_error("cannot open " + n);
    std::cout << "opened " << name << '\n';
  }
  ~File() { std::fclose(f); std::cout << "closed " << name << '\n'; }   // fclose's result ignored: never throw here
  File(const File&) = delete;
  File& operator=(const File&) = delete;
};

struct Copier {
  File in, out;
  Copier() : in("main.cpp", "r"), out("/no/such/dir/x", "w") {}
};

int main() {
  try { Copier c; }
  catch (const std::exception& e) { std::cout << "error: " << e.what() << '\n'; }
}
```

`in` is fully constructed when `out` throws, so `in`'s destructor runs during unwinding and closes the file. `Copier` needs no destructor at all.
:::

## Cheat sheet {#ch06-cheatsheet .th}

- Handlers are tried in order; first match wins. Match = same type, public base, or pointer conversion. No `int`→`char`. `catch (...)` last.
- Catch by `const&`; rethrow with `throw;`. Uncaught → `std::terminate`.
- An exception leaving a `noexcept` function or any destructor → `std::terminate`. Destructors catch internally.
- Throwing constructor: no destructor for that object; built members and bases are destroyed; `new` frees the memory and the pointer is not assigned.
- Constructor function-try-block: catches initialiser-list exceptions; handler that ends normally rethrows. Ordinary function: handler falls through to a normal return.
- `assert` for bugs, removed by `NDEBUG` defined before the include; exceptions for expected failures.
- Fail-safe design: a hierarchy that separates retryable, business and unrecoverable errors; retry only transient ones; roll back after partial work; report success only on the last line.
