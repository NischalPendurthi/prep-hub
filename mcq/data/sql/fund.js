/* SQL / DBMS — DBMS Fundamentals & Keys */
window.QUESTIONS.push(
  {
    id: "sql-fund-001", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "concept",
    question: "Which is a key advantage of a DBMS over storing data in plain files?",
    options: ["Files are always slower to read", "A DBMS stores data only in memory", "A DBMS never needs a schema", "A DBMS provides controlled redundancy, integrity constraints, concurrent access, recovery and security in one place"],
    answer: 3,
    explanation: "With flat files, each application handles its own formats, duplicates data (leading to inconsistency) and must implement locking, backups and access control itself. A DBMS centralises these: a declarative query language, constraints, transactions (concurrency + recovery) and permissions.",
    optionExplanations: ["Raw file reads can be fast; the benefit is management, not raw speed.", "Databases persist data on disk.", "Relational DBMSs are schema-based.", "Correct."]
  },
  {
    id: "sql-fund-002", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "concept",
    question: "What best distinguishes an RDBMS from a generic DBMS?",
    options: ["An RDBMS stores data in relations (tables) and enforces relationships through keys and integrity constraints, typically queried with SQL", "An RDBMS can't store numbers", "An RDBMS doesn't support transactions", "An RDBMS stores data as a single file per row"],
    answer: 0,
    explanation: "A DBMS is any system that manages a database (hierarchical, network, document, key-value...). An RDBMS follows the relational model: data in tables of rows and columns, with primary/foreign keys linking tables and SQL for querying. MySQL, PostgreSQL, Oracle and SQL Server are RDBMSs.",
    optionExplanations: ["Correct.", "RDBMSs support many data types.", "RDBMSs are known for ACID transactions.", "Storage layout is an implementation detail."]
  },
  {
    id: "sql-fund-003", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "concept",
    question: "Which two properties must a primary key have?",
    options: ["Unique and NOT NULL", "Unique and indexed only", "Numeric and auto-incrementing", "Nullable and unique"],
    answer: 0,
    explanation: "A primary key uniquely identifies each row, so its values must be unique and can never be NULL (entity integrity). A table has at most one primary key, though it may span several columns. Auto-increment is a common choice, not a requirement.",
    optionExplanations: ["Correct.", "Uniqueness alone isn't enough; NULLs are forbidden too.", "Text or composite primary keys are allowed.", "Primary key columns can't be NULL."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-fund-004", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "concept",
    question: "What is a foreign key?",
    options: ["A key from another database server", "A key used to encrypt the table", "Any column that has an index", "A column (or set of columns) whose values must match a primary or unique key in another (or the same) table, enforcing referential integrity"],
    answer: 3,
    explanation: "A foreign key links a child row to a parent row, e.g. orders.customer_id → customers.id. The DBMS rejects child values that don't exist in the parent (NULLs are allowed unless the column is NOT NULL) and controls what happens when a parent is deleted or updated.",
    optionExplanations: ["It's about referencing within the database schema.", "Keys here are about identity and relationships, not encryption.", "Indexes and keys are different concepts.", "Correct."]
  },
  {
    id: "sql-fund-005", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "concept",
    question: "What is the difference between a super key and a candidate key?",
    options: ["They're identical", "A super key is any set of attributes that uniquely identifies rows; a candidate key is a MINIMAL super key (no attribute can be removed)", "A candidate key may contain duplicates; a super key can't", "A super key must be a single column"],
    answer: 1,
    explanation: "If {id} identifies rows, then {id}, {id, name} and {id, name, email} are all super keys, but only {id} is minimal and therefore a candidate key. A table can have several candidate keys; one is chosen as the primary key and the rest are alternate keys.",
    optionExplanations: ["Super keys can contain extra attributes.", "Correct.", "Both must uniquely identify rows.", "Super keys can have any number of attributes."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-fund-006", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "concept",
    question: "In a table `Student(roll_no, email, phone, name)`, both roll_no and email are unique and non-null. roll_no is chosen as the primary key. What is email called?",
    options: ["Foreign key", "Composite key", "Alternate key", "Surrogate key"],
    answer: 2,
    explanation: "Every candidate key not chosen as the primary key is an alternate (secondary) key. It's usually enforced with a UNIQUE constraint.",
    optionExplanations: ["email doesn't reference another table.", "A composite key has multiple columns.", "Correct.", "A surrogate key is an artificial identifier like an auto-increment id."]
  },
  {
    id: "sql-fund-007", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "concept",
    question: "In `Enrollment(student_id, course_id, grade)`, the pair (student_id, course_id) uniquely identifies each row. Such a primary key is called a:",
    options: ["Composite key", "Foreign key", "Super-primary key", "Partial key"],
    answer: 0,
    explanation: "A composite (compound) key consists of two or more columns that together are unique. Junction tables for many-to-many relationships commonly use the pair of foreign keys as a composite primary key.",
    optionExplanations: ["Correct.", "Each column may individually be a foreign key, but the pair is the composite primary key.", "No such standard term.", "'Partial key' refers to a weak entity's discriminator."]
  },
  {
    id: "sql-fund-008", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "Which statement about PRIMARY KEY vs UNIQUE constraints is correct?",
    options: ["A table can have multiple primary keys but only one unique constraint", "UNIQUE columns can never contain NULL", "A table has at most one primary key (non-null), but can have many UNIQUE constraints, which generally allow NULLs", "Primary keys allow duplicate values if they are NULL"],
    answer: 2,
    explanation: "Only one primary key per table; its columns are implicitly NOT NULL. UNIQUE constraints can be declared on many column sets. Because NULL is 'unknown', most databases (PostgreSQL, MySQL, Oracle) allow multiple NULLs in a UNIQUE column; SQL Server allows only one.",
    optionExplanations: ["It's the other way round.", "UNIQUE generally permits NULLs.", "Correct.", "Primary key columns can't be NULL at all."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-fund-009", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "concept",
    question: "Classify these commands: `UPDATE`, `GRANT`, `COMMIT`, `ALTER`.",
    options: ["DML, DCL, TCL, DDL", "DDL, DML, DCL, TCL", "DML, TCL, DCL, DDL", "DCL, DCL, TCL, DML"],
    answer: 0,
    explanation: "DDL (Data Definition) defines structure: CREATE, ALTER, DROP, TRUNCATE. DML (Data Manipulation) changes rows: INSERT, UPDATE, DELETE (SELECT is sometimes called DQL). DCL (Data Control) manages permissions: GRANT, REVOKE. TCL (Transaction Control): COMMIT, ROLLBACK, SAVEPOINT.",
    optionExplanations: ["Correct.", "UPDATE modifies data, so it's DML, not DDL.", "GRANT is DCL and COMMIT is TCL.", "UPDATE is DML and ALTER is DDL."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-fund-010", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "numerical",
    question: "A relation has 6 attributes and currently contains 250 tuples. What are its degree and cardinality?",
    options: ["Degree 250, cardinality 6", "Degree 6, cardinality 6", "Degree 6, cardinality 250", "Degree 1500, cardinality 250"],
    answer: 2,
    explanation: "In relational terminology, DEGREE (arity) is the number of attributes (columns) and CARDINALITY is the number of tuples (rows). A tuple is a row, an attribute is a column, and a domain is the set of allowed values for an attribute.",
    optionExplanations: ["The two terms are swapped.", "Cardinality counts rows.", "Correct.", "Degree is the number of columns, not rows × columns."]
  },
  {
    id: "sql-fund-011", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "concept",
    question: "What is the difference between a database schema and a database instance?",
    options: ["They are the same", "The schema is the structure (tables, columns, constraints), which changes rarely; the instance is the data stored at a particular moment, which changes constantly", "The schema is the data; the instance is the structure", "An instance is a backup of the schema"],
    answer: 1,
    explanation: "The schema (intension) is the design: table definitions and constraints. The instance (extension or state) is the actual set of rows at a point in time. Every INSERT/UPDATE/DELETE produces a new instance of the same schema.",
    optionExplanations: ["They describe different things.", "Correct.", "Reversed.", "An instance is the current data, not a backup."]
  },
  {
    id: "sql-fund-012", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "numerical",
    question: "Relation R(A, B, C, D) has exactly one candidate key, {A}. How many super keys does R have?",
    options: ["4", "16", "15", "8"],
    answer: 3,
    explanation: "A super key is any superset of a candidate key. Every super key must contain A; each of the other 3 attributes (B, C, D) can be included or not, giving 2³ = 8 super keys: A, AB, AC, AD, ABC, ABD, ACD, ABCD.",
    optionExplanations: ["That counts only A plus single additions.", "16 counts all subsets, including those without A.", "15 is the number of non-empty subsets of 4 attributes.", "Correct: 2^(n−1) with n = 4."]
  },
  {
    id: "sql-fund-013", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "hard", type: "numerical",
    question: "Relation R(A, B, C, D) has two candidate keys: {A} and {B}. How many super keys does it have?",
    options: ["8", "16", "12", "10"],
    answer: 2,
    explanation: "Use inclusion–exclusion. Supersets of A: 2³ = 8. Supersets of B: 2³ = 8. Supersets of both A and B (counted twice): 2² = 4. Total = 8 + 8 − 4 = 12.",
    optionExplanations: ["That counts only one candidate key's supersets.", "That double-counts sets containing both A and B.", "Correct: 8 + 8 − 4.", "The overlap is 4, not 6."]
  },
  {
    id: "sql-fund-014", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "hard", type: "numerical",
    question: "Relation R(A, B, C, D, E) has candidate keys {A, B} and {C, D}. How many super keys does R have?",
    options: ["16", "12", "14", "10"],
    answer: 2,
    explanation: "Supersets of AB: the remaining 3 attributes are free → 2³ = 8. Supersets of CD: 2³ = 8. Supersets of both (must contain A, B, C, D; E free): 2¹ = 2. Inclusion–exclusion: 8 + 8 − 2 = 14.",
    optionExplanations: ["That ignores the overlap.", "The overlap is 2 sets (ABCD and ABCDE), not 4.", "Correct.", "Each candidate key alone contributes 8."]
  },
  {
    id: "sql-fund-015", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "numerical",
    question: "R(A, B, C, D) has functional dependencies A → B, A → C, C → D. What is the candidate key?",
    options: ["{A}", "{A, C}", "{C}", "{A, B, C, D}"],
    answer: 0,
    explanation: "A never appears on the right side of any FD, so every key must contain A. Its closure: A⁺ = {A} → add B, C (from A → B, A → C) → add D (from C → D) = {A, B, C, D}. Since A alone determines everything and is minimal, {A} is the only candidate key.",
    optionExplanations: ["Correct.", "{A, C} is a super key but not minimal.", "C⁺ = {C, D}, which misses A and B.", "That's a super key, not minimal."]
  },
  {
    id: "sql-fund-016", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "orders.customer_id references customers.id with `ON DELETE CASCADE`. What happens when customer 7 is deleted?",
    options: ["The delete fails because orders reference it", "Nothing happens to the orders", "Those orders get customer_id set to NULL", "All orders with customer_id = 7 are automatically deleted too"],
    answer: 3,
    explanation: "Referential actions define what happens to child rows when a parent is deleted/updated: CASCADE propagates the delete, SET NULL nulls the FK, SET DEFAULT sets the default, and RESTRICT / NO ACTION (the usual default) rejects the parent delete while children exist.",
    optionExplanations: ["That's RESTRICT / NO ACTION.", "Leaving orphans would break referential integrity.", "That's ON DELETE SET NULL.", "Correct."]
  },
  {
    id: "sql-fund-017", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "With a foreign key orders.customer_id → customers.id and no ON DELETE clause, what happens if you run `INSERT INTO orders(id, customer_id) VALUES (1, 999)` when customer 999 doesn't exist?",
    options: ["The row is inserted and customer 999 is created automatically", "The insert is rejected with a foreign key violation", "The row is inserted with customer_id NULL", "The insert succeeds; FKs are only checked on delete"],
    answer: 1,
    explanation: "Referential integrity requires every non-NULL foreign key value to exist in the referenced key. The DBMS checks on insert/update of the child and on delete/update of the parent. (In SQLite, FK enforcement must be enabled with PRAGMA foreign_keys = ON.)",
    optionExplanations: ["Databases never create parent rows implicitly.", "Correct.", "Values aren't silently replaced.", "Inserts into the child are checked."]
  },
  {
    id: "sql-fund-018", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "What do 'entity integrity' and 'referential integrity' require?",
    options: ["Entity: no NULLs in the primary key; Referential: foreign key values must match an existing referenced key (or be NULL)", "Entity: every table has an index; Referential: every column is unique", "Entity: no duplicate tables; Referential: no circular references", "Both mean that the table has a primary key"],
    answer: 0,
    explanation: "These are the two core integrity rules of the relational model. Entity integrity guarantees every row can be identified; referential integrity guarantees relationships never point to missing rows.",
    optionExplanations: ["Correct.", "Indexes aren't part of these rules.", "Neither rule is about duplicate tables or cycles.", "They're two distinct rules."]
  },
  {
    id: "sql-fund-019", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "A table has `age INT CHECK (age >= 18)`. In PostgreSQL (or MySQL 8.0.16+), what happens on `INSERT ... age = 15`?",
    options: ["The row is inserted with age 18", "The insert is rejected because the CHECK constraint fails", "The row is inserted with age NULL", "A warning is logged but the row is inserted"],
    answer: 1,
    explanation: "CHECK constraints enforce a boolean condition on each row; a row making it FALSE is rejected. Note: a CHECK that evaluates to UNKNOWN (e.g. age NULL) passes. Older MySQL versions parsed but silently ignored CHECK constraints, a classic gotcha.",
    optionExplanations: ["Values are never auto-corrected.", "Correct.", "Constraints don't substitute NULL.", "Violations are errors in modern MySQL and PostgreSQL."]
  },
  {
    id: "sql-fund-020", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "What is a surrogate key, and why might you prefer it to a natural key like email?",
    options: ["A key copied from another table; it's faster to join", "A temporary key used only during transactions", "A key that allows NULLs", "An artificial, meaningless identifier (e.g. auto-increment or UUID); it never changes even if business data like email changes, and keeps foreign keys small"],
    answer: 3,
    explanation: "Natural keys come from real-world data and can change (people change emails) or be wide strings, which ripple through every referencing table. Surrogate keys are stable and compact. You still usually add UNIQUE constraints on natural identifiers.",
    optionExplanations: ["That describes a foreign key.", "Surrogate keys are permanent row identifiers.", "Primary keys never allow NULLs.", "Correct."]
  },
  {
    id: "sql-fund-021", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "In the three-schema architecture, adding an index or moving a table to a different disk without changing any application query is an example of:",
    options: ["Physical data independence", "Logical data independence", "Referential integrity", "Normalization"],
    answer: 0,
    explanation: "The ANSI/SPARC architecture separates the external (views), conceptual (logical tables) and internal (physical storage) levels. Physical data independence means storage changes don't affect the conceptual schema. Logical data independence (harder to achieve) means changing the conceptual schema, e.g. adding a column, doesn't break external views/apps.",
    optionExplanations: ["Correct.", "Logical independence concerns conceptual-schema changes.", "Unrelated to storage changes.", "Normalization is about table design."]
  },
  {
    id: "sql-fund-022", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "When converting a one-to-many (1:N) relationship between Department (1) and Employee (N) into tables, where does the relationship go?",
    options: ["A separate junction table is always required", "A list of employee ids stored in one Department column", "A foreign key employee_id in the Department table", "A foreign key column dept_id in the Employee table (the 'many' side)"],
    answer: 3,
    explanation: "For 1:N, put the foreign key on the N side, because each employee references exactly one department. Putting it on the 1 side would need multiple values per row (violating 1NF). Only M:N relationships require a junction table.",
    optionExplanations: ["Junction tables are needed for M:N, not 1:N.", "Lists in a column violate 1NF.", "A department has many employees, so one column can't hold them.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-fund-023", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "numerical",
    question: "An ER diagram has entities Student and Course connected by a many-to-many relationship Enrolls (with attribute grade). What is the minimum number of tables needed?",
    options: ["2", "1", "4", "3"],
    answer: 3,
    explanation: "Each strong entity becomes a table (Student, Course). An M:N relationship can't be absorbed into either side, so it needs its own junction table Enrolls(student_id, course_id, grade) with the pair as its key. Total: 3.",
    optionExplanations: ["The M:N relationship needs its own table.", "Entities need separate tables.", "No other constructs need tables.", "Correct."]
  },
  {
    id: "sql-fund-024", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "hard", type: "numerical",
    question: "An ER model has: E1 —(1:N)— E2 via R1; E2 —(M:N)— E3 via R2; and E3 has one multivalued attribute (phones). Using standard mapping rules, what is the minimum number of relational tables?",
    options: ["3", "4", "5", "6"],
    answer: 2,
    explanation: "E1, E2, E3 → 3 tables. R1 (1:N) is absorbed as a foreign key in E2 → 0 extra. R2 (M:N) needs a junction table → +1. A multivalued attribute needs its own table (E3_id, phone) to keep 1NF → +1. Total 5.",
    optionExplanations: ["Relationships and multivalued attributes add tables.", "The multivalued attribute also needs a table.", "Correct.", "R1 doesn't need its own table."]
  },
  {
    id: "sql-fund-025", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "What is a weak entity in an ER model?",
    options: ["An entity with fewer than three attributes", "An entity that can't be uniquely identified by its own attributes and depends on an owner entity; its key is the owner's key plus a partial key (discriminator)", "An entity without any relationships", "An entity whose attributes are all optional"],
    answer: 1,
    explanation: "Example: Dependent(name, age) of an Employee. Two employees can each have a dependent named 'Riya', so the dependent is identified by (employee_id, name). It's drawn as a double rectangle with a double-diamond identifying relationship and total participation.",
    optionExplanations: ["The number of attributes is irrelevant.", "Correct.", "Weak entities always participate in an identifying relationship.", "Optional attributes don't make an entity weak."]
  },
  {
    id: "sql-fund-026", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "concept",
    question: "In an ER diagram, a person's `age` computed from `date_of_birth`, and their multiple `phone_numbers`, are respectively:",
    options: ["Composite and key attributes", "Derived and multivalued attributes", "Multivalued and derived attributes", "Simple and composite attributes"],
    answer: 1,
    explanation: "A derived attribute (dashed ellipse) can be computed from other data, so it's usually not stored. A multivalued attribute (double ellipse) can hold several values per entity and becomes a separate table. A composite attribute like name can be split into first/last.",
    optionExplanations: ["Neither is composite or a key here.", "Correct.", "The two are swapped.", "Both are special attribute types."]
  },
  {
    id: "sql-fund-027", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "In an ER diagram, 'every Employee must work in some Department' is represented as:",
    options: ["Partial participation of Employee (single line)", "Total participation of Employee (double line between Employee and the relationship)", "A weak entity", "A derived attribute"],
    answer: 1,
    explanation: "Participation constraints say whether every entity must take part in a relationship. Total (mandatory) participation is drawn with a double line; partial (optional) with a single line. In tables, total participation on the N side usually means the FK is NOT NULL.",
    optionExplanations: ["Partial means some employees might have no department.", "Correct.", "Employee is identifiable on its own.", "Participation isn't an attribute."]
  },
  {
    id: "sql-fund-028", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "Identifying common attributes of Car and Truck and creating a higher-level entity Vehicle is called:",
    options: ["Specialization", "Generalization", "Aggregation", "Normalization"],
    answer: 1,
    explanation: "Generalization is bottom-up: combine lower-level entities into a more general superclass. Specialization is top-down: split an entity into subclasses (Employee → Engineer, Manager). Aggregation treats a relationship set as an entity so it can participate in another relationship.",
    optionExplanations: ["Specialization goes from general to specific.", "Correct.", "Aggregation is about relationships as entities.", "Normalization is a table-design process."]
  },
  {
    id: "sql-fund-029", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "In relational algebra, what do σ (selection) and π (projection) do?",
    options: ["σ chooses columns; π chooses rows", "σ filters rows by a condition; π chooses columns (and removes duplicate tuples)", "Both join tables", "σ sorts; π groups"],
    answer: 1,
    explanation: "σ_condition(R) corresponds to SQL WHERE; π_attributes(R) corresponds to the SELECT list. Because relational algebra works on sets, projection eliminates duplicates — unlike SQL's SELECT, which keeps them unless you use DISTINCT.",
    optionExplanations: ["Reversed.", "Correct.", "Join is ⋈.", "Sorting isn't part of basic relational algebra."]
  },
  {
    id: "sql-fund-030", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "hard", type: "numerical",
    question: "Employee has 5 rows with dept values [10, 10, 20, 20, 20]. How many tuples does the relational-algebra expression π_dept(Employee) produce, and how many rows does SQL `SELECT dept FROM Employee` return?",
    options: ["2 and 2", "5 and 5", "2 and 5", "5 and 2"],
    answer: 2,
    explanation: "Relational algebra operates on sets, so projection removes duplicates: {10, 20} → 2 tuples. SQL tables are multisets (bags): SELECT keeps duplicates, returning 5 rows, unless you write SELECT DISTINCT.",
    optionExplanations: ["SQL keeps duplicates by default.", "Relational algebra removes duplicates.", "Correct.", "It's the other way round."],
    tags: ["trap"]
  },
  {
    id: "sql-fund-031", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "hard", type: "concept",
    question: "Which relational-algebra operator answers 'find students who have enrolled in ALL courses'?",
    options: ["Division (÷)", "Union (∪)", "Cartesian product (×)", "Set difference (−) alone"],
    answer: 0,
    explanation: "Division Enrolled(student, course) ÷ Courses(course) returns students paired with every course in Courses. SQL has no division operator; it's written with a double NOT EXISTS ('there's no course the student hasn't taken') or GROUP BY student HAVING COUNT(DISTINCT course) = (SELECT COUNT(*) FROM courses).",
    optionExplanations: ["Correct.", "Union combines tuples from two relations.", "Product pairs every tuple; it doesn't test 'for all'.", "Difference is used inside the expansion of division, but alone it doesn't express 'all'."]
  },
  {
    id: "sql-fund-032", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "numerical",
    question: "R has 4 tuples and 3 attributes; S has 5 tuples and 2 attributes. How many tuples and attributes does the Cartesian product R × S have?",
    options: ["20 tuples, 5 attributes", "9 tuples, 6 attributes", "20 tuples, 6 attributes", "9 tuples, 5 attributes"],
    answer: 0,
    explanation: "The Cartesian product pairs every tuple of R with every tuple of S, giving 4 × 5 = 20 tuples, and concatenates the attributes: 3 + 2 = 5. SQL's CROSS JOIN behaves the same way.",
    optionExplanations: ["Correct.", "Tuple counts multiply; attribute counts add.", "Attributes add (3 + 2), not multiply.", "Tuples multiply, not add."]
  },
  {
    id: "sql-fund-033", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "hard", type: "concept",
    question: "In PostgreSQL (default settings), a column `email` has a UNIQUE constraint. What happens when you insert two rows with email = NULL?",
    options: ["Both inserts succeed, because NULLs are not considered equal to each other for uniqueness", "The second insert fails with a unique violation", "Both rows are merged into one", "PostgreSQL forbids NULL in UNIQUE columns"],
    answer: 0,
    explanation: "Standard SQL treats NULLs as distinct for UNIQUE constraints, so multiple NULLs are allowed (PostgreSQL, MySQL, Oracle for single columns). PostgreSQL 15+ offers `UNIQUE NULLS NOT DISTINCT` to allow at most one NULL; SQL Server's UNIQUE allows only one NULL by default.",
    optionExplanations: ["Correct.", "That's SQL Server's behaviour, not PostgreSQL's default.", "Rows are never merged.", "UNIQUE columns may contain NULL unless also NOT NULL."],
    tags: ["trap"]
  },
  {
    id: "sql-fund-034", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "hard", type: "concept",
    question: "employees(id PK, manager_id REFERENCES employees(id) ON DELETE CASCADE). The CEO (id 1) manages 2 people, each of whom manages 3 people. How many rows are removed by `DELETE FROM employees WHERE id = 1`?",
    options: ["1", "3", "9", "7"],
    answer: 2,
    explanation: "A self-referencing foreign key with CASCADE propagates recursively: deleting the CEO deletes the 2 direct reports, whose deletion cascades to their 3 reports each (6). Total: 1 + 2 + 6 = 9 rows.",
    optionExplanations: ["CASCADE also deletes the subordinates.", "The cascade continues down to the next level.", "Correct: 1 + 2 + 6.", "The second level has 2 × 3 = 6 employees."]
  },
  {
    id: "sql-fund-035", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "A foreign key column must reference which kind of column(s) in the parent table?",
    options: ["Any column with an index", "Only an auto-increment column", "Any column of the same data type", "A PRIMARY KEY or UNIQUE column (set)"],
    answer: 3,
    explanation: "The referenced columns must be guaranteed unique so each child value identifies exactly one parent row. Most databases require a PRIMARY KEY or UNIQUE constraint on them (MySQL/InnoDB is laxer and only requires an index, but referencing non-unique columns is strongly discouraged).",
    optionExplanations: ["An ordinary index doesn't guarantee uniqueness.", "Any primary/unique key works.", "Matching types are necessary but not sufficient.", "Correct."]
  },
  {
    id: "sql-fund-036", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "easy", type: "concept",
    question: "Which data model stores records as JSON-like documents with flexible fields?",
    options: ["Relational model", "Network model (CODASYL)", "Hierarchical model (e.g. IBM IMS)", "Document model (e.g. MongoDB)"],
    answer: 3,
    explanation: "Data models describe how data is structured: hierarchical (tree of parent-child records), network (graph of records with sets), relational (tables), document (self-describing JSON/BSON documents), plus key-value, wide-column and graph models in NoSQL systems.",
    optionExplanations: ["Relational uses fixed-schema tables.", "The network model uses linked record sets.", "Hierarchical stores records in trees.", "Correct."]
  },
  {
    id: "sql-fund-037", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "How is a 1:1 relationship between Person and Passport (every passport belongs to exactly one person; not every person has a passport) best mapped?",
    options: ["A junction table with two foreign keys", "Put passport_id in Person and allow duplicates", "Put person_id as a UNIQUE NOT NULL foreign key in Passport (the side with total participation)", "Store both in one table and allow NULL passport columns for everyone"],
    answer: 2,
    explanation: "For 1:1, add a foreign key on one side and make it UNIQUE to keep the relationship one-to-one. Placing it on the side with total participation (Passport) lets it be NOT NULL and avoids NULLs for people without passports. Merging into one table is possible but wastes space when participation is partial.",
    optionExplanations: ["A junction table is unnecessary for 1:1.", "Duplicates would allow two people per passport.", "Correct.", "This works but leaves many NULLs; it's not the best mapping here."]
  },
  {
    id: "sql-fund-038", subject: "sql", subtopic: "DBMS Fundamentals & Keys", difficulty: "medium", type: "concept",
    question: "What does a domain constraint enforce?",
    options: ["That each table belongs to one schema", "That every value in a column comes from the column's allowed set (its data type, plus constraints such as NOT NULL or CHECK)", "That foreign keys match", "That the database has one owner"],
    answer: 1,
    explanation: "A domain is the set of permissible values for an attribute. Data types (INT, DATE, VARCHAR(50)), NOT NULL, CHECK (salary > 0) and ENUM-like constraints all restrict the domain. Inserting 'abc' into an INT column violates the domain.",
    optionExplanations: ["That's about schemas, not values.", "Correct.", "That's referential integrity.", "Ownership is about permissions."]
  }
);
