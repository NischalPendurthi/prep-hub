/* Domain → subdomain registry. Question `subtopic` must equal a subdomain `name`,
   and question ids must be `<prefix>-<key>-NNN`. Order here is display order. */
window.CATALOG = [
  {
    id: "networks", prefix: "cn", name: "Computer Networks", short: "Networks",
    subdomains: [
      { key: "models", name: "OSI & TCP/IP Models" },
      { key: "datalink", name: "Physical & Data Link Layer" },
      { key: "error", name: "Error Detection & Correction" },
      { key: "flow", name: "Flow Control & ARQ" },
      { key: "ip", name: "IP Addressing & Subnetting" },
      { key: "netlayer", name: "NAT, IPv6, ICMP & Fragmentation" },
      { key: "routing", name: "Routing Algorithms & Protocols" },
      { key: "transport", name: "TCP & UDP" },
      { key: "congestion", name: "TCP Flow & Congestion Control" },
      { key: "http", name: "HTTP & Web Protocols" },
      { key: "appproto", name: "DNS, DHCP, Email & FTP" },
      { key: "security", name: "Network Security" },
      { key: "perf", name: "Delays & Performance" },
      { key: "infra", name: "Web Infrastructure & Scenarios" }
    ]
  },
  {
    id: "os", prefix: "os", name: "Operating Systems", short: "OS",
    subdomains: [
      { key: "basics", name: "OS Basics & Kernel" },
      { key: "proc", name: "Processes & fork()" },
      { key: "ipc", name: "Inter-Process Communication" },
      { key: "threads", name: "Threads" },
      { key: "sched", name: "CPU Scheduling" },
      { key: "sync", name: "Process Synchronization" },
      { key: "deadlock", name: "Deadlocks" },
      { key: "mem", name: "Memory Management & Paging" },
      { key: "vm", name: "Virtual Memory & Page Replacement" },
      { key: "fs", name: "File Systems" },
      { key: "disk", name: "Disk Scheduling & RAID" },
      { key: "virt", name: "Virtualization & Linux" }
    ]
  },
  {
    id: "sql", prefix: "sql", name: "SQL / DBMS", short: "SQL",
    subdomains: [
      { key: "fund", name: "DBMS Fundamentals & Keys" },
      { key: "basics", name: "SQL Basics & NULL Handling" },
      { key: "agg", name: "Aggregation & GROUP BY" },
      { key: "joins", name: "Joins" },
      { key: "subq", name: "Subqueries & Set Operations" },
      { key: "window", name: "Window Functions" },
      { key: "classic", name: "Classic Interview Queries" },
      { key: "adv", name: "Advanced SQL Features" },
      { key: "index", name: "Indexing" },
      { key: "norm", name: "Normalization" },
      { key: "txn", name: "Transactions & Concurrency" },
      { key: "nosql", name: "NoSQL & Distributed Databases" }
    ]
  },
  {
    id: "python", prefix: "py", name: "Python", short: "Python",
    subdomains: [
      { key: "types", name: "Data Types & Object Model" },
      { key: "strings", name: "Strings" },
      { key: "containers", name: "Lists, Tuples, Sets & Dicts" },
      { key: "comp", name: "Comprehensions & Generator Expressions" },
      { key: "control", name: "Control Flow" },
      { key: "func", name: "Functions & Scope" },
      { key: "iter", name: "Iterators & Generators" },
      { key: "deco", name: "Decorators & Closures" },
      { key: "oop", name: "OOP Basics" },
      { key: "oopadv", name: "Inheritance, MRO & Special Methods" },
      { key: "exc", name: "Exceptions & Context Managers" },
      { key: "modules", name: "Modules & Packages" },
      { key: "memory", name: "Memory, GIL & Concurrency" },
      { key: "stdlib", name: "Built-ins & Standard Library" }
    ]
  },
  {
    id: "finance", prefix: "fin", name: "Finance", short: "Finance",
    subdomains: [
      { key: "tvm", name: "Time Value of Money & Discounting" },
      { key: "acct", name: "Accounting & Financial Statements" },
      { key: "ratios", name: "Financial Ratios & Working Capital" },
      { key: "capbud", name: "Capital Budgeting" },
      { key: "wacc", name: "Cost of Capital & Capital Structure" },
      { key: "valuation", name: "Valuation: DCF & Multiples" },
      { key: "bonds", name: "Bonds, Yields & Term Structure" },
      { key: "equity", name: "Investing & Equity Markets" },
      { key: "technical", name: "Technical Analysis & Trading Strategies" },
      { key: "risk", name: "Risk, Return & Portfolio Theory" },
      { key: "prob", name: "Probability for Quant Finance" },
      { key: "stoch", name: "Stochastic Calculus & GBM" },
      { key: "timeseries", name: "Time Series: Stationarity & Forecasting" },
      { key: "volmodels", name: "Volatility Models & Backtesting" },
      { key: "futures", name: "Futures, Forwards & Hedging" },
      { key: "swaps", name: "Swaps" },
      { key: "options", name: "Options: Payoffs, Bounds & Strategies" },
      { key: "optpricing", name: "Option Pricing: Binomial & Black-Scholes" },
      { key: "greeks", name: "The Greeks & Risk Management" },
      { key: "macro", name: "Economics, Banking & Monetary Policy" },
      { key: "ma", name: "M&A, LBOs & Corporate Actions" }
    ]
  }
];
window.QUESTIONS = window.QUESTIONS || [];
