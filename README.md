# Prep Hub

One site for placement and interview prep, published at **https://nischalpendurthi.github.io/prep-hub/**.

| Path | Tool | Source |
|---|---|---|
| `/` | Hub landing page with progress from each tool | `index.html` |
| `/guide/` | C++ / OS / Networks interview guide | `guide/index.html` |
| `/langs/` | Language internals: Python, Java, Go, Rust | `langs/` (built from `langs/content/`) |
| `/mcq/` | Placement MCQ Prep (2,363 questions) | `mcq/` |
| `/atlas/` | CP Atlas: pattern map, templates, problem log, revision queue | `atlas/` (built from `atlas/content/`) |
| `/ladder/` | Codeforces 2000–2400 ladder, hard drill, segment tree & BIT, PYQ tracker | `ladder/` |
| `/counter/` | Practice counter with GitHub Gist sync | `counter/` |

## Shared look
`shared/hub.css` defines the colour, font and radius tokens for light and dark themes, and the hub bar.
`shared/hub.js` renders the hub bar, keeps one theme across all tools, and records the last tool you opened.
Each tool has a small `theme.css` that points its own CSS variables at the hub tokens, so the tools keep their
own code but share one look.

## Build and preview
```bash
./build.sh --serve        # builds atlas data, assembles _site/, serves http://localhost:8000
```
Needs Python 3 with PyYAML (`pip install pyyaml`). `python3 atlas/tools/verify.py templates` also needs g++.

## Deploy
Push to `main`. `.github/workflows/pages.yml` checks the atlas templates, runs `build.sh` and publishes `_site/` to GitHub Pages.

## Language internals guides

`langs/` holds the Python, Java, Go and Rust guides, built from Markdown by `node langs/build.mjs`, which runs every example and records its output. See `langs/README.md` for the chapter format.

## Logging a CP Atlas problem
```bash
cd atlas
python3 tools/add.py <url> sol.cpp -v <variant-id> -i "the one-line trick"
python3 tools/build.py    # must pass
cd .. && git add -A && git commit -m "atlas: log <problem>" && git push
```
