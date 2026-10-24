/* Finance — Option Pricing: Binomial & Black-Scholes */
window.QUESTIONS.push(
  {
    id: "fin-optpricing-001", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "medium", type: "concept",
    question: "Why can't you price an option by discounting its expected payoff under real-world probabilities?",
    options: ["Because options have no payoff", "Because the risk-free rate is unknown", "You'd need the stock's expected return μ (and a risk-adjusted discount rate), which is unobservable and varies by investor; instead the option is priced by REPLICATION with the stock and a bond, which depends on σ and r but not μ", "Because options are always American"],
    answer: 2,
    explanation: "Replication pins down a unique, no-arbitrage price. Equivalently, you can take expectations under the risk-neutral measure and discount at r.",
    optionExplanations: ["They have payoffs.", "r is observable.", "Correct.", "Not relevant."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-optpricing-002", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "medium", type: "numerical",
    question: "One-step binomial: S₀ = 100, up factor U = 1.1, down factor D = 0.9, r = 5% per period (simple), K = 100. What is the risk-neutral up probability and the call value?",
    options: ["p* = 0.75; call ≈ 7.14", "p* = 0.5; call = 4.76", "p* = 0.75; call = 7.50", "p* = 0.25; call ≈ 2.38"],
    answer: 0,
    explanation: "p* = ((1 + r) − D)/(U − D) = (1.05 − 0.9)/0.2 = 0.75. Payoffs: 10 (up), 0 (down). C = (0.75 × 10 + 0.25 × 0)/1.05 = 7.14. The real-world probability of an up move is irrelevant.",
    optionExplanations: ["Correct.", "p* isn't 0.5 here.", "That forgets to discount.", "That's the down probability; 2.38 is the put."]
  },
  {
    id: "fin-optpricing-003", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "hard", type: "numerical",
    question: "In the same one-step tree (S₀ = 100, U = 1.1, D = 0.9, r = 5%, K = 100), what replicating portfolio reproduces the call?",
    options: ["Buy 1 share and borrow $92.86", "Hold 0.75 shares and lend $67.86", "Hold 0.5 shares (Δ = (10 − 0)/(110 − 90)) and borrow about $42.86", "Hold 0.5 shares and lend $42.86"],
    answer: 2,
    explanation: "Δ = (C_u − C_d)/(S_u − S_d) = 10/20 = 0.5. Bond position = C − ΔS₀ = 7.14 − 50 = −42.86 (borrow). Check: up: 0.5 × 110 − 42.86 × 1.05 = 55 − 45 = 10; down: 45 − 45 = 0.",
    optionExplanations: ["Wrong delta.", "p* isn't the delta.", "Correct.", "You borrow, not lend."]
  },
  {
    id: "fin-optpricing-004", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "medium", type: "numerical",
    question: "In the same one-step tree, what is the put value with K = 100, and does put-call parity hold?",
    options: ["About 2.38; yes: 7.14 − 2.38 = 4.76 = 100 − 100/1.05", "5.00; no", "About 7.14; yes", "0; the put can't pay"],
    answer: 0,
    explanation: "Put payoffs: 0 (up), 10 (down). P = 0.25 × 10/1.05 = 2.38. C − P = 4.76 = S₀ − K/(1 + r) = 100 − 95.24. Parity holds in any arbitrage-free model.",
    optionExplanations: ["Correct.", "Wrong.", "That's the call.", "The put pays 10 in the down state."]
  },
  {
    id: "fin-optpricing-005", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "medium", type: "concept",
    question: "Why must D < 1 + r < U hold in the binomial model?",
    options: ["To make the maths simpler", "It isn't required", "To ensure the stock pays dividends", "Otherwise there's an arbitrage: if 1 + r ≤ D, borrowing to buy the stock always wins; if 1 + r ≥ U, shorting the stock to buy bonds always wins. The condition also makes p* a genuine probability between 0 and 1"],
    answer: 3,
    explanation: "With continuous compounding the condition is d < e^(rΔt) < u.",
    optionExplanations: ["It's about no-arbitrage.", "It's essential.", "Unrelated.", "Correct."]
  },
  {
    id: "fin-optpricing-006", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "hard", type: "numerical",
    question: "S₀ = 20, u = 1.1, d = 0.9, r = 12% (continuous), Δt = 3 months. What are the risk-neutral probability and the value of a call with K = 21?",
    options: ["q ≈ 0.6523; about 0.633", "q = 0.5; about 0.49", "q ≈ 0.65; 1.00", "q ≈ 0.75; about 0.73"],
    answer: 0,
    explanation: "q = (e^(rΔt) − d)/(u − d) = (e^0.03 − 0.9)/0.2 = 0.6523. Payoffs: 1 (at 22) and 0 (at 18). C = e^(−0.03) × 0.6523 × 1 = 0.633 (Hull's classic example).",
    optionExplanations: ["Correct.", "q isn't 0.5.", "That forgets discounting.", "That uses simple 5%."]
  },
  {
    id: "fin-optpricing-007", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "medium", type: "numerical",
    question: "In a Cox-Ross-Rubinstein tree with σ = 20% and Δt = 0.25 years, what are the up and down factors?",
    options: ["1.20 and 0.80", "About 1.1052 and 0.9048", "1.05 and 0.95", "About 1.0513 and 0.9512"],
    answer: 1,
    explanation: "u = e^(σ√Δt) = e^(0.2 × 0.5) = e^0.1 = 1.1052; d = 1/u = 0.9048. As the number of steps grows, the CRR price converges to Black-Scholes.",
    optionExplanations: ["Uses σ directly.", "Correct.", "Arbitrary.", "That uses σΔt instead of σ√Δt."]
  },
  {
    id: "fin-optpricing-008", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "hard", type: "numerical",
    question: "Two-step tree: S₀ = 50, K = 52, u = 1.2, d = 0.8, r = 5% (continuous), Δt = 1 year. The European put is worth about 4.19. Is early exercise optimal for the American put at the down node (S = 40), and what is the American put worth?",
    options: ["Yes: intrinsic 12 exceeds the continuation value; the American put ≈ 5.09", "No; 4.19", "Yes; about 12.00", "No; about 1.41"],
    answer: 0,
    explanation: "q = (e^0.05 − 0.8)/0.4 = 0.6282. At the down node, the continuation value is ≈ 9.46, but exercising gives 52 − 40 = 12, so exercise. Rolling back: e^(−0.05)[0.6282 × 1.415 + 0.3718 × 12] ≈ 5.09 > 4.19. The difference is the early-exercise premium.",
    optionExplanations: ["Correct.", "Early exercise adds value here.", "That's the node's exercise value, not the price.", "That's the up-node value."]
  },
  {
    id: "fin-optpricing-009", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "easy", type: "concept",
    question: "Which is NOT an assumption of the Black-Scholes model?",
    options: ["The stock follows geometric Brownian motion with constant volatility", "Continuous trading with no transaction costs, and a constant risk-free rate", "No arbitrage", "Stock prices can jump discontinuously"],
    answer: 3,
    explanation: "Black-Scholes assumes continuous paths (no jumps), constant σ and r, frictionless continuous trading, and (in the basic form) no dividends. Jumps and stochastic volatility are among the main real-world violations.",
    optionExplanations: ["That is an assumption.", "That is an assumption.", "That is an assumption.", "Correct: jumps are NOT assumed."]
  },
  {
    id: "fin-optpricing-010", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "hard", type: "concept",
    question: "In deriving the Black-Scholes PDE, why does the drift μ disappear?",
    options: ["Because μ = 0 by assumption", "The portfolio Π = V − ΔS with Δ = ∂V/∂S cancels all dS terms (which carry both μ and dW), leaving a riskless dt-only change that must earn r. Hence ∂V/∂t + ½σ²S²∂²V/∂S² + rS∂V/∂S − rV = 0", "Because volatility is constant", "Because options have no expected return"],
    answer: 1,
    explanation: "The PDE holds for any derivative on S; the payoff enters only through boundary conditions (e.g. V(S, T) = max(S − K, 0)).",
    optionExplanations: ["μ is arbitrary.", "Correct.", "Not why.", "They do, but that's not why μ drops out."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-optpricing-011", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "hard", type: "numerical",
    question: "Black-Scholes: S = K = 100, r = 5%, σ = 20%, T = 1 year. What are d₁, d₂ and the call price?",
    options: ["d₁ = 0.25, d₂ = 0.05, C ≈ 9.93", "d₁ = 0.15, d₂ = 0.35, C ≈ 10.45", "d₁ = 0.35, d₂ = 0.15, C ≈ 10.45", "d₁ = 0.35, d₂ = 0.15, C ≈ 5.57"],
    answer: 2,
    explanation: "d₁ = [ln(1) + (0.05 + 0.02)×1]/0.2 = 0.35; d₂ = 0.35 − 0.2 = 0.15. C = 100N(0.35) − 100e^(−0.05)N(0.15) = 63.68 − 95.12 × 0.5596 = 10.45. The put is 5.57 (parity: 10.45 − 5.57 = 4.88).",
    optionExplanations: ["Wrong d₁.", "d₁ and d₂ swapped.", "Correct.", "5.57 is the put."]
  },
  {
    id: "fin-optpricing-012", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "hard", type: "numerical",
    question: "Black-Scholes with S = 42, K = 40, r = 10%, σ = 20%, T = 0.5. Given d₁ ≈ 0.769 and d₂ ≈ 0.628, what are the call and put prices?",
    options: ["Call ≈ 4.76, put ≈ 0.81", "Call ≈ 2.00, put ≈ 0.00", "Call ≈ 0.81, put ≈ 4.76", "Call ≈ 5.33, put ≈ 1.38"],
    answer: 0,
    explanation: "C = 42N(0.769) − 40e^(−0.05)N(0.628) = 42 × 0.7791 − 38.049 × 0.7349 = 4.76. P = 40e^(−0.05)N(−0.628) − 42N(−0.769) = 0.81. Check parity: 4.76 − 0.81 = 3.95 = 42 − 38.05.",
    optionExplanations: ["Correct (Hull's example).", "That's roughly intrinsic value only.", "Swapped.", "Wrong arithmetic."]
  },
  {
    id: "fin-optpricing-013", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "medium", type: "concept",
    question: "In C = S₀N(d₁) − Ke^(−rT)N(d₂), what do N(d₁) and N(d₂) represent?",
    options: ["N(d₁) is the call's delta (shares held in the replicating portfolio); N(d₂) is the risk-neutral probability that the call finishes in the money (S_T > K)", "Both are real-world probabilities", "N(d₁) is the probability of exercise; N(d₂) is delta", "They are volatility measures"],
    answer: 0,
    explanation: "Ke^(−rT)N(d₂) is the PV of the strike weighted by the risk-neutral probability of paying it. The replicating portfolio holds N(d₁) shares and borrows Ke^(−rT)N(d₂), continuously rebalanced (delta hedging).",
    optionExplanations: ["Correct.", "They're risk-neutral or hedge quantities.", "Swapped.", "No."]
  },
  {
    id: "fin-optpricing-014", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "medium", type: "numerical",
    question: "A quick approximation for an at-the-money option (r ≈ 0) is C ≈ 0.4 × S × σ × √T. Estimate a 1-year ATM call on a $100 stock with 20% volatility.",
    options: ["About $4", "About $0.80", "About $20", "About $8"],
    answer: 3,
    explanation: "0.4 × 100 × 0.2 × 1 = $8 (exact BS with r = 0: $7.97). ATM option prices scale roughly linearly with σ and √T — a handy interview sanity check.",
    optionExplanations: ["Off by a factor of 2.", "Off by a factor of 10.", "That's S × σ.", "Correct."]
  },
  {
    id: "fin-optpricing-015", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "medium", type: "concept",
    question: "What is implied volatility, and what is the volatility smile/skew?",
    options: ["Historical standard deviation", "Implied vol is the σ that makes the Black-Scholes price equal the market price (found numerically, e.g. Newton-Raphson). Plotting IV across strikes gives a smile/skew — for equity indices, OTM puts have higher IV, especially since 1987 — showing constant-σ Black-Scholes is incomplete", "A forecast from GARCH", "The volatility of interest rates"],
    answer: 1,
    explanation: "Traders quote options in IV terms. The IV surface (across strikes and maturities) motivates stochastic-volatility and jump models.",
    optionExplanations: ["That's historical vol.", "Correct.", "That's a model forecast.", "Not that."]
  },
  {
    id: "fin-optpricing-016", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "hard", type: "numerical",
    question: "With a continuous dividend yield q, the Merton formula replaces S₀ by S₀e^(−qT). For S = K = 100, r = 5%, q = 3%, σ = 20%, T = 1 (so d₁ = 0.2, d₂ = 0), what is the call price?",
    options: ["About 10.45", "About 8.65", "About 6.73", "About 12.00"],
    answer: 1,
    explanation: "C = 100e^(−0.03)N(0.2) − 100e^(−0.05)N(0) = 97.04 × 0.5793 − 95.12 × 0.5 = 56.21 − 47.56 = 8.65. Dividends lower call values (the put rises to about 6.73).",
    optionExplanations: ["That ignores dividends.", "Correct.", "That's the put.", "Too high."]
  },
  {
    id: "fin-optpricing-017", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "medium", type: "concept",
    question: "What is risk-neutral pricing, and how does it unify the binomial and Black-Scholes models?",
    options: ["Assuming investors don't care about risk in real life", "Pricing only bonds", "Using the real-world drift μ", "In an arbitrage-free market there's a measure Q under which every asset earns r; any derivative's price is e^(−rT)E^Q[payoff]. The binomial model uses discrete Q (p*); Black-Scholes uses GBM with drift r"],
    answer: 3,
    explanation: "It's a calculation device implied by replication (the First Fundamental Theorem of Asset Pricing), not a claim about investors' preferences.",
    optionExplanations: ["It's a pricing measure, not a behavioural claim.", "It's general.", "μ is replaced by r.", "Correct."]
  },
  {
    id: "fin-optpricing-018", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "easy", type: "concept",
    question: "How are American options typically priced in a binomial tree?",
    options: ["Using the Black-Scholes formula directly", "By backward induction: at each node, value = max(exercise value, discounted risk-neutral expected value of the next nodes)", "By averaging terminal payoffs only", "They can't be priced"],
    answer: 1,
    explanation: "For European options you just take the continuation value. The tree automatically identifies the early-exercise region (e.g. low stock prices for puts).",
    optionExplanations: ["Black-Scholes is for European options.", "Correct.", "That ignores early exercise.", "Trees handle them well."]
  },
  {
    id: "fin-optpricing-019", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "medium", type: "concept",
    question: "A market call price is $8.50, while your Black-Scholes model gives $10.45. What's the most direct diagnostic?",
    options: ["Assume the market is wrong and buy", "Increase the risk-free rate", "Compute the implied volatility from $8.50 and compare it with your σ input; also check dividends, exercise style and bid-offer", "Ignore the difference"],
    answer: 2,
    explanation: "A lower market price usually means the market implies lower volatility (or dividends you've ignored). Models are calibrated to market prices, not the other way round.",
    optionExplanations: ["Mispricing claims need evidence.", "That raises the model call price further.", "Correct.", "It's informative."]
  },
  {
    id: "fin-optpricing-020", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "easy", type: "concept",
    question: "Which statement about the history of Black-Scholes is correct?",
    options: ["It was published in 1997", "It prices only American options", "It was never used by traders", "Black and Scholes published in 1973, the year the CBOE opened; Merton extended it. Scholes and Merton won the 1997 Nobel prize (Black had died) — and both were later involved in LTCM's 1998 collapse"],
    answer: 3,
    explanation: "Model risk and implementation risk (e.g. Kidder Peabody's mispriced forwards) matter as much as the formula.",
    optionExplanations: ["1997 was the Nobel.", "It's for European options.", "Traders adopted it immediately.", "Correct."]
  },
  {
    id: "fin-optpricing-021", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "medium", type: "concept",
    question: "In the Black-Scholes PDE ∂V/∂t + ½σ²S²∂²V/∂S² + rS∂V/∂S − rV = 0, what does ∂V/∂t + ½σ²S²Γ represent for a delta-hedged position?",
    options: ["Dividends", "The option's delta", "Theta plus the gamma term: a delta-hedged long option loses time value (θ < 0) but gains from convexity (½σ²S²Γ); the two balance so that the hedged portfolio earns the risk-free rate", "Interest on the strike only"],
    answer: 2,
    explanation: "This theta-gamma trade-off is central to options trading: long gamma pays theta; short gamma collects theta.",
    optionExplanations: ["No dividends here.", "Delta is ∂V/∂S.", "Correct.", "Not just that."]
  },
  {
    id: "fin-optpricing-022", subject: "finance", subtopic: "Option Pricing: Binomial & Black-Scholes", difficulty: "hard", type: "concept",
    question: "How does the CRR binomial price behave as the number of steps n increases?",
    options: ["It diverges", "It converges to the Black-Scholes price (oscillating around it), because the binomial distribution of log-prices approaches the lognormal distribution", "It goes to zero", "It equals the intrinsic value"],
    answer: 1,
    explanation: "With u = e^(σ√Δt), d = 1/u, the tree's terminal distribution approaches GBM's by the CLT. A few hundred steps typically give accuracy to the cent.",
    optionExplanations: ["It converges.", "Correct.", "No.", "No."]
  }
);
