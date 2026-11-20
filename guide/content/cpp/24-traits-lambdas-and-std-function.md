---
title: Type traits, lambdas and std::function
part: Part E · Generic programming
lede: Type traits let a template ask questions about a type at compile time (is it an integer? a class?), and concepts turn those questions into requirements the compiler checks at the call site. Lambdas let you write a function where you use it, capturing local variables. This chapter covers both, then the three ways to pass a function around (a template parameter, `std::function`, a function pointer) and what each costs. It ends with the course exercises: map, filter and reduce over a vector.
desc: is_integral and friends, how traits are built, if constexpr, requires and concepts, lambda syntax and captures, generic lambdas, std::function vs templates vs function pointers, using aliases, map/filter/reduce
hours: 2.5
prereqs: [Ch 23](#ch23) (templates, specialisation)
---

## Type traits {#ch24-traits .th}

A **type trait** is a class template that answers a question about a type at compile time. The answer is a `static constexpr bool value` (for predicates) or a nested `type` (for transformations). `<type_traits>` provides dozens. C++17 adds `_v` and `_t` shortcuts: `is_integral_v<T>` means `is_integral<T>::value`, `remove_const_t<T>` means `typename remove_const<T>::type`.

```cpp run=c24-traits
#include <iostream>
#include <string>
#include <type_traits>
using namespace std;

class A {};

int main() {
  cout << is_integral<int>::value << is_integral<string>::value
       << is_integral<float>::value << is_integral<A>::value << '\n';
  cout << is_floating_point_v<int> << is_floating_point_v<string>
       << is_floating_point_v<float> << is_floating_point_v<A> << '\n';
  cout << is_class_v<int> << is_class_v<string> << is_class_v<float> << is_class_v<A> << '\n';
  cout << is_integral_v<bool> << is_integral_v<char> << is_same_v<remove_const_t<const int>, int> << '\n';
}
```

`std::string` is a class (it is `basic_string<char>`), and `bool` and `char` count as integral types. Both come up in "predict the output" questions.

### How a trait is built

Traits are ordinary templates with specialisations. The primary template answers `false`; specialisations for the matching types answer `true`. This is the same mechanism as `Fact<0>` in [Ch 23](#ch23), applied to types instead of numbers:

```cpp run=c24-mytrait
#include <iostream>

template <class T> struct is_pointer_like       { static constexpr bool value = false; };
template <class T> struct is_pointer_like<T*>   { static constexpr bool value = true; };   // partial specialisation

template <class T> struct remove_ptr     { using type = T; };
template <class T> struct remove_ptr<T*> { using type = T; };

int main() {
  std::cout << is_pointer_like<int>::value << is_pointer_like<int*>::value
            << is_pointer_like<char**>::value << '\n';
  remove_ptr<double*>::type d = 2.5;       // a plain double
  std::cout << d << '\n';
}
```

### Using a trait: if constexpr and static_assert

`if constexpr (cond)` evaluates `cond` at compile time and **discards** the branch that is not taken, so that branch may contain code that would not compile for the current type. `static_assert(cond, "message")` stops compilation with your message.

```cpp run=c24-ifconstexpr
#include <iostream>
#include <string>
#include <type_traits>
using namespace std;

template <class T>
string describe(const T& x) {
  if constexpr (is_integral_v<T>) return "integer " + to_string(x);
  else if constexpr (is_floating_point_v<T>) return "real " + to_string(x);
  else return "other: " + string(x);          // only instantiated for types that convert to string
}

int main() {
  cout << describe(42) << '\n' << describe(2.5) << '\n' << describe("text") << '\n';
}
```

With an ordinary `if`, every branch is compiled for every `T`, and `to_string("text")` would fail to compile.

## Constraining templates: requires and concepts {#ch24-concepts .th}

An unconstrained template accepts any type and fails somewhere inside its body if the type is wrong, with a long error. C++20 lets you state requirements up front. The course's `usetrait.cpp`:

```cpp run=c24-requires expect=error cmd="g++ -std=c++20 -fsyntax-only main.cpp 2>&1 | grep -E 'error|note: the expression' | head -3; exit 1"
#include <iostream>
#include <type_traits>

template <typename T>
  requires std::is_integral_v<T>
void print_number(T val) { std::cout << "Integral: " << val << "\n"; }

int main() {
  print_number(42);     // fine
  print_number("42");   // const char* is not integral
}
```

The error now names the call and the failed requirement. (The course comment mentions `-fconcepts`; that flag was for GCC's pre-C++20 concepts. With `-std=c++20` no flag is needed.)

A **concept** is a named, reusable requirement. The standard library defines many in `<concepts>` (`std::integral`, `std::floating_point`, `std::same_as`, `std::invocable`), and you can write your own with a `requires` expression that lists operations the type must support:

```cpp run=c24-concept
#include <concepts>
#include <iostream>
#include <string>

template <class T>
concept Addable = requires(T a, T b) { { a + b } -> std::convertible_to<T>; };

template <Addable T> T sum3(T a, T b, T c) { return a + b + c; }   // constrained parameter

void show(std::integral auto x) { std::cout << "int-like " << x << '\n'; }   // abbreviated syntax
void show(std::floating_point auto x) { std::cout << "real " << x << '\n'; }

int main() {
  std::cout << sum3(1, 2, 3) << ' ' << sum3(std::string("a"), std::string("b"), std::string("c")) << '\n';
  show(7);
  show(7.5);
}
```

Concepts also take part in overload resolution: the two `show` overloads above are chosen by which constraint the argument satisfies.

## Lambdas {#ch24-lambdas .th}

A lambda expression creates an unnamed function object (a **closure**) on the spot:

```text
[captures] (parameters) -> return_type { body }
```

The return type can be omitted when it can be deduced from the `return` statements. The compiler turns each lambda into a unique class with an `operator()`, and the captures become its data members.

```cpp run=c24-lambda-basics
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
  cout << [](int x, int y) -> int { return x + y; }(10, 20) << '\n';   // defined and called at once

  auto add = [](int a, int b) { return a + b; };   // stored in a variable: its type is unnamed, so auto
  cout << add(5, 3) << '\n';

  vector<int> v{1, 2, 3, 4};
  for_each(v.begin(), v.end(), [](int x) { cout << x * x << ' '; });
  cout << '\n';
}
```

### Captures

A lambda can use global variables freely, but local variables only if it captures them:

| Capture | Meaning |
|---|---|
| `[]` | nothing |
| `[x]` | copy `x` when the lambda is created |
| `[&x]` | refer to `x`; sees later changes, dangles if `x` dies first |
| `[=]`, `[&]` | capture everything used, by copy or by reference |
| `[this]` / `[*this]` | the current object by pointer / by copy (C++17) |
| `[n = compute()]` | init-capture: a new member initialised from an expression (C++14), also `[p = std::move(p)]` |

Copies are taken **when the lambda is created**, not when it is called. A by-copy capture is `const` inside the body unless the lambda is marked `mutable`, and even then you modify the closure's copy, not the original.

```cpp run=c24-captures
#include <iostream>
using namespace std;

int main() {
  int n = 1;
  auto byCopy = [n] { return n; };
  auto byRef  = [&n] { return n; };
  n = 50;
  cout << byCopy() << ' ' << byRef() << '\n';     // copy was taken at creation

  int count = 0;
  auto counter = [count]() mutable { return ++count; };   // modifies the closure's own copy
  counter(); counter();
  cout << counter() << ' ' << count << '\n';
}
```

:::trap Capturing by reference and returning the lambda
`auto make() { int local = 5; return [&] { return local; }; }` returns a closure holding a reference to a destroyed variable. Calling it is undefined behaviour. Capture by copy when the lambda can outlive the scope, which includes lambdas handed to threads and callbacks.
:::

### Generic lambdas

A lambda whose parameters are declared `auto` is **generic**: its `operator()` is a template, instantiated for each argument type. The course's `genericlambdas.cpp` defines an `operator+` for class `C` that multiplies, so the same lambda adds numbers and multiplies `C`s:

```cpp run=c24-generic
#include <iostream>
using namespace std;

struct C { int v; C(int i) : v(i) {} };
int operator+(C x, C y) { return x.v * y.v; }     // deliberately surprising: + multiplies

auto f = [](auto x, auto y) { return x + y; };    // operator() is a template

int main() {
  C c1(20), c2(30);
  cout << f(20, 30) << '\n';     // int + int
  cout << f(c1, c2) << '\n';     // C + C: the user's operator+
  cout << f(1.5, 2) << '\n';     // double + int
}
```

## Passing functions around {#ch24-passing .th}

There are three ways to accept "something callable" as a parameter.

**1. A template parameter.** The function is instantiated for the exact closure type, so the call can be inlined and costs nothing. The downside is that each callable type creates a new instantiation, and the parameter type cannot be named in a non-template (for example, as a class member type).

**2. `std::function<R(Args...)>`.** A type-erasing wrapper that can hold *any* callable with a compatible signature: a function, a lambda with captures, a function object, a bound member function. You pay for the flexibility with an indirect call that usually cannot be inlined, and possibly a heap allocation for a large closure. Calling an empty one throws `std::bad_function_call`. Use it to store callbacks of different types in one container or member.

**3. A function pointer**, written with a `using` alias for readability. A lambda with no captures converts to a function pointer; one with captures does not, because a plain pointer has nowhere to keep the captured data.

```cpp run=c24-passing
#include <functional>
#include <iostream>
#include <vector>
using namespace std;

template <typename F>
void viaTemplate(F op) { cout << "template: " << op(10, 5) << '\n'; }

void viaFunction(function<int(int, int)> op) { cout << "std::function: " << op(10, 5) << '\n'; }

using MathOperation = int (*)(int, int);           // the course's alias: pointer to int(int, int)
void viaPointer(MathOperation op) { cout << "pointer: " << op(10, 5) << '\n'; }

int add(int a, int b) { return a + b; }

int main() {
  int bonus = 100;
  auto multiply = [](int a, int b) { return a * b; };
  auto withBonus = [bonus](int a, int b) { return a - b + bonus; };

  viaTemplate(multiply);
  viaTemplate(withBonus);
  viaFunction(withBonus);
  viaFunction(add);
  viaPointer(add);
  viaPointer(multiply);          // captureless lambda converts to a function pointer
  // viaPointer(withBonus);      // does not compile: it captures

  vector<function<int(int, int)>> ops{add, multiply, withBonus};   // different types, one container
  for (auto& op : ops) cout << op(2, 3) << ' ';
  cout << '\n';

  function<void()> empty;
  try { empty(); } catch (const bad_function_call&) { cout << "empty std::function\n"; }
}
```

`using Name = type;` is the modern spelling of `typedef type Name;`. It reads left to right, which matters most for function pointers (`typedef int (*MathOperation)(int, int);` is the old form), and unlike `typedef` it can be a template: `template <class T> using Vec = std::vector<T, MyAlloc<T>>;`.

## Drills: traits and lambdas {#ch24-drills .dr}

:::drill output
What does this print?

```cpp run=c24-d-traits
#include <iostream>
#include <string>
#include <type_traits>
using namespace std;
struct A {};
int main() {
  cout << is_class_v<string> << is_integral_v<char> << is_integral_v<bool>
       << is_floating_point_v<long> << is_class_v<A*> << '\n';
}
```
---
`string` is a class; `char` and `bool` are integral; `long` is integral, not floating point; `A*` is a pointer, not a class.
:::

:::drill concept
How is a trait like `is_pointer` implemented?
---
With a primary template whose `value` is `false` and a partial specialisation for `T*` whose `value` is `true` (plus `const` and `volatile` variants in the real library). The compiler picks the specialisation for pointer types. No run-time code is involved.
:::

:::drill tricky
Why does `describe` in this chapter need `if constexpr` instead of a plain `if`?
---
With a plain `if`, both branches are compiled for every `T`, so instantiating `describe<const char*>` would compile `to_string(x)` with a `const char*`, which has no overload, and fail. `if constexpr` discards the untaken branch for that instantiation, so the invalid code is never compiled.
:::

:::drill concept
What does a `requires` clause improve over an unconstrained template?
---
The requirement is checked at the call site before the body is instantiated, so a bad call produces a short error naming the unsatisfied constraint, and constrained overloads can be selected by which constraint holds. Unconstrained, the error comes from deep inside the body.
:::

:::drill output
What does this print?

```cpp run=c24-d-capture
#include <iostream>
int main() {
  int x = 1;
  auto a = [x] { return x * 10; };
  auto b = [&x] { return x * 10; };
  x = 7;
  std::cout << a() << ' ' << b() << '\n';
}
```
---
`a` copied `x` (1) when it was created; `b` refers to `x`, which is 7 when it is called.
:::

:::drill bug
What is wrong?

```cpp
std::function<int()> make() {
  int local = 42;
  return [&] { return local; };
}
int main() { std::cout << make()(); }
```
---
The lambda captures `local` by reference, but `local` is destroyed when `make` returns. Calling the closure reads a dangling reference: undefined behaviour. Capture by copy (`[=]` or `[local]`).
:::

:::drill output
`int c = 0; auto f = [c]() mutable { return ++c; }; f(); f();` What do `f()` and `c` give afterwards?
---
`f()` returns 3 and `c` is still 0. `mutable` lets the body change the closure's own copy of `c`, which persists between calls of the same closure object; the original variable is untouched.
:::

:::drill output
`auto f = [](auto x, auto y) { return x + y; };` and `int operator+(C a, C b) { return a.v * b.v; }`. What is `f(C(20), C(30))`? And `f(2, 3.5)`?
---
600, because the generic lambda calls the user's `operator+`, which multiplies. `f(2, 3.5)` is 5.5: each `auto` parameter is deduced separately (`int` and `double`), and `int + double` gives `double`.
:::

:::drill concept
Compare passing a lambda as a template parameter and as `std::function`.
---
Template: the exact closure type is known, the call is direct and usually inlined, no allocation, but each callable type creates a new instantiation and the type cannot be stored in a non-template member. `std::function`: one type that holds any callable with the signature, storable in containers and members, but with an indirect call, possibly a heap allocation, and `bad_function_call` when empty.
:::

:::drill tricky
Can a lambda be passed where an `int (*)(int, int)` is expected?
---
Only if it captures nothing. A captureless lambda has an implicit conversion to a function pointer. A capturing lambda has data members, and a plain function pointer has nowhere to store them, so the conversion does not exist.
:::

:::drill concept
`using MathOperation = int (*)(int, int);` What is `MathOperation`, and what can `using` do that `typedef` cannot?
---
A pointer to a function taking two `int`s and returning `int`. `using` can declare alias templates (`template <class T> using Vec = vector<T>;`), which `typedef` cannot, and it reads more clearly.
:::

## Write the code {#ch24-coding .cd}

:::drill code rating=1300
The three course exercises: `map(vector<T>, f)` returns the vector of `f` applied to each element; `filter(vector<T>, pred)` keeps the elements for which `pred` is true; `reduce(vector<T>, f)` collapses the vector to one `T`. Write them as templates that accept lambdas, then chain them.
---
```cpp run=c24-c-mfr
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;

template <class T, class F>
auto map(const vector<T>& v, F f) {
  vector<decltype(f(v[0]))> out;          // map may change the element type
  out.reserve(v.size());
  for (const auto& x : v) out.push_back(f(x));
  return out;
}

template <class T, class P>
vector<T> filter(const vector<T>& v, P keep) {
  vector<T> out;
  for (const auto& x : v) if (keep(x)) out.push_back(x);
  return out;
}

template <class T, class F>
T reduce(const vector<T>& v, F f) {
  if (v.empty()) throw invalid_argument("reduce of an empty vector");
  T acc = v[0];
  for (size_t i = 1; i < v.size(); ++i) acc = f(acc, v[i]);
  return acc;
}

int main() {
  vector<int> v{1, 2, 3, 4, 5, 6};
  auto squares = map(v, [](int x) { return x * x; });
  auto evens = filter(squares, [](int x) { return x % 2 == 0; });
  int total = reduce(evens, [](int a, int b) { return a + b; });
  for (int x : evens) cout << x << ' ';
  cout << "-> " << total << '\n';

  vector<string> words{"map", "filter", "reduce"};
  auto lengths = map(words, [](const string& s) { return s.size(); });
  cout << reduce(lengths, [](size_t a, size_t b) { return a > b ? a : b; }) << '\n';
  cout << reduce(words, [](const string& a, const string& b) { return a + "+" + b; }) << '\n';
}
```

The standard library equivalents are `std::transform`, `std::copy_if` and `std::accumulate` (or C++20 ranges: `views::transform`, `views::filter`). Seeding `reduce` with the first element avoids needing an identity value, at the cost of rejecting empty input.
:::

:::drill code rating=1400
Write an `EventBus` that lets callers subscribe callbacks of any kind (free functions, lambdas with captures, member functions) to named events and fires them in subscription order.
---
```cpp run=c24-c-bus
#include <functional>
#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

class EventBus {
  map<string, vector<function<void(const string&)>>> subs;
public:
  void on(const string& event, function<void(const string&)> cb) { subs[event].push_back(std::move(cb)); }
  void emit(const string& event, const string& payload) {
    auto it = subs.find(event);
    if (it == subs.end()) return;
    for (auto& cb : it->second) cb(payload);
  }
};

void logIt(const string& p) { cout << "log: " << p << '\n'; }

struct Mailer {
  string to;
  void send(const string& p) { cout << "mail " << to << ": " << p << '\n'; }
};

int main() {
  EventBus bus;
  int orders = 0;
  Mailer m{"ops"};
  bus.on("order", logIt);                                            // free function
  bus.on("order", [&orders](const string&) { ++orders; });           // capturing lambda
  bus.on("order", [&m](const string& p) { m.send(p); });              // member function via a lambda
  bus.on("order", bind(&Mailer::send, &m, placeholders::_1));        // or std::bind
  bus.emit("order", "#17");
  bus.emit("refund", "#3");                                         // no subscribers: nothing happens
  cout << "orders seen: " << orders << '\n';
}
```

`std::function` is the right tool here because the callbacks have different types but must live in one container. The lambda capturing `&m` relies on `m` outliving the bus's use of it.
:::

## Cheat sheet {#ch24-cheatsheet .th}

- Traits answer questions about types at compile time: `is_integral_v<T>`, `is_class_v<T>`, `remove_const_t<T>`. Built with partial specialisation.
- `if constexpr` discards the untaken branch; `static_assert` fails compilation with a message.
- `requires` and concepts check requirements at the call site and drive overload selection; no `-fconcepts` needed in C++20.
- Lambda = unnamed class with `operator()`; captures are members, copied at creation; `mutable` to change copies; reference captures can dangle.
- Generic lambda (`auto` parameters) = template `operator()`.
- Template parameter: fastest, one instantiation per type. `std::function`: any callable, storable, indirect call, may allocate. Function pointer: captureless lambdas only.
- `using Alias = type;` replaces `typedef` and supports alias templates.
