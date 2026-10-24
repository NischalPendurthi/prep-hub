/* Finance — Accounting & Financial Statements */
window.QUESTIONS.push(
  {
    id: "fin-acct-001", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "easy", type: "concept",
    question: "What does each of the three main financial statements show?",
    options: ["Income statement: revenues, expenses and profit over a period; balance sheet: assets, liabilities and equity at a point in time; cash flow statement: cash in and out over a period from operating, investing and financing activities", "All three show cash only", "Balance sheet: profit over a year", "Cash flow statement: assets and liabilities"],
    answer: 0,
    explanation: "Profit (accrual-based) and cash differ; the cash flow statement reconciles them. Analysts use all three together.",
    optionExplanations: ["Correct.", "Only one is about cash.", "That's the income statement.", "That's the balance sheet."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-acct-002", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "easy", type: "numerical",
    question: "A company has total assets of $500m and total liabilities of $300m. What is shareholders' equity?",
    options: ["$800m", "$200m", "$300m", "$500m"],
    answer: 1,
    explanation: "Assets = Liabilities + Equity → Equity = 500 − 300 = $200m. Every transaction keeps this identity balanced (double entry).",
    optionExplanations: ["Adds instead of subtracting.", "Correct.", "That's liabilities.", "That's assets."]
  },
  {
    id: "fin-acct-003", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "easy", type: "concept",
    question: "What is the difference between accrual and cash accounting?",
    options: ["They're the same", "Accrual accounting records revenue when earned and expenses when incurred (matching expenses to the revenues they generate), regardless of when cash moves; cash accounting records only cash receipts and payments", "Accrual accounting ignores revenue", "Cash accounting is required for listed companies"],
    answer: 1,
    explanation: "Listed companies use accrual accounting (GAAP/IFRS). Example: a sale on 60-day credit is revenue now (with accounts receivable), cash later.",
    optionExplanations: ["They differ in timing.", "Correct.", "It records revenue when earned.", "Accrual is required."]
  },
  {
    id: "fin-acct-004", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "numerical",
    question: "Revenue 1,000; COGS 600; SG&A 150; depreciation & amortisation 50; interest expense 40; tax rate 25%. What are gross profit, EBITDA, EBIT and net income?",
    options: ["400, 200, 250, 120", "400, 250, 200, 120", "400, 250, 160, 160", "1,000, 250, 200, 150"],
    answer: 1,
    explanation: "Gross profit = 1,000 − 600 = 400. EBITDA = 400 − 150 = 250. EBIT = 250 − 50 = 200. EBT = 200 − 40 = 160. Net income = 160 × 0.75 = 120.",
    optionExplanations: ["EBITDA and EBIT swapped.", "Correct.", "Confuses EBIT with EBT and ignores tax.", "Wrong gross profit."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-acct-005", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "easy", type: "concept",
    question: "Which item is a current liability?",
    options: ["Long-term bonds due in 10 years", "Accounts payable (owed to suppliers within the operating cycle/a year)", "Goodwill", "Retained earnings"],
    answer: 1,
    explanation: "Current liabilities: accounts payable, accrued expenses, deferred revenue, short-term debt and the current portion of long-term debt. Current assets: cash, receivables, inventory, prepaid expenses.",
    optionExplanations: ["Non-current liability.", "Correct.", "Non-current asset.", "Equity."]
  },
  {
    id: "fin-acct-006", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "numerical",
    question: "Net income 100; depreciation 30; accounts receivable up 20; inventory up 10; accounts payable up 15. What is cash flow from operations (indirect method)?",
    options: ["100", "175", "115", "85"],
    answer: 2,
    explanation: "CFO = NI + non-cash charges − increases in operating assets + increases in operating liabilities = 100 + 30 − 20 − 10 + 15 = 115. Rising receivables/inventory tie up cash; rising payables free cash.",
    optionExplanations: ["That ignores adjustments.", "Wrong signs on working capital.", "Correct.", "That subtracts depreciation."]
  },
  {
    id: "fin-acct-007", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "concept",
    question: "How are the three statements linked?",
    options: ["They're independent", "Cash flow is copied from the income statement", "Only the balance sheet uses net income", "Net income from the income statement starts the cash flow statement and flows into retained earnings on the balance sheet; the cash flow statement's net change in cash equals the change in the balance sheet cash balance; depreciation reduces PP&E and is added back in CFO"],
    answer: 3,
    explanation: "Changes in balance sheet working-capital accounts drive CFO adjustments; capex hits CFI and PP&E; debt and equity issues/repayments hit CFF and the balance sheet.",
    optionExplanations: ["They're tightly linked.", "They differ.", "It flows to CFS too.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-acct-008", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "hard", type: "numerical",
    question: "Depreciation increases by $10 (tax rate 25%). Walk it through the three statements.",
    options: ["Net income −7.5; CFO +2.5 (−7.5 + 10 add-back); balance sheet: cash +2.5, PP&E −10 (assets −7.5), retained earnings −7.5 — balanced", "Net income −10; cash −10; assets −10", "No effect: depreciation is non-cash", "Net income +7.5; cash +10"],
    answer: 0,
    explanation: "EBIT −10 → tax −2.5 → NI −7.5. On the CFS, add back the non-cash $10: net cash +2.5 (the tax saving). Assets: cash +2.5, PP&E −10 = −7.5; equity: −7.5. Both sides fall by 7.5.",
    optionExplanations: ["Correct.", "Ignores taxes and the add-back.", "It affects taxes, hence cash.", "Wrong direction."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-acct-009", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "numerical",
    question: "A machine costs $100,000 with a $10,000 salvage value and 5-year life. What is annual straight-line depreciation, and the first two years under double-declining balance?",
    options: ["$20,000; $40,000 and $40,000", "$20,000; $36,000 and $28,800", "$18,000; $36,000 and $21,600", "$18,000; $40,000 and $24,000"],
    answer: 3,
    explanation: "Straight-line = (100,000 − 10,000)/5 = $18,000. DDB rate = 2/5 = 40% of book value (salvage ignored until the floor): year 1 = 40,000; year 2 = 40% × 60,000 = 24,000. Accelerated methods front-load expense (lower early profit, earlier tax savings).",
    optionExplanations: ["Ignores salvage; DDB declines.", "Wrong.", "Applies DDB to cost less salvage.", "Correct."]
  },
  {
    id: "fin-acct-010", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "hard", type: "numerical",
    question: "Opening inventory: 100 units at $10. Purchases: 100 units at $12. 150 units are sold. What is COGS under FIFO, LIFO and weighted average?",
    options: ["FIFO $1,700, LIFO $1,600, average $1,650", "FIFO $1,500, LIFO $1,800, average $1,650", "All $1,650", "FIFO $1,600, LIFO $1,700, average $1,650"],
    answer: 3,
    explanation: "FIFO: 100 × 10 + 50 × 12 = $1,600 (ending inventory 50 × 12 = $600). LIFO: 100 × 12 + 50 × 10 = $1,700 (ending $500). Average cost = $11 × 150 = $1,650. With rising prices FIFO shows higher profit and inventory; LIFO lower taxes (LIFO is banned under IFRS).",
    optionExplanations: ["Swapped.", "Wrong arithmetic.", "Methods differ when prices change.", "Correct."]
  },
  {
    id: "fin-acct-011", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "numerical",
    question: "A customer prepays $1,200 for a 12-month subscription on 1 January. At 31 March, how much revenue has been recognised and what liability remains?",
    options: ["$1,200 revenue; no liability", "$0 revenue; $1,200 receivable", "$300 revenue; $900 deferred revenue (liability)", "$900 revenue; $300 deferred revenue"],
    answer: 2,
    explanation: "Revenue is recognised as the service is delivered: 3/12 × 1,200 = $300. The unearned $900 is deferred revenue — a liability, since the company owes future service. Cash was received upfront, boosting CFO.",
    optionExplanations: ["Not yet earned.", "Cash was received; no receivable.", "Correct.", "Reversed."]
  },
  {
    id: "fin-acct-012", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "concept",
    question: "What happens when a cost is capitalised instead of expensed?",
    options: ["Profit falls immediately", "It disappears from the accounts", "It's recorded as an asset (e.g. PP&E) and depreciated/amortised over its useful life, so current profit is higher, later profits are lower, and the cash outflow appears in investing (capex) rather than operating cash flow", "It's added to revenue"],
    answer: 2,
    explanation: "Capex (long-lived benefits) is capitalised; opex (repairs, salaries) is expensed. Aggressive capitalisation inflates profits and CFO — a classic red flag.",
    optionExplanations: ["The opposite.", "It's on the balance sheet.", "Correct.", "Not revenue."]
  },
  {
    id: "fin-acct-013", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "concept",
    question: "What is goodwill, and how is it treated afterwards?",
    options: ["The excess of the purchase price over the fair value of identifiable net assets in an acquisition; it isn't amortised under IFRS/US GAAP but is tested annually for impairment, with any write-down hitting the income statement", "The value of a company's brand built internally", "A current asset", "Cash held for charity"],
    answer: 0,
    explanation: "Internally generated brands aren't recognised. Identifiable intangibles (patents, customer lists) with finite lives are amortised.",
    optionExplanations: ["Correct.", "Internal goodwill isn't recognised.", "It's non-current.", "Not cash."]
  },
  {
    id: "fin-acct-014", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "easy", type: "concept",
    question: "A company buys equipment for $50,000 cash. What is the journal entry?",
    options: ["Debit cash, credit equipment", "Debit equipment (asset up) $50,000; credit cash (asset down) $50,000", "Debit expense, credit revenue", "Credit equipment, credit cash"],
    answer: 1,
    explanation: "Debits increase assets and expenses; credits increase liabilities, equity and revenue. Total debits always equal total credits.",
    optionExplanations: ["Reversed.", "Correct.", "Not an expense.", "Debits must equal credits."]
  },
  {
    id: "fin-acct-015", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "easy", type: "numerical",
    question: "Retained earnings are $500 at the start of the year. Net income is $120 and dividends are $40. What is ending retained earnings?",
    options: ["$620", "$460", "$660", "$580"],
    answer: 3,
    explanation: "Ending RE = beginning RE + net income − dividends = 500 + 120 − 40 = $580.",
    optionExplanations: ["Ignores dividends.", "Subtracts net income.", "Adds dividends.", "Correct."]
  },
  {
    id: "fin-acct-016", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "numerical",
    question: "Cash flow from operations is $150m and capital expenditure is $60m. What is free cash flow, and why does it matter?",
    options: ["$210m; it's revenue", "$60m", "$150m; capex is ignored", "$90m: cash available after maintaining and growing the asset base, which can repay debt, pay dividends or buy back shares"],
    answer: 3,
    explanation: "FCF = CFO − capex (this is levered FCF to equity holders, roughly). Unlevered FCF (to all capital providers) is used in DCF valuation.",
    optionExplanations: ["Capex is subtracted.", "That's capex.", "Capex consumes cash.", "Correct."]
  },
  {
    id: "fin-acct-017", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "hard", type: "concept",
    question: "A company uses accelerated depreciation for tax but straight-line for its financial statements. What results?",
    options: ["A deferred tax liability: taxes paid now are lower than tax expense reported, and the difference reverses later when tax depreciation falls below book depreciation", "A deferred tax asset", "No effect", "Higher current taxes"],
    answer: 0,
    explanation: "Deferred tax assets arise in the opposite case (e.g. tax-loss carryforwards, expenses deductible later). The deferred tax change is a non-cash item adjusted in CFO.",
    optionExplanations: ["Correct.", "Opposite case.", "Timing differences create deferred tax.", "Current taxes are lower."]
  },
  {
    id: "fin-acct-018", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "concept",
    question: "Why is EBITDA popular, and what are its limitations?",
    options: ["It's the same as cash flow", "It approximates operating cash profit before capital structure and non-cash D&A, enabling comparisons across firms; but it ignores capex, working-capital needs, interest and taxes, and isn't a GAAP measure, so it can flatter capital-intensive or indebted companies", "It includes all costs", "It's mandated by IFRS"],
    answer: 1,
    explanation: "Warren Buffett's quip: 'Does management think the tooth fairy pays for capital expenditures?' Use EBITDA alongside FCF.",
    optionExplanations: ["It ignores capex and working capital.", "Correct.", "It excludes D&A, interest and tax.", "It's non-GAAP."]
  },
  {
    id: "fin-acct-019", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "hard", type: "numerical",
    question: "A company writes down $20 of inventory (tax rate 25%). What happens across the statements?",
    options: ["NI −20; cash −20", "NI −15; cash −15", "No effect until the inventory is sold", "NI −15; CFO: −15 + 20 non-cash add-back = +5 (tax saving); balance sheet: inventory −20, cash +5 (assets −15), retained earnings −15"],
    answer: 3,
    explanation: "A write-down is a non-cash expense like depreciation; the only cash effect is lower taxes.",
    optionExplanations: ["Ignores tax and the non-cash nature.", "Cash isn't spent.", "Impairments are recognised when identified.", "Correct."]
  },
  {
    id: "fin-acct-020", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "concept",
    question: "A company borrows $100 and uses it to buy equipment. What changes immediately in the three statements?",
    options: ["No income statement effect yet; cash flow statement: CFF +100, CFI −100 (net cash 0); balance sheet: PP&E +100, debt +100", "Net income falls by $100", "Revenue rises by $100", "Equity rises by $100"],
    answer: 0,
    explanation: "Later, depreciation and interest expense will reduce net income.",
    optionExplanations: ["Correct.", "Capex isn't expensed.", "No revenue.", "Debt, not equity."]
  },
  {
    id: "fin-acct-021", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "easy", type: "concept",
    question: "Which is NOT normally part of shareholders' equity?",
    options: ["Share capital / additional paid-in capital", "Retained earnings", "Accounts payable", "Treasury stock (as a deduction) and accumulated other comprehensive income"],
    answer: 2,
    explanation: "Accounts payable is a current liability. Equity components: share capital and premium, retained earnings, treasury shares (negative), OCI reserves, minority interest (shown within equity under IFRS).",
    optionExplanations: ["Part of equity.", "Part of equity.", "Correct: a liability.", "Part of equity."]
  },
  {
    id: "fin-acct-022", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "concept",
    question: "When should revenue be recognised under modern standards (IFRS 15 / ASC 606)?",
    options: ["When cash is received", "When (or as) the company satisfies its performance obligations by transferring control of goods/services to the customer, at the transaction price allocated to them", "When the contract is signed", "At year-end only"],
    answer: 1,
    explanation: "Five steps: identify the contract → identify performance obligations → determine the price → allocate it → recognise as obligations are satisfied.",
    optionExplanations: ["That's cash accounting.", "Correct.", "Signing alone isn't delivery.", "Recognised when earned."]
  },
  {
    id: "fin-acct-023", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "concept",
    question: "Which statement about IFRS and US GAAP is correct?",
    options: ["US GAAP is more rules-based and IFRS more principles-based; e.g. LIFO is allowed under US GAAP but banned under IFRS, and interest paid can be classified as operating or financing under IFRS but is operating under US GAAP", "They're identical", "IFRS allows LIFO", "US GAAP is used in India"],
    answer: 0,
    explanation: "India uses Ind AS, converged with IFRS. Auditors give an opinion on whether statements are fairly presented and flag going-concern doubts.",
    optionExplanations: ["Correct.", "They differ.", "IFRS bans LIFO.", "India uses Ind AS."]
  },
  {
    id: "fin-acct-024", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "easy", type: "concept",
    question: "What does a 'going concern' warning from the auditor mean?",
    options: ["There's significant doubt about the company's ability to continue operating for the next 12 months (e.g. liquidity problems), which would undermine the assumption on which the accounts are prepared", "The company is growing fast", "The audit is complete", "The company has paid a dividend"],
    answer: 0,
    explanation: "Financial statements assume the business will continue; if not, assets might have to be valued at liquidation values.",
    optionExplanations: ["Correct.", "Not related.", "Not this.", "Unrelated."]
  },
  {
    id: "fin-acct-025", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "medium", type: "concept",
    question: "A company pays a year's rent of $12,000 in advance on 1 July. At 31 December (year-end), how is it reported?",
    options: ["$12,000 expense", "$12,000 liability", "$6,000 rent expense and $6,000 prepaid expense (current asset)", "$0 expense; $12,000 prepaid"],
    answer: 2,
    explanation: "Matching principle: expense only the portion used (6 months). The rest is a prepaid asset, expensed next year.",
    optionExplanations: ["Only half has been used.", "Not a liability.", "Correct.", "Half has been used."]
  },
  {
    id: "fin-acct-026", subject: "finance", subtopic: "Accounting & Financial Statements", difficulty: "hard", type: "concept",
    question: "Net income has grown 20% a year for three years, but cash flow from operations has been flat and receivables have doubled. What does this suggest?",
    options: ["Exceptional performance", "Nothing; cash and profit always differ", "Earnings quality concerns: profits may come from aggressive revenue recognition or customers not paying; analysts check the gap between NI and CFO, DSO trends and accruals", "That depreciation is too high"],
    answer: 2,
    explanation: "Sustained divergence between accrual profits and cash is a classic red flag (e.g. channel stuffing, fictitious sales).",
    optionExplanations: ["Cash isn't following profit.", "Persistent divergence is meaningful.", "Correct.", "Unrelated."]
  }
);
