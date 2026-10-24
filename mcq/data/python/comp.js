/* Python — Comprehensions & Generator Expressions */
window.QUESTIONS.push(
  {
    id: "py-comp-001", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print([x * 2 for x in range(4)])",
    options: ["[2, 4, 6, 8]", "[0, 2, 4, 6, 8]", "[0, 1, 2, 3]", "[0, 2, 4, 6]"],
    answer: 3,
    explanation: "A list comprehension applies the expression to each item of the iterable. range(4) yields 0, 1, 2, 3, so doubling them gives [0, 2, 4, 6]. It's equivalent to a for loop that appends to a new list.",
    optionExplanations: ["range(4) starts at 0, not 1.", "range(4) stops before 4, so there are only four items.", "The expression x * 2 doubles each item.", "Correct."]
  },
  {
    id: "py-comp-002", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print([x for x in range(10) if x % 3 == 0])",
    options: ["[0, 3, 6, 9]", "[3, 6, 9]", "[1, 2, 4, 5, 7, 8]", "[0, 3, 6]"],
    answer: 0,
    explanation: "A trailing `if` in a comprehension is a FILTER: only items for which the condition is true are kept. 0, 3, 6 and 9 are divisible by 3 (0 % 3 == 0).",
    optionExplanations: ["Correct.", "0 % 3 is 0, so 0 is included.", "These are the items NOT divisible by 3.", "9 is less than 10, so it's included."]
  },
  {
    id: "py-comp-003", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print({x % 3 for x in range(10)})",
    options: ["[0, 1, 2]", "{0, 1, 2, 0, 1, 2, 0, 1, 2, 0}", "{0: 0, 1: 1, 2: 2}", "{0, 1, 2}"],
    answer: 3,
    explanation: "Curly braces with a single expression make a SET comprehension, which automatically removes duplicates. The remainders mod 3 are only ever 0, 1 or 2.",
    optionExplanations: ["Braces create a set, not a list.", "Sets cannot contain duplicates.", "A dict comprehension needs key: value pairs.", "Correct."]
  },
  {
    id: "py-comp-004", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print({k: len(k) for k in ['a', 'bb', 'ccc']})",
    options: ["{'a': 1, 'bb': 2, 'ccc': 3}", "{1: 'a', 2: 'bb', 3: 'ccc'}", "[('a', 1), ('bb', 2), ('ccc', 3)]", "{'a', 'bb', 'ccc'}"],
    answer: 0,
    explanation: "A dict comprehension uses `{key_expr: value_expr for ...}`. Here each word becomes a key and its length the value.",
    optionExplanations: ["Correct.", "The key expression is k and the value is len(k), not the other way round.", "Braces with key: value build a dict, not a list of tuples.", "The colon makes it a dict, not a set."]
  },
  {
    id: "py-comp-005", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "g = (x for x in range(3))\nprint(type(g).__name__)",
    options: ["tuple", "list", "range", "generator"],
    answer: 3,
    explanation: "Parentheses around a comprehension-style expression create a GENERATOR EXPRESSION, not a tuple. It produces values lazily, one at a time, when iterated. Python has no tuple comprehension; use `tuple(x for x in ...)`.",
    optionExplanations: ["There is no tuple comprehension syntax.", "Square brackets would make a list.", "It wraps a range but is itself a generator.", "Correct."]
  },
  {
    id: "py-comp-006", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(['even' if x % 2 == 0 else 'odd' for x in range(3)])",
    options: ["['even', 'even']", "['even', 'odd', 'even']", "['odd', 'even', 'odd']", "SyntaxError"],
    answer: 1,
    explanation: "A conditional expression `A if cond else B` placed BEFORE the `for` transforms every item (it doesn't filter). 0 → 'even', 1 → 'odd', 2 → 'even'.",
    optionExplanations: ["Nothing is filtered out; every item is mapped.", "Correct.", "0 is even.", "A full if/else expression before `for` is valid."]
  },
  {
    id: "py-comp-007", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(len([x for x in range(5) if x > 10]), [c for c in 'hello' if c not in 'aeiou'])",
    options: ["0 ['h', 'l', 'l']", "5 ['h', 'l', 'l']", "0 ['h', 'l']", "None ['h', 'l', 'l']"],
    answer: 0,
    explanation: "When no item passes the filter, the comprehension produces an empty list (length 0), never None. Iterating over a string yields characters, and both 'l's pass the consonant filter.",
    optionExplanations: ["Correct.", "No value in range(5) is greater than 10.", "Duplicates are kept in a list comprehension.", "An empty list has length 0."]
  },
  {
    id: "py-comp-008", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "m = [[1, 2], [3], [4, 5]]\nprint([x for row in m for x in row])",
    options: ["[1, 2, 3, 4, 5]", "[[1, 2], [3], [4, 5]]", "[1, 3, 4]", "NameError"],
    answer: 0,
    explanation: "Multiple `for` clauses nest in the same order you'd write the loops: the first `for` is the outer loop, the second is the inner loop. This flattens one level of nesting.",
    optionExplanations: ["Correct: outer loop over rows, inner loop over elements.", "The inner loop iterates the elements of each row.", "All elements of each row are included.", "row is defined by the first (outer) for clause before it is used."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-comp-009", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print([(i, j) for i in range(3) for j in range(i)])",
    options: ["[(0, 0), (1, 0), (1, 1)]", "[(1, 0), (2, 0), (2, 1)]", "[(0, 1), (0, 2), (1, 2)]", "NameError"],
    answer: 1,
    explanation: "The outer loop runs i = 0, 1, 2; for each, the inner loop runs j over range(i). i = 0 → no j; i = 1 → j = 0; i = 2 → j = 0, 1. The inner clause can refer to the outer variable because it's nested inside it.",
    optionExplanations: ["range(i) excludes i, so (0, 0) and (1, 1) can't appear.", "Correct.", "The tuple order is (i, j) with j < i.", "The inner clause can use i from the outer clause."]
  },
  {
    id: "py-comp-010", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "m = [[1, 2, 3], [4, 5, 6]]\nprint([[r[i] for r in m] for i in range(3)])",
    options: ["[[1, 2, 3], [4, 5, 6]]", "[[1, 4], [2, 5], [3, 6]]", "[1, 4, 2, 5, 3, 6]", "IndexError"],
    answer: 1,
    explanation: "This is a NESTED comprehension (a comprehension inside the expression part), not two for clauses. For each column index i, the inner comprehension collects r[i] from every row, producing the transpose. `list(map(list, zip(*m)))` does the same.",
    optionExplanations: ["The outer loop is over columns, so the result is transposed.", "Correct: the transpose.", "The inner comprehension builds a list per column, so the result is nested.", "Each row has 3 elements, so indices 0-2 are valid."]
  },
  {
    id: "py-comp-011", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print({x % 2: x for x in range(5)})",
    options: ["{0: 0, 1: 1}", "{0: [0, 2, 4], 1: [1, 3]}", "{0: 4, 1: 3}", "{0: 0, 1: 1, 0: 2, 1: 3, 0: 4}"],
    answer: 2,
    explanation: "When a dict comprehension produces the same key more than once, later values overwrite earlier ones (like repeated assignment). The last even number is 4 and the last odd number is 3.",
    optionExplanations: ["The first values are overwritten by later ones.", "Dict comprehensions don't group values automatically.", "Correct: last write wins.", "A dict cannot contain duplicate keys."],
    tags: ["trap"]
  },
  {
    id: "py-comp-012", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "g = (x for x in range(3))\nprint(sum(g), sum(g))",
    options: ["3 3", "0 3", "3 0", "3 TypeError"],
    answer: 2,
    explanation: "A generator is a one-shot iterator: once it's exhausted, iterating again yields nothing. The first sum consumes 0 + 1 + 2 = 3; the second sum sees an empty iterator and returns its start value 0. Use a list if you need to iterate more than once.",
    optionExplanations: ["The generator can't be rewound.", "The first sum gets all the values.", "Correct: exhausted generators produce nothing.", "Iterating an exhausted generator is fine; it just yields nothing."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "py-comp-013", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output (Python 3)?",
    code: "x = 'outer'\ny = [x for x in range(3)]\nprint(x)",
    options: ["2", "outer", "[0, 1, 2]", "NameError"],
    answer: 1,
    explanation: "In Python 3, the loop variable of a comprehension is local to the comprehension; it does not leak into the enclosing scope (it did for list comprehensions in Python 2). So x is still 'outer'. A regular for loop, by contrast, does leave its variable bound.",
    optionExplanations: ["That was Python 2's behaviour (the variable leaked).", "Correct.", "y holds the list; x is untouched.", "x is still bound to 'outer'."]
  },
  {
    id: "py-comp-014", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "concept",
    question: "Which of these comprehensions is a SyntaxError?",
    options: ["`[x for x in range(5) if x > 1]`", "`[x if x > 1 else 0 for x in range(5)]`", "`[x if x > 1 for x in range(5)]`", "`[x for x in range(5) if x > 1 if x < 4]`"],
    answer: 2,
    explanation: "A filter goes AFTER the for clause and has no else. A conditional expression goes BEFORE the for and must have both if and else. `x if x > 1 for ...` is an incomplete conditional expression, so it's a SyntaxError. Multiple trailing ifs are allowed (they're ANDed).",
    optionExplanations: ["Valid: a trailing filter.", "Valid: a complete conditional expression.", "Correct: a conditional expression needs an else.", "Valid: several filters are allowed."]
  },
  {
    id: "py-comp-015", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "concept",
    question: "You need the sum of squares of the first 100 million integers. Why is `sum(x*x for x in range(10**8))` preferable to `sum([x*x for x in range(10**8)])`?",
    options: ["The generator version computes a different (more accurate) result", "The generator expression produces values lazily, using O(1) extra memory instead of building a 100-million-element list", "List comprehensions cannot be passed to sum()", "Generator expressions run in parallel on multiple cores"],
    answer: 1,
    explanation: "A list comprehension materialises every element in memory before sum() starts (hundreds of MB here). A generator expression yields one value at a time, so memory stays constant. The result is identical. Generators don't add parallelism.",
    optionExplanations: ["Both produce exactly the same integer.", "Correct: lazy evaluation saves memory.", "sum() accepts any iterable, including lists.", "Generators run in a single thread, one item at a time."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-comp-016", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f(x):\n    print(x, end=' ')\n    return x > 1\n\nprint(any(f(x) for x in [0, 2, 5]))",
    options: ["0 2 5 True", "0 True", "True", "0 2 True"],
    answer: 3,
    explanation: "`any()` stops at the first truthy value. With a generator expression, items are produced on demand, so f is called for 0 (False) and 2 (True), then any() returns immediately and f(5) is never called.",
    optionExplanations: ["That's what a list comprehension would do, since it evaluates everything first.", "f(0) returns False, so any() must continue to 2.", "f prints each value it is called with.", "Correct: lazy evaluation lets any() short-circuit."],
    tags: ["trap"]
  },
  {
    id: "py-comp-017", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f(x):\n    print(x, end=' ')\n    return x > 1\n\nprint(any([f(x) for x in [0, 2, 5]]))",
    options: ["0 2 True", "True", "0 2 5 False", "0 2 5 True"],
    answer: 3,
    explanation: "The square brackets build the whole list FIRST, calling f on every element (printing 0 2 5). Only then does any() scan the list of booleans. Passing a generator expression instead would let any() short-circuit.",
    optionExplanations: ["The list comprehension evaluates all elements before any() runs.", "f prints as a side effect.", "f(2) and f(5) return True, so any() is True.", "Correct."]
  },
  {
    id: "py-comp-018", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output (Python 3.8+)?",
    code: "res = [y for x in range(5) if (y := x * x) > 5]\nprint(res, y)",
    options: ["[9, 16] NameError", "[3, 4] 16", "[9, 16] 16", "[9, 16] 4"],
    answer: 2,
    explanation: "The walrus operator `:=` assigns inside the expression, letting you compute x*x once and reuse it. Unlike the loop variable, a name bound with := inside a comprehension is bound in the CONTAINING scope, so y is still available afterwards with its last value, 16.",
    optionExplanations: ["Walrus targets in comprehensions leak to the enclosing scope by design.", "The kept values are the squares (y), not x.", "Correct.", "y holds the last computed square, 4 * 4 = 16."]
  },
  {
    id: "py-comp-019", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(len({c.lower() for c in 'AaBbCa'}), sorted({c.lower() for c in 'AaBbCa'}))",
    options: ["3 ['a', 'b', 'c']", "6 ['a', 'a', 'b', 'b', 'c', 'a']", "4 ['a', 'b', 'c', 'A']", "3 {'a', 'b', 'c'}"],
    answer: 0,
    explanation: "The set comprehension lowercases every character, then the set removes duplicates, leaving {'a', 'b', 'c'}. sorted() on a set returns a sorted LIST.",
    optionExplanations: ["Correct.", "A set keeps only unique values.", "All characters are lowercased before insertion.", "sorted() always returns a list."]
  },
  {
    id: "py-comp-020", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print([x for x in range(3) for y in range(2) if x != y])",
    options: ["[0, 1, 2, 2]", "[0, 1, 2]", "[1, 0, 2, 2]", "[(0, 1), (1, 0), (2, 0), (2, 1)]"],
    answer: 0,
    explanation: "The filter applies to each (x, y) combination, and the expression x is emitted once per surviving pair. x = 0: y = 1 passes → 0. x = 1: y = 0 passes → 1. x = 2: y = 0 and y = 1 both pass → 2, 2.",
    optionExplanations: ["Correct.", "x = 2 is emitted twice because two y values pass.", "The outer loop runs x in order 0, 1, 2.", "The expression is x alone, not a tuple."]
  },
  {
    id: "py-comp-021", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "d = {'a': 1, 'b': 1, 'c': 2}\nprint({v: k for k, v in d.items()})",
    options: ["{1: 'a', 2: 'c'}", "{1: ['a', 'b'], 2: ['c']}", "{1: 'b', 2: 'c'}", "ValueError"],
    answer: 2,
    explanation: "Inverting a dict with a comprehension maps each value to its key. Values aren't unique here, so key 1 is written twice: first 'a', then 'b' overwrites it. Inversion silently loses data when values repeat.",
    optionExplanations: ["'b' is processed after 'a', so it overwrites.", "Values aren't grouped automatically.", "Correct.", "Duplicate keys just overwrite; nothing raises."]
  },
  {
    id: "py-comp-022", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print([x for x in range(20) if x % 2 if x % 3])",
    options: ["[1, 5, 7, 11, 13, 17, 19]", "[0, 6, 12, 18]", "SyntaxError", "[1, 3, 5, 7, 9, 11, 13, 15, 17, 19]"],
    answer: 0,
    explanation: "Multiple trailing `if` clauses are combined with AND. `x % 2` is truthy for odd x and `x % 3` is truthy when x is not a multiple of 3, so the result is odd numbers not divisible by 3.",
    optionExplanations: ["Correct.", "Those are the numbers where both remainders are 0 (falsy), the opposite.", "Chained if clauses are valid.", "Multiples of 3 (3, 9, 15) are excluded by the second filter."]
  },
  {
    id: "py-comp-023", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "concept",
    question: "Why is a list comprehension usually faster than an equivalent for loop that calls `result.append(x)`?",
    options: ["Comprehensions run on multiple threads", "Comprehensions skip type checking", "The comprehension uses a dedicated LIST_APPEND bytecode instead of looking up and calling the append method on each iteration", "Comprehensions are compiled to C extensions"],
    answer: 2,
    explanation: "In a loop, each `result.append(x)` performs an attribute lookup and a Python-level method call. A comprehension compiles to a tight loop with a specialised bytecode that appends directly. The speedup is modest (often 10-30%), and readability is the main reason to prefer comprehensions.",
    optionExplanations: ["Comprehensions are single-threaded.", "Python checks types dynamically either way.", "Correct.", "They compile to ordinary bytecode."]
  },
  {
    id: "py-comp-024", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "fs = [lambda: i for i in range(3)]\nprint([f() for f in fs])",
    options: ["[0, 1, 2]", "[2, 2, 2]", "[0, 0, 0]", "NameError"],
    answer: 1,
    explanation: "Each lambda captures the VARIABLE i, not its value at creation time (late binding). The lambdas run after the comprehension has finished, when i is 2, so all three return 2. Capture the value with a default argument: `lambda i=i: i`.",
    optionExplanations: ["That would require each lambda to capture the current value.", "Correct: closures look up i when called.", "i ends at 2, not 0.", "The closure keeps the comprehension's i alive, so it's found."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "py-comp-025", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "fs = [lambda i=i: i * 10 for i in range(3)]\nprint([f() for f in fs])",
    options: ["[20, 20, 20]", "[0, 0, 0]", "TypeError", "[0, 10, 20]"],
    answer: 3,
    explanation: "Default argument values are evaluated when the function is DEFINED. `i=i` copies the current value of the loop variable into each lambda's own parameter, so each lambda remembers a different i. This is the classic fix for late binding.",
    optionExplanations: ["Without the default this would happen; the default freezes each value.", "Each lambda gets a different default.", "Calling a lambda with all-default parameters needs no arguments.", "Correct."]
  },
  {
    id: "py-comp-026", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "hard", type: "code-output",
    question: "What happens when this code runs?",
    code: "class A:\n    x = 5\n    y = [x for _ in range(2)]\n\nprint(A.y)",
    options: ["It raises NameError", "It prints [5, 5]", "It prints [0, 1]", "It prints []"],
    answer: 0,
    explanation: "A class body is not an enclosing scope for nested functions, and a comprehension's body behaves like a nested function. Names defined in the class body (like x) are not visible inside the comprehension's expression, so `x` raises NameError. Only the outermost iterable (`range(2)`) is evaluated in the class scope.",
    optionExplanations: ["Correct: class scope is skipped by nested scopes.", "Class-level names are not visible inside the comprehension body.", "The expression is x, not the loop variable.", "The error occurs before any list is built."],
    tags: ["trap"]
  },
  {
    id: "py-comp-027", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "arr = [1, 2, 3]\ng = (x for x in arr if x in arr)\narr = [2, 3, 4]\nprint(list(g))",
    options: ["[1, 2, 3]", "[2, 3, 4]", "[2, 3]", "[]"],
    answer: 2,
    explanation: "In a generator expression, the OUTERMOST iterable (`arr` after `in` in the first for) is evaluated immediately when the generator is created, binding the original list [1, 2, 3]. Everything else, including the `if x in arr` condition, is evaluated lazily, when list(g) runs — by then arr refers to [2, 3, 4]. So only 2 and 3 pass.",
    optionExplanations: ["The condition uses the NEW arr, which excludes 1.", "The iteration source was fixed when the generator was created.", "Correct: early-bound source, late-bound condition.", "2 and 3 are in both lists."],
    tags: ["trap"]
  },
  {
    id: "py-comp-028", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "m = [[0] * 2 for _ in range(2)]\nm[0][0] = 1\nprint(m)",
    options: ["[[1, 0], [1, 0]]", "[[1, 1], [0, 0]]", "[[1, 0], [0, 0]]", "[[1, 1], [1, 1]]"],
    answer: 2,
    explanation: "The comprehension evaluates `[0] * 2` once per iteration, creating a separate inner list for each row. So changing one row doesn't affect the others — unlike `[[0] * 2] * 2`, which repeats a reference to the same row.",
    optionExplanations: ["That's the aliasing result of [[0] * 2] * 2.", "Only index 0 of row 0 is set.", "Correct: each row is an independent list.", "Only one element is assigned."]
  },
  {
    id: "py-comp-029", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "g = (x for x in range(5))\nprint(3 in g, list(g))",
    options: ["True [0, 1, 2, 3, 4]", "True []", "True [4]", "False [0, 1, 2, 3, 4]"],
    answer: 2,
    explanation: "The `in` operator on an iterator consumes items until it finds a match. It reads 0, 1, 2, 3 and stops at 3, returning True. Those items are gone, so list(g) only gets the remaining 4.",
    optionExplanations: ["The membership test consumed 0-3.", "Membership stops as soon as it finds 3, leaving 4.", "Correct.", "3 is produced by the generator, so it's found."],
    tags: ["trap"]
  },
  {
    id: "py-comp-030", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print(sum(x * y for x in range(3) for y in range(3) if x < y))",
    options: ["2", "3", "8", "0"],
    answer: 0,
    explanation: "The pairs with x < y are (0, 1), (0, 2) and (1, 2). Their products are 0, 0 and 2, which sum to 2. The generator expression can be passed directly as the only argument to sum() without extra parentheses.",
    optionExplanations: ["Correct.", "Pairs with x = 0 contribute 0.", "Only pairs with x < y are included.", "(1, 2) contributes 2."]
  },
  {
    id: "py-comp-031", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print([a + b for a, b in zip('ab', 'xyz')])",
    options: ["['ax', 'by', 'z']", "['ax', 'by']", "['abxyz']", "ValueError"],
    answer: 1,
    explanation: "`zip` pairs items positionally and stops at the SHORTEST input, so 'z' is dropped. Tuple unpacking in the for clause gives a and b for each pair.",
    optionExplanations: ["zip stops when the shorter iterable runs out.", "Correct.", "zip pairs characters one by one.", "zip doesn't require equal lengths unless strict=True."]
  },
  {
    id: "py-comp-032", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print({k: v for k, v in zip('aba', range(3))})",
    options: ["{'a': 0, 'b': 1}", "{'a': 0, 'b': 1, 'a': 2}", "{'a': [0, 2], 'b': [1]}", "{'a': 2, 'b': 1}"],
    answer: 3,
    explanation: "zip produces ('a', 0), ('b', 1), ('a', 2). Key 'a' is set to 0 and later overwritten by 2, while keeping its original insertion position (first).",
    optionExplanations: ["The later ('a', 2) overwrites 0.", "Dicts can't contain duplicate keys.", "Dict comprehensions don't collect lists.", "Correct."]
  },
  {
    id: "py-comp-033", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print([[j for j in range(i)] for i in range(4)])",
    options: ["[[0], [0, 1], [0, 1, 2], [0, 1, 2, 3]]", "[0, 0, 1, 0, 1, 2]", "[[0, 1, 2, 3]] * 4", "[[], [0], [0, 1], [0, 1, 2]]"],
    answer: 3,
    explanation: "The outer comprehension runs i = 0..3, and for each i the inner comprehension builds range(i) as a list. range(0) is empty, so the first inner list is [].",
    optionExplanations: ["range(i) stops before i.", "The inner comprehension makes a separate list per i, so it's nested.", "Each inner list depends on i.", "Correct."]
  },
  {
    id: "py-comp-034", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "data = [[1, 2], [3], [4, 5]]\nprint([y for x in data if len(x) > 1 for y in x if y % 2])",
    options: ["[1, 3, 5]", "[1, 5]", "[2, 4]", "[1, 2, 4, 5]"],
    answer: 1,
    explanation: "Each `if` filters the loop that comes before it. `if len(x) > 1` skips the row [3]; `if y % 2` keeps odd elements of the remaining rows [1, 2] and [4, 5], giving 1 and 5.",
    optionExplanations: ["The row [3] is excluded by the first filter.", "Correct.", "y % 2 keeps odd numbers, not even ones.", "The second filter removes even numbers."]
  },
  {
    id: "py-comp-035", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "hard", type: "concept",
    question: "Which call is a SyntaxError?",
    options: ["`sum(x for x in range(5))`", "`sorted((x for x in range(5)), reverse=True)`", "`max(x for x in range(5))`", "`sorted(x for x in range(5), reverse=True)`"],
    answer: 3,
    explanation: "A bare generator expression can be passed without extra parentheses ONLY if it's the sole argument. With any other argument, it must be wrapped in its own parentheses, otherwise Python reports 'Generator expression must be parenthesized'.",
    optionExplanations: ["Valid: the genexpr is the only argument.", "Valid: the genexpr has its own parentheses.", "Valid: sole argument.", "Correct: a second argument requires parenthesising the genexpr."]
  },
  {
    id: "py-comp-036", subject: "python", subtopic: "Comprehensions & Generator Expressions", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "x = 10\ng = (x + i for i in range(3))\nx = 100\nprint(list(g))",
    options: ["[10, 11, 12]", "[100, 101, 102]", "[0, 1, 2]", "NameError"],
    answer: 1,
    explanation: "Only the outermost iterable (`range(3)`) is evaluated when the generator is created. The expression `x + i` is evaluated lazily for each item, when list(g) runs, so it uses the current x = 100.",
    optionExplanations: ["x is looked up during iteration, after it became 100.", "Correct: the expression is evaluated lazily.", "x is added to each value.", "x is a global and is found at iteration time."],
    tags: ["trap"]
  }
);
