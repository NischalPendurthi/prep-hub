/* SQL / DBMS — Joins */
window.QUESTIONS.push(
  {
    id: "sql-joins-001", subject: "sql", subtopic: "Joins", difficulty: "easy", type: "query",
    question: "How many rows does this INNER JOIN return?",
    code: "-- emp(id, name, dept_id)        dept(id, name)\n-- 1 | Asha | 10                10 | HR\n-- 2 | Ben  | 20                20 | IT\n-- 3 | Chen | NULL              30 | Ops\n-- 4 | Dev  | 10\nSELECT e.name, d.name\nFROM emp e\nJOIN dept d ON e.dept_id = d.id;",
    options: ["3", "4", "5", "12"],
    answer: 0,
    explanation: "An INNER JOIN returns only pairs of rows that satisfy the ON condition: Asha–HR, Ben–IT, Dev–HR. Chen's NULL dept_id matches nothing, and Ops has no employees, so both are excluded.",
    optionExplanations: ["Correct.", "Chen has no matching department.", "Unmatched rows from either side are dropped.", "That's the cross join size."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-joins-002", subject: "sql", subtopic: "Joins", difficulty: "easy", type: "query",
    question: "Same emp/dept tables (Chen has dept_id NULL; Ops has no employees). How many rows does this return?",
    code: "SELECT e.name, d.name\nFROM emp e\nLEFT JOIN dept d ON e.dept_id = d.id;",
    options: ["3", "6", "5", "4"],
    answer: 3,
    explanation: "A LEFT (OUTER) JOIN keeps every row of the left table; where no right row matches, the right-side columns are NULL. All 4 employees appear, with Chen paired with NULL. Ops isn't included because it's only on the right.",
    optionExplanations: ["Chen is kept with NULLs.", "Each employee matches at most one department.", "Unmatched RIGHT rows (Ops) aren't kept by a LEFT JOIN.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-joins-003", subject: "sql", subtopic: "Joins", difficulty: "easy", type: "query",
    question: "Same emp/dept tables. How many rows does this return?",
    code: "SELECT e.name, d.name\nFROM emp e\nRIGHT JOIN dept d ON e.dept_id = d.id;",
    options: ["4", "3", "5", "2"],
    answer: 0,
    explanation: "A RIGHT JOIN keeps every row of the right table: HR matches Asha and Dev (2 rows), IT matches Ben (1), Ops matches nobody and appears once with NULL employee columns (1). Total 4. Chen is dropped.",
    optionExplanations: ["Correct.", "Ops is kept with NULLs.", "Chen (unmatched left row) isn't kept.", "HR matches two employees."]
  },
  {
    id: "sql-joins-004", subject: "sql", subtopic: "Joins", difficulty: "easy", type: "query",
    question: "Same emp/dept tables. How many rows does this return?",
    code: "SELECT e.name, d.name\nFROM emp e\nFULL OUTER JOIN dept d ON e.dept_id = d.id;",
    options: ["3", "4", "5", "7"],
    answer: 2,
    explanation: "FULL OUTER JOIN = matched pairs + unmatched left rows + unmatched right rows: 3 matches (Asha–HR, Ben–IT, Dev–HR) + Chen (with NULL dept) + Ops (with NULL employee) = 5.",
    optionExplanations: ["That's just the inner join.", "Both unmatched sides are kept.", "Correct.", "Matched rows aren't duplicated."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-joins-005", subject: "sql", subtopic: "Joins", difficulty: "easy", type: "query",
    question: "emp has 4 rows and dept has 3 rows. How many rows does this return?",
    code: "SELECT * FROM emp CROSS JOIN dept;",
    options: ["7", "4", "12", "3"],
    answer: 2,
    explanation: "A CROSS JOIN is the Cartesian product: every left row paired with every right row, 4 × 3 = 12. Writing `FROM emp, dept` without a join condition has the same effect, which is a common accidental bug.",
    optionExplanations: ["Row counts multiply, not add.", "Every emp row pairs with every dept row.", "Correct.", "Rows are multiplied."]
  },
  {
    id: "sql-joins-006", subject: "sql", subtopic: "Joins", difficulty: "easy", type: "concept",
    question: "What is a self join?",
    options: ["Joining a table to itself using two different aliases, e.g. to relate employees to their managers in the same table", "A join that uses the same column twice", "A join without an ON clause", "A join that only returns the left table"],
    answer: 0,
    explanation: "With `FROM emp e JOIN emp m ON e.manager_id = m.id`, the same table plays two roles. Aliases are mandatory so each column reference is unambiguous. Self joins handle hierarchies, comparing rows within a table and finding pairs.",
    optionExplanations: ["Correct.", "It's about joining the table with itself.", "That's a cross join.", "That's a left semi/anti join pattern."]
  },
  {
    id: "sql-joins-007", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "How many rows does this return?",
    code: "-- t1(k): 1, 1, 2, NULL\n-- t2(k): 1, 1, 1, 2, NULL\nSELECT * FROM t1 JOIN t2 ON t1.k = t2.k;",
    options: ["3", "5", "7", "8"],
    answer: 2,
    explanation: "Joins multiply duplicates: key 1 appears 2 times in t1 and 3 times in t2 → 2 × 3 = 6 rows; key 2 → 1 × 1 = 1 row. NULL = NULL is UNKNOWN, so NULL keys never match. Total 7.",
    optionExplanations: ["Each matching pair produces a row; duplicates multiply.", "Key 1 contributes 2 × 3, not 2 + 3.", "Correct.", "The NULL keys don't match each other."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "sql-joins-008", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "Same t1/t2 as before (t1: 1, 1, 2, NULL; t2: 1, 1, 1, 2, NULL). How many rows does each query return?",
    code: "Q1: SELECT * FROM t1 LEFT JOIN t2 ON t1.k = t2.k;\nQ2: SELECT * FROM t1 FULL OUTER JOIN t2 ON t1.k = t2.k;",
    options: ["Q1: 7, Q2: 7", "Q1: 4, Q2: 5", "Q1: 8, Q2: 8", "Q1: 8, Q2: 9"],
    answer: 3,
    explanation: "The inner part is 7 rows (6 for key 1, 1 for key 2). LEFT JOIN adds t1's unmatched NULL row → 8. FULL OUTER JOIN also adds t2's unmatched NULL row → 9.",
    optionExplanations: ["Unmatched NULL rows are added by outer joins.", "Duplicates multiply in joins.", "The FULL join also keeps t2's NULL row.", "Correct."]
  },
  {
    id: "sql-joins-009", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "Same emp/dept tables (Asha 10, Ben 20, Chen NULL, Dev 10; HR 10, IT 20, Ops 30). How many rows does each query return?",
    code: "Q1: SELECT e.name, d.name FROM emp e\n    LEFT JOIN dept d ON e.dept_id = d.id AND d.name = 'HR';\nQ2: SELECT e.name, d.name FROM emp e\n    LEFT JOIN dept d ON e.dept_id = d.id\n    WHERE d.name = 'HR';",
    options: ["Q1: 4, Q2: 2", "Q1: 2, Q2: 2", "Q1: 4, Q2: 4", "Q1: 2, Q2: 4"],
    answer: 0,
    explanation: "In Q1 the extra condition is part of the join: non-HR employees still appear (LEFT JOIN keeps them) with NULL dept columns → 4 rows. In Q2 the WHERE runs after the join and discards rows where d.name isn't 'HR' (including NULLs), effectively turning the LEFT JOIN into an INNER JOIN → 2 rows.",
    optionExplanations: ["Correct.", "Conditions in ON don't remove left rows.", "The WHERE filter removes non-HR rows.", "Reversed."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "sql-joins-010", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "Which query lists departments that have NO employees (using the emp/dept tables)?",
    code: "-- expected result: Ops",
    options: ["SELECT d.name FROM dept d JOIN emp e ON e.dept_id = d.id WHERE e.id IS NULL;", "SELECT d.name FROM dept d LEFT JOIN emp e ON e.dept_id = d.id WHERE e.id IS NULL;", "SELECT d.name FROM dept d LEFT JOIN emp e ON e.dept_id = d.id WHERE e.dept_id <> d.id;", "SELECT d.name FROM dept d, emp e WHERE e.dept_id IS NULL;"],
    answer: 1,
    explanation: "This is the ANTI-JOIN pattern: LEFT JOIN, then keep rows where a NOT NULL column of the right table (like its primary key) is NULL — meaning no match existed. NOT EXISTS is the equivalent (often clearer) alternative.",
    optionExplanations: ["An inner join never produces NULL e.id, so this returns nothing.", "Correct.", "For unmatched rows e.dept_id is NULL, and NULL <> x is UNKNOWN.", "That's a cross join filtered on Chen; it returns every department."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-joins-011", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "Both tables have columns named `id` and `name`: emp(id, name, dept_id), dept(id, name). What does this return?",
    code: "SELECT * FROM emp NATURAL JOIN dept;",
    options: ["Employees with their departments", "An error: NATURAL JOIN requires a USING clause", "A cross join", "Rows where emp.id = dept.id AND emp.name = dept.name — almost certainly none"],
    answer: 3,
    explanation: "NATURAL JOIN silently joins on ALL columns with the same name. Here that's id and name, not dept_id, so it compares employee ids with department ids and employee names with department names. Schema changes (adding a same-named column) can also silently change results; prefer explicit ON or USING.",
    optionExplanations: ["It doesn't use dept_id at all.", "NATURAL JOIN has no USING clause.", "It's a cross join only when no column names are shared.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "sql-joins-012", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "orders(order_id, cust_id, ...) and customers(cust_id, name). How many cust_id columns appear in the result of this query?",
    code: "SELECT * FROM orders JOIN customers USING (cust_id);",
    options: ["0", "It depends on the number of rows", "2", "1"],
    answer: 3,
    explanation: "USING (col) joins on equality of the named column and merges it into a single output column (listed first with SELECT *). With ON orders.cust_id = customers.cust_id, both columns would appear.",
    optionExplanations: ["The join column is kept once.", "The column count doesn't depend on row count.", "USING merges the duplicate column.", "Correct."]
  },
  {
    id: "sql-joins-013", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "Which grade does each employee get?",
    code: "-- emp(name, salary): Asha 3500, Ben 7200, Chen 5000\n-- grades(grade, low, high): A 6001–10000, B 4001–6000, C 0–4000\nSELECT e.name, g.grade\nFROM emp e\nJOIN grades g ON e.salary BETWEEN g.low AND g.high;",
    options: ["Asha C, Ben A, Chen B", "Asha B, Ben A, Chen C", "Asha C, Ben B, Chen B", "Error: joins require ="],
    answer: 0,
    explanation: "A non-equi join uses any condition, not just equality. Each salary falls into exactly one range: 3500 → C (0–4000), 7200 → A, 5000 → B (4001–6000). Range joins are common for banding, time windows and overlapping intervals.",
    optionExplanations: ["Correct.", "3500 is in the C range.", "7200 falls in grade A.", "ON can contain any boolean condition."]
  },
  {
    id: "sql-joins-014", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "MySQL (up to 8.x) doesn't support FULL OUTER JOIN. Which query emulates `a FULL OUTER JOIN b ON a.k = b.k` without duplicating matched rows?",
    code: "-- tables a(k, ...), b(k, ...)",
    options: ["SELECT * FROM a LEFT JOIN b ON a.k = b.k UNION ALL SELECT * FROM a RIGHT JOIN b ON a.k = b.k;", "SELECT * FROM a JOIN b ON a.k = b.k;", "SELECT * FROM a CROSS JOIN b;", "SELECT * FROM a LEFT JOIN b ON a.k = b.k UNION ALL SELECT * FROM a RIGHT JOIN b ON a.k = b.k WHERE a.k IS NULL;"],
    answer: 3,
    explanation: "Take all rows of the LEFT JOIN (matches + left-only), then add only the right-only rows from the RIGHT JOIN (where the left side is NULL). Using plain UNION instead of the filter would also deduplicate, but it can wrongly collapse genuinely duplicate rows and is slower.",
    optionExplanations: ["UNION ALL of both joins repeats every matched row twice.", "An inner join drops unmatched rows.", "A cross join pairs everything.", "Correct."]
  },
  {
    id: "sql-joins-015", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "What does this return?",
    code: "SELECT e.name, d.name\nFROM emp e, dept d\nWHERE e.dept_id = d.id;",
    options: ["A cross join of all rows", "The same result as an INNER JOIN on e.dept_id = d.id", "A LEFT JOIN", "A syntax error"],
    answer: 1,
    explanation: "Comma-separated tables in FROM form a Cartesian product, and the WHERE condition filters it down to matching pairs: equivalent to an INNER JOIN (implicit join syntax, from SQL-89). Explicit JOIN ... ON is preferred because forgetting the WHERE condition silently creates a cross join.",
    optionExplanations: ["The WHERE clause filters the product.", "Correct.", "Implicit joins can't express outer joins.", "This is valid (older) syntax."]
  },
  {
    id: "sql-joins-016", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "Using the emp/dept tables (HR has 2 employees, IT 1, Ops 0), what does this return for Ops in each column?",
    code: "SELECT d.name, COUNT(*) AS c_star, COUNT(e.id) AS c_emp\nFROM dept d\nLEFT JOIN emp e ON e.dept_id = d.id\nGROUP BY d.name;",
    options: ["c_star 0, c_emp 0", "c_star 1, c_emp 0", "c_star 1, c_emp 1", "Ops doesn't appear"],
    answer: 1,
    explanation: "The LEFT JOIN produces one row for Ops with NULL employee columns. COUNT(*) counts that row (1), while COUNT(e.id) counts non-NULL ids (0). When counting children per parent with a LEFT JOIN, always count a column from the child table.",
    optionExplanations: ["COUNT(*) counts the NULL-extended row.", "Correct.", "e.id is NULL for Ops.", "LEFT JOIN keeps Ops."],
    tags: ["interview-favourite", "trap"]
  },
  {
    id: "sql-joins-017", subject: "sql", subtopic: "Joins", difficulty: "hard", type: "numerical",
    question: "Table A has 3 rows and table B has 4 rows. What are the minimum and maximum possible row counts of A LEFT JOIN B, and of A FULL OUTER JOIN B (equality join on one column)?",
    options: ["LEFT: 3 to 12; FULL: 4 to 12", "LEFT: 0 to 12; FULL: 0 to 12", "LEFT: 3 to 7; FULL: 4 to 7", "LEFT: 4 to 12; FULL: 7 to 12"],
    answer: 0,
    explanation: "Every A row appears at least once in a LEFT JOIN, so the minimum is 3; the maximum is 3 × 4 = 12 when all keys are equal. A FULL JOIN keeps every row of both sides: at least max(3, 4) = 4 (when every A row matches a distinct B row), at most 12 (all keys equal; 12 ≥ 3 + 4, the no-match case).",
    optionExplanations: ["Correct.", "Outer joins can never return fewer rows than the preserved side.", "All-equal keys give 3 × 4 = 12 rows.", "A LEFT JOIN can return as few as 3 rows."]
  },
  {
    id: "sql-joins-018", subject: "sql", subtopic: "Joins", difficulty: "hard", type: "query",
    question: "customers: 1 Ann, 2 Raj, 3 Li. orders: Ann has 3 orders, Raj has 1, Li has none. How many rows does each query return?",
    code: "Q1: SELECT c.name FROM customers c JOIN orders o ON o.cust_id = c.id;\nQ2: SELECT c.name FROM customers c\n    WHERE EXISTS (SELECT 1 FROM orders o WHERE o.cust_id = c.id);",
    options: ["Q1: 4, Q2: 4", "Q1: 2, Q2: 2", "Q1: 4, Q2: 2", "Q1: 3, Q2: 2"],
    answer: 2,
    explanation: "A join returns one row per matching PAIR, so Ann appears 3 times (4 rows total). EXISTS is a SEMI-JOIN: it only tests whether at least one match exists, returning each customer at most once (Ann, Raj). Use EXISTS (or IN) rather than JOIN + DISTINCT for 'customers who ordered'.",
    optionExplanations: ["EXISTS doesn't multiply rows.", "The join repeats Ann for each order.", "Correct.", "Ann matches 3 orders and Raj 1."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-joins-019", subject: "sql", subtopic: "Joins", difficulty: "hard", type: "query",
    question: "dept now has a loc_id column (HR → 1, IT → 2, Ops → 3) and location has ids 1, 2, 3. How many rows does this return? (emp: Asha 10, Ben 20, Chen NULL, Dev 10)",
    code: "SELECT e.name, d.name, l.city\nFROM emp e\nLEFT JOIN dept d ON e.dept_id = d.id\nJOIN location l ON l.id = d.loc_id;",
    options: ["4", "5", "3", "2"],
    answer: 2,
    explanation: "The LEFT JOIN keeps Chen with d.* = NULL, but the following INNER JOIN requires l.id = d.loc_id, which is UNKNOWN for NULL, so Chen's row is dropped. An inner join after a left join can silently undo the outer join; make the second join LEFT as well (or reorder/parenthesise).",
    optionExplanations: ["Chen is removed by the later inner join.", "Ops isn't on the preserved side.", "Correct.", "Asha, Ben and Dev all have locations."],
    tags: ["trap"]
  },
  {
    id: "sql-joins-020", subject: "sql", subtopic: "Joins", difficulty: "hard", type: "query",
    question: "Order 1 has 2 rows in order_items and 3 rows in payments, each payment of 100. What does this return for order 1?",
    code: "SELECT o.id, SUM(p.amount) AS paid\nFROM orders o\nJOIN order_items i ON i.order_id = o.id\nJOIN payments    p ON p.order_id = o.id\nGROUP BY o.id;",
    options: ["300", "600", "200", "500"],
    answer: 1,
    explanation: "Joining a parent to TWO independent child tables multiplies rows: 2 items × 3 payments = 6 rows for order 1, so each payment is counted twice and SUM gives 600 instead of 300 ('fan-out'). Aggregate each child table in its own subquery/CTE before joining.",
    optionExplanations: ["That's the correct business total, but the query double-counts.", "Correct.", "There are 3 payments of 100.", "Each payment appears exactly twice."],
    tags: ["trap", "interview-favourite"]
  },
  {
    id: "sql-joins-021", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "emp: Asha (dept 10), Ben (20), Chen (NULL), Dev (10). How many rows does this return?",
    code: "SELECT a.name, b.name\nFROM emp a\nJOIN emp b ON a.dept_id = b.dept_id AND a.id < b.id;",
    options: ["0", "4", "2", "1"],
    answer: 3,
    explanation: "This self join finds pairs of colleagues in the same department. Only Asha and Dev share a department (10). `a.id < b.id` keeps each pair once and excludes pairing a row with itself (with `<>` you'd get both orderings: 2 rows). Chen's NULL never matches.",
    optionExplanations: ["Asha and Dev share dept 10.", "Self-pairs and reversed pairs are excluded.", "That's the count with a.id <> b.id.", "Correct."]
  },
  {
    id: "sql-joins-022", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "Using the emp/dept tables (HR has 2 employees, IT 1, Ops 0), how many rows does this return?",
    code: "SELECT d.name, e.name\nFROM dept d\nLEFT JOIN emp e ON e.dept_id = d.id;",
    options: ["3", "4", "5", "6"],
    answer: 1,
    explanation: "Each department appears once per matching employee, or once with NULLs if it has none: HR 2 rows, IT 1, Ops 1. Note that dept LEFT JOIN emp is the same as emp RIGHT JOIN dept; most teams standardise on LEFT JOIN for readability.",
    optionExplanations: ["HR appears twice.", "Correct.", "Chen isn't included (he's on the non-preserved side).", "Each employee matches at most one department."]
  },
  {
    id: "sql-joins-023", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "What happens when this PostgreSQL query runs on emp(id, name, dept_id) and dept(id, name)?",
    code: "SELECT id, name FROM emp e JOIN dept d ON e.dept_id = d.id;",
    options: ["It returns employee ids and names", "It returns department ids and names", "Error: column reference \"id\" is ambiguous", "It returns both sets of columns"],
    answer: 2,
    explanation: "Both tables have id and name, so unqualified references are ambiguous after the join and the query is rejected. Qualify them with aliases: SELECT e.id, e.name, d.name AS dept_name ...",
    optionExplanations: ["The database doesn't guess which table you mean.", "No table is preferred implicitly.", "Correct.", "SELECT lists exactly the expressions given."]
  },
  {
    id: "sql-joins-024", subject: "sql", subtopic: "Joins", difficulty: "hard", type: "concept",
    question: "Which join algorithm is typically chosen for joining two LARGE, unsorted tables on an equality condition with no useful index?",
    options: ["Nested loop join", "Cartesian product then filter", "Sort-merge join is impossible without indexes", "Hash join: build a hash table on the smaller input, then probe it with the larger one"],
    answer: 3,
    explanation: "Nested loop joins are great when the outer side is small and the inner side has an index (O(n log m) with index lookups), but O(n·m) without. Hash joins handle large equi-joins in roughly O(n + m) with enough memory. Sort-merge joins shine when both inputs are already sorted on the join key (or for range/inequality-friendly merges).",
    optionExplanations: ["Without an index, a nested loop is O(n·m).", "Optimisers avoid materialising the full product.", "Sort-merge can sort its inputs; it just costs O(n log n) to do so.", "Correct."]
  },
  {
    id: "sql-joins-025", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "concept",
    question: "Why is it recommended to index foreign key columns such as orders.customer_id?",
    options: ["Foreign keys can't be enforced without an index", "Joins and lookups on the FK (and parent deletes that must check for children) can use the index instead of scanning the whole child table", "Indexes make the foreign key unique", "It reduces table size"],
    answer: 1,
    explanation: "PostgreSQL doesn't index FK columns automatically (MySQL/InnoDB does). Without an index, `JOIN orders o ON o.customer_id = c.id` for one customer, or deleting a customer (which must check for referencing orders), scans the entire orders table.",
    optionExplanations: ["PostgreSQL enforces FKs without an index on the child column.", "Correct.", "An ordinary index doesn't enforce uniqueness.", "Indexes add storage."]
  },
  {
    id: "sql-joins-026", subject: "sql", subtopic: "Joins", difficulty: "easy", type: "concept",
    question: "Which statement about LEFT JOIN and RIGHT JOIN is correct?",
    options: ["RIGHT JOIN returns only right-table columns", "`A RIGHT JOIN B` returns the same rows as `B LEFT JOIN A`; only the column order differs", "They return identical results for any A and B", "RIGHT JOIN removes NULLs"],
    answer: 1,
    explanation: "The direction indicates which table is preserved. Swapping the table order and the join direction gives the same rows. Teams usually stick to LEFT JOIN for readability.",
    optionExplanations: ["Both tables' columns are available.", "Correct.", "Which side is preserved differs.", "Outer joins introduce NULLs for unmatched rows."]
  },
  {
    id: "sql-joins-027", subject: "sql", subtopic: "Joins", difficulty: "hard", type: "query",
    question: "Using the emp/dept tables, how many rows does this return?",
    code: "SELECT d.name, COUNT(*)\nFROM emp e\nRIGHT JOIN dept d ON e.dept_id = d.id\nWHERE e.name <> 'Ben'\nGROUP BY d.name;",
    options: ["3", "1", "2", "0"],
    answer: 1,
    explanation: "The RIGHT JOIN gives HR–Asha, HR–Dev, IT–Ben, Ops–NULL. The WHERE then removes Ben's row AND Ops' row (e.name is NULL, and NULL <> 'Ben' is UNKNOWN). Only HR remains: 1 group. Filters on the non-preserved side belong in the ON clause if you want to keep unmatched rows.",
    optionExplanations: ["Ops is also removed by the WHERE.", "Correct.", "IT's only row is Ben's, which is removed.", "HR's two rows survive."],
    tags: ["trap"]
  },
  {
    id: "sql-joins-028", subject: "sql", subtopic: "Joins", difficulty: "hard", type: "query",
    question: "a(k): 1, 2, 3. b(k): 2, 3, 4, 4. How many rows does this return, and how many distinct values of COALESCE(a.k, b.k)?",
    code: "SELECT COALESCE(a.k, b.k) AS k\nFROM a\nFULL OUTER JOIN b ON a.k = b.k;",
    options: ["5 rows, 4 distinct", "4 rows, 4 distinct", "6 rows, 4 distinct", "7 rows, 5 distinct"],
    answer: 0,
    explanation: "Matches: 2–2 and 3–3 (2 rows). Unmatched left: 1 (1 row). Unmatched right: the two 4s (2 rows). Total 5 rows; COALESCE merges the key from whichever side is present, giving values 1, 2, 3, 4, 4 → 4 distinct.",
    optionExplanations: ["Correct.", "Both 4 rows in b are kept.", "Each match appears once.", "Only keys 1-4 exist."]
  },
  {
    id: "sql-joins-029", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "How many rows does this return? (emp 4 rows, dept 3 rows; 3 emp rows match a dept)",
    code: "SELECT *\nFROM emp e\nCROSS JOIN dept d\nWHERE e.dept_id = d.id;",
    options: ["12", "0", "4", "3"],
    answer: 3,
    explanation: "Logically, the CROSS JOIN builds 12 pairs and WHERE keeps those with matching ids, which is exactly an inner join: 3 rows. The optimiser executes it as an inner join, not by materialising 12 rows.",
    optionExplanations: ["WHERE filters the product.", "Three employees have matching departments.", "Chen doesn't match any department.", "Correct."]
  },
  {
    id: "sql-joins-030", subject: "sql", subtopic: "Joins", difficulty: "medium", type: "query",
    question: "How many rows does this return?",
    code: "-- students(id): 1, 2, 3\n-- enroll(student_id, course_id): (1, 'DB'), (1, 'OS'), (2, 'DB')\n-- courses(id, title): ('DB', 'Databases'), ('OS', 'Op Sys'), ('CN', 'Networks')\nSELECT s.id, c.title\nFROM students s\nJOIN enroll e  ON e.student_id = s.id\nJOIN courses c ON c.id = e.course_id;",
    options: ["2", "4", "3", "9"],
    answer: 2,
    explanation: "Joining through the junction table produces one row per enrollment: (1, Databases), (1, Op Sys), (2, Databases). Student 3 and course CN have no enrollments and disappear in inner joins.",
    optionExplanations: ["Student 1 has two enrollments.", "Only three enrollment rows exist.", "Correct.", "Inner joins don't create all combinations."]
  },
  {
    id: "sql-joins-031", subject: "sql", subtopic: "Joins", difficulty: "hard", type: "query",
    question: "emp(id, name, manager_id): 1 Raj NULL, 2 Ana 1, 3 Bo 1, 4 Cy 2. How many rows does this return?",
    code: "SELECT m.name AS manager, COUNT(e.id) AS reports\nFROM emp m\nLEFT JOIN emp e ON e.manager_id = m.id\nGROUP BY m.id, m.name;",
    options: ["2", "3", "4", "1"],
    answer: 2,
    explanation: "Every employee appears as a potential manager because of the LEFT JOIN: Raj (2 reports), Ana (1), Bo (0), Cy (0). Four rows. With an INNER JOIN, only actual managers (Raj, Ana) would appear.",
    optionExplanations: ["That's the INNER JOIN result.", "Bo and Cy are both kept with 0 reports.", "Correct.", "Every employee is listed."]
  },
  {
    id: "sql-joins-032", subject: "sql", subtopic: "Joins", difficulty: "easy", type: "concept",
    question: "Which join returns ONLY rows that have matches in both tables?",
    options: ["LEFT JOIN", "INNER JOIN", "FULL OUTER JOIN", "CROSS JOIN"],
    answer: 1,
    explanation: "INNER JOIN (often written just JOIN) keeps only matched pairs. LEFT/RIGHT/FULL OUTER joins additionally keep unmatched rows from one or both sides, padded with NULLs. CROSS JOIN pairs every row with every row, with no condition.",
    optionExplanations: ["LEFT JOIN also keeps unmatched left rows.", "Correct.", "FULL keeps unmatched rows from both sides.", "CROSS JOIN has no matching condition."]
  },
  {
    id: "sql-joins-033", subject: "sql", subtopic: "Joins", difficulty: "hard", type: "numerical",
    question: "emp(id, dept_id) has 1000 rows and dept(id) has 10 rows; dept.id is unique and every emp.dept_id references a valid dept. How many rows does `emp JOIN dept ON emp.dept_id = dept.id` return, and how many would `emp JOIN dept ON emp.dept_id <> dept.id` return?",
    options: ["1000 and 9000", "10 and 990", "1000 and 10000", "1000 and 0"],
    answer: 0,
    explanation: "Each employee matches exactly one department on equality → 1000 rows. With <>, each employee pairs with the 9 OTHER departments → 1000 × 9 = 9000 rows. Non-equi conditions can explode result sizes.",
    optionExplanations: ["Correct.", "Each employee row appears once in the equi-join.", "The <> join excludes the matching department.", "<> matches the other 9 departments."]
  }
);
