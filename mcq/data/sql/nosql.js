/* SQL / DBMS — NoSQL & Distributed Databases */
window.QUESTIONS.push(
  {
    id: "sql-nosql-001", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "easy", type: "concept",
    question: "Which statement best contrasts typical relational (SQL) and NoSQL databases?",
    options: ["NoSQL databases can't store more than 1 GB", "NoSQL databases never support transactions", "SQL databases use fixed schemas, joins and ACID transactions and traditionally scale up; many NoSQL databases use flexible schemas, denormalized data and are designed to scale out across many nodes, often relaxing consistency", "SQL databases can't be replicated"],
    answer: 2,
    explanation: "Relational databases excel at complex queries, joins and strong consistency. NoSQL systems (key-value, document, wide-column, graph) trade some of that for horizontal scalability, flexible data models and high availability. The line is blurring: MongoDB has multi-document transactions, and distributed SQL systems (Spanner, CockroachDB) scale out.",
    optionExplanations: ["NoSQL systems store petabytes.", "Several NoSQL databases support transactions.", "Correct.", "Relational databases are commonly replicated."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-nosql-002", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "easy", type: "concept",
    question: "Match each NoSQL type to an example: key-value, document, wide-column, graph.",
    options: ["Redis, MongoDB, Cassandra, Neo4j", "MongoDB, Redis, Neo4j, Cassandra", "Cassandra, Neo4j, Redis, MongoDB", "Neo4j, Cassandra, MongoDB, Redis"],
    answer: 0,
    explanation: "Key-value stores (Redis, DynamoDB) map keys to opaque values. Document stores (MongoDB, Couchbase) store JSON-like documents with queryable fields. Wide-column stores (Cassandra, HBase, Bigtable) store rows with dynamic column families, optimised for huge write volumes. Graph databases (Neo4j) store nodes and edges for relationship traversal.",
    optionExplanations: ["Correct.", "MongoDB is a document store and Redis a key-value store.", "Cassandra is wide-column, not key-value.", "Neo4j is a graph database."]
  },
  {
    id: "sql-nosql-003", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "easy", type: "concept",
    question: "A social network needs fast 'friends of friends who like X' queries across many hops. Which database type is the most natural fit?",
    options: ["Key-value store", "Columnar data warehouse", "Graph database", "Plain CSV files"],
    answer: 2,
    explanation: "Graph databases store relationships as first-class edges, so multi-hop traversals are pointer-chasing rather than repeated self-joins whose cost grows with every hop. They suit recommendations, fraud rings and network analysis.",
    optionExplanations: ["Key-value lookups don't express traversals.", "Columnar stores target aggregations over many rows.", "Correct.", "Files offer no efficient traversal."]
  },
  {
    id: "sql-nosql-004", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "easy", type: "concept",
    question: "What does the CAP theorem state?",
    options: ["A distributed system can provide Consistency, Availability and Partition tolerance all at once", "Caching, Availability and Performance can't coexist", "During a network partition, a distributed system must choose between Consistency (every read sees the latest write) and Availability (every request gets a non-error response)", "CAP applies only to single-node databases"],
    answer: 2,
    explanation: "Brewer's theorem: when a network partition splits the nodes, you can't both answer every request and guarantee every answer reflects the latest write. Since partitions happen in real networks, P isn't optional: systems are effectively CP or AP during partitions.",
    optionExplanations: ["All three can't be guaranteed during a partition.", "C stands for Consistency.", "Correct.", "CAP concerns distributed systems."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-nosql-005", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "easy", type: "concept",
    question: "What is the difference in purpose between SHARDING and REPLICATION?",
    options: ["Sharding splits data across nodes so each holds a subset (scaling storage and writes); replication copies the same data to multiple nodes (availability, fault tolerance, read scaling)", "They're the same thing", "Sharding copies data; replication splits it", "Replication is only for backups"],
    answer: 0,
    explanation: "Most large systems combine both: data is sharded into partitions, and each partition is replicated (e.g. 3 replicas) so a node failure doesn't lose data or availability.",
    optionExplanations: ["Correct.", "They solve different problems.", "Reversed.", "Replicas also serve reads and enable failover."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-nosql-006", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "easy", type: "concept",
    question: "A PostgreSQL primary is overloaded by SELECT queries from dashboards, while writes are light. What's a common first step?",
    options: ["Shard the database immediately", "Add read replicas and route read-only/reporting queries to them", "Switch to a graph database", "Disable indexes"],
    answer: 1,
    explanation: "Read replicas receive the primary's changes (usually asynchronously) and can serve reads, scaling read throughput without the complexity of sharding. The trade-off is replication lag: replicas may serve slightly stale data.",
    optionExplanations: ["Sharding is far more complex and targets write/storage limits.", "Correct.", "The data model isn't the problem.", "Removing indexes would make reads slower."]
  },
  {
    id: "sql-nosql-007", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "easy", type: "concept",
    question: "What does BASE stand for, as the NoSQL counterpart to ACID?",
    options: ["Basic Availability, Soft state, Eventual consistency", "Balanced Atomicity, Strong Encryption", "Batch, Async, Sync, Ensure", "Binary, Atomic, Serial, Exclusive"],
    answer: 0,
    explanation: "BASE systems stay Basically Available (respond even during failures), allow Soft state (data may change without input as replicas converge), and are Eventually consistent (replicas agree once updates stop). It prioritises availability and scale over immediate consistency.",
    optionExplanations: ["Correct.", "Not the BASE acronym.", "Not the BASE acronym.", "Not the BASE acronym."]
  },
  {
    id: "sql-nosql-008", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "Why is it said that you really choose between CP and AP, not CA, for a distributed database?",
    options: ["Because network partitions are unavoidable in distributed systems, so partition tolerance must be assumed; the real choice is what to sacrifice when a partition occurs", "Because CA systems are too expensive", "Because consistency is impossible", "Because availability is never needed"],
    answer: 0,
    explanation: "A 'CA' system would have to assume the network never partitions, which only holds on a single node. When a partition happens, a CP system refuses some requests (e.g. the minority side) to stay consistent, while an AP system keeps answering and reconciles later.",
    optionExplanations: ["Correct.", "Cost isn't the argument.", "Consistency is achievable while sacrificing availability.", "Availability is often critical."]
  },
  {
    id: "sql-nosql-009", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "Which pairing of systems to their typical CAP leaning (default configuration) is most accurate?",
    options: ["Cassandra/DynamoDB: CP; HBase/ZooKeeper: AP", "All NoSQL databases are AP", "Cassandra/DynamoDB: AP (tunable); HBase/ZooKeeper/etcd: CP", "All SQL databases are AP"],
    answer: 2,
    explanation: "Cassandra and DynamoDB favour availability with eventual consistency, though consistency is tunable per request (e.g. QUORUM reads/writes). HBase, ZooKeeper and etcd (consensus-based) favour consistency: a minority partition stops serving writes. CAP labels are simplifications; many systems are tunable.",
    optionExplanations: ["Reversed.", "Several NoSQL systems are CP.", "Correct.", "A single-leader SQL setup typically favours consistency."]
  },
  {
    id: "sql-nosql-010", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "hard", type: "concept",
    question: "What does PACELC add to CAP?",
    options: ["If there's a Partition, choose Availability or Consistency; Else (normal operation), choose between Latency and Consistency", "Nothing; it's another name for CAP", "It replaces partitions with power failures", "It's about caching"],
    answer: 0,
    explanation: "Even without partitions, synchronously replicating every write to keep replicas consistent costs latency. DynamoDB/Cassandra are PA/EL (available and low-latency); traditional consensus systems like Spanner are PC/EC.",
    optionExplanations: ["Correct.", "It adds the latency/consistency trade-off during normal operation.", "Partitions are still the P.", "It's about replication trade-offs."]
  },
  {
    id: "sql-nosql-011", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "What does 'eventual consistency' guarantee?",
    options: ["Every read returns the latest write", "Data is consistent within exactly 1 second", "Writes are never lost", "If no new updates are made, all replicas will eventually converge to the same value; in the meantime reads may return stale data"],
    answer: 3,
    explanation: "Eventual consistency is a liveness guarantee about convergence, with no bound on staleness. Stronger client-centric guarantees (read-your-writes, monotonic reads, causal consistency) are often layered on top.",
    optionExplanations: ["That's strong consistency (linearizability).", "No time bound is guaranteed.", "Durability is a separate concern.", "Correct."]
  },
  {
    id: "sql-nosql-012", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "A user edits their profile (written to the leader), then reloads the page, which reads from a lagging replica and shows the OLD profile. Which guarantee is violated, and what's a common fix?",
    options: ["Atomicity; use transactions", "Read-your-writes consistency; route that user's reads to the leader for a short time after they write (or track replication position)", "Durability; add disks", "Partition tolerance; add nodes"],
    answer: 1,
    explanation: "Read-your-writes (read-after-write) consistency means a user always sees their own updates. With asynchronous replicas, reads must be steered to an up-to-date node for that user, e.g. reading from the leader for a minute after a write or waiting until a replica has applied the user's last write.",
    optionExplanations: ["The write itself was atomic.", "Correct.", "The data was durably written.", "No partition occurred."]
  },
  {
    id: "sql-nosql-013", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "In single-leader (master-slave / primary-replica) replication, how are writes handled?",
    options: ["Any replica accepts writes and they're merged later", "All writes go to the leader, which streams its change log to followers; followers serve reads", "Writes go to a random follower", "Writes are split across all nodes by key"],
    answer: 1,
    explanation: "A single leader gives a total order of writes and avoids write conflicts. If the leader fails, a follower is promoted (failover). The leader can become a write bottleneck, which is where sharding or multi-leader setups come in.",
    optionExplanations: ["That's multi-leader or leaderless replication.", "Correct.", "Followers don't accept writes in this model.", "That's sharding."]
  },
  {
    id: "sql-nosql-014", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "What is the main trade-off between synchronous and asynchronous replication?",
    options: ["Synchronous is cheaper", "There's no difference", "Asynchronous guarantees zero data loss", "Synchronous: the commit waits for replica acknowledgement — no data loss on leader failure, but higher write latency and reduced availability if a replica is slow; asynchronous: fast commits, but recent writes can be lost on failover and replicas lag"],
    answer: 3,
    explanation: "Many systems use semi-synchronous replication: wait for at least one replica (e.g. PostgreSQL synchronous_standby_names, MySQL semi-sync), balancing durability and latency.",
    optionExplanations: ["Synchronous replication costs latency.", "The durability/latency trade-off is significant.", "Async can lose the latest writes on failover.", "Correct."]
  },
  {
    id: "sql-nosql-015", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "In multi-leader (or leaderless) replication, two users update the same record concurrently on different nodes. What must the system do?",
    options: ["Nothing; conflicts can't happen", "Convert the database to single-leader", "Reject both writes", "Resolve the write conflict, e.g. last-write-wins by timestamp (may silently drop data), merging (CRDTs), or keeping both versions for the application to resolve"],
    answer: 3,
    explanation: "Accepting writes in several places improves latency and availability (e.g. multi-region) but allows conflicting updates. Strategies include LWW, version vectors to detect concurrency, CRDTs that merge automatically, or application-level resolution.",
    optionExplanations: ["Concurrent writes on different leaders do conflict.", "That's an architecture change, not conflict handling.", "Both writes are normally accepted locally.", "Correct."]
  },
  {
    id: "sql-nosql-016", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "numerical",
    question: "A leaderless store keeps N = 3 replicas of each key. With write quorum W = 2, what is the minimum read quorum R that guarantees every read overlaps with the latest successful write?",
    options: ["1", "3", "2", "0"],
    answer: 2,
    explanation: "Reads are guaranteed to include at least one replica with the latest write when R + W > N. With N = 3 and W = 2, R + 2 > 3 → R ≥ 2. A common config is N = 3, W = 2, R = 2, tolerating one node failure for both reads and writes.",
    optionExplanations: ["R = 1 gives R + W = 3, not greater than N.", "R = 3 works but isn't the minimum.", "Correct.", "A read must contact at least one replica."]
  },
  {
    id: "sql-nosql-017", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "hard", type: "numerical",
    question: "N = 5 replicas. For strongly overlapping quorums with W = 3, what's the minimum R, and how many node failures can WRITES tolerate?",
    options: ["R = 3; writes tolerate 2 failures", "R = 2; writes tolerate 3 failures", "R = 3; writes tolerate 3 failures", "R = 1; writes tolerate 2 failures"],
    answer: 0,
    explanation: "R + W > N → R + 3 > 5 → R ≥ 3. A write succeeds if W = 3 of 5 replicas acknowledge it, so up to 5 − 3 = 2 replicas can be down. Similarly, reads with R = 3 tolerate 2 failures.",
    optionExplanations: ["Correct.", "R = 2 gives R + W = 5, which doesn't exceed N.", "Only 2 failures leave 3 nodes for the write quorum.", "R = 1 doesn't guarantee overlap."]
  },
  {
    id: "sql-nosql-018", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "hard", type: "numerical",
    question: "N = 3, W = 1, R = 1. Which statement is true?",
    options: ["Reads always see the latest write", "R + W = 2 ≤ N, so a read may hit a replica that hasn't received the latest write: fast and highly available, but reads can be stale", "Writes require all replicas", "The system can't tolerate any failure"],
    answer: 1,
    explanation: "Without quorum overlap, the replica answering a read may not be among those that acknowledged the write. This is the 'eventual consistency, lowest latency' setting. Background repair (read repair, anti-entropy/hinted handoff) makes replicas converge.",
    optionExplanations: ["The quorums needn't overlap.", "Correct.", "W = 1 means one acknowledgement suffices.", "With W = R = 1, two replicas can be down."]
  },
  {
    id: "sql-nosql-019", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "An events table is RANGE-sharded by created_at. What problem appears under heavy insert load?",
    options: ["Reads become impossible", "Range queries stop working", "Data is lost", "A hotspot: all new writes go to the shard holding the latest time range, while other shards sit idle"],
    answer: 3,
    explanation: "Monotonically increasing shard keys (timestamps, auto-increment ids) concentrate writes on one shard. Fixes: hash the key, use a compound key like (customer_id, created_at), or add a random/bucket prefix — at the cost of efficient time-range scans across all data.",
    optionExplanations: ["Reads still work.", "Range sharding is actually good for range queries.", "Nothing is lost; it's a load imbalance.", "Correct."]
  },
  {
    id: "sql-nosql-020", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "What do you typically LOSE by switching from range-based to hash-based sharding on the key?",
    options: ["Even data distribution", "The ability to look up a single key", "Efficient range queries on the key (adjacent keys land on different shards, so a range scan must query every shard)", "Replication"],
    answer: 2,
    explanation: "Hashing spreads keys uniformly (avoiding hotspots) but destroys key order. Point lookups stay efficient (hash → shard), while range scans become scatter-gather queries across all shards.",
    optionExplanations: ["Hashing improves distribution.", "Point lookups remain efficient.", "Correct.", "Replication is independent of the sharding method."]
  },
  {
    id: "sql-nosql-021", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "hard", type: "numerical",
    question: "Keys are placed with `node = hash(key) mod N`. When N grows from 4 to 5, roughly what fraction of keys must move? With consistent hashing, roughly what fraction moves?",
    options: ["About 80% with mod; about 20% (≈ 1/5) with consistent hashing", "About 20% with mod; about 80% with consistent hashing", "About 25% in both cases", "100% in both cases"],
    answer: 0,
    explanation: "A key stays put only if h mod 4 = h mod 5, which holds for 4 out of every 20 hash values (20%), so ~80% of keys move. Consistent hashing places nodes and keys on a ring; a new node takes over only the keys from its arc, about 1/5 of the data, all moving to the new node.",
    optionExplanations: ["Correct.", "Reversed.", "Modulo placement remaps far more keys.", "Consistent hashing exists to avoid moving everything."],
    tags: ["interview-favourite"]
  },
  {
    id: "sql-nosql-022", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "Why do consistent-hashing systems (Cassandra, DynamoDB) assign each physical node many 'virtual nodes' on the ring?",
    options: ["To store more data per key", "To encrypt data", "To spread each node's ownership over many small arcs, giving a more even load distribution and spreading the load of a failed/added node across many peers", "To avoid replication"],
    answer: 2,
    explanation: "With one token per node, arcs can be very uneven and a node's entire load shifts to a single neighbour on failure. Many virtual nodes average out the arc sizes and let heterogeneous hardware take proportionally more vnodes.",
    optionExplanations: ["Data per key is unchanged.", "Vnodes aren't about encryption.", "Correct.", "Replication still happens."]
  },
  {
    id: "sql-nosql-023", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "What is the difference between horizontal and vertical partitioning of a table?",
    options: ["They're the same", "Horizontal partitioning splits ROWS into separate partitions (e.g. by region or date; sharding when across servers); vertical partitioning splits COLUMNS into separate tables (e.g. moving rarely used large columns out)", "Vertical partitioning means adding servers", "Horizontal partitioning means adding columns"],
    answer: 1,
    explanation: "Horizontal partitioning keeps the full schema in each partition with a subset of rows (PostgreSQL declarative partitioning, Cassandra partitions). Vertical partitioning narrows hot tables so more rows fit in memory, joining back by key when needed.",
    optionExplanations: ["They split along different axes.", "Correct.", "Adding servers is scaling, not partitioning.", "Horizontal partitioning splits rows."]
  },
  {
    id: "sql-nosql-024", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "In MongoDB, when should you EMBED related data in a document rather than REFERENCE it in another collection?",
    options: ["Always embed, because joins don't exist", "Embed one-to-few data that is read together with the parent and doesn't grow without bound (e.g. a user's addresses); reference large, unbounded or independently accessed data (e.g. all orders of a customer)", "Always reference, to normalise", "Embed only numbers"],
    answer: 1,
    explanation: "Embedding gives single-read access and atomic updates of one document, but documents have a size limit (16 MB) and unbounded arrays hurt performance. Referencing (with $lookup or application joins) suits many-to-many and large collections. NoSQL schema design is driven by access patterns.",
    optionExplanations: ["$lookup exists, and unbounded embedding is harmful.", "Correct.", "Embedding is often the better choice for read patterns.", "Data type isn't the criterion."]
  },
  {
    id: "sql-nosql-025", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "easy", type: "concept",
    question: "Which description of Redis is accurate?",
    options: ["An in-memory key-value store with rich data structures (strings, hashes, lists, sets, sorted sets, streams), optional persistence (RDB snapshots / AOF log), widely used for caching, sessions, rate limiting and leaderboards", "A disk-only relational database", "A graph database", "A columnar warehouse"],
    answer: 0,
    explanation: "Keeping data in RAM gives sub-millisecond latency. Sorted sets make leaderboards trivial; INCR with EXPIRE implements rate limiting; pub/sub and streams support messaging. Persistence options trade durability against write overhead.",
    optionExplanations: ["Correct.", "Redis is in-memory and not relational.", "It isn't a graph database.", "It isn't a columnar warehouse."]
  },
  {
    id: "sql-nosql-026", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "Which description matches the CACHE-ASIDE (lazy loading) pattern?",
    options: ["The cache writes to the database on behalf of the app", "The database pushes every change into the cache", "All writes go to the cache and are flushed to the DB later", "The application reads from the cache; on a miss it reads the database and populates the cache; on updates it writes the database and invalidates (deletes) the cached entry"],
    answer: 3,
    explanation: "Cache-aside is the most common pattern with Redis/Memcached. Write-through writes to the cache and DB together (always fresh, slower writes). Write-back/write-behind writes to the cache and flushes later (fast, but risks data loss if the cache node dies).",
    optionExplanations: ["That's write-through or write-behind behaviour.", "That's a change-data-capture approach.", "That's write-back (write-behind).", "Correct."]
  },
  {
    id: "sql-nosql-027", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "hard", type: "concept",
    question: "With cache-aside, why do many teams DELETE the cache key after updating the database, rather than writing the new value into the cache?",
    options: ["Deleting is faster than writing", "It's required by Redis", "Caches don't support updates", "Concurrent writers can race and leave a stale value in the cache if each SETs its own value; deleting forces the next reader to load fresh data from the database (still with TTLs as a safety net)"],
    answer: 3,
    explanation: "If writer A updates the DB then is delayed, writer B updates the DB and SETs the cache, then A SETs its older value, the cache is stale indefinitely. Invalidation narrows such windows. Short TTLs bound any remaining staleness. 'There are only two hard things: cache invalidation and naming things.'",
    optionExplanations: ["Speed isn't the main reason.", "Redis supports both approaches.", "Caches support updates.", "Correct."]
  },
  {
    id: "sql-nosql-028", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "What distinguishes OLTP from OLAP workloads?",
    options: ["They're the same", "OLTP only exists in NoSQL", "OLAP is for writes and OLTP for reads", "OLTP: many short transactions reading/writing a few rows (orders, payments), normalized schemas, row stores; OLAP: fewer, long analytical queries scanning and aggregating huge datasets, denormalized star schemas, columnar stores"],
    answer: 3,
    explanation: "Operational databases (PostgreSQL, MySQL) handle OLTP; data warehouses (Snowflake, BigQuery, Redshift, ClickHouse) handle OLAP. ETL/ELT pipelines move data from OLTP systems into the warehouse.",
    optionExplanations: ["Their access patterns differ greatly.", "Relational databases are the classic OLTP systems.", "OLTP includes heavy writes.", "Correct."]
  },
  {
    id: "sql-nosql-029", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "numerical",
    question: "A table has 100 columns of similar size and 1 billion rows. A query computes SUM(revenue) GROUP BY region. Roughly what fraction of the table's data must a COLUMNAR store read, compared with a row store reading every full row?",
    options: ["About 2% (only the 2 needed columns), before compression benefits", "About 100%", "About 50%", "About 0.01%"],
    answer: 0,
    explanation: "Columnar storage keeps each column's values together, so the query reads just region and revenue: 2 of 100 columns ≈ 2% of the data. Similar values stored together also compress very well, so the real I/O is often smaller still. Row stores must read whole rows.",
    optionExplanations: ["Correct.", "That's the row-store cost.", "Only 2 of 100 columns are needed.", "All rows of the two columns must still be read."]
  },
  {
    id: "sql-nosql-030", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "hard", type: "concept",
    question: "During a network partition, both halves of a 4-node cluster elect their own leader and accept writes. What is this called, and how do systems prevent it?",
    options: ["Sharding; by adding nodes", "Split brain; by requiring a MAJORITY quorum (e.g. Raft/Paxos) for leader election and writes — with 4 nodes, a 2–2 split leaves neither side with 3 votes, so neither accepts writes", "Replication lag; by using faster disks", "Eventual consistency; by waiting"],
    answer: 1,
    explanation: "Two leaders accepting writes diverge irreconcilably. Majority quorums ensure at most one partition can make progress. That's also why clusters use odd sizes (3, 5): a 5-node cluster tolerates 2 failures, while a 4-node cluster still tolerates only 1.",
    optionExplanations: ["Split brain isn't sharding.", "Correct.", "It's not lag; it's two leaders.", "Waiting doesn't prevent divergence."]
  },
  {
    id: "sql-nosql-031", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "hard", type: "concept",
    question: "A sharded database is partitioned by user_id, but you often query by email. What are the options for a secondary index on email?",
    options: ["Secondary indexes are impossible in sharded databases", "Always a single global index on one machine", "Local (per-shard) indexes, which force scatter-gather queries to all shards for an email lookup; or a global index partitioned by email, which makes reads targeted but writes must update another shard (often asynchronously)", "Re-shard by email and keep user_id lookups fast"],
    answer: 2,
    explanation: "Document-partitioned (local) indexes keep writes local but reads fan out; term-partitioned (global) indexes route reads to one shard but complicate writes (cross-shard updates, possible staleness). DynamoDB's GSIs are global and eventually consistent; Cassandra/Elasticsearch use local indexes.",
    optionExplanations: ["Both kinds of secondary index exist.", "A single machine would be a bottleneck.", "Correct.", "Re-sharding just moves the problem to user_id queries."]
  },
  {
    id: "sql-nosql-032", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "hard", type: "concept",
    question: "A user refreshes a page twice. The first request hits a replica that has applied a new comment; the second hits a more-lagged replica and the comment DISAPPEARS. Which guarantee would prevent this?",
    options: ["Read-your-writes", "Monotonic reads: once a user has seen data at some point in time, later reads never return an older state (e.g. by pinning each user to one replica)", "Atomicity", "Two-phase commit"],
    answer: 1,
    explanation: "Monotonic reads prevent 'going back in time' across successive reads. Read-your-writes concerns a user's own writes; here the comment may have been written by someone else. Causal consistency is stronger still (preserving cause-effect order).",
    optionExplanations: ["The comment needn't be the user's own write.", "Correct.", "Atomicity concerns a single transaction.", "2PC coordinates distributed commits, not read staleness."]
  },
  {
    id: "sql-nosql-033", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "A fintech app needs a double-entry ledger where every transfer updates several accounts atomically and must never be inconsistent. Which choice is most appropriate?",
    options: ["An eventually consistent key-value store without transactions", "A relational database (or a distributed SQL database) with ACID transactions and constraints", "A graph database", "A CDN cache"],
    answer: 1,
    explanation: "Money movement needs multi-row atomicity, strong consistency and integrity constraints, which relational databases provide out of the box. NoSQL shines for flexible schemas, massive scale-out and high write throughput where relaxed consistency is acceptable (feeds, logs, sessions).",
    optionExplanations: ["Eventual consistency risks inconsistent balances.", "Correct.", "Graphs target relationship traversal.", "A cache isn't a system of record."]
  },
  {
    id: "sql-nosql-034", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "easy", type: "concept",
    question: "In Amazon DynamoDB, what does a table's primary key consist of?",
    options: ["Always an auto-increment integer", "A foreign key", "Any set of columns chosen per query", "A partition key, optionally combined with a sort key; the partition key is hashed to choose the partition, and the sort key orders items within it"],
    answer: 3,
    explanation: "A good partition key has high cardinality and even access to avoid hot partitions. With a sort key (e.g. user_id + timestamp), you can efficiently query ranges within one partition. Other access patterns need secondary indexes (GSIs/LSIs).",
    optionExplanations: ["DynamoDB has no auto-increment keys.", "DynamoDB has no foreign keys.", "Keys are fixed at table creation.", "Correct."]
  },
  {
    id: "sql-nosql-035", subject: "sql", subtopic: "NoSQL & Distributed Databases", difficulty: "medium", type: "concept",
    question: "What does strong consistency (linearizability) mean for a distributed database?",
    options: ["Every replica stores identical bytes at all times", "Reads are always fast", "The system behaves as if there's a single copy of the data: once a write completes, every subsequent read (from any client) returns that value or a newer one", "Writes never fail"],
    answer: 2,
    explanation: "Linearizability gives the simplest mental model but requires coordination (single leader with synchronous replication, or consensus), adding latency and reducing availability during partitions — the C in CAP.",
    optionExplanations: ["Replicas can differ internally as long as reads behave correctly.", "Strong consistency usually costs latency.", "Correct.", "Writes can fail, e.g. without a quorum."]
  }
);
