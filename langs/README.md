# Language internals guides

Source for `/langs/` on Prep Hub: one guide per language, built from Markdown chapters by `build.mjs`.
Every example marked `run=` is executed, and its real output is shown under it.

```bash
node langs/build.mjs                 # build; runs only examples whose code changed
node langs/build.mjs --only python   # one language
node langs/build.mjs --verify        # re-run every example; fail if any recorded output changed (CI)
../build.sh --serve                  # whole hub at http://localhost:8000/langs/
```

Toolchains are pinned in `toolchains.json` and in `.github/workflows/pages.yml`.
Recorded outputs live in `outputs.json` (commit it); `dist/` and `.work/` are generated.

## Files

- `content/<lang>/00-overview.md`: front matter `name`, `short`, `icon`, `version`, `eyebrow`, `headline` (HTML allowed),
  `lede`, `card`, `cta` (`Label|#anchor; …`), `search`; body = a `:::hero` block plus Markdown (tables become the plan).
- `content/<lang>/NN-slug.md`: one chapter. Front matter `title`, `part`, `lede`, `desc`, `hours`, `prereqs`.
- `reader/`: the reader CSS/JS (extracted from the C++ guide) and the hub theme mapping.

## Chapter syntax

- `## Title {#chNN-id .th}`: a section. Roles: `.th` theory, `.dr` drills, `.cd` coding.
- `### Title {#id}`: a subsection, listed in "On this page".
- Markdown: paragraphs, `**bold**`, `*em*`, `` `code` ``, `[links](#ch03)`, lists, tables. Lines starting with `<` are raw HTML
  (SVG figures use the reader classes `d-acc`, `d-key`, `d-soft`, `t-mono`, …).
- Code fences: ```` ```python run=c01-name ```` runs the block. Flags: `expect=error` (must fail; the error is the output),
  `nondet` (output varies; shown as recorded, verify only checks it runs), `cmd="…"` (custom shell command),
  `file=Name.java`, `env="K=V"`, `head=N`, `timeout=S`, `no-output`. A fence without `run=` is shown, not run.
- `:::trap`, `:::key`, `:::tip`, `:::new` (optional title after the kind) … `:::`: callouts.
- `:::drill concept|tricky|output|bug|code [rating=1400]` … question … `---` … answer … `:::`.
  Output from `run=` blocks in the question is moved into the hidden answer.

Run ids must be unique per language; use the chapter prefix (`c05-…`).
