---
id: aggregation-formatting
title: Aggregation & Exact Formatting
signals:
  - "group log lines / orders / transactions by a key and report counts, sums, averages"
  - "output a table: header row, then one row per key, in a specified sort order"
  - "\"print to exactly 2 decimal places\", \"separate with commas\", \"no trailing spaces\""
  - "keys are strings that may compare case-sensitively, or numbers given as strings"
  - "OA judges compare output exactly, so spacing and order are part of the answer"
idea: |
  Read everything into **`map<key, …>`** (ordered output for free) or `unordered_map` +
  a final **sort with the exact tie-breaks** from the statement. Build each row
  completely before printing, and print **separators between** items, not after them.
  For decimals use **`fixed << setprecision(k)`**, or integer arithmetic plus manual
  rounding when the judge wants a specific rounding rule.
complexity: "O(n log n)"
pitfalls:
  - "Numeric keys stored as strings sort wrong (\"10\" < \"3\"). Convert table numbers to ll before using them as map keys."
  - "std::string compares by ASCII: uppercase sorts before lowercase (\"Beef\" < \"apple\"). Match what the statement says."
  - "`mp[key]` inside a print loop inserts missing keys; use `count`/`find` when iterating the same map."
  - "`setprecision` without `fixed` prints significant digits (\"1e+02\"); averages of ints need a cast to double or long double."
  - "Lines with spaces need `getline` after `cin >> n` (and `cin.ignore()` to eat the newline)."
related: [prefix-hashmap-count, anagram-counting, coordinate-compression]
---
### Toolkit

| need | C++ |
|---|---|
| ordered grouping | `map<string, map<string,ll>>` |
| custom order | collect into `vector`, `sort` with a lambda that spells out every tie-break |
| fixed decimals | `cout << fixed << setprecision(2) << x` |
| split a line by a delimiter | `stringstream ss(line); while(getline(ss, tok, ',')) …` |
| join with commas | print `","` before every item except the first |
| pad / align | `setw(k)` with `left` / `right`, or build the string and pad with `string(k, ' ')` |

### Key loop (the template, LC 1418)
```cpp
cout<<"Table"; for(auto &f:foods) cout<<","<<f; cout<<"\n";
for(auto &[tb,mp]:cnt){
    cout<<tb;
    for(auto &f:foods) cout<<","<<(mp.count(f)?mp[f]:0);
    cout<<"\n";
}
```

### Before submitting
Diff your output against the sample character by character: header present, trailing
comma absent, empty groups handled, one newline per row.
