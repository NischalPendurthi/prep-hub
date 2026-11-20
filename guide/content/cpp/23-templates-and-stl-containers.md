---
title: Templates, STL containers and compile-time computation
part: Part E · Generic programming
lede: A template is a recipe the compiler uses to generate a function or class for each set of arguments you use it with. This chapter covers type and non-type parameters, how instantiation and specialisation work, a compile-time factorial in the old enum style and in `constexpr`, the standard container adaptors and associative containers, and what range-for really copies. It finishes with the course exercise: a generic set with union, difference, intersection, and map, filter and reduce.
desc: function and class templates, type and non-type parameters, instantiation, specialisation, template metaprogramming, stack, queue, set, map, range-for copies, generic Set exercise
hours: 3
prereqs: [Ch 1](#ch01) (classes, copy constructors), [Ch 3](#ch03) (operator overloading)
---

## Function and class templates {#ch23-basics .th}

A **function template** describes a family of functions. The compiler deduces the template arguments from the call and generates (instantiates) one real function per distinct set of arguments.

```cpp run=c23-max
#include <iostream>
#include <string>
using namespace std;

template <typename T>
T biggest(T a, T b) { return a < b ? b : a; }

int main() {
  cout << biggest(3, 7) << '\n';                        // T = int
  cout << biggest(string("pear"), string("apple")) << '\n';   // T = string
  cout << biggest<double>(2, 3.5) << '\n';              // explicit: int 2 converts to double
}
```

`typename` and `class` mean the same thing in a template parameter list. `biggest(2, 3.5)` without `<double>` does not compile: deduction gets `int` from one argument and `double` from the other, and deduction never converts.

A **class template** is the same idea for a class. Unlike functions (before C++17), you usually name the arguments: `Stack<int>`. Each instantiation is a completely separate class; `Stack<int>` and `Stack<string>` share no code and no static members.

```cpp run=c23-tq
#include <iostream>
#include <string>
#include <vector>
using namespace std;

// The course's TQ: append with << (chainable), read with [].
template <typename T>
class TQ {
  vector<T> items;
public:
  TQ& operator<<(const T& e) { items.push_back(e); return *this; }   // return *this so << chains
  const T& operator[](size_t i) const { return items.at(i); }
  size_t size() const { return items.size(); }
};

int main() {
  TQ<int> q;
  for (int i = 0; i < 4; i++) q << i << i * i;
  for (size_t i = 0; i < q.size(); i++) cout << q[i] << ' ';
  cout << '\n';

  TQ<string> s;
  s << "to" << "be";
  cout << s[0] << ' ' << s[1] << '\n';
}
```

### How instantiation works

The compiler checks a template's syntax when it reads it, but checks most of its meaning only when it instantiates it with real types. Two practical consequences:

- **Template definitions go in headers.** To instantiate `TQ<int>::operator<<` in a `.cpp` file, the compiler must see the member's body there. Putting the bodies in a separate `.cpp` gives "undefined reference" link errors, unless that file explicitly instantiates every type you will use (`template class TQ<int>;`).
- **Members that are never called are never instantiated.** `TQ<NoLessThan>` is fine as long as you never call a member that needs `<`. The error, when it comes, points deep inside the template; C++20 concepts ([Ch 24](#ch24)) move it to the call site.

## Non-type template parameters {#ch23-nontype .th}

A template parameter can also be a **value**: an integer, an enum, a pointer, and since C++20 a floating-point number or a simple class object. The argument must be a **compile-time constant**, because it becomes part of the type: `TArray<int, 3>` and `TArray<int, 4>` are different types.

```cpp run=c23-tarray
#include <iostream>
#include <stdexcept>
using namespace std;

template <class T, int S>
class TArray {
  T data[S]{};                                   // size known at compile time: no heap
public:
  T& operator[](int i) {
    if (i < 0 || i >= S) throw out_of_range("index " + to_string(i));
    return data[i];
  }
  constexpr int size() const { return S; }
};

int main() {
  constexpr int N = 5;
  TArray<int, N> a;
  for (int i = 0; i < a.size(); i++) a[i] = i * 10;
  for (int i = 0; i < a.size(); i++) cout << a[i] << ' ';
  cout << '\n';
  try { a[N] = 1; } catch (const out_of_range& e) { cout << "error: " << e.what() << '\n'; }
}
```

The course file writes `TArray<int, N> A;` with no `N` declared. A plain runtime variable (`int n; cin >> n; TArray<int, n>`) would not compile either: the size has to be known when the compiler builds the type. That is the same reason `std::array<int, 5>` takes its size as a template argument while `std::vector` takes it at run time.

## Specialisation and compile-time computation {#ch23-meta .th}

A **full specialisation** gives a different definition for one specific set of arguments: `template <> struct Fact<0> { … };`. A **partial specialisation** (class templates only) handles a pattern, such as every pointer type: `template <class T> struct IsPointer<T*> { … };`. The compiler picks the most specialised match.

Combine a recursive template with a specialisation that ends the recursion and the compiler computes values while compiling. This is template metaprogramming, the course's `metafact.cpp`:

```cpp run=c23-fact
#include <iostream>
using namespace std;

template <int N>
struct Fact { enum { val = N * Fact<N - 1>::val }; };   // instantiates Fact<N-1>, ... down to Fact<0>

template <>
struct Fact<0> { enum { val = 1 }; };                   // the base case stops the recursion

constexpr long fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }   // the modern way

int main() {
  cout << Fact<5>::val << ' ' << Fact<0>::val << ' ' << Fact<2>::val << '\n';
  static_assert(Fact<5>::val == 120);          // checked by the compiler; no run-time code at all
  constexpr long f10 = fact(10);               // forced to compile time by constexpr
  int arr[Fact<3>::val];                       // usable as an array bound: it is a constant
  cout << f10 << ' ' << sizeof(arr) / sizeof(int) << '\n';
}
```

Without the `Fact<0>` specialisation the recursion never ends: the compiler instantiates `Fact<-1>`, `Fact<-2>`, … until it hits its instantiation depth limit (900 by default in GCC) and stops with an error.

The `enum` trick predates C++11 and was the only way to get a compile-time integer from a class. Today a `constexpr` function says the same thing in ordinary code, and `static constexpr int val = …;` replaces the enum. Metaprogramming is still how the type traits in [Ch 24](#ch24) are built, by specialising on types instead of numbers.

## Standard containers {#ch23-stl .th}

The standard library's containers are class templates. The ones the course uses:

| Container | Kind | Order | Key operations and cost |
|---|---|---|---|
| `vector<T>` | sequence | insertion order | `push_back` amortised O(1), `[]` O(1), insert in the middle O(n) |
| `stack<T>` | adaptor (on `deque` by default) | LIFO | `push`, `top`, `pop`, all O(1) |
| `queue<T>` | adaptor (on `deque`) | FIFO | `push` at the back, `front`, `pop` from the front, all O(1) |
| `set<T>` | associative, unique keys | sorted | `insert`, `find`, `erase` O(log n); duplicates ignored |
| `map<K, V>` | associative, unique keys | sorted by key | `[]`, `find` O(log n); `[]` inserts a default value if the key is missing |
| `unordered_map<K, V>` | hash table | none | average O(1), worst O(n) |

```cpp run=c23-adaptors
#include <iostream>
#include <queue>
#include <set>
#include <stack>
using namespace std;

int main() {
  stack<int> s;
  queue<int> q;
  for (int x : {10, 20, 30}) { s.push(x); q.push(x); }
  cout << "stack:";
  while (!s.empty()) { cout << ' ' << s.top(); s.pop(); }
  cout << "\nqueue:";
  while (!q.empty()) { cout << ' ' << q.front(); q.pop(); }

  set<int> st;
  for (int x : {30, 10, 10, 20}) st.insert(x);
  cout << "\nset:";
  for (int x : st) cout << ' ' << x;
  auto [it, inserted] = st.insert(10);
  cout << "\ninserting 10 again: " << boolalpha << inserted << ", size " << st.size() << '\n';
}
```

Why does `pop()` return `void` instead of the removed element? Returning by value would copy the element *after* removing it. If that copy threw, the element would be gone and lost. Splitting it into `top()` (look) and `pop()` (remove) keeps the strong exception guarantee. This is a classic interview question.

`std::string` compares lexicographically with `<`, `>` and `==`, character by character, so `string("hello") < string("hello")` is `false` and `==` is `true`. That is what lets strings be `set` elements and `map` keys.

The course's `AssociativeArray<KEY, VAL>` exercise wants `add(key, value)` and `a["noun"]`, which returns the **key** stored for a value: a reverse lookup. A `map<VAL, KEY>` from value to key does that, and since several words can share a part of speech, a `multimap` keeps them all:

```cpp run=c23-assoc
#include <iostream>
#include <map>
#include <string>
using namespace std;

template <class KEY, class VAL>
class AssociativeArray {
  map<KEY, VAL> forward;
  multimap<VAL, KEY> reverse;
public:
  AssociativeArray& add(const KEY& k, const VAL& v) {   // returns *this so calls chain
    forward[k] = v;
    reverse.emplace(v, k);
    return *this;
  }
  KEY operator[](const VAL& v) const {                   // first key stored for this value
    auto it = reverse.find(v);
    return it == reverse.end() ? KEY{} : it->second;
  }
  const VAL& valueOf(const KEY& k) const { return forward.at(k); }
};

int main() {
  AssociativeArray<string, string> a;
  a.add("Adya", "proper noun").add("a", "article").add("table", "noun");
  cout << a["noun"] << ' ' << a["article"] << ' ' << a.valueOf("Adya") << '\n';
}
```

## What range-for copies {#ch23-rangefor .th}

`for (auto x : c)` is rewritten by the compiler into a loop over `begin(c)` and `end(c)` in which `auto x = *it;` runs every iteration. So:

- `for (auto x : c)` **copies** each element (copy constructor per iteration) and changes to `x` are lost.
- `for (auto& x : c)` binds a reference: no copies, and changes modify the container.
- `for (const auto& x : c)` is the default for reading.

It works for built-in arrays, `std::string` (each `char`), every container, and any type with `begin()`/`end()`.

The course's range-for files use a class whose copy constructor prints and multiplies the value by 100, so every copy is visible. Try predicting this before you look at the output:

```cpp run=c23-rangefor
#include <iostream>
#include <vector>
using namespace std;

class A {
  int x;
public:
  A(int e) : x(e) {}
  A(const A& a) : x(a.x * 100) { cout << "copy " << a.x << '\n'; }
  void f() const { cout << x << '\n'; }
};

int main() {
  A a1(1), a2(2), a3(3);
  A arr[3] = {a1, a2, a3};           // copy-initialises each element
  for (auto& x : arr) x.f();         // references: no more copies
  cout << "--- vector\n";
  vector<A> v;
  v.push_back(a1);
  v.push_back(a2);
  v.push_back(a3);
  for (auto& x : v) x.f();
}
```

The array copies each element once. The vector copies more often than you might expect. Each `push_back` copies its argument in, and when the vector runs out of capacity (1, then 2, then 4 with libstdc++), it allocates a bigger buffer and moves the old elements across. `A` declares a copy constructor and no move constructor, so "move" means **copy**, and each reallocation multiplies the old values by 100 again: `a1` is copied three times in all. A `noexcept` move constructor, or `v.reserve(3)` up front, would avoid every extra copy ([Ch 20](#ch20)).

## Drills: templates and containers {#ch23-drills .dr}

:::drill concept
Does `biggest(2, 3.5)` compile for `template <typename T> T biggest(T a, T b)`? How do you fix it?
---
No. Deduction gets `T = int` from the first argument and `T = double` from the second, and deduction does not apply conversions, so it fails. Fix: `biggest<double>(2, 3.5)`, or use two parameters `template <class A, class B> auto biggest(A a, B b)`.
:::

:::drill output
What does this print?

```cpp run=c23-d-fact
#include <iostream>
template <int N> struct P { enum { v = 2 * P<N - 1>::v }; };
template <> struct P<0> { enum { v = 1 }; };
int main() { std::cout << P<10>::v << ' ' << P<0>::v << '\n'; }
```
---
`P<N>` computes 2 to the power N at compile time: `P<10>` instantiates `P<9>` … `P<0>`.
:::

:::drill tricky
What happens if you delete the `template <> struct Fact<0>` specialisation and use `Fact<5>::val`?
---
Compilation fails. Nothing stops the recursion, so the compiler instantiates `Fact<-1>`, `Fact<-2>`, … until it reaches its template instantiation depth limit and reports an error. It never reaches run time.
:::

:::drill concept
Why must the argument for `template <class T, int S> class TArray` be a compile-time constant?
---
`S` is part of the type: `TArray<int, 3>` and `TArray<int, 4>` are different classes, with different sizes, generated by the compiler. The compiler can only generate a class for a value it knows while compiling. A value read at run time cannot form a type; use a run-time size (`vector`) instead.
:::

:::drill concept
Why are template member functions usually defined in the header, not in a `.cpp` file?
---
Instantiating a template for a new type needs its definition. If only the declaration is visible in `main.cpp`, the compiler emits a call it expects someone else to define, and nobody instantiated that version, so the link fails with "undefined reference". The alternative is explicit instantiation (`template class TQ<int>;`) in the `.cpp`, which only works for a known list of types.
:::

:::drill output
What does this print?

```cpp run=c23-d-set
#include <iostream>
#include <set>
#include <string>
int main() {
  std::set<std::string> s{"pear", "apple", "fig", "apple"};
  for (auto& x : s) std::cout << x << ' ';
  std::cout << s.size() << '\n';
}
```
---
A `set` keeps unique elements in sorted order (string comparison is lexicographic), so the duplicate "apple" is dropped.
:::

:::drill concept
Why does `std::stack::pop()` return `void`?
---
If `pop` removed the element and then returned it by value, and the copy threw, the element would be gone and the caller would never get it: a lost element and no strong guarantee. Splitting into `top()` to read (by reference, cannot throw) and `pop()` to remove avoids that.
:::

:::drill tricky
`std::map<string, int> m;` then `if (m["x"] == 0) ...`. What side effect does this have, and how do you avoid it?
---
`operator[]` inserts the key with a value-initialised `int` (0) if it is missing, so the "check" adds `"x"` to the map. Use `m.find("x")`, `m.count("x")` or C++20 `m.contains("x")` to test without inserting. `operator[]` also does not compile on a `const map`.
:::

:::drill output
`A`'s copy constructor prints "copy" and multiplies by 100. `A arr[2] = {a1, a2};` with values 1 and 2, then `for (auto x : arr) x.f();`. How many "copy" lines print, and what values does `f` show?
---
Four copies: two to initialise the array (values become 100 and 200) and one per iteration, because `auto x` copies (so `f` prints 10000 and 20000). With `auto& x` there would be only the two initialisation copies and `f` would print 100 and 200.
:::

:::drill tricky
Why does pushing three objects of a type with only a copy constructor into an empty `std::vector` call the copy constructor more than three times?
---
The vector grows its capacity (1 → 2 → 4 in libstdc++), and each reallocation transfers the existing elements to the new buffer. With no move constructor (a user-declared copy constructor suppresses the implicit move), the transfer copies. Three `push_back`s cost 3 + 1 + 2 = 6 copies. `reserve(3)` up front, or a `noexcept` move constructor, removes the extra ones.
:::

:::drill concept
Full vs partial specialisation: what is each, and which can a function template have?
---
A full specialisation fixes every template argument (`template <> struct Fact<0>`). A partial specialisation fixes a pattern and still has parameters (`template <class T> struct Box<T*>`). Class templates can have both; function templates can only be fully specialised, and overloading is usually better than specialising them.
:::

:::drill output
What does this print?

```cpp run=c23-d-str
#include <iostream>
#include <string>
int main() {
  std::string s1("hello"), s2("hello"), s3("help");
  std::cout << (s1 < s2) << (s1 > s1) << (s1 == s2) << (s1 < s3) << '\n';
}
```
---
Equal strings are not less than each other; `"hello" < "help"` because at index 3, `'l'` (108) is less than `'p'` (112).
:::

## Write the code {#ch23-coding .cd}

:::drill code rating=1500
The course exercise: write a template `Set<T>` with `+` (add an element or union with a set), `-` (remove an element or set difference), `*` (intersection), and `map`, `filter` and `reduce` that take a callable.
---
```cpp run=c23-c-set
#include <iostream>
#include <set>
#include <string>
using namespace std;

template <class T>
class Set {
  set<T> items;
public:
  Set() = default;
  Set(initializer_list<T> il) : items(il) {}

  Set operator+(const T& e) const   { Set r = *this; r.items.insert(e); return r; }
  Set operator+(const Set& o) const { Set r = *this; r.items.insert(o.items.begin(), o.items.end()); return r; }
  Set operator-(const T& e) const   { Set r = *this; r.items.erase(e); return r; }
  Set operator-(const Set& o) const { Set r = *this; for (auto& e : o.items) r.items.erase(e); return r; }
  Set operator*(const Set& o) const { Set r; for (auto& e : items) if (o.items.count(e)) r.items.insert(e); return r; }

  template <class F> auto map(F f) const {           // result element type comes from f
    Set<decltype(f(declval<T>()))> r;
    for (auto& e : items) r = r + f(e);
    return r;
  }
  template <class P> Set filter(P keep) const { Set r; for (auto& e : items) if (keep(e)) r.items.insert(e); return r; }
  template <class F> T reduce(F f, T init) const { for (auto& e : items) init = f(init, e); return init; }

  friend ostream& operator<<(ostream& os, const Set& s) {
    os << '{';
    for (auto it = s.items.begin(); it != s.items.end(); ++it) os << (it == s.items.begin() ? "" : ", ") << *it;
    return os << '}';
  }
};

int main() {
  Set<int> a{1, 2, 3, 4}, b{3, 4, 5};
  cout << a + 9 << ' ' << a - 1 << '\n';
  cout << a + b << ' ' << a - b << ' ' << a * b << '\n';
  cout << a.map([](int x) { return x * x; }) << '\n';
  cout << a.filter([](int x) { return x % 2 == 0; }) << '\n';
  cout << a.reduce([](int acc, int x) { return acc + x; }, 0) << '\n';
  Set<string> w{"b", "a"};
  cout << w.map([](const string& s) { return s.size(); }) << '\n';   // a Set<size_t>
}
```

`map` can change the element type, so its result type is computed with `decltype(f(declval<T>()))`. `std::set` already keeps elements unique and sorted, so union is just inserting, and the operators return new sets instead of modifying `*this`, like `+` on numbers.
:::

:::drill code rating=1400
Write `Stack<T, Capacity>` with a non-type capacity parameter, a fixed array inside (no heap), `push` that throws when full, and `pop` that throws when empty.
---
```cpp run=c23-c-stack
#include <array>
#include <iostream>
#include <stdexcept>

template <class T, std::size_t Capacity>
class Stack {
  std::array<T, Capacity> data{};
  std::size_t n = 0;
public:
  void push(const T& x) { if (n == Capacity) throw std::overflow_error("stack full"); data[n++] = x; }
  T pop() { if (n == 0) throw std::underflow_error("stack empty"); return data[--n]; }
  bool empty() const { return n == 0; }
};

int main() {
  Stack<int, 2> s;
  s.push(1); s.push(2);
  try { s.push(3); } catch (const std::exception& e) { std::cout << e.what() << '\n'; }
  std::cout << s.pop() << s.pop() << '\n';
  try { s.pop(); } catch (const std::exception& e) { std::cout << e.what() << '\n'; }
  static_assert(sizeof(Stack<int, 100>) >= 100 * sizeof(int));   // storage lives inside the object
}
```

Here `pop` returns the value, unlike `std::stack`. That is safe for `int`, but for a type whose copy can throw it loses the strong guarantee, which is exactly why the standard splits it into `top` and `pop`.
:::

## Cheat sheet {#ch23-cheatsheet .th}

- Templates are instantiated per argument set; definitions belong in headers; unused members are never instantiated.
- Deduction never converts: `f(2, 3.5)` with one `T` fails.
- Non-type parameters must be compile-time constants and are part of the type.
- Full specialisation ends recursion (`Fact<0>`); without it, compilation hits the depth limit. Prefer `constexpr` functions for values.
- `stack`/`queue` are adaptors; `top`/`front` + `pop` (void) for exception safety. `set` = unique and sorted; `map::operator[]` inserts.
- `auto x` in range-for copies; `auto&` or `const auto&` does not. Vector growth copies elements unless there is a `noexcept` move or a `reserve`.
