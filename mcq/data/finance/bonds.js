/* Finance — Bonds, Yields & Term Structure */
window.QUESTIONS.push(
  {
    id: "fin-bonds-001", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "easy", type: "concept",
    question: "What are a bond's face value, coupon rate and yield to maturity (YTM)?",
    options: ["Face (par) value is repaid at maturity; the coupon rate × face value gives the fixed periodic interest; YTM is the single discount rate that equates the PV of all remaining cash flows to the current price — the return if held to maturity with coupons reinvested at the YTM", "They're all the same rate", "YTM is the coupon divided by face value", "Face value is the market price"],
    answer: 0,
    explanation: "Buying a bond means lending to the issuer. The coupon is fixed at issue; YTM changes daily with the market price.",
    optionExplanations: ["Correct.", "They differ.", "That's the coupon rate.", "Price differs from face value."]
  },
  {
    id: "fin-bonds-002", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "medium", type: "numerical",
    question: "A 3-year bond with face value $1,000 pays a 6% annual coupon. If the market yield is 8%, what is its price?",
    options: ["$948.46", "$1,000.00", "$1,055.50", "$940.00"],
    answer: 0,
    explanation: "P = 60/1.08 + 60/1.08² + 1,060/1.08³ = 55.56 + 51.44 + 841.46 = $948.46. Yield > coupon → the bond trades at a discount.",
    optionExplanations: ["Correct.", "Par only when yield = coupon.", "That's the price at a 4% yield.", "Wrong arithmetic."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-bonds-003", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "easy", type: "concept",
    question: "A bond's coupon rate is 6%. When does it trade at a premium, at par and at a discount?",
    options: ["Premium when YTM > 6%; discount when YTM < 6%", "Always at par", "Premium when YTM < 6%; par when YTM = 6%; discount when YTM > 6%", "Premium only if the issuer is AAA"],
    answer: 2,
    explanation: "Prices and yields move inversely. If new bonds yield 7%, an existing 6% bond must be cheaper to compete; if they yield 4%, it's worth more.",
    optionExplanations: ["Reversed.", "Prices move with yields.", "Correct.", "Rating affects yield, not this rule."]
  },
  {
    id: "fin-bonds-004", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "medium", type: "numerical",
    question: "A 5-year bond with an 8% coupon paid semi-annually and face $1,000 is priced at a 6% yield (3% per half-year). What's its price?",
    options: ["$1,084.25", "$1,085.30", "$1,000.00", "$1,042.65"],
    answer: 1,
    explanation: "10 coupons of $40 discounted at 3%, plus $1,000 at period 10: 40 × 8.5302 + 1,000 × 0.74409 = 341.21 + 744.09 = $1,085.30.",
    optionExplanations: ["That uses annual compounding.", "Correct.", "Coupon exceeds yield, so it's above par.", "Wrong arithmetic."]
  },
  {
    id: "fin-bonds-005", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "easy", type: "numerical",
    question: "A bond with a $60 annual coupon trades at $950. What is its current yield, and why can it differ from YTM?",
    options: ["About 6.32%; current yield ignores the gain from the price rising to $1,000 at maturity (and timing), which YTM includes", "6.00%; it can't", "6.32%; YTM ignores coupons", "5.70%"],
    answer: 0,
    explanation: "Current yield = annual coupon / price = 60/950 = 6.32%. For a discount bond, YTM > current yield > coupon rate.",
    optionExplanations: ["Correct.", "That's the coupon rate.", "YTM includes coupons.", "Inverted."]
  },
  {
    id: "fin-bonds-006", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "easy", type: "numerical",
    question: "What is the price of a 5-year zero-coupon bond with face value $1,000 at a 6% yield (annual compounding)?",
    options: ["$700.00", "$943.40", "$747.26", "$1,000.00"],
    answer: 2,
    explanation: "P = F/(1 + y)ⁿ = 1,000/1.06⁵ = $747.26. Zeros pay nothing until maturity, so they're sold at a deep discount and have duration equal to maturity.",
    optionExplanations: ["That's simple discounting.", "That's one year.", "Correct.", "That ignores discounting."]
  },
  {
    id: "fin-bonds-007", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "hard", type: "numerical",
    question: "A 10-year, 8% annual-coupon bond trades at $1,100. It's callable in 5 years at $1,050. Its YTM is about 6.60% and its yield to call is about 6.47%. What is its yield to worst, and why does it matter?",
    options: ["About 6.47%: investors should assume the issuer calls when that's worse for them (likely when rates fall), so the lowest yield is the realistic one", "6.60%, the higher yield", "8%, the coupon", "7.27%"],
    answer: 0,
    explanation: "YTW = min(YTM, YTCs). Callable bonds offer higher yields than comparable non-callable bonds to compensate for this reinvestment risk. Call premium = call price − par = $50.",
    optionExplanations: ["Correct.", "The call can cut returns.", "Not a yield measure here.", "Not computed from these figures."]
  },
  {
    id: "fin-bonds-008", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "medium", type: "numerical",
    question: "A bond pays $30 semi-annual coupons. 60 days have passed in a 182-day coupon period, and the quoted (clean) price is $980. What does a buyer actually pay?",
    options: ["$980.00", "About $970.11", "$1,010.00", "About $989.89"],
    answer: 3,
    explanation: "Accrued interest = 30 × 60/182 = $9.89, owed to the seller for the time they held the bond. Dirty (invoice) price = clean + accrued = $989.89. Clean prices are quoted so prices don't jump on coupon dates.",
    optionExplanations: ["That ignores accrued interest.", "Wrong sign.", "That adds a full coupon.", "Correct."]
  },
  {
    id: "fin-bonds-009", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "hard", type: "numerical",
    question: "A 3-year 6% annual-coupon bond yields 8% (price $948.46). Its Macaulay duration is about 2.83 years. What's its modified duration, and the estimated price change if yields rise by 50bp?",
    options: ["2.83; −$13.42", "About 2.62; about −$12.42", "About 3.06; about −$14.51", "About 2.62; about +$12.42"],
    answer: 1,
    explanation: "Modified duration = Macaulay/(1 + y) = 2.8286/1.08 = 2.619. ΔP ≈ −D_mod × Δy × P = −2.619 × 0.005 × 948.46 = −$12.42.",
    optionExplanations: ["Use modified duration for price sensitivity.", "Correct.", "That multiplies by 1.08.", "Prices fall when yields rise."]
  },
  {
    id: "fin-bonds-010", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "medium", type: "concept",
    question: "Which bond is MOST sensitive to a change in interest rates?",
    options: ["A 2-year, 8% coupon bond", "A 10-year, 10% coupon bond", "A 30-year zero-coupon bond", "A 1-year Treasury bill"],
    answer: 2,
    explanation: "Sensitivity (duration) rises with maturity and falls with coupon; a zero's duration equals its maturity (30 years). Lower yields also increase sensitivity.",
    optionExplanations: ["Short maturity, high coupon: low duration.", "High coupons shorten duration.", "Correct.", "Very short."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-bonds-011", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "hard", type: "numerical",
    question: "A bond has modified duration 7 and convexity 60. Estimate the percentage price change for a +1% (100bp) rise in yields.",
    options: ["About −6.7%", "−7.0%", "About −7.3%", "+6.7%"],
    answer: 0,
    explanation: "ΔP/P ≈ −D_mod·Δy + ½·C·(Δy)² = −7% + 0.5 × 60 × 0.0001 = −7% + 0.3% = −6.7%. Positive convexity makes losses smaller and gains larger than duration alone predicts.",
    optionExplanations: ["Correct.", "Duration only.", "Wrong sign on the convexity term.", "Prices fall when yields rise."]
  },
  {
    id: "fin-bonds-012", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "easy", type: "concept",
    question: "What does an inverted yield curve mean?",
    options: ["Long-term yields exceed short-term yields", "All yields are zero", "Short-term yields exceed long-term yields — often read as a signal that markets expect rate cuts and an economic slowdown or recession", "Bond prices are rising"],
    answer: 2,
    explanation: "A normal curve slopes upward (term premium, growth/inflation expectations); a flat curve signals uncertainty or transition. Inversions of the 2s10s spread have preceded many US recessions.",
    optionExplanations: ["That's normal.", "Not the meaning.", "Correct.", "Unrelated."]
  },
  {
    id: "fin-bonds-013", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "medium", type: "concept",
    question: "Which term-structure theory says long rates reflect expected future short rates PLUS a premium for holding longer maturities?",
    options: ["Pure expectations theory", "Market segmentation theory", "Liquidity preference theory", "Efficient market hypothesis"],
    answer: 2,
    explanation: "Pure expectations: long rates are just averages of expected short rates. Liquidity preference adds a term premium, explaining why curves usually slope upward. Market segmentation: separate supply and demand in each maturity segment set rates (preferred habitat is a softer version).",
    optionExplanations: ["No premium.", "Segments are independent.", "Correct.", "Not a yield-curve theory."]
  },
  {
    id: "fin-bonds-014", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "medium", type: "numerical",
    question: "The 1-year spot rate is 5% and the 2-year spot rate is 6% (annual compounding). What is the implied 1-year forward rate starting in 1 year?",
    options: ["5.5%", "About 7.01%", "6.0%", "1.0%"],
    answer: 1,
    explanation: "(1 + s₂)² = (1 + s₁)(1 + f₁,₂) → f = 1.06²/1.05 − 1 = 1.1236/1.05 − 1 = 7.01%. Investing for 2 years at 6% equals 1 year at 5% followed by 1 year at 7.01%.",
    optionExplanations: ["That's an average.", "Correct.", "That's the 2-year spot.", "That's the difference."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-bonds-015", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "medium", type: "numerical",
    question: "Price a 2-year bond paying a 5% annual coupon (face $1,000) using spot rates s₁ = 4% and s₂ = 5%.",
    options: ["$1,000.00", "About $981.41", "About $1,018.86", "About $1,000.46"],
    answer: 3,
    explanation: "Discount each cash flow at its own spot rate: 50/1.04 + 1,050/1.05² = 48.08 + 952.38 = $1,000.46. Using one YTM is a shortcut that averages the spot curve.",
    optionExplanations: ["Close but not exact.", "That uses 6%.", "That uses 4% for both.", "Correct."]
  },
  {
    id: "fin-bonds-016", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "easy", type: "concept",
    question: "What is the lowest investment-grade rating on the S&P/Fitch scale, and what is a 'junk' bond?",
    options: ["A; anything below AA", "BBB− (Baa3 at Moody's); junk (high-yield) bonds are rated BB+/Ba1 or lower and pay higher yields for higher default risk", "BB; anything below B", "AAA; everything else is junk"],
    answer: 1,
    explanation: "Scale: AAA, AA, A, BBB (investment grade) → BB, B, CCC, CC, C (speculative) → D (default). Lower rating → higher credit spread: y = r_f + credit spread.",
    optionExplanations: ["IG extends down to BBB−.", "Correct.", "BB is already speculative.", "Investment grade includes AA, A and BBB."]
  },
  {
    id: "fin-bonds-017", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "medium", type: "concept",
    question: "How do interest-rate (price) risk and reinvestment risk offset each other for a bond investor?",
    options: ["They're the same risk", "When rates rise, bond prices fall (price risk) but coupons are reinvested at higher rates (reinvestment gain); when rates fall the reverse. Holding a bond for a horizon equal to its duration roughly immunises against small parallel shifts", "Reinvestment risk only affects zeros", "Price risk only affects short bonds"],
    answer: 1,
    explanation: "Zero-coupon bonds have no reinvestment risk (no coupons). Callable bonds add reinvestment risk because they tend to be called when rates fall.",
    optionExplanations: ["They act in opposite directions.", "Correct.", "Zeros have none.", "Longer bonds have more price risk."]
  },
  {
    id: "fin-bonds-018", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "medium", type: "concept",
    question: "Which statement about bond types is correct?",
    options: ["Floating-rate bonds have very high duration", "Municipal bonds are issued by corporations", "Callable bonds let investors redeem early", "A floating-rate note's coupon resets to benchmark + spread, so its price stays near par; inflation-linked bonds adjust principal (and coupons) with inflation; convertible bonds can be swapped for shares; puttable bonds let the INVESTOR sell back early"],
    answer: 3,
    explanation: "Callable bonds benefit the issuer (higher yield to compensate); puttable bonds benefit the investor (lower yield). Government securities (T-bills, G-Secs) are close to risk-free in local currency; municipal bonds fund local infrastructure.",
    optionExplanations: ["FRN duration is short (until the next reset).", "Issued by local governments.", "That's a puttable bond.", "Correct."]
  },
  {
    id: "fin-bonds-019", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "medium", type: "numerical",
    question: "An inflation-linked bond has $1,000 principal and a 2% real coupon. After a year of 4% inflation, what are the adjusted principal and the coupon paid?",
    options: ["$1,040 and $20.80", "$1,000 and $20", "$1,040 and $41.60", "$1,020 and $40"],
    answer: 0,
    explanation: "Principal = 1,000 × 1.04 = $1,040; coupon = 2% × 1,040 = $20.80. The investor's real return is protected from inflation (e.g. TIPS in the US; inflation-indexed bonds in India).",
    optionExplanations: ["Correct.", "That ignores indexation.", "That adds inflation to the coupon rate.", "Wrong arithmetic."]
  },
  {
    id: "fin-bonds-020", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "easy", type: "concept",
    question: "Holding all else equal, what happens to a discount bond's price as it approaches maturity?",
    options: ["It falls further", "It rises towards par ('pull to par'), since the face value is repaid at maturity", "It stays fixed", "It becomes zero"],
    answer: 1,
    explanation: "A premium bond's price likewise declines toward par. This accretion is part of the YTM return.",
    optionExplanations: ["It converges upward.", "Correct.", "It changes with time.", "Face value is repaid."]
  },
  {
    id: "fin-bonds-021", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "medium", type: "numerical",
    question: "A 91-day Treasury bill (face ₹100) is priced at a 7% annualised yield (simple, ACT/365). What's its price?",
    options: ["₹93.00", "₹100.00", "About ₹98.25", "About ₹98.28"],
    answer: 3,
    explanation: "P = 100/(1 + 0.07 × 91/365) = 100/1.017452 = ₹98.28. T-bills are zero-coupon money-market instruments issued at a discount.",
    optionExplanations: ["That's a full year at 7% simple discount.", "That ignores the yield.", "That's the bank-discount method (100 × (1 − 0.07 × 91/365)).", "Correct."]
  },
  {
    id: "fin-bonds-022", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "hard", type: "concept",
    question: "Why does a callable bond exhibit 'negative convexity' at low yields?",
    options: ["Because its coupon falls", "As yields fall, the issuer becomes likely to call at the call price, capping the price rise; the price-yield curve bends the 'wrong' way, so gains are limited while losses when yields rise are not", "Because it has no duration", "Because it's a zero-coupon bond"],
    answer: 1,
    explanation: "Mortgage-backed securities show the same effect (prepayments). Investors are short a call option to the issuer, which is why callable bonds yield more.",
    optionExplanations: ["The coupon is fixed.", "Correct.", "It has duration.", "Not related."]
  },
  {
    id: "fin-bonds-023", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "easy", type: "concept",
    question: "A corporate bond yields 7.5% while a government bond of the same maturity yields 6%. What's the 1.5% difference called, and what does it compensate for?",
    options: ["The coupon rate; inflation", "The swap spread; LIBOR", "The term premium; maturity", "The credit spread; default risk (plus some liquidity premium)"],
    answer: 3,
    explanation: "Corporate yield = risk-free yield + credit spread. Spreads widen in recessions and when ratings are downgraded.",
    optionExplanations: ["Not the coupon.", "That's swap vs government.", "Same maturity, so not the term premium.", "Correct."]
  },
  {
    id: "fin-bonds-024", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "medium", type: "concept",
    question: "What is the Macaulay duration of a 7-year zero-coupon bond, and how does it compare with a 7-year 8% coupon bond?",
    options: ["Both 7 years", "The coupon bond's is longer", "The zero's duration is exactly 7 years; the coupon bond's is less than 7 because some cash flows come earlier", "The zero's is 0"],
    answer: 2,
    explanation: "Macaulay duration is the PV-weighted average time to cash flows. Coupons pull it below maturity; higher coupons and higher yields shorten it further.",
    optionExplanations: ["Coupons reduce duration.", "Reversed.", "Correct.", "Not zero."]
  },
  {
    id: "fin-bonds-025", subject: "finance", subtopic: "Bonds, Yields & Term Structure", difficulty: "hard", type: "numerical",
    question: "A 3-year bond pays a 6% annual coupon and is priced at a yield of 8% ($948.46). Show its Macaulay duration.",
    options: ["3.00 years", "About 2.50 years", "About 2.62 years", "About 2.83 years"],
    answer: 3,
    explanation: "PV of flows: 55.56 (t=1), 51.44 (t=2), 841.46 (t=3). D = (1×55.56 + 2×51.44 + 3×841.46)/948.46 = 2,682.8/948.46 = 2.83 years. Modified duration = 2.83/1.08 = 2.62.",
    optionExplanations: ["That's a zero's duration.", "Too low.", "That's modified duration.", "Correct."]
  }
);
