/* Finance — Financial Ratios & Working Capital */
window.QUESTIONS.push(
  {
    id: "fin-ratios-001", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "easy", type: "numerical",
    question: "Current assets are 500 (cash 100, receivables 150, inventory 200, prepaid 50) and current liabilities are 250. What are the current, quick and cash ratios?",
    options: ["2.0, 1.2, 0.4", "1.0, 2.0, 0.4", "2.0, 1.0, 0.4", "2.0, 1.0, 1.0"],
    answer: 2,
    explanation: "Current = 500/250 = 2.0. Quick (acid-test) = (cash + receivables)/CL = 250/250 = 1.0 — excludes inventory and prepaids, which aren't quickly convertible to cash. Cash ratio = 100/250 = 0.4.",
    optionExplanations: ["Quick ratio includes prepaids here wrongly.", "Swapped.", "Correct.", "Wrong cash ratio."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-ratios-002", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "medium", type: "numerical",
    question: "Debt 400, equity 600, EBIT 120, interest expense 30, cash 100, EBITDA 150. What are debt-to-equity, debt-to-capital, interest coverage and net debt/EBITDA?",
    options: ["0.4, 0.67, 4.0×, 2.0×", "0.67, 0.40, 5.0×, 2.67×", "0.67, 0.40, 4.0×, 2.0×", "1.5, 0.6, 4.0×, 3.0×"],
    answer: 2,
    explanation: "D/E = 400/600 = 0.67. D/(D + E) = 400/1,000 = 0.40. Interest coverage = EBIT/interest = 4.0×. Net debt/EBITDA = (400 − 100)/150 = 2.0× — a key leverage metric in lending and LBOs.",
    optionExplanations: ["D/E and D/Cap swapped.", "Wrong coverage and leverage.", "Correct.", "Inverted D/E."]
  },
  {
    id: "fin-ratios-003", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "easy", type: "numerical",
    question: "Revenue 1,000, gross profit 400, EBIT 150, net income 90. What are the gross, operating and net margins?",
    options: ["40%, 15%, 9%", "40%, 9%, 15%", "60%, 15%, 9%", "4%, 1.5%, 0.9%"],
    answer: 0,
    explanation: "Gross margin = 400/1,000 = 40%; operating margin = 150/1,000 = 15%; net margin = 90/1,000 = 9%. Margins are compared over time and against peers in the same industry.",
    optionExplanations: ["Correct.", "Operating and net swapped.", "60% is the COGS ratio.", "Off by a factor of 10."]
  },
  {
    id: "fin-ratios-004", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "medium", type: "numerical",
    question: "Net income 90, revenue 1,000, total assets 1,500, equity 600. Use DuPont analysis to find ROE.",
    options: ["9%", "6%", "15% = 9% net margin × 0.667 asset turnover × 2.5 equity multiplier", "25%"],
    answer: 2,
    explanation: "ROE = (NI/Sales) × (Sales/Assets) × (Assets/Equity) = 0.09 × 0.667 × 2.5 = 15% = 90/600. DuPont shows whether ROE comes from profitability, efficiency or leverage. ROA = 90/1,500 = 6%.",
    optionExplanations: ["That's the net margin.", "That's ROA.", "Correct.", "Wrong arithmetic."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-ratios-005", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "medium", type: "concept",
    question: "Two companies have the same 15% ROE. Company A has a 15% net margin and little debt; company B has a 3% net margin, high asset turnover and an equity multiplier of 4. What does DuPont reveal?",
    options: ["They're identical", "Leverage doesn't affect ROE", "B is safer", "A's ROE comes from profitability; B's from efficiency and especially leverage — B's ROE is riskier because high debt magnifies losses in a downturn"],
    answer: 3,
    explanation: "Equal ROEs can hide very different risk profiles; that's why ROE is decomposed and compared with ROA/ROIC.",
    optionExplanations: ["Sources differ.", "It multiplies ROE.", "Leverage adds risk.", "Correct."]
  },
  {
    id: "fin-ratios-006", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "medium", type: "numerical",
    question: "EBIT is 150, total assets 1,500 and current liabilities 250. What is ROCE (return on capital employed)?",
    options: ["10%", "15%", "12%", "60%"],
    answer: 2,
    explanation: "Capital employed = total assets − current liabilities = 1,250. ROCE = EBIT/capital employed = 150/1,250 = 12%. ROIC uses after-tax operating profit (NOPAT) over invested capital; compare it with WACC to see if value is created.",
    optionExplanations: ["EBIT/assets.", "Wrong arithmetic.", "Correct.", "EBIT/CL."]
  },
  {
    id: "fin-ratios-007", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "medium", type: "numerical",
    question: "Revenue 1,000, COGS 600, receivables 150, inventory 200, payables 100 (365-day year). What are DSO, DIO and DPO?",
    options: ["54.8, 121.7, 60.8 days", "54.8, 73.0, 36.5 days", "36.5, 121.7, 60.8 days", "121.7, 54.8, 60.8 days"],
    answer: 0,
    explanation: "DSO = 150/1,000 × 365 = 54.8 days. DIO = 200/600 × 365 = 121.7 days (inventory turnover = 600/200 = 3×). DPO = 100/600 × 365 = 60.8 days. DIO and DPO use COGS; DSO uses revenue.",
    optionExplanations: ["Correct.", "DIO and DPO should use COGS, not revenue.", "Wrong DSO.", "DSO and DIO swapped."]
  },
  {
    id: "fin-ratios-008", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "medium", type: "numerical",
    question: "Using DSO 54.8, DIO 121.7 and DPO 60.8 days, what is the cash conversion cycle, and what does it mean?",
    options: ["237.3 days", "60.8 days", "6.1 days", "About 115.6 days: the time between paying suppliers and collecting cash from customers, financed by the company"],
    answer: 3,
    explanation: "CCC = DSO + DIO − DPO = 54.8 + 121.7 − 60.8 = 115.6 days. Shortening it (collect faster, hold less stock, pay later) frees cash. Some retailers run negative CCCs.",
    optionExplanations: ["DPO should be subtracted.", "That's DPO.", "Wrong arithmetic.", "Correct."]
  },
  {
    id: "fin-ratios-009", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "easy", type: "concept",
    question: "A growing company's receivables and inventory rise faster than its payables. What happens to its operating cash flow?",
    options: ["It falls relative to net income, because increases in net working capital consume cash", "It rises by the same amount", "No effect", "It always becomes negative"],
    answer: 0,
    explanation: "Net working capital = current operating assets − current operating liabilities. Fast-growing companies can be profitable but cash-strapped — 'growing broke'.",
    optionExplanations: ["Correct.", "The opposite.", "Working capital affects cash.", "Not necessarily negative."]
  },
  {
    id: "fin-ratios-010", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "hard", type: "numerical",
    question: "Net income 90, preferred dividends 10, weighted average shares 40. There are also 10 options with strike $15 and the share price is $20. What are basic and diluted EPS (treasury stock method)?",
    options: ["2.25 and 1.80", "2.25 and about 2.12", "2.00 and 1.60", "2.00 and about 1.88"],
    answer: 3,
    explanation: "Basic = (90 − 10)/40 = 2.00. Treasury method: exercise proceeds 10 × 15 = 150 buy back 150/20 = 7.5 shares → net new shares 2.5. Diluted = 80/42.5 = 1.88. Only in-the-money options dilute.",
    optionExplanations: ["Ignores preferred dividends.", "Ignores preferred dividends.", "Adds all 10 shares.", "Correct."]
  },
  {
    id: "fin-ratios-011", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "medium", type: "numerical",
    question: "ROE is 15% and the company pays out 40% of earnings as dividends. What is its sustainable growth rate?",
    options: ["6%", "40%", "15%", "9%"],
    answer: 3,
    explanation: "g = ROE × retention ratio = 15% × (1 − 0.40) = 9%. This is the growth rate achievable without new equity while keeping leverage constant.",
    optionExplanations: ["That uses the payout ratio.", "That's the payout ratio.", "That assumes full retention.", "Correct."]
  },
  {
    id: "fin-ratios-012", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "hard", type: "numerical",
    question: "Sales 1,000, variable costs 600, fixed operating costs 250, interest 30. What are DOL, DFL and the combined (total) leverage?",
    options: ["1.67, 1.25, 2.08", "2.67, 1.25, 3.33", "2.67, 1.20, 3.20", "4.00, 1.25, 5.00"],
    answer: 1,
    explanation: "Contribution margin = 400; EBIT = 150. DOL = CM/EBIT = 2.67 (a 10% sales rise → 26.7% EBIT rise). DFL = EBIT/(EBIT − interest) = 150/120 = 1.25. DTL = 2.67 × 1.25 = 3.33: a 10% sales change moves EPS by about 33%.",
    optionExplanations: ["Wrong DOL.", "Correct.", "Wrong DFL.", "Wrong DOL."]
  },
  {
    id: "fin-ratios-013", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "medium", type: "numerical",
    question: "A product sells for $50 with variable cost $30 per unit and fixed costs of $250,000. What is the break-even volume, and the volume needed for $50,000 profit?",
    options: ["12,500 and 15,000 units", "5,000 and 6,000 units", "8,333 and 10,000 units", "12,500 and 17,500 units"],
    answer: 0,
    explanation: "Contribution margin per unit = 50 − 30 = $20. Break-even = 250,000/20 = 12,500 units. For a $50,000 target: (250,000 + 50,000)/20 = 15,000 units.",
    optionExplanations: ["Correct.", "Uses price instead of contribution.", "Uses variable cost.", "Wrong target arithmetic."]
  },
  {
    id: "fin-ratios-014", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "medium", type: "concept",
    question: "Which is a key limitation of ratio analysis?",
    options: ["Ratios can't be computed from public data", "Ratios include market expectations", "Ratios are always comparable across all industries", "Ratios depend on accounting choices (inventory method, depreciation, leases), differ across industries, reflect a single date that can be 'window-dressed', and need trends and peer context to interpret"],
    answer: 3,
    explanation: "A current ratio of 1.0 may be fine for a supermarket (fast inventory, negative CCC) but risky for a manufacturer.",
    optionExplanations: ["They can.", "Most are accounting-based.", "Industry norms differ.", "Correct."]
  },
  {
    id: "fin-ratios-015", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "easy", type: "concept",
    question: "A company's current ratio is 3.5, far above its peers'. Is this necessarily good?",
    options: ["Yes, always", "Not necessarily: it signals strong liquidity, but may reflect idle cash, slow-moving inventory or uncollected receivables — inefficient use of capital that lowers returns", "No, it means the company is insolvent", "It means debt is high"],
    answer: 1,
    explanation: "Check the quick ratio and turnover ratios to see what's driving it.",
    optionExplanations: ["Too much liquidity can be inefficient.", "Correct.", "The opposite.", "Unrelated."]
  },
  {
    id: "fin-ratios-016", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "medium", type: "numerical",
    question: "A company pays $2 dividends per share on EPS of $5. What are its payout and retention ratios?",
    options: ["60% and 40%", "250% and −150%", "40% and 60%", "2% and 98%"],
    answer: 2,
    explanation: "Payout = DPS/EPS = 2/5 = 40%; retention (plowback) = 1 − 40% = 60%. Retained earnings fund reinvestment; with ROE they determine sustainable growth.",
    optionExplanations: ["Swapped.", "Inverted.", "Correct.", "Not percentages of price."]
  },
  {
    id: "fin-ratios-017", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "hard", type: "concept",
    question: "A company's DSO rose from 45 to 75 days while revenue grew 30%. What should an analyst investigate?",
    options: ["Nothing; growth is good", "Whether growth is being bought with looser credit terms or aggressive revenue recognition (e.g. channel stuffing), the quality/collectability of receivables, and the impact on cash flow and bad-debt provisions", "Inventory accounting only", "The dividend policy"],
    answer: 1,
    explanation: "Rising DSO ties up cash and can foreshadow write-offs. Compare CFO with net income and check customer concentration.",
    optionExplanations: ["Quality matters.", "Correct.", "Receivables are the issue.", "Unrelated."]
  },
  {
    id: "fin-ratios-018", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "medium", type: "concept",
    question: "Lenders often impose covenants like 'net debt/EBITDA below 3.0×' and 'interest coverage above 3.0×'. Why these ratios?",
    options: ["They measure profitability only", "Net debt/EBITDA shows how many years of operating cash profit are needed to repay debt; interest coverage shows the cushion for paying interest. Breaching covenants can trigger default or repricing", "They're required by stock exchanges", "They measure market value"],
    answer: 1,
    explanation: "Credit analysts also look at fixed-charge coverage, FCF/debt and liquidity.",
    optionExplanations: ["They measure leverage and debt service.", "Correct.", "Lenders impose them.", "Accounting-based."]
  },
  {
    id: "fin-ratios-019", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "easy", type: "numerical",
    question: "Revenue is $2,000 and average total assets are $1,000. What is asset turnover, and what does a high value suggest?",
    options: ["2.0×; the company generates $2 of sales per $1 of assets — typical of asset-light or high-volume businesses like retail", "0.5×; assets are used inefficiently", "20×; data error", "1.0×"],
    answer: 0,
    explanation: "Asset-heavy industries (utilities, telecoms) have low turnover but often higher margins; ROA = margin × turnover.",
    optionExplanations: ["Correct.", "Inverted.", "Wrong arithmetic.", "Wrong arithmetic."]
  },
  {
    id: "fin-ratios-020", subject: "finance", subtopic: "Financial Ratios & Working Capital", difficulty: "hard", type: "numerical",
    question: "A company with revenue of ₹3,650 crore cuts DSO from 60 to 45 days. Roughly how much cash is released?",
    options: ["₹15 crore", "₹150 crore", "₹1,500 crore", "₹45 crore"],
    answer: 1,
    explanation: "Daily revenue = 3,650/365 = ₹10 crore. Receivables fall by 15 days × 10 = ₹150 crore — a one-time cash release that can repay debt or fund growth.",
    optionExplanations: ["Off by a factor of 10.", "Correct.", "Off by a factor of 10.", "Wrong arithmetic."]
  }
);
