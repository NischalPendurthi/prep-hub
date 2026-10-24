/* SQL / DBMS — Aggregation & GROUP BY */
window.QUESTIONS.push(
  {
    id: "sql-agg-001", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "easy", type: "query",
    question: "How many rows does this return?",
    code: "-- emp(name, dept, salary, bonus)\n-- A | HR   | 3000 | NULL\n-- B | HR   | 5000 | 500\n-- C | IT   | 7000 | NULL\n-- D | IT   | 9000 | 1000\n-- E | IT   | 6000 | 200\n-- F | NULL | 4000 | NULL\nSELECT dept, COUNT(*) FROM emp GROUP BY dept;",
    options: ["2", "1", "6", "3"],
    answer: 3,
    explanation: "GROUP BY produces one output row per distinct value of the grouping columns. All NULLs in the grouping column form a single group, so the groups are HR, IT and NULL.",
    optionExplanations: ["The NULL dept forms its own group.", "There are three distinct dept values (counting NULL).", "Rows are collapsed into groups.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "sql-agg-002", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "easy", type: "query",
    question: "Using the same emp table (bonus: NULL, 500, NULL, 1000, 200, NULL), what does this return?",
    code: "SELECT AVG(bonus) FROM emp;",
    options: ["283.33", "NULL", "566.67", "1700"],
    answer: 2,
    explanation: "Aggregate functions (except COUNT(*)) ignore NULLs. AVG = (500 + 1000 + 200) / 3 = 566.67, dividing by the 3 non-NULL values, not by 6 rows. Use AVG(COALESCE(bonus, 0)) to treat missing bonuses as zero (giving 283.33).",
    optionExplanations: ["That would count NULLs as 0.", "There are non-NULL values to average.", "Correct.", "That's the SUM."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "sql-agg-003", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "easy", type: "concept",
    question: "What is the difference between WHERE and HAVING?",
    options: ["They are interchangeable", "WHERE can only be used with GROUP BY", "HAVING runs before WHERE", "WHERE filters individual rows before grouping; HAVING filters groups after aggregation and can use aggregate functions"],
    answer: 3,
    explanation: "Logical order: FROM → WHERE (row filter) → GROUP BY → HAVING (group filter) → SELECT → ORDER BY. So `WHERE salary > 5000` drops rows before counting, while `HAVING COUNT(*) > 2` drops whole groups. Put non-aggregate conditions in WHERE for efficiency.",
    optionExplanations: ["Aggregate conditions require HAVING.", "WHERE works without GROUP BY.", "WHERE is applied first.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-agg-004", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "easy", type: "query",
    question: "emp has rows, but none with dept = 'Sales'. What does this return?",
    code: "SELECT COUNT(*), SUM(salary), MAX(salary) FROM emp WHERE dept = 'Sales';",
    options: ["0, 0, 0", "NULL, NULL, NULL", "No rows", "0, NULL, NULL"],
    answer: 3,
    explanation: "Without GROUP BY, an aggregate query always returns exactly one row, even over zero input rows. COUNT of an empty set is 0, while SUM, AVG, MIN and MAX of an empty set are NULL. Use COALESCE(SUM(salary), 0) when you need 0.",
    optionExplanations: ["SUM/MAX of nothing is NULL, not 0.", "COUNT returns 0, never NULL.", "An ungrouped aggregate returns one row.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-agg-005", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "easy", type: "query",
    question: "Using the emp table (HR: 2 rows, IT: 3 rows, NULL dept: 1 row), which depts does this return?",
    code: "SELECT dept FROM emp GROUP BY dept HAVING COUNT(*) > 1;",
    options: ["IT only", "None", "HR, IT and NULL", "HR and IT"],
    answer: 3,
    explanation: "HAVING keeps groups whose aggregate condition is true: HR (2) and IT (3) have more than one row; the NULL-dept group has 1.",
    optionExplanations: ["HR has 2 rows, which is > 1.", "Two groups qualify.", "The NULL group has only 1 row.", "Correct."]
  },
  {
    id: "sql-agg-006", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "easy", type: "query",
    question: "What does this return?",
    code: "-- products(name): 'pen', 'Apple', 'zip', 'book'\nSELECT MIN(name), MAX(name) FROM products;  -- binary (case-sensitive) collation",
    options: ["Apple, zip", "book, zip", "Apple, pen", "pen, Apple"],
    answer: 0,
    explanation: "MIN and MAX work on any ordered type, including text, using the column's collation. With a binary/case-sensitive collation, uppercase letters sort before lowercase, so 'Apple' is the minimum and 'zip' the maximum.",
    optionExplanations: ["Correct.", "'Apple' (uppercase A) sorts before 'book'.", "'zip' sorts after 'pen'.", "MIN is the smallest, MAX the largest."]
  },
  {
    id: "sql-agg-007", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "How many rows does this return on the emp table (A: HR/NULL bonus, B: HR/500, C: IT/NULL, D: IT/1000, E: IT/200, F: NULL dept/NULL)?",
    code: "SELECT dept, (bonus IS NULL) AS no_bonus, COUNT(*)\nFROM emp\nGROUP BY dept, (bonus IS NULL);",
    options: ["3", "4", "5", "6"],
    answer: 2,
    explanation: "Grouping by two expressions makes one group per distinct combination: (HR, true), (HR, false), (IT, true), (IT, false), (NULL, true). That's 5 groups.",
    optionExplanations: ["Each dept splits by bonus presence.", "Both HR and IT have rows with and without a bonus.", "Correct.", "Rows D and E fall into the same group."]
  },
  {
    id: "sql-agg-008", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "In PostgreSQL (or MySQL with ONLY_FULL_GROUP_BY, the default since 5.7), what happens with this query?",
    code: "SELECT dept, name, COUNT(*) FROM emp GROUP BY dept;",
    options: ["Returns each dept with an arbitrary name", "Error: name must appear in GROUP BY or be used in an aggregate function", "Returns one row per employee", "Returns NULL for name"],
    answer: 1,
    explanation: "After grouping, each output row represents many input rows, so a bare non-aggregated column like name is ambiguous. The standard requires every selected column to be grouped, aggregated, or functionally dependent on the GROUP BY key (e.g. other columns when grouping by a primary key). Old MySQL silently picked an arbitrary value.",
    optionExplanations: ["That was legacy MySQL behaviour; modern defaults reject it.", "Correct.", "GROUP BY collapses rows.", "The database raises an error rather than returning NULL."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-agg-009", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "concept",
    question: "What is the logical order in which SQL clauses are evaluated?",
    options: ["SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY", "WHERE → FROM → SELECT → GROUP BY → ORDER BY → HAVING", "FROM → GROUP BY → WHERE → SELECT → HAVING → ORDER BY", "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT"],
    answer: 3,
    explanation: "Logically: FROM/JOINs build the row set, WHERE filters rows, GROUP BY forms groups, HAVING filters groups, SELECT computes output expressions (including window functions) and aliases, DISTINCT removes duplicates, ORDER BY sorts, LIMIT/OFFSET trims. This explains why SELECT aliases aren't visible in WHERE but are in ORDER BY.",
    optionExplanations: ["SELECT is evaluated late, not first.", "FROM is evaluated first.", "WHERE comes before GROUP BY.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-agg-010", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "Which statement about using the SELECT alias `n` is correct?",
    code: "SELECT dept, COUNT(*) AS n\nFROM emp\nGROUP BY dept\nHAVING n > 1      -- (1)\nORDER BY n DESC;  -- (2)",
    options: ["Both (1) and (2) work in PostgreSQL and MySQL", "Neither works anywhere", "(1) works everywhere; (2) fails in PostgreSQL", "(2) works everywhere; (1) works in MySQL but fails in PostgreSQL (repeat COUNT(*) in HAVING)"],
    answer: 3,
    explanation: "ORDER BY runs after SELECT, so output aliases are allowed there in every database. HAVING logically runs before SELECT; standard SQL and PostgreSQL don't allow output aliases in it, while MySQL permits it as an extension. Portable code repeats the aggregate: HAVING COUNT(*) > 1.",
    optionExplanations: ["PostgreSQL rejects the alias in HAVING.", "ORDER BY n is valid everywhere.", "Reversed.", "Correct."]
  },
  {
    id: "sql-agg-011", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "t(x) contains 100, 100, 200, NULL. What does this return?",
    code: "SELECT SUM(x), SUM(DISTINCT x), COUNT(DISTINCT x), AVG(DISTINCT x) FROM t;",
    options: ["400, 300, 2, 150", "400, 300, 3, 100", "400, 400, 2, 133.33", "300, 300, 2, 150"],
    answer: 0,
    explanation: "SUM(x) = 100 + 100 + 200 = 400. DISTINCT inside an aggregate removes duplicates before aggregating: {100, 200} → sum 300, count 2, average 150. NULL is ignored throughout.",
    optionExplanations: ["Correct.", "COUNT(DISTINCT) ignores NULL, giving 2.", "DISTINCT removes the duplicate 100.", "SUM(x) includes both 100s."]
  },
  {
    id: "sql-agg-012", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "On the emp table (HR salaries 3000, 5000; IT 7000, 9000, 6000; NULL dept 4000), what does this return for IT?",
    code: "SELECT dept,\n       SUM(CASE WHEN salary > 6500 THEN 1 ELSE 0 END) AS high,\n       COUNT(*) AS total\nFROM emp GROUP BY dept;",
    options: ["high 3, total 3", "high 2, total 2", "high 1, total 3", "high 2, total 3"],
    answer: 3,
    explanation: "Conditional aggregation puts a CASE inside an aggregate to count or sum only matching rows while still producing one row per group. In IT, 7000 and 9000 exceed 6500; 6000 doesn't. It's the standard trick for pivots and multiple counts in one pass.",
    optionExplanations: ["6000 isn't greater than 6500.", "COUNT(*) still counts all 3 IT rows.", "Two salaries exceed 6500.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-agg-013", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "In PostgreSQL, what does the FILTER clause do here?",
    code: "SELECT COUNT(*) FILTER (WHERE bonus IS NOT NULL) AS with_bonus,\n       COUNT(*) AS everyone\nFROM emp;",
    options: ["It filters the whole query like WHERE", "It restricts the rows fed into that one aggregate only; the other aggregates still see all rows", "It's a syntax error", "It removes NULL groups"],
    answer: 1,
    explanation: "`agg(...) FILTER (WHERE cond)` (SQL:2003, supported by PostgreSQL and SQLite) applies a condition per aggregate, a cleaner alternative to SUM(CASE WHEN ... THEN 1 ELSE 0 END). MySQL doesn't support FILTER.",
    optionExplanations: ["Only the attached aggregate is filtered.", "Correct.", "It's valid PostgreSQL syntax.", "It's unrelated to grouping."]
  },
  {
    id: "sql-agg-014", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "With bonus values NULL, 500, NULL, 1000, 200, NULL (6 rows), what does this return?",
    code: "SELECT ROUND(AVG(COALESCE(bonus, 0)), 2) AS a1,\n       ROUND(AVG(bonus), 2)              AS a2\nFROM emp;",
    options: ["566.67, 566.67", "283.33, 566.67", "283.33, 283.33", "566.67, 283.33"],
    answer: 1,
    explanation: "COALESCE turns the three NULLs into 0, so a1 = 1700 / 6 = 283.33. AVG(bonus) ignores NULLs: 1700 / 3 = 566.67. Decide which semantics the business question needs: 'average bonus among those who got one' vs 'average per employee'.",
    optionExplanations: ["COALESCE changes the denominator to 6.", "Correct.", "AVG(bonus) skips NULLs.", "Reversed."]
  },
  {
    id: "sql-agg-015", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "What happens with this query?",
    code: "SELECT dept FROM emp WHERE COUNT(*) > 1 GROUP BY dept;",
    options: ["It returns departments with more than one employee", "Error: aggregate functions are not allowed in WHERE", "It returns all departments", "It returns nothing"],
    answer: 1,
    explanation: "WHERE is evaluated per row, before any groups exist, so aggregates can't appear there. Group-level conditions belong in HAVING: `GROUP BY dept HAVING COUNT(*) > 1`.",
    optionExplanations: ["That's what the HAVING version would do.", "Correct.", "It fails rather than returning rows.", "It's an error, not an empty result."]
  },
  {
    id: "sql-agg-016", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "emp has 6 rows. What does this return?",
    code: "SELECT COUNT(*) FROM emp HAVING COUNT(*) > 10;",
    options: ["One row containing 6", "Zero rows", "One row containing 0", "Error: HAVING requires GROUP BY"],
    answer: 1,
    explanation: "HAVING without GROUP BY treats the whole table as one group. The aggregate query would produce one row (6), but HAVING COUNT(*) > 10 is false for that group, so it is removed, leaving zero rows.",
    optionExplanations: ["The single group fails the HAVING condition.", "Correct.", "The group isn't replaced; it's removed.", "HAVING is allowed without GROUP BY."]
  },
  {
    id: "sql-agg-017", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "On the emp table (HR: 3000 + 5000, IT: 7000 + 9000 + 6000, NULL dept: 4000), what is the FIRST row returned?",
    code: "SELECT dept, SUM(salary) AS total\nFROM emp\nGROUP BY dept\nORDER BY SUM(salary) DESC;",
    options: ["HR, 8000", "NULL, 4000", "IT, 22000", "IT, 9000"],
    answer: 2,
    explanation: "Each group's SUM is computed: HR 8000, IT 22000, NULL 4000. Ordering by the aggregate descending puts IT first. You can order by an aggregate expression or its alias.",
    optionExplanations: ["HR's total is lower than IT's.", "That's the smallest total.", "Correct.", "SUM adds all IT salaries."]
  },
  {
    id: "sql-agg-018", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "How many rows does this return on the emp table (dept values HR, IT and NULL)?",
    code: "SELECT dept, SUM(salary)\nFROM emp\nGROUP BY ROLLUP (dept);",
    options: ["3", "4", "6", "1"],
    answer: 1,
    explanation: "ROLLUP(dept) produces the normal per-dept groups (3, including the NULL dept) plus a grand-total row where dept is shown as NULL. Use GROUPING(dept) to tell the super-aggregate NULL from a real NULL dept. MySQL writes it as `GROUP BY dept WITH ROLLUP`.",
    optionExplanations: ["ROLLUP adds a grand-total row.", "Correct.", "Rows are aggregated.", "The per-group rows are kept too."]
  },
  {
    id: "sql-agg-019", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "hard", type: "query",
    question: "How many grouping sets does `GROUP BY CUBE (region, product)` evaluate?",
    code: "SELECT region, product, SUM(sales)\nFROM sales\nGROUP BY CUBE (region, product);",
    options: ["2", "3", "4", "1"],
    answer: 2,
    explanation: "CUBE(a, b) generates every combination of the listed columns: (region, product), (region), (product) and () — 2² = 4 grouping sets. ROLLUP(a, b) generates only the hierarchical prefixes: (a, b), (a), () — 3 sets. GROUPING SETS lets you list exactly the ones you want.",
    optionExplanations: ["CUBE includes subtotals and a grand total.", "That's ROLLUP's count.", "Correct: 2^n sets for n columns.", "Many grouping levels are produced."]
  },
  {
    id: "sql-agg-020", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "On the emp table, what is HR's value in this PostgreSQL query?",
    code: "SELECT dept, STRING_AGG(name, ',' ORDER BY name) AS people\nFROM emp\nGROUP BY dept;",
    options: ["'A,B'", "'A'", "'AB'", "['A', 'B']"],
    answer: 0,
    explanation: "STRING_AGG (PostgreSQL, SQL Server) concatenates a group's values with a separator, optionally ordered. MySQL's equivalent is GROUP_CONCAT(name ORDER BY name SEPARATOR ','). It returns text, not an array (PostgreSQL's ARRAY_AGG returns an array).",
    optionExplanations: ["Correct.", "HR has two employees.", "The separator ',' is inserted.", "STRING_AGG returns a string."]
  },
  {
    id: "sql-agg-021", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "In PostgreSQL, t(x INT) contains 1 and 2. What does this return?",
    code: "SELECT AVG(x), SUM(x) / COUNT(x) FROM t;",
    options: ["1.5, 1.5", "1, 1", "1.5000000000000000, 1", "2, 1"],
    answer: 2,
    explanation: "PostgreSQL's AVG of an integer column returns NUMERIC, so it keeps the fraction (1.5). But SUM(int) / COUNT(...) divides two integers (bigint), which truncates to 1. Hand-computed averages are a common source of silent errors; cast with `SUM(x)::numeric / COUNT(x)`.",
    optionExplanations: ["The manual division is integer division.", "AVG doesn't truncate.", "Correct.", "Neither expression rounds up to 2."],
    tags: ["trap"]
  },
  {
    id: "sql-agg-022", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "hard", type: "query",
    question: "What does this return on the emp table (HR 3000/5000, IT 7000/9000/6000, NULL dept 4000)?",
    code: "SELECT dept, COUNT(*) AS n\nFROM emp\nWHERE salary > 4500\nGROUP BY dept\nHAVING COUNT(*) >= 2;",
    options: ["HR 2 and IT 3", "IT 3 and NULL 1", "IT 3 only", "No rows"],
    answer: 2,
    explanation: "WHERE runs first, keeping 5000 (HR), 7000/9000/6000 (IT); 3000 and 4000 are removed. Groups: HR → 1 row, IT → 3 rows. HAVING keeps groups with at least 2 rows: IT only.",
    optionExplanations: ["HR has only one row left after WHERE.", "The NULL-dept row (4000) is removed by WHERE.", "Correct.", "IT satisfies both conditions."]
  },
  {
    id: "sql-agg-023", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "hard", type: "query",
    question: "For the IT group (C bonus NULL, D 1000, E 200) and the NULL-dept group (F bonus NULL), what does this return?",
    code: "SELECT dept, COUNT(*), COUNT(bonus), AVG(bonus)\nFROM emp GROUP BY dept;",
    options: ["IT: 3, 2, 600; NULL: 1, 0, NULL", "IT: 3, 3, 400; NULL: 1, 1, 0", "IT: 2, 2, 600; NULL: 0, 0, NULL", "IT: 3, 2, 400; NULL: 1, 0, 0"],
    answer: 0,
    explanation: "COUNT(*) counts rows; COUNT(bonus) counts non-NULL bonuses; AVG(bonus) averages only non-NULL values ((1000 + 200) / 2 = 600). For the group whose bonuses are all NULL, COUNT(bonus) is 0 and AVG is NULL.",
    optionExplanations: ["Correct.", "COUNT(bonus) skips the NULL, and the average uses 2 values.", "COUNT(*) counts all rows, including those with NULL bonus.", "AVG ignores NULLs (600), and AVG of all-NULLs is NULL."]
  },
  {
    id: "sql-agg-024", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "hard", type: "query",
    question: "How many rows does each query return?",
    code: "Q1: SELECT COUNT(*) FROM emp WHERE 1 = 0;\nQ2: SELECT dept, COUNT(*) FROM emp WHERE 1 = 0 GROUP BY dept;",
    options: ["Q1: 1 row (0); Q2: 0 rows", "Q1: 0 rows; Q2: 0 rows", "Q1: 1 row (0); Q2: 1 row (NULL, 0)", "Q1: 1 row (NULL); Q2: 0 rows"],
    answer: 0,
    explanation: "An aggregate WITHOUT GROUP BY always yields exactly one row (here COUNT = 0). With GROUP BY, there's one row per group, and no input rows means no groups, so zero rows. This matters when an application expects a 0 for empty categories.",
    optionExplanations: ["Correct.", "The ungrouped aggregate still returns a row.", "No groups exist when there are no rows.", "COUNT of nothing is 0, not NULL."],
    tags: ["trap"]
  },
  {
    id: "sql-agg-025", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "hard", type: "query",
    question: "What does this return on the emp table (HR: 2 employees, IT: 3, NULL dept: 1)?",
    code: "SELECT COUNT(*)\nFROM (SELECT dept FROM emp GROUP BY dept HAVING COUNT(*) > 1) t;",
    options: ["5", "1", "3", "2"],
    answer: 3,
    explanation: "Aggregates can't be nested directly (COUNT(COUNT(*)) is invalid), so a derived table computes the qualifying groups first: HR and IT. The outer query counts those 2 rows. The same pattern answers 'max of averages' etc.",
    optionExplanations: ["The outer COUNT counts groups, not employees.", "Two departments qualify.", "The NULL-dept group has only 1 row and is excluded.", "Correct."]
  },
  {
    id: "sql-agg-026", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "hard", type: "query",
    question: "salary values: 3000, 5000, 7000, 9000, 6000, 4000 (total 34000); bonus: NULL, 500, NULL, 1000, 200, NULL (total 1700). What does this return?",
    code: "SELECT SUM(salary + bonus) AS s1,\n       SUM(salary) + SUM(bonus) AS s2\nFROM emp;",
    options: ["35700, 35700", "21700, 35700", "35700, 21700", "NULL, 35700"],
    answer: 1,
    explanation: "salary + bonus is NULL for rows with a NULL bonus, and SUM skips those rows entirely, losing their salaries: 5500 + 10000 + 6200 = 21700. Summing columns separately loses nothing: 34000 + 1700 = 35700. Use SUM(salary + COALESCE(bonus, 0)).",
    optionExplanations: ["Row-level NULL arithmetic drops whole rows from s1.", "Correct.", "Reversed.", "SUM skips NULL values rather than returning NULL."],
    tags: ["trap"]
  },
  {
    id: "sql-agg-027", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "concept",
    question: "Is there a difference in result between COUNT(*), COUNT(1) and COUNT(id) where id is the NOT NULL primary key?",
    options: ["COUNT(1) counts only the first row", "COUNT(*) skips NULL rows", "No: all three count every row (COUNT(1) counts a non-NULL constant; id can't be NULL)", "COUNT(id) is always much faster"],
    answer: 2,
    explanation: "COUNT(expr) counts rows where expr is not NULL. A constant 1 and a NOT NULL column are never NULL, so all three equal the row count, and modern optimisers treat them the same. The difference only appears with nullable columns.",
    optionExplanations: ["1 is just a non-NULL expression evaluated per row.", "COUNT(*) counts all rows.", "Correct.", "Optimisers produce the same plan."]
  },
  {
    id: "sql-agg-028", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "concept",
    question: "Why does `SELECT dept, MAX(AVG(salary)) FROM emp GROUP BY dept` fail, and how do you find the highest department average?",
    options: ["MAX can't take numbers", "It works only with HAVING", "AVG must come before GROUP BY", "Aggregates can't be nested in the same query level; compute averages in a subquery/CTE and take MAX (or ORDER BY avg DESC LIMIT 1) outside"],
    answer: 3,
    explanation: "Each query level aggregates once. Compute `SELECT dept, AVG(salary) AS a FROM emp GROUP BY dept` first, then `SELECT MAX(a) FROM (...) t`, or order the grouped result by the average and take the first row (watch for ties).",
    optionExplanations: ["MAX works on numbers.", "HAVING doesn't allow nested aggregates either.", "Clause order isn't the issue.", "Correct."]
  },
  {
    id: "sql-agg-029", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "hard", type: "query",
    question: "What does this return on the emp table (HR 3000/5000, IT 7000/9000/6000, NULL dept 4000)?",
    code: "SELECT dept\nFROM emp\nGROUP BY dept\nHAVING MAX(salary) - MIN(salary) > 1500\nORDER BY dept;",
    options: ["HR, IT", "IT only", "HR only", "HR, IT, NULL"],
    answer: 0,
    explanation: "HAVING can use any aggregate expression. HR's range is 5000 − 3000 = 2000 and IT's is 9000 − 6000 = 3000, both > 1500. The NULL-dept group has one row, so its range is 0.",
    optionExplanations: ["Correct.", "HR's range of 2000 also exceeds 1500.", "IT's range is 3000.", "A single-row group has range 0."]
  },
  {
    id: "sql-agg-030", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "concept",
    question: "Are `SELECT DISTINCT dept FROM emp` and `SELECT dept FROM emp GROUP BY dept` equivalent?",
    options: ["No: GROUP BY returns duplicates", "Yes: both return each distinct dept once (GROUP BY additionally lets you compute aggregates per group)", "No: DISTINCT ignores NULL", "No: GROUP BY sorts the output by definition"],
    answer: 1,
    explanation: "Without aggregates, GROUP BY on a column and DISTINCT on the same column produce the same set of rows, and optimisers often execute them identically. Neither guarantees ordering; add ORDER BY if you need it.",
    optionExplanations: ["GROUP BY yields one row per group.", "Correct.", "DISTINCT keeps one NULL.", "Output order is never guaranteed without ORDER BY."]
  },
  {
    id: "sql-agg-031", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "hard", type: "query",
    question: "emp has 6 rows; IT has 3 of them. What does this return for IT (PostgreSQL)?",
    code: "SELECT dept,\n       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM emp), 1) AS pct\nFROM emp\nGROUP BY dept;",
    options: ["50.0", "0", "0.5", "3.0"],
    answer: 0,
    explanation: "The scalar subquery gives the total (6). Multiplying by 100.0 first makes the arithmetic numeric, so 300.0 / 6 = 50.0. Writing 100 * COUNT(*) / total with integers would still work here, but COUNT(*) / total * 100 would truncate to 0.",
    optionExplanations: ["Correct.", "100.0 forces decimal division, so nothing truncates.", "The value is multiplied by 100.", "pct is 3 / 6 as a percentage."]
  },
  {
    id: "sql-agg-032", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "hard", type: "query",
    question: "t(x): 2, 2, 4. What does this return?",
    code: "SELECT ROUND(AVG(x), 2), AVG(DISTINCT x), MAX(x) - MIN(DISTINCT x) FROM t;",
    options: ["2.67, 2.67, 2", "3.00, 3, 2", "2.67, 3, 2", "2.67, 3, 0"],
    answer: 2,
    explanation: "AVG over all values: 8 / 3 = 2.67. AVG(DISTINCT) averages {2, 4} = 3. DISTINCT doesn't change MIN or MAX, so the range is 4 − 2 = 2.",
    optionExplanations: ["DISTINCT removes the duplicate before averaging.", "AVG(x) counts the duplicate 2 twice.", "Correct.", "MAX − MIN is 2."]
  },
  {
    id: "sql-agg-033", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "easy", type: "query",
    question: "With bonus values NULL, 500, NULL, 1000, 200, NULL, what does this return?",
    code: "SELECT MAX(bonus), MIN(bonus), COUNT(bonus) FROM emp;",
    options: ["1000, 200, 3", "1000, NULL, 6", "NULL, NULL, 3", "1000, 200, 6"],
    answer: 0,
    explanation: "MIN, MAX and COUNT(column) all ignore NULLs, so the min is 200 (NULL is not 'smaller'), the max is 1000, and 3 values are counted.",
    optionExplanations: ["Correct.", "NULL is ignored, not treated as a minimum.", "There are non-NULL values.", "COUNT(bonus) counts only non-NULL values."]
  },
  {
    id: "sql-agg-034", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "medium", type: "query",
    question: "What does this return (PostgreSQL)?",
    code: "SELECT salary > 5000 AS high, COUNT(*)\nFROM emp       -- salaries 3000, 5000, 7000, 9000, 6000, 4000\nGROUP BY salary > 5000\nORDER BY high;",
    options: ["false 4, true 2", "false 2, true 4", "false 3, true 3", "true 3, false 3"],
    answer: 2,
    explanation: "You can group by any expression. salary > 5000 is false for 3000, 5000, 4000 (5000 isn't strictly greater) and true for 7000, 9000, 6000. Booleans sort false before true.",
    optionExplanations: ["6000 is > 5000.", "5000 isn't > 5000, so it's in the false group.", "Correct.", "ORDER BY high puts false first."]
  },
  {
    id: "sql-agg-035", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "hard", type: "query",
    question: "In PostgreSQL, what happens with this query?",
    code: "SELECT dept, COUNT(*)\nFROM emp\nGROUP BY dept\nHAVING salary > 5000;",
    options: ["Departments with any salary above 5000", "Error: column salary must appear in GROUP BY or be used in an aggregate", "Departments where all salaries exceed 5000", "It behaves like WHERE salary > 5000"],
    answer: 1,
    explanation: "HAVING is evaluated per group, so it can only reference grouping columns or aggregates. salary has many values per group. Use WHERE salary > 5000 (row filter) or an aggregate such as HAVING MAX(salary) > 5000 / MIN(salary) > 5000.",
    optionExplanations: ["That needs HAVING MAX(salary) > 5000.", "Correct.", "That needs HAVING MIN(salary) > 5000.", "HAVING doesn't fall back to row-level filtering."]
  },
  {
    id: "sql-agg-036", subject: "sql", subtopic: "Aggregation & GROUP BY", difficulty: "easy", type: "query",
    question: "What does this return on the emp table (6 rows, salaries totalling 34000)?",
    code: "SELECT COUNT(*) AS n, SUM(salary) AS total, ROUND(AVG(salary), 2) AS avg_sal FROM emp;",
    options: ["6, 34000, 5666.67", "6, 34000, 6800.00", "1, 34000, 5666.67", "6, 5666.67, 34000"],
    answer: 0,
    explanation: "Without GROUP BY, aggregates summarise the entire table into one row: 6 rows, total 34000, average 34000 / 6 = 5666.67.",
    optionExplanations: ["Correct.", "The average divides by all 6 salaries.", "COUNT(*) is the number of rows (6).", "The columns are in the order n, total, avg."]
  }
);
