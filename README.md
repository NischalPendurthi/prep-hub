# Prep Hub

One site for placement and interview prep, published at **https://nischalpendurthi.github.io/prep-hub/**.

| Path | Tool | Source |
|---|---|---|
| `/` | Hub landing page with progress from each tool | `index.html` |
| `/guide/` | C++ / OS / Networks interview guide | `guide/index.html` |
| `/langs/` | Language internals: Python, Java, Go, Rust | `langs/` (built from `langs/content/`) |
| `/topics/` | Role-based roadmaps and topic guides: embedded, compilers, ML, system design, aptitude | `topics/` (built from `topics/content/`) |
| `/mcq/` | Placement MCQ Prep (2,363 questions) | `mcq/` |
| `/videos/` | Video Picks: one best lecture per subtopic, plus deeper and quicker alternatives | `videos/` (built from `videos/content/`) |
| `/atlas/` | CP Atlas: pattern map, templates, problem log, revision queue | `atlas/` (built from `atlas/content/`) |
| `/ladder/` | Codeforces 2000–2400 ladder, hard drill, segment tree & BIT, PYQ tracker | `ladder/` |
| `/counter/` | Practice counter with GitHub Gist sync | `counter/` |
| `/applications/` | Applied companies and roles with status tags, saved in the browser | `applications/` |

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

## Topic guides

`topics/` holds the role roadmaps (`tracks.json`) and topic guides. It uses the same chapter format and build as `langs/`: `node langs/build.mjs --root topics`. See `topics/README.md`.

## Logging a CP Atlas problem
```bash
cd atlas
python3 tools/add.py <url> sol.cpp -v <variant-id> -i "the one-line trick"
python3 tools/build.py    # must pass
cd .. && git add -A && git commit -m "atlas: log <problem>" && git push
```

## Sign-in

The hub bar has a GitHub sign-in. You paste a GitHub token, and `shared/hub.js` asks GitHub whose it is; only the account in `OWNER` counts as signed in. Signed out, Atlas, Ladder, Counter, Applications and Projects are hidden, and the Guide, Languages, Topics, MCQ and Videos stay public. Add `data-private` to an element, or to a page's `hub.js` script tag, to hide more.

**This hides things on screen. It isn't access control.** Everything in this repo is public, including the Atlas and Ladder pages. Truly private material must stay out of this repo: `/projects/` is only a loader, and its content lives in a private repo that GitHub serves only to a token with access.

## Applications

The list is kept in the browser's localStorage. `applications/seed.json` is gitignored, so the list never reaches the public repo or site. Each browser merges it in once: a local build reads the file directly, and the published site reads a copy from the private repo after sign-in (`projects/publish.sh` uploads it). Merging keeps any tag you've set and doesn't bring back entries you removed. Export and Import use the same format.

## Video picks

`videos/content/<topic>.json` holds the curated picks; `videos/content/index.json` sets topic order (topics without a file show as "soon").
To add a topic: add its search terms and subtopics to `videos/tools/topics.json`, run `python3 videos/tools/harvest.py <topic>`
(Hacker News + YouTube candidates into `videos/.work/<topic>/review.txt`), write `videos/content/<topic>.json`, then
`python3 videos/tools/build.py --online` to confirm every video still exists, embeds and has the recorded title. CI runs the offline check.
