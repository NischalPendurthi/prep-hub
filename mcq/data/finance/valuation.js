/* Finance — Valuation: DCF & Multiples */
window.QUESTIONS.push(
  {
    id: "fin-valuation-001", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "easy", type: "concept",
    question: "What are the main valuation approaches?",
    options: ["Intrinsic valuation (DCF: PV of future free cash flows) and relative valuation (trading comparables and precedent transactions using multiples); a 'football field' chart compares the ranges", "Only DCF", "Book value only", "Only the current share price"],
    answer: 0,
    explanation: "DCF reflects the company's own fundamentals but is assumption-heavy; multiples reflect market pricing but inherit market mispricing. Bankers usually triangulate.",
    optionExplanations: ["Correct.", "There are others.", "Rarely sufficient.", "Price isn't value."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-valuation-002", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "medium", type: "numerical",
    question: "Equity value is 1,000; debt 400; cash 150; preferred stock 50; non-controlling (minority) interest 30. What is enterprise value?",
    options: ["1,250", "1,000", "1,630", "1,330"],
    answer: 3,
    explanation: "EV = equity value + debt + preferred + minority interest − cash = 1,000 + 400 + 50 + 30 − 150 = 1,330. EV is the value of the core business to all capital providers.",
    optionExplanations: ["Omits preferred and minority interest.", "That's equity value.", "Adds cash instead of subtracting.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-valuation-003", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "easy", type: "concept",
    question: "Which pairing of multiple numerator and denominator is INCONSISTENT?",
    options: ["EV / EBITDA", "Equity value / net income (P/E)", "EV / net income", "EV / revenue"],
    answer: 2,
    explanation: "Match numerator and denominator to the same capital providers: EV pairs with pre-interest metrics (revenue, EBITDA, EBIT); equity value pairs with post-interest metrics (net income, book equity). Net income is after interest, i.e. only to shareholders.",
    optionExplanations: ["Consistent.", "Consistent.", "Correct: mismatched.", "Consistent."]
  },
  {
    id: "fin-valuation-004", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "medium", type: "numerical",
    question: "EBIT 200, tax rate 25%, D&A 50, capex 70, increase in net working capital 20. What is unlevered free cash flow?",
    options: ["150", "200", "110", "90"],
    answer: 2,
    explanation: "UFCF = EBIT(1 − t) + D&A − capex − ΔNWC = 150 + 50 − 70 − 20 = 110. It excludes interest (cash flow to all capital providers) and is discounted at WACC.",
    optionExplanations: ["That's NOPAT only.", "That's EBIT.", "Correct.", "Wrong arithmetic."]
  },
  {
    id: "fin-valuation-005", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "medium", type: "concept",
    question: "What are the main steps of a DCF valuation?",
    options: ["Project unlevered FCF (typically 5–10 years) → estimate WACC → compute terminal value (Gordon growth or exit multiple) → discount FCFs and TV to today → sum to get enterprise value → bridge to equity value → divide by diluted shares", "Multiply EBITDA by a peer multiple", "Discount net income at the cost of debt", "Add book value and cash"],
    answer: 0,
    explanation: "Then run sensitivity tables (WACC × terminal growth) because the result is highly assumption-dependent.",
    optionExplanations: ["Correct.", "That's a comparables approach.", "Wrong cash flow and rate.", "Not a DCF."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-valuation-006", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "medium", type: "numerical",
    question: "Final-year (year 5) UFCF is 110, terminal growth 3% and WACC 9%. What is the terminal value at year 5, and its present value?",
    options: ["1,222 and 794", "1,833 and 1,191", "About 1,888 and about 1,227", "About 1,888 and about 1,888"],
    answer: 2,
    explanation: "TV₅ = FCF₆/(WACC − g) = 110 × 1.03/0.06 = 1,888. PV = 1,888/1.09⁵ = 1,227. Use next year's FCF (FCF₅ × (1 + g)) and discount TV by 5 years, not 6.",
    optionExplanations: ["Wrong formula.", "Uses FCF₅ instead of FCF₆.", "Correct.", "Forgot to discount."]
  },
  {
    id: "fin-valuation-007", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "hard", type: "numerical",
    question: "A DCF uses an exit multiple of 8× year-5 EBITDA of 250, giving TV = 2,000. If year-5 FCF is 110 and WACC 9%, what perpetual growth rate does that imply, and why check it?",
    options: ["0%", "About 3.3%; to make sure the exit multiple doesn't imply unrealistic growth (above long-run GDP/inflation)", "8%", "9%"],
    answer: 1,
    explanation: "Solve TV = FCF(1 + g)/(WACC − g): 2,000(0.09 − g) = 110(1 + g) → g = (180 − 110)/2,110 = 3.3%. Cross-checking the two TV methods catches inconsistent assumptions.",
    optionExplanations: ["Too low.", "Correct.", "That's the multiple.", "g must be below WACC."]
  },
  {
    id: "fin-valuation-008", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "medium", type: "numerical",
    question: "With FCF₆ = 113.3 and g = 3%, the terminal value is 1,888 at a 9% WACC. What is it at 8% WACC, and what does this show?",
    options: ["1,888; WACC doesn't matter", "About 2,266 (+20%): small WACC or growth changes move TV — usually 60–80% of DCF value — a lot", "1,700", "About 1,574"],
    answer: 1,
    explanation: "TV = 113.3/(0.08 − 0.03) = 2,266. The denominator (WACC − g) is small, so TV is very sensitive; g must stay below WACC (and long-run nominal GDP growth) or the formula explodes.",
    optionExplanations: ["It matters a lot.", "Correct.", "Wrong direction.", "That's for WACC 10%."]
  },
  {
    id: "fin-valuation-009", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "medium", type: "numerical",
    question: "Peers trade at a median EV/EBITDA of 10×. Your target has EBITDA 150, debt 300 and cash 50, with 100 shares. What is the implied share price?",
    options: ["$15.00", "$10.00", "$17.50", "$12.50"],
    answer: 3,
    explanation: "EV = 10 × 150 = 1,500. Equity = 1,500 − 300 + 50 = 1,250. Per share = $12.50. Choose peers by industry, size, growth and margins; calendarise to the same fiscal periods.",
    optionExplanations: ["That's EV per share.", "Wrong arithmetic.", "Adds debt.", "Correct."]
  },
  {
    id: "fin-valuation-010", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "medium", type: "concept",
    question: "Why do precedent-transaction multiples usually exceed trading-comparable multiples?",
    options: ["They use older data", "Transactions exclude debt", "Acquirers pay a control premium (often 20–40%) for control and expected synergies, which public-market minority trading prices don't include", "They're always lower"],
    answer: 2,
    explanation: "Precedents also reflect the market conditions at the time of each deal, so they can be dated.",
    optionExplanations: ["Not the main reason.", "Not true.", "Correct.", "They're usually higher."]
  },
  {
    id: "fin-valuation-011", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "easy", type: "numerical",
    question: "Next year's dividend is $3, the required return is 10% and dividends grow 4% forever. What is the stock worth under the dividend discount model?",
    options: ["$30", "$31.20", "$75", "$50"],
    answer: 3,
    explanation: "P₀ = D₁/(r − g) = 3/0.06 = $50. DDM suits mature dividend payers (utilities, banks).",
    optionExplanations: ["Ignores growth.", "Wrong formula.", "Wrong denominator.", "Correct."]
  },
  {
    id: "fin-valuation-012", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "hard", type: "numerical",
    question: "Share price $20, 100 basic shares, and 10 options with strike $10. How many diluted shares are there under the treasury stock method?",
    options: ["100", "90", "110", "105"],
    answer: 3,
    explanation: "Exercise brings 10 × $10 = $100, which buys back 100/20 = 5 shares. Net new shares = 10 − 5 = 5 → 105 diluted shares. Equity value per share uses diluted shares.",
    optionExplanations: ["Ignores dilution.", "Wrong direction.", "Ignores the buyback.", "Correct."]
  },
  {
    id: "fin-valuation-013", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "medium", type: "numerical",
    question: "A stock trades at P/E 30 with expected EPS growth of 20% per year. What's its PEG ratio, and what does it suggest?",
    options: ["0.67; cheap", "600; meaningless", "1.5; the stock looks somewhat expensive relative to its growth (PEG ≈ 1 is often seen as fair)", "30; expensive"],
    answer: 2,
    explanation: "PEG = P/E ÷ growth (in %) = 30/20 = 1.5. It adjusts P/E for growth but ignores risk and growth duration.",
    optionExplanations: ["Inverted.", "Multiplied.", "Correct.", "That's the P/E."]
  },
  {
    id: "fin-valuation-014", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "medium", type: "concept",
    question: "Why are banks often valued with P/B (price to book) or P/E rather than EV/EBITDA?",
    options: ["Banks have no earnings", "For banks, debt (deposits, borrowings) is raw material for operations, not just financing, so EV and EBITDA aren't meaningful; book equity (regulatory capital) and ROE drive value: P/B ≈ (ROE − g)/(r_e − g)", "Banks have no book value", "Regulators forbid EV"],
    answer: 1,
    explanation: "Similarly, insurers use P/B or embedded value. Loss-making growth companies are often valued on EV/revenue or user-based metrics.",
    optionExplanations: ["They do.", "Correct.", "They do.", "Not a regulation."]
  },
  {
    id: "fin-valuation-015", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "hard", type: "concept",
    question: "When should you discount levered (equity) free cash flow rather than unlevered FCF, and at which rate?",
    options: ["Levered FCF (after interest and debt repayments) goes to equity holders only, so discount it at the cost of equity to get equity value directly; unlevered FCF is discounted at WACC to get enterprise value", "Always discount levered FCF at WACC", "Unlevered FCF at the cost of debt", "It doesn't matter"],
    answer: 0,
    explanation: "Mismatching cash flows and discount rates (e.g. levered FCF at WACC) is a classic error.",
    optionExplanations: ["Correct.", "Mismatched.", "Mismatched.", "It matters."]
  },
  {
    id: "fin-valuation-016", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "easy", type: "concept",
    question: "In investment banking, what is a 'football field' chart?",
    options: ["A horizontal bar chart showing valuation ranges from different methods (DCF, trading comps, precedents, 52-week range, LBO) side by side to frame a price range", "A sports analytics tool", "A cash flow statement", "A capital structure diagram"],
    answer: 0,
    explanation: "It helps boards and clients see where an offer price sits relative to various methods.",
    optionExplanations: ["Correct.", "Not this.", "Not this.", "Not this."]
  },
  {
    id: "fin-valuation-017", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "medium", type: "concept",
    question: "A company has EV of 2,000, debt of 500, cash of 100 and 80 million diluted shares. What is the implied share price, and why do we add cash?",
    options: ["$25.00; cash is an operating asset", "$20.00; cash belongs to shareholders and isn't part of the operating business valued by EV", "$18.75", "$31.25"],
    answer: 1,
    explanation: "Equity = EV − debt + cash = 2,000 − 500 + 100 = 1,600 → 1,600/80 = $20.00.",
    optionExplanations: ["That's EV per share.", "Correct.", "Subtracts cash.", "Adds debt."]
  },
  {
    id: "fin-valuation-018", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "hard", type: "concept",
    question: "A company's equity value rises by 100 because it raises 100 of new equity (cash). What happens to its enterprise value?",
    options: ["Rises by 100", "Doubles", "Falls by 100", "Unchanged: equity value +100 is offset by cash +100 in the bridge (EV = equity + debt − cash)"],
    answer: 3,
    explanation: "Capital-structure transactions don't change EV (ignoring fees and taxes). Similarly, raising debt to hold as cash leaves EV unchanged.",
    optionExplanations: ["Cash offsets it.", "No.", "No.", "Correct."]
  },
  {
    id: "fin-valuation-019", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "medium", type: "concept",
    question: "Why might you use the mid-year convention in a DCF?",
    options: ["Cash flows arrive throughout each year, not all at year-end, so discounting at t − 0.5 (e.g. 0.5, 1.5, 2.5…) is more accurate and slightly raises value", "To raise taxes", "Because the fiscal year ends mid-year", "To avoid terminal value"],
    answer: 0,
    explanation: "It's a refinement used in banking models.",
    optionExplanations: ["Correct.", "Unrelated.", "Not the reason.", "Unrelated."]
  },
  {
    id: "fin-valuation-020", subject: "finance", subtopic: "Valuation: DCF & Multiples", difficulty: "easy", type: "concept",
    question: "Why is EV/EBITDA often preferred to P/E when comparing companies?",
    options: ["It's always lower", "It's independent of capital structure (leverage) and of differences in depreciation policy and tax, making companies with different financing more comparable", "It includes interest expense", "It ignores debt"],
    answer: 1,
    explanation: "P/E is affected by leverage, tax and non-operating items; but EV/EBITDA ignores capex intensity, so EV/EBIT or EV/(EBITDA − capex) is sometimes better.",
    optionExplanations: ["Not necessarily.", "Correct.", "EBITDA is pre-interest.", "EV includes debt."]
  }
);
