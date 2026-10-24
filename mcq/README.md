# Placement MCQ Prep

A local MCQ practice site for placement preparation, covering Computer Networks, Operating Systems, SQL/DBMS, Python and Finance (graduate entry-level finance plus quant topics: probability, stochastic calculus, time series, derivatives and the Greeks). It has 2,363 questions across 73 subdomains, each with Easy, Medium and Hard levels.

The site is plain HTML, CSS and JavaScript. It needs no build step, no server and no internet connection.

## How to open it

- **Any OS:** double-click `index.html`. It runs directly from `file://`.
- **Linux terminal:** `xdg-open index.html`
- **macOS terminal:** `open index.html`
- **Windows terminal:** `start index.html`

Progress, bookmarks, quiz preferences and the theme are saved in your browser's localStorage. They are kept per browser, and private windows don't keep them. If storage is blocked, the site still works without saving.

## Using the site

**Navigation**
- Go Home → Domain → Subdomain → Easy, Medium, Hard or All levels.
- A breadcrumb at the top always leads back.
- Before starting, choose the number of questions (10, 20, 30 or All) and turn shuffle on or off.

**Practice**
- Answers lock as soon as you pick one.
- The correct option turns green and a wrong pick turns red.
- You then see the full explanation plus a note on why each option is right or wrong.

**Summary screen**
- Shows score and time taken.
- Breaks results down by subdomain and difficulty.
- Lists every question you got wrong, with its explanation.

**Modes**
- **Review Mistakes:** questions whose most recent attempt was wrong. Each one leaves the list once you answer it correctly.
- **Bookmarked:** questions you starred.
- **Mixed Mock Test:** 30 random questions with a 45-minute timer, drawn evenly from the domains you select (e.g. Finance only, or the four tech domains). Explanations appear only after you submit.

**Other features**
- Search across question text, code, options, explanations, subtopics, tags and ids.
- Dark/light theme toggle.
- Syntax highlighting for Python, SQL, C and shell.
- Responsive layout for phones.
- Reset progress, with a confirmation dialog.

**Keyboard shortcuts during a quiz**

| Key | Action |
|---|---|
| `1`–`4` or `A`–`D` | Choose an option |
| `Enter` or `→` | Next question |
| `←` | Previous question |
| `S` | Bookmark or un-bookmark |

## Project layout

```
index.html            page shell, plus one <script> tag per data file
css/styles.css        theme and layout
js/app.js             the app: router, quiz engine, modes, search, storage
data/catalog.js       domain → subdomain registry (display order, names, id prefixes)
data/<domain>/*.js    questions, one file per subdomain
scripts/validate.js   schema and coverage validator
COVERAGE.md           concept checklist with the question ids that cover each concept
```

## Adding your own questions

1. Open the file for the subdomain, for example `data/os/sched.js`.
2. Add an object inside the `window.QUESTIONS.push( ... );` call, with a comma between objects:

```js
{
  id: "os-sched-041",              // <prefix>-<subdomain key>-NNN, unique (next free number)
  subject: "os",                   // networks | os | sql | python | finance
  subtopic: "CPU Scheduling",      // must exactly match the subdomain name in data/catalog.js
  difficulty: "medium",            // easy | medium | hard
  type: "numerical",               // concept | numerical | code-output | query
  question: "Three processes arrive at t = 0 ...",
  code: "SELECT ...",              // optional; shown as a highlighted code block
  options: ["…", "…", "…", "…"],   // exactly 4 distinct options
  answer: 2,                       // 0-based index of the correct option (0 = A ... 3 = D)
  explanation: "Show the working, not just the result.",
  optionExplanations: ["why A is wrong", "why B is wrong", "why C is right", "why D is wrong"],
  tags: ["interview-favourite"]    // optional
}
```

3. Run the validator (it needs Node.js):

```
node scripts/validate.js          # full table of counts per level, plus answer distribution
node scripts/validate.js --quiet  # errors and summary only
```

The validator checks:
- required fields, allowed values and the id format;
- duplicate ids and duplicate options;
- that every subtopic exists in the catalog and every data file is loaded by `index.html`;
- that every subdomain has Easy, Medium and Hard questions.

It exits with code 1 if anything is wrong. It also prints how often each position (A–D) holds the correct answer, so you can keep that balanced.

4. Reload `index.html`. Your question appears in its subdomain, in search and in the mock-test pool.

Tips:
- Inside a JS string, escape `"` and `\`, and write newlines in `code` as `\n`. Backtick template strings also work.
- Don't use options like "All of the above". Make every distractor a plausible mistake.
- If the question is about a concept, tick it off in `COVERAGE.md` with the new id.

## Adding a new subdomain or domain

1. Add `{ key: "mykey", name: "My Topic" }` to the right domain's `subdomains` list in `data/catalog.js`. To add a whole domain, add a new entry with its own `id`, `prefix`, `name` and `short` fields.
2. Create `data/<domain>/mykey.js` containing `window.QUESTIONS.push( ... );`.
3. Add `<script src="data/<domain>/mykey.js"></script>` to `index.html`, after `data/catalog.js` and before `js/app.js`.
4. Run `node scripts/validate.js`.

## Coverage

`COVERAGE.md` lists every concept tested, per subdomain, and links each one to its question ids. It opens with a final coverage report table.
