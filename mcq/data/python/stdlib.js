/* Python — Built-ins & Standard Library */
window.QUESTIONS.push(
  {
    id: "py-stdlib-001", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "a = [3, 1, 2]\nb = sorted(a)\nprint(a, b)",
    options: ["[1, 2, 3] [1, 2, 3]", "[3, 1, 2] [1, 2, 3]", "[3, 1, 2] None", "[1, 2, 3] None"],
    answer: 1,
    explanation: "`sorted(iterable)` returns a NEW sorted list and leaves the original untouched; it works on any iterable. `list.sort()` sorts in place and returns None, and only exists on lists.",
    optionExplanations: ["sorted() doesn't modify its input.", "Correct.", "sorted() returns the new list.", "a is unchanged and b is the sorted copy."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-stdlib-002", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(list(enumerate('ab', start=1)), list(zip([1, 2, 3], 'ab')))",
    options: ["[(1, 'a'), (2, 'b')] [(1, 'a'), (2, 'b'), (3, '')]", "[(0, 'a'), (1, 'b')] [(1, 'a'), (2, 'b'), (3, None)]", "[(1, 'a'), (2, 'b')] [(1, 'a'), (2, 'b')]", "[('a', 1), ('b', 2)] [(1, 'a'), (2, 'b')]"],
    answer: 2,
    explanation: "enumerate yields (index, item) pairs starting at `start`. zip pairs items positionally and stops at the SHORTEST iterable, silently dropping the extra 3.",
    optionExplanations: ["zip doesn't pad missing values.", "start=1 begins counting at 1, and zip doesn't pad.", "Correct.", "enumerate puts the index first."]
  },
  {
    id: "py-stdlib-003", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(any([]), all([]), any([0, '', None]), all([1, 'a', [0]]))",
    options: ["True True False True", "False False False True", "False True False True", "False True False False"],
    answer: 2,
    explanation: "any() is True if at least one element is truthy, so any([]) is False. all() is True if no element is falsy, so all([]) is vacuously True. [0] is a non-empty list, hence truthy.",
    optionExplanations: ["any() of an empty iterable is False.", "all() of an empty iterable is True.", "Correct.", "[0] is truthy because the list is non-empty."],
    tags: ["trap"]
  },
  {
    id: "py-stdlib-004", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "from collections import Counter\nc = Counter('banana')\nprint(c['a'], c['n'], c['z'])",
    options: ["3 2 KeyError", "1 1 0", "3 2 None", "3 2 0"],
    answer: 3,
    explanation: "Counter is a dict subclass that counts hashable items. Unlike a normal dict, looking up a missing key returns 0 instead of raising KeyError (and doesn't insert the key).",
    optionExplanations: ["Counter returns 0 for missing keys.", "'banana' has three a's and two n's.", "The missing count is 0, not None.", "Correct."]
  },
  {
    id: "py-stdlib-005", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "from collections import defaultdict\nd = defaultdict(int)\nfor w in ['a', 'b', 'a']:\n    d[w] += 1\nprint(dict(d))",
    options: ["{'a': 2, 'b': 1}", "KeyError", "{'a': 1, 'b': 1}", "{}"],
    answer: 0,
    explanation: "A defaultdict calls its default_factory (here int(), which returns 0) to create a value for any missing key on access, so `d[w] += 1` works without checking first. defaultdict(list) is the standard grouping idiom.",
    optionExplanations: ["Correct.", "Missing keys are created automatically.", "'a' is counted twice.", "Keys are created on access."]
  },
  {
    id: "py-stdlib-006", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "from collections import deque\nd = deque([1, 2])\nd.appendleft(0)\nd.append(3)\nprint(list(d), d.popleft(), d.pop())",
    options: ["[0, 1, 2, 3] 3 0", "[1, 2, 0, 3] 1 3", "[0, 1, 2, 3] 0 3", "[3, 0, 1, 2] 0 3"],
    answer: 2,
    explanation: "A deque (double-ended queue) supports O(1) append/pop at BOTH ends, unlike a list where operations at the front are O(n). Arguments to print are evaluated left to right: the list snapshot first, then popleft (0), then pop (3).",
    optionExplanations: ["popleft removes from the left (0) and pop from the right (3).", "appendleft adds to the front.", "Correct.", "append adds to the right end."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-stdlib-007", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "import heapq\nh = [5, 1, 8, 3]\nheapq.heapify(h)\nprint(heapq.heappop(h), heapq.heappop(h))",
    options: ["8 5", "1 5", "5 1", "1 3"],
    answer: 3,
    explanation: "heapq implements a MIN-heap on a plain list: heapify rearranges it in O(n), and heappop always removes the smallest element in O(log n). For a max-heap, push negated values.",
    optionExplanations: ["heapq is a min-heap, not a max-heap.", "After popping 1, the next smallest is 3.", "heappop returns the smallest, not the first element.", "Correct."]
  },
  {
    id: "py-stdlib-008", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "words = ['a', 'abc', 'ab']\nprint(max(words, key=len), min(words, key=len), list(reversed(range(3))), sum(range(5)))",
    options: ["abc a [3, 2, 1] 15", "ab a [2, 1, 0] 10", "abc a [2, 1, 0] 10", "abc ab [2, 1, 0] 10"],
    answer: 2,
    explanation: "min/max accept a key function that computes the comparison value; the original element is returned. reversed(range(3)) yields 2, 1, 0, and sum(range(5)) is 0+1+2+3+4 = 10.",
    optionExplanations: ["range(3) is 0..2 and range(5) sums to 10.", "'abc' has the greatest length.", "Correct.", "'a' is the shortest."]
  },
  {
    id: "py-stdlib-009", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "data = [('b', 2), ('a', 2), ('c', 1)]\nprint(sorted(data, key=lambda t: t[1]))",
    options: ["[('c', 1), ('a', 2), ('b', 2)]", "[('b', 2), ('a', 2), ('c', 1)]", "[('a', 2), ('b', 2), ('c', 1)]", "[('c', 1), ('b', 2), ('a', 2)]"],
    answer: 3,
    explanation: "Python's sort (Timsort) is STABLE: items with equal keys keep their original relative order. ('b', 2) came before ('a', 2), so it stays first. Stability enables multi-pass sorting (sort by secondary key, then by primary key).",
    optionExplanations: ["The key is only t[1], so ties aren't broken alphabetically.", "That's the unsorted input.", "The sort is ascending by the second element.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-stdlib-010", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "words = ['bb', 'a', 'ccc', 'aa']\nprint(sorted(words, key=lambda w: (-len(w), w)))",
    options: ["['a', 'aa', 'bb', 'ccc']", "['ccc', 'aa', 'bb', 'a']", "['ccc', 'bb', 'aa', 'a']", "['a', 'bb', 'aa', 'ccc']"],
    answer: 1,
    explanation: "A tuple key sorts by the first component, then breaks ties with the next. Negating the length gives descending length; the word itself gives ascending alphabetical order among equal lengths: 'aa' before 'bb'.",
    optionExplanations: ["-len(w) sorts longest first.", "Correct.", "Ties are broken alphabetically ascending, so 'aa' comes before 'bb'.", "That isn't sorted by either criterion."]
  },
  {
    id: "py-stdlib-011", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "w = ['b', 'C', 'a']\nprint(sorted(w), sorted(w, key=str.lower), sorted(w, reverse=True))",
    options: ["['a', 'b', 'C'] ['a', 'b', 'C'] ['b', 'a', 'C']", "['C', 'a', 'b'] ['a', 'b', 'C'] ['b', 'a', 'C']", "['C', 'a', 'b'] ['C', 'a', 'b'] ['C', 'b', 'a']", "['a', 'b', 'C'] ['C', 'a', 'b'] ['C', 'b', 'a']"],
    answer: 1,
    explanation: "Default string ordering is by code point, so uppercase 'C' (67) sorts before lowercase letters. `key=str.lower` makes the comparison case-insensitive. reverse=True reverses the default order.",
    optionExplanations: ["The default sort puts uppercase first.", "Correct.", "key=str.lower changes the order.", "The first two results are swapped."]
  },
  {
    id: "py-stdlib-012", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(min([], default=0), max([4, 9], default=-1))\ntry:\n    min([])\nexcept ValueError:\n    print('ValueError')",
    options: ["0 9 and then ValueError", "0 9 and then 0", "None 9 and then ValueError", "ValueError"],
    answer: 0,
    explanation: "min() and max() raise ValueError for an empty iterable unless a `default` keyword is provided, in which case the default is returned. The default is ignored when the iterable isn't empty.",
    optionExplanations: ["Correct.", "Without default, an empty iterable raises.", "The supplied default 0 is returned, not None.", "The first two calls succeed."]
  },
  {
    id: "py-stdlib-013", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output (Python 3.10+)?",
    code: "from itertools import zip_longest\nprint(list(zip_longest('ab', [1], fillvalue=0)))\ntry:\n    list(zip([1, 2], [3], strict=True))\nexcept ValueError:\n    print('length mismatch')",
    options: ["[('a', 1), ('b', 0)] and then length mismatch", "[('a', 1)] and then length mismatch", "[('a', 1), ('b', None)] and then [(1, 3)]", "[('a', 1), ('b', 0)] and then [(1, 3)]"],
    answer: 0,
    explanation: "itertools.zip_longest continues until the LONGEST input is exhausted, filling gaps with fillvalue. `zip(..., strict=True)` (3.10+) raises ValueError if the inputs have different lengths instead of silently truncating.",
    optionExplanations: ["Correct.", "zip_longest doesn't stop at the shortest input.", "fillvalue=0 is used, and strict=True raises.", "strict=True raises on unequal lengths."]
  },
  {
    id: "py-stdlib-014", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "m = [[1, 2], [3, 4], [5, 6]]\nprint(list(zip(*m)))",
    options: ["[1, 2, 3, 4, 5, 6]", "[(1, 2), (3, 4), (5, 6)]", "[(1, 3, 5), (2, 4, 6)]", "[[1, 3, 5], [2, 4, 6]]"],
    answer: 2,
    explanation: "`zip(*m)` unpacks the rows as separate arguments, so zip pairs the first elements of every row, then the second elements: that's the transpose, as tuples. Use `[list(r) for r in zip(*m)]` for lists.",
    optionExplanations: ["zip groups elements; it doesn't flatten.", "That's the original matrix.", "Correct.", "zip produces tuples, not lists."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-stdlib-015", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(sum([[1], [2, 3]], []))\ntry:\n    sum(['a', 'b'], '')\nexcept TypeError:\n    print('use join')",
    options: ["[1, 2, 3] and then ab", "[1, 2, 3] and then use join", "TypeError", "6 and then use join"],
    answer: 1,
    explanation: "sum(iterable, start) adds items to start with +, so with start=[] it concatenates lists (quadratic time — use itertools.chain for large inputs). sum() explicitly refuses strings and tells you to use ''.join() instead.",
    optionExplanations: ["sum() rejects string starts.", "Correct.", "Summing lists with a list start is allowed.", "The lists are concatenated, not their numbers added."]
  },
  {
    id: "py-stdlib-016", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(pow(3, 4, 5), abs(-2.5), round(1.2345, 2), divmod(17, 5))",
    options: ["1 2.5 1.23 (2, 3)", "81 2.5 1.23 (3, 2)", "1 -2.5 1.24 (3, 2)", "1 2.5 1.23 (3, 2)"],
    answer: 3,
    explanation: "Three-argument pow(b, e, m) computes (b ** e) % m efficiently: 81 % 5 = 1 — handy for modular exponentiation in cryptography and competitive programming. abs gives magnitude; round(x, 2) rounds to 2 decimals; divmod returns (quotient, remainder).",
    optionExplanations: ["divmod returns quotient first.", "The third argument applies modulo 5.", "abs removes the sign and 1.2345 rounds to 1.23.", "Correct."]
  },
  {
    id: "py-stdlib-017", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from collections import Counter\nc = Counter('aabbbc')\nprint(c.most_common(2), c - Counter('bbbb'))",
    options: ["[('b', 3), ('a', 2)] Counter({'a': 2, 'c': 1})", "[('a', 2), ('b', 3)] Counter({'a': 2, 'b': -1, 'c': 1})", "[('b', 3), ('a', 2)] Counter({'a': 2, 'b': -1, 'c': 1})", "['b', 'a'] Counter({'a': 2, 'c': 1})"],
    answer: 0,
    explanation: "most_common(n) returns the n highest counts as (item, count) pairs. Counter subtraction with `-` keeps only POSITIVE counts, so b (3 - 4 = -1) disappears. (`c.subtract()` keeps negatives.)",
    optionExplanations: ["Correct.", "most_common sorts by count descending, and - drops non-positive counts.", "The - operator drops non-positive counts.", "most_common returns (item, count) pairs."]
  },
  {
    id: "py-stdlib-018", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from collections import defaultdict\nd = defaultdict(list)\nprint('k' in d, end=' ')\nd['k']\nprint('k' in d, dict(d))",
    options: ["False False {}", "False True {'k': []}", "True True {'k': []}", "False KeyError"],
    answer: 1,
    explanation: "The `in` test and .get() don't trigger the default factory, but plain indexing `d['k']` does — even just reading it. This can silently insert keys you only meant to check; use `in` or .get() for lookups.",
    optionExplanations: ["Reading d['k'] inserted the key.", "Correct.", "The key doesn't exist before it's accessed.", "defaultdict never raises KeyError on indexing."],
    tags: ["trap"]
  },
  {
    id: "py-stdlib-019", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from collections import deque\nd = deque(range(5), maxlen=3)\nprint(list(d), end=' ')\nd.rotate(1)\nprint(list(d))",
    options: ["[0, 1, 2] [2, 0, 1]", "[0, 1, 2, 3, 4] [4, 0, 1, 2, 3]", "[2, 3, 4] [3, 4, 2]", "[2, 3, 4] [4, 2, 3]"],
    answer: 3,
    explanation: "A deque with maxlen discards items from the opposite end when full, so filling it with 0..4 keeps the last three: [2, 3, 4] (handy for 'last N items'). rotate(1) moves the rightmost element to the left.",
    optionExplanations: ["Older items are dropped from the left as new ones arrive.", "maxlen limits the deque to 3 items.", "rotate(1) rotates right, moving 4 to the front.", "Correct."]
  },
  {
    id: "py-stdlib-020", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from collections import namedtuple\nPoint = namedtuple('Point', 'x y')\np = Point(1, 2)\nprint(p.x + p[1], p._replace(x=9))\ntry:\n    p.x = 5\nexcept AttributeError:\n    print('immutable')",
    options: ["3 Point(x=9, y=2) and then immutable", "3 Point(x=9, y=2) and then nothing", "3 (9, 2) and then immutable", "TypeError"],
    answer: 0,
    explanation: "namedtuple creates a tuple subclass whose fields are accessible by name AND index. Like tuples, instances are immutable, so `_replace` returns a NEW instance with some fields changed.",
    optionExplanations: ["Correct.", "Assigning a field raises AttributeError.", "The repr includes field names.", "Name and index access both work."]
  },
  {
    id: "py-stdlib-021", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from collections import OrderedDict\nod = OrderedDict.fromkeys('abc')\nod.move_to_end('a')\nprint(''.join(od), od.popitem(last=False))",
    options: ["bca ('a', None)", "abc ('a', None)", "bca ('b', None)", "cab ('c', None)"],
    answer: 2,
    explanation: "OrderedDict adds order-manipulation methods: `move_to_end(key)` marks a key as most recent, and `popitem(last=False)` removes the oldest (FIFO). Together they're the classic way to implement an LRU cache.",
    optionExplanations: ["After moving 'a', the oldest key is 'b'.", "move_to_end moved 'a' to the end.", "Correct.", "Only 'a' was moved."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-stdlib-022", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from itertools import permutations, combinations, product\nprint(len(list(permutations('abcd', 2))), len(list(combinations('abcd', 2))), len(list(product('ab', repeat=3))))",
    options: ["12 6 8", "6 12 8", "12 6 6", "16 6 9"],
    answer: 0,
    explanation: "Ordered selections: P(4, 2) = 4 × 3 = 12. Unordered: C(4, 2) = 6. product with repeat=3 is the Cartesian product of 'ab' with itself 3 times: 2³ = 8.",
    optionExplanations: ["Correct.", "Permutations count order, so they outnumber combinations.", "product('ab', repeat=3) has 2³ = 8 tuples.", "Permutations don't reuse elements, so it's 4 × 3, not 4²."]
  },
  {
    id: "py-stdlib-023", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from itertools import groupby\nprint([(k, len(list(g))) for k, g in groupby('aabba')])",
    options: ["[('a', 3), ('b', 2)]", "[('a', 2), ('b', 2), ('a', 1)]", "[('a', 2), ('b', 2)]", "[('a', 1), ('b', 1)]"],
    answer: 1,
    explanation: "groupby groups CONSECUTIVE equal elements only, like the Unix `uniq` command. A key that appears again later starts a new group. To group all equal items, sort by the key first.",
    optionExplanations: ["That would require sorting first.", "Correct.", "The trailing 'a' forms its own group.", "Group sizes count consecutive repeats."],
    tags: ["trap"]
  },
  {
    id: "py-stdlib-024", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from itertools import accumulate, chain, islice, cycle\nimport operator\nprint(list(accumulate([1, 2, 3, 4])), list(accumulate([1, 2, 3, 4], operator.mul)), list(chain([1], 'ab')), list(islice(cycle('ab'), 5)))",
    options: ["[1, 3, 6, 10] [1, 2, 6, 24] [1, 'ab'] ['a', 'b', 'a', 'b', 'a']", "[10] [24] [1, 'ab'] ['a', 'b']", "[1, 3, 6, 10] [1, 2, 6, 24] [1, 'a', 'b'] ['a', 'b', 'a', 'b', 'a']", "[1, 2, 3, 4] [1, 2, 3, 4] [1, 'a', 'b'] ['a', 'b']"],
    answer: 2,
    explanation: "accumulate yields running totals (prefix sums) or running results of any binary function. chain concatenates iterables lazily (a string contributes its characters). cycle repeats forever, so islice is needed to take a finite prefix.",
    optionExplanations: ["chain iterates the string, adding 'a' and 'b' separately.", "accumulate yields every intermediate result.", "Correct.", "accumulate produces running results."]
  },
  {
    id: "py-stdlib-025", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import heapq\nnums = [5, 1, 8, 3, 9]\nh = [-x for x in nums]\nheapq.heapify(h)\nprint(heapq.nlargest(2, nums), heapq.nsmallest(2, nums), -heapq.heappop(h))",
    options: ["[9, 8] [1, 3] 9", "[8, 9] [1, 3] 1", "[9, 8] [1, 3] -9", "[9, 8] [3, 1] 9"],
    answer: 0,
    explanation: "nlargest/nsmallest return the top-k in sorted order (O(n log k)). Python has no max-heap, so negate values: the smallest negative is the largest original. Negate again when popping.",
    optionExplanations: ["Correct.", "nlargest returns descending order, and the negated heap gives the max.", "The value is negated back to positive.", "nsmallest returns ascending order."]
  },
  {
    id: "py-stdlib-026", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import heapq\nh = []\nfor item in [(2, 'b'), (1, 'z'), (1, 'a')]:\n    heapq.heappush(h, item)\nprint([heapq.heappop(h) for _ in range(3)])",
    options: ["TypeError", "[(1, 'z'), (1, 'a'), (2, 'b')]", "[(2, 'b'), (1, 'z'), (1, 'a')]", "[(1, 'a'), (1, 'z'), (2, 'b')]"],
    answer: 3,
    explanation: "heapq compares items with <. Tuples compare lexicographically, so the priority (first element) decides and ties fall back to the second element: (1, 'a') < (1, 'z'). If the second elements weren't comparable, you'd add a counter as a tie-breaker.",
    optionExplanations: ["These tuples are comparable.", "Ties are broken by comparing the second element.", "heappop returns smallest first.", "Correct."]
  },
  {
    id: "py-stdlib-027", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import bisect\na = [1, 2, 2, 3]\nprint(bisect.bisect_left(a, 2), bisect.bisect_right(a, 2), end=' ')\nbisect.insort(a, 2)\nprint(a)",
    options: ["2 3 [1, 2, 2, 3, 2]", "1 2 [1, 2, 2, 2, 3]", "1 3 [1, 2, 2, 2, 3]", "1 3 [1, 2, 2, 3]"],
    answer: 2,
    explanation: "On a sorted list, bisect_left returns the first index where the value could be inserted (before existing equal elements) and bisect_right the index after them, in O(log n). insort inserts while keeping the list sorted (the search is O(log n), the insertion O(n)).",
    optionExplanations: ["bisect_left goes before the first 2, index 1.", "bisect_right goes past both 2s, to index 3.", "Correct.", "insort adds an element."]
  },
  {
    id: "py-stdlib-028", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from functools import cmp_to_key\n\ndef cmp(a, b):\n    return b - a\n\nprint(sorted([3, 1, 2], key=cmp_to_key(cmp)))",
    options: ["[1, 2, 3]", "[3, 2, 1]", "TypeError", "[3, 1, 2]"],
    answer: 1,
    explanation: "Python 3's sort only takes key functions. functools.cmp_to_key adapts an old-style comparator (negative/zero/positive) into a key. Here b - a is negative when a > b, putting larger numbers first.",
    optionExplanations: ["The comparator reverses the order.", "Correct.", "cmp_to_key makes the comparator usable as a key.", "The list is sorted."]
  },
  {
    id: "py-stdlib-029", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "concept",
    question: "Which statement about Python's built-in sort (Timsort) is correct?",
    options: ["It's O(n²) in the worst case like quicksort", "It's stable, O(n log n) worst case, and close to O(n) on already sorted or nearly sorted data", "It's unstable but uses O(1) extra memory", "It only works on lists of numbers"],
    answer: 1,
    explanation: "Timsort is a hybrid of merge sort and insertion sort that detects existing sorted runs. It guarantees O(n log n) worst case, is stable, and is adaptive (≈ O(n) for sorted input). It needs up to O(n) extra memory. It sorts anything comparable with <.",
    optionExplanations: ["Timsort's worst case is O(n log n).", "Correct.", "It's stable and uses O(n) auxiliary space.", "Any mutually comparable objects work."]
  },
  {
    id: "py-stdlib-030", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(isinstance(3.0, (int, float)), isinstance('3', (int, float)), list(filter(str.isdigit, ['1', 'a', '22'])))",
    options: ["True True ['1', '22']", "False False ['1', '22']", "True False ['1', '22']", "True False ['a']"],
    answer: 2,
    explanation: "isinstance accepts a tuple of types and returns True if the object is an instance of any of them. filter(func, iterable) keeps items for which func returns True; an unbound method like str.isdigit works as the function.",
    optionExplanations: ["'3' is a str, not a number.", "3.0 is a float, which is in the tuple.", "Correct.", "filter keeps the digit strings."]
  },
  {
    id: "py-stdlib-031", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(int('ff', 16), int('0b101', 0), int('12', 8), bin(5), hex(255), oct(8))",
    options: ["255 5 10 0b101 0xFF 0o10", "255 101 12 0b101 0xff 0o10", "15 5 10 101 ff 10", "255 5 10 0b101 0xff 0o10"],
    answer: 3,
    explanation: "int(s, base) parses a string in the given base; base 0 infers the base from a prefix (0b, 0o, 0x). bin/hex/oct return strings with lowercase prefixes 0b, 0x, 0o.",
    optionExplanations: ["hex() uses lowercase letters.", "Base 0 understands the 0b prefix, and '12' in base 8 is 10.", "'ff' in base 16 is 255, and bin/hex/oct include prefixes.", "Correct."]
  },
  {
    id: "py-stdlib-032", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "concept",
    question: "Why is `eval(input())` dangerous, and what's the safer alternative for parsing a user-supplied literal like `[1, 2, 3]`?",
    options: ["eval is slow; use exec instead", "eval executes arbitrary Python code (e.g. `__import__('os').system(...)`); use `ast.literal_eval`, which only accepts literals", "eval can't parse lists; use json.loads", "There's no risk if the program runs locally"],
    answer: 1,
    explanation: "eval/exec run any expression or code with the program's privileges, so untrusted input can delete files or exfiltrate data. `ast.literal_eval` safely evaluates only Python literals (numbers, strings, tuples, lists, dicts, sets, booleans, None). For JSON data, use json.loads.",
    optionExplanations: ["exec is equally dangerous.", "Correct.", "eval can parse lists; that's not the issue.", "Local scripts often process untrusted files or input too."]
  },
  {
    id: "py-stdlib-033", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class P:\n    def __init__(self):\n        self.a = 1\n        self.b = 'x'\n\nprint(vars(P()), hash((1, 2)) == hash((1, 2)), id(None) == id(None))",
    options: ["{'a': 1, 'b': 'x'} False True", "{} True True", "{'a': 1, 'b': 'x'} True True", "['a', 'b'] True False"],
    answer: 2,
    explanation: "vars(obj) returns the object's __dict__. Equal hashable objects always have equal hashes (required for dicts and sets). None is a singleton, so its id is always the same.",
    optionExplanations: ["Equal tuples must hash equally.", "vars() returns the instance attributes.", "Correct.", "vars returns a dict, and None has one identity."]
  },
  {
    id: "py-stdlib-034", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "data = [('a', 1), ('b', 1), ('c', 0)]\nprint(sorted(data, key=lambda t: t[1], reverse=True))",
    options: ["[('b', 1), ('a', 1), ('c', 0)]", "[('c', 0), ('a', 1), ('b', 1)]", "[('c', 0), ('b', 1), ('a', 1)]", "[('a', 1), ('b', 1), ('c', 0)]"],
    answer: 3,
    explanation: "reverse=True is NOT the same as sorting then reversing: Python preserves stability, so elements with equal keys keep their original order even in a descending sort. ('a', 1) stays before ('b', 1). `sorted(...)[::-1]` would swap them.",
    optionExplanations: ["That's what sorted(...)[::-1] would produce.", "That's the ascending order.", "reverse=True puts larger keys first.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-stdlib-035", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "from itertools import groupby\ngs = list(groupby('aabb'))\nprint([k for k, g in gs], [list(g) for k, g in gs])",
    options: ["['a', 'b'] [['a', 'a'], ['b', 'b']]", "['a', 'b'] [[], []]", "['a', 'a', 'b', 'b'] [[], []]", "['a', 'b'] [[], ['b', 'b']]"],
    answer: 1,
    explanation: "The group iterators returned by groupby share the underlying iterator with the groupby object. Once groupby advances to the next key, the previous group's iterator is invalidated. list(groupby(...)) advances through everything, so every stored group comes back empty. Consume each group immediately (e.g. `[(k, list(g)) for k, g in groupby(s)]`).",
    optionExplanations: ["The groups were invalidated before being consumed.", "Correct.", "Keys are still collected correctly, one per run.", "The last group is also exhausted when groupby finishes."],
    tags: ["trap"]
  },
  {
    id: "py-stdlib-036", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "from collections import Counter\nc = Counter(a=1)\nc.subtract({'a': 3})\nprint(c['a'], +c, Counter(a=2, b=1).total())",
    options: ["0 Counter({'a': 0}) 2", "0 Counter() 3", "-2 Counter({'a': -2}) 3", "-2 Counter() 3"],
    answer: 3,
    explanation: "Unlike the `-` operator, `subtract()` keeps zero and negative counts, so a becomes -2. Unary `+c` returns a new Counter with only positive counts (empty here). `total()` (3.10+) sums all counts.",
    optionExplanations: ["total() is 2 + 1 = 3.", "subtract() can make counts negative.", "Unary + removes non-positive counts.", "Correct."]
  },
  {
    id: "py-stdlib-037", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "import json\nfrom collections import defaultdict\n\ntree = lambda: defaultdict(tree)\nt = tree()\nt['a']['b'] = 1\nt['a']['c']['d'] = 2\nprint(json.dumps(t))",
    options: ["{\"a\": {\"b\": 1, \"c\": {\"d\": 2}}}", "KeyError", "{\"a\": {\"b\": 1}}", "TypeError"],
    answer: 0,
    explanation: "A defaultdict whose factory creates another such defaultdict gives an auto-vivifying tree: any missing key on any level creates a new nested level. defaultdict is a dict subclass, so json.dumps serialises it like a normal dict.",
    optionExplanations: ["Correct.", "Missing keys are created automatically at every level.", "The nested c → d branch was also created.", "defaultdict serialises fine."]
  },
  {
    id: "py-stdlib-038", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "hard", type: "concept",
    question: "What are the time complexities of `heapq.heapify(lst)` on n items versus pushing the n items one by one with `heappush`?",
    options: ["O(n log n) vs O(n)", "O(n) vs O(n log n)", "O(log n) vs O(n)", "Both O(n²)"],
    answer: 1,
    explanation: "heapify uses a bottom-up sift-down construction whose total work is bounded by O(n) (most nodes are near the leaves and move only a little). n separate heappush calls each cost O(log n), totalling O(n log n). heappop is O(log n) and peeking at h[0] is O(1).",
    optionExplanations: ["It's the other way round.", "Correct.", "heapify must touch every element, so at least O(n).", "Neither is quadratic."]
  },
  {
    id: "py-stdlib-039", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "pairs = [(1, 'b'), (0, 'x'), (1, 'a'), (0, 'y')]\nprint(min(pairs, key=lambda t: t[0]), max(pairs, key=lambda t: t[0]))",
    options: ["(0, 'x') (1, 'b')", "(0, 'x') (1, 'a')", "(0, 'y') (1, 'b')", "(0, 'x') (0, 'y')"],
    answer: 0,
    explanation: "When several items share the minimal (or maximal) key, min() and max() return the FIRST one encountered. Only the key is compared, so the second elements of the tuples don't break the tie.",
    optionExplanations: ["Correct.", "max returns the first item with the largest key, (1, 'b').", "min returns the first item with key 0, (0, 'x').", "max looks for the largest key, which is 1."]
  },
  {
    id: "py-stdlib-040", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "from collections import ChainMap\ndefaults = {'color': 'red', 'size': 'M'}\nuser = {'color': 'blue'}\ncfg = ChainMap(user, defaults)\ncfg['size'] = 'L'\nprint(cfg['color'], cfg['size'], defaults['size'], user)",
    options: ["blue L M {'color': 'blue', 'size': 'L'}", "red L L {'color': 'blue'}", "blue L L {'color': 'blue'}", "blue M M {'color': 'blue'}"],
    answer: 0,
    explanation: "ChainMap looks keys up through its mappings in order (user first, then defaults), which is ideal for layered configuration. Writes, however, always go to the FIRST mapping, so setting 'size' adds it to user and leaves defaults unchanged.",
    optionExplanations: ["Correct.", "Lookups find 'blue' in user first.", "Writes go to the first mapping, not defaults.", "The write of 'L' is visible through the ChainMap."]
  },
  {
    id: "py-stdlib-041", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from itertools import combinations_with_replacement, permutations\nprint(list(combinations_with_replacement('ab', 2)), len(list(permutations(range(4)))))",
    options: ["[('a', 'a'), ('b', 'b')] 12", "[('a', 'b')] 24", "[('a', 'a'), ('a', 'b'), ('b', 'a'), ('b', 'b')] 16", "[('a', 'a'), ('a', 'b'), ('b', 'b')] 24"],
    answer: 3,
    explanation: "combinations_with_replacement allows an element to repeat but ignores order, so ('b', 'a') isn't produced separately from ('a', 'b'). permutations of 4 items taken all at a time is 4! = 24.",
    optionExplanations: ["('a', 'b') is included, and 4! = 24.", "With replacement, ('a', 'a') and ('b', 'b') are included.", "Order doesn't matter in combinations, and 4! = 24.", "Correct."]
  },
  {
    id: "py-stdlib-042", subject: "python", subtopic: "Built-ins & Standard Library", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "from collections import OrderedDict\n\nclass LRU:\n    def __init__(self, cap):\n        self.cap, self.d = cap, OrderedDict()\n    def get(self, k):\n        if k not in self.d:\n            return -1\n        self.d.move_to_end(k)\n        return self.d[k]\n    def put(self, k, v):\n        self.d[k] = v\n        self.d.move_to_end(k)\n        if len(self.d) > self.cap:\n            self.d.popitem(last=False)\n\nc = LRU(2)\nc.put(1, 'a'); c.put(2, 'b')\nc.get(1)\nc.put(3, 'c')\nprint(c.get(2), c.get(1), c.get(3))",
    options: ["-1 a c", "b -1 c", "b a -1", "-1 -1 c"],
    answer: 0,
    explanation: "get(1) marks key 1 as most recently used, so key 2 becomes the least recently used. Inserting key 3 exceeds the capacity and evicts the oldest entry (2). This OrderedDict pattern is the classic LRU-cache interview solution with O(1) operations.",
    optionExplanations: ["Correct.", "Key 2 was evicted, not key 1.", "Key 3 was just inserted and is present.", "Key 1 survived because it was recently used."],
    tags: ["interview-favourite"]
  }
);
