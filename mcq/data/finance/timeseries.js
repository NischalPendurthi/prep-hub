/* Finance — Time Series: Stationarity & Forecasting */
window.QUESTIONS.push(
  {
    id: "fin-timeseries-001", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "easy", type: "concept",
    question: "What distinguishes time-series data from ordinary tabular data?",
    options: ["It always has more rows", "It can't be plotted", "It contains only prices", "Observations are ordered in time and the order carries information: past values relate to future values, so rows can't be treated as independent or shuffled"],
    answer: 3,
    explanation: "Prices, returns, rates, volumes and macro data are all time series. Their temporal dependence is both the signal to model and the reason standard random cross-validation is invalid.",
    optionExplanations: ["Size isn't the point.", "They're usually plotted against time.", "Any variable measured over time counts.", "Correct."]
  },
  {
    id: "fin-timeseries-002", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "concept",
    question: "How does a deterministic trend differ from a stochastic trend, and how is each removed?",
    options: ["A deterministic trend follows a fixed function of time (e.g. β₀ + β₁t) and shocks are temporary: remove it by detrending (regress on time and keep residuals). A stochastic trend (random walk) accumulates shocks permanently: remove it by differencing", "They're the same", "Stochastic trends are removed by detrending", "Deterministic trends can't be removed"],
    answer: 0,
    explanation: "Applying the wrong fix causes problems: detrending a random walk leaves a non-stationary residual, and differencing a trend-stationary series over-differences it. Stock prices behave like stochastic trends.",
    optionExplanations: ["Correct.", "They behave differently.", "Random walks need differencing.", "Detrending removes them."]
  },
  {
    id: "fin-timeseries-003", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "easy", type: "concept",
    question: "What's the difference between seasonality and cyclical behaviour?",
    options: ["None", "Seasonality only occurs in weather data", "Cycles have a fixed period of exactly one year", "Seasonality repeats at fixed, known intervals (e.g. every December, every Monday); cycles are rises and falls of variable, unpredictable length, usually over several years (business cycles)"],
    answer: 3,
    explanation: "You can mark seasonal peaks on a calendar; you can't predict the exact timing or length of the next recession.",
    optionExplanations: ["They differ in regularity.", "Retail sales, electricity demand and intraday volume are seasonal.", "That describes seasonality.", "Correct."]
  },
  {
    id: "fin-timeseries-004", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "concept",
    question: "What are the conditions for (weak) white noise εₜ, and how does it differ from IID and Gaussian white noise?",
    options: ["Weak white noise: zero mean, constant variance, zero autocovariance at all non-zero lags (non-linear dependence may remain). IID white noise adds full independence; Gaussian white noise is IID and normal", "Any random series is white noise", "White noise must trend upward", "White noise has autocorrelation 1"],
    answer: 0,
    explanation: "Example: GARCH shocks are uncorrelated (weak white noise) yet their squares are autocorrelated, so they aren't IID. Residuals of a good model should look like white noise.",
    optionExplanations: ["Correct.", "Specific conditions apply.", "Mean is zero.", "Autocorrelation is zero."]
  },
  {
    id: "fin-timeseries-005", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "numerical",
    question: "A price follows a random walk without drift, Pₜ = Pₜ₋₁ + εₜ, with daily shock SD of $2 and P₀ = $100. What are the expected price and its standard deviation after 25 days?",
    options: ["$100 and $2", "$150 and $10", "$100 and $10", "$100 and $50"],
    answer: 2,
    explanation: "E[Pₜ] = P₀ = $100. Var(Pₜ) = tσ² = 25 × 4 = 100 → SD = $10. Uncertainty grows with √t without bound, which is why random walks are non-stationary.",
    optionExplanations: ["The variance accumulates.", "There's no drift.", "Correct.", "That scales the SD by t instead of √t."]
  },
  {
    id: "fin-timeseries-006", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "easy", type: "numerical",
    question: "A random walk with drift has Pₜ = μ + Pₜ₋₁ + εₜ, with μ = 0.5 and P₀ = 100. What is E[P₁₀]?",
    options: ["100", "100.5", "110", "105"],
    answer: 3,
    explanation: "E[Pₜ] = P₀ + μt = 100 + 0.5 × 10 = 105. The variance tσ² grows as without drift.",
    optionExplanations: ["That ignores drift.", "That's one period of drift.", "Drift is 0.5 per period.", "Correct."]
  },
  {
    id: "fin-timeseries-007", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "concept",
    question: "How does the random walk model of prices relate to the Efficient Market Hypothesis?",
    options: ["It contradicts it", "It proves technical analysis works", "If prices already reflect all available information, they only move on new, unpredictable news; price changes then behave like white-noise shocks, so past prices can't predict future returns", "It means prices never change"],
    answer: 2,
    explanation: "This is the weak-form EMH. Empirically, returns show little linear autocorrelation, though volatility is predictable (clustering).",
    optionExplanations: ["They're consistent.", "It implies the opposite.", "Correct.", "Prices change with news."]
  },
  {
    id: "fin-timeseries-008", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "numerical",
    question: "A stock goes from $100 to $110 and then back down to $99. What are the two simple returns and the total log return?",
    options: ["+10%, −10%; total log return 0%", "+10%, −10%; total log return ≈ −1.005%", "+10%, −9%; total log return −1%", "+9.53%, −10.54%; total log return ≈ −2%"],
    answer: 1,
    explanation: "Simple: 110/100 − 1 = +10%; 99/110 − 1 = −10%. Log returns add over time: ln(110/100) + ln(99/110) = ln(99/100) = −1.005%. Simple returns don't add (+10% − 10% ≠ −1%) but they do aggregate across assets in a portfolio.",
    optionExplanations: ["Simple returns don't add over time.", "Correct.", "The second return is −10%.", "The log returns are +9.53% and −10.54%, which sum to −1.005%."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-timeseries-009", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "easy", type: "concept",
    question: "Why do analysts usually model returns rather than prices?",
    options: ["Returns are always positive", "Prices aren't available", "Prices are scale-dependent and non-stationary (wandering mean, growing variance), while returns are roughly stationary with a stable mean and variance, so statistical models apply", "Returns are normally distributed by definition"],
    answer: 2,
    explanation: "Converting prices to returns is a form of differencing (log returns = Δ ln P).",
    optionExplanations: ["Returns can be negative.", "Prices are available.", "Correct.", "Returns have fat tails."]
  },
  {
    id: "fin-timeseries-010", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "concept",
    question: "When should you use multiplicative rather than additive decomposition?",
    options: ["When the seasonal swings stay the same size regardless of the level", "Always", "When the seasonal swings (and noise) grow in proportion to the trend level, e.g. sales growing 10% per year with a fixed percentage December spike", "When there is no trend"],
    answer: 2,
    explanation: "Additive: Y = T + S + C + R (constant amplitude). Multiplicative: Y = T × S × C × R (proportional amplitude). Taking logs turns multiplicative into additive.",
    optionExplanations: ["That calls for additive.", "It depends on the data.", "Correct.", "The choice depends on amplitude, not trend existence."]
  },
  {
    id: "fin-timeseries-011", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "concept",
    question: "What does weak (second-order, covariance) stationarity require?",
    options: ["The entire distribution is unchanged by time shifts", "Zero autocorrelation", "Only a constant mean", "Constant mean, constant finite variance, and autocovariance that depends only on the lag k, not on time t"],
    answer: 3,
    explanation: "Strict stationarity requires the full joint distribution to be time-invariant — rarely verifiable. Weak stationarity is the practical standard for ARMA modelling.",
    optionExplanations: ["That's strict stationarity.", "That's white noise, a special case.", "That's only first-order stationarity.", "Correct."]
  },
  {
    id: "fin-timeseries-012", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "hard", type: "concept",
    question: "What are the null hypotheses of the ADF and KPSS tests, and what does it mean if ADF rejects its null while KPSS does not reject?",
    options: ["Both test the null of stationarity", "ADF's null is a unit root (non-stationary); KPSS's null is stationarity. ADF rejecting and KPSS not rejecting both point to a stationary series", "ADF's null is stationarity; KPSS's null is a unit root", "The series must be differenced twice"],
    answer: 1,
    explanation: "Because the nulls are opposite, using both guards against low test power. If ADF fails to reject and KPSS rejects, both point to a unit root → difference the series. Conflicting results suggest trend- or difference-stationarity and need further investigation.",
    optionExplanations: ["Their nulls are opposite.", "Correct.", "Reversed.", "Both tests indicate stationarity."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-timeseries-013", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "concept",
    question: "A series grows exponentially and its fluctuations widen as it grows. What's the usual order of transformations to make it stationary?",
    options: ["Difference first, then take logs", "Take logs (or Box-Cox) first to stabilise the variance, then difference to remove the trend", "Only detrend linearly", "Square the series"],
    answer: 1,
    explanation: "Log transforms flatten exponential growth and proportional variance; differencing log values then gives approximate growth rates (log returns). Differencing first leaves heteroscedasticity, and logs can't be taken of negative differences.",
    optionExplanations: ["Differences can be negative, so logs fail.", "Correct.", "Doesn't fix the variance.", "Makes it worse."]
  },
  {
    id: "fin-timeseries-014", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "concept",
    question: "In the Box-Cox transformation Y = (X^λ − 1)/λ (and ln X when λ = 0), which λ corresponds to a log transform, and which to (essentially) no transformation?",
    options: ["λ = 1 is log; λ = 0 is none", "λ = −1 is log; λ = 0 is none", "λ = 0.5 is log; λ = 2 is none", "λ = 0 is log; λ = 1 is none (just a shift by −1)"],
    answer: 3,
    explanation: "λ = 0 → ln X; λ = 0.5 → a scaled square root; λ = 1 → X − 1, the original shape. λ is often chosen to make the variance most stable.",
    optionExplanations: ["Reversed.", "λ = −1 is a reciprocal.", "λ = 0.5 is a square root.", "Correct."]
  },
  {
    id: "fin-timeseries-015", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "hard", type: "numerical",
    question: "You difference a series that is ALREADY white noise (variance σ²). What are the variance and lag-1 autocorrelation of the differenced series?",
    options: ["2σ² and −0.5", "σ² and 0", "σ² and −1", "2σ² and 0"],
    answer: 0,
    explanation: "Δεₜ = εₜ − εₜ₋₁: Var = σ² + σ² = 2σ². Cov(Δεₜ, Δεₜ₋₁) = −σ², so ρ₁ = −σ²/2σ² = −0.5. Over-differencing inflates variance and creates an artificial MA(1) structure; stop differencing once tests show stationarity.",
    optionExplanations: ["Correct.", "Differencing changes both.", "The correlation is −0.5.", "The lag-1 autocorrelation is negative."]
  },
  {
    id: "fin-timeseries-016", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "easy", type: "concept",
    question: "Monthly retail sales have a strong yearly pattern. Which transformation removes it?",
    options: ["Seasonal differencing Yₜ − Yₜ₋₁₂", "First differencing Yₜ − Yₜ₋₁", "Taking logs", "A 3-month moving average"],
    answer: 0,
    explanation: "Seasonal differencing compares each month with the same month last year (m = 12). It may be combined with a first difference if a trend remains.",
    optionExplanations: ["Correct.", "That removes a trend, not yearly seasonality.", "Logs stabilise variance.", "A 3-month window doesn't span the yearly cycle."]
  },
  {
    id: "fin-timeseries-017", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "concept",
    question: "In ARIMA(p, d, q), what do p, d and q stand for?",
    options: ["Price, demand, quantity", "p = MA order, d = differences, q = AR order", "p = period, d = drift, q = quantile", "p = number of autoregressive lags of the series, d = number of differences needed for stationarity, q = number of lagged forecast errors (moving-average terms)"],
    answer: 3,
    explanation: "ARIMA(1,1,0) is an AR(1) on first differences; ARIMA(0,1,0) is a random walk. In backshift notation: (1 − φ₁B − … − φₚBᵖ)(1 − B)ᵈ yₜ = c + (1 + θ₁B + … + θ_qB^q)εₜ.",
    optionExplanations: ["Not the meaning.", "p and q are swapped.", "Not the meaning.", "Correct."]
  },
  {
    id: "fin-timeseries-018", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "hard", type: "numerical",
    question: "An AR(1) model is yₜ = 2 + 0.6yₜ₋₁ + εₜ with Var(εₜ) = 1. What are its long-run mean and variance, and is it stationary?",
    options: ["Mean 2, variance 1; stationary", "Mean 5, variance 1.5625; stationary because |φ| < 1", "Mean 5, variance 2.5; non-stationary", "Mean 3.33, variance 1.5625; stationary"],
    answer: 1,
    explanation: "Mean μ = c/(1 − φ) = 2/0.4 = 5. Variance σ²/(1 − φ²) = 1/0.64 = 1.5625. |φ| < 1 is the stationarity condition; φ = 1 would make it a random walk (unit root).",
    optionExplanations: ["That uses c as the mean.", "Correct.", "|0.6| < 1, so it's stationary; the variance uses 1 − φ².", "Wrong mean."]
  },
  {
    id: "fin-timeseries-019", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "numerical",
    question: "For the AR(1) model yₜ = 2 + 0.6yₜ₋₁ + εₜ, the latest value is y = 10. What are the 1-step and 2-step-ahead forecasts?",
    options: ["10 and 10", "8 and 6.8", "6 and 3.6", "8 and 8"],
    answer: 1,
    explanation: "ŷ₁ = 2 + 0.6 × 10 = 8. ŷ₂ = 2 + 0.6 × 8 = 6.8. Forecasts decay geometrically towards the mean of 5 — mean reversion.",
    optionExplanations: ["That's a naive (random-walk) forecast.", "Correct.", "That ignores the constant.", "The 2-step forecast continues to revert."]
  },
  {
    id: "fin-timeseries-020", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "hard", type: "concept",
    question: "How do the ACF and PACF help identify ARMA orders?",
    options: ["They don't", "AR(p) has an ACF that cuts off at lag p", "An AR(p) has a PACF that cuts off after lag p and an ACF that decays gradually; an MA(q) has an ACF that cuts off after lag q and a PACF that decays; ARMA shows decay in both", "Both always cut off at lag 1"],
    answer: 2,
    explanation: "For AR(1) with φ = 0.6, the ACF is 0.6, 0.36, 0.216, …; for MA(1) with θ = 0.5, ρ₁ = θ/(1 + θ²) = 0.4 and ρₖ = 0 for k > 1. Information criteria then refine the choice.",
    optionExplanations: ["They are the classic identification tool.", "That's the PACF for AR.", "Correct.", "Depends on the model."]
  },
  {
    id: "fin-timeseries-021", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "numerical",
    question: "What is the lag-1 autocorrelation of an MA(1) process yₜ = εₜ + 0.5εₜ₋₁, and what is its lag-2 autocorrelation?",
    options: ["0.5 and 0.25", "0.4 and 0", "0.5 and 0", "0.4 and 0.16"],
    answer: 1,
    explanation: "ρ₁ = θ/(1 + θ²) = 0.5/1.25 = 0.4. Values two or more periods apart share no shocks, so ρₖ = 0 for k ≥ 2: the ACF cuts off after lag q = 1.",
    optionExplanations: ["That's AR(1)-style decay.", "Correct.", "ρ₁ isn't θ itself.", "MA autocorrelations cut off."]
  },
  {
    id: "fin-timeseries-022", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "concept",
    question: "In SARIMA(1,1,1)(0,1,1)₁₂ for monthly data, what does the second bracket represent?",
    options: ["A second, unrelated model", "The forecast horizon", "Confidence intervals", "Seasonal orders: P = 0 seasonal AR terms, D = 1 seasonal difference (Yₜ − Yₜ₋₁₂), Q = 1 seasonal MA term at lag 12, with season length s = 12"],
    answer: 3,
    explanation: "SARIMA(p,d,q)(P,D,Q)ₛ adds seasonal AR/differencing/MA at multiples of the season length. This particular form resembles the classic 'airline model'.",
    optionExplanations: ["It's part of one model.", "Not the horizon.", "Not intervals.", "Correct."]
  },
  {
    id: "fin-timeseries-023", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "easy", type: "numerical",
    question: "Closing prices over 5 days are 10, 11, 12, 13, 14. What is the 3-day simple moving average on the last day?",
    options: ["13", "12", "14", "13.33"],
    answer: 0,
    explanation: "SMA = (12 + 13 + 14)/3 = 13. Equal weights; it lags a trending price (here by about 1 day) and can't be computed for the first n − 1 days.",
    optionExplanations: ["Correct.", "That's the 5-day SMA.", "That's the last price.", "That's the 3-day linearly weighted average."]
  },
  {
    id: "fin-timeseries-024", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "numerical",
    question: "Using weights 1, 2, 3 (oldest to newest), what is the 3-day weighted moving average of prices 12, 13, 14?",
    options: ["13.33", "13.00", "13.67", "14.00"],
    answer: 0,
    explanation: "WMA = (1×12 + 2×13 + 3×14)/(1 + 2 + 3) = 80/6 = 13.33. The denominator is n(n + 1)/2 = 6. Weighting recent prices more makes it track price more closely than the SMA (13).",
    optionExplanations: ["Correct.", "That's the SMA.", "Wrong arithmetic.", "That's the last price."]
  },
  {
    id: "fin-timeseries-025", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "numerical",
    question: "A 9-period EMA uses α = 2/(n + 1). Yesterday's EMA was 50 and today's price is 55. What is today's EMA?",
    options: ["52.5", "55.0", "51.0", "50.5"],
    answer: 2,
    explanation: "α = 2/10 = 0.2. EMA = 0.2 × 55 + 0.8 × 50 = 11 + 40 = 51. The EMA never fully drops old data; weights decay geometrically.",
    optionExplanations: ["That uses α = 0.5.", "That's the price.", "Correct.", "That uses α = 0.1."]
  },
  {
    id: "fin-timeseries-026", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "numerical",
    question: "Simple exponential smoothing with α = 0.3: the previous level is 100 and the new observation is 110. What is the new level, and what is the forecast for 5 periods ahead?",
    options: ["103 and 103", "107 and 135", "103 and 118", "110 and 110"],
    answer: 0,
    explanation: "lₜ = αyₜ + (1 − α)lₜ₋₁ = 0.3 × 110 + 0.7 × 100 = 103. SES forecasts are flat at every horizon (ŷₜ₊ₕ = lₜ) because it models no trend or seasonality.",
    optionExplanations: ["Correct.", "That uses α = 0.7 and adds a trend.", "SES has no trend.", "That's a naive forecast."]
  },
  {
    id: "fin-timeseries-027", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "hard", type: "numerical",
    question: "Holt's linear method has current level lₜ = 100 and trend bₜ = 2. What is the 3-step forecast, and what is it with a damped trend, φ = 0.9?",
    options: ["106 and about 104.88", "106 and 106", "102 and 101.8", "104.88 and 106"],
    answer: 0,
    explanation: "Holt: ŷₜ₊ₕ = lₜ + h·bₜ = 100 + 6 = 106. Damped: lₜ + (φ + φ² + φ³)bₜ = 100 + (0.9 + 0.81 + 0.729) × 2 = 104.878. Damping flattens long-horizon forecasts to avoid unrealistic extrapolation.",
    optionExplanations: ["Correct.", "Damping reduces the trend contribution.", "That's a 1-step forecast.", "Swapped."]
  },
  {
    id: "fin-timeseries-028", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "easy", type: "concept",
    question: "Which exponential-smoothing method handles level, trend AND seasonality?",
    options: ["Simple exponential smoothing", "Holt's linear method", "Holt-Winters (triple exponential smoothing)", "A simple moving average"],
    answer: 2,
    explanation: "SES models level only; Holt adds trend (β); Holt-Winters adds a seasonal component (γ, period m), in additive or multiplicative form.",
    optionExplanations: ["Level only.", "Level and trend only.", "Correct.", "Not a seasonal model."]
  },
  {
    id: "fin-timeseries-029", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "easy", type: "concept",
    question: "Why must time-series data NOT be randomly shuffled into train and test sets?",
    options: ["Shuffling is too slow", "It's fine for prices but not returns", "Shuffling deletes data", "It breaks the time ordering and leaks future information into training, giving unrealistically good scores that fail in live use; split chronologically (train on the past, test on later data)"],
    answer: 3,
    explanation: "Use a fixed chronological split or walk-forward/rolling evaluation, mirroring live trading where only past data is available.",
    optionExplanations: ["Speed isn't the issue.", "Neither should be shuffled.", "No data is lost.", "Correct."]
  },
  {
    id: "fin-timeseries-030", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "numerical",
    question: "Actuals are 100, 200, 300 and forecasts are 110, 190, 330. What are the MAE, RMSE and MAPE?",
    options: ["MAE 16.67, RMSE 19.15, MAPE 8.33%", "MAE 10, RMSE 10, MAPE 10%", "MAE 16.67, RMSE 16.67, MAPE 8.33%", "MAE 50, RMSE 33.17, MAPE 25%"],
    answer: 0,
    explanation: "Errors: −10, +10, −30. MAE = 50/3 = 16.67. RMSE = √((100 + 100 + 900)/3) = √366.7 = 19.15 — larger than MAE because squaring penalises the big miss. MAPE = (10% + 5% + 10%)/3 = 8.33%.",
    optionExplanations: ["Correct.", "Wrong arithmetic.", "RMSE exceeds MAE when errors differ in size.", "Those are sums, not averages."]
  },
  {
    id: "fin-timeseries-031", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "concept",
    question: "Why is MAPE unsuitable for a series of daily returns, and why compare models against naive baselines?",
    options: ["MAPE is fine for returns", "MAPE penalises large errors too much", "MAPE divides by the actual value, which is often near or exactly zero for returns, making it explode or be undefined. Naive baselines (last value, or same season last cycle) reveal whether a complex model adds anything beyond a random walk", "Baselines are always best"],
    answer: 2,
    explanation: "For a random-walk price, the naive forecast is optimal; a model that can't beat it is fitting noise. Use MAE/RMSE (or sMAPE/MASE) for near-zero series.",
    optionExplanations: ["Division by near-zero values breaks it.", "That describes RMSE.", "Correct.", "They are a bar to clear, not a winner by default."]
  },
  {
    id: "fin-timeseries-032", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "medium", type: "concept",
    question: "What advantages does STL decomposition have over classical decomposition, and what is the Hodrick-Prescott filter used for?",
    options: ["STL is less flexible", "STL (Seasonal-Trend using LOESS) is robust to outliers and lets the seasonal pattern evolve over time (MSTL handles several seasonalities). The HP filter separates a smooth long-run trend from the cycle, controlled by λ, e.g. for potential GDP and output gaps", "The HP filter forecasts prices", "They are the same method"],
    answer: 1,
    explanation: "A larger HP λ gives a smoother trend (λ = 1600 is the convention for quarterly data). Note the HP filter is two-sided, so it uses future data — beware look-ahead bias if used in trading signals.",
    optionExplanations: ["It's more flexible.", "Correct.", "It's a smoothing/decomposition tool.", "They differ."]
  },
  {
    id: "fin-timeseries-033", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "hard", type: "numerical",
    question: "For a stationary AR(1) process, what is the autocorrelation at lag 3 when φ = 0.6, and when φ = −0.6?",
    options: ["0.216 and 0.216", "0.216 and −0.216", "0.6 and −0.6", "0 and 0"],
    answer: 1,
    explanation: "AR(1) autocorrelations are ρₖ = φᵏ. φ = 0.6: 0.6³ = 0.216. φ = −0.6: (−0.6)³ = −0.216 — with negative φ the ACF alternates in sign (overshooting mean reversion), still decaying geometrically.",
    optionExplanations: ["An odd power keeps the negative sign.", "Correct.", "Those are lag-1 values.", "AR autocorrelations decay; they don't cut off."]
  },
  {
    id: "fin-timeseries-034", subject: "finance", subtopic: "Time Series: Stationarity & Forecasting", difficulty: "hard", type: "numerical",
    question: "An additive Holt-Winters model for monthly data has level lₜ = 200, trend bₜ = 5, and the seasonal index for the month being forecast is −10. What is the 2-step-ahead forecast?",
    options: ["190", "200", "210", "220"],
    answer: 1,
    explanation: "Additive Holt-Winters: ŷₜ₊ₕ = lₜ + h·bₜ + s(for that month) = 200 + 2 × 5 − 10 = 200. In the multiplicative form the seasonal factor would multiply (lₜ + h·bₜ) instead.",
    optionExplanations: ["That ignores the trend.", "Correct.", "That ignores seasonality.", "That treats the seasonal index as +10 instead of −10."]
  }
);
