/* Python — Modules & Packages */
window.QUESTIONS.push(
  {
    id: "py-modules-001", subject: "python", subtopic: "Modules & Packages", difficulty: "easy", type: "concept",
    question: "In Python, what is a module and what is a package?",
    options: ["A module is a class; a package is a function", "A module is a compiled .pyc file; a package is a .zip file", "A module is a single .py file; a package is a directory of modules (traditionally with an __init__.py)", "They are two names for the same thing"],
    answer: 2,
    explanation: "Any .py file is a module, and its top-level names become the module's attributes. A package is a directory that groups modules (and sub-packages), enabling dotted imports like `import pkg.sub`. Since Python 3.3, directories without __init__.py can also be 'namespace packages'.",
    optionExplanations: ["Modules and packages are file-system level units, not classes or functions.", ".pyc files are a compiled cache, not the definition of a module.", "Correct.", "A package contains modules; they're different levels."]
  },
  {
    id: "py-modules-002", subject: "python", subtopic: "Modules & Packages", difficulty: "easy", type: "concept",
    question: "When a file is executed directly with `python app.py`, what is the value of `__name__` inside app.py?",
    options: ["'app'", "'__main__'", "'app.py'", "None"],
    answer: 1,
    explanation: "The module being run as the program's entry point is named '__main__'. When the same file is imported by another module, `__name__` is its module name ('app').",
    optionExplanations: ["That's its name when imported, not when run directly.", "Correct.", "__name__ never includes the .py extension.", "__name__ is always a string."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-modules-003", subject: "python", subtopic: "Modules & Packages", difficulty: "easy", type: "concept",
    question: "What is the purpose of `if __name__ == \"__main__\":` at the bottom of a module?",
    options: ["It makes the module run faster", "It runs the guarded code only when the file is executed directly, not when it's imported", "It's required for every Python file", "It prevents other modules from importing the file"],
    answer: 1,
    explanation: "Code under the guard (tests, CLI entry points, demos) executes only when the module is the program's entry point. Importers get the definitions without triggering those side effects. It's also required for multiprocessing on platforms that spawn new interpreters.",
    optionExplanations: ["It has no performance effect.", "Correct.", "It's optional; it's only needed when the file has runnable code.", "The module can still be imported normally."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-modules-004", subject: "python", subtopic: "Modules & Packages", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "import math as m\nprint(m.sqrt(16), m.floor(2.7))",
    options: ["4.0 2", "4 3", "4.0 3", "NameError"],
    answer: 0,
    explanation: "`import module as alias` binds the module object to the alias name. math.sqrt always returns a float; math.floor returns an int (the largest integer ≤ x).",
    optionExplanations: ["Correct.", "sqrt returns a float, and floor(2.7) is 2.", "floor rounds down, not up.", "The alias m refers to the math module."]
  },
  {
    id: "py-modules-005", subject: "python", subtopic: "Modules & Packages", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "import math as m\ntry:\n    print(math.pi)\nexcept NameError:\n    print('NameError', round(m.pi, 2))",
    options: ["3.141592653589793", "NameError 3.14", "NameError", "3.14"],
    answer: 1,
    explanation: "`import math as m` binds ONLY the name m in the current namespace; the name math itself is not defined. Accessing math.pi raises NameError, while m.pi works.",
    optionExplanations: ["The name math isn't bound by an aliased import.", "Correct.", "The handler also prints the rounded value.", "math.pi fails first."]
  },
  {
    id: "py-modules-006", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "code-output",
    question: "Given these two files in the same directory, what does running `python main.py` print?",
    code: "# a.py\nprint('loading a')\nX = 1\n\n# main.py\nimport a\nimport a\nimport a as b\nprint(a.X, b is a)",
    options: ["loading a (three times) and then 1 True", "1 True", "loading a, then 1 False", "loading a, then 1 True"],
    answer: 3,
    explanation: "A module's top-level code runs only on its FIRST import; the module object is then cached in `sys.modules`, and later imports (even under an alias) just bind names to the cached object. So 'loading a' prints once and b is the same object as a.",
    optionExplanations: ["Imports are cached after the first one.", "The first import does execute the module's code.", "All imports return the same cached module object.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-modules-007", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "code-output",
    question: "What does `python main.py` print?",
    code: "# a.py\nprint(__name__)\n\n# main.py\nimport a\nprint(__name__)",
    options: ["__main__ then __main__", "__main__ then a", "a then a", "a then __main__"],
    answer: 3,
    explanation: "While a.py executes because of `import a`, its `__name__` is 'a'. main.py is the entry script, so its `__name__` is '__main__'. a's output appears first because the import runs before main's print.",
    optionExplanations: ["An imported module gets its own name.", "The order and the values are both swapped.", "The entry script is always '__main__'.", "Correct."]
  },
  {
    id: "py-modules-008", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "code-output",
    question: "What does `python main.py` print?",
    code: "# m.py\n__all__ = ['f']\ndef f(): return 'f'\ndef g(): return 'g'\n\n# main.py\nfrom m import *\nprint(f())\ntry:\n    g()\nexcept NameError:\n    print('no g')",
    options: ["f then g", "no g", "NameError", "f then no g"],
    answer: 3,
    explanation: "If a module defines `__all__`, `from module import *` imports exactly the names listed in it. g is public but not listed, so it isn't imported. (`import m; m.g()` would still work.)",
    optionExplanations: ["g is excluded by __all__.", "f() prints 'f' first.", "f is imported and works.", "Correct."]
  },
  {
    id: "py-modules-009", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "code-output",
    question: "What does `python main.py` print? (n.py has no `__all__`.)",
    code: "# n.py\ndef g(): return 'g'\ndef _h(): return 'h'\n\n# main.py\nfrom n import *\nprint(g())\ntry:\n    _h()\nexcept NameError:\n    print('no _h')",
    options: ["g then h", "no _h", "g then no _h", "NameError"],
    answer: 2,
    explanation: "Without `__all__`, `import *` imports all public names, i.e. those NOT starting with an underscore. `_h` is treated as private and skipped (it's still importable explicitly with `from n import _h`).",
    optionExplanations: ["Underscore names aren't imported by *.", "g() is imported and prints 'g' first.", "Correct.", "g is available, so the first line works."]
  },
  {
    id: "py-modules-010", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "concept",
    question: "You create `random.py` in your project folder and another file there runs `import random; random.randint(1, 6)`. What typically happens?",
    options: ["The standard library random module is always used", "Both modules are merged", "Python raises ImportError about duplicate modules", "Your random.py is imported instead (the script's directory comes first on sys.path), so randint may be missing → AttributeError"],
    answer: 3,
    explanation: "sys.path starts with the directory of the script being run, before the standard library. A local file with the same name as a stdlib module SHADOWS it. Avoid naming files random.py, json.py, email.py, etc. (Recent Python versions add a hint suggesting you rename the file.)",
    optionExplanations: ["Local files are found first.", "Modules are never merged.", "Python silently picks the first match on sys.path.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "py-modules-011", subject: "python", subtopic: "Modules & Packages", difficulty: "hard", type: "code-output",
    question: "What does `python main.py` print?",
    code: "# config.py\nvalue = 1\ndef set_v(v):\n    global value\n    value = v\n\n# main.py\nfrom config import value, set_v\nimport config\nset_v(5)\nprint(value, config.value)",
    options: ["1 5", "5 5", "1 1", "5 1"],
    answer: 0,
    explanation: "`from config import value` copies the CURRENT binding into main's namespace: main.value refers to the int 1. set_v rebinds the name inside the config module, which main's separate name doesn't see. Access module state as `config.value` when it can change.",
    optionExplanations: ["Correct.", "main's value is an independent name bound at import time.", "config.value was rebound to 5.", "It's the other way round."],
    tags: ["trap"]
  },
  {
    id: "py-modules-012", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "concept",
    question: "pkg/rel.py contains `from . import sub`. What happens if you run `python pkg/rel.py` directly instead of `python -m pkg.rel`?",
    options: ["It works the same way", "SyntaxError", "ImportError: attempted relative import with no known parent package", "It imports sub from the standard library"],
    answer: 2,
    explanation: "Relative imports are resolved against the module's package (`__package__`). Running a file as a script makes it `__main__` with no parent package, so relative imports fail. Running with `python -m pkg.rel` from the project root executes it as part of the package.",
    optionExplanations: ["Only -m provides the package context.", "The syntax is valid.", "Correct.", "Relative imports never fall back to the stdlib."]
  },
  {
    id: "py-modules-013", subject: "python", subtopic: "Modules & Packages", difficulty: "hard", type: "concept",
    question: "a.py starts with `import b` and then defines `X = 1`. b.py starts with `from a import X`. What happens when you run `python main.py` where main.py does `import a`?",
    options: ["Everything works; X is 1 in b", "b gets X = None", "Infinite recursion until RecursionError", "ImportError: cannot import name 'X' from a partially initialized module (circular import)"],
    answer: 3,
    explanation: "Importing a starts executing a.py, which immediately imports b. b then asks a for X, but a is only partially initialised (its `X = 1` line hasn't run yet; the module object already sits in sys.modules), so `from a import X` fails with ImportError. Fixes: move the import, import the module instead of the name, or restructure.",
    optionExplanations: ["X doesn't exist yet when b runs.", "Python raises instead of using a placeholder.", "sys.modules caching prevents infinite import loops.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-modules-014", subject: "python", subtopic: "Modules & Packages", difficulty: "hard", type: "code-output",
    question: "Given pkg/__init__.py prints 'pkg init' and pkg/sub.py prints 'sub loaded' and defines V = 3 (the __init__ doesn't import sub), what does main.py print?",
    code: "# main.py\nimport pkg\ntry:\n    print(pkg.sub.V)\nexcept AttributeError:\n    print('AttributeError')\nimport pkg.sub\nprint(pkg.sub.V)",
    options: ["pkg init, sub loaded, 3, 3", "pkg init, AttributeError, 3", "pkg init, AttributeError, sub loaded, 3", "AttributeError, pkg init, sub loaded, 3"],
    answer: 2,
    explanation: "Importing a package runs only its __init__.py; submodules aren't loaded automatically, so pkg.sub doesn't exist yet. `import pkg.sub` loads the submodule (printing 'sub loaded') and sets it as an attribute of pkg.",
    optionExplanations: ["sub isn't loaded by importing pkg.", "Loading sub prints 'sub loaded'.", "Correct.", "pkg's __init__ runs first."]
  },
  {
    id: "py-modules-015", subject: "python", subtopic: "Modules & Packages", difficulty: "hard", type: "code-output",
    question: "a.py contains `print('running', __name__)` followed by `import a`. What does `python a.py` print?",
    code: "# a.py\nprint('running', __name__)\nimport a",
    options: ["running __main__ (once)", "running __main__ then running a", "Infinite output until RecursionError", "running a"],
    answer: 1,
    explanation: "The script runs as module '__main__'. `import a` looks for a module named 'a' in sys.modules, doesn't find it (only '__main__' is there), so it executes a.py AGAIN as module 'a'. That second execution's `import a` finds 'a' already in sys.modules, so it stops. The same file is loaded twice under two names — a classic source of duplicated state.",
    optionExplanations: ["The script is re-imported under the name 'a'.", "Correct.", "The second import hits the sys.modules cache.", "The first execution is as __main__."],
    tags: ["trap"]
  },
  {
    id: "py-modules-016", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "code-output",
    question: "What does `python main.py` print?",
    code: "# a.py\ndef f():\n    return 'f'\n\nif __name__ == '__main__':\n    print('testing f')\n\n# main.py\nimport a\nprint(a.f())",
    options: ["testing f then f", "testing f", "f", "NameError"],
    answer: 2,
    explanation: "When a is imported, its __name__ is 'a', so the guarded test code doesn't run. Only main's print executes.",
    optionExplanations: ["The guard prevents the test code from running on import.", "The guarded block is skipped, and f() is printed.", "Correct.", "f is defined in a."]
  },
  {
    id: "py-modules-017", subject: "python", subtopic: "Modules & Packages", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print(pow(2, 3))\nfrom math import *\nprint(pow(2, 3))",
    options: ["8 then 8", "8 then 8.0", "8.0 then 8.0", "NameError"],
    answer: 1,
    explanation: "The built-in pow returns an int for int arguments. `from math import *` binds math's names, including math.pow, as GLOBALS, which shadow the built-in pow (LEGB: globals before built-ins). math.pow always returns a float. This is why star-imports are discouraged.",
    optionExplanations: ["After the star import, pow refers to math.pow.", "Correct.", "Before the import, the built-in returns the int 8.", "Both names exist."],
    tags: ["trap"]
  },
  {
    id: "py-modules-018", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import os.path\nprint(os.path.basename('/x/y.txt'), 'os' in dir(), 'path' in dir())",
    options: ["y.txt True False", "y.txt False True", "y.txt True True", "/x False True"],
    answer: 0,
    explanation: "`import a.b` loads both a and a.b but binds only the TOP-LEVEL name a in the current namespace; you access the submodule as a.b. dir() without arguments lists names in the current scope.",
    optionExplanations: ["Correct.", "The top-level name os is what gets bound.", "path itself isn't bound as a separate name.", "basename returns the final path component."]
  },
  {
    id: "py-modules-019", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "import sys\nimport json\nprint('json' in sys.modules, sys.modules['json'] is json)",
    options: ["True True", "False False", "True False", "False True"],
    answer: 0,
    explanation: "`sys.modules` is the import cache: a dict mapping module names to already-loaded module objects. Every later `import json` returns that same object.",
    optionExplanations: ["Correct.", "Imported modules are registered in sys.modules.", "The cached object is the one bound to json.", "If it weren't cached, the lookup would fail."]
  },
  {
    id: "py-modules-020", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "concept",
    question: "During development you edit a module that's already imported in a running interactive session. How can you load the new code without restarting?",
    options: ["Run `import mymodule` again", "Delete the .py file", "Use `importlib.reload(mymodule)`", "Call `mymodule.refresh()`"],
    answer: 2,
    explanation: "Re-running `import` returns the cached module from sys.modules, so changes aren't picked up. `importlib.reload(module)` re-executes the module's code in the same module object. Caveat: names imported elsewhere with `from m import x` still refer to the old objects.",
    optionExplanations: ["A repeated import hits the cache.", "That would break the module.", "Correct.", "Modules have no built-in refresh method."]
  },
  {
    id: "py-modules-021", subject: "python", subtopic: "Modules & Packages", difficulty: "easy", type: "concept",
    question: "What is the `__pycache__` directory with `.pyc` files used for?",
    options: ["Storing user data", "Logging import errors", "Holding virtual environment packages", "Caching compiled bytecode of imported modules so later imports skip recompilation"],
    answer: 3,
    explanation: "When a module is imported, CPython compiles it to bytecode and caches it as a .pyc file (tagged with the Python version). If the source hasn't changed, the next import loads the cached bytecode, speeding up startup. Execution speed itself is unchanged.",
    optionExplanations: ["It only contains compiled code.", "Errors aren't logged there.", "Packages live in site-packages.", "Correct."]
  },
  {
    id: "py-modules-022", subject: "python", subtopic: "Modules & Packages", difficulty: "easy", type: "concept",
    question: "What is the main purpose of a virtual environment (`python -m venv .venv`)?",
    options: ["To make Python run faster", "To encrypt source code", "To give a project its own isolated interpreter environment and installed packages, avoiding version conflicts between projects", "To run Python in a container"],
    answer: 2,
    explanation: "A venv has its own site-packages, so `pip install` inside it doesn't affect the system Python or other projects. Pin dependencies in requirements.txt (`pip freeze > requirements.txt`) or pyproject.toml so environments are reproducible.",
    optionExplanations: ["Performance is the same.", "venvs don't obfuscate code.", "Correct.", "Containers are a separate technology."]
  },
  {
    id: "py-modules-023", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "concept",
    question: "What does `python -m http.server 8000` do differently from running a script by path?",
    options: ["It compiles the module to a binary", "It locates the module `http.server` on sys.path and runs it as `__main__`", "It installs the http package", "It runs the module in a separate process"],
    answer: 1,
    explanation: "`-m` finds a module by its import name (respecting packages) and executes it as the main module. That's how you run tools like pip, venv, unittest and http.server, and how relative imports keep working inside packages.",
    optionExplanations: ["No binary is produced.", "Correct.", "-m runs an already installed module.", "It runs in the same interpreter process."]
  },
  {
    id: "py-modules-024", subject: "python", subtopic: "Modules & Packages", difficulty: "easy", type: "concept",
    question: "Which standard-library module would you use for each task: parse JSON, match regular expressions, manipulate filesystem paths, work with dates?",
    options: ["json, re, pathlib, datetime", "pickle, regex, os, time", "simplejson, match, path, calendar", "yaml, re, shutil, timeit"],
    answer: 0,
    explanation: "json handles JSON encoding/decoding, re provides regular expressions, pathlib offers object-oriented paths (Path('a') / 'b'), and datetime covers dates, times and timedeltas. Other everyday stdlib modules: os, sys, collections, itertools, functools, math, random, logging.",
    optionExplanations: ["Correct.", "pickle is Python-specific serialisation; 'regex' is a third-party package.", "These aren't the standard-library names.", "yaml isn't in the standard library; timeit measures performance."]
  },
  {
    id: "py-modules-025", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "concept",
    question: "Which statement about `__init__.py` is correct for Python 3.3+?",
    options: ["A directory can't be imported without it", "It runs when the package is first imported, and can expose a package API (e.g. `from .core import Client`); without it, a directory can still be a namespace package", "It must contain a class named Package", "It's executed every time any submodule is used"],
    answer: 1,
    explanation: "__init__.py marks a regular package and runs once on first import of the package (or any of its submodules). It's commonly used to re-export public names and set __all__. PEP 420 namespace packages (no __init__.py) let a package span multiple directories.",
    optionExplanations: ["Namespace packages work without it since 3.3.", "Correct.", "It can be empty.", "It runs once per interpreter session, thanks to caching."]
  },
  {
    id: "py-modules-026", subject: "python", subtopic: "Modules & Packages", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "def f():\n    import math\n    return math.floor(2.5)\n\nprint(f())\ntry:\n    math.floor(1.5)\nexcept NameError:\n    print('not global')",
    options: ["2 then not global", "2 then 1", "3 then not global", "NameError"],
    answer: 0,
    explanation: "An import statement is just a name binding in the CURRENT scope. Inside f, math becomes a local variable; the module is cached globally in sys.modules, but the name math isn't defined at module level.",
    optionExplanations: ["Correct.", "math isn't bound in the global scope.", "floor(2.5) is 2.", "f() works; the NameError happens afterwards and is handled."]
  },
  {
    id: "py-modules-027", subject: "python", subtopic: "Modules & Packages", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "import math\nprint('sqrt' in dir(math), type(math).__name__)",
    options: ["True module", "True math", "False module", "True package"],
    answer: 0,
    explanation: "Modules are objects of type `module`. `dir(obj)` lists an object's attributes, which for a module are the names it defines. `help(math)` shows the documentation.",
    optionExplanations: ["Correct.", "The type is 'module'; math is the module's name.", "sqrt is a function in math.", "math is a module, not a package."]
  },
{
    id: "py-modules-028", subject: "python", subtopic: "Modules & Packages", difficulty: "hard", type: "concept",
    question: "main.py did `from settings import TIMEOUT` and later calls `importlib.reload(settings)` after TIMEOUT was edited in settings.py. What value does main's `TIMEOUT` name have?",
    options: ["The new value, because reload updates every reference", "The old value: reload re-executes the module and rebinds names inside the module object, but names already copied into other namespaces are untouched", "None, because reload clears the old bindings", "reload raises ImportError for modules imported with from-import"],
    answer: 1,
    explanation: "importlib.reload re-runs the module's code in the existing module object, so `settings.TIMEOUT` sees the new value. But `from settings import TIMEOUT` created an independent name in main that still points to the old object. That's one reason to prefer `import settings` and attribute access for values that may change.",
    optionExplanations: ["Only references through the module object see the update.", "Correct.", "Existing external names keep their old objects.", "reload works regardless of how other modules imported names."],
    tags: ["trap"]
  },
  {
    id: "py-modules-029", subject: "python", subtopic: "Modules & Packages", difficulty: "hard", type: "code-output",
    question: "What does `python main.py` print?",
    code: "# m.py\n__all__ = ['f']\ndef f(): return 'f'\ndef g(): return 'g'\n\n# main.py\nfrom m import g\nimport m\nprint(g(), m.g(), m.__all__)",
    options: ["ImportError", "g g ['f']", "f f ['f']", "g AttributeError"],
    answer: 1,
    explanation: "`__all__` only controls what `from m import *` imports. It doesn't hide anything: explicit `from m import g` and attribute access `m.g` still work. Python has no enforced module-level privacy.",
    optionExplanations: ["Explicit imports ignore __all__.", "Correct.", "g() returns 'g'.", "m.g is a normal attribute of the module."]
  },
  {
    id: "py-modules-030", subject: "python", subtopic: "Modules & Packages", difficulty: "hard", type: "concept",
    question: "In `import pkg.sub.mod as x`, what does the name `x` refer to?",
    options: ["The top-level package pkg", "The submodule pkg.sub.mod", "The package pkg.sub", "Nothing; `as` can't be used with dotted imports"],
    answer: 1,
    explanation: "Without `as`, `import pkg.sub.mod` binds only the top-level name pkg. With `as x`, the alias is bound directly to the final submodule pkg.sub.mod, and the name pkg is NOT bound in the current namespace.",
    optionExplanations: ["That's what plain `import pkg.sub.mod` binds.", "Correct.", "The alias refers to the last component.", "Aliasing dotted imports is valid."]
  }
);
