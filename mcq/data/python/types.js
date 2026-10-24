/* Python — Data Types & Object Model */
window.QUESTIONS.push(
  {
    id: "py-types-001", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "concept",
    question: "Which of these built-in types is mutable?",
    options: ["tuple", "str", "list", "frozenset"],
    answer: 2,
    explanation: "A mutable object can be changed in place after creation without changing its identity. `list` supports in-place operations like `append()` and item assignment, while `tuple`, `str` and `frozenset` are immutable: every 'change' creates a new object.",
    optionExplanations: ["Tuples are immutable; you cannot assign to t[0].", "Strings are immutable; methods like upper() return new strings.", "Correct: lists can be modified in place (append, item assignment, slicing).", "frozenset is the immutable (hashable) counterpart of set."]
  },
  {
    id: "py-types-002", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2, 3]\nb = a\nb += [4]\nprint(a, a is b)",
    options: ["[1, 2, 3, 4] True", "[1, 2, 3] False", "[1, 2, 3] True", "[1, 2, 3, 4] False"],
    answer: 0,
    explanation: "`b = a` makes both names refer to the same list object (aliasing). For lists, `+=` calls `__iadd__`, which extends the list in place and rebinds `b` to that same object. So `a` sees the change and `a is b` stays True.",
    optionExplanations: ["Correct: += mutates the shared list in place.", "Would be true only if += created a new list, as it does for tuples.", "a is b is True but a was mutated, so it prints [1, 2, 3, 4].", "The identity never changes because += on a list is in-place."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-types-003", subject: "python", subtopic: "Data Types & Object Model", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "t = (1, [2, 3])\ntry:\n    t[1] += [4]\nexcept TypeError:\n    print('error', end=' ')\nprint(t)",
    options: ["(1, [2, 3])", "error (1, [2, 3])", "(1, [2, 3, 4])", "error (1, [2, 3, 4])"],
    answer: 3,
    explanation: "`t[1] += [4]` runs in two steps: first `t[1].__iadd__([4])` extends the inner list in place (succeeds), then Python tries to store the result back with `t[1] = ...`, which fails because tuples don't support item assignment. So a TypeError is raised, but the list was already mutated.",
    optionExplanations: ["The in-place extend happens before the failing assignment, and the TypeError is printed.", "The list is mutated before the assignment step fails.", "The assignment back into the tuple raises TypeError, so 'error' is printed.", "Correct: the mutation succeeds, then the tuple item assignment raises TypeError."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "py-types-004", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "concept",
    question: "What does the built-in `id(obj)` return?",
    options: ["An integer identity that is unique among objects alive at the same time", "The object's hash value", "The name of the variable that refers to the object", "A counter of how many objects were created before it"],
    answer: 0,
    explanation: "Every Python object has an identity, a type and a value. `id()` returns the identity: an integer guaranteed unique and constant for the object's lifetime (in CPython it is the memory address). Two objects with non-overlapping lifetimes may get the same id.",
    optionExplanations: ["Correct: identity is unique and constant during the object's lifetime.", "hash() is a different function; mutable objects like lists have no hash but still have an id.", "Objects don't know which names refer to them; many names can refer to one object.", "ids are not sequential counters; in CPython they are memory addresses."]
  },
  {
    id: "py-types-005", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "concept",
    question: "What is the difference between `is` and `==`?",
    options: ["`is` compares values, `==` compares identity", "They are interchangeable for all built-in types", "`is` checks whether two names refer to the same object; `==` checks whether values are equal", "`is` works only with numbers, `==` works with all types"],
    answer: 2,
    explanation: "`a is b` is True only when both names are bound to the very same object (same id). `a == b` calls `__eq__` and compares values. Two separate lists `[1] == [1]` are equal but `[1] is [1]` is False. Use `is` only for singletons such as `None`.",
    optionExplanations: ["It's the other way round.", "Equal values can live in distinct objects, so the results can differ.", "Correct: identity versus value equality.", "`is` works on any objects; it just compares identity."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-types-006", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(type(7 / 7), 7 // 2)",
    options: ["<class 'int'> 3", "<class 'float'> 3", "<class 'float'> 3.5", "<class 'int'> 3.5"],
    answer: 1,
    explanation: "In Python 3, `/` is true division and always returns a float, even when the result is a whole number (7 / 7 is 1.0). `//` is floor division; with two ints it returns an int, so 7 // 2 is 3.",
    optionExplanations: ["`/` never returns an int in Python 3.", "Correct: true division gives float, floor division of ints gives int.", "7 // 2 floors the result to 3; it does not give 3.5.", "Both parts are wrong: / returns float and // gives 3."]
  },
  {
    id: "py-types-007", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(bool([]), bool([0]), bool('0'))",
    options: ["False False False", "False True False", "True True True", "False True True"],
    answer: 3,
    explanation: "Empty containers, `0`, `0.0`, `''` and `None` are falsy. `[0]` is a non-empty list (it contains one element), so it is truthy. `'0'` is a non-empty string, so it is truthy too: truthiness looks at emptiness, not at what the content means.",
    optionExplanations: ["[0] and '0' are non-empty, hence truthy.", "'0' is a non-empty string, so bool('0') is True.", "An empty list is falsy.", "Correct: only the empty list is falsy here."],
    tags: ["trap"]
  },
  {
    id: "py-types-008", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "code-output",
    question: "What happens when this code runs?",
    code: "print('3' + 4)",
    options: ["It prints 34", "It prints 7", "It raises TypeError", "It prints '34'"],
    answer: 2,
    explanation: "Python is dynamically typed (types are checked at runtime, names have no declared type) but strongly typed: it does not implicitly convert between unrelated types. Adding a str and an int raises `TypeError: can only concatenate str (not \"int\") to str`. Use `'3' + str(4)` or `int('3') + 4`.",
    optionExplanations: ["That is JavaScript's behaviour (implicit coercion); Python refuses.", "Python never silently converts the string to a number.", "Correct: str + int is a TypeError.", "No implicit coercion happens, so nothing is printed."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-types-009", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "concept",
    question: "What is the idiomatic way to check whether a variable `x` is None?",
    options: ["`x is None`", "`x == None`", "`not x`", "`type(x) == None`"],
    answer: 0,
    explanation: "`None` is a singleton: there is exactly one None object, so an identity check `x is None` is both correct and fast. `x == None` can be fooled by a class that overrides `__eq__`, and `not x` is also True for 0, '' and empty containers.",
    optionExplanations: ["Correct: identity check against the singleton.", "Works for most types but can be overridden by __eq__; PEP 8 recommends `is`.", "Also True for 0, '', [] and other falsy values.", "type(x) is NoneType, which is never equal to None."]
  },
  {
    id: "py-types-010", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "concept",
    question: "Which of these types is immutable?",
    options: ["dict", "set", "bytearray", "bytes"],
    answer: 3,
    explanation: "`bytes` is an immutable sequence of integers 0-255, like a byte-level `str`. Its mutable counterpart is `bytearray`. `dict` and `set` are mutable containers whose contents can change in place.",
    optionExplanations: ["Dicts can gain, lose or change keys in place.", "Sets support add() and remove().", "bytearray is the mutable version of bytes.", "Correct: bytes objects cannot be modified after creation."]
  },
  {
    id: "py-types-011", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(10 % 3, -10 % 3)",
    options: ["1 -1", "1 2", "1 1", "1 -2"],
    answer: 1,
    explanation: "Python's `%` result takes the sign of the divisor, consistent with floor division: `a == (a // b) * b + a % b`. For -10 // 3 the floor is -4, so -10 % 3 = -10 - (-4 * 3) = 2. C and Java would give -1 because they truncate toward zero.",
    optionExplanations: ["-1 is the C/Java answer (truncation toward zero).", "Correct: -10 // 3 is -4, so the remainder is 2.", "-10 % 3 is not 1.", "The result of % has the sign of the divisor (positive 3)."],
    tags: ["trap"]
  },
  {
    id: "py-types-012", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(2 ** 3 ** 2)",
    options: ["64", "512", "36", "4096"],
    answer: 1,
    explanation: "The power operator `**` is right-associative, so `2 ** 3 ** 2` is `2 ** (3 ** 2)` = 2 ** 9 = 512. Most other binary operators in Python are left-associative.",
    optionExplanations: ["64 would be (2 ** 3) ** 2, i.e. left-to-right evaluation.", "Correct: ** groups from the right.", "36 is (2 * 3) ** 2, unrelated.", "4096 is 2 ** 12, not this expression."]
  },
  {
    id: "py-types-013", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(True + True, isinstance(True, int))",
    options: ["2 True", "True True", "TrueTrue False", "1 False"],
    answer: 0,
    explanation: "`bool` is a subclass of `int`: True behaves like 1 and False like 0 in arithmetic. So True + True is 2, and `isinstance(True, int)` is True. This is why `sum(flags)` counts the True values in a list.",
    optionExplanations: ["Correct: bool inherits from int.", "Arithmetic on bools returns an int, not a bool.", "+ on bools is numeric addition, not concatenation.", "True is 1, so True + True is 2, and bool is an int subclass."]
  },
  {
    id: "py-types-014", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "concept",
    question: "What happens when a Python 3 `int` grows beyond 2^63 − 1?",
    options: ["It overflows and wraps around to a negative number", "It raises OverflowError", "It is automatically converted to float", "It keeps working exactly: Python ints have arbitrary precision"],
    answer: 3,
    explanation: "Python 3 has a single `int` type with arbitrary precision: it uses as many machine words as needed, limited only by memory. `2 ** 100` is computed exactly. Floats, by contrast, are 64-bit IEEE 754 doubles and can overflow to `inf` or raise OverflowError in some math functions.",
    optionExplanations: ["Wrap-around happens with fixed-width ints in C/Java, not Python.", "Integer arithmetic does not overflow; OverflowError arises from some float conversions.", "Python never silently converts int results to float.", "Correct: ints are unbounded."]
  },
  {
    id: "py-types-015", subject: "python", subtopic: "Data Types & Object Model", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "a = 10\nb = a\na += 1\nprint(a, b)",
    options: ["11 11", "10 10", "11 10", "10 11"],
    answer: 2,
    explanation: "Variables are names bound to objects. `b = a` binds b to the int 10. Ints are immutable, so `a += 1` cannot change 10 in place; it creates 11 and rebinds only `a`. `b` still refers to 10.",
    optionExplanations: ["That would need the int object itself to be mutated, which is impossible.", "a was rebound to 11.", "Correct: rebinding a does not affect b.", "b never changes."]
  },
  {
    id: "py-types-016", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(-7 // 2, -7 % 2, int(-7 / 2))",
    options: ["-3 -1 -3", "-4 1 -4", "-3 1 -3", "-4 1 -3"],
    answer: 3,
    explanation: "`//` floors toward negative infinity: -3.5 floors to -4. The remainder satisfies -7 == (-4)*2 + r, so r = 1. `int()` truncates toward zero, so int(-3.5) is -3. Floor division and int() truncation differ only for negative numbers.",
    optionExplanations: ["// does not truncate toward zero, and % follows the divisor's sign.", "int() truncates toward zero, giving -3, not -4.", "-7 // 2 is -4, not -3.", "Correct: floor -4, remainder 1, truncation -3."],
    tags: ["trap"]
  },
  {
    id: "py-types-017", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import math\nprint(0.1 + 0.2 == 0.3, math.isclose(0.1 + 0.2, 0.3))",
    options: ["True True", "False True", "False False", "True False"],
    answer: 1,
    explanation: "0.1 and 0.2 have no exact binary (IEEE 754) representation, so their sum is 0.30000000000000004, which is not equal to the double nearest to 0.3. Compare floats with a tolerance using `math.isclose`, or use `decimal.Decimal` / `fractions.Fraction` for exact decimal arithmetic.",
    optionExplanations: ["The direct comparison fails due to binary rounding error.", "Correct: exact equality fails, tolerance-based comparison succeeds.", "isclose uses a relative tolerance of 1e-09 and returns True here.", "isclose is the robust comparison and is True."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-types-018", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "x = 2\nprint(-x ** 2, (-x) ** 2)",
    options: ["4 4", "-4 -4", "-4 4", "4 -4"],
    answer: 2,
    explanation: "`**` binds more tightly than unary minus, so `-x ** 2` is `-(x ** 2)` = -4. Parenthesising the negation, `(-x) ** 2`, squares -2 to give 4.",
    optionExplanations: ["The unary minus is applied after exponentiation in the first expression.", "(-2) ** 2 is positive 4.", "Correct: ** has higher precedence than unary minus.", "The order is reversed."],
    tags: ["trap"]
  },
  {
    id: "py-types-019", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(0 or '' or [] or 'x', 5 and 0, [] and 1/0)",
    options: ["x 0 []", "True False False", "x 0 ZeroDivisionError", "True 0 []"],
    answer: 0,
    explanation: "`or` returns the first truthy operand (or the last operand if none is truthy); `and` returns the first falsy operand (or the last one if all are truthy). Both short-circuit: in `[] and 1/0`, `[]` is falsy so `1/0` is never evaluated and `[]` is returned.",
    optionExplanations: ["Correct: and/or return operands, not booleans, and short-circuit.", "and/or don't convert results to bool.", "1/0 is never evaluated because [] already decides the `and`.", "`or` returns the operand 'x', not True."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-types-020", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(round(2.5), round(3.5), round(0.5))",
    options: ["3 4 1", "2 3 0", "3 4 0", "2 4 0"],
    answer: 3,
    explanation: "Python's `round()` uses 'round half to even' (banker's rounding): exact .5 ties go to the nearest even integer. So 2.5 → 2, 3.5 → 4, 0.5 → 0. This reduces cumulative bias when rounding many values.",
    optionExplanations: ["That is 'round half up', which Python does not use.", "3.5 rounds to the even neighbour 4, not 3.", "2.5 rounds to 2 (even), not 3.", "Correct: ties round to the even integer."],
    tags: ["trap"]
  },
  {
    id: "py-types-021", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(int(3.9), int(-3.9), int(' 42 '))",
    options: ["4 -4 42", "3 -3 42", "3 -4 42", "3 -3 ValueError"],
    answer: 1,
    explanation: "`int()` on a float truncates toward zero (it does not round): 3.9 → 3 and -3.9 → -3. `int()` on a string accepts surrounding whitespace, so ' 42 ' parses to 42.",
    optionExplanations: ["int() truncates; it never rounds.", "Correct: truncation toward zero, and whitespace is stripped.", "Truncation of -3.9 goes toward zero, giving -3 (floor would give -4).", "Leading/trailing whitespace is allowed by int()."]
  },
  {
    id: "py-types-022", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "try:\n    print(int('3.5'))\nexcept ValueError:\n    print(int(float('3.5')))",
    options: ["3", "3.5", "4", "ValueError"],
    answer: 0,
    explanation: "`int('3.5')` raises ValueError: int() only parses strings that look like integers. The except block converts in two steps: float('3.5') is 3.5, and int(3.5) truncates to 3.",
    optionExplanations: ["Correct: the string must first become a float, then int() truncates.", "int() never returns a float.", "int() truncates instead of rounding.", "The ValueError is caught and handled, so a number is printed."]
  },
  {
    id: "py-types-023", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(isinstance(True, int), type(True) == int, type(True) is bool)",
    options: ["False False True", "True True True", "True False True", "True False False"],
    answer: 2,
    explanation: "`isinstance()` respects inheritance: bool subclasses int, so it returns True. `type()` returns the exact class, which is `bool`, so `type(True) == int` is False. Prefer isinstance for type checks because it works with subclasses.",
    optionExplanations: ["isinstance considers subclasses, so the first is True.", "type() gives the exact type bool, which is not equal to int.", "Correct: isinstance follows inheritance, type() does not.", "type(True) is exactly bool."]
  },
  {
    id: "py-types-024", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "concept",
    question: "Which of these can be used as a dictionary key?",
    options: ["[1, 2]", "(1, [2])", "(1, 2)", "{1, 2}"],
    answer: 2,
    explanation: "Dict keys must be hashable: their hash must never change during their lifetime, which in practice means immutable. A tuple is hashable only if all of its elements are hashable. `(1, 2)` qualifies; lists and sets are mutable and unhashable, and a tuple containing a list is unhashable too.",
    optionExplanations: ["Lists are mutable and unhashable.", "A tuple is hashable only if every element is; it contains a list.", "Correct: a tuple of ints is hashable.", "Sets are mutable and unhashable (frozenset would work)."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-types-025", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output in CPython?",
    code: "a = int('100'); b = int('100')\nc = int('1000'); d = int('1000')\nprint(a is b, c is d)",
    options: ["True True", "False False", "False True", "True False"],
    answer: 3,
    explanation: "CPython pre-allocates and caches the small integers -5 to 256, so any computation producing 100 returns the same cached object. 1000 is outside that range, so each `int('1000')` call builds a new object. This is an implementation detail: always compare numbers with `==`.",
    optionExplanations: ["1000 is outside the small-int cache, so two separate objects are created.", "100 is cached, so a and b are the same object.", "It is the other way round.", "Correct: only -5..256 are cached."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-types-026", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "s = 'ab'\nt = s\ns += 'c'\nprint(t, s, t is s)",
    options: ["abc abc True", "ab abc False", "ab abc True", "abc abc False"],
    answer: 1,
    explanation: "Strings are immutable, so `s += 'c'` cannot modify the existing object; it creates a new string 'abc' and rebinds `s`. `t` still refers to the original 'ab', and the two names now point to different objects. Contrast this with `+=` on a list, which mutates in place.",
    optionExplanations: ["t was never rebound and strings cannot be mutated.", "Correct: += on an immutable type rebinds the name to a new object.", "They are different objects after the rebinding.", "t still holds 'ab'."]
  },
  {
    id: "py-types-027", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(~5, 5 & 3, 5 | 3, 5 ^ 3)",
    options: ["-6 1 7 6", "-5 1 7 6", "4 1 7 6", "-6 1 7 2"],
    answer: 0,
    explanation: "With two's complement semantics, `~x == -x - 1`, so ~5 is -6. 5 is 101 and 3 is 011 in binary: AND = 001 (1), OR = 111 (7), XOR = 110 (6).",
    optionExplanations: ["Correct: ~5 = -6, 5&3 = 1, 5|3 = 7, 5^3 = 6.", "~x is -x - 1, not -x.", "~ is bitwise NOT, which flips the sign in two's complement.", "101 XOR 011 = 110, which is 6."]
  },
  {
    id: "py-types-028", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def double(x: int) -> int:\n    return x * 2\n\nprint(double('ab'))",
    options: ["TypeError", "4", "abab", "None"],
    answer: 2,
    explanation: "Type hints are annotations stored in `__annotations__`; the interpreter does not enforce them at runtime. 'ab' * 2 is string repetition, giving 'abab'. Static checkers like mypy would flag the call, but Python runs it.",
    optionExplanations: ["Annotations are not checked at runtime, so no error occurs.", "'ab' is not converted to a number.", "Correct: hints are ignored at runtime and str * int repeats.", "The function returns x * 2, not None."]
  },
  {
    id: "py-types-029", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "x = float('nan')\nprint(x == x, x != x, x in [x])",
    options: ["True False True", "False False False", "False True False", "False True True"],
    answer: 3,
    explanation: "IEEE 754 defines NaN as unequal to everything, including itself, so `x == x` is False and `x != x` is True. However, container membership (`in`) checks identity first (`is`), then equality, so `x in [x]` is True because it's the same object.",
    optionExplanations: ["NaN is never equal to itself.", "x != x is True for NaN, and membership finds the same object.", "Membership tests check identity before equality.", "Correct: NaN != NaN, but `in` uses an identity shortcut."],
    tags: ["trap"]
  },
  {
    id: "py-types-030", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(None == False, not None, bool(None) == False)",
    options: ["True True True", "False True True", "False False True", "True False False"],
    answer: 1,
    explanation: "`None` is falsy, so `not None` is True and `bool(None) == False` is True. But falsy is not the same as equal: `None == False` compares two different objects of different types, and NoneType's equality only matches None, so it is False.",
    optionExplanations: ["None is falsy but not equal to False.", "Correct: falsy, yet not equal to False.", "not None is True because None is falsy.", "Only the first comparison is False."]
  },
  {
    id: "py-types-031", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "x = [1, 2, 3]\ny = x\nx = x + [4]\nprint(y)",
    options: ["[1, 2, 3]", "[1, 2, 3, 4]", "[4]", "None"],
    answer: 0,
    explanation: "`x + [4]` builds a brand-new list and rebinds `x` to it; the original list (still referenced by `y`) is untouched. This differs from `x += [4]`, which mutates the list in place and would be visible through `y`.",
    optionExplanations: ["Correct: + creates a new list; y keeps the old one.", "That would happen with x += [4] or x.append(4), which mutate in place.", "y still refers to the full original list.", "y was assigned a list, not None."],
    tags: ["trap"]
  },
  {
    id: "py-types-032", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(type(1 + 2.0).__name__, type(True + 1).__name__, type(7 // 2.0).__name__)",
    options: ["float int float", "float int int", "float bool float", "int int float"],
    answer: 0,
    explanation: "Mixed arithmetic widens to the 'larger' numeric type: int + float gives float. bool + int gives int (bool is an int subclass, and arithmetic returns plain int). Floor division with a float operand returns a float (7 // 2.0 is 3.0).",
    optionExplanations: ["Correct: float, int, float.", "Floor division with a float operand yields a float.", "Arithmetic on bools returns int, not bool.", "int + float is promoted to float."]
  },
  {
    id: "py-types-033", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(bool('False'), bool(' '), bool(0j), bool(0.0))",
    options: ["False True False False", "True False False False", "True True False False", "True True True False"],
    answer: 2,
    explanation: "Any non-empty string is truthy regardless of its content, so 'False' and ' ' are both True. Numeric zero of any type is falsy: `0j` (complex zero) and `0.0` both evaluate to False.",
    optionExplanations: ["'False' is a non-empty string, so it's truthy.", "' ' contains a space, so it is non-empty and truthy.", "Correct: non-empty strings are truthy, numeric zeros are falsy.", "0j is a complex zero, which is falsy."],
    tags: ["trap"]
  },
  {
    id: "py-types-034", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "try:\n    print(hash((1, 2, [3])))\nexcept TypeError as e:\n    print(type(e).__name__)",
    options: ["A large integer", "TypeError", "0", "ValueError"],
    answer: 1,
    explanation: "Hashing a tuple hashes each element. The list `[3]` is unhashable (mutable), so `hash()` raises `TypeError: unhashable type: 'list'`. Immutability of the outer container is not enough; every element must be hashable.",
    optionExplanations: ["The tuple contains a list, so no hash can be computed.", "Correct: an unhashable element makes the tuple unhashable.", "hash() raises instead of returning a value.", "The exception type is TypeError, not ValueError."]
  },
  {
    id: "py-types-035", subject: "python", subtopic: "Data Types & Object Model", difficulty: "medium", type: "concept",
    question: "In CPython, why do you sometimes see `a is b` evaluate to True for two separately created small integers?",
    options: ["Because `is` falls back to `==` for numbers", "Because CPython caches integers from -5 to 256 and reuses those objects", "Because all integers are interned automatically", "Because the garbage collector merges equal objects"],
    answer: 1,
    explanation: "For performance, CPython pre-creates the small integers -5..256 at startup and returns those shared objects whenever such a value is produced. Larger ints are usually new objects. This is an implementation detail, so `is` must never be used for numeric comparison.",
    optionExplanations: ["`is` never falls back to value comparison.", "Correct: small-int caching makes identical values share one object.", "Only the small range is cached; large ints are typically distinct objects.", "The garbage collector frees objects; it never merges them."]
  },
  {
    id: "py-types-036", subject: "python", subtopic: "Data Types & Object Model", difficulty: "hard", type: "code-output",
    question: "What is the output in CPython?",
    code: "a = 'hello'\nb = 'hel' + 'lo'\nc = ''.join(['hel', 'lo'])\nprint(a is b, a is c, a == c)",
    options: ["True True True", "False False True", "True False True", "False True True"],
    answer: 2,
    explanation: "The compiler constant-folds `'hel' + 'lo'` into the literal 'hello', and identifier-like string literals are interned, so `a` and `b` share one object. `''.join(...)` builds a new string at runtime, which is not automatically interned, so `a is c` is False even though `a == c` is True.",
    optionExplanations: ["Strings built at runtime with join() are new objects.", "Constant folding plus interning makes a and b the same object.", "Correct: compile-time folding shares the object, runtime join does not.", "The constant-folded expression is the one that's shared, not the join."],
    tags: ["trap"]
  },
  {
    id: "py-types-037", subject: "python", subtopic: "Data Types & Object Model", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print(False == False in [False])",
    options: ["False", "True", "TypeError", "[True]"],
    answer: 1,
    explanation: "`==` and `in` are both comparison operators, so Python chains them: `a == b in c` means `(a == b) and (b in c)`. Here that is `(False == False) and (False in [False])` = True and True = True. It is NOT `(False == False) in [False]`, which would be `True in [False]` = False.",
    optionExplanations: ["That's what you get if you wrongly group it as (False == False) in [False].", "Correct: comparison chaining makes it (False == False) and (False in [False]).", "Comparisons between these values are valid.", "A comparison chain yields a bool, not a list."],
    tags: ["trap", "interview-favourite"]
  },
  {
    id: "py-types-038", subject: "python", subtopic: "Data Types & Object Model", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print(1 < 3 > 2, 3 > 2 > 1 == True, (3 > 2) > 1)",
    options: ["True True False", "False True False", "True False False", "True True True"],
    answer: 0,
    explanation: "Chained comparisons check each adjacent pair with `and`: `1 < 3 > 2` is `1 < 3 and 3 > 2` = True. `3 > 2 > 1 == True` is `3 > 2 and 2 > 1 and 1 == True` = True (True equals 1). With parentheses, `(3 > 2) > 1` is `True > 1`, i.e. `1 > 1` = False.",
    optionExplanations: ["Correct: chaining vs explicit grouping gives True, True, False.", "1 < 3 > 2 is a valid chain: 1 < 3 and 3 > 2.", "1 == True holds because True equals 1, so the chain is True.", "The parenthesised expression compares True (1) > 1, which is False."],
    tags: ["trap"]
  },
  {
    id: "py-types-039", subject: "python", subtopic: "Data Types & Object Model", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print(-17 // 5, -17 % 5, divmod(17, -5))",
    options: ["-3 -2 (-3, 2)", "-4 3 (-3, 2)", "-3 3 (-4, -3)", "-4 3 (-4, -3)"],
    answer: 3,
    explanation: "Floor division rounds toward negative infinity: -17/5 = -3.4 → -4, and the remainder r satisfies -17 = -4·5 + r, so r = 3. For divmod(17, -5): 17/-5 = -3.4 → -4, and 17 = (-4)(-5) + r gives r = -3. The remainder always takes the divisor's sign.",
    optionExplanations: ["These are C-style truncation results.", "divmod(17, -5) floors to -4, and its remainder is negative (divisor's sign).", "-17 // 5 floors to -4, not -3.", "Correct: floor -4 / remainder 3, and divmod gives (-4, -3)."],
    tags: ["trap"]
  },
  {
    id: "py-types-040", subject: "python", subtopic: "Data Types & Object Model", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print(1 if [] else 2 if {} else 3 if 0.0 else 4)",
    options: ["1", "2", "3", "4"],
    answer: 3,
    explanation: "Conditional expressions chain from left to right: `A if c1 else (B if c2 else (C if c3 else D))`. `[]`, `{}` and `0.0` are all falsy, so every condition fails and the final else value 4 is produced.",
    optionExplanations: ["[] is falsy, so 1 is skipped.", "{} (an empty dict) is falsy.", "0.0 is falsy.", "Correct: all three conditions are falsy."]
  },
  {
    id: "py-types-041", subject: "python", subtopic: "Data Types & Object Model", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "d = {}\nd[1] = 'int'\nd[1.0] = 'float'\nd[True] = 'bool'\nprint(len(d), d[1], type(list(d)[0]).__name__)",
    options: ["3 int int", "1 bool int", "1 bool bool", "1 int float"],
    answer: 1,
    explanation: "1, 1.0 and True are equal and have the same hash, so they are the same dict key. The first insertion stores key `1` (an int); later assignments find the existing key and only replace the value, keeping the original key object. So there is 1 key, its value is 'bool', and the key's type is still int.",
    optionExplanations: ["Equal values with equal hashes collapse into one key.", "Correct: one key (the original int 1) with the last value 'bool'.", "The key object is never replaced; only the value is.", "The value was overwritten twice; the last write was 'bool'."],
    tags: ["trap", "interview-favourite"]
  },
  {
    id: "py-types-042", subject: "python", subtopic: "Data Types & Object Model", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "n = 2 ** 53 + 1\nprint(float(n) == n, int(float(n)) == n - 1)",
    options: ["True True", "False False", "True False", "False True"],
    answer: 3,
    explanation: "A 64-bit float has a 53-bit significand, so 2^53 + 1 cannot be represented and rounds to 2^53. Python compares int and float exactly (not by converting the int to float), so `float(n) == n` is False. Converting back gives 2^53, which equals n - 1.",
    optionExplanations: ["Python's int/float comparison is exact, so precision loss shows up.", "int(float(n)) is exactly 2**53, i.e. n - 1.", "float(n) lost the +1, so it is not equal to n.", "Correct: precision is lost beyond 2**53."]
  },
  {
    id: "py-types-043", subject: "python", subtopic: "Data Types & Object Model", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "try:\n    print(None < 1)\nexcept TypeError:\n    print(sorted([3, 1, 2]) < [1, 2, 3, 0])",
    options: ["False", "True", "TypeError", "None"],
    answer: 1,
    explanation: "Python 3 has no default ordering between unrelated types, so `None < 1` raises TypeError (Python 2 allowed it). The except branch compares lists lexicographically: [1, 2, 3] vs [1, 2, 3, 0]; all shared elements are equal, and the shorter list is considered smaller, so the result is True.",
    optionExplanations: ["When the common prefix is equal, the shorter list is smaller, so it's True.", "Correct: the TypeError is caught and the prefix rule makes [1,2,3] < [1,2,3,0].", "The TypeError is caught by the except block.", "A comparison always returns a bool here."]
  },
  {
    id: "py-types-044", subject: "python", subtopic: "Data Types & Object Model", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print(sum([True, False, True, True]) * 2 ** -1)",
    options: ["1.5", "1", "3", "0.75"],
    answer: 0,
    explanation: "sum() treats True as 1 and False as 0, giving 3. `**` binds tighter than `*`, so `2 ** -1` = 0.5 is evaluated first (a negative exponent produces a float). 3 * 0.5 = 1.5.",
    optionExplanations: ["Correct: 3 * 0.5 = 1.5.", "A negative exponent gives a float, and the product is not 1.", "The multiplication by 0.5 halves the count.", "Only three Trues are summed (3), not 1.5."]
  },
  {
    id: "py-types-045", subject: "python", subtopic: "Data Types & Object Model", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print(0.1 * 3 == 0.3, round(0.1 * 3, 10) == 0.3, 0.5 + 0.25 == 0.75)",
    options: ["False False True", "True True True", "False True True", "False True False"],
    answer: 2,
    explanation: "0.1 is not exactly representable in binary, so 0.1 * 3 = 0.30000000000000004 ≠ 0.3. Rounding to 10 decimal places removes that error, so the second comparison is True. 0.5 and 0.25 are powers of two (1/2, 1/4), which are exactly representable, so their sum is exactly 0.75.",
    optionExplanations: ["round(..., 10) removes the representation error, making it equal to 0.3.", "0.1 * 3 is not exactly 0.3.", "Correct: only the first comparison suffers from representation error.", "Binary fractions like 0.5 and 0.25 add exactly."]
  },
  {
    id: "py-types-046", subject: "python", subtopic: "Data Types & Object Model", difficulty: "hard", type: "concept",
    question: "Which statement about Python's object model is FALSE?",
    options: ["Assignment never copies an object; it binds a name to an existing object", "Every object has an identity, a type and a value", "An immutable container can never contain a mutable object", "Functions, classes and modules are objects too"],
    answer: 2,
    explanation: "Immutability is shallow: a tuple's references can't change, but the objects they point to may be mutable, e.g. `(1, [2, 3])`. The other statements are core facts: assignment only binds names, every object has identity/type/value, and everything (functions, classes, modules) is a first-class object.",
    optionExplanations: ["True: `b = a` makes b refer to the same object.", "True: this is the definition of an object in Python's data model.", "Correct (this is false): a tuple can hold a list; the tuple's slots are fixed but the list can change.", "True: functions, classes and modules are first-class objects."]
  }
);
