/* Finance — Futures, Forwards & Hedging */
window.QUESTIONS.push(
  {
    id: "fin-futures-001", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "easy", type: "concept",
    question: "What is the fundamental economic purpose of futures and forward markets?",
    options: ["To let anyone get rich quickly", "To replace stock exchanges", "To transfer price risk from those who want to shed it (hedgers such as farmers, refiners, airlines) to those willing to bear it (speculators), at a price set by the market; arbitrageurs keep prices consistent", "To guarantee profits for buyers"],
    answer: 2,
    explanation: "A wheat farmer locks in a selling price before harvest; an airline locks in fuel costs. Speculators take the other side for an expected return, and arbitrageurs enforce no-arbitrage pricing.",
    optionExplanations: ["They're zero-sum before costs.", "They complement spot markets.", "Correct.", "One side's gain is the other's loss."]
  },
  {
    id: "fin-futures-002", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "easy", type: "concept",
    question: "Which statement correctly contrasts futures and forwards?",
    options: ["Forwards trade on exchanges; futures are private contracts", "Futures have more counterparty risk than forwards", "Both settle only at maturity", "Futures are standardised, exchange-traded, centrally cleared and marked to market daily with margin; forwards are customised OTC contracts settled at maturity, carrying counterparty credit risk"],
    answer: 3,
    explanation: "Customisation (any size, date, underlying) is the forward's advantage; the clearing house and daily settlement are the futures' advantages.",
    optionExplanations: ["Reversed.", "Reversed: the clearing house reduces futures credit risk.", "Futures settle daily.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-futures-003", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "concept",
    question: "What is novation in exchange-traded derivatives?",
    options: ["Renewing a contract at expiry", "After a trade, the clearing house (CCP) replaces the original counterparty: it becomes the buyer to every seller and the seller to every buyer, so traders face the CCP's credit, not each other's", "Converting futures into options", "A tax on new contracts"],
    answer: 1,
    explanation: "This is why Lehman's exchange-traded positions were closed out within days with no losses to other members, while its bilateral OTC book took years to unwind.",
    optionExplanations: ["Not the meaning.", "Correct.", "Not the meaning.", "Not a tax."]
  },
  {
    id: "fin-futures-004", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "hard", type: "concept",
    question: "When a clearing member defaults, in what order does a CCP's default waterfall absorb the losses?",
    options: ["Defaulter's margin → defaulter's guaranty-fund contribution → CCP's own capital (skin in the game) → surviving members' guaranty-fund contributions", "Surviving members' guaranty fund → CCP capital → defaulter's margin", "CCP capital → defaulter's margin → government", "Losses are shared equally from the start"],
    answer: 0,
    explanation: "The defaulter pays first; the CCP's own capital comes before mutualised loss-sharing to align incentives. On Black Monday 1987, some brokers failed but the clearing house paid every winning position.",
    optionExplanations: ["Correct.", "Reversed.", "The defaulter's resources come first.", "Losses are sequenced."]
  },
  {
    id: "fin-futures-005", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "easy", type: "concept",
    question: "How do initial, maintenance and variation margin differ in futures trading?",
    options: ["Initial margin is posted to open a position (a performance bond); maintenance margin is the minimum balance to keep it; variation margin is the daily cash settlement of gains and losses. Falling below maintenance triggers a call to top up to the INITIAL level", "They are the same amount", "Variation margin is paid only at expiry", "Margin is a down payment on the asset"],
    answer: 0,
    explanation: "Maintenance margin is typically about 75% of initial margin. Margin is a performance bond, not a part-payment.",
    optionExplanations: ["Correct.", "They differ.", "It's paid daily.", "It's collateral, not a down payment."]
  },
  {
    id: "fin-futures-006", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "numerical",
    question: "You go long 2 gold futures (100 oz each) at $1,750/oz. Initial margin is $6,000 per contract and maintenance margin $4,500 per contract. Below what futures price do you first get a margin call?",
    options: ["$1,735", "$1,720", "$1,742.50", "$1,705"],
    answer: 0,
    explanation: "Total initial = $12,000, maintenance = $9,000. A call comes once losses exceed 12,000 − 9,000 = $3,000. Over 200 oz that's $15/oz: price below 1,750 − 15 = $1,735.",
    optionExplanations: ["Correct.", "That's a $6,000 loss, the full initial margin.", "That uses 400 oz.", "That's a $9,000 loss."]
  },
  {
    id: "fin-futures-007", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "numerical",
    question: "Same position (long 200 oz of gold futures at $1,750, initial margin $12,000, maintenance $9,000). The price falls to $1,733. How much must you deposit?",
    options: ["$3,400", "$400", "$9,000", "Nothing"],
    answer: 0,
    explanation: "Loss = 17 × 200 = $3,400, so the balance is $8,600 < $9,000. A margin call requires topping up to the INITIAL margin of $12,000: deposit $3,400. Topping up only to maintenance ($400) is the classic mistake.",
    optionExplanations: ["Correct.", "That restores only the maintenance level.", "Too much.", "The balance is below maintenance."]
  },
  {
    id: "fin-futures-008", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "concept",
    question: "Summed over the life of a futures contract, what do the daily mark-to-market cash flows to a long position equal?",
    options: ["S_T − F₀: the same total as a forward's payoff, just paid daily instead of at maturity", "Zero", "F₀ − S_T", "The initial margin"],
    answer: 0,
    explanation: "Σ(f_t − f_{t−1}) telescopes to f_T − f_0 = S_T − F₀ because the futures price converges to spot at expiry. The timing of cash flows differs, which matters for funding (Amaranth lost $6.6bn as daily margin calls drained it).",
    optionExplanations: ["Correct.", "Only if the price is unchanged.", "That's the short's payoff.", "Margin is collateral."]
  },
  {
    id: "fin-futures-009", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "concept",
    question: "What does the SPAN system used by exchanges such as CME compute?",
    options: ["Option prices", "Tax liabilities", "Initial margin, by simulating a set of scenarios of price and volatility moves (16 scenarios) and setting margin to cover roughly the worst one-day loss at about 99% confidence", "Dividend forecasts"],
    answer: 2,
    explanation: "That's why margins jump before events such as central bank meetings: SPAN reads higher implied volatility.",
    optionExplanations: ["Not pricing.", "Not tax.", "Correct.", "Not dividends."]
  },
  {
    id: "fin-futures-010", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "hard", type: "concept",
    question: "Match the OTC counterparty risks: (i) the counterparty defaults before maturity and you must replace the trade at worse prices; (ii) you deliver your leg on settlement day but they fail to deliver theirs; (iii) the counterparty is most likely to default exactly when the trade is most valuable to you.",
    options: ["(i) pre-settlement (replacement-cost) risk, (ii) settlement (Herstatt) risk, (iii) wrong-way risk", "(i) settlement, (ii) wrong-way, (iii) pre-settlement", "(i) wrong-way, (ii) pre-settlement, (iii) settlement", "All three are market risk"],
    answer: 0,
    explanation: "Herstatt risk is named after the German bank closed mid-settlement in 1974. Wrong-way risk: buying credit protection from a bank that might itself fail in a crisis.",
    optionExplanations: ["Correct.", "Mismatched.", "Mismatched.", "They are credit risks."]
  },
  {
    id: "fin-futures-011", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "numerical",
    question: "Under an ISDA master agreement, A and B have three trades: B owes A $12m, A owes B $8m, B owes A $3.5m. What single amount is paid with bilateral netting, and what is A's netting factor (net / gross positive exposure)?",
    options: ["$23.5m; 1.0", "B pays A $7.5m; about 0.48", "A pays B $7.5m; about 0.32", "$15.5m; 0.66"],
    answer: 1,
    explanation: "Net = 12 + 3.5 − 8 = $7.5m from B to A, replacing $23.5m of gross flows. A's gross positive exposure = 12 + 3.5 = 15.5; net exposure = 7.5; netting factor = 7.5/15.5 ≈ 0.48 — a lower factor means lower regulatory capital.",
    optionExplanations: ["That's no netting.", "Correct.", "Wrong direction.", "That's gross exposure."]
  },
  {
    id: "fin-futures-012", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "numerical",
    question: "100 dealers all trade with each other. How many credit relationships exist bilaterally, versus when all trades clear through one CCP?",
    options: ["100 vs 1", "4,950 vs 100", "9,900 vs 100", "10,000 vs 100"],
    answer: 1,
    explanation: "Bilateral pairs = N(N − 1)/2 = 100 × 99/2 = 4,950. With a CCP each member has one relationship: 100. Multilateral netting through a CCP is the combinatorial case for central clearing, mandated for standardised OTC derivatives after 2009 (Dodd-Frank, EMIR).",
    optionExplanations: ["Each member still faces the CCP.", "Correct.", "That double-counts each pair.", "That counts self-pairs."]
  },
  {
    id: "fin-futures-013", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "hard", type: "concept",
    question: "Why is close-out netting considered the cornerstone of OTC risk management?",
    options: ["It speeds up daily settlement", "On default, all trades are terminated, valued and netted into one close-out amount, preventing the defaulter's liquidator from 'cherry-picking' (enforcing trades the bankrupt firm wins while repudiating those it loses); enforceability depends on jurisdiction", "It eliminates market risk", "It only applies to futures"],
    answer: 1,
    explanation: "Without it, exposure would be the gross positive value of all trades. ISDA maintains country-by-country legal opinions on enforceability. Payment netting, by contrast, is purely operational: same-day, same-currency cash flows.",
    optionExplanations: ["That's payment netting.", "Correct.", "It compresses credit exposure, not market risk.", "It's an OTC/ISDA concept."]
  },
  {
    id: "fin-futures-014", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "easy", type: "concept",
    question: "What is an arbitrage opportunity, formally?",
    options: ["A portfolio that costs nothing to set up, never loses money, and has a positive probability of making money", "Any trade with positive expected return", "A low-risk investment", "Buying cheap and hoping prices rise"],
    answer: 0,
    explanation: "V(0) = 0, V(T) ≥ 0 in all states, P(V(T) > 0) > 0. Assuming no arbitrage implies the Law of One Price: identical payoffs must have identical prices — the engine of derivative pricing.",
    optionExplanations: ["Correct.", "Risky trades aren't arbitrage.", "Low risk isn't zero risk.", "That's speculation."]
  },
  {
    id: "fin-futures-015", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "easy", type: "numerical",
    question: "If £1 = $1.50 and $1 = ¥100, what must £1 be worth in yen, and why?",
    options: ["¥100", "¥66.67", "¥150, otherwise triangular arbitrage would give riskless profit", "Any value; currencies are independent"],
    answer: 2,
    explanation: "£1 → $1.50 → ¥150. If £1 traded for more than ¥150, you'd sell £ for ¥, ¥ for $, $ for £ and repeat for profit; arbitrageurs keep the cross rate consistent.",
    optionExplanations: ["That ignores the £/$ rate.", "Inverted.", "Correct.", "Cross rates are linked by arbitrage."]
  },
  {
    id: "fin-futures-016", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "numerical",
    question: "A non-dividend stock trades at $40 and the risk-free rate is 5% (continuous). What is the fair 3-month forward price?",
    options: ["$40.00", "$40.50", "$42.00", "$40.13"],
    answer: 1,
    explanation: "F₀ = S₀e^(rT) = 40 × e^(0.05 × 0.25) = $40.50. The forward exceeds spot by the cost of financing the stock — that's not a profit opportunity.",
    optionExplanations: ["That ignores financing cost.", "Correct.", "That uses a full year at 5%.", "Wrong exponent."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-futures-017", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "numerical",
    question: "With S₀ = $40, r = 5% and T = 3 months (fair forward $40.50), the market forward is $43. What arbitrage do you do, and what's the profit per share at maturity?",
    options: ["Short the stock, lend, go long the forward; profit $2.50", "No arbitrage exists", "Buy the forward; profit $3", "Cash-and-carry: borrow $40, buy the stock, short the forward at $43; at maturity deliver, repay $40.50, profit $2.50"],
    answer: 3,
    explanation: "When F₀ > S₀e^(rT), the forward is too expensive: sell it and carry the asset. If F₀ < S₀e^(rT), do the reverse cash-and-carry (short the asset, invest the proceeds, buy the forward).",
    optionExplanations: ["That's for an underpriced forward.", "It's mispriced by $2.50.", "Buying the expensive forward loses.", "Correct."]
  },
  {
    id: "fin-futures-018", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "hard", type: "numerical",
    question: "A bond trades at $900 and pays a $40 coupon in 4 months. The 4-month rate is 3% and the 9-month rate is 4% (continuous). A 9-month forward trades at $870. What's the fair forward price, and the arbitrage?",
    options: ["$927.40; short the forward", "$870; no arbitrage", "About $886.60; the forward is cheap, so short the bond, invest the proceeds and go long the forward for about $16.60 profit", "About $886.60; buy the bond and short the forward"],
    answer: 2,
    explanation: "I = 40e^(−0.03×4/12) = $39.60. F₀ = (S₀ − I)e^(rT) = 860.40 × e^(0.04 × 0.75) = $886.60. The market price $870 is too low: reverse cash-and-carry earns 886.60 − 870 = $16.60.",
    optionExplanations: ["That ignores the coupon.", "It's mispriced.", "Correct.", "That's the trade for an overpriced forward."]
  },
  {
    id: "fin-futures-019", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "hard", type: "numerical",
    question: "A stock is at $50 and pays $0.75 dividends at 3, 6 and 9 months. With r = 8% (continuous), what's the 10-month forward price?",
    options: ["$53.43", "$50.00", "About $51.14", "About $48.84"],
    answer: 2,
    explanation: "I = 0.75(e^(−0.02) + e^(−0.04) + e^(−0.06)) = $2.162. F₀ = (50 − 2.162) × e^(0.08 × 10/12) = $51.14. Dividends go to the spot holder, not the forward holder, so they reduce the forward price.",
    optionExplanations: ["That ignores dividends.", "That ignores carry.", "Correct.", "That subtracts the dividends without the carry."]
  },
  {
    id: "fin-futures-020", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "numerical",
    question: "A stock index is at 5,000 with a dividend yield of 1.5% and a risk-free rate of 4.5% (both continuous). What is the 3-month futures price?",
    options: ["About 5,037.6", "About 5,056.6", "5,000", "About 4,981.3"],
    answer: 0,
    explanation: "F₀ = S₀e^((r − q)T) = 5,000 × e^(0.03 × 0.25) = 5,037.6. If q > r the futures would trade below spot.",
    optionExplanations: ["Correct.", "That ignores the dividend yield.", "That ignores carry.", "That reverses the sign of carry."]
  },
  {
    id: "fin-futures-021", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "numerical",
    question: "USD/INR spot is 83.00. The INR rate is 6.5% and the USD rate is 4.5% (continuous). What is the 1-year forward rate (INR per USD)?",
    options: ["About 84.68", "83.00", "About 81.36", "About 88.40"],
    answer: 0,
    explanation: "Covered interest parity: F₀ = S₀e^((r_dom − r_for)T) = 83 × e^(0.02) = 84.68. The higher-interest currency (INR) trades at a forward discount; the foreign interest rate acts like a dividend yield.",
    optionExplanations: ["Correct.", "That ignores the rate differential.", "Wrong direction.", "That adds the rates."]
  },
  {
    id: "fin-futures-022", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "concept",
    question: "Why can't you use the cash-and-carry equality F₀ = (S₀ + C)e^(rT) to price crude-oil futures as precisely as gold futures?",
    options: ["Oil has no storage costs", "Gold isn't an investment asset", "Oil is a consumption asset: refiners holding it won't sell inventory to buy futures, so the reverse arbitrage fails and only an upper bound F₀ ≤ (S₀ + C)e^(rT) holds; the gap is the convenience yield", "Futures on oil don't exist"],
    answer: 2,
    explanation: "Including the convenience yield: F₀ = S₀e^((r + u − y)T). Gold is held by investors, so arbitrage works in both directions.",
    optionExplanations: ["Storage is costly.", "Gold is a classic investment asset.", "Correct.", "They're among the most traded."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-futures-023", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "hard", type: "numerical",
    question: "A commodity has spot 100, r = 5%, storage cost u = 2% and convenience yield y = 10% (all continuous, per year). What's the 1-year futures price, and what is the curve shape?",
    options: ["107.25; contango", "About 103.05; contango", "100; flat", "About 97.04; backwardation, because y > r + u"],
    answer: 3,
    explanation: "F₀ = 100 × e^((0.05 + 0.02 − 0.10) × 1) = 100e^(−0.03) = 97.04 < spot. A high convenience yield (tight inventories) produces backwardation. Without it: 100e^(0.07) = 107.25 (contango).",
    optionExplanations: ["That ignores the convenience yield.", "That flips the sign of the net carry (−3%).", "Carry isn't zero.", "Correct."]
  },
  {
    id: "fin-futures-024", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "hard", type: "numerical",
    question: "You hold a long forward on a non-dividend stock with delivery price K = $24 and 6 months left. The stock is now $25 and r = 10% (continuous). What is the contract worth?",
    options: ["$1.00", "About $2.17", "$0", "About $3.26"],
    answer: 1,
    explanation: "V = S − Ke^(−r(T−t)) = 25 − 24e^(−0.05) = 25 − 22.83 = $2.17. Equivalently V = (F_t − K)e^(−r(T−t)), where F_t = 25e^(0.05) = 26.28. The forward PRICE changes with the market; the contract VALUE is zero only at inception.",
    optionExplanations: ["That ignores discounting K.", "Correct.", "Only at inception.", "Wrong arithmetic."]
  },
  {
    id: "fin-futures-025", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "hard", type: "concept",
    question: "When are futures prices equal to forward prices, and how do they differ otherwise?",
    options: ["Always equal", "Forwards are always higher", "Futures are always higher", "Equal when interest rates are constant (or known). If the asset price is positively correlated with interest rates, futures prices exceed forward prices (gains from daily settlement get reinvested at higher rates); with negative correlation, futures are lower"],
    answer: 3,
    explanation: "For short-dated contracts the difference is negligible. For long-dated interest-rate futures it matters (the convexity adjustment).",
    optionExplanations: ["Not with stochastic rates.", "Depends on correlation.", "Depends on correlation.", "Correct."]
  },
  {
    id: "fin-futures-026", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "concept",
    question: "A trader's system books F₀ − S₀ as profit when buying zero-coupon bonds spot and selling them forward. What's wrong (the Kidder Peabody lesson)?",
    options: ["Nothing; it is genuine arbitrage profit", "F₀ > S₀ is just the cost of financing (F₀ = S₀e^(rT)); booking it as profit ignores the funding cost, creating phantom gains", "Forward prices are always below spot", "Zero-coupon bonds can't be traded forward"],
    answer: 1,
    explanation: "Joseph Jett's 'profits' were the carry on rolled forward trades; the real loss was about $350m.",
    optionExplanations: ["The funding cost offsets it exactly.", "Correct.", "For a no-income asset, the forward is above spot.", "They can."]
  },
  {
    id: "fin-futures-027", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "easy", type: "concept",
    question: "What are contango and backwardation, and how do they affect a long investor who keeps rolling futures?",
    options: ["Both mean futures equal spot", "They only apply to stock indices", "Contango gives positive roll yield", "Contango: later-dated futures are priced higher (upward-sloping curve), so rolling long positions sells cheap and buys dear (negative roll yield). Backwardation: later-dated futures are cheaper, giving positive roll yield"],
    answer: 3,
    explanation: "Contango occurs when r + u > y (storage and financing dominate); backwardation when convenience yield dominates, often with tight inventories. Commodity ETFs in steep contango can lose money even if spot is flat.",
    optionExplanations: ["They describe curve slope.", "Mostly commodities, but any futures curve.", "Contango costs a long roller.", "Correct."]
  },
  {
    id: "fin-futures-028", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "concept",
    question: "What is the Samuelson effect in futures markets?",
    options: ["Futures prices always rise over time", "Futures volatility rises with maturity", "Spot and futures are uncorrelated", "Volatility is highest for near-dated contracts and declines with maturity, because supply-demand shocks to spot tend to dissipate before distant delivery dates"],
    answer: 3,
    explanation: "This matters when choosing which contract month to hedge with and when sizing calendar-spread risk.",
    optionExplanations: ["Not the effect.", "Reversed.", "They're highly correlated.", "Correct."]
  },
  {
    id: "fin-futures-029", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "numerical",
    question: "You buy the December crude contract at $75 and sell the March contract at $77 (1,000 barrels each). Later, December is $80 and March is $79. What's your P&L?",
    options: ["+$5,000", "+$7,000", "−$2,000", "+$3,000"],
    answer: 3,
    explanation: "Long December: +5 × 1,000 = +$5,000. Short March: −(79 − 77) × 1,000 = −$2,000. Net +$3,000. This bull (long nearby/short deferred) calendar spread profits because the nearby rose relative to the deferred, as in a tightening market.",
    optionExplanations: ["That ignores the short leg.", "That adds the legs incorrectly.", "That's only the short leg.", "Correct."]
  },
  {
    id: "fin-futures-030", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "numerical",
    question: "Crude oil is $80/bbl, gasoline $95/bbl and heating oil $90/bbl. What is the 3:2:1 crack spread, and how would a refiner hedge its margin?",
    options: ["$15; buy the crack spread", "$105; sell crude futures only", "About $13.33/bbl; sell the crack spread (short products, long crude) to lock in the margin", "$10; buy gasoline futures only"],
    answer: 2,
    explanation: "(2 × 95 + 1 × 90)/3 − 80 = 280/3 − 80 = $13.33 per barrel of gross refining margin. A refiner is naturally long the spread (buys crude, sells products), so it hedges by selling it. The soybean crush spread (meal + oil − beans) is the agricultural analogue.",
    optionExplanations: ["Wrong value and direction.", "Wrong formula.", "Correct.", "Wrong formula."]
  },
  {
    id: "fin-futures-031", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "numerical",
    question: "A farmer shorts corn futures at $4.50 to hedge a harvest. When the hedge is closed, spot is $4.10 and the futures price is $4.20. What is the effective price received, and what is the closing basis?",
    options: ["$4.50; basis 0", "$4.10; basis +$0.10", "$4.40; basis −$0.10", "$4.20; basis −$0.30"],
    answer: 2,
    explanation: "Sell crop at spot: $4.10. Futures gain: 4.50 − 4.20 = $0.30. Effective price = $4.40 = F₁ + b₂, where the closing basis b₂ = S − F = 4.10 − 4.20 = −$0.10. Uncertainty in b₂ is basis risk; at the futures expiry it converges to zero.",
    optionExplanations: ["Only if the basis were zero at close.", "That ignores the futures gain.", "Correct.", "Wrong arithmetic."]
  },
  {
    id: "fin-futures-032", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "easy", type: "concept",
    question: "Which is NOT a source of basis risk?",
    options: ["Hedging jet fuel with crude-oil futures (asset mismatch)", "The hedge horizon ending before the futures expiry (maturity mismatch)", "Delivery location and grade differences", "Hedging a gold position with gold futures that expire on exactly the hedge date, for the exact quantity"],
    answer: 3,
    explanation: "When the asset, quantity and date match perfectly, the basis converges to zero at expiry and the hedge is (theoretically) perfect. Mismatches in asset, maturity, grade/location, contract size or timing all leave basis risk.",
    optionExplanations: ["Cross-hedging creates basis risk.", "Maturity mismatch creates basis risk.", "Grade and location differentials create basis risk.", "Correct: a perfect match leaves no basis risk."]
  },
  {
    id: "fin-futures-033", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "hard", type: "numerical",
    question: "An airline will buy 2 million gallons of jet fuel and hedges with heating-oil futures (42,000 gallons each). σ(ΔS) = 0.0263, σ(ΔF) = 0.0313, correlation 0.928. What's the minimum-variance hedge ratio and the number of contracts?",
    options: ["1.0 and 48 contracts", "0.928 and 44 contracts", "About 0.78 and about 37 contracts", "About 1.10 and 52 contracts"],
    answer: 2,
    explanation: "h* = ρσ_S/σ_F = 0.928 × 0.0263/0.0313 = 0.78. N* = h* × Q_A/Q_F = 0.78 × 2,000,000/42,000 = 37.1 → 37 contracts. Hedge effectiveness = ρ² = 0.86 (86% of variance removed).",
    optionExplanations: ["A 1:1 hedge ignores the volatility ratio and correlation.", "ρ alone isn't the ratio.", "Correct.", "Inverted volatility ratio."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-futures-034", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "hard", type: "concept",
    question: "In the minimum-variance hedge, Var(hedged) = Q²σ_S²(1 − ρ²). What does this imply about hedge effectiveness, and how is h* estimated in practice?",
    options: ["Effectiveness = ρ; use price levels", "Effectiveness = 1 − ρ", "Effectiveness is always 100%", "Effectiveness = ρ² (the R² of regressing ΔS on ΔF); estimate h* as the OLS slope using price CHANGES or returns, not levels (levels give spurious regressions)"],
    answer: 3,
    explanation: "With ρ = 0.95, 90.25% of variance is removed. Correlations can break down in stress, so estimates use rolling or EWMA windows; with several hedging instruments, multi-factor OLS (or ridge/PCA to handle multicollinearity) generalises the idea.",
    optionExplanations: ["It's ρ², and levels are wrong.", "Wrong formula.", "Basis risk remains unless ρ = 1.", "Correct."]
  },
  {
    id: "fin-futures-035", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "medium", type: "numerical",
    question: "A $10m equity portfolio has beta 1.3. Index futures are at 5,000 with a $50 multiplier. How many contracts fully hedge market risk, and how many reduce beta to 0.5?",
    options: ["Short 40; short 20", "Short 52; short 32", "Short 26; short 16", "Long 52; long 32"],
    answer: 1,
    explanation: "One contract = 5,000 × $50 = $250,000. Full hedge: N = −β × P/F = −1.3 × 10m/250k = −52 (short 52). To reach β = 0.5: N = (0.5 − 1.3) × 10m/250k = −32. What remains is idiosyncratic return (alpha).",
    optionExplanations: ["That ignores beta.", "Correct.", "Wrong contract value.", "Hedging a long portfolio requires shorting."]
  },
  {
    id: "fin-futures-036", subject: "finance", subtopic: "Futures, Forwards & Hedging", difficulty: "hard", type: "concept",
    question: "What does 'tailing the hedge' adjust for?",
    options: ["Fat tails in returns", "Daily settlement: futures gains and losses are paid in cash daily and can be reinvested or must be financed, whereas the exposure being hedged pays at the horizon. The number of contracts is scaled down by roughly e^(−r(T−t)) (or computed using dollar values)", "The bid-ask spread", "Dividend timing only"],
    answer: 1,
    explanation: "For short horizons or low rates the adjustment is small; for long-dated hedges at high rates (e.g. 1 year at 5%) it's about 5% fewer contracts.",
    optionExplanations: ["Not about distributions.", "Correct.", "Not about costs.", "Not specifically."]
  }
);
