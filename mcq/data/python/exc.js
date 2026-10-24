/* Python — Exceptions & Context Managers */
window.QUESTIONS.push(
  {
    id: "py-exc-001", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print('cannot divide')",
    options: ["inf", "ZeroDivisionError", "0", "cannot divide"],
    answer: 3,
    explanation: "Dividing by zero raises ZeroDivisionError. The except clause matching that type catches it, so the error message is replaced by the handler's output and the program continues.",
    optionExplanations: ["Python raises instead of returning infinity for int/float division by zero.", "The exception is caught by the handler.", "Division by zero is an error, not 0.", "Correct."]
  },
  {
    id: "py-exc-002", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "try:\n    x = 1\nexcept Exception:\n    print('except', end=' ')\nelse:\n    print('else', end=' ')\nfinally:\n    print('finally')",
    options: ["except finally", "finally", "else finally", "except else finally"],
    answer: 2,
    explanation: "The `else` block runs only if the try block completed WITHOUT an exception; `finally` always runs last. Putting code in else (instead of inside try) avoids accidentally catching exceptions it raises.",
    optionExplanations: ["No exception occurred, so except is skipped.", "else runs because no exception occurred.", "Correct.", "except and else are mutually exclusive."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-exc-003", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "easy", type: "concept",
    question: "Which exception does `[1, 2][5]` raise, and which does `{'a': 1}['b']` raise?",
    options: ["KeyError and IndexError", "IndexError and KeyError", "ValueError and KeyError", "IndexError and ValueError"],
    answer: 1,
    explanation: "Out-of-range sequence indexing raises IndexError; a missing mapping key raises KeyError. Both are subclasses of LookupError. Other common ones: ValueError (right type, bad value, e.g. int('abc')), TypeError (wrong type), AttributeError, NameError.",
    optionExplanations: ["The two are swapped.", "Correct.", "Indexing a list out of range is IndexError.", "A missing dict key raises KeyError."]
  },
  {
    id: "py-exc-004", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class InsufficientFunds(Exception):\n    pass\n\ntry:\n    raise InsufficientFunds('balance too low')\nexcept InsufficientFunds as e:\n    print(type(e).__name__, '-', e)",
    options: ["InsufficientFunds - balance too low", "Exception - balance too low", "InsufficientFunds - InsufficientFunds", "TypeError"],
    answer: 0,
    explanation: "Custom exceptions are created by subclassing Exception (directly or via a more specific base). The message passed to the constructor becomes str(e). Custom types let callers catch exactly the errors they can handle.",
    optionExplanations: ["Correct.", "type(e) is the custom subclass.", "str(e) is the message.", "Subclassing Exception is the standard pattern."]
  },
  {
    id: "py-exc-005", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "for s in ['5', 'x', None]:\n    try:\n        print(int(s), end=' ')\n    except (ValueError, TypeError) as e:\n        print(type(e).__name__, end=' ')",
    options: ["5 ValueError TypeError", "5 ValueError ValueError", "5 TypeError TypeError", "5 ValueError"],
    answer: 0,
    explanation: "A tuple of exception classes catches any of them. int('x') raises ValueError (right type, invalid content) while int(None) raises TypeError (wrong type entirely).",
    optionExplanations: ["Correct.", "int(None) is a TypeError, not a ValueError.", "int('x') is a ValueError.", "The loop continues after the first handled error."]
  },
  {
    id: "py-exc-006", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "try:\n    print('try', end=' ')\nfinally:\n    print('finally')",
    options: ["try", "finally", "try finally", "SyntaxError: try needs an except"],
    answer: 2,
    explanation: "A try statement can have just a `finally` clause (try/finally) — used for cleanup that must run whether or not an exception occurs. The finally block runs after the try block completes.",
    optionExplanations: ["finally always runs.", "The try body runs first.", "Correct.", "try/finally without except is valid."]
  },
  {
    id: "py-exc-007", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "easy", type: "concept",
    question: "Why is `with open('data.txt') as f: ...` preferred over calling `open()` and `f.close()` manually?",
    options: ["It reads the file faster", "It prevents other programs from opening the file", "The file is closed automatically when the block exits, even if an exception is raised", "It loads the whole file into memory"],
    answer: 2,
    explanation: "The with statement uses the context-manager protocol: `__enter__` on entry and `__exit__` on exit, whether the block ends normally, via return/break, or with an exception. File objects close themselves in __exit__, so resources never leak.",
    optionExplanations: ["Speed is unchanged.", "It doesn't lock the file.", "Correct.", "It doesn't change how the file is read."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-exc-008", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "try:\n    print(1, end=' ')\n    raise ValueError\n    print(2, end=' ')\nexcept ValueError:\n    print(3, end=' ')\nelse:\n    print(4, end=' ')\nfinally:\n    print(5)",
    options: ["1 3 5", "1 2 3 5", "1 3 4 5", "1 5"],
    answer: 0,
    explanation: "Execution leaves the try block at the raise, so 2 is skipped. The matching except runs (3). else is skipped because an exception occurred. finally always runs (5).",
    optionExplanations: ["Correct.", "Statements after the raise are skipped.", "else doesn't run when an exception occurred.", "The except handler runs."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-exc-009", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "try:\n    raise KeyError('k')\nexcept LookupError:\n    print('lookup')\nexcept KeyError:\n    print('key')",
    options: ["key", "lookup key", "lookup", "KeyError"],
    answer: 2,
    explanation: "except clauses are tested top to bottom and the first match wins. KeyError is a subclass of LookupError, so the broader handler catches it first and the KeyError clause is unreachable. Always list more specific exceptions first.",
    optionExplanations: ["The earlier, broader clause matches first.", "Only one handler runs.", "Correct.", "The exception is handled."],
    tags: ["trap"]
  },
  {
    id: "py-exc-010", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f():\n    try:\n        1 / 0\n    except ZeroDivisionError:\n        print('log', end=' ')\n        raise\n\ntry:\n    f()\nexcept ZeroDivisionError:\n    print('outer')",
    options: ["log", "outer", "log outer", "RuntimeError"],
    answer: 2,
    explanation: "A bare `raise` inside an except block re-raises the exception currently being handled, preserving its traceback. This pattern logs or cleans up locally and then lets the caller handle the error.",
    optionExplanations: ["The re-raised exception reaches the outer handler.", "The inner handler runs first.", "Correct.", "A bare raise inside except is valid."]
  },
  {
    id: "py-exc-011", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "try:\n    try:\n        {}['k']\n    except KeyError as e:\n        raise ValueError('bad config') from e\nexcept ValueError as e:\n    print(type(e.__cause__).__name__, e.__suppress_context__)",
    options: ["KeyError True", "NoneType False", "KeyError False", "ValueError True"],
    answer: 0,
    explanation: "`raise New from original` sets the new exception's `__cause__` to the original (explicit chaining) and `__suppress_context__` to True, so the traceback says 'The above exception was the direct cause of the following exception'. Use `from None` to hide the original.",
    optionExplanations: ["Correct.", "`from e` sets __cause__ to the KeyError.", "Explicit chaining sets __suppress_context__ to True.", "The cause is the original KeyError."]
  },
  {
    id: "py-exc-012", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "try:\n    try:\n        {}['k']\n    except KeyError:\n        raise ValueError('oops')\nexcept ValueError as e:\n    print(e.__cause__, type(e.__context__).__name__)",
    options: ["KeyError KeyError", "None KeyError", "None None", "KeyError None"],
    answer: 1,
    explanation: "Raising a new exception while handling another chains them IMPLICITLY: the original is stored in `__context__` ('During handling of the above exception, another exception occurred'), while `__cause__` stays None because no `from` was used.",
    optionExplanations: ["__cause__ is set only by `raise ... from ...`.", "Correct.", "__context__ is set automatically.", "It's the reverse."]
  },
  {
    id: "py-exc-013", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def f():\n    try:\n        return 1\n    finally:\n        return 2\n\nprint(f())",
    options: ["1", "1 2", "2", "SyntaxError"],
    answer: 2,
    explanation: "finally runs even when the try block returns. A `return` inside finally replaces the pending return value, so f returns 2. This is considered bad practice (Python 3.14 emits a SyntaxWarning for it) because it also silently swallows exceptions.",
    optionExplanations: ["The finally block's return overrides it.", "A function returns a single value.", "Correct.", "It's allowed (with a warning in 3.14+)."],
    tags: ["trap", "interview-favourite"]
  },
  {
    id: "py-exc-014", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def f():\n    try:\n        raise ValueError('lost')\n    finally:\n        return 'ok'\n\nprint(f())",
    options: ["ValueError: lost", "None", "ok", "ok and then ValueError"],
    answer: 2,
    explanation: "A return (or break/continue) in a finally block discards any exception that was propagating. The ValueError vanishes silently and f returns 'ok' — a dangerous way to hide errors.",
    optionExplanations: ["The exception is discarded by the return in finally.", "f returns 'ok'.", "Correct.", "The exception never propagates."],
    tags: ["trap"]
  },
  {
    id: "py-exc-015", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "hard", type: "code-output",
    question: "What happens when this code runs?",
    code: "try:\n    1 / 0\nexcept ZeroDivisionError as e:\n    pass\nprint(e)",
    options: ["It prints division by zero", "It prints None", "It raises NameError", "It prints ZeroDivisionError"],
    answer: 2,
    explanation: "The name bound with `except ... as e` is DELETED when the except block ends (to break the reference cycle exception → traceback → frame → e). Using e afterwards raises NameError. Assign it to another variable inside the block if you need it later.",
    optionExplanations: ["e no longer exists after the except block.", "e is deleted, not reset to None.", "Correct.", "e is unbound, so nothing about it can be printed."],
    tags: ["trap"]
  },
  {
    id: "py-exc-016", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import sys\ntry:\n    sys.exit(1)\nexcept Exception:\n    print('Exception')\nexcept BaseException as e:\n    print('BaseException', type(e).__name__)",
    options: ["Exception", "BaseException Exception", "Nothing; the program exits", "BaseException SystemExit"],
    answer: 3,
    explanation: "SystemExit (raised by sys.exit) and KeyboardInterrupt inherit directly from BaseException, NOT from Exception, so `except Exception` doesn't catch them. That's why `except Exception` is preferred over a bare `except:`, which would also swallow Ctrl+C and exit requests.",
    optionExplanations: ["SystemExit isn't a subclass of Exception.", "The exception's type is SystemExit.", "SystemExit is an exception and can be caught by BaseException.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-exc-017", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "concept",
    question: "Which statement about `assert` is correct?",
    options: ["Asserts are always executed, making them ideal for validating user input", "assert can only be used inside test files", "assert returns False instead of raising", "`assert cond, msg` raises AssertionError(msg) when cond is false, but asserts are removed when Python runs with -O"],
    answer: 3,
    explanation: "assert is a debugging aid for internal invariants. Running `python -O` strips assert statements entirely, so never use them for input validation or security checks; raise ValueError/TypeError explicitly instead.",
    optionExplanations: ["They can be disabled with -O, so they're unsuitable for validation.", "assert works anywhere.", "A failed assert raises AssertionError.", "Correct."]
  },
  {
    id: "py-exc-018", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "concept",
    question: "Which snippet follows Python's EAFP style?",
    options: ["`if key in d: value = d[key]`", "`try: value = d[key]` / `except KeyError: value = default`", "`if hasattr(obj, 'x'): obj.x`", "`if os.path.exists(p): open(p)`"],
    answer: 1,
    explanation: "EAFP ('Easier to Ask Forgiveness than Permission') attempts the operation and handles the exception. LBYL ('Look Before You Leap') checks first. EAFP is idiomatic in Python and avoids race conditions like a file disappearing between the exists() check and open().",
    optionExplanations: ["That's LBYL (checking first).", "Correct.", "That's LBYL.", "That's LBYL, and it's racy."]
  },
  {
    id: "py-exc-019", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class CM:\n    def __enter__(self):\n        print('enter', end=' ')\n        return 'res'\n    def __exit__(self, exc_type, exc, tb):\n        print('exit', end=' ')\n\nwith CM() as r:\n    print(r, end=' ')",
    options: ["enter res exit", "res enter exit", "enter exit res", "enter <CM object> exit"],
    answer: 0,
    explanation: "`with CM() as r` calls `__enter__` and binds its RETURN value to r (not necessarily the manager itself). The body runs, then `__exit__` is called with exception info (all None here).",
    optionExplanations: ["Correct.", "__enter__ runs before the body.", "__exit__ runs after the body.", "r is __enter__'s return value, 'res'."]
  },
  {
    id: "py-exc-020", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class Suppress:\n    def __enter__(self):\n        return self\n    def __exit__(self, exc_type, exc, tb):\n        print(exc_type.__name__, end=' ')\n        return True\n\nwith Suppress():\n    1 / 0\nprint('after')",
    options: ["NoneType after", "after", "ZeroDivisionError", "ZeroDivisionError after"],
    answer: 3,
    explanation: "When the body raises, `__exit__` receives the exception type, value and traceback. Returning a truthy value from __exit__ SUPPRESSES the exception, so execution continues after the with block (contextlib.suppress works this way).",
    optionExplanations: ["exc_type is ZeroDivisionError when the body raises.", "__exit__ prints the exception type first.", "The exception is suppressed, so 'after' prints.", "Correct."]
  },
  {
    id: "py-exc-021", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from contextlib import contextmanager\n\n@contextmanager\ndef tag(name):\n    print(f'<{name}>', end='')\n    yield\n    print(f'</{name}>', end='')\n\nwith tag('b'):\n    print('x', end='')",
    options: ["TypeError", "x<b></b>", "<b></b>x", "<b>x</b>"],
    answer: 3,
    explanation: "`@contextmanager` turns a generator into a context manager: code before `yield` is the __enter__ part, the with-body runs at the yield, and code after yield is the __exit__ part.",
    optionExplanations: ["This is the documented usage.", "The setup code runs before the body.", "The body runs at the yield, between setup and teardown.", "Correct."]
  },
  {
    id: "py-exc-022", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "from contextlib import contextmanager\n\n@contextmanager\ndef cm():\n    print('open', end=' ')\n    yield\n    print('close', end=' ')\n\ntry:\n    with cm():\n        raise ValueError\nexcept ValueError:\n    print('err')",
    options: ["open close err", "open err", "open err close", "err"],
    answer: 1,
    explanation: "If the with-body raises, the exception is thrown INTO the generator at the yield. Without try/finally around the yield, the code after yield never runs, so 'close' is skipped and the exception propagates. Robust context managers wrap the yield in try/finally.",
    optionExplanations: ["Cleanup after a bare yield is skipped when the body raises.", "Correct.", "The cleanup doesn't run at all.", "The setup code prints 'open' first."],
    tags: ["trap"]
  },
  {
    id: "py-exc-023", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class CM:\n    def __init__(self, n): self.n = n\n    def __enter__(self):\n        print('in', self.n, end=' | ')\n    def __exit__(self, *a):\n        print('out', self.n, end=' | ')\n\nwith CM(1), CM(2):\n    print('body', end=' | ')",
    options: ["in 1 | in 2 | body | out 2 | out 1 |", "in 1 | in 2 | body | out 1 | out 2 |", "in 2 | in 1 | body | out 1 | out 2 |", "in 1 | body | out 1 | in 2 | out 2 |"],
    answer: 0,
    explanation: "Multiple managers in one with statement behave like nested with blocks: entered left to right and exited in REVERSE order (last in, first out), just like nested resources should be released.",
    optionExplanations: ["Correct.", "Exit order is reversed relative to entry.", "Entry is left to right.", "Both are active during the body."]
  },
  {
    id: "py-exc-024", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "hard", type: "code-output",
    question: "What is the output (Python 3.11+)?",
    code: "try:\n    raise ExceptionGroup('batch', [ValueError('a'), TypeError('b'), ValueError('c')])\nexcept* ValueError as eg:\n    print('V', len(eg.exceptions), end=' ')\nexcept* TypeError as eg:\n    print('T', len(eg.exceptions))",
    options: ["V 2 T 1", "V 2", "V 1 T 1", "TypeError"],
    answer: 0,
    explanation: "An ExceptionGroup bundles several unrelated exceptions (e.g. from concurrent tasks). `except*` handles the matching SUBGROUP, and unlike plain except, several except* clauses can run for one group: the ValueErrors (2) go to the first, the TypeError to the second.",
    optionExplanations: ["Correct.", "except* clauses can each handle part of the group.", "Both ValueErrors are grouped together in one subgroup.", "except* is valid syntax since 3.11."]
  },
  {
    id: "py-exc-025", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output (Python 3.11+)?",
    code: "try:\n    try:\n        int('x')\n    except ValueError as e:\n        e.add_note('while parsing config line 3')\n        raise\nexcept ValueError as e:\n    print(e.__notes__)",
    options: ["['while parsing config line 3']", "while parsing config line 3", "None", "AttributeError"],
    answer: 0,
    explanation: "`add_note()` (3.11+) attaches extra context strings to an exception without changing its type or message. Notes are stored in the `__notes__` list and shown under the traceback.",
    optionExplanations: ["Correct.", "__notes__ is a list of strings.", "A note was added before re-raising.", "add_note exists on all exceptions from 3.11."]
  },
  {
    id: "py-exc-026", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class AppError(Exception): pass\nclass DbError(AppError): pass\n\ntry:\n    raise DbError('conn')\nexcept AppError as e:\n    print(type(e).__name__, isinstance(e, Exception))",
    options: ["AppError True", "DbError False", "DbError True", "Uncaught DbError"],
    answer: 2,
    explanation: "An except clause catches the named class AND all its subclasses. Designing a hierarchy (AppError → DbError, ApiError...) lets callers catch broadly or narrowly. The caught object keeps its real type.",
    optionExplanations: ["The object is still a DbError.", "Custom exceptions derive from Exception.", "Correct.", "AppError matches its subclass DbError."]
  },
  {
    id: "py-exc-027", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f():\n    try:\n        return 'try'\n    finally:\n        print('finally', end=' ')\n\nprint(f())",
    options: ["try", "finally try", "try finally", "finally"],
    answer: 1,
    explanation: "When the try block hits `return`, the return value is computed, then the finally block runs, and only then does the function actually return. So 'finally' is printed before the caller prints 'try'.",
    optionExplanations: ["finally also prints.", "Correct.", "finally runs before the function returns to the caller.", "The return value 'try' is still returned."]
  },
  {
    id: "py-exc-028", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "try:\n    try:\n        pass\n    except ValueError:\n        print('inner except')\n    else:\n        raise ValueError\nexcept ValueError:\n    print('outer')",
    options: ["inner except", "outer", "inner except outer", "Nothing is printed"],
    answer: 1,
    explanation: "The except clauses of a try statement only guard the try BODY. An exception raised in the else block isn't caught by the same statement's except clauses; it propagates to the outer handler. That's exactly why else exists: to keep code out of the protected region.",
    optionExplanations: ["The inner except doesn't cover the else block.", "Correct.", "Only the outer handler runs.", "The outer handler catches it and prints."],
    tags: ["trap"]
  },
  {
    id: "py-exc-029", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "try:\n    try:\n        1 / 0\n    finally:\n        print('inner finally', end=' | ')\nexcept ZeroDivisionError:\n    print('outer except')",
    options: ["outer except", "inner finally |", "outer except inner finally |", "inner finally | outer except"],
    answer: 3,
    explanation: "The inner try has no matching except, so the exception propagates — but the inner finally runs first as the stack unwinds, then the outer except handles it.",
    optionExplanations: ["The inner finally runs before the outer handler.", "The outer handler also runs.", "Unwinding runs the inner finally first.", "Correct."]
  },
  {
    id: "py-exc-030", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "try:\n    {}['a']\nexcept KeyError as e:\n    print(e, e.args)",
    options: ["a ('a',)", "'a' ('a',)", "KeyError: 'a' ('a',)", "a a"],
    answer: 1,
    explanation: "Exceptions store constructor arguments in `.args`. Most exceptions' str() is the message, but KeyError's str() is the REPR of the key, so it's printed with quotes. This makes empty-string keys visible in tracebacks.",
    optionExplanations: ["KeyError's str() includes the quotes.", "Correct.", "str(e) doesn't include the class name.", "args is a tuple."],
    tags: ["trap"]
  },
  {
    id: "py-exc-031", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "for i in range(3):\n    try:\n        if i == 1:\n            continue\n        print(i, end=' ')\n    finally:\n        print('f', end=' ')",
    options: ["0 f 2 f", "0 f 1 f 2 f", "0 2 f", "0 f f 2 f"],
    answer: 3,
    explanation: "finally runs whenever control leaves the try block — including through `continue`. For i = 1 nothing is printed in the body, but 'f' is still printed.",
    optionExplanations: ["finally also runs for the continued iteration.", "continue skips printing 1.", "finally runs once per iteration.", "Correct."]
  },
  {
    id: "py-exc-032", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "import io\nwith io.StringIO('data') as f:\n    content = f.read()\nprint(content, f.closed)",
    options: ["data False", "data True", "ValueError", "None True"],
    answer: 1,
    explanation: "File-like objects (including io.StringIO) are context managers that close themselves in __exit__. The variable f still exists after the block (with doesn't create a scope), but the stream is closed.",
    optionExplanations: ["The with block closes the stream on exit.", "Correct.", "Reading inside the block is fine.", "read() returned 'data'."]
  },
  {
    id: "py-exc-033", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "try:\n    raise 'something went wrong'\nexcept TypeError as e:\n    print('TypeError')\nexcept Exception:\n    print('Exception')",
    options: ["something went wrong", "SyntaxError", "Exception", "TypeError"],
    answer: 3,
    explanation: "In Python 3 you can only raise instances (or classes) deriving from BaseException. Raising a string triggers `TypeError: exceptions must derive from BaseException`, which the first handler catches.",
    optionExplanations: ["Strings can't be raised in Python 3.", "It's valid syntax; the error happens at runtime.", "The TypeError is caught by the earlier, more specific clause.", "Correct."]
  },
  {
    id: "py-exc-034", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def f(s):\n    try:\n        x = int(s)\n    except ValueError:\n        return -1\n    else:\n        return x * 2\n    finally:\n        print('done', end=' ')\n\nprint(f('5'), f('z'))",
    options: ["done done 10 -1", "done 10 done -1", "10 -1 done done", "done 10 -1"],
    answer: 0,
    explanation: "Both calls are evaluated before print outputs anything, and each call prints 'done' from its finally block before returning. f('5') takes the else path (10); f('z') takes the except path (-1).",
    optionExplanations: ["Correct.", "print's arguments are evaluated first, so both 'done's appear before the results.", "The finally prints happen during the calls, before print shows the results.", "Each call runs its finally block."],
    tags: ["trap"]
  },
  {
    id: "py-exc-035", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "e = ValueError('bad', 42)\nprint(e.args, str(e) == str(e.args))",
    options: ["TypeError", "bad False", "('bad', 42) False", "('bad', 42) True"],
    answer: 3,
    explanation: "Exceptions accept any number of arguments, stored in `.args`. With exactly one argument, str(e) is that argument; with several, str(e) is the str of the whole args tuple.",
    optionExplanations: ["Multiple arguments are allowed.", "args holds both values, and str(e) is the tuple's string.", "With multiple args, str(e) equals str(e.args).", "Correct."]
  },
  {
    id: "py-exc-036", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "medium", type: "concept",
    question: "What is the difference between a warning (`warnings.warn`) and an exception?",
    options: ["There is no difference", "A warning reports a non-fatal condition (e.g. deprecation) and by default execution continues; an uncaught exception stops the current flow", "Warnings are only printed in debug builds", "Exceptions can't be caught, warnings can"],
    answer: 1,
    explanation: "warnings.warn() emits a message (often once per location) and returns, so the program keeps running. Filters can ignore warnings or escalate them to exceptions (e.g. `-W error`). Exceptions unwind the stack until handled.",
    optionExplanations: ["Their control-flow effects differ.", "Correct.", "Warnings are shown in normal runs, subject to filters.", "Exceptions are caught with try/except."]
  },
  {
    id: "py-exc-037", subject: "python", subtopic: "Exceptions & Context Managers", difficulty: "easy", type: "concept",
    question: "Why is a bare `except:` clause considered bad practice?",
    options: ["It's a syntax error in Python 3", "It catches every exception, including KeyboardInterrupt and SystemExit, hiding bugs and making programs hard to stop", "It only catches exceptions from the standard library", "It makes the code run slower in all cases"],
    answer: 1,
    explanation: "A bare except is equivalent to `except BaseException:`. It swallows Ctrl+C, sys.exit() and programming errors like NameError. Catch the specific exceptions you expect, or at most `except Exception:` and log the error.",
    optionExplanations: ["It's legal syntax, just discouraged.", "Correct.", "It catches everything.", "Performance isn't the concern."]
  }
);
