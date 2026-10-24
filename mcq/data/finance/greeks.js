/* Finance — The Greeks & Risk Management */
window.QUESTIONS.push(
  {
    id: "fin-greeks-001", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "easy", type: "concept",
    question: "Why do options desks focus on the Greeks rather than on predicting direction?",
    options: ["A dealer who writes options wants to isolate and neutralise specific risks (spot, volatility, time, rates) rather than bet on direction; the Greeks are partial derivatives that split P&L into these components, so some risks can be hedged and others kept", "Because direction never matters", "Because Greeks predict prices", "Because regulators require it"],
    answer: 0,
    explanation: "Taylor expansion: δV ≈ Δ·δS + ½Γ·(δS)² + Θ·δt + Vega·δσ + …. Hedging is a loop: measure → hedge → market moves → re-measure → re-hedge.",
    optionExplanations: ["Correct.", "It matters, but it's hedged.", "They measure sensitivity, not direction.", "Not the reason."]
  },
  {
    id: "fin-greeks-002", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "easy", type: "concept",
    question: "What are the possible ranges of delta for a long European call and a long European put under Black-Scholes?",
    options: ["Both between 0 and 1", "Call: between 0 and 1 (= N(d₁)); put: between −1 and 0 (= N(d₁) − 1)", "Call: between −1 and 0; put: between 0 and 1", "Both can exceed 1"],
    answer: 1,
    explanation: "ATM options have delta around ±0.5; deep ITM calls approach 1 (behaving like stock), deep OTM approach 0. Delta also serves as a hedge ratio, a share-equivalent exposure, and a rough probability-of-exercise proxy.",
    optionExplanations: ["Puts have negative delta.", "Correct.", "Reversed.", "Bounded by ±1 for plain options."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-greeks-003", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "easy", type: "numerical",
    question: "You sell 10 call contracts (100 shares each) with delta 0.6. How do you delta-hedge?",
    options: ["Sell 600 shares", "Buy 600 shares", "Buy 60 shares", "Buy 1,000 shares"],
    answer: 1,
    explanation: "Short calls have delta −0.6 × 10 × 100 = −600 shares-equivalent. Buying 600 shares makes the position delta-neutral for small moves.",
    optionExplanations: ["That doubles the exposure.", "Correct.", "Forgets the multiplier.", "That's a delta-1 hedge."]
  },
  {
    id: "fin-greeks-004", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "medium", type: "numerical",
    question: "You're short 1 call contract (100 shares) delta-hedged with 60 shares. The stock rises $1 and delta rises from 0.60 to 0.62. What must you do, and which Greek drove this?",
    options: ["Sell 2 shares; theta", "Buy 2 more shares; gamma (Γ ≈ 0.02 per $1)", "Do nothing; delta is still 0.6", "Buy 62 shares; vega"],
    answer: 1,
    explanation: "New hedge = 0.62 × 100 = 62 shares, so buy 2. Short gamma forces you to buy after rises and sell after falls — 'buy high, sell low' — which is why negative gamma bites in volatile markets.",
    optionExplanations: ["Wrong direction and Greek.", "Correct.", "Delta changed.", "You need only 2 more."]
  },
  {
    id: "fin-greeks-005", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "medium", type: "concept",
    question: "Where is gamma largest, and how does it behave for long vs short options?",
    options: ["Deep ITM, far from expiry", "At the money, especially close to expiry; it's positive for long calls AND long puts (same formula) and negative for short options", "Deep OTM options", "Gamma is the same for all options"],
    answer: 1,
    explanation: "Γ = n(d₁)/(Sσ√T): peaks near S = K and grows as T shrinks. Near-expiry ATM options have explosive gamma (and theta).",
    optionExplanations: ["Deep ITM gamma is small.", "Correct.", "Small there too.", "It varies strongly."]
  },
  {
    id: "fin-greeks-006", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "medium", type: "concept",
    question: "What is gamma scalping?",
    options: ["Holding a long-gamma (e.g. long straddle) position and re-hedging delta: sell the underlying after rallies and buy after dips, locking in profits of about ½Γ(ΔS)² from realised moves, paid for by negative theta", "Selling options before earnings", "Shorting gamma to collect theta", "Buying deep OTM puts"],
    answer: 0,
    explanation: "It profits when realised volatility exceeds the implied volatility paid for the options.",
    optionExplanations: ["Correct.", "Unrelated.", "That's the opposite position.", "Not the definition."]
  },
  {
    id: "fin-greeks-007", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "hard", type: "numerical",
    question: "For a delta-neutral position with r ≈ 0, the Black-Scholes PDE gives Θ = −½σ²S²Γ. With σ = 20%, S = 100 and Γ = 0.02, what is theta per year and per trading day (252 days)?",
    options: ["−0.04 per year; tiny per day", "−400 per year; −1.59 per day", "−4.00 per year; about −0.016 per day", "+4.00 per year"],
    answer: 2,
    explanation: "Θ = −½ × 0.04 × 10,000 × 0.02 = −4 per year ≈ −4/252 = −0.0159 per trading day. Theta and gamma mirror each other: long gamma pays theta, short gamma earns it.",
    optionExplanations: ["Forgot S².", "Off by a factor of 100.", "Correct.", "Long gamma has negative theta."]
  },
  {
    id: "fin-greeks-008", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "hard", type: "concept",
    question: "For a delta-hedged option, daily P&L ≈ ½ΓS²[(δS/S)² − σ²_implied δt]. What does this imply?",
    options: ["Hedged options always break even", "Implied volatility doesn't matter", "Profit depends only on direction", "Options trading is a bet on realised vs implied variance: a long-gamma hedged position profits if realised volatility exceeds the implied volatility it paid for, and loses otherwise"],
    answer: 3,
    explanation: "Gamma scalping gains come from realised squared moves; theta decay charges you the implied variance. Short gamma is the mirror image.",
    optionExplanations: ["Only if realised = implied.", "It sets the theta bill.", "Direction is hedged.", "Correct."]
  },
  {
    id: "fin-greeks-009", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "medium", type: "concept",
    question: "Which statement about vega is correct?",
    options: ["Calls have positive vega, puts negative", "Vega is largest deep in the money", "Vega is the same for a call and put with the same strike and expiry, is positive for long options, peaks at the money (where n(d₁) is largest), and increases with time to expiry", "Vega is zero for long-dated options"],
    answer: 2,
    explanation: "Vega = S√T·n(d₁). 'Vol crush' after earnings or central bank events hits ATM, high-vega options hardest — you can lose even if the stock moves in your favour. A long ATM straddle carries twice the vega of either leg, making it a nearly pure long-volatility position.",
    optionExplanations: ["Both are positive.", "Smallest there.", "Correct.", "Largest for long-dated options."]
  },
  {
    id: "fin-greeks-010", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "medium", type: "concept",
    question: "Why is rho a minor risk on equity-option desks but a major one on rates desks?",
    options: ["Rates never change", "Equity options have no rho", "Equity options are mostly short-dated, so ρ = KTe^(−rT)N(d₂) is small relative to delta/vega; rates options (swaptions, caps, floors) have long maturities and rates are the underlying itself, so rate moves dominate P&L", "Rates desks don't use options"],
    answer: 2,
    explanation: "Calls have positive rho (higher rates reduce the PV of the strike paid; the hedge involves borrowing to buy stock), puts negative.",
    optionExplanations: ["They do.", "They have small rho.", "Correct.", "They use many."]
  },
  {
    id: "fin-greeks-011", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "hard", type: "concept",
    question: "Match the second-order Greeks: (i) ∂Δ/∂σ, (ii) ∂Vega/∂σ, (iii) ∂Δ/∂t.",
    options: ["(i) Vanna, (ii) Volga (Vomma), (iii) Charm (delta bleed)", "(i) Volga, (ii) Charm, (iii) Vanna", "(i) Charm, (ii) Vanna, (iii) Volga", "(i) Gamma, (ii) Vega, (iii) Theta"],
    answer: 0,
    explanation: "Vanna: a vol spike can blow up the delta of a short OTM put even without a price move. Volga: convexity of vega. Charm: delta drifts as time passes, so a hedged book develops directional exposure overnight.",
    optionExplanations: ["Correct.", "Mismatched.", "Mismatched.", "Those are first-order Greeks."]
  },
  {
    id: "fin-greeks-012", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "medium", type: "numerical",
    question: "A position has Δ = 0.6, Γ = 0.05, Θ = −0.04 per day and Vega = 0.20 per vol point. Over one day the stock rises $2 and implied vol falls 1 point. Estimate the P&L.",
    options: ["+1.06", "+1.20", "+1.30", "+0.86"],
    answer: 0,
    explanation: "Δ·δS = 1.20; ½Γ·δS² = 0.5 × 0.05 × 4 = 0.10; Θ·δt = −0.04; Vega·δσ = 0.20 × (−1) = −0.20. Total ≈ 1.06. The difference from the actual P&L is 'unexplained' — a check on model and data quality.",
    optionExplanations: ["Correct.", "Delta only.", "Ignores theta and vega.", "Wrong sign on gamma."]
  },
  {
    id: "fin-greeks-013", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "medium", type: "concept",
    question: "What does a large 'unexplained P&L' in a Greek-based attribution usually indicate?",
    options: ["Nothing important", "That the trader made money", "That theta is wrong", "Missing or inaccurate risk factors: large moves where higher-order terms matter, jumps, skew/smile changes, data or booking errors, or model misspecification"],
    answer: 3,
    explanation: "Risk managers investigate unexplained P&L because it often reveals unmodelled exposures before they cause big losses.",
    optionExplanations: ["It's a red flag.", "Unrelated.", "Not specifically.", "Correct."]
  },
  {
    id: "fin-greeks-014", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "easy", type: "concept",
    question: "How do you get a book's total delta when all options are on the same underlying?",
    options: ["Average the deltas", "Add each position's delta × signed quantity × contract multiplier; Greeks are additive because the book's value is the sum of its positions", "Multiply the deltas", "Take the largest delta"],
    answer: 1,
    explanation: "The same holds for gamma, vega and theta. Across different underlyings, raw deltas aren't comparable — convert to beta-weighted exposure to a reference index first.",
    optionExplanations: ["Not an average.", "Correct.", "Not a product.", "Not a maximum."]
  },
  {
    id: "fin-greeks-015", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "hard", type: "numerical",
    question: "A book is delta-neutral with gamma −3,000. A traded option has delta 0.62 and gamma 1.50. How do you make the book gamma- AND delta-neutral?",
    options: ["Sell 2,000 options; buy 1,240 shares", "Buy 1,240 shares only", "Buy 2,000 options, then sell 1,240 shares to remove the delta they add", "Buy 3,000 options"],
    answer: 2,
    explanation: "Gamma: −3,000 + 1.5n = 0 → n = 2,000 options bought. They add 2,000 × 0.62 = +1,240 delta, so sell 1,240 shares (stock has zero gamma). Stock fixes delta last because it doesn't disturb gamma.",
    optionExplanations: ["Selling makes gamma worse.", "Stock can't change gamma.", "Correct.", "Gamma per option is 1.5."]
  },
  {
    id: "fin-greeks-016", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "hard", type: "concept",
    question: "To make a book both gamma- and vega-neutral, why do you need two hedge options with DIFFERENT expiries?",
    options: ["Exchange rules", "One option is always enough", "Two targets need two instruments, and for any option Vega/Γ = S²σT (up to a scaling constant) — independent of strike. Two options with the same expiry have proportional gamma and vega, so the 2×2 system is singular", "Different expiries have the same vega"],
    answer: 2,
    explanation: "Solve [Γ₁ Γ₂; V₁ V₂][n₁; n₂] = [−Γ_book; −V_book], then neutralise delta with stock. The hedge usually changes theta — there's no free lunch.",
    optionExplanations: ["It's mathematical.", "Not for two targets.", "Correct.", "Vega grows with T."]
  },
  {
    id: "fin-greeks-017", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "medium", type: "concept",
    question: "Why do risk managers use full-repricing scenario grids (spot × vol) in addition to Greeks?",
    options: ["Greeks are always exact", "Regulators ban Greeks", "Grids are faster", "Greeks are local Taylor approximations; for large moves, curvature and changing Greeks (e.g. volga) make them inaccurate, so the whole book is revalued at each scenario; stress tests use specific historical shocks"],
    answer: 3,
    explanation: "A delta-neutral, long-vega book can still lose money when vol rises 5 points if its vega is spread across tenors and changes non-linearly. Grids reveal such effects.",
    optionExplanations: ["Only locally.", "Not true.", "Grids are slower.", "Correct."]
  },
  {
    id: "fin-greeks-018", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "medium", type: "numerical",
    question: "A $10m portfolio has daily volatility of 1%. Assuming normal returns, what is its 1-day 99% parametric VaR, and its 10-day VaR using square-root-of-time scaling?",
    options: ["$100,000 and $1,000,000", "$233,000 and about $737,000", "$164,500 and about $520,000", "$233,000 and $2,330,000"],
    answer: 1,
    explanation: "VaR = z₀.₉₉ × σ × value = 2.33 × 1% × $10m = $233,000. 10-day ≈ 233,000 × √10 = $736,800. The √h scaling assumes independent, identically distributed returns.",
    optionExplanations: ["That's 1σ, not 99%.", "Correct.", "That's 95% (z = 1.645).", "Scale by √10, not 10."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-greeks-019", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "medium", type: "concept",
    question: "How do parametric, historical-simulation and Monte Carlo VaR differ for an options book?",
    options: ["They're identical", "Monte Carlo is the fastest", "Parametric assumes normal returns and linear (delta) exposure — fastest but blind to gamma/vega; historical replays past returns through the book; Monte Carlo simulates many paths and fully reprices — slowest but captures curvature best", "Historical VaR assumes normality"],
    answer: 2,
    explanation: "On ordinary days all three agree because delta dominates — that agreement can create false confidence.",
    optionExplanations: ["They differ.", "It's the slowest.", "Correct.", "It assumes no distribution."]
  },
  {
    id: "fin-greeks-020", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "medium", type: "concept",
    question: "A 1-day 99% VaR of $500,000 tells you what, and what doesn't it tell you?",
    options: ["You can never lose more than $500,000", "You lose $500,000 once a year exactly", "Average daily loss is $500,000", "On about 1 day in 100 you should expect to lose MORE than $500,000, but VaR says nothing about how much more; expected shortfall (average loss beyond VaR) addresses tail severity. It's also calibrated on past data"],
    answer: 3,
    explanation: "In August 2007 Goldman's CFO described '25-standard-deviation moves, several days in a row' — a sign that the model, not the universe, was wrong.",
    optionExplanations: ["It's exceeded about 1% of days.", "Not exact timing.", "Not an average.", "Correct."]
  },
  {
    id: "fin-greeks-021", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "hard", type: "concept",
    question: "Why can a jump (gap) in the price not be perfectly delta-hedged, even though a large continuous move can be?",
    options: ["Jumps are always small", "Replication solves for 2 unknowns (shares, cash) matching 2 outcomes (up/down); a jump adds a third outcome, so 2 instruments can't match 3 states. In addition, you can't trade during the gap, and margin calls arrive at the new price", "Delta is undefined during jumps", "Jumps only affect bonds"],
    answer: 1,
    explanation: "Greek-based estimates also badly understate jump losses because the Taylor expansion breaks down. Desks size short-gamma positions so plausible gaps are survivable, and often hold some tail protection.",
    optionExplanations: ["They can be huge.", "Correct.", "It's defined; it just can't be traded through.", "They affect all assets."]
  },
  {
    id: "fin-greeks-022", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "hard", type: "numerical",
    question: "A book has Δ = +1,168.7, Γ = −2.364 and Vega = +373.7. The stock gaps down $76 and implied vol rises 17 points. What is the Greek-based P&L estimate (ignoring theta)?",
    options: ["About −88,821", "About +6,353", "About −95,649", "About −89,296"],
    answer: 3,
    explanation: "Δ·δS = 1,168.7 × (−76) = −88,821; ½Γ·δS² = 0.5 × (−2.364) × 5,776 = −6,827; Vega·δσ = 373.7 × 17 = +6,353. Total ≈ −89,296. Full repricing in the course example gave about −193,000: the Greeks missed more than half the loss in a gap.",
    optionExplanations: ["Delta term only.", "Vega term only.", "That leaves out the vega gain.", "Correct."]
  },
  {
    id: "fin-greeks-023", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "medium", type: "concept",
    question: "What destroyed Victor Niederhoffer's fund on 27 October 1997, even though his short S&P puts later expired worthless?",
    options: ["His puts ended deep in the money at expiry", "Fraud", "A change in interest rates", "A sudden crash with an implied-volatility spike repriced his short OTM puts far higher (gamma plus vega losses), and a same-day margin call forced liquidation at the worst prices — a funding/liquidity failure, not a wrong long-run view"],
    answer: 3,
    explanation: "Selling OTM puts earns steady premiums with rare, catastrophic losses (short gamma, short vega, short tail). He blew up again in 2007 in a similar way.",
    optionExplanations: ["They were still OTM.", "Not fraud.", "Rho was minor.", "Correct."]
  },
  {
    id: "fin-greeks-024", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "hard", type: "numerical",
    question: "Black-Scholes with S = K = 100, r = 5%, σ = 20%, T = 1 (d₁ = 0.35, n(0.35) ≈ 0.3752). What are the call's gamma and its vega per 1 vol point?",
    options: ["Γ ≈ 0.0188, Vega ≈ 0.375", "Γ ≈ 0.0375, Vega ≈ 3.75", "Γ ≈ 0.188, Vega ≈ 37.5", "Γ ≈ 0.6368, Vega ≈ 0.375"],
    answer: 0,
    explanation: "Γ = n(d₁)/(Sσ√T) = 0.3752/(100 × 0.2) = 0.0188. Vega = S√T·n(d₁) = 37.52 per unit σ, i.e. ≈ 0.375 per 1 vol point. The put has the same gamma and vega.",
    optionExplanations: ["Correct.", "Off by factors of 2 and 10.", "Off by a factor of 10; 37.5 is per 100 vol points.", "0.6368 is the delta."]
  },
  {
    id: "fin-greeks-025", subject: "finance", subtopic: "The Greeks & Risk Management", difficulty: "easy", type: "concept",
    question: "What sign does theta have for a long option position, and why?",
    options: ["Negative: as expiry approaches, time value decays (all else equal), so long options lose value each day; short options collect it", "Positive: options gain value over time", "Zero", "Depends only on interest rates"],
    answer: 0,
    explanation: "Time decay accelerates for ATM options near expiry. (Deep ITM European puts can have slightly positive theta, a known exception.)",
    optionExplanations: ["Correct.", "Generally the opposite.", "Not zero.", "Not only."]
  }
);
