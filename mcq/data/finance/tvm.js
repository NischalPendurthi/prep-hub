/* Finance — Time Value of Money & Discounting */
window.QUESTIONS.push(
  {
    id: "fin-tvm-001", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "easy", type: "concept",
    question: "Why is $100 today worth more than $100 received in one year?",
    options: ["It isn't; they're worth exactly the same", "Because money always loses value to fraud", "Because banks charge fees on future money", "Because money available now can be invested to earn a return (opportunity cost), and future cash is exposed to inflation and the risk of not being paid"],
    answer: 3,
    explanation: "This is the time value of money. The interest rate used to discount future cash reflects the return you give up (opportunity cost), expected inflation and risk. Discounting converts future amounts into today's equivalent.",
    optionExplanations: ["Ignores the return you could earn in the meantime.", "Fraud isn't the reason.", "Fees aren't the reason.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-tvm-002", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "easy", type: "numerical",
    question: "$10,000 is invested at 8% per year for 3 years. What is the final amount with simple interest and with annual compound interest?",
    options: ["$12,400 simple; $12,597.12 compound", "$12,597.12 for both", "$12,400 for both", "$12,597.12 simple; $12,400 compound"],
    answer: 0,
    explanation: "Simple: interest is paid only on the principal: 10,000 × (1 + 0.08 × 3) = $12,400. Compound: interest earns interest: 10,000 × 1.08³ = 10,000 × 1.259712 = $12,597.12. The $197.12 difference is interest on interest.",
    optionExplanations: ["Correct.", "Simple interest doesn't compound.", "Compound interest earns interest on interest.", "Reversed."]
  },
  {
    id: "fin-tvm-003", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "easy", type: "numerical",
    question: "What is the future value of $5,000 invested for 5 years at 6% compounded annually?",
    options: ["$6,500.00", "$6,691.13", "$6,312.38", "$5,300.00"],
    answer: 1,
    explanation: "FV = PV × (1 + r)ⁿ = 5,000 × 1.06⁵ = 5,000 × 1.338226 = $6,691.13.",
    optionExplanations: ["That's simple interest: 5,000 × (1 + 0.06 × 5).", "Correct.", "That's 4 years of compounding.", "That's one year of interest."]
  },
  {
    id: "fin-tvm-004", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "easy", type: "numerical",
    question: "What is the present value of $10,000 to be received in 4 years if the discount rate is 10%?",
    options: ["$6,000.00", "$7,142.86", "$6,830.13", "$14,641.00"],
    answer: 2,
    explanation: "PV = FV / (1 + r)ⁿ = 10,000 / 1.1⁴ = 10,000 / 1.4641 = $6,830.13.",
    optionExplanations: ["That subtracts 4 × 10% simple discount.", "That divides by 1.4 (simple interest).", "Correct.", "That's the future value of $10,000, not the present value."]
  },
  {
    id: "fin-tvm-005", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "A deposit pays a nominal 12% per year compounded monthly. What is the effective annual rate (EAR)?",
    options: ["12.00%", "12.36%", "12.55%", "12.68%"],
    answer: 3,
    explanation: "EAR = (1 + APR/m)ᵐ − 1 = (1 + 0.12/12)¹² − 1 = 1.01¹² − 1 = 12.68%. More frequent compounding raises the effective rate above the nominal rate.",
    optionExplanations: ["That's the nominal rate, ignoring compounding.", "That's semi-annual compounding (1.06² − 1).", "That's quarterly compounding (1.03⁴ − 1).", "Correct."]
  },
  {
    id: "fin-tvm-006", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "Bank A offers 10% compounded quarterly; Bank B offers 10.25% compounded annually. Which pays more for a saver?",
    options: ["Bank B, because 10.25% > 10%", "Bank A: its EAR is about 10.38%", "They're exactly equal", "Bank A, but only for deposits longer than 10 years"],
    answer: 1,
    explanation: "Compare effective rates. Bank A: (1 + 0.10/4)⁴ − 1 = 1.025⁴ − 1 = 10.38%. Bank B: 10.25%. Bank A pays more in every year. (10% compounded semi-annually would be exactly 10.25%.)",
    optionExplanations: ["Nominal rates with different compounding can't be compared directly.", "Correct.", "Equal only if A compounded semi-annually.", "A higher EAR wins over any horizon."]
  },
  {
    id: "fin-tvm-007", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "hard", type: "numerical",
    question: "$1,000 is invested at 8% per year compounded continuously for 5 years. What is the future value, and what is the equivalent effective annual rate?",
    options: ["$1,469.33 and 8.00%", "$1,400.00 and 8.00%", "$1,491.82 and 8.33%", "$1,491.82 and 8.00%"],
    answer: 2,
    explanation: "Continuous compounding: FV = PV × e^(rt) = 1,000 × e^0.4 = $1,491.82. EAR = e^r − 1 = e^0.08 − 1 = 8.33%. Continuous compounding is the upper limit as the compounding frequency grows.",
    optionExplanations: ["$1,469.33 is annual compounding (1.08⁵).", "That's simple interest.", "Correct.", "The FV is right but the EAR exceeds 8%."]
  },
  {
    id: "fin-tvm-008", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "easy", type: "numerical",
    question: "Using the Rule of 72, roughly how long does money take to double at 9% per year?",
    options: ["About 6 years", "About 8 years", "About 9 years", "About 11 years"],
    answer: 1,
    explanation: "Years to double ≈ 72 / rate in % = 72 / 9 = 8 years. The exact answer is ln 2 / ln 1.09 = 8.04 years. The rule is accurate for rates around 6–10%.",
    optionExplanations: ["That's for 12%.", "Correct.", "That's for 8%.", "That would be about 6.5%."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-tvm-009", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "You deposit $2,000 at the end of each year for 10 years into an account earning 7% per year. How much will you have right after the last deposit?",
    options: ["$20,000.00", "$14,047.16", "$29,567.20", "$27,632.90"],
    answer: 3,
    explanation: "FV of an ordinary annuity = PMT × [(1 + r)ⁿ − 1] / r = 2,000 × (1.07¹⁰ − 1) / 0.07 = 2,000 × 13.8164 = $27,632.90.",
    optionExplanations: ["That ignores interest.", "That's the present value of the annuity.", "That's an annuity due (deposits at the start of each year): × 1.07.", "Correct."]
  },
  {
    id: "fin-tvm-010", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "What is the present value of $1,000 received at the end of each year for 5 years at a discount rate of 8%?",
    options: ["$5,000.00", "$5,866.60", "$4,312.13", "$3,992.71"],
    answer: 3,
    explanation: "PV of an ordinary annuity = PMT × [1 − (1 + r)⁻ⁿ] / r = 1,000 × (1 − 1.08⁻⁵) / 0.08 = 1,000 × 3.99271 = $3,992.71.",
    optionExplanations: ["That ignores discounting.", "That's the future value.", "That's an annuity due.", "Correct."]
  },
  {
    id: "fin-tvm-011", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "Lease payments of $1,000 per year for 5 years are paid at the START of each year. At an 8% discount rate, what is their present value?",
    options: ["$3,992.71", "$3,696.95", "$5,000.00", "$4,312.13"],
    answer: 3,
    explanation: "An annuity due's payments each arrive one period earlier, so PV(due) = PV(ordinary) × (1 + r) = 3,992.71 × 1.08 = $4,312.13. Equivalently: 1,000 now + 4-year ordinary annuity of 1,000 (3,312.13).",
    optionExplanations: ["That's the ordinary annuity.", "That discounts one period too many.", "That ignores discounting.", "Correct."]
  },
  {
    id: "fin-tvm-012", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "easy", type: "numerical",
    question: "A preferred share pays a fixed $500 per year forever. If the required return is 5%, what is it worth?",
    options: ["$10,000", "$2,500", "$25,000", "$5,000"],
    answer: 0,
    explanation: "PV of a perpetuity = C / r = 500 / 0.05 = $10,000. The first payment is assumed to be one period from now.",
    optionExplanations: ["Correct.", "That multiplies by 5.", "Wrong arithmetic.", "That divides by 10%."]
  },
  {
    id: "fin-tvm-013", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "A stock is expected to pay a dividend of $2.00 next year, growing at 4% per year forever. If investors require 10%, what is its value?",
    options: ["$20.00", "$14.29", "$34.67", "$33.33"],
    answer: 3,
    explanation: "Growing perpetuity: PV = C₁ / (r − g) = 2.00 / (0.10 − 0.04) = $33.33. Trap: if $2.00 is the dividend just PAID (D₀), use D₁ = 2.00 × 1.04 = 2.08, giving $34.67. The formula needs r > g.",
    optionExplanations: ["That ignores growth (2 / 0.10).", "That adds g to r instead of subtracting.", "That treats $2.00 as last year's dividend.", "Correct."]
  },
  {
    id: "fin-tvm-014", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "hard", type: "numerical",
    question: "A pension pays $10,000 at the end of year 1, rising 3% per year, for 20 payments. At an 8% discount rate, what is its present value?",
    options: ["About $122,500", "About $98,181", "About $200,000", "About $137,690"],
    answer: 0,
    explanation: "Growing annuity: PV = C / (r − g) × [1 − ((1 + g)/(1 + r))ⁿ] = 10,000 / 0.05 × [1 − (1.03/1.08)²⁰] = 200,000 × 0.61250 = $122,500.",
    optionExplanations: ["Correct.", "That's the level annuity without growth.", "That's the growing perpetuity, ignoring that payments stop after 20 years.", "Wrong arithmetic."]
  },
  {
    id: "fin-tvm-015", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "What is the monthly payment on a $200,000, 30-year mortgage at 6% per year (compounded monthly)?",
    options: ["$555.56", "$1,000.00", "$1,199.10", "$1,438.92"],
    answer: 2,
    explanation: "r = 0.06/12 = 0.005, n = 360. PMT = PV × r / [1 − (1 + r)⁻ⁿ] = 200,000 × 0.005 / (1 − 1.005⁻³⁶⁰) = $1,199.10.",
    optionExplanations: ["That's principal only (200,000 / 360).", "That's only the first month's interest.", "Correct.", "Wrong arithmetic."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-tvm-016", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "hard", type: "numerical",
    question: "On the $200,000, 6%, 30-year mortgage with $1,199.10 monthly payments, how much of the FIRST payment is interest and how much repays principal?",
    options: ["$1,000.00 interest; $199.10 principal", "$599.55 interest; $599.55 principal", "$199.10 interest; $1,000.00 principal", "$1,199.10 interest; $0 principal"],
    answer: 0,
    explanation: "Interest = outstanding balance × monthly rate = 200,000 × 0.005 = $1,000.00. Principal = 1,199.10 − 1,000 = $199.10. As the balance falls, the interest part shrinks and the principal part grows.",
    optionExplanations: ["Correct.", "The split isn't even.", "Reversed.", "Every payment reduces principal."]
  },
  {
    id: "fin-tvm-017", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "hard", type: "numerical",
    question: "On the same $200,000, 6%, 30-year mortgage ($1,199.10/month), what is the outstanding balance after 5 years (60 payments)?",
    options: ["About $128,054", "About $166,667", "About $186,109", "About $200,000"],
    answer: 2,
    explanation: "Balance = FV of the loan − FV of the payments = 200,000 × 1.005⁶⁰ − 1,199.10 × (1.005⁶⁰ − 1)/0.005 = 269,770.03 − 83,661.32 ≈ $186,109. Equivalently, the PV of the remaining 300 payments. Early payments are mostly interest.",
    optionExplanations: ["That subtracts all payments as if they were principal.", "That assumes equal principal repayment (straight-line).", "Correct.", "Some principal has been repaid."]
  },
  {
    id: "fin-tvm-018", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "A $50,000 car loan at 9% per year, repaid monthly over 5 years. What is the monthly EMI (payment)?",
    options: ["$833.33", "$1,250.00", "$1,208.33", "$1,037.92"],
    answer: 3,
    explanation: "r = 0.09/12 = 0.0075, n = 60. EMI = 50,000 × 0.0075 / (1 − 1.0075⁻⁶⁰) = $1,037.92. Total paid = 62,275; interest = $12,275.",
    optionExplanations: ["That ignores interest (50,000 / 60).", "Wrong arithmetic.", "That uses simple interest on the full amount for 5 years.", "Correct."]
  },
  {
    id: "fin-tvm-019", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "A project returns $100 in year 1, $200 in year 2 and $300 in year 3. At a 10% discount rate, what is the present value?",
    options: ["$600.00", "$545.45", "$481.59", "$450.79"],
    answer: 2,
    explanation: "Discount each flow separately: 100/1.1 + 200/1.1² + 300/1.1³ = 90.91 + 165.29 + 225.39 = $481.59.",
    optionExplanations: ["That ignores discounting.", "That discounts the total by one year only.", "Correct.", "That discounts the total for 3 years."]
  },
  {
    id: "fin-tvm-020", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "easy", type: "numerical",
    question: "A bank pays 10% nominal interest and inflation is 4%. What is the real interest rate using the exact Fisher equation?",
    options: ["14.00%", "6.00%", "5.77%", "2.50%"],
    answer: 2,
    explanation: "(1 + nominal) = (1 + real)(1 + inflation) → real = 1.10 / 1.04 − 1 = 5.77%. The approximation real ≈ nominal − inflation gives 6%, close only when rates are low.",
    optionExplanations: ["That adds the rates.", "That's the approximation.", "Correct.", "That divides the rates."]
  },
  {
    id: "fin-tvm-021", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "easy", type: "concept",
    question: "All else equal, what happens to the present value of a future cash flow when the discount rate rises or the time until payment increases?",
    options: ["PV rises in both cases", "PV falls in both cases", "PV rises with the rate and falls with time", "PV is unaffected"],
    answer: 1,
    explanation: "PV = FV / (1 + r)ⁿ: a larger r or larger n increases the denominator. Long-dated cash flows are therefore much more sensitive to discount-rate changes — which is why long-duration bonds and growth stocks fall hardest when rates rise.",
    optionExplanations: ["Both reduce PV.", "Correct.", "Higher rates reduce PV.", "PV depends on both."]
  },
  {
    id: "fin-tvm-022", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "At 6% compounded annually, exactly how many years does it take to double an investment?",
    options: ["12.0 years", "11.9 years", "16.7 years", "10.0 years"],
    answer: 1,
    explanation: "Solve 1.06ⁿ = 2: n = ln 2 / ln 1.06 = 0.6931 / 0.05827 = 11.9 years. The Rule of 72 gives 12.",
    optionExplanations: ["That's the Rule of 72 estimate.", "Correct.", "That's simple interest (100 / 6).", "Wrong."]
  },
  {
    id: "fin-tvm-023", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "An investment of $1,000 grows to $2,000 in 8 years. What annual compound rate of return does that imply?",
    options: ["9.05%", "12.50%", "8.00%", "10.41%"],
    answer: 0,
    explanation: "r = (FV/PV)^(1/n) − 1 = 2^(1/8) − 1 = 9.05%. (Rule of 72: 72/8 = 9%.)",
    optionExplanations: ["Correct.", "That's simple interest (100% / 8).", "Too low: 1.08⁸ = 1.85.", "Too high: 1.1041⁸ = 2.21."]
  },
  {
    id: "fin-tvm-024", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "hard", type: "numerical",
    question: "You want $1,000,000 in 30 years. Your investments earn 7% per year. What equal deposit at the end of each year achieves this?",
    options: ["$33,333", "$10,586", "$80,586", "$13,137"],
    answer: 1,
    explanation: "Solve the FV of an annuity for PMT: PMT = FV × r / [(1 + r)ⁿ − 1] = 1,000,000 × 0.07 / (1.07³⁰ − 1) = 70,000 / 6.6123 = $10,586. Compounding does most of the work: deposits total only $317,592.",
    optionExplanations: ["That ignores interest (1,000,000 / 30).", "Correct.", "That's the payment to repay a $1,000,000 loan.", "Wrong arithmetic."]
  },
  {
    id: "fin-tvm-025", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "hard", type: "numerical",
    question: "At retirement you have $1,000,000 earning 5% per year. What equal amount can you withdraw at the end of each year for 25 years, leaving nothing?",
    options: ["$40,000", "$50,000", "$70,952", "$90,952"],
    answer: 2,
    explanation: "This is a loan-payment calculation: PMT = PV × r / [1 − (1 + r)⁻ⁿ] = 1,000,000 × 0.05 / (1 − 1.05⁻²⁵) = 50,000 / 0.70470 = $70,952.",
    optionExplanations: ["That's principal only (1,000,000 / 25).", "That's the interest only, which would last forever.", "Correct.", "Too high; the money runs out early."]
  },
  {
    id: "fin-tvm-026", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "At a 10% discount rate, which is worth more today: $1,000 in 5 years or $1,500 in 10 years?",
    options: ["$1,000 in 5 years (PV $620.92 vs $578.31)", "$1,500 in 10 years, because it's larger", "They have the same PV", "It can't be determined without inflation"],
    answer: 0,
    explanation: "PV₁ = 1,000 / 1.1⁵ = $620.92; PV₂ = 1,500 / 1.1¹⁰ = $578.31. Compare cash flows at the same point in time, not by face value.",
    optionExplanations: ["Correct.", "Ignores the extra 5 years of discounting.", "They differ.", "The 10% rate is enough to compare them."]
  },
  {
    id: "fin-tvm-027", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "hard", type: "numerical",
    question: "A perpetuity pays $100 per year with the first payment at the end of year 5. At 10%, what is it worth today?",
    options: ["$1,000.00", "$620.92", "$683.01", "$751.31"],
    answer: 2,
    explanation: "The perpetuity formula C/r = 1,000 values the stream one period BEFORE the first payment, i.e. at t = 4. Discount 4 years: 1,000 / 1.1⁴ = $683.01. Using 5 years ($620.92) is a classic off-by-one mistake.",
    optionExplanations: ["That ignores the delay.", "That discounts one year too many.", "Correct.", "That discounts only 3 years."]
  },
  {
    id: "fin-tvm-028", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "A credit card charges 18% APR, compounded monthly. What effective annual rate does an unpaid balance actually cost?",
    options: ["18.00%", "1.50%", "21.60%", "19.56%"],
    answer: 3,
    explanation: "Monthly rate = 18% / 12 = 1.5%. EAR = 1.015¹² − 1 = 19.56%. APR understates the true cost when compounding is more frequent than annual.",
    optionExplanations: ["That's the APR.", "That's the monthly rate.", "That's 1.8% × 12.", "Correct."]
  },
  {
    id: "fin-tvm-029", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "easy", type: "concept",
    question: "Keeping the nominal annual rate fixed, what happens to the future value as compounding becomes more frequent (annual → monthly → daily)?",
    options: ["It increases, but by smaller and smaller amounts, approaching the continuous-compounding limit", "It decreases", "It stays the same", "It doubles each time"],
    answer: 0,
    explanation: "More frequent compounding means interest starts earning interest sooner. The effective rate approaches e^r − 1 as frequency goes to infinity.",
    optionExplanations: ["Correct.", "It rises.", "The effective rate changes.", "The gains are small."]
  },
  {
    id: "fin-tvm-030", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "hard", type: "numerical",
    question: "You can take $50,000 now or $6,000 at the end of each year for 15 years. Which is better at a discount rate of 8%, and at 9%?",
    options: ["Annuity at both rates (it totals $90,000)", "Annuity at 8% (PV $51,357); lump sum at 9% (annuity PV $48,364)", "Lump sum at both rates", "Lump sum at 8%; annuity at 9%"],
    answer: 1,
    explanation: "PV of the annuity = 6,000 × (1 − (1 + r)⁻¹⁵)/r. At 8%: 6,000 × 8.5595 = $51,357 > 50,000 → take the annuity. At 9%: 6,000 × 8.0607 = $48,364 < 50,000 → take the lump sum. The decision depends on the discount rate.",
    optionExplanations: ["Undiscounted totals are misleading.", "Correct.", "At 8% the annuity is worth more.", "Reversed: higher rates favour the lump sum."]
  },
  {
    id: "fin-tvm-031", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "concept",
    question: "Which statement about an annuity due vs an ordinary annuity with the same payment, rate and term is correct?",
    options: ["The ordinary annuity has the higher PV and FV", "They have equal PV but different FV", "The annuity due has the higher PV and FV, by a factor of (1 + r), because each payment occurs one period earlier", "The annuity due has a higher PV but lower FV"],
    answer: 2,
    explanation: "Rent and insurance premiums paid in advance are annuities due. Since each payment arrives a period earlier, both its PV and FV are the ordinary annuity values × (1 + r).",
    optionExplanations: ["Reversed.", "Both PV and FV differ.", "Correct.", "Both are higher."]
  },
  {
    id: "fin-tvm-032", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "concept",
    question: "Which components are typically built into a discount rate?",
    options: ["Only the inflation rate", "A risk-free rate plus premiums for expected inflation, risk (default and market), liquidity and term (longer maturities)", "Only the company's historical growth rate", "The tax rate and the dividend yield"],
    answer: 1,
    explanation: "The risk-free rate (usually proxied by government bond yields) already includes expected inflation in nominal terms. Investors then add premiums for bearing risk, holding illiquid assets and committing money for longer (the term premium). Riskier, less liquid, longer-dated cash flows get higher rates.",
    optionExplanations: ["Inflation is only one part.", "Correct.", "Growth affects cash flows, not the required return.", "Neither is a component of the required return."]
  },
  {
    id: "fin-tvm-033", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "easy", type: "concept",
    question: "Rank these from lowest to highest typical discount rate: equity investment, government bond, risky start-up project, investment-grade corporate bond.",
    options: ["Government bond < corporate bond < equity < risky project", "Corporate bond < government bond < equity < risky project", "Equity < government bond < corporate bond < risky project", "Risky project < equity < corporate bond < government bond"],
    answer: 0,
    explanation: "Discount rates rise with risk. Government bonds are close to risk-free; corporate bonds add a credit spread; equity (priced with CAPM, for example) bears market risk; venture-type projects demand the highest rates (often 15–20%+ or more).",
    optionExplanations: ["Correct.", "Corporate debt carries default risk, so it costs more than government debt.", "Equity is riskier than bonds.", "Reversed."]
  },
  {
    id: "fin-tvm-034", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "What is the present value of $10,000 due in 3 years at a continuously compounded rate of 6%, and how does it compare with annual discounting at 6%?",
    options: ["$8,352.70 continuous vs $8,396.19 annual", "$8,396.19 continuous vs $8,352.70 annual", "$8,200.00 for both", "$11,972.17 continuous vs $11,910.16 annual"],
    answer: 0,
    explanation: "Continuous: PV = FV·e^(−rt) = 10,000·e^(−0.18) = $8,352.70. Annual: 10,000 / 1.06³ = $8,396.19. Continuous discounting at the same quoted rate is slightly heavier because the effective rate (e^0.06 − 1 = 6.18%) is higher. Continuous rates are standard in derivatives pricing because they add across time.",
    optionExplanations: ["Correct.", "Swapped.", "That's simple discounting (1 − 0.18).", "Those are future values, not present values."]
  },
  {
    id: "fin-tvm-035", subject: "finance", subtopic: "Time Value of Money & Discounting", difficulty: "medium", type: "numerical",
    question: "A perpetuity pays $500 per year forever, with the first payment TODAY. At 5%, what is it worth?",
    options: ["$10,000", "$10,500", "$9,523.81", "$500"],
    answer: 1,
    explanation: "Perpetuity due = ordinary perpetuity × (1 + r) = (500 / 0.05) × 1.05 = $10,500. Equivalently, $500 today plus an ordinary perpetuity worth $10,000.",
    optionExplanations: ["That's the ordinary perpetuity (first payment in one year).", "Correct.", "That discounts one extra period.", "That's only the first payment."]
  }
);
