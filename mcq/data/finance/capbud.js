/* Finance — Capital Budgeting */
window.QUESTIONS.push(
  {
    id: "fin-capbud-001", subject: "finance", subtopic: "Capital Budgeting", difficulty: "easy", type: "concept",
    question: "What is NPV, and what is the decision rule?",
    options: ["The present value of all expected cash flows (inflows and outflows) discounted at the required return; accept if NPV > 0, because the project creates value beyond the cost of capital", "Total cash inflows minus outflows, undiscounted", "The project's internal rate of return", "Accept if NPV < 0"],
    answer: 0,
    explanation: "NPV = Σ CFₜ/(1 + r)ᵗ − C₀. It's in currency units, adds across projects, and is the theoretically preferred criterion.",
    optionExplanations: ["Correct.", "Ignores the time value of money.", "That's a rate.", "Negative NPV destroys value."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-capbud-002", subject: "finance", subtopic: "Capital Budgeting", difficulty: "medium", type: "numerical",
    question: "A project costs 1,000 and returns 400 per year for 3 years. What is its NPV at 10% and at 8%?",
    options: ["About −5.26 at 10%; about +30.84 at 8%", "+200 at both", "About +5.26 at 10%; about −30.84 at 8%", "About −5.26 at both"],
    answer: 0,
    explanation: "At 10%: 400 × 2.4869 − 1,000 = −5.26 (reject). At 8%: 400 × 2.5771 − 1,000 = +30.84 (accept). The decision depends on the cost of capital; the IRR (about 9.70%) lies between them.",
    optionExplanations: ["Correct.", "Ignores discounting.", "Signs reversed.", "NPV rises as the rate falls."]
  },
  {
    id: "fin-capbud-003", subject: "finance", subtopic: "Capital Budgeting", difficulty: "medium", type: "numerical",
    question: "For the same project (−1,000 then +400 for 3 years), what is the IRR, and should you accept at a 10% cost of capital?",
    options: ["20%; accept", "About 9.7%; accept", "About 9.7%; reject, since IRR < 10%", "10%; indifferent"],
    answer: 2,
    explanation: "IRR is the rate where NPV = 0; here ≈ 9.70%. Accept if IRR > cost of capital — consistent with NPV < 0 at 10%.",
    optionExplanations: ["That's the undiscounted surplus ratio.", "IRR is below the hurdle.", "Correct.", "IRR isn't exactly 10%."]
  },
  {
    id: "fin-capbud-004", subject: "finance", subtopic: "Capital Budgeting", difficulty: "hard", type: "numerical",
    question: "Mutually exclusive projects: A costs 100 and returns 150 in one year (IRR 50%); B costs 1,000 and returns 1,300 in one year (IRR 30%). The cost of capital is 10%. Which do you choose?",
    options: ["A, because its IRR is higher", "Both", "B: NPV(A) = 36.4 but NPV(B) = 181.8; NPV measures value created, while IRR ignores scale", "Neither"],
    answer: 2,
    explanation: "With mutually exclusive projects, NPV and IRR can conflict due to scale or timing differences; NPV is correct. (The NPV profiles cross at about 27.8%.) IRR also implicitly assumes reinvestment at the IRR.",
    optionExplanations: ["IRR ignores scale.", "They're mutually exclusive.", "Correct.", "Both have positive NPV."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-capbud-005", subject: "finance", subtopic: "Capital Budgeting", difficulty: "hard", type: "numerical",
    question: "A project has cash flows −100, +230, −132 (non-conventional). What are its IRRs, and what's the lesson?",
    options: ["Only 10%", "Both 10% and 20% give NPV = 0, so IRR is ambiguous; use NPV at the cost of capital (or MIRR)", "No IRR exists", "15%"],
    answer: 1,
    explanation: "Check: at 10%, −100 + 209.09 − 109.09 = 0; at 20%, −100 + 191.67 − 91.67 = 0. When cash flows change sign more than once, there can be multiple IRRs (Descartes' rule of signs).",
    optionExplanations: ["20% also works.", "Correct.", "Two exist.", "NPV is positive at 15%, not zero."]
  },
  {
    id: "fin-capbud-006", subject: "finance", subtopic: "Capital Budgeting", difficulty: "hard", type: "numerical",
    question: "For −1,000 followed by +400 for 3 years, with intermediate cash flows reinvested at 10%, what is the MIRR?",
    options: ["About 9.81%", "9.70%", "10.00%", "32.4%"],
    answer: 0,
    explanation: "Terminal value = 400 × 1.1² + 400 × 1.1 + 400 = 484 + 440 + 400 = 1,324. MIRR = (1,324/1,000)^(1/3) − 1 = 9.81%. MIRR uses a realistic reinvestment rate and gives one answer.",
    optionExplanations: ["Correct.", "That's the IRR.", "That's the reinvestment rate.", "That's the total return, not annualised."]
  },
  {
    id: "fin-capbud-007", subject: "finance", subtopic: "Capital Budgeting", difficulty: "medium", type: "numerical",
    question: "A project costs 1,000 and returns 500 per year for 3 years. What are the payback and discounted payback (at 10%) periods?",
    options: ["2.0 and 2.0 years", "2.0 and about 2.35 years", "3.0 and 3.0 years", "1.5 and 2.0 years"],
    answer: 1,
    explanation: "Simple payback: 500 + 500 = 1,000 after exactly 2 years. Discounted: PVs 454.5, 413.2, 375.7 → after 2 years 867.8 recovered; remaining 132.2/375.7 = 0.35 → 2.35 years. Payback ignores cash flows after the cutoff and (simple payback) the time value of money.",
    optionExplanations: ["Discounting lengthens payback.", "Correct.", "Too long.", "Too short."]
  },
  {
    id: "fin-capbud-008", subject: "finance", subtopic: "Capital Budgeting", difficulty: "medium", type: "concept",
    question: "What is the profitability index, and when is it most useful?",
    options: ["NPV × IRR", "Always identical to IRR", "Payback ÷ NPV", "PV of future cash flows ÷ initial investment (accept if > 1); most useful under capital rationing, to rank projects by value created per unit of scarce capital"],
    answer: 3,
    explanation: "Example: PV 1,200 on a 1,000 investment → PI = 1.2. With a fixed budget, combine projects with the highest total NPV (often guided by PI), checking indivisibilities.",
    optionExplanations: ["Not the definition.", "Different measure.", "Not the definition.", "Correct."]
  },
  {
    id: "fin-capbud-009", subject: "finance", subtopic: "Capital Budgeting", difficulty: "medium", type: "concept",
    question: "Which cash flow should be INCLUDED when evaluating a new product line?",
    options: ["A $50,000 market study already paid last year", "Interest payments on debt used to finance the project", "Lost sales of the company's existing product caused by the new one (cannibalisation)", "A share of head-office overhead that won't change"],
    answer: 2,
    explanation: "Only incremental cash flows matter: include opportunity costs (e.g. land you could otherwise sell) and side effects; exclude sunk costs and unchanged allocated overheads; exclude financing costs because they're captured in the discount rate (WACC).",
    optionExplanations: ["Sunk cost: excluded.", "Financing is in the discount rate.", "Correct.", "Not incremental."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-capbud-010", subject: "finance", subtopic: "Capital Budgeting", difficulty: "medium", type: "numerical",
    question: "A project adds revenue of 500 and cash costs of 200 per year; depreciation is 100; tax rate 25%. What is the annual operating cash flow?",
    options: ["200", "150", "300", "250"],
    answer: 3,
    explanation: "OCF = (Revenue − costs − depreciation)(1 − t) + depreciation = (500 − 200 − 100) × 0.75 + 100 = 150 + 100 = 250. Equivalently: (500 − 200)(0.75) + 100 × 0.25 (the depreciation tax shield of 25).",
    optionExplanations: ["Ignores the add-back.", "That's after-tax EBIT only.", "Ignores tax.", "Correct."]
  },
  {
    id: "fin-capbud-011", subject: "finance", subtopic: "Capital Budgeting", difficulty: "easy", type: "numerical",
    question: "Annual depreciation on a project is $100,000 and the tax rate is 25%. What is the annual depreciation tax shield?",
    options: ["$25,000", "$100,000", "$75,000", "$0, since depreciation is non-cash"],
    answer: 0,
    explanation: "Tax shield = depreciation × tax rate = $25,000 of tax saved each year. Accelerated depreciation brings these savings forward, raising NPV.",
    optionExplanations: ["Correct.", "That's the depreciation itself.", "That's depreciation × (1 − t).", "It saves real cash taxes."]
  },
  {
    id: "fin-capbud-012", subject: "finance", subtopic: "Capital Budgeting", difficulty: "medium", type: "numerical",
    question: "At the end of a project, equipment with book value 40 is sold for 60. The tax rate is 25%. What is the after-tax salvage cash flow?",
    options: ["60", "40", "45", "55"],
    answer: 3,
    explanation: "Taxable gain = 60 − 40 = 20; tax = 5. After-tax salvage = 60 − 5 = 55. If sold below book value, the loss creates a tax saving instead.",
    optionExplanations: ["Ignores tax on the gain.", "That's the book value.", "Taxes the whole price.", "Correct."]
  },
  {
    id: "fin-capbud-013", subject: "finance", subtopic: "Capital Budgeting", difficulty: "medium", type: "concept",
    question: "A project requires 50 of extra inventory and receivables at the start. How is this treated?",
    options: ["Ignored, since it's not an expense", "As a cash outflow at the start (investment in net working capital) and usually a cash inflow when it's recovered at the end of the project", "As depreciation", "As revenue"],
    answer: 1,
    explanation: "Because recovery happens later, working capital still has a cost in PV terms (time value).",
    optionExplanations: ["It ties up cash.", "Correct.", "Not depreciable.", "Not revenue."]
  },
  {
    id: "fin-capbud-014", subject: "finance", subtopic: "Capital Budgeting", difficulty: "hard", type: "numerical",
    question: "Machine A has NPV 200 over a 3-year life; machine B has NPV 300 over 6 years. Each will be replaced at the end of its life. At 10%, which is better?",
    options: ["B, since its NPV is higher", "B: its EAA is higher", "They're equal", "A: its equivalent annual annuity is about 80.4 per year versus about 68.9 for B"],
    answer: 3,
    explanation: "EAA = NPV / annuity factor: A = 200/2.4869 = 80.4; B = 300/4.3553 = 68.9. With repeated projects of unequal lives, compare per-year values (or use a common horizon).",
    optionExplanations: ["Unequal lives make raw NPV misleading.", "B's EAA is lower.", "They differ.", "Correct."]
  },
  {
    id: "fin-capbud-015", subject: "finance", subtopic: "Capital Budgeting", difficulty: "medium", type: "concept",
    question: "How do sensitivity, scenario and break-even analysis differ?",
    options: ["Sensitivity changes one input at a time to see its effect on NPV; scenario analysis changes several inputs together (best/base/worst cases); break-even finds the input value (e.g. sales volume) at which NPV = 0", "They're the same", "Scenario analysis changes only one variable", "Break-even uses accounting profit only"],
    answer: 0,
    explanation: "Monte Carlo simulation extends this by drawing many input combinations from distributions.",
    optionExplanations: ["Correct.", "They differ.", "That's sensitivity.", "NPV break-even is common."]
  },
  {
    id: "fin-capbud-016", subject: "finance", subtopic: "Capital Budgeting", difficulty: "medium", type: "concept",
    question: "Why can a project with negative static NPV still be worth undertaking?",
    options: ["It can't", "Because IRR is always positive", "Real options: the flexibility to expand if successful, abandon if not, or delay until uncertainty resolves has value that a static DCF ignores", "Because sunk costs are recovered"],
    answer: 2,
    explanation: "E.g. a pilot plant with small negative NPV may open a valuable option to build a full plant. Real options can be valued with option-pricing methods (e.g. binomial trees).",
    optionExplanations: ["Flexibility has value.", "Not true.", "Correct.", "Sunk costs are irrelevant."]
  },
  {
    id: "fin-capbud-017", subject: "finance", subtopic: "Capital Budgeting", difficulty: "medium", type: "concept",
    question: "Cash flows are projected in today's prices (no inflation), but the company's 10% discount rate is nominal with 4% expected inflation. What's wrong?",
    options: ["Nothing", "Inflation never matters", "It overstates NPV", "Inconsistency: real cash flows must be discounted at a real rate (≈ 5.8%), or cash flows must be inflated to nominal terms; mixing them understates NPV"],
    answer: 3,
    explanation: "Real rate = 1.10/1.04 − 1 = 5.77%. Be consistent: nominal with nominal, real with real.",
    optionExplanations: ["It's a classic mistake.", "It matters a lot.", "It understates NPV.", "Correct."]
  },
  {
    id: "fin-capbud-018", subject: "finance", subtopic: "Capital Budgeting", difficulty: "easy", type: "concept",
    question: "What are the main weaknesses of the payback period method?",
    options: ["It's too complex", "It always gives the same answer as NPV", "It ignores cash flows after the payback date and (in simple form) the time value of money, and has an arbitrary cutoff, so it can reject valuable long-term projects", "It uses the cost of capital"],
    answer: 2,
    explanation: "It's still used as a quick liquidity/risk screen.",
    optionExplanations: ["It's simple.", "Not always.", "Correct.", "Simple payback doesn't."]
  },
  {
    id: "fin-capbud-019", subject: "finance", subtopic: "Capital Budgeting", difficulty: "hard", type: "concept",
    question: "Why does NPV assume reinvestment at the cost of capital while IRR assumes reinvestment at the IRR, and why does it matter?",
    options: ["It doesn't matter", "Discounting at r is equivalent to assuming interim cash flows earn r; IRR implicitly assumes they earn the IRR itself. For high-IRR projects this is unrealistic, so IRR overstates attractiveness — MIRR fixes it by using an explicit reinvestment rate", "Both assume 0% reinvestment", "NPV assumes reinvestment at the IRR"],
    answer: 1,
    explanation: "This is one reason NPV and IRR rankings can conflict for projects with different cash-flow timing.",
    optionExplanations: ["It affects rankings.", "Correct.", "Not true.", "Reversed."]
  },
  {
    id: "fin-capbud-020", subject: "finance", subtopic: "Capital Budgeting", difficulty: "medium", type: "concept",
    question: "A firm owns land bought for ₹2 crore years ago, now worth ₹5 crore, and plans to build a factory on it. What land cost should the project bear?",
    options: ["₹2 crore (historical cost)", "₹5 crore: the opportunity cost of not selling it (after any tax effects)", "Zero, since the firm already owns it", "₹3 crore (the gain)"],
    answer: 1,
    explanation: "Relevant cost = what the firm gives up today. Historical cost is sunk.",
    optionExplanations: ["Historical cost is sunk.", "Correct.", "Ownership doesn't make it free.", "Not the opportunity cost."]
  }
);
