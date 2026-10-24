/* Finance — Options: Payoffs, Bounds & Strategies */
window.QUESTIONS.push(
  {
    id: "fin-options-001", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "easy", type: "concept",
    question: "What fundamentally distinguishes an option from a forward or futures contract?",
    options: ["An option gives the buyer a RIGHT, not an obligation, so the payoff is asymmetric (kinked); the buyer pays a premium for this, while forwards/futures oblige both sides and have linear payoffs", "Options have no expiry", "Options are always cheaper", "Options can't be traded on exchanges"],
    answer: 0,
    explanation: "Because the payoff depends on the whole distribution of future prices, volatility becomes a key pricing input. Buying any option is long volatility; selling is short volatility.",
    optionExplanations: ["Correct.", "They have expiries.", "Not necessarily.", "Many are exchange-traded."]
  },
  {
    id: "fin-options-002", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "easy", type: "concept",
    question: "Which position has unlimited potential loss?",
    options: ["Long call", "Long put", "Short (naked) call", "Short put"],
    answer: 2,
    explanation: "A short call loses max(S_T − K, 0) − premium, unbounded as the price rises. A short put's loss is capped at K − premium (the price can only fall to 0). Long options risk only the premium.",
    optionExplanations: ["Max loss is the premium.", "Max loss is the premium.", "Correct.", "Max loss is K − premium."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-options-003", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "numerical",
    question: "You buy a 1-year call with K = $100 for a $5 premium (r = 5%, continuous). Allowing for the time value of the premium, what is the break-even price, and what is the profit if S_T = $110?",
    options: ["$105 and $5", "$110 and $0", "$100 and $10", "About $105.26 and about $4.74"],
    answer: 3,
    explanation: "Profit = payoff − premium × e^(rT). The premium's future value is 5e^0.05 = 5.26, so break-even = 100 + 5.26 = $105.26. At S_T = 110: payoff 10, profit 10 − 5.26 = $4.74. Payoff ignores the premium; profit doesn't.",
    optionExplanations: ["That ignores the financing cost of the premium.", "Wrong.", "That's the payoff, not the profit.", "Correct."]
  },
  {
    id: "fin-options-004", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "easy", type: "numerical",
    question: "A stock is at ₹110. A call with strike ₹100 trades at ₹15. What are its intrinsic value and time value? Is the matching ₹100 put in or out of the money?",
    options: ["Intrinsic ₹15, time value ₹0; put ITM", "Intrinsic ₹5, time value ₹10; put ATM", "Intrinsic ₹10, time value ₹5; the put is OTM", "Intrinsic ₹0, time value ₹15; put ITM"],
    answer: 2,
    explanation: "Call intrinsic = max(110 − 100, 0) = 10; time value = premium − intrinsic = 5. The put's intrinsic value is max(100 − 110, 0) = 0 → OTM. Time value is highest at the money and decays to zero at expiry.",
    optionExplanations: ["Time value isn't zero before expiry.", "Swapped.", "Correct.", "The call is in the money."]
  },
  {
    id: "fin-options-005", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "concept",
    question: "How does an INCREASE in each factor affect a European call on a non-dividend stock: stock price, strike, volatility, risk-free rate?",
    options: ["Stock price ↑ → call ↑; strike ↑ → call ↓; volatility ↑ → call ↑; rate ↑ → call ↑", "Up, up, down, down", "All increase the call value", "Stock price ↑ → call ↓; others ↑"],
    answer: 0,
    explanation: "Higher rates lower the PV of the strike paid later, helping calls and hurting puts. Volatility raises BOTH call and put values because the payoff is asymmetric. Dividends lower calls and raise puts. Time to expiry raises American options; for European options it's usually positive but ambiguous with dividends.",
    optionExplanations: ["Correct.", "Wrong directions.", "A higher strike lowers call value.", "A higher stock price raises call value."]
  },
  {
    id: "fin-options-006", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "easy", type: "concept",
    question: "How do American and European options differ?",
    options: ["American options can be exercised at any time up to expiry; European options only at expiry. So American ≥ European in value. Both can be SOLD before expiry", "They trade in different countries", "European options can't be sold before expiry", "American options are always cheaper"],
    answer: 0,
    explanation: "The names refer only to exercise rules. NSE's Nifty and S&P 500 (SPX) index options are European; most US single-stock options are American. Bermudan options can be exercised on specific dates.",
    optionExplanations: ["Correct.", "Not geographical.", "Any option can be closed in the market.", "Extra rights can't be worth less."]
  },
  {
    id: "fin-options-007", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "numerical",
    question: "S₀ = ₹100, K = ₹95, T = 6 months, r = 8% (continuous), no dividends. What are the no-arbitrage lower and upper bounds for a European call?",
    options: ["₹5 ≤ C ≤ ₹95", "About ₹8.72 ≤ C ≤ ₹91.28", "₹0 ≤ C ≤ ₹95", "About ₹8.72 ≤ C ≤ ₹100"],
    answer: 3,
    explanation: "max(0, S₀ − Ke^(−rT)) ≤ C ≤ S₀. Ke^(−rT) = 95e^(−0.04) = 91.28, so the lower bound is 8.72. A call can never be worth more than the stock itself.",
    optionExplanations: ["The lower bound uses the PV of the strike.", "The upper bound is S₀.", "The lower bound is positive here.", "Correct."]
  },
  {
    id: "fin-options-008", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "hard", type: "numerical",
    question: "S₀ = ₹80, K = ₹100, T = 6 months, r = 8%, no dividends. Compare the lower bounds of the European and American puts.",
    options: ["Both ₹20", "European ₹20; American about ₹16.08", "Both about ₹16.08", "European about ₹16.08 (Ke^(−rT) − S₀); American ₹20 (K − S₀), because the American put can be exercised immediately"],
    answer: 3,
    explanation: "European: max(0, Ke^(−rT) − S₀) = 96.08 − 80 = 16.08. American: max(0, K − S₀) = 20. Upper bounds: Ke^(−rT) for European, K for American.",
    optionExplanations: ["The European put can't be exercised now.", "Swapped.", "The American put's floor is higher.", "Correct."]
  },
  {
    id: "fin-options-009", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "numerical",
    question: "S₀ = ₹100, K = ₹100, T = 1 year, r = 5% (continuous). A European call costs ₹10. By put-call parity, what must the European put cost?",
    options: ["₹10.00", "₹4.88", "About ₹14.88", "About ₹5.12"],
    answer: 3,
    explanation: "C − P = S₀ − Ke^(−rT) = 100 − 95.12 = 4.88. So P = 10 − 4.88 = ₹5.12.",
    optionExplanations: ["Calls and puts at the same strike aren't equal unless S₀ = Ke^(−rT).", "That's C − P, not P.", "Wrong sign.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-options-010", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "hard", type: "numerical",
    question: "With S₀ = 100, K = 100, T = 1, r = 5% (so S₀ − Ke^(−rT) = 4.88), the call trades at 10 and the put at 4. What arbitrage do you do, and what is the profit today?",
    options: ["Buy call, sell put, short stock; profit 1.12", "Sell the call, buy the put, buy the stock, borrow PV(K) = 95.12; lock in 1.12 today", "No arbitrage exists", "Buy both options; profit 6"],
    answer: 1,
    explanation: "C − P = 6 > 4.88, so the call is rich relative to the put. Sell call (+10), buy put (−4), buy stock (−100), borrow 95.12: net +1.12 today. At expiry the stock is delivered at K either via the call or the put, repaying the 100 loan exactly.",
    optionExplanations: ["That's the trade when C − P is too low.", "Correct.", "Parity is violated by 1.12.", "Not riskless."]
  },
  {
    id: "fin-options-011", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "concept",
    question: "Why should an American call on a non-dividend-paying stock never be exercised early?",
    options: ["Its value is at least S − Ke^(−r(T−t)), which exceeds the exercise value S − K when r > 0; early exercise also throws away the insurance (time) value. Selling the option is always better, so C_American = C_European", "Because it's illegal", "Because calls always expire worthless", "Because dividends are paid"],
    answer: 0,
    explanation: "With dividends, early exercise just before an ex-dividend date can be optimal. American puts can be optimally exercised early when deep in the money (receiving K now and earning interest beats the remaining insurance value).",
    optionExplanations: ["Correct.", "It's allowed, just suboptimal.", "Not true.", "That's when it may be optimal."]
  },
  {
    id: "fin-options-012", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "hard", type: "numerical",
    question: "An American call has K = $100 and expires 3 months after an upcoming ex-dividend date; r = 5% (continuous). Using the rule 'exercise just before ex-dividend only if D > K(1 − e^(−rτ))', which dividend makes early exercise potentially optimal?",
    options: ["$0.50", "$1.00", "$2.00", "None, ever"],
    answer: 2,
    explanation: "K(1 − e^(−0.05 × 0.25)) = 100 × 0.01242 = $1.24 — the interest saved by paying K later. Only a dividend above $1.24 (here $2.00) can justify exercising just before the stock drops on the ex-date.",
    optionExplanations: ["Below the threshold.", "Below the threshold.", "Correct.", "With large enough dividends it can be optimal."]
  },
  {
    id: "fin-options-013", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "numerical",
    question: "You own a stock bought at $100 and buy a $95-strike put for $3 (ignore interest). What are your maximum loss and break-even at expiry?",
    options: ["Unlimited loss; break-even $97", "Max loss $5; break-even $100", "Max loss $3; break-even $98", "Max loss $8; break-even $103"],
    answer: 3,
    explanation: "Protective put: below 95 you sell at 95. Loss = (100 − 95) + 3 = $8. Break-even = 100 + 3 = $103. By put-call parity, stock + put = call + bond: a synthetic call.",
    optionExplanations: ["The put caps the loss.", "That ignores the premium.", "The loss includes the 5-point drop to the strike.", "Correct."]
  },
  {
    id: "fin-options-014", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "numerical",
    question: "You own a stock bought at $100 and sell a $110-strike call for $4 (ignore interest). What are the maximum profit and break-even, and what's the main risk?",
    options: ["Unlimited profit; break-even $104", "Max profit $14; break-even $96; you keep almost all downside risk and give up gains above $110", "Max profit $4; break-even $100; no downside risk", "Max profit $10; break-even $110"],
    answer: 1,
    explanation: "Covered call: max profit = (110 − 100) + 4 = $14. Break-even = 100 − 4 = $96. The premium is a small cushion, not a floor. It's not 'free income'; you sell your upside.",
    optionExplanations: ["Upside is capped at the strike.", "Correct.", "Downside remains.", "That ignores the premium."]
  },
  {
    id: "fin-options-015", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "numerical",
    question: "Bull call spread: buy the 95 call for 8 and sell the 110 call for 3 (ignore interest). What are the max profit, max loss and break-even?",
    options: ["Max profit 15, max loss 8, break-even 103", "Unlimited profit, max loss 5, break-even 100", "Max profit 5, max loss 10, break-even 105", "Max profit 10, max loss 5, break-even 100"],
    answer: 3,
    explanation: "Net debit = 8 − 3 = 5 (the lower-strike call is always worth more). Max payoff = 110 − 95 = 15, so max profit = 10. Max loss = 5. Break-even = 95 + 5 = 100. A moderately bullish view with defined risk.",
    optionExplanations: ["That ignores the short call.", "The short call caps the upside.", "Swapped.", "Correct."]
  },
  {
    id: "fin-options-016", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "hard", type: "numerical",
    question: "Butterfly: buy the 90 call for 12, sell two 100 calls for 7 each, buy the 110 call for 3 (ignore interest). What are the max profit, max loss and break-evens?",
    options: ["Max profit 9, max loss 1, break-evens 91 and 109", "Max profit 10, max loss 2, break-evens 92 and 108", "Max profit 20, max loss 1, break-evens 90 and 110", "Max profit 9, unlimited loss"],
    answer: 0,
    explanation: "Net cost = 12 − 14 + 3 = 1. Max payoff is 10, at S_T = 100, so max profit = 9. Max loss = 1 (outside 90–110). Break-evens = 90 + 1 = 91 and 110 − 1 = 109. A low-volatility view with limited risk.",
    optionExplanations: ["Correct.", "Wrong net cost.", "Max payoff is K₂ − K₁ = 10.", "The long wings cap the loss."]
  },
  {
    id: "fin-options-017", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "hard", type: "numerical",
    question: "A box spread uses strikes 90 and 100 (long 90 call, short 100 call, long 100 put, short 90 put), with T = 1 and r = 5% (continuous). What is its payoff and its fair value today?",
    options: ["Payoff depends on S_T; value 10", "Always 10 at expiry, whatever S_T; fair value 10e^(−0.05) ≈ 9.51", "Always 0; value 0", "Always 10; fair value 10.51"],
    answer: 1,
    explanation: "A bull call spread plus a bear put spread pays K₂ − K₁ = 10 in every state, making it a synthetic zero-coupon bond worth (K₂ − K₁)e^(−rT) = 9.51. If it trades away from this, there's an arbitrage — it's put-call parity at two strikes.",
    optionExplanations: ["The payoff is constant.", "Correct.", "It pays 10.", "That compounds instead of discounting."]
  },
  {
    id: "fin-options-018", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "numerical",
    question: "A long straddle buys the 100 call for 6 and the 100 put for 5 (ignore interest). What are the break-evens, and what is the profit if S_T = 120?",
    options: ["94 and 106; profit 20", "89 and 111; profit 20", "95 and 105; profit 14", "89 and 111; profit 9"],
    answer: 3,
    explanation: "Cost = 11. Payoff = |S_T − 100|, so break-evens are 100 ± 11 = 89 and 111. At 120: payoff 20, profit 9. It's a long-volatility bet: you profit from big moves in either direction.",
    optionExplanations: ["Uses one premium only.", "That's the payoff, not the profit.", "Wrong premium.", "Correct."]
  },
  {
    id: "fin-options-019", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "concept",
    question: "How does a long strangle compare with a long straddle on the same underlying and expiry?",
    options: ["A strangle buys an OTM put and an OTM call (different strikes), so it's cheaper but needs a larger move to profit; a straddle buys ATM options at one strike, costing more but profiting from smaller moves", "The strangle is more expensive", "They're identical", "A strangle profits when the price stays still"],
    answer: 0,
    explanation: "Choose based on expected move size and budget. Strips (2 puts + 1 call) and straps (1 put + 2 calls) add a directional tilt to a volatility bet.",
    optionExplanations: ["Correct.", "OTM options are cheaper.", "Strikes differ.", "That's the short strangle."]
  },
  {
    id: "fin-options-020", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "concept",
    question: "You expect a stock to stay very close to its current price until expiry, and you want limited risk. Which strategy fits best?",
    options: ["Long straddle", "Long butterfly spread centred at the current price", "Short (naked) straddle", "Long call"],
    answer: 1,
    explanation: "A long butterfly is short volatility with defined risk. A short straddle also profits if the price stays put but has unlimited risk. A long straddle and a long call need movement.",
    optionExplanations: ["Needs a big move.", "Correct.", "Unlimited risk.", "Needs a rise."]
  },
  {
    id: "fin-options-021", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "easy", type: "concept",
    question: "What does 'long call + short put (same strike K and expiry)' create synthetically?",
    options: ["A long forward at price K: payoff S_T − K in every state", "A straddle", "A bond", "A short stock"],
    answer: 0,
    explanation: "max(S_T − K, 0) − max(K − S_T, 0) = S_T − K. This is put-call parity: C − P = S₀ − Ke^(−rT), the value of a forward with delivery price K.",
    optionExplanations: ["Correct.", "A straddle is long both.", "Not riskless.", "It's long exposure."]
  },
  {
    id: "fin-options-022", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "concept",
    question: "Why did 'portfolio insurance' fail in the crash of 19 October 1987?",
    options: ["Put options were banned", "It bought too many calls", "It replicated a protective put by selling index futures as prices fell (dynamic hedging), which assumed liquid, continuous markets; when everyone sold at once, liquidity vanished, futures gapped down and selling fed further falls", "Interest rates spiked"],
    answer: 2,
    explanation: "Payoff diagrams assume you can trade; real strategies live in market microstructure. After 1987, OTM put implied volatilities stayed elevated — the volatility skew.",
    optionExplanations: ["Puts weren't banned.", "It used futures, not calls.", "Correct.", "Not the cause."]
  },
  {
    id: "fin-options-023", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "easy", type: "concept",
    question: "What do historical, implied and realised volatility mean?",
    options: ["They're the same", "Implied volatility is computed from past prices", "Historical: standard deviation of past returns; implied: the volatility that makes a pricing model match the option's market price (the market's expectation); realised: the volatility actually experienced over the option's life", "Realised volatility is a forecast"],
    answer: 2,
    explanation: "Option traders effectively bet on realised versus implied. Indices like the VIX (and India VIX) summarise implied volatility.",
    optionExplanations: ["They differ.", "That's historical.", "Correct.", "It's measured after the fact."]
  },
  {
    id: "fin-options-024", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "easy", type: "concept",
    question: "In an option chain, what does open interest measure?",
    options: ["The number of contracts traded today", "The number of outstanding contracts that haven't been closed or exercised — a measure of positions and liquidity at each strike", "The option's premium", "The implied volatility"],
    answer: 1,
    explanation: "Volume counts today's trades; open interest counts open positions. Option chains list calls and puts by strike and expiry with premiums, volume, OI and IV.",
    optionExplanations: ["That's volume.", "Correct.", "Not the premium.", "Not IV."]
  },
  {
    id: "fin-options-025", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "hard", type: "concept",
    question: "Which statement about early exercise of American puts is correct?",
    options: ["It is never optimal", "It can be optimal when the put is deep in the money even without dividends (receiving K now and earning interest beats the remaining time value); an expected dividend makes early exercise LESS attractive, since the price drop on the ex-date helps the put", "Dividends make early put exercise more likely", "American puts equal European puts"],
    answer: 1,
    explanation: "Binomial trees find the early-exercise region in the lower part of the tree. American puts are therefore worth strictly more than European puts when exercise can be optimal.",
    optionExplanations: ["It can be optimal.", "Correct.", "The opposite: you'd wait for the dividend drop.", "They can differ."]
  },
  {
    id: "fin-options-026", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "hard", type: "concept",
    question: "For American options on a non-dividend stock, which put-call parity relation holds?",
    options: ["C − P = S₀ − Ke^(−rT) exactly", "C − P = 0", "S₀ − K ≤ C − P ≤ S₀ − Ke^(−rT)", "C − P ≥ S₀"],
    answer: 2,
    explanation: "Early exercise of the put breaks the exact equality, leaving a band. For European options the equality holds; for futures options it becomes C − P = (F₀ − K)e^(−rT).",
    optionExplanations: ["That's European parity.", "Not in general.", "Correct.", "Violates bounds."]
  },
  {
    id: "fin-options-027", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "numerical",
    question: "A long strangle buys a 95 put for 3 and a 105 call for 3 (ignore interest). What are its break-evens and maximum loss?",
    options: ["92 and 108; max loss 3", "95 and 105; max loss 6", "89 and 111; max loss 6", "89 and 111; unlimited loss"],
    answer: 2,
    explanation: "Cost = 6. Down-side break-even = 95 − 6 = 89; up-side = 105 + 6 = 111. Max loss = 6 if S_T ends between 95 and 105.",
    optionExplanations: ["Uses one premium.", "Those are the strikes.", "Correct.", "Long options limit the loss."]
  },
  {
    id: "fin-options-028", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "concept",
    question: "Why is a short straddle considered dangerous despite its high probability of a small profit?",
    options: ["It has unlimited upside", "You collect a finite premium but can lose many multiples of it on a large move: unlimited loss on the upside and up to K minus premium on the downside — a short-volatility, negatively skewed bet", "It requires no margin", "It profits from big moves"],
    answer: 1,
    explanation: "Strategies that earn small, steady premiums and occasionally suffer huge losses (like selling naked puts — Niederhoffer, 1997) look great until the tail event.",
    optionExplanations: ["Profit is capped at the premium.", "Correct.", "It needs substantial margin.", "That's the long straddle."]
  },
  {
    id: "fin-options-029", subject: "finance", subtopic: "Options: Payoffs, Bounds & Strategies", difficulty: "medium", type: "numerical",
    question: "Bear put spread: buy the 105 put for 7 and sell the 95 put for 3 (ignore interest). What are the max profit, max loss and break-even?",
    options: ["Max profit 10, max loss 4, break-even 99", "Max profit 6, max loss 4, break-even 101", "Max profit 4, max loss 6, break-even 101", "Max profit 10, max loss 7, break-even 98"],
    answer: 1,
    explanation: "Net debit = 7 − 3 = 4. Max payoff = 105 − 95 = 10 (below 95), so max profit = 6. Max loss = 4 (above 105). Break-even = 105 − 4 = 101. A moderately bearish view with defined risk.",
    optionExplanations: ["10 is the payoff; break-even is K₂ − debit.", "Correct.", "Swapped.", "That ignores the short put."]
  }
);
