---
title: Copy constructors, virtual destructors and casts
part: Part A · Object-oriented programming
lede: Three things that go wrong in class hierarchies and value types. Copying an object with a pointer member shares the pointer unless you write the copy yourself. Deleting a derived object through a base pointer is undefined unless the destructor is virtual. Turning a base pointer back into a derived one is safe only if you check. This chapter traces each case through small programs, the kind exams ask you to predict, and ends with a naming service that stores objects of any class and gets them back with checked casts.
desc: copy constructor vs copy assignment, shallow vs deep copy, rule of three, virtual destructors, static_cast vs dynamic_cast, naming service
hours: 3
prereqs: [Ch 1](#ch01) (constructors, rule of five), [Ch 2](#ch02) (virtual functions, vtables)
---

## Copy constructor or copy assignment? {#ch04-which .th}

C++ has two copy operations, and which one runs depends on one question: **does the target object already exist?**

- The **copy constructor** `A(const A&)` builds a *new* object from an existing one. It runs for `A c(a);`, for `A c = a;` (the `=` here is initialisation syntax, not assignment), when an object is passed or returned by value (unless the copy is elided, see [Ch 21](#ch21)), and when a container copies an element in.
- The **copy assignment operator** `A& operator=(const A&)` overwrites an object that *already exists*: `c = a;` after `c` was constructed.

The program below gives the two operations different behaviour on purpose (the copy constructor squares, assignment adds 20), so the output shows which one ran.

```cpp run=c04-which
#include <iostream>
using namespace std;

class A {
  int p;
public:
  A(int x) : p(x) {}
  A(const A& a) : p(a.p * a.p) { cout << "copy constructor\n"; }
  A& operator=(const A& a) { cout << "copy assignment\n"; p = a.p + 20; return *this; }
  void dump() const { cout << p << '\n'; }
};

int main() {
  A a(10);
  A b = a;     // initialisation: copy constructor
  b.dump();
  A c(3);
  c = a;       // c already exists: copy assignment
  c.dump();
  A d(a);      // direct initialisation: copy constructor
  d.dump();
}
```

If you write a copy constructor but no assignment operator, the compiler still generates assignment, and it copies member by member. So in the course file where only the copy constructor prints, `a = b;` prints nothing and `a` simply takes `b`'s value.

:::key The one-line rule
New object: copy constructor. Existing object: copy assignment. The `=` sign tells you nothing on its own: `A b = a;` is a constructor call.
:::

### What a copy constructor's signature may look like

The first parameter must be a reference to the class: `A(const A&)`, `A(A&)`, or (rarely) a `volatile` variant. Any further parameters need default arguments. Two consequences come up in exams:

- `A(A a)` does not compile. Passing `a` by value would itself need a copy, so the copy constructor would call itself forever.
- `A(const A& a, int v)` with no default for `v` is *not* a copy constructor. It is an ordinary two-argument constructor. The compiler still generates the implicit copy constructor, so `A c(a);` compiles and does a memberwise copy, and `A c(a, 1000);` calls your constructor.

```cpp run=c04-extra-param
#include <iostream>
using namespace std;

class A {
public:
  int p;
  A(int x) : p(x) {}
  A(const A& a, int v) : p(a.p * v) { cout << "two-argument constructor\n"; }
};

int main() {
  A a(10);
  A b(a, 1000);   // the user-written constructor
  A c(a);         // still compiles: the implicit copy constructor exists
  cout << b.p << ' ' << c.p << '\n';
}
```

## Shallow copy and the pointer problem {#ch04-shallow .th}

The implicit copy operations copy each member. For an `int*` member that copies the **address**, not the integer it points to, so both objects end up pointing at the same heap integer. This is a *shallow* copy.

```cpp run=c04-shallow
#include <iostream>
using namespace std;

class Student {
public:
  int* marks;
  Student(int m) : marks(new int(m)) {}
  // no copy constructor written: the implicit one copies the pointer
};

int main() {
  Student s1(90);
  Student s2 = s1;
  *s2.marks = 50;
  cout << *s1.marks << ' ' << *s2.marks << '\n';
  *s2.marks = 70;
  cout << *s1.marks << ' ' << *s2.marks << '\n';
  cout << boolalpha << (s1.marks == s2.marks) << '\n';
}
```

Both lines print the same number twice, because there is only one integer. (The course file's comments say the second line prints 50 50; it prints 70 70.) The class also leaks its integer, because it has no destructor. Adding the obvious destructor makes things worse:

```cpp
~Student() { delete marks; }   // s2 deletes the int, then s1 deletes it again
```

Now both destructors delete the same pointer at the end of `main`. That is a **double delete**, which is undefined behaviour. With glibc you usually see `free(): double free detected in tcache 2` and an abort, but nothing guarantees a crash.

### The deep copy

A **deep copy** allocates new storage and copies the value into it, so each object owns its own integer:

```cpp run=c04-deep
#include <iostream>
using namespace std;

class Student {
public:
  int* marks;
  Student(int m) : marks(new int(m)) {}
  Student(const Student& o) : marks(new int(*o.marks)) {}          // deep copy
  Student& operator=(const Student& o) {
    if (this != &o) *marks = *o.marks;                              // reuse our own int
    return *this;
  }
  ~Student() { delete marks; }
};

int main() {
  Student s1(90);
  Student s2 = s1;
  *s2.marks = 50;
  cout << *s1.marks << ' ' << *s2.marks << '\n';
  Student s3(70);
  s3 = s1;
  cout << *s3.marks << ' ' << boolalpha << (s3.marks != s1.marks) << '\n';
}
```

### The rule of three

If a class needs a user-written **destructor**, it almost certainly needs a user-written **copy constructor** and **copy assignment operator** too, because the destructor means the class owns a resource and the implicit copies would share it. That is the rule of three. C++11 adds the move constructor and move assignment, which makes it the rule of five, and the better design is usually the rule of zero: hold the resource in a member that already manages it (`std::unique_ptr`, `std::vector`, `std::string`) and write none of the five. [Ch 1](#ch01-rule-of-five) covers five and zero in detail.

### Writing copy assignment correctly

Assignment has jobs the copy constructor does not have, because the target already holds data:

1. **Return `*this` by reference**, so `a = b = c` chains and no extra copy is made.
2. **Handle self-assignment.** `s = s;` must not free its own data before copying from it.
3. **Release or reuse the old resource.** The implicit operator just overwrites the pointer, which leaks whatever the target owned before.

The copy-and-swap idiom handles all three and gives the strong exception guarantee: take the argument by value (that copy is made with the copy constructor), then swap members with it. The old data leaves in the parameter and is freed when the parameter is destroyed.

```cpp
Student& operator=(Student other) noexcept {   // the copy happens at the call
  std::swap(marks, other.marks);
  return *this;                                // other's destructor frees our old int
}
```

## Virtual destructors {#ch04-vdtor .th}

`delete p` on a `Base*` calls the destructor through the static type `Base`. If `~Base` is not virtual and `p` really points to a `Derived`, the behaviour is **undefined**. In practice only `~Base` runs, so `Derived`'s members are never destroyed, but the standard promises nothing. With a virtual destructor, `delete` dispatches through the vtable to `~Derived`, which then runs `~Base` automatically, in reverse order of construction.

```cpp run=c04-virdest
#include <iostream>
using namespace std;

struct A { virtual ~A() { cout << "destroying A\n"; } };
struct B : A { ~B() override { cout << "destroying B\n"; } };

int main() {
  A* ap = new B();
  delete ap;      // ~B runs first, then ~A
}
```

Remove `virtual` and the same program has undefined behaviour. GCC usually prints only `destroying A`. The rule: **a class meant to be deleted through a base pointer needs a public virtual destructor**. A base that should never be deleted polymorphically can instead make its destructor protected and non-virtual, so `delete basePtr` does not compile. More detail, including the vtable cost, is in [Ch 2](#ch02-vdtor).

:::trap "It just leaks B's part"
Interviewers want the words *undefined behaviour*. Saying "B's destructor is skipped so B's members leak" describes one common outcome, not what the language guarantees.
:::

## static_cast and dynamic_cast {#ch04-casts .th}

**Upcasting** (derived to base) is implicit and always safe: every `B` is an `A`. **Downcasting** (base to derived) is not implicit, because an `A*` might point to an `A`, a `B` or a `C`. You have to say how you want it checked.

| | `static_cast<B*>(ap)` | `dynamic_cast<B*>(ap)` |
|---|---|---|
| When checked | compile time only: is `B` derived from `A`? | at run time, using RTTI |
| If `ap` does not point to a `B` | undefined behaviour, no error | returns `nullptr` (throws `std::bad_cast` for references) |
| Requires | a related type | a polymorphic source type (at least one virtual function) |
| Cost | none (maybe a pointer adjustment) | a type lookup, roughly a string compare or hierarchy walk |

The course's rule of thumb: **use `static_cast` when you know the object's actual type; use `dynamic_cast` when you need to check it at run time.**

```cpp run=c04-dyncast
#include <iostream>
using namespace std;

struct A { int a; A(int e) : a(e) {} virtual ~A() = default; };
struct B : A { int b; B(int e, int f) : A(e), b(f) {} void dump() { cout << "B " << a << ' ' << b << '\n'; } };
struct C : A { int c; C(int e, int f) : A(e), c(f) {} void dump() { cout << "C " << a << ' ' << c << '\n'; } };

int main() {
  for (int choice : {0, 1}) {
    A* ap = choice == 0 ? static_cast<A*>(new B(10, 20)) : new C(30, 40);
    if (C* cp = dynamic_cast<C*>(ap)) cp->dump();
    else cout << "not a C: got nullptr\n";
    delete ap;
  }
}
```

The course's `2dynamic.cpp` checks for `NULL` and prints "got nullpointer", but then calls `cp->dump()` anyway. Calling a member function through a null pointer is undefined behaviour, so the check has to guard the call, as above. Its `2.1statc.cpp` comment says `static_cast` "reports error": it does not. `static_cast<C*>(ap)` compiles whatever `ap` points to, and if it points to a `B`, `cp->dump()` reads `B`'s `b` as if it were `C`'s `c`. That may well print `10 20`, which looks right and is still undefined behaviour.

`dynamic_cast` on a class with no virtual functions does not compile, because there is no RTTI to look at:

```cpp run=c04-dyn-nonpoly expect=error cmd="g++ -std=c++20 -fsyntax-only main.cpp 2>&1 | grep -o 'error: .*' | head -1; exit 1"
struct A { int a; };
struct B : A { int b; };

int main() {
  A* ap = new B();
  B* bp = dynamic_cast<B*>(ap);
  (void)bp;
}
```

### The other two casts

- `const_cast` adds or removes `const`. Writing through it to an object that was *defined* `const` is undefined behaviour; its legitimate use is calling an old API that forgot a `const`.
- `reinterpret_cast` reinterprets bits: pointer to integer, unrelated pointer types. It does no adjustment for multiple inheritance, so `reinterpret_cast` from `Derived*` to its second base gives a wrong address where `static_cast` would be correct.
- A C-style cast `(B*)ap` tries `const_cast`, `static_cast` and `reinterpret_cast` in turn and silently picks one. That is why named casts are preferred: they say what you meant and are easy to search for.

## Design: a naming service {#ch04-naming .th}

The course exercise: *design a naming service that registers (name, object pointer) tuples, stores objects of all sorts of classes, gets them back with correct casts, and flags and skips errors.*

The design question is what type the registry stores. If it stores `void*`, any type goes in, but the type information is lost: `static_cast<Printer*>(voidptr)` compiles for any pointer, and a wrong guess is undefined behaviour with no way to detect it. A checked lookup needs run-time type information, so either:

1. every registered class derives from one polymorphic base (`Object` with a virtual destructor), and lookup uses `dynamic_cast<T*>`; or
2. the registry stores `std::any` (or a `void*` plus a `std::type_index`) and lookup compares the stored type with the requested one.

Option 1 is the classic OO answer and matches the chapter, so it is shown here. Option 2 works for types you cannot change, such as `int`.

```cpp run=c04-naming
#include <iostream>
#include <map>
#include <memory>
#include <string>
using namespace std;

struct Object { virtual ~Object() = default; };             // the common polymorphic base

struct Printer : Object { void print(const string& s) { cout << "printing " << s << '\n'; } };
struct Account : Object { int balance = 500; };
struct Savings : Account { double rate = 0.04; };

class NamingService {
  map<string, unique_ptr<Object>> table;
public:
  bool bind(const string& name, unique_ptr<Object> obj) {
    return table.emplace(name, std::move(obj)).second;      // false if the name is taken
  }
  template <class T> T* lookup(const string& name) {
    auto it = table.find(name);
    if (it == table.end()) { cout << "error: no object named " << name << '\n'; return nullptr; }
    T* p = dynamic_cast<T*>(it->second.get());
    if (!p) cout << "error: " << name << " has the wrong type\n";
    return p;
  }
};

int main() {
  NamingService ns;
  ns.bind("lp0", make_unique<Printer>());
  ns.bind("acct", make_unique<Savings>());
  if (!ns.bind("lp0", make_unique<Printer>())) cout << "error: lp0 already bound\n";

  if (auto* p = ns.lookup<Printer>("lp0")) p->print("report.pdf");
  if (auto* a = ns.lookup<Account>("acct")) cout << "balance " << a->balance << '\n';   // upcast view of a Savings
  if (auto* s = ns.lookup<Savings>("acct")) cout << "rate " << s->rate << '\n';
  if (auto* p = ns.lookup<Printer>("acct")) p->print("x");                            // wrong type: skipped
  if (auto* p = ns.lookup<Printer>("lp9")) p->print("x");                             // missing: skipped
}
```

Points to say out loud when you present this: the registry **owns** the objects (`unique_ptr`), so lookups return non-owning raw pointers; lookup of a base type (`Account`) for a derived object (`Savings`) succeeds, which `typeid` equality would wrongly reject; errors are reported and the caller skips the object instead of crashing.

## Drills: copy control and casts {#ch04-drills .dr}

:::drill output
What does this print?

```cpp run=c04-d-assign
#include <iostream>
using namespace std;
class A {
  int p;
public:
  A(int x) : p(x) {}
  A(const A& a) : p(a.p * a.p) { cout << "copy\n"; }
  void dump() { cout << p << '\n'; }
};
int main() {
  A a(10), b(20);
  a = b;
  a.dump();
  A c(a);
  c.dump();
}
```
---
`a = b` is assignment to an existing object, so the user-written copy constructor does not run; the implicit copy assignment copies `p`, giving 20. `A c(a)` constructs a new object, so the copy constructor runs and squares: 400.
:::

:::drill output
The class has a user-written copy constructor (squares) and copy assignment (adds 20). What does `A c(a); c.dump(); c = a; c.dump();` print for `A a(10);`?
---
`copy constructor` message, then `100`, then `30`. The first line constructs `c`, the second assigns to an existing `c`, and assignment computes `a.p + 20` from `a`, not from `c`.
:::

:::drill concept
Why can't a copy constructor take its parameter by value?
---
Passing an `A` by value means copy-constructing the parameter, which calls the copy constructor, which needs another by-value copy, forever. The compiler rejects `A(A)` for that reason. The parameter must be a reference.
:::

:::drill tricky
`A(const A& a, int v)` has no default for `v`. Is it a copy constructor? Does `A c(a);` compile?
---
It is not a copy constructor, because the extra parameter has no default. It is an ordinary constructor. The compiler still declares the implicit copy constructor, so `A c(a);` compiles and copies memberwise. Give `v` a default (`int v = 1`) and it becomes a copy constructor, and the implicit one is no longer generated.
:::

:::drill bug
This class is used as `Student a(1); Student b = a;`. What goes wrong at the end of `main`?

```cpp
struct Student {
  int* marks;
  Student(int m) : marks(new int(m)) {}
  ~Student() { delete marks; }
};
```
---
The implicit copy constructor copies the pointer, so `a` and `b` share one `int`. Both destructors delete it: a double delete, which is undefined behaviour (glibc usually aborts with "double free detected"). Fix: write a deep copy constructor and copy assignment (rule of three), delete them, or hold the mark in an `int` or `unique_ptr<int>` (rule of zero).
:::

:::drill concept
List three things a copy assignment operator must handle that a copy constructor does not.
---
Self-assignment (`a = a` must not destroy its own data before reading it), the target's old resource (free or reuse it, or it leaks), and returning `*this` by reference so assignments chain. Copy-and-swap handles all three.
:::

:::drill tricky
A class has only a user-written destructor. Which special members does the compiler still generate, and what is the trap?
---
It still generates the copy constructor and copy assignment (deprecated in this situation, but generated), and they copy memberwise. It does *not* generate move operations, so "moves" silently copy. The trap is that the destructor shows the class owns something, and the generated copies share it: the rule of three exists for exactly this case.
:::

:::drill output
What does this print?

```cpp run=c04-d-vdtor
#include <iostream>
using namespace std;
struct A { A() { cout << "A "; } virtual ~A() { cout << "~A "; } };
struct B : A { B() { cout << "B "; } ~B() override { cout << "~B "; } };
int main() {
  A* p = new B;
  delete p;
  cout << '\n';
}
```
---
Construction runs base first, destruction runs derived first. Because `~A` is virtual, `delete p` reaches `~B`.
:::

:::drill concept
Remove `virtual` from `~A` in the previous drill. What does the standard say happens, and what do you usually see?
---
Deleting a `B` through an `A*` whose destructor is not virtual is undefined behaviour. Typically only `~A` runs, so the output ends `~A` with no `~B`, and any resources `B` owns leak. Do not describe the typical outcome as the rule.
:::

:::drill concept
When is a non-virtual destructor in a base class acceptable?
---
When objects are never deleted through a base pointer. Make that enforced: give the base a protected non-virtual destructor, so `delete basePtr` does not compile but derived objects can still be destroyed normally. Mixin and CRTP bases often do this to avoid a vptr.
:::

:::drill tricky
`static_cast<C*>(ap)` compiles, and `ap` points to a `B`. `cp->dump()` prints `10 20`, which is what `B` holds. Is the program correct?
---
No. Using the result of a `static_cast` downcast to the wrong type is undefined behaviour. It printed sensible numbers only because `B` and `C` happen to have the same layout, so `C::dump` read `B`'s `b` where it expected `c`. Use `dynamic_cast` when the type is not known.
:::

:::drill concept
What does `dynamic_cast` do on failure for a pointer, and for a reference? Why the difference?
---
For a pointer it returns `nullptr`. For a reference it throws `std::bad_cast`, because there is no null reference to return.
:::

:::drill bug
What is wrong here, apart from style?

```cpp
C* cp = dynamic_cast<C*>(ap);
if (cp == NULL) cout << "got nullpointer\n";
cp->dump();
```
---
The null check does not guard the call. When the cast fails, `cp->dump()` calls a member function through a null pointer, which is undefined behaviour (it may even appear to work if `dump` reads no members). Put the call in the `else` branch, or `if (C* cp = dynamic_cast<C*>(ap)) cp->dump();`.
:::

:::drill concept
Why does `dynamic_cast` need a polymorphic type?
---
It finds the object's dynamic type through the vptr, which points to the vtable and its type information. A class with no virtual functions has no vptr, so there is nothing to check at run time. The compiler rejects the downcast: "source type is not polymorphic".
:::

:::drill tricky
Why is a naming service that stores `void*` a poor design if lookups must flag type errors?
---
`void*` erases the type. Casting it back with `static_cast<T*>` compiles for any `T`, and a wrong `T` is undefined behaviour that cannot be detected. To check, the registry must keep type information: store a polymorphic base pointer and use `dynamic_cast`, or store `std::any` or a `type_index` next to the pointer.
:::

:::drill concept
Rank the four named casts from safest to most dangerous and give one legitimate use of each.
---
`dynamic_cast`: checked downcast when the type is unknown. `static_cast`: numeric conversions, upcasts, downcasts when you know the type. `const_cast`: calling a legacy API that takes `char*` but does not modify. `reinterpret_cast`: low-level work such as treating a byte buffer as a hardware register or hashing a pointer value.
:::

## Write the code {#ch04-coding .cd}

:::drill code rating=1300
Write a `String` class that owns a `char*` buffer, with a constructor from `const char*`, the rule of three done correctly (deep copy, self-safe assignment, destructor) and a `c_str()` accessor. Show that copies are independent.
---
```cpp run=c04-c-string
#include <cctype>
#include <cstring>
#include <iostream>
#include <utility>

class String {
  char* buf;
public:
  String(const char* s = "") : buf(new char[std::strlen(s) + 1]) { std::strcpy(buf, s); }
  String(const String& o) : String(o.buf) {}                 // deep copy via the main constructor
  String& operator=(String o) noexcept { std::swap(buf, o.buf); return *this; }   // copy-and-swap
  ~String() { delete[] buf; }
  const char* c_str() const { return buf; }
  void upper() { for (char* p = buf; *p; ++p) *p = std::toupper(static_cast<unsigned char>(*p)); }
};

int main() {
  String a("hello");
  String b = a;         // copy constructor
  String c;
  c = a;                // copy assignment
  c = c;                // self-assignment is safe
  b.upper();
  std::cout << a.c_str() << ' ' << b.c_str() << ' ' << c.c_str() << '\n';
}
```

Copy-and-swap takes the argument by value, so the copy constructor does the allocation, and the old buffer is freed when the parameter dies. Self-assignment works because the parameter is a separate copy.
:::

:::drill code rating=1400
Extend the naming service so it also accepts types that do not derive from `Object`, such as `int` and `std::string`, still flagging a wrong-type lookup. Use `std::any`.
---
```cpp run=c04-c-any
#include <any>
#include <iostream>
#include <map>
#include <string>
using namespace std;

class Registry {
  map<string, any> table;
public:
  template <class T> void bind(const string& name, T value) { table[name] = std::move(value); }
  template <class T> T* lookup(const string& name) {
    auto it = table.find(name);
    if (it == table.end()) { cout << "error: no " << name << '\n'; return nullptr; }
    T* p = any_cast<T>(&it->second);           // pointer form returns nullptr on mismatch
    if (!p) cout << "error: " << name << " holds " << it->second.type().name() << '\n';
    return p;
  }
};

int main() {
  Registry r;
  r.bind("port", 8080);
  r.bind("host", string("localhost"));
  if (auto* p = r.lookup<int>("port")) cout << "port " << *p << '\n';
  if (auto* h = r.lookup<string>("host")) cout << "host " << *h << '\n';
  if (auto* p = r.lookup<long>("port")) cout << *p << '\n';
}
```

`any_cast` matches the exact stored type, so `long` does not match an `int` (and a base class does not match a derived one, unlike `dynamic_cast`). The printed type name is mangled and compiler-specific (`i` for `int` on GCC).
:::

## Cheat sheet {#ch04-cheatsheet .th}

- New object → copy constructor (`A b = a;`, `A b(a);`, pass or return by value). Existing object → copy assignment (`b = a;`).
- Copy constructor: first parameter `const A&`, extra parameters need defaults; `A(A)` is illegal.
- Implicit copies are memberwise: pointers are shared (shallow). User destructor ⇒ write or delete both copies (rule of three), or use the rule of zero.
- Assignment: return `*this` by reference, survive self-assignment, release the old resource. Copy-and-swap does all three.
- Deleting derived through a base pointer without a virtual destructor is undefined behaviour.
- Upcast implicit; downcast with `static_cast` (you know the type, unchecked) or `dynamic_cast` (checked, needs a virtual function, `nullptr` or `bad_cast` on failure).
- A naming service needs run-time type information: a polymorphic base plus `dynamic_cast`, or `std::any`.
