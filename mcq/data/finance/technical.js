/* Finance — Technical Analysis & Trading Strategies */
window.QUESTIONS.push(
  {
    id: "fin-technical-001", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "easy", type: "concept",
    question: "Which is NOT a core assumption of technical analysis?",
    options: ["The market discounts everything (all information is in the price)", "Prices move in trends", "History tends to repeat because crowd psychology repeats", "A company's intrinsic value from its cash flows determines the right entry point"],
    answer: 3,
    explanation: "Intrinsic value from financial statements is fundamental analysis. Technical analysis studies price, volume and patterns, mainly for short-term timing, and gives no guarantee — false signals are common.",
    optionExplanations: ["That's a TA assumption.", "That's a TA assumption.", "That's a TA assumption.", "Correct: that's fundamental analysis."]
  },
  {
    id: "fin-technical-002", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "easy", type: "numerical",
    question: "A daily candle has Open 100, High 110, Low 95, Close 106. Describe it.",
    options: ["Bullish (close > open); real body 6, upper shadow 4 (110 − 106), lower shadow 5 (100 − 95)", "Bearish; body 6, upper shadow 10, lower shadow 5", "Bullish; body 15", "A doji"],
    answer: 0,
    explanation: "The real body spans open to close (green/white if close > open). Shadows (wicks) show the high and low reached. Unlike line charts, candles show all four OHLC prices.",
    optionExplanations: ["Correct.", "Close > open is bullish.", "15 is the full range (high − low).", "A doji has open ≈ close."]
  },
  {
    id: "fin-technical-003", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "concept",
    question: "What do a doji, a hammer and a bullish engulfing pattern typically signal?",
    options: ["Doji: open ≈ close, indecision; hammer: small body near the top with a long lower shadow after a decline, a possible bullish reversal; bullish engulfing: a large up-candle whose body engulfs the prior down-candle's body, a possible bullish reversal", "All signal strong continuation", "All are bearish", "They signal dividends"],
    answer: 0,
    explanation: "Patterns are more meaningful at support/resistance levels and with volume confirmation; on their own they have weak predictive power.",
    optionExplanations: ["Correct.", "Mostly reversal or indecision signals.", "Mostly bullish here.", "Unrelated."]
  },
  {
    id: "fin-technical-004", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "easy", type: "concept",
    question: "Match the indicators to their families: RSI, MACD, OBV, Bollinger Bands.",
    options: ["All momentum", "RSI: momentum; MACD: trend/momentum; OBV: volume; Bollinger Bands: volatility", "RSI: volume; OBV: trend", "MACD: volatility; Bollinger: volume"],
    answer: 1,
    explanation: "Other examples: stochastic oscillator (momentum), moving averages (trend), accumulation/distribution line (volume), ATR (volatility).",
    optionExplanations: ["Different families.", "Correct.", "Mismatched.", "Mismatched."]
  },
  {
    id: "fin-technical-005", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "concept",
    question: "What is a 'golden cross', and what is a key drawback of moving-average crossover signals?",
    options: ["Price touching a round number", "When a short-term MA (e.g. 50-day) crosses ABOVE a long-term MA (e.g. 200-day), read as a bullish trend shift (the reverse is a 'death cross'); being based on lagging averages, crossovers fire after the move has started and whipsaw in sideways markets", "A gold price signal", "A guaranteed buy signal"],
    answer: 1,
    explanation: "Shorter windows and EMAs reduce lag but increase false signals; there's always a lag-noise trade-off.",
    optionExplanations: ["Not this.", "Correct.", "Not gold-specific.", "Nothing is guaranteed."]
  },
  {
    id: "fin-technical-006", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "numerical",
    question: "Over 14 periods, the average gain is 2.0 and the average loss is 0.5. What is the RSI, and how is it usually read?",
    options: ["RSI = 40; oversold", "RSI = 80; overbought (above 70)", "RSI = 4; meaningless", "RSI = 20; oversold"],
    answer: 1,
    explanation: "RS = avg gain/avg loss = 4. RSI = 100 − 100/(1 + RS) = 100 − 20 = 80. Above 70 is conventionally 'overbought' and below 30 'oversold' — though strong trends can stay overbought for a long time.",
    optionExplanations: ["Wrong formula.", "Correct.", "That's RS, not RSI.", "Inverted."]
  },
  {
    id: "fin-technical-007", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "easy", type: "numerical",
    question: "Over 14 periods the average gain is 1.2 and the average loss is 0.6. What is the RSI?",
    options: ["50.0", "About 66.7", "2.0", "33.3"],
    answer: 1,
    explanation: "RS = 1.2/0.6 = 2; RSI = 100 − 100/3 = 66.7 — bullish momentum, but not yet in the overbought zone.",
    optionExplanations: ["That needs equal gains and losses.", "Correct.", "That's RS.", "Inverted."]
  },
  {
    id: "fin-technical-008", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "concept",
    question: "How is MACD constructed?",
    options: ["A 14-day RSI average", "Upper and lower bands 2 SDs from the mean", "MACD line = 12-period EMA − 26-period EMA; signal line = 9-period EMA of the MACD line; histogram = MACD − signal. Crossovers of MACD and signal, and zero-line crosses, are used as momentum/trend signals", "Cumulative volume"],
    answer: 2,
    explanation: "Divergence (price making new highs while MACD doesn't) is read as weakening momentum.",
    optionExplanations: ["That's RSI.", "That's Bollinger Bands.", "Correct.", "That's OBV."]
  },
  {
    id: "fin-technical-009", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "numerical",
    question: "The 20-day SMA is 100 and the 20-day standard deviation of closes is 2.5. Where are the standard Bollinger Bands?",
    options: ["95 and 105", "97.5 and 102.5", "90 and 110", "100 and 105"],
    answer: 0,
    explanation: "Bands = SMA ± 2 × SD = 100 ± 5. Bands widen when volatility rises and narrow in quiet markets (a 'squeeze' often precedes a breakout).",
    optionExplanations: ["Correct.", "That's ±1 SD.", "That's ±4 SD.", "Only one band is correct."]
  },
  {
    id: "fin-technical-010", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "hard", type: "numerical",
    question: "Yesterday's close was 98. Today's high is 105 and low is 101 (a gap up). What is today's true range, used in ATR?",
    options: ["4", "3", "7", "6"],
    answer: 2,
    explanation: "TR = max(H − L, |H − C_prev|, |L − C_prev|) = max(4, 7, 3) = 7. True range captures gaps that the high-low range misses; ATR is a moving average of TR, often used to set stop distances.",
    optionExplanations: ["That's only high − low.", "That's |L − C_prev|.", "Correct.", "Wrong."]
  },
  {
    id: "fin-technical-011", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "numerical",
    question: "On-Balance Volume starts at 0. Day 1 closes up on 1,000 shares; day 2 closes down on 600; day 3 closes up on 800. What is OBV, and what is it used for?",
    options: ["1,200; confirming whether volume supports the price trend", "2,400; measuring volatility", "−400; trend direction", "800; momentum"],
    answer: 0,
    explanation: "OBV adds volume on up-days and subtracts it on down-days: 1,000 − 600 + 800 = 1,200. Rising prices with falling OBV suggest a weak, poorly supported rally.",
    optionExplanations: ["Correct.", "That adds all volume.", "Wrong signs.", "Only the last day."]
  },
  {
    id: "fin-technical-012", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "easy", type: "concept",
    question: "What are support and resistance levels?",
    options: ["Government price limits", "The day's high and low only", "Price zones where buying interest has repeatedly stopped declines (support) or selling has capped rallies (resistance); a decisive break on high volume (a breakout) is often taken as a signal, and broken resistance can become support", "Analyst price targets"],
    answer: 2,
    explanation: "They reflect clustered orders and market memory (e.g. traders who bought at a level wanting to break even).",
    optionExplanations: ["Not regulatory.", "Not just one day.", "Correct.", "Not targets."]
  },
  {
    id: "fin-technical-013", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "concept",
    question: "How do trend-following/momentum strategies differ from mean-reversion strategies?",
    options: ["They're the same", "Mean reversion buys breakouts", "Momentum bets that recent winners keep winning (buy strength); mean reversion bets that extreme moves reverse toward an average (buy weakness, e.g. oversold RSI). Momentum suits trending markets; mean reversion suits range-bound markets", "Momentum only works with bonds"],
    answer: 2,
    explanation: "Breakout trading is a form of trend following. Choosing the wrong style for the market regime is a common failure.",
    optionExplanations: ["Opposite philosophies.", "That's momentum.", "Correct.", "It's found across asset classes."]
  },
  {
    id: "fin-technical-014", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "concept",
    question: "A trader confirms signals using RSI AND the stochastic oscillator. Why is this a weak combination?",
    options: ["It isn't; more indicators are always better", "RSI is a volume indicator", "Stochastics only work on bonds", "Both are momentum oscillators built from similar price data, so they agree for the same reasons (redundancy); better to combine different families, e.g. a trend filter (MA), momentum (RSI) and volume confirmation"],
    answer: 3,
    explanation: "Too many indicators produce clutter and conflicting signals; a few complementary ones help reduce false entries.",
    optionExplanations: ["Redundancy adds no information.", "It's momentum.", "Not true.", "Correct."]
  },
  {
    id: "fin-technical-015", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "numerical",
    question: "You buy at ₹100 with a stop-loss at ₹95 and a target of ₹115. What's the risk-reward ratio, and what win rate do you need to break even?",
    options: ["1:1; 50%", "1:3; 33%", "3:1; 75%", "1:3; 25%"],
    answer: 3,
    explanation: "Risk = 5, reward = 15 → 1:3. Break-even win rate = risk/(risk + reward) = 5/20 = 25% (before costs). Good risk-reward lets a strategy be profitable with a modest hit rate.",
    optionExplanations: ["Wrong ratio.", "Wrong break-even.", "Reversed.", "Correct."]
  },
  {
    id: "fin-technical-016", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "numerical",
    question: "With ₹10 lakh capital you risk 1% per trade. Your stop is ₹5 below entry. How many shares should you buy?",
    options: ["200", "1,000", "20,000", "2,000"],
    answer: 3,
    explanation: "Risk per trade = 1% × 10,00,000 = ₹10,000. Shares = 10,000/5 = 2,000. Fixed-fractional position sizing keeps any single loss small, so a string of losses can't wipe out the account.",
    optionExplanations: ["Wrong arithmetic.", "Risks 0.5%.", "Risks 10%.", "Correct."]
  },
  {
    id: "fin-technical-017", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "hard", type: "numerical",
    question: "A strategy wins 40% of trades with an average win of 3R and loses 60% of trades at 1R (R = amount risked). What is its expectancy per trade?",
    options: ["−0.2R", "+1.8R", "+1.2R", "+0.6R"],
    answer: 3,
    explanation: "Expectancy = 0.4 × 3R − 0.6 × 1R = 1.2R − 0.6R = +0.6R per trade. A low win rate can still be profitable with good payoffs — but costs and slippage must be subtracted.",
    optionExplanations: ["Wrong arithmetic.", "Wrong arithmetic.", "Ignores losses.", "Correct."]
  },
  {
    id: "fin-technical-018", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "easy", type: "concept",
    question: "What is backtesting, and what is its main limitation?",
    options: ["Live trading with real money", "Testing indicators on random numbers only", "A tax audit", "Testing a strategy on historical data to measure profitability, risk and weaknesses; but past performance doesn't guarantee future results, and backtests are vulnerable to overfitting, look-ahead and survivorship bias, and ignored costs"],
    answer: 3,
    explanation: "Robust practice: out-of-sample and walk-forward testing, realistic costs, then paper trading before committing capital.",
    optionExplanations: ["That's live trading.", "Not the definition.", "Unrelated.", "Correct."]
  },
  {
    id: "fin-technical-019", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "concept",
    question: "What does the weak-form efficient market hypothesis imply about technical analysis, and how do practitioners respond?",
    options: ["It proves TA always works", "It says nothing about TA", "If prices already reflect all past price information, chart patterns can't systematically earn risk-adjusted excess returns; practitioners point to documented anomalies (momentum, trends driven by behavioural biases) but must beat costs and data-snooping risk", "It implies prices are fixed"],
    answer: 2,
    explanation: "The empirical evidence is mixed: some effects like time-series momentum persist, while many published patterns vanish after costs or out of sample.",
    optionExplanations: ["The opposite.", "It's directly relevant.", "Correct.", "Prices change."]
  },
  {
    id: "fin-technical-020", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "hard", type: "concept",
    question: "A trader using a 20-day breakout system notices many false breakouts in a choppy, range-bound market. Which adjustment is most sensible?",
    options: ["Add a regime/trend filter (e.g. only trade breakouts when ADX or a long MA confirms a trend) or require volume confirmation, and test the change out of sample", "Add more momentum oscillators", "Remove stop losses", "Double position size to recover losses"],
    answer: 0,
    explanation: "Breakout systems suffer whipsaws in ranges. Filters reduce trades but improve quality. Removing stops or increasing size after losses increases ruin risk.",
    optionExplanations: ["Correct.", "Redundant signals.", "Increases tail risk.", "Martingale-style sizing is dangerous."]
  },
  {
    id: "fin-technical-021", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "concept",
    question: "Why is the closing price often considered the most important price in technical analysis?",
    options: ["It reflects the final consensus after the full session, is used for settlement and most indicators (moving averages, RSI, MACD), and shows whether buyers or sellers controlled the end of the day", "It's always the day's high", "It's set by regulators", "It's never used"],
    answer: 0,
    explanation: "The close relative to the open (candle colour) and to the range (where it closed) carry sentiment information.",
    optionExplanations: ["Correct.", "Not necessarily.", "Set by trading.", "Used widely."]
  },
  {
    id: "fin-technical-022", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "hard", type: "concept",
    question: "A strategy shows a 90% win rate in backtests but makes tiny gains and occasionally loses 20× its average win. What should concern you most?",
    options: ["Nothing; 90% is excellent", "The win rate is too low", "Negative skew (a 'picking up pennies in front of a steamroller' profile, like selling OTM options): expectancy may be negative once rare large losses are counted, and a short backtest may not include enough tail events", "It trades too infrequently"],
    answer: 2,
    explanation: "Check expectancy: 0.9 × 1 − 0.1 × 20 = −1.1 per trade. Judge strategies by expectancy, drawdowns and tail risk, not hit rate.",
    optionExplanations: ["Win rate alone misleads.", "It's high, not low.", "Correct.", "Not the main issue."]
  },
  {
    id: "fin-technical-023", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "easy", type: "concept",
    question: "Which tools are core to trading risk management?",
    options: ["Ignoring losses until they recover", "Stop losses, position sizing, risk-reward targets, and limits on total exposure and drawdown", "Using maximum leverage", "Averaging down on every losing trade"],
    answer: 1,
    explanation: "Even good strategies fail without risk management; survival comes first.",
    optionExplanations: ["That compounds losses.", "Correct.", "Increases ruin risk.", "Can magnify losses."]
  },
  {
    id: "fin-technical-024", subject: "finance", subtopic: "Technical Analysis & Trading Strategies", difficulty: "medium", type: "concept",
    question: "Price makes a new high but RSI makes a lower high. What is this called, and how is it interpreted?",
    options: ["Convergence; strong continuation", "Bearish divergence: momentum is weakening even as price rises, a warning of possible reversal (not a timing signal by itself)", "Golden cross", "Bullish engulfing"],
    answer: 1,
    explanation: "Bullish divergence is the mirror image (price makes a lower low while the oscillator makes a higher low). Divergences can persist, so traders wait for confirmation.",
    optionExplanations: ["The opposite.", "Correct.", "That's an MA crossover.", "That's a candle pattern."]
  }
);
