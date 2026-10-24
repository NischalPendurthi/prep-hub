/* Python — OOP Basics */
window.QUESTIONS.push(
  {
    id: "py-oop-001", subject: "python", subtopic: "OOP Basics", difficulty: "easy", type: "concept",
    question: "In an instance method `def area(self): ...`, what is `self`?",
    options: ["A reserved keyword that refers to the class", "Optional; it can be omitted when the method doesn't use attributes", "A global variable holding the last created object", "The instance the method was called on, passed automatically as the first argument"],
    answer: 3,
    explanation: "Calling `obj.area()` is translated to `Class.area(obj)`: the instance is passed explicitly as the first parameter. `self` is only a naming convention, not a keyword, but the parameter itself is required for instance methods.",
    optionExplanations: ["self isn't a keyword, and it refers to the instance.", "Omitting it causes a TypeError when the method is called on an instance.", "Each call receives its own instance.", "Correct."]
  },
  {
    id: "py-oop-002", subject: "python", subtopic: "OOP Basics", difficulty: "easy", type: "concept",
    question: "What is the role of `__init__` compared with `__new__`?",
    options: ["`__init__` allocates memory; `__new__` sets attributes", "They are aliases for the same method", "`__new__` creates and returns the new instance; `__init__` initialises that already-created instance and returns None", "`__init__` is only called for subclasses"],
    answer: 2,
    explanation: "Object creation is two steps: `cls.__new__(cls, ...)` constructs the object (a static method that returns it), then, if it returned an instance of cls, `__init__(self, ...)` initialises it. __init__ must return None. You rarely override __new__ except for immutable types or singletons.",
    optionExplanations: ["It's the reverse.", "They are distinct steps of construction.", "Correct.", "__init__ is called for any class when instances are created."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-oop-003", subject: "python", subtopic: "OOP Basics", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    count = 0\n\na = A()\nb = A()\nA.count = 5\nprint(a.count, b.count)",
    options: ["0 0", "AttributeError", "5 0", "5 5"],
    answer: 3,
    explanation: "`count` is a CLASS attribute, stored once on the class and shared by all instances. Neither instance has its own count, so lookups fall back to the class, which now holds 5.",
    optionExplanations: ["The class attribute was changed to 5.", "Instances can read class attributes.", "Neither instance shadows the class attribute.", "Correct."]
  },
  {
    id: "py-oop-004", subject: "python", subtopic: "OOP Basics", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    x = 1\n\na = A()\na.x = 2\nprint(a.x, A.x)",
    options: ["2 2", "1 1", "2 1", "1 2"],
    answer: 2,
    explanation: "Assigning through an instance creates an INSTANCE attribute that shadows the class attribute for that instance only. The class attribute is unchanged.",
    optionExplanations: ["The assignment didn't modify the class.", "a now has its own x.", "Correct.", "It's the other way round."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-oop-005", subject: "python", subtopic: "OOP Basics", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    @staticmethod\n    def s():\n        return 's'\n\n    @classmethod\n    def c(cls):\n        return cls.__name__\n\nprint(A.s(), A.c(), A().c())",
    options: ["s A A", "s cls cls", "TypeError", "s A None"],
    answer: 0,
    explanation: "A staticmethod receives no implicit first argument; it's a plain function in the class namespace. A classmethod receives the CLASS as its first argument, whether called on the class or on an instance.",
    optionExplanations: ["Correct.", "cls is the class object, whose __name__ is 'A'.", "Both can be called on the class without an instance.", "Called via an instance, cls is still A."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-oop-006", subject: "python", subtopic: "OOP Basics", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class P:\n    def __init__(self, x):\n        self.x = x\n\nprint(P(1) == P(1))",
    options: ["True", "None", "TypeError", "False"],
    answer: 3,
    explanation: "Without a custom `__eq__`, `==` falls back to identity comparison (object.__eq__), and two separately created instances are different objects. Define `__eq__` (or use a dataclass) for value equality.",
    optionExplanations: ["Default equality is identity, not attribute comparison.", "== returns a bool.", "Comparing any two objects with == is allowed.", "Correct."]
  },
  {
    id: "py-oop-007", subject: "python", subtopic: "OOP Basics", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    k = 'class'\n    def __init__(self):\n        self.x = 1\n\na = A()\na.y = 5\nprint(a.__dict__)",
    options: ["{'x': 1}", "{'x': 1, 'y': 5}", "{'k': 'class', 'x': 1, 'y': 5}", "AttributeError"],
    answer: 1,
    explanation: "An instance's `__dict__` holds only ITS OWN attributes. Attributes can be added dynamically at any time (unless __slots__ is used). Class attributes like k live in `A.__dict__`, not in the instance dict.",
    optionExplanations: ["y was added dynamically to the instance.", "Correct.", "Class attributes are not in the instance's __dict__.", "Adding attributes dynamically is allowed by default."]
  },
  {
    id: "py-oop-008", subject: "python", subtopic: "OOP Basics", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    count = 0\n    def __init__(self):\n        A.count += 1\n\nA(); A(); A()\nprint(A.count)",
    options: ["0", "1", "3", "AttributeError"],
    answer: 2,
    explanation: "Each construction runs __init__, which increments the class attribute through the class name, so the shared counter tracks how many instances were created.",
    optionExplanations: ["__init__ runs for every instance.", "Three instances are created.", "Correct.", "A.count exists as a class attribute."]
  },
  {
    id: "py-oop-009", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class Dog:\n    tricks = []\n    def add(self, t):\n        self.tricks.append(t)\n\nd1 = Dog()\nd2 = Dog()\nd1.add('roll')\nprint(d2.tricks)",
    options: ["[]", "AttributeError", "['roll']", "None"],
    answer: 2,
    explanation: "`tricks` is a class attribute: one list shared by every Dog. `self.tricks.append` finds that shared list via the class and mutates it. Per-instance data belongs in __init__: `self.tricks = []`.",
    optionExplanations: ["The list is shared across instances.", "Instances can access class attributes.", "Correct.", "The list exists and was mutated."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "py-oop-010", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class Date:\n    def __init__(self, y, m):\n        self.y, self.m = y, m\n\n    @classmethod\n    def from_str(cls, s):\n        y, m = map(int, s.split('-'))\n        return cls(y, m)\n\nd = Date.from_str('2024-05')\nprint(d.y, d.m, type(d).__name__)",
    options: ["2024 5 Date", "2024 05 Date", "'2024' '05' Date", "TypeError"],
    answer: 0,
    explanation: "A classmethod is the idiomatic way to write alternative constructors: it parses the input and calls `cls(...)`. Using cls rather than the hard-coded class name means subclasses get instances of the subclass. int('05') is 5.",
    optionExplanations: ["Correct.", "int('05') becomes the integer 5.", "map(int, ...) converts the strings to ints.", "The classmethod receives cls automatically."]
  },
  {
    id: "py-oop-011", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def __init__(self):\n        self.__x = 1\n\na = A()\nprint(hasattr(a, '__x'), a._A__x, list(a.__dict__))",
    options: ["True 1 ['__x']", "False 1 ['_A__x']", "False AttributeError", "True 1 ['_A__x']"],
    answer: 1,
    explanation: "Names with two leading underscores (and at most one trailing) inside a class body are NAME-MANGLED to `_ClassName__name`, so the attribute is actually stored as `_A__x`. This avoids accidental clashes with subclass attributes; it's not real privacy, since you can still access `a._A__x`.",
    optionExplanations: ["The attribute is stored under the mangled name.", "Correct.", "a._A__x accesses the mangled attribute successfully.", "hasattr(a, '__x') is False because the name was mangled."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-oop-012", subject: "python", subtopic: "OOP Basics", difficulty: "easy", type: "concept",
    question: "What does a single leading underscore, as in `self._balance`, mean in Python?",
    options: ["The attribute is private and cannot be accessed from outside the class", "It's a convention signalling 'internal use'; Python doesn't enforce any restriction", "The attribute is name-mangled", "The attribute is read-only"],
    answer: 1,
    explanation: "Python has no access modifiers. A single underscore is a convention for 'non-public, don't rely on this'. It also excludes module-level names from `from m import *`. Double underscores trigger name mangling, which still isn't true privacy.",
    optionExplanations: ["Python has no enforced private attributes.", "Correct.", "Mangling requires two leading underscores.", "It can be reassigned freely."]
  },
  {
    id: "py-oop-013", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class Temp:\n    def __init__(self):\n        self._c = 0\n    @property\n    def c(self):\n        return self._c\n    @c.setter\n    def c(self, v):\n        if v < -273:\n            raise ValueError('too cold')\n        self._c = v\n\nt = Temp()\nt.c = 25\ntry:\n    t.c = -300\nexcept ValueError:\n    pass\nprint(t.c)",
    options: ["-300", "ValueError", "0", "25"],
    answer: 3,
    explanation: "`@property` turns a method into a managed attribute: reading `t.c` calls the getter and assigning calls the setter. The setter validates input; the invalid assignment raises before `_c` changes, so the value stays 25.",
    optionExplanations: ["The setter rejects -300 before storing it.", "The ValueError is caught.", "25 was successfully set first.", "Correct."]
  },
  {
    id: "py-oop-014", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class C:\n    @property\n    def x(self):\n        return 1\n\nc = C()\ntry:\n    c.x = 2\nexcept AttributeError:\n    print('read-only', c.x)",
    options: ["2", "1", "read-only 2", "read-only 1"],
    answer: 3,
    explanation: "A property defined without a setter is read-only: assigning to it raises AttributeError. Properties are data descriptors, so you can't sneak around them by assigning an instance attribute of the same name.",
    optionExplanations: ["Assignment fails without a setter.", "The except branch prints a message too.", "The value wasn't changed.", "Correct."]
  },
  {
    id: "py-oop-015", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class P:\n    __slots__ = ('x',)\n\np = P()\np.x = 1\ntry:\n    p.y = 2\nexcept AttributeError:\n    print('no y', hasattr(p, '__dict__'))",
    options: ["no y False", "no y True", "Nothing is printed", "TypeError"],
    answer: 0,
    explanation: "`__slots__` declares a fixed set of attributes and removes the per-instance `__dict__`, saving memory (useful for millions of small objects) and preventing new attributes from being added.",
    optionExplanations: ["Correct.", "Instances of a slotted class have no __dict__.", "Assigning y raises AttributeError, which is caught and reported.", "The error type is AttributeError."]
  },
  {
    id: "py-oop-016", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from abc import ABC, abstractmethod\n\nclass Shape(ABC):\n    @abstractmethod\n    def area(self): ...\n\nclass Square(Shape):\n    def __init__(self, s): self.s = s\n    def area(self): return self.s ** 2\n\nclass Bad(Shape):\n    pass\n\nprint(Square(3).area())\nfor cls in (Shape, Bad):\n    try:\n        cls()\n    except TypeError:\n        print(cls.__name__, 'abstract')",
    options: ["9 Shape abstract Bad abstract", "9 Shape abstract", "9", "TypeError"],
    answer: 0,
    explanation: "A class with unimplemented `@abstractmethod`s (from an ABC) can't be instantiated: TypeError is raised. Subclasses become concrete only once they override every abstract method, so Square works and Bad doesn't.",
    optionExplanations: ["Correct.", "Bad doesn't implement area, so it's still abstract.", "Both abstract classes raise TypeError, which is caught and printed.", "Square is concrete and returns 9."]
  },
  {
    id: "py-oop-017", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from dataclasses import dataclass\n\n@dataclass\nclass P:\n    x: int\n    y: int = 0\n\nprint(P(1), P(1) == P(1, 0))",
    options: ["P(x=1, y=0) True", "<__main__.P object> False", "P(1, 0) True", "P(x=1, y=0) False"],
    answer: 0,
    explanation: "@dataclass generates `__init__` from the annotated fields (with defaults), a readable `__repr__`, and a field-by-field `__eq__`. That's why the repr shows field names and the two instances are equal.",
    optionExplanations: ["Correct.", "dataclass generates both __repr__ and __eq__.", "The generated repr includes field names.", "Generated __eq__ compares field values."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-oop-018", subject: "python", subtopic: "OOP Basics", difficulty: "hard", type: "code-output",
    question: "What happens when this code runs?",
    code: "from dataclasses import dataclass\n\n@dataclass\nclass Cart:\n    items: list = []",
    options: ["It raises ValueError at class creation, telling you to use default_factory", "It works; every Cart shares one list", "It works; each Cart gets its own list", "It raises TypeError when Cart() is called"],
    answer: 0,
    explanation: "Dataclasses refuse unhashable mutable defaults (list, dict, set) precisely to prevent the shared-mutable-default bug: ValueError is raised as soon as the decorator processes the class. Use `items: list = field(default_factory=list)`.",
    optionExplanations: ["Correct.", "dataclass prevents this sharing by raising.", "Only default_factory gives each instance its own list.", "The error happens when the class is defined, not when it's instantiated."],
    tags: ["trap"]
  },
  {
    id: "py-oop-019", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass P:\n    x: int\n\np = P(1)\ntry:\n    p.x = 2\nexcept AttributeError as e:\n    print(type(e).__name__, p.x, hash(p) == hash(P(1)))",
    options: ["FrozenInstanceError 1 True", "AttributeError 2 False", "FrozenInstanceError 1 False", "TypeError 1 True"],
    answer: 0,
    explanation: "`frozen=True` makes instances immutable: assignment raises dataclasses.FrozenInstanceError (a subclass of AttributeError). Frozen dataclasses with eq=True also get a `__hash__` based on their fields, so equal instances hash equally and can be dict keys.",
    optionExplanations: ["Correct.", "The value isn't changed, and equal frozen instances hash equally.", "Field-based hashing makes the hashes equal.", "The raised exception is FrozenInstanceError."]
  },
  {
    id: "py-oop-020", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from dataclasses import dataclass\n\n@dataclass(order=True)\nclass Version:\n    major: int\n    minor: int\n\nvs = [Version(1, 10), Version(1, 2), Version(0, 99)]\nprint([f'{v.major}.{v.minor}' for v in sorted(vs)])",
    options: ["['0.99', '1.10', '1.2']", "TypeError", "['1.10', '1.2', '0.99']", "['0.99', '1.2', '1.10']"],
    answer: 3,
    explanation: "`order=True` generates comparison methods that compare instances as tuples of their fields in definition order: (major, minor). So (0, 99) < (1, 2) < (1, 10) — numeric comparison, unlike sorting the strings.",
    optionExplanations: ["minor compares numerically: 2 < 10.", "order=True makes instances orderable.", "sorted() is ascending.", "Correct."]
  },
  {
    id: "py-oop-021", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def f(self):\n        return 1\n\na = A()\nm = a.f\nprint(m(), A.f(a), m.__self__ is a)",
    options: ["1 1 True", "1 TypeError", "1 1 False", "TypeError"],
    answer: 0,
    explanation: "Accessing `a.f` creates a BOUND METHOD that packages the function with the instance (`__self__`). Calling it passes a as self. `A.f` is the plain function, so you must pass the instance explicitly.",
    optionExplanations: ["Correct.", "Passing a explicitly to A.f is valid.", "The bound method's __self__ is a.", "All three expressions are valid."]
  },
  {
    id: "py-oop-022", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    pass\n\na = A()\nsetattr(a, 'v', 3)\nprint(getattr(a, 'v'), getattr(a, 'w', 'none'), hasattr(a, 'w'))",
    options: ["3 none False", "3 None False", "3 AttributeError", "v none False"],
    answer: 0,
    explanation: "`setattr`, `getattr` and `hasattr` access attributes by NAME at runtime. getattr with a third argument returns that default instead of raising AttributeError. hasattr returns False for missing attributes.",
    optionExplanations: ["Correct.", "The default given is the string 'none'.", "The default prevents the AttributeError.", "getattr returns the attribute's value, 3."]
  },
  {
    id: "py-oop-023", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    x = 'class'\n    def __init__(self):\n        self.x = 'inst'\n\na = A()\nprint(a.x, end=' ')\ndel a.x\nprint(a.x)",
    options: ["inst inst", "inst class", "class class", "inst AttributeError"],
    answer: 1,
    explanation: "Attribute lookup checks the instance's own dict before the class. After deleting the instance attribute, lookup falls through to the class attribute.",
    optionExplanations: ["The instance attribute was deleted.", "Correct.", "The instance attribute shadows the class one at first.", "The class attribute is still found."]
  },
  {
    id: "py-oop-024", subject: "python", subtopic: "OOP Basics", difficulty: "easy", type: "concept",
    question: "What is 'duck typing'?",
    options: ["Checking an object's exact class before using it", "A requirement that all classes inherit from object explicitly", "A way to convert between numeric types", "Using an object based on whether it supports the needed methods/behaviour, not on its declared type"],
    answer: 3,
    explanation: "'If it walks like a duck and quacks like a duck, it's a duck.' Python code typically just calls the methods it needs (e.g. anything with `read()` can be used as a file-like object). Protocols and ABCs formalise this when needed.",
    optionExplanations: ["That is the opposite of duck typing.", "All Python 3 classes inherit from object implicitly.", "Unrelated to type conversion.", "Correct."]
  },
  {
    id: "py-oop-025", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "concept",
    question: "A `Car` needs an `Engine`. Why do designers usually prefer composition (`self.engine = Engine()`) over making Car inherit from Engine?",
    options: ["Inheritance is not supported for user-defined classes", "A car HAS an engine rather than IS an engine; composition keeps the relationship accurate, loosely coupled and swappable", "Composition makes attribute access faster", "Composition is required for using super()"],
    answer: 1,
    explanation: "Inheritance models 'is-a' relationships and tightly couples a subclass to its parent's implementation. Composition models 'has-a', lets you replace the component (e.g. ElectricEngine) and avoids inheriting irrelevant methods. 'Favour composition over inheritance' is a classic design guideline.",
    optionExplanations: ["Python fully supports inheritance.", "Correct.", "Performance isn't the reason.", "super() is about inheritance, not composition."]
  },
  {
    id: "py-oop-026", subject: "python", subtopic: "OOP Basics", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def __new__(cls):\n        return 42\n    def __init__(self):\n        print('init called')\n\nprint(A())",
    options: ["init called 42", "42", "init called <__main__.A object>", "TypeError"],
    answer: 1,
    explanation: "Python only calls `__init__` if `__new__` returns an instance of the class. Here __new__ returns an int, so __init__ is skipped and A() evaluates to 42.",
    optionExplanations: ["__init__ isn't called when __new__ returns a non-instance.", "Correct.", "__new__ never creates an A instance.", "Returning any object from __new__ is allowed."],
    tags: ["trap"]
  },
  {
    id: "py-oop-027", subject: "python", subtopic: "OOP Basics", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class S:\n    _inst = None\n    inits = 0\n    def __new__(cls):\n        if cls._inst is None:\n            cls._inst = super().__new__(cls)\n        return cls._inst\n    def __init__(self):\n        S.inits += 1\n\na = S()\nb = S()\nprint(a is b, S.inits)",
    options: ["True 1", "False 1", "False 2", "True 2"],
    answer: 3,
    explanation: "Overriding `__new__` to return a cached instance makes a singleton: both calls return the same object. But since __new__ returns an instance of S each time, Python STILL calls __init__ on every S() call, re-initialising the singleton — a common pitfall.",
    optionExplanations: ["__init__ runs on every construction call.", "Both the identity and the count are wrong.", "__new__ returns the cached instance, so a is b.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-oop-028", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    def f(self):\n        return 'f'\n\ntry:\n    print(A.f())\nexcept TypeError:\n    print('missing self')",
    options: ["f", "missing self", "None", "AttributeError"],
    answer: 1,
    explanation: "Accessed through the class, `A.f` is a plain function that still requires its `self` argument. Calling it without an instance raises TypeError: missing 1 required positional argument: 'self'.",
    optionExplanations: ["No instance is supplied for self.", "Correct.", "The call raises before returning.", "The attribute exists on the class."]
  },
  {
    id: "py-oop-029", subject: "python", subtopic: "OOP Basics", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    n = 0\n\na = A()\na.n += 1\nprint(a.n, A.n, 'n' in a.__dict__)",
    options: ["1 1 False", "1 0 True", "1 1 True", "AttributeError"],
    answer: 1,
    explanation: "`a.n += 1` means `a.n = a.n + 1`: the READ finds the class attribute 0, and the WRITE creates an instance attribute 1. The class attribute is unchanged, and the instance now shadows it.",
    optionExplanations: ["Assignment through the instance never changes the class attribute.", "Correct.", "A.n remains 0.", "Reading a class attribute through an instance is allowed."],
    tags: ["trap"]
  },
  {
    id: "py-oop-030", subject: "python", subtopic: "OOP Basics", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    lst = []\n\na = A()\na.lst += [1]\nb = A()\nprint(b.lst, 'lst' in a.__dict__)",
    options: ["[] True", "[1] False", "[1] True", "[] False"],
    answer: 2,
    explanation: "`a.lst += [1]` reads the shared class list, calls `__iadd__` which MUTATES it in place, then assigns the result to `a.lst`, creating an instance attribute pointing to the same list. So b sees [1] through the class, and a now also has its own (aliased) entry.",
    optionExplanations: ["The shared list was mutated in place.", "The augmented assignment also creates an instance attribute.", "Correct: mutation and assignment both happen.", "Both parts are wrong."],
    tags: ["trap"]
  },
  {
    id: "py-oop-031", subject: "python", subtopic: "OOP Basics", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    @property\n    def x(self):\n        return 'prop'\n\na = A()\na.__dict__['x'] = 'inst'\nprint(a.x, a.__dict__['x'])",
    options: ["inst inst", "prop prop", "prop inst", "AttributeError"],
    answer: 2,
    explanation: "Attribute lookup order: DATA descriptors on the class (like property, which defines __get__ and __set__) take precedence over the instance __dict__, which takes precedence over non-data descriptors and plain class attributes. So the property wins even though the instance dict has an 'x'.",
    optionExplanations: ["Data descriptors override instance attributes.", "The instance dict really does contain 'inst'.", "Correct.", "Writing to __dict__ directly bypasses the property, so no error."],
    tags: ["trap"]
  },
  {
    id: "py-oop-032", subject: "python", subtopic: "OOP Basics", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    pass\n\na = A()\na.f = lambda self: 'x'\ntry:\n    print(a.f())\nexcept TypeError:\n    print('not bound')",
    options: ["x", "not bound", "None", "AttributeError"],
    answer: 1,
    explanation: "Functions become bound methods only when found on the CLASS via attribute access. A function stored on an INSTANCE is returned as-is, so `a.f()` calls the lambda with no arguments and fails because self is missing.",
    optionExplanations: ["self isn't passed automatically for instance-level functions.", "Correct.", "The call raises TypeError.", "The attribute exists on the instance."]
  },
  {
    id: "py-oop-033", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "from dataclasses import dataclass, field\n\n@dataclass\nclass Cart:\n    items: list = field(default_factory=list)\n\na, b = Cart(), Cart()\na.items.append('apple')\nprint(a.items, b.items)",
    options: ["['apple'] ['apple']", "[] []", "['apple'] []", "ValueError"],
    answer: 2,
    explanation: "`field(default_factory=list)` calls list() for each new instance, giving every Cart its own list. This is the correct way to have mutable defaults in dataclasses.",
    optionExplanations: ["Each instance gets a separate list.", "a's list did receive 'apple'.", "Correct.", "default_factory is the supported approach."]
  },
  {
    id: "py-oop-034", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "class A:\n    @classmethod\n    def make(cls):\n        return cls()\n\nclass B(A):\n    pass\n\nprint(type(B.make()).__name__, type(A.make()).__name__)",
    options: ["A A", "B B", "B A", "TypeError"],
    answer: 2,
    explanation: "A classmethod receives the class it was CALLED on. Through B, cls is B, so the factory builds a B. That's why alternative constructors should use cls() rather than hard-coding the class name.",
    optionExplanations: ["cls is B when called as B.make().", "A.make() builds an A.", "Correct.", "Inherited classmethods work normally."]
  },
  {
    id: "py-oop-035", subject: "python", subtopic: "OOP Basics", difficulty: "medium", type: "concept",
    question: "When should a method be a `@staticmethod` rather than a `@classmethod`?",
    options: ["When it needs to create instances of the class", "When it modifies class attributes", "When it needs neither the instance nor the class — it's a utility function that logically belongs in the class namespace", "When it should be overridable by subclasses"],
    answer: 2,
    explanation: "A staticmethod receives no self or cls, so it can't access instance or class state; it's grouped with the class for organisation (e.g. a validation helper). Use classmethod when you need the class (factories, class-level state), and instance methods when you need the instance.",
    optionExplanations: ["Factories should use classmethod so subclasses work.", "Modifying class state requires cls (a classmethod).", "Correct.", "Both kinds can be overridden; that isn't the distinguishing factor."]
  }
);
