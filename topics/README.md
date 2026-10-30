# Topic guides and role roadmaps

Source for `/topics/` on Prep Hub. Same chapter format and build as `langs/`; see `langs/README.md` for the syntax.

```bash
node langs/build.mjs --root topics                 # build; runs only examples whose code changed
node langs/build.mjs --root topics --only compilers
node langs/build.mjs --root topics --verify        # re-run every example; fail if any recorded output changed (CI)
```

## Files

- `tracks.json`: guide order, the role tracks and their concept checklists, and the round-type table.
- `site.mjs`: renders the landing page from `tracks.json`.
- `content/<guide>/`: `00-overview.md` and `NN-slug.md` chapters. A guide must be listed in `tracks.json` to build.
- `outputs.json`: recorded example output (commit it). `dist/` and `.work/` are generated.

## Conventions

- Any fence language with a runner can use `run=` here: `python`, `c`, `cpp`, `bash`, `java`, `go`, `rust`. Python may import NumPy.
- Run ids share one namespace per language across all guides, so prefix them with the guide: `el-c02-…`.
- Examples must print the same thing on any recent GCC. Mark timing or machine-dependent output `nondet`.
- Kernel modules, Yocto, PyTorch training and Kubernetes can't run in CI. Show them as plain fences, without output.
- This site is public. Guides are organised by topic: no company names, job description text or pay.
