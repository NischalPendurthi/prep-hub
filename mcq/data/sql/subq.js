/* SQL / DBMS — Subqueries & Set Operations */
window.QUESTIONS.push(
  {
    id: "sql-subq-001", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "easy", type: "query",
    question: "How many rows does this return?",
    code: "-- emp(id, name, dept, salary)\n-- 1 | A | HR | 3000\n-- 2 | B | HR | 5000\n-- 3 | C | IT | 7000\n-- 4 | D | IT | 9000\n-- 5 | E | IT | 6000\nSELECT name FROM emp\nWHERE salary > (SELECT AVG(salary) FROM emp);",
    options: ["1", "5", "3", "2"],
    answer: 3,
    explanation: "The scalar subquery returns a single value, the overall average (30000 / 5 = 6000). Only C (7000) and D (9000) are strictly greater; E equals the average.",
    optionExplanations: ["C also exceeds 6000.", "The filter removes below-average salaries.", "E's 6000 isn't greater than 6000.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-subq-002", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "easy", type: "query",
    question: "a(x): 1, 2, 2, 3. b(x): 2, 3, 4. How many rows does each query return?",
    code: "Q1: SELECT x FROM a UNION     SELECT x FROM b;\nQ2: SELECT x FROM a UNION ALL SELECT x FROM b;",
    options: ["Q1: 4, Q2: 7", "Q1: 5, Q2: 7", "Q1: 7, Q2: 4", "Q1: 4, Q2: 4"],
    answer: 0,
    explanation: "UNION removes duplicates across the whole combined result: {1, 2, 3, 4} → 4 rows. UNION ALL simply appends, keeping all 4 + 3 = 7 rows. UNION ALL is faster because it skips the sort/hash needed to deduplicate.",
    optionExplanations: ["Correct.", "UNION also removes the duplicate 2 within a.", "Reversed.", "UNION ALL keeps duplicates."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-subq-003", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "easy", type: "query",
    question: "Which query returns customers who have placed at least one order?",
    code: "-- customers(id, name), orders(id, cust_id)",
    options: ["SELECT name FROM customers WHERE id IN (SELECT cust_id FROM orders);", "SELECT name FROM customers WHERE id = (SELECT cust_id FROM orders);", "SELECT name FROM customers WHERE id NOT IN (SELECT cust_id FROM orders);", "SELECT name FROM customers, orders;"],
    answer: 0,
    explanation: "`IN (subquery)` checks membership in the set of values the subquery returns. Using `=` requires the subquery to return at most one row (otherwise it errors). NOT IN gives the opposite set (and has a NULL trap). The comma join is a cross product.",
    optionExplanations: ["Correct.", "= with a multi-row subquery raises an error.", "That finds customers WITHOUT orders.", "That pairs every customer with every order."]
  },
  {
    id: "sql-subq-004", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "easy", type: "concept",
    question: "When is `EXISTS (subquery)` TRUE?",
    options: ["When the subquery returns a non-NULL value", "When the subquery returns at least one row, regardless of the values in it", "When the subquery returns exactly one row", "When the subquery's first column is TRUE"],
    answer: 1,
    explanation: "EXISTS only checks for the presence of rows; the select list is irrelevant (SELECT 1, SELECT *, even SELECT NULL all behave the same). The database can stop at the first matching row. It's never UNKNOWN, unlike IN with NULLs.",
    optionExplanations: ["Even a row containing only NULL counts.", "Correct.", "Any number of rows ≥ 1 makes it TRUE.", "The values aren't inspected."]
  },
  {
    id: "sql-subq-005", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "easy", type: "query",
    question: "a(x): 1, 2, 2, 3. b(x): 2, 3, 4. How many rows does each return?",
    code: "Q1: SELECT x FROM a INTERSECT SELECT x FROM b;\nQ2: SELECT x FROM a EXCEPT    SELECT x FROM b;",
    options: ["Q1: 2, Q2: 1", "Q1: 3, Q2: 1", "Q1: 2, Q2: 2", "Q1: 1, Q2: 2"],
    answer: 0,
    explanation: "INTERSECT returns distinct values present in both: {2, 3}. EXCEPT returns distinct values in the first but not the second: {1}. Like UNION, both remove duplicates unless you use the ALL variants. Oracle calls EXCEPT 'MINUS'.",
    optionExplanations: ["Correct.", "The duplicate 2 is removed by INTERSECT.", "Only 1 is in a but not b.", "Both 2 and 3 are common."]
  },
  {
    id: "sql-subq-006", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "What happens with this query on the emp table (2 HR employees)?",
    code: "SELECT name FROM emp\nWHERE salary = (SELECT salary FROM emp WHERE dept = 'HR');",
    options: ["Returns HR employees", "Returns the first HR salary match", "Returns no rows", "Error: more than one row returned by a subquery used as an expression"],
    answer: 3,
    explanation: "A subquery used with =, <, > etc. must be SCALAR (at most one row, one column). Two HR rows make it fail at runtime. Use IN (or = ANY) for multiple values, or an aggregate like MAX(salary) to guarantee one row.",
    optionExplanations: ["The subquery isn't scalar, so it errors.", "SQL doesn't pick a row arbitrarily.", "It raises an error rather than returning nothing.", "Correct."]
  },
  {
    id: "sql-subq-007", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "How many rows does this correlated subquery return? (HR: A 3000, B 5000; IT: C 7000, D 9000, E 6000)",
    code: "SELECT name FROM emp e\nWHERE salary > (SELECT AVG(salary)\n                FROM emp x\n                WHERE x.dept = e.dept);",
    options: ["1", "4", "3", "2"],
    answer: 3,
    explanation: "A correlated subquery references the outer row (e.dept), so it is (logically) evaluated per outer row. HR's average is 4000 → B qualifies. IT's average is 22000 / 3 ≈ 7333.33 → only D (9000) qualifies. 2 rows.",
    optionExplanations: ["One employee qualifies in each department.", "Most employees are at or below their department average.", "C's 7000 is below IT's average of 7333.33.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-subq-008", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "customers: ids 1, 2, 3. orders.cust_id values: 1, 1, NULL. How many rows does each query return?",
    code: "Q1: SELECT id FROM customers\n    WHERE id NOT IN (SELECT cust_id FROM orders);\nQ2: SELECT id FROM customers c\n    WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.cust_id = c.id);",
    options: ["Q1: 2, Q2: 2", "Q1: 0, Q2: 0", "Q1: 2, Q2: 0", "Q1: 0, Q2: 2"],
    answer: 3,
    explanation: "Because the subquery returns a NULL, `id NOT IN (1, 1, NULL)` is never TRUE (it's FALSE or UNKNOWN), so Q1 returns nothing. NOT EXISTS checks for matching rows and isn't affected by NULLs, correctly returning customers 2 and 3. Prefer NOT EXISTS for anti-joins.",
    optionExplanations: ["The NULL in the subquery breaks NOT IN.", "NOT EXISTS works correctly here.", "Reversed.", "Correct."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "sql-subq-009", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "a(x): 1, 2, 2, 3. b(x): 2. How many rows does each query return (PostgreSQL)?",
    code: "Q1: SELECT x FROM a EXCEPT     SELECT x FROM b;\nQ2: SELECT x FROM a EXCEPT ALL SELECT x FROM b;",
    options: ["Q1: 2, Q2: 3", "Q1: 3, Q2: 3", "Q1: 2, Q2: 2", "Q1: 1, Q2: 3"],
    answer: 0,
    explanation: "EXCEPT works on distinct values: {1, 2, 3} − {2} = {1, 3}. EXCEPT ALL works on multisets: each occurrence in b cancels one occurrence in a, so one of the two 2s survives: 1, 2, 3 → 3 rows.",
    optionExplanations: ["Correct.", "Plain EXCEPT removes 2 entirely.", "EXCEPT ALL keeps the second 2.", "1 and 3 both survive plain EXCEPT."]
  },
  {
    id: "sql-subq-010", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "concept",
    question: "Which rule applies to UNION, INTERSECT and EXCEPT?",
    options: ["The queries must select from the same table", "Each query must return the same number of columns with compatible types; the result's column names come from the FIRST query", "Column names must be identical in every query", "Only one column is allowed"],
    answer: 1,
    explanation: "Set operations combine rows positionally: column 1 with column 1, and so on. Types must be compatible (implicitly convertible), names are taken from the first SELECT, and an ORDER BY at the end refers to those names.",
    optionExplanations: ["Any queries can be combined.", "Correct.", "Names are matched by position, not by name.", "Multiple columns are allowed."]
  },
  {
    id: "sql-subq-011", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "What does the ORDER BY apply to in this query?",
    code: "SELECT name, salary FROM emp WHERE dept = 'HR'\nUNION ALL\nSELECT name, salary FROM emp WHERE dept = 'IT'\nORDER BY salary DESC;",
    options: ["Only the IT part", "The entire combined result", "Only the HR part", "It's a syntax error"],
    answer: 1,
    explanation: "A trailing ORDER BY (and LIMIT) applies to the whole set-operation result. To sort or limit an individual branch, wrap it in parentheses or a subquery. Note the order of UNION ALL output isn't guaranteed without ORDER BY.",
    optionExplanations: ["It applies to the combined result.", "Correct.", "It applies to the combined result.", "This is valid syntax."]
  },
  {
    id: "sql-subq-012", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "How many rows does this return? (HR salaries 3000, 5000; IT 7000, 9000, 6000)",
    code: "SELECT name FROM emp\nWHERE salary > ALL (SELECT salary FROM emp WHERE dept = 'HR');",
    options: ["1", "2", "3", "5"],
    answer: 2,
    explanation: "`> ALL (set)` means greater than every value, i.e. greater than the maximum (5000): C, D, E. `> ANY (set)` (or SOME) means greater than at least one value, i.e. greater than the minimum (3000).",
    optionExplanations: ["All IT employees earn more than 5000.", "E's 6000 also exceeds 5000.", "Correct.", "HR employees don't exceed their own maximum."]
  },
  {
    id: "sql-subq-013", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "hard", type: "query",
    question: "There are no employees in dept 'Sales'. How many rows does each query return from the 5-row emp table?",
    code: "Q1: SELECT * FROM emp WHERE salary > ALL (SELECT salary FROM emp WHERE dept = 'Sales');\nQ2: SELECT * FROM emp WHERE salary > ANY (SELECT salary FROM emp WHERE dept = 'Sales');",
    options: ["Q1: 0, Q2: 0", "Q1: 5, Q2: 0", "Q1: 0, Q2: 5", "Q1: 5, Q2: 5"],
    answer: 1,
    explanation: "Over an EMPTY set, ALL is vacuously TRUE (there's no value that the salary fails to exceed), so every row is returned. ANY over an empty set is FALSE (there's no value to exceed). Note: `salary > (SELECT MAX(...))` would compare with NULL and return nothing, so `> ALL` and `> MAX` differ here.",
    optionExplanations: ["ALL over an empty set is TRUE.", "Correct.", "Reversed.", "ANY over an empty set is FALSE."],
    tags: ["trap"]
  },
  {
    id: "sql-subq-014", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "What does this return for department HR (which has 2 employees)?",
    code: "SELECT d.name,\n       (SELECT COUNT(*) FROM emp e WHERE e.dept = d.name) AS headcount\nFROM dept d;",
    options: ["HR, 2", "HR, 5", "HR, NULL", "Error: subqueries aren't allowed in SELECT"],
    answer: 0,
    explanation: "A correlated scalar subquery in the SELECT list computes one value per outer row; here it counts employees in that department. COUNT(*) returns 0 (not NULL) for a department with no employees. A LEFT JOIN + GROUP BY is an equivalent formulation.",
    optionExplanations: ["Correct.", "The subquery is correlated to d.name.", "COUNT never returns NULL.", "Scalar subqueries are allowed in SELECT."]
  },
  {
    id: "sql-subq-015", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "What does this return? (HR total 8000, IT total 22000)",
    code: "SELECT AVG(total) AS avg_dept_total\nFROM (SELECT dept, SUM(salary) AS total\n      FROM emp GROUP BY dept) AS t;",
    options: ["6000", "Error: nested aggregates", "30000", "15000"],
    answer: 3,
    explanation: "A subquery in FROM (a derived table) is computed first and treated as a table; it needs an alias in MySQL and in PostgreSQL before 16. The outer query averages the department totals: (8000 + 22000) / 2 = 15000. This is how you aggregate aggregates.",
    optionExplanations: ["6000 is the per-employee average.", "The aggregates are in different query levels, so it's valid.", "That's the overall sum.", "Correct."]
  },
  {
    id: "sql-subq-016", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "concept",
    question: "Which statement about IN vs EXISTS is most accurate for modern optimisers (PostgreSQL, MySQL 8)?",
    options: ["IN is always faster", "EXISTS can't use indexes", "For non-negated forms, both are usually turned into the same semi-join plan; the important difference is NOT IN vs NOT EXISTS with NULLs", "IN works only with constants"],
    answer: 2,
    explanation: "Old advice ('EXISTS is faster for big subqueries, IN for small') came from naïve execution. Today both are rewritten into semi-joins. The real semantic difference is with negation: NOT IN returns nothing if the subquery yields a NULL, while NOT EXISTS behaves intuitively.",
    optionExplanations: ["Neither is universally faster.", "EXISTS subqueries use indexes on the correlated columns.", "Correct.", "IN accepts subqueries too."]
  },
  {
    id: "sql-subq-017", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "Which query is equivalent to this correlated subquery?",
    code: "SELECT d.name FROM dept d\nWHERE EXISTS (SELECT 1 FROM emp e WHERE e.dept = d.name AND e.salary > 8000);",
    options: ["SELECT DISTINCT d.name FROM dept d JOIN emp e ON e.dept = d.name WHERE e.salary > 8000;", "SELECT d.name FROM dept d LEFT JOIN emp e ON e.dept = d.name;", "SELECT d.name FROM dept d JOIN emp e ON e.dept = d.name;", "SELECT d.name FROM dept d WHERE d.name IN (SELECT dept FROM emp);"],
    answer: 0,
    explanation: "A semi-join can be rewritten as an inner join with the same condition, but a department with several qualifying employees would appear multiple times, so DISTINCT is needed (or GROUP BY).",
    optionExplanations: ["Correct.", "The salary condition and the matching requirement are missing.", "Without the salary filter and DISTINCT, the result differs.", "The salary condition is missing."]
  },
  {
    id: "sql-subq-018", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "How many rows does this return? (HR: A 3000, B 5000; IT: C 7000, D 9000, E 6000)",
    code: "SELECT name, dept, salary FROM emp\nWHERE (dept, salary) IN (SELECT dept, MAX(salary)\n                        FROM emp GROUP BY dept);",
    options: ["1", "5", "3", "2"],
    answer: 3,
    explanation: "A row-value IN compares pairs: it returns each department's top earner(s): B (HR, 5000) and D (IT, 9000). If two employees tied for a department's maximum, both would be returned. (Row-value IN works in PostgreSQL and MySQL, not SQL Server.)",
    optionExplanations: ["One row per department is returned here.", "Most rows don't match the department maximum.", "Only the maximum in each department matches.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-subq-019", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "hard", type: "query",
    question: "a(x): 1, 1, 2. How many rows does each query return?",
    code: "Q1: SELECT x FROM a UNION SELECT x FROM a;\nQ2: SELECT x FROM a UNION ALL SELECT x FROM a WHERE 1 = 0;",
    options: ["Q1: 2, Q2: 3", "Q1: 6, Q2: 3", "Q1: 3, Q2: 0", "Q1: 2, Q2: 2"],
    answer: 0,
    explanation: "UNION deduplicates the ENTIRE result, including duplicates that came from a single branch, so Q1 is {1, 2}. UNION ALL keeps everything from the first branch (3 rows) plus nothing from the empty second branch. 'SELECT ... UNION SELECT <empty>' is a sneaky way to apply DISTINCT.",
    optionExplanations: ["Correct.", "UNION removes all duplicates.", "UNION ALL keeps a's three rows.", "UNION ALL doesn't remove duplicates."],
    tags: ["trap"]
  },
  {
    id: "sql-subq-020", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "hard", type: "query",
    question: "How many rows does each query return?",
    code: "Q1: SELECT NULL UNION SELECT NULL;\nQ2: SELECT NULL INTERSECT SELECT NULL;",
    options: ["Q1: 2, Q2: 0", "Q1: 1, Q2: 0", "Q1: 1, Q2: 1", "Q1: 2, Q2: 1"],
    answer: 2,
    explanation: "Set operations (like DISTINCT and GROUP BY) treat NULLs as duplicates of each other ('not distinct'), even though NULL = NULL is UNKNOWN in a WHERE clause. So UNION collapses the two NULLs into one row, and INTERSECT finds NULL in both inputs.",
    optionExplanations: ["UNION treats the two NULLs as duplicates.", "INTERSECT also matches NULL with NULL.", "Correct.", "UNION collapses the NULLs."],
    tags: ["trap"]
  },
  {
    id: "sql-subq-021", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "concept",
    question: "Which statement about INTERSECT and EXCEPT support is correct?",
    options: ["They're supported identically by every database", "MySQL has always supported INTERSECT but not UNION", "PostgreSQL has long supported both; MySQL added them in 8.0.31; Oracle calls EXCEPT 'MINUS'", "SQL Server uses MINUS"],
    answer: 2,
    explanation: "Before MySQL 8.0.31, you'd emulate INTERSECT with an inner join/IN and EXCEPT with NOT EXISTS/LEFT JOIN ... IS NULL. Oracle uses MINUS (and supports EXCEPT from 21c). SQL Server uses EXCEPT.",
    optionExplanations: ["Support varies by vendor and version.", "UNION has always been supported in MySQL.", "Correct.", "SQL Server uses EXCEPT."]
  },
  {
    id: "sql-subq-022", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "hard", type: "query",
    question: "Which query finds students who took ALL courses in the courses table?",
    code: "-- students(id), courses(id), enroll(student_id, course_id)",
    options: ["SELECT s.id FROM students s WHERE EXISTS (SELECT 1 FROM enroll e WHERE e.student_id = s.id);", "SELECT s.id FROM students s JOIN courses c ON TRUE;", "SELECT student_id FROM enroll WHERE course_id IN (SELECT id FROM courses);", "SELECT s.id FROM students s WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE NOT EXISTS (SELECT 1 FROM enroll e WHERE e.student_id = s.id AND e.course_id = c.id));"],
    answer: 3,
    explanation: "Relational division via double negation: 'there is no course that this student has not taken'. An alternative is `GROUP BY student_id HAVING COUNT(DISTINCT course_id) = (SELECT COUNT(*) FROM courses)`.",
    optionExplanations: ["That finds students who took at least one course.", "That's a cross join of students and courses.", "That lists students with any enrollment, possibly repeatedly.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-subq-023", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "hard", type: "query",
    question: "How many departments does this return? (overall average salary 6000; HR avg 4000; IT avg 7333.33)",
    code: "SELECT dept, AVG(salary)\nFROM emp\nGROUP BY dept\nHAVING AVG(salary) > (SELECT AVG(salary) FROM emp);",
    options: ["0", "1", "2", "5"],
    answer: 1,
    explanation: "A scalar subquery can be used in HAVING to compare each group's aggregate with a global value. Only IT's average (7333.33) exceeds the overall 6000.",
    optionExplanations: ["IT qualifies.", "Correct.", "HR's average is below 6000.", "HAVING operates on the 2 department groups."]
  },
  {
    id: "sql-subq-024", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "hard", type: "query",
    question: "How many rows does this return? (HR: A 3000, B 5000; IT: C 7000, D 9000, E 6000)",
    code: "SELECT name FROM emp e\nWHERE 2 > (SELECT COUNT(*) FROM emp x\n           WHERE x.dept = e.dept AND x.salary > e.salary);",
    options: ["2", "3", "4", "5"],
    answer: 2,
    explanation: "For each employee, the subquery counts colleagues in the same department who earn more. Keeping rows where fewer than 2 people earn more yields the TOP 2 earners per department. HR: B (0 above), A (1 above) → both. IT: D (0), C (1), E (2 above → excluded). Total 4 — the classic pre-window-function top-N-per-group solution.",
    optionExplanations: ["Both HR employees qualify.", "C has only one higher earner (D).", "Correct.", "E has two higher earners and is excluded."]
  },
  {
    id: "sql-subq-025", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "hard", type: "query",
    question: "How many rows does this return from the 5-row emp table?",
    code: "SELECT * FROM emp WHERE EXISTS (SELECT NULL);",
    options: ["0", "5", "1", "Error"],
    answer: 1,
    explanation: "SELECT NULL returns ONE row (whose only value is NULL). EXISTS only checks whether a row exists, not its contents, so the condition is TRUE for every outer row and all 5 rows are returned.",
    optionExplanations: ["The subquery does return a row.", "Correct.", "The condition is TRUE for each of the 5 outer rows.", "It's valid SQL."],
    tags: ["trap"]
  },
  {
    id: "sql-subq-026", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "hard", type: "query",
    question: "emp has no employee with id 99. What does this return for each employee row?",
    code: "SELECT name,\n       (SELECT salary FROM emp WHERE id = 99) AS other\nFROM emp;",
    options: ["An error: subquery returned no rows", "No rows at all", "Each name with other = NULL", "Each name with other = 0"],
    answer: 2,
    explanation: "A scalar subquery that returns ZERO rows evaluates to NULL; it's only an error if it returns MORE than one row. So every employee is listed with NULL in the 'other' column.",
    optionExplanations: ["Zero rows yields NULL, not an error.", "The outer query still returns its rows.", "Correct.", "NULL isn't converted to 0."]
  },
  {
    id: "sql-subq-027", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "customers: Ann (3 orders), Raj (1 order), Li (no orders). How many rows does this return?",
    code: "SELECT name FROM customers\nWHERE id IN (SELECT cust_id FROM orders);",
    options: ["4", "3", "2", "1"],
    answer: 2,
    explanation: "IN is a semi-join: each outer row is returned at most once, no matter how many times its id appears in the subquery result. So Ann appears once even though she has 3 orders. A JOIN would return 4 rows.",
    optionExplanations: ["IN doesn't multiply rows like a JOIN does.", "Li has no orders.", "Correct.", "Raj also has an order."]
  },
  {
    id: "sql-subq-028", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "In PostgreSQL, what happens with this query?",
    code: "SELECT 1 AS v\nUNION\nSELECT 'a';",
    options: ["Two rows: 1 and 'a'", "One row: 1", "Error: UNION types integer and text cannot be matched", "Two rows, both converted to text"],
    answer: 2,
    explanation: "Corresponding columns in a set operation must have compatible types. PostgreSQL can't reconcile integer with text without an explicit cast. MySQL is more permissive and would convert both to strings. Cast explicitly: SELECT 1::text UNION SELECT 'a'.",
    optionExplanations: ["PostgreSQL rejects the mismatched types.", "It's an error, not a silent drop.", "Correct.", "PostgreSQL won't implicitly convert here; MySQL would."]
  },
  {
    id: "sql-subq-029", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "hard", type: "concept",
    question: "In PostgreSQL, what does a LATERAL subquery allow that an ordinary subquery in FROM doesn't?",
    options: ["Using window functions", "Referencing columns of tables that appear earlier in the FROM clause, e.g. to fetch the top 3 orders per customer", "Returning more than one column", "Avoiding the need for an alias"],
    answer: 1,
    explanation: "Normally, each FROM item is independent. `FROM customers c CROSS JOIN LATERAL (SELECT * FROM orders o WHERE o.cust_id = c.id ORDER BY amount DESC LIMIT 3) t` runs the subquery per customer row — an elegant top-N-per-group pattern. SQL Server's equivalent is CROSS APPLY / OUTER APPLY.",
    optionExplanations: ["Window functions work in ordinary subqueries too.", "Correct.", "Ordinary derived tables can return many columns.", "LATERAL subqueries still need an alias."]
  },
  {
    id: "sql-subq-030", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "easy", type: "concept",
    question: "Two queries return disjoint result sets (no row can appear in both). Which operator should combine them, and why?",
    options: ["UNION, because it's safer", "UNION ALL, because it skips the unnecessary duplicate-elimination step (sort/hash) and is faster", "INTERSECT", "JOIN"],
    answer: 1,
    explanation: "UNION must compare all rows to remove duplicates, which costs a sort or hash over the whole result. When duplicates are impossible (or wanted), UNION ALL is the right choice. INTERSECT finds common rows; JOIN combines columns, not rows.",
    optionExplanations: ["UNION adds unnecessary work here.", "Correct.", "INTERSECT returns only common rows (none here).", "JOIN combines columns side by side."]
  },
  {
    id: "sql-subq-031", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "hard", type: "query",
    question: "t(x): 1, 2, 3, NULL. How many rows does each query return?",
    code: "Q1: SELECT x FROM t WHERE x NOT IN (SELECT x FROM t WHERE x > 2);\nQ2: SELECT x FROM t WHERE x NOT IN (SELECT x FROM t WHERE x > 2 OR x IS NULL);",
    options: ["Q1: 2, Q2: 0", "Q1: 3, Q2: 2", "Q1: 2, Q2: 2", "Q1: 3, Q2: 0"],
    answer: 0,
    explanation: "Q1's subquery returns {3}: 1 and 2 pass, 3 fails, and the outer NULL gives UNKNOWN → 2 rows. Q2's subquery returns {3, NULL}; every comparison with the NULL is UNKNOWN, so no row can be TRUE → 0 rows.",
    optionExplanations: ["Correct.", "NULL NOT IN (...) is UNKNOWN, so it isn't returned.", "The NULL in Q2's subquery eliminates all rows.", "Both counts are off."],
    tags: ["trap"]
  },
  {
    id: "sql-subq-032", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "medium", type: "query",
    question: "What does this return? (HR: A 3000, B 5000; IT: C 7000, D 9000, E 6000)",
    code: "SELECT name FROM emp\nWHERE salary = (SELECT MAX(salary) FROM emp\n                WHERE salary < (SELECT MAX(salary) FROM emp));",
    options: ["D", "C", "E", "B"],
    answer: 1,
    explanation: "Nested scalar subqueries: the innermost finds the max (9000); the middle finds the max below that (7000), i.e. the second-highest salary; the outer query returns who earns it: C.",
    optionExplanations: ["D has the highest salary, not the second highest.", "Correct.", "6000 is the third highest.", "5000 is the fourth highest."]
  },
  {
    id: "sql-subq-033", subject: "sql", subtopic: "Subqueries & Set Operations", difficulty: "easy", type: "query",
    question: "What is a subquery in the FROM clause usually called, and what does PostgreSQL (before v16) and MySQL require for it?",
    code: "SELECT * FROM (SELECT dept, COUNT(*) AS n FROM emp GROUP BY dept) ???;",
    options: ["A correlated subquery; it needs ORDER BY", "A CTE; it needs WITH", "A scalar subquery; it must return one row", "A derived table (inline view); it must be given an alias"],
    answer: 3,
    explanation: "A derived table acts like a temporary table for the outer query. MySQL and PostgreSQL < 16 require an alias (e.g. `AS t`); PostgreSQL 16+ made it optional. A CTE (WITH clause) is an alternative, often more readable, way to name it.",
    optionExplanations: ["It isn't correlated, and ORDER BY isn't required.", "A CTE is a different construct with similar purpose.", "Derived tables can return many rows.", "Correct."]
  }
);
