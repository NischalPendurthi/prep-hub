---
title: Variadic templates and fold expressions
part: Part E · Generic programming
lede: A variadic template accepts any number of arguments of any types, with full type checking, which the C-style `...` of `printf` cannot do. This chapter shows parameter packs and the classic recursive peel-off-one-argument pattern, compares them with `va_list`, replaces the recursion with C++17 fold expressions, and builds the course's Prolog-like challenge: facts and queries with a variable number of arguments.
desc: parameter packs, recursive expansion and base cases, sizeof..., C varargs vs variadic templates, fold expressions (unary, binary, left, right), forwarding packs, facts and queries challenge
hours: 2
prereqs: [Ch 23](#ch23) (templates); [Ch 19](#ch19) helps for forwarding
---

## Parameter packs {#ch25-packs .th}

`typename... VARS` declares a **template parameter pack**: zero or more types. `VARS... el` declares a **function parameter pack**: zero or more arguments with those types. Writing `el...` later **expands** the pack back into a comma-separated list.

The classic pattern, from the course's `examplevariadic.cpp`, peels off the first argument, handles it, and recurses on the rest. A non-template overload with no parameters ends the recursion:

```cpp run=c25-print
#include <iostream>
#include <string>
using namespace std;

void print() { cout << "last\n"; }                  // base case: called with nothing left

template <typename T, typename... VARS>
void print(T e, VARS... el) {
  cout << e << ' ';
  print(el...);                                     // recurse on the remaining arguments
}

int main() {
  print(1, 2, 3, 5, 3);
  print(1, 2);
  print(1, 2, 3, 5, "hello", 10.123);
  print(10, "hello", 3.14, 'A', string("ok"));
}
```

For `print(10, "hello", 3.14, 'A')` the compiler generates four different functions:

| Call | `T` | Pack `VARS` | Prints |
|---|---|---|---|
| `print(10, "hello", 3.14, 'A')` | `int` | `const char*, double, char` | `10 ` |
| `print("hello", 3.14, 'A')` | `const char*` | `double, char` | `hello ` |
| `print(3.14, 'A')` | `double` | `char` | `3.14 ` |
| `print('A')` | `char` | empty | `A ` |
| `print()` | (the non-template base case) | | `last` |

Everything is resolved at compile time. There is no loop at run time and no recursion overhead after inlining.

:::trap The base case must be declared first
The recursive template calls `print(el...)`. If the zero-argument `print()` is declared *after* the template, the call inside the template cannot see it (and ADL does not help for an empty argument list), so the last step fails to compile. Declare the base case above the template.
:::

The arguments can be any type that has an `operator<<`. The course's `ex2variadic.cpp` passes an object of its own class `A` and defines `ostream& operator<<(ostream&, const A)` so that `cout << e` works for it. Without that operator, only the instantiation that receives an `A` fails to compile.

`sizeof...(el)` gives the number of elements in a pack as a compile-time constant.

## C varargs versus variadic templates {#ch25-varargs .th}

C functions such as `printf` use `...` with the `<cstdarg>` macros: `va_start`, `va_arg(args, int)`, `va_end`. The function has to be told the count and the type of each argument some other way (a count parameter, a format string), and nothing checks that the caller agrees:

```cpp run=c25-cvarargs
#include <cstdarg>
#include <iostream>
using namespace std;

void printInts(int count, ...) {
  va_list args;
  va_start(args, count);
  for (int i = 0; i < count; i++) cout << va_arg(args, int) << ' ';
  va_end(args);
  cout << '\n';
}

int main() {
  printInts(3, 10, 20, 30);
  printInts(2, 7, 8);
  // printInts(2, 1.5, 2.5) compiles and reads doubles as ints: undefined behaviour
}
```

(The course file defines this function and then calls only `printf` from `main`, so the function never runs.)

| | C varargs (`...`) | Variadic template |
|---|---|---|
| Type checked | no; wrong `va_arg` type is undefined behaviour | yes, each argument has its real type |
| Count known | no; passed separately or encoded in a format | `sizeof...(pack)` at compile time |
| Class types | only trivially copyable ones are safe to pass | any type, by value or by reference |
| Code generated | one function | one instantiation per argument-type list |

Small types are also **promoted** when passed through C varargs: `char` and `short` become `int`, `float` becomes `double`. That is why `va_arg(args, float)` is always wrong.

## Fold expressions {#ch25-folds .th}

C++17 **fold expressions** apply a binary operator across a whole pack without writing recursion. There are four forms, with `op` any binary operator and `E` the pack:

| Form | Expands to (for 3 elements) |
|---|---|
| `(E op ...)` unary right fold | `E1 op (E2 op E3)` |
| `(... op E)` unary left fold | `(E1 op E2) op E3` |
| `(E op ... op I)` binary right fold | `E1 op (E2 op (E3 op I))` |
| `(I op ... op E)` binary left fold | `((I op E1) op E2) op E3` |

The parentheses are part of the syntax. The course file's comment calls `(... + args)` a right fold; it is a **left** fold (the `...` is on the left).

```cpp run=c25-fold
#include <iostream>
#include <string>
using namespace std;

template <typename... Args> auto sumLeft(Args... args)  { return (... + args); }   // ((a + b) + c)
template <typename... Args> auto sumRight(Args... args) { return (args + ...); }   // (a + (b + c))
template <typename... Args> auto minusLeft(Args... args)  { return (... - args); }
template <typename... Args> auto minusRight(Args... args) { return (args - ...); }

template <typename... Args> void printAll(const Args&... args) {
  ((cout << args << ' '), ...);          // fold over the comma operator: runs left to right
  cout << '\n';
}
template <typename... Args> bool allPositive(Args... args) { return ((args > 0) && ...); }

int main() {
  cout << sumLeft(10, 20, 30) << ' ' << sumRight(10, 20, 30) << '\n';
  cout << sumLeft(string("hello "), string("world")) << '\n';
  cout << minusLeft(10, 3, 2) << ' ' << minusRight(10, 3, 2) << '\n';   // order matters for -
  printAll(1, "two", 3.0);
  cout << boolalpha << allPositive(3, 5, 9) << ' ' << allPositive(3, -5, 9) << ' ' << allPositive() << '\n';
}
```

Left and right folds give the same result for an associative operator like `+` on numbers, but not for `-`: `(10 - 3) - 2 = 5` while `10 - (3 - 2) = 9`. String `+` is associative, so both folds produce "hello world", though a right fold of `sumRight("a", "b")` with two `const char*` would not compile, since two pointers cannot be added. At least one operand in each `+` must be a `std::string`.

**Empty packs.** A unary fold over an empty pack is allowed only for `&&` (gives `true`), `||` (gives `false`) and the comma operator (gives `void()`). `sumLeft()` with no arguments does not compile; a binary fold with an initial value, `(0 + ... + args)`, handles the empty case.

## Forwarding a pack {#ch25-forward .th}

Taking a pack by value (`VARS... el`) copies every argument at every level of recursion. To pass arguments through unchanged, take them as forwarding references and `std::forward` each one; the `...` applies the pattern `std::forward<Args>(args)` to every element:

```cpp
template <class T, class... Args>
std::unique_ptr<T> make(Args&&... args) {
  return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}
```

This is how `std::make_unique`, `emplace_back` and `std::thread`'s constructor accept any constructor's arguments ([Ch 19](#ch19), [Ch 20](#ch20)).

## The challenge: facts and queries {#ch25-challenge .th}

The course's `VariadicChallange.cpp` asks for a small Prolog: objects (`john`, `mary`), predicates (`likes`, `loves`), facts with a variable number of arguments (`Fact(likes, bob, mary, chess)`), a fact database that can be dumped, rules, and `Find` queries in which variables collect matching values. The seed code does not compile (it is pseudocode, for example `likes X, Z` without commas), so the design is up to you.

A workable design:

- `Obj` and `Pred` hold a name. `Var` (the seed's `VARIABLE`) holds a name and collects bindings.
- `fact(pred, args...)` is a variadic function template that stores a tuple of names. A `static_assert` with a fold checks that every argument is an `Obj`.
- `find(pred, args...)` takes a mix of `Obj` (committed values that must match) and `Var&` (to be filled). For each stored fact with the same predicate and arity, a fold over the arguments checks the committed positions, then a second fold appends the values to each variable.
- Rules such as "if X likes Y and Y likes Z then X likes Z" are applied by forward chaining: repeatedly join the facts and add new ones until nothing changes.

```cpp run=c25-prolog
#include <iostream>
#include <set>
#include <string>
#include <type_traits>
#include <vector>
using namespace std;

struct Obj  { string name; };
struct Pred { string name; };
struct Var  { string name; vector<string> values; };

struct FactDB {
  static inline vector<pair<string, vector<string>>> facts;
  static void dump() {
    for (auto& [p, args] : facts) {
      cout << p << '(';
      for (size_t i = 0; i < args.size(); ++i) cout << (i ? ", " : "") << args[i];
      cout << ")\n";
    }
  }
  static bool has(const string& p, const vector<string>& a) {
    for (auto& f : facts) if (f.first == p && f.second == a) return true;
    return false;
  }
};

template <class... Ts>
void fact(const Pred& p, const Ts&... args) {
  static_assert((is_same_v<Ts, Obj> && ...), "facts take objects only");
  vector<string> a{args.name...};                  // pack expansion inside a braced list
  if (!FactDB::has(p.name, a)) FactDB::facts.push_back({p.name, a});
}

// One argument of a query: an Obj must match; a Var matches anything.
inline bool matches(const Obj& o, const string& v) { return o.name == v; }
inline bool matches(const Var&, const string&) { return true; }
inline void bind(const Obj&, const string&) {}
inline void bind(Var& x, const string& v) { x.values.push_back(v); }

template <class... Ts>
int find(const Pred& p, Ts&... args) {
  int hits = 0;
  for (auto& [name, vals] : FactDB::facts) {
    if (name != p.name || vals.size() != sizeof...(Ts)) continue;
    size_t i = 0;
    if (!(matches(args, vals[i++]) && ...)) continue;    // left-to-right && fold
    i = 0;
    (bind(args, vals[i++]), ...);                         // left-to-right comma fold
    ++hits;
  }
  return hits;
}

// Rule: p(X, Y) and p(Y, Z) => p(X, Z), applied until no new fact appears.
void transitive(const Pred& p) {
  for (bool changed = true; changed;) {
    changed = false;
    auto snapshot = FactDB::facts;
    for (auto& [n1, a] : snapshot)
      for (auto& [n2, b] : snapshot)
        if (n1 == p.name && n2 == p.name && a.size() == 2 && b.size() == 2 && a[1] == b[0] && a[0] != b[1]
            && !FactDB::has(p.name, {a[0], b[1]})) {
          FactDB::facts.push_back({p.name, {a[0], b[1]}});
          changed = true;
        }
  }
}

void show(const Var& v) {
  cout << v.name << " = [";
  for (size_t i = 0; i < v.values.size(); ++i) cout << (i ? ", " : "") << v.values[i];
  cout << "]\n";
}

int main() {
  Obj john{"john"}, mary{"mary"}, bob{"bob"}, ron{"ron"}, chess{"chess"};
  Pred likes{"likes"}, loves{"loves"};
  fact(likes, john, mary);
  fact(likes, mary, bob);
  fact(likes, bob, mary, chess);      // three arguments: a different arity
  fact(loves, ron, chess, mary);
  FactDB::dump();

  transitive(likes);                  // adds likes(john, bob)
  cout << "-- after the rule\n";
  FactDB::dump();

  Var X{"X"}, Y{"Y"};
  find(likes, X, Y);                  // every two-argument likes fact
  show(X); show(Y);
  Var W{"W"};
  find(likes, john, W);               // first argument committed
  show(W);
  Var A{"A"}, B{"B"}, C{"C"};
  cout << find(loves, A, B, C) << " match(es)\n";
  show(A);
}
```

Two fold idioms carry the whole thing: `(matches(args, vals[i++]) && ...)` checks every position, left to right, stopping at the first mismatch, and `(bind(args, vals[i++]), ...)` visits every position in order. Both rely on the fact that `&&` and the comma operator evaluate their left operand first, so `i++` steps through the positions in sequence. Overloading `matches` and `bind` on `Obj` and `Var` is what lets one pack mix committed values and variables.

## Drills: variadics {#ch25-drills .dr}

:::drill output
What does this print?

```cpp run=c25-d-print
#include <iostream>
void print() { std::cout << "end\n"; }
template <class T, class... R> void print(T first, R... rest) {
  std::cout << first << '[' << sizeof...(rest) << "] ";
  print(rest...);
}
int main() { print('a', 2, "three"); }
```
---
`sizeof...(rest)` is the number of arguments still to come at each level: 2, then 1, then 0.
:::

:::drill bug
The zero-argument `void print()` is moved below the template. What happens, and why?
---
It fails to compile at the last recursive step, `print()` with an empty pack. Inside the template, the name `print` is looked up at the point of definition; only the template is visible there, and it needs at least one argument. ADL cannot find the later overload because there are no arguments. Declare (or define) the base case first.
:::

:::drill concept
Give two reasons a variadic template is safer than C-style `...`.
---
Every argument keeps its real type, so the compiler checks each use; with `va_arg` you name a type and a mismatch is undefined behaviour. The count is known at compile time (`sizeof...`), instead of trusting a count parameter or a format string. Variadic templates also accept non-trivial class types such as `std::string`.
:::

:::drill output
What do `(... - args)` and `(args - ...)` give for the arguments 10, 3, 2?
---
The left fold computes `(10 - 3) - 2 = 5`. The right fold computes `10 - (3 - 2) = 9`. They differ because subtraction is not associative.
:::

:::drill tricky
`template <class... A> auto sum(A... a) { return (... + a); }`. Does `sum()` compile? How do you make it return 0?
---
No. A unary fold over an empty pack is only defined for `&&`, `||` and `,`. Use a binary fold with an initial value: `return (0 + ... + a);`, which gives 0 for an empty pack.
:::

:::drill output
`template <class... A> bool all(A... a) { return (a && ...); }`. What do `all(1, 2, 0)` and `all()` return?
---
`false` (the 0 makes the conjunction false) and `true`: the empty `&&` fold is defined as `true`.
:::

:::drill concept
Why does `va_arg(args, float)` never work correctly?
---
Arguments passed through `...` undergo default argument promotions: `float` is passed as `double`, and `char`/`short` as `int`. Reading a `float` reads the wrong size, which is undefined behaviour; read `double` and convert.
:::

:::drill tricky
`sumRight(string("a"), "b", "c")` with `(args + ...)`: does it compile? What about `sumLeft` with `(... + args)` on the same arguments?
---
The right fold computes `"a"s + ("b" + "c")`, and `"b" + "c"` adds two `const char*`, which does not compile. The left fold computes `("a"s + "b") + "c"`, where each `+` has a `std::string` on the left, so it compiles and gives "abc". Fold direction decides which operands meet first.
:::

:::drill concept
What does `std::forward<Args>(args)...` expand to, and why is it used?
---
`std::forward<A1>(a1), std::forward<A2>(a2), …`: the pattern is applied to each element of both packs together. It passes each argument on with its original value category (rvalues stay rvalues, so they can be moved), which is what `make_unique` and `emplace_back` need.
:::

## Write the code {#ch25-coding .cd}

:::drill code rating=1300
Write `join(sep, args...)` that converts any streamable arguments to text and joins them with a separator, using a fold expression (no recursion). `join(", ", 1, "two", 3.5)` should give `1, two, 3.5`.
---
```cpp run=c25-c-join
#include <iostream>
#include <sstream>
#include <string>

template <class... Ts>
std::string join(const std::string& sep, const Ts&... args) {
  std::ostringstream os;
  bool first = true;
  ((os << (first ? "" : sep) << args, first = false), ...);   // comma fold, left to right
  return os.str();
}

int main() {
  std::cout << join(", ", 1, "two", 3.5) << '\n';
  std::cout << join("-", 'x') << '\n';
  std::cout << '[' << join(", ") << "]\n";      // empty pack: the comma fold yields void()
}
```

The comma fold evaluates each parenthesised step left to right, so the separator goes before every element except the first.
:::

:::drill code rating=1500
Write `count_of<T, Ts...>`: a compile-time constant equal to the number of times `T` appears in `Ts`. Then write `max_of(args...)` returning the largest argument, requiring all arguments to have the same type.
---
```cpp run=c25-c-count
#include <iostream>
#include <string>
#include <type_traits>

template <class T, class... Ts>
constexpr int count_of = (0 + ... + (std::is_same_v<T, Ts> ? 1 : 0));

template <class T, class... Ts>
  requires (std::is_same_v<T, Ts> && ...)
T max_of(T first, Ts... rest) {
  T best = first;
  ((best = rest > best ? rest : best), ...);
  return best;
}

int main() {
  static_assert(count_of<int, int, char, int, double> == 2);
  std::cout << count_of<char, int, char, int, double> << '\n';
  std::cout << max_of(3, 9, 4) << ' ' << max_of(std::string("pear"), std::string("plum")) << '\n';
  // max_of(3, 9.5) does not compile: the requires clause wants one type
}
```
:::

## Cheat sheet {#ch25-cheatsheet .th}

- `template <class... Ts> void f(Ts... args)`: a type pack and an argument pack; `args...` expands, `sizeof...(args)` counts.
- Recursion: handle the first argument, call `f(rest...)`; declare the zero-argument base case first.
- C varargs: no type checks, count passed separately, promotions (`float`→`double`); variadic templates fix all three.
- Folds: `(... op E)` left, `(E op ...)` right, `(I op ... op E)` with an initial value. Direction matters for non-associative operators. Empty unary fold only for `&&`, `||`, `,`.
- `((stmt), ...)` runs a statement per element in order; `std::forward<Args>(args)...` passes a pack through unchanged.
