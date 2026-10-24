/* SQL / DBMS — Classic Interview Queries */
window.QUESTIONS.push(
  {
    id: "sql-classic-001", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "easy", type: "query",
    question: "Which query returns the SECOND-highest salary from Employee(id, salary)?",
    code: "-- Employee(id, name, salary, manager_id, dept_id)",
    options: ["SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);", "SELECT salary FROM Employee ORDER BY salary DESC LIMIT 2;", "SELECT MAX(salary) - 1 FROM Employee;", "SELECT MIN(salary) FROM Employee WHERE salary > (SELECT MIN(salary) FROM Employee);"],
    answer: 0,
    explanation: "Exclude the maximum, then take the maximum of what's left. It handles duplicates of the top salary correctly and returns NULL when there's no second distinct salary. Alternatives: DISTINCT + LIMIT 1 OFFSET 1, or DENSE_RANK() = 2.",
    optionExplanations: ["Correct.", "That returns the top two rows, not the second value.", "Subtracting 1 from the max is meaningless.", "That's the second-LOWEST salary."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-002", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "easy", type: "query",
    question: "Which query lists emails that appear more than once in Person(id, email)?",
    code: "-- Person(id, email)",
    options: ["SELECT email FROM Person WHERE COUNT(email) > 1;", "SELECT email, COUNT(*) FROM Person;", "SELECT DISTINCT email FROM Person;", "SELECT email FROM Person GROUP BY email HAVING COUNT(*) > 1;"],
    answer: 3,
    explanation: "Group rows by the value you want to check, then keep groups with more than one row using HAVING. Aggregates can't go in WHERE. This pattern finds duplicates on any column or combination of columns.",
    optionExplanations: ["Aggregates aren't allowed in WHERE.", "Mixing an aggregate with a non-grouped column is invalid (and gives one row).", "That lists each email once, duplicated or not.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-003", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "easy", type: "query",
    question: "Which query finds customers who NEVER placed an order (Customers(id, name), Orders(id, customer_id))?",
    code: "-- Orders.customer_id may contain NULLs",
    options: ["SELECT name FROM Customers WHERE id NOT IN (SELECT customer_id FROM Orders);", "SELECT name FROM Customers WHERE id <> ALL (SELECT id FROM Orders);", "SELECT c.name FROM Customers c JOIN Orders o ON o.customer_id <> c.id;", "SELECT c.name FROM Customers c WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.customer_id = c.id);"],
    answer: 3,
    explanation: "NOT EXISTS (or LEFT JOIN ... WHERE o.id IS NULL) correctly expresses 'no matching order'. NOT IN breaks when Orders.customer_id contains a NULL (it returns nothing). Joining on <> pairs each customer with every other customer's orders. The last option compares against order ids, not customer ids.",
    optionExplanations: ["A NULL customer_id makes NOT IN return no rows.", "It compares customer ids with order ids.", "That produces many wrong pairs.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-004", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "easy", type: "query",
    question: "What does this return?",
    code: "-- Employee(id, name, salary, manager_id, dept_id)\n-- 1 | Joe   | 70000 | 3    | 1\n-- 2 | Henry | 80000 | 4    | 2\n-- 3 | Sam   | 60000 | NULL | 2\n-- 4 | Max   | 90000 | NULL | 1\n-- 5 | Janet | 69000 | 1    | 1\n-- 6 | Randy | 85000 | 1    | 1\n-- 7 | Will  | 70000 | 1    | 1\nSELECT MAX(salary) FROM Employee\nWHERE salary < (SELECT MAX(salary) FROM Employee);",
    options: ["90000", "70000", "80000", "85000"],
    answer: 3,
    explanation: "The overall maximum is 90000; the largest salary below it is 85000 (Randy).",
    optionExplanations: ["That's the highest salary.", "70000 is further down.", "That's the third highest.", "Correct."]
  },
  {
    id: "sql-classic-005", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "Using the Employee table above, which query returns the 3rd highest DISTINCT salary (80000)?",
    code: "-- distinct salaries: 90000, 85000, 80000, 70000, 69000, 60000",
    options: ["SELECT salary FROM (SELECT salary, ROW_NUMBER() OVER (ORDER BY salary DESC) AS r FROM Employee) t WHERE r = 3;", "SELECT DISTINCT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS r FROM Employee) t WHERE r = 3;", "SELECT salary FROM Employee ORDER BY salary DESC LIMIT 3;", "SELECT salary FROM (SELECT salary, RANK() OVER (ORDER BY salary) AS r FROM Employee) t WHERE r = 3;"],
    answer: 1,
    explanation: "DENSE_RANK numbers distinct values without gaps, so rank 3 is exactly the 3rd-highest distinct value; DISTINCT removes repeated rows if several people earn it. ROW_NUMBER would break when duplicates sit in the top positions; ascending RANK gives the 3rd lowest.",
    optionExplanations: ["ROW_NUMBER counts duplicate salaries separately.", "Correct.", "That returns three rows.", "Ascending order finds the 3rd LOWEST."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-006", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "Salaries are 90000, 90000, 80000. What does each query return?",
    code: "Q1: SELECT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1;\nQ2: SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1;",
    options: ["Q1: 80000, Q2: 80000", "Q1: 80000, Q2: 90000", "Q1: 90000, Q2: 90000", "Q1: 90000, Q2: 80000"],
    answer: 3,
    explanation: "Without DISTINCT, the offset skips one of the duplicate 90000 rows and returns the other 90000 — wrong for 'second-highest salary'. DISTINCT collapses duplicates first, so OFFSET 1 lands on 80000.",
    optionExplanations: ["Q1 is fooled by the duplicate 90000.", "Reversed.", "DISTINCT fixes Q2.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "sql-classic-007", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "Employee contains ONE row (salary 100). What does each query return?",
    code: "Q1: SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1;\nQ2: SELECT (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1) AS second;",
    options: ["Q1: no rows; Q2: one row containing NULL", "Q1: NULL; Q2: NULL", "Q1: no rows; Q2: no rows", "Q1: 100; Q2: 100"],
    answer: 0,
    explanation: "Q1 returns an empty result set. Wrapping it as a scalar subquery makes an empty result evaluate to NULL, so Q2 always returns exactly one row — what 'return NULL if there's no second-highest salary' problems expect. SELECT MAX(...) WHERE salary < MAX also returns NULL.",
    optionExplanations: ["Correct.", "A plain query returns no rows rather than a NULL row.", "The scalar subquery turns 'no rows' into NULL.", "Offset 1 skips the only value."],
    tags: ["trap"]
  },
  {
    id: "sql-classic-008", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "Using the Employee table (Joe 70000 → manager Sam 60000; Henry 80000 → Max 90000; Janet 69000, Randy 85000, Will 70000 → Joe 70000), which employees earn MORE than their manager?",
    code: "SELECT e.name\nFROM Employee e\nJOIN Employee m ON e.manager_id = m.id\nWHERE e.salary > m.salary;",
    options: ["Joe, Randy", "Joe, Randy, Will", "Henry, Randy", "Randy"],
    answer: 0,
    explanation: "The self join pairs each employee with their manager. Joe (70000) > Sam (60000) ✓; Henry (80000) < Max ✗; Janet (69000) < Joe ✗; Randy (85000) > Joe (70000) ✓; Will (70000) = Joe, not greater ✗. Employees without managers drop out of the inner join.",
    optionExplanations: ["Correct.", "Will's salary equals Joe's; > is strict.", "Henry earns less than Max.", "Joe also out-earns Sam."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-009", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "How many rows does this 'highest salary per department' query return on the Employee table? (dept 1: Joe 70000, Max 90000, Janet 69000, Randy 85000, Will 70000; dept 2: Henry 80000, Sam 60000)",
    code: "SELECT e.dept_id, e.name, e.salary\nFROM Employee e\nWHERE e.salary = (SELECT MAX(salary) FROM Employee x\n                  WHERE x.dept_id = e.dept_id);",
    options: ["1", "7", "3", "2"],
    answer: 3,
    explanation: "The correlated subquery finds each department's maximum: Max (90000) in dept 1 and Henry (80000) in dept 2. If two people tied for a department's maximum, both would be returned — usually the desired behaviour.",
    optionExplanations: ["Each department has a top earner.", "Only top earners are returned.", "There are no ties at the top here.", "Correct."]
  },
  {
    id: "sql-classic-010", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "hard", type: "query",
    question: "'Department top three salaries' (LeetCode 185): how many rows does this return on the Employee table? (dept 1 salaries: 70000, 90000, 69000, 85000, 70000; dept 2: 80000, 60000)",
    code: "SELECT dept_id, name, salary FROM (\n  SELECT e.*, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS r\n  FROM Employee e\n) t\nWHERE r <= 3;",
    options: ["5", "6", "7", "3"],
    answer: 1,
    explanation: "Top three DISTINCT salaries per department, keeping ties. Dept 1: 90000 (Max), 85000 (Randy), 70000 (Joe and Will) → 4 rows; Janet's 69000 is rank 4. Dept 2 has only two employees → 2 rows. Total 6.",
    optionExplanations: ["Joe and Will tie at rank 3, so both appear.", "Correct.", "Janet is rank 4 in dept 1.", "Ranking is per department."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-011", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "Person(id, email): (1, a@x), (2, b@x), (3, a@x), (4, a@x). After running this (MySQL), which ids remain?",
    code: "DELETE p1 FROM Person p1\nJOIN Person p2\n  ON p1.email = p2.email AND p1.id > p2.id;",
    options: ["2, 4", "3, 4", "1, 2", "1, 2, 3"],
    answer: 2,
    explanation: "Every row that has a duplicate with a SMALLER id is deleted, so only the lowest id per email survives: a@x keeps 1, b@x keeps 2. In PostgreSQL write it as DELETE FROM Person p1 USING Person p2 WHERE ..., or delete ids where ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) > 1.",
    optionExplanations: ["Id 4 has smaller duplicates (1, 3).", "The higher ids are the ones deleted.", "Correct.", "Id 3 has a smaller duplicate (1)."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-012", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "hard", type: "query",
    question: "Logs(id, num): (1,1), (2,1), (3,1), (4,2), (5,1), (6,2), (7,2). Which numbers appear at least three times CONSECUTIVELY?",
    code: "SELECT DISTINCT num FROM (\n  SELECT num,\n         LAG(num)  OVER (ORDER BY id) AS prev,\n         LEAD(num) OVER (ORDER BY id) AS nxt\n  FROM Logs\n) t\nWHERE num = prev AND num = nxt;",
    options: ["2", "1, 2", "1", "None"],
    answer: 2,
    explanation: "A row is the middle of a run of 3 if it equals both its predecessor and successor. Only id 2 (1, 1, 1) satisfies this. The 2s at ids 6–7 are a run of 2, and the 1 at id 5 is isolated. DISTINCT avoids listing a number twice for longer runs. (A triple self join on id, id+1, id+2 also works when ids are gapless.)",
    optionExplanations: ["2 never appears three times consecutively.", "The 2s only appear twice in a row.", "Correct.", "1 appears three times consecutively at ids 1–3."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-013", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "hard", type: "query",
    question: "Weather(id, rec_date, temp): (1, '2024-01-01', 10), (2, '2024-01-02', 25), (3, '2024-01-04', 30), (4, '2024-01-05', 20). 'Find days warmer than the PREVIOUS CALENDAR DAY.' Which ids does each query return?",
    code: "Q1: SELECT w.id FROM Weather w JOIN Weather y\n    ON w.rec_date = y.rec_date + INTERVAL '1 day' WHERE w.temp > y.temp;\nQ2: SELECT id FROM (SELECT id, temp, LAG(temp) OVER (ORDER BY rec_date) AS p FROM Weather) t\n    WHERE temp > p;",
    options: ["Q1: 2; Q2: 2", "Q1: 2, 3; Q2: 2, 3", "Q1: 2; Q2: 2, 3", "Q1: 3; Q2: 2"],
    answer: 2,
    explanation: "Q1 matches each day with exactly the day before: Jan 2 (25 > 10) ✓; Jan 4 has no Jan 3 row, so it's skipped; Jan 5 (20 < 30) ✗ → id 2. Q2 compares with the previous ROW, so Jan 4 is wrongly compared with Jan 2 and id 3 is included. LAG is only correct if dates have no gaps.",
    optionExplanations: ["Q2 also returns id 3.", "Q1 skips Jan 4 because Jan 3 is missing.", "Correct.", "Q1 does return id 2."],
    tags: ["trap"]
  },
  {
    id: "sql-classic-014", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "orders(user_id, day, amt): user 1: (1, 10), (2, 5), (3, 20); user 2: (1, 7), (2, 3). What is user 2's running total on day 2?",
    code: "SELECT user_id, day,\n       SUM(amt) OVER (PARTITION BY user_id ORDER BY day) AS running\nFROM orders;",
    options: ["10", "45", "3", "35"],
    answer: 0,
    explanation: "PARTITION BY restarts the running total for each user; ORDER BY day accumulates within the user. User 2: day 1 → 7, day 2 → 7 + 3 = 10.",
    optionExplanations: ["Correct.", "That's the grand total of all orders.", "That's only day 2's amount.", "That's user 1's day-3 running total."]
  },
  {
    id: "sql-classic-015", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "hard", type: "query",
    question: "t(x): 1, 3, 4, 8. What does this median query return?",
    code: "SELECT AVG(x) AS median FROM (\n  SELECT x,\n         ROW_NUMBER() OVER (ORDER BY x) AS rn,\n         COUNT(*) OVER () AS n\n  FROM t\n) s\nWHERE rn IN ((n + 1) / 2, (n + 2) / 2);",
    options: ["4.0 (the mean)", "4", "3.5", "3"],
    answer: 2,
    explanation: "With n = 4 and integer division, (n + 1) / 2 = 2 and (n + 2) / 2 = 3, so rows 2 and 3 (values 3 and 4) are averaged: 3.5. For odd n both expressions point to the same middle row. PostgreSQL also offers PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY x).",
    optionExplanations: ["The mean is 16 / 4 = 4, not the median.", "Only the middle element for odd n; here n is even.", "Correct.", "The two middle values are averaged."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-016", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "sales(product, quarter, amt): (pen, Q1, 10), (pen, Q2, 20), (ink, Q1, 5). What row does this produce for ink?",
    code: "SELECT product,\n       SUM(CASE WHEN quarter = 'Q1' THEN amt ELSE 0 END) AS q1,\n       SUM(CASE WHEN quarter = 'Q2' THEN amt ELSE 0 END) AS q2\nFROM sales\nGROUP BY product;",
    options: ["ink, 5, 20", "ink, 5, NULL", "ink, 5, 0", "ink, 0, 5"],
    answer: 2,
    explanation: "Conditional aggregation pivots rows into columns: one CASE per target column inside an aggregate, grouped by the row key. Because of ELSE 0, missing combinations become 0; without ELSE they'd be NULL.",
    optionExplanations: ["Q2's 20 belongs to pen.", "The ELSE 0 makes the missing quarter 0.", "Correct.", "ink's 5 is in Q1."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-017", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "revenue(yr, amt): (2022, 100), (2023, 150), (2024, 120). What is the growth percentage for 2024?",
    code: "SELECT yr,\n       ROUND(100.0 * (amt - LAG(amt) OVER (ORDER BY yr))\n             / LAG(amt) OVER (ORDER BY yr), 1) AS growth_pct\nFROM revenue;",
    options: ["-30.0", "20.0", "-20.0", "50.0"],
    answer: 2,
    explanation: "Year-over-year growth = (current − previous) / previous × 100. For 2024: (120 − 150) / 150 × 100 = −20.0%. 2022 has no previous year (NULL); 2023 is +50.0%.",
    optionExplanations: ["The denominator is 150, not 100.", "Revenue decreased, so growth is negative.", "Correct.", "That's 2023's growth."]
  },
  {
    id: "sql-classic-018", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "Which query lists every department with its employee count, including departments with zero employees?",
    code: "-- dept(id, name), emp(id, dept_id)",
    options: ["SELECT d.name, COUNT(*) FROM dept d JOIN emp e ON e.dept_id = d.id GROUP BY d.name;", "SELECT d.name, COUNT(e.id) FROM dept d LEFT JOIN emp e ON e.dept_id = d.id GROUP BY d.id, d.name;", "SELECT d.name, COUNT(*) FROM dept d LEFT JOIN emp e ON e.dept_id = d.id GROUP BY d.id, d.name;", "SELECT dept_id, COUNT(*) FROM emp GROUP BY dept_id;"],
    answer: 1,
    explanation: "A LEFT JOIN keeps empty departments, and COUNT(e.id) counts only real employees, giving 0 for them. COUNT(*) would report 1 for an empty department (the NULL-extended row). An inner join or grouping emp alone drops empty departments.",
    optionExplanations: ["An inner join drops empty departments.", "Correct.", "COUNT(*) gives 1 for empty departments.", "Departments with no employees never appear."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-019", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "easy", type: "query",
    question: "Salary(id, sex) holds 'm'/'f'. Which single UPDATE swaps every 'm' with 'f' and vice versa?",
    code: "-- no temporary table, one statement",
    options: ["UPDATE Salary SET sex = 'f' WHERE sex = 'm'; UPDATE Salary SET sex = 'm' WHERE sex = 'f';", "UPDATE Salary SWAP sex;", "UPDATE Salary SET sex = NOT sex;", "UPDATE Salary SET sex = CASE sex WHEN 'm' THEN 'f' ELSE 'm' END;"],
    answer: 3,
    explanation: "A CASE expression computes the new value from each row's OLD value in a single pass, so no row is flipped twice. Two sequential UPDATEs would turn all values into 'm' (the first makes everything 'f', the second turns everything back).",
    optionExplanations: ["The second statement flips the rows the first one just changed.", "There's no SWAP syntax.", "NOT applies to booleans, not text.", "Correct."]
  },
  {
    id: "sql-classic-020", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "Which query returns managers who have at least 5 direct reports? (Employee(id, name, manager_id))",
    code: "-- expected: one row per qualifying manager, with the manager's name",
    options: ["SELECT name FROM Employee GROUP BY manager_id HAVING COUNT(*) >= 5;", "SELECT name FROM Employee WHERE manager_id >= 5;", "SELECT m.name FROM Employee m WHERE COUNT(m.manager_id) >= 5;", "SELECT m.name FROM Employee m JOIN Employee e ON e.manager_id = m.id GROUP BY m.id, m.name HAVING COUNT(*) >= 5;"],
    answer: 3,
    explanation: "Self join each manager (m) to their reports (e), group by the manager, and filter groups with HAVING. Grouping by id (not just name) avoids merging different managers who share a name.",
    optionExplanations: ["name isn't grouped, and it would be the employee's name, not the manager's.", "That compares the manager id value with 5.", "Aggregates can't be used in WHERE.", "Correct."]
  },
  {
    id: "sql-classic-021", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "orders(id, cust_id, created_at). Which query returns each customer's MOST RECENT order (one row per customer)?",
    code: "-- assume no two orders of the same customer share created_at",
    options: ["SELECT cust_id, MAX(created_at), id FROM orders GROUP BY cust_id;", "SELECT DISTINCT cust_id, id FROM orders;", "SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;", "SELECT * FROM (SELECT o.*, ROW_NUMBER() OVER (PARTITION BY cust_id ORDER BY created_at DESC) AS rn FROM orders o) t WHERE rn = 1;"],
    answer: 3,
    explanation: "ROW_NUMBER partitioned by customer and ordered by date descending marks each customer's latest order with rn = 1. Selecting a non-aggregated id with MAX() is invalid in strict SQL (and in legacy MySQL returns an arbitrary id, not necessarily the latest order's). LIMIT 1 returns only the single latest order overall.",
    optionExplanations: ["id isn't grouped or aggregated, so it's invalid/unreliable.", "That lists every order.", "That's one row total, not one per customer.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-022", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "t(id): 2, 3, 5, 8, 9 (ids have gaps). Which query returns every SECOND row in id order (2, 5, 9)?",
    code: "-- want the 1st, 3rd and 5th rows by id",
    options: ["SELECT id FROM t WHERE id % 2 = 0;", "SELECT id FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM t) s WHERE rn % 2 = 1;", "SELECT id FROM t WHERE id % 2 = 1;", "SELECT id FROM t LIMIT 3;"],
    answer: 1,
    explanation: "Row positions aren't ids. ROW_NUMBER assigns positions 1..n regardless of gaps, so rn % 2 = 1 picks positions 1, 3, 5 → ids 2, 5, 9. Filtering on id parity returns 2, 8 or 3, 5, 9, depending on the parity chosen.",
    optionExplanations: ["That returns ids 2 and 8.", "Correct.", "That returns ids 3, 5 and 9.", "That returns the first three rows (2, 3, 5)."]
  },
  {
    id: "sql-classic-023", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "hard", type: "query",
    question: "Using the Employee table (Joe → Sam; Janet, Randy, Will → Joe; Henry → Max), how many employees are in Sam's reporting tree (direct and indirect, excluding Sam)?",
    code: "WITH RECURSIVE sub AS (\n  SELECT id FROM Employee WHERE manager_id = 3   -- Sam's id\n  UNION ALL\n  SELECT e.id FROM Employee e JOIN sub s ON e.manager_id = s.id\n)\nSELECT COUNT(*) FROM sub;",
    options: ["1", "3", "4", "5"],
    answer: 2,
    explanation: "The anchor finds Sam's direct report (Joe). The recursive step repeatedly adds employees whose manager is already in the set: Janet, Randy and Will (via Joe). Recursion stops when no new rows are produced. Total 4.",
    optionExplanations: ["Indirect reports are included through recursion.", "Joe himself is also counted.", "Correct.", "Henry reports to Max, not into Sam's tree."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-024", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "hard", type: "query",
    question: "logins(user_id, day) with distinct days per user. User 7 logged in on days 1, 2, 3, 6, 7, 10. What is user 7's longest streak of consecutive login days?",
    code: "SELECT user_id, MAX(cnt) AS longest FROM (\n  SELECT user_id, grp, COUNT(*) AS cnt FROM (\n    SELECT user_id, day,\n           day - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY day) AS grp\n    FROM logins) a\n  GROUP BY user_id, grp) b\nGROUP BY user_id;",
    options: ["2", "3", "6", "1"],
    answer: 1,
    explanation: "day − ROW_NUMBER is constant within a run: days 1, 2, 3 → 0; 6, 7 → 2; 10 → 4. Counting per (user, grp) gives streak lengths 3, 2, 1; the longest is 3. This gaps-and-islands pattern solves 'N consecutive days' questions.",
    optionExplanations: ["Days 1–3 form a longer streak.", "Correct.", "Days aren't all consecutive.", "There are multi-day streaks."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-classic-025", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "hard", type: "query",
    question: "t(id): 1, 2, 4, 7. What (gap_start, gap_end) rows does this gap-finding query return?",
    code: "SELECT id + 1 AS gap_start, nxt - 1 AS gap_end FROM (\n  SELECT id, LEAD(id) OVER (ORDER BY id) AS nxt FROM t\n) s\nWHERE nxt - id > 1;",
    options: ["(3, 3) and (5, 6)", "(3, 4) and (5, 7)", "(2, 3) and (4, 6)", "(3, 3) only"],
    answer: 0,
    explanation: "LEAD gives each id's successor. A gap exists where the successor is more than 1 away: 2 → 4 means 3 is missing (3, 3); 4 → 7 means 5–6 are missing (5, 6). The last row's successor is NULL, so it's excluded automatically.",
    optionExplanations: ["Correct.", "The gap ends one before the next existing id.", "Gaps start one after the existing id.", "There's also a gap between 4 and 7."]
  },
  {
    id: "sql-classic-026", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "hard", type: "query",
    question: "Seat(id, student) has ids 1..5 (Abbot, Doris, Emerson, Green, Jeames). This swaps every pair of adjacent students; the last student stays if the count is odd. What student ends up with id 5?",
    code: "SELECT CASE\n         WHEN id % 2 = 1 AND id = (SELECT MAX(id) FROM Seat) THEN id\n         WHEN id % 2 = 1 THEN id + 1\n         ELSE id - 1\n       END AS id, student\nFROM Seat ORDER BY id;",
    options: ["Green", "Jeames", "Emerson", "Doris"],
    answer: 1,
    explanation: "Odd ids move up one, even ids move down one, except an odd LAST id, which stays. Pairs (1, 2) and (3, 4) swap; id 5 (Jeames) is the odd last row and keeps id 5. (LeetCode 626 'Exchange Seats'.)",
    optionExplanations: ["Green (id 4) moves to id 3.", "Correct.", "Emerson (id 3) moves to id 4.", "Doris (id 2) moves to id 1."]
  },
  {
    id: "sql-classic-027", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "Using the Employee table (salaries 70000, 80000, 60000, 90000, 69000, 85000, 70000), which employees share their salary with at least one other employee?",
    code: "SELECT name FROM (\n  SELECT name, COUNT(*) OVER (PARTITION BY salary) AS c FROM Employee\n) t\nWHERE c > 1;",
    options: ["Joe, Will", "Joe", "Henry, Randy", "Nobody"],
    answer: 0,
    explanation: "COUNT(*) OVER (PARTITION BY salary) attaches the size of each salary group to every row without collapsing it, so rows whose salary occurs more than once can be filtered. Joe and Will both earn 70000. A self join on equal salary and different id works too.",
    optionExplanations: ["Correct.", "Will has the same salary as Joe.", "Their salaries are unique.", "70000 appears twice."]
  },
  {
    id: "sql-classic-028", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "hard", type: "query",
    question: "Activity(player_id, event_date): player 1 first logged in on day 1 and again on day 2; player 2 first on day 3, next on day 5; player 3 first on day 1, next on day 2. What fraction of players logged in on the day right after their first login?",
    code: "SELECT ROUND(1.0 * COUNT(DISTINCT a.player_id)\n             / (SELECT COUNT(DISTINCT player_id) FROM Activity), 2) AS fraction\nFROM Activity a\nJOIN (SELECT player_id, MIN(event_date) AS first_day\n      FROM Activity GROUP BY player_id) f\n  ON a.player_id = f.player_id AND a.event_date = f.first_day + 1;",
    options: ["0.33", "0.67", "1.00", "0.50"],
    answer: 1,
    explanation: "Compute each player's first day, then check for an activity exactly one day later. Players 1 and 3 qualify; player 2's next login is on day 5. 2 / 3 ≈ 0.67. Multiplying by 1.0 avoids integer division. (LeetCode 550 'Game Play Analysis IV'.)",
    optionExplanations: ["Two of the three players qualify.", "Correct.", "Player 2 skipped a day.", "There are three players, not four."]
  },
  {
    id: "sql-classic-029", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "dept totals: HR 8000, IT 22000 (grand total 30000). Which query gives each department's percentage of total salary (HR 26.67, IT 73.33)?",
    code: "-- emp(dept, salary)",
    options: ["SELECT dept, ROUND(100.0 * SUM(salary) / SUM(SUM(salary)) OVER (), 2) FROM emp GROUP BY dept;", "SELECT dept, ROUND(100 * salary / SUM(salary), 2) FROM emp GROUP BY dept;", "SELECT dept, SUM(salary) / 30000 FROM emp;", "SELECT dept, ROUND(SUM(salary) / COUNT(*), 2) FROM emp GROUP BY dept;"],
    answer: 0,
    explanation: "Group to get each department total, then divide by the grand total computed with a window over the grouped rows (SUM(SUM(salary)) OVER ()). Multiplying by 100.0 keeps decimal precision. A scalar subquery (SELECT SUM(salary) FROM emp) works too.",
    optionExplanations: ["Correct.", "salary isn't grouped, so it's invalid.", "A hard-coded total and missing GROUP BY give wrong results.", "That's the average salary per department."]
  },
  {
    id: "sql-classic-030", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "hard", type: "query",
    question: "In PostgreSQL, a function `nth_highest(n)` should return the nth highest DISTINCT salary, or NULL if there are fewer than n distinct salaries. Which body is correct?",
    code: "-- Employee(salary)",
    options: ["SELECT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET n - 1;", "SELECT (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET n - 1);", "SELECT MAX(salary) FROM Employee LIMIT n;", "SELECT salary FROM Employee WHERE salary = n;"],
    answer: 1,
    explanation: "DISTINCT makes duplicates count once, OFFSET n − 1 jumps to the nth value, and wrapping the query as a scalar subquery turns 'no row' into NULL. Without DISTINCT, duplicates shift the offset; without the wrapper, a missing value returns no row instead of NULL.",
    optionExplanations: ["Duplicates break it, and it returns no row (not NULL) when n is too large.", "Correct.", "LIMIT on an aggregate doesn't select the nth value.", "That compares salaries with n itself."]
  },
  {
    id: "sql-classic-031", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "easy", type: "query",
    question: "Which query returns the THREE highest-paid employees (assume no ties)?",
    code: "-- emp(name, salary)",
    options: ["SELECT TOP 3 name FROM emp;", "SELECT name FROM emp ORDER BY salary LIMIT 3;", "SELECT name FROM emp ORDER BY salary DESC LIMIT 3;", "SELECT name FROM emp WHERE salary > 3;"],
    answer: 2,
    explanation: "Sort descending and take the first three rows (FETCH FIRST 3 ROWS ONLY in standard SQL; TOP 3 ... ORDER BY salary DESC in SQL Server). Ascending order would give the lowest-paid, and TOP without ORDER BY returns arbitrary rows.",
    optionExplanations: ["Without ORDER BY, which three rows come back is undefined.", "Ascending order gives the three lowest salaries.", "Correct.", "That compares salaries with the number 3."]
  },
  {
    id: "sql-classic-032", subject: "sql", subtopic: "Classic Interview Queries", difficulty: "medium", type: "query",
    question: "Employee table again (dept 1: Joe 70000, Max 90000, Janet 69000, Randy 85000, Will 70000; dept 2: Henry 80000, Sam 60000). Which employees earn more than their department's average?",
    code: "SELECT name FROM (\n  SELECT name, salary, AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg\n  FROM Employee\n) t\nWHERE salary > dept_avg;",
    options: ["Max, Randy, Henry", "Max, Randy", "Max, Henry", "Max, Randy, Joe, Will, Henry"],
    answer: 0,
    explanation: "Dept 1 average = (70000 + 90000 + 69000 + 85000 + 70000) / 5 = 76800 → Max and Randy are above it. Dept 2 average = 70000 → Henry. A window AVG avoids a correlated subquery.",
    optionExplanations: ["Correct.", "Henry is above dept 2's average of 70000.", "Randy (85000) is above 76800.", "Joe and Will (70000) are below 76800."]
  }
);
