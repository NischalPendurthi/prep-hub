---
title: Imports, modules and packages
part: Part F · Programs
lede: `import x` checks a cache, asks a chain of finders for a spec, creates a module object, runs the module's code inside it and binds a name, and each of those steps explains a familiar bug. This chapter covers `sys.modules`, finders and loaders, how `sys.path` is built, packages and relative imports, why `__main__` can be imported twice, how circular imports fail, and how `.pyc` files are cached and invalidated.
desc: sys.modules, finders/loaders, sys.path, packages, __main__, circular imports, .pyc caching, hooks
hours: 3
prereqs: Chapters 2–3
---

## What import does {#ch12-import .th}

`import mod` performs these steps:

1. **Check the cache.** If `"mod"` is in `sys.modules`, use that module object. Nothing else happens.
2. **Find a spec.** Ask each finder in `sys.meta_path` in turn for a `ModuleSpec` (name, loader, origin). The defaults are `BuiltinImporter` (modules compiled into the interpreter, such as `sys`), `FrozenImporter` (frozen modules such as parts of `importlib` and, since 3.11, `os` and other start-up modules) and `PathFinder` (searches the directories on `sys.path`).
3. **Create the module** from the spec and insert it into `sys.modules` **before** running its code.
4. **Execute the module's code** in the new module's `__dict__`. This is where every top-level statement in the file runs.
5. **Bind the name** `mod` in the importing namespace.

```python run=c12-import-steps
import sys, importlib.util

print("json" in sys.modules)
spec = importlib.util.find_spec("json")
print(spec.name, type(spec.loader).__name__, spec.origin.endswith("json/__init__.py"))
import json
print("json" in sys.modules, sys.modules["json"] is json)
print([f.__name__ for f in sys.meta_path if f.__module__.startswith("_frozen_importlib")])
```

Because step 1 returns the cached module, **a module's top-level code runs once per process**, no matter how many times or from how many places it is imported. That makes a module a natural singleton, and it is also why editing a file and re-importing it in a running program changes nothing.

```python run=c12-once
import sys, os, tempfile, importlib

pkg_dir = tempfile.mkdtemp()
with open(os.path.join(pkg_dir, "settings.py"), "w") as f:
    f.write("print('settings loaded')\nvalue = 1\n")
sys.path.insert(0, pkg_dir)

import settings
import settings
from settings import value
print(value, settings is sys.modules["settings"])

with open(os.path.join(pkg_dir, "settings.py"), "w") as f:
    f.write("print('settings reloaded')\nvalue = 2\n")
importlib.reload(settings)
print(settings.value, value)
```

`importlib.reload` re-executes the code in the **same** module object, so `settings.value` changes. But `value`, bound earlier by `from settings import value`, still refers to the old object, which is why reloading is unreliable in real programs.

:::key
`from mod import name` copies a reference at import time. If `mod` later rebinds `name`, your copy does not change. To see the current value, keep a reference to the module and read `mod.name`.
:::

## sys.path and where modules come from {#ch12-path .th}

`PathFinder` searches the directories in `sys.path`, in order, and takes the first match. At start-up `sys.path` is built from:

1. The directory of the script being run (or the current directory for `-c`, `-m` and the REPL). This entry is the reason a file called `random.py` next to your script breaks `import random` everywhere in that program.
2. `PYTHONPATH`, if set.
3. The standard library directories.
4. `site-packages` directories, added by the `site` module, plus any paths listed in `.pth` files there.

`python -I` (isolated mode) skips `PYTHONPATH`, the user site directory and the script's directory, which is why this guide runs every example with it.

```python run=c12-shadowing
import sys, os, tempfile, subprocess

d = tempfile.mkdtemp()
with open(os.path.join(d, "random.py"), "w") as f:
    f.write("print('this is my random.py, not the stdlib')\n")
with open(os.path.join(d, "app.py"), "w") as f:
    f.write("import random\nprint(hasattr(random, 'randint'))\n")
out = subprocess.run([sys.executable, "app.py"], cwd=d, capture_output=True, text=True).stdout
print(out.strip())
out = subprocess.run([sys.executable, "-I", "app.py"], cwd=d, capture_output=True, text=True).stdout
print(out.strip())
```

`-I` fixes the demo, but the real fix is never to name your files after standard-library modules.

## Packages {#ch12-packages .th}

A **package** is a module that can contain other modules. A directory with an `__init__.py` is a **regular package**: importing it runs `__init__.py`, and the module gets a `__path__` attribute listing where to look for submodules. A directory **without** `__init__.py` on `sys.path` is a **namespace package** (PEP 420), which can be split across several directories and has no initialisation code.

Importing `a.b.c` imports `a`, then `a.b`, then `a.b.c`, binding each as an attribute of its parent. **Relative imports** (`from . import util`, `from ..core import x`) are resolved against the current module's `__package__`, so they only work inside a package, not in a script run directly.

```python run=c12-packages
import sys, os, tempfile

root = tempfile.mkdtemp()
os.makedirs(os.path.join(root, "shop", "billing"))
files = {
    "shop/__init__.py": "print('init shop')\nVERSION = '1.0'\n",
    "shop/billing/__init__.py": "",
    "shop/billing/invoice.py": "from ..utils import money\ndef total(xs):\n    return money(sum(xs))\n",
    "shop/utils.py": "def money(x):\n    return f'${x:.2f}'\n",
}
for rel, src in files.items():
    with open(os.path.join(root, rel), "w") as f:
        f.write(src)
sys.path.insert(0, root)

from shop.billing.invoice import total
import shop
print(total([1.5, 2.25]), shop.VERSION, "shop.billing" in sys.modules)
print(shop.billing.invoice.__package__, shop.__path__[0].endswith("shop"))
```

Importing `shop.billing.invoice` ran `shop/__init__.py` first, and `import shop` afterwards found it in the cache.

### __name__ and "__main__"

When you run `python app.py`, the file is executed as the module named `__main__`, not as `app`. That is what the `if __name__ == "__main__":` idiom tests. It also causes a classic bug: if some other module does `import app`, Python does not find `app` in `sys.modules` (it is registered as `__main__`), so it imports the file **again** as a second module with its own copies of every global and class:

```python run=c12-main-twice
import sys, os, tempfile, subprocess

d = tempfile.mkdtemp()
with open(os.path.join(d, "app.py"), "w") as f:
    f.write(
        "import helper\n"
        "registry = []\n"
        "print('app runs as', __name__)\n"
        "if __name__ == '__main__':\n"
        "    helper.register()\n"
        "    print('main sees', registry)\n"
    )
with open(os.path.join(d, "helper.py"), "w") as f:
    f.write("def register():\n    import app\n    app.registry.append('x')\n    print('helper sees', app.registry)\n")
result = subprocess.run([sys.executable, "-s", "app.py"], cwd=d, capture_output=True, text=True)
print(result.stdout + result.stderr)
```

The script body runs twice (as `__main__` and as `app`), and the helper appends to a different `registry` list from the one `__main__` prints. Keep the entry point thin and put shared state in modules that are only ever imported.

## Circular imports {#ch12-circular .th}

Step 3 above inserts a module into `sys.modules` **before** its code runs. If module `a` imports `b` and `b` imports `a`, the inner `import a` finds the **partially initialised** `a` in the cache and returns it. Whatever `a` defines *after* its `import b` line does not exist yet:

```python run=c12-circular
import sys, os, tempfile

d = tempfile.mkdtemp()
with open(os.path.join(d, "orders.py"), "w") as f:
    f.write("import customers\nclass Order:\n    pass\ndef describe():\n    return customers.Customer.__name__\n")
with open(os.path.join(d, "customers.py"), "w") as f:
    f.write("from orders import Order\nclass Customer:\n    pass\n")
sys.path.insert(0, d)
try:
    import orders
except ImportError as e:
    print("ImportError:", e)

for name in ("orders", "customers"):
    sys.modules.pop(name, None)
with open(os.path.join(d, "customers.py"), "w") as f:
    f.write("import orders\nclass Customer:\n    def first_order(self):\n        return orders.Order()\n")
import orders
print(orders.describe(), type(orders.customers.Customer().first_order()).__name__)
```

`from orders import Order` fails because `orders` exists but has not yet reached the `class Order` line. Switching to `import orders` and reading `orders.Order` **inside a function** defers the attribute lookup until both modules have finished loading.

:::tip
Ways out of a circular import, from best to worst: move the shared code into a third module both can import; import the module (not names from it) and access attributes at call time; move the import inside the function that needs it; for type hints only, use `from __future__ import annotations` and `if TYPE_CHECKING:` imports.
:::

## Bytecode caching {#ch12-pyc .th}

Compiling a module is the slowest part of importing it, so `SourceFileLoader` caches the code object in `__pycache__/<name>.<cache_tag>.pyc`, for example `settings.cpython-312.pyc`. The file is a 16-byte header followed by the code object serialised with `marshal`:

- 4 bytes: the **magic number** of the bytecode format, which changes in nearly every minor Python version;
- 4 bytes: flags, saying whether validation uses the source's timestamp or its hash (PEP 552);
- 8 bytes: the source's modification time and size, or a 64-bit hash of the source.

On import, the loader compares the header against the source file and recompiles if they disagree.

```python run=c12-pyc
import sys, os, tempfile, importlib, importlib.util, marshal

sys.dont_write_bytecode = False          # this guide's runner disables pyc writing
d = tempfile.mkdtemp()
with open(os.path.join(d, "cached_mod.py"), "w") as f:
    f.write("ANSWER = 42\n")
sys.path.insert(0, d)
import cached_mod

pyc = importlib.util.cache_from_source(os.path.join(d, "cached_mod.py"))
print(os.path.relpath(pyc, d))
with open(pyc, "rb") as f:
    data = f.read()
print(data[:4] == importlib.util.MAGIC_NUMBER, int.from_bytes(data[4:8], "little"))
code = marshal.loads(data[16:])
print(type(code).__name__, code.co_names, code.co_consts)
```

Only imported modules are cached; the script you run directly is compiled every time, which is another reason to keep the entry script small. `python -B` or `PYTHONDONTWRITEBYTECODE=1` disables writing `.pyc` files, and `python -m compileall` pre-compiles a tree (useful for read-only deployments).

## Hooks: module __getattr__ and custom finders {#ch12-hooks .th}

Since 3.7 (PEP 562) a module can define `__getattr__(name)` (and `__dir__`), called when an attribute is not found. It is the standard way to deprecate names or load heavy submodules lazily:

```python run=c12-module-getattr
import sys, types, warnings

mod = types.ModuleType("compat")
exec(
    "import warnings\n"
    "new_name = 'value'\n"
    "def __getattr__(name):\n"
    "    if name == 'old_name':\n"
    "        warnings.warn('old_name is deprecated', DeprecationWarning, stacklevel=2)\n"
    "        return new_name\n"
    "    raise AttributeError(f'module {__name__!r} has no attribute {name!r}')\n",
    mod.__dict__,
)
sys.modules["compat"] = mod
import compat
with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter("always")
    print(compat.old_name, compat.new_name)
print(caught[0].category.__name__, str(caught[0].message))
```

To change *where* modules come from, add an object with a `find_spec` method to `sys.meta_path`. This is how zip imports, editable installs, frozen applications and many test tools work:

```python run=c12-finder
import sys, importlib.abc, importlib.util

SOURCES = {
    "virtual_greet": "def hello(name):\n    return f'hello {name} from memory'\n",
}

class DictFinder(importlib.abc.MetaPathFinder, importlib.abc.Loader):
    def find_spec(self, name, path, target=None):
        if name in SOURCES:
            return importlib.util.spec_from_loader(name, self, origin="<memory>")
        return None
    def exec_module(self, module):
        exec(compile(SOURCES[module.__name__], module.__spec__.origin, "exec"), module.__dict__)

sys.meta_path.insert(0, DictFinder())
import virtual_greet
print(virtual_greet.hello("Ada"), virtual_greet.__spec__.origin)
```

Returning `None` from `find_spec` lets the next finder try, so the custom finder only handles the names it knows about.

## Concept and tricky questions {#ch12-concept .dr}

:::drill concept
What are the steps of `import mod`, and which one makes modules singletons?
---
**Answer.** Check `sys.modules`; ask the finders on `sys.meta_path` for a spec; create the module and insert it into `sys.modules`; execute its code in the module's namespace; bind the name. The `sys.modules` cache (step 1) makes later imports return the same object without re-running the code.

**Why.** Inserting the module before executing it is also what allows circular imports to return a half-initialised module rather than recursing forever.
:::

:::drill tricky
After `from config import DEBUG`, another module sets `config.DEBUG = True`. Does your `DEBUG` change?
---
**Answer.** No. `from config import DEBUG` bound your own name to the object that `config.DEBUG` referred to at import time. Rebinding the attribute in the module does not touch your name.

**Why.** Read `config.DEBUG` at use time if it can change. The same issue makes `unittest.mock.patch` require the path where the name is *used*, not where it was defined.
:::

:::drill concept
Why can a file named `json.py` in your project break code that does `import json`?
---
**Answer.** The script's directory is the first entry on `sys.path`, so `PathFinder` finds your `json.py` before the standard library's `json` package.

**Why.** It is called shadowing. Isolated mode (`-I`) or `-P` (3.11+) removes the script directory from the path, but renaming the file is the real fix.
:::

:::drill concept
What is the difference between a regular package and a namespace package?
---
**Answer.** A regular package is a directory with `__init__.py`, which runs on import and gives the package a fixed location. A namespace package has no `__init__.py`; its `__path__` can combine directories from several places on `sys.path`, and it has no initialisation code.

**Why.** Namespace packages let separately installed distributions share a top-level name (for example `google.cloud.*`). Forgetting `__init__.py` accidentally makes a namespace package, which works but can pick up stray directories.
:::

:::drill tricky
Why does `from a import X` fail in a circular import when `import a` works?
---
**Answer.** During the cycle, `a` is in `sys.modules` but partly executed. `import a` only needs the module object, which exists. `from a import X` needs the attribute `X` right now, and it is not defined yet, so it raises `ImportError: cannot import name 'X' from partially initialized module 'a'`.

**Why.** Deferring the attribute access (reading `a.X` inside a function) waits until both modules have finished.
:::

:::drill concept
What is in a `.pyc` file header and how does Python decide whether it is stale?
---
**Answer.** A magic number for the bytecode format, a flags word, and either the source's modification time and size or a hash of the source (PEP 552). If the magic number differs, or the recorded timestamp/size (or hash) does not match the current source, the module is recompiled.

**Why.** Timestamp validation is cheap but can be fooled by tools that preserve mtimes; hash-based `.pyc` files are reproducible and used by distribution builders.
:::

:::drill tricky
Why do some programs see their main script's module-level code run twice?
---
**Answer.** The script runs as `__main__`. If another module imports it by its file name (`import app`), `sys.modules` has no `app` entry, so the file is imported again as a separate module, running its top-level code a second time with separate globals.

**Why.** Avoid importing the entry script; put shared code and state in a module and keep the script as a thin launcher.
:::

## Predict the output and find the bug {#ch12-reading .dr}

:::drill output
What does this print?

```python run=c12-d-cache
import sys, types

fake = types.ModuleType("math")
fake.pi = 3
sys.modules["math"] = fake
import math
print(math.pi)
del sys.modules["math"]
import math
print(round(math.pi, 2))
```
---
**Answer.** `3`, then `3.14`. While the fake module is in `sys.modules`, `import math` returns it without searching. After removing the entry, the next import finds the real built-in module.

**Why.** `sys.modules` is consulted first and trusted completely. Tests use this to inject fakes, and it is also how a broken half-import can poison later imports.
:::

:::drill output
What does this print?

```python run=c12-d-main
import sys
print(__name__, __spec__ is None, "__main__" in sys.modules)
import importlib.util
print(importlib.util.find_spec("collections").submodule_search_locations is not None)
```
---
**Answer.** `__main__ True True`, then `True`. A script run directly is the `__main__` module and has no spec (running with `-m` would give it one). `collections` is a package, so its spec has submodule search locations.

**Why.** `python -m pkg.module` sets `__spec__` and `__package__`, which is what makes relative imports work in modules run as scripts.
:::

:::drill output
What does this print?

```python run=c12-d-import-order
import sys, os, tempfile

d = tempfile.mkdtemp()
for name, src in {
    "alpha.py": "print('alpha start')\nimport beta\nprint('alpha end')\n",
    "beta.py": "print('beta start')\nimport alpha\nprint('beta sees alpha:', hasattr(alpha, 'X'))\nprint('beta end')\n",
}.items():
    with open(os.path.join(d, name), "w") as f:
        f.write(src)
sys.path.insert(0, d)
import alpha
```
---
**Answer.** `alpha start`, `beta start`, `beta sees alpha: False`, `beta end`, `alpha end`. When `beta` imports `alpha`, the half-finished `alpha` is returned from `sys.modules`, and `beta` continues.

**Why.** No error occurs because `beta` only uses `alpha` as a module object; it would fail if it needed an attribute `alpha` defines later.
:::

:::drill bug
A test patches `requests.get` but the real network call still happens. Find the bug.

```python run=c12-d-bug-patch
import sys, types
from unittest import mock

net = types.ModuleType("net")
exec("def get(url):\n    return 'REAL ' + url\n", net.__dict__)
sys.modules["net"] = net

client = types.ModuleType("client")
exec("from net import get\ndef fetch():\n    return get('/users')\n", client.__dict__)
sys.modules["client"] = client

with mock.patch("net.get", return_value="FAKE"):
    print(client.fetch())
with mock.patch("client.get", return_value="FAKE"):
    print(client.fetch())
```
---
**Answer.** `client` did `from net import get`, so it holds its own reference. Patching `net.get` replaces the attribute on `net`, which `client` never reads again. Patch where the name is looked up: `client.get`.

**Why.** The `mock` documentation calls this "patch where an object is used, not where it is defined", and it follows directly from how `from … import` binds names.
:::

:::drill bug
Start-up is slow because a CLI imports a heavy library that most commands never use. Fix it without changing the commands' code.

```python run=c12-d-bug-lazy nondet
import sys, types, time

heavy = types.ModuleType("heavy")
exec("import time\ntime.sleep(0.2)\ndef analyse():\n    return 'analysed'\n", heavy.__dict__)

cli_src = '''
import importlib
_lazy = {"analyse": "heavy"}
def __getattr__(name):
    if name in _lazy:
        module = importlib.import_module(_lazy[name])
        return getattr(module, name)
    raise AttributeError(name)
def version():
    return "1.0"
'''
cli = types.ModuleType("cli")
exec(cli_src, cli.__dict__)
sys.modules["cli"] = cli

t0 = time.perf_counter()
import cli
print(cli.version(), "fast import:", time.perf_counter() - t0 < 0.1)
sys.modules["heavy"] = heavy
print(cli.analyse())
```
---
**Answer.** The original `cli` did `from heavy import analyse` at the top, paying for `heavy` on every start. The fix uses a module-level `__getattr__` (PEP 562) to import `heavy` only when `cli.analyse` is first accessed.

**Why.** `python -X importtime` shows which imports dominate start-up. Lazy loading through module `__getattr__` keeps the public API unchanged.
:::

## Write the code {#ch12-coding .cd}

:::drill code rating=1300
Write `import_from_path(name, path)` that imports a single Python file as a module under a given name, without adding its directory to `sys.path`, and registers it in `sys.modules`.
---
```python run=c12-c-frompath
import sys, os, tempfile, importlib.util

def import_from_path(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None:
        raise ImportError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    try:
        spec.loader.exec_module(module)
    except BaseException:
        del sys.modules[name]
        raise
    return module

d = tempfile.mkdtemp()
path = os.path.join(d, "plugin-v2.py")
with open(path, "w") as f:
    f.write("NAME = 'v2'\ndef run():\n    return NAME.upper()\n")
plugin = import_from_path("plugin_v2", path)
print(plugin.run(), sys.modules["plugin_v2"] is plugin, d in sys.path)
```

Registering in `sys.modules` before `exec_module` mirrors what the import system does, so the module can import itself (or be part of a cycle). Removing it on failure prevents a broken, half-executed module from being cached.
:::

:::drill code rating=1400
Write `import_graph(package_dir)` that parses every `.py` file in a directory with `ast`, without importing anything, and returns which local modules each one imports. Use it to detect a cycle.
---
```python run=c12-c-graph
import ast, os, tempfile

def import_graph(directory):
    modules = {f[:-3] for f in os.listdir(directory) if f.endswith(".py")}
    graph = {}
    for mod in sorted(modules):
        with open(os.path.join(directory, mod + ".py")) as f:
            tree = ast.parse(f.read())
        deps = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                deps.update(a.name.split(".")[0] for a in node.names)
            elif isinstance(node, ast.ImportFrom) and node.module and node.level == 0:
                deps.add(node.module.split(".")[0])
        graph[mod] = sorted(deps & modules)
    return graph

def find_cycle(graph):
    state = {}
    def visit(n, path):
        state[n] = "active"
        for m in graph[n]:
            if state.get(m) == "active":
                return path[path.index(m):] + [m]
            if m not in state:
                found = visit(m, path + [m])
                if found:
                    return found
        state[n] = "done"
    for n in graph:
        if n not in state:
            c = visit(n, [n])
            if c:
                return c

d = tempfile.mkdtemp()
for name, src in {"app.py": "import models\nimport os\n", "models.py": "from db import connect\n",
                  "db.py": "import models\n", "util.py": ""}.items():
    with open(os.path.join(d, name), "w") as f:
        f.write(src)
g = import_graph(d)
print(g)
print(find_cycle(g))
```

Static analysis is how tools such as `pydeps` and linters find import cycles without running module code (which could have side effects).
:::

:::drill code rating=1500
Write a meta path finder that logs every import (name and time taken, including nested imports, indented by depth) by wrapping the normal machinery, then import a standard-library module that is not loaded yet.
---
Delegate to the rest of `sys.meta_path` to find the spec, then wrap the loader's `exec_module`.

```python run=c12-c-tracer nondet
import sys, time, importlib.abc

class ImportTracer(importlib.abc.MetaPathFinder):
    depth = 0
    log = []

    def find_spec(self, name, path, target=None):
        for finder in sys.meta_path:
            if finder is self or not hasattr(finder, "find_spec"):
                continue
            spec = finder.find_spec(name, path, target)
            if spec is not None and spec.loader is not None and hasattr(spec.loader, "exec_module"):
                original = spec.loader.exec_module
                tracer = self
                def exec_module(module, original=original, name=name):
                    tracer.depth += 1
                    t0 = time.perf_counter()
                    try:
                        original(module)
                    finally:
                        tracer.depth -= 1
                        tracer.log.append((tracer.depth, name, time.perf_counter() - t0))
                spec.loader.exec_module = exec_module
                return spec
            if spec is not None:
                return spec
        return None

tracer = ImportTracer()
sys.meta_path.insert(0, tracer)
import fractions
sys.meta_path.remove(tracer)
for depth, name, secs in reversed(tracer.log[-6:]):
    print("  " * depth + name)
print("fractions" in [n for _, n, _ in tracer.log])
```

The log is appended when each module *finishes*, so it is printed reversed to show parents before children. It records the name being imported rather than `module.__name__`, because some C extensions name themselves differently: `_decimal` calls itself `decimal`. `python -X importtime` gives the same information without code.
:::

:::drill code rating=1200
Write a `deprecated_alias(module_globals, old, new)` helper that installs a module-level `__getattr__` so that accessing `old` returns `new`'s value with a `DeprecationWarning`, while other missing names still raise `AttributeError`.
---
```python run=c12-c-alias
import sys, types, warnings

def deprecated_alias(g, old, new):
    previous = g.get("__getattr__")
    def __getattr__(name):
        if name == old:
            warnings.warn(f"{old} is deprecated; use {new}", DeprecationWarning, stacklevel=2)
            return g[new]
        if previous:
            return previous(name)
        raise AttributeError(f"module {g['__name__']!r} has no attribute {name!r}")
    g["__getattr__"] = __getattr__

lib = types.ModuleType("lib")
lib.connect_db = lambda: "connected"
deprecated_alias(lib.__dict__, "open_db", "connect_db")
sys.modules["lib"] = lib

import lib
with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    print(lib.open_db(), str(w[0].message))
try:
    lib.missing
except AttributeError as e:
    print("AttributeError:", e)
```

Chaining to a previous `__getattr__` lets several aliases be installed on the same module.
:::

## Cheat sheet {#ch12-cheatsheet .th}

- `import m`: `sys.modules` → `sys.meta_path` finders (`BuiltinImporter`, `FrozenImporter`, `PathFinder`) → spec → module inserted into `sys.modules` → code executed → name bound.
- Module code runs once per process; `importlib.reload` re-runs it in the same object, but `from m import x` copies are stale.
- `sys.path`: script dir (or cwd), `PYTHONPATH`, stdlib, site-packages + `.pth` files. `-I` / `-P` drop the script dir. Never name files like stdlib modules.
- Regular package = `__init__.py` + `__path__`; namespace package = no `__init__.py`, can span directories. Relative imports need `__package__` (use `python -m`).
- The script is `__main__`; importing it by name runs it again as a second module.
- Circular imports return partially initialised modules: `import m` + attribute access at call time works, `from m import X` fails.
- `.pyc` in `__pycache__/m.cpython-312.pyc`: 16-byte header (magic, flags, mtime+size or source hash) + marshalled code object. Only imported modules are cached.
- Module `__getattr__`/`__dir__` (PEP 562) for lazy and deprecated names; custom finders on `sys.meta_path` implement `find_spec`.
- Patch names where they are used (`client.get`), not where they are defined.
