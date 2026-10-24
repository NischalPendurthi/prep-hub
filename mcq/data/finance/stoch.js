/* Finance — Stochastic Calculus & GBM */
window.QUESTIONS.push(
  {
    id: "fin-stoch-001", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "easy", type: "numerical",
    question: "A symmetric random walk moves +1 or −1 with equal probability each step. After 100 steps, what are its expected position and standard deviation?",
    options: ["Mean 0, SD 10", "Mean 0, SD 100", "Mean 50, SD 10", "Mean 0, SD 1"],
    answer: 0,
    explanation: "Each step has mean 0 and variance 1. By linearity E[M₁₀₀] = 0; independent steps add variances, so Var = 100 and SD = √100 = 10. Typical distance from the start grows like √n.",
    optionExplanations: ["Correct.", "That's the variance.", "The walk is symmetric, so the mean is 0.", "That's a single step."]
  },
  {
    id: "fin-stoch-002", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "concept",
    question: "Why is the symmetric random walk a martingale?",
    options: ["Because it always returns to zero", "Because its variance is constant", "Because E[Mₙ₊₁ | M₁, …, Mₙ] = Mₙ: the next step has mean 0 and is independent of the past, so the best forecast of the future is the current value", "Because it can't go negative"],
    answer: 2,
    explanation: "A martingale is a 'fair game' process. Under the risk-neutral measure, discounted asset prices are martingales, which is the foundation of derivative pricing.",
    optionExplanations: ["It needn't return to zero.", "Its variance grows with n.", "Correct.", "It can be negative."]
  },
  {
    id: "fin-stoch-003", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "concept",
    question: "What is the quadratic variation Σ(Mⱼ − Mⱼ₋₁)² of a ±1 symmetric random walk after n steps?",
    options: ["0", "√n", "Random, with mean n", "Exactly n, whatever the path"],
    answer: 3,
    explanation: "Each squared increment is (±1)² = 1, so the sum is exactly n on every path. The randomness cancels when increments are squared. For Brownian motion the analogue is [W]_T = T, written (dW)² = dt.",
    optionExplanations: ["Squared increments are always 1.", "That's the standard deviation of the position.", "It isn't random at all.", "Correct."]
  },
  {
    id: "fin-stoch-004", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "easy", type: "concept",
    question: "Which is NOT a property of standard Brownian motion W(t)?",
    options: ["W(0) = 0", "Increments over non-overlapping intervals are independent", "W(t) − W(s) ~ N(0, t − s)", "Its paths are smooth and differentiable"],
    answer: 3,
    explanation: "Brownian paths are continuous but nowhere differentiable: increments scale like √dt, so the 'slope' ΔW/Δt ~ 1/√Δt blows up as Δt → 0. The other three properties define Brownian motion.",
    optionExplanations: ["That's a defining property.", "That's a defining property.", "That's a defining property.", "Correct: paths are nowhere differentiable."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-stoch-005", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "numerical",
    question: "What is the distribution of W(4) − W(1) for standard Brownian motion?",
    options: ["N(0, 3)", "N(0, 4)", "N(3, 3)", "N(0, 9)"],
    answer: 0,
    explanation: "W(t) − W(s) ~ N(0, t − s) = N(0, 3): mean 0, variance 3, standard deviation √3 ≈ 1.73. It's independent of W(1).",
    optionExplanations: ["Correct.", "That's W(4) itself.", "Increments have mean 0.", "Variance is t − s, not (t − s)²."]
  },
  {
    id: "fin-stoch-006", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "hard", type: "numerical",
    question: "For standard Brownian motion, what are Cov(W(2), W(5)) and Var(W(2) + W(5))?",
    options: ["0 and 7", "5 and 11", "2 and 11", "2 and 7"],
    answer: 2,
    explanation: "Cov(W(s), W(t)) = min(s, t) = 2, because W(5) = W(2) + an independent increment. Var(W(2) + W(5)) = 2 + 5 + 2 × 2 = 11. Equivalently, 2W(2) + [W(5) − W(2)] has variance 4 × 2 + 3 = 11.",
    optionExplanations: ["The values are correlated.", "The covariance is the smaller time.", "Correct.", "That ignores the covariance."]
  },
  {
    id: "fin-stoch-007", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "concept",
    question: "How is Brownian motion obtained from a random walk?",
    options: ["By making the steps larger over time", "By averaging many random walks", "By using steps of ±h", "By splitting time T into n steps of length h = T/n with moves of ±√h, and letting n → ∞; the √h scaling keeps the variance finite (n·h = T), and the CLT makes increments normal"],
    answer: 3,
    explanation: "With ±h steps the variance n·h² → 0 and the process collapses to zero; with ±√h it stays at T. Quadratic variation Σ(√h)² = T stays deterministic.",
    optionExplanations: ["Not the construction.", "Averaging reduces variance.", "The variance would vanish.", "Correct."]
  },
  {
    id: "fin-stoch-008", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "concept",
    question: "Why does ordinary calculus fail for functions of Brownian motion?",
    options: ["Brownian motion is discontinuous", "Brownian motion has infinite mean", "In ordinary calculus (dx)² is negligible, but a Brownian increment is of order √dt, so (dW)² = dt is the same order as dt and can't be dropped; second-order terms survive", "Derivatives of Brownian motion are zero"],
    answer: 2,
    explanation: "Keeping the (dW)² = dt term in a Taylor expansion gives Itô's lemma, with its extra ½σ²f'' dt drift term.",
    optionExplanations: ["Its paths are continuous.", "Its mean is 0.", "Correct.", "Its derivative doesn't exist."]
  },
  {
    id: "fin-stoch-009", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "concept",
    question: "For dX = μ dt + σ dW and a smooth function f(t, X), what does Itô's lemma give for df?",
    options: ["df = (∂f/∂t + μ ∂f/∂x) dt", "df = (∂f/∂t + μ ∂f/∂x + ½σ² ∂²f/∂x²) dt + σ ∂f/∂x dW", "df = σ ∂f/∂x dW only", "df = (∂f/∂t + ½σ² ∂²f/∂x²) dt"],
    answer: 1,
    explanation: "Compared with the ordinary chain rule there's an extra ½σ²f'' dt term from (dW)² = dt, plus the random term σf' dW. The curvature of f interacts with squared noise to create drift.",
    optionExplanations: ["That's the ordinary chain rule, missing the Itô term and the noise.", "Correct.", "Missing the drift terms.", "Missing μf' and the dW term."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-stoch-010", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "hard", type: "numerical",
    question: "Using Itô's lemma, what is d(W²) for standard Brownian motion W?",
    options: ["2W dW", "2W dW + dt", "dt", "2W dt + dW"],
    answer: 1,
    explanation: "f(x) = x², f' = 2x, f'' = 2; with μ = 0 and σ = 1: df = ½ × 2 dt + 2W dW = 2W dW + dt. So W(t)² = 2∫W dW + t: W² isn't a martingale, but W² − t is.",
    optionExplanations: ["That's the ordinary chain rule, missing the Itô term.", "Correct.", "Missing the random term.", "Mixed-up terms."],
    tags: ["interview-favourite"]
  },
  {
    id: "fin-stoch-011", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "easy", type: "concept",
    question: "Why are stock prices modelled with the proportional SDE dS = μS dt + σS dW rather than dS = μ dt + σ dW?",
    options: ["To make the maths easier", "Because stock prices are normally distributed", "Because what matters is percentage returns: a $10 move means very different things at $20 and at $2,000. Scaling drift and noise by S also keeps prices positive", "Because volatility is zero"],
    answer: 2,
    explanation: "In arithmetic Brownian motion prices could go negative and volatility in dollars wouldn't scale with price. GBM gives lognormal prices.",
    optionExplanations: ["The point is realism.", "Under GBM log prices are normal, not prices.", "Correct.", "σ is positive."]
  },
  {
    id: "fin-stoch-012", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "hard", type: "concept",
    question: "Applying Itô's lemma to ln S, where dS = μS dt + σS dW, gives which result?",
    options: ["d(ln S) = μ dt + σ dW", "d(ln S) = (μ + ½σ²) dt + σ dW", "d(ln S) = (μ − ½σ²) dt + σ dW", "d(ln S) = μ dt"],
    answer: 2,
    explanation: "f = ln S: f' = 1/S, f'' = −1/S². df = [μS(1/S) + ½σ²S²(−1/S²)] dt + σS(1/S) dW = (μ − ½σ²) dt + σ dW. Integrating gives S(t) = S(0)·exp((μ − ½σ²)t + σW(t)).",
    optionExplanations: ["Missing the Itô correction.", "Wrong sign: ln is concave, so f'' < 0.", "Correct.", "Missing the noise and correction."]
  },
  {
    id: "fin-stoch-013", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "concept",
    question: "Under geometric Brownian motion, what is the distribution of S(T)?",
    options: ["Normal", "Poisson", "Uniform", "Lognormal: ln S(T) ~ N(ln S(0) + (μ − ½σ²)T, σ²T)"],
    answer: 3,
    explanation: "Because S(T) = S(0)·exp(normal variable), log prices are normal and prices are lognormal: always positive and right-skewed. This is the Black-Scholes assumption.",
    optionExplanations: ["Prices can't be negative.", "Not discrete.", "Not uniform.", "Correct."]
  },
  {
    id: "fin-stoch-014", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "hard", type: "numerical",
    question: "A stock follows GBM with S(0) = 100, μ = 10% and σ = 20% per year. What are the expected price and the median price after 1 year?",
    options: ["Both $110.00", "Mean $110.52, median $110.52", "Mean $108.33, median $110.52", "Mean $110.52, median $108.33"],
    answer: 3,
    explanation: "E[S(T)] = S(0)e^(μT) = 100e^0.10 = $110.52. The median sets W(T) = 0: S(0)e^((μ − ½σ²)T) = 100e^0.08 = $108.33. The mean exceeds the median because the lognormal distribution is right-skewed.",
    optionExplanations: ["That's simple interest and ignores skew.", "The median is lower than the mean.", "Swapped.", "Correct."]
  },
  {
    id: "fin-stoch-015", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "hard", type: "numerical",
    question: "A volatile asset has expected arithmetic return μ = 10% per year and volatility σ = 40%, modelled as GBM. What is the expected LOG (continuously compounded, i.e. median) growth rate?",
    options: ["10%", "2%", "−6%", "18%"],
    answer: 1,
    explanation: "E[ln(S_T/S_0)]/T = μ − ½σ² = 0.10 − 0.08 = 2%. This 'volatility drag' is why a highly volatile asset can have a decent average return yet a typical investor compounds much more slowly.",
    optionExplanations: ["That ignores volatility drag.", "Correct.", "That subtracts σ² instead of ½σ².", "Wrong sign."]
  },
  {
    id: "fin-stoch-016", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "hard", type: "numerical",
    question: "Under GBM with S(0) = 100, μ = 10%, σ = 20%, what is the real-world probability that S(1) > 100?",
    options: ["About 65.5%", "50.0%", "About 69.1%", "About 84.1%"],
    answer: 0,
    explanation: "S(1) > 100 ⟺ (μ − ½σ²) + σZ > 0 ⟺ Z > −0.08/0.2 = −0.4. P = N(0.4) ≈ 0.655. (Using μ instead of μ − ½σ² gives N(0.5) ≈ 69.1%, the classic mistake.)",
    optionExplanations: ["Correct.", "The drift is positive.", "That ignores the ½σ² correction.", "That's N(1)."]
  },
  {
    id: "fin-stoch-017", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "hard", type: "concept",
    question: "Which of these processes is NOT a martingale (W is standard Brownian motion)?",
    options: ["W(t)", "W(t)² − t", "exp(σW(t) − ½σ²t)", "W(t)²"],
    answer: 3,
    explanation: "E[W(t)²] = t increases over time, so W² has positive drift: d(W²) = 2W dW + dt. Subtracting t removes it. exp(σW − ½σ²t) is the exponential martingale, since E[e^(σW(t))] = e^(½σ²t).",
    optionExplanations: ["Brownian motion is a martingale.", "The compensated square is a martingale.", "The exponential martingale.", "Correct: it has drift dt."]
  },
  {
    id: "fin-stoch-018", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "concept",
    question: "In risk-neutral pricing, how is the GBM stock dynamics dS = μS dt + σS dW changed?",
    options: ["σ is replaced by r", "The drift μ is replaced by the risk-free rate r (minus any dividend yield); volatility σ is unchanged", "Both μ and σ are set to zero", "μ is doubled"],
    answer: 1,
    explanation: "Under the risk-neutral measure every asset earns r on average, so discounted prices are martingales. Option prices therefore don't depend on μ — a key insight of Black-Scholes. Volatility must stay the same because changing measure can't change σ.",
    optionExplanations: ["Volatility is unchanged.", "Correct.", "Volatility remains.", "Not the rule."]
  },
  {
    id: "fin-stoch-019", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "concept",
    question: "Which discretisation simulates GBM exactly at the grid points over a time step Δt (Z is standard normal)?",
    options: ["S(t + Δt) = S(t) + μ Δt", "S(t + Δt) = S(t)·exp((μ − ½σ²)Δt + σ√Δt·Z)", "S(t + Δt) = S(t)·(1 + σZ)", "S(t + Δt) = S(t)·exp(μΔt + σΔt·Z)"],
    answer: 1,
    explanation: "This uses the exact log-solution, so there's no discretisation error and prices stay positive. A naive Euler step S(1 + μΔt + σ√ΔtZ) is only approximate and can go negative.",
    optionExplanations: ["No randomness.", "Correct.", "Missing drift and the √Δt scaling.", "Missing the Itô correction; the noise must scale with √Δt."]
  },
  {
    id: "fin-stoch-020", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "easy", type: "concept",
    question: "In the GBM model, what do μ and σ represent?",
    options: ["μ is the expected (drift) rate of return per year; σ is the volatility, the standard deviation of returns per √year", "Price and volume", "μ is the dividend and σ the interest rate", "Both measure risk"],
    answer: 0,
    explanation: "Volatility scales with √T: σ√T is the standard deviation of log returns over horizon T.",
    optionExplanations: ["Correct.", "Not parameters of the SDE.", "Different parameters.", "μ is expected return."]
  },
  {
    id: "fin-stoch-021", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "numerical",
    question: "Annual volatility is 20%. Under GBM, what's the standard deviation of log returns over 3 months?",
    options: ["5%", "20%", "10%", "2.5%"],
    answer: 2,
    explanation: "σ√T = 0.20 × √0.25 = 0.20 × 0.5 = 10%. Volatility scales with the square root of time because variance scales linearly.",
    optionExplanations: ["That scales linearly with time.", "That's a full year.", "Correct.", "Wrong arithmetic."]
  },
  {
    id: "fin-stoch-022", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "hard", type: "numerical",
    question: "For standard Brownian motion and a constant σ, what is E[e^(σW(t))]?",
    options: ["1", "e^(σt)", "e^(½σ²t)", "e^(σ²t)"],
    answer: 2,
    explanation: "σW(t) ~ N(0, σ²t), and E[e^X] = e^(μ + ½Var) for normal X: e^(½σ²t). By Jensen's inequality it exceeds e^(E[σW]) = 1. This is the source of the −½σ² in GBM.",
    optionExplanations: ["Jensen's inequality makes it larger than 1.", "Wrong exponent.", "Correct.", "Off by a factor of 2."]
  },
  {
    id: "fin-stoch-023", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "concept",
    question: "In the Itô integral ∫H dW, why must the integrand H(t) be evaluated at the START of each small interval?",
    options: ["It's a convention without consequences", "So H is non-anticipating: a trader chooses holdings before seeing the next price move. This makes the integral a martingale with zero mean; evaluating at the midpoint (Stratonovich) gives different results for Brownian motion", "To make the integral larger", "Because W isn't defined at endpoints"],
    answer: 1,
    explanation: "Because Brownian motion has non-zero quadratic variation, the choice of evaluation point changes the answer, unlike ordinary Riemann integrals. Finance uses Itô because it matches how trading works.",
    optionExplanations: ["It changes the result.", "Correct.", "Not the reason.", "W is defined everywhere."]
  },
  {
    id: "fin-stoch-024", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "easy", type: "concept",
    question: "What does Monte Carlo simulation of GBM do to price a derivative?",
    options: ["Simulates many random price paths (under the risk-neutral measure), computes the payoff on each, averages them and discounts at the risk-free rate; the LLN makes the average converge", "Solves the PDE exactly", "Uses only the current price", "Uses historical returns only"],
    answer: 0,
    explanation: "It handles path-dependent payoffs (Asian, barrier options) easily. Its error falls like 1/√(number of paths).",
    optionExplanations: ["Correct.", "That's a PDE method.", "Not simulation.", "Pricing uses risk-neutral dynamics."]
  },
  {
    id: "fin-stoch-025", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "numerical",
    question: "For standard Brownian motion, what is P(W(1) > 0), and what is P(W(2) > 0 | W(1) = 1)?",
    options: ["0.5 and 0.5", "0.5 and about 0.84", "0.5 and 1.0", "0.84 and 0.5"],
    answer: 1,
    explanation: "W(1) ~ N(0, 1), so P(W(1) > 0) = 0.5. Given W(1) = 1, W(2) = 1 + an independent N(0, 1) increment; P(W(2) > 0) = P(Z > −1) = N(1) ≈ 0.84. By the Markov property, only the current value matters.",
    optionExplanations: ["Conditioning on W(1) = 1 helps.", "Correct.", "It can still fall below 0.", "Swapped."]
  },
  {
    id: "fin-stoch-026", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "hard", type: "concept",
    question: "Over a period with returns +50% then −50%, an investor ends with 75% of their money even though the average return is 0%. Which concept from GBM explains this?",
    options: ["Volatility drag: compounded (geometric) growth ≈ arithmetic mean − ½σ², so volatility lowers realised growth even with zero average return", "Mean reversion", "Survivorship bias", "The Itô integral being zero"],
    answer: 0,
    explanation: "1.5 × 0.5 = 0.75. The geometric mean return is √0.75 − 1 ≈ −13.4% per period. In GBM terms, the median growth rate μ − ½σ² lies below μ.",
    optionExplanations: ["Correct.", "No mean reversion is involved.", "Not about survivors.", "Unrelated."]
  },
  {
    id: "fin-stoch-027", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "medium", type: "concept",
    question: "Which property of GBM is often criticised as unrealistic for real stock returns?",
    options: ["Prices staying positive", "Dependence on the current price", "Continuous paths in time", "Constant volatility and normally distributed log returns, which miss volatility clustering, fat tails and jumps"],
    answer: 3,
    explanation: "Extensions include stochastic volatility (Heston), jump-diffusion (Merton) and GARCH-type models. The implied-volatility smile is evidence against constant σ.",
    optionExplanations: ["Positivity is realistic.", "Proportional dynamics are realistic.", "Continuity is also questioned (jumps), but the main critique is constant σ and thin tails.", "Correct."]
  },
  {
    id: "fin-stoch-028", subject: "finance", subtopic: "Stochastic Calculus & GBM", difficulty: "easy", type: "concept",
    question: "In Itô calculus, which multiplication-table rules apply to the differentials?",
    options: ["dW·dW = dt, dt·dW = 0, dt·dt = 0", "dt·dt = dt, dW·dW = 0", "dW·dW = 0, dt·dW = dt", "All products are zero"],
    answer: 0,
    explanation: "Only (dW)² survives, equal to dt; the other products are of higher order (dt^1.5 and dt²) and vanish. These rules give Itô's lemma when expanding f to second order.",
    optionExplanations: ["Correct.", "dt² vanishes and (dW)² doesn't.", "Reversed.", "(dW)² = dt."]
  }
);
