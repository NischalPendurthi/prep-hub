/* Finance — Economics, Banking & Monetary Policy */
window.QUESTIONS.push(
  {
    id: "fin-macro-001", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "easy", type: "concept",
    question: "What is GDP, and how do the expenditure and real/nominal concepts work?",
    options: ["The market value of all final goods and services produced in a country in a period; by expenditure GDP = C + I + G + (X − M). Nominal GDP uses current prices; real GDP removes price changes to measure output growth", "Total government spending", "Total exports", "The money supply"],
    answer: 0,
    explanation: "GDP deflator = nominal/real × 100. Real GDP growth is the headline measure of economic growth.",
    optionExplanations: ["Correct.", "G is one component.", "Net exports are one component.", "Different concept."]
  },
  {
    id: "fin-macro-002", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "medium", type: "numerical",
    question: "Nominal GDP rises from 1,000 to 1,155 while the price level rises 5%. What is real GDP growth?",
    options: ["15.5%", "20.5%", "5%", "10%"],
    answer: 3,
    explanation: "Real GDP₂ = 1,155/1.05 = 1,100 → real growth = 10%. Approximately, real growth ≈ nominal growth − inflation (15.5% − 5%).",
    optionExplanations: ["That's nominal growth.", "Adds inflation.", "That's inflation.", "Correct."]
  },
  {
    id: "fin-macro-003", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "easy", type: "numerical",
    question: "The CPI rises from 120 to 126. What is the inflation rate, and what's the real return on a deposit paying 7%?",
    options: ["6%; 1%", "126%; negative", "5%; 12%", "5%; about 1.9%"],
    answer: 3,
    explanation: "Inflation = 126/120 − 1 = 5%. Real rate = 1.07/1.05 − 1 = 1.9% (≈ 7% − 5%).",
    optionExplanations: ["Wrong inflation.", "Misreads the index.", "Adds rather than subtracts.", "Correct."]
  },
  {
    id: "fin-macro-004", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "easy", type: "concept",
    question: "What distinguishes demand-pull from cost-push inflation?",
    options: ["Demand-pull: too much spending chasing limited output (strong economy, loose policy); cost-push: rising input costs (oil, wages, supply shocks) pushing prices up even with weak demand — which can cause stagflation", "They're the same", "Cost-push comes from consumer spending", "Demand-pull comes from oil shocks"],
    answer: 0,
    explanation: "Central banks respond more confidently to demand-pull inflation; supply shocks pose a trade-off between inflation and growth.",
    optionExplanations: ["Correct.", "Different causes.", "That's demand-pull.", "That's cost-push."]
  },
  {
    id: "fin-macro-005", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "easy", type: "concept",
    question: "Which are tools of monetary policy used by central banks such as the RBI or the Fed?",
    options: ["Income tax rates and government spending", "Setting stock prices", "Import tariffs", "The policy rate (repo rate / fed funds target), open market operations (buying/selling government bonds), reserve requirements (e.g. CRR) and, in crises, quantitative easing (large-scale asset purchases)"],
    answer: 3,
    explanation: "Taxes and spending are fiscal policy, set by the government. The RBI's Monetary Policy Committee targets CPI inflation of 4% ± 2%.",
    optionExplanations: ["That's fiscal policy.", "Not a tool.", "Trade policy.", "Correct."]
  },
  {
    id: "fin-macro-006", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "medium", type: "concept",
    question: "How does a central bank rate hike typically transmit to the economy and markets?",
    options: ["Higher policy rates raise bank lending and deposit rates and bond yields, reduce borrowing, spending and investment, tend to strengthen the currency and lower bond and (often) equity prices — cooling demand and inflation with a lag", "It raises inflation immediately", "It lowers bond yields", "It has no effect"],
    answer: 0,
    explanation: "'Hawkish' means leaning toward tighter policy to fight inflation; 'dovish' toward easier policy to support growth. Markets react to guidance as much as to actual moves.",
    optionExplanations: ["Correct.", "It aims to reduce inflation.", "Usually raises yields.", "It's a main policy lever."]
  },
  {
    id: "fin-macro-007", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "medium", type: "concept",
    question: "What is the difference between the repo rate and the reverse repo rate (or standing deposit facility) in India?",
    options: ["They're the same", "Repo rate is for deposits; reverse repo for loans to consumers", "Repo rate: the rate at which the RBI lends to banks against government securities; reverse repo/SDF: the rate at which banks park surplus funds with the RBI. Together they form the corridor for overnight rates", "Reverse repo is always higher"],
    answer: 2,
    explanation: "A repo is a sale of securities with an agreement to repurchase — a collateralised loan. Market repo (e.g. SOFR in the US) is a key funding market.",
    optionExplanations: ["Different directions.", "Not consumer rates.", "Correct.", "It's lower."]
  },
  {
    id: "fin-macro-008", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "medium", type: "numerical",
    question: "If banks must hold 10% of deposits as reserves and lend out the rest, what is the simple money multiplier? What if the requirement is 4%?",
    options: ["0.1 and 0.04", "90 and 96", "10 and 25", "10 and 4"],
    answer: 2,
    explanation: "Money multiplier = 1/reserve ratio: 1/0.10 = 10; 1/0.04 = 25. In practice it's smaller because people hold cash and banks hold excess reserves.",
    optionExplanations: ["Inverted.", "Not the formula.", "Correct.", "Wrong second value."]
  },
  {
    id: "fin-macro-009", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "medium", type: "numerical",
    question: "A bank earns 80 of interest income and pays 50 of interest expense on 1,000 of earning assets. What is its net interest margin?",
    options: ["8%", "5%", "3%", "1.6%"],
    answer: 2,
    explanation: "NIM = (interest income − interest expense)/average earning assets = 30/1,000 = 3%. On a bank's balance sheet, loans are assets and deposits are liabilities.",
    optionExplanations: ["That's the gross yield.", "That's the funding cost.", "Correct.", "Wrong ratio."]
  },
  {
    id: "fin-macro-010", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "medium", type: "numerical",
    question: "A bank has Tier 1 + Tier 2 capital of 120 and risk-weighted assets of 1,000. What is its capital adequacy ratio, and why are assets risk-weighted?",
    options: ["1.2%; to reduce capital", "12%; riskier assets (e.g. unsecured corporate loans) need more capital than safe ones (e.g. government bonds), so RWA reflects credit, market and operational risk", "120%", "12%; all assets are treated equally"],
    answer: 1,
    explanation: "CAR = capital/RWA = 120/1,000 = 12%. Basel III requires a minimum of 8% plus buffers (the RBI requires about 9% plus a conservation buffer).",
    optionExplanations: ["Wrong arithmetic.", "Correct.", "Wrong arithmetic.", "Weights differ."]
  },
  {
    id: "fin-macro-011", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "medium", type: "numerical",
    question: "USD/INR moves from 80 to 84. By how much has the dollar appreciated, and the rupee depreciated?",
    options: ["Both 4%", "Both 5%", "Dollar −5%; rupee +4.76%", "Dollar +5%; rupee −4.76%"],
    answer: 3,
    explanation: "Dollar in rupees: 84/80 − 1 = +5%. Rupee in dollars: (1/84)/(1/80) − 1 = 80/84 − 1 = −4.76%. A weaker rupee helps exporters and raises import costs (e.g. oil).",
    optionExplanations: ["Not symmetric.", "Not symmetric.", "Reversed.", "Correct."]
  },
  {
    id: "fin-macro-012", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "easy", type: "numerical",
    question: "EUR/USD = 1.10 (USD per EUR) and USD/INR = 83 (INR per USD). What is the EUR/INR cross rate?",
    options: ["91.30", "75.45", "84.10", "0.0133"],
    answer: 0,
    explanation: "INR per EUR = (USD per EUR) × (INR per USD) = 1.10 × 83 = 91.30. Inconsistent cross rates would allow triangular arbitrage.",
    optionExplanations: ["Correct.", "Divided instead of multiplied.", "Added.", "Inverted."]
  },
  {
    id: "fin-macro-013", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "hard", type: "numerical",
    question: "USD/INR spot is 83. One-year rates are 7% in India and 5% in the US (annual compounding). What is the 1-year forward rate under covered interest parity, and which currency trades at a forward discount?",
    options: ["83.00; neither", "About 84.58; the rupee trades at a forward discount", "About 81.45; the dollar at a discount", "About 84.68; the dollar at a discount"],
    answer: 1,
    explanation: "F = S × (1 + r_INR)/(1 + r_USD) = 83 × 1.07/1.05 = 84.58. The higher-interest currency (INR) is weaker forward; otherwise borrowing USD, converting and investing in INR with a forward hedge would be riskless profit.",
    optionExplanations: ["Ignores the rate differential.", "Correct.", "Wrong direction.", "Continuous-compounding approximation, and the wrong currency."]
  },
  {
    id: "fin-macro-014", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "medium", type: "numerical",
    question: "A burger costs ₹200 in India and $5 in the US, while the market rate is ₹83/$. What does purchasing power parity imply?",
    options: ["The rupee is overvalued", "PPP holds exactly", "The PPP rate is ₹40/$, so at ₹83/$ the rupee looks undervalued by this measure; PPP holds only loosely and over long horizons, partly because non-traded services are cheaper in poorer countries", "The dollar is undervalued by 50%"],
    answer: 2,
    explanation: "Relative PPP: exchange rates tend to move with inflation differentials over long periods. Interest rate parity is an arbitrage condition; PPP is not.",
    optionExplanations: ["Opposite.", "Large deviations persist.", "Correct.", "Wrong reading."]
  },
  {
    id: "fin-macro-015", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "easy", type: "concept",
    question: "How do fiscal and monetary policy differ?",
    options: ["They're the same", "Fiscal policy is government taxation and spending (set by the government/parliament); monetary policy is control of interest rates and money supply by the central bank", "Monetary policy sets tax rates", "Fiscal policy sets the repo rate"],
    answer: 1,
    explanation: "Expansionary fiscal policy (deficits) can raise growth and bond supply/yields; central banks aim for price stability and, for some, employment.",
    optionExplanations: ["Different authorities and tools.", "Correct.", "That's fiscal.", "That's monetary."]
  },
  {
    id: "fin-macro-016", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "medium", type: "concept",
    question: "Which is generally considered a LEADING economic indicator?",
    options: ["PMI (purchasing managers' index) new orders and the yield-curve slope", "Unemployment rate", "GDP growth for the last quarter", "CPI inflation for last month"],
    answer: 0,
    explanation: "Leading indicators (PMI, building permits, yield curve, stock prices) tend to turn before the economy; coincident ones (GDP, industrial production) move with it; lagging ones (unemployment, CPI) after.",
    optionExplanations: ["Correct.", "Lagging.", "Coincident/backward-looking.", "Lagging."]
  },
  {
    id: "fin-macro-017", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "medium", type: "concept",
    question: "What does the (short-run) Phillips curve describe?",
    options: ["The relationship between GDP and exports", "Bond price and yield", "A positive link between rates and stocks", "An inverse trade-off between unemployment and inflation: lower unemployment tends to come with higher inflation in the short run; in the long run, expectations adjust and the curve is roughly vertical at the natural rate"],
    answer: 3,
    explanation: "1970s stagflation (high inflation and unemployment) showed the trade-off isn't stable. Unemployment types: frictional, structural, cyclical.",
    optionExplanations: ["Not this.", "That's the price-yield curve.", "Not this.", "Correct."]
  },
  {
    id: "fin-macro-018", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "medium", type: "concept",
    question: "India runs a current account deficit. What does that mean, and how is it financed?",
    options: ["The government has a budget deficit", "The country imports more goods, services and income payments than it receives (savings < investment); it's financed by capital/financial account inflows such as FDI, portfolio flows and borrowing, or by drawing down reserves", "Exports exceed imports", "Banks have negative reserves"],
    answer: 1,
    explanation: "Balance of payments: current account + capital/financial account (+ reserve changes) = 0. Large deficits funded by volatile portfolio flows can pressure the currency.",
    optionExplanations: ["That's the fiscal deficit.", "Correct.", "That's a surplus.", "Unrelated."]
  },
  {
    id: "fin-macro-019", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "easy", type: "concept",
    question: "How does investment banking differ from commercial banking, and what do front, middle and back offices do?",
    options: ["They're identical", "Commercial banks take deposits and make loans; investment banks advise on M&A, underwrite securities (IPOs, bonds) and run sales & trading and research. Front office generates revenue (IBD, S&T); middle office manages risk and compliance; back office handles operations and settlement", "Investment banks only take deposits", "Back office trades securities"],
    answer: 1,
    explanation: "Universal banks (JPMorgan, SBI group entities) combine both. Asset management and private wealth are related divisions.",
    optionExplanations: ["Different models.", "Correct.", "That's commercial banking.", "That's front office."]
  },
  {
    id: "fin-macro-020", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "hard", type: "concept",
    question: "Which chain of events best describes the 2008 global financial crisis?",
    options: ["A stock market bubble with no link to banks", "Rising oil prices only", "Loose lending and subprime mortgages were securitised into MBS/CDOs held across highly leveraged institutions; when house prices fell, losses and opaque counterparty exposures (incl. CDS, e.g. AIG) triggered funding runs, Lehman's collapse and a credit freeze — showing systemic risk", "A single bank's fraud"],
    answer: 2,
    explanation: "Responses: rate cuts, QE, bank recapitalisation, then Basel III (more capital and liquidity), stress tests and central clearing of standard OTC derivatives.",
    optionExplanations: ["Banks were central.", "Not the cause.", "Correct.", "It was systemic."]
  },
  {
    id: "fin-macro-021", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "hard", type: "concept",
    question: "What is quantitative easing, and through which channels does it work?",
    options: ["Large-scale central bank purchases of government bonds (and other assets) financed by creating reserves, used when policy rates are near zero; it lowers long-term yields, pushes investors into riskier assets (portfolio balance), signals low rates for longer, and can weaken the currency", "Cutting taxes", "Raising reserve requirements", "Selling bonds to drain liquidity"],
    answer: 0,
    explanation: "The reverse — shrinking the balance sheet — is quantitative tightening (QT).",
    optionExplanations: ["Correct.", "That's fiscal.", "That's tightening.", "That's QT."]
  },
  {
    id: "fin-macro-022", subject: "finance", subtopic: "Economics, Banking & Monetary Policy", difficulty: "medium", type: "concept",
    question: "What are the phases of the business cycle, and which sectors tend to outperform early in a recovery?",
    options: ["Only growth and recession; utilities", "Expansion → peak → contraction (recession) → trough → recovery; cyclical sectors (financials, industrials, consumer discretionary) tend to lead early in recoveries, while defensives (utilities, staples, healthcare) hold up better in contractions", "Defensives always outperform", "Cycles are perfectly regular"],
    answer: 1,
    explanation: "Cycles vary in length and are hard to time; the yield curve and PMIs help gauge the phase.",
    optionExplanations: ["Incomplete.", "Correct.", "Depends on phase.", "They're irregular."]
  }
);
