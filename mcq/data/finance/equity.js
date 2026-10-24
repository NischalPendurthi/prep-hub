/* Finance — Investing & Equity Markets */
window.QUESTIONS.push(
  {
    id: "fin-equity-001", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "easy", type: "concept",
    question: "Which pairing of asset class and typical characteristic is correct?",
    options: ["Real estate: highly liquid", "Equity: guaranteed returns", "Fixed income: steadier, lower expected return; equity: higher long-run growth with large short-term swings; real estate: large ticket size and illiquid; gold: often used as an inflation/crisis hedge", "Fixed deposits: always beat inflation"],
    answer: 2,
    explanation: "People invest to grow wealth, beat inflation, earn income and meet goals. Key principles: risk and return are linked; inflation erodes low-yield savings; liquidity matters; diversification reduces risk.",
    optionExplanations: ["It's illiquid.", "Equity returns are uncertain.", "Correct.", "Low-risk deposits can lose to inflation."]
  },
  {
    id: "fin-equity-002", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "easy", type: "concept",
    question: "In what two ways can a shareholder earn a return on a stock?",
    options: ["Interest and principal", "Coupons and call premiums", "Capital appreciation (price increase) and dividends (distributed profits)", "Only dividends"],
    answer: 2,
    explanation: "Total return = (P₁ − P₀ + D)/P₀. A share represents part ownership of the company, not a loan to it.",
    optionExplanations: ["That's bonds.", "Bond terms.", "Correct.", "Price gains matter too."]
  },
  {
    id: "fin-equity-003", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "easy", type: "concept",
    question: "In India's stock market, which is correctly matched?",
    options: ["SEBI: a stock exchange", "Brokers: regulators", "NSE: the central bank", "SEBI: the securities market regulator; NSE and BSE: stock exchanges; Zerodha/Groww: brokers; mutual funds, pension funds and insurers: institutional investors"],
    answer: 3,
    explanation: "Regulators protect investors and market integrity; exchanges provide transparent, liquid venues; brokers connect investors to exchanges; retail investors trade their own money; institutions trade large pools of others' money.",
    optionExplanations: ["SEBI regulates.", "Brokers are intermediaries.", "The RBI is the central bank.", "Correct."]
  },
  {
    id: "fin-equity-004", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "easy", type: "concept",
    question: "How do common and preferred shares typically differ?",
    options: ["Preferred shares have more voting power", "They're identical", "Common shares carry voting rights and the residual claim (unlimited upside, last in liquidation); preferred shares usually have no vote but receive fixed dividends with priority over common dividends and in liquidation", "Preferred dividends are optional for all companies and never accumulate"],
    answer: 2,
    explanation: "Preferred stock is a hybrid between debt and equity; cumulative preferred dividends must be paid in full before any common dividends.",
    optionExplanations: ["Usually no vote.", "They differ.", "Correct.", "Cumulative preferreds accumulate unpaid dividends."]
  },
  {
    id: "fin-equity-005", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "medium", type: "concept",
    question: "How do primary and secondary markets differ, and what is book building in an IPO?",
    options: ["They're the same", "Book building sets prices by government decree", "The secondary market raises capital for companies", "In the primary market companies issue new securities (IPO, FPO) and receive the money; in the secondary market investors trade existing shares among themselves. Book building collects bids within a price band to discover the issue price"],
    answer: 3,
    explanation: "Investment banks underwrite and market IPOs. The secondary market provides liquidity and continuous price discovery, which makes primary issuance possible.",
    optionExplanations: ["They differ.", "Demand drives it.", "Only primary issues raise capital.", "Correct."]
  },
  {
    id: "fin-equity-006", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "easy", type: "concept",
    question: "You want to buy a stock but pay no more than ₹500. Which order type do you use, and what's the risk?",
    options: ["Market order; it always fills at ₹500", "Limit buy order at ₹500: you'll never pay more, but it may not fill if the price stays above ₹500", "Stop-loss sell order", "Market order; no risk"],
    answer: 1,
    explanation: "Market orders execute immediately at the best available price (certain execution, uncertain price). Stop orders become market (or limit) orders once a trigger price is hit — commonly used for stop losses.",
    optionExplanations: ["Market orders don't control price.", "Correct.", "That's for exiting.", "Price can slip."]
  },
  {
    id: "fin-equity-007", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "easy", type: "concept",
    question: "A stock is quoted 99.90 bid / 100.10 ask. What does this mean?",
    options: ["You can buy at 99.90", "The stock's fair value is 100.10", "Buyers will pay up to 99.90 and sellers want at least 100.10; buying at market costs 100.10 and selling gets 99.90, so the 0.20 spread is a trading cost and a measure of liquidity", "The exchange charges 0.20"],
    answer: 2,
    explanation: "Liquid large-caps have tight spreads; illiquid small-caps have wide ones. Market makers earn the spread for providing liquidity.",
    optionExplanations: ["You buy at the ask.", "It's just a quote.", "Correct.", "It's not a fee."]
  },
  {
    id: "fin-equity-008", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "easy", type: "numerical",
    question: "A company has 50 million shares outstanding trading at $40. What's its market capitalisation?",
    options: ["$2 billion", "$40 million", "$1.25 billion", "$200 million"],
    answer: 0,
    explanation: "Market cap = shares outstanding × price = 50m × $40 = $2bn. It's the market value of equity, not enterprise value.",
    optionExplanations: ["Correct.", "That's the price × 1m.", "Wrong arithmetic.", "Off by a factor of 10."]
  },
  {
    id: "fin-equity-009", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "medium", type: "numerical",
    question: "Company ABC has 1,000 shares at ₹50, of which promoters hold 600 (locked in). What are its full market cap and its free-float market cap (used to weight Nifty/Sensex)?",
    options: ["₹50,000 and ₹50,000", "₹30,000 and ₹20,000", "₹50,000 and ₹20,000", "₹20,000 and ₹50,000"],
    answer: 2,
    explanation: "Full market cap = 1,000 × 50 = ₹50,000. Free float counts only shares available for trading: 400 × 50 = ₹20,000. Free-float weighting stops closely held companies from being over-weighted in an index.",
    optionExplanations: ["Free float excludes promoter holdings.", "Wrong full cap.", "Correct.", "Swapped."]
  },
  {
    id: "fin-equity-010", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "medium", type: "numerical",
    question: "A price-weighted index contains three stocks at $100, $50 and $10. If the $100 stock rises 10%, the index rises 6.25%. How much does it rise if instead the $10 stock rises 10%?",
    options: ["6.25%", "3.33%", "10%", "0.625%"],
    answer: 3,
    explanation: "Index = average price = 160/3. A $1 rise in the cheap stock → 161/160 − 1 = 0.625%, versus a $10 rise in the expensive stock → 6.25%. Price-weighted indices (e.g. the Dow) overweight high-priced shares regardless of company size; market-cap-weighted indices (S&P 500, Nifty) weight by value.",
    optionExplanations: ["That's for the $100 stock.", "That's equal weighting.", "Not the whole index.", "Correct."]
  },
  {
    id: "fin-equity-011", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "medium", type: "concept",
    question: "Order the dividend dates, and on which date does the share price typically drop by about the dividend?",
    options: ["Payment, record, ex-dividend, declaration; drops on payment date", "Record → declaration → payment; drops on declaration", "Declaration → ex-dividend → record → payment; the price drops on the ex-dividend date, since buyers from then on don't receive the dividend", "Prices never react to dividends"],
    answer: 2,
    explanation: "With T+1 settlement (now in India and the US), the ex-date and record date coincide. A $50 stock paying $2 would open around $48 on the ex-date, all else equal.",
    optionExplanations: ["Wrong order.", "Wrong order.", "Correct.", "They adjust on the ex-date."]
  },
  {
    id: "fin-equity-012", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "easy", type: "numerical",
    question: "You hold 100 shares at ₹1,000. The company does a 2-for-1 stock split. What do you hold afterwards?",
    options: ["100 shares at ₹2,000", "50 shares at ₹2,000", "200 shares at ₹1,000", "200 shares at about ₹500 — same total value"],
    answer: 3,
    explanation: "Splits (and bonus issues like 1:1) increase the share count and reduce the price proportionally; they don't create value. Reverse splits do the opposite.",
    optionExplanations: ["That's a reverse split.", "Reverse split.", "That doubles value from nothing.", "Correct."]
  },
  {
    id: "fin-equity-013", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "hard", type: "numerical",
    question: "A stock trades at $10. The company offers a 1-for-4 rights issue at $8 (one new share for every four held). What is the theoretical ex-rights price?",
    options: ["$8.00", "$9.00", "$10.00", "$9.60"],
    answer: 3,
    explanation: "TERP = (4 × 10 + 1 × 8)/5 = 48/5 = $9.60. The value of each right = 9.60 − 8 = $1.60. Shareholders who neither subscribe nor sell their rights lose value.",
    optionExplanations: ["That's the subscription price.", "A simple average.", "Ignores dilution.", "Correct."]
  },
  {
    id: "fin-equity-014", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "medium", type: "concept",
    question: "Compared with paying a cash dividend, what does a share buyback do (ignoring taxes)?",
    options: ["Always creates value", "Returns the same cash to shareholders but reduces the share count, raising EPS and ownership percentage for those who don't sell; the total value to shareholders is the same, though buybacks are more flexible and can signal undervaluation", "Increases the company's cash", "Is illegal in India"],
    answer: 1,
    explanation: "In perfect markets, dividends and buybacks are equivalent (MM). Differences arise from taxes, signalling and flexibility; buying back overvalued shares destroys value.",
    optionExplanations: ["Only if shares are undervalued.", "Correct.", "It spends cash.", "Buybacks are permitted."]
  },
  {
    id: "fin-equity-015", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "medium", type: "concept",
    question: "You short 100 shares at $50 and later buy them back at $40. What's your profit, and what's the key risk of short selling?",
    options: ["Profit of $1,000 (before borrowing costs); losses are theoretically unlimited because the price can rise without bound, and a short squeeze can force you out", "Loss of $1,000; limited risk", "Profit of $5,000", "No profit; shorts only pay dividends"],
    answer: 0,
    explanation: "Short sellers borrow shares, sell them, and must buy back later; they also pay any dividends to the lender plus borrow fees.",
    optionExplanations: ["Correct.", "The price fell, so you gain.", "That's the whole sale value.", "Short sellers profit from falls."]
  },
  {
    id: "fin-equity-016", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "hard", type: "numerical",
    question: "You buy 100 shares at $100 using 50% initial margin (borrowing $5,000). The maintenance margin is 25%. Below what price do you get a margin call?",
    options: ["$50.00", "About $66.67", "$75.00", "$25.00"],
    answer: 1,
    explanation: "Equity/value = (100P − 5,000)/(100P) = 0.25 → 75P = 5,000 → P = $66.67. Leverage magnifies returns both ways: a 33% fall wipes out two-thirds of your equity.",
    optionExplanations: ["That's where your equity hits zero.", "Correct.", "That ignores the loan.", "Too low."]
  },
  {
    id: "fin-equity-017", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "medium", type: "concept",
    question: "Match the efficient market hypothesis forms: prices reflect (i) all past price data, (ii) all public information, (iii) all information including private.",
    options: ["(i) strong, (ii) semi-strong, (iii) weak", "(i) weak, (ii) semi-strong, (iii) strong", "(i) semi-strong, (ii) weak, (iii) strong", "All three are the same"],
    answer: 1,
    explanation: "Weak form implies technical analysis can't earn excess returns; semi-strong implies fundamental analysis of public data can't either; strong form would make even insider trading unprofitable (empirically false).",
    optionExplanations: ["Reversed.", "Correct.", "Mismatched.", "They differ in information set."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-equity-018", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "easy", type: "concept",
    question: "How do fundamental and technical analysis differ?",
    options: ["Fundamental analysis values a company from its financials, industry and economy (intrinsic value, long-term); technical analysis studies price and volume charts and patterns to time trades (usually shorter-term)", "They're identical", "Technical analysis reads balance sheets", "Fundamental analysis uses only charts"],
    answer: 0,
    explanation: "Many practitioners combine them: fundamentals to choose what to own, technicals to choose when.",
    optionExplanations: ["Correct.", "They differ.", "Reversed.", "Reversed."]
  },
  {
    id: "fin-equity-019", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "medium", type: "numerical",
    question: "A mutual fund holds assets worth ₹105 crore with ₹5 crore of liabilities and 10 crore units outstanding. What is its NAV per unit?",
    options: ["₹10.50", "₹11.00", "₹10.00", "₹9.50"],
    answer: 2,
    explanation: "NAV = (assets − liabilities)/units = (105 − 5)/10 = ₹10. Open-ended funds transact at NAV; ETFs trade on exchanges at market prices close to NAV.",
    optionExplanations: ["That ignores liabilities.", "Wrong sign.", "Correct.", "Wrong arithmetic."]
  },
  {
    id: "fin-equity-020", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "hard", type: "numerical",
    question: "₹1 lakh grows for 30 years at a gross 8% per year. How much do you end with if annual fees are 1.5% versus 0.1%?",
    options: ["About ₹6.6 lakh vs about ₹9.8 lakh", "About ₹9.8 lakh vs about ₹10.1 lakh", "Same in both cases", "About ₹4.3 lakh vs about ₹6.6 lakh"],
    answer: 0,
    explanation: "1.065³⁰ = 6.61 → ₹6.6 lakh; 1.079³⁰ = 9.79 → ₹9.8 lakh. A 1.4% fee difference costs about a third of the final wealth — the core argument for low-cost passive index funds.",
    optionExplanations: ["Correct.", "Wrong arithmetic.", "Fees compound.", "Wrong arithmetic."]
  },
  {
    id: "fin-equity-021", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "easy", type: "concept",
    question: "How do mutual funds, ETFs, index funds, hedge funds and private equity differ?",
    options: ["They're all identical", "Mutual funds pool retail money (active or passive); index funds/ETFs passively track an index at low cost (ETFs trade on exchanges); hedge funds use flexible, often leveraged strategies for wealthy/institutional investors; private equity buys stakes in private companies with long lock-ups", "ETFs can't be traded intraday", "Hedge funds are only for retail investors"],
    answer: 1,
    explanation: "They differ in access, liquidity, regulation, fees and strategy.",
    optionExplanations: ["They differ.", "Correct.", "ETFs trade intraday.", "Typically restricted."]
  },
  {
    id: "fin-equity-022", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "medium", type: "concept",
    question: "Which factors move stock prices, as illustrated by the COVID-19 crash and recovery in 2020?",
    options: ["Supply and demand driven by company performance, economic conditions (interest rates, growth, inflation), investor sentiment (fear and greed) and global events; in 2020 panic selling crashed markets, then stimulus and recovering confidence drove a rebound", "Only company earnings", "Only government decrees", "Prices are random and unrelated to news"],
    answer: 0,
    explanation: "Expectations matter more than current facts: markets bottomed while economic data was still terrible, once uncertainty peaked and policy support arrived.",
    optionExplanations: ["Correct.", "Many factors matter.", "Not only.", "They react to news."]
  },
  {
    id: "fin-equity-023", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "medium", type: "concept",
    question: "An investor holds on to losing stocks hoping to break even but sells winners quickly to 'lock in gains'. Which bias is this?",
    options: ["Overconfidence", "The disposition effect (driven by loss aversion)", "Herding", "Home bias"],
    answer: 1,
    explanation: "Other biases: overconfidence (overtrading), anchoring (fixating on purchase price), herding (following the crowd into bubbles), confirmation bias, recency bias. Behavioural finance explains anomalies the EMH struggles with.",
    optionExplanations: ["Different bias.", "Correct.", "Different bias.", "Preferring domestic stocks."]
  },
  {
    id: "fin-equity-024", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "medium", type: "concept",
    question: "What are the main arguments for passive (index) investing over active fund management?",
    options: ["Most active managers underperform their benchmark after fees over long periods; index funds offer broad diversification, low costs and low turnover. Active managers argue they can exploit inefficiencies, especially in less efficient markets", "Active funds always outperform", "Index funds are riskier than single stocks", "Passive funds charge higher fees"],
    answer: 0,
    explanation: "SPIVA-type studies consistently show the majority of active large-cap funds trailing their index over 10+ years.",
    optionExplanations: ["Correct.", "The evidence is the opposite on average.", "They're diversified.", "They're cheaper."]
  },
  {
    id: "fin-equity-025", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "medium", type: "concept",
    question: "Why are stock market indices like the Nifty 50 or S&P 500 important?",
    options: ["They set company share prices", "They only matter for governments", "They guarantee returns", "They summarise market performance and sentiment, serve as benchmarks for fund returns, underlie index funds/ETFs and index futures/options used for trading and hedging"],
    answer: 3,
    explanation: "Constituents must meet criteria (size, liquidity, free float) and are reviewed periodically.",
    optionExplanations: ["They reflect prices.", "Widely used by investors.", "No guarantees.", "Correct."]
  },
  {
    id: "fin-equity-026", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "hard", type: "numerical",
    question: "You buy one share at ₹200 and receive a ₹10 dividend. The company then does a 2-for-1 split, and you sell both shares at ₹115 each. What is your total return?",
    options: ["+20%", "−42.5%", "+15%", "+62.5%"],
    answer: 0,
    explanation: "After the split you have 2 shares: proceeds 2 × 115 = ₹230, plus the ₹10 dividend. Return = (230 + 10 − 200)/200 = 20%. Forgetting to adjust for the split makes it look like a loss (115 vs 200).",
    optionExplanations: ["Correct.", "That ignores the split.", "That ignores the dividend.", "Wrong arithmetic."]
  },
  {
    id: "fin-equity-027", subject: "finance", subtopic: "Investing & Equity Markets", difficulty: "hard", type: "numerical",
    question: "You short 100 shares at $50 with 50% initial margin, so your account holds the $5,000 sale proceeds plus $2,500 of your own cash. Maintenance margin is 30%. Above what price do you get a margin call?",
    options: ["$75.00", "About $57.69", "$65.00", "About $53.85"],
    answer: 1,
    explanation: "Equity = 7,500 − 100P (assets minus the cost to buy back). Margin call when (7,500 − 100P)/(100P) < 0.30 → 7,500 < 130P → P > $57.69. Losses on shorts grow as the price rises, with no upper limit.",
    optionExplanations: ["That's where equity hits zero.", "Correct.", "Wrong arithmetic.", "Wrong arithmetic."]
  }
);
