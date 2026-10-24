/* SQL / DBMS — Normalization */
window.QUESTIONS.push(
  {
    id: "sql-norm-001", subject: "sql", subtopic: "Normalization", difficulty: "easy", type: "concept",
    question: "A single table stores (student_id, course_id, course_title, instructor). If the last student enrolled in a course is deleted, the course's title and instructor are lost too. Which anomaly is this?",
    options: ["Insertion anomaly", "Phantom read", "Update anomaly", "Deletion anomaly"],
    answer: 3,
    explanation: "Redundant, mixed-subject tables cause three anomalies: INSERTION (can't add a course until a student enrols), DELETION (removing the last enrolment erases course facts), UPDATE (changing an instructor requires updating many rows, risking inconsistency). Normalization splits the data so each fact is stored once.",
    optionExplanations: ["Insertion anomalies prevent adding facts.", "Phantom reads are a concurrency issue.", "Update anomalies involve inconsistent duplicate updates.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-norm-002", subject: "sql", subtopic: "Normalization", difficulty: "easy", type: "concept",
    question: "What does the functional dependency X → Y mean?",
    options: ["X and Y are always equal", "X is a foreign key to Y", "Y determines X", "Any two rows that agree on X must also agree on Y; X uniquely determines Y"],
    answer: 3,
    explanation: "Example: emp_id → name means each employee id corresponds to exactly one name. FDs are constraints derived from the meaning of the data, not from a particular instance, and they're the basis for keys and normal forms.",
    optionExplanations: ["The values themselves needn't be equal.", "FDs aren't referential constraints.", "The direction matters: X determines Y.", "Correct."]
  },
  {
    id: "sql-norm-003", subject: "sql", subtopic: "Normalization", difficulty: "easy", type: "concept",
    question: "Which functional dependency is TRIVIAL?",
    options: ["A → B", "AB → A", "A → BC", "AB → C"],
    answer: 1,
    explanation: "X → Y is trivial when Y ⊆ X: it always holds regardless of the data (by reflexivity). AB → A is trivial; the others express real constraints.",
    optionExplanations: ["B isn't contained in A.", "Correct.", "BC isn't contained in A.", "C isn't contained in AB."]
  },
  {
    id: "sql-norm-004", subject: "sql", subtopic: "Normalization", difficulty: "easy", type: "concept",
    question: "A customers table has a column phones containing values like '98765, 91234'. Which normal form does it violate?",
    options: ["3NF only", "2NF only", "1NF", "BCNF only"],
    answer: 2,
    explanation: "1NF requires atomic (indivisible) values and no repeating groups. A comma-separated list makes it hard to query, index or constrain individual phones. Fix: a separate customer_phones(customer_id, phone) table.",
    optionExplanations: ["3NF concerns transitive dependencies.", "2NF concerns partial dependencies on a composite key.", "Correct.", "Since 1NF is already violated, so are the higher forms; the root issue is 1NF."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-norm-005", subject: "sql", subtopic: "Normalization", difficulty: "easy", type: "concept",
    question: "Which statement defines Second Normal Form (2NF)?",
    options: ["No multivalued attributes", "No transitive dependencies", "In 1NF, and every non-prime attribute depends on the WHOLE of every candidate key (no partial dependency on part of a composite key)", "Every determinant is a candidate key"],
    answer: 2,
    explanation: "Example: Enrollment(student_id, course_id, course_title) with key (student_id, course_id) violates 2NF because course_title depends only on course_id. Move it to Course(course_id, course_title).",
    optionExplanations: ["That's part of 1NF.", "That's 3NF.", "Correct.", "That's BCNF."]
  },
  {
    id: "sql-norm-006", subject: "sql", subtopic: "Normalization", difficulty: "easy", type: "concept",
    question: "Employee(emp_id, dept_id, dept_name), where emp_id → dept_id and dept_id → dept_name. Which normal form is violated, and why?",
    options: ["1NF: dept_name isn't atomic", "2NF: there's a partial dependency", "3NF: dept_name depends on the key only transitively (emp_id → dept_id → dept_name)", "BCNF only, but 3NF holds"],
    answer: 2,
    explanation: "3NF forbids non-prime attributes depending on other non-prime attributes (transitive dependency). The key is a single attribute, so 2NF holds automatically. Fix: Dept(dept_id, dept_name) and keep only dept_id in Employee.",
    optionExplanations: ["All values are atomic.", "With a single-attribute key there are no partial dependencies.", "Correct.", "3NF is violated because dept_id isn't a superkey and dept_name isn't prime."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-norm-007", subject: "sql", subtopic: "Normalization", difficulty: "easy", type: "concept",
    question: "What is the condition for Boyce-Codd Normal Form (BCNF)?",
    options: ["No NULL values", "For every non-trivial FD X → Y, X is a superkey", "Every attribute is part of some key", "The table has a single-column primary key"],
    answer: 1,
    explanation: "BCNF is stricter than 3NF: every determinant must be a superkey. 3NF additionally allows X → A when A is a prime attribute (part of some candidate key).",
    optionExplanations: ["NULLs aren't part of normal form definitions.", "Correct.", "That describes all-prime relations, which may still violate BCNF.", "Key width isn't the condition."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-norm-008", subject: "sql", subtopic: "Normalization", difficulty: "easy", type: "concept",
    question: "Which are Armstrong's three basic axioms for functional dependencies?",
    options: ["Union, decomposition, pseudo-transitivity", "Reflexivity, augmentation, transitivity", "Atomicity, consistency, isolation", "Commutativity, associativity, distributivity"],
    answer: 1,
    explanation: "Reflexivity: if Y ⊆ X then X → Y. Augmentation: if X → Y then XZ → YZ. Transitivity: if X → Y and Y → Z then X → Z. They're sound and complete; union, decomposition and pseudo-transitivity are derived from them.",
    optionExplanations: ["These are derived rules.", "Correct.", "Those are ACID properties.", "Those are algebraic laws."]
  },
  {
    id: "sql-norm-009", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "numerical",
    question: "R(A, B, C, D, E, F) with F = {A → B, C → D, AD → E, E → F}. What is the closure (AC)⁺?",
    options: ["{A, B, C, D}", "{A, B, C, D, E}", "{A, B, C, D, E, F}", "{A, C}"],
    answer: 2,
    explanation: "Start with {A, C}. A → B adds B; C → D adds D; now AD ⊆ closure, so AD → E adds E; E → F adds F. Result {A, B, C, D, E, F}, so AC is a superkey (in fact the candidate key).",
    optionExplanations: ["AD → E applies once D is added.", "E → F applies after E is added.", "Correct.", "A → B and C → D apply immediately."]
  },
  {
    id: "sql-norm-010", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "numerical",
    question: "Same R(A, B, C, D, E, F) with F = {A → B, C → D, AD → E, E → F}. What is (AD)⁺?",
    options: ["{A, B, D, E, F}", "{A, B, C, D, E, F}", "{A, D, E}", "{A, B, D}"],
    answer: 0,
    explanation: "From {A, D}: A → B adds B; AD → E adds E; E → F adds F. Nothing yields C (only C itself determines anything about C), so (AD)⁺ = {A, B, D, E, F}. AD is not a superkey.",
    optionExplanations: ["Correct.", "No FD determines C.", "A → B and E → F also apply.", "AD → E and E → F also apply."]
  },
  {
    id: "sql-norm-011", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "numerical",
    question: "R(A, B, C, D, E) with F = {A → B, B → C, C → D, D → E}. What is the candidate key and the highest normal form R satisfies?",
    options: ["Key A; 2NF", "Key A; 3NF", "Key AB; 1NF", "Key A; BCNF"],
    answer: 0,
    explanation: "A⁺ = ABCDE, so A is the only candidate key (A never appears on a right side). With a single-attribute key there can't be partial dependencies → 2NF. But B → C, C → D, D → E are transitive dependencies of non-prime attributes through non-superkeys → not 3NF.",
    optionExplanations: ["Correct.", "B → C has a non-superkey determinant and non-prime C.", "A alone determines everything.", "BCNF requires every determinant to be a superkey."]
  },
  {
    id: "sql-norm-012", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "numerical",
    question: "R(A, B, C, D) with F = {AB → C, B → D}. What is the highest normal form?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: 0,
    explanation: "The candidate key is AB (A and B never appear on a right side; AB⁺ = ABCD). D is non-prime and depends on B, a PROPER SUBSET of the key: a partial dependency, so 2NF is violated. Decompose into (B, D) and (A, B, C).",
    optionExplanations: ["Correct.", "B → D is a partial dependency.", "2NF already fails.", "B isn't a superkey."]
  },
  {
    id: "sql-norm-013", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "numerical",
    question: "R(A, B, C) with F = {A → B, B → A, A → C}. What are the candidate keys and the highest normal form?",
    options: ["Key A only; 3NF", "Keys A and B; BCNF", "Key AB; 2NF", "Keys A and B; 3NF but not BCNF"],
    answer: 1,
    explanation: "A⁺ = ABC and B⁺ = BAC, so both A and B are candidate keys. Every FD's left side (A or B) is a superkey, so R is in BCNF.",
    optionExplanations: ["B⁺ also contains all attributes.", "Correct.", "Single attributes are already keys.", "All determinants are superkeys, so BCNF holds."]
  },
  {
    id: "sql-norm-014", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "concept",
    question: "Given A → B and CB → D, which FD can be derived by the pseudo-transitivity rule?",
    options: ["A → D", "AC → D", "C → D", "B → D"],
    answer: 1,
    explanation: "Pseudo-transitivity: if X → Y and WY → Z then WX → Z. With X = A, Y = B, W = C: AC → D. Proof: augment A → B with C to get AC → BC (= CB), then transitivity with CB → D.",
    optionExplanations: ["C is also needed.", "Correct.", "B is needed, which comes from A.", "B alone isn't enough; CB → D needs C."]
  },
  {
    id: "sql-norm-015", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "concept",
    question: "From A → BC, which FDs follow by the decomposition rule, and from A → B and A → C, what follows by the union rule?",
    options: ["A → B and A → C; A → BC", "B → A and C → A; BC → A", "AB → C only; nothing", "Nothing can be derived"],
    answer: 0,
    explanation: "Decomposition (projectivity): X → YZ implies X → Y and X → Z. Union (additivity): X → Y and X → Z imply X → YZ. Note the left side can't be split: AB → C does NOT imply A → C.",
    optionExplanations: ["Correct.", "FD directions can't be reversed.", "Both rules apply here.", "Both rules are valid derived rules."]
  },
  {
    id: "sql-norm-016", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "concept",
    question: "In R(A, B, C, D) with candidate keys AB and AC, which attributes are prime?",
    options: ["A only", "A, B and C", "All four", "D only"],
    answer: 1,
    explanation: "A PRIME attribute belongs to at least one candidate key; others are non-prime. Here A, B, C are prime and D is non-prime. 2NF and 3NF conditions refer to non-prime attributes, so identifying them correctly is essential.",
    optionExplanations: ["B and C also appear in candidate keys.", "Correct.", "D isn't part of any candidate key.", "D is the only NON-prime attribute."]
  },
  {
    id: "sql-norm-017", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "concept",
    question: "R(A, B, C) with F = {B → C} is decomposed into R1(A, B) and R2(B, C). Is the decomposition lossless?",
    options: ["Yes: the common attribute B is a key of R2 (B → C), so R1 ⋈ R2 = R", "No: joins always create spurious tuples", "Only if A → B", "It can't be determined"],
    answer: 0,
    explanation: "A binary decomposition is lossless if the common attributes form a superkey of at least one of the parts: R1 ∩ R2 → R1 or R1 ∩ R2 → R2. Here B → BC, so joining back on B reproduces exactly the original rows.",
    optionExplanations: ["Correct.", "Lossless decompositions don't create spurious tuples.", "B → C is already enough.", "The common-attribute test settles it."]
  },
  {
    id: "sql-norm-018", subject: "sql", subtopic: "Normalization", difficulty: "hard", type: "concept",
    question: "R(A, B, C) has F = {A → B} only, and the instance {(1, x, p), (2, x, q)}. It's decomposed into R1(A, B) and R2(B, C). How many rows does R1 ⋈ R2 contain?",
    options: ["2", "1", "3", "4"],
    answer: 3,
    explanation: "R1 = {(1, x), (2, x)}, R2 = {(x, p), (x, q)}. Joining on B = x pairs every R1 row with every R2 row: 4 rows, including spurious (1, x, q) and (2, x, p). The common attribute B isn't a key of either part, so the decomposition is LOSSY.",
    optionExplanations: ["The join produces extra, spurious rows.", "All rows share B = x.", "Each of 2 R1 rows matches both R2 rows.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "sql-norm-019", subject: "sql", subtopic: "Normalization", difficulty: "hard", type: "concept",
    question: "R(A, B, C) with F = {AB → C, C → B} (keys AB and AC) is decomposed into R1(C, B) and R2(A, C) to reach BCNF. What's the downside?",
    options: ["The decomposition is lossy", "There is no downside", "R2 is not in 1NF", "AB → C is no longer enforceable within a single table: the decomposition is not dependency-preserving"],
    answer: 3,
    explanation: "R is in 3NF (C → B has a prime right side) but not BCNF (C isn't a superkey). The BCNF split is lossless (C → B makes C a key of R1) but AB → C spans both tables, so checking it needs a join. This is why 3NF is sometimes preferred: a lossless, dependency-preserving 3NF decomposition always exists, but BCNF may require giving up dependency preservation.",
    optionExplanations: ["C is a key of R1, so the join is lossless.", "Losing AB → C is the downside.", "Both tables have atomic values.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-norm-020", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "concept",
    question: "A relation's candidate keys are all single attributes, and it's in 1NF. Which normal form is it guaranteed to satisfy?",
    options: ["BCNF", "3NF", "2NF", "None beyond 1NF"],
    answer: 2,
    explanation: "A partial dependency needs a COMPOSITE key (a proper subset determining something). With only single-attribute keys, no proper non-empty subset exists, so 2NF holds automatically. 3NF/BCNF can still fail through transitive dependencies.",
    optionExplanations: ["Transitive dependencies could still violate BCNF.", "Transitive dependencies could still violate 3NF.", "Correct.", "2NF is guaranteed."]
  },
  {
    id: "sql-norm-021", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "concept",
    question: "When might you deliberately DENORMALIZE a schema?",
    options: ["Never; normalized schemas are always best", "For read-heavy analytics or hot paths where expensive joins dominate: e.g. storing order_total or customer_name copies, star schemas in data warehouses — accepting extra storage and update complexity", "To reduce storage", "To make updates simpler"],
    answer: 1,
    explanation: "Normalization minimises redundancy and anomalies (great for OLTP writes). Denormalization trades that for faster reads by pre-joining or caching derived values. You must then keep copies consistent (triggers, application logic, batch jobs, materialized views).",
    optionExplanations: ["Read-heavy systems often denormalize deliberately.", "Correct.", "Denormalization increases storage.", "It makes updates more complex."]
  },
  {
    id: "sql-norm-022", subject: "sql", subtopic: "Normalization", difficulty: "hard", type: "numerical",
    question: "What is a minimal (canonical) cover of F = {A → BC, B → C, A → B, AB → C}?",
    options: ["{A → B, B → C}", "{A → BC, B → C}", "{A → B, A → C, B → C}", "{AB → C, A → B}"],
    answer: 0,
    explanation: "Split right sides: A → B, A → C, B → C, A → B, AB → C. In AB → C, A is extraneous because B → C already holds, so it becomes B → C (a duplicate). A → C is redundant: A → B and B → C imply it. Remove duplicates: {A → B, B → C}.",
    optionExplanations: ["Correct.", "A → C (inside A → BC) is redundant via transitivity.", "A → C is redundant.", "A is extraneous in AB → C."]
  },
  {
    id: "sql-norm-023", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "concept",
    question: "F = {A → B, B → C} and G = {A → B, B → C, A → C}. Are F and G equivalent?",
    options: ["Yes: every FD in G follows from F (A → C by transitivity) and every FD in F is in G", "No: G has more FDs", "No: F is missing A → C so it's weaker", "Only if the relation has three attributes"],
    answer: 0,
    explanation: "Two FD sets are equivalent if each implies the other (they have the same closure F⁺ = G⁺). Check each FD of one set by computing attribute closures under the other set.",
    optionExplanations: ["Correct.", "Extra FDs that are implied don't change the closure.", "A → C is implied by F.", "Equivalence doesn't depend on the number of attributes."]
  },
  {
    id: "sql-norm-024", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "concept",
    question: "Which statement is always true for a relation with exactly two attributes, R(A, B)?",
    options: ["It's in BCNF", "It's in 2NF but may violate 3NF", "It violates 1NF", "It has exactly one candidate key"],
    answer: 0,
    explanation: "With two attributes, the possible non-trivial FDs are A → B or B → A. If A → B holds, A is a key (A determines both); likewise for B. If neither holds, the key is AB and there are no non-trivial FDs. Either way every determinant is a superkey → BCNF.",
    optionExplanations: ["Correct.", "Any two-attribute relation is in BCNF, hence 3NF.", "Atomicity isn't determined by attribute count.", "It may have two candidate keys (A and B)."]
  },
  {
    id: "sql-norm-025", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "concept",
    question: "What is the difference between the formal 3NF and BCNF conditions for a non-trivial FD X → A?",
    options: ["There's no difference", "3NF requires X to be a superkey OR A to be prime; BCNF requires X to be a superkey, with no exception for prime A", "BCNF allows transitive dependencies", "3NF forbids composite keys"],
    answer: 1,
    explanation: "The 'A is prime' escape clause is the only difference. Relations in 3NF but not BCNF have overlapping composite candidate keys, e.g. R(student, course, teacher) with (student, course) → teacher and teacher → course.",
    optionExplanations: ["The prime-attribute exception differs.", "Correct.", "BCNF is stricter than 3NF.", "Both allow composite keys."]
  },
  {
    id: "sql-norm-026", subject: "sql", subtopic: "Normalization", difficulty: "hard", type: "numerical",
    question: "R(A, B, C, D) with F = {AB → C, C → D, D → A}. How many candidate keys does R have?",
    options: ["1", "2", "3", "4"],
    answer: 2,
    explanation: "B never appears on a right side, so every key contains B, and B⁺ = B. Try pairs: AB⁺ = ABCD ✓; BC⁺ = BCDA ✓ (C → D, D → A); BD⁺ = BDA, then AB → C → ABCD ✓. So AB, BC and BD are all minimal keys: 3 candidate keys.",
    optionExplanations: ["BC and BD are also keys.", "There's a third key.", "Correct.", "B alone isn't a key, and every key must contain B."]
  },
  {
    id: "sql-norm-027", subject: "sql", subtopic: "Normalization", difficulty: "hard", type: "numerical",
    question: "R(A, B, C, D) with F = {AB → C, C → D, D → A} has candidate keys AB, BC and BD. What is its highest normal form?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: 2,
    explanation: "All attributes A, B, C, D are prime (each appears in some key), so every FD has a prime right side and 3NF holds (and 2NF trivially). But C → D and D → A have determinants that aren't superkeys (C⁺ = CDA, D⁺ = DA), so BCNF fails.",
    optionExplanations: ["All values are atomic, and higher forms hold.", "3NF also holds because every attribute is prime.", "Correct.", "C and D aren't superkeys."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-norm-028", subject: "sql", subtopic: "Normalization", difficulty: "hard", type: "numerical",
    question: "R(A, B, C, D, E) with F = {A → B, BC → E, ED → A}. What are the candidate keys?",
    options: ["CD only", "ACD, BCD, CDE", "ACD only", "ABCDE"],
    answer: 1,
    explanation: "C and D never appear on a right side, so every key contains CD, but CD⁺ = CD. Add one attribute: ACD⁺ → B (A → B) → E (BC → E) = all ✓. BCD⁺ → E (BC → E) → A (ED → A) = all ✓. CDE⁺ → A (ED → A) → B = all ✓. So the keys are ACD, BCD and CDE; all five attributes are prime, so R is in 3NF but not BCNF (A → B has a non-superkey determinant).",
    optionExplanations: ["CD⁺ = CD doesn't cover everything.", "Correct.", "BCD and CDE are also minimal keys.", "That's a superkey, not minimal."]
  },
  {
    id: "sql-norm-029", subject: "sql", subtopic: "Normalization", difficulty: "hard", type: "numerical",
    question: "R(A, B, C, D) with F = {A → B, B → C, C → D, D → A}. How many candidate keys and how many super keys does R have?",
    options: ["4 candidate keys, 15 super keys", "1 candidate key, 8 super keys", "4 candidate keys, 4 super keys", "4 candidate keys, 16 super keys"],
    answer: 0,
    explanation: "The FDs form a cycle, so each single attribute determines all others: A, B, C and D are each candidate keys. Then EVERY non-empty subset of {A, B, C, D} is a super key: 2⁴ − 1 = 15. R is in BCNF.",
    optionExplanations: ["Correct.", "Each attribute alone is a key.", "Supersets of keys are also super keys.", "The empty set isn't a super key."]
  },
  {
    id: "sql-norm-030", subject: "sql", subtopic: "Normalization", difficulty: "hard", type: "numerical",
    question: "R(A, B, C, D, E, F, G, H) with F = {A → BC, CD → E, E → F, F → GH}. What is the candidate key and the highest normal form?",
    options: ["Key AD; 1NF", "Key A; 2NF", "Key AD; 3NF", "Key ACD; 2NF"],
    answer: 0,
    explanation: "A and D never appear on a right side; AD⁺ = A, D → B, C (A → BC) → E (CD → E) → F → G, H = all, so AD is the only candidate key. A → BC means non-prime B, C depend on PART of the key: a partial dependency, so R isn't in 2NF → highest is 1NF.",
    optionExplanations: ["Correct.", "A⁺ = ABC, so A alone isn't a key.", "Partial dependencies already break 2NF.", "C isn't needed: A determines C."]
  },
  {
    id: "sql-norm-031", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "numerical",
    question: "R(A, B, C, D, E) with F = {AB → C, C → D, D → E}. What is the highest normal form?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: 1,
    explanation: "The only key is AB. No proper subset of AB (A or B) determines anything, so there are no partial dependencies → 2NF. But C → D and D → E are transitive (non-superkey determinants, non-prime right sides) → not 3NF.",
    optionExplanations: ["No partial dependencies exist.", "Correct.", "C → D violates 3NF.", "C isn't a superkey."]
  },
  {
    id: "sql-norm-032", subject: "sql", subtopic: "Normalization", difficulty: "hard", type: "numerical",
    question: "R(A, B, C, D, E) with F = {AB → CDE, C → A}. What is the highest normal form?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: 2,
    explanation: "Keys: AB (AB⁺ = ABCDE) and BC (BC⁺ → A via C → A → then AB → CDE) — so A, B, C are prime. C → A has a non-superkey left side (C⁺ = CA), which violates BCNF, but A is prime, so 3NF holds. No proper subset of a key determines a non-prime attribute (D, E need AB or BC), so 2NF holds too.",
    optionExplanations: ["Values are atomic and higher forms hold.", "3NF also holds because A is prime.", "Correct.", "C isn't a superkey."]
  },
  {
    id: "sql-norm-033", subject: "sql", subtopic: "Normalization", difficulty: "hard", type: "numerical",
    question: "R(A, B, C, D, E) has candidate keys AB and BC (and no others). How many super keys does it have?",
    options: ["8", "14", "16", "12"],
    answer: 3,
    explanation: "Supersets of AB: the other 3 attributes are free → 2³ = 8. Supersets of BC: 2³ = 8. Supersets of both (must contain A, B, C; D, E free): 2² = 4. Inclusion–exclusion: 8 + 8 − 4 = 12.",
    optionExplanations: ["That counts one key's supersets only.", "The overlap is 4, not 2.", "That double-counts supersets of ABC.", "Correct."]
  },
  {
    id: "sql-norm-034", subject: "sql", subtopic: "Normalization", difficulty: "hard", type: "concept",
    question: "EmpInfo(emp, skill, language): an employee's skills and languages are independent, so every skill is paired with every language (Ann: {java, sql} × {en, hi} → 4 rows). The relation is in BCNF. Which normal form does it violate?",
    options: ["3NF", "1NF", "4NF, because of the non-trivial multivalued dependencies emp ↠ skill and emp ↠ language", "None"],
    answer: 2,
    explanation: "A multivalued dependency X ↠ Y means the set of Y values for an X is independent of the other attributes. 4NF requires every non-trivial MVD's left side to be a superkey; emp isn't. Decompose into EmpSkill(emp, skill) and EmpLang(emp, language). 5NF goes further, removing join dependencies not implied by keys.",
    optionExplanations: ["It's in BCNF (no non-trivial FDs), hence 3NF.", "Values are atomic.", "Correct.", "The independent multivalued facts cause redundancy."]
  },
  {
    id: "sql-norm-035", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "concept",
    question: "A relation has no non-trivial functional dependencies at all (its only key is the set of all attributes). What is its highest normal form?",
    options: ["1NF", "2NF", "3NF", "BCNF (at least)"],
    answer: 3,
    explanation: "BCNF only constrains non-trivial FDs; with none, the condition holds vacuously. (It can still violate 4NF if it contains independent multivalued facts, as in the emp-skill-language example.)",
    optionExplanations: ["No FD violates any higher form.", "No FD violates any higher form.", "No FD violates BCNF either.", "Correct."]
  },
  {
    id: "sql-norm-036", subject: "sql", subtopic: "Normalization", difficulty: "hard", type: "concept",
    question: "R(A, B, C, D, E, F) with F = {AB → C, BC → AD, D → E, CF → B}. Which FD is implied by F?",
    options: ["AF → D", "D → A", "B → E", "CF → E"],
    answer: 3,
    explanation: "Test each using attribute closures. CF⁺: CF → B, then BC → AD, then D → E: CF⁺ = ABCDEF, so CF → E holds. AF⁺ = AF (no FD fires); B⁺ = B; D⁺ = DE (no A).",
    optionExplanations: ["AF⁺ = AF, which doesn't contain D.", "D⁺ = DE.", "B⁺ = B.", "Correct."]
  },
  {
    id: "sql-norm-037", subject: "sql", subtopic: "Normalization", difficulty: "medium", type: "concept",
    question: "Enrollment(student_id, course_id, grade, course_title, student_name) with key (student_id, course_id). Which decomposition reaches 3NF (and BCNF)?",
    options: ["Keep one table and add an index", "Split every column into its own table", "Enrollment(student_id, grade) and Course(course_id, course_title, student_name)", "Student(student_id, student_name), Course(course_id, course_title), Enrollment(student_id, course_id, grade)"],
    answer: 3,
    explanation: "student_name depends only on student_id and course_title only on course_id (partial dependencies). Moving each fact to the table keyed by its determinant removes the redundancy; grade truly depends on the full key and stays in Enrollment. The decomposition is lossless and dependency-preserving.",
    optionExplanations: ["Indexes don't remove redundancy or anomalies.", "Single-column tables lose the relationships.", "student_name doesn't depend on course_id, and grade needs both ids.", "Correct."]
  },
  {
    id: "sql-norm-038", subject: "sql", subtopic: "Normalization", difficulty: "easy", type: "concept",
    question: "Which ordering of normal forms from weakest to strongest is correct?",
    options: ["1NF ⊂ 3NF ⊂ 2NF ⊂ BCNF", "2NF → 1NF → BCNF → 3NF", "BCNF → 3NF → 2NF → 1NF", "1NF → 2NF → 3NF → BCNF → 4NF → 5NF (each stricter form implies the weaker ones)"],
    answer: 3,
    explanation: "Each normal form adds a condition on top of the previous: a BCNF relation is also in 3NF, 2NF and 1NF. In practice most OLTP schemas aim for 3NF or BCNF; 4NF/5NF deal with multivalued and join dependencies.",
    optionExplanations: ["3NF implies 2NF, not the reverse.", "The order is scrambled.", "This lists strongest to weakest.", "Correct."]
  }
);
