/* Finance — Risk, Return & Portfolio Theory */
window.QUESTIONS.push(
  {
    id: "fin-risk-001", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "easy", type: "numerical",
    question: "You buy a share at $50, receive a $2 dividend, and sell it a year later at $56. What is your holding-period return?",
    options: ["16%", "12%", "4%", "14.3%"],
    answer: 0,
    explanation: "HPR = (P₁ − P₀ + D)/P₀ = (56 − 50 + 2)/50 = 16%: 12% capital gain + 4% dividend yield.",
    optionExplanations: ["Correct.", "That ignores the dividend.", "That's just the dividend yield.", "That divides by the selling price."]
  },
  {
    id: "fin-risk-002", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "medium", type: "numerical",
    question: "A fund returns +10%, +20% and −15% in three years. What are its arithmetic and geometric average annual returns?",
    options: ["5% and 5%", "15% and 5%", "3.91% and 5%", "5% and about 3.91%"],
    answer: 3,
    explanation: "Arithmetic = (10 + 20 − 15)/3 = 5%. Geometric = (1.10 × 1.20 × 0.85)^(1/3) − 1 = 1.122^(1/3) − 1 = 3.91%. The geometric mean is the actual compound growth rate and is always ≤ the arithmetic mean (more so with higher volatility).",
    optionExplanations: ["The geometric mean is lower.", "Wrong arithmetic.", "Swapped.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-risk-003", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "medium", type: "numerical",
    question: "A stock returns 30% in a boom (probability 0.3), 10% in a normal year (0.5) and −20% in a bust (0.2). What are its expected return and standard deviation?",
    options: ["6.7% and 20%", "20% and 17.3%", "10% and 3%", "10% and about 17.3%"],
    answer: 3,
    explanation: "E[R] = 0.3 × 30 + 0.5 × 10 + 0.2 × (−20) = 10%. Variance = 0.3 × 20² + 0.5 × 0² + 0.2 × 30² = 120 + 0 + 180 = 300 (%²) → SD = √300 = 17.3%.",
    optionExplanations: ["That's an unweighted average.", "Wrong expected return.", "3% is the variance in decimal form (0.03), not the SD.", "Correct."]
  },
  {
    id: "fin-risk-004", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "easy", type: "concept",
    question: "Why can diversification reduce unsystematic risk but not systematic risk?",
    options: ["Firm-specific (idiosyncratic) shocks are largely independent and average out across many holdings; market-wide (systematic) risk — recessions, rate changes — affects all stocks together and remains", "Because all risks diversify away", "Because systematic risk is zero", "Because diversification increases returns"],
    answer: 0,
    explanation: "With 20–30 stocks across sectors most idiosyncratic risk is gone. Since it can be diversified away cheaply, investors aren't rewarded for bearing it; only systematic risk (beta) earns a premium in CAPM.",
    optionExplanations: ["Correct.", "Not market risk.", "It's what remains.", "It reduces risk, not necessarily raises return."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-risk-005", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "hard", type: "numerical",
    question: "A portfolio is 60% in A (σ = 20%) and 40% in B (σ = 10%), with correlation 0.3. What is the portfolio standard deviation? What would it be with correlation −1?",
    options: ["16% and 0%", "About 13.74% and 0%", "16% and 8%", "About 13.74% and 8%"],
    answer: 3,
    explanation: "σ² = 0.6²(0.2²) + 0.4²(0.1²) + 2(0.6)(0.4)(0.3)(0.2)(0.1) = 0.0144 + 0.0016 + 0.00288 = 0.01888 → σ = 13.74%, below the 16% weighted average of SDs. With ρ = −1: σ = |0.6 × 20% − 0.4 × 10%| = 8%.",
    optionExplanations: ["16% is the weighted average (ρ = 1).", "Zero requires different weights.", "Uses ρ = 1 for the first case.", "Correct."]
  },
  {
    id: "fin-risk-006", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "hard", type: "numerical",
    question: "Assets A (σ = 20%) and B (σ = 10%) are perfectly negatively correlated. What weight in A gives a zero-risk portfolio?",
    options: ["About 33.3%", "50%", "66.7%", "0%"],
    answer: 0,
    explanation: "With ρ = −1, set w × 20% = (1 − w) × 10% → w = 10/(20 + 10) = 1/3. The portfolio is riskless, so (by no-arbitrage) it must earn the risk-free rate.",
    optionExplanations: ["Correct.", "Equal weights leave 5% risk.", "Inverted.", "All in B leaves 10% risk."]
  },
  {
    id: "fin-risk-007", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "medium", type: "concept",
    question: "What is the efficient frontier?",
    options: ["The set of all individual stocks", "Portfolios with zero risk", "The set of portfolios offering the highest expected return for each level of risk (or lowest risk for each return); it starts at the minimum-variance portfolio, and rational investors choose only portfolios on it", "The line of all risk-free assets"],
    answer: 2,
    explanation: "Adding a risk-free asset gives the capital market line, tangent to the frontier at the market (tangency) portfolio — the one with the highest Sharpe ratio.",
    optionExplanations: ["It's about portfolios.", "Risky portfolios have risk.", "Correct.", "That's one point."]
  },
  {
    id: "fin-risk-008", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "easy", type: "numerical",
    question: "The risk-free rate is 4%, the market risk premium is 6% and a stock's beta is 1.2. What is its CAPM expected return?",
    options: ["10.0%", "7.2%", "11.2%", "12.0%"],
    answer: 2,
    explanation: "E[R] = r_f + β(E[R_m] − r_f) = 4% + 1.2 × 6% = 11.2%.",
    optionExplanations: ["That's β = 1.", "That omits the risk-free rate.", "Correct.", "Wrong arithmetic."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-risk-009", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "easy", type: "concept",
    question: "What does a beta of 1.5 mean?",
    options: ["The stock has 1.5% risk", "The stock has a 50% chance of rising", "The stock tends to move 1.5% for each 1% market move: 50% more systematic risk than the market", "The stock is uncorrelated with the market"],
    answer: 2,
    explanation: "β = Cov(Rᵢ, R_m)/Var(R_m). β = 1 moves with the market; β < 1 is defensive; β < 0 moves against it. Beta measures systematic risk only.",
    optionExplanations: ["Not a percentage risk.", "Not a probability.", "Correct.", "That's β = 0."]
  },
  {
    id: "fin-risk-010", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "medium", type: "numerical",
    question: "A stock's covariance with the market is 0.018 and the market's standard deviation is 15%. What is its beta?",
    options: ["0.12", "0.80", "1.20", "1.25"],
    answer: 1,
    explanation: "β = Cov/Var(m) = 0.018/0.15² = 0.018/0.0225 = 0.8.",
    optionExplanations: ["Divided by σ, not σ².", "Correct.", "Inverted.", "Wrong arithmetic."]
  },
  {
    id: "fin-risk-011", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "medium", type: "concept",
    question: "How does the capital market line (CML) differ from the security market line (SML)?",
    options: ["They're the same line", "The CML applies to individual stocks", "The SML uses total risk", "The CML plots expected return against TOTAL risk (σ) for efficient portfolios combining the risk-free asset and the market; the SML plots expected return against BETA for any asset or portfolio (CAPM)"],
    answer: 3,
    explanation: "Individual stocks lie below the CML (they carry diversifiable risk) but should lie on the SML in equilibrium.",
    optionExplanations: ["Different axes.", "Only efficient portfolios lie on it.", "SML uses beta.", "Correct."]
  },
  {
    id: "fin-risk-012", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "medium", type: "numerical",
    question: "A fund with beta 1.2 returned 14% while the market returned 10% and the risk-free rate was 4%. What is Jensen's alpha?",
    options: ["2.8%", "4.0%", "10.0%", "−2.8%"],
    answer: 0,
    explanation: "CAPM-required return = 4% + 1.2 × (10% − 4%) = 11.2%. α = 14% − 11.2% = +2.8% — outperformance after adjusting for systematic risk.",
    optionExplanations: ["Correct.", "That ignores beta.", "That's the excess return over the risk-free rate.", "Wrong sign."]
  },
  {
    id: "fin-risk-013", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "medium", type: "numerical",
    question: "A portfolio returned 12% with σ = 16% and β = 0.8; the risk-free rate is 4%. What are its Sharpe and Treynor ratios?",
    options: ["Sharpe 0.75, Treynor 15%", "Sharpe 0.5, Treynor 10%", "Sharpe 0.5, Treynor 15%", "Sharpe 0.08, Treynor 0.10"],
    answer: 1,
    explanation: "Sharpe = (R − r_f)/σ = 8/16 = 0.5 (excess return per unit of total risk). Treynor = (R − r_f)/β = 8%/0.8 = 10% (per unit of systematic risk). The Sortino ratio divides by downside deviation only.",
    optionExplanations: ["Ignores the risk-free rate.", "Correct.", "Wrong Treynor.", "Wrong arithmetic."]
  },
  {
    id: "fin-risk-014", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "easy", type: "numerical",
    question: "A portfolio holds 50% in a stock with β = 1.2, 30% in one with β = 0.8 and 20% in one with β = 1.5. What is the portfolio beta?",
    options: ["1.17", "1.00", "1.14", "3.50"],
    answer: 2,
    explanation: "Portfolio beta is the weighted average: 0.5 × 1.2 + 0.3 × 0.8 + 0.2 × 1.5 = 0.60 + 0.24 + 0.30 = 1.14. (Volatility does NOT average this way because of correlations.)",
    optionExplanations: ["Equal-weighted average.", "Not market beta.", "Correct.", "Sum, not weighted average."]
  },
  {
    id: "fin-risk-015", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "medium", type: "concept",
    question: "A stock's expected return is 15%, but CAPM says it should be 11.2% given its beta. Where does it plot relative to the SML, and what does that suggest?",
    options: ["Below the SML; overvalued, sell", "Above the SML: it offers more return than its risk requires, suggesting it's undervalued (buy); buying pressure should raise its price until it returns to the line", "On the SML; fairly priced", "CAPM doesn't apply"],
    answer: 1,
    explanation: "Positive alpha relative to the SML is a buy signal in theory — assuming CAPM is the right model and the estimates are reliable.",
    optionExplanations: ["Reversed.", "Correct.", "It's above.", "It's a CAPM comparison."]
  },
  {
    id: "fin-risk-016", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "medium", type: "numerical",
    question: "A $1 million portfolio has daily volatility of 1.5%. Assuming normal returns, what is its 1-day 95% VaR?",
    options: ["$15,000", "$24,675", "$34,950", "$29,400"],
    answer: 1,
    explanation: "VaR = z × σ × value = 1.645 × 1.5% × $1m = $24,675. At 99% (z = 2.33) it would be $34,950. There's a 5% chance of losing more than $24,675 on a given day.",
    optionExplanations: ["That's 1σ.", "Correct.", "That's 99%.", "That uses z = 1.96 (two-tailed)."]
  },
  {
    id: "fin-risk-017", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "easy", type: "numerical",
    question: "Annual returns are normally distributed with mean 8% and SD 15%. In what range do about 95% of annual returns fall?",
    options: ["−22% to 38%", "−7% to 23%", "−37% to 53%", "0% to 16%"],
    answer: 0,
    explanation: "68–95–99.7 rule: ±2σ covers about 95% → 8% ± 30% = −22% to 38%. ±1σ (−7% to 23%) covers about 68%; ±3σ about 99.7%.",
    optionExplanations: ["Correct.", "That's ±1σ.", "That's ±3σ.", "Not based on σ."]
  },
  {
    id: "fin-risk-018", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "easy", type: "concept",
    question: "Match the risk types: (i) a borrower fails to repay, (ii) you can't sell an asset quickly without a big price cut, (iii) a system failure or fraud causes losses, (iv) exchange-rate moves hit foreign earnings.",
    options: ["(i) market, (ii) credit, (iii) liquidity, (iv) operational", "All are market risk", "(i) liquidity, (ii) credit, (iii) currency, (iv) market", "(i) credit, (ii) liquidity, (iii) operational, (iv) currency (FX) risk"],
    answer: 3,
    explanation: "Market risk comes from prices, rates and FX in general. Banks hold capital against credit, market and operational risk under Basel rules.",
    optionExplanations: ["Mismatched.", "They're distinct.", "Mismatched.", "Correct."]
  },
  {
    id: "fin-risk-019", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "medium", type: "concept",
    question: "What does the Fama-French three-factor model add to CAPM?",
    options: ["Nothing", "Size (SMB: small minus big) and value (HML: high minus low book-to-market) factors alongside the market factor, because small and value stocks historically earned returns CAPM's beta didn't explain", "Interest rate and inflation factors only", "A momentum factor only"],
    answer: 1,
    explanation: "Later extensions add profitability and investment (five-factor) and momentum (Carhart). Arbitrage Pricing Theory generalises to multiple systematic factors.",
    optionExplanations: ["It adds factors.", "Correct.", "Those are macro factor models.", "Carhart added momentum."]
  },
  {
    id: "fin-risk-020", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "easy", type: "concept",
    question: "What does it mean that investors are risk-averse?",
    options: ["They never invest in stocks", "They prefer more risk for the same return", "Given two investments with the same expected return, they prefer the less risky one, so riskier assets must offer higher expected returns (a risk premium) to attract them", "They only hold cash"],
    answer: 2,
    explanation: "This is the basis of the risk-return trade-off; risk tolerance determines where on the efficient frontier/CML an investor sits.",
    optionExplanations: ["They invest if compensated.", "That's risk-seeking.", "Correct.", "Not necessarily."]
  },
  {
    id: "fin-risk-021", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "hard", type: "concept",
    question: "In a large, equally weighted portfolio of n stocks with average variance σ̄² and average pairwise covariance Cov̄, what happens to the portfolio variance as n grows?",
    options: ["It goes to zero", "It approaches σ̄²", "It approaches the average covariance Cov̄: σ²_p = σ̄²/n + (1 − 1/n)Cov̄ — individual variances diversify away, covariances (systematic risk) don't", "It grows with n"],
    answer: 2,
    explanation: "This formalises why only systematic risk remains in diversified portfolios.",
    optionExplanations: ["Only if covariances are zero.", "That's a single stock.", "Correct.", "It falls."]
  },
  {
    id: "fin-risk-022", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "hard", type: "concept",
    question: "Two funds have the same Sharpe ratio. Fund X is a diversified portfolio; Fund Y is one of 20 sector funds held together by an investor. Which measure is more appropriate for evaluating Y, and why?",
    options: ["Treynor ratio (or alpha): when a fund is a small part of a diversified portfolio, only its systematic risk (beta) matters to the investor, not its total volatility", "Sharpe, always", "Standard deviation alone", "Neither can be evaluated"],
    answer: 0,
    explanation: "Sharpe uses total risk and suits evaluating an investor's whole portfolio; Treynor and Jensen's alpha suit components of a diversified portfolio.",
    optionExplanations: ["Correct.", "Not for components.", "Ignores return.", "They can."]
  },
  {
    id: "fin-risk-023", subject: "finance", subtopic: "Risk, Return & Portfolio Theory", difficulty: "medium", type: "concept",
    question: "What is the Sortino ratio, and when is it preferred over the Sharpe ratio?",
    options: ["It uses beta", "(Return − target)/downside deviation: it penalises only harmful volatility, so it's preferred when return distributions are asymmetric (e.g. strategies with occasional big gains)", "It's the same as Treynor", "It ignores returns"],
    answer: 1,
    explanation: "The Sharpe ratio treats upside and downside volatility equally, which can understate the quality of positively skewed strategies.",
    optionExplanations: ["That's Treynor.", "Correct.", "Different.", "It uses returns."]
  }
);
