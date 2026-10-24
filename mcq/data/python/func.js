/* Python — Functions & Scope */
window.QUESTIONS.push(
  {
    id: "py-func-001", subject: "python", subtopic: "Functions & Scope", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "def f():\n    x = 1\n\nprint(f())",
    options: ["1", "NameError", "0", "None"],
    answer: 3,
    explanation: "A function without a `return` statement (or with a bare `return`) returns None implicitly. Assigning a local variable does not return it.",
    optionExplanations: ["x is local and never returned.", "Calling f is fine; nothing undefined is used.", "Python doesn't default to 0.", "Correct: implicit return value is None."]
  },
  {
    id: "py-func-002", subject: "python", subtopic: "Functions & Scope", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "def greet(name, msg='Hi'):\n    return f'{msg} {name}'\n\nprint(greet('A'), '|', greet('B', 'Yo'))",
    options: ["Hi A | Yo B", "A Hi | B Yo", "Hi A | Hi B", "TypeError"],
    answer: 0,
    explanation: "A parameter with a default value is optional: if the caller omits it, the default is used. The first call uses msg='Hi'; the second passes 'Yo' positionally, overriding it.",
    optionExplanations: ["Correct.", "The f-string puts msg first, then name.", "The second call overrides the default.", "Both calls supply valid arguments."]
  },
  {
    id: "py-func-003", subject: "python", subtopic: "Functions & Scope", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "def f(*args, **kwargs):\n    return type(args).__name__, type(kwargs).__name__\n\nprint(f(1, 2, a=3))",
    options: ["('list', 'dict')", "('tuple', 'dict')", "('tuple', 'list')", "('args', 'kwargs')"],
    answer: 1,
    explanation: "`*args` collects extra positional arguments into a TUPLE, and `**kwargs` collects extra keyword arguments into a DICT. The names args/kwargs are just conventions; the * and ** do the work.",
    optionExplanations: ["*args is a tuple, not a list.", "Correct.", "**kwargs maps names to values, so it's a dict.", "Those are the parameter names, not the types."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-func-004", subject: "python", subtopic: "Functions & Scope", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "def f():\n    return 1, 2\n\nx = f()\nprint(type(x).__name__, x)",
    options: ["int 1", "list [1, 2]", "tuple (1, 2)", "SyntaxError"],
    answer: 2,
    explanation: "`return 1, 2` returns a single tuple; the comma creates it. That's how Python 'returns multiple values', and the caller can unpack it with `a, b = f()`.",
    optionExplanations: ["Both values are returned, packed together.", "The comma creates a tuple, not a list.", "Correct.", "Returning a comma-separated expression is valid."]
  },
  {
    id: "py-func-005", subject: "python", subtopic: "Functions & Scope", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "sq = lambda x: x * x\nprint(sq(4), (lambda a, b=2: a ** b)(3))",
    options: ["16 9", "8 9", "16 6", "SyntaxError"],
    answer: 0,
    explanation: "A lambda is an anonymous function limited to a single expression, whose value is returned automatically. Lambdas support default arguments and can be called immediately.",
    optionExplanations: ["Correct: 4*4 = 16 and 3**2 = 9.", "x * x squares, it doesn't double.", "a ** b is exponentiation: 3 ** 2 = 9.", "Calling a lambda inline is valid."]
  },
  {
    id: "py-func-006", subject: "python", subtopic: "Functions & Scope", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "m = map(str, [1, 2])\nprint(type(m).__name__, list(m))",
    options: ["list ['1', '2']", "generator ['1', '2']", "map [1, 2]", "map ['1', '2']"],
    answer: 3,
    explanation: "In Python 3, `map()` returns a lazy map ITERATOR, not a list. Wrap it in list() to materialise the results. Like any iterator, it can only be consumed once.",
    optionExplanations: ["map returns a map object, not a list.", "It's a map object, not a generator.", "str converts each number to a string.", "Correct."]
  },
  {
    id: "py-func-007", subject: "python", subtopic: "Functions & Scope", difficulty: "easy", type: "concept",
    question: "What order does Python use to resolve a variable name (the LEGB rule)?",
    options: ["Global → Local → Built-in → Enclosing", "Local → Global → Enclosing → Built-in", "Built-in → Global → Enclosing → Local", "Local → Enclosing → Global → Built-in"],
    answer: 3,
    explanation: "Python searches the Local scope (current function), then Enclosing function scopes (for nested functions), then the module's Global scope, then Built-ins (len, print, ...). The first match wins.",
    optionExplanations: ["Lookup always starts with the innermost (local) scope.", "Enclosing scopes are searched before globals.", "This is the reverse order.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-func-008", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def add(x, lst=[]):\n    lst.append(x)\n    return lst\n\nadd(1)\nadd(2)\nprint(add(3))",
    options: ["[3]", "TypeError", "[1, 3]", "[1, 2, 3]"],
    answer: 3,
    explanation: "Default values are evaluated ONCE, when the def statement runs, and stored on the function. A mutable default like [] is therefore shared across all calls that don't pass lst, and accumulates values. Use `lst=None` and create the list inside the function.",
    optionExplanations: ["The same default list is reused, so earlier values remain.", "Appending to the default list is valid.", "Every call appends to the same list.", "Correct: the mutable default persists across calls."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "py-func-009", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def add(x, lst=None):\n    if lst is None:\n        lst = []\n    lst.append(x)\n    return lst\n\nprint(add(1), add(2))",
    options: ["[1] [2]", "[1, 2] [1, 2]", "[1] [1, 2]", "None None"],
    answer: 0,
    explanation: "The None-sentinel idiom creates a FRESH list on every call that doesn't supply one, avoiding the shared-mutable-default bug. Each call returns its own independent list.",
    optionExplanations: ["Correct.", "That's the bug the sentinel idiom avoids.", "Each call creates a new list.", "The function returns the list."]
  },
  {
    id: "py-func-010", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What happens when this code runs?",
    code: "x = 10\ndef f():\n    print(x)\n    x = 5\n\nf()",
    options: ["It prints 10", "It prints 5", "It raises UnboundLocalError", "It raises NameError at definition time"],
    answer: 2,
    explanation: "Scope is decided at COMPILE time: because x is assigned somewhere in f, x is local to the whole function. The print runs before the local x has a value, so Python raises UnboundLocalError (a subclass of NameError), instead of falling back to the global.",
    optionExplanations: ["The assignment makes x local throughout f, hiding the global.", "print runs before x = 5 executes.", "Correct.", "Defining the function is fine; the error happens when it's called."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "py-func-011", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "count = 0\ndef inc():\n    global count\n    count += 1\n\ninc()\ninc()\nprint(count)",
    options: ["0", "1", "UnboundLocalError", "2"],
    answer: 3,
    explanation: "The `global` declaration makes `count` inside inc refer to the module-level variable, so `count += 1` rebinds the global. Without it, the augmented assignment would make count local and raise UnboundLocalError.",
    optionExplanations: ["The global is modified by both calls.", "inc is called twice.", "`global count` prevents the local-variable error.", "Correct."]
  },
  {
    id: "py-func-012", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def outer():\n    x = 1\n    def inner():\n        nonlocal x\n        x += 1\n    inner()\n    inner()\n    return x\n\nprint(outer())",
    options: ["1", "2", "3", "SyntaxError"],
    answer: 2,
    explanation: "`nonlocal x` tells Python that x in inner refers to the variable in the nearest ENCLOSING function scope (outer), allowing inner to rebind it. Two calls increment x from 1 to 3.",
    optionExplanations: ["nonlocal lets inner modify outer's x.", "inner is called twice.", "Correct.", "nonlocal is valid because outer defines x."]
  },
  {
    id: "py-func-013", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f(lst):\n    lst.append(4)\n    lst = [0]\n    lst.append(5)\n\na = [1]\nf(a)\nprint(a)",
    options: ["[1]", "[0, 5]", "[1, 4]", "[1, 4, 5]"],
    answer: 2,
    explanation: "Python passes object references ('pass by assignment'). `lst.append(4)` mutates the caller's list. `lst = [0]` merely rebinds the LOCAL name to a new list, which the caller never sees, so the later append(5) affects only that new list.",
    optionExplanations: ["The first append mutates the shared list.", "Rebinding inside the function doesn't change the caller's variable.", "Correct: mutation is visible, rebinding isn't.", "After rebinding, append(5) goes to the new local list."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-func-014", subject: "python", subtopic: "Functions & Scope", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "def f(n):\n    n += 1\n    return n\n\nx = 5\ny = f(x)\nprint(x, y)",
    options: ["6 6", "5 6", "5 5", "6 5"],
    answer: 1,
    explanation: "Ints are immutable, so `n += 1` creates a new int and rebinds the local name n; the caller's x still refers to 5. The new value is only visible through the return value.",
    optionExplanations: ["x can't be changed through the parameter.", "Correct.", "The function returns 6.", "The values are reversed."]
  },
  {
    id: "py-func-015", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f(a, *, b):\n    return a + b\n\ntry:\n    print(f(1, 2))\nexcept TypeError:\n    print('TypeError', f(1, b=2))",
    options: ["3", "SyntaxError", "TypeError", "TypeError 3"],
    answer: 3,
    explanation: "Parameters after a bare `*` are KEYWORD-ONLY: they can't be filled positionally. `f(1, 2)` raises TypeError (too many positional arguments); `f(1, b=2)` works.",
    optionExplanations: ["b cannot be passed positionally.", "A bare * in a parameter list is valid.", "The except block also prints the result of a valid call.", "Correct."]
  },
  {
    id: "py-func-016", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output (Python 3.8+)?",
    code: "def f(a, /, b):\n    return a + b\n\nprint(f(1, b=2), f(1, 2))\ntry:\n    f(a=1, b=2)\nexcept TypeError:\n    print('TypeError')",
    options: ["3 3 and then 3", "3 3 and then TypeError", "TypeError", "SyntaxError"],
    answer: 1,
    explanation: "Parameters before `/` are POSITIONAL-ONLY: callers can't pass them by keyword. `f(1, b=2)` and `f(1, 2)` are fine; `f(a=1, b=2)` raises TypeError. Built-ins like len() use this so their parameter names aren't part of the API.",
    optionExplanations: ["a can't be passed as a keyword, so the last call fails.", "Correct.", "The first two calls succeed.", "`/` in a parameter list is valid since Python 3.8."]
  },
  {
    id: "py-func-017", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "concept",
    question: "Given `def f(a, b): ...`, which call is a SyntaxError (not just a runtime TypeError)?",
    options: ["`f(1, 2)`", "`f(b=2, a=1)`", "`f(a=1, 2)`", "`f(1, a=2)`"],
    answer: 2,
    explanation: "Positional arguments must come before keyword arguments in a call, so `f(a=1, 2)` is rejected by the parser: 'positional argument follows keyword argument'. `f(1, a=2)` is syntactically valid but raises TypeError at runtime because a gets two values.",
    optionExplanations: ["A normal positional call.", "Keyword arguments can be in any order.", "Correct: positional after keyword is a syntax error.", "Valid syntax; it fails at runtime with 'multiple values for argument a'."]
  },
  {
    id: "py-func-018", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f(a, b, c):\n    return a * 100 + b * 10 + c\n\nargs = [1, 2]\nkw = {'b': 5, 'c': 6, 'a': 4}\nprint(f(*args, c=3), f(**kw))",
    options: ["123 456", "123 564", "312 456", "TypeError"],
    answer: 0,
    explanation: "At a call site, `*iterable` spreads items as positional arguments and `**mapping` spreads key/value pairs as keyword arguments. f(*[1, 2], c=3) is f(1, 2, c=3) → 123; f(**kw) matches by name regardless of dict order → a=4, b=5, c=6 → 456.",
    optionExplanations: ["Correct.", "** unpacking matches by parameter name, not position.", "*args fills a and b in order.", "All parameters receive exactly one value."]
  },
  {
    id: "py-func-019", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(list(filter(None, [0, 1, '', 'a', [], [2], None])))",
    options: ["[0, '', [], None]", "TypeError", "[]", "[1, 'a', [2]]"],
    answer: 3,
    explanation: "When the function argument to `filter` is None, filter keeps the truthy elements (identity test). 0, '', [] and None are falsy and are dropped.",
    optionExplanations: ["Those are the falsy elements that get removed.", "None is an accepted first argument to filter.", "Several elements are truthy.", "Correct."]
  },
  {
    id: "py-func-020", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from functools import reduce\nprint(reduce(lambda a, b: a * b, [1, 2, 3, 4]), reduce(lambda a, b: a + b, [], 10))",
    options: ["24 10", "10 0", "24 TypeError", "10 10"],
    answer: 0,
    explanation: "`reduce` folds the iterable from the left: ((1*2)*3)*4 = 24. With an initializer, folding starts from it, so an empty iterable simply returns the initializer (10). Without an initializer, an empty iterable raises TypeError.",
    optionExplanations: ["Correct.", "The lambda multiplies, giving 24.", "The initializer 10 prevents the empty-sequence error.", "The first reduce multiplies, not adds."]
  },
  {
    id: "py-func-021", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def apply(f, x):\n    return f(x)\n\nprint(apply(len, 'abc'), apply(str.upper, 'ab'), apply(lambda s: s[::-1], 'xy'))",
    options: ["3 AB yx", "len upper xy", "3 ab xy", "TypeError"],
    answer: 0,
    explanation: "Functions are first-class objects: they can be passed as arguments, stored in variables and returned. `str.upper` is an unbound method that works as a function taking a string.",
    optionExplanations: ["Correct.", "The functions are called, not printed by name.", "str.upper uppercases the string, and the lambda reverses 'xy'.", "Passing functions as arguments is valid."]
  },
  {
    id: "py-func-022", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "concept",
    question: "What happens if a recursive function in CPython recurses about 10,000 levels deep with default settings?",
    options: ["It runs normally; Python optimises tail calls", "It raises RecursionError because the default recursion limit is about 1000", "It silently returns None", "It always crashes the interpreter with a segmentation fault"],
    answer: 1,
    explanation: "CPython limits the call depth (default ~1000, see `sys.getrecursionlimit()`) and raises RecursionError beyond it. Python does NOT perform tail-call optimisation. Deep recursion should be rewritten iteratively; raising the limit with `sys.setrecursionlimit` risks a real stack overflow.",
    optionExplanations: ["Python has no tail-call optimisation.", "Correct.", "It raises an exception, not a silent result.", "The recursion limit exists precisely to prevent crashing."]
  },
  {
    id: "py-func-023", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f(a, b=2, c=3):\n    pass\n\nprint(f.__defaults__, f.__name__)",
    options: ["(2, 3) f", "{'b': 2, 'c': 3} f", "[2, 3] f", "None f"],
    answer: 0,
    explanation: "Functions are objects with attributes. Positional default values are stored as a tuple in `__defaults__` (that's where the shared mutable default lives); keyword-only defaults are in `__kwdefaults__`. `__name__` holds the function's name.",
    optionExplanations: ["Correct.", "__defaults__ is a tuple, not a dict.", "It's a tuple, not a list.", "The function has defaults, so it's not None."]
  },
  {
    id: "py-func-024", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from functools import partial\ncube = partial(pow, exp=3)\ntwo_to = partial(pow, 2)\nprint(cube(2), two_to(5))",
    options: ["8 32", "9 25", "8 10", "TypeError"],
    answer: 0,
    explanation: "`functools.partial` returns a new callable with some arguments pre-filled. cube(2) calls pow(2, exp=3) = 8; two_to(5) calls pow(2, 5) = 32.",
    optionExplanations: ["Correct.", "exp=3 cubes the base, and two_to fixes the base to 2.", "two_to(5) is 2 ** 5 = 32.", "pow accepts exp as a keyword argument."]
  },
  {
    id: "py-func-025", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What happens when this code runs?",
    code: "list = [1, 2]\nprint(list('ab'))",
    options: ["It prints ['a', 'b']", "It prints [1, 2]", "It raises TypeError: 'list' object is not callable", "It raises NameError"],
    answer: 2,
    explanation: "Assigning to `list` creates a GLOBAL name that shadows the built-in list type (globals are searched before built-ins in LEGB). Calling it then tries to call a list instance. Avoid naming variables list, dict, str, id, etc.",
    optionExplanations: ["The built-in is shadowed by the global variable.", "Calling a list object fails; it isn't indexed or printed.", "Correct.", "The name exists; it just refers to the wrong object."],
    tags: ["trap"]
  },
  {
    id: "py-func-026", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "x = 1\ndef f(a=x):\n    return a\n\nx = 2\nprint(f(), x)",
    options: ["2 2", "NameError", "1 1", "1 2"],
    answer: 3,
    explanation: "Default values are evaluated once, when the `def` statement executes. At that moment x is 1, so the default is 1 forever, even after x is rebound to 2.",
    optionExplanations: ["The default was captured at definition time.", "x exists when the function is defined.", "x itself was rebound to 2.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-func-027", subject: "python", subtopic: "Functions & Scope", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def add(x, lst=[]):\n    lst.append(x)\n    return lst\n\nprint(add(1), add(2))",
    options: ["[1] [2]", "[1] [1, 2]", "[1, 2] [1, 2]", "[1, 2] [2]"],
    answer: 2,
    explanation: "Both calls return the SAME default list object, and both arguments to print are evaluated before printing. By the time print runs, that list contains [1, 2], and it is printed twice. This shows that the 'result' of the first call was not a snapshot.",
    optionExplanations: ["The default list is shared, not created per call.", "Both arguments reference one list that already holds [1, 2] when printed.", "Correct.", "Both calls return the same object."],
    tags: ["trap", "interview-favourite"]
  },
  {
    id: "py-func-028", subject: "python", subtopic: "Functions & Scope", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "x = 1\ndef f():\n    try:\n        x += 1\n    except UnboundLocalError:\n        return 'unbound'\n    return x\n\nprint(f(), x)",
    options: ["2 2", "2 1", "unbound 1", "unbound 2"],
    answer: 2,
    explanation: "`x += 1` is an assignment to x, which makes x local to f at compile time. Reading the local x before it is bound raises UnboundLocalError. The global x is untouched.",
    optionExplanations: ["Without `global x`, the global can't be modified.", "The augmented assignment can't read the global.", "Correct.", "The global x is never modified."],
    tags: ["trap"]
  },
  {
    id: "py-func-029", subject: "python", subtopic: "Functions & Scope", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "x = 'g'\ndef outer():\n    x = 'e'\n    def inner():\n        global x\n        x = 'changed'\n    inner()\n    return x\n\nprint(outer(), x)",
    options: ["changed changed", "e changed", "e g", "changed g"],
    answer: 1,
    explanation: "`global x` in inner skips the enclosing scope entirely and binds the MODULE-level x. outer's local x is unaffected, so outer returns 'e', while the global becomes 'changed'. To modify outer's x you would need `nonlocal`.",
    optionExplanations: ["outer's local x isn't touched by a global declaration.", "Correct.", "inner did rebind the global.", "The values are swapped."],
    tags: ["trap"]
  },
  {
    id: "py-func-030", subject: "python", subtopic: "Functions & Scope", difficulty: "hard", type: "concept",
    question: "What happens when Python compiles this module-level function?",
    code: "def f():\n    nonlocal y\n    y = 1",
    options: ["y becomes a global variable", "SyntaxError: no binding for nonlocal 'y' found", "It works and y is local", "NameError when f is called"],
    answer: 1,
    explanation: "`nonlocal` must refer to a variable in an ENCLOSING FUNCTION scope; module-level (global) variables don't count. The check happens at compile time, so this is a SyntaxError before f ever runs. Use `global` for module-level names.",
    optionExplanations: ["nonlocal never refers to globals.", "Correct: the binding is checked at compile time.", "The nonlocal declaration itself is invalid here.", "The error happens at compile time, not at call time."]
  },
  {
    id: "py-func-031", subject: "python", subtopic: "Functions & Scope", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def make():\n    count = 0\n    def inc():\n        nonlocal count\n        count += 1\n        return count\n    return inc\n\na = make()\nb = make()\na(); a()\nprint(a(), b())",
    options: ["3 3", "3 1", "1 1", "3 4"],
    answer: 1,
    explanation: "Each call to make() creates a new `count` variable and a new closure over it. a and b have independent state: a has been called 3 times, b once.",
    optionExplanations: ["The two closures don't share count.", "Correct: separate closures, separate state.", "The state persists between calls to a.", "b's count starts at 0 independently."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-func-032", subject: "python", subtopic: "Functions & Scope", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def f(a, b=[], *args, c=5, **kw):\n    return len(args), c, kw\n\nprint(f(1, 2, 3, 4, c=6, d=7))",
    options: ["(3, 6, {'d': 7})", "(2, 6, {'d': 7})", "(2, 5, {'c': 6, 'd': 7})", "TypeError"],
    answer: 1,
    explanation: "Positional arguments fill a=1 and b=2 first; the leftovers 3 and 4 go to *args (length 2). c is keyword-only (it's after *args) and receives 6; d doesn't match any parameter, so it goes into **kw.",
    optionExplanations: ["b takes 2, so only two values remain for args.", "Correct.", "c matches the named keyword-only parameter.", "All arguments are accepted."]
  },
  {
    id: "py-func-033", subject: "python", subtopic: "Functions & Scope", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def f(a, b):\n    return a - b\n\ntry:\n    print(f(1, 2, a=3))\nexcept TypeError as e:\n    print('multiple values' in str(e))",
    options: ["-1", "1", "True", "False"],
    answer: 2,
    explanation: "Positional 1 and 2 bind to a and b; then a=3 tries to bind a again, so Python raises `TypeError: f() got multiple values for argument 'a'`. Also note this is a TypeError at runtime, not a SyntaxError.",
    optionExplanations: ["The call fails before f runs.", "a can't be overridden by a keyword after being filled positionally.", "Correct.", "The message does mention multiple values."]
  },
  {
    id: "py-func-034", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "x = 10\nf = lambda y, x=x: x + y\nx = 20\ng = lambda y: x + y\nprint(f(1), g(1))",
    options: ["11 21", "21 21", "11 11", "21 11"],
    answer: 0,
    explanation: "f captures x's value at definition time through the default parameter, so it uses 10. g has no such default and looks up the global x when called, which is 20 by then.",
    optionExplanations: ["Correct.", "The default parameter froze x = 10 for f.", "g reads the current x at call time, which is 20.", "The results are swapped."]
  },
  {
    id: "py-func-035", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(list(map(lambda a, b: a * b, [1, 2, 3], [4, 5])))",
    options: ["[4, 10, 3]", "[4, 10]", "TypeError", "[4, 10, 0]"],
    answer: 1,
    explanation: "With several iterables, map calls the function with one item from each and stops when the SHORTEST iterable is exhausted, just like zip.",
    optionExplanations: ["Unmatched items are dropped, not passed through.", "Correct.", "map accepts multiple iterables for multi-argument functions.", "No padding value is used."]
  },
  {
    id: "py-func-036", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f():\n    len = 5\n    return len\n\nprint(f(), len('ab'))",
    options: ["5 2", "5 5", "TypeError", "2 2"],
    answer: 0,
    explanation: "Inside f, the local name len shadows the built-in only in that function's scope. Outside, LEGB lookup falls through to the built-in len, which still works.",
    optionExplanations: ["Correct.", "The shadowing is local to f.", "The global/built-in len is unaffected.", "f returns its local value 5."]
  },
  {
    id: "py-func-037", subject: "python", subtopic: "Functions & Scope", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def f(n):\n    if n == 0:\n        return 0\n    return n + f(n - 2)\n\ntry:\n    print(f(5))\nexcept RecursionError:\n    print('RecursionError')",
    options: ["9", "15", "6", "RecursionError"],
    answer: 3,
    explanation: "Starting at 5 and subtracting 2 gives 5, 3, 1, -1, -3, ... which never hits the base case n == 0. The recursion goes on until the recursion limit is exceeded. Base cases should handle every way recursion can end (e.g. `n <= 0`).",
    optionExplanations: ["9 would be 5 + 3 + 1 if the base case were n <= 0.", "That's the sum 1..5.", "The recursion never terminates normally.", "Correct: odd n skips past 0."],
    tags: ["trap"]
  },
  {
    id: "py-func-038", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f():\n    f.calls += 1\n\nf.calls = 0\nf(); f(); f()\nprint(f.calls)",
    options: ["0", "1", "3", "AttributeError"],
    answer: 2,
    explanation: "Functions are objects and can carry arbitrary attributes. Inside the body, the global name f refers to the function object itself, so each call increments the attribute.",
    optionExplanations: ["Each call increments the attribute.", "f was called three times.", "Correct.", "The attribute is created before the first call."]
  },
  {
    id: "py-func-039", subject: "python", subtopic: "Functions & Scope", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def f(x, y=None, *a, **k):\n    print(x, y, a, k)\n\nf(1, *[2, 3], **{'z': 4})",
    options: ["1 None (2, 3) {'z': 4}", "1 2 (3,) {'z': 4}", "1 [2, 3] () {'z': 4}", "1 2 (3) {'z': 4}"],
    answer: 1,
    explanation: "`*[2, 3]` spreads into positional arguments, so the call becomes f(1, 2, 3, z=4): x=1, y=2, the extra positional 3 goes into a as a one-element tuple (3,), and z goes into k.",
    optionExplanations: ["Spread arguments fill y before *a.", "Correct.", "The list is unpacked, not passed as one argument.", "A one-element tuple prints as (3,)."]
  },
  {
    id: "py-func-040", subject: "python", subtopic: "Functions & Scope", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def f(d={}):\n    d['n'] = d.get('n', 0) + 1\n    return d['n']\n\nprint(f(), f(), f({}), f())",
    options: ["1 1 1 1", "1 2 1 1", "1 2 3 4", "1 2 1 3"],
    answer: 3,
    explanation: "The default dict persists across calls that don't pass d, so it counts 1, 2, and later 3. The call f({}) passes a fresh dict, so it starts at 1 and doesn't affect the shared default.",
    optionExplanations: ["The default dict is shared and accumulates.", "The last call continues counting on the shared default.", "f({}) uses its own fresh dict.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-func-041", subject: "python", subtopic: "Functions & Scope", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def f():\n    return g()\n\ndef g():\n    return 1\n\na = f()\n\ndef g():\n    return 2\n\nprint(a, f())",
    options: ["1 1", "2 2", "1 2", "NameError"],
    answer: 2,
    explanation: "Names inside a function body are resolved when the function RUNS, not when it's defined. f can call g even though g is defined later, and after g is redefined, f picks up the new definition.",
    optionExplanations: ["The second call to f sees the redefined g.", "a was computed before g was redefined.", "Correct: late binding of global names.", "g exists by the time f is first called."]
  },
  {
    id: "py-func-042", subject: "python", subtopic: "Functions & Scope", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "def f(*, a, b):\n    return a - b\n\nprint(f(b=1, a=5))",
    options: ["-4", "SyntaxError", "TypeError", "4"],
    answer: 3,
    explanation: "Keyword arguments are matched by name, so their order at the call site doesn't matter: a=5, b=1, giving 4. The bare * makes both parameters keyword-only.",
    optionExplanations: ["a is 5 and b is 1, regardless of the order written.", "This is valid syntax.", "Both required keyword-only arguments are supplied.", "Correct."]
  },
  {
    id: "py-func-043", subject: "python", subtopic: "Functions & Scope", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(print('a'))",
    options: ["a", "a None", "None", "a a"],
    answer: 1,
    explanation: "The inner print runs first, printing 'a' (on its own line). print() returns None, so the outer print then prints 'None'.",
    optionExplanations: ["The outer print also prints its argument, None.", "Correct: 'a' then 'None'.", "The inner print outputs 'a' first.", "print returns None, not its argument."]
  },
  {
    id: "py-func-044", subject: "python", subtopic: "Functions & Scope", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f(a: int, b: str = 'x') -> bool:\n    '''Checks something.'''\n    return True\n\nprint(f.__doc__, list(f.__annotations__))",
    options: ["Checks something. ['a', 'b', 'return']", "None ['a', 'b']", "Checks something. ['a', 'b']", "f ['int', 'str', 'bool']"],
    answer: 0,
    explanation: "The first string literal in a function body becomes its docstring (`__doc__`). Parameter and return annotations are stored in `__annotations__`, a dict keyed by parameter name plus 'return' for the return annotation.",
    optionExplanations: ["Correct.", "The triple-quoted string is the docstring.", "The return annotation is stored under 'return'.", "Annotation keys are the parameter names."]
  }
);
