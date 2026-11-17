---
title: Query optimization
part: Part B · Queries
lede: The same query can run in a millisecond or an hour depending on the plan. This chapter covers the equivalence rules an optimizer may apply (and the outer-join traps where it may not), how it estimates result sizes from statistics, how dynamic programming finds a join order, how nested subqueries become semijoins, and how materialized views are kept up to date.
desc: equivalence rules, outer joins, semijoin rewrites, join elimination, statistics, histograms, size estimation, join-order DP, left-deep trees, interesting orders, heuristics, decorrelation, materialized views, expensive predicates, top-K, EXPLAIN
hours: 4
prereqs: Chapter 3, SQL subqueries
---

## Equivalence rules {#ch04-rules .th}

Two expressions are **equivalent** if they produce the same set (or multiset) of tuples on every legal database instance. Tuple order does not matter. The rules an optimizer uses:

| # | Rule |
|---|---|
| 1 | `σθ1∧θ2(E) ≡ σθ1(σθ2(E))` — split a conjunction into a cascade |
| 2 | `σθ1(σθ2(E)) ≡ σθ2(σθ1(E))` — selections commute |
| 3 | only the outermost of a series of projections is needed |
| 4 | `σθ(E1 × E2) ≡ E1 ⋈θ E2`, and `σθ1(E1 ⋈θ2 E2) ≡ E1 ⋈θ1∧θ2 E2` |
| 5 | theta and natural joins commute |
| 6 | natural joins associate; theta joins do too when each condition mentions only the relations it joins |
| 7 | `σθ0(E1 ⋈ E2) ≡ σθ0(E1) ⋈ E2` when θ0 uses only E1's attributes |
| 8 | projection distributes over a join if the join attributes are kept until after the join |
| 9–10 | ∪ and ∩ commute and associate; − does not commute |
| 11 | σ distributes over ∪, ∩ and −; also `σ(E1 − E2) ≡ σ(E1) − E2` |
| 12 | Π distributes over ∪ |
| 13 | `σθ(G γ A(E)) ≡ G γ A(σθ(E))` if θ uses only the grouping attributes G |
| 14 | full outer join commutes; `E1 ⟕ E2 ≡ E2 ⟖ E1` |
| 15 | `σθ1(E1 ⟕ E2) ≡ σθ1(E1) ⟕ E2` if θ1 uses only E1 |
| 16 | `σθ1(E1 ⟕ E2) ≡ σθ1(E1 ⋈ E2)` if θ1 is null-rejecting on E2 |

The heuristics behind them: do selections early (rule 7), project away unneeded columns early, and choose a join order that keeps intermediate results small. For example, in `instructor ⋈ teaches ⋈ course` with `dept_name = 'Music'`, computing `σMusic(instructor) ⋈ teaches` first keeps the intermediate result small.

### Outer joins break the familiar rules

Outer joins are not associative, and a selection cannot be pushed into the null-padded side:

```python run=db-c04-loj
import sqlite3
db = sqlite3.connect(":memory:")
db.executescript("""
create table r(A, B); insert into r values (1, 1);
create table s(B, C); insert into s values (1, 1);
create table t(A, C);
""")
q1 = "select * from (select r.A, r.B, s.C from r left join s on r.B = s.B) x left join t on x.A = t.A and x.C = t.C"
q2 = "select r.A, r.B, y.C from r left join (select s.B, s.C, t.A from s left join t on s.C = t.C) y on r.B = y.B and r.A = y.A"
print("(r ⟕ s) ⟕ t:", db.execute(q1).fetchall())
print("r ⟕ (s ⟕ t):", db.execute(q2).fetchall())
```

In `s ⟕ t`, the s tuple finds no t partner, so its A is null; that null A then fails to match r on A, and r's tuple loses the C value it would have kept in the other order.

:::trap Null-rejecting conditions
`σ s.C = 5 (r ⟕ s)` cannot push `C = 5` into s while keeping the outer join: r tuples with no match would still appear, with C null, but the original query removes them. Because `C = 5` rejects nulls, the outer join is really an inner join here (rule 16), which then lets the selection move down.
:::

### Semijoins and join elimination

Given `B γ sum(C) (r ⋈ s)` with r(A, B, C) and s(A, E):

- The join can be replaced by the semijoin `r ⋉ s` if each r tuple matches **at most one** s tuple. Otherwise the join duplicates an r tuple once per match and inflates the sum. Counter-example: r = {(1, 2, 3)}, s = {(1, 3), (1, 5)}.
- The join can be dropped altogether if each r tuple matches **exactly one** s tuple: r.A is declared `not null` and is a foreign key to s.A (which is then a key of s).

The same reasoning gives **join elimination**: `select r.A, r.B from r, s where r.B = s.B` equals `select A, B from r` when r.B is a non-null foreign key referencing a unique s.B.

`GROUP BY A` and `GROUP BY A, B` give the same groups only if A functionally determines B.

## Statistics and size estimation {#ch04-estimation .th}

The catalog keeps, per relation: `nr` (tuples), `br` (blocks), `lr` (tuple size), `fr` (tuples per block), and `V(A, r)` (distinct values of A). Most systems also keep a **histogram** per attribute, often with the most common values listed separately, usually built from a random sample and refreshed by `ANALYZE` or automatically.

| Expression | Estimated size |
|---|---|
| `σA=v(r)` | `nr / V(A, r)`; 1 if A is a key |
| `σA≤v(r)` | `nr · (v − min) / (max − min)`; 0 if v < min; nr/2 with no statistics |
| conjunction | `nr · (s1 · s2 · … · sn) / nr^n` (independence) |
| disjunction | `nr · [1 − (1 − s1/nr)(1 − s2/nr)…]` |
| negation | `nr − size(σθ(r))` |
| `r × s` | `nr · ns` |
| `r ⋈ s`, common attributes a key of R | at most `ns` |
| `r ⋈ s`, foreign key in S referencing R | exactly `ns` |
| `r ⋈ s` on non-key A | `min(nr·ns / V(A, s), nr·ns / V(A, r))` |
| `ΠA(r)`, `G γ (r)` | `V(A, r)`, `V(G, r)` |

```python run=db-c04-estimates
n_student, n_takes = 5000, 10_000
V_takes, V_student = 2500, 5000
est = min(n_student * n_takes / V_takes, n_student * n_takes / V_student)
print("student ⋈ takes, no key info:", int(est))
print("with ID a key of student and a foreign key in takes: exactly", n_takes)

n_r, n_s, V_B_r, V_B_s = 1_000_000, 100_000, 6000, 100_000
print("r ⋈ s on B:", int(min(n_r * n_s / V_B_s, n_r * n_s / V_B_r)))
```

The lower of the two estimates is usually the better one, and here it matches what the foreign key guarantees.

### Histograms

An **equi-width** histogram has ranges of equal width; an **equi-depth** histogram has ranges holding about equal numbers of tuples, which handles skew better. Inside a bucket, assume values are spread uniformly.

```python run=db-c04-histogram
def estimate(bounds, per_bucket, lo, hi):
    total = 0.0
    for a, b in zip(bounds, bounds[1:]):
        overlap = max(0, min(b, hi) - max(a, lo))
        total += per_bucket * overlap / (b - a)
    return total

bounds = [0, 100, 300, 600, 800, 1000]            # equi-depth, 200 tuples each
print("50 < A < 900:", estimate(bounds, 200, 50, 900))
bounds2 = [0, 10, 40, 90, 200, 400]               # 200,000 tuples per bucket
print("25 < A < 220:", estimate(bounds2, 200_000, 25, 220))
```

The first query takes half of bucket [0, 100), three whole buckets, and half of [800, 1000): 100 + 600 + 100.

### Distinct values after an operation

The next operator's estimate needs `V(A, result)`. After `σA=3`: 1. After `σA in {…}`: the size of the set. After `σA op c`: `V(A, r) × selectivity`. Otherwise `min(V(A, r), size of result)`. Estimates are chained bottom-up, each feeding the next formula, and errors compound with every join; this is the main reason optimizers pick bad plans.

## Choosing a join order {#ch04-joinorder .th}

For n relations there are `(2(n−1))! / (n−1)!` join trees:

```python run=db-c04-count
from math import factorial
for n in (3, 5, 7, 10):
    bushy = factorial(2 * (n - 1)) // factorial(n - 1)
    print(f"n={n:>2}: {bushy:>16,} join trees, {factorial(n):>10,} left-deep, DP over subsets ~{3**n:,}")
```

Enumerating them all is hopeless, but **dynamic programming** works because the best plan for a set of relations S can be built from the best plans of its subsets:

```
findbestplan(S):
    if bestplan[S] is known: return it
    if S has one relation: best access path (scan or index, with selections)
    else for each non-empty proper subset S1 of S:
        P1 = findbestplan(S1); P2 = findbestplan(S − S1)
        for each join algorithm A:
            cost = P1.cost + P2.cost + cost of A on P1, P2
            keep the cheapest
    return bestplan[S]
```

This is O(3ⁿ) time and O(2ⁿ) space: about 59,000 steps for 10 relations instead of 17.6 billion trees. Restricting to **left-deep** trees (the right input of every join is a base relation) replaces "each subset S1" with "each relation r in S", giving O(n·2ⁿ). Left-deep trees suit pipelining and indexed nested loops, where the inner side must be a stored relation with an index.

**Interesting sort orders.** A merge join may cost more than a hash join, but its sorted output might make a later merge join, group-by or `order by` free. So the DP keeps the best plan for each subset **and** each interesting order. There are few interesting orders in practice, so the cost barely grows.

```python run=db-c04-dp
from itertools import combinations

card = {"r": 1000, "s": 50, "t": 2000, "u": 10}
sel = {frozenset("rs"): 0.01, frozenset("st"): 0.005, frozenset("tu"): 0.1, frozenset("ru"): 0.02}

def size(S):
    n = 1.0
    for x in S: n *= card[x]
    for pair, f in sel.items():
        if pair <= S: n *= f
    return n

best = {frozenset([x]): (0, x) for x in card}          # cost = sum of intermediate sizes
rels = list(card)
for k in range(2, len(rels) + 1):
    for S in map(frozenset, combinations(rels, k)):
        options = []
        for j in range(1, k):
            for S1 in map(frozenset, combinations(sorted(S), j)):
                S2 = S - S1
                c = best[S1][0] + best[S2][0] + (size(S) if k < len(rels) else 0)
                options.append((c, f"({best[S1][1]} ⋈ {best[S2][1]})"))
        best[S] = min(options)
print(best[frozenset(rels)])
```

The cost model here is just the total size of intermediate results, which is enough to show that the DP joins the small, selective pairs first. A real optimizer plugs in the Chapter 3 cost formulas and keeps plans per interesting order.

### Heuristics and practice

- Systems rewrite nested blocks and aggregation heuristically first, then do cost-based join ordering per block.
- Some use greedy heuristics: from each starting relation, repeatedly add the "best" next relation.
- **Volcano/Cascades** optimizers (SQL Server) apply equivalence rules with memoization and cost-based pruning.
- An optimization budget stops search early on cheap queries; plans can be cached and reused for different constants.
- `EXPLAIN` shows the plan; PostgreSQL's `EXPLAIN ANALYZE` also runs the query and shows actual row counts and times. In `cost=0.00..458.00`, the first number is the cost of the first row and the second of all rows.

## Nested subqueries {#ch04-subqueries .th}

**Correlated evaluation** runs the subquery once per outer tuple, passing the correlation variables in. That is many calls and many random I/Os. **Decorrelation** rewrites the subquery as a join, or more precisely as a **semijoin**, because a plain join would change duplicate counts:

`r ⋉θ s` returns each r tuple once (with its original multiplicity) if at least one s tuple satisfies θ.

```sql
select name from instructor i
where exists (select * from teaches t where t.ID = i.ID and t.year = 2019)
-- becomes  Π name (instructor ⋉ ID = ID ∧ year = 2019 teaches)
-- and NOT EXISTS becomes the anti-semijoin  instructor ▷ teaches
```

The general form: `select A from r1…rn where P1 and exists (select * from s1…sm where P21 and P22)`, where P22 holds the correlation variables and P21 does not, becomes `ΠA(σP1(r1 × … × rn) ⋉P22 σP21(s1 × … × sm))`.

A scalar aggregate subquery becomes a join with a grouped relation:

```python run=db-c04-decorrelate
import sqlite3
db = sqlite3.connect(":memory:")
db.executescript("""
create table r(A, B); insert into r values (1, 10), (2, 5), (3, 0);
create table s(A, C); insert into s values (1, 4), (1, 6), (2, 1);
""")
correlated = "select A, B from r where B = (select sum(C) from s where s.A = r.A)"
decorrelated = """select r.A, r.B from r join (select A, sum(C) sc from s group by A) t
                  on r.A = t.A and r.B = t.sc"""
print(db.execute(correlated).fetchall(), db.execute(decorrelated).fetchall())

count_q = "select A, (select count(C) from s where s.A = r.A) from r"
wrong = "select r.A, count(s.C) from r join s on r.A = s.A group by r.A"
right = "select r.A, count(s.C) from r left join s on r.A = s.A group by r.A"
print(db.execute(count_q).fetchall(), db.execute(wrong).fetchall(), db.execute(right).fetchall())
```

The inner join is right in the first query: for r.A = 3 the subquery returns null, and `B = null` is never true, so row 3 is correctly absent. For `count`, an inner join loses the rows whose count is 0, so the rewrite needs a left outer join. If r.A were not a key, grouping by r.A would also merge rows that the original kept apart.

:::trap NOT IN and nulls
`x not in (select y …)` returns no rows at all if the subquery returns a null, because `x <> null` is unknown. `not exists` does not have this problem. Decorrelating `not in` into an anti-join is only valid when y is known to be non-null.
:::

## Materialized views {#ch04-views .th}

A materialized view stores its result. Keeping it current by recomputation is expensive, so systems maintain it **incrementally** using the inserted (`ir`) and deleted (`dr`) tuples:

| View | Insert into r | Delete from r |
|---|---|---|
| `v = r ⋈ s` | `v ∪ (ir ⋈ s)` | `v − (dr ⋈ s)` |
| `σθ(r)` | `v ∪ σθ(ir)` | `v − σθ(dr)` |
| `ΠA(r)` | add, counting derivations | decrement the count; delete at 0 |
| `count` | +1 to the group | −1, delete group at 0 |
| `sum` | add, and keep a count too | subtract; delete when the **count** reaches 0 |
| `min`, `max` | easy | may need to look at the other tuples of the group |

The projection count matters: with r = {(a, 2), (a, 3)}, `ΠA(r)` = {a}, and deleting (a, 2) must not remove a. A sum of 0 does not mean an empty group, which is why `sum` keeps a count.

For an expression, differentials are derived bottom-up: for `v = r ⋈ s ⋈ t`, an insert into t changes v by `it ⋈ s ⋈ r`, which runs fast only with indices on s and r's join attributes.

The optimizer can also **use** a view: rewrite `r ⋈ s ⋈ t` as `v ⋈ t`, or expand v back to `r ⋈ s` if that allows a better plan, such as an index on `r.A` for `σA=10(r) ⋈ s`. Choosing which views and indices to build, for a workload under space and update-time limits, is done by tuning assistants.

## Advanced optimizations {#ch04-advanced .th}

- **Expensive predicates**: for `σθ1(σθ2(r))` with per-tuple costs c1, c2 and selectivities s1, s2, evaluating θ1 first costs `n·c1 + n·s1·c2`; the other order costs `n·c2 + n·s2·c1`. Pick θ1 first when `c1 + s1·c2 < c2 + s2·c1`; n cancels.
- **Top-K** (`order by A limit 10`): indexed NL with an index on A, stopping early; or guess a cutoff H, add `A ≤ H`, and retry with a larger H if fewer than 10 rows come back.
- **`LIMIT` without order**: `select * from r, s where r.B = s.B limit 5` with B the primary key of s is best as indexed NL with r outer, stopping after 5 rows. Without the limit and with a large r, one random I/O per r tuple loses to hash or merge join.
- **Halloween problem**: `update emp set salary = salary * 1.1 where salary > 1000` scanned through an index on salary can meet the same row again after moving it forward in the index. Defer the updates until the scan finishes, at least when the update touches the attributes used to find rows.
- **Multiquery optimization** shares common subexpressions across a batch of queries; shared scans are the common special case.
- **Parametric optimization** handles queries with parameters: optimize at each run, keep a set of plans for parameter ranges, or cache one plan that is good for all values.
- **Adaptive execution** changes the plan at runtime, for example switching join algorithm when the outer input turns out much bigger than estimated.

```python run=db-c04-expensive
def order_cost(n, c1, s1, c2, s2):
    return n * c1 + n * s1 * c2, n * c2 + n * s2 * c1
print(order_cost(1000, c1=10, s1=0.5, c2=1, s2=0.9))
print(order_cost(1000, c1=10, s1=0.01, c2=8, s2=0.9))
```

In the first case the cheap predicate goes first despite filtering less. In the second, θ1 is so selective that running it first is worth its cost.

## Drills: query optimization {#ch04-drills .dr}

:::drill tricky
With r(A, B, C) and s(A, E), when can `B γ sum(C) (r ⋈ s)` use `r ⋉ s` instead of the join? Give a counter-example when the condition fails. When can the join be dropped entirely?
---
**Answer.** Semijoin: when every r tuple matches at most one s tuple, since the join would otherwise duplicate r tuples and inflate the sums. Counter-example: r = {(1, 2, 3)}, s = {(1, 3), (1, 5)}: the join gives sum 6 for B = 2, the semijoin 3. Drop the join: when every r tuple matches exactly one s tuple, for example r.A `not null` and a foreign key to s.A.
:::

:::drill output
How many left-deep join orders are there for n relations, and for n = 7?
---
```python run=db-c04-d-left
from math import factorial
print(factorial(7))
```

**Why.** n!: the bottom-left input has n choices, the next n − 1, and so on.
:::

:::drill concept
Are `(r ⟕ s) ⟕ t` and `(r ⟕ t) ⟕ s` equivalent for r(A, B), s(A, C), t(A, C)? Give data.
---
**Answer.** No, because C is common to s and t, so the second join also matches on C. r = {(1, 2)}, s = {(1, 3)}, t has no A = 1. First: (1, 2, 3) then no match in t, giving (1, 2, 3). Second: r ⟕ t gives (1, 2, null); joining s on A and C fails since C is null, giving (1, 2, null).
:::

:::drill output
nr = 1,000,000 and ns = 100,000. V(B, r) = 6,000 and V(B, s) = 100,000. Estimate the size of r ⋈ s on B.
---
```python run=db-c04-d-join
print(min(10**6 * 10**5 // 100_000, 10**6 * 10**5 // 6000))
```

**Why.** Take the smaller of the two estimates: here B looks like a key of s, and each r tuple matches at most one s tuple.
:::

:::drill output
An equi-depth histogram on A has 200,000 tuples per bucket with boundaries 1, 10, 40, 90, 200, 400 (buckets [1,10], [11,40], [41,90], [91,200], [201,400]). Estimate `σ 25 < A < 220`.
---
```python run=db-c04-d-hist
per = 200_000
print(round((40 - 25) / 30 * per + 2 * per + (220 - 200) / 200 * per))
```

**Why.** Half of [11, 40], all of the next two buckets, and a tenth of [201, 400], assuming uniformity inside each bucket.
:::

:::drill concept
`σ r.C=5 (r) ⋈ s` with nr = 10,000, V(C, r) = 50, ns = 2,000, V(B, r) = 200, V(B, s) = 1,000. Estimate each step.
---
```python run=db-c04-d-chain
sel = 10_000 // 50
v_b = min(200, sel)
print(sel, v_b, min(sel * 2000 // 1000, sel * 2000 // v_b))
```

**Why.** The selection keeps 200 tuples, with at most 200 distinct B values. The join estimate is the smaller of 200·2000/1000 and 200·2000/200.
:::

:::drill tricky
For `σθ1(σθ2(r))` with per-tuple costs c1, c2 and selectivities s1, s2, estimate both orders and give the rule for choosing.
---
**Answer.** θ1 first: n·c1 + n·s1·c2. θ2 first: n·c2 + n·s2·c1. Choose θ1 first iff c1 + s1·c2 < c2 + s2·c1. The relation size n cancels, so it plays no part in the choice.
:::

:::drill concept
`select * from r, s where r.B = s.B limit 5`, with B the primary key of s. What plan, and when would it stop being best without the limit?
---
**Answer.** Indexed nested loops with r outer, using s's primary-key index, stopping after 5 results. It touches only a few tuples of each relation. Without the limit and with a large r, it needs at least one random I/O per r tuple, so hash or merge join, which read each relation sequentially once, win.
:::

:::drill concept
What are the interesting sort orders for `select … from r, s where r.B = s.B and r.C = s.C order by r.A`?
---
**Answer.** On r: (B, C), (C, B) and (A). On s: (B, C) and (C, B). Sorting on the join attributes enables a merge join, and (A) serves the order by.
:::

:::drill concept
How does the DP for join ordering change for left-deep trees, and why might a system prefer them?
---
**Answer.** Instead of trying every subset S1 of S, try S1 = S − {r} for each relation r, so the right input is always a base relation: O(n·2ⁿ) instead of O(3ⁿ). Left-deep plans pipeline well and let the inner input use an index.
:::

:::drill tricky
Decorrelate `select r.A, r.B from r where r.B = (select sum(s.C) from s where s.A = r.A)`. Is an inner join correct?
---
**Answer.** `Π A,B (r ⋈ r.A = t.A ∧ r.B = t.sc ρt(A γ sum(C) as sc (s)))`. Yes: when no s tuple matches, the subquery yields null and `r.B = null` is never true, so dropping those r tuples is exactly right.
:::

:::drill tricky
Decorrelate `select A, (select count(C) from s where s.B = r.B) from r`. What goes wrong with an inner join, and what extra condition is needed?
---
**Answer.** Use `r.A γ count(s.C) (r ⟕ s)`: an inner join drops r tuples with no match, whose count should be 0, and `count(s.C)` (not `count(*)`) gives 0 for the null-padded rows. Grouping must be by a key of r: if r.A is not a key, two r tuples with the same A would be merged into one group, unlike the original.
:::

:::drill concept
Maintain `v = r(A, B, C) ⋈ s(B, D)` incrementally. Which indices make it efficient?
---
**Answer.** Inserts into r add `ir ⋈ s`, which needs an index on s.B; inserts into s add `r ⋈ is`, which needs an index on r.B. Deletes are similar. Each side's changes must find their partners in the other relation quickly.
:::

:::drill concept
Why does an incrementally maintained `sum` view also keep a count per group?
---
**Answer.** To know when to delete a group. A sum can reach 0 while the group still has tuples, for example +5 and −5, so the sum alone cannot tell an empty group from a zero total.
:::

:::drill concept
What is the Halloween problem?
---
**Answer.** An update that changes the attribute used to find rows, through an index on it, can move a row ahead of the scan and update it again, possibly forever, as with `salary = salary * 1.1 where salary > 1000`. The fix is to collect the rows first and apply the updates after the scan.
:::

## Write the code {#ch04-coding .cd}

:::drill code
Write an equi-depth histogram builder from a sample, and compare its estimate for a range with an equi-width histogram on skewed data.
---
```python run=db-c04-c-hist
import random, bisect
random.seed(11)
data = [random.paretovariate(1.5) for _ in range(100_000)]   # heavily skewed
lo, hi, buckets = min(data), max(data), 10

def equi_depth(sample, k):
    s = sorted(sample)
    return [lo] + [s[len(s) * i // k] for i in range(1, k)] + [hi]

def est(bounds, n, a, b):
    per = n / (len(bounds) - 1)
    return sum(per * max(0, min(y, b) - max(x, a)) / (y - x) for x, y in zip(bounds, bounds[1:]) if y > x)

width = [lo + (hi - lo) * i / buckets for i in range(buckets + 1)]
counts = [0] * buckets
for v in data:
    counts[min(int((v - lo) / (hi - lo) * buckets), buckets - 1)] += 1
ew = sum(c * max(0, min(width[i + 1], 3) - max(width[i], 1)) / (width[i + 1] - width[i]) for i, c in enumerate(counts))
ed = est(equi_depth(random.sample(data, 2000), buckets), len(data), 1, 3)
true = sum(1 <= v < 3 for v in data)
print(f"true {true}, equi-depth {ed:.0f}, equi-width {ew:.0f}")
```

Equi-width spends almost all its buckets on the long, nearly empty tail, so it assumes the common small values are spread over a wide range. Equi-depth puts its boundaries where the data is.
:::

:::drill code
Write a function that classifies whether pushing a selection through a left outer join is safe, and verify it on data with SQLite.
---
```python run=db-c04-c-push
import sqlite3
db = sqlite3.connect(":memory:")
db.executescript("""
create table r(A, B); insert into r values (1, 1), (2, 2);
create table s(B, C); insert into s values (1, 5);
""")
cases = {
    "on r (pushable)":       ("r.A = 2", "select * from (select * from r where r.A = 2) r left join s on r.B = s.B"),
    "on s, null-rejecting":  ("s.C = 5", "select * from r join s on r.B = s.B where s.C = 5"),
    "on s, keeps nulls":     ("s.C is null", "select * from r left join (select * from s where s.C is null) s on r.B = s.B"),
}
for name, (cond, rewrite) in cases.items():
    orig = sorted(db.execute(f"select * from r left join s on r.B = s.B where {cond}").fetchall())
    new = sorted(db.execute(rewrite).fetchall())
    print(f"{name:22} equal: {orig == new}  {orig}")
```

The first two rewrites are valid: a condition on the preserved side can go below the join (rule 15), and a null-rejecting condition on s turns the outer join into an inner join (rule 16). The third is the classic mistake: pushing `s.C is null` into s finds no s rows, so every r row comes back null-padded, while the original keeps only r's unmatched row.
:::

## Cheat sheet {#ch04-cheatsheet .th}

- Push selections and projections down; choose joins that keep intermediates small.
- σ moves below γ only if it uses grouping attributes. Outer joins don't associate; pushing σ into the null-padded side is wrong unless σ is null-rejecting (then it's an inner join).
- Join → semijoin when each r tuple matches at most one s tuple; drop the join when exactly one (non-null foreign key).
- σA=v: nr/V(A,r). Join on non-key A: min(nr·ns/V(A,s), nr·ns/V(A,r)). Foreign key: exactly ns.
- Equi-depth histograms handle skew; assume uniformity within a bucket.
- Join trees: (2(n−1))!/(n−1)!; left-deep n!. DP over subsets: O(3ⁿ) bushy, O(n·2ⁿ) left-deep; keep plans per interesting order.
- exists → semijoin; not exists → anti-semijoin; scalar count needs a left outer join; NOT IN with nulls returns nothing.
- Materialized views: differentials; counts for projection and sum; min/max deletes may need recomputation.
- Expensive predicates: θ1 first iff c1 + s1·c2 < c2 + s2·c1.
