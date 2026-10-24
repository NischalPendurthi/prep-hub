/* Python — Control Flow */
window.QUESTIONS.push(
  {
    id: "py-control-001", subject: "python", subtopic: "Control Flow", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "for i in range(3):\n    if i == 5:\n        break\nelse:\n    print('no break')",
    options: ["Nothing is printed", "no break is printed 3 times", "SyntaxError", "no break"],
    answer: 3,
    explanation: "A for loop's `else` block runs once, after the loop finishes normally, i.e. without hitting `break`. Since i never equals 5, the loop completes and 'no break' is printed once. Think of it as 'no-break'.",
    optionExplanations: ["The else block runs because no break occurred.", "The else block runs once, after the loop, not per iteration.", "for/else is valid Python syntax.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-control-002", subject: "python", subtopic: "Control Flow", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(list(range(2, 10, 3)), list(range(5, 0)))",
    options: ["[2, 5, 8] []", "[2, 5, 8, 11] []", "[2, 5, 8] [5, 4, 3, 2, 1]", "[3, 6, 9] []"],
    answer: 0,
    explanation: "range(start, stop, step) starts at start and adds step while the value stays below stop: 2, 5, 8 (11 ≥ 10 stops it). range(5, 0) uses the default step +1, and 5 is already ≥ 0, so it is empty; counting down needs a negative step.",
    optionExplanations: ["Correct.", "stop is exclusive and 11 > 10.", "A positive default step can't count down.", "range starts from start (2), not from step."]
  },
  {
    id: "py-control-003", subject: "python", subtopic: "Control Flow", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "for i in range(5):\n    if i == 3:\n        break\n    print(i, end=' ')",
    options: ["0 1 2 3", "3", "0 1 2 4", "0 1 2"],
    answer: 3,
    explanation: "`break` exits the loop immediately. When i reaches 3, the loop ends before printing, so only 0, 1 and 2 are printed.",
    optionExplanations: ["The print comes after the break check, so 3 is not printed.", "Values before 3 are printed.", "break ends the loop entirely; it does not skip one iteration.", "Correct."]
  },
  {
    id: "py-control-004", subject: "python", subtopic: "Control Flow", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "for i in range(5):\n    if i % 2:\n        continue\n    print(i, end=' ')",
    options: ["1 3", "0 1 2 3 4", "0 2 4", "0"],
    answer: 2,
    explanation: "`continue` skips the rest of the current iteration and moves to the next one. `i % 2` is truthy (1) for odd i, so odd numbers are skipped and even numbers are printed.",
    optionExplanations: ["Odd numbers are the ones skipped.", "continue prevents the odd numbers from being printed.", "Correct.", "continue doesn't end the loop; break would."]
  },
  {
    id: "py-control-005", subject: "python", subtopic: "Control Flow", difficulty: "easy", type: "concept",
    question: "What does the `pass` statement do?",
    options: ["Skips to the next loop iteration", "Exits the current function", "Nothing: it's a placeholder where a statement is syntactically required", "Raises a NotImplementedError"],
    answer: 2,
    explanation: "`pass` is a no-op. Python needs at least one statement in a block (function body, class body, if/loop body), so `pass` fills the gap when you have nothing to do yet. `continue` skips an iteration and `return` exits a function.",
    optionExplanations: ["That is `continue`.", "That is `return`.", "Correct.", "You'd have to raise that explicitly."]
  },
  {
    id: "py-control-006", subject: "python", subtopic: "Control Flow", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "n = 5\nwhile n > 0:\n    n -= 2\nprint(n)",
    options: ["1", "0", "-1", "Infinite loop"],
    answer: 2,
    explanation: "The condition is checked before each iteration: n goes 5 → 3 → 1 → -1. When n is -1 the condition `n > 0` fails and the loop ends.",
    optionExplanations: ["When n is 1 the condition is still true, so it runs once more.", "n never equals 0 because it decreases by 2 from an odd number.", "Correct.", "n keeps decreasing, so the condition eventually fails."]
  },
  {
    id: "py-control-007", subject: "python", subtopic: "Control Flow", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "for i, c in enumerate('ab', 1):\n    print(i, c, end=' ')",
    options: ["0 a 1 b", "1 a 2 b", "a 1 b 2", "(1, 'a') (2, 'b')"],
    answer: 1,
    explanation: "`enumerate(iterable, start)` yields (index, item) pairs, counting from `start` (default 0). With start=1 the indices are 1 and 2. Tuple unpacking in the for target splits each pair into i and c.",
    optionExplanations: ["start=1 makes counting begin at 1.", "Correct.", "enumerate yields (index, item), in that order.", "The pairs are unpacked into i and c, so separate values are printed."]
  },
  {
    id: "py-control-008", subject: "python", subtopic: "Control Flow", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "x = 15\nif x > 10:\n    print('A')\nelif x > 5:\n    print('B')\nelse:\n    print('C')",
    options: ["A", "A B", "B", "A B C"],
    answer: 0,
    explanation: "In an if/elif/else chain, conditions are tested top to bottom and ONLY the first true branch runs. x > 10 is true, so 'A' is printed and the rest of the chain is skipped, even though x > 5 is also true.",
    optionExplanations: ["Correct.", "elif branches are skipped once an earlier branch matches.", "The first condition is already true.", "Only one branch of the chain ever executes."]
  },
  {
    id: "py-control-009", subject: "python", subtopic: "Control Flow", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "x = 0\nprint('neg' if x < 0 else 'zero' if x == 0 else 'pos')",
    options: ["neg", "pos", "zero", "SyntaxError"],
    answer: 2,
    explanation: "Chained conditional expressions group to the right: `'neg' if x < 0 else ('zero' if x == 0 else 'pos')`. x < 0 is false, so the inner expression is evaluated, and x == 0 is true.",
    optionExplanations: ["x < 0 is false.", "The inner condition x == 0 matches first.", "Correct.", "Chaining conditional expressions is valid, if not always readable."]
  },
  {
    id: "py-control-010", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "for n in [1, 3, 5]:\n    if n % 2 == 0:\n        print('even found')\n        break\nelse:\n    print('all odd')",
    options: ["even found", "all odd", "Nothing is printed", "all odd is printed three times"],
    answer: 1,
    explanation: "This is the classic search pattern: `break` when found, and use `else` for the 'not found' case. No even number exists, so break never runs and the loop's else block prints 'all odd'.",
    optionExplanations: ["No element is even.", "Correct.", "The else block runs because no break happened.", "The else block executes at most once."]
  },
  {
    id: "py-control-011", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "i = 0\nwhile i < 3:\n    i += 1\nelse:\n    print('else', i)",
    options: ["else 3", "else 2", "Nothing is printed", "else 0"],
    answer: 0,
    explanation: "A while loop's `else` runs when the condition becomes false, i.e. when the loop ends without `break`. After i reaches 3, `i < 3` is false, so the else block runs with i = 3.",
    optionExplanations: ["Correct.", "i is incremented to 3 before the condition fails.", "The loop ends normally, so else runs.", "The else block runs after the loop, when i is 3."]
  },
  {
    id: "py-control-012", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "i = 0\nwhile True:\n    i += 1\n    if i == 2:\n        break\nelse:\n    print('x', end=' ')\nprint(i)",
    options: ["x 2", "2", "x 1", "Infinite loop"],
    answer: 1,
    explanation: "The loop exits through `break` when i is 2, so the else block is skipped. A `while True` loop can only end with break (or an exception/return), so its else block can never run.",
    optionExplanations: ["break skips the else block.", "Correct.", "i is 2 when the loop breaks, and else is skipped.", "break exits the loop."]
  },
  {
    id: "py-control-013", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "for i in range(3):\n    pass\nprint(i)",
    options: ["3", "2", "NameError", "None"],
    answer: 1,
    explanation: "Python has no block scope for loops: the loop variable remains bound after the loop, holding its last value. range(3) ends at 2, so i is 2 (not 3 — the loop never assigns the stop value).",
    optionExplanations: ["range(3) never produces 3.", "Correct: the variable keeps its last value.", "Loop variables are not scoped to the loop in Python.", "i holds the last value assigned by the loop."]
  },
  {
    id: "py-control-014", subject: "python", subtopic: "Control Flow", difficulty: "hard", type: "code-output",
    question: "What happens when this code runs (assume `item` has not been defined earlier)?",
    code: "for item in []:\n    pass\nprint(item)",
    options: ["It prints None", "It prints []", "It raises NameError", "It prints nothing"],
    answer: 2,
    explanation: "The loop variable is only bound when the loop executes its body at least once. With an empty iterable, the body never runs, so `item` is never assigned and referencing it raises NameError. Code that relies on the 'leaked' loop variable must handle the empty case.",
    optionExplanations: ["Python doesn't initialise loop variables to None.", "The loop variable takes items, not the iterable itself.", "Correct: the name was never bound.", "print(item) fails before anything is printed."],
    tags: ["trap"]
  },
  {
    id: "py-control-015", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "for i in range(3):\n    print(i, end=' ')\n    i = 10",
    options: ["0 10 10", "0", "Infinite loop", "0 1 2"],
    answer: 3,
    explanation: "On each iteration the for loop assigns the NEXT value from the iterator to i, discarding whatever you assigned inside the body. Reassigning the loop variable doesn't affect iteration, unlike a C-style for loop.",
    optionExplanations: ["The iterator overwrites i at the start of each iteration.", "Assigning to i doesn't terminate the loop.", "The iterator is independent of the variable i.", "Correct."]
  },
  {
    id: "py-control-016", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "n = 3\nfor i in range(n):\n    n = 10\n    print(i, end=' ')",
    options: ["0 1 2", "0 1 2 3 4 5 6 7 8 9", "0", "Infinite loop"],
    answer: 0,
    explanation: "`range(n)` is evaluated ONCE, when the loop starts, creating range(3). Rebinding n afterwards does not change that range object, so the loop runs exactly 3 times.",
    optionExplanations: ["Correct.", "The range was created when n was 3.", "The loop isn't affected by n changing.", "range(3) is finite and fixed."]
  },
  {
    id: "py-control-017", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output (Python 3.8+)?",
    code: "data = iter([3, 4, 0, 5])\ntotal = 0\nwhile (x := next(data, 0)):\n    total += x\nprint(total)",
    options: ["12", "3", "0", "7"],
    answer: 3,
    explanation: "The walrus operator assigns and returns the value in one expression, so the loop fetches the next item and tests it at the same time. It adds 3 and 4, then receives 0, which is falsy, so the loop stops before reaching 5.",
    optionExplanations: ["The 0 ends the loop before 5 is read.", "4 is also added before the loop stops.", "3 and 4 are added before the falsy 0 arrives.", "Correct."]
  },
  {
    id: "py-control-018", subject: "python", subtopic: "Control Flow", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "if n := len('abcd') > 2:\n    print(n)",
    options: ["4", "True", "2", "SyntaxError"],
    answer: 1,
    explanation: "`:=` has the LOWEST precedence of the expression operators, lower than comparisons, so this parses as `n := (len('abcd') > 2)`, binding n to True. Write `(n := len('abcd')) > 2` to capture the length.",
    optionExplanations: ["The comparison is evaluated before the assignment.", "Correct: n is bound to the comparison result.", "n receives the comparison result, not 2.", "An unparenthesised walrus is allowed as an if condition."],
    tags: ["trap"]
  },
  {
    id: "py-control-019", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output (Python 3.10+)?",
    code: "command = 'halt'\nmatch command:\n    case 'go':\n        print('moving')\n    case 'stop' | 'halt':\n        print('stopping')\n    case _:\n        print('unknown')",
    options: ["moving", "unknown", "stopping", "stopping unknown"],
    answer: 2,
    explanation: "match compares the subject against each case in order and runs only the first that matches; there is no fall-through. `'stop' | 'halt'` is an OR pattern matching either literal. `_` is the wildcard that matches anything.",
    optionExplanations: ["'halt' doesn't match 'go'.", "An earlier case already matched; `_` is only a fallback.", "Correct.", "match never falls through to later cases."]
  },
  {
    id: "py-control-020", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output (Python 3.10+)?",
    code: "point = (0, 5)\nmatch point:\n    case (0, 0):\n        print('origin')\n    case (0, y):\n        print(f'on y-axis at {y}')\n    case (x, 0):\n        print(f'on x-axis at {x}')",
    options: ["origin", "Nothing is printed", "on x-axis at 0", "on y-axis at 5"],
    answer: 3,
    explanation: "Sequence patterns match by length and element. `(0, y)` requires the first element to equal 0 and CAPTURES the second element into the name y. (0, 5) fails the first case, matches the second, and binds y = 5.",
    optionExplanations: ["(0, 5) is not (0, 0).", "The second case matches.", "The y-axis case matches first, and the second element isn't 0 anyway.", "Correct."]
  },
  {
    id: "py-control-021", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output (Python 3.10+)?",
    code: "for v in (3, 7):\n    match v:\n        case n if n > 5:\n            print('big', n, end=' ')\n        case n:\n            print('small', n, end=' ')",
    options: ["big 3 big 7", "small 3 small 7", "small 3 big 7", "SyntaxError"],
    answer: 2,
    explanation: "A guard (`if` after the pattern) is checked after the pattern matches; if the guard is false, matching continues with the next case. For 3 the guard fails and the irrefutable `case n` catches it; for 7 the guard passes.",
    optionExplanations: ["The guard rejects 3.", "7 passes the guard.", "Correct.", "Guards and capture patterns are valid; an irrefutable case is allowed as the last case."]
  },
  {
    id: "py-control-022", subject: "python", subtopic: "Control Flow", difficulty: "hard", type: "code-output",
    question: "What is the output (Python 3.10+)?",
    code: "RED = 'red'\ncolor = 'blue'\nmatch color:\n    case RED:\n        print('matched', RED)",
    options: ["Nothing is printed", "matched red", "matched blue", "NameError"],
    answer: 2,
    explanation: "A bare name in a case pattern is a CAPTURE pattern, not a comparison with an existing variable: it matches anything and binds the subject to that name. So RED is rebound to 'blue'. To compare against a constant, use a dotted name (e.g. `Color.RED`) or a literal.",
    optionExplanations: ["A capture pattern always matches.", "RED was rebound to the subject 'blue'.", "Correct: the bare name captured the subject.", "Capturing just binds the name; nothing is looked up."],
    tags: ["trap"]
  },
  {
    id: "py-control-023", subject: "python", subtopic: "Control Flow", difficulty: "hard", type: "code-output",
    question: "What is the output (Python 3.10+)?",
    code: "shape = {'type': 'circle', 'r': 2, 'color': 'red'}\nmatch shape:\n    case {'type': 'square', 'side': s}:\n        print('square', s)\n    case {'type': 'circle', 'r': r}:\n        print('circle', r)\n    case _:\n        print('other')",
    options: ["square 2", "circle 2", "other", "TypeError"],
    answer: 1,
    explanation: "Mapping patterns check that the listed keys exist and their sub-patterns match; EXTRA keys in the subject are ignored. The 'circle' case matches and captures r = 2 even though 'color' is also present. (Use `**rest` to capture the extra keys.)",
    optionExplanations: ["'type' is 'circle', not 'square'.", "Correct.", "Extra keys don't prevent a mapping pattern match.", "Matching dicts is supported."]
  },
  {
    id: "py-control-024", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output (Python 3.10+)?",
    code: "match [1, 2, 3, 4]:\n    case [first, *rest]:\n        print(first, rest)",
    options: ["1 [2, 3, 4]", "1 (2, 3, 4)", "[1] [2, 3, 4]", "1 2"],
    answer: 0,
    explanation: "Sequence patterns support a single starred sub-pattern that captures the remaining elements as a list, just like extended unpacking.",
    optionExplanations: ["Correct.", "The starred capture is always a list.", "first captures a single element.", "*rest absorbs all remaining elements."]
  },
  {
    id: "py-control-025", subject: "python", subtopic: "Control Flow", difficulty: "hard", type: "code-output",
    question: "What is the output (Python 3.10+)?",
    code: "from dataclasses import dataclass\n\n@dataclass\nclass P:\n    x: int\n    y: int\n\nmatch P(1, 2):\n    case P(0, y):\n        print('A', y)\n    case P(x=1, y=yy):\n        print('B', yy)",
    options: ["A 2", "B 2", "B 1", "TypeError"],
    answer: 1,
    explanation: "Class patterns check isinstance and then match attributes. Positional sub-patterns use `__match_args__`, which dataclasses generate automatically (('x', 'y')). P(0, y) fails because x is 1; P(x=1, y=yy) matches by keyword and binds yy = 2.",
    optionExplanations: ["x is 1, so P(0, y) fails.", "Correct.", "yy captures the y attribute, which is 2.", "Dataclasses support positional class patterns via __match_args__."]
  },
  {
    id: "py-control-026", subject: "python", subtopic: "Control Flow", difficulty: "hard", type: "code-output",
    question: "What is the output (Python 3.10+)?",
    code: "match 'ab':\n    case [a, b]:\n        print('sequence', a, b)\n    case str():\n        print('string')",
    options: ["sequence a b", "TypeError", "Nothing is printed", "string"],
    answer: 3,
    explanation: "Although strings are sequences, sequence patterns deliberately do NOT match str, bytes or bytearray, to avoid surprising character-by-character matches. The class pattern `str()` matches any str instance.",
    optionExplanations: ["Sequence patterns exclude strings by design.", "No error occurs.", "The second case matches.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-control-027", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "for i in range(3):\n    for j in range(3):\n        if j == 1:\n            break\n        print(i, j, end='; ')",
    options: ["0 0;", "0 0; 1 0; 2 0;", "0 0; 0 1; 0 2;", "0 0; 1 1; 2 2;"],
    answer: 1,
    explanation: "`break` only exits the innermost loop. For every i, the inner loop prints (i, 0) and then breaks at j = 1, after which the outer loop continues with the next i.",
    optionExplanations: ["break does not exit the outer loop.", "Correct.", "The inner loop breaks at j = 1 every time.", "j never gets past 0 before the break."]
  },
  {
    id: "py-control-028", subject: "python", subtopic: "Control Flow", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "for i in range(3):\n    try:\n        if i == 1:\n            break\n    finally:\n        print('f', i, end=' ')",
    options: ["f 0", "f 0 f 1 f 2", "f 0 f 1", "f 1"],
    answer: 2,
    explanation: "A `finally` block runs whenever control leaves the try block, including via `break`, `continue` or `return`. Iteration 0 prints 'f 0'; iteration 1 hits break, but finally still runs and prints 'f 1' before the loop exits.",
    optionExplanations: ["finally also runs when break leaves the try block.", "The loop exits at i = 1, so i = 2 never happens.", "Correct.", "Iteration 0 also runs finally."]
  },
  {
    id: "py-control-029", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f():\n    for i in range(3):\n        if i == 1:\n            return 'loop'\n    else:\n        return 'else'\n\nprint(f())",
    options: ["else", "loop", "None", "loop else"],
    answer: 1,
    explanation: "Like break, a `return` inside the loop leaves it abruptly, so the loop's else clause is skipped. The function returns 'loop' when i is 1.",
    optionExplanations: ["The else clause only runs on normal loop completion.", "Correct.", "The function returns before falling off the end.", "A function returns only once."]
  },
  {
    id: "py-control-030", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "x = 0\nprint(x != 0 and 10 / x > 1, x == 0 or 10 / x)",
    options: ["False True", "ZeroDivisionError", "False 10.0", "True True"],
    answer: 0,
    explanation: "`and` stops at the first falsy operand and `or` stops at the first truthy one, so `10 / x` is never evaluated in either expression. This short-circuiting is the standard guard pattern against division by zero or None access.",
    optionExplanations: ["Correct.", "Short-circuiting prevents the division from running.", "`x == 0` is True, so `or` returns True without evaluating 10 / x.", "x != 0 is False, so the first expression is False."]
  },
  {
    id: "py-control-031", subject: "python", subtopic: "Control Flow", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "a = [1]\nfor x in a:\n    if len(a) < 4:\n        a.append(x + 1)\nprint(a)",
    options: ["[1, 2]", "RuntimeError", "Infinite loop", "[1, 2, 3, 4]"],
    answer: 3,
    explanation: "A list iterator checks the current length on each step, so elements appended during iteration ARE visited. The loop appends 2, 3, 4 while len < 4, then visits 4 without appending and stops. Without the length guard this would loop forever.",
    optionExplanations: ["The newly appended elements are also iterated.", "Lists don't raise on modification during iteration.", "The len(a) < 4 guard stops the growth.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-control-032", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "r = range(0, 10, 3)\nprint(len(r), r[-1], 9 in r, list(range(10, 0, -3)))",
    options: ["4 9 True [10, 7, 4, 1]", "3 9 True [10, 7, 4]", "4 9 False [10, 7, 4, 1]", "4 10 True [10, 7, 4, 1]"],
    answer: 0,
    explanation: "range(0, 10, 3) is 0, 3, 6, 9: four values, last is 9. range objects support len, indexing and O(1) membership tests computed arithmetically. With a negative step, values decrease while they stay above stop: 10, 7, 4, 1.",
    optionExplanations: ["Correct.", "9 < 10, so it's included, and 1 > 0 is included in the countdown.", "9 is in the range.", "Ranges never include stop; the last value is 9."]
  },
  {
    id: "py-control-033", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "for i, (a, b) in enumerate(zip('xy', [1, 2])):\n    print(i, a, b, end=' | ')",
    options: ["0 x 1 | 1 y 2 |", "0 ('x', 1) | 1 ('y', 2) |", "1 x 1 | 2 y 2 |", "ValueError"],
    answer: 0,
    explanation: "enumerate yields (index, item) where each item is a pair from zip. The target `i, (a, b)` uses nested unpacking to split both levels at once.",
    optionExplanations: ["Correct.", "The nested target unpacks the pair into a and b.", "enumerate starts counting at 0 by default.", "The shapes match, so unpacking works."]
  },
  {
    id: "py-control-034", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "i = 0\nwhile i < 3:\n    i += 1\n    if i == 2:\n        continue\n    print(i, end=' ')\nelse:\n    print('end')",
    options: ["1 2 3 end", "1 3", "1 3 end", "1 end"],
    answer: 2,
    explanation: "`continue` skips printing when i is 2 but doesn't count as a break, so the loop still ends normally when the condition fails and the else block runs.",
    optionExplanations: ["2 is skipped by continue.", "continue doesn't prevent the else block from running.", "Correct.", "continue only skips one iteration."]
  },
  {
    id: "py-control-035", subject: "python", subtopic: "Control Flow", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "for i in range(2):\n    for j in range(2):\n        break\n    else:\n        print('inner else')\nelse:\n    print('outer else')",
    options: ["inner else", "inner else outer else", "Nothing is printed", "outer else"],
    answer: 3,
    explanation: "Each else belongs to the loop at its indentation level. The inner loop always breaks, so 'inner else' never prints. The outer loop is never broken (break only exits the inner loop), so its else runs once at the end.",
    optionExplanations: ["The inner loop always breaks, skipping its else.", "The inner else never runs.", "The outer loop completes normally, so its else runs.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-control-036", subject: "python", subtopic: "Control Flow", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "x = 0.0\ncount = 0\nwhile x != 1.0:\n    x += 0.1\n    count += 1\n    if count > 20:\n        break\nprint(count)",
    options: ["10", "11", "20", "21"],
    answer: 3,
    explanation: "After ten additions of 0.1, floating-point rounding gives 0.9999999999999999, not 1.0, so the `!=` test never becomes false and the loop only stops via the safety break when count reaches 21. Loop conditions on floats should use `<` or a tolerance.",
    optionExplanations: ["Ten additions of 0.1 do not produce exactly 1.0.", "The loop doesn't stop on its own at all.", "The break fires when count > 20, i.e. at 21.", "Correct: equality with a float sum fails, so the safety break fires."],
    tags: ["trap"]
  },
  {
    id: "py-control-037", subject: "python", subtopic: "Control Flow", difficulty: "medium", type: "code-output",
    question: "What is the output (Python 3.10+)?",
    code: "match 3:\n    case 1 | 2 | 3 as n:\n        print('small', n)\n    case _:\n        print('large')",
    options: ["small 3", "large", "small 1 | 2 | 3", "SyntaxError"],
    answer: 0,
    explanation: "An AS pattern `pattern as name` binds the matched subject to a name, which is useful with OR patterns where you want to know which alternative matched.",
    optionExplanations: ["Correct.", "3 matches the first case.", "`as n` binds the subject value 3.", "OR patterns with `as` are valid."]
  },
  {
    id: "py-control-038", subject: "python", subtopic: "Control Flow", difficulty: "hard", type: "concept",
    question: "In a `match` statement, how do you compare the subject against the VALUE of an existing constant rather than capturing it?",
    options: ["Write the bare constant name, e.g. `case MAX:`", "Use a dotted name such as `case Config.MAX:` (or a literal, or a guard)", "Prefix the name with `$`, e.g. `case $MAX:`", "Wrap the name in quotes, e.g. `case 'MAX':`"],
    answer: 1,
    explanation: "Bare names are always capture patterns. Dotted names (attribute access like `Color.RED` or `module.CONST`) are treated as VALUE patterns and compared with `==`. Alternatives are a literal or a guard such as `case x if x == MAX`.",
    optionExplanations: ["A bare name captures (and rebinds) instead of comparing.", "Correct.", "Python has no $ syntax.", "That compares with the literal string 'MAX'."]
  }
);
