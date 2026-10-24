/* Python — Decorators & Closures */
window.QUESTIONS.push(
  {
    id: "py-deco-001", subject: "python", subtopic: "Decorators & Closures", difficulty: "easy", type: "concept",
    question: "What is a decorator in Python?",
    options: ["A class that must inherit from `Decorator`", "A keyword that makes a function run faster", "A comment that documents a function", "A callable that takes a function (or class) and returns a replacement, typically wrapping it to add behaviour"],
    answer: 3,
    explanation: "A decorator is just a higher-order callable: it receives the function being defined and returns something to bind to that name, usually a wrapper that runs extra code before/after the original. Common uses: logging, timing, caching, authentication, registration.",
    optionExplanations: ["No base class is needed; any callable works.", "They add behaviour; they don't optimise by themselves.", "Decorators execute code; they're not comments.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-deco-002", subject: "python", subtopic: "Decorators & Closures", difficulty: "easy", type: "concept",
    question: "Writing `@deco` directly above `def f(): ...` is equivalent to which statement after the definition?",
    options: ["`f = deco(f)`", "`deco = f(deco)`", "`f = deco()`", "`deco(f)` (without rebinding f)"],
    answer: 0,
    explanation: "The @ syntax is sugar: after the function object is created, Python calls the decorator with it and rebinds the name to whatever the decorator returns. If the decorator returns None, f becomes None.",
    optionExplanations: ["Correct.", "The decorator receives the function, not the other way round.", "The function is passed as an argument.", "The result IS bound back to the name f."]
  },
  {
    id: "py-deco-003", subject: "python", subtopic: "Decorators & Closures", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "def shout(f):\n    def wrapper():\n        return f().upper()\n    return wrapper\n\n@shout\ndef hi():\n    return 'hi'\n\nprint(hi())",
    options: ["HI", "hi", "wrapper", "None"],
    answer: 0,
    explanation: "`hi` is replaced by `wrapper`, which calls the original function and uppercases its result. Calling hi() therefore returns 'HI'.",
    optionExplanations: ["Correct.", "The wrapper transforms the result.", "wrapper is called; its name isn't printed.", "The wrapper returns the transformed value."]
  },
  {
    id: "py-deco-004", subject: "python", subtopic: "Decorators & Closures", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "def outer(x):\n    def inner():\n        return x * 2\n    return inner\n\nf = outer(5)\nprint(f())",
    options: ["5", "NameError", "10", "inner"],
    answer: 2,
    explanation: "inner is a CLOSURE: it remembers the variable x from the enclosing call to outer, even after outer has returned. f() therefore computes 5 * 2.",
    optionExplanations: ["inner doubles x.", "Closures keep enclosing variables alive.", "Correct.", "f() calls the function; it doesn't print its name."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-deco-005", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def outer(x):\n    def inner():\n        return x\n    return inner\n\nf = outer(5)\nprint(f.__code__.co_freevars, f.__closure__[0].cell_contents)",
    options: ["('x',) 5", "() 5", "('inner',) 5", "None 5"],
    answer: 0,
    explanation: "Variables a nested function uses from an enclosing scope are its FREE variables, listed in `__code__.co_freevars`. Their values live in cell objects stored in `__closure__`, which is how a closure keeps them alive after the outer call returns.",
    optionExplanations: ["Correct.", "x is a free variable of inner.", "The free variable is x; inner is the function itself.", "co_freevars is a tuple of names."]
  },
  {
    id: "py-deco-006", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def deco(f):\n    print('decorating', end=' ')\n    return f\n\n@deco\ndef g():\n    print('g', end=' ')\n\nprint('start', end=' ')\ng()",
    options: ["start decorating g", "decorating start g", "start g decorating", "decorating g start"],
    answer: 1,
    explanation: "A decorator runs when the decorated function is DEFINED (at import time for module-level code), not when it's called. So 'decorating' is printed while the def statement executes, before 'start'.",
    optionExplanations: ["Decoration happens at definition, before 'start'.", "Correct.", "Decoration doesn't wait until g is called.", "g() is called after 'start' is printed."],
    tags: ["trap"]
  },
  {
    id: "py-deco-007", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import functools\n\ndef plain(f):\n    def wrapper(*a, **k):\n        return f(*a, **k)\n    return wrapper\n\ndef wrapped(f):\n    @functools.wraps(f)\n    def wrapper(*a, **k):\n        return f(*a, **k)\n    return wrapper\n\n@plain\ndef alpha(): pass\n\n@wrapped\ndef beta(): pass\n\nprint(alpha.__name__, beta.__name__)",
    options: ["alpha beta", "wrapper wrapper", "wrapper beta", "alpha wrapper"],
    answer: 2,
    explanation: "A decorator replaces the function with its wrapper, so metadata (`__name__`, `__doc__`, `__module__`...) would come from the wrapper. `functools.wraps(f)` copies f's metadata onto the wrapper and sets `__wrapped__`, which helps debugging, docs and introspection.",
    optionExplanations: ["Without wraps, alpha's metadata is lost.", "wraps restores beta's name.", "Correct.", "It's the other way round."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-deco-008", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def repeat(n):\n    def deco(f):\n        def wrapper(*args):\n            for _ in range(n):\n                f(*args)\n        return wrapper\n    return deco\n\n@repeat(3)\ndef p(x):\n    print(x, end='')\n\np('a')",
    options: ["a", "aaa", "TypeError", "3a"],
    answer: 1,
    explanation: "A decorator WITH arguments is a factory: `repeat(3)` runs first and returns the actual decorator `deco`, which is then applied to p. That's why there are three nested levels: factory → decorator → wrapper.",
    optionExplanations: ["The wrapper calls f three times.", "Correct.", "The three-level structure correctly handles the argument.", "n controls the repetition count; it isn't printed."]
  },
  {
    id: "py-deco-009", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def a(f):\n    def w():\n        return 'a(' + f() + ')'\n    return w\n\ndef b(f):\n    def w():\n        return 'b(' + f() + ')'\n    return w\n\n@a\n@b\ndef f():\n    return 'x'\n\nprint(f())",
    options: ["b(a(x))", "x", "a(x)b(x)", "a(b(x))"],
    answer: 3,
    explanation: "Stacked decorators apply bottom-up: `f = a(b(f))`. The decorator nearest the def wraps first, so b's wrapper is innermost and a's wrapper is outermost.",
    optionExplanations: ["The decorator closest to def is the innermost wrapper.", "Both wrappers modify the result.", "The wrappers nest; they don't run separately.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-deco-010", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def d1(f):\n    print('d1', end=' ')\n    return f\n\ndef d2(f):\n    print('d2', end=' ')\n    return f\n\n@d1\n@d2\ndef f():\n    pass",
    options: ["d1 d2", "d2 d1", "d1", "Nothing is printed"],
    answer: 1,
    explanation: "Decorators are APPLIED bottom-up at definition time: d2 receives the original function first, then d1 receives d2's result. Their print statements run in that order.",
    optionExplanations: ["Application order is bottom-up.", "Correct.", "Both decorators run.", "Decorators run when the function is defined, even if it's never called."]
  },
  {
    id: "py-deco-011", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def deco(f):\n    def wrapper():\n        return f()\n\n@deco\ndef g():\n    return 1\n\nprint(g)",
    options: ["1", "<function deco.<locals>.wrapper ...>", "None", "<function g ...>"],
    answer: 2,
    explanation: "The decorator forgot `return wrapper`, so it implicitly returns None, and `g = deco(g)` binds g to None. Calling g() would raise `TypeError: 'NoneType' object is not callable`.",
    optionExplanations: ["g isn't called here, and it's None anyway.", "The wrapper is created but never returned.", "Correct.", "The original function was replaced by the decorator's return value."],
    tags: ["trap"]
  },
  {
    id: "py-deco-012", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def log(f):\n    def wrapper(*a):\n        print('calling', end=' ')\n        f(*a)\n    return wrapper\n\n@log\ndef add(a, b):\n    return a + b\n\nprint(add(1, 2))",
    options: ["calling 3", "calling", "3", "calling None"],
    answer: 3,
    explanation: "The wrapper calls f but doesn't RETURN its result, so the decorated function always returns None. Wrappers should usually be `return f(*args, **kwargs)`.",
    optionExplanations: ["The wrapper discards f's return value.", "print(add(1, 2)) prints the wrapper's return value, None.", "The wrapper also prints 'calling'.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-deco-013", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class Count:\n    def __init__(self, f):\n        self.f = f\n        self.n = 0\n    def __call__(self, *a):\n        self.n += 1\n        return self.f(*a)\n\n@Count\ndef sq(x):\n    return x * x\n\nsq(2); sq(3)\nprint(sq.n, type(sq).__name__)",
    options: ["2 function", "TypeError", "0 Count", "2 Count"],
    answer: 3,
    explanation: "Any callable can be a decorator, including a class. `@Count` makes sq an INSTANCE of Count; calling it invokes `__call__`, which updates per-instance state. This is a clean way to keep decorator state.",
    optionExplanations: ["sq is now a Count instance, not a function.", "Instances with __call__ are callable.", "__call__ increments n on each call.", "Correct."]
  },
  {
    id: "py-deco-014", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from functools import lru_cache\ncalls = 0\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    global calls\n    calls += 1\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n\nfib(30)\nprint(calls)",
    options: ["31", "1664079", "30", "2"],
    answer: 0,
    explanation: "`lru_cache` memoises results keyed by the arguments. Each fib(k) for k = 0..30 is computed exactly once and later calls hit the cache, so the body runs 31 times instead of the ~1.6 million calls of naive recursion. This turns exponential time into linear time.",
    optionExplanations: ["Correct: one computation per distinct n in 0..30.", "That's roughly the naive call count (1,664,079) without caching.", "n ranges over 0..30 inclusive: 31 values.", "Every distinct n must be computed once."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-deco-015", subject: "python", subtopic: "Decorators & Closures", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "from functools import lru_cache\n\n@lru_cache\ndef total(items):\n    return sum(items)\n\nprint(total((1, 2)))\ntry:\n    total([1, 2])\nexcept TypeError:\n    print('TypeError')",
    options: ["3 and then 3", "3 and then TypeError", "TypeError", "None and then TypeError"],
    answer: 1,
    explanation: "lru_cache stores results in a dict keyed by the arguments, so every argument must be HASHABLE. A tuple works; a list raises `TypeError: unhashable type: 'list'` before the function body runs. (Since 3.8, `@lru_cache` can be used without parentheses.)",
    optionExplanations: ["The list argument can't be used as a cache key.", "Correct.", "The tuple call succeeds first.", "The function returns the sum, 3."]
  },
  {
    id: "py-deco-016", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def make():\n    fs = []\n    for i in range(3):\n        def f():\n            return i\n        fs.append(f)\n    return fs\n\nprint([f() for f in make()])",
    options: ["[0, 1, 2]", "[2, 2, 2]", "[3, 3, 3]", "[0, 0, 0]"],
    answer: 1,
    explanation: "All three closures share the SAME variable i from make's scope (closures capture variables, not values). They're called after the loop finishes, when i is 2. Fix with a default argument `def f(i=i)` or a factory function.",
    optionExplanations: ["Values aren't captured at definition time.", "Correct: late binding.", "range(3) ends at 2, so i's final value is 2.", "i was rebound by the loop."],
    tags: ["trap"]
  },
  {
    id: "py-deco-017", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What happens when this code runs?",
    code: "def counter():\n    c = 0\n    def inc():\n        c += 1\n        return c\n    return inc\n\nprint(counter()())",
    options: ["It prints 1", "It prints 0", "It raises UnboundLocalError", "It raises NameError at definition"],
    answer: 2,
    explanation: "Reading an enclosing variable works without declarations, but ASSIGNING to it (including `c += 1`) makes c local to inc. The local c is read before assignment, raising UnboundLocalError. Declare `nonlocal c` in inc.",
    optionExplanations: ["The assignment makes c local, so it can't read the enclosing value.", "The function fails before returning.", "Correct.", "Defining the nested function is fine."]
  },
  {
    id: "py-deco-018", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def make():\n    x = 0\n    def get():\n        return x\n    def put(v):\n        nonlocal x\n        x = v\n    return get, put\n\nget, put = make()\nput(5)\nprint(get())",
    options: ["0", "UnboundLocalError", "None", "5"],
    answer: 3,
    explanation: "Both inner functions close over the SAME cell for x. put rebinds it via nonlocal, and get reads the updated value. Closures share state, which is how you can build simple objects from functions.",
    optionExplanations: ["The shared cell was updated to 5.", "nonlocal makes the assignment legal.", "get returns x.", "Correct."]
  },
  {
    id: "py-deco-019", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def add_hello(cls):\n    cls.hello = lambda self: 'hi from ' + type(self).__name__\n    return cls\n\n@add_hello\nclass A:\n    pass\n\nprint(A().hello())",
    options: ["hi from A", "hi from add_hello", "AttributeError", "hi from cls"],
    answer: 0,
    explanation: "Class decorators receive the class object after it's created and can modify or replace it (dataclass works this way). Here a method is attached to the class and returned.",
    optionExplanations: ["Correct.", "type(self) is A.", "The decorator added the method before instances were created.", "type(self).__name__ evaluates to 'A'."]
  },
  {
    id: "py-deco-020", subject: "python", subtopic: "Decorators & Closures", difficulty: "easy", type: "concept",
    question: "Which of these built-in names are used as decorators?",
    options: ["`@property`, `@staticmethod`, `@classmethod`", "`@len`, `@print`, `@range`", "`@import`, `@global`, `@yield`", "`@self`, `@cls`, `@super`"],
    answer: 0,
    explanation: "property, staticmethod and classmethod are built-in classes commonly applied as decorators inside class bodies. Other popular decorators include functools.lru_cache, functools.wraps, dataclasses.dataclass and contextlib.contextmanager.",
    optionExplanations: ["Correct.", "These are functions, but not meant as decorators.", "These are keywords, not callables.", "self and cls are parameter names; super is a built-in but not a decorator."]
  },
  {
    id: "py-deco-021", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def count_calls(f):\n    def wrapper(*a):\n        wrapper.calls += 1\n        return f(*a)\n    wrapper.calls = 0\n    return wrapper\n\n@count_calls\ndef f():\n    pass\n\n@count_calls\ndef g():\n    pass\n\nf(); f(); g()\nprint(f.calls, g.calls)",
    options: ["3 3", "2 1", "0 0", "1 1"],
    answer: 1,
    explanation: "Each application of the decorator creates a NEW wrapper function with its own `calls` attribute, so f and g count independently. Function attributes are a lightweight way to attach state to a wrapper.",
    optionExplanations: ["Each decorated function has its own wrapper.", "Correct.", "The wrapper increments the counter.", "f was called twice."]
  },
  {
    id: "py-deco-022", subject: "python", subtopic: "Decorators & Closures", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def repeat(n):\n    def deco(f):\n        def wrapper(*a):\n            for _ in range(n):\n                f(*a)\n        return wrapper\n    return deco\n\n@repeat\ndef p(x):\n    print(x, end='')\n\nr = p('a')\nprint(callable(r), r.__name__)",
    options: ["aTrue wrapper", "True deco", "a None", "True wrapper"],
    answer: 3,
    explanation: "Using a decorator factory without calling it (`@repeat` instead of `@repeat(3)`) passes the function as n. repeat(p) returns `deco`, so p is now deco. Calling p('a') runs deco('a'), which just builds and returns a wrapper; nothing is printed.",
    optionExplanations: ["The original p is never called, so nothing is printed.", "p is deco, and calling it returns wrapper.", "p('a') returns the inner wrapper function.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-deco-023", subject: "python", subtopic: "Decorators & Closures", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def d1(f):\n    def w():\n        print('d1>', end=' ')\n        f()\n        print('<d1', end=' ')\n    return w\n\ndef d2(f):\n    def w():\n        print('d2>', end=' ')\n        f()\n        print('<d2', end=' ')\n    return w\n\n@d1\n@d2\ndef f():\n    print('f', end=' ')\n\nf()",
    options: ["d1> d2> f <d2 <d1", "d2> d1> f <d1 <d2", "d1> f <d1 d2> f <d2", "d2> f <d2 d1> f <d1"],
    answer: 0,
    explanation: "Decorators are APPLIED bottom-up (d2 wraps f, d1 wraps that), but at CALL time the outermost wrapper runs first. So d1's 'before' code runs first, then d2's, then f, and the 'after' code unwinds in reverse — like nested function calls.",
    optionExplanations: ["Correct.", "The outermost wrapper (d1) runs first when called.", "f runs only once, inside both wrappers.", "The wrappers are nested, not sequential."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-deco-024", subject: "python", subtopic: "Decorators & Closures", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "import functools\n\ndef shout(f):\n    @functools.wraps(f)\n    def wrapper():\n        return f().upper()\n    return wrapper\n\n@shout\ndef hi():\n    return 'hi'\n\nprint(hi(), hi.__wrapped__())",
    options: ["HI HI", "hi hi", "HI hi", "AttributeError"],
    answer: 2,
    explanation: "functools.wraps sets `__wrapped__` on the wrapper to point at the original function. That allows bypassing the decorator (useful in tests) and lets tools like inspect.signature see the real signature.",
    optionExplanations: ["__wrapped__ is the undecorated function.", "The decorated call uppercases.", "Correct.", "wraps provides the __wrapped__ attribute."]
  },
  {
    id: "py-deco-025", subject: "python", subtopic: "Decorators & Closures", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def outer():\n    x = 1\n    def inner():\n        return x\n    x = 2\n    return inner\n\nprint(outer()())",
    options: ["1", "None", "NameError", "2"],
    answer: 3,
    explanation: "A closure captures the variable (its cell), not the value at the moment the inner function was defined. x is rebound to 2 before outer returns, so inner sees 2 when called.",
    optionExplanations: ["The value isn't frozen at definition time.", "inner returns x.", "x exists in the enclosing scope.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-deco-026", subject: "python", subtopic: "Decorators & Closures", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class Deco:\n    def __init__(self, f):\n        self.f = f\n    def __call__(self, *a):\n        return self.f(*a)\n\nclass A:\n    @Deco\n    def m(self):\n        return 'm'\n\ntry:\n    print(A().m())\nexcept TypeError:\n    print('TypeError')",
    options: ["m", "None", "TypeError", "AttributeError"],
    answer: 2,
    explanation: "Plain functions become bound methods because they're DESCRIPTORS (they implement `__get__`). A Deco instance doesn't implement `__get__`, so `A().m` returns the Deco object itself without binding self; calling it invokes m() with no arguments, raising TypeError for the missing 'self'. Function-based decorators (or adding __get__) avoid this.",
    optionExplanations: ["self is never passed to the original method.", "An exception is raised before any return.", "Correct.", "The attribute exists; it's just not bound."],
    tags: ["trap"]
  },
  {
    id: "py-deco-027", subject: "python", subtopic: "Decorators & Closures", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def memo(f):\n    cache = {}\n    def w(n):\n        if n not in cache:\n            cache[n] = f(n)\n        return cache[n]\n    return w\n\n@memo\ndef sq(n):\n    print('compute', n, end=' | ')\n    return n * n\n\nsq(3); sq(3); sq(4)",
    options: ["compute 3 | compute 3 | compute 4 |", "compute 3 | compute 4 |", "compute 4 |", "Nothing is printed"],
    answer: 1,
    explanation: "The cache dict lives in the decorator's enclosing scope and persists between calls through the closure. The second sq(3) is a cache hit, so the original function (and its print) is skipped.",
    optionExplanations: ["The second sq(3) hits the cache.", "Correct.", "sq(3) is computed the first time.", "The first calls do compute."]
  },
  {
    id: "py-deco-028", subject: "python", subtopic: "Decorators & Closures", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def deco(f):\n    def w(x):\n        return f(x) * 2\n    return w\n\n@deco\n@deco\ndef f(x):\n    return x + 1\n\nprint(f(1))",
    options: ["4", "8", "6", "3"],
    answer: 1,
    explanation: "Applying the same decorator twice nests two wrappers: f = deco(deco(f)). The inner wrapper returns (x + 1) * 2 = 4; the outer wrapper doubles that to 8.",
    optionExplanations: ["That's only one level of doubling.", "Correct.", "The doubling is applied twice, not added.", "Both wrappers modify the result."]
  },
  {
    id: "py-deco-029", subject: "python", subtopic: "Decorators & Closures", difficulty: "medium", type: "concept",
    question: "Which wrapper signature lets a decorator work with ANY function, regardless of its parameters?",
    options: ["`def wrapper():`", "`def wrapper(x):`", "`def wrapper(*args, **kwargs):` and call `f(*args, **kwargs)`", "`def wrapper(self):`"],
    answer: 2,
    explanation: "Collecting all positional arguments with *args and keyword arguments with **kwargs, then forwarding them with the same unpacking, makes the wrapper transparent to any signature. Remember to also return the result.",
    optionExplanations: ["Only works for functions with no parameters.", "Only works for exactly one positional argument.", "Correct.", "Only fits methods with no other parameters."]
  },
{
    id: "py-deco-030", subject: "python", subtopic: "Decorators & Closures", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "def deco(f):\n    def wrapper():\n        print('before', end=' ')\n        f()\n        print('after')\n    return wrapper\n\n@deco\ndef g():\n    print('g', end=' ')\n\ng()",
    options: ["g", "before g after", "before after g", "g before after"],
    answer: 1,
    explanation: "The decorated name g now refers to wrapper. Calling it runs the wrapper's code before the original function, then the original g, then the code after it — the basic shape of every logging or timing decorator.",
    optionExplanations: ["The wrapper adds output around g.", "Correct.", "f() is called between the two prints.", "The 'before' print runs before f()."]
  },
  {
    id: "py-deco-031", subject: "python", subtopic: "Decorators & Closures", difficulty: "easy", type: "concept",
    question: "What is a closure?",
    options: ["A function that has finished executing and released all its variables", "A nested function that remembers variables from its enclosing function's scope, even after that function has returned", "A function that closes open files automatically", "Any function defined with lambda"],
    answer: 1,
    explanation: "When an inner function references variables of an outer function and the inner function outlives the outer call (e.g. it is returned), Python keeps those variables alive in 'cells'. The inner function plus its captured environment is a closure. Closures power decorators, factories and callbacks.",
    optionExplanations: ["The captured variables stay alive, which is the whole point.", "Correct.", "That's a context manager's job.", "A lambda is only a closure if it captures enclosing variables; named functions can be closures too."],
    tags: ["interview-favourite"]
  }
);
