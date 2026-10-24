/* Finance — Volatility Models & Backtesting */
window.QUESTIONS.push(
  {
    id: "fin-volmodels-001", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "easy", type: "concept",
    question: "Which is NOT a well-known stylised fact of financial returns?",
    options: ["Volatility clustering", "Fat tails (excess kurtosis)", "Strong autocorrelation in daily returns themselves", "The leverage effect (volatility rises more after falls)"],
    answer: 2,
    explanation: "Daily returns show little linear autocorrelation (close to unpredictable), but SQUARED or absolute returns are strongly autocorrelated — that's volatility clustering. Extreme moves are far more common than the normal distribution predicts.",
    optionExplanations: ["That's a stylised fact.", "That's a stylised fact.", "Correct: returns themselves are nearly uncorrelated.", "That's a stylised fact."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-volmodels-002", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "easy", type: "concept",
    question: "Why do we need volatility models like ARCH/GARCH in addition to ARIMA?",
    options: ["ARIMA can't forecast anything", "They are the same model", "GARCH forecasts prices more accurately", "ARIMA models the conditional MEAN assuming constant variance, but financial volatility changes over time; GARCH models the conditional VARIANCE, which drives risk management, option pricing and position sizing"],
    answer: 3,
    explanation: "ARIMA says what tomorrow's return might be; GARCH says how uncertain that forecast is. They're often combined (ARMA-GARCH).",
    optionExplanations: ["ARIMA forecasts the mean.", "They model different moments.", "GARCH targets variance.", "Correct."]
  },
  {
    id: "fin-volmodels-003", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "easy", type: "numerical",
    question: "A stock's daily return volatility is 1%. Assuming 252 trading days and independent returns, what is its annualised volatility?",
    options: ["2.52%", "15.87%", "252%", "3.65%"],
    answer: 1,
    explanation: "Variance scales with time, so volatility scales with √time: 1% × √252 = 15.87%.",
    optionExplanations: ["Wrong scaling.", "Correct.", "That scales linearly.", "That multiplies by 3.65 instead of √252."]
  },
  {
    id: "fin-volmodels-004", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "numerical",
    question: "An EWMA (RiskMetrics) model uses σ²ₜ = λσ²ₜ₋₁ + (1 − λ)r²ₜ₋₁ with λ = 0.94. Yesterday's volatility estimate was 1% and yesterday's return was 3%. What is today's volatility estimate?",
    options: ["1.00%", "About 1.22%", "1.48%", "3.00%"],
    answer: 1,
    explanation: "In %² units: σ² = 0.94 × 1² + 0.06 × 3² = 0.94 + 0.54 = 1.48 → σ = √1.48 ≈ 1.217%. A big move raises the estimate, but persistence (λ) keeps it close to yesterday's level.",
    optionExplanations: ["The large return raises volatility.", "Correct.", "That's the variance, not the volatility.", "That's just yesterday's return."]
  },
  {
    id: "fin-volmodels-005", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "numerical",
    question: "An ARCH(1) model has σ²ₜ = 0.2 + 0.5ε²ₜ₋₁. If yesterday's shock was εₜ₋₁ = 2, what is today's conditional variance?",
    options: ["0.7", "1.2", "2.2", "4.2"],
    answer: 2,
    explanation: "σ²ₜ = 0.2 + 0.5 × 2² = 0.2 + 2.0 = 2.2. Large shocks raise next period's variance — producing volatility clustering. Positivity needs α₀ > 0 and α₁ ≥ 0.",
    optionExplanations: ["That uses ε instead of ε².", "That uses ε² = 2.", "Correct.", "That uses α₁ = 1."]
  },
  {
    id: "fin-volmodels-006", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "concept",
    question: "Why is GARCH(1,1) usually preferred to a high-order ARCH(q)?",
    options: ["It ignores past shocks", "Adding the lagged variance term β₁σ²ₜ₋₁ captures long volatility persistence with just three parameters; GARCH(1,1) is equivalent to an ARCH(∞) with geometrically declining weights, avoiding many unstable ARCH parameters", "ARCH can't produce clustering", "GARCH has no parameter constraints"],
    answer: 1,
    explanation: "σ²ₜ = α₀ + α₁ε²ₜ₋₁ + β₁σ²ₜ₋₁: α₀ sets the baseline, α₁ is the reaction to news, β₁ is persistence.",
    optionExplanations: ["It includes past shocks.", "Correct.", "ARCH does produce clustering, just with many lags.", "It requires α₀ > 0, α, β ≥ 0 and α + β < 1."]
  },
  {
    id: "fin-volmodels-007", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "hard", type: "numerical",
    question: "A daily GARCH(1,1) has α₀ = 0.000002, α₁ = 0.08 and β₁ = 0.90. What is the long-run daily volatility, and its annualised value (252 days)?",
    options: ["1% daily, about 15.9% annual", "0.2% daily, about 3.2% annual", "10% daily, about 159% annual", "1% daily, 252% annual"],
    answer: 0,
    explanation: "Long-run variance σ̄² = α₀/(1 − α₁ − β₁) = 0.000002/0.02 = 0.0001 → σ̄ = 1% per day. Annualised: 1% × √252 ≈ 15.9%. The process mean-reverts to this level.",
    optionExplanations: ["Correct.", "That forgets to divide by 1 − α − β.", "Wrong arithmetic.", "Annualise with √252, not 252."]
  },
  {
    id: "fin-volmodels-008", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "hard", type: "numerical",
    question: "Same GARCH(1,1) (α₀ = 0.000002, α₁ = 0.08, β₁ = 0.90). Yesterday's variance was 0.0001 (1% vol) and yesterday's return shock was −2%. What is today's volatility?",
    options: ["1.00%", "About 1.11%", "About 1.24%", "2.00%"],
    answer: 1,
    explanation: "σ² = 0.000002 + 0.08 × 0.0004 + 0.90 × 0.0001 = 0.000002 + 0.000032 + 0.00009 = 0.000124 → σ ≈ 1.114%. Standard GARCH treats −2% and +2% identically (it uses ε²).",
    optionExplanations: ["The shock raises variance.", "Correct.", "That's the variance × 100, not the volatility.", "Persistence keeps it near yesterday's level."]
  },
  {
    id: "fin-volmodels-009", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "hard", type: "numerical",
    question: "A fitted GARCH(1,1) has α₁ + β₁ = 0.98. Approximately how many days does it take for a volatility shock's effect (the deviation of variance from its long-run level) to halve?",
    options: ["About 34 days", "About 2 days", "About 50 days", "About 98 days"],
    answer: 0,
    explanation: "Deviations decay by (α₁ + β₁) per period: half-life = ln 0.5 / ln 0.98 ≈ 34.3 days. Values of α + β around 0.97–0.99 are typical, meaning very persistent volatility. α + β = 1 (IGARCH, like EWMA) never reverts.",
    optionExplanations: ["Correct.", "Far too fast.", "That's 1/(1 − 0.98).", "Too slow."]
  },
  {
    id: "fin-volmodels-010", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "concept",
    question: "Which conditions ensure a GARCH(1,1) has positive variance and a finite long-run (unconditional) variance?",
    options: ["α₀ < 0 and α₁ + β₁ > 1", "Any values work", "α₀ > 0, α₁ ≥ 0, β₁ ≥ 0 for positivity; α₁ + β₁ < 1 for a finite long-run variance", "β₁ must equal 1"],
    answer: 2,
    explanation: "If α₁ + β₁ ≥ 1, the formula α₀/(1 − α₁ − β₁) breaks down: shocks never die out on average.",
    optionExplanations: ["That would allow negative or explosive variance.", "Constraints are needed.", "Correct.", "β₁ = 1 is non-stationary."]
  },
  {
    id: "fin-volmodels-011", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "concept",
    question: "Which model captures the leverage effect by adding an extra term only when the previous shock is NEGATIVE?",
    options: ["GARCH-M", "EWMA", "ARCH(1)", "GJR-GARCH (TGARCH)"],
    answer: 3,
    explanation: "GJR: σ²ₜ = α₀ + α₁ε²ₜ₋₁ + γ₁ε²ₜ₋₁Iₜ₋₁ + β₁σ²ₜ₋₁, where I = 1 if ε < 0. With γ₁ > 0, negative shocks contribute (α₁ + γ₁)ε², positive shocks only α₁ε².",
    optionExplanations: ["That links the mean to variance.", "Symmetric.", "Symmetric.", "Correct."]
  },
  {
    id: "fin-volmodels-012", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "hard", type: "numerical",
    question: "In a GJR-GARCH with α₁ = 0.05 and γ₁ = 0.10, what coefficient multiplies ε²ₜ₋₁ after a negative shock versus a positive shock?",
    options: ["0.15 after a negative shock, 0.05 after a positive shock", "0.05 for both", "0.10 after a negative shock, 0.05 after a positive shock", "0.05 after a negative shock, 0.15 after a positive shock"],
    answer: 0,
    explanation: "Negative shocks: α₁ + γ₁ = 0.15; positive: α₁ = 0.05. Bad news raises volatility three times as much — the leverage effect in equity markets.",
    optionExplanations: ["Correct.", "That ignores the asymmetry.", "γ₁ adds to α₁.", "Reversed."]
  },
  {
    id: "fin-volmodels-013", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "hard", type: "concept",
    question: "What advantages does EGARCH have?",
    options: ["It ignores asymmetry", "It forces α + β = 1", "It models ln(σ²ₜ), so variance is positive without parameter constraints, and its γ term (typically γ < 0 for equities) lets negative shocks raise volatility more than positive ones", "It models the mean only"],
    answer: 2,
    explanation: "Nelson (1991): ln σ²ₜ = α₀ + α₁[|zₜ₋₁| − E|zₜ₋₁|] + γzₜ₋₁ + β ln σ²ₜ₋₁, where zₜ₋₁ = εₜ₋₁/σₜ₋₁ is the standardised shock.",
    optionExplanations: ["Asymmetry is its point.", "No such constraint.", "Correct.", "It models variance."]
  },
  {
    id: "fin-volmodels-014", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "concept",
    question: "What does GARCH-in-Mean (GARCH-M) add?",
    options: ["The conditional variance enters the mean equation (rₜ = μ + λσ²ₜ + εₜ), so expected return depends on time-varying risk; λ > 0 means investors demand more return when risk is higher", "Seasonality", "A trend term", "Jumps"],
    answer: 0,
    explanation: "It gives a direct test of the risk-return trade-off.",
    optionExplanations: ["Correct.", "Not seasonality.", "Not a trend.", "Not jumps."]
  },
  {
    id: "fin-volmodels-015", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "concept",
    question: "How do expanding-window (walk-forward) and rolling-window validation differ, and when is each preferred?",
    options: ["Expanding keeps all history and grows the training set (better when the process is stable or data is scarce); rolling uses a fixed-length window that drops old data (better when regimes change and recent data is more relevant)", "They're identical", "Rolling windows use future data", "Expanding windows shuffle the data"],
    answer: 0,
    explanation: "Both refit periodically and forecast only out-of-sample, mimicking live deployment. Refitting less often saves compute but risks a stale model.",
    optionExplanations: ["Correct.", "They treat old data differently.", "Neither does.", "Neither does."]
  },
  {
    id: "fin-volmodels-016", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "hard", type: "concept",
    question: "In combinatorial purged cross-validation, what do 'purging' and 'embargo' do?",
    options: ["Delete outliers and pause trading", "Shuffle the data", "Remove losing trades", "Purging removes training observations whose label windows overlap the test period; embargo drops a buffer of observations right after the test set — both prevent leakage from overlapping holding periods and autocorrelated features"],
    answer: 3,
    explanation: "Combining groups combinatorially gives many out-of-sample backtest paths instead of the single path of walk-forward, so performance estimates are less dependent on one sequence (López de Prado).",
    optionExplanations: ["Not the meaning.", "Never shuffle time series.", "That would be cheating.", "Correct."]
  },
  {
    id: "fin-volmodels-017", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "hard", type: "numerical",
    question: "With T = 1,000 observations: Model A has ln L = −1000 and 3 parameters; Model B has ln L = −995 and 6 parameters. Which model do AIC and BIC each prefer?",
    options: ["Both prefer A", "AIC prefers B (2002 vs 2006); BIC prefers A (2020.7 vs 2031.4)", "Both prefer B", "AIC prefers A; BIC prefers B"],
    answer: 1,
    explanation: "AIC = −2 ln L + 2k: A = 2006, B = 2002 → B. BIC = −2 ln L + k ln T, with ln 1000 = 6.91: A = 2020.7, B = 2031.4 → A. BIC penalises extra parameters more heavily, favouring simpler models; lower is better for both.",
    optionExplanations: ["AIC prefers B.", "Correct.", "BIC prefers A.", "Reversed."]
  },
  {
    id: "fin-volmodels-018", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "concept",
    question: "In a standard diagnostic workflow, what do the Ljung-Box and ARCH-LM tests check in a fitted model's residuals?",
    options: ["Normality and stationarity", "Both test for unit roots", "Ljung-Box tests whether residual autocorrelations up to lag h are jointly zero (missed mean structure); ARCH-LM tests whether squared residuals are autocorrelated (time-varying variance that calls for GARCH)", "Both test forecast accuracy"],
    answer: 2,
    explanation: "Workflow: fit the mean model → Ljung-Box on residuals → ARCH-LM on squared residuals → if significant, fit GARCH → re-test standardised residuals. Residuals should look like white noise.",
    optionExplanations: ["Not these tests.", "That's ADF/KPSS.", "Correct.", "That's Diebold-Mariano."]
  },
  {
    id: "fin-volmodels-019", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "concept",
    question: "Two models have out-of-sample RMSEs of 1.02 and 1.00. What does the Diebold-Mariano test tell you?",
    options: ["Which model has the lower RMSE", "Whether residuals are normal", "Whether the difference in forecast losses is statistically significant, using the mean loss differential and an autocorrelation-robust variance (asymptotically N(0, 1) under the null of equal accuracy)", "Whether the series is stationary"],
    answer: 2,
    explanation: "A small RMSE gap may just be noise. DM = d̄ / √Var(d̄), where dₜ = L(e₁ₜ) − L(e₂ₜ).",
    optionExplanations: ["You can see that directly; the question is significance.", "Not this test.", "Correct.", "Not this test."]
  },
  {
    id: "fin-volmodels-020", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "easy", type: "concept",
    question: "A backtest standardises features using the mean and standard deviation of the FULL sample, including future dates. Which bias is this?",
    options: ["Survivorship bias", "Confirmation bias", "Selection bias", "Look-ahead bias"],
    answer: 3,
    explanation: "Any information not available at decision time leaks the future. Other examples: using revised macro data, the closing price for a decision made at the open, or today's index membership. Walk-forward designs eliminate most look-ahead bias.",
    optionExplanations: ["That's about missing failed entities.", "Not a backtesting term here.", "That's about which strategies get published.", "Correct."]
  },
  {
    id: "fin-volmodels-021", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "easy", type: "concept",
    question: "A strategy is backtested over 30 years using only TODAY's index constituents. What's the problem?",
    options: ["Look-ahead bias only in prices", "Survivorship bias: companies that went bankrupt, were delisted or dropped out are excluded, so results reflect today's winners and overstate performance. Use point-in-time constituent data", "Too much data", "Nothing; it's standard practice"],
    answer: 1,
    explanation: "Survivorship bias also distorts mutual-fund performance studies, since closed funds disappear from databases.",
    optionExplanations: ["The core problem is the excluded failures.", "Correct.", "Not the issue.", "It's a known bias."]
  },
  {
    id: "fin-volmodels-022", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "concept",
    question: "A researcher tries 100 variants of a strategy and reports the best one's Sharpe ratio. Why is this misleading, and what helps?",
    options: ["It isn't misleading", "More trials always improve reliability", "Data snooping: with many trials, the best result is likely luck — with no true skill, the expected maximum Sharpe ratio grows roughly like √(2 ln N) (about 3 standard errors for N = 100). Defences: untouched hold-out data, multiple-testing corrections, the deflated Sharpe ratio, and out-of-sample validation", "The Sharpe ratio can't be affected"],
    answer: 2,
    explanation: "Publication (selection) bias compounds this: published strategies are the survivors of many failed attempts, so reported edges are overstated.",
    optionExplanations: ["The best of many trials is biased upward.", "More trials make the best one less trustworthy.", "Correct.", "It's the most affected statistic."]
  },
  {
    id: "fin-volmodels-023", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "numerical",
    question: "A strategy earns 8% per year before costs and trades 20 times its capital per year (2,000% turnover). Commissions, spread and impact cost 0.25% of traded value. What is the net return?",
    options: ["7.75%", "8%", "−2%", "3%"],
    answer: 3,
    explanation: "Annual cost = turnover × cost per unit traded = 20 × 0.25% = 5% of capital. Net return = 8% − 5% = 3%. High-turnover strategies can see most or all of their edge consumed by costs, so a backtest without realistic costs is meaningless.",
    optionExplanations: ["That charges the cost only once.", "That ignores costs.", "That doubles the cost.", "Correct."]
  },
  {
    id: "fin-volmodels-024", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "concept",
    question: "Under the common 'square-root' market-impact model, impact per share grows with the square root of order size relative to volume. If order size quadruples, what happens to impact per share?",
    options: ["It quadruples", "It doubles", "It stays the same", "It halves"],
    answer: 1,
    explanation: "Impact ∝ √(Q/V): √4 = 2. Total impact cost (impact × quantity) therefore rises 8×, which is why large funds split orders and why capacity limits strategies.",
    optionExplanations: ["That's linear impact.", "Correct.", "Impact grows with size.", "Wrong direction."]
  },
  {
    id: "fin-volmodels-025", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "hard", type: "concept",
    question: "Which order of steps makes a defensible evaluation pipeline for a trading model?",
    options: ["Optimise on all data, then report the best backtest", "Skip costs, then paper trade", "Test on the hold-out repeatedly until it looks good", "Lock away a final hold-out → narrow models with AIC/BIC → walk-forward validation on the development period → residual diagnostics → Diebold-Mariano comparison → simulate with realistic costs → evaluate ONCE on the hold-out → paper trade"],
    answer: 3,
    explanation: "Repeated peeking at the hold-out turns it into training data. Even with clean walk-forward tests, iterating on the same history overfits — prospective paper trading is the strongest defence.",
    optionExplanations: ["That's overfitting.", "Costs can flip results.", "That destroys the hold-out.", "Correct."]
  },
  {
    id: "fin-volmodels-026", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "concept",
    question: "How does the EWMA volatility model relate to GARCH(1,1)?",
    options: ["They're unrelated", "EWMA uses only the latest return", "EWMA has a long-run variance; GARCH doesn't", "EWMA is a special case of GARCH(1,1) with α₀ = 0, α₁ = 1 − λ and β₁ = λ, so α₁ + β₁ = 1: no mean reversion to a long-run variance"],
    answer: 3,
    explanation: "Because EWMA doesn't mean-revert, its multi-step forecasts stay flat at today's level, whereas GARCH forecasts converge to σ̄².",
    optionExplanations: ["EWMA is a constrained GARCH.", "It weights all past returns.", "Reversed.", "Correct."]
  },
  {
    id: "fin-volmodels-027", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "easy", type: "concept",
    question: "Daily returns show kurtosis of 8 (normal = 3). What does this mean for risk management?",
    options: ["Fat tails: extreme moves happen far more often than a normal model predicts, so normal-based VaR understates tail risk", "Returns are less risky than normal", "Returns are perfectly predictable", "Volatility is constant"],
    answer: 0,
    explanation: "Use fat-tailed distributions (e.g. Student-t innovations in GARCH), historical simulation or expected shortfall to capture tail risk.",
    optionExplanations: ["Correct.", "The opposite.", "Unrelated.", "Unrelated."]
  },
  {
    id: "fin-volmodels-028", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "concept",
    question: "Why are squared returns often used as a proxy for realised variance when evaluating volatility forecasts, and what's the drawback?",
    options: ["E[r²ₜ] ≈ σ²ₜ when the mean is near zero, so r² is an unbiased but very noisy proxy; intraday-based realised variance (summing squared high-frequency returns) is a much better benchmark", "They are exact", "They are always zero", "They remove the mean"],
    answer: 0,
    explanation: "Noisy proxies can make good volatility forecasts look poor; loss functions robust to proxy noise (MSE, QLIKE) are used.",
    optionExplanations: ["Correct.", "They're noisy.", "Not true.", "Not the reason."]
  },
  {
    id: "fin-volmodels-029", subject: "finance", subtopic: "Volatility Models & Backtesting", difficulty: "medium", type: "concept",
    question: "How do the complexity penalties of AIC, HQIC and BIC compare for a sample of moderate size T?",
    options: ["All three use the same penalty", "AIC (2k) < HQIC (2k·ln ln T) < BIC (k·ln T): AIC favours richer models for prediction, BIC favours parsimonious models, HQIC sits in between", "BIC has the smallest penalty", "HQIC penalises most"],
    answer: 1,
    explanation: "For T = 1,000: ln T = 6.91, 2 ln ln T = 3.87, and AIC uses 2 per parameter. All three are −2 ln L̂ plus a penalty; the lowest value wins.",
    optionExplanations: ["The penalties differ.", "Correct.", "BIC's penalty is the largest for T ≥ 8.", "HQIC is in the middle."]
  }
);
