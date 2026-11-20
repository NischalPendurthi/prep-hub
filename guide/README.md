# C++ guide and OS & Networks guide

Source for `/guide/` on Prep Hub. Same chapter format and build as `langs/`; see `langs/README.md` for the syntax.

```bash
node langs/build.mjs --root guide              # build; runs only examples whose code changed
node langs/build.mjs --root guide --only cpp
node langs/build.mjs --root guide --verify     # re-run every example; fail if any recorded output changed (CI)
```

## Files

- `content/cpp/`, `content/os/`: `00-overview.md` plus one file per chapter.
  - `NN-slug.html` chapters came from the original one-page guide (Oct 2026). They are finished HTML (front matter, then `<section>` elements) and nothing in them runs. Every id must start with the chapter's `chNN`.
  - `NN-slug.md` chapters are normal Markdown chapters whose `cpp run=` examples run on every build. Chapters 4–6 and 23–28 of the C++ guide cover the CS 787 course material.
- `site.mjs`: guide order and the `/guide/` landing page.
- `redirects.json`: every anchor of the old one-page guide (`#ch09`, `#ch09-cookies`, …) mapped to its new place. The landing page uses it, so old links such as `../guide/#ch05` still work.
- `outputs.json`: recorded example output (commit it). `dist/` and `.work/` are generated.

## Conventions

- Run ids share one namespace per language across both guides, so prefix them with the chapter: `c26-…`.
- Thread examples must print the same thing every run: join before printing, or mark the block `nondet`.
- A program that is meant not to compile uses `expect=error`; trim the compiler error with `head=N`.
