---
title: Namespaces and argument-dependent lookup
part: Part B · Language features
lede: Namespaces decide which declaration a plain name like `x` or `f` refers to. Most exam questions here are "will this compile, and if so what prints?", and the answers follow from a handful of lookup rules: local names hide outer ones, a using-directive makes names visible without declaring them, ambiguity is an error only when the name is used, and an unqualified function call also searches the namespaces of its arguments. This chapter states each rule, then traces every case through real compiler output.
desc: using-declarations vs directives, hiding and ambiguity, nested and aliased namespaces, anonymous namespaces vs static, extern, Koenig lookup (ADL)
hours: 2.5
prereqs: basic C++, overloading
---

## What a namespace is {#ch05-basics .th}

A namespace is a named scope for declarations. It exists only at compile time: `B::p` is just a longer name for a global variable, with no run-time cost. Namespaces can be reopened in many places and many files, and everything declared in all the pieces belongs to the same namespace.

```cpp
namespace B { int p, q; }
namespace B { void reset() { p = q = 0; } }   // same namespace, reopened
```

Code outside the namespace has three ways to reach `B::p`:

| Form | Example | Effect |
|---|---|---|
| Qualified name | `B::p = 10;` | Always unambiguous; works anywhere |
| using-declaration | `using B::p;` | Declares the one name `p` in this scope, like a local declaration |
| using-directive | `using namespace B;` | Makes *all* of `B`'s names visible here, without declaring any of them |

Without one of these, `p` is simply not found. The course's `0usingunlocks.cpp` assigns `p = 10;` in `main` with no `using`, and the compiler stops:

```cpp run=c05-no-using expect=error cmd="g++ -std=c++20 -fsyntax-only main.cpp 2>&1 | grep -o 'error: .*'; exit 1"
namespace B { int p, q; }

int main() {
  p = 10;
  q = 20;
}
```

`using namespace B;` would fix it, but only for `B`. With two namespaces `A` and `B` and only `using namespace B;`, `p` compiles and `x` (from `A`) still does not. A directive opens exactly the namespace it names.

`::name` with nothing on the left means the global namespace. It reaches a global variable that a local one hides.

## Hiding, ambiguity and using-directives {#ch05-rules .th}

Unqualified lookup searches scopes from the inside out and **stops at the first scope that declares the name**. Two consequences:

- A local `x` hides a global `x` and any namespace `x` made visible by a directive.
- If two declarations are found *in the same scope*, the name is ambiguous, but only if you use it. Merely having both visible is fine.

The detail that makes the exam questions work is where a using-directive puts the names. They are not declared in the scope that contains the directive. For lookup, they behave **as if declared in the nearest enclosing namespace that contains both the directive and the nominated namespace**. For a directive inside `main` naming a global-level namespace `H`, that is the global namespace. So a local variable in `main` still hides `H::x`:

```cpp run=c05-hiding
#include <iostream>
using namespace std;

namespace H { int x = 10; }

int main() {
  int x = 20;
  using namespace H;
  cout << x << '\n';      // the local x: H's names act as if they were global
  cout << H::x << '\n';
}
```

The course file then adds `int &x = H::x;` in the same block, and that does not compile: `main` already declares an `x`, and a scope cannot declare the same name twice. The error is about the redeclaration, not about lookup.

```cpp run=c05-redecl expect=error cmd="g++ -std=c++20 -fsyntax-only main.cpp 2>&1 | grep -o 'error: .*'; exit 1"
namespace H { int x = 10; }

int main() {
  int x = 20;
  using namespace H;
  int& x = H::x;
}
```

A using-*declaration* is different: it really declares the name in the current scope. So `int x = 20; using H::x;` in one block is also a conflict, while `using H::x;` alone makes `x` mean `H::x` and hides any global `x`.

:::key Three questions for any "which x?" problem
1. Which scopes declare `x`, from the inside out? The first one found wins.
2. Where do using-directives put their names? In the nearest namespace that encloses both, usually the global one.
3. Did lookup find two `x` in the same scope? Then using `x` is ambiguous.
:::

## Nested, transitive and aliased namespaces {#ch05-nested .th}

A using-directive inside a namespace is **transitive**: `using namespace G;` brings in everything `G` brings in. Here `G` contains `using namespace H;`, so `main` sees both `G::y` and `H::x`:

```cpp run=c05-transitive
#include <iostream>
using namespace std;

namespace H { int x = 10; }
namespace G {
  int y = 20;
  using namespace H;
}

int main() {
  using namespace G;
  cout << x << ' ' << y << '\n';
}
```

Give `H` a `y` as well and the same `main` no longer compiles. `G::y` and `H::y` both become visible as if global, neither hides the other, and using `y` is ambiguous:

```cpp run=c05-ambiguous expect=error cmd="g++ -std=c++20 -fsyntax-only main.cpp 2>&1 | grep -o 'error: .*'; exit 1"
#include <iostream>
namespace H { int x = 10; int y = 10; }
namespace G { int y = 20; using namespace H; }

int main() {
  using namespace G;
  std::cout << x << y;
}
```

Inside `G` itself the picture is different, because `G::y` is declared directly in `G`, and `G`'s scope is searched before the global level where `H`'s names appear. The course's `8question.cpp` checks all three effects at once:

```cpp run=c05-question
#include <iostream>
using namespace std;

namespace H { int x = 10; int y = 4; }
namespace G {
  int y = 20;
  using namespace H;
  void f() { cout << y << "....\n"; }   // G::y: G's own scope is searched first
}

int main() {
  int y = 25;
  using namespace G;
  cout << x << '\n';    // H::x, through G's directive
  cout << y << '\n';    // the local y hides everything else
  f();
}
```

The file's commented-out variant moves `using namespace G;` into a separate function `g()` and calls `g()` from `main`. A directive is scoped to the block it appears in, so it has no effect on `main`, and `x` and `f` are no longer found: both are compile errors.

A **namespace alias** gives a second name to an existing namespace. `namespace A = H; using namespace A;` is exactly `using namespace H;`, which is how long names such as `namespace fs = std::filesystem;` are shortened.

C++17 also allows `namespace a::b::c { … }` as shorthand for three nested blocks. An `inline namespace` makes its members visible in the enclosing namespace as if declared there, which libraries use for versioning (`std::literals` members are reachable as `std::` names).

## Anonymous namespaces, static and extern {#ch05-linkage .th}

An **unnamed (anonymous) namespace** gets a unique name per translation unit plus an automatic using-directive. Its names are usable directly in that file and invisible to every other file: they have **internal linkage**. This is the C++ replacement for file-scope `static`.

```cpp
static int x = 100;     // internal linkage, C style
namespace { int y = 10; }   // internal linkage, C++ style; also works for types
int z = 1000;           // external linkage: other files can say extern int z;
```

The anonymous namespace is preferred because it also covers types and templates, which `static` cannot make file-local. The course's two-file example shows the difference: the second file can use `z` through `extern`, but not `x` or `y`.

```cpp run=c05-linkage cmd="printf 'extern int z;\nvoid h() { z++; }\n' > h.cpp && g++ -std=c++20 -Wall -o main main.cpp h.cpp && ./main"
#include <iostream>
using namespace std;

void h();                     // defined in h.cpp: extern int z; void h() { z++; }

static int x = 100;
namespace { int y = 10; }
int z = 1000;

void f() { x++; y = x + 1; z++; cout << x << ' ' << y << ' ' << z << '\n'; }
void g() { y++; }

int main() {
  f(); g(); h();
  cout << x << ' ' << y << ' ' << z << '\n';
}
```

If `h.cpp` instead declared `extern int x;` and used it, the program would compile and then fail to **link** ("undefined reference to `x`"), because no translation unit exports an `x`. That is a linker error, not a compiler error, which is worth saying in an exam answer.

`extern int z;` is a declaration without a definition: it promises that some other file defines `z`. Exactly one file must define it (the one-definition rule).

## Argument-dependent (Koenig) lookup {#ch05-adl .th}

For an **unqualified function call** such as `f(a)`, the compiler searches the usual scopes and *also* the namespaces associated with the argument types. For a class type that means the namespace the class is declared in (plus its base classes' namespaces, and for templates, the namespaces of the template arguments). This is argument-dependent lookup, also called Koenig lookup.

It is the reason this works with no `using`:

```cpp run=c05-cout
#include <iostream>
#include <string>

int main() {
  std::string str = "hello world";
  std::cout << str << '\n';   // finds std::operator<<(ostream&, const string&) through ADL
}
```

`operator<<` for strings lives in namespace `std`. Without ADL you would have to write `std::operator<<(std::cout, str)`. ADL looks in `std` because the arguments are of types from `std`.

Rules to apply when tracing a call:

1. ADL applies only to **unqualified** names called with arguments. `f()` with no arguments has no associated namespaces, so `f` must be visible normally. `A::f(x)` is qualified, so ADL is off.
2. Each argument contributes its own namespaces. The candidate set is the union, and then normal overload resolution picks the best match. If nothing matches, it is a compile error, even if a function of that name exists somewhere.
3. Built-in types (`int`, `double`) have no associated namespace.
4. ADL is suppressed if ordinary lookup finds a class member or a block-scope function declaration, and when the name is in parentheses: `(f)(x)`.

```cpp run=c05-koenig
#include <iostream>
using namespace std;

namespace A {
  class X {};
  class Y {};
  void f(Y) { cout << "welcome\n"; }
  void g(X, Y) { cout << "blessings\n"; }
  void f(X) { cout << "hello\n"; Y y; f(y); }   // inside A: A::f(Y)
  void g(X) { cout << "hi\n"; }
}
namespace B {
  class Y {};
  class Z {};
  void f(Z) {}
  void f(Y) { cout << "greetings\n"; }
  void g(Y) { cout << "namashkar\n"; }
}

int main() {
  A::X x;
  B::Y y;
  f(x);    // X is in A: A::f(X)
  g(x);    // A::g(X)
  f(y);    // B::Y is in B: B::f(Y)
  g(y);    // B::g(Y)
}
```

Now the two course variants that do **not** compile. First, add `g(x, y)` with `x` an `A::X` and `y` a `B::Y`. Both `A` and `B` are searched, but `A::g(X, Y)` needs an `A::Y`, and no other `g` takes two arguments:

```cpp run=c05-koenig3 expect=error cmd="g++ -std=c++20 -fsyntax-only main.cpp 2>&1 | grep -o 'error: no matching.*'; exit 1"
namespace A { class X {}; class Y {}; void g(X, Y) {} void g(X) {} }
namespace B { class Y {}; void g(Y) {} }

int main() {
  A::X x;
  B::Y y;
  g(x, y);
}
```

Second, make `y` an `A::Y` instead. Now `g(x, y)` finds `A::g(X, Y)` and prints "blessings", but `g(y)` fails: `A` has no `g(Y)`, and `B` is not associated with any argument, so `B::g` is never considered.

:::trap ADL doesn't mean "search everywhere"
Only the namespaces of the argument types are added. A perfectly matching `B::g(A::Y)` would be ignored for `g(a_y)` unless `B` is also visible by ordinary lookup.
:::

### Where ADL matters in real code

- **Operators.** Every overloaded operator for your type should live in your type's namespace so ADL finds it.
- **The swap idiom.** Generic code writes `using std::swap; swap(a, b);`. The using-declaration provides the fallback, and ADL finds a better `swap` in `a`'s namespace if the type has one. Writing `std::swap(a, b)` would skip the custom one.
- **Hidden friends.** A `friend` function defined inside a class is found *only* through ADL. That keeps it out of ordinary overload sets, which speeds compilation and avoids surprising conversions.

## Drills: namespaces and ADL {#ch05-drills .dr}

:::drill output
Does it compile? If so, what prints?

```cpp run=c05-d-anon
#include <iostream>
using namespace std;
namespace { int p, q; }
int main() {
  p = 10;
  q = 20;
  cout << p + q << '\n';
}
```
---
It compiles: an unnamed namespace comes with an implicit using-directive, so its names are usable in the file without any `using`.
:::

:::drill concept
What is the difference between `using B::p;` and `using namespace B;`?
---
The using-declaration declares the single name `p` in the current scope, so it can conflict with another `p` declared there and it hides outer `p`s. The using-directive declares nothing: it makes all of `B`'s names visible as if declared in the nearest namespace enclosing both, so a local name still hides them and conflicts appear only when an ambiguous name is used.
:::

:::drill output
Does it compile? If so, what prints?

```cpp run=c05-d-alias
#include <iostream>
using namespace std;
namespace H { int x = 10; int y = 10; }
namespace A = H;
using namespace A;
int main() { cout << x << ' ' << y << '\n'; }
```
---
`A` is an alias for `H`, so `using namespace A;` opens `H`.
:::

:::drill tricky
`namespace H { int x = 10; }` and in `main`: `int x = 20; using namespace H; cout << x;`. Which `x` prints, and why doesn't the directive cause an ambiguity?
---
20. The directive makes `H::x` visible as if declared in the global namespace. Lookup finds the local `x` in `main`'s block first and stops, so `H::x` is never even compared with it.
:::

:::drill bug
Why does this fail to compile?

```cpp
int main() {
  int x = 20;
  using namespace H;
  int& x = H::x;
}
```
---
`int& x` declares a second `x` in the same block as `int x`. That redeclaration is the error ("conflicting declaration"). Lookup has nothing to do with it; use a different name for the reference.
:::

:::drill tricky
`G` contains `int y = 20; using namespace H;` and `H` contains `int y = 10;`. In `main`, after `using namespace G;`, is `cout << y;` legal? Inside a function of `G`, is `cout << y;` legal?
---
In `main` it is ambiguous: both `G::y` and `H::y` appear as if global, and neither hides the other. Inside `G`, `G::y` is declared in `G`'s own scope, which is searched before the global level where `H`'s names appear, so it prints 20.
:::

:::drill concept
Why is an anonymous namespace preferred over `static` for file-local names?
---
Both give internal linkage, but `static` only works for variables and functions. An anonymous namespace also makes types, templates and enums local to the file, so two files can each have a helper `struct Node` without an ODR violation.
:::

:::drill tricky
File 1 has `static int x = 100;`. File 2 has `extern int x; void h() { x++; }`. Both compile. What happens when you build the program?
---
The link fails with "undefined reference to `x`". File 2 compiles because `extern int x;` is just a promise. File 1's `x` has internal linkage, so it is not exported to satisfy the promise. A linker error, not a compiler error.
:::

:::drill concept
Explain why `std::cout << s;` works without `using namespace std;` for a `std::string s`.
---
`<<` here is an unqualified call to `operator<<` with arguments of type `std::ostream` and `std::string`. Argument-dependent lookup adds namespace `std` to the search, where `operator<<(ostream&, const string&)` is declared.
:::

:::drill output
Does it compile? If so, what prints?

```cpp run=c05-d-k1
#include <iostream>
using namespace std;
namespace A { class X {}; void f() { cout << "hello\n"; } }
namespace B { class Y {}; void f(Y) { cout << "greetings\n"; } void g(Y) { cout << "namashkar\n"; } }
int main() {
  B::Y y;
  f(y);
  g(y);
}
```
---
ADL through `B::Y` finds `B::f` and `B::g`. A plain `f();` would not compile: with no arguments there is nothing to drive ADL, and no `f` is visible normally.
:::

:::drill tricky
`x` is an `A::X`, `y` is an `A::Y`. `A` declares `g(X)` and `g(X, Y)`; `B` declares `g(B::Y)`. Which of `g(x)`, `g(y)`, `g(x, y)` compile?
---
`g(x)` and `g(x, y)` compile (`A::g(X)` and `A::g(X, Y)`). `g(y)` does not: only `A` is associated with `A::Y`, and `A` has no `g` taking a `Y`. `B::g` is never considered, since nothing ties the call to `B`.
:::

:::drill output
`A::f(X)` prints "hello", then declares an `A::Y y;` and calls `f(y)`. `A::f(Y)` prints "welcome". What does `f(x)` print for an `A::X x`?
---
`hello`, then `welcome`. Inside `A`, `f` finds both overloads by ordinary lookup (and ADL agrees), and `f(y)` with an `A::Y` picks `A::f(Y)`.
:::

:::drill concept
What does `using std::swap; swap(a, b);` achieve that `std::swap(a, b);` does not?
---
The unqualified call allows ADL, so a `swap` declared in the namespace of `a`'s type (often a faster, non-throwing one) is found and preferred. The using-declaration supplies `std::swap` as the fallback for types without one. A qualified `std::swap` always uses the generic three-move version.
:::

:::drill concept
Name two situations where ADL does not happen even though the call has class-type arguments.
---
A qualified call (`N::f(x)`) and a parenthesised name (`(f)(x)`). Also when ordinary lookup finds a class member function (inside a member function, `f(x)` finding `this->f`) or a function declared at block scope.
:::

## Write the code {#ch05-coding .cd}

:::drill code rating=1200
Write a namespace `geo` with a `struct Point { int x, y; }` and an `operator<<` so that `std::cout << p` works for a `geo::Point p` from code that has no `using` at all. Add a hidden-friend `operator==` too.
---
```cpp run=c05-c-point
#include <iostream>

namespace geo {
  struct Point {
    int x, y;
    friend bool operator==(const Point& a, const Point& b) { return a.x == b.x && a.y == b.y; }  // hidden friend
  };
  std::ostream& operator<<(std::ostream& os, const Point& p) { return os << '(' << p.x << ", " << p.y << ')'; }
}

int main() {
  geo::Point p{1, 2}, q{1, 2};
  std::cout << p << ' ' << (p == q) << '\n';    // both operators found through ADL on geo::Point
}
```

Both operators are found because the argument type `geo::Point` makes `geo` an associated namespace. The hidden friend is visible *only* through ADL, so it never takes part in unrelated overload resolution.
:::

:::drill code rating=1300
Write a generic `sort3(a, b, c)` that sorts three values with `swap`, using a type's own `swap` when it has one and `std::swap` otherwise. Show it picking a custom swap that counts calls.
---
```cpp run=c05-c-swap
#include <iostream>
#include <utility>

namespace lib {
  struct Big { int v; };
  int swaps = 0;
  void swap(Big& a, Big& b) noexcept { ++swaps; std::swap(a.v, b.v); }
}

template <class T> void sort3(T& a, T& b, T& c) {
  using std::swap;                      // fallback
  auto less = [](const T& l, const T& r) { if constexpr (requires { l.v; }) return l.v < r.v; else return l < r; };
  if (less(b, a)) swap(a, b);           // unqualified: ADL can find lib::swap
  if (less(c, b)) swap(b, c);
  if (less(b, a)) swap(a, b);
}

int main() {
  lib::Big a{3}, b{1}, c{2};
  sort3(a, b, c);
  std::cout << a.v << b.v << c.v << " custom swaps: " << lib::swaps << '\n';
  int x = 9, y = 7, z = 8;
  sort3(x, y, z);                       // int: no associated namespace, std::swap is used
  std::cout << x << y << z << '\n';
}
```
:::

## Cheat sheet {#ch05-cheatsheet .th}

- Reach a namespace member by `N::x`, `using N::x;` (declares `x` here) or `using namespace N;` (makes all names visible, declares nothing).
- Lookup goes inside out and stops at the first scope declaring the name; a local hides directive-visible names.
- A directive's names act as if declared in the nearest namespace enclosing both (usually global). Two such names are ambiguous only when used.
- Directives are transitive; aliases (`namespace A = H;`) are just another name.
- Anonymous namespace = internal linkage, replaces file-scope `static`, also works for types. `extern` declares without defining; a missing definition is a link error.
- ADL: unqualified call with class-type arguments also searches the arguments' namespaces. No arguments, qualified name or `(f)(x)` means no ADL. Used by `operator<<`, the `using std::swap` idiom and hidden friends.
