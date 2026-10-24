/* SQL / DBMS — Advanced SQL Features */
window.QUESTIONS.push(
  {
    id: "sql-adv-001", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "easy", type: "query",
    question: "For a row with score = 85, what does this return?",
    code: "SELECT CASE\n         WHEN score >= 90 THEN 'A'\n         WHEN score >= 80 THEN 'B'\n         ELSE 'C'\n       END AS grade\nFROM results;",
    options: ["A", "NULL", "C", "B"],
    answer: 3,
    explanation: "A searched CASE evaluates its WHEN conditions top to bottom and returns the result of the FIRST true one. 85 fails >= 90 and passes >= 80, giving 'B'.",
    optionExplanations: ["85 isn't >= 90.", "A branch matched, so the result isn't NULL.", "An earlier WHEN already matched.", "Correct."]
  },
  {
    id: "sql-adv-002", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "easy", type: "query",
    question: "For status = 'archived', what does this return?",
    code: "SELECT CASE status\n         WHEN 'active'   THEN 1\n         WHEN 'inactive' THEN 0\n       END AS flag\nFROM accounts;",
    options: ["0", "1", "NULL", "Error: CASE needs ELSE"],
    answer: 2,
    explanation: "If no WHEN matches and there's no ELSE, CASE returns NULL. ELSE is optional; add `ELSE -1` (or similar) if you need a default.",
    optionExplanations: ["'archived' doesn't match 'inactive'.", "'archived' doesn't match 'active'.", "Correct.", "ELSE is optional."]
  },
  {
    id: "sql-adv-003", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "easy", type: "concept",
    question: "How do DELETE, TRUNCATE and DROP differ?",
    options: ["They're all DML and can be rolled back everywhere", "TRUNCATE removes the table definition", "DELETE removes selected rows (DML, WHERE allowed, row by row, fires triggers); TRUNCATE quickly removes ALL rows but keeps the table (DDL in most DBs); DROP removes the table itself, structure included", "DROP deletes only the data"],
    answer: 2,
    explanation: "DELETE is logged per row, supports WHERE and fires DELETE triggers. TRUNCATE deallocates data pages, is much faster, can't take WHERE, usually resets identity counters and doesn't fire row triggers. DROP removes data, indexes, constraints and the table definition.",
    optionExplanations: ["TRUNCATE and DROP are DDL, and rollback support varies.", "TRUNCATE keeps the table.", "Correct.", "DROP removes the whole table."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-adv-004", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "easy", type: "concept",
    question: "What is the main difference between CHAR(10) and VARCHAR(10)?",
    options: ["CHAR holds numbers; VARCHAR holds text", "CHAR is fixed-length (padded with spaces to 10); VARCHAR stores only the actual characters plus a small length prefix", "VARCHAR is always faster", "CHAR allows longer strings"],
    answer: 1,
    explanation: "CHAR(n) always occupies n characters, padding shorter values with spaces; it suits fixed-size codes (country codes, flags). VARCHAR(n) is variable-length up to n. Trailing-space handling differs: CHAR pads, and comparisons usually ignore trailing pad spaces.",
    optionExplanations: ["Both store text.", "Correct.", "Neither is always faster; CHAR can be marginally faster for truly fixed-size data.", "Both have the same maximum n here."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-adv-005", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "easy", type: "concept",
    question: "What is a (non-materialized) view?",
    options: ["A copy of a table's data stored separately", "A named, stored query that behaves like a virtual table; its result is computed when you query it", "An index on several columns", "A backup of the database"],
    answer: 1,
    explanation: "CREATE VIEW v AS SELECT ... saves the query definition, not its result. Views simplify complex queries, provide a stable interface when tables change, and restrict access (grant SELECT on the view, not the base table).",
    optionExplanations: ["That describes a materialized view or a table copy.", "Correct.", "Indexes are a different object.", "Views aren't backups."]
  },
  {
    id: "sql-adv-006", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "easy", type: "concept",
    question: "What is a CTE (Common Table Expression)?",
    options: ["A permanent table created with CREATE", "A type of index", "A named temporary result set defined with WITH that exists only for the duration of one statement", "A stored procedure"],
    answer: 2,
    explanation: "`WITH recent AS (SELECT ...) SELECT ... FROM recent` names a subquery, improving readability, allowing reuse within the statement, and (with RECURSIVE) enabling recursion for hierarchies and series.",
    optionExplanations: ["CTEs aren't persisted.", "CTEs are query constructs, not indexes.", "Correct.", "Procedures are stored code blocks."]
  },
  {
    id: "sql-adv-007", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "easy", type: "query",
    question: "What does this return?",
    code: "SELECT UPPER('sql'), LENGTH('hello'), SUBSTRING('database', 1, 4);",
    options: ["SQL, 5, data", "sql, 5, data", "SQL, 4, atab", "SQL, 5, base"],
    answer: 0,
    explanation: "UPPER converts to uppercase; LENGTH counts characters (in PostgreSQL); SUBSTRING(str, start, length) is 1-based, so positions 1–4 give 'data'.",
    optionExplanations: ["Correct.", "UPPER changes the case.", "SQL string positions start at 1, not 0.", "Starting at 1 gives the first four characters."]
  },
  {
    id: "sql-adv-008", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "For score = 95, what does this return?",
    code: "SELECT CASE\n         WHEN score >= 80 THEN 'B'\n         WHEN score >= 90 THEN 'A'\n         ELSE 'C'\n       END\nFROM results;",
    options: ["A", "AB", "C", "B"],
    answer: 3,
    explanation: "CASE stops at the first true condition. 95 >= 80 is true, so 'B' is returned and the more specific >= 90 branch is never reached. Order conditions from most to least restrictive.",
    optionExplanations: ["The >= 80 branch matches first.", "CASE returns a single value.", "A branch matched.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "sql-adv-009", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "For a row where x IS NULL, what does each expression return?",
    code: "SELECT CASE x WHEN NULL THEN 'null' ELSE 'other' END AS a,\n       CASE WHEN x IS NULL THEN 'null' ELSE 'other' END AS b\nFROM t;",
    options: ["a = 'null', b = 'null'", "a = 'null', b = 'other'", "a = 'other', b = 'null'", "a = NULL, b = 'null'"],
    answer: 2,
    explanation: "A simple CASE compares with `=`, and x = NULL is UNKNOWN, so the WHEN NULL branch never matches and the ELSE applies. Use the searched form with IS NULL to test for NULL.",
    optionExplanations: ["The simple CASE uses =, which never matches NULL.", "Reversed.", "Correct.", "The ELSE branch provides 'other'."],
    tags: ["trap"]
  },
  {
    id: "sql-adv-010", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "In MySQL with a UTF-8 column, what do these return for the value 'héllo'?",
    code: "SELECT LENGTH('héllo'), CHAR_LENGTH('héllo');",
    options: ["5, 5", "6, 5", "5, 6", "6, 6"],
    answer: 1,
    explanation: "In MySQL, LENGTH returns the number of BYTES ('é' takes 2 bytes in UTF-8), while CHAR_LENGTH returns characters. In PostgreSQL, LENGTH counts characters and OCTET_LENGTH counts bytes. Use the character function for user-facing limits.",
    optionExplanations: ["MySQL's LENGTH counts bytes.", "Correct.", "Reversed.", "CHAR_LENGTH counts characters."],
    tags: ["trap"]
  },
  {
    id: "sql-adv-011", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "What does this return?",
    code: "SELECT TRIM('  ab  '), REPLACE('a-b-c', '-', ''), POSITION('b' IN 'abc'), LPAD('7', 3, '0');",
    options: ["'ab', 'abc', 2, '007'", "'  ab', 'a-b-c', 1, '700'", "'ab', 'abc', 1, '007'", "'ab  ', 'abc', 2, '7'"],
    answer: 0,
    explanation: "TRIM removes leading and trailing spaces; REPLACE substitutes every occurrence; POSITION is 1-based (MySQL also has INSTR/LOCATE); LPAD left-pads to the given length with the fill string — handy for zero-padded codes.",
    optionExplanations: ["Correct.", "TRIM removes both sides and REPLACE removes the hyphens.", "POSITION is 1-based, so 'b' is at 2.", "TRIM removes both sides, and LPAD pads to 3 characters."]
  },
  {
    id: "sql-adv-012", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "What does `SELECT 'a' || 'b';` return in PostgreSQL and in MySQL (default sql_mode)?",
    code: "SELECT 'a' || 'b';",
    options: ["Both 'ab'", "Both 0", "PostgreSQL error; MySQL 'ab'", "PostgreSQL 'ab'; MySQL 0 (|| is logical OR)"],
    answer: 3,
    explanation: "|| is the SQL-standard concatenation operator (PostgreSQL, Oracle, SQLite). In MySQL it means logical OR unless sql_mode includes PIPES_AS_CONCAT; the strings are converted to numbers (0), so the result is 0. Use CONCAT() for portable code.",
    optionExplanations: ["MySQL treats || as OR by default.", "PostgreSQL concatenates.", "PostgreSQL supports ||.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "sql-adv-013", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "In PostgreSQL, what does this return?",
    code: "SELECT EXTRACT(YEAR FROM DATE '2024-03-15'),\n       DATE_TRUNC('month', TIMESTAMP '2024-03-15 10:30:00');",
    options: ["2024, 2024-03-01 00:00:00", "2024, 2024-03-15 00:00:00", "03, 2024-03-01 10:30:00", "2024, 2024-01-01 00:00:00"],
    answer: 0,
    explanation: "EXTRACT pulls a field out of a date/time value. DATE_TRUNC truncates a timestamp to the start of the given unit — ideal for grouping by month (`GROUP BY DATE_TRUNC('month', created_at)`). MySQL uses YEAR(), DATE_FORMAT(d, '%Y-%m-01') etc.",
    optionExplanations: ["Correct.", "Truncating to month resets the day to 1.", "EXTRACT(YEAR) returns the year, and truncation zeroes the time.", "Truncating to month keeps March."]
  },
  {
    id: "sql-adv-014", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "How many days apart are 2024-03-01 and 2024-03-10, as computed by each database?",
    code: "MySQL:      SELECT DATEDIFF('2024-03-10', '2024-03-01');\nPostgreSQL: SELECT DATE '2024-03-10' - DATE '2024-03-01';",
    options: ["9 and 9", "10 and 10", "9 and -9", "-9 and 9"],
    answer: 0,
    explanation: "MySQL's DATEDIFF(later, earlier) returns the number of days between two dates. In PostgreSQL, subtracting two DATE values directly yields an integer number of days. Both give 9 (they count boundaries, not inclusive days).",
    optionExplanations: ["Correct.", "The difference doesn't include both endpoints.", "Both are later minus earlier.", "Both are later minus earlier."]
  },
  {
    id: "sql-adv-015", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "hard", type: "query",
    question: "In PostgreSQL, what does this return?",
    code: "SELECT DATE '2024-01-31' + INTERVAL '1 month';",
    options: ["2024-03-02 00:00:00", "2024-02-29 00:00:00", "2024-02-31 00:00:00", "Error: invalid date"],
    answer: 1,
    explanation: "Adding a month keeps the day-of-month when possible; when that day doesn't exist (Feb 31), PostgreSQL clamps to the last day of the month — 2024 is a leap year, so Feb 29. (MySQL's DATE_ADD also clamps.) Month arithmetic isn't reversible: adding then subtracting a month may not return the original date.",
    optionExplanations: ["It doesn't overflow into March.", "Correct.", "February 31 doesn't exist.", "The result is clamped rather than raising an error."],
    tags: ["trap"]
  },
  {
    id: "sql-adv-016", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "hard", type: "query",
    question: "In MySQL, what do these comparisons return?",
    code: "SELECT '10' < '9', 10 < 9, 'abc' = 0, '5 apples' + 1;",
    options: ["1, 0, 1, 6", "0, 0, 0, Error", "1, 0, 0, 6", "0, 0, 1, 6"],
    answer: 0,
    explanation: "String comparison is lexicographic ('1' < '9'), so '10' < '9' is true (1). Comparing a string with a number converts the string to a number: 'abc' becomes 0 (with a warning), so 'abc' = 0 is TRUE, and '5 apples' + 1 uses the numeric prefix 5 → 6. PostgreSQL would raise errors for the last two. Avoid implicit conversions.",
    optionExplanations: ["Correct.", "String comparison is lexicographic, and MySQL coerces silently.", "MySQL converts 'abc' to 0, making the comparison true.", "'10' < '9' compares characters, and '1' < '9'."],
    tags: ["trap"]
  },
  {
    id: "sql-adv-017", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "concept",
    question: "Which view is typically UPDATABLE (you can INSERT/UPDATE through it)?",
    options: ["CREATE VIEW v AS SELECT dept, COUNT(*) FROM emp GROUP BY dept;", "CREATE VIEW v AS SELECT id, name, salary FROM emp WHERE dept = 'IT';", "CREATE VIEW v AS SELECT DISTINCT dept FROM emp;", "CREATE VIEW v AS SELECT * FROM a UNION SELECT * FROM b;"],
    answer: 1,
    explanation: "A view is automatically updatable when each view row maps to exactly one base-table row: a single table, no aggregates, GROUP BY, DISTINCT, set operations or window functions. Other views need INSTEAD OF triggers (or rules) to accept writes.",
    optionExplanations: ["Aggregated rows don't map back to single base rows.", "Correct.", "DISTINCT rows can't be traced to one base row.", "UNION views aren't automatically updatable."]
  },
  {
    id: "sql-adv-018", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "What happens when you run the INSERT?",
    code: "CREATE VIEW it_staff AS\n  SELECT id, name, dept FROM emp WHERE dept = 'IT'\n  WITH CHECK OPTION;\n\nINSERT INTO it_staff (id, name, dept) VALUES (9, 'Zoe', 'HR');",
    options: ["Zoe is inserted into emp and appears in it_staff", "Zoe is inserted into emp but doesn't appear in the view", "The insert is rejected because the new row wouldn't satisfy the view's WHERE condition", "It's a syntax error"],
    answer: 2,
    explanation: "WITH CHECK OPTION ensures that rows inserted or updated through the view remain visible through it. Without it, the row would be written to emp silently and then be invisible through the view.",
    optionExplanations: ["The row doesn't satisfy dept = 'IT'.", "That's what happens WITHOUT the check option.", "Correct.", "WITH CHECK OPTION is standard syntax."]
  },
  {
    id: "sql-adv-019", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "concept",
    question: "How does a materialized view differ from a regular view (e.g. in PostgreSQL)?",
    options: ["They're identical", "A materialized view stores the query RESULT physically; reads are fast but the data is stale until REFRESH MATERIALIZED VIEW is run", "A materialized view can't be indexed", "A regular view stores data; a materialized view stores only the query"],
    answer: 1,
    explanation: "Materialized views cache expensive aggregations (dashboards, reports) and can be indexed. The trade-off is staleness: you must refresh them (CONCURRENTLY in PostgreSQL to avoid blocking reads). MySQL has no native materialized views.",
    optionExplanations: ["Storage and freshness differ.", "Correct.", "Materialized views can have indexes.", "Reversed."]
  },
  {
    id: "sql-adv-020", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "emp: HR (3000, 5000), IT (7000, 9000, 6000). What does this return?",
    code: "WITH dept_totals AS (\n  SELECT dept, SUM(salary) AS total FROM emp GROUP BY dept\n),\nbig AS (\n  SELECT dept FROM dept_totals WHERE total > 10000\n)\nSELECT COUNT(*) FROM big;",
    options: ["0", "5", "2", "1"],
    answer: 3,
    explanation: "A WITH clause can define several CTEs separated by commas, and later CTEs can reference earlier ones. dept_totals gives HR 8000 and IT 22000; big keeps only IT.",
    optionExplanations: ["IT's total exceeds 10000.", "big has one row per qualifying department.", "HR's total is only 8000.", "Correct."]
  },
  {
    id: "sql-adv-021", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "What does this return?",
    code: "WITH RECURSIVE n(x) AS (\n  SELECT 1\n  UNION ALL\n  SELECT x + 2 FROM n WHERE x < 9\n)\nSELECT COUNT(*), SUM(x) FROM n;",
    options: ["5, 25", "4, 16", "6, 36", "9, 45"],
    answer: 0,
    explanation: "The anchor produces 1; each recursive step adds 2 while the previous x < 9: 1, 3, 5, 7, 9. When x = 9, the condition fails, so no 11 is generated. Count 5, sum 25.",
    optionExplanations: ["Correct.", "9 is also produced (from 7, since 7 < 9).", "11 isn't produced because 9 < 9 is false.", "Only odd numbers are generated."]
  },
  {
    id: "sql-adv-022", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "hard", type: "concept",
    question: "A recursive CTE walks a graph of 'follows' relationships that contains cycles (A → B → A). What happens without any cycle handling, and what's a fix?",
    options: ["Recursion stops automatically after one pass", "The database automatically removes cyclic rows", "Cycles are impossible in SQL", "With UNION ALL it can loop forever (until a limit or error); fixes include tracking a visited path/array and excluding seen nodes, a depth limit, or UNION (which drops duplicate rows and stops when no new rows appear)"],
    answer: 3,
    explanation: "Recursion continues while the recursive member produces new rows. With cycles, UNION ALL keeps generating the same nodes. Track a path (PostgreSQL arrays, or the CYCLE clause in PostgreSQL 14+), cap depth (`WHERE depth < 10`), or use UNION when the rows themselves repeat exactly.",
    optionExplanations: ["It continues as long as new rows are produced.", "Cycle handling is your responsibility (or the CYCLE clause).", "Graph data often contains cycles.", "Correct."]
  },
  {
    id: "sql-adv-023", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "concept",
    question: "Which statement about stored procedures vs user-defined functions is generally true (PostgreSQL 11+ / MySQL)?",
    options: ["Functions can't take parameters", "They're identical", "Procedures can be used in WHERE clauses", "Functions return a value and can be used inside SELECT expressions; procedures are invoked with CALL, may return nothing and can control transactions (COMMIT/ROLLBACK inside)"],
    answer: 3,
    explanation: "Use functions for reusable computations in queries (e.g. SELECT tax(amount)). Use procedures for multi-step operations, batch jobs and transaction management. Both run inside the database, reducing round trips, and both can be secured with GRANT EXECUTE.",
    optionExplanations: ["Both take parameters.", "Invocation and capabilities differ.", "Procedures can't be used as expressions.", "Correct."]
  },
  {
    id: "sql-adv-024", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "concept",
    question: "A trigger must reject any UPDATE that lowers a product's price below its cost, using the new and old values. Which trigger type fits best?",
    options: ["BEFORE UPDATE, row-level (FOR EACH ROW), checking NEW.price against NEW.cost / OLD.price", "AFTER INSERT, statement-level", "AFTER DELETE", "A view"],
    answer: 0,
    explanation: "Row-level triggers see each affected row through NEW (incoming values) and OLD (previous values). A BEFORE trigger can validate or modify NEW and abort the operation by raising an error, before the change is written. AFTER triggers suit auditing or cascading actions.",
    optionExplanations: ["Correct.", "The check is about updates and needs row values.", "Deletes are irrelevant here.", "Views don't validate updates by themselves."]
  },
  {
    id: "sql-adv-025", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "numerical",
    question: "An UPDATE modifies 100 rows. How many times does an `AFTER UPDATE ... FOR EACH ROW` trigger fire, and how many times does an `AFTER UPDATE ... FOR EACH STATEMENT` trigger fire (PostgreSQL)?",
    options: ["1 and 1", "1 and 100", "100 and 100", "100 and 1"],
    answer: 3,
    explanation: "Row-level triggers fire once per affected row; statement-level triggers fire once per statement (even if zero rows were affected). Heavy row-level triggers can slow bulk operations considerably. MySQL supports only row-level triggers.",
    optionExplanations: ["Row-level triggers fire per row.", "Reversed.", "Statement triggers fire once.", "Correct."]
  },
  {
    id: "sql-adv-026", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "hard", type: "concept",
    question: "Inside an explicit transaction, you run `TRUNCATE orders;` and then `ROLLBACK;`. What happens in PostgreSQL vs MySQL (InnoDB)?",
    options: ["Data is restored in both", "MySQL restores the data; PostgreSQL doesn't", "Data is lost in both", "PostgreSQL: data is restored (TRUNCATE is transactional); MySQL: the data is gone, because TRUNCATE is DDL and causes an implicit commit"],
    answer: 3,
    explanation: "PostgreSQL makes almost all DDL transactional, including TRUNCATE, CREATE and DROP. MySQL commits implicitly before and after DDL statements like TRUNCATE, ALTER and DROP, so they can't be rolled back. DELETE can be rolled back in both.",
    optionExplanations: ["MySQL can't roll back TRUNCATE.", "Reversed.", "PostgreSQL can roll it back.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "sql-adv-027", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "concept",
    question: "A MySQL table with AUTO_INCREMENT id has rows 1–50. What's the next id after `DELETE FROM t;` + INSERT, versus after `TRUNCATE t;` + INSERT?",
    options: ["1 and 1", "51 and 51", "51 and 1", "1 and 51"],
    answer: 2,
    explanation: "DELETE removes rows but leaves the AUTO_INCREMENT counter alone, so the next id is 51. TRUNCATE recreates the table and resets the counter to 1. PostgreSQL's TRUNCATE keeps the sequence unless you add RESTART IDENTITY.",
    optionExplanations: ["DELETE doesn't reset the counter.", "TRUNCATE resets the counter in MySQL.", "Correct.", "Reversed."]
  },
  {
    id: "sql-adv-028", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "concept",
    question: "An `AFTER DELETE ... FOR EACH ROW` trigger writes to an audit table. Which statement does NOT fire it?",
    options: ["DELETE FROM orders WHERE id = 5;", "DELETE FROM orders;", "TRUNCATE orders;", "DELETE FROM orders WHERE amount > 100;"],
    answer: 2,
    explanation: "TRUNCATE doesn't delete row by row, so row-level DELETE triggers don't fire (PostgreSQL offers separate ON TRUNCATE statement triggers). This is one reason TRUNCATE is fast — and why it can bypass auditing.",
    optionExplanations: ["A row DELETE fires the trigger.", "Deleting all rows with DELETE still fires per row.", "Correct.", "A filtered DELETE fires for each deleted row."]
  },
  {
    id: "sql-adv-029", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "hard", type: "concept",
    question: "A CHAR(5) column stores 'ab'. Which statement is true in standard SQL / PostgreSQL?",
    options: ["It stores 'ab' with length 2 and no padding", "It's stored padded to 'ab   ', and trailing pad spaces are insignificant when comparing, so it equals 'ab'", "It raises an error because the value is shorter than 5", "It stores 'ab' followed by three NULL characters"],
    answer: 1,
    explanation: "CHAR(n) pads to n with spaces. Comparisons between CHAR values ignore trailing spaces, so 'ab' = 'ab   ' is TRUE, and PostgreSQL's LENGTH() on a char(n) value doesn't count the padding (OCTET_LENGTH does). MySQL strips trailing spaces when CHAR values are retrieved.",
    optionExplanations: ["CHAR values are padded.", "Correct.", "Shorter values are padded, not rejected.", "Padding uses spaces."]
  },
  {
    id: "sql-adv-030", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "concept",
    question: "In PostgreSQL, is VARCHAR(255) faster than TEXT?",
    options: ["Yes, VARCHAR is always much faster", "No: they use the same storage; VARCHAR(n) only adds a length check, so choose it when you actually want the limit enforced", "TEXT can't be indexed", "TEXT is limited to 255 characters"],
    answer: 1,
    explanation: "PostgreSQL stores text, varchar and varchar(n) identically (TOASTing large values). The only difference is the length constraint. In MySQL, TEXT columns are stored differently (off-page, with indexing limits), so VARCHAR is usually preferred there for short strings.",
    optionExplanations: ["Performance is the same in PostgreSQL.", "Correct.", "TEXT columns can be indexed.", "TEXT is effectively unlimited (up to 1 GB)."]
  },
  {
    id: "sql-adv-031", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "hard", type: "concept",
    question: "A transaction inserts a row into a table with an AUTO_INCREMENT / SERIAL id (getting id 41) and then rolls back. The next successful insert gets which id?",
    options: ["41, because the rollback undid the insert", "1", "42: sequence/auto-increment values aren't rolled back, so gaps appear", "It depends on the number of rows"],
    answer: 2,
    explanation: "Sequences and auto-increment counters are non-transactional for concurrency: handing out numbers without locking until commit. A rolled-back insert 'burns' its id, so ids are unique and increasing but not gapless. Never rely on ids being consecutive (e.g. for invoice numbers that must have no gaps).",
    optionExplanations: ["The counter isn't rolled back.", "The counter doesn't reset.", "Correct.", "It depends only on the counter."],
    tags: ["trap"]
  },
  {
    id: "sql-adv-032", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "Which PostgreSQL statement inserts a product or, if the id already exists, updates its price (an 'upsert')?",
    code: "-- products(id PRIMARY KEY, name, price)",
    options: ["INSERT INTO products VALUES (1, 'pen', 12) ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;", "INSERT OR UPDATE products VALUES (1, 'pen', 12);", "UPDATE products SET price = 12 WHERE id = 1 ELSE INSERT;", "MERGE products VALUES (1, 'pen', 12);"],
    answer: 0,
    explanation: "PostgreSQL's INSERT ... ON CONFLICT (target) DO UPDATE performs an atomic upsert; EXCLUDED refers to the row proposed for insertion. MySQL uses INSERT ... ON DUPLICATE KEY UPDATE price = VALUES(price) (or an alias). Standard SQL (and PostgreSQL 15+) also has MERGE with a full USING ... ON ... WHEN syntax.",
    optionExplanations: ["Correct.", "There's no INSERT OR UPDATE (SQLite has INSERT OR REPLACE, which deletes and reinserts).", "UPDATE has no ELSE clause.", "MERGE requires USING ... ON ... WHEN clauses."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-adv-033", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "easy", type: "concept",
    question: "Which pair of DCL statements gives and then removes a user's read access?",
    options: ["ALLOW / DENY", "OPEN / CLOSE", "COMMIT / ROLLBACK", "GRANT SELECT ON orders TO analyst; / REVOKE SELECT ON orders FROM analyst;"],
    answer: 3,
    explanation: "GRANT and REVOKE manage privileges on objects (SELECT, INSERT, UPDATE, DELETE, EXECUTE...) for users or roles. Following least privilege, application accounts should only get the permissions they need. (SQL Server also has DENY.)",
    optionExplanations: ["These aren't standard SQL commands.", "Those relate to cursors.", "Those are TCL.", "Correct."]
  },
  {
    id: "sql-adv-034", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "easy", type: "concept",
    question: "What is true about a temporary table created with `CREATE TEMPORARY TABLE tmp (...)`?",
    options: ["It's visible to all sessions and persists after restart", "It's visible only to the session that created it and is dropped automatically when the session ends", "It's stored only in the CPU cache", "It can't have indexes"],
    answer: 1,
    explanation: "Temporary tables hold intermediate results for complex processing without clashing with other sessions (two sessions can each have their own tmp). They disappear at session end (or transaction end with ON COMMIT DROP in PostgreSQL).",
    optionExplanations: ["They're session-private and temporary.", "Correct.", "They're stored like normal tables (often in temp space).", "They can be indexed."]
  },
  {
    id: "sql-adv-035", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "In PostgreSQL, data is a JSONB column containing {\"name\": \"Asha\", \"age\": 30}. What types do these return?",
    code: "SELECT data -> 'name', data ->> 'name' FROM users;",
    options: ["Both text", "Both jsonb", "-> returns text; ->> returns jsonb", "-> returns jsonb (\"Asha\" with quotes); ->> returns text (Asha)"],
    answer: 3,
    explanation: "`->` extracts a JSON value (still JSON, so strings keep their quotes and can be navigated further), while `->>` extracts it as text, ready for comparison: WHERE data->>'name' = 'Asha'. MySQL uses JSON_EXTRACT / -> and JSON_UNQUOTE / ->>.",
    optionExplanations: ["-> keeps the JSON type.", "->> returns text.", "Reversed.", "Correct."]
  },
  {
    id: "sql-adv-036", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "concept",
    question: "Which is NOT a benefit of prepared statements?",
    options: ["Protection against SQL injection, since parameters are sent separately from the SQL text", "Reduced parsing/planning overhead when the same statement runs many times", "Guaranteed faster execution plans for every parameter value", "Cleaner handling of types and escaping"],
    answer: 2,
    explanation: "Prepared statements separate code from data (stopping injection) and can reuse parsing/planning. But a cached generic plan can be WORSE for skewed parameter values (e.g. a rare vs very common status), which is why PostgreSQL may re-plan with custom plans.",
    optionExplanations: ["This is a real benefit.", "This is a real benefit.", "Correct: a generic plan isn't always optimal.", "This is a real benefit."]
  },
  {
    id: "sql-adv-037", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "concept",
    question: "Why are cursors that process a table row by row usually discouraged for bulk updates?",
    options: ["Cursors are deprecated", "Set-based statements (one UPDATE with joins/CASE) let the engine optimise the whole operation; row-by-row loops add per-row overhead and are often orders of magnitude slower", "Cursors can't read data", "Cursors lock the whole database"],
    answer: 1,
    explanation: "SQL engines are designed for set operations. Cursors (and 'RBAR' loops in application code) are appropriate when each row needs complex procedural logic or when streaming huge result sets to a client, not for simple bulk transformations.",
    optionExplanations: ["Cursors are still supported.", "Correct.", "Reading rows is exactly what cursors do.", "Cursors don't lock the entire database."]
  },
  {
    id: "sql-adv-038", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "medium", type: "query",
    question: "tickets(id, status): 1 low, 2 urgent, 3 high, 4 low. In what order are ids returned?",
    code: "SELECT id FROM tickets\nORDER BY CASE status\n           WHEN 'urgent' THEN 1\n           WHEN 'high'   THEN 2\n           ELSE 3\n         END,\n         id;",
    options: ["2, 3, 1, 4", "1, 2, 3, 4", "1, 4, 3, 2", "2, 3, 4, 1"],
    answer: 0,
    explanation: "A CASE in ORDER BY maps values to a custom sort key: urgent (2) → 1, high (3) → 2, the two lows → 3, then ties are broken by id (1, 4). Alphabetical sorting of the status text would give a different order.",
    optionExplanations: ["Correct.", "That's ordering by id only.", "The custom priority puts urgent first.", "Ties at priority 3 are ordered by id: 1 before 4."]
  },
  {
    id: "sql-adv-039", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "hard", type: "query",
    question: "What does this return in PostgreSQL?",
    code: "SELECT CAST('42' AS INTEGER) + 1,\n       '3'::int * 2,\n       CAST(7 AS NUMERIC(4, 2)) / 2;",
    options: ["43, 6, 3.5000000000000000", "'421', '33', 3", "43, 6, 3", "Error"],
    answer: 0,
    explanation: "CAST(x AS type) (or PostgreSQL's x::type) converts explicitly. Once 7 is NUMERIC, division is exact decimal division (3.5 with numeric precision), not integer division. Explicit casts make intent clear and avoid dialect-specific implicit conversions.",
    optionExplanations: ["Correct.", "The casts produce numbers, not strings.", "Numeric division keeps the fraction.", "All casts are valid."]
  },
  {
    id: "sql-adv-040", subject: "sql", subtopic: "Advanced SQL Features", difficulty: "easy", type: "query",
    question: "What does CONCAT_WS return here (PostgreSQL or MySQL)?",
    code: "SELECT CONCAT_WS(', ', 'Pune', NULL, 'India');",
    options: ["'Pune, , India'", "NULL", "'Pune, India'", "'Pune, NULL, India'"],
    answer: 2,
    explanation: "CONCAT_WS (concat with separator) puts the separator between non-NULL arguments and skips NULLs, which makes it ideal for building addresses or full names from optional parts.",
    optionExplanations: ["NULLs are skipped, so no empty segment appears.", "Only a NULL separator makes the result NULL.", "Correct.", "NULL isn't converted to text."]
  }
);
