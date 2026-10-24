/* Python — Inheritance, MRO & Special Methods */
window.QUESTIONS.push(
  {
    id: "py-oopadv-001", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def hi(self):\n        return 'A'\n\nclass B(A):\n    pass\n\nclass C(A):\n    def hi(self):\n        return 'C'\n\nprint(B().hi(), C().hi(), A().hi())",
    options: ["AttributeError", "B C A", "A A A", "A C A"],
    answer: 3,
    explanation: "A subclass inherits methods it doesn't define, so B().hi() runs A's method. C OVERRIDES hi with its own version. Overriding in a subclass never changes the parent class's behaviour.",
    optionExplanations: ["Inherited methods are found through the class hierarchy.", "B doesn't define hi; it inherits A's, which returns 'A'.", "C overrides hi.", "Correct."]
  },
  {
    id: "py-oopadv-002", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def __init__(self):\n        self.x = 1\n\nclass B(A):\n    def __init__(self):\n        super().__init__()\n        self.y = 2\n\nb = B()\nprint(b.x, b.y)",
    options: ["None 2", "AttributeError", "1 2", "2 1"],
    answer: 2,
    explanation: "When a subclass defines its own `__init__`, the parent's __init__ is NOT called automatically. `super().__init__()` explicitly runs it so the parent's attributes (x) get set up before the subclass adds its own (y).",
    optionExplanations: ["x is set to 1 by A.__init__.", "super().__init__() sets x, so it exists.", "Correct.", "x is 1 and y is 2."]
  },
  {
    id: "py-oopadv-003", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class A: pass\nclass B(A): pass\n\nprint(isinstance(B(), A), issubclass(A, B), issubclass(B, B), issubclass(bool, int))",
    options: ["True False False True", "True True True True", "False False True True", "True False True True"],
    answer: 3,
    explanation: "isinstance/issubclass respect inheritance: a B is also an A, but A is not a subclass of B. A class counts as a subclass of itself. bool is a built-in subclass of int.",
    optionExplanations: ["issubclass(B, B) is True: a class is its own subclass.", "A is the parent, not a subclass of B.", "An instance of B is an instance of A.", "Correct."]
  },
  {
    id: "py-oopadv-004", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class P:\n    def __repr__(self):\n        return 'P()'\n    def __str__(self):\n        return 'point'\n\np = P()\nprint(p, [p], repr(p))",
    options: ["point [point] P()", "point [P()] P()", "P() [P()] P()", "point [P()] point"],
    answer: 1,
    explanation: "`print()` and `str()` use `__str__` (human-friendly). Containers display their elements using `__repr__` (unambiguous, developer-facing), and repr() always uses __repr__. A good __repr__ ideally looks like code that recreates the object.",
    optionExplanations: ["Lists use repr() for their elements.", "Correct.", "print(p) uses __str__ when it's defined.", "repr(p) uses __repr__."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-oopadv-005", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class Box:\n    def __init__(self, items):\n        self.items = items\n    def __len__(self):\n        return len(self.items)\n\nprint(len(Box([1, 2, 3])))",
    options: ["1", "3", "TypeError", "None"],
    answer: 1,
    explanation: "Built-in functions dispatch to special (dunder) methods: `len(obj)` calls `obj.__len__()`. Implementing the right dunder methods lets your objects work with Python's syntax and built-ins.",
    optionExplanations: ["__len__ returns the length of items.", "Correct.", "Box defines __len__, so len() works.", "__len__ returns an int."]
  },
  {
    id: "py-oopadv-006", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "easy", type: "concept",
    question: "Which statement about inheritance in Python is correct?",
    options: ["A class can inherit from only one parent class", "Python supports multiple inheritance; method lookup follows the Method Resolution Order (MRO)", "Inheritance requires interfaces to be declared", "Subclasses can't override parent methods"],
    answer: 1,
    explanation: "Python allows single, multilevel, hierarchical and multiple inheritance (`class D(B, C)`). When several bases define the same name, the MRO (computed with the C3 linearisation algorithm) decides which is used. Inspect it with `D.__mro__` or `D.mro()`.",
    optionExplanations: ["That's Java's rule for classes; Python allows multiple bases.", "Correct.", "Python has no interface keyword; ABCs are optional.", "Overriding is a core feature."]
  },
  {
    id: "py-oopadv-007", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def __init__(self):\n        self.x = 1\n\nclass B(A):\n    def __init__(self):\n        self.y = 2\n\nb = B()\nprint(hasattr(b, 'x'), hasattr(b, 'y'))",
    options: ["True True", "False True", "True False", "AttributeError"],
    answer: 1,
    explanation: "B.__init__ overrides A.__init__ and never calls super().__init__(), so A's initialisation (setting x) never runs. Forgetting super().__init__() is a common source of AttributeError later in the program.",
    optionExplanations: ["A.__init__ never ran.", "Correct.", "B.__init__ did set y.", "hasattr returns False rather than raising."],
    tags: ["trap"]
  },
  {
    id: "py-oopadv-008", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def who(self): return 'A'\nclass B(A):\n    def who(self): return 'B'\nclass C(A):\n    def who(self): return 'C'\nclass D(B, C):\n    pass\n\nprint(D().who(), [k.__name__ for k in D.__mro__])",
    options: ["B ['D', 'B', 'C', 'A', 'object']", "B ['D', 'B', 'A', 'C', 'object']", "C ['D', 'C', 'B', 'A', 'object']", "A ['D', 'A', 'B', 'C', 'object']"],
    answer: 0,
    explanation: "For the diamond D(B, C) with B and C both inheriting from A, C3 linearisation gives D → B → C → A → object: bases are searched left to right, and a common base (A) comes only after all its subclasses. who() is found first in B.",
    optionExplanations: ["Correct.", "A must come after both B and C, since both are its subclasses.", "B is listed first among D's bases.", "A is the shared base, so it comes last before object."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-oopadv-009", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def go(self): print('A', end=' ')\nclass B(A):\n    def go(self):\n        print('B', end=' ')\n        super().go()\nclass C(A):\n    def go(self):\n        print('C', end=' ')\n        super().go()\nclass D(B, C):\n    def go(self):\n        print('D', end=' ')\n        super().go()\n\nD().go()",
    options: ["D B A", "D B A C A", "D B C A", "D C B A"],
    answer: 2,
    explanation: "super() means 'the NEXT class in the MRO of the instance's type', not 'my parent'. For a D instance the MRO is D, B, C, A, so B's super().go() calls C.go, not A.go. That's cooperative multiple inheritance: each method runs exactly once.",
    optionExplanations: ["Inside B, super() refers to C for a D instance.", "Each class's method runs once; A isn't called twice.", "Correct.", "B comes before C in D's MRO."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "py-oopadv-010", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class P:\n    def __init__(self, x):\n        self.x = x\n    def __eq__(self, other):\n        return self.x == other.x\n\nprint(P(1) == P(1))\ntry:\n    s = {P(1)}\nexcept TypeError:\n    print('unhashable')",
    options: ["True and then a set is created", "True and then unhashable", "False and then unhashable", "unhashable"],
    answer: 1,
    explanation: "Defining `__eq__` without `__hash__` sets `__hash__` to None, making instances unhashable — otherwise equal objects could have different hashes, breaking sets and dicts. Define `__hash__` consistently (e.g. `hash(self.x)`) if instances should be hashable.",
    optionExplanations: ["Defining __eq__ removes the default hash.", "Correct.", "__eq__ compares x values, so the first result is True.", "The equality check prints True first."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-oopadv-011", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class V:\n    def __init__(self, n): self.n = n\n    def __lt__(self, o): return self.n < o.n\n    def __repr__(self): return f'V{self.n}'\n\nprint(sorted([V(3), V(1), V(2)]), max([V(3), V(1)]))",
    options: ["[V1, V2, V3] V1", "[V3, V2, V1] V1", "TypeError", "[V1, V2, V3] V3"],
    answer: 3,
    explanation: "sorted(), min() and max() only need the `<` operator (`__lt__`), so defining it makes instances sortable. Python also uses the reflected `__gt__`/`__lt__` when needed.",
    optionExplanations: ["max returns the largest element, V3.", "sorted() is ascending by default.", "__lt__ is enough for sorting.", "Correct."]
  },
  {
    id: "py-oopadv-012", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from functools import total_ordering\n\n@total_ordering\nclass V:\n    def __init__(self, n): self.n = n\n    def __eq__(self, o): return self.n == o.n\n    def __lt__(self, o): return self.n < o.n\n\nprint(V(1) >= V(1), V(2) > V(1), V(1) <= V(0))",
    options: ["True True True", "TypeError", "False True False", "True True False"],
    answer: 3,
    explanation: "`functools.total_ordering` fills in the missing rich comparisons (<=, >, >=) from `__eq__` and one ordering method. V(1) >= V(1) is derived as not (V(1) < V(1)) → True.",
    optionExplanations: ["1 <= 0 is False.", "total_ordering generates the missing methods.", "1 >= 1 is True.", "Correct."]
  },
  {
    id: "py-oopadv-013", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class Seq:\n    def __getitem__(self, i):\n        if i >= 3:\n            raise IndexError\n        return i * 10\n\nprint(list(Seq()), 20 in Seq(), Seq()[1])",
    options: ["[0, 10, 20] True 10", "TypeError", "[] False 10", "[0, 10, 20] False 10"],
    answer: 0,
    explanation: "If a class has no `__iter__`, iteration falls back to the old sequence protocol: call `__getitem__` with 0, 1, 2, ... until IndexError. Membership (`in`) also falls back to iterating. This is why `__getitem__` alone makes an object iterable.",
    optionExplanations: ["Correct.", "The __getitem__ fallback makes Seq iterable.", "Iteration produces 0, 10, 20.", "20 is produced during iteration, so `in` finds it."]
  },
  {
    id: "py-oopadv-014", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class Even:\n    def __contains__(self, x):\n        return x % 2 == 0\n\nprint(4 in Even(), 3 in Even(), 3 not in Even())",
    options: ["False False True", "True True False", "TypeError", "True False True"],
    answer: 3,
    explanation: "`x in obj` calls `obj.__contains__(x)`, so membership can be computed rather than stored. `not in` is simply the negation of the same call.",
    optionExplanations: ["4 is even.", "3 is odd, so `3 in Even()` is False.", "__contains__ makes `in` work.", "Correct."]
  },
  {
    id: "py-oopadv-015", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class Adder:\n    def __init__(self, n):\n        self.n = n\n    def __call__(self, x):\n        return x + self.n\n\nadd5 = Adder(5)\nprint(add5(10), callable(add5), callable(5))",
    options: ["5 True False", "15 False False", "TypeError", "15 True False"],
    answer: 3,
    explanation: "Defining `__call__` makes instances callable like functions, while keeping state on the object. callable() reports whether an object can be called.",
    optionExplanations: ["add5(10) returns 10 + 5.", "Instances with __call__ are callable.", "Calling an instance with __call__ is valid.", "Correct."]
  },
  {
    id: "py-oopadv-016", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class M:\n    def __init__(self, v): self.v = v\n    def __add__(self, o):\n        return M(self.v + (o.v if isinstance(o, M) else o))\n    def __radd__(self, o):\n        return self.__add__(o)\n\nprint((M(1) + 2).v, (3 + M(1)).v, sum([M(1), M(2)]).v)",
    options: ["3 3 3", "3 TypeError", "3 4 TypeError", "3 4 3"],
    answer: 3,
    explanation: "For `3 + M(1)`, int.__add__ doesn't know M and returns NotImplemented, so Python tries the reflected `M.__radd__(3)`. sum() starts from 0, so `0 + M(1)` also needs __radd__; without it, sum() over custom objects raises TypeError.",
    optionExplanations: ["3 + M(1) gives 4.", "__radd__ handles int + M.", "__radd__ also handles sum()'s initial 0 + M(1).", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-oopadv-017", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def __eq__(self, other):\n        return NotImplemented\n\na = A()\nprint(A() == A(), a == a)",
    options: ["False True", "NotImplemented NotImplemented", "TypeError", "True True"],
    answer: 0,
    explanation: "Returning `NotImplemented` from `__eq__` tells Python to try the reflected operation on the other operand. When both sides decline, `==` falls back to identity comparison. Two distinct objects are therefore unequal, while an object compared with itself is equal.",
    optionExplanations: ["Correct.", "NotImplemented is a signal; == never returns it to the caller.", "For ==, Python falls back to identity instead of raising.", "Distinct objects fail the identity fallback."]
  },
  {
    id: "py-oopadv-018", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class Empty:\n    def __len__(self):\n        return 0\n\nclass Plain:\n    pass\n\nclass No:\n    def __bool__(self):\n        return False\n    def __len__(self):\n        return 5\n\nprint(bool(Empty()), bool(Plain()), bool(No()))",
    options: ["False True False", "True True True", "False False False", "False True True"],
    answer: 0,
    explanation: "Truth testing calls `__bool__` if defined; otherwise it falls back to `__len__` (zero length is falsy); if neither exists, the object is truthy. `__bool__` takes priority over `__len__`.",
    optionExplanations: ["Correct.", "Length 0 makes Empty falsy.", "Objects without __bool__ or __len__ are truthy.", "__bool__ takes priority over __len__, so No is falsy."]
  },
  {
    id: "py-oopadv-019", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    x = 1\n    def __getattr__(self, name):\n        return f'missing {name}'\n\na = A()\nprint(a.x, '|', a.y)",
    options: ["1 | AttributeError", "missing x | missing y", "1 | missing y", "missing x | AttributeError"],
    answer: 2,
    explanation: "`__getattr__` is called only when normal attribute lookup FAILS. x is found on the class, so __getattr__ isn't involved; y isn't found anywhere, so __getattr__('y') supplies a value. (`__getattribute__`, by contrast, intercepts every access.)",
    optionExplanations: ["__getattr__ handles the missing attribute.", "__getattr__ is a fallback; existing attributes bypass it.", "Correct.", "x is found normally."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-oopadv-020", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def __getattribute__(self, name):\n        return 'always'\n\na = A()\na.x = 5\nprint(a.x, a.__dict__)",
    options: ["5 {'x': 5}", "always always", "always {'x': 5}", "RecursionError"],
    answer: 1,
    explanation: "`__getattribute__` intercepts EVERY attribute read, including `__dict__` itself. Setting a.x still works (it goes through __setattr__), but reading any attribute returns 'always'. Real implementations must delegate to `object.__getattribute__(self, name)` for normal cases.",
    optionExplanations: ["Every read is intercepted, including __dict__.", "Correct.", "Reading a.__dict__ is also intercepted.", "This implementation doesn't access self, so there's no recursion."],
    tags: ["trap"]
  },
  {
    id: "py-oopadv-021", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def __setattr__(self, name, value):\n        self.name = value\n\ntry:\n    A().x = 1\nexcept RecursionError:\n    print('RecursionError')",
    options: ["Nothing is printed", "RecursionError", "AttributeError", "1"],
    answer: 1,
    explanation: "Inside `__setattr__`, the statement `self.name = value` is itself an attribute assignment, which calls __setattr__ again, forever. Correct implementations call `super().__setattr__(name, value)` (or `object.__setattr__`).",
    optionExplanations: ["The infinite recursion raises an error, which is caught and printed.", "Correct.", "The assignment recurses rather than failing.", "No value is printed; the exception handler runs."],
    tags: ["trap"]
  },
  {
    id: "py-oopadv-022", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class Upper:\n    def __setattr__(self, name, value):\n        super().__setattr__(name, value.upper())\n\nu = Upper()\nu.city = 'pune'\nprint(u.city, u.__dict__)",
    options: ["PUNE {'city': 'PUNE'}", "pune {'city': 'pune'}", "RecursionError", "PUNE {}"],
    answer: 0,
    explanation: "Delegating to `super().__setattr__` performs the actual storage without recursion, so a custom __setattr__ can transform or validate values before storing them in the instance dict.",
    optionExplanations: ["Correct.", "The value is uppercased before storing.", "super().__setattr__ avoids recursion.", "The value is stored in the instance __dict__."]
  },
  {
    id: "py-oopadv-023", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "concept",
    question: "Why is relying on `__del__` for releasing resources (files, sockets) discouraged?",
    options: ["__del__ is never called in CPython", "When (or whether) __del__ runs isn't guaranteed — e.g. objects in reference cycles or alive at interpreter exit — so use context managers or explicit close()", "__del__ can only be defined on built-in types", "__del__ is called before __init__"],
    answer: 1,
    explanation: "`__del__` is a finalizer called when an object is about to be destroyed. In CPython that's usually when the refcount hits zero, but cycles delay it until the garbage collector runs, exceptions inside it are ignored, and it may not run at shutdown. Deterministic cleanup belongs in `with` blocks.",
    optionExplanations: ["CPython does call it, often promptly, but not reliably.", "Correct.", "Any class can define __del__.", "It's called at destruction, not before initialisation."]
  },
  {
    id: "py-oopadv-024", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class A: pass\nprint(type(A).__name__, type(int).__name__, type(type).__name__, type(A()).__name__)",
    options: ["class class class A", "A int type A", "type type type A", "object object type A"],
    answer: 2,
    explanation: "Classes are objects too, and the class of a class is its METACLASS. By default every class (including built-ins like int) is an instance of `type`, and `type` is an instance of itself.",
    optionExplanations: ["There's no 'class' type; the metaclass is called type.", "type(A) is the metaclass, not A itself.", "Correct.", "object is the base class, not the metaclass."]
  },
  {
    id: "py-oopadv-025", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class Meta(type):\n    def __new__(mcs, name, bases, ns):\n        ns['tag'] = name.lower()\n        return super().__new__(mcs, name, bases, ns)\n\nclass Foo(metaclass=Meta):\n    pass\n\nclass Bar(Foo):\n    pass\n\nprint(Foo.tag, Bar.tag, type(Bar).__name__)",
    options: ["foo bar Meta", "foo foo type", "foo bar type", "AttributeError"],
    answer: 0,
    explanation: "A metaclass controls class creation: Meta.__new__ runs whenever a class using it is defined, and here it injects a `tag` attribute. Metaclasses are inherited, so Bar is also created by Meta and gets its own tag.",
    optionExplanations: ["Correct.", "Bar is created by Meta too, so it gets tag 'bar'.", "Subclasses inherit the metaclass.", "Meta adds tag at class creation."]
  },
  {
    id: "py-oopadv-026", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import json\n\nclass JsonMixin:\n    def to_json(self):\n        return json.dumps(self.__dict__)\n\nclass Point(JsonMixin):\n    def __init__(self):\n        self.a = 1\n\nprint(Point().to_json())",
    options: ["TypeError", "{'a': 1}", "{\"a\": 1}", "{}"],
    answer: 2,
    explanation: "A MIXIN is a small class that provides a focused piece of reusable behaviour and is meant to be combined with other classes via inheritance. json.dumps produces JSON text with double quotes.",
    optionExplanations: ["__dict__ of simple values serialises fine.", "JSON uses double quotes, unlike Python's dict repr.", "Correct.", "self.a was set in __init__."]
  },
  {
    id: "py-oopadv-027", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "hard", type: "code-output",
    question: "What happens when this code runs?",
    code: "class A: pass\nclass B(A): pass\nclass C(A, B): pass",
    options: ["C is created with MRO C, A, B, object", "C is created with MRO C, B, A, object", "TypeError: Cannot create a consistent method resolution order (MRO)", "SyntaxError"],
    answer: 2,
    explanation: "C3 linearisation must keep each class before its own bases AND keep the order of bases as listed. Listing A before B conflicts with B being a subclass of A (B must come before A). No linear order satisfies both, so class creation fails with TypeError.",
    optionExplanations: ["B must precede its base A, so this order is invalid.", "This would violate the declared order (A before B).", "Correct.", "The syntax is fine; the error is about the MRO."],
    tags: ["trap"]
  },
  {
    id: "py-oopadv-028", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class A: x = 'A'\nclass B: x = 'B'\nclass C(A, B): pass\nclass D(B, A): pass\n\nprint(C.x, D.x)",
    options: ["B B", "A A", "A B", "B A"],
    answer: 2,
    explanation: "With unrelated bases, the MRO follows the order bases are listed. C searches A before B, and D searches B before A, so the same attribute name resolves differently.",
    optionExplanations: ["C lists A first.", "D lists B first.", "Correct.", "The order is reversed."]
  },
  {
    id: "py-oopadv-029", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def f(self): return 'A'\nclass B(A):\n    def f(self): return 'B>' + super().f()\nclass C(A):\n    def f(self): return 'C>' + super().f()\nclass D(B, C):\n    pass\n\nprint(D().f(), B().f())",
    options: ["B>C>A B>A", "B>A B>A", "B>C>A B>C>A", "B>A>C B>A"],
    answer: 0,
    explanation: "The meaning of super() depends on the INSTANCE's MRO. For a D (MRO: D, B, C, A), B's super() is C. For a plain B (MRO: B, A), B's super() is A. The same method body chains differently depending on the object.",
    optionExplanations: ["Correct.", "For a D instance, super() in B points to C.", "For a B instance, C isn't in the MRO.", "A is reached last in D's MRO."],
    tags: ["trap"]
  },
  {
    id: "py-oopadv-030", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class P:\n    def __repr__(self):\n        return 'R'\n\np = P()\nprint(str(p), f'{p!r}', f'{p}', [p])",
    options: ["R R R [R]", "<P object> R R [R]", "R R <P object> [R]", "TypeError"],
    answer: 0,
    explanation: "If a class defines only `__repr__`, `str()` falls back to it (object.__str__ calls __repr__). So defining __repr__ alone gives good output everywhere. The reverse isn't true: __str__ alone doesn't affect repr().",
    optionExplanations: ["Correct.", "str() falls back to __repr__.", "f'{p}' uses str(), which falls back to __repr__.", "All of these calls work."]
  },
  {
    id: "py-oopadv-031", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class P:\n    def __eq__(self, o):\n        return isinstance(o, P)\n\nprint(P() == P(), P() == 1, P() != P())",
    options: ["False False True", "True False True", "True False False", "TypeError"],
    answer: 2,
    explanation: "Python 3's default `__ne__` delegates to `__eq__` and inverts the result (unless it's NotImplemented), so you usually only need to define __eq__. P() == 1 returns False because 1 isn't a P.",
    optionExplanations: ["Two P instances compare equal here.", "!= is the inverse of the custom __eq__, giving False.", "Correct.", "The comparisons are valid."]
  },
  {
    id: "py-oopadv-032", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class Acc:\n    def __init__(self):\n        self.v = []\n    def __iadd__(self, x):\n        self.v.append(x)\n\na = Acc()\na += 1\nprint(a)",
    options: ["<Acc object with v=[1]>", "[1]", "None", "TypeError"],
    answer: 2,
    explanation: "`a += 1` calls `a.__iadd__(1)` and then REBINDS a to whatever it returns. This __iadd__ forgets `return self`, so it returns None and a becomes None. In-place operators must return the resulting object.",
    optionExplanations: ["a is rebound to the return value, which is None.", "a isn't the list; it's rebound to None.", "Correct.", "__iadd__ ran without error."],
    tags: ["trap"]
  },
  {
    id: "py-oopadv-033", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class Vec:\n    def __init__(self, x, y): self.x, self.y = x, y\n    def __add__(self, o): return Vec(self.x + o.x, self.y + o.y)\n    def __mul__(self, k): return Vec(self.x * k, self.y * k)\n    def __repr__(self): return f'Vec({self.x}, {self.y})'\n\nprint(Vec(1, 2) + Vec(3, 4), Vec(1, 2) * 3)\ntry:\n    3 * Vec(1, 2)\nexcept TypeError:\n    print('no __rmul__')",
    options: ["Vec(4, 6) Vec(1, 2, 1, 2, 1, 2)", "Vec(4, 6) Vec(3, 6) and then Vec(3, 6)", "TypeError", "Vec(4, 6) Vec(3, 6) and then no __rmul__"],
    answer: 3,
    explanation: "`v * 3` calls Vec.__mul__. For `3 * v`, int.__mul__ returns NotImplemented, and Python then looks for Vec.__rmul__; without it, a TypeError is raised. Operator overloading often needs both forward and reflected methods.",
    optionExplanations: ["__mul__ scales each component.", "3 * Vec(...) needs __rmul__, which isn't defined.", "The first two operations succeed.", "Correct."]
  },
  {
    id: "py-oopadv-034", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class Base:\n    registry = []\n    def __init_subclass__(cls, **kw):\n        super().__init_subclass__(**kw)\n        Base.registry.append(cls.__name__)\n\nclass A(Base): pass\nclass B(A): pass\n\nprint(Base.registry)",
    options: ["['A', 'B']", "['A']", "['Base', 'A', 'B']", "[]"],
    answer: 0,
    explanation: "`__init_subclass__` is a hook called on the parent whenever a subclass is created (including indirect subclasses). It's a lightweight alternative to metaclasses for plugin registries and validation. It isn't called for Base itself.",
    optionExplanations: ["Correct.", "B is an indirect subclass and triggers the hook too.", "The hook runs for subclasses, not for Base.", "Two subclasses are defined."]
  },
  {
    id: "py-oopadv-035", subject: "python", subtopic: "Inheritance, MRO & Special Methods", difficulty: "easy", type: "concept",
    question: "Which special method does Python call for the expression `a + b` (when a's class defines it)?",
    options: ["`a.__plus__(b)`", "`a.__add__(b)`", "`a.__sum__(b)`", "`b.__add__(a)` always"],
    answer: 1,
    explanation: "Binary operators map to dunder methods: + → __add__, - → __sub__, * → __mul__, == → __eq__, < → __lt__, and so on. If `a.__add__(b)` returns NotImplemented, Python tries the reflected `b.__radd__(a)`.",
    optionExplanations: ["There is no __plus__ method.", "Correct.", "There's no __sum__ dunder; sum() uses +.", "The left operand gets the first chance."]
  }
);
