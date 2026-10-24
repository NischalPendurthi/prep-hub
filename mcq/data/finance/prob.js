/* Finance — Probability for Quant Finance */
window.QUESTIONS.push(
  {
    id: "fin-prob-001", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "easy", type: "numerical",
    question: "Two fair dice are rolled. What is the expected value of their sum?",
    options: ["6", "3.5", "12", "7"],
    answer: 3,
    explanation: "One fair die has E[X] = (1+2+3+4+5+6)/6 = 3.5. By linearity, E[X + Y] = E[X] + E[Y] = 3.5 + 3.5 = 7. Linearity holds whether or not the variables are independent.",
    optionExplanations: ["Off by one.", "That's the expectation of a single die.", "That's the maximum, not the mean.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-prob-002", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "concept",
    question: "X and Y are strongly dependent random variables. Which statement is true?",
    options: ["E[X + Y] = E[X] + E[Y] still holds", "E[X + Y] cannot be computed without the joint distribution", "E[XY] = E[X]·E[Y] still holds", "Var(X + Y) = Var(X) + Var(Y) still holds"],
    answer: 0,
    explanation: "Linearity of expectation needs no independence: E[aX + bY] = aE[X] + bE[Y] always. In contrast, E[XY] = E[X]E[Y] and Var(X + Y) = Var(X) + Var(Y) need X and Y to be uncorrelated (independence is sufficient).",
    optionExplanations: ["Correct.", "Linearity only needs the marginal means.", "That needs zero covariance.", "That needs zero covariance; in general add 2Cov(X, Y)."]
  },
  {
    id: "fin-prob-003", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "numerical",
    question: "A fair die is rolled 6 times. Using indicator variables, what is the expected number of DISTINCT faces that appear?",
    options: ["6", "About 3.99", "3.5", "About 4.50"],
    answer: 1,
    explanation: "Let Iₖ = 1 if face k appears at least once. P(face k never appears) = (5/6)⁶, so E[Iₖ] = 1 − (5/6)⁶ = 0.6651. By linearity, the expected count = 6 × 0.6651 ≈ 3.99. The indicator trick, E[1_A] = P(A), turns hard counting problems into sums of probabilities.",
    optionExplanations: ["Repeats are very likely.", "Correct.", "That's the mean face value.", "Wrong arithmetic."]
  },
  {
    id: "fin-prob-004", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "hard", type: "numerical",
    question: "n people throw their hats in a pile and each picks one at random. What is the expected number of people who get their own hat?",
    options: ["0", "1, for every n", "n/2", "1/n"],
    answer: 1,
    explanation: "Let Iᵢ = 1 if person i gets their own hat; P(Iᵢ = 1) = 1/n. By linearity, E[Σ Iᵢ] = n × (1/n) = 1, regardless of n — even though the Iᵢ are dependent.",
    optionExplanations: ["The probability of a match isn't zero.", "Correct.", "Far too many.", "That's the probability for one person."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-prob-005", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "easy", type: "numerical",
    question: "Var(X) = 4. What is Var(3X + 5)?",
    options: ["12", "17", "36", "41"],
    answer: 2,
    explanation: "Var(aX + b) = a²·Var(X) = 9 × 4 = 36. Adding a constant shifts the distribution without changing its spread.",
    optionExplanations: ["The scale factor is squared.", "That's 3 × 4 + 5.", "Correct.", "Constants don't add variance."]
  },
  {
    id: "fin-prob-006", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "numerical",
    question: "Var(X) = 4, Var(Y) = 9 and Cov(X, Y) = 2. What are Var(X + Y) and Var(X − Y)?",
    options: ["13 and 13", "17 and 9", "15 and 11", "17 and 5"],
    answer: 1,
    explanation: "Var(X ± Y) = Var(X) + Var(Y) ± 2Cov(X, Y). So Var(X + Y) = 4 + 9 + 4 = 17 and Var(X − Y) = 4 + 9 − 4 = 9. Variances of independent terms always add, even when subtracting the variables.",
    optionExplanations: ["That ignores covariance.", "Correct.", "That uses ±Cov instead of ±2Cov.", "Var(X − Y) is 4 + 9 − 4 = 9."]
  },
  {
    id: "fin-prob-007", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "easy", type: "numerical",
    question: "A fair coin is tossed 4 times. What is the probability of exactly 2 heads?",
    options: ["0.250", "0.0625", "0.500", "0.375"],
    answer: 3,
    explanation: "Binomial: P(X = k) = C(n, k)pᵏ(1 − p)ⁿ⁻ᵏ = C(4, 2) × 0.5⁴ = 6/16 = 0.375. Mean np = 2, variance np(1 − p) = 1.",
    optionExplanations: ["That ignores the 6 orderings.", "That's one specific sequence.", "Too high.", "Correct."]
  },
  {
    id: "fin-prob-008", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "numerical",
    question: "A trading desk sees on average 3 large orders per hour, following a Poisson distribution. What is the probability of exactly 2 large orders in the next hour?",
    options: ["About 0.050", "About 0.149", "About 0.224", "About 0.333"],
    answer: 2,
    explanation: "P(X = k) = λᵏe^(−λ)/k! = 3² × e^(−3) / 2 = 4.5 × 0.0498 = 0.224. For a Poisson distribution, mean = variance = λ. P(0) = e^(−3) ≈ 0.050.",
    optionExplanations: ["That's P(X = 0).", "That's 3e^(−3).", "Correct.", "That's 1/3."]
  },
  {
    id: "fin-prob-009", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "easy", type: "numerical",
    question: "X is uniformly distributed on [2, 8]. What are its mean and variance?",
    options: ["Mean 5, variance 3", "Mean 5, variance 6", "Mean 4, variance 3", "Mean 5, variance 36"],
    answer: 0,
    explanation: "Mean = (a + b)/2 = 5. Variance = (b − a)²/12 = 36/12 = 3.",
    optionExplanations: ["Correct.", "Wrong variance.", "Wrong mean.", "That's (b − a)² without dividing by 12."]
  },
  {
    id: "fin-prob-010", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "easy", type: "numerical",
    question: "Daily returns are normally distributed. Roughly how often would you expect a return more than 2 standard deviations ABOVE the mean?",
    options: ["About 5% of days", "About 2.3% of days", "About 0.15% of days", "About 32% of days"],
    answer: 1,
    explanation: "About 95.4% of a normal distribution lies within ±2σ, leaving 4.6% in both tails, so 2.3% in the upper tail. In real markets, extreme moves are more frequent than this (fat tails).",
    optionExplanations: ["That's both tails.", "Correct.", "That's beyond 3σ in one tail.", "That's outside ±1σ."]
  },
  {
    id: "fin-prob-011", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "concept",
    question: "X ~ N(0, 1) and Y = X². What is Cov(X, Y), and are X and Y independent?",
    options: ["Cov = 1; dependent", "Cov = 0; independent", "Cov = 0; but dependent", "Cov = −1; dependent"],
    answer: 2,
    explanation: "Cov(X, X²) = E[X³] − E[X]E[X²] = 0 − 0 = 0 by symmetry, yet Y is completely determined by X. Zero correlation means no LINEAR relationship; independence is much stronger. (For jointly normal variables, zero correlation does imply independence.)",
    optionExplanations: ["E[X³] = 0, so the covariance is 0.", "Uncorrelated isn't the same as independent.", "Correct.", "The covariance is 0."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-prob-012", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "easy", type: "numerical",
    question: "Cov(X, Y) = 6, σ_X = 2 and σ_Y = 5. What is the correlation?",
    options: ["0.6", "1.2", "0.3", "6"],
    answer: 0,
    explanation: "ρ = Cov(X, Y) / (σ_X σ_Y) = 6 / 10 = 0.6. Correlation is always between −1 and 1.",
    optionExplanations: ["Correct.", "Correlation can't exceed 1.", "Wrong arithmetic.", "That's the covariance."]
  },
  {
    id: "fin-prob-013", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "numerical",
    question: "A drug test is 99% accurate (99% true-positive and 99% true-negative rate), and 0.5% of people use the drug. A person tests positive. What's the probability they actually use it?",
    options: ["99%", "About 50%", "About 33%", "About 5%"],
    answer: 2,
    explanation: "P(T) = 0.99 × 0.005 + 0.01 × 0.995 = 0.01490. Bayes: P(D | T) = 0.99 × 0.005 / 0.01490 ≈ 33.2%. Non-users are so numerous that 1% false positives outnumber the true positives. Ignoring the base rate is the base-rate fallacy.",
    optionExplanations: ["That confuses P(T | D) with P(D | T).", "Too high.", "Correct.", "Too low."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-prob-014", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "numerical",
    question: "A bag has one fair coin and one double-headed coin. You pick one at random, flip it and see heads. What's the probability you picked the double-headed coin?",
    options: ["2/3", "1/2", "3/4", "1/3"],
    answer: 0,
    explanation: "P(H) = ½ × 1 + ½ × ½ = ¾. P(double | H) = (½ × 1) / ¾ = 2/3. Heads is twice as likely from the double-headed coin, so it gets twice the posterior weight.",
    optionExplanations: ["Correct.", "That ignores the evidence.", "That's P(H).", "That's the fair coin's posterior."]
  },
  {
    id: "fin-prob-015", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "hard", type: "concept",
    question: "Which statement about the conditional expectation E[X | Y] is correct?",
    options: ["It's a random variable (a function of Y) and satisfies E[E[X | Y]] = E[X]; it equals E[X] if X and Y are independent", "It's always a fixed number", "It equals E[Y | X]", "It's only defined for normal distributions"],
    answer: 0,
    explanation: "Before Y is observed, E[X | Y] is random; after Y = y is observed it becomes the number E[X | Y = y]. Key properties: the tower property E[E[X | Y]] = E[X], 'pulling out known factors' E[g(Y)X | Y] = g(Y)E[X | Y], and independence giving E[X | Y] = E[X]. This underlies martingales and hedging.",
    optionExplanations: ["Correct.", "Only E[X | Y = y] is a number.", "Conditioning isn't symmetric.", "It's defined generally."]
  },
  {
    id: "fin-prob-016", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "easy", type: "numerical",
    question: "You roll a fair die until you get a 6. What is the expected number of rolls?",
    options: ["3", "3.5", "6", "36"],
    answer: 2,
    explanation: "The number of trials until the first success is geometric with mean 1/p = 1/(1/6) = 6. By first-step analysis: E = 1 + (5/6)E → E = 6.",
    optionExplanations: ["Too few.", "That's the mean face value.", "Correct.", "Far too many."]
  },
  {
    id: "fin-prob-017", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "hard", type: "numerical",
    question: "A fair coin is tossed until two heads in a row (HH) appear. What is the expected number of tosses? And for the pattern HT?",
    options: ["4 for both", "8 for HH, 4 for HT", "4 for HH, 6 for HT", "6 for HH, 4 for HT"],
    answer: 3,
    explanation: "HH: let E₀ be the expected tosses from scratch and E₁ after one H. E₁ = 1 + ½·0 + ½·E₀ and E₀ = 1 + ½E₁ + ½E₀. Solving gives E₀ = 6. HT: once you have an H, you just wait for a T (2 more on average), and the first H takes 2: total 4. A failed HH attempt (HT) sends you back to the start; a failed HT attempt (HH) keeps your progress.",
    optionExplanations: ["The patterns differ.", "HH needs 6, not 8.", "Swapped.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-prob-018", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "hard", type: "numerical",
    question: "You roll a fair die until all 6 faces have appeared. What is the expected number of rolls?",
    options: ["6", "12", "14.7", "21"],
    answer: 2,
    explanation: "Coupon collector: with k faces already seen, a new face appears with probability (6 − k)/6, so the wait is geometric with mean 6/(6 − k). Total = 6/6 + 6/5 + 6/4 + 6/3 + 6/2 + 6/1 = 6 × H₆ = 14.7.",
    optionExplanations: ["Repeats make it longer.", "Too few.", "Correct.", "That's 1 + 2 + … + 6."]
  },
  {
    id: "fin-prob-019", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "hard", type: "numerical",
    question: "A standard 52-card deck is shuffled. What is the expected position of the first ace?",
    options: ["13", "26.5", "9.6", "10.6"],
    answer: 3,
    explanation: "Symmetry: the 4 aces split the 48 non-aces into 5 gaps, each holding 48/5 = 9.6 cards on average. The first ace comes right after the first gap: 9.6 + 1 = 10.6. In general, with N ordinary and k special cards: N/(k + 1) + 1.",
    optionExplanations: ["That's 52/4.", "That's the middle of the deck.", "That's the size of the first gap only.", "Correct."]
  },
  {
    id: "fin-prob-020", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "numerical",
    question: "A non-negative random loss has mean 10. Without knowing anything else, what is the best upper bound on P(loss ≥ 50)?",
    options: ["0.02", "0.50", "0.20", "0.04"],
    answer: 2,
    explanation: "Markov's inequality: P(X ≥ a) ≤ E[X]/a = 10/50 = 0.2. It only needs non-negativity and the mean, so it's loose but universal.",
    optionExplanations: ["No such tight bound is justified.", "Too loose.", "Correct.", "That would need more information."]
  },
  {
    id: "fin-prob-021", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "numerical",
    question: "For ANY distribution with finite variance, Chebyshev's inequality bounds the probability of being at least 3 standard deviations from the mean by what?",
    options: ["0.27%", "1/3", "1/9 ≈ 11.1%", "5%"],
    answer: 2,
    explanation: "Chebyshev: P(|X − μ| ≥ kσ) ≤ 1/k² = 1/9. For a normal distribution the true value is only 0.27%; Chebyshev is loose because it holds for every distribution — which is why it's useful for fat-tailed returns.",
    optionExplanations: ["That's the normal-distribution value, not a universal bound.", "That's 1/k.", "Correct.", "Not the bound."]
  },
  {
    id: "fin-prob-022", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "numerical",
    question: "Weather is a Markov chain: Sunny → Sunny 0.8, Sunny → Rainy 0.2; Rainy → Sunny 0.5, Rainy → Rainy 0.5. If today is sunny, what's the probability it's sunny in two days?",
    options: ["0.64", "0.71", "0.80", "0.74"],
    answer: 3,
    explanation: "Two-step probability = entry (S, S) of P²: 0.8 × 0.8 (stay sunny) + 0.2 × 0.5 (rain then sun) = 0.64 + 0.10 = 0.74.",
    optionExplanations: ["That only counts the sunny-sunny path.", "That's the long-run stationary probability.", "That's the one-step probability.", "Correct."]
  },
  {
    id: "fin-prob-023", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "hard", type: "numerical",
    question: "For the same weather chain (S→S 0.8, S→R 0.2, R→S 0.5, R→R 0.5), what fraction of days are sunny in the long run?",
    options: ["5/7", "4/5", "1/2", "2/7"],
    answer: 0,
    explanation: "Solve πP = π with π_S + π_R = 1: π_S = 0.8π_S + 0.5π_R → 0.2π_S = 0.5π_R → π_S = 2.5π_R. So π_S = 5/7 ≈ 71%. This limit exists and is unique because the chain is irreducible and aperiodic.",
    optionExplanations: ["Correct.", "That's the S→S probability.", "Not symmetric.", "That's the rainy fraction."]
  },
  {
    id: "fin-prob-024", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "concept",
    question: "What defines the Markov property?",
    options: ["The process always returns to its starting point", "The future depends only on the present state, not on how the process got there", "All states are equally likely", "Transitions are deterministic"],
    answer: 1,
    explanation: "P(Xₙ₊₁ = j | Xₙ = i, Xₙ₋₁, …, X₀) = P(Xₙ₊₁ = j | Xₙ = i). The n-step transition probabilities are the entries of Pⁿ. Random walks and Brownian motion are Markov processes.",
    optionExplanations: ["Not required.", "Correct.", "Not required.", "Transitions are random."]
  },
  {
    id: "fin-prob-025", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "hard", type: "numerical",
    question: "X and Y are independent standard normals. What is the distribution of Z = 3X + 4Y?",
    options: ["N(0, 7)", "N(0, 25), i.e. standard deviation 5", "N(0, 49)", "Not normal"],
    answer: 1,
    explanation: "Any linear combination of jointly normal variables is normal: aᵀX has mean aᵀμ = 0 and variance aᵀΣa = 3² + 4² = 25. This collapses portfolio-return problems to a single normal lookup.",
    optionExplanations: ["Variances add with squared weights.", "Correct.", "That squares the sum of weights.", "Linear combinations of jointly normal variables are normal."]
  },
  {
    id: "fin-prob-026", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "hard", type: "concept",
    question: "Order the three types of convergence of random variables from strongest to weakest.",
    options: ["In distribution ⟹ in probability ⟹ almost surely", "They're all equivalent", "In probability ⟹ almost surely ⟹ in distribution", "Almost surely ⟹ in probability ⟹ in distribution"],
    answer: 3,
    explanation: "Almost-sure convergence (the strong LLN) implies convergence in probability (the weak LLN), which implies convergence in distribution (the CLT's guarantee). The reverse implications are false in general.",
    optionExplanations: ["Reversed.", "They differ in strength.", "Wrong order.", "Correct."]
  },
  {
    id: "fin-prob-027", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "numerical",
    question: "100 fair dice are rolled. Using the Central Limit Theorem, what are the approximate mean and standard deviation of the total?",
    options: ["Mean 350, SD about 17.1", "Mean 350, SD about 171", "Mean 350, SD 2.9", "Mean 600, SD about 17.1"],
    answer: 0,
    explanation: "One die: μ = 3.5, σ² = 35/12. The sum of n iid dice is approximately N(nμ, nσ²): mean = 350, SD = √(100 × 35/12) = 17.08. The SD grows with √n, not n.",
    optionExplanations: ["Correct.", "That scales the SD by n instead of √n.", "Too small: one die has SD 1.71, and the sum's SD is √100 = 10 times that.", "The mean is 100 × 3.5."]
  },
  {
    id: "fin-prob-028", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "numerical",
    question: "A Monte Carlo price estimate has a standard error of 0.04 with 10,000 paths. How many paths are needed to cut the standard error to 0.02?",
    options: ["20,000", "40,000", "100,000", "14,142"],
    answer: 1,
    explanation: "The standard error of a sample mean is σ/√n. Halving it requires 4× the paths: 40,000. This 1/√n convergence is why variance-reduction techniques matter.",
    optionExplanations: ["Doubling n reduces the error by only √2.", "Correct.", "Overkill: the error would be 0.0126.", "That's √2 × 10,000."]
  },
  {
    id: "fin-prob-029", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "hard", type: "numerical",
    question: "In a fair coin-flip game you win or lose $1 per flip. You start with $3 and stop when you reach $10 or go broke. What is the probability of reaching $10?",
    options: ["0.3", "0.5", "0.7", "0.03"],
    answer: 0,
    explanation: "Gambler's ruin with a fair game: your wealth is a martingale, so its expected final value equals the starting value: 10 × P(win) + 0 × P(ruin) = 3 → P(win) = 3/10.",
    optionExplanations: ["Correct.", "Your stake isn't halfway to the target.", "That's the ruin probability.", "Off by a factor of 10."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-prob-030", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "hard", type: "numerical",
    question: "You roll a die and get paid its face value in dollars. After the first roll you may choose to reroll once, and you then must take the second result. With optimal play, what's the game worth?",
    options: ["$3.50", "$4.00", "$4.25", "$4.50"],
    answer: 2,
    explanation: "A reroll is worth 3.5 on average, so keep 4, 5 or 6 and reroll 1, 2 or 3. Value = (4 + 5 + 6)/6 + (3/6) × 3.5 = 2.5 + 1.75 = $4.25.",
    optionExplanations: ["That ignores the option.", "That's wrong arithmetic.", "Correct.", "Too high."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-prob-031", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "numerical",
    question: "Two fair dice are rolled. What is the expected value of the larger of the two?",
    options: ["3.5", "4.00", "5.00", "4.47"],
    answer: 3,
    explanation: "P(max ≤ k) = (k/6)², so P(max = k) = (k² − (k − 1)²)/36 = (2k − 1)/36. E[max] = Σ k(2k − 1)/36 = 161/36 ≈ 4.47.",
    optionExplanations: ["That's a single die.", "Too low.", "Too high.", "Correct."]
  },
  {
    id: "fin-prob-032", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "easy", type: "numerical",
    question: "A Bernoulli variable has success probability p. For which p is its variance largest, and what is that variance?",
    options: ["p = 0.5, variance 0.25", "p = 1, variance 1", "p = 0.5, variance 0.5", "p = 0, variance 0"],
    answer: 0,
    explanation: "Var = p(1 − p), maximised at p = 0.5 with value 0.25. Outcomes are most uncertain when both are equally likely.",
    optionExplanations: ["Correct.", "At p = 1 there's no uncertainty: variance 0.", "p(1 − p) at 0.5 is 0.25.", "That's the minimum."]
  },
  {
    id: "fin-prob-033", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "concept",
    question: "How do the Law of Large Numbers and the Central Limit Theorem differ?",
    options: ["They're the same theorem", "The LLN only applies to coin flips", "The CLT requires normal inputs", "The LLN says the sample mean converges to the true mean (justifying Monte Carlo); the CLT describes the SHAPE of the fluctuations around it: approximately normal with SD σ/√n, whatever the original distribution (finite variance needed)"],
    answer: 3,
    explanation: "The CLT is also why Brownian motion has normal increments: it's the limit of many small independent steps.",
    optionExplanations: ["They make different statements.", "It applies to any iid sequence with a finite mean.", "Any iid distribution with finite variance works.", "Correct."]
  },
  {
    id: "fin-prob-034", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "medium", type: "numerical",
    question: "Roughly how many people are needed in a room for a better-than-even chance that two share a birthday (365 equally likely days)?",
    options: ["183", "23", "57", "366"],
    answer: 1,
    explanation: "P(no shared birthday among n) = Π (365 − i)/365 for i = 0 … n − 1. At n = 23 this is 0.493, so P(shared) ≈ 50.7%. Pairs grow like n²/2 (253 pairs for 23 people), which is why intuition underestimates it.",
    optionExplanations: ["That's half the days.", "Correct.", "At 57 the probability is about 99%.", "That guarantees a match (pigeonhole)."]
  },
  {
    id: "fin-prob-035", subject: "finance", subtopic: "Probability for Quant Finance", difficulty: "easy", type: "numerical",
    question: "Two dice are rolled and the first shows 3. What is the probability that the sum is 8?",
    options: ["5/36", "1/6", "1/36", "1/3"],
    answer: 1,
    explanation: "Given the first die is 3, the sum is 8 only if the second die is 5: probability 1/6. Unconditionally P(sum = 8) = 5/36; conditioning changes the sample space.",
    optionExplanations: ["That's the unconditional probability.", "Correct.", "That's the probability of a specific pair of outcomes, not conditional on the first die.", "Too high."]
  }
);
