/* Finance — Cost of Capital & Capital Structure */
window.QUESTIONS.push(
  {
    id: "fin-wacc-001", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "easy", type: "numerical",
    question: "The risk-free rate is 5%, the equity risk premium 6% and the company's beta 1.3. What is its cost of equity (CAPM)?",
    options: ["12.8%", "11.0%", "7.8%", "13.0%"],
    answer: 0,
    explanation: "r_e = r_f + β × ERP = 5% + 1.3 × 6% = 12.8%.",
    optionExplanations: ["Correct.", "β = 1.", "Omits the risk-free rate.", "Wrong arithmetic."]
  },
  {
    id: "fin-wacc-002", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "medium", type: "numerical",
    question: "A stock trades at $35, next year's dividend is expected to be $2.10, and dividends grow 5% a year forever. What is the implied cost of equity?",
    options: ["6%", "5%", "11%", "16%"],
    answer: 2,
    explanation: "Gordon growth: r_e = D₁/P₀ + g = 2.10/35 + 5% = 6% + 5% = 11%.",
    optionExplanations: ["That's only the dividend yield.", "That's only growth.", "Correct.", "Wrong."]
  },
  {
    id: "fin-wacc-003", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "easy", type: "numerical",
    question: "A company's bonds yield 8% to maturity and its tax rate is 25%. What is its after-tax cost of debt?",
    options: ["6%", "8%", "2%", "10.7%"],
    answer: 0,
    explanation: "r_d(1 − t) = 8% × 0.75 = 6%. Interest is tax-deductible, so debt's effective cost is lower. Use the market yield (YTM), not the coupon rate on old debt.",
    optionExplanations: ["Correct.", "Pre-tax.", "That's the tax saving.", "Divides by 0.75."]
  },
  {
    id: "fin-wacc-004", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "easy", type: "numerical",
    question: "Preferred shares pay a fixed $5 dividend and trade at $50. What is the cost of preferred stock?",
    options: ["5%", "50%", "7.5% (after tax)", "10%"],
    answer: 3,
    explanation: "r_p = D/P = 5/50 = 10%. Preferred dividends aren't tax-deductible, so there's no tax adjustment.",
    optionExplanations: ["Wrong ratio.", "Inverted.", "No tax shield on preferred dividends.", "Correct."]
  },
  {
    id: "fin-wacc-005", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "medium", type: "numerical",
    question: "Market value of equity 600, debt 400; cost of equity 12%; pre-tax cost of debt 8%; tax rate 25%. What is the WACC?",
    options: ["9.6%", "10.4%", "10.0%", "8.8%"],
    answer: 0,
    explanation: "WACC = E/V × r_e + D/V × r_d(1 − t) = 0.6 × 12% + 0.4 × 8% × 0.75 = 7.2% + 2.4% = 9.6%.",
    optionExplanations: ["Correct.", "Ignores the tax shield.", "Wrong arithmetic.", "Wrong weights."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-wacc-006", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "medium", type: "concept",
    question: "Why should WACC weights use market values (or a target capital structure) rather than book values?",
    options: ["Book values are illegal", "WACC is the return investors require on what they could sell their claims for today; book equity reflects historical cost and can be far from market value, distorting the weights", "Market values never change", "Book values include taxes"],
    answer: 1,
    explanation: "For debt, book value is often a reasonable proxy for market value. A target structure reflects how future projects will be financed.",
    optionExplanations: ["Not the reason.", "Correct.", "They change daily.", "Not relevant."]
  },
  {
    id: "fin-wacc-007", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "hard", type: "numerical",
    question: "A comparable company has levered beta 1.5, D/E 0.5 and tax rate 25%. Using Hamada, what is its unlevered beta, and what is the beta relevered at your target D/E of 1.0?",
    options: ["1.0 and 2.0", "About 1.09 and about 1.91", "1.5 and 1.5", "About 1.20 and about 2.10"],
    answer: 1,
    explanation: "β_U = β_L/[1 + (1 − t)D/E] = 1.5/(1 + 0.75 × 0.5) = 1.5/1.375 = 1.091. Relever: β_L = 1.091 × (1 + 0.75 × 1.0) = 1.909. More leverage raises equity beta (financial risk).",
    optionExplanations: ["Ignores tax.", "Correct.", "Leverage changes beta.", "Wrong arithmetic."]
  },
  {
    id: "fin-wacc-008", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "medium", type: "concept",
    question: "Which risk-free rate and equity risk premium are typically used in CAPM for valuing a company?",
    options: ["The yield on a long-term government bond in the same currency as the cash flows (e.g. 10-year), and an ERP estimated from historical excess returns or implied from current market prices (often 4–7%)", "Overnight rate and 0% premium", "The company's bond yield and its dividend yield", "Any rate, since it doesn't matter"],
    answer: 0,
    explanation: "Matching duration and currency avoids inconsistency. Country risk premiums are sometimes added for emerging markets.",
    optionExplanations: ["Correct.", "Too short; the ERP is positive.", "Those aren't risk-free.", "It matters a lot."]
  },
  {
    id: "fin-wacc-009", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "medium", type: "concept",
    question: "A utility company (WACC 7%) is evaluating a risky tech venture. Which discount rate should it use?",
    options: ["Its own 7% WACC", "The risk-free rate", "A rate reflecting the PROJECT's risk, e.g. from comparable tech firms' unlevered betas, relevered at the project's financing — likely much higher than 7%", "The rate of its lowest-cost debt"],
    answer: 2,
    explanation: "Using company WACC for all projects favours risky projects (accepting value-destroying ones) and penalises safe ones.",
    optionExplanations: ["Mismatched risk.", "Ignores risk.", "Correct.", "Financing source isn't the risk."]
  },
  {
    id: "fin-wacc-010", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "hard", type: "numerical",
    question: "An unlevered firm is worth 1,000. It issues 400 of permanent debt and uses it to buy back shares. Corporate tax is 25%. Under MM with taxes, what is the levered firm's value?",
    options: ["1,000", "1,400", "1,100", "900"],
    answer: 2,
    explanation: "V_L = V_U + t_c × D = 1,000 + 0.25 × 400 = 1,100. The PV of the perpetual interest tax shield (t × r_d × D / r_d = tD) adds value. Without taxes (MM I), V_L = V_U = 1,000.",
    optionExplanations: ["That's MM without taxes.", "Adds the full debt.", "Correct.", "Wrong sign."]
  },
  {
    id: "fin-wacc-011", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "hard", type: "numerical",
    question: "Under MM Proposition II (no taxes), an all-equity firm's cost of capital is 10% and debt costs 6%. If it moves to D/E = 1, what is the cost of equity?",
    options: ["14%", "10%", "16%", "8%"],
    answer: 0,
    explanation: "r_e = r_0 + (r_0 − r_d)(D/E) = 10% + 4% × 1 = 14%. WACC stays at 0.5 × 14% + 0.5 × 6% = 10%: cheaper debt is exactly offset by riskier equity.",
    optionExplanations: ["Correct.", "Equity gets riskier.", "Wrong arithmetic.", "That's WACC with a wrong weight."]
  },
  {
    id: "fin-wacc-012", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "medium", type: "concept",
    question: "What does the trade-off theory of capital structure say?",
    options: ["Firms should be 100% debt-financed", "Firms balance the tax benefit of debt against expected costs of financial distress (bankruptcy costs, lost customers, underinvestment), so an optimal leverage exists where marginal benefit equals marginal cost", "Capital structure never matters", "Firms prefer equity first"],
    answer: 1,
    explanation: "Stable, asset-heavy firms (utilities) tend to carry more debt; volatile, intangible-heavy firms (tech) less.",
    optionExplanations: ["Distress costs prevent this.", "Correct.", "That's MM without taxes.", "That's not it."]
  },
  {
    id: "fin-wacc-013", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "medium", type: "concept",
    question: "According to the pecking order theory, how do firms prefer to finance investments, and why?",
    options: ["Equity, then debt, then retained earnings", "Randomly", "Only bank loans", "Internal funds (retained earnings) first, then debt, and new equity last — because managers know more than investors, and issuing equity signals that shares may be overvalued, lowering the price"],
    answer: 3,
    explanation: "This explains why share prices often fall on announcements of new equity issues, and why profitable firms often have low debt.",
    optionExplanations: ["Reversed.", "There's a pattern.", "Too narrow.", "Correct."]
  },
  {
    id: "fin-wacc-014", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "easy", type: "concept",
    question: "Which is an advantage of financing with debt rather than equity?",
    options: ["Debt never has to be repaid", "Debt increases the cost of equity to zero", "Debt holders get voting rights", "Interest is tax-deductible and existing owners keep control (no dilution); but debt adds fixed obligations and bankruptcy risk"],
    answer: 3,
    explanation: "Equity is more flexible (no mandatory payments) but dilutes ownership and is more expensive.",
    optionExplanations: ["It must be repaid.", "It raises the cost of equity.", "Usually not.", "Correct."]
  },
  {
    id: "fin-wacc-015", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "hard", type: "numerical",
    question: "EBIT is 200 and the tax rate 25%. Plan A: all equity, 100 shares (equity 1,000). Plan B: borrow 500 at 8% and have 50 shares (equity 500). What are EPS and ROE under each plan?",
    options: ["A: EPS 1.5, ROE 15%; B: EPS 1.5, ROE 15%", "A: EPS 1.5, ROE 15%; B: EPS 2.4, ROE 24%", "A: EPS 2.0, ROE 20%; B: EPS 3.2, ROE 32%", "A: EPS 1.5, ROE 15%; B: EPS 1.2, ROE 12%"],
    answer: 1,
    explanation: "A: NI = 200 × 0.75 = 150 → EPS 1.5, ROE 15%. B: NI = (200 − 40) × 0.75 = 120 → EPS 2.4, ROE 24%. Leverage magnifies returns when the return on assets exceeds the cost of debt — and magnifies losses when EBIT falls.",
    optionExplanations: ["Leverage changes EPS.", "Correct.", "Ignores tax.", "Wrong direction."]
  },
  {
    id: "fin-wacc-016", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "easy", type: "concept",
    question: "Why is the cost of debt normally lower than the cost of equity?",
    options: ["Banks are generous", "Debt has no risk at all", "Debt holders have a contractual, prior claim on cash flows and assets (less risk), and interest is tax-deductible; equity holders are residual claimants bearing more risk", "Equity is always cheaper"],
    answer: 2,
    explanation: "This is why adding debt initially lowers WACC — until distress costs rise.",
    optionExplanations: ["Not the reason.", "Debt can default.", "Correct.", "Opposite."]
  },
  {
    id: "fin-wacc-017", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "medium", type: "numerical",
    question: "A firm has $400m of debt at 8% interest and a 25% tax rate. What is its annual interest tax shield, and its PV if the debt is permanent (discounted at the cost of debt)?",
    options: ["$32m and $400m", "$8m and $32m", "$24m and $300m", "$8m and $100m"],
    answer: 3,
    explanation: "Annual shield = 400 × 8% × 25% = $8m. PV of a perpetuity at 8% = 8/0.08 = $100m = t × D.",
    optionExplanations: ["That's total interest.", "Wrong PV.", "That's after-tax interest.", "Correct."]
  },
  {
    id: "fin-wacc-018", subject: "finance", subtopic: "Cost of Capital & Capital Structure", difficulty: "hard", type: "concept",
    question: "A company keeps borrowing because 'debt is cheaper than equity'. Using MM and trade-off reasoning, what's wrong with this argument?",
    options: ["Nothing; debt is always cheaper", "More debt makes equity riskier, raising its cost (MM II), so WACC doesn't simply fall; beyond some point, distress costs and rising debt costs make WACC rise. Only the tax shield (and limited other frictions) creates value from leverage", "Equity is free", "Debt reduces tax shields"],
    answer: 1,
    explanation: "The 'cheapness' of debt is offset by higher required equity returns; the net benefit is the tax shield minus expected distress costs.",
    optionExplanations: ["It ignores rising equity costs.", "Correct.", "Equity has a cost.", "Debt creates tax shields."]
  }
);
