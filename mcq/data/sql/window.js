/* SQL / DBMS — Window Functions */
window.QUESTIONS.push(
  {
    id: "sql-window-001", subject: "sql", subtopic: "Window Functions", difficulty: "easy", type: "concept",
    question: "What is the key difference between `SUM(salary) ... GROUP BY dept` and `SUM(salary) OVER (PARTITION BY dept)`?",
    options: ["They're identical", "GROUP BY can't use SUM", "The window version sums the whole table", "GROUP BY collapses each department into one row; the window version keeps every row and attaches the department total to each"],
    answer: 3,
    explanation: "Window functions compute across a set of related rows (the window) without collapsing them. That lets you show detail and aggregate side by side, e.g. each employee's salary next to their department total, rank or running sum.",
    optionExplanations: ["The number of output rows differs.", "SUM is the classic GROUP BY aggregate.", "PARTITION BY restricts the sum to each department.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-window-002", subject: "sql", subtopic: "Window Functions", difficulty: "easy", type: "query",
    question: "What RANK() does Ben get?",
    code: "-- s(name, score): Amy 90, Ben 85, Cal 90, Dan 80\nSELECT name, RANK() OVER (ORDER BY score DESC) AS r FROM s;",
    options: ["2", "1", "3", "4"],
    answer: 2,
    explanation: "RANK gives tied rows the same rank and then SKIPS ranks: Amy and Cal share rank 1, so the next rank is 3 (two rows are ahead of Ben). DENSE_RANK would give Ben 2.",
    optionExplanations: ["That's DENSE_RANK's value.", "Two people scored higher.", "Correct.", "Dan gets 4."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-window-003", subject: "sql", subtopic: "Window Functions", difficulty: "easy", type: "query",
    question: "Using the same scores (Amy 90, Ben 85, Cal 90, Dan 80), what DENSE_RANK() does Dan get?",
    code: "SELECT name, DENSE_RANK() OVER (ORDER BY score DESC) AS dr FROM s;",
    options: ["4", "1", "2", "3"],
    answer: 3,
    explanation: "DENSE_RANK assigns consecutive ranks without gaps: 90 → 1 (Amy, Cal), 85 → 2 (Ben), 80 → 3 (Dan). RANK would give Dan 4.",
    optionExplanations: ["That's RANK's value (with a gap).", "Rank 1 belongs to the 90s.", "Ben has rank 2.", "Correct."]
  },
  {
    id: "sql-window-004", subject: "sql", subtopic: "Window Functions", difficulty: "easy", type: "concept",
    question: "With ties in the ORDER BY column, how do ROW_NUMBER, RANK and DENSE_RANK differ?",
    options: ["All three give tied rows the same number", "DENSE_RANK breaks ties arbitrarily", "ROW_NUMBER leaves gaps after ties", "ROW_NUMBER gives unique consecutive numbers (ties broken arbitrarily); RANK gives ties the same number and leaves gaps; DENSE_RANK gives ties the same number with no gaps"],
    answer: 3,
    explanation: "For scores 90, 90, 85: ROW_NUMBER → 1, 2, 3; RANK → 1, 1, 3; DENSE_RANK → 1, 1, 2. Choose ROW_NUMBER to pick exactly one row per group, DENSE_RANK for 'Nth highest distinct value', RANK for competition-style ranking.",
    optionExplanations: ["ROW_NUMBER never repeats numbers.", "DENSE_RANK assigns ties the same rank.", "ROW_NUMBER is always 1..n.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-window-005", subject: "sql", subtopic: "Window Functions", difficulty: "easy", type: "query",
    question: "emp has 6 rows with salaries totalling 36000. What does the `total` column contain?",
    code: "SELECT name, salary, SUM(salary) OVER () AS total FROM emp;",
    options: ["A running total", "Each row's own salary", "One row containing 36000", "36000 on every one of the 6 rows"],
    answer: 3,
    explanation: "An empty OVER () means the window is the entire result set, with no ordering. So every row gets the grand total, and all 6 rows are kept. This is handy for percentages: salary * 100.0 / SUM(salary) OVER ().",
    optionExplanations: ["Without ORDER BY there's no running frame.", "The window covers all rows.", "Window functions don't collapse rows.", "Correct."]
  },
  {
    id: "sql-window-006", subject: "sql", subtopic: "Window Functions", difficulty: "easy", type: "query",
    question: "What does dept_total show for employee A?",
    code: "-- emp(name, dept, salary)\n-- A | HR | 3000\n-- B | HR | 5000\n-- F | HR | 5000\n-- C | IT | 7000\n-- D | IT | 9000\n-- E | IT | 7000\nSELECT name, SUM(salary) OVER (PARTITION BY dept) AS dept_total FROM emp;",
    options: ["13000", "3000", "36000", "23000"],
    answer: 0,
    explanation: "PARTITION BY splits rows into independent groups for the window function. A is in HR, whose salaries sum to 3000 + 5000 + 5000 = 13000; every HR row shows 13000.",
    optionExplanations: ["Correct.", "That's only A's salary.", "That's the grand total.", "That's IT's total."]
  },
  {
    id: "sql-window-007", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "t(day, amt): (1, 10), (2, 20), (3, 40). What do the prev and prev0 columns show for day 1?",
    code: "SELECT day, amt,\n       LAG(amt)       OVER (ORDER BY day) AS prev,\n       LAG(amt, 1, 0) OVER (ORDER BY day) AS prev0\nFROM t;",
    options: ["prev 10, prev0 10", "prev NULL, prev0 0", "prev 0, prev0 0", "prev 20, prev0 20"],
    answer: 1,
    explanation: "LAG(expr, offset = 1, default = NULL) returns the value from the row `offset` positions earlier in the window ordering. The first row has no previous row, so LAG returns NULL, or the supplied default (0). LEAD looks forward instead.",
    optionExplanations: ["There's no row before day 1.", "Correct.", "Without a default, LAG returns NULL.", "Day 2's value would be LEAD's result."]
  },
  {
    id: "sql-window-008", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "t(day, amt): (1, 10), (2, 20), (3, 40). What are the `nxt` values in day order?",
    code: "SELECT day, LEAD(amt) OVER (ORDER BY day) AS nxt FROM t;",
    options: ["20, 40, NULL", "NULL, 10, 20", "10, 20, 40", "40, NULL, NULL"],
    answer: 0,
    explanation: "LEAD returns the value from the following row. The last row has no successor, so it gets NULL (unless a default is given). Comparing with LEAD/LAG is how you compute day-over-day changes.",
    optionExplanations: ["Correct.", "That's LAG.", "That's the column itself.", "LEAD looks just one row ahead."]
  },
  {
    id: "sql-window-009", subject: "sql", subtopic: "Window Functions", difficulty: "hard", type: "query",
    question: "t(d, amt): (1, 10), (2, 20), (2, 30), (3, 40). What are the r1 values (in d order)?",
    code: "SELECT d, amt,\n       SUM(amt) OVER (ORDER BY d) AS r1,\n       SUM(amt) OVER (ORDER BY d ROWS UNBOUNDED PRECEDING) AS r2\nFROM t;",
    options: ["10, 30, 60, 100", "100, 100, 100, 100", "10, 20, 30, 40", "10, 60, 60, 100"],
    answer: 3,
    explanation: "With ORDER BY and no explicit frame, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which includes all PEERS (rows with the same d). Both d = 2 rows therefore see 10 + 20 + 30 = 60. With ROWS (r2), each row stops at itself: 10, 30, 60, 100.",
    optionExplanations: ["That's r2 (ROWS frame).", "That would be SUM() OVER () without ORDER BY.", "Those are the raw amounts.", "Correct."],
    tags: ["trap", "interview-favourite"]
  },
  {
    id: "sql-window-010", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "t(day, v): (1, 10), (2, 20), (3, 30), (4, 40). What are the ma values?",
    code: "SELECT day,\n       AVG(v) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS ma\nFROM t;",
    options: ["10, 15, 20, 30", "10, 20, 30, 40", "20, 30, 40, 40", "25, 25, 25, 25"],
    answer: 0,
    explanation: "A 3-row moving average: each row averages itself and up to 2 previous rows. Day 1: 10; day 2: (10 + 20) / 2 = 15; day 3: (10 + 20 + 30) / 3 = 20; day 4: (20 + 30 + 40) / 3 = 30. Early rows have smaller windows.",
    optionExplanations: ["Correct.", "That's the raw value.", "The frame looks backwards, not forwards.", "That's the overall average."]
  },
  {
    id: "sql-window-011", subject: "sql", subtopic: "Window Functions", difficulty: "hard", type: "query",
    question: "t(x): 10, 20, 30 (distinct). What does `lv` contain?",
    code: "SELECT x, LAST_VALUE(x) OVER (ORDER BY x) AS lv FROM t;",
    options: ["30, 30, 30", "10, 10, 10", "10, 20, 30", "NULL, NULL, 30"],
    answer: 2,
    explanation: "With ORDER BY, the default frame ends at the CURRENT ROW (and its peers), so the 'last value' of the frame is the current row's own value. To get the partition's last value, specify ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING (or use FIRST_VALUE with reversed ordering).",
    optionExplanations: ["That needs an explicit frame to UNBOUNDED FOLLOWING.", "That's FIRST_VALUE.", "Correct.", "The frame always contains the current row."],
    tags: ["trap"]
  },
  {
    id: "sql-window-012", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "Using the emp table (HR: A 3000, B 5000, F 5000; IT: C 7000, D 9000, E 7000), what does `top_sal` show for employee E?",
    code: "SELECT name,\n       FIRST_VALUE(salary) OVER (PARTITION BY dept ORDER BY salary DESC) AS top_sal\nFROM emp;",
    options: ["7000", "9000", "5000", "3000"],
    answer: 1,
    explanation: "FIRST_VALUE returns the first row's value in the window frame, which (frame starting at UNBOUNDED PRECEDING) is the highest salary in E's partition IT: 9000. Unlike LAST_VALUE, the default frame works fine for FIRST_VALUE.",
    optionExplanations: ["That's E's own salary.", "Correct.", "That's from HR.", "That's HR's minimum."]
  },
  {
    id: "sql-window-013", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "t has 5 rows with x = 1, 2, 3, 4, 5. How many rows get bucket 1?",
    code: "SELECT x, NTILE(2) OVER (ORDER BY x) AS bucket FROM t;",
    options: ["3", "2", "1", "5"],
    answer: 0,
    explanation: "NTILE(n) divides the ordered rows into n groups as evenly as possible; when they don't divide evenly, the EARLIER groups get one extra row. 5 rows into 2 buckets → sizes 3 and 2. NTILE(4) is used for quartiles.",
    optionExplanations: ["Correct.", "The extra row goes to the first bucket.", "Buckets are as even as possible.", "Rows are split across 2 buckets."]
  },
  {
    id: "sql-window-014", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "What happens with this query?",
    code: "SELECT name, ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn\nFROM emp\nWHERE rn <= 3;",
    options: ["It returns the top 3 earners", "It returns 3 random rows", "It returns all rows", "Error: window functions (and their aliases) can't be used in WHERE"],
    answer: 3,
    explanation: "Window functions are evaluated after WHERE, GROUP BY and HAVING (alongside SELECT), so WHERE can't reference them. Wrap the query: SELECT * FROM (SELECT ..., ROW_NUMBER() OVER (...) AS rn FROM emp) t WHERE rn <= 3 — or use a CTE (or QUALIFY in Snowflake/BigQuery).",
    optionExplanations: ["It needs a subquery or CTE to filter on rn.", "It errors.", "It errors.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-window-015", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "emp: HR: A 3000, B 5000, F 5000; IT: C 7000, D 9000, E 7000. How many rows does each query return?",
    code: "Q1: SELECT * FROM (SELECT name, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS k FROM emp) t WHERE k = 1;\nQ2: SELECT * FROM (SELECT name, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS k FROM emp) t WHERE k = 1;",
    options: ["Q1: 2, Q2: 2", "Q1: 1, Q2: 2", "Q1: 3, Q2: 3", "Q1: 2, Q2: 3"],
    answer: 3,
    explanation: "ROW_NUMBER gives exactly one row per partition with k = 1 (HR's tie between B and F is broken arbitrarily). DENSE_RANK (or RANK) gives all tied top earners k = 1: B, F and D. Choose based on whether ties should all be returned.",
    optionExplanations: ["DENSE_RANK returns both tied HR rows.", "Each department contributes at least one row.", "ROW_NUMBER returns one row per department.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-window-016", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "t(day, amt): (1, 10), (2, 20), (3, 40). What are the values of a and b?",
    code: "SELECT day,\n       SUM(amt) OVER ()               AS a,\n       SUM(amt) OVER (ORDER BY day)   AS b\nFROM t;",
    options: ["a: 70, 70, 70; b: 10, 30, 70", "a: 10, 30, 70; b: 70, 70, 70", "a: 70, 70, 70; b: 70, 70, 70", "a: 10, 20, 40; b: 10, 30, 70"],
    answer: 0,
    explanation: "Adding ORDER BY inside OVER changes an aggregate window from 'whole partition' to 'running total' (default frame from the start up to the current row). Without ORDER BY, every row sees the full partition.",
    optionExplanations: ["Correct.", "Reversed.", "The ORDER BY makes b a running total.", "a has no ORDER BY, so it's the full total."]
  },
  {
    id: "sql-window-017", subject: "sql", subtopic: "Window Functions", difficulty: "hard", type: "query",
    question: "Scores: Amy 90, Cal 90, Ben 85, Dan 80. What are Ben's PERCENT_RANK and CUME_DIST (ordered by score DESC)?",
    code: "SELECT name,\n       PERCENT_RANK() OVER (ORDER BY score DESC) AS pr,\n       CUME_DIST()    OVER (ORDER BY score DESC) AS cd\nFROM s;",
    options: ["pr 0.667, cd 0.75", "pr 0.5, cd 0.75", "pr 0.75, cd 0.667", "pr 0.667, cd 0.5"],
    answer: 0,
    explanation: "PERCENT_RANK = (rank − 1) / (rows − 1): Ben's RANK is 3, so (3 − 1) / (4 − 1) = 0.667. CUME_DIST = (number of rows ordered at or before the current row, including peers) / rows = 3 / 4 = 0.75.",
    optionExplanations: ["Correct.", "PERCENT_RANK uses rank − 1 over n − 1.", "The two values are swapped.", "CUME_DIST counts 3 of 4 rows."]
  },
  {
    id: "sql-window-018", subject: "sql", subtopic: "Window Functions", difficulty: "hard", type: "query",
    question: "logins(day) contains the integers 1, 2, 3, 5, 6, 9 (one row each). How many rows does this return?",
    code: "SELECT MIN(day), MAX(day)\nFROM (SELECT day, day - ROW_NUMBER() OVER (ORDER BY day) AS grp FROM logins) t\nGROUP BY grp;",
    options: ["1", "2", "3", "6"],
    answer: 2,
    explanation: "This is the GAPS-AND-ISLANDS technique. Within a run of consecutive values, day and ROW_NUMBER both increase by 1, so their difference is constant: days 1, 2, 3 → 0; 5, 6 → 1; 9 → 3. Grouping by that difference yields one row per island: [1–3], [5–6], [9].",
    optionExplanations: ["There are gaps, so there's more than one island.", "Day 9 forms its own island.", "Correct.", "Rows are grouped into islands."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-window-019", subject: "sql", subtopic: "Window Functions", difficulty: "hard", type: "query",
    question: "emp: HR salaries total 13000, IT total 23000. What does `grand` contain?",
    code: "SELECT dept, SUM(salary) AS dept_total,\n       SUM(SUM(salary)) OVER () AS grand\nFROM emp\nGROUP BY dept;",
    options: ["Error: nested aggregate", "36000 on both rows", "13000 and 23000", "NULL"],
    answer: 1,
    explanation: "Window functions run AFTER grouping, so they operate on the grouped rows and may wrap an aggregate: the inner SUM is the GROUP BY aggregate, the outer SUM ... OVER () sums those per-group values across the result. Useful for share-of-total per group.",
    optionExplanations: ["A window function over an aggregate is valid.", "Correct.", "That's dept_total.", "The values are well defined."]
  },
  {
    id: "sql-window-020", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "What does the WINDOW clause do in this PostgreSQL/MySQL 8 query?",
    code: "SELECT name,\n       RANK()      OVER w AS r,\n       AVG(salary) OVER w AS running_avg\nFROM emp\nWINDOW w AS (PARTITION BY dept ORDER BY salary);",
    options: ["It creates a temporary table named w", "It names a window specification once so several window functions can reuse it", "It filters rows like WHERE", "It's only valid in Oracle"],
    answer: 1,
    explanation: "A named window avoids repeating long OVER (...) definitions and guarantees functions share identical partitioning and ordering. A reference can also extend it, e.g. OVER (w ROWS 2 PRECEDING) when w has no frame.",
    optionExplanations: ["No table is created.", "Correct.", "It doesn't filter rows.", "PostgreSQL, MySQL 8 and SQLite support it."]
  },
  {
    id: "sql-window-021", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "sales(month, amt): (1, 100), (2, 150), (3, 120). What does `change` contain?",
    code: "SELECT month, amt - LAG(amt) OVER (ORDER BY month) AS change FROM sales;",
    options: ["NULL, 50, -30", "0, 50, -30", "100, 50, -30", "50, -30, NULL"],
    answer: 0,
    explanation: "LAG fetches the previous month's amount; subtracting gives month-over-month change. The first month has no previous value, so the difference is NULL (use LAG(amt, 1, amt) or COALESCE for 0).",
    optionExplanations: ["Correct.", "LAG returns NULL for the first row, not 0.", "The first row has no previous value to subtract.", "That's LEAD-based (next minus current) shifted."]
  },
  {
    id: "sql-window-022", subject: "sql", subtopic: "Window Functions", difficulty: "easy", type: "query",
    question: "emp: HR has 3 employees, IT has 3. What does `n` show for every HR row?",
    code: "SELECT name, dept, COUNT(*) OVER (PARTITION BY dept) AS n FROM emp;",
    options: ["1", "6", "3", "2"],
    answer: 2,
    explanation: "COUNT(*) OVER (PARTITION BY dept) counts the rows in each row's partition and repeats it on every row, so each HR row shows 3 while all 6 rows remain.",
    optionExplanations: ["The window covers the whole partition.", "PARTITION BY limits the count to the department.", "Correct.", "HR has three employees."]
  },
  {
    id: "sql-window-023", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "Five runners finish with times 10, 10, 10, 12, 15 (lower is better). What ranks does RANK() OVER (ORDER BY time) give the runners with times 12 and 15?",
    code: "SELECT runner, time, RANK() OVER (ORDER BY time) AS r FROM race;",
    options: ["2 and 3", "4 and 4", "2 and 5", "4 and 5"],
    answer: 3,
    explanation: "Three runners tie for rank 1. RANK then skips to 1 + 3 = 4 for the next runner and 5 after that ('competition ranking': 1, 1, 1, 4, 5). DENSE_RANK would give 2 and 3.",
    optionExplanations: ["That's DENSE_RANK.", "The times differ, so the ranks differ.", "Each later rank continues from the position.", "Correct."]
  },
  {
    id: "sql-window-024", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "HR total is 13000. What does `pct` show for employee A (salary 3000, PostgreSQL)?",
    code: "SELECT name,\n       ROUND(salary * 100.0 / SUM(salary) OVER (PARTITION BY dept), 2) AS pct\nFROM emp;",
    options: ["23.08", "8.33", "0.23", "3000"],
    answer: 0,
    explanation: "The window total is HR's 13000; 3000 × 100.0 / 13000 = 23.08%. Multiplying by 100.0 first avoids integer division. This 'percent of group' pattern is a common interview ask.",
    optionExplanations: ["Correct.", "That uses the grand total (36000).", "The result is multiplied by 100.", "That's the raw salary."]
  },
  {
    id: "sql-window-025", subject: "sql", subtopic: "Window Functions", difficulty: "hard", type: "query",
    question: "emp has 6 rows. What values does `r` contain?",
    code: "SELECT name, RANK() OVER () AS r FROM emp;",
    options: ["1, 2, 3, 4, 5, 6", "1 for every row", "NULL for every row", "Error: RANK requires ORDER BY"],
    answer: 1,
    explanation: "Ranking depends on the ORDER BY within OVER. Without it, all rows are peers (nothing distinguishes them), so RANK and DENSE_RANK are 1 for every row. ROW_NUMBER without ORDER BY gives 1..n in an arbitrary order. (Some databases, like SQL Server, require ORDER BY for ranking functions.)",
    optionExplanations: ["That's what ROW_NUMBER would produce.", "Correct.", "RANK never returns NULL.", "PostgreSQL, MySQL and SQLite accept it."],
    tags: ["trap"]
  },
  {
    id: "sql-window-026", subject: "sql", subtopic: "Window Functions", difficulty: "hard", type: "query",
    question: "t(d, amt): (1, 10), (2, 20), (2, 30), (3, 40). What are the w values (in row order)?",
    code: "SELECT d, amt,\n       SUM(amt) OVER (ORDER BY d RANGE BETWEEN 1 PRECEDING AND CURRENT ROW) AS w\nFROM t;",
    options: ["10, 30, 60, 100", "10, 30, 50, 70", "10, 60, 60, 90", "10, 20, 30, 40"],
    answer: 2,
    explanation: "A RANGE frame with an offset is VALUE-based: it includes rows whose d is within [current d − 1, current d], including all peers. d = 1 → {10}; each d = 2 row → d in [1, 2] → 10 + 20 + 30 = 60; d = 3 → d in [2, 3] → 20 + 30 + 40 = 90. ROWS frames count physical rows instead.",
    optionExplanations: ["That's an unbounded running total with ROWS.", "That treats the frame as 2 physical rows.", "Correct.", "Those are the raw amounts."]
  },
  {
    id: "sql-window-027", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "t(day, amt): (1, 10), (2, 20), (3, 40). What does `x` contain?",
    code: "SELECT day, LEAD(amt, 5) OVER (ORDER BY day) AS x FROM t;",
    options: ["Error: offset larger than partition", "40, 40, 40", "NULL, NULL, NULL", "10, 20, 40"],
    answer: 2,
    explanation: "If the offset points outside the partition, LEAD/LAG return the default (NULL unless specified). No error is raised.",
    optionExplanations: ["Out-of-range offsets simply produce the default.", "The value isn't clamped to the last row.", "Correct.", "That's the column itself."]
  },
  {
    id: "sql-window-028", subject: "sql", subtopic: "Window Functions", difficulty: "hard", type: "query",
    question: "emp: HR has 3 rows, IT has 3 rows. What does `r` contain?",
    code: "SELECT dept, COUNT(*) AS n,\n       RANK() OVER (ORDER BY COUNT(*) DESC) AS r\nFROM emp\nGROUP BY dept;",
    options: ["1 and 2", "Error", "1 and 1", "3 and 3"],
    answer: 2,
    explanation: "The window function runs over the grouped result (2 rows), ordering by the aggregate. Both departments have 3 employees, so they tie and both get rank 1.",
    optionExplanations: ["Equal counts tie, so RANK repeats.", "Window functions can order by aggregates after GROUP BY.", "Correct.", "r is the rank, not the count."]
  },
  {
    id: "sql-window-029", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "t(x): 10, 20, 30. Which frame makes LAST_VALUE return 30 on every row?",
    code: "SELECT x, LAST_VALUE(x) OVER (ORDER BY x /* frame? */) FROM t;",
    options: ["ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "No frame clause is needed"],
    answer: 1,
    explanation: "LAST_VALUE returns the last row OF THE FRAME. Only a frame extending to UNBOUNDED FOLLOWING includes the partition's final row for every current row. The default frame ends at the current row.",
    optionExplanations: ["The frame stops at the current row.", "Correct.", "The frame never extends forward.", "The default frame ends at the current row (and peers)."]
  },
  {
    id: "sql-window-030", subject: "sql", subtopic: "Window Functions", difficulty: "hard", type: "query",
    question: "emp: HR: A 3000, B 5000, F 5000; IT: C 7000, D 9000, E 7000. How many rows does this return?",
    code: "SELECT name FROM (\n  SELECT name, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS k\n  FROM emp\n) t\nWHERE k = 2;",
    options: ["2", "3", "1", "4"],
    answer: 1,
    explanation: "Within HR, 5000 is rank 1 (B, F) and 3000 is rank 2 (A). Within IT, 9000 is rank 1 (D) and 7000 is rank 2 (C and E, tied). So k = 2 returns A, C, E. This is 'second-highest salary per department' with ties kept.",
    optionExplanations: ["IT has two employees tied at the second-highest salary.", "Correct.", "Each department has someone at rank 2.", "Only three rows have k = 2."]
  },
  {
    id: "sql-window-031", subject: "sql", subtopic: "Window Functions", difficulty: "easy", type: "concept",
    question: "Inside OVER (...), which clause divides rows into independent groups so the window function restarts for each group?",
    options: ["GROUP BY", "PARTITION BY", "ORDER BY", "ROWS BETWEEN"],
    answer: 1,
    explanation: "PARTITION BY defines the groups; ORDER BY defines the order within each partition (needed for ranking, LAG/LEAD and running totals); the frame clause (ROWS/RANGE) defines which rows around the current one are included.",
    optionExplanations: ["GROUP BY collapses rows; it isn't part of OVER.", "Correct.", "ORDER BY orders rows within a partition.", "The frame selects rows relative to the current row."]
  },
  {
    id: "sql-window-032", subject: "sql", subtopic: "Window Functions", difficulty: "medium", type: "query",
    question: "sales(region, month, amt): East: (1, 100), (2, 120); West: (1, 80), (2, 90). What does `prev` show for West, month 1?",
    code: "SELECT region, month,\n       LAG(amt) OVER (PARTITION BY region ORDER BY month) AS prev\nFROM sales;",
    options: ["120", "100", "NULL", "80"],
    answer: 2,
    explanation: "With PARTITION BY, LAG never crosses partition boundaries: the first row of each region has no previous row in its own partition, so prev is NULL even though East's rows come earlier overall.",
    optionExplanations: ["LAG doesn't look into the East partition.", "Partitions are independent.", "Correct.", "That's West's own month-1 amount."]
  },
  {
    id: "sql-window-033", subject: "sql", subtopic: "Window Functions", difficulty: "hard", type: "concept",
    question: "In the logical processing order, when are window functions evaluated?",
    options: ["Before WHERE", "After FROM/WHERE/GROUP BY/HAVING, during SELECT, and before ORDER BY/LIMIT", "After LIMIT", "Before GROUP BY"],
    answer: 1,
    explanation: "Window functions see the rows remaining after filtering and grouping. Consequences: you can't filter on them in WHERE/HAVING (use a subquery/CTE), they can wrap aggregates, and ORDER BY can sort by them. LIMIT is applied afterwards, so a running total still includes rows that LIMIT later drops.",
    optionExplanations: ["Then they couldn't see grouped results.", "Correct.", "They're computed before LIMIT trims rows.", "They can use GROUP BY aggregates, so they come after it."]
  }
);
