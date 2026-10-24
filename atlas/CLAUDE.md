# CP Atlas

A personal revision site for competitive-programming patterns. Content lives in `content/`.
`tools/build.py` turns it into `site/data.js`, and `site/` is a no-build static page.
This folder is part of the Prep Hub repo (`../`): it deploys to `/prep-hub/atlas/` when the repo is pushed, and the page
loads the hub's shared look from `../shared/`. Run the commands below from this `atlas/` folder; preview with `../build.sh --serve`
(http://localhost:8000/atlas/) so the shared styles load.

## Commands
- `python3 tools/build.py`: validate content and write `site/data.js`. For a preview use `../build.sh --serve` (it runs this build too).
- `python3 tools/verify.py`: compile and run every template, plus check every problem link against CF/LC/CSES. Variants: `verify.py templates <id>`, `verify.py links`.
- `python3 tools/add.py <url> <file.cpp> -v <variant-id> -i "insight" [-m "mistakes"] [--star]`: log a solved problem.

## Adding a problem the user solved ("add today's problem …")
1. Read their solution file. Work out the variant id(s) from `content/taxonomy.yaml`; never invent ids.
2. Draft a one-line **insight** (the trick that makes it work, not a restatement of the problem) and any **mistakes** they hit. Show both to the user to confirm before writing.
3. Run `tools/add.py` with the URL, file, `-v` ids, `-i` insight and `-m` mistakes. Use `--platform OA --title …` and url `-` for OA problems.
4. Run `python3 tools/build.py`. It must pass.

## Adding or writing a variant
1. The id must already exist in `content/taxonomy.yaml`. Add it there first if it's genuinely new.
2. Create `content/variants/<category>/<id>.md` with front matter: `id, title, signals, idea, complexity, pitfalls, related`. The body holds deeper notes.
3. Create `content/templates/<id>.cpp`, starting from `tools/skeleton.cpp`. Only `Solve()` and helpers change. **User style:** `ll` everywhere, `vi/vvi/pi` typedefs, `cin >> n;`, `for(ll i=0;i<n;i++)`, `function<…>` lambdas for recursion, small structs or free functions for data structures, short comments explaining *why*. The template solves one canonical problem (named in a comment on the first line of the core).
4. Add `content/tests/<id>/1.in` and `1.out` (and more cases). Expected outputs must come from a known source or a brute force, never from the template itself. Add `stress.py` (random tests against a brute force) for anything non-trivial.
5. Add 3–5 problems to `content/standard.yaml` (LC slug / CF contest+index / CSES task id, title, rating).
6. `python3 tools/verify.py templates <id>` and `python3 tools/verify.py links` must both pass. **Never ship a problem link that `verify.py` hasn't confirmed.**

## Schema reminders
- `content/mine/*.md`: `title, url, platform (CF|LC|CSES|AC|CC|OA|OTHER), rating, date (YYYY-MM-DD), variants, tags, insight, mistakes, star, status (solved|needs-insight|unsolved)`, then the code block in the body. A `solved` entry needs an insight and at least one variant.
- Tags starting with `cf:` come from Codeforces and are hidden on cards but searchable.
