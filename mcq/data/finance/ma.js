/* Finance — M&A, LBOs & Corporate Actions */
window.QUESTIONS.push(
  {
    id: "fin-ma-001", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "easy", type: "concept",
    question: "Match the merger types: a carmaker buys another carmaker; a carmaker buys a tyre supplier; a carmaker buys a food company.",
    options: ["Horizontal (same industry/stage), vertical (along the supply chain), conglomerate (unrelated business)", "Vertical, horizontal, conglomerate", "Conglomerate, vertical, horizontal", "All horizontal"],
    answer: 0,
    explanation: "Horizontal deals seek scale and market share (and draw antitrust scrutiny); vertical deals secure supply or distribution; conglomerate deals diversify but often trade at a 'conglomerate discount'.",
    optionExplanations: ["Correct.", "Mismatched.", "Mismatched.", "They differ."]
  },
  {
    id: "fin-ma-002", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "medium", type: "numerical",
    question: "A deal is expected to produce after-tax cost synergies of 20 per year forever, with one-off integration costs of 50 (today). At a 10% discount rate, what is the net value of synergies?",
    options: ["200", "150", "20", "250"],
    answer: 1,
    explanation: "PV of synergies = 20/0.10 = 200, minus integration costs 50 = 150. If the acquirer pays a premium above 150, it transfers more than the synergy value to target shareholders. Revenue synergies are typically less certain than cost synergies.",
    optionExplanations: ["Ignores integration costs.", "Correct.", "One year only.", "Adds costs."]
  },
  {
    id: "fin-ma-003", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "hard", type: "numerical",
    question: "Acquirer: net income 100, 50 shares (EPS 2.00), price 40. It buys the target (net income 20) for 300, paid entirely in new acquirer shares. Ignoring synergies, is the deal accretive or dilutive?",
    options: ["Accretive: new shares = 7.5; combined EPS = 120/57.5 ≈ 2.09 (+4.3%)", "Dilutive: EPS 1.80", "Neutral: EPS 2.00", "Dilutive: EPS 1.67"],
    answer: 0,
    explanation: "Shortcut: in an all-stock deal, if the acquirer's P/E (40/2 = 20) exceeds the P/E paid for the target (300/20 = 15), the deal is accretive. Accretion doesn't guarantee value creation.",
    optionExplanations: ["Correct.", "Wrong arithmetic.", "EPS changes.", "Wrong arithmetic."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-ma-004", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "hard", type: "numerical",
    question: "Same deal (acquirer NI 100, 50 shares; target NI 20; price 300) but financed with new debt at 6% pre-tax, tax rate 25%. What is pro forma EPS?",
    options: ["2.40", "2.00", "2.13 (+6.5%)", "1.94"],
    answer: 2,
    explanation: "After-tax interest = 300 × 6% × 0.75 = 13.5. Pro forma NI = 100 + 20 − 13.5 = 106.5; shares unchanged at 50 → EPS 2.13. Rule: cash/debt deals are accretive when the target's earnings yield (20/300 = 6.7%) exceeds the after-tax cost of debt (4.5%).",
    optionExplanations: ["Ignores interest.", "EPS changes.", "Correct.", "Wrong arithmetic."]
  },
  {
    id: "fin-ma-005", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "medium", type: "concept",
    question: "What are the trade-offs between paying in cash and paying in stock in an acquisition?",
    options: ["There are none", "Cash always signals overvaluation", "Stock is always cheaper", "Cash gives target holders certainty and keeps acquirer ownership undiluted but uses cash/debt capacity; stock shares the risk (target holders bear post-deal performance), avoids leverage, but dilutes ownership and can signal the acquirer thinks its shares are overvalued"],
    answer: 3,
    explanation: "Tax treatment also differs: stock deals can be tax-deferred for target shareholders in some jurisdictions.",
    optionExplanations: ["Significant trade-offs.", "Stock deals carry that signal.", "Not necessarily.", "Correct."]
  },
  {
    id: "fin-ma-006", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "easy", type: "numerical",
    question: "A target's shares trade at ₹300 before the offer. The acquirer offers ₹390 per share. What is the premium, and why are premiums paid?",
    options: ["30%; for control and expected synergies", "₹90; 23%", "90%; regulatory requirement", "₹390; full value"],
    answer: 0,
    explanation: "Premium = 390/300 − 1 = 30%. Typical control premiums are 20–40%. Many acquirers overpay (the 'winner's curse'), which is why acquirer shares often fall on announcement.",
    optionExplanations: ["Correct.", "Wrong percentage.", "Wrong arithmetic.", "That's the offer price."]
  },
  {
    id: "fin-ma-007", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "medium", type: "numerical",
    question: "An acquirer pays 500 for a target whose identifiable net assets have a fair value of 350 (book value 300). How much goodwill is recorded?",
    options: ["200", "150", "500", "50"],
    answer: 1,
    explanation: "Goodwill = purchase price − fair value of identifiable net assets = 500 − 350 = 150. Assets are written up to fair value first (purchase price allocation); goodwill is then tested annually for impairment.",
    optionExplanations: ["Uses book value.", "Correct.", "That's the price.", "That's the write-up."]
  },
  {
    id: "fin-ma-008", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "easy", type: "concept",
    question: "What is due diligence in an M&A process?",
    options: ["The buyer's detailed investigation of the target's financials, legal issues, operations, tax, IT, HR and risks before finalising terms, to verify value and uncover liabilities", "Signing the merger agreement", "Setting the share price", "Paying the target's debts"],
    answer: 0,
    explanation: "A typical sell-side process: preparation → teaser/NDA → information memorandum → indicative bids → due diligence (data room) → binding bids → negotiation and signing → regulatory approvals → closing.",
    optionExplanations: ["Correct.", "That's a later step.", "Not this.", "Not this."]
  },
  {
    id: "fin-ma-009", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "medium", type: "concept",
    question: "Which is a takeover defence, and what does it do?",
    options: ["A tender offer", "A due diligence report", "A poison pill (shareholder rights plan): if a hostile bidder crosses an ownership threshold, other shareholders can buy shares at a discount, massively diluting the bidder. Others include a white knight (friendly alternative buyer) and staggered boards", "A dividend increase"],
    answer: 2,
    explanation: "A hostile bid goes directly to shareholders (tender offer) or replaces the board via a proxy fight.",
    optionExplanations: ["That's a bidder's tool.", "Not a defence.", "Correct.", "Not a standard defence."]
  },
  {
    id: "fin-ma-010", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "medium", type: "concept",
    question: "What is a leveraged buyout, and what makes a good LBO candidate?",
    options: ["A purchase paid fully in equity", "A merger of two public companies", "A private equity firm buys a company using mostly debt, secured on the target's cash flows; good candidates have stable, predictable cash flows, low capex needs, low existing debt, strong market position, assets for collateral and room for operational improvement", "A government takeover"],
    answer: 2,
    explanation: "Debt magnifies equity returns and its tax shield helps; it also imposes discipline. Cyclical, cash-burning or high-capex businesses are poor candidates.",
    optionExplanations: ["The opposite.", "Not necessarily.", "Correct.", "Not this."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-ma-011", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "medium", type: "numerical",
    question: "A PE fund invests 400 of equity and receives 1,000 at exit after 5 years. What are the MOIC and IRR?",
    options: ["2.5× and about 20.1%", "2.5× and 30%", "1.5× and 10%", "2.5× and 50%"],
    answer: 0,
    explanation: "MOIC = 1,000/400 = 2.5×. IRR = 2.5^(1/5) − 1 = 20.1%. Rules of thumb: 2× in 3 years ≈ 26%; 2× in 5 years ≈ 15%; 3× in 5 years ≈ 25%.",
    optionExplanations: ["Correct.", "Wrong IRR.", "Wrong MOIC.", "Simple annualisation is wrong."]
  },
  {
    id: "fin-ma-012", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "hard", type: "numerical",
    question: "LBO: buy at 10× EBITDA of 100 (EV 1,000) with 600 debt and 400 equity. After 5 years EBITDA is 140, exit at 10×, and debt has been paid down to 300. What are the equity proceeds, MOIC and IRR?",
    options: ["1,400; 3.5×; 28.5%", "1,100; 2.75×; 35%", "800; 2.0×; 14.9%", "1,100; 2.75×; about 22.4%"],
    answer: 3,
    explanation: "Exit EV = 10 × 140 = 1,400. Equity = 1,400 − 300 = 1,100. MOIC = 1,100/400 = 2.75×; IRR = 2.75^(1/5) − 1 = 22.4%. Value creation: EBITDA growth (+400 of EV), deleveraging (+300 of debt repaid), no multiple expansion.",
    optionExplanations: ["Forgets remaining debt.", "Wrong IRR.", "Wrong.", "Correct."]
  },
  {
    id: "fin-ma-013", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "medium", type: "concept",
    question: "What are the three main levers of value creation in an LBO?",
    options: ["Higher taxes, more employees, bigger offices", "EBITDA growth (revenue growth and margin improvement), multiple expansion (selling at a higher multiple than bought), and debt paydown (deleveraging) from free cash flow", "Only financial engineering", "Issuing more equity"],
    answer: 1,
    explanation: "Relying on multiple expansion is the riskiest lever because it depends on market conditions at exit.",
    optionExplanations: ["Not value levers.", "Correct.", "Operations matter too.", "Dilutes returns."]
  },
  {
    id: "fin-ma-014", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "medium", type: "concept",
    question: "How do a spin-off, a carve-out (equity carve-out) and a divestiture differ?",
    options: ["They're identical", "Spin-off: shares of a subsidiary are distributed to existing shareholders (no cash raised); carve-out: a minority stake in the subsidiary is sold to the public via IPO (cash raised); divestiture: the unit is sold outright to another buyer for cash", "Carve-outs distribute shares for free", "Divestitures create a new public company always"],
    answer: 1,
    explanation: "Motives: focus on core business, unlock value hidden by a conglomerate discount, raise cash, or meet regulatory requirements.",
    optionExplanations: ["They differ.", "Correct.", "That's a spin-off.", "That's a spin-off."]
  },
  {
    id: "fin-ma-015", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "medium", type: "concept",
    question: "Which statement about dividend policy theories is correct?",
    options: ["All theories agree dividends always add value", "MM says dividends are essential", "Dividends are always illegal for growing firms", "MM: in perfect markets dividend policy is irrelevant; bird-in-the-hand: investors prefer certain dividends; tax preference: if dividends are taxed more than gains, buybacks are preferred; signalling: dividend increases signal management confidence; clientele: investors pick firms whose payout suits them"],
    answer: 3,
    explanation: "In practice, firms smooth dividends and avoid cuts, which markets punish heavily.",
    optionExplanations: ["They disagree.", "MM says irrelevant.", "Not true.", "Correct."]
  },
  {
    id: "fin-ma-016", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "hard", type: "numerical",
    question: "A company with net income 100 and 50 shares (EPS 2.00) uses 200 of cash, earning 4% pre-tax, to buy back 5 shares at 40. The tax rate is 25%. What is the new EPS?",
    options: ["2.22", "1.88", "2.00", "About 2.09 (+4.4%)"],
    answer: 3,
    explanation: "Lost after-tax interest = 200 × 4% × 0.75 = 6 → NI = 94. Shares = 45. EPS = 94/45 = 2.09. The buyback is accretive because the earnings yield on the shares (2/40 = 5%) exceeds the after-tax yield on cash (3%) — but accretion isn't the same as value creation.",
    optionExplanations: ["Ignores lost interest.", "Wrong direction.", "EPS changes.", "Correct."]
  },
  {
    id: "fin-ma-017", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "hard", type: "numerical",
    question: "A bankrupt company's assets are sold for 500. It owes 300 of secured debt and 400 of unsecured debt. Under absolute priority, what do secured creditors, unsecured creditors and shareholders recover?",
    options: ["Everyone gets 500/1,200 pro rata", "Secured: 214; unsecured: 286; shareholders: 0", "Secured: 300 (100%); unsecured: 200 (50%); shareholders: 0", "Shareholders first"],
    answer: 2,
    explanation: "The waterfall pays by seniority: secured (against collateral) → senior unsecured → subordinated → preferred → common equity. Restructurings (e.g. under India's IBC or US Chapter 11) often negotiate deviations from strict priority.",
    optionExplanations: ["Priority applies, not pro rata.", "That's pro rata across creditors.", "Correct.", "Equity is last."]
  },
  {
    id: "fin-ma-018", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "easy", type: "concept",
    question: "What's the difference between a merger and an acquisition?",
    options: ["None in practice", "Acquisitions are always hostile", "Mergers always involve cash", "In an acquisition, one company buys another, which ceases to exist independently or becomes a subsidiary; in a merger, two companies (often of similar size) combine into a new or continuing entity, usually via a share exchange"],
    answer: 3,
    explanation: "The terms are often used loosely; legally, most deals have an acquirer for accounting purposes.",
    optionExplanations: ["There's a distinction.", "Most are friendly.", "Usually stock.", "Correct."]
  },
  {
    id: "fin-ma-019", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "medium", type: "concept",
    question: "Why do many acquisitions fail to create value for the acquirer's shareholders?",
    options: ["Because synergies are always zero", "Because regulators block all deals", "Overpaying (winner's curse, managerial hubris, empire building), overestimated or slow synergies, integration and cultural problems, and too much leverage", "Because targets always lie"],
    answer: 2,
    explanation: "Target shareholders typically capture most of the gains through the premium.",
    optionExplanations: ["Synergies can exist.", "Most deals close.", "Correct.", "Not always."]
  },
  {
    id: "fin-ma-020", subject: "finance", subtopic: "M&A, LBOs & Corporate Actions", difficulty: "hard", type: "concept",
    question: "Why does higher leverage in an LBO increase equity returns, and what's the catch?",
    options: ["It reduces the purchase price", "A smaller equity cheque controls the same enterprise; EV gains (and debt paydown) accrue to a smaller equity base, magnifying IRR; but leverage magnifies losses too, raises default risk if cash flows disappoint, and debt costs rise with leverage", "Debt is free", "Lenders share the upside"],
    answer: 1,
    explanation: "Example: a 20% rise in EV is a 50% equity gain with 60% debt, but a 40% fall in EV wipes out the equity.",
    optionExplanations: ["Price is unaffected.", "Correct.", "Debt has a cost.", "Lenders get fixed returns."]
  }
);
