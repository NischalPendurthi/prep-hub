/* Python — Iterators & Generators */
window.QUESTIONS.push(
  {
    id: "py-iter-001", subject: "python", subtopic: "Iterators & Generators", difficulty: "easy", type: "concept",
    question: "What is the difference between an iterable and an iterator?",
    options: ["They are the same thing in Python", "Iterables are always lists; iterators are always generators", "An iterator can be looped over many times; an iterable only once", "An iterable can produce an iterator via `__iter__`; an iterator produces values one at a time via `__next__` and is itself iterable"],
    answer: 3,
    explanation: "An ITERABLE (list, str, dict, range...) has `__iter__` returning a fresh iterator. An ITERATOR has `__next__` to return the next value (raising StopIteration at the end) and `__iter__` returning itself. Iterators are single-pass; iterables like lists can be iterated repeatedly because each loop gets a new iterator.",
    optionExplanations: ["A list is iterable but not an iterator (it has no __next__).", "Many types are iterable, and iterators include map, zip, file objects and more.", "It's the reverse: iterators are exhausted after one pass.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-iter-002", subject: "python", subtopic: "Iterators & Generators", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "it = iter([1, 2])\nprint(next(it), next(it))\ntry:\n    next(it)\nexcept StopIteration:\n    print('done')",
    options: ["1 2 and then done", "1 2 and then None", "1 1 and then done", "1 2 and then IndexError"],
    answer: 0,
    explanation: "`iter()` obtains an iterator, and each `next()` returns the following item. When the iterator is exhausted, `next()` raises StopIteration — that's the signal a for loop uses to stop.",
    optionExplanations: ["Correct.", "next() raises instead of returning None.", "Each next() advances the iterator.", "Iterators signal the end with StopIteration, not IndexError."]
  },
  {
    id: "py-iter-003", subject: "python", subtopic: "Iterators & Generators", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "def g():\n    yield 1\n    yield 2\n\nprint(list(g()), type(g()).__name__)",
    options: ["[1] generator", "[1, 2] function", "[1, 2] generator", "[2] generator"],
    answer: 2,
    explanation: "A function containing `yield` is a generator function: calling it returns a generator object instead of running the body. Iterating the generator runs the body up to each yield, producing 1 and then 2.",
    optionExplanations: ["Execution resumes after the first yield and produces 2 as well.", "Calling a generator function returns a generator object.", "Correct.", "Both yields produce values."]
  },
  {
    id: "py-iter-004", subject: "python", subtopic: "Iterators & Generators", difficulty: "easy", type: "concept",
    question: "What does `yield` do inside a function?",
    options: ["Returns a value and destroys the function's local state", "Raises StopIteration immediately", "Creates a new thread", "Produces a value to the caller and suspends the function, preserving its local state so it can resume later"],
    answer: 3,
    explanation: "`yield` hands a value to whoever called next() and freezes the generator's frame (local variables, instruction pointer). The next call to next() resumes right after the yield. This makes it easy to write lazy sequences without building lists.",
    optionExplanations: ["That's closer to `return`; yield keeps the state.", "StopIteration happens when the function body finishes.", "Generators run in the caller's thread.", "Correct."]
  },
  {
    id: "py-iter-005", subject: "python", subtopic: "Iterators & Generators", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "it = iter([])\nprint(next(it, 'done'))",
    options: ["None", "StopIteration", "done", "[]"],
    answer: 2,
    explanation: "`next(iterator, default)` returns the default instead of raising StopIteration when the iterator is exhausted. This avoids try/except for 'first item or fallback' patterns.",
    optionExplanations: ["The supplied default is returned, not None.", "Providing a default suppresses StopIteration.", "Correct.", "next() returns an item (or the default), not the iterable."]
  },
  {
    id: "py-iter-006", subject: "python", subtopic: "Iterators & Generators", difficulty: "easy", type: "code-output",
    question: "What happens when this code runs?",
    code: "r = range(3)\nprint(next(r))",
    options: ["It prints 0", "It prints 1", "It raises TypeError: 'range' object is not an iterator", "It raises StopIteration"],
    answer: 2,
    explanation: "A range is a lazy SEQUENCE (supports len, indexing, `in`), not an iterator. It has no `__next__`, so next() fails. Use `next(iter(r))`. Because it's not an iterator, a range can be looped over many times.",
    optionExplanations: ["range is not an iterator, so next() can't be called on it directly.", "range is not an iterator.", "Correct.", "next() fails before any iteration happens."],
    tags: ["trap"]
  },
  {
    id: "py-iter-007", subject: "python", subtopic: "Iterators & Generators", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "z = zip([1, 2], [3, 4])\nprint(list(z), list(z))",
    options: ["[(1, 3), (2, 4)] [(1, 3), (2, 4)]", "[] []", "[1, 2, 3, 4] []", "[(1, 3), (2, 4)] []"],
    answer: 3,
    explanation: "zip (like map, filter, enumerate and reversed) returns a one-shot ITERATOR. The first list() consumes it; the second finds it exhausted and produces an empty list.",
    optionExplanations: ["zip objects can't be re-iterated.", "The first list() gets all pairs.", "zip produces tuples of paired items.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-iter-008", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def g():\n    print('start', end=' ')\n    yield 1\n\nx = g()\nprint('created', end=' ')\nprint(next(x))",
    options: ["start created 1", "start 1 created", "created 1", "created start 1"],
    answer: 3,
    explanation: "Calling a generator function does NOT execute any of its body; it just creates the generator object. The body starts running on the first next(), which prints 'start' and then pauses at the yield, returning 1.",
    optionExplanations: ["The body doesn't run when g() is called.", "'created' is printed before the generator starts.", "The body runs (printing 'start') on the first next().", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-iter-009", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def g():\n    yield 1\n    return 'done'\n\nit = g()\nnext(it)\ntry:\n    next(it)\nexcept StopIteration as e:\n    print(e.value)",
    options: ["1", "None", "done", "StopIteration"],
    answer: 2,
    explanation: "A `return value` inside a generator ends iteration; the value is attached to the StopIteration exception as `.value`. for loops and list() ignore it, but `yield from` and manual handling can read it.",
    optionExplanations: ["1 was consumed by the first next().", "The return value is stored on the exception.", "Correct.", "The exception is caught and its value printed."]
  },
  {
    id: "py-iter-010", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def inner():\n    yield 1\n    yield 2\n\ndef outer():\n    yield 0\n    yield from inner()\n    yield 3\n\nprint(list(outer()))",
    options: ["[0, <generator>, 3]", "[0, 1, 2, 3]", "[0, 3]", "[0, [1, 2], 3]"],
    answer: 1,
    explanation: "`yield from iterable` delegates to a sub-iterator, re-yielding each of its values as if outer had yielded them itself. It also forwards send()/throw() and returns the sub-generator's return value.",
    optionExplanations: ["yield from yields the items, not the generator object.", "Correct.", "The inner values are included.", "The items are flattened into the outer stream."]
  },
  {
    id: "py-iter-011", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def inner():\n    yield 1\n    return 'r'\n\ndef outer():\n    x = yield from inner()\n    yield x\n\nprint(list(outer()))",
    options: ["[1]", "['r']", "[1, None]", "[1, 'r']"],
    answer: 3,
    explanation: "The value of a `yield from` expression is the RETURN value of the delegated generator (taken from its StopIteration). So x becomes 'r', which outer then yields.",
    optionExplanations: ["outer yields x afterwards.", "inner's yielded 1 is passed through first.", "yield from evaluates to inner's return value, which is 'r'.", "Correct."]
  },
  {
    id: "py-iter-012", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def g():\n    x = yield 1\n    yield x * 2\n\nit = g()\nprint(next(it), it.send(5))",
    options: ["1 2", "1 None", "5 10", "1 10"],
    answer: 3,
    explanation: "`send(value)` resumes the generator and makes the paused `yield` expression evaluate to value. next() runs to the first yield (producing 1); send(5) resumes with x = 5 and runs to the next yield, producing 10.",
    optionExplanations: ["x receives 5, so x * 2 is 10.", "send() returns the next yielded value.", "The first next() produces 1.", "Correct."]
  },
  {
    id: "py-iter-013", subject: "python", subtopic: "Iterators & Generators", difficulty: "hard", type: "code-output",
    question: "What happens when this code runs?",
    code: "def g():\n    x = yield 1\n    yield x\n\nit = g()\nprint(it.send(5))",
    options: ["It prints 1", "It prints 5", "It raises TypeError", "It prints None"],
    answer: 2,
    explanation: "A just-created generator hasn't reached a yield yet, so there's no yield expression to receive a value. Sending a non-None value raises `TypeError: can't send non-None value to a just-started generator`. Prime it first with next(it) or it.send(None).",
    optionExplanations: ["Only send(None) or next() can start a generator.", "No yield is waiting to receive 5.", "Correct.", "The call raises before producing anything."],
    tags: ["trap"]
  },
  {
    id: "py-iter-014", subject: "python", subtopic: "Iterators & Generators", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class CountDown:\n    def __init__(self, n):\n        self.n = n\n    def __iter__(self):\n        return self\n    def __next__(self):\n        if self.n <= 0:\n            raise StopIteration\n        self.n -= 1\n        return self.n + 1\n\nc = CountDown(3)\nprint(list(c), list(c))",
    options: ["[3, 2, 1] [3, 2, 1]", "[2, 1, 0] []", "[3, 2, 1] []", "[1, 2, 3] []"],
    answer: 2,
    explanation: "Because `__iter__` returns self, the object IS its iterator and its state (self.n) is consumed by the first pass. The second list() calls __iter__ again, gets the same exhausted object, and receives nothing. To be re-iterable, __iter__ should return a new iterator each time.",
    optionExplanations: ["The iterator's state isn't reset between passes.", "__next__ returns n + 1 after decrementing, so values are 3, 2, 1.", "Correct.", "It counts down, not up."]
  },
  {
    id: "py-iter-015", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class Pair:\n    def __iter__(self):\n        yield 'a'\n        yield 'b'\n\np = Pair()\nprint(list(p), list(p))",
    options: ["['a', 'b'] []", "[] []", "TypeError", "['a', 'b'] ['a', 'b']"],
    answer: 3,
    explanation: "Making `__iter__` a generator function means each call returns a NEW generator. So every for loop or list() gets a fresh iterator and the object can be iterated repeatedly — an iterable, not an iterator.",
    optionExplanations: ["Each list() call gets a fresh generator.", "The generator yields two values each time.", "A class with __iter__ is iterable.", "Correct."]
  },
  {
    id: "py-iter-016", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from itertools import islice, count\nprint(list(islice(count(10, 5), 3)))",
    options: ["[10, 15, 20]", "[10, 11, 12]", "[5, 10, 15]", "It runs forever"],
    answer: 0,
    explanation: "`count(start, step)` is an infinite iterator: 10, 15, 20, ... `islice` lazily takes only the first 3 items, so the infinite iterator is safe to use. Calling list() on count() directly would never finish.",
    optionExplanations: ["Correct.", "The step is 5, not 1.", "count starts at 10.", "islice stops after 3 items."]
  },
  {
    id: "py-iter-017", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "concept",
    question: "What does `for x in obj:` do under the hood?",
    options: ["Indexes obj with 0, 1, 2, ... until IndexError, always", "Calls `iter(obj)` once, then calls `next()` on the result repeatedly until StopIteration is raised", "Copies obj into a list, then loops over the list", "Calls `obj.__len__()` and loops that many times"],
    answer: 1,
    explanation: "The for statement gets an iterator with iter(obj) and calls next() on it for each iteration, catching StopIteration to end the loop. (iter() falls back to `__getitem__` with 0, 1, 2... only if the object has no `__iter__`.)",
    optionExplanations: ["That's only a legacy fallback for objects without __iter__.", "Correct.", "No copy is made; that's why modifying a list during iteration has effects.", "Length isn't used; iterators may not have a length."]
  },
  {
    id: "py-iter-018", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "nums = (x for x in range(10))\nevens = (x for x in nums if x % 2 == 0)\nsquares = (x * x for x in evens)\nprint(sum(squares))",
    options: ["120", "285", "100", "0"],
    answer: 0,
    explanation: "Chained generator expressions form a lazy pipeline: each value flows through all stages one at a time, with no intermediate lists. Evens 0, 2, 4, 6, 8 squared are 0, 4, 16, 36, 64, which sum to 120.",
    optionExplanations: ["Correct.", "285 is the sum of squares of 0-9, without the even filter.", "The even numbers are squared before summing.", "sum() pulls values through the whole pipeline."]
  },
  {
    id: "py-iter-019", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def gen():\n    for i in range(3):\n        print('g', i, end=' ')\n        yield i\n\nfor v in gen():\n    print('v', v, end=' ')",
    options: ["g 0 g 1 g 2 v 0 v 1 v 2", "g 0 v 0 g 1 v 1 g 2 v 2", "v 0 g 0 v 1 g 1 v 2 g 2", "g 0 v 0"],
    answer: 1,
    explanation: "Generators are lazy: the loop requests one value, the generator runs until its next yield (printing 'g i'), then the loop body runs ('v i'), and so on. Production and consumption interleave instead of producing everything first.",
    optionExplanations: ["That's what you'd see if all values were produced up front (e.g. a list).", "Correct.", "The generator must run to its yield before the loop body sees the value.", "The loop continues through all three values."]
  },
  {
    id: "py-iter-020", subject: "python", subtopic: "Iterators & Generators", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def g():\n    try:\n        yield 1\n        yield 2\n    finally:\n        print('cleanup', end=' ')\n\nit = g()\nnext(it)\nit.close()\nprint('closed')",
    options: ["closed", "cleanup closed", "closed cleanup", "1 cleanup closed"],
    answer: 1,
    explanation: "`close()` raises GeneratorExit inside the paused generator at the yield. That unwinds through the try block, so the finally clause runs ('cleanup'), and close() returns normally. This is how generators release resources when abandoned early.",
    optionExplanations: ["close() triggers the finally block.", "Correct.", "The cleanup happens during close(), before print('closed').", "next(it)'s return value isn't printed."]
  },
  {
    id: "py-iter-021", subject: "python", subtopic: "Iterators & Generators", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def g():\n    try:\n        yield 1\n    except ValueError:\n        yield 'caught'\n\nit = g()\nnext(it)\nprint(it.throw(ValueError))",
    options: ["1", "caught", "ValueError", "None"],
    answer: 1,
    explanation: "`throw(exc)` raises the exception inside the generator at the paused yield. The generator's except block handles it and yields 'caught', which becomes the return value of throw().",
    optionExplanations: ["1 was produced by the earlier next().", "Correct.", "The generator catches the exception.", "throw() returns the next yielded value."]
  },
  {
    id: "py-iter-022", subject: "python", subtopic: "Iterators & Generators", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "r = reversed([1, 2, 3])\nprint(next(r), list(r))",
    options: ["3 [3, 2, 1]", "1 [2, 3]", "3 [2, 1]", "[3, 2, 1] []"],
    answer: 2,
    explanation: "`reversed()` returns an iterator over the sequence in reverse order. next() consumes the first item (3), and list() collects the rest (2, 1).",
    optionExplanations: ["The 3 was already consumed by next().", "reversed iterates from the end.", "Correct.", "next() returns a single item, not a list."]
  },
  {
    id: "py-iter-023", subject: "python", subtopic: "Iterators & Generators", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "data = [3, 0, 2, 1]\nit = iter(data.pop, 0)\nprint(list(it), data)",
    options: ["[1, 2] [3]", "[3, 0] [2, 1]", "[1, 2, 0] [3]", "[1, 2, 0, 3] []"],
    answer: 0,
    explanation: "The two-argument form `iter(callable, sentinel)` calls the callable repeatedly until it returns the sentinel. pop() returns 1, then 2, then 0 — the sentinel — which stops iteration (0 isn't included). 3 remains in data.",
    optionExplanations: ["Correct.", "pop() removes from the end, so 1 comes first.", "The sentinel value itself is not yielded.", "Iteration stops at the sentinel, so 3 is never popped."]
  },
  {
    id: "py-iter-024", subject: "python", subtopic: "Iterators & Generators", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "d = {'a': 1}\nit = iter(d)\nd['b'] = 2\ntry:\n    print(next(it))\nexcept RuntimeError:\n    print('RuntimeError')",
    options: ["RuntimeError", "b", "a", "StopIteration"],
    answer: 0,
    explanation: "A dict iterator remembers the dict's size when created; if the size changes before the next step, next() raises `RuntimeError: dictionary changed size during iteration`. Lists don't have this check.",
    optionExplanations: ["Correct.", "The iterator refuses to continue after the change.", "The size change is detected on the next() call.", "It isn't exhausted; it detects the mutation."]
  },
  {
    id: "py-iter-025", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "m = map(lambda x: print(x, end=' '), [1, 2])\nprint('before', end=' ')\nlist(m)",
    options: ["before 1 2", "1 2 before", "before", "1 before 2"],
    answer: 0,
    explanation: "map is lazy: creating the map object doesn't call the function. Only when list() consumes it does the lambda run, so 'before' is printed first. Relying on map for side effects is an anti-pattern for exactly this reason.",
    optionExplanations: ["Correct.", "Nothing runs until the map is consumed.", "list(m) forces the lambda calls.", "All items are processed when list() consumes the map."]
  },
  {
    id: "py-iter-026", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "concept",
    question: "Why are generators a good fit for processing a 50 GB log file line by line?",
    options: ["They read the file in parallel on multiple cores", "They hold only the current line (and a small buffer) in memory instead of loading the whole file", "They compress the file automatically", "They make each line immutable"],
    answer: 1,
    explanation: "File objects are themselves lazy iterators over lines, and generator pipelines (filter → parse → aggregate) keep memory usage constant regardless of file size, because each line is processed and discarded before the next is read.",
    optionExplanations: ["Generators are single-threaded.", "Correct.", "Generators don't compress anything.", "Strings are immutable anyway; that's not the benefit."]
  },
  {
    id: "py-iter-027", subject: "python", subtopic: "Iterators & Generators", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "g = (i for i in range(5))\nnext(g)\nnext(g)\nprint(list(g))",
    options: ["[2, 3, 4]", "[0, 1, 2, 3, 4]", "[1, 2, 3, 4]", "[]"],
    answer: 0,
    explanation: "Each next() consumes one item. After 0 and 1 are consumed, the remaining items 2, 3, 4 are collected by list().",
    optionExplanations: ["Correct.", "Consumed items don't come back.", "Two items were consumed, not one.", "Three items remain."]
  },
  {
    id: "py-iter-028", subject: "python", subtopic: "Iterators & Generators", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def g():\n    yield from range(3)\n    return 5\n\nprint(list(g()), sum(g()))",
    options: ["[0, 1, 2, 5] 8", "[5] 5", "[0, 1, 2] 8", "[0, 1, 2] 3"],
    answer: 3,
    explanation: "A generator's return value is not one of its yielded items; it rides on StopIteration and is ignored by list(), sum() and for loops. Each call to g() creates a new generator, so the sum sees 0, 1, 2 again.",
    optionExplanations: ["The returned 5 isn't part of the iteration.", "The yielded values are 0, 1, 2.", "sum() also ignores the return value.", "Correct."]
  },
  {
    id: "py-iter-029", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def g():\n    for i in range(5):\n        if i == 2:\n            return\n        yield i\n\nprint(list(g()))",
    options: ["[0, 1]", "[0, 1, 2]", "[0, 1, 3, 4]", "[]"],
    answer: 0,
    explanation: "A bare `return` inside a generator finishes it: StopIteration is raised to the consumer. Values after that point are never produced.",
    optionExplanations: ["Correct.", "return happens before yield i for i = 2.", "return ends the generator; it doesn't skip just one value.", "0 and 1 are yielded before the return."]
  },
  {
    id: "py-iter-030", subject: "python", subtopic: "Iterators & Generators", difficulty: "hard", type: "code-output",
    question: "What is the output (Python 3.7+)?",
    code: "def g():\n    yield 1\n    raise StopIteration\n\ntry:\n    print(list(g()))\nexcept RuntimeError:\n    print('RuntimeError')",
    options: ["[1]", "[]", "RuntimeError", "StopIteration"],
    answer: 2,
    explanation: "Since PEP 479 (default from 3.7), a StopIteration raised INSIDE a generator body is converted into RuntimeError, so bugs that accidentally leak StopIteration don't silently truncate iteration. Use `return` to end a generator.",
    optionExplanations: ["That was the pre-3.7 behaviour.", "The value 1 is yielded before the error, but the error propagates.", "Correct.", "The StopIteration is converted to RuntimeError."],
    tags: ["trap"]
  },
  {
    id: "py-iter-031", subject: "python", subtopic: "Iterators & Generators", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "g = iter(range(6))\nprint(list(zip(g, g)))",
    options: ["[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5)]", "[(0, 1), (2, 3), (4, 5)]", "[(0, 1), (1, 2), (2, 3), (3, 4), (4, 5)]", "[]"],
    answer: 1,
    explanation: "Both arguments to zip are the SAME iterator, so zip takes one item for the first slot and the NEXT item for the second slot. This is the idiomatic chunking trick: `zip(*[iter(s)] * n)` groups s into n-tuples.",
    optionExplanations: ["That would require two independent iterators.", "Correct.", "Items are consumed, not reused, so pairs don't overlap.", "The iterator has six items to pair."],
    tags: ["trap"]
  },
  {
    id: "py-iter-032", subject: "python", subtopic: "Iterators & Generators", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "it = iter([1, 2, 3, 4])\nprint(2 in it, 4 in it, list(it))",
    options: ["True True [1, 2, 3, 4]", "True True []", "True False []", "True True [3]"],
    answer: 1,
    explanation: "Membership tests on an iterator consume items until a match is found. `2 in it` consumes 1 and 2; `4 in it` consumes 3 and 4 and finds a match. Nothing is left for list().",
    optionExplanations: ["Consumed items are gone.", "Correct.", "4 is still in the remaining items when the second test runs.", "3 is consumed while searching for 4."]
  },
  {
    id: "py-iter-033", subject: "python", subtopic: "Iterators & Generators", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "def averager():\n    total = count = 0\n    avg = None\n    while True:\n        x = yield avg\n        total += x\n        count += 1\n        avg = total / count\n\na = averager()\nnext(a)\na.send(10)\nprint(a.send(20))",
    options: ["15.0", "10.0", "20", "None"],
    answer: 0,
    explanation: "This is a generator used as a coroutine. next(a) primes it (yields None). send(10) sets x = 10, updates avg to 10.0 and yields it. send(20) updates total to 30 and count to 2, and yields 15.0.",
    optionExplanations: ["Correct.", "10.0 is the result of the first send.", "It yields the running average, which is a float.", "After priming, each send yields the updated average."]
  },
  {
    id: "py-iter-034", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "g = (x for x in [1])\nlst = [1]\nprint(iter(g) is g, iter(lst) is lst)",
    options: ["True True", "False False", "True False", "False True"],
    answer: 2,
    explanation: "Iterators return themselves from iter(), which is why they're single-pass. Iterables like lists return a brand-new iterator object each time, so they can be iterated repeatedly.",
    optionExplanations: ["A list is not its own iterator.", "A generator is its own iterator.", "Correct.", "It's the other way round."]
  },
  {
    id: "py-iter-035", subject: "python", subtopic: "Iterators & Generators", difficulty: "easy", type: "concept",
    question: "Which exception does an iterator's `__next__` raise to signal there are no more items?",
    options: ["IndexError", "GeneratorExit", "EOFError", "StopIteration"],
    answer: 3,
    explanation: "StopIteration is the protocol signal for exhaustion. for loops, list(), sum() and other consumers catch it automatically. GeneratorExit is used by close(), and IndexError is only used by the legacy __getitem__ iteration fallback.",
    optionExplanations: ["IndexError is for sequence indexing.", "GeneratorExit is raised inside a generator when it's closed.", "EOFError is raised by input() at end of input.", "Correct."]
  },
  {
    id: "py-iter-036", subject: "python", subtopic: "Iterators & Generators", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "k = {'a': 1, 'b': 2}.keys()\nprint(len(k), list(k), list(k))",
    options: ["2 ['a', 'b'] []", "2 ['a', 'b'] ['a', 'b']", "TypeError", "2 ['a', 'b'] ['b', 'a']"],
    answer: 1,
    explanation: "Dict views are iterables (they support len and membership), not iterators. Every iteration creates a new iterator, so they can be listed multiple times — unlike zip or map objects.",
    optionExplanations: ["Views aren't exhausted by iteration.", "Correct.", "Views support len().", "Views follow insertion order every time."]
  },
  {
    id: "py-iter-037", subject: "python", subtopic: "Iterators & Generators", difficulty: "hard", type: "concept",
    question: "Which capability does a generator FUNCTION have that a generator EXPRESSION does not?",
    options: ["Lazy evaluation", "Being consumed by a for loop", "Multiple yield points, try/finally cleanup and receiving values via send()", "Producing an infinite sequence"],
    answer: 2,
    explanation: "Both are lazy and both produce generator objects usable in for loops, and both can be infinite (e.g. a genexpr over itertools.count()). But a generator expression is a single expression with one implicit yield; only a generator function can have arbitrary logic, several yields, try/finally blocks and meaningful send() interaction.",
    optionExplanations: ["Both are lazy.", "Both produce iterators usable in for loops.", "Correct.", "A genexpr over an infinite iterator is infinite too."]
  }
);
