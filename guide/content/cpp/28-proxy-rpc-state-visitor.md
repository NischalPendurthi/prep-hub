---
title: "Design patterns: Proxy and RPC, State, Visitor"
part: Part G · Design patterns
lede: Three patterns from the course, each built on virtual functions. A Proxy stands in for another object behind the same interface, and a remote proxy is the client half of a remote procedure call, so this chapter also covers sockets and the RPC design from the course slides (stubs, marshalling, binding and failure semantics). State replaces a tangle of if-statements with one object per state. Visitor adds operations to a class hierarchy without editing it, using double dispatch. Every course file is fixed and run, including the State skeleton that does not compile.
desc: Proxy (remote, virtual, protection, caching), TCP sockets call order, RPC structure, stubs, marshalling, binding, at-least-once / at-most-once / exactly-once, State pattern LIFO, Visitor and double dispatch, friendship not inherited
hours: 4
prereqs: [Ch 2](#ch02) (virtual functions), [Ch 3](#ch03) (abstract classes); [OS guide ch 5](../os/#ch05) for sockets in depth
---

## Proxy {#ch28-proxy .th}

A **proxy** is an object with the same interface as a real object, which the client uses in its place. The proxy forwards calls to the real object and adds something on the way: it may live in another process (remote proxy), create the real object only when first used (virtual proxy), check permissions (protection proxy), or remember results (caching proxy). Because the client holds a pointer to the shared interface, it cannot tell which one it has.

```text
          TAXCalculator (interface)
            + calculate(income) = 0
             /                 \
 TAXCalculatorReal        TAXCalculatorProxy
  computes the tax         holds a TAXCalculator* real
                           calculate() { ...extra work...; return real->calculate(income); }
```

The course's `abstract.cpp` does not compile as given: its first line is `##include <iostream>`, and the whole program appears twice in the file. Fixed, and with a caching proxy that counts how often the real object is called:

```cpp run=c28-proxy
#include <iostream>
#include <map>
using namespace std;

class TAXCalculator {
public:
  virtual int calculate(int income) = 0;
  virtual ~TAXCalculator() = default;
};

class TAXCalculatorReal : public TAXCalculator {
public:
  int calls = 0;
  int calculate(int income) override { ++calls; return income / 10; }   // 10% in integer arithmetic
};

class TAXCalculatorProxy : public TAXCalculator {
  TAXCalculator* real = nullptr;
  map<int, int> cache;
public:
  void setReal(TAXCalculator* tc) { real = tc; }
  int calculate(int income) override {
    if (auto it = cache.find(income); it != cache.end()) return it->second;   // caching proxy
    return cache[income] = real->calculate(income);
  }
};

int main() {
  TAXCalculatorReal real;
  TAXCalculatorProxy proxy;
  proxy.setReal(&real);
  TAXCalculator* tc = &proxy;                 // the client only sees the interface
  cout << tc->calculate(1000) << ' ' << tc->calculate(1000) << ' ' << tc->calculate(2500) << '\n';
  cout << "real object called " << real.calls << " times\n";
}
```

The course's `0.1 * income` returns a `double` that is silently truncated to `int` on return: 0.1 × 1005 = 100.5 becomes 100. Integer division gives the same result without the floating-point detour, or the function should return `double`.

`abstract1.cpp` sketches the **remote proxy**, which holds an IP address and port instead of a pointer and does "socket calls here" inside `calculate`. As given it does not compile either: `main` calls `setReal(remote)` with a pointer, but the remote version of `setReal` takes a string and an int, and `calculate` has no `return` statement (falling off the end of a non-`void` function is undefined behaviour). Filling it in is the subject of the rest of this section.

## Sockets in one page {#ch28-sockets .th}

The course's `server.cpp` and `client.cpp` show the TCP call sequence:

| Server | Client |
|---|---|
| `socket(AF_INET, SOCK_STREAM, 0)` | `socket(AF_INET, SOCK_STREAM, 0)` |
| `bind(fd, address with port 8080)` | |
| `listen(fd, 5)`: backlog of pending connections | |
| `accept(fd, …)` blocks, returns a **new** socket for this client | `connect(fd, server address)` performs the TCP handshake |
| `recv` / `send` on the accepted socket | `send` / `recv` |
| `close` both sockets | `close` |

Details that examiners like:

- `htons(8080)` converts the port to **network byte order** (big-endian). On a little-endian x86 machine, skipping it would bind port 36895 (0x901F) instead of 8080 (0x1F90). `htonl` does the same for 32-bit addresses.
- `INADDR_ANY` (0.0.0.0) on the **server** means "accept connections on every network interface". On the **client** it is not a real destination; Linux happens to treat a connect to 0.0.0.0 as a connect to the local machine, which is why the course client works, but the correct code uses the server's address, such as `inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr)`.
- The listening socket only accepts. Data flows on the socket `accept` returns. The course server closes the listening socket but never closes the accepted one.
- TCP is a **byte stream**, not a message stream. One `send` of 14 bytes may arrive as two `recv`s, or two sends as one. A protocol needs framing: a length prefix, or a delimiter such as `\n`.
- None of the course calls check return values. Every one of them can fail (port in use, connection refused).

## Remote procedure calls {#ch28-rpc .th}

The RPC lecture (based on Birrell and Nelson, *Implementing Remote Procedure Calls*, ACM TOCS, 1984) starts from a question: a procedure call is a well-understood way to transfer control and data within one program, so why not use the same mechanism to transfer control and data across a network? The caller suspends, the callee runs on another machine and returns, and the caller continues.

**Aims.** Make distributed computation easy by removing unnecessary difficulties, leaving only the fundamental ones of distributed systems: timing, independent failure of components, and the coexistence of independent execution environments. The guiding principle is to make remote calls as close to local calls as possible; for example, in the original system a call had no timeout as long as the machines and the network were working. The call must also be efficient (the designers aimed for within a factor of 5 of the raw network transmission time), or programmers will avoid it and the benefit of one unified paradigm is lost.

**Design issues** the lecture lists: the precise semantics of a call when communication fails; what an address in an argument means when caller and callee share no address space; integrating RPC into an existing language; **binding** (how a caller finds the location and identity of the callee); activation; the data and control transfer protocol; and data integrity and security on the network.

### The five pieces

One remote call involves five pieces of program:

```text
 Client machine                                   Callee machine
 ┌──────┐  local  ┌───────────┐       ┌─────────────┐       ┌───────────┐  local  ┌────────┐
 │ User │ ──────▶ │ User stub │ ────▶ │ RPC runtime │ ════▶ │ RPC runtime│ ─────▶ │ Server │
 │      │  call   │ pack args │       │ transmit,   │ net   │ receive    │  ...   │  stub  │ ─▶ Server
 │      │ ◀────── │ unpack    │ ◀──── │ wait,       │ ◀════ │ transmit   │ ◀───── │ unpack,│    work,
 └──────┘ return  │ result    │       │ receive     │       └────────────┘        │ call,  │    return
                  └───────────┘       └─────────────┘                             │ pack   │
                                                                                   └────────┘
```

1. The **user** makes an ordinary local call, `x = foo(i, j);`.
2. The **user stub** (client stub) has the same signature as `foo`. It **marshals** the arguments: packs them, with the procedure's name, into a flat message (a byte packet). It then hands the packet to the runtime and later unpacks the result.
3. The **RPC runtime** (communications package) on each side transmits the packet, waits for the reply, retransmits on loss, and delivers results.
4. The **server stub** unmarshals the arguments, makes an ordinary local call to the real procedure, and marshals the return value.
5. The **server** is the real implementation, written as if called locally.

The user and the server both make or receive normal local calls; everything remote is hidden in the stubs and the runtime. **A remote proxy is exactly a client stub**: same interface as the real object, with marshalling and networking inside.

**Marshalling** turns typed values into bytes and back: fixed byte order for integers, length prefixes for strings, and no raw pointers, since an address means nothing in another address space (pointed-to data must be copied, which is the "semantics of address-containing arguments" issue).

### How the class proposal evolved

The lecture builds the infrastructure step by step, which shows why each piece exists:

1. The client wants to write `X = foo(i);` and the server has `int foo(int x) { return x * x; }`.
2. Proposal: change the client to call `foo_everest(i)`, naming the machine. That changes the call syntax and puts ease of use in danger.
3. Better: keep `foo`, and have a client-side `foo` that calls a generic `Rpc("everest")`. But how do arguments and results travel?
4. A workable version: `Rpc("everest:int:int", i, &returnval)`. The string encodes the target and the signature; `Rpc(char* name, ...)` is variadic. This generic `Rpc` is the **reusable part of the client stub**; the little `foo` wrapper is the part specific to `foo`.
5. Making it independent of the machine name: use `Rpc("foo:int:int", …)` and let `Rpc` find the machine. That raises the binding problem.
6. A **bind server** (name server) keeps a table from function name to (ip, port). `Rpc` first asks it (`lookup`), connecting to a well-known address, then calls the real server. The bind server is itself just an RPC server with two procedures, `lookup` and `register`.
7. Where does the client get the bind server's address? Either a global set by the client (`setbindserver(ip, port, AUTO | PERCALL | ONCE)`, binding automatically per call or once), or explicitly: the client calls `lookup("foo")` and then `setrpcserver(fooip, fooport)`. The lecture notes that setting addresses through side effects (external variables) versus parameter passing is a design choice, and that object-oriented designs handle this better: a proxy object simply holds its server's address.
8. Writing the `foo`-specific stubs by hand is mechanical, so a **stub generator** reads the interface (`Foo.h`) and generates `Foo_stub.c` for the client and `Stub_foo.c` for the server, each linked with the reusable runtime (`RpcClient.c`, `RpcServer.c`).
9. The server side: `main() { initRPC(); export_foo(); serviceloop(); }`. `initRPC` creates the server port. `export_foo` calls `addentry("foo", stub_foo, "int:int")` to register the function in a dispatch table (and with the name server). `serviceloop` repeatedly listens, receives a request packet, extracts the function name (which includes the signature), calls `dispatch(name, packet)`, and sends back the returned packet. `dispatch` looks up the stub by name and calls it; `stub_foo(packet)` unpacks the arguments, calls `foo`, packs the return value and returns the packet.

### Binding: naming and location

Binding answers two questions: what does the client want to be bound to, and where is it? In the original system a **name** has two parts: a **type** (the interface, for example "mail server") and an **instance** (a specific mail server). Servers **export** an interface and clients **import** it. Locations are kept in **Grapevine**, a distributed database that is available from all sites, replicated and highly reliable. It stores individual entries (an instance name mapped to the network address of its site) and group entries (a type name mapped to the list of its instances).

### Failure semantics

A local call either happens or the whole program crashed. A remote call can fail halfway: the request may be lost, the server may crash after doing the work but before replying, or the reply may be lost. The client sees the same thing in every case: no reply. Retrying gives different guarantees:

| Semantics | What the runtime does | Effect on the server | Safe for |
|---|---|---|---|
| **At least once** | retransmit until a reply arrives | may execute the call several times | idempotent operations (read a balance, set x = 5) |
| **At most once** | detect duplicate requests (sequence numbers) and never re-execute; may give up | executes zero or one time | non-idempotent operations (debit an account) |
| **Exactly once** | at most once plus guaranteed completion | executes exactly one time | what everyone wants; impossible in general when the server can crash, approximated with persistent logs and transactions |

This connects directly to the fail-safe transfer design in [Ch 6](#ch06-transfer): retrying a debit needs at-most-once semantics, usually by sending a unique transfer id that the server remembers.

### A working remote proxy

The program below puts the pieces together in one process over loopback: a server with a dispatch table and a server stub, a name server reduced to an in-process table (export/import), and a `TAXCalculatorProxy` that is the client stub, with the same interface as the real calculator. The wire format is one text line per call, `name:signature|arg1|arg2`, which is a simple form of marshalling.

```cpp run=c28-rpc timeout=30
#include <arpa/inet.h>
#include <functional>
#include <iostream>
#include <map>
#include <netinet/in.h>
#include <sstream>
#include <string>
#include <sys/socket.h>
#include <thread>
#include <unistd.h>
#include <vector>
using namespace std;

// ---------- shared interface
class TAXCalculator {
public:
  virtual int calculate(int income) = 0;
  virtual ~TAXCalculator() = default;
};
class TAXCalculatorReal : public TAXCalculator {
public:
  int calculate(int income) override { return income / 10; }
};

// ---------- tiny transport: one '\n'-terminated line per message
bool readLine(int fd, string& s) {
  s.clear(); char c;
  while (recv(fd, &c, 1, 0) == 1) { if (c == '\n') return true; s += c; }
  return false;
}
void sendLine(int fd, const string& s) { string m = s + "\n"; send(fd, m.data(), m.size(), MSG_NOSIGNAL); }
vector<string> split(const string& s, char d) { vector<string> out; string t; stringstream ss(s); while (getline(ss, t, d)) out.push_back(t); return out; }

// ---------- binding: a name server reduced to a table of name -> port
map<string, int> nameServer;

// ---------- server side: dispatch table of server stubs
using Stub = function<string(const vector<string>&)>;   // unpacked args -> packed result
map<string, Stub> dispatchTable;
TAXCalculatorReal realCalc;

void addentry(const string& nameWithSig, Stub stub) { dispatchTable[nameWithSig] = std::move(stub); }
void export_calculate() {
  addentry("calculate:int:int", [](const vector<string>& args) {      // server stub: unpack, call, pack
    return to_string(realCalc.calculate(stoi(args.at(0))));
  });
}

void serviceloop(int lfd, int connections) {
  for (int i = 0; i < connections; ++i) {
    int cfd = accept(lfd, nullptr, nullptr);
    string req;
    while (readLine(cfd, req)) {
      auto parts = split(req, '|');
      auto it = dispatchTable.find(parts[0]);                          // dispatch by name + signature
      sendLine(cfd, it == dispatchTable.end() ? "ERR no such procedure"
                                              : it->second(vector<string>(parts.begin() + 1, parts.end())));
    }
    close(cfd);
  }
}

// ---------- client side: the remote proxy is the client stub
class TAXCalculatorProxy : public TAXCalculator {
  int fd = -1;
public:
  void setReal(const string& ip, int port) {                          // what abstract1.cpp wanted
    fd = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in a{};
    a.sin_family = AF_INET;
    a.sin_port = htons(port);
    inet_pton(AF_INET, ip.c_str(), &a.sin_addr);
    if (connect(fd, (sockaddr*)&a, sizeof a) < 0) throw runtime_error("connect failed");
  }
  int calculate(int income) override {
    sendLine(fd, "calculate:int:int|" + to_string(income));          // marshal and transmit
    string reply;
    if (!readLine(fd, reply)) throw runtime_error("server went away");
    if (reply.rfind("ERR", 0) == 0) throw runtime_error(reply);
    return stoi(reply);                                               // unmarshal
  }
  ~TAXCalculatorProxy() override { if (fd >= 0) close(fd); }
};

int main() {
  // server: initRPC (create the port), export, then serve
  int lfd = socket(AF_INET, SOCK_STREAM, 0);
  sockaddr_in a{};
  a.sin_family = AF_INET;
  a.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
  bind(lfd, (sockaddr*)&a, sizeof a);
  listen(lfd, 4);
  socklen_t len = sizeof a;
  getsockname(lfd, (sockaddr*)&a, &len);
  export_calculate();
  nameServer["TAXCalculator"] = ntohs(a.sin_port);                   // register with the binder
  thread server(serviceloop, lfd, 1);

  // client: import by name, then use the proxy exactly like a local object
  {
    TAXCalculatorProxy proxy;
    proxy.setReal("127.0.0.1", nameServer.at("TAXCalculator"));
    TAXCalculator* tc = &proxy;
    for (int income : {1000, 2500, 99999}) cout << "tax on " << income << " = " << tc->calculate(income) << '\n';
  }                                                                   // proxy closes the connection
  server.join();
  close(lfd);
}
```

## State {#ch28-state .th}

The **State** pattern lets an object change its behaviour when its internal state changes, as if it changed its class. Instead of every operation starting with `if (empty) … else if (full) … else …`, each state is a class implementing the operations for that state, and the object (the **context**) delegates to its current state object. Transitions replace the current state.

The course exercise is a LIFO (stack) with capacity 4 and three states: **EMPTY**, **PARTIAL** and **FULL**. Its `state.cpp` is a skeleton that does not compile: it uses `State` before declaring it, gives the class `LIFO` a constructor named `BoundedBuffer`, and declares non-virtual member functions `= 0` (only virtual functions can be pure). A completed version:

```text
            add                 add (size reaches cap)
   EMPTY ─────────▶ PARTIAL ───────────────────────▶ FULL
     ▲                 │  ▲                            │
     └─── fetch ───────┘  └──────── fetch ─────────────┘
       (size drops to 0)

   EMPTY.fetch → error      FULL.add → error      PARTIAL: both allowed
```

```cpp run=c28-state
#include <iostream>
#include <vector>
using namespace std;

class LIFO;

class LIFOState {                                  // one object per state
public:
  virtual bool add(LIFO& s, int x) = 0;
  virtual bool fetch(LIFO& s, int& out) = 0;
  virtual const char* name() const = 0;
  virtual ~LIFOState() = default;
};

class LIFO {                                       // the context
  vector<int> items;
  size_t cap;
  LIFOState* current;
public:
  explicit LIFO(size_t c);
  bool add(int x) { return current->add(*this, x); }
  bool fetch(int& out) { return current->fetch(*this, out); }
  const char* state() const { return current->name(); }
  // used by the state classes
  void push(int x) { items.push_back(x); }
  int pop() { int x = items.back(); items.pop_back(); return x; }
  size_t size() const { return items.size(); }
  size_t capacity() const { return cap; }
  void setState(LIFOState* s) { current = s; }
};

class EMPTY : public LIFOState {
public:
  bool add(LIFO& s, int x) override;
  bool fetch(LIFO&, int&) override { cout << "  error: fetch from an empty LIFO\n"; return false; }
  const char* name() const override { return "EMPTY"; }
} emptyState;

class PARTIAL : public LIFOState {
public:
  bool add(LIFO& s, int x) override;
  bool fetch(LIFO& s, int& out) override;
  const char* name() const override { return "PARTIAL"; }
} partialState;

class FULL : public LIFOState {
public:
  bool add(LIFO&, int) override { cout << "  error: add to a full LIFO\n"; return false; }
  bool fetch(LIFO& s, int& out) override;
  const char* name() const override { return "FULL"; }
} fullState;

// transitions
bool EMPTY::add(LIFO& s, int x) { s.push(x); s.setState(s.size() == s.capacity() ? (LIFOState*)&fullState : &partialState); return true; }
bool PARTIAL::add(LIFO& s, int x) { s.push(x); if (s.size() == s.capacity()) s.setState(&fullState); return true; }
bool PARTIAL::fetch(LIFO& s, int& out) { out = s.pop(); if (s.size() == 0) s.setState(&emptyState); return true; }
bool FULL::fetch(LIFO& s, int& out) { out = s.pop(); s.setState(s.size() == 0 ? (LIFOState*)&emptyState : &partialState); return true; }

LIFO::LIFO(size_t c) : cap(c), current(&emptyState) {}

int main() {
  LIFO bb(4);
  int v;
  auto show = [&](const char* op) { cout << op << " -> " << bb.state() << '\n'; };
  bb.fetch(v); show("fetch");
  bb.add(1);   show("add 1");
  bb.add(2);   show("add 2");
  if (bb.fetch(v)) cout << "  got " << v << '\n';
  show("fetch");
  bb.add(3);   show("add 3");
  bb.add(4);   show("add 4");
  bb.add(5);   show("add 5");
  bb.add(6);   show("add 6");
}
```

The state objects hold no data of their own, so one shared instance of each is enough (they are effectively singletons) and many `LIFO` objects can share them. If states needed per-object data, the context would own `unique_ptr<LIFOState>` instances instead.

Why bother, for a stack this small? Each rule now lives in exactly one place: "you cannot add to a full LIFO" is `FULL::add` and nowhere else. Adding a state (say, LOCKED during a resize) means adding a class, not editing every `if` chain. The cost is more classes and an indirect call per operation. The same structure models TCP connection states, vending machines and parsers.

## Visitor {#ch28-visitor .th}

The **Visitor** pattern adds new operations to a class hierarchy without changing the classes. Each element class has one method, `accept(Visitor*)` (the course calls it `visitme`), which calls back `v->visit(this)`. Each operation is a visitor class with one `visit` overload per element type.

The call `element->visitme(visitor)` picks the code to run based on **two** dynamic types: the virtual `visitme` dispatches on the element, and inside it the virtual `visit` dispatches on the visitor, while overload resolution on `this` (whose static type is now the concrete element) picks the right `visit` overload. This is **double dispatch**, which C++ does not have built in: an ordinary virtual call dispatches on one object only.

### The course files

`visitor.cpp` compiles and runs as is. Class `A` declares `friend class Visitor;` so that the base `Visitor` can read the private `v` through a helper `getv(A*)`, which the derived visitors call:

```cpp run=c28-visitor
#include <iostream>
using namespace std;

class A;
class Visitor {
public:
  virtual void visit(A*) = 0;
  virtual ~Visitor() = default;
protected:
  int getv(A*);                 // the only place that touches A's private data
};

class A {
  friend class Visitor;         // friendship is granted to Visitor only, not to its subclasses
  int v;
public:
  A(int x) : v(x) {}
  void visitme(Visitor* vis) { vis->visit(this); }
};

int Visitor::getv(A* ap) { return ap->v; }

class Visitor1 : public Visitor {
public:
  void visit(A* ap) override { cout << "visitor 1 " << getv(ap) << '\n'; }
};
class Visitor2 : public Visitor {
public:
  void visit(A* ap) override { cout << "visitor 2 " << getv(ap) << '\n'; }
};

int main() {
  A a1(10), a2(20);
  Visitor1 v1;
  Visitor2 v2;
  a1.visitme(&v1);
  a2.visitme(&v2);
}
```

Why the helper instead of reading `ap->v` directly in `Visitor1`? **Friendship is not inherited.** `A` made `Visitor` a friend, not `Visitor1`, so `ap->v` inside `Visitor1::visit` does not compile. Routing access through a protected function of the friend base is the standard workaround. (Friendship is also not transitive and not mutual.)

`visitor-fix-the-error.cpp` compiles but fails to **link**:

```text
undefined reference to `vtable for Visitor'
undefined reference to `typeinfo for Visitor'
undefined reference to `Visitor::getv(A*)'
```

`Visitor::visit` is declared `virtual` but neither pure (`= 0`) nor defined. GCC emits a class's vtable in the translation unit that defines its first non-inline, non-pure virtual function (the key function); `visit` is never defined, so the vtable and typeinfo are never emitted. And `getv` is declared but never defined. Fix: make `visit` pure (`= 0`), and define `getv` after `A` is complete, as in the program above.

### Double dispatch with several element types

The pattern pays off when there are several element types and several operations. Here a text is split into elements (words, numbers, punctuation), and each visitor computes something different without the element classes knowing about it:

```cpp run=c28-visitor-text
#include <cctype>
#include <iostream>
#include <memory>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

struct Word; struct Number; struct Punct;
struct Visitor {
  virtual void visit(Word&) = 0;
  virtual void visit(Number&) = 0;
  virtual void visit(Punct&) = 0;
  virtual ~Visitor() = default;
};

struct Element {
  virtual void accept(Visitor& v) = 0;      // first dispatch: on the element
  virtual ~Element() = default;
};
struct Word   : Element { string text; explicit Word(string t) : text(std::move(t)) {} void accept(Visitor& v) override { v.visit(*this); } };
struct Number : Element { long value; explicit Number(long n) : value(n) {} void accept(Visitor& v) override { v.visit(*this); } };
struct Punct  : Element { char c; explicit Punct(char ch) : c(ch) {} void accept(Visitor& v) override { v.visit(*this); } };
// inside accept, *this has the concrete type, so overload resolution picks visit(Word&) etc.: the second dispatch

vector<unique_ptr<Element>> tokenize(const string& s) {
  vector<unique_ptr<Element>> out;
  for (size_t i = 0; i < s.size();) {
    unsigned char c = s[i];
    if (isspace(c)) { ++i; continue; }
    size_t j = i;
    if (isalpha(c)) { while (j < s.size() && isalpha((unsigned char)s[j])) ++j; out.push_back(make_unique<Word>(s.substr(i, j - i))); }
    else if (isdigit(c)) { while (j < s.size() && isdigit((unsigned char)s[j])) ++j; out.push_back(make_unique<Number>(stol(s.substr(i, j - i)))); }
    else { out.push_back(make_unique<Punct>(s[i])); j = i + 1; }
    i = j;
  }
  return out;
}

struct Stats : Visitor {
  int words = 0, numbers = 0, puncts = 0;
  void visit(Word&) override { ++words; }
  void visit(Number&) override { ++numbers; }
  void visit(Punct&) override { ++puncts; }
};
struct Longest : Visitor {
  string best;
  void visit(Word& w) override { if (w.text.size() > best.size()) best = w.text; }
  void visit(Number&) override {}
  void visit(Punct&) override {}
};
struct Sum : Visitor {
  long total = 0;
  void visit(Word&) override {}
  void visit(Number& n) override { total += n.value; }
  void visit(Punct&) override {}
};

int main() {
  string text = "Alice was beginning to get very tired of sitting by her sister on the bank, "
                "and of having nothing to do: once or twice she had peeped into the book. "
                "Chapter 1 has 12 pages and 3 pictures.";
  auto elems = tokenize(text);
  Stats st; Longest lg; Sum sm;
  for (auto& e : elems) { e->accept(st); e->accept(lg); e->accept(sm); }
  cout << st.words << " words, " << st.numbers << " numbers, " << st.puncts << " punctuation marks\n";
  cout << "longest word: " << lg.best << ", numbers add up to " << sm.total << '\n';
}
```

The trade-off is the mirror image of plain virtual functions. **Adding an operation is easy** (write one new visitor class, touch nothing else). **Adding an element type is hard**: every visitor needs a new `visit` overload, and the `Visitor` interface changes. So Visitor fits hierarchies that are stable while the operations on them keep growing, such as compiler syntax trees (type checking, code generation, pretty printing are all visitors). In modern C++, `std::variant` with `std::visit` gives the same double dispatch for a closed set of types without the `accept` boilerplate.

## Drills: patterns and RPC {#ch28-drills .dr}

:::drill concept
What is a proxy, and name four kinds.
---
An object with the same interface as a real object that the client uses in its place; it forwards calls and adds behaviour. Remote proxy (the real object is in another process or machine), virtual proxy (creates an expensive object on first use), protection proxy (checks access rights), caching proxy (remembers results). Smart pointers are a kind of proxy too.
:::

:::drill bug
List the problems in the course's `abstract1.cpp` remote proxy sketch.
---
`main` calls `setReal(remote)` with a pointer, but this `setReal` takes `(string ip, int port)`: no matching function, compile error. `calculate` has no `return` statement: falling off the end of a non-`void` function is undefined behaviour (GCC warns). And `0.1 * income` is a `double` silently truncated to `int`.
:::

:::drill concept
Give the server and client socket call sequences for TCP.
---
Server: `socket` → `bind` (address and port) → `listen` (backlog) → `accept` (blocks, returns a new connected socket) → `recv`/`send` on that socket → `close`. Client: `socket` → `connect` (to the server's address and port) → `send`/`recv` → `close`.
:::

:::drill tricky
What happens on x86 if the server does `addr.sin_port = 8080;` without `htons`, and the client uses `htons(8080)`?
---
x86 is little-endian, so the server stores the bytes 0x90 0x1F, which in network byte order (big-endian) is port 0x901F = 36895. The server listens on 36895, and the client's connect to 8080 is refused. Always convert with `htons` and `htonl`.
:::

:::drill concept
What does `INADDR_ANY` mean in a server's `bind`, and why is it wrong as a client's destination?
---
On a server it means listen on all local interfaces (0.0.0.0). It is not a real host address. Connecting to it works on Linux only because the kernel treats it as the local machine; correct client code connects to the server's actual address, such as 127.0.0.1 or the server's IP.
:::

:::drill concept
Name the five pieces of program involved in one RPC and say what each does.
---
User (makes a normal local call), user stub (marshals arguments into a packet, unmarshals the result), RPC runtime (transmits, waits, retransmits, receives, on both sides), server stub (unmarshals arguments, calls the procedure locally, marshals the result), server (the real procedure, called normally).
:::

:::drill concept
What is marshalling, and why can't a raw pointer argument be marshalled as is?
---
Converting typed arguments and results into a flat, agreed-upon byte format (byte order, sizes, length-prefixed strings) and back. A pointer is an address in the caller's address space; on the server it points to unrelated memory or nothing. The pointed-to data must be copied (and, for output parameters, copied back).
:::

:::drill concept
What is binding in RPC, and what are the two parts of a name in the Birrell–Nelson design?
---
Binding is how the caller determines which server it talks to and where that server is. A name has a type (the interface, such as "mail server") and an instance (a specific server). Servers export interfaces; clients import them; locations were kept in the Grapevine distributed database.
:::

:::drill tricky
A client sends "debit 100", gets no reply, and retries. Under at-least-once semantics, what can go wrong? What does at-most-once require?
---
The first request may have executed and only the reply was lost, so retrying debits twice. At-least-once is safe only for idempotent operations. At-most-once requires the server to recognise duplicates (a request id or sequence number) and return the saved reply instead of re-executing.
:::

:::drill concept
Why is exactly-once semantics impossible to guarantee in general?
---
If the server crashes, the client cannot tell whether it crashed before or after executing the call, and without persistent state the server cannot tell either after restarting. Retrying risks twice; not retrying risks zero times. Systems approximate it with at-most-once plus durable logs and transactions.
:::

:::drill concept
What is the State pattern, and what does it replace?
---
The object delegates its behaviour to a current-state object, one class per state, and transitions swap that object. It replaces conditional chains (`if (state == EMPTY) … else if (state == FULL) …`) repeated in every operation, so each state's rules live in one class.
:::

:::drill bug
Give three reasons the course's `state.cpp` skeleton does not compile.
---
`State* current` uses a type that is never declared (the base is `LIFOState`); `LIFO` declares a constructor named `BoundedBuffer`, which is not its class name; and member functions are declared `= 0` without `virtual`, but only virtual functions can be pure. Also `main` calls `new LIFO(4)`, and the abstract/pure members would make it non-instantiable.
:::

:::drill output
In the completed LIFO with capacity 4, starting empty: `fetch`, `add 1`, `add 2`, `fetch`, `add 3`, `add 4`, `add 5`. Which state follows each operation, and which operations report errors?
---
fetch: error, stays EMPTY. add 1: PARTIAL. add 2: PARTIAL. fetch (gets 2): PARTIAL. add 3: PARTIAL (2 items). add 4: PARTIAL (3 items). add 5: FULL (4 items). The next add would report an error.
:::

:::drill concept
What is double dispatch, and how does Visitor achieve it?
---
Choosing the code to run based on the dynamic types of two objects. `element.accept(visitor)` dispatches virtually on the element; inside, `visitor.visit(*this)` dispatches virtually on the visitor, and `*this` has the concrete element type, so overload resolution selects the matching `visit` overload.
:::

:::drill tricky
`A` declares `friend class Visitor;`. Can `Visitor1 : public Visitor` read `A`'s private members directly?
---
No. Friendship is not inherited (nor transitive, nor mutual). Only `Visitor`'s own member functions get access, which is why the course puts the accessor `getv` in the base class and derived visitors call it.
:::

:::drill bug
`visitor-fix-the-error.cpp` compiles but the link fails with "undefined reference to vtable for Visitor". Why, and what is the fix?
---
`Visitor::visit` is virtual but neither pure nor defined. GCC emits the vtable alongside the class's first non-pure, non-inline virtual function definition; since `visit` is never defined, no vtable or typeinfo is emitted. `getv` is also declared and never defined. Make `visit` pure (`= 0`) and define `getv`.
:::

:::drill concept
When is Visitor a good fit and when a bad one?
---
Good when the element hierarchy is stable and new operations are added often (syntax trees, document models): each operation is one new class. Bad when element types are added often: every visitor and the visitor interface must change.
:::

## Write the code {#ch28-coding .cd}

:::drill code rating=1500
Write a **protection proxy** and a **virtual proxy** for a `Document` interface with `read()` and `write(text)`: the virtual proxy loads the real document only on first use, and the protection proxy allows `write` only for users with the editor role. Stack them: protection in front of virtual in front of real.
---
```cpp run=c28-c-proxies
#include <iostream>
#include <memory>
#include <stdexcept>
#include <string>
using namespace std;

struct Document {
  virtual string read() = 0;
  virtual void write(const string& s) = 0;
  virtual ~Document() = default;
};

struct RealDocument : Document {
  string body;
  explicit RealDocument(string name) { cout << "  (loading " << name << " from disk)\n"; body = "v1"; }
  string read() override { return body; }
  void write(const string& s) override { body = s; }
};

class LazyDocument : public Document {          // virtual proxy
  string name;
  unique_ptr<RealDocument> real;
  RealDocument& get() { if (!real) real = make_unique<RealDocument>(name); return *real; }
public:
  explicit LazyDocument(string n) : name(std::move(n)) {}
  string read() override { return get().read(); }
  void write(const string& s) override { get().write(s); }
};

class GuardedDocument : public Document {       // protection proxy
  Document& inner;
  string role;
public:
  GuardedDocument(Document& d, string r) : inner(d), role(std::move(r)) {}
  string read() override { return inner.read(); }
  void write(const string& s) override {
    if (role != "editor") throw runtime_error("permission denied for role " + role);
    inner.write(s);
  }
};

int main() {
  LazyDocument lazy("spec.txt");
  cout << "proxy created\n";
  GuardedDocument viewer(lazy, "viewer"), editor(lazy, "editor");
  cout << viewer.read() << '\n';                 // first use: the real document loads now
  try { viewer.write("v2"); } catch (const exception& e) { cout << e.what() << '\n'; }
  editor.write("v2");
  cout << viewer.read() << '\n';
}
```

Both proxies implement `Document`, so they nest in any order and the client cannot tell them from the real thing.
:::

:::drill code rating=1600
Add **at-most-once** semantics to an RPC server: each request carries a client id and a sequence number; the server remembers the last sequence number and reply per client, and a retransmitted request gets the saved reply without re-executing. Simulate a lost reply.
---
```cpp run=c28-c-amo
#include <iostream>
#include <map>
#include <string>
using namespace std;

class BankServer {
  int balance = 1000;
  map<string, pair<int, string>> lastByClient;     // client -> (seq, saved reply)
public:
  string handle(const string& client, int seq, const string& op, int amount) {
    auto it = lastByClient.find(client);
    if (it != lastByClient.end() && it->second.first == seq) return it->second.second + " (duplicate, not re-executed)";
    if (it != lastByClient.end() && seq < it->second.first) return "stale request ignored";
    string reply;
    if (op == "debit") { balance -= amount; reply = "ok, balance " + to_string(balance); }
    else reply = "unknown op";
    lastByClient[client] = {seq, reply};
    return reply;
  }
};

int main() {
  BankServer s;
  cout << s.handle("c1", 1, "debit", 100) << '\n';
  string lost = s.handle("c1", 2, "debit", 50);   // executed, but pretend the reply was lost
  (void)lost;
  cout << s.handle("c1", 2, "debit", 50) << '\n'; // client retransmits seq 2
  cout << s.handle("c1", 3, "debit", 25) << '\n';
}
```

Without the table, the retransmission would debit 50 twice. A real server would keep the table in durable storage so that the guarantee survives a server restart, and would expire old entries.
:::

## Cheat sheet {#ch28-cheatsheet .th}

- Proxy: same interface, forwards and adds behaviour (remote, virtual, protection, caching). A remote proxy is an RPC client stub.
- Sockets: server `socket/bind/listen/accept`, client `socket/connect`; `htons`/`htonl`; `INADDR_ANY` = all interfaces (server side only); TCP is a byte stream, so frame messages; check every return value.
- RPC: user → user stub (marshal) → runtime → server stub (unmarshal, call, marshal) → server. Binding = naming (type + instance) + location (Grapevine); export/import. Stub generators produce stubs from the interface.
- Failure semantics: at-least-once (retry; idempotent only), at-most-once (duplicate detection), exactly-once (ideal; needs durable state).
- State: context delegates to a state object; one class per state; transitions swap it.
- Visitor: `accept(v)` → `v.visit(*this)`: double dispatch. Easy to add operations, hard to add element types. Friendship is not inherited; an undefined non-pure virtual function means "undefined reference to vtable".
