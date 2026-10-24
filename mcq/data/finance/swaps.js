/* Finance — Swaps */
window.QUESTIONS.push(
  {
    id: "fin-swaps-001", subject: "finance", subtopic: "Swaps", difficulty: "easy", type: "concept",
    question: "In a plain vanilla interest rate swap, what is exchanged?",
    options: ["Net interest payments: one party pays a fixed rate and receives a floating rate (e.g. SOFR) on the same notional, which itself is never exchanged", "The notional principal at the start and end", "Shares for bonds", "Two currencies at spot"],
    answer: 0,
    explanation: "Only the difference changes hands each period: (fixed − floating) × notional × day-count fraction. The fixed payer gains if rates rise; the fixed receiver gains if rates fall.",
    optionExplanations: ["Correct.", "That happens in currency swaps, not vanilla IRS.", "Not a swap of this kind.", "That's an FX transaction."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-swaps-002", subject: "finance", subtopic: "Swaps", difficulty: "easy", type: "numerical",
    question: "A swap has $100m notional, fixed rate 4.5%, semi-annual payments (α = 0.5). This period SOFR is 3.8%. What is the net payment?",
    options: ["$700,000 from the fixed payer", "$4.5m from the fixed payer", "$350,000 from the floating payer", "$350,000 from the fixed payer to the floating payer"],
    answer: 3,
    explanation: "Net = (4.5% − 3.8%) × $100m × 0.5 = $350,000, paid by the fixed-rate payer because fixed > floating. If SOFR later resets to 5.2%, the fixed payer receives $350,000.",
    optionExplanations: ["That forgets the half-year fraction.", "That's a gross annual fixed payment, not the net.", "Wrong direction.", "Correct."]
  },
  {
    id: "fin-swaps-003", subject: "finance", subtopic: "Swaps", difficulty: "medium", type: "concept",
    question: "A company has floating-rate debt and fears rising interest rates. Which swap hedges this?",
    options: ["Receive fixed, pay floating", "Pay fixed, receive floating: the floating receipts offset the floating debt payments, leaving a fixed net cost", "A currency swap", "No swap can help"],
    answer: 1,
    explanation: "Similarly, a bank funding fixed-rate mortgages with short-term deposits loses when rates rise, so it hedges by paying fixed. A pension fund that wants more duration to match long liabilities receives fixed instead.",
    optionExplanations: ["That increases exposure to rising rates.", "Correct.", "There's no currency risk here.", "Swaps are the standard tool."]
  },
  {
    id: "fin-swaps-004", subject: "finance", subtopic: "Swaps", difficulty: "medium", type: "concept",
    question: "How can a receive-fixed interest rate swap be decomposed into bonds?",
    options: ["Long a floating-rate bond and short a fixed-rate bond", "Long a fixed-rate bond and short a floating-rate bond with the same notional and dates (equivalently, a series of FRAs)", "Two zero-coupon bonds", "A stock and a bond"],
    answer: 1,
    explanation: "Receive fixed = receive the fixed bond's coupons, pay the floating bond's coupons; the principals cancel. So V(receive fixed) = B_fixed − B_floating. A pay-fixed swap is the reverse.",
    optionExplanations: ["That's pay-fixed.", "Correct.", "Not the decomposition.", "No equity involved."]
  },
  {
    id: "fin-swaps-005", subject: "finance", subtopic: "Swaps", difficulty: "medium", type: "concept",
    question: "Why is a floating-rate bond worth par immediately after each coupon reset?",
    options: ["Because its next coupon is reset to the current market rate, so it is like a short-term deposit rolled over at market rates; discounting market-rate cash flows at market rates gives par. So PV(floating leg) = 1 − P(0, t_N) per unit notional", "Because floating rates never change", "Because it has no credit risk", "Because it pays no coupons"],
    answer: 0,
    explanation: "This simplification makes swap pricing a matter of valuing only the fixed leg.",
    optionExplanations: ["Correct.", "They change every period.", "This assumes the floating index matches the discount curve.", "It pays coupons."]
  },
  {
    id: "fin-swaps-006", subject: "finance", subtopic: "Swaps", difficulty: "hard", type: "numerical",
    question: "A 2-year semi-annual swap has discount factors 0.9814, 0.9624, 0.9430 and 0.9238 at 0.5, 1, 1.5 and 2 years. What is the par swap rate?",
    options: ["3.81%", "About 3.92%", "4.05%", "About 4.00%"],
    answer: 3,
    explanation: "S = (1 − P(0, t_N)) / Σ αᵢP(0, tᵢ). Annuity = 0.5 × (0.9814 + 0.9624 + 0.9430 + 0.9238) = 1.9053. S = (1 − 0.9238)/1.9053 = 0.0762/1.9053 ≈ 4.00%.",
    optionExplanations: ["That's close to the shortest rate.", "Wrong arithmetic.", "That's the longest zero rate.", "Correct."]
  },
  {
    id: "fin-swaps-007", subject: "finance", subtopic: "Swaps", difficulty: "medium", type: "numerical",
    question: "Annual discount factors are P(0,1) = 0.96 and P(0,2) = 0.92. What is the 2-year annual-pay par swap rate?",
    options: ["About 4.26%", "4.00%", "8.00%", "About 4.17%"],
    answer: 0,
    explanation: "S = (1 − 0.92)/(0.96 + 0.92) = 0.08/1.88 = 4.255%. The swap rate is the coupon that makes a fixed-rate bond price at par.",
    optionExplanations: ["Correct.", "Wrong arithmetic.", "That's the 2-year total, not annual.", "Wrong arithmetic."]
  },
  {
    id: "fin-swaps-008", subject: "finance", subtopic: "Swaps", difficulty: "hard", type: "numerical",
    question: "The 1-year annual swap rate is 3% and the 2-year annual swap rate is 4%. Bootstrap the discount factors P(0,1) and P(0,2).",
    options: ["0.9709 and 0.9246", "0.9615 and 0.9246", "0.97 and 0.92", "0.9709 and about 0.9242"],
    answer: 3,
    explanation: "Par swaps price like par bonds. 1Y: 1 = 1.03 × P₁ → P₁ = 0.97087. 2Y: 1 = 0.04P₁ + 1.04P₂ → P₂ = (1 − 0.04 × 0.97087)/1.04 = 0.92420. Bootstrapping continues maturity by maturity to build the discount curve.",
    optionExplanations: ["P₂ is slightly off: 1/1.04² treats 4% as a zero rate.", "P₁ uses 4% wrongly.", "Rounded guesses.", "Correct."]
  },
  {
    id: "fin-swaps-009", subject: "finance", subtopic: "Swaps", difficulty: "hard", type: "numerical",
    question: "Two years ago you entered a 5-year pay-fixed swap at 4.0% on $100m. Today the 3-year swap rate is 5.2%, and the remaining annuity factor is 2.78. What's your swap worth?",
    options: ["−$3.34m", "+$1.2m", "About +$3.34m", "$0"],
    answer: 2,
    explanation: "V(pay fixed) = (S_current − S_contract) × annuity × notional = (5.2% − 4.0%) × 2.78 × $100m = $3.336m. You pay 4% when the market rate is 5.2%, so the swap is an asset.",
    optionExplanations: ["Wrong sign: paying below market is a gain.", "That ignores the annuity factor.", "Correct.", "Rates have moved since inception."]
  },
  {
    id: "fin-swaps-010", subject: "finance", subtopic: "Swaps", difficulty: "medium", type: "numerical",
    question: "A $100m 5-year swap has an annuity factor (Σ αᵢPᵢ) of about 4.5. What is its approximate DV01?",
    options: ["$45,000", "$4,500", "$450,000", "$450"],
    answer: 0,
    explanation: "DV01 ≈ annuity × notional × 0.0001 = 4.5 × $100m × 0.0001 = $45,000 per basis point. Rates desks aggregate risk in DV01 across tenors.",
    optionExplanations: ["Correct.", "Off by a factor of 10.", "Off by a factor of 10.", "Off by a factor of 100."]
  },
  {
    id: "fin-swaps-011", subject: "finance", subtopic: "Swaps", difficulty: "medium", type: "numerical",
    question: "A floating payment accrues 4% on $100m over 181 days. What is the payment under ACT/360 vs ACT/365?",
    options: ["$2,000,000 under both", "About $1,983,562 under ACT/360 vs about $2,011,111 under ACT/365", "About $2,011,111 under ACT/360 vs about $1,983,562 under ACT/365", "$4,000,000 under both"],
    answer: 2,
    explanation: "ACT/360: 100m × 4% × 181/360 = $2,011,111. ACT/365: × 181/365 = $1,983,562. Day-count conventions (USD SOFR legs use ACT/360; fixed legs often 30/360) change real cash flows.",
    optionExplanations: ["That uses exactly half a year.", "Swapped.", "Correct.", "That's a full year."]
  },
  {
    id: "fin-swaps-012", subject: "finance", subtopic: "Swaps", difficulty: "medium", type: "concept",
    question: "What is the swap spread?",
    options: ["The bid-ask spread on swaps", "The difference between two floating rates", "The swap rate minus the government bond yield of the same maturity; historically positive (bank credit in the floating index), but long-dated USD spreads turned negative after 2008 because balance-sheet constraints limited arbitrage", "The dealer's commission"],
    answer: 2,
    explanation: "Swap spreads are watched as indicators of bank credit and funding conditions.",
    optionExplanations: ["Not the definition.", "That's a basis.", "Correct.", "Not the definition."]
  },
  {
    id: "fin-swaps-013", subject: "finance", subtopic: "Swaps", difficulty: "hard", type: "numerical",
    question: "AAA Corp can borrow fixed at 4.0% or floating at SOFR + 0.3%; BBB Corp at 5.2% fixed or SOFR + 1.0%. AAA wants floating and BBB wants fixed. What is the total potential gain from a swap, and who should borrow in which market?",
    options: ["1.2%; both borrow fixed", "0.7%; AAA borrows floating, BBB borrows fixed", "0.5%; AAA borrows fixed, BBB borrows floating, then they swap", "No gain, since AAA is cheaper in both markets"],
    answer: 2,
    explanation: "AAA's advantage is 1.2% in fixed but only 0.7% in floating; the difference, 1.2% − 0.7% = 0.5%, is the total gain shared among AAA, BBB and the dealer. Each borrows where its RELATIVE advantage is greatest. Hull's critique: part of this 'gain' reflects different credit risk in fixed vs floating lending.",
    optionExplanations: ["1.2% is AAA's fixed-market advantage, not the gain.", "That's the wrong way round.", "Correct.", "Comparative, not absolute, advantage matters."]
  },
  {
    id: "fin-swaps-014", subject: "finance", subtopic: "Swaps", difficulty: "medium", type: "concept",
    question: "Why did markets move from LIBOR to SOFR?",
    options: ["SOFR has a higher rate", "LIBOR was based on bank submissions (not transactions) and was manipulated, both by traders and by banks lowballing during the 2008 crisis; SOFR is based on about $1 trillion a day of actual overnight Treasury repo transactions, so it is secured and near risk-free", "SOFR includes more credit risk", "LIBOR was too volatile"],
    answer: 1,
    explanation: "Legacy contracts moved to SOFR plus a fixed credit spread adjustment (e.g. about 26bp for 3-month USD LIBOR). SOFR is overnight and backward-looking (compounded in arrears); Term SOFR provides forward-looking rates for loans.",
    optionExplanations: ["SOFR is structurally lower.", "Correct.", "Reversed.", "The problem was manipulation and lack of transactions."]
  },
  {
    id: "fin-swaps-015", subject: "finance", subtopic: "Swaps", difficulty: "medium", type: "concept",
    question: "How does a fixed-for-fixed currency swap differ from a vanilla interest rate swap?",
    options: ["It doesn't", "Only interest is exchanged, in one currency", "Principals in the two currencies are exchanged at the start and re-exchanged at maturity at the ORIGINAL rate, with interest paid in each currency in between; in an IRS, the notional is never exchanged", "It must use floating rates"],
    answer: 2,
    explanation: "Uses: issue debt where a firm has name recognition and swap it back to its home currency, or hedge foreign revenues. An FX swap is different: a short-dated spot plus forward exchange of principal only.",
    optionExplanations: ["They differ.", "That's an IRS.", "Correct.", "Fixed-for-fixed exists."]
  },
  {
    id: "fin-swaps-016", subject: "finance", subtopic: "Swaps", difficulty: "medium", type: "numerical",
    question: "EUR/USD spot is 1.10 (USD per EUR). One-year rates are 5% in USD and 3% in EUR (annual compounding). What is the 1-year forward rate under covered interest parity?",
    options: ["About 1.1214", "1.10", "About 1.0790", "1.1220"],
    answer: 0,
    explanation: "F = S × (1 + r_USD)/(1 + r_EUR) = 1.10 × 1.05/1.03 = 1.1214. The higher-yielding USD trades at a forward discount (more USD per EUR forward). Post-2008, a persistent cross-currency basis appeared as balance-sheet costs limited CIP arbitrage.",
    optionExplanations: ["Correct.", "That ignores the rate differential.", "Inverted rates.", "That adds the 2% differential to the spot rate."]
  },
  {
    id: "fin-swaps-017", subject: "finance", subtopic: "Swaps", difficulty: "hard", type: "concept",
    question: "What is CVA on a swap, and when is it largest?",
    options: ["A tax on swaps", "The initial margin", "The bid-ask spread", "Credit Valuation Adjustment: the expected loss from counterparty default, ≈ LGD × Σ EE(tᵢ) × PD(tᵢ₋₁, tᵢ). It is largest when the swap is (or is expected to be) deep in-the-money to you and the counterparty's default probability is high — especially with wrong-way risk"],
    answer: 3,
    explanation: "It is part of the XVA family (DVA, FVA, MVA, KVA). Collateral (CSA) and central clearing reduce expected exposure and hence CVA.",
    optionExplanations: ["Not a tax.", "Margin reduces CVA but isn't CVA.", "Not the spread.", "Correct."]
  },
  {
    id: "fin-swaps-018", subject: "finance", subtopic: "Swaps", difficulty: "hard", type: "numerical",
    question: "A receive-fixed swap has 2 annual payments left at a 5% fixed rate (notional 1) and is at a reset date. Discount factors are 0.96 and 0.92. What is the swap worth to the fixed receiver?",
    options: ["0", "+0.05 per unit notional", "−0.014 per unit notional", "+0.014 per unit notional"],
    answer: 3,
    explanation: "Fixed-bond value = 0.05 × 0.96 + 1.05 × 0.92 = 0.048 + 0.966 = 1.014. Floating bond = 1 (par at reset). Value = 1.014 − 1 = +0.014. The 5% fixed rate exceeds the current par swap rate (4.26%), so receiving it is valuable.",
    optionExplanations: ["Rates have moved.", "That's one coupon.", "Wrong sign.", "Correct."]
  },
  {
    id: "fin-swaps-019", subject: "finance", subtopic: "Swaps", difficulty: "medium", type: "concept",
    question: "What is the multi-curve framework used since 2008?",
    options: ["Discounting cash flows with the OIS (e.g. SOFR) curve, while using separate projection curves to forecast each floating index tenor (1M, 3M, 6M)", "Using one curve for everything", "Using a different curve for every counterparty", "Ignoring the yield curve"],
    answer: 0,
    explanation: "Before 2008, LIBOR served both purposes. The crisis showed that tenor basis spreads and collateralised (OIS) discounting matter.",
    optionExplanations: ["Correct.", "That's the pre-2008 approach.", "Not the framework.", "The curve is central."]
  },
  {
    id: "fin-swaps-020", subject: "finance", subtopic: "Swaps", difficulty: "easy", type: "concept",
    question: "After inception, rates fall sharply. Who gains on an existing plain vanilla swap?",
    options: ["The fixed payer", "The fixed receiver: they keep receiving the old, now above-market fixed rate", "Neither; swaps are always worth zero", "Both equally"],
    answer: 1,
    explanation: "A receive-fixed swap behaves like being long a fixed-rate bond: it gains when rates fall. Pay-fixed gains when rates rise.",
    optionExplanations: ["They lose.", "Correct.", "Only at inception.", "It's zero-sum."]
  },
  {
    id: "fin-swaps-021", subject: "finance", subtopic: "Swaps", difficulty: "medium", type: "concept",
    question: "How do swap dealers manage the market risk of swaps they trade with clients?",
    options: ["They take all positions outright", "They run a matched book: offsetting client trades against each other or hedging residual DV01 in the interbank/cleared market, earning the bid-offer spread; most standardised swaps are now centrally cleared", "They refuse to trade", "They hold matching bonds only"],
    answer: 1,
    explanation: "Corporates rarely swap directly with each other; dealers intermediate and warehouse risk temporarily.",
    optionExplanations: ["Dealers aim to be flat.", "Correct.", "Not the business model.", "Bonds are only one hedge."]
  },
  {
    id: "fin-swaps-022", subject: "finance", subtopic: "Swaps", difficulty: "easy", type: "concept",
    question: "What is a credit default swap (CDS)?",
    options: ["An interest rate swap with a bank", "Insurance-like protection against a reference entity's default: the buyer pays a periodic premium (spread) and receives a payment (par minus recovery) if a credit event occurs", "A swap of two currencies", "A swap of equity returns"],
    answer: 1,
    explanation: "CDS spreads are market measures of credit risk. Buying protection from a dealer that may itself default in a crisis creates wrong-way risk (AIG in 2008).",
    optionExplanations: ["Not an IRS.", "Correct.", "That's a currency swap.", "That's a total return swap."]
  }
);
