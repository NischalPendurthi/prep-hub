/* SQL / DBMS — SQL Basics & NULL Handling */
window.QUESTIONS.push(
  {
    id: "sql-basics-001", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "query",
    question: "How many rows does this query return?",
    code: "-- emp(dept): 10, 10, 20, NULL, NULL\nSELECT DISTINCT dept FROM emp;",
    options: ["2", "5", "4", "3"],
    answer: 3,
    explanation: "DISTINCT removes duplicate rows. For DISTINCT (and GROUP BY), all NULLs are treated as one value, so the result is 10, 20 and a single NULL: 3 rows.",
    optionExplanations: ["NULL also forms one distinct value.", "Duplicates are removed.", "The two NULLs collapse into one.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "sql-basics-002", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "query",
    question: "How many rows does this query return?",
    code: "-- emp(salary): 3000, 4000, 5000, 6000\nSELECT * FROM emp WHERE salary BETWEEN 3000 AND 5000;",
    options: ["1", "2", "3", "4"],
    answer: 2,
    explanation: "BETWEEN is INCLUSIVE at both ends: `x BETWEEN a AND b` means `x >= a AND x <= b`. 3000, 4000 and 5000 qualify. Note `BETWEEN 5000 AND 3000` (reversed bounds) returns nothing.",
    optionExplanations: ["Both boundaries are included.", "BETWEEN includes 3000 and 5000.", "Correct.", "6000 is outside the range."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-basics-003", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "query",
    question: "Names: 'Asha', 'aman', 'Ravi', 'Kabir', 'Sara'. Which names match `name LIKE '_a%'` (case-sensitive comparison)?",
    code: "SELECT name FROM people WHERE name LIKE '_a%';",
    options: ["Asha, aman", "Ravi, Kabir, Sara", "Asha, aman, Ravi, Kabir, Sara", "Ravi, Sara"],
    answer: 1,
    explanation: "In LIKE, `_` matches exactly one character and `%` matches any sequence (including empty). '_a%' means 'second character is a'. Ravi, Kabir and Sara have 'a' second; Asha has 's' and aman has 'm'.",
    optionExplanations: ["Those START with a/A; the pattern checks the second character.", "Correct.", "Only names whose second letter is 'a' match.", "Kabir also has 'a' as its second character."]
  },
  {
    id: "sql-basics-004", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "query",
    question: "Table emp has 5 rows, 2 of which have bonus = NULL. How many rows does this return?",
    code: "SELECT * FROM emp WHERE bonus = NULL;",
    options: ["0", "2", "3", "5"],
    answer: 0,
    explanation: "Any comparison with NULL using =, <>, <, > yields UNKNOWN, not TRUE, and WHERE keeps only rows where the condition is TRUE. So `bonus = NULL` matches nothing. Use `bonus IS NULL` (or IS NOT NULL).",
    optionExplanations: ["Correct.", "That's what `IS NULL` would return.", "Rows with non-NULL bonus aren't equal to NULL either.", "No row satisfies a comparison with NULL."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "sql-basics-005", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "query",
    question: "emp has 5 rows; bonus is NULL in 2 of them. What does this return?",
    code: "SELECT COUNT(*), COUNT(bonus) FROM emp;",
    options: ["5, 5", "5, 3", "3, 3", "3, 5"],
    answer: 1,
    explanation: "COUNT(*) counts rows regardless of content. COUNT(column) counts only non-NULL values of that column. This difference matters a lot with LEFT JOINs.",
    optionExplanations: ["COUNT(bonus) skips NULLs.", "Correct.", "COUNT(*) counts every row.", "Reversed."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-basics-006", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "query",
    question: "emp(id, salary) has 5 rows with salaries 100, 300, 200, 500, 400. Which salaries does this return (PostgreSQL/MySQL)?",
    code: "SELECT salary FROM emp ORDER BY salary DESC LIMIT 2 OFFSET 1;",
    options: ["500, 400", "400, 300", "300, 200", "200, 300"],
    answer: 1,
    explanation: "Sorted descending: 500, 400, 300, 200, 100. OFFSET 1 skips the first row (500), and LIMIT 2 takes the next two: 400, 300. (SQL Server uses TOP / OFFSET ... FETCH NEXT; standard SQL uses FETCH FIRST n ROWS ONLY.)",
    optionExplanations: ["OFFSET 1 skips 500.", "Correct.", "Only one row is skipped.", "The order is descending."]
  },
  {
    id: "sql-basics-007", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "query",
    question: "What does this return?",
    code: "SELECT COALESCE(NULL, NULL, 'x', 'y');",
    options: ["NULL", "'y'", "'x'", "'xy'"],
    answer: 2,
    explanation: "COALESCE returns its first non-NULL argument (evaluating left to right), or NULL if all are NULL. It's the standard way to substitute defaults, e.g. `COALESCE(bonus, 0)`.",
    optionExplanations: ["There is a non-NULL argument.", "'x' comes before 'y'.", "Correct.", "COALESCE doesn't concatenate."]
  },
  {
    id: "sql-basics-008", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "query",
    question: "In standard SQL (and PostgreSQL), what happens with this query?",
    code: "SELECT salary * 12 AS annual\nFROM emp\nWHERE annual > 50000;",
    options: ["Error: column 'annual' doesn't exist, because WHERE is evaluated before the SELECT list", "It filters on the computed annual salary", "It returns all rows", "It returns no rows"],
    answer: 0,
    explanation: "Logically, WHERE is processed before SELECT, so a column alias defined in SELECT isn't visible in WHERE. Repeat the expression (`WHERE salary * 12 > 50000`) or use a subquery/CTE. Aliases ARE usable in ORDER BY. (MySQL also rejects aliases in WHERE but allows them in HAVING.)",
    optionExplanations: ["Correct.", "The alias doesn't exist yet when WHERE runs.", "The query errors before returning anything.", "It's an error, not an empty result."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-basics-009", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "query",
    question: "emp has 50 rows. What does this statement do?",
    code: "UPDATE emp SET salary = salary * 1.1;",
    options: ["It raises an error because WHERE is required", "It updates only the first row", "It gives every one of the 50 employees a 10% raise", "It updates nothing until you add WHERE"],
    answer: 2,
    explanation: "Without a WHERE clause, UPDATE (and DELETE) affects every row. It's a classic production accident; MySQL's --safe-updates mode blocks such statements, and running inside a transaction lets you ROLLBACK.",
    optionExplanations: ["WHERE is optional.", "There's no implicit row limit.", "Correct.", "It updates all rows immediately."]
  },
  {
    id: "sql-basics-010", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "query",
    question: "Which statement inserts two rows in one command (PostgreSQL/MySQL)?",
    code: "-- table: emp(id, name)",
    options: ["INSERT INTO emp VALUES (1, 'A') AND (2, 'B');", "INSERT emp ROWS (1, 'A'), (2, 'B');", "INSERT INTO emp (id, name) VALUES (1, 'A'), (2, 'B');", "INSERT INTO emp SET (1, 'A'), (2, 'B');"],
    answer: 2,
    explanation: "A multi-row VALUES list separates row tuples with commas. Listing the column names explicitly is good practice: the statement keeps working if columns are added or reordered.",
    optionExplanations: ["AND isn't used to separate rows.", "ROWS isn't valid INSERT syntax.", "Correct.", "SET is MySQL's single-row syntax and doesn't take tuples."]
  },
  {
    id: "sql-basics-011", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "How many rows does this return?",
    code: "-- emp(name, dept, salary)\n-- A | 10 | 3000\n-- B | 10 | 7000\n-- C | 20 | 4000\n-- D | 20 | 8000\n-- E | 30 | 9000\nSELECT name FROM emp\nWHERE dept = 10 OR dept = 20 AND salary > 5000;",
    options: ["1", "2", "3", "4"],
    answer: 2,
    explanation: "AND has higher precedence than OR, so the condition is `dept = 10 OR (dept = 20 AND salary > 5000)`. That matches A and B (dept 10) and D (dept 20 with 8000): 3 rows. Write parentheses explicitly to avoid ambiguity.",
    optionExplanations: ["Both dept-10 rows match regardless of salary.", "That's the result of (dept = 10 OR dept = 20) AND salary > 5000.", "Correct.", "C has salary 4000, and E is dept 30."],
    tags: ["trap", "interview-favourite"]
  },
  {
    id: "sql-basics-012", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "t(id) contains 1, 2, 3. How many rows does each query return?",
    code: "Q1: SELECT * FROM t WHERE id IN (1, NULL);\nQ2: SELECT * FROM t WHERE id NOT IN (1, NULL);",
    options: ["Q1: 1, Q2: 2", "Q1: 3, Q2: 2", "Q1: 0, Q2: 0", "Q1: 1, Q2: 0"],
    answer: 3,
    explanation: "`id IN (1, NULL)` is `id = 1 OR id = NULL`: TRUE for id 1, UNKNOWN otherwise → 1 row. `id NOT IN (1, NULL)` is `id <> 1 AND id <> NULL`; `id <> NULL` is always UNKNOWN, so the AND can never be TRUE → 0 rows. This NOT IN + NULL trap often appears with subqueries.",
    optionExplanations: ["The NULL in the list makes NOT IN UNKNOWN for every row.", "IN (1, NULL) matches only id 1.", "IN still matches id 1.", "Correct."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "sql-basics-013", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "salary = 5000 and bonus = NULL for an employee. What does this return for that row?",
    code: "SELECT salary + bonus AS total, salary + COALESCE(bonus, 0) AS safe_total FROM emp;",
    options: ["5000, 5000", "NULL, 5000", "5000, NULL", "Error"],
    answer: 1,
    explanation: "Arithmetic with NULL yields NULL (unknown + 5000 is unknown). Wrapping the nullable column with COALESCE (or IFNULL in MySQL / ISNULL in SQL Server) supplies a default before adding.",
    optionExplanations: ["NULL isn't treated as 0 automatically.", "Correct.", "It's the other way round.", "NULL arithmetic is valid and produces NULL."]
  },
  {
    id: "sql-basics-014", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "In PostgreSQL, what do these return?",
    code: "SELECT 'a' || NULL,\n       CONCAT('a', NULL),\n       CONCAT_WS('-', 'a', NULL, 'b');",
    options: ["NULL, NULL, 'a--b'", "'aNULL', 'a', 'a-NULL-b'", "'a', 'a', 'a-b'", "NULL, 'a', 'a-b'"],
    answer: 3,
    explanation: "The SQL-standard `||` operator returns NULL if any operand is NULL. PostgreSQL's CONCAT() ignores NULL arguments, and CONCAT_WS() skips NULLs entirely (no doubled separator). Careful: MySQL's CONCAT() returns NULL if any argument is NULL, and in MySQL `||` means logical OR by default.",
    optionExplanations: ["CONCAT_WS skips NULLs, so the separator isn't doubled; PostgreSQL's CONCAT ignores NULLs.", "NULL isn't converted to the text 'NULL'.", "|| with NULL yields NULL.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "sql-basics-015", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "Using SQL's three-valued logic, what are the results of these expressions?",
    code: "TRUE OR NULL,  FALSE AND NULL,  NULL = NULL,  NOT NULL",
    options: ["TRUE, FALSE, NULL (unknown), NULL (unknown)", "NULL, NULL, TRUE, FALSE", "TRUE, FALSE, TRUE, NULL", "NULL, FALSE, NULL, TRUE"],
    answer: 0,
    explanation: "Treat NULL as 'unknown'. TRUE OR unknown is TRUE whatever the unknown is; FALSE AND unknown is FALSE. NULL = NULL is unknown (two unknowns may or may not be equal). NOT unknown is still unknown.",
    optionExplanations: ["Correct.", "OR with TRUE and AND with FALSE are decided regardless of NULL.", "NULL = NULL is unknown, not TRUE.", "TRUE OR NULL is TRUE, and NOT NULL is unknown."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-basics-016", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "What does each expression return?",
    code: "SELECT NULLIF(10, 10), NULLIF(10, 5), 100 / NULLIF(0, 0);",
    options: ["NULL, 10, NULL", "0, 10, error", "10, NULL, NULL", "NULL, 5, error"],
    answer: 0,
    explanation: "NULLIF(a, b) returns NULL if a = b, otherwise a. The classic use is safe division: `x / NULLIF(y, 0)` turns a would-be division-by-zero error into NULL.",
    optionExplanations: ["Correct.", "NULLIF returns NULL for equal arguments, and dividing by NULL yields NULL.", "Reversed for the first two.", "NULLIF(10, 5) returns the first argument, 10."]
  },
  {
    id: "sql-basics-017", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "emp.bonus values: 50, 150, NULL, 200, NULL. How many rows does each query return?",
    code: "Q1: SELECT * FROM emp WHERE bonus > 100;\nQ2: SELECT * FROM emp WHERE NOT (bonus > 100);",
    options: ["2 and 3", "2 and 1", "2 and 2", "3 and 2"],
    answer: 1,
    explanation: "Q1 matches 150 and 200. For Q2, NOT (bonus > 100) is TRUE only for 50; for NULL rows the inner comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN, so they're excluded. Q1 + Q2 = 3, not 5: a condition and its negation don't partition rows when NULLs are present.",
    optionExplanations: ["NULL rows aren't picked up by the negation.", "Correct.", "Only one row (50) satisfies the negated condition.", "Q1 matches only 150 and 200."],
    tags: ["trap"]
  },
  {
    id: "sql-basics-018", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "How many rows does this return?",
    code: "-- emp(dept, job)\n-- 10 | dev\n-- 10 | dev\n-- 10 | qa\n-- 20 | dev\n-- 20 | dev\nSELECT DISTINCT dept, job FROM emp;",
    options: ["3", "2", "4", "5"],
    answer: 0,
    explanation: "DISTINCT applies to the whole selected row (the combination of all listed columns), not just the first column. The distinct pairs are (10, dev), (10, qa), (20, dev).",
    optionExplanations: ["Correct.", "DISTINCT considers both columns together.", "(10, dev) and (20, dev) each appear twice but count once.", "Duplicate pairs are removed."]
  },
  {
    id: "sql-basics-019", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "What does `ORDER BY 2` mean in this query?",
    code: "SELECT name, salary, dept FROM emp ORDER BY 2 DESC, 1;",
    options: ["Sort by the literal value 2 (no effect)", "It's a syntax error", "Sort by the second row", "Sort by the second column in the SELECT list (salary) descending, then by name ascending"],
    answer: 3,
    explanation: "Integers in ORDER BY refer to positions in the SELECT list (1-based). It's concise but fragile: reordering the SELECT list silently changes the sort. Ordering by column names or aliases is clearer.",
    optionExplanations: ["Positional references are interpreted as column numbers.", "Ordinal positions are valid in all major databases.", "ORDER BY doesn't refer to rows.", "Correct."]
  },
  {
    id: "sql-basics-020", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "emp.bonus contains 100, NULL, 50. What order does `SELECT bonus FROM emp ORDER BY bonus` produce in PostgreSQL and in MySQL?",
    code: "SELECT bonus FROM emp ORDER BY bonus;",
    options: ["Both: NULL, 50, 100", "Both: 50, 100, NULL", "PostgreSQL: NULL, 50, 100; MySQL: 50, 100, NULL", "PostgreSQL: 50, 100, NULL; MySQL: NULL, 50, 100"],
    answer: 3,
    explanation: "The SQL standard leaves NULL ordering to the implementation. PostgreSQL (and Oracle) treat NULL as larger than any value: last in ASC, first in DESC. MySQL (and SQL Server, SQLite) treat NULL as smallest: first in ASC. PostgreSQL/Oracle support `NULLS FIRST / NULLS LAST` to control this.",
    optionExplanations: ["The databases differ.", "MySQL puts NULLs first in ascending order.", "Reversed.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "sql-basics-021", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "What does `SELECT 7 / 2;` return in PostgreSQL and in MySQL?",
    code: "SELECT 7 / 2;",
    options: ["Both 3", "Both 3.5", "PostgreSQL 3, MySQL 3.5000", "PostgreSQL 3.5, MySQL 3"],
    answer: 2,
    explanation: "In PostgreSQL (and SQL Server, SQLite), dividing two integers performs integer division, truncating to 3. MySQL's `/` always performs exact decimal division (3.5000); MySQL uses `DIV` for integer division. Cast to numeric (`7::numeric / 2` or `7 * 1.0 / 2`) when you need fractions in PostgreSQL.",
    optionExplanations: ["MySQL returns a decimal.", "PostgreSQL truncates integer division.", "Correct.", "Reversed."],
    tags: ["trap"]
  },
  {
    id: "sql-basics-022", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "You need products whose description contains the literal text '50%'. Which predicate is correct?",
    code: "-- descriptions: 'save 50% now', 'save 500 now', 'only 5%'",
    options: ["description LIKE '%50%'", "description LIKE '_50%_'", "description = '50%'", "description LIKE '%50\\%%' ESCAPE '\\'"],
    answer: 3,
    explanation: "% and _ are wildcards in LIKE. To match a literal % you must escape it: with ESCAPE '\\', the sequence \\% means a literal percent sign. '%50%' would also match 'save 500 now', because the % after 50 is a wildcard.",
    optionExplanations: ["The second % is treated as a wildcard, so '500' also matches.", "_ matches exactly one character and % is still a wildcard.", "= requires the entire string to equal '50%'.", "Correct."]
  },
  {
    id: "sql-basics-023", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "With default settings, does `WHERE name = 'asha'` match a row whose name is 'Asha'?",
    code: "SELECT * FROM users WHERE name = 'asha';",
    options: ["Yes in both MySQL and PostgreSQL", "No in both", "MySQL: no; PostgreSQL: yes", "MySQL: yes (default collations are case-insensitive); PostgreSQL: no (comparisons are case-sensitive)"],
    answer: 3,
    explanation: "MySQL's default collations (e.g. utf8mb4_0900_ai_ci) are case- and accent-insensitive, so 'asha' = 'Asha'. PostgreSQL compares text case-sensitively; use `lower(name) = 'asha'`, ILIKE, or the citext type for case-insensitive matching.",
    optionExplanations: ["PostgreSQL is case-sensitive by default.", "MySQL's default collation is case-insensitive.", "Reversed.", "Correct."]
  },
  {
    id: "sql-basics-024", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "In PostgreSQL, what happens when you run this?",
    code: "SELECT * FROM users WHERE name = \"Asha\";",
    options: ["It returns rows where name is Asha", "It returns no rows", "Error: column \"Asha\" does not exist, because double quotes denote identifiers", "It compares case-insensitively"],
    answer: 2,
    explanation: "In standard SQL, single quotes delimit string literals and double quotes delimit identifiers (table/column names). PostgreSQL follows the standard, so \"Asha\" is treated as a column name. MySQL (by default) accepts double-quoted strings, which is non-standard.",
    optionExplanations: ["\"Asha\" is interpreted as a column name.", "It errors rather than returning an empty result.", "Correct.", "Quoting style doesn't change case sensitivity."]
  },
  {
    id: "sql-basics-025", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "concept",
    question: "Why does `ORDER BY id LIMIT 20 OFFSET 1000000` get slow on a huge table, and what's the usual fix?",
    options: ["LIMIT is always slow; avoid pagination", "OFFSET forces a full table lock", "The database must still produce and discard the first million rows; keyset pagination (`WHERE id > :last_seen_id ORDER BY id LIMIT 20`) jumps directly via the index", "OFFSET requires sorting by every column"],
    answer: 2,
    explanation: "OFFSET n doesn't skip magically: rows are generated in order and thrown away, so cost grows with n. Keyset (seek) pagination remembers the last key seen and uses an index range scan to fetch the next page in constant time, and it's also stable under concurrent inserts.",
    optionExplanations: ["LIMIT itself is cheap; large offsets are the problem.", "Reads don't take table locks for OFFSET.", "Correct.", "Sorting is by the ORDER BY columns only."]
  },
  {
    id: "sql-basics-026", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "concept",
    question: "Several employees share the same salary. Why can `SELECT * FROM emp ORDER BY salary DESC LIMIT 3` return different rows on different runs?",
    options: ["LIMIT picks random rows", "DESC sorting is unstable by design in SQL", "ORDER BY is ignored when LIMIT is present", "Ties in the ORDER BY key have no defined order, so which tied rows fall inside the limit isn't deterministic; add a unique tie-breaker such as `, id`"],
    answer: 3,
    explanation: "SQL only guarantees the order you specify. Rows equal on all ORDER BY columns may come back in any order, depending on plans, parallelism or physical layout. Add a unique column as the last sort key for deterministic results and stable pagination.",
    optionExplanations: ["LIMIT takes the first n rows of the produced order.", "Ascending order has the same issue with ties.", "ORDER BY is applied before LIMIT.", "Correct."]
  },
  {
    id: "sql-basics-027", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "emp already has 100 rows. What happens to existing rows after this statement?",
    code: "ALTER TABLE emp ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;",
    options: ["The statement fails because existing rows would be NULL", "Existing rows get active = NULL", "All 100 existing rows get active = TRUE", "Only new rows get the column"],
    answer: 2,
    explanation: "When a column with a DEFAULT is added, existing rows are filled with that default, which also satisfies NOT NULL. Without a default, the new column would be NULL for existing rows, and adding it as NOT NULL would fail on a non-empty table.",
    optionExplanations: ["The DEFAULT supplies a value for existing rows.", "The default is applied, not NULL.", "Correct.", "A column exists for every row in the table."]
  },
  {
    id: "sql-basics-028", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "What does this statement do?",
    code: "INSERT INTO emp_archive (id, name, salary)\nSELECT id, name, salary FROM emp WHERE left_date < '2024-01-01';",
    options: ["It's a syntax error; INSERT needs VALUES", "It copies every matching row from emp into emp_archive in one statement", "It moves rows (deleting them from emp)", "It inserts only the first matching row"],
    answer: 1,
    explanation: "INSERT ... SELECT inserts the full result set of a query. It doesn't delete the source rows; pair it with a DELETE (in a transaction) to archive-and-move. Column counts and types must line up.",
    optionExplanations: ["A SELECT can replace VALUES.", "Correct.", "The source rows remain in emp.", "All result rows are inserted."]
  },
  {
    id: "sql-basics-029", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "query",
    question: "t(x) has 6 rows: 5, 3, NULL, 5, NULL, 7. How many rows does this delete?",
    code: "DELETE FROM t WHERE x <> 5;",
    options: ["4", "2", "3", "6"],
    answer: 1,
    explanation: "x <> 5 is TRUE for 3 and 7, FALSE for the two 5s, and UNKNOWN for the two NULLs. Only TRUE rows are deleted, so 2 rows go and the NULL rows survive. Use `WHERE x <> 5 OR x IS NULL` (or `x IS DISTINCT FROM 5`) to include them.",
    optionExplanations: ["The NULL rows aren't deleted.", "Correct.", "Only 3 and 7 satisfy the condition.", "The 5s and NULLs remain."],
    tags: ["trap"]
  },
  {
    id: "sql-basics-030", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "medium", type: "concept",
    question: "An app builds `\"SELECT * FROM users WHERE name = '\" + input + \"'\"`. What's the risk and the fix?",
    options: ["Slow queries; add an index", "Encoding issues; use UTF-8", "Case sensitivity; use LOWER()", "SQL injection: input like `' OR '1'='1` changes the query's logic; use parameterized queries / prepared statements"],
    answer: 3,
    explanation: "Concatenating user input into SQL lets attackers inject syntax: `' OR '1'='1` returns all users, and `'; DROP TABLE users; --` can be worse. With placeholders (`WHERE name = ?` / `$1`), the driver sends values separately from the SQL text, so input can never become code.",
    optionExplanations: ["Indexes don't address injection.", "Encoding doesn't prevent injection.", "Case handling is unrelated to the vulnerability.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-basics-031", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "concept",
    question: "Which column type should store money amounts like 19.99 exactly?",
    options: ["FLOAT", "DOUBLE", "DECIMAL(10, 2) / NUMERIC", "VARCHAR(10)"],
    answer: 2,
    explanation: "FLOAT/DOUBLE are binary floating-point types that can't represent most decimal fractions exactly (0.1 + 0.2 ≠ 0.3), causing rounding errors in sums. DECIMAL/NUMERIC store exact base-10 values with fixed precision and scale. Storing numbers as text prevents correct arithmetic and sorting.",
    optionExplanations: ["Binary floating point introduces rounding errors.", "Same problem as FLOAT, with more precision.", "Correct.", "Strings sort and compute incorrectly."]
  },
  {
    id: "sql-basics-032", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "concept",
    question: "Which statement about common data types is correct?",
    options: ["TIMESTAMP stores date and time; DATE stores only the calendar date", "DATE stores both date and time of day", "BOOLEAN in MySQL is a separate native type that can't hold numbers", "VARCHAR always uses its maximum declared length on disk"],
    answer: 0,
    explanation: "DATE is year-month-day; TIMESTAMP/DATETIME add a time of day (PostgreSQL's TIMESTAMPTZ also handles time zones). In MySQL, BOOLEAN is an alias for TINYINT(1), storing 0/1. VARCHAR stores only the actual characters plus a small length prefix.",
    optionExplanations: ["Correct.", "DATE has no time-of-day part.", "MySQL's BOOLEAN is just TINYINT(1).", "VARCHAR is variable-length; CHAR is fixed."]
  },
  {
    id: "sql-basics-033", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "hard", type: "query",
    question: "emp.dept values: 10, 10, 20, NULL, NULL, 30. What does this return?",
    code: "SELECT COUNT(DISTINCT dept), COUNT(dept), COUNT(*) FROM emp;",
    options: ["3, 4, 6", "4, 4, 6", "3, 6, 6", "4, 6, 6"],
    answer: 0,
    explanation: "COUNT(DISTINCT dept) counts distinct NON-NULL values: 10, 20, 30 → 3 (unlike SELECT DISTINCT, which shows NULL as a value). COUNT(dept) counts non-NULL values: 4. COUNT(*) counts all 6 rows.",
    optionExplanations: ["Correct.", "COUNT(DISTINCT ...) ignores NULL.", "COUNT(dept) excludes the 2 NULLs.", "Both counts exclude NULLs."],
    tags: ["trap"]
  },
  {
    id: "sql-basics-034", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "hard", type: "query",
    question: "How many rows does this return?",
    code: "-- t(a, b)\n-- 1    | NULL\n-- NULL | 2\n-- 3    | 4\n-- NULL | NULL\n-- 3    | NULL\nSELECT * FROM t WHERE NOT (a = 1 OR b = 2);",
    options: ["1", "2", "3", "5"],
    answer: 0,
    explanation: "Evaluate (a = 1 OR b = 2) per row: (1, NULL) → TRUE; (NULL, 2) → TRUE; (3, 4) → FALSE; (NULL, NULL) → UNKNOWN; (3, NULL) → FALSE OR UNKNOWN = UNKNOWN. NOT gives FALSE, FALSE, TRUE, UNKNOWN, UNKNOWN. Only (3, 4) is TRUE.",
    optionExplanations: ["Correct.", "(3, NULL) evaluates to UNKNOWN, not TRUE.", "UNKNOWN rows are filtered out.", "Most rows fail or are UNKNOWN."],
    tags: ["trap"]
  },
  {
    id: "sql-basics-035", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "hard", type: "query",
    question: "t(x) has rows 1, NULL, 2, NULL. What does each query return?",
    code: "Q1: SELECT COUNT(*) FROM t WHERE x = x;\nQ2: SELECT COUNT(*) FROM t WHERE x > NULL OR NULL IS NULL;",
    options: ["Q1: 4, Q2: 0", "Q1: 2, Q2: 4", "Q1: 2, Q2: 0", "Q1: 4, Q2: 4"],
    answer: 1,
    explanation: "`x = x` is UNKNOWN when x is NULL, so only the 2 non-NULL rows count. In Q2, `x > NULL` is always UNKNOWN, but `NULL IS NULL` is TRUE, and UNKNOWN OR TRUE is TRUE, so every row (4) matches.",
    optionExplanations: ["NULL = NULL isn't TRUE, and IS NULL makes Q2 always TRUE.", "Correct.", "`NULL IS NULL` is TRUE, so Q2 matches every row.", "x = x fails for NULLs."]
  },
  {
    id: "sql-basics-036", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "hard", type: "query",
    question: "emp has 10 rows. What does this return?",
    code: "SELECT * FROM emp ORDER BY id LIMIT 5 OFFSET 20;",
    options: ["An error: offset out of range", "NULL", "The last 5 rows", "An empty result set (0 rows)"],
    answer: 3,
    explanation: "An OFFSET beyond the end isn't an error; there are simply no rows left to return. Applications typically detect the last page when fewer than LIMIT rows come back.",
    optionExplanations: ["No error is raised.", "Queries return result sets, not a single NULL.", "OFFSET doesn't wrap around.", "Correct."]
  },
  {
    id: "sql-basics-037", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "hard", type: "query",
    question: "In PostgreSQL, what happens with this query?",
    code: "SELECT DISTINCT dept FROM emp ORDER BY salary;",
    options: ["Error: for SELECT DISTINCT, ORDER BY expressions must appear in the select list", "Depts ordered by their lowest salary", "Depts ordered alphabetically", "The ORDER BY is silently ignored"],
    answer: 0,
    explanation: "After DISTINCT, each output row (a dept) may correspond to many salaries, so 'order by salary' is ambiguous. PostgreSQL rejects it. Aggregate explicitly instead: `SELECT dept FROM emp GROUP BY dept ORDER BY MIN(salary)`.",
    optionExplanations: ["Correct.", "The database won't guess MIN for you.", "No implicit alphabetical order is applied.", "PostgreSQL raises an error rather than ignoring it."]
  },
  {
    id: "sql-basics-038", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "hard", type: "query",
    question: "A row has a = 1, b = 2. What are a and b after this statement in PostgreSQL, and in MySQL?",
    code: "UPDATE t SET a = b, b = a;",
    options: ["Both: a = 2, b = 1", "PostgreSQL: a = 2, b = 1; MySQL: a = 2, b = 2", "PostgreSQL: a = 2, b = 2; MySQL: a = 2, b = 1", "Both: a = 2, b = 2"],
    answer: 1,
    explanation: "Standard SQL (PostgreSQL, SQL Server, Oracle) evaluates every right-hand side using the row's OLD values, so the columns are swapped. MySQL performs single-table assignments left to right using the CURRENT values: a becomes 2, then b = a uses the new a (2).",
    optionExplanations: ["MySQL behaves differently.", "Correct.", "Reversed.", "PostgreSQL uses the old values for all assignments."],
    tags: ["trap"]
  },
  {
    id: "sql-basics-039", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "hard", type: "query",
    question: "In PostgreSQL, which expression is TRUE when both a and b are NULL, and FALSE when exactly one is NULL?",
    code: "-- compare two nullable columns a and b",
    options: ["a = b", "a IS NOT DISTINCT FROM b", "a <> b", "COALESCE(a = b, FALSE)"],
    answer: 1,
    explanation: "`IS [NOT] DISTINCT FROM` is a NULL-safe comparison: two NULLs are 'not distinct' (TRUE) and NULL vs a value is distinct. Plain = gives UNKNOWN. COALESCE(a = b, FALSE) returns FALSE for two NULLs. MySQL's equivalent is the `<=>` operator.",
    optionExplanations: ["= yields UNKNOWN when either side is NULL.", "Correct.", "<> is also UNKNOWN with NULLs.", "For two NULLs, a = b is UNKNOWN and COALESCE turns it into FALSE."]
  },
  {
    id: "sql-basics-040", subject: "sql", subtopic: "SQL Basics & NULL Handling", difficulty: "easy", type: "query",
    question: "What does this query do?",
    code: "SELECT name, salary FROM emp ORDER BY salary DESC, name;",
    options: ["Sorts by salary descending; ties are broken by name ascending", "Sorts both columns descending", "Sorts by name first", "Syntax error: each column needs ASC or DESC"],
    answer: 0,
    explanation: "Each ORDER BY item has its own direction, defaulting to ASC. Later items only break ties among rows equal on the earlier items.",
    optionExplanations: ["Correct.", "DESC applies only to salary.", "Sort keys are applied in the listed order.", "ASC is the default and may be omitted."]
  }
);
