/* Python — Lists, Tuples, Sets & Dicts */
window.QUESTIONS.push(
  {
    id: "py-containers-001", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2]\na.append([3, 4])\nb = [1, 2]\nb.extend([3, 4])\nprint(len(a), len(b))",
    options: ["4 4", "3 3", "3 4", "4 3"],
    answer: 2,
    explanation: "`append(x)` adds x as a single element, so the whole list [3, 4] becomes one nested element (length 3). `extend(iterable)` adds each element of the iterable individually (length 4).",
    optionExplanations: ["append adds the list as ONE element.", "extend adds each element separately.", "Correct: append nests, extend flattens one level.", "The results are swapped."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-containers-002", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "x = [3, 1, 2].sort()\nprint(x)",
    options: ["[1, 2, 3]", "[3, 1, 2]", "AttributeError", "None"],
    answer: 3,
    explanation: "`list.sort()` sorts the list in place and returns None (a convention for mutating methods, like append and reverse). The sorted list here is a temporary that's immediately discarded. Use `sorted(...)` to get a new sorted list.",
    optionExplanations: ["sort() does not return the list.", "x is not the list at all.", "Lists do have a sort method.", "Correct: in-place methods return None."],
    tags: ["trap"]
  },
  {
    id: "py-containers-003", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(len({1, 2, 2, 3}), type({}).__name__)",
    options: ["4 set", "4 dict", "3 set", "3 dict"],
    answer: 3,
    explanation: "Sets store unique elements, so the duplicate 2 is dropped and the length is 3. Empty braces `{}` create an empty DICT, not a set; an empty set must be written `set()`.",
    optionExplanations: ["Duplicates are removed, and {} is a dict.", "The duplicate 2 is removed, giving length 3.", "{} is an empty dict.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-containers-004", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(type((1)).__name__, type((1,)).__name__)",
    options: ["int tuple", "tuple tuple", "int int", "tuple int"],
    answer: 0,
    explanation: "Parentheses alone only group an expression, so `(1)` is just the int 1. The comma is what makes a tuple: `(1,)` (or simply `1,`) is a one-element tuple.",
    optionExplanations: ["Correct: the trailing comma makes the tuple.", "(1) is just a parenthesised int.", "(1,) is a tuple because of the comma.", "The results are swapped."]
  },
  {
    id: "py-containers-005", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "d = {'a': 1}\nprint(d.get('b'), d.get('b', 0))",
    options: ["KeyError", "0 0", "None None", "None 0"],
    answer: 3,
    explanation: "`dict.get(key, default=None)` returns the value if the key exists and otherwise returns the default without raising. With no default given, it returns None. `d['b']` would raise KeyError.",
    optionExplanations: ["get() never raises KeyError.", "Without a default, get() returns None.", "The second call supplies 0 as the default.", "Correct."]
  },
  {
    id: "py-containers-006", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What happens when this code runs?",
    code: "d = {'a': 1}\nprint(d['b'])",
    options: ["It prints None", "It raises KeyError", "It prints 0", "It raises IndexError"],
    answer: 1,
    explanation: "Square-bracket access on a missing key raises `KeyError: 'b'`. Use `get()`, `in`, `setdefault()` or a `defaultdict` when the key may be missing.",
    optionExplanations: ["Only get() returns None for missing keys.", "Correct.", "Dicts have no implicit default value.", "IndexError is for sequences; dicts raise KeyError."]
  },
  {
    id: "py-containers-007", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "concept",
    question: "What is the average time complexity of `x in s` when `s` is a set, and when `s` is a list?",
    options: ["O(1) for both", "O(log n) for set, O(n) for list", "O(1) for set, O(n) for list", "O(n) for both"],
    answer: 2,
    explanation: "Sets (and dict keys) are hash tables: membership hashes x and checks one bucket, which is O(1) on average. A list has no index on values, so `in` scans elements one by one: O(n). Converting a list to a set first is a common optimisation for repeated lookups.",
    optionExplanations: ["A list must be scanned linearly.", "Python sets are hash tables, not balanced trees.", "Correct.", "Hashing makes set membership constant time on average."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-containers-008", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2, 3, 2]\na.remove(2)\nprint(a)",
    options: ["[1, 3]", "[1, 2, 3]", "[1, 3, 2]", "[1, 2, 2]"],
    answer: 2,
    explanation: "`list.remove(x)` deletes only the FIRST element equal to x (and raises ValueError if there is none). To remove by index use `pop(i)` or `del a[i]`; to remove all occurrences, rebuild the list with a comprehension.",
    optionExplanations: ["Only one occurrence is removed.", "remove() takes a value, not an index; it does not delete index 2.", "Correct: the first 2 is removed.", "The value 2 is removed, not the value 3."]
  },
  {
    id: "py-containers-009", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "a = [10, 20, 30]\nprint(a.pop(), a.pop(0), a)",
    options: ["30 10 [20]", "10 30 [20]", "30 10 [10, 20, 30]", "30 20 [10]"],
    answer: 0,
    explanation: "`pop()` with no argument removes and returns the last element (30). `pop(0)` removes and returns the element at index 0 (10). Arguments are evaluated left to right, so by the time `a` is printed only [20] remains.",
    optionExplanations: ["Correct.", "pop() without an index removes the LAST element.", "pop() mutates the list, and a is evaluated after both pops.", "After the first pop, index 0 is still 10."]
  },
  {
    id: "py-containers-010", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output (Python 3.7+)?",
    code: "d = {'b': 1, 'a': 2}\nd['c'] = 3\nd['b'] = 9\nprint(list(d))",
    options: ["['a', 'b', 'c']", "['b', 'a', 'c']", "['a', 'c', 'b']", "The order is undefined"],
    answer: 1,
    explanation: "Since Python 3.7, dicts are guaranteed to preserve insertion order. Updating the value of an existing key does not move it, so 'b' stays first. Iterating a dict (or calling list(d)) yields its keys.",
    optionExplanations: ["Dicts are not sorted by key.", "Correct: insertion order, unaffected by value updates.", "Updating a value does not re-insert the key at the end.", "Insertion order has been a language guarantee since 3.7."]
  },
  {
    id: "py-containers-011", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "a, b = 1, 2\na, b = b, a\nprint(a, b)",
    options: ["1 2", "2 2", "2 1", "1 1"],
    answer: 2,
    explanation: "The right-hand side `b, a` is evaluated first and packed into a tuple (2, 1); then that tuple is unpacked into a and b. No temporary variable is needed for a swap.",
    optionExplanations: ["The values are swapped.", "The right side is fully evaluated before any assignment, so no value is lost.", "Correct: tuple packing then unpacking.", "Both values are read before either name is rebound."]
  },
  {
    id: "py-containers-012", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "a = {1, 2, 3}\nb = {2, 3, 4}\nprint(a & b, a - b, a ^ b)",
    options: ["{2, 3} {1} {1, 4}", "{2, 3} {1, 4} {1}", "{1, 2, 3, 4} {1} {1, 4}", "{2, 3} {4} {1, 4}"],
    answer: 0,
    explanation: "`&` is intersection (in both), `-` is difference (in a but not b), `^` is symmetric difference (in exactly one of them), and `|` would be union. These are O(len) hash-based operations.",
    optionExplanations: ["Correct.", "a - b contains only elements of a missing from b.", "& is intersection, not union.", "a - b is {1}; 4 is only in b."]
  },
  {
    id: "py-containers-013", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "concept",
    question: "Which statement about tuples versus lists is correct?",
    options: ["Tuples can only hold values of a single type", "Tuples are immutable, so a tuple of hashable values can be a dict key; lists cannot", "Lists use less memory than tuples of the same length", "Tuples do not support indexing or slicing"],
    answer: 1,
    explanation: "Tuples are immutable sequences: you can index and slice them, but not change their contents. Because of that, a tuple of hashable elements is hashable and can be a dict key or set element. Tuples are also slightly smaller and faster to create than lists.",
    optionExplanations: ["Both tuples and lists can hold mixed types.", "Correct.", "Tuples are typically smaller (no over-allocation for growth).", "Tuples support indexing and slicing."]
  },
  {
    id: "py-containers-014", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "g = [[0] * 3] * 3\ng[0][0] = 1\nprint(g)",
    options: ["[[1, 0, 0], [0, 0, 0], [0, 0, 0]]", "[[1, 1, 1], [0, 0, 0], [0, 0, 0]]", "[[1, 0, 0], [1, 0, 0], [1, 0, 0]]", "[[1, 1, 1], [1, 1, 1], [1, 1, 1]]"],
    answer: 2,
    explanation: "`[row] * 3` copies the REFERENCE to the same inner list three times; it does not copy the inner list. All three rows are one object, so changing g[0][0] shows up in every row. Create independent rows with `[[0] * 3 for _ in range(3)]`.",
    optionExplanations: ["That would be the result with independent rows (a comprehension).", "Only index 0 of the row is set.", "Correct: all three rows are the same list object.", "Only column 0 is assigned."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "py-containers-015", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "a = [[1, 2], [3]]\nb = a.copy()\nb[0].append(9)\nb.append([4])\nprint(a)",
    options: ["[[1, 2], [3]]", "[[1, 2, 9], [3], [4]]", "[[1, 2], [3], [4]]", "[[1, 2, 9], [3]]"],
    answer: 3,
    explanation: "`copy()` (like `a[:]` or `list(a)`) makes a SHALLOW copy: a new outer list whose elements are references to the same inner lists. Mutating an inner list via b is visible through a, but appending to b only changes b's outer list.",
    optionExplanations: ["The inner list [1, 2] is shared, so the 9 shows up.", "b.append affects only b's outer list.", "The inner append is shared but the outer append is not.", "Correct: inner objects are shared, outer lists are separate."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-containers-016", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import copy\na = [[1], [2]]\nb = copy.deepcopy(a)\nb[0].append(5)\nprint(a, b)",
    options: ["[[1, 5], [2]] [[1, 5], [2]]", "[[1], [2]] [[1, 5], [2]]", "[[1], [2]] [[1], [2]]", "[[1, 5], [2]] [[1], [2]]"],
    answer: 1,
    explanation: "`copy.deepcopy` recursively copies every nested object, so a and b share nothing mutable. Modifying b[0] leaves a untouched. Deep copies are slower and handle cycles via a memo dictionary.",
    optionExplanations: ["That would be the result of a shallow copy.", "Correct: deep copy makes independent inner lists.", "b's inner list was changed.", "The modification was made through b, not a."]
  },
  {
    id: "py-containers-017", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2, 2, 3]\nfor x in a:\n    if x == 2:\n        a.remove(x)\nprint(a)",
    options: ["[1, 3]", "[1, 2, 3]", "[1, 2, 2, 3]", "RuntimeError"],
    answer: 1,
    explanation: "A for loop over a list walks an internal index. At index 1, x is 2, so the first 2 is removed; the list shifts to [1, 2, 3]. The next index is 2, which is now 3, so the second 2 (now at index 1) is skipped. Iterate over a copy (`a[:]`) or build a new list instead.",
    optionExplanations: ["The second 2 is skipped because elements shift left after removal.", "Correct: removing during iteration skips the next element.", "One 2 is definitely removed.", "Lists don't detect modification during iteration (dicts and sets do)."],
    tags: ["trap", "interview-favourite"]
  },
  {
    id: "py-containers-018", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2, 3, 4, 5]\na[1:3] = ['x']\nprint(a)",
    options: ["[1, 'x', 4, 5]", "[1, 'x', 3, 4, 5]", "[1, ['x'], 4, 5]", "ValueError"],
    answer: 0,
    explanation: "Assigning to a simple slice replaces that slice (indices 1 and 2) with the elements of the right-hand iterable, and the list can grow or shrink. Two elements are replaced by one, so the list gets shorter.",
    optionExplanations: ["Correct.", "The slice 1:3 covers two elements, both of which are replaced.", "The elements of the iterable are inserted, not the list itself.", "Only EXTENDED slices (with a step) require equal lengths."]
  },
  {
    id: "py-containers-019", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "a, *b, c = [1, 2, 3, 4, 5]\nprint(a, b, c)",
    options: ["1 (2, 3, 4) 5", "ValueError", "1 2 3", "1 [2, 3, 4] 5"],
    answer: 3,
    explanation: "Extended unpacking: the starred name collects all remaining items as a LIST (even when unpacking a tuple), after the non-starred names take their positions from the start and end.",
    optionExplanations: ["Starred targets always produce a list, not a tuple.", "The counts work out because *b can take any number of items.", "The starred target absorbs the middle elements.", "Correct."]
  },
  {
    id: "py-containers-020", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print((1, 2, 3) < (1, 3), (2,) > (1, 9, 9))",
    options: ["False True", "True False", "False False", "True True"],
    answer: 3,
    explanation: "Sequences compare lexicographically: compare element by element until the first difference decides. (1, 2, 3) vs (1, 3): at index 1, 2 < 3, so True; length doesn't matter. (2,) vs (1, 9, 9): 2 > 1 at index 0, so True.",
    optionExplanations: ["The first difference (2 vs 3) decides the first comparison.", "The first element 2 > 1 decides the second.", "Both comparisons are decided by the first differing element.", "Correct: lexicographic comparison."]
  },
  {
    id: "py-containers-021", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "d = {'a': 1}\nk = d.keys()\nd['b'] = 2\nprint(list(k))",
    options: ["['a']", "['a', 'b']", "RuntimeError", "dict_keys(['a'])"],
    answer: 1,
    explanation: "`keys()`, `values()` and `items()` return VIEW objects, which reflect the dict's current state rather than a snapshot. Converting the view to a list after the insertion shows both keys.",
    optionExplanations: ["Views are dynamic, not snapshots.", "Correct.", "The dict was not changed during iteration, so nothing is raised.", "list(k) converts the view into a list."]
  },
  {
    id: "py-containers-022", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What happens when this code runs?",
    code: "d = {'a': 1, 'b': 2}\nfor k in d:\n    d[k * 2] = 0\nprint(d)",
    options: ["It prints {'a': 1, 'b': 2, 'aa': 0, 'bb': 0}", "It raises RuntimeError", "It loops forever", "It prints {'a': 1, 'b': 2, 'aa': 0}"],
    answer: 1,
    explanation: "Adding or removing keys while iterating over a dict raises `RuntimeError: dictionary changed size during iteration`. Iterate over a snapshot such as `list(d)` if you need to modify the dict inside the loop. (Changing values of existing keys is allowed.)",
    optionExplanations: ["The size change is detected on the next iteration step.", "Correct.", "CPython detects the change and raises instead of looping.", "The error is raised as soon as the next key is requested."],
    tags: ["trap"]
  },
  {
    id: "py-containers-023", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output (Python 3.9+)?",
    code: "a = {'x': 1, 'y': 2}\nb = {'y': 3, 'z': 4}\nprint(a | b, {**b, **a}['y'])",
    options: ["{'x': 1, 'y': 3, 'z': 4} 2", "{'x': 1, 'y': 2, 'z': 4} 2", "{'x': 1, 'y': 3, 'z': 4} 3", "TypeError"],
    answer: 0,
    explanation: "The dict union operator `|` (3.9+) merges two dicts into a new one; for duplicate keys the RIGHT operand wins, so 'y' is 3. Unpacking `{**b, **a}` follows the same rule (later wins), so here a's 'y' (2) overrides b's.",
    optionExplanations: ["Correct.", "With a | b, b's value for 'y' wins.", "In {**b, **a}, a comes last, so 'y' is 2.", "Dicts support | since Python 3.9."]
  },
  {
    id: "py-containers-024", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "d = {}\nd.setdefault('k', []).append(1)\nd.setdefault('k', []).append(2)\nprint(d)",
    options: ["{'k': [2]}", "{'k': [1]}", "{'k': [1, 2]}", "{'k': [[1], [2]]}"],
    answer: 2,
    explanation: "`setdefault(key, default)` returns the existing value if the key exists; otherwise it inserts the default and returns it. The first call inserts a new list and appends 1; the second call returns that same list and appends 2.",
    optionExplanations: ["The second call doesn't replace the existing list.", "The second append goes to the same list.", "Correct: the list is created once and then reused.", "The same list is reused; no nesting occurs."]
  },
  {
    id: "py-containers-025", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "concept",
    question: "For a Python list of n elements, which operation is O(n)?",
    options: ["`lst.append(x)`", "`lst[i]`", "`lst.pop()`", "`lst.insert(0, x)`"],
    answer: 3,
    explanation: "A list is a dynamic array. Indexing and popping from the end are O(1), and append is amortised O(1). Inserting at (or popping from) the front must shift every element one place, which is O(n). Use `collections.deque` for fast operations at both ends.",
    optionExplanations: ["append is amortised O(1): occasional resizes are spread over many calls.", "Indexing a dynamic array is O(1).", "Removing the last element shifts nothing, so it is O(1).", "Correct: every element must shift right."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-containers-026", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "a = [1]\na += 'ab'\ntry:\n    a = a + 'cd'\nexcept TypeError:\n    print('TypeError', a)",
    options: ["[1, 'ab', 'c', 'd']", "TypeError [1]", "TypeError [1, 'a', 'b']", "[1, 'a', 'b', 'c', 'd']"],
    answer: 2,
    explanation: "`list += iterable` behaves like `extend()`: it accepts ANY iterable, so the string's characters are added. But `list + x` requires x to be a list, so `a + 'cd'` raises TypeError. That asymmetry between `+` and `+=` is a common surprise.",
    optionExplanations: ["+= iterates over the string; it doesn't add it as one item, and + raises.", "+= succeeded before the error.", "Correct.", "list + str raises TypeError."],
    tags: ["trap"]
  },
  {
    id: "py-containers-027", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "d = {'a': 3, 'b': 1, 'c': 2}\nprint(sorted(d, key=d.get), sorted(d.items(), key=lambda kv: -kv[1])[0])",
    options: ["['b', 'c', 'a'] ('a', 3)", "['a', 'b', 'c'] ('a', 3)", "[1, 2, 3] ('a', 3)", "['b', 'c', 'a'] ('b', 1)"],
    answer: 0,
    explanation: "Iterating a dict yields keys, so `sorted(d, key=d.get)` sorts the keys by their values: b(1), c(2), a(3). Sorting items with a key that negates the value gives descending order, so the first pair is ('a', 3).",
    optionExplanations: ["Correct.", "The key function d.get sorts keys by value, not alphabetically.", "sorted(d) yields keys, not values.", "Negating the value sorts in descending order."]
  },
  {
    id: "py-containers-028", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "s = {frozenset([1, 2])}\nprint(frozenset([2, 1]) in s)\ns.add({3})",
    options: ["True, then the program ends normally", "TypeError before anything is printed", "False, then TypeError", "True, then TypeError"],
    answer: 3,
    explanation: "A frozenset is immutable and hashable, so it can be a set element; equal frozensets (order doesn't matter) are found. A normal set is mutable and unhashable, so `s.add({3})` raises a TypeError (the set is unhashable).",
    optionExplanations: ["Adding a mutable set raises TypeError.", "The first line is valid and prints True first.", "Set equality ignores order, so the lookup succeeds.", "Correct."]
  },
  {
    id: "py-containers-029", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2]\nb = [1, 2]\nprint(a == b, a is b)",
    options: ["True True", "False False", "True False", "False True"],
    answer: 2,
    explanation: "`==` compares contents element by element, so two lists with equal elements are equal. Each list literal creates a new object, so they have different identities and `is` is False.",
    optionExplanations: ["Separate literals create separate objects.", "The contents are equal.", "Correct: equal values, different objects.", "Identity can't hold without equality here."]
  },
  {
    id: "py-containers-030", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2, 3]\nprint(a[-3], a[-10:])\nprint(a[-4])",
    options: ["1 [1, 2, 3] and then IndexError", "3 [] and then IndexError", "1 [] and then 1", "1 [1, 2, 3] and then 3"],
    answer: 0,
    explanation: "a[-3] is the first element (len - 3 = index 0). Slices clamp out-of-range bounds, so a[-10:] is the whole list. Direct indexing has no clamping: a[-4] maps to index -1 and raises IndexError.",
    optionExplanations: ["Correct.", "a[-3] counts back three from the end, which is the first element 1.", "a[-10:] is clamped to the start, giving the whole list.", "Negative indices do not wrap around; a[-4] is out of range."]
  },
  {
    id: "py-containers-031", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "a = [0, 1, 2, 3, 4, 5]\ndel a[::2]\nprint(a)",
    options: ["[0, 2, 4]", "[1, 3, 5]", "[]", "TypeError"],
    answer: 1,
    explanation: "`del` works with extended slices: `a[::2]` selects indices 0, 2, 4, and deleting them leaves the odd-index elements [1, 3, 5].",
    optionExplanations: ["Those are the elements that were deleted.", "Correct.", "Only every second element is deleted.", "del supports slices, including extended ones."]
  },
  {
    id: "py-containers-032", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "t = (1, 2, 2, 3)\nprint(t.count(2), t.index(3))",
    options: ["2 3", "1 3", "2 2", "AttributeError"],
    answer: 0,
    explanation: "Tuples are immutable, so they only provide the two non-mutating methods: `count(x)` (2 appears twice) and `index(x)` (the first position of 3 is index 3).",
    optionExplanations: ["Correct.", "2 appears twice.", "index returns a 0-based position; 3 is at index 3.", "Tuples do have count() and index()."]
  },
  {
    id: "py-containers-033", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2]\nb = a.append(3)\nprint(a, b)",
    options: ["[1, 2, 3] [1, 2, 3]", "[1, 2] None", "[1, 2, 3] None", "[1, 2] [1, 2, 3]"],
    answer: 2,
    explanation: "`append` mutates the list in place and returns None, so a becomes [1, 2, 3] while b is None. Chaining or assigning the result of mutating methods (append, sort, reverse, extend) is a common bug.",
    optionExplanations: ["append returns None, not the list.", "a was mutated in place.", "Correct.", "append doesn't create a new list."]
  },
  {
    id: "py-containers-034", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "d = dict.fromkeys(['a', 'b'], [])\nd['a'].append(1)\nprint(d)",
    options: ["{'a': [1], 'b': []}", "{'a': [1], 'b': [1]}", "{'a': 1, 'b': []}", "TypeError"],
    answer: 1,
    explanation: "`dict.fromkeys(keys, value)` uses the SAME value object for every key. With a mutable default like [], all keys share one list, so appending through 'a' is visible through 'b'. Use `{k: [] for k in keys}` instead.",
    optionExplanations: ["That would require a separate list per key.", "Correct: all keys share one list.", "append adds to the list; it doesn't replace it.", "fromkeys accepts any value."],
    tags: ["trap"]
  },
  {
    id: "py-containers-035", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print({'a': 1, 'b': 2} == {'b': 2, 'a': 1}, [1, 2] == [2, 1], {1, 2} == {2, 1})",
    options: ["False False True", "True True True", "True False True", "True False False"],
    answer: 2,
    explanation: "Dict equality compares key-value pairs and ignores insertion order. Lists are ordered sequences, so different order means not equal. Sets are unordered, so equal elements mean equal sets.",
    optionExplanations: ["Dict equality ignores insertion order.", "Lists compare position by position.", "Correct.", "Sets ignore order."]
  },
  {
    id: "py-containers-036", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2, 3, 4]\nfor x in a[:]:\n    if x % 2 == 0:\n        a.remove(x)\nprint(a)",
    options: ["[1, 3]", "[1, 3, 4]", "[2, 4]", "RuntimeError"],
    answer: 0,
    explanation: "Iterating over a shallow copy `a[:]` decouples the loop from the list being modified, so every element is visited and both even numbers are removed. A list comprehension `[x for x in a if x % 2]` is cleaner still.",
    optionExplanations: ["Correct: iterating over a copy avoids skipping.", "No element is skipped because the copy is iterated.", "The even numbers are removed, not kept.", "Modifying a while iterating its copy is safe."]
  },
  {
    id: "py-containers-037", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2, 3]\nb = a[:]\nb[0] = 9\nc = a\nc[1] = 8\nprint(a)",
    options: ["[9, 8, 3]", "[1, 2, 3]", "[9, 2, 3]", "[1, 8, 3]"],
    answer: 3,
    explanation: "`b = a[:]` creates a new list, so changing b[0] doesn't affect a. `c = a` is just another name for the same list, so c[1] = 8 changes a.",
    optionExplanations: ["b is an independent copy, so 9 doesn't reach a.", "c aliases a, so the 8 is visible.", "The change via b doesn't affect a, and the change via c does.", "Correct."]
  },
  {
    id: "py-containers-038", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "a = [[]] * 3\na[0].append(1)\na[1] = [2]\nprint(a)",
    options: ["[[1], [2], [1]]", "[[1], [2], []]", "[[1], [1, 2], [1]]", "[[1, 2], [1, 2], [1, 2]]"],
    answer: 0,
    explanation: "All three slots initially reference ONE empty list. Appending through a[0] mutates that shared list, so all slots show [1]. Then `a[1] = [2]` REBINDS slot 1 to a brand-new list; this doesn't touch the shared list in slots 0 and 2.",
    optionExplanations: ["Correct: mutation is shared, rebinding is not.", "Slot 2 still refers to the shared list containing 1.", "Assignment replaces slot 1; it doesn't append to it.", "a[1] = [2] rebinds; it does not mutate the shared list."],
    tags: ["trap"]
  },
  {
    id: "py-containers-039", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "a = [0, 1, 2, 3, 4, 5]\ntry:\n    a[::2] = [9, 9]\nexcept ValueError:\n    a[::2] = [7, 7, 7]\nprint(a)",
    options: ["[9, 1, 9, 3, 4, 5]", "[7, 1, 7, 3, 7, 5]", "[9, 9, 2, 3, 4, 5]", "[7, 7, 7]"],
    answer: 1,
    explanation: "Assigning to an EXTENDED slice (one with a step) requires the right side to have exactly as many elements as the slice selects. a[::2] selects 3 positions (0, 2, 4), so assigning 2 values raises ValueError; assigning 3 values replaces those positions.",
    optionExplanations: ["The size mismatch raises ValueError, so this assignment never happens.", "Correct.", "Extended slice assignment doesn't shift elements.", "Only the selected positions are replaced; the list keeps its length."],
    tags: ["trap"]
  },
  {
    id: "py-containers-040", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2, 3]\na[1:1] = [7, 8]\na[len(a):] = [4]\na[:0] = [0]\nprint(a)",
    options: ["[0, 1, 7, 8, 3, 4]", "[0, 7, 8, 2, 3, 4]", "[1, 7, 8, 3, 4, 0]", "[0, 1, 7, 8, 2, 3, 4]"],
    answer: 3,
    explanation: "Assigning to an EMPTY slice inserts without replacing anything. `a[1:1]` inserts at index 1; `a[len(a):]` appends at the end; `a[:0]` inserts at the front. The list goes [1, 7, 8, 2, 3] → [1, 7, 8, 2, 3, 4] → [0, 1, 7, 8, 2, 3, 4].",
    optionExplanations: ["Element 2 is not replaced because the slice 1:1 is empty.", "Empty slices insert; they never delete the existing 1.", "a[:0] inserts at the front, not the end.", "Correct."]
  },
  {
    id: "py-containers-041", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print(len({1, True, 1.0, 0, False, 0.0}))",
    options: ["6", "3", "2", "4"],
    answer: 2,
    explanation: "Set membership uses hash and equality. 1 == True == 1.0 and they share a hash, so they collapse into one element; similarly 0 == False == 0.0. Only two distinct elements remain.",
    optionExplanations: ["Equal values with equal hashes are duplicates in a set.", "Numeric equality across int/bool/float merges them.", "Correct: {1, 0}.", "Both groups collapse fully."],
    tags: ["trap"]
  },
  {
    id: "py-containers-042", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "a = [1, 2, 3]\na[1:2] = 'xy'\nprint(a)",
    options: ["[1, 'xy', 3]", "[1, 'x', 'y', 3]", "TypeError", "[1, 'x', 'y', 2, 3]"],
    answer: 1,
    explanation: "Slice assignment accepts any iterable and inserts its elements. A string is an iterable of characters, so the single element at index 1 is replaced by 'x' and 'y'.",
    optionExplanations: ["The string is iterated, not inserted whole.", "Correct.", "Any iterable is allowed on the right of a slice assignment.", "The slice 1:2 replaces the element 2."]
  },
  {
    id: "py-containers-043", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "a = [0, 1]\ni = 0\ni, a[i] = 1, 5\nprint(a)",
    options: ["[5, 1]", "[0, 5]", "[5, 5]", "IndexError"],
    answer: 1,
    explanation: "The right side is evaluated first into the tuple (1, 5). Then targets are assigned LEFT TO RIGHT: i becomes 1 first, and only then is `a[i]` evaluated, using the new i. So a[1] = 5.",
    optionExplanations: ["a[i] is evaluated after i has already been rebound to 1.", "Correct: targets are assigned left to right.", "Only one element of a is assigned.", "Index 1 is valid."],
    tags: ["trap"]
  },
  {
    id: "py-containers-044", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print({1, 2, 3} < {1, 2, 3}, {1, 2} <= {1, 2}, {1, 2} < {1, 2, 3}, {4} > set())",
    options: ["True True True True", "False True True False", "False False True True", "False True True True"],
    answer: 3,
    explanation: "For sets, `<=` means subset, `<` means PROPER subset (subset and not equal), and `>` means proper superset. A set is not a proper subset of itself. Any non-empty set is a proper superset of the empty set.",
    optionExplanations: ["A set is not a proper subset of itself.", "{4} is a proper superset of the empty set.", "{1, 2} <= {1, 2} is True (subset allows equality).", "Correct."]
  },
  {
    id: "py-containers-045", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "d = {(1, 2): 'a'}\nd |= [('z', 0)]\nprint(d[1, 2], len(d))",
    options: ["a 2", "KeyError", "TypeError", "a 1"],
    answer: 0,
    explanation: "Inside square brackets, `1, 2` is a tuple, so `d[1, 2]` is the same as `d[(1, 2)]`. The in-place union `|=` behaves like `update()`, which accepts a mapping or an iterable of key/value pairs, adding 'z' (the plain `|` operator would require a dict).",
    optionExplanations: ["Correct.", "d[1, 2] looks up the tuple key (1, 2), which exists.", "|= accepts an iterable of pairs, like update().", "The pair ('z', 0) was added, so there are 2 keys."]
  },
  {
    id: "py-containers-046", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "hard", type: "concept",
    question: "Dict lookup is usually described as O(1). When can it degrade toward O(n)?",
    options: ["When the dict has more than 2^16 keys", "When keys are strings longer than 64 characters", "When many keys produce the same hash (collisions), forcing probing through many slots", "When keys are inserted in random order"],
    answer: 2,
    explanation: "Python dicts are open-addressing hash tables. If many keys hash to the same value (or a pathological set of colliding hashes), lookups must probe many slots, degrading to O(n). String hash randomisation (PYTHONHASHSEED) mitigates deliberate collision attacks. Size alone doesn't degrade performance because the table resizes.",
    optionExplanations: ["The table resizes as it grows, keeping lookups O(1) on average.", "Hashing a long string is O(length), but that's not a dependence on n.", "Correct: hash collisions are the worst case.", "Insertion order doesn't affect hashing performance."]
  },
  {
    id: "py-containers-047", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "d = {'a': {'b': 1}}\nprint(d.get('x', {}).get('b'), d['a'].get('b'))",
    options: ["None 1", "KeyError", "{} 1", "1 1"],
    answer: 0,
    explanation: "`d.get('x', {})` returns an empty dict for the missing key, and calling `.get('b')` on it returns None, so chained get() calls safely navigate nested dicts. `d['a'].get('b')` finds 1.",
    optionExplanations: ["Correct.", "get() with a default never raises.", "The second get on {} returns None, not {}.", "'x' is missing, so the first expression is None."]
  },
  {
    id: "py-containers-048", subject: "python", subtopic: "Lists, Tuples, Sets & Dicts", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "row = [0, 0]\ngrid = [row, row]\ngrid[0][1] = 5\nrow = [7, 7]\nprint(grid, grid[0] is grid[1])",
    options: ["[[7, 7], [7, 7]] True", "[[0, 5], [0, 0]] False", "[[0, 5], [0, 5]] False", "[[0, 5], [0, 5]] True"],
    answer: 3,
    explanation: "grid holds two references to the same list object, so setting grid[0][1] changes 'both' rows. Rebinding the name `row` to a new list afterwards does not affect grid: grid still references the original object.",
    optionExplanations: ["Rebinding the name row doesn't change what grid refers to.", "Both slots are the same object, so the change shows in both.", "Both elements are the very same object.", "Correct."]
  }
);
