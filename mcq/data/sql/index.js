/* SQL / DBMS — Indexing */
window.QUESTIONS.push(
  {
    id: "sql-index-001", subject: "sql", subtopic: "Indexing", difficulty: "easy", type: "concept",
    question: "What is the main trade-off of adding an index to a table?",
    options: ["Indexes speed up both reads and writes with no cost", "Indexes only help INSERT statements", "Indexes reduce table size", "Indexes speed up lookups, joins and sorting on the indexed columns, but use extra storage and slow down INSERT/UPDATE/DELETE because each index must be maintained"],
    answer: 3,
    explanation: "An index is an auxiliary sorted structure (usually a B+ tree) mapping key values to row locations. Reads that filter, join or sort on the key avoid full table scans, but every write must also update every affected index, and indexes consume disk and memory.",
    optionExplanations: ["Writes pay for index maintenance.", "Inserts become slower, not faster.", "Indexes add storage.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-index-002", subject: "sql", subtopic: "Indexing", difficulty: "easy", type: "concept",
    question: "Why are B+ trees (rather than binary search trees) the standard structure for database indexes?",
    options: ["They use less CPU per comparison", "They don't need to be balanced", "Each node holds many keys (high fan-out, sized to a disk page), so the tree is very shallow and a lookup needs only a few page reads", "They store data unsorted"],
    answer: 2,
    explanation: "Disk/page I/O dominates cost. A B+ tree node fits a page and holds hundreds of keys, so even a billion rows need only ~3–4 levels. The tree stays balanced on inserts/deletes, and sorted keys support range queries.",
    optionExplanations: ["The benefit is fewer I/Os, not cheaper comparisons.", "B+ trees are self-balancing.", "Correct.", "Keys are kept sorted."]
  },
  {
    id: "sql-index-003", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "concept",
    question: "How does a B+ tree differ from a B-tree, and why does it suit range queries like `WHERE price BETWEEN 100 AND 200`?",
    options: ["B+ trees store records in internal nodes too", "B-trees are always taller than B+ trees", "B+ trees can't do equality lookups", "In a B+ tree all data pointers live in the leaves and the leaves are linked in key order, so a range query finds the first key and then scans leaves sequentially"],
    answer: 3,
    explanation: "In a B-tree, keys with data can appear in internal nodes, so a range scan must traverse up and down the tree. B+ tree internal nodes hold only routing keys (higher fan-out), every key appears in a leaf, and leaves form a linked list for efficient sequential range scans.",
    optionExplanations: ["That's a B-tree property.", "With routing-only internal nodes, a B+ tree tends to be shorter, not taller.", "Equality lookups work fine.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-index-004", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "concept",
    question: "When would a hash index be a poor choice compared with a B-tree index?",
    options: ["For exact-match lookups like WHERE id = 42", "For primary keys", "For range conditions (<, >, BETWEEN), sorting (ORDER BY) and prefix searches, which hash indexes can't support", "For small tables"],
    answer: 2,
    explanation: "A hash index maps each key to a bucket, giving O(1) equality lookups but destroying order. It can't answer range or ORDER BY queries. B-tree indexes handle equality, ranges, sorting and prefix LIKE, which is why they're the default.",
    optionExplanations: ["Equality is what hash indexes are good at.", "Primary key lookups are equality lookups, which hashes handle.", "Correct.", "Table size isn't the issue."]
  },
  {
    id: "sql-index-005", subject: "sql", subtopic: "Indexing", difficulty: "easy", type: "concept",
    question: "What is the difference between a clustered and a non-clustered index?",
    options: ["A clustered index determines the physical order of the table's rows (the leaves contain the rows themselves), so a table can have only one; non-clustered indexes are separate structures that point to rows", "A clustered index is stored on a different disk", "A table can have many clustered indexes", "Non-clustered indexes can't be unique"],
    answer: 0,
    explanation: "With a clustered index (e.g. InnoDB's primary key, SQL Server's clustered index), the table data IS the index's leaf level, sorted by the key. Secondary (non-clustered) indexes store keys plus a pointer (row id or primary key) and require an extra lookup to fetch other columns.",
    optionExplanations: ["Correct.", "It's about data organisation, not location.", "Rows can be physically ordered only one way.", "Non-clustered indexes can be unique."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-index-006", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "concept",
    question: "In MySQL InnoDB, what do the leaf entries of a SECONDARY index on `email` contain, and what does that imply?",
    options: ["The email value and the row's PRIMARY KEY; fetching other columns requires a second lookup in the clustered (PK) index, and a wide PK makes every secondary index larger", "The full row, so no further lookup is needed", "A physical disk address", "Nothing but the email"],
    answer: 0,
    explanation: "InnoDB tables are clustered by primary key. Secondary indexes reference rows by PK value, so a lookup by email walks the secondary B+ tree, then the clustered B+ tree (a 'double lookup'). That's why short PKs (like BIGINT) are preferred over long strings.",
    optionExplanations: ["Correct.", "Only the clustered index leaves contain full rows.", "InnoDB uses the PK value, not a physical address.", "It must reference the row somehow."]
  },
  {
    id: "sql-index-007", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "query",
    question: "orders has an index on (customer_id, created_at). Which query can be answered by an index-only scan (without reading table rows)?",
    code: "-- index: (customer_id, created_at)",
    options: ["SELECT * FROM orders WHERE customer_id = 7;", "SELECT created_at FROM orders WHERE customer_id = 7;", "SELECT amount FROM orders WHERE customer_id = 7;", "SELECT customer_id FROM orders WHERE amount > 100;"],
    answer: 1,
    explanation: "A COVERING index contains every column the query needs (filter and output), so the engine can answer from the index alone. Here both customer_id and created_at are in the index. Queries needing other columns (amount, *) must visit the table. PostgreSQL's INCLUDE clause adds non-key columns for this purpose.",
    optionExplanations: ["SELECT * needs all columns.", "Correct.", "amount isn't in the index.", "The filter column amount isn't in the index."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-index-008", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "query",
    question: "A table has a composite index on (a, b, c). Which WHERE clause CANNOT use the index to seek (only a full index scan at best)?",
    code: "CREATE INDEX idx_abc ON t (a, b, c);",
    options: ["WHERE a = 1", "WHERE a = 1 AND b = 2", "WHERE b = 2 AND c = 3", "WHERE a = 1 AND b = 2 AND c = 3"],
    answer: 2,
    explanation: "A composite B-tree index is sorted by a, then b within a, then c. Only conditions on a LEFTMOST PREFIX (a; a, b; a, b, c) can navigate the tree. Rows with b = 2 are scattered across all values of a, so the index can't seek on them (some engines offer a 'skip scan' as a partial workaround).",
    optionExplanations: ["a is the leftmost column.", "a, b is a leftmost prefix.", "Correct.", "Uses all three columns."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-index-009", subject: "sql", subtopic: "Indexing", difficulty: "hard", type: "query",
    question: "With an index on (a, b, c), how much of the index can `WHERE a = 1 AND c = 3` use for seeking?",
    code: "CREATE INDEX idx_abc ON t (a, b, c);",
    options: ["All three columns", "None of it", "Only a: it seeks to a = 1, then filters c = 3 among those entries", "Only c"],
    answer: 2,
    explanation: "The seek can use the leftmost prefix up to the first missing column. b is missing, so only a = 1 narrows the range; c = 3 is checked as a filter while scanning that range (MySQL's index condition pushdown does this inside the index).",
    optionExplanations: ["b breaks the prefix, so c can't be used for seeking.", "a is a usable prefix.", "Correct.", "c isn't a leftmost column."]
  },
  {
    id: "sql-index-010", subject: "sql", subtopic: "Indexing", difficulty: "hard", type: "concept",
    question: "A frequent query is `WHERE status = 'shipped' AND created_at > '2024-01-01'`. Which composite index is generally better?",
    options: ["(created_at, status)", "It makes no difference", "Two separate single-column indexes are always better", "(status, created_at)"],
    answer: 3,
    explanation: "Put EQUALITY columns first and the RANGE column last. With (status, created_at), the engine seeks to status = 'shipped' and scans a contiguous range of created_at. With (created_at, status), it scans every row after the date and must check status on each, because statuses are interleaved.",
    optionExplanations: ["A leading range column prevents using the next column for seeking.", "Column order matters a lot.", "Combining two indexes (bitmap AND) is usually slower than one good composite index.", "Correct."]
  },
  {
    id: "sql-index-011", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "query",
    question: "orders has a B-tree index on created_at (a DATE). Which predicate is SARGable (can use the index)?",
    code: "-- index on created_at",
    options: ["WHERE YEAR(created_at) = 2024", "WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'", "WHERE CAST(created_at AS TEXT) LIKE '2024%'", "WHERE created_at + INTERVAL '1 day' > '2024-06-01'"],
    answer: 1,
    explanation: "Wrapping the indexed column in a function or expression hides its sorted order from the optimiser, forcing a scan. Rewrite as a range on the bare column. Alternatively create an expression (functional) index on exactly that expression.",
    optionExplanations: ["A function on the column prevents index use.", "Correct.", "Casting the column prevents index use.", "Arithmetic on the column prevents index use; move it to the constant side."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-index-012", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "query",
    question: "users has a B-tree index on name. Which LIKE pattern can use it for an index range scan?",
    code: "-- index on name",
    options: ["WHERE name LIKE 'Ram%'", "WHERE name LIKE '%son'", "WHERE name LIKE '%am%'", "WHERE LOWER(name) LIKE 'ram%'"],
    answer: 0,
    explanation: "A pattern with a fixed PREFIX ('Ram%') becomes a range ('Ram' ≤ name < 'Ran'). A leading wildcard has no starting point in the sorted order, so it needs a full scan (or a trigram/full-text index). LOWER(name) needs an expression index. (In PostgreSQL with non-C collations, prefix LIKE needs a text_pattern_ops index.)",
    optionExplanations: ["Correct.", "A leading wildcard can't use a B-tree.", "A leading wildcard can't use a B-tree.", "The function on name prevents using the plain index."]
  },
  {
    id: "sql-index-013", subject: "sql", subtopic: "Indexing", difficulty: "hard", type: "query",
    question: "In MySQL, phone is a VARCHAR column with an index. Why might `WHERE phone = 9876543210` (number, not a string) do a full scan?",
    code: "SELECT * FROM users WHERE phone = 9876543210;",
    options: ["Numbers can never be compared with strings", "The number is too large", "VARCHAR columns can't be indexed", "MySQL converts each phone VALUE to a number to compare, i.e. applies a function to the indexed column, so the index can't be used; quote the literal: WHERE phone = '9876543210'"],
    answer: 3,
    explanation: "An implicit type conversion on the column side behaves like a function call on every row. Many strings ('9876543210', '09876543210', '9876543210 ') map to the same number, so MySQL can't seek. Matching the literal's type to the column restores index usage.",
    optionExplanations: ["They can be compared, via conversion.", "The size of the number isn't the issue.", "VARCHAR columns are commonly indexed.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "sql-index-014", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "concept",
    question: "In which situation is adding an index LEAST likely to help (or most likely to hurt)?",
    options: ["A large table frequently filtered by customer_id", "A column used in JOIN conditions on a big table", "A boolean `is_active` column where 95% of rows are true, on a table with heavy insert traffic", "A column used to ORDER BY ... LIMIT 10 on a large table"],
    answer: 2,
    explanation: "Low-cardinality / low-selectivity columns rarely benefit: fetching 95% of rows via an index is slower than a sequential scan, and every insert pays to maintain it. (A partial index on the RARE value, e.g. WHERE is_active = false, can be useful.)",
    optionExplanations: ["High selectivity on a big table is ideal for an index.", "Join keys benefit greatly.", "Correct.", "An index on the sort column lets the database read just the first 10 entries."]
  },
  {
    id: "sql-index-015", subject: "sql", subtopic: "Indexing", difficulty: "easy", type: "concept",
    question: "What is index selectivity?",
    options: ["The number of indexes on a table", "The order of columns in an index", "The size of the index in MB", "The fraction of distinct values (distinct values / total rows); high selectivity means a lookup matches few rows, making the index more useful"],
    answer: 3,
    explanation: "A unique column has selectivity 1 (best). A gender column on a million rows has very low selectivity. Optimisers estimate selectivity from statistics to decide between an index scan and a full table scan.",
    optionExplanations: ["That's just a count of indexes.", "Column order is a separate design choice.", "Size isn't selectivity.", "Correct."]
  },
  {
    id: "sql-index-016", subject: "sql", subtopic: "Indexing", difficulty: "easy", type: "concept",
    question: "Which constraints automatically create an index in PostgreSQL and MySQL?",
    options: ["CHECK and NOT NULL", "PRIMARY KEY and UNIQUE", "DEFAULT", "FOREIGN KEY in PostgreSQL"],
    answer: 1,
    explanation: "To enforce uniqueness efficiently, the database builds a unique index for PRIMARY KEY and UNIQUE constraints. MySQL/InnoDB also requires an index on foreign key columns (creating one if needed), but PostgreSQL does NOT index the referencing column automatically.",
    optionExplanations: ["These are checked per row without an index.", "Correct.", "DEFAULT doesn't involve indexes.", "PostgreSQL doesn't auto-index FK columns."]
  },
  {
    id: "sql-index-017", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "concept",
    question: "In textbook terminology, what distinguishes a dense index from a sparse index?",
    options: ["Dense indexes are compressed", "A dense index has an entry for EVERY search-key value (or record); a sparse index has entries for only some values (e.g. one per data block), which requires the data file to be sorted on the key", "Sparse indexes are always faster", "Dense indexes only work for strings"],
    answer: 1,
    explanation: "A primary (clustering) index on a sorted file can be sparse: one entry per block pointing to the block's first key; you then search within the block. Secondary indexes on non-ordering columns must be dense, because records with nearby keys are scattered.",
    optionExplanations: ["Compression is unrelated.", "Correct.", "Sparse indexes are smaller but require sorted data.", "Both work for any key type."]
  },
  {
    id: "sql-index-018", subject: "sql", subtopic: "Indexing", difficulty: "hard", type: "numerical",
    question: "A file has 30,000 records of 100 bytes each, stored unspanned in 1,024-byte blocks and sorted on the key. How many block accesses does a binary search on the data file need, in the worst case?",
    options: ["12", "15", "10", "3000"],
    answer: 0,
    explanation: "Blocking factor = ⌊1024 / 100⌋ = 10 records per block. Blocks = 30,000 / 10 = 3,000. Binary search over blocks costs ⌈log₂ 3000⌉ = 12 block accesses (2¹¹ = 2048 < 3000 ≤ 4096 = 2¹²).",
    optionExplanations: ["Correct.", "log₂ is taken over the 3,000 blocks, not the 30,000 records.", "2¹⁰ = 1024 < 3000.", "That's a linear scan of all blocks."]
  },
  {
    id: "sql-index-019", subject: "sql", subtopic: "Indexing", difficulty: "hard", type: "numerical",
    question: "Same file (3,000 data blocks of 1,024 bytes). A primary SPARSE index stores one entry per data block; each entry is 15 bytes (9-byte key + 6-byte pointer). How many block accesses does a binary search on the index plus fetching the data block require?",
    options: ["7", "6", "12", "13"],
    answer: 0,
    explanation: "Index blocking factor = ⌊1024 / 15⌋ = 68 entries per block. Entries = 3,000 (one per data block), so index blocks = ⌈3000 / 68⌉ = 45. Binary search: ⌈log₂ 45⌉ = 6 accesses, plus 1 to read the data block = 7, versus 12 without the index.",
    optionExplanations: ["Correct.", "One more access is needed to read the data block.", "That's the unindexed binary search.", "The index has only 45 blocks."]
  },
  {
    id: "sql-index-020", subject: "sql", subtopic: "Indexing", difficulty: "hard", type: "numerical",
    question: "For the same 30,000 records, a DENSE secondary index on a non-ordering key uses 15-byte entries in 1,024-byte blocks (68 entries per block). How many block accesses for binary search on this index plus the data block?",
    options: ["7", "16", "9", "10"],
    answer: 3,
    explanation: "A dense index needs one entry per RECORD: 30,000 entries → ⌈30000 / 68⌉ = 442 index blocks. Binary search: ⌈log₂ 442⌉ = 9 (2⁸ = 256 < 442 ≤ 512 = 2⁹), plus 1 data block = 10 accesses. Without the index, a search on a non-ordering key would need a linear scan (1,500 blocks on average).",
    optionExplanations: ["That's the sparse primary index cost.", "2⁹ = 512 already exceeds 442.", "Add one access for the data block.", "Correct."]
  },
  {
    id: "sql-index-021", subject: "sql", subtopic: "Indexing", difficulty: "hard", type: "numerical",
    question: "The first level of an index has 45 blocks and the fan-out (entries per index block) is 68. If you build a MULTI-LEVEL index, how many levels are there and how many block accesses does a lookup need (including the data block)?",
    options: ["2 levels, 3 accesses", "3 levels, 4 accesses", "1 level, 7 accesses", "2 levels, 7 accesses"],
    answer: 0,
    explanation: "A second level indexes the 45 first-level blocks: ⌈45 / 68⌉ = 1 block, so it's the top level. A lookup reads one block per level (2) plus the data block = 3 accesses — better than binary search on the single-level index (6 + 1). This multi-level idea is the basis of B+ trees.",
    optionExplanations: ["Correct.", "One block already fits all 45 entries at level 2.", "A multi-level index reads one block per level.", "Multi-level search doesn't binary-search each level."]
  },
  {
    id: "sql-index-022", subject: "sql", subtopic: "Indexing", difficulty: "hard", type: "numerical",
    question: "A B+ tree internal node holds p child pointers and p − 1 keys. With 4,096-byte pages, 8-byte keys and 8-byte pointers, what is the maximum p (the order)?",
    options: ["256", "512", "255", "128"],
    answer: 0,
    explanation: "Space used: 8p + 8(p − 1) ≤ 4096 → 16p − 8 ≤ 4096 → p ≤ 256.5 → p = 256. Such a high fan-out means 3 levels can address about 256³ ≈ 16.7 million leaf entries.",
    optionExplanations: ["Correct.", "Each entry needs both a key and a pointer (16 bytes).", "That's the number of keys (p − 1), not pointers.", "Nodes can hold more than 128 pointers."]
  },
  {
    id: "sql-index-023", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "numerical",
    question: "A B+ tree has a fan-out of 100 at every level, and each leaf holds 100 keys. What is the minimum height (number of levels, including leaves) needed to index 1,000,000 keys, and how many page reads does a point lookup take (index plus one data page)?",
    options: ["3 levels, 4 page reads", "6 levels, 7 page reads", "2 levels, 3 page reads", "20 levels, 21 page reads"],
    answer: 0,
    explanation: "Leaves needed: 1,000,000 / 100 = 10,000. Level above: 10,000 / 100 = 100 nodes. Root: 1 node. That's 3 levels (100³ = 10⁶). A lookup reads 3 index pages plus the data page = 4. In practice the upper levels are cached in memory.",
    optionExplanations: ["Correct.", "log₁₀₀ of 10⁶ is 3, not 6.", "Two levels can hold only 100² = 10,000 keys.", "That's a binary tree's height (log₂ 10⁶ ≈ 20)."]
  },
  {
    id: "sql-index-024", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "concept",
    question: "When is a bitmap index a good fit?",
    options: ["Unique columns in an OLTP system with many concurrent updates", "Primary keys", "Low-cardinality columns (e.g. region, status) in read-mostly analytic workloads, where bitmaps can be combined quickly with AND/OR", "Full-text search"],
    answer: 2,
    explanation: "A bitmap index stores one bit array per distinct value; combining predicates becomes fast bitwise operations, and bitmaps compress well. But updating them requires locking large ranges, which is bad for write-heavy OLTP. Oracle offers persistent bitmap indexes; PostgreSQL builds bitmaps on the fly ('bitmap heap scan').",
    optionExplanations: ["Bitmaps suit low cardinality and few updates.", "Unique keys would need one bitmap per row.", "Correct.", "Full-text search uses inverted indexes."]
  },
  {
    id: "sql-index-025", subject: "sql", subtopic: "Indexing", difficulty: "easy", type: "concept",
    question: "You need to search product descriptions for words like 'wireless' anywhere in the text. What's the appropriate tool?",
    options: ["A B-tree index with LIKE '%wireless%'", "A full-text index (MySQL FULLTEXT / PostgreSQL tsvector + GIN), which indexes individual words", "A hash index", "A clustered index on description"],
    answer: 1,
    explanation: "Full-text indexes are inverted indexes mapping words (after tokenising, stemming, stop-word removal) to the rows containing them, supporting relevance ranking. B-trees can't help with leading wildcards. Dedicated engines (Elasticsearch) are used at larger scale.",
    optionExplanations: ["A leading wildcard forces a full scan.", "Correct.", "Hash indexes support only whole-value equality.", "Clustering on a long text column doesn't help word search."]
  },
  {
    id: "sql-index-026", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "concept",
    question: "PostgreSQL's EXPLAIN shows `Seq Scan on orders` even though there's an index on status, for `WHERE status = 'pending'`. Which is a plausible reason?",
    options: ["Indexes are disabled by default", "Status must be the primary key", "EXPLAIN never shows index scans", "The optimiser estimates that most rows match (low selectivity) or the table is small, so a sequential scan is cheaper than many random index lookups"],
    answer: 3,
    explanation: "The cost-based optimiser compares estimated costs using table statistics. Reading a large fraction of a table via random index accesses costs more than one sequential pass. Stale statistics (run ANALYZE) can also cause bad choices. EXPLAIN ANALYZE shows actual times and row counts.",
    optionExplanations: ["Indexes are used whenever the optimiser judges them cheaper.", "Any column can be indexed and used.", "EXPLAIN shows Index Scan / Index Only Scan / Bitmap scans when chosen.", "Correct."]
  },
  {
    id: "sql-index-027", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "query",
    question: "Most orders are 'completed' and you only ever query the few 'pending' ones. Which PostgreSQL index is most efficient?",
    code: "SELECT * FROM orders WHERE status = 'pending' AND created_at < now() - interval '1 day';",
    options: ["CREATE INDEX ON orders (status);", "CREATE INDEX ON orders (status, created_at, amount, customer_id);", "CREATE INDEX ON orders (created_at) WHERE status = 'pending';", "No index can help"],
    answer: 2,
    explanation: "A PARTIAL index includes only rows matching its WHERE clause, so it stays tiny (just the pending orders), is cheap to maintain for the other rows, and directly serves the query. Expression indexes (e.g. ON lower(email)) are the related tool for function-based predicates.",
    optionExplanations: ["It indexes every row, including the many completed ones.", "An overly wide index wastes space and write time.", "Correct.", "A partial index fits this well."]
  },
  {
    id: "sql-index-028", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "query",
    question: "Emails are stored in mixed case, and the app queries `WHERE lower(email) = 'a@b.com'`. Which PostgreSQL index makes this query use an index?",
    code: "SELECT * FROM users WHERE lower(email) = 'a@b.com';",
    options: ["CREATE INDEX ON users (email);", "CREATE INDEX ON users USING hash (email);", "CREATE INDEX ON users (lower(email));", "CREATE INDEX ON users (upper(email));"],
    answer: 2,
    explanation: "An expression (functional) index stores the computed value lower(email), so a predicate using exactly that expression can seek. A plain index on email can't be used once the column is wrapped in a function. (A case-insensitive collation or citext type are alternatives.)",
    optionExplanations: ["The function call prevents using a plain column index.", "Still indexes the raw value.", "Correct.", "The expression must match the query's expression."]
  },
  {
    id: "sql-index-029", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "concept",
    question: "A table has 12 indexes. What's the main cost on each INSERT?",
    options: ["None; indexes are updated lazily at night", "Every index must be updated (12 extra B+ tree insertions, possibly page splits), slowing writes and increasing WAL/log volume", "INSERTs bypass indexes", "Only the primary key index is updated"],
    answer: 1,
    explanation: "Each index is a separate structure kept in sync on every insert, and on updates touching indexed columns (and deletes). Unused or redundant indexes (e.g. (a) when (a, b) exists) cost writes and memory for no benefit; monitor index usage and drop the dead weight.",
    optionExplanations: ["Indexes are maintained synchronously.", "Correct.", "Inserts must update every index.", "All indexes on the table are updated."]
  },
  {
    id: "sql-index-030", subject: "sql", subtopic: "Indexing", difficulty: "medium", type: "concept",
    question: "With an index on (created_at), why can `SELECT * FROM events ORDER BY created_at DESC LIMIT 10` be very fast on a 100-million-row table?",
    options: ["LIMIT makes every query fast", "The B+ tree is already sorted, so the database reads the index backwards and stops after 10 entries — no full sort is needed", "DESC disables indexes", "The whole table is cached"],
    answer: 1,
    explanation: "Indexes can satisfy ORDER BY by returning rows in index order (forwards or backwards). Combined with LIMIT, the engine stops early: a 'top-N' query touches only a handful of pages. Without the index, it must scan and sort all 100 million rows.",
    optionExplanations: ["Without an index, all rows must still be read and sorted.", "Correct.", "B-trees can be scanned in either direction.", "Caching isn't required."]
  },
  {
    id: "sql-index-031", subject: "sql", subtopic: "Indexing", difficulty: "hard", type: "query",
    question: "users has separate single-column indexes on first_name and on city. How does a typical optimiser handle `WHERE first_name = 'Ravi' OR city = 'Pune'`?",
    code: "SELECT * FROM users WHERE first_name = 'Ravi' OR city = 'Pune';",
    options: ["It can only use the first_name index", "It may combine both indexes (bitmap OR / index merge union), or choose a full scan; a single composite index (first_name, city) does NOT help the OR condition", "OR conditions always use a composite index", "OR is rewritten as AND"],
    answer: 1,
    explanation: "An OR across different columns can't be served by one B-tree seek. PostgreSQL can do BitmapOr of two index scans; MySQL has index_merge union. If neither is chosen, it falls back to a full scan. Rewriting as UNION of two indexed queries is a manual alternative. A composite (first_name, city) only helps the city part when first_name is also fixed.",
    optionExplanations: ["Using only one index would miss rows matching the other condition.", "Correct.", "A composite index can't handle OR across its columns.", "OR and AND have different meanings."]
  },
  {
    id: "sql-index-032", subject: "sql", subtopic: "Indexing", difficulty: "easy", type: "concept",
    question: "Which tool shows how the database plans to execute a query (which indexes, join methods and estimated costs)?",
    options: ["DESCRIBE TABLE", "VACUUM", "SHOW INDEXES", "EXPLAIN (EXPLAIN ANALYZE in PostgreSQL also runs it and shows actual timings)"],
    answer: 3,
    explanation: "EXPLAIN reveals the chosen plan: Seq Scan vs Index Scan / Index Only Scan / Bitmap Heap Scan, join algorithms (Nested Loop, Hash Join, Merge Join), estimated rows and costs. It's the first step in diagnosing slow queries.",
    optionExplanations: ["DESCRIBE shows table columns.", "VACUUM reclaims space and updates the visibility map.", "That lists index definitions, not the plan.", "Correct."]
  },
  {
    id: "sql-index-033", subject: "sql", subtopic: "Indexing", difficulty: "hard", type: "concept",
    question: "Why are random UUIDv4 primary keys often slower for inserts than auto-increment keys in a clustered B+ tree (e.g. InnoDB)?",
    options: ["UUIDs can't be indexed", "Random keys insert into random leaf pages, causing frequent page splits, poor cache locality and fragmented, larger indexes; sequential keys always append to the rightmost page", "UUIDs are compared as numbers", "Auto-increment keys skip the index"],
    answer: 1,
    explanation: "With monotonically increasing keys, new rows go to the end of the clustered index, keeping hot pages in memory and pages full. Random 16-byte UUIDs scatter writes across the whole tree, and every secondary index stores that larger PK. Time-ordered IDs (UUIDv7, ULID, Snowflake) keep the global uniqueness while restoring locality.",
    optionExplanations: ["UUIDs can be indexed; they're just less write-friendly.", "Correct.", "Comparison type isn't the problem.", "Auto-increment keys are indexed too."]
  }
);
