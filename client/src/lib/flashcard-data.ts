export interface FlashcardDef {
  id: string;
  subject: string;
  subjectCode: string;
  topic: string;
  topicCode: string;
  type: "basic" | "cloze" | "reversed";
  front: string;
  back: string;
}

export const FLASHCARD_DECKS: FlashcardDef[] = [
  // =============================================
  // MATHEMATICS — 30 cards
  // =============================================

  // Patterns, Sequences and Series
  { id: "MATH-001", subject: "Mathematics", subjectCode: "MATH", topic: "Patterns, Sequences and Series", topicCode: "MATH-1", type: "basic", front: "What is the formula for the nth term of an arithmetic sequence?", back: "Tₙ = a + (n − 1)d\n\nwhere a = first term, d = common difference, n = term number" },
  { id: "MATH-002", subject: "Mathematics", subjectCode: "MATH", topic: "Patterns, Sequences and Series", topicCode: "MATH-1", type: "basic", front: "What is the sum of the first n terms of an arithmetic series?", back: "Sₙ = n/2 [2a + (n − 1)d]  or  Sₙ = n/2 (a + l)\n\nwhere l = last term" },
  { id: "MATH-003", subject: "Mathematics", subjectCode: "MATH", topic: "Patterns, Sequences and Series", topicCode: "MATH-1", type: "basic", front: "What is the formula for the nth term of a geometric sequence?", back: "Tₙ = a · r^(n−1)\n\nwhere a = first term, r = common ratio" },
  { id: "MATH-004", subject: "Mathematics", subjectCode: "MATH", topic: "Patterns, Sequences and Series", topicCode: "MATH-1", type: "cloze", front: "The sum to infinity of a geometric series exists only when {{___}} and equals {{___}}.", back: "|r| < 1 ; S∞ = a / (1 − r)" },

  // Functions and Inverse Functions
  { id: "MATH-005", subject: "Mathematics", subjectCode: "MATH", topic: "Functions and Inverse Functions", topicCode: "MATH-2", type: "basic", front: "How do you find the inverse of a function algebraically?", back: "1. Swap x and y\n2. Solve for y\n3. The result is f⁻¹(x)" },
  { id: "MATH-006", subject: "Mathematics", subjectCode: "MATH", topic: "Functions and Inverse Functions", topicCode: "MATH-2", type: "basic", front: "The graph of an inverse function is a reflection of the original function in which line?", back: "The line y = x" },

  // Exponential and Logarithmic Functions
  { id: "MATH-007", subject: "Mathematics", subjectCode: "MATH", topic: "Exponential and Logarithmic Functions", topicCode: "MATH-3", type: "basic", front: "Convert to logarithmic form: aˣ = b", back: "x = logₐ b" },
  { id: "MATH-008", subject: "Mathematics", subjectCode: "MATH", topic: "Exponential and Logarithmic Functions", topicCode: "MATH-3", type: "cloze", front: "log(A × B) = {{___}} and log(A/B) = {{___}}", back: "log A + log B ; log A − log B" },

  // Finance, Growth and Decay
  { id: "MATH-009", subject: "Mathematics", subjectCode: "MATH", topic: "Finance, Growth and Decay", topicCode: "MATH-4", type: "basic", front: "What is the compound interest formula (growth)?", back: "A = P(1 + i)ⁿ\n\nA = final amount, P = principal, i = interest rate per period, n = number of periods" },
  { id: "MATH-010", subject: "Mathematics", subjectCode: "MATH", topic: "Finance, Growth and Decay", topicCode: "MATH-4", type: "basic", front: "What is the reducing balance depreciation formula?", back: "A = P(1 − i)ⁿ" },
  { id: "MATH-011", subject: "Mathematics", subjectCode: "MATH", topic: "Finance, Growth and Decay", topicCode: "MATH-4", type: "basic", front: "What is the future value annuity formula?", back: "F = x[(1 + i)ⁿ − 1] / i\n\nwhere x = regular payment" },

  // Trigonometry
  { id: "MATH-012", subject: "Mathematics", subjectCode: "MATH", topic: "Trigonometry", topicCode: "MATH-5", type: "basic", front: "State the compound angle formula for sin(A + B).", back: "sin(A + B) = sin A cos B + cos A sin B" },
  { id: "MATH-013", subject: "Mathematics", subjectCode: "MATH", topic: "Trigonometry", topicCode: "MATH-5", type: "basic", front: "State the double angle formula for cos 2A (all three forms).", back: "cos 2A = cos²A − sin²A\ncos 2A = 2cos²A − 1\ncos 2A = 1 − 2sin²A" },
  { id: "MATH-014", subject: "Mathematics", subjectCode: "MATH", topic: "Trigonometry", topicCode: "MATH-5", type: "cloze", front: "The sine rule states: a/sin A = {{___}}", back: "b/sin B = c/sin C" },

  // Polynomials
  { id: "MATH-015", subject: "Mathematics", subjectCode: "MATH", topic: "Polynomials", topicCode: "MATH-6", type: "basic", front: "State the Remainder Theorem.", back: "When a polynomial f(x) is divided by (x − a), the remainder is f(a)." },
  { id: "MATH-016", subject: "Mathematics", subjectCode: "MATH", topic: "Polynomials", topicCode: "MATH-6", type: "basic", front: "State the Factor Theorem.", back: "If f(a) = 0, then (x − a) is a factor of f(x)." },

  // Differential Calculus
  { id: "MATH-017", subject: "Mathematics", subjectCode: "MATH", topic: "Differential Calculus", topicCode: "MATH-7", type: "basic", front: "What is the derivative of xⁿ using the power rule?", back: "d/dx [xⁿ] = nxⁿ⁻¹" },
  { id: "MATH-018", subject: "Mathematics", subjectCode: "MATH", topic: "Differential Calculus", topicCode: "MATH-7", type: "basic", front: "What does f'(x) = 0 indicate about the original function?", back: "A stationary point (local maximum, local minimum, or point of inflection)" },
  { id: "MATH-019", subject: "Mathematics", subjectCode: "MATH", topic: "Differential Calculus", topicCode: "MATH-7", type: "cloze", front: "If f''(x) > 0, the graph is concave {{___}}. If f''(x) < 0, the graph is concave {{___}}.", back: "up ; down" },

  // Analytical Geometry
  { id: "MATH-020", subject: "Mathematics", subjectCode: "MATH", topic: "Analytical Geometry", topicCode: "MATH-8", type: "basic", front: "What is the distance formula between two points (x₁,y₁) and (x₂,y₂)?", back: "d = √[(x₂ − x₁)² + (y₂ − y₁)²]" },
  { id: "MATH-021", subject: "Mathematics", subjectCode: "MATH", topic: "Analytical Geometry", topicCode: "MATH-8", type: "basic", front: "What is the midpoint formula?", back: "M = ((x₁ + x₂)/2, (y₁ + y₂)/2)" },
  { id: "MATH-022", subject: "Mathematics", subjectCode: "MATH", topic: "Analytical Geometry", topicCode: "MATH-8", type: "basic", front: "What is the gradient formula?", back: "m = (y₂ − y₁) / (x₂ − x₁)" },

  // Euclidean Geometry
  { id: "MATH-023", subject: "Mathematics", subjectCode: "MATH", topic: "Euclidean Geometry", topicCode: "MATH-9", type: "basic", front: "State the Proportionality Theorem (Basic).", back: "A line drawn parallel to one side of a triangle divides the other two sides proportionally." },
  { id: "MATH-024", subject: "Mathematics", subjectCode: "MATH", topic: "Euclidean Geometry", topicCode: "MATH-9", type: "basic", front: "What are the conditions for two triangles to be similar?", back: "All pairs of corresponding angles are equal, OR all pairs of corresponding sides are in the same ratio." },
  { id: "MATH-025", subject: "Mathematics", subjectCode: "MATH", topic: "Euclidean Geometry", topicCode: "MATH-9", type: "basic", front: "State the Tangent-Chord Theorem.", back: "The angle between a tangent and a chord equals the inscribed angle subtended by the chord on the opposite side." },

  // Statistics
  { id: "MATH-026", subject: "Mathematics", subjectCode: "MATH", topic: "Statistics", topicCode: "MATH-10", type: "basic", front: "What is the formula for standard deviation?", back: "σ = √[Σ(xᵢ − x̄)² / n]\n\nwhere x̄ is the mean and n is the number of data points" },
  { id: "MATH-027", subject: "Mathematics", subjectCode: "MATH", topic: "Statistics", topicCode: "MATH-10", type: "cloze", front: "In a normal distribution, approximately {{___}}% of data falls within one standard deviation of the mean.", back: "68" },

  // Counting and Probability
  { id: "MATH-028", subject: "Mathematics", subjectCode: "MATH", topic: "Counting and Probability", topicCode: "MATH-11", type: "basic", front: "What is the formula for n! (n factorial)?", back: "n! = n × (n−1) × (n−2) × ... × 2 × 1\n\nNote: 0! = 1" },
  { id: "MATH-029", subject: "Mathematics", subjectCode: "MATH", topic: "Counting and Probability", topicCode: "MATH-11", type: "basic", front: "State the formula for permutations of n objects taken r at a time.", back: "P(n,r) = n! / (n−r)!" },
  { id: "MATH-030", subject: "Mathematics", subjectCode: "MATH", topic: "Counting and Probability", topicCode: "MATH-11", type: "cloze", front: "P(A or B) = P(A) + P(B) − {{___}} for events that are NOT mutually exclusive.", back: "P(A and B)" },

  // =============================================
  // PHYSICAL SCIENCES — 30 cards
  // =============================================

  // Momentum and Impulse
  { id: "PHYS-001", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Momentum and Impulse", topicCode: "PHYS-1", type: "basic", front: "Define momentum.", back: "Momentum (p) is the product of an object's mass and velocity.\n\np = mv\n\nUnit: kg·m·s⁻¹" },
  { id: "PHYS-002", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Momentum and Impulse", topicCode: "PHYS-1", type: "basic", front: "State Newton's Second Law in terms of momentum.", back: "The net force acting on an object is equal to the rate of change of its momentum.\n\nFₙₑₜ = Δp / Δt" },
  { id: "PHYS-003", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Momentum and Impulse", topicCode: "PHYS-1", type: "cloze", front: "In an isolated system, total momentum before collision equals {{___}}. This is the law of {{___}}.", back: "total momentum after collision ; conservation of momentum" },

  // Vertical Projectile Motion
  { id: "PHYS-004", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Vertical Projectile Motion", topicCode: "PHYS-2", type: "basic", front: "What are the three equations of motion for vertical projectile motion?", back: "v = u + gt\nΔy = ut + ½gt²\nv² = u² + 2gΔy\n\nwhere g = 9.8 m·s⁻² downward" },
  { id: "PHYS-005", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Vertical Projectile Motion", topicCode: "PHYS-2", type: "cloze", front: "At the maximum height of a projectile, the velocity is {{___}} and the acceleration is {{___}}.", back: "zero (0 m·s⁻¹) ; 9.8 m·s⁻² downward (g never changes)" },

  // Organic Chemistry
  { id: "PHYS-006", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Organic Chemistry", topicCode: "PHYS-3", type: "basic", front: "Name the first four alkanes and their molecular formulas.", back: "Methane (CH₄)\nEthane (C₂H₆)\nPropane (C₃H₈)\nButane (C₄H₁₀)\n\nGeneral formula: CₙH₂ₙ₊₂" },
  { id: "PHYS-007", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Organic Chemistry", topicCode: "PHYS-3", type: "basic", front: "What is the functional group of an alcohol?", back: "Hydroxyl group (−OH)\n\nGeneral formula: CₙH₂ₙ₊₁OH" },
  { id: "PHYS-008", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Organic Chemistry", topicCode: "PHYS-3", type: "basic", front: "What is the functional group of a carboxylic acid?", back: "Carboxyl group (−COOH)\n\nGeneral formula: CₙH₂ₙ₊₁COOH" },
  { id: "PHYS-009", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Organic Chemistry", topicCode: "PHYS-3", type: "cloze", front: "An ester is formed by the reaction of a {{___}} with a {{___}}. This reaction is called {{___}}.", back: "carboxylic acid ; alcohol ; esterification" },

  // Work, Energy and Power
  { id: "PHYS-010", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Work, Energy and Power", topicCode: "PHYS-4", type: "basic", front: "Define work done by a force.", back: "Work is the product of the applied force and the displacement in the direction of the force.\n\nW = FΔx cos θ\n\nUnit: Joule (J)" },
  { id: "PHYS-011", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Work, Energy and Power", topicCode: "PHYS-4", type: "basic", front: "State the work-energy theorem.", back: "The net work done on an object equals the change in its kinetic energy.\n\nWₙₑₜ = ΔEₖ = ½mv² − ½mu²" },
  { id: "PHYS-012", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Work, Energy and Power", topicCode: "PHYS-4", type: "cloze", front: "Power is the rate of doing {{___}}. P = {{___}}. Unit: {{___}}", back: "work ; W/Δt ; Watt (W)" },

  // Doppler Effect
  { id: "PHYS-013", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Doppler Effect", topicCode: "PHYS-5", type: "basic", front: "What is the Doppler Effect?", back: "The apparent change in frequency (or pitch) of a wave due to the relative motion between the source and the observer." },
  { id: "PHYS-014", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Doppler Effect", topicCode: "PHYS-5", type: "basic", front: "State the Doppler formula for sound when the source approaches a stationary observer.", back: "fₗ = fₛ × v / (v − vₛ)\n\nwhere v = speed of sound, vₛ = speed of source" },

  // Electric Circuits
  { id: "PHYS-015", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Electric Circuits", topicCode: "PHYS-6", type: "basic", front: "State Ohm's Law.", back: "The current through a conductor is directly proportional to the potential difference across it, provided the temperature remains constant.\n\nV = IR" },
  { id: "PHYS-016", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Electric Circuits", topicCode: "PHYS-6", type: "basic", front: "How do you calculate total resistance in series?", back: "Rₜₒₜₐₗ = R₁ + R₂ + R₃ + ..." },
  { id: "PHYS-017", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Electric Circuits", topicCode: "PHYS-6", type: "basic", front: "How do you calculate total resistance in parallel?", back: "1/Rₜₒₜₐₗ = 1/R₁ + 1/R₂ + 1/R₃ + ..." },
  { id: "PHYS-018", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Electric Circuits", topicCode: "PHYS-6", type: "cloze", front: "The equation for emf is: ε = {{___}} + {{___}}", back: "Vₑₓₜ (external voltage) ; Ir (lost volts / internal resistance voltage)" },

  // Electrodynamics
  { id: "PHYS-019", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Electrodynamics", topicCode: "PHYS-7", type: "basic", front: "What is Faraday's Law of electromagnetic induction?", back: "The emf induced in a coil is directly proportional to the rate of change of magnetic flux linkage through the coil.\n\nε = −NΔΦ/Δt" },
  { id: "PHYS-020", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Electrodynamics", topicCode: "PHYS-7", type: "basic", front: "What is the difference between an AC generator and a DC generator?", back: "AC generator: uses slip rings → produces alternating current\nDC generator: uses a split-ring commutator → produces direct current" },

  // Optical Phenomena
  { id: "PHYS-021", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Optical Phenomena", topicCode: "PHYS-8", type: "basic", front: "What is the photoelectric effect?", back: "The emission of electrons from a metal surface when light of sufficient frequency (above the threshold frequency) shines on it." },
  { id: "PHYS-022", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Optical Phenomena", topicCode: "PHYS-8", type: "basic", front: "State the photoelectric equation.", back: "E = W₀ + Eₖ(max)\n\nhf = hf₀ + ½mv²(max)\n\nwhere W₀ = work function, f₀ = threshold frequency" },
  { id: "PHYS-023", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Optical Phenomena", topicCode: "PHYS-8", type: "cloze", front: "The energy of a photon is given by E = {{___}} where h is {{___}} constant.", back: "hf ; Planck's" },

  // Electrochemistry
  { id: "PHYS-024", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Electrochemistry", topicCode: "PHYS-9", type: "basic", front: "What happens at the anode in an electrochemical cell?", back: "Oxidation occurs at the anode.\n\nMnemonic: AN OX (anode = oxidation)" },
  { id: "PHYS-025", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Electrochemistry", topicCode: "PHYS-9", type: "basic", front: "What is the difference between a galvanic cell and an electrolytic cell?", back: "Galvanic cell: chemical energy → electrical energy (spontaneous reaction)\n\nElectrolytic cell: electrical energy → chemical energy (non-spontaneous, needs external power)" },
  { id: "PHYS-026", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Electrochemistry", topicCode: "PHYS-9", type: "cloze", front: "The EMF of a galvanic cell: E°cell = E°({{___}}) − E°({{___}})", back: "cathode ; anode" },

  // Chemical Industry
  { id: "PHYS-027", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Chemical Industry", topicCode: "PHYS-10", type: "basic", front: "What are the raw materials for the Haber process?", back: "Nitrogen (N₂) from fractional distillation of air\nHydrogen (H₂) from methane (natural gas)\n\nN₂ + 3H₂ ⇌ 2NH₃" },
  { id: "PHYS-028", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Chemical Industry", topicCode: "PHYS-10", type: "basic", front: "What conditions are used in the Haber process and why?", back: "Temperature: ~450°C (compromise between rate and yield)\nPressure: ~200 atm (high pressure favours forward reaction)\nCatalyst: Iron (Fe) catalyst (increases rate without affecting equilibrium)" },
  { id: "PHYS-029", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Chemical Industry", topicCode: "PHYS-10", type: "basic", front: "In the Contact process, what is produced?", back: "Sulfuric acid (H₂SO₄)\n\nKey steps:\n1. S + O₂ → SO₂\n2. 2SO₂ + O₂ → 2SO₃ (V₂O₅ catalyst)\n3. SO₃ + H₂SO₄ → H₂S₂O₇ (oleum)\n4. H₂S₂O₇ + H₂O → 2H₂SO₄" },
  { id: "PHYS-030", subject: "Physical Sciences", subjectCode: "PHYS", topic: "Chemical Industry", topicCode: "PHYS-10", type: "basic", front: "What is the chlor-alkali process and what does it produce?", back: "Electrolysis of concentrated sodium chloride (brine) solution.\n\nProducts:\n- Chlorine gas (Cl₂) at the anode\n- Hydrogen gas (H₂) at the cathode\n- Sodium hydroxide (NaOH) in solution" },

  // =============================================
  // LIFE SCIENCES — 20 cards
  // =============================================

  // DNA, RNA and Protein Synthesis
  { id: "LIFE-001", subject: "Life Sciences", subjectCode: "LIFE", topic: "DNA, RNA and Protein Synthesis", topicCode: "LIFE-1", type: "basic", front: "What are the structural differences between DNA and RNA?", back: "DNA: double-stranded, deoxyribose sugar, bases A-T-C-G\nRNA: single-stranded, ribose sugar, bases A-U-C-G\n\nDNA uses thymine (T); RNA uses uracil (U)" },
  { id: "LIFE-002", subject: "Life Sciences", subjectCode: "LIFE", topic: "DNA, RNA and Protein Synthesis", topicCode: "LIFE-1", type: "basic", front: "Describe the process of transcription.", back: "1. DNA double helix unwinds and unzips\n2. RNA polymerase reads the template strand (3' to 5')\n3. Free RNA nucleotides pair with DNA bases (A-U, T-A, C-G, G-C)\n4. mRNA strand is formed (5' to 3')\n5. mRNA detaches and moves to ribosome" },
  { id: "LIFE-003", subject: "Life Sciences", subjectCode: "LIFE", topic: "DNA, RNA and Protein Synthesis", topicCode: "LIFE-1", type: "cloze", front: "During translation, {{___}} carries amino acids to the ribosome, where {{___}} is read in sets of three bases called {{___}}.", back: "tRNA ; mRNA ; codons" },

  // Meiosis
  { id: "LIFE-004", subject: "Life Sciences", subjectCode: "LIFE", topic: "Meiosis", topicCode: "LIFE-2", type: "basic", front: "How does meiosis differ from mitosis?", back: "Meiosis: 2 divisions, produces 4 haploid cells, crossing over occurs, for gamete production\nMitosis: 1 division, produces 2 diploid cells, no crossing over, for growth and repair" },
  { id: "LIFE-005", subject: "Life Sciences", subjectCode: "LIFE", topic: "Meiosis", topicCode: "LIFE-2", type: "cloze", front: "Crossing over occurs during {{___}} of meiosis I, where {{___}} exchange genetic material.", back: "prophase I ; homologous chromosomes (non-sister chromatids)" },

  // Genetics and Inheritance
  { id: "LIFE-006", subject: "Life Sciences", subjectCode: "LIFE", topic: "Genetics and Inheritance", topicCode: "LIFE-3", type: "basic", front: "What is the difference between genotype and phenotype?", back: "Genotype: the genetic makeup (allele combination) e.g. Bb\nPhenotype: the physical expression of the genotype e.g. brown eyes" },
  { id: "LIFE-007", subject: "Life Sciences", subjectCode: "LIFE", topic: "Genetics and Inheritance", topicCode: "LIFE-3", type: "basic", front: "Explain dihybrid crosses.", back: "A cross involving two characteristics simultaneously.\nUse a 4×4 Punnett square.\nExpected phenotype ratio for heterozygous parents: 9:3:3:1" },

  // Evolution
  { id: "LIFE-008", subject: "Life Sciences", subjectCode: "LIFE", topic: "Evolution", topicCode: "LIFE-4", type: "basic", front: "What is natural selection?", back: "The process where organisms with favourable variations/traits are more likely to survive and reproduce in a given environment.\n\nKey steps: Variation → Competition → Survival of the fittest → Reproduction → Inheritance" },
  { id: "LIFE-009", subject: "Life Sciences", subjectCode: "LIFE", topic: "Evolution", topicCode: "LIFE-4", type: "basic", front: "Distinguish between homologous and analogous structures.", back: "Homologous: same basic structure, different function (e.g. human arm, whale flipper) — evidence of common ancestry\nAnalogous: different structure, same function (e.g. bird wing, insect wing) — convergent evolution" },
  { id: "LIFE-010", subject: "Life Sciences", subjectCode: "LIFE", topic: "Evolution", topicCode: "LIFE-4", type: "cloze", front: "Speciation occurs when populations are {{___}} (geographic isolation) leading to {{___}} isolation and eventually the inability to interbreed.", back: "separated by a physical barrier ; reproductive" },

  // Human Nervous System
  { id: "LIFE-011", subject: "Life Sciences", subjectCode: "LIFE", topic: "Human Nervous System", topicCode: "LIFE-5", type: "basic", front: "Describe the structure of a neuron.", back: "Cell body (soma): contains nucleus\nDendrites: receive impulses\nAxon: transmits impulses away from cell body\nMyelin sheath: insulates axon, speeds up transmission\nSynaptic knob: releases neurotransmitters at synapse" },
  { id: "LIFE-012", subject: "Life Sciences", subjectCode: "LIFE", topic: "Human Nervous System", topicCode: "LIFE-5", type: "basic", front: "What is a reflex arc?", back: "The neural pathway of a reflex action:\nReceptor → Sensory neuron → Interneuron (in spinal cord) → Motor neuron → Effector (muscle/gland)\n\nReflex actions are involuntary and fast." },

  // Human Endocrine System
  { id: "LIFE-013", subject: "Life Sciences", subjectCode: "LIFE", topic: "Human Endocrine System", topicCode: "LIFE-6", type: "basic", front: "How does the endocrine system differ from the nervous system?", back: "Endocrine: uses hormones, travels via blood, slow but long-lasting response\nNervous: uses electrical impulses, travels via neurons, fast but short-lived response" },
  { id: "LIFE-014", subject: "Life Sciences", subjectCode: "LIFE", topic: "Human Endocrine System", topicCode: "LIFE-6", type: "basic", front: "Explain negative feedback using blood glucose regulation.", back: "High blood glucose → pancreas releases insulin → cells absorb glucose → blood glucose drops\nLow blood glucose → pancreas releases glucagon → liver converts glycogen to glucose → blood glucose rises\n\nThis maintains homeostasis." },

  // Human Reproduction
  { id: "LIFE-015", subject: "Life Sciences", subjectCode: "LIFE", topic: "Human Reproduction", topicCode: "LIFE-7", type: "basic", front: "Describe the menstrual cycle phases.", back: "1. Menstrual phase (days 1-5): uterine lining sheds\n2. Follicular phase (days 1-13): FSH stimulates follicle growth, oestrogen builds lining\n3. Ovulation (day 14): LH surge releases ovum\n4. Luteal phase (days 15-28): corpus luteum produces progesterone to maintain lining" },

  // Human Impact on Environment
  { id: "LIFE-016", subject: "Life Sciences", subjectCode: "LIFE", topic: "Human Impact on Environment", topicCode: "LIFE-8", type: "basic", front: "What is the greenhouse effect?", back: "Greenhouse gases (CO₂, CH₄, N₂O) trap heat in the atmosphere.\n\nEnhanced greenhouse effect: increased emissions from burning fossil fuels → global warming → climate change, rising sea levels, extreme weather" },
  { id: "LIFE-017", subject: "Life Sciences", subjectCode: "LIFE", topic: "Human Impact on Environment", topicCode: "LIFE-8", type: "basic", front: "What is eutrophication?", back: "Excess nutrients (fertilisers/sewage) enter water bodies → algal bloom → algae die → bacteria decompose algae → oxygen depleted → aquatic organisms die.\n\nAlso called nutrient enrichment." },

  // Respiration
  { id: "LIFE-018", subject: "Life Sciences", subjectCode: "LIFE", topic: "Respiration", topicCode: "LIFE-9", type: "basic", front: "Compare aerobic and anaerobic respiration.", back: "Aerobic: requires O₂, produces 36-38 ATP\nC₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy\n\nAnaerobic: no O₂ needed, produces 2 ATP\nIn animals: glucose → lactic acid\nIn plants/yeast: glucose → ethanol + CO₂" },

  // Photosynthesis
  { id: "LIFE-019", subject: "Life Sciences", subjectCode: "LIFE", topic: "Photosynthesis", topicCode: "LIFE-10", type: "basic", front: "What are the light and dark reactions of photosynthesis?", back: "Light reactions (thylakoid membranes):\n- Water split (photolysis), O₂ released\n- ATP and NADPH produced\n\nDark reactions / Calvin cycle (stroma):\n- CO₂ fixed using ATP and NADPH\n- Glucose produced" },
  { id: "LIFE-020", subject: "Life Sciences", subjectCode: "LIFE", topic: "Photosynthesis", topicCode: "LIFE-10", type: "cloze", front: "The overall equation for photosynthesis: 6CO₂ + {{___}} → {{___}} + 6O₂", back: "6H₂O ; C₆H₁₂O₆ (glucose)" },

  // =============================================
  // ACCOUNTING — 15 cards
  // =============================================

  // Financial Statements
  { id: "ACC-001", subject: "Accounting", subjectCode: "ACC", topic: "Financial Statements", topicCode: "ACC-1", type: "basic", front: "What are the components of the Statement of Comprehensive Income?", back: "Sales\n− Cost of Sales\n= Gross Profit\n+ Other Income\n− Operating Expenses\n= Operating Profit\n− Interest Expense\n= Net Profit before Tax\n− Income Tax\n= Net Profit after Tax" },
  { id: "ACC-002", subject: "Accounting", subjectCode: "ACC", topic: "Financial Statements", topicCode: "ACC-1", type: "basic", front: "What is the accounting equation?", back: "Assets = Owner's Equity + Liabilities\n\nOr: A = OE + L\n\nThis must always balance." },
  { id: "ACC-003", subject: "Accounting", subjectCode: "ACC", topic: "Financial Statements", topicCode: "ACC-1", type: "cloze", front: "Cost of Sales = Opening Stock + {{___}} − {{___}}", back: "Purchases (net) ; Closing Stock" },

  // Company Financial Statements
  { id: "ACC-004", subject: "Accounting", subjectCode: "ACC", topic: "Company Financial Statements", topicCode: "ACC-2", type: "basic", front: "What is included in the Equity section of the Balance Sheet of a company?", back: "Ordinary Share Capital\n+ Retained Income\n+ Shareholders' Equity (total)\n\nNote: Companies issue shares, not capital contributions." },
  { id: "ACC-005", subject: "Accounting", subjectCode: "ACC", topic: "Company Financial Statements", topicCode: "ACC-2", type: "basic", front: "What is the difference between authorised and issued share capital?", back: "Authorised share capital: maximum number of shares the company is allowed to issue (set in MOI)\nIssued share capital: shares actually sold to shareholders" },

  // Financial Ratios / Analysis
  { id: "ACC-006", subject: "Accounting", subjectCode: "ACC", topic: "Financial Ratios", topicCode: "ACC-3", type: "basic", front: "How do you calculate the current ratio?", back: "Current Ratio = Current Assets / Current Liabilities\n\nIdeal: 1.5:1 to 2:1\nMeasures short-term liquidity" },
  { id: "ACC-007", subject: "Accounting", subjectCode: "ACC", topic: "Financial Ratios", topicCode: "ACC-3", type: "basic", front: "How do you calculate the acid-test ratio?", back: "Acid-test Ratio = (Current Assets − Stock) / Current Liabilities\n\nIdeal: 1:1\nMore strict liquidity test (excludes stock)" },
  { id: "ACC-008", subject: "Accounting", subjectCode: "ACC", topic: "Financial Ratios", topicCode: "ACC-3", type: "basic", front: "How do you calculate the debt-equity ratio?", back: "Debt-Equity Ratio = Total Liabilities / Owner's Equity × 100\n\nShows how much debt is used relative to equity.\nLower is generally better." },
  { id: "ACC-009", subject: "Accounting", subjectCode: "ACC", topic: "Financial Ratios", topicCode: "ACC-3", type: "cloze", front: "Gross Profit % = (Gross Profit / {{___}}) × 100. Net Profit % = (Net Profit / {{___}}) × 100.", back: "Sales ; Sales" },

  // VAT
  { id: "ACC-010", subject: "Accounting", subjectCode: "ACC", topic: "VAT", topicCode: "ACC-4", type: "basic", front: "How is VAT calculated in South Africa?", back: "VAT rate: 15%\nVAT inclusive amount = Price × 1.15\nVAT amount = Inclusive price × 15/115\nVAT payable = Output VAT − Input VAT" },

  // Manufacturing
  { id: "ACC-011", subject: "Accounting", subjectCode: "ACC", topic: "Manufacturing", topicCode: "ACC-5", type: "basic", front: "What are the three elements of production cost?", back: "1. Direct Materials (raw materials used)\n2. Direct Labour (wages of production workers)\n3. Factory Overhead Costs (rent, electricity, depreciation of factory equipment)\n\nTotal Production Cost = DM + DL + FOC" },
  { id: "ACC-012", subject: "Accounting", subjectCode: "ACC", topic: "Manufacturing", topicCode: "ACC-5", type: "cloze", front: "Cost of Production = Opening WIP + {{___}} − {{___}}", back: "Total Manufacturing Cost ; Closing WIP (Work in Progress)" },

  // Budgets
  { id: "ACC-013", subject: "Accounting", subjectCode: "ACC", topic: "Budgets", topicCode: "ACC-6", type: "basic", front: "What is a cash budget used for?", back: "To plan and control cash inflows and outflows over a period.\n\nFormat: Opening balance + Total receipts − Total payments = Closing balance\n\nHelps identify potential cash shortages/surpluses." },

  // Ethics and Internal Control
  { id: "ACC-014", subject: "Accounting", subjectCode: "ACC", topic: "Ethics and Internal Control", topicCode: "ACC-7", type: "basic", front: "Name five internal control measures for a business.", back: "1. Segregation/separation of duties\n2. Authorisation of transactions\n3. Physical controls (safes, locks)\n4. Independent checks/audits\n5. Proper documentation and record keeping" },
  { id: "ACC-015", subject: "Accounting", subjectCode: "ACC", topic: "Ethics and Internal Control", topicCode: "ACC-7", type: "basic", front: "What are the GAAP principles relevant to Grade 12?", back: "1. Historical Cost (record at original cost)\n2. Prudence/Conservatism (don't overstate assets/income)\n3. Materiality (report significant items)\n4. Going Concern (assume business continues operating)\n5. Business Entity (separate business and owner finances)" },

  // =============================================
  // BUSINESS STUDIES — 15 cards
  // =============================================

  // Business Environments
  { id: "BUS-001", subject: "Business Studies", subjectCode: "BUS", topic: "Business Environments", topicCode: "BUS-1", type: "basic", front: "Name and explain the three business environments.", back: "1. Micro (internal): factors within the business (management, employees, business culture)\n2. Market (task): factors directly interacting with business (suppliers, customers, competitors)\n3. Macro (external): broader factors beyond control (PESTLEG — Political, Economic, Social, Technological, Legal, Environmental, Global)" },
  { id: "BUS-002", subject: "Business Studies", subjectCode: "BUS", topic: "Business Environments", topicCode: "BUS-1", type: "cloze", front: "SWOT analysis: S = {{___}}, W = {{___}}, O = {{___}}, T = {{___}}", back: "Strengths ; Weaknesses ; Opportunities ; Threats" },

  // Business Ventures
  { id: "BUS-003", subject: "Business Studies", subjectCode: "BUS", topic: "Business Ventures", topicCode: "BUS-2", type: "basic", front: "Compare the forms of ownership: sole trader, partnership, and company.", back: "Sole trader: 1 owner, unlimited liability, easy to start\nPartnership: 2-20 partners, shared liability, partnership agreement\nCompany (Pty Ltd): separate legal entity, limited liability, more regulations, shareholders" },

  // Business Roles
  { id: "BUS-004", subject: "Business Studies", subjectCode: "BUS", topic: "Business Roles", topicCode: "BUS-3", type: "basic", front: "What are the eight business functions?", back: "1. General Management\n2. Administration\n3. Human Resources\n4. Marketing\n5. Production/Operations\n6. Purchasing\n7. Financial\n8. Public Relations" },

  // Legislation
  { id: "BUS-005", subject: "Business Studies", subjectCode: "BUS", topic: "Legislation", topicCode: "BUS-4", type: "basic", front: "Name five important labour laws in South Africa.", back: "1. Basic Conditions of Employment Act (BCEA)\n2. Labour Relations Act (LRA)\n3. Employment Equity Act (EEA)\n4. Skills Development Act (SDA)\n5. Compensation for Occupational Injuries and Diseases Act (COIDA)" },
  { id: "BUS-006", subject: "Business Studies", subjectCode: "BUS", topic: "Legislation", topicCode: "BUS-4", type: "basic", front: "What does the Consumer Protection Act (CPA) protect?", back: "Consumer rights including:\n- Right to fair and honest marketing\n- Right to fair value and quality goods\n- Right to return defective goods\n- Right to disclosure and information\n- Right to choose" },

  // Human Resources
  { id: "BUS-007", subject: "Business Studies", subjectCode: "BUS", topic: "Human Resources", topicCode: "BUS-5", type: "basic", front: "Explain the recruitment and selection process.", back: "1. Identify vacancy\n2. Job analysis → job description and job specification\n3. Advertise the position\n4. Screen applications (shortlist)\n5. Interviews\n6. Selection and appointment\n7. Placement and induction/orientation" },
  { id: "BUS-008", subject: "Business Studies", subjectCode: "BUS", topic: "Human Resources", topicCode: "BUS-5", type: "basic", front: "What is the difference between a strike and a lockout?", back: "Strike: employees refuse to work to force employer to meet demands\nLockout: employer prevents employees from entering the workplace to force them to accept conditions\n\nBoth must follow legal procedures (protected action)." },

  // Marketing
  { id: "BUS-009", subject: "Business Studies", subjectCode: "BUS", topic: "Marketing", topicCode: "BUS-6", type: "basic", front: "What are the 4 Ps of the marketing mix?", back: "Product: what is sold (features, quality, branding)\nPrice: pricing strategies (cost-plus, penetration, skimming)\nPlace: distribution channels\nPromotion: advertising, personal selling, sales promotion, publicity" },

  // Management and Leadership
  { id: "BUS-010", subject: "Business Studies", subjectCode: "BUS", topic: "Management and Leadership", topicCode: "BUS-7", type: "basic", front: "Name the four management tasks.", back: "1. Planning: setting goals and strategies\n2. Organising: allocating resources and assigning tasks\n3. Leading: motivating and directing employees\n4. Controlling: monitoring performance and taking corrective action" },
  { id: "BUS-011", subject: "Business Studies", subjectCode: "BUS", topic: "Management and Leadership", topicCode: "BUS-7", type: "basic", front: "Distinguish between autocratic, democratic, and laissez-faire leadership styles.", back: "Autocratic: leader makes all decisions, strict control\nDemocratic: leader involves employees in decision-making\nLaissez-faire: leader gives employees freedom to make decisions\n\nBest style depends on the situation (situational leadership)." },

  // Corporate Social Responsibility
  { id: "BUS-012", subject: "Business Studies", subjectCode: "BUS", topic: "Corporate Social Responsibility", topicCode: "BUS-8", type: "basic", front: "What is Corporate Social Responsibility (CSR)?", back: "The responsibility of a business to act ethically and contribute to economic development while improving quality of life of employees, the community, and society.\n\nIncludes: environmental sustainability, community upliftment, ethical business practices, fair labour practices." },

  // Quality
  { id: "BUS-013", subject: "Business Studies", subjectCode: "BUS", topic: "Quality", topicCode: "BUS-9", type: "basic", front: "What is Total Quality Management (TQM)?", back: "A management approach focused on continuous improvement of quality in all business processes.\n\nPrinciples:\n- Customer focus\n- Continuous improvement (kaizen)\n- Employee involvement\n- Fact-based decision making\n- Zero defects goal" },

  // Presentations
  { id: "BUS-014", subject: "Business Studies", subjectCode: "BUS", topic: "Presentations", topicCode: "BUS-10", type: "basic", front: "What are the key factors for an effective business presentation?", back: "1. Clear structure (introduction, body, conclusion)\n2. Know your audience\n3. Use visual aids effectively\n4. Make eye contact and use body language\n5. Speak clearly and at appropriate pace\n6. Handle questions professionally\n7. Prepare and rehearse" },

  // Insurance
  { id: "BUS-015", subject: "Business Studies", subjectCode: "BUS", topic: "Insurance", topicCode: "BUS-11", type: "basic", front: "What types of insurance should a business have?", back: "1. Short-term: fire, theft, vehicle, public liability\n2. Long-term: life insurance, disability\n3. UIF (Unemployment Insurance Fund) — compulsory\n4. COIDA (occupational injuries) — compulsory\n\nPurpose: transfer risk to insurer in exchange for premiums." },

  // =============================================
  // ECONOMICS — 15 cards
  // =============================================

  // Circular Flow
  { id: "ECO-001", subject: "Economics", subjectCode: "ECO", topic: "Circular Flow", topicCode: "ECO-1", type: "basic", front: "Describe the circular flow model with four sectors.", back: "Households: provide factors of production, receive income\nFirms: produce goods/services, pay for factors\nGovernment: taxes, provides public goods/services\nForeign sector: imports and exports\n\nReal flow (goods/services) and money flow (payments) move in opposite directions." },

  // Business Cycles
  { id: "ECO-002", subject: "Economics", subjectCode: "ECO", topic: "Business Cycles", topicCode: "ECO-2", type: "basic", front: "Name the four phases of the business cycle.", back: "1. Upswing/Recovery: GDP increases, employment rises\n2. Boom/Peak: maximum economic activity\n3. Downswing/Recession: GDP declines, unemployment rises\n4. Trough/Depression: minimum economic activity\n\nThen the cycle repeats." },
  { id: "ECO-003", subject: "Economics", subjectCode: "ECO", topic: "Business Cycles", topicCode: "ECO-2", type: "cloze", front: "GDP stands for {{___}} and measures the total value of all {{___}} produced within a country in a {{___}}.", back: "Gross Domestic Product ; final goods and services ; year" },

  // Markets
  { id: "ECO-004", subject: "Economics", subjectCode: "ECO", topic: "Perfect and Imperfect Markets", topicCode: "ECO-3", type: "basic", front: "Compare perfect competition and monopoly.", back: "Perfect competition: many sellers, identical products, free entry/exit, price takers\nMonopoly: one seller, unique product, high barriers to entry, price maker\n\nPerfect competition → most efficient\nMonopoly → least efficient" },
  { id: "ECO-005", subject: "Economics", subjectCode: "ECO", topic: "Perfect and Imperfect Markets", topicCode: "ECO-3", type: "basic", front: "What is an oligopoly?", back: "A market structure with a few large firms dominating the market.\n\nCharacteristics: interdependent pricing, high barriers to entry, differentiated or identical products.\nExamples in SA: cell phone networks (Vodacom, MTN, Cell C), banks." },

  // Public Sector
  { id: "ECO-006", subject: "Economics", subjectCode: "ECO", topic: "Public Sector", topicCode: "ECO-4", type: "basic", front: "What are the main sources of government revenue?", back: "1. Personal income tax (largest source)\n2. Company tax / Corporate income tax\n3. VAT (Value Added Tax)\n4. Customs and excise duties\n5. Capital gains tax\n6. Fuel levy" },
  { id: "ECO-007", subject: "Economics", subjectCode: "ECO", topic: "Public Sector", topicCode: "ECO-4", type: "cloze", front: "A budget deficit occurs when government {{___}} exceeds government {{___}}.", back: "expenditure ; revenue/income" },

  // Inflation
  { id: "ECO-008", subject: "Economics", subjectCode: "ECO", topic: "Inflation", topicCode: "ECO-5", type: "basic", front: "What is inflation and what causes it?", back: "Inflation: sustained increase in the general price level.\n\nCauses:\n- Demand-pull: too much money chasing too few goods\n- Cost-push: rising production costs (wages, raw materials, fuel)\n- Administered prices (e.g. electricity)\n\nSA target range: 3% - 6%" },
  { id: "ECO-009", subject: "Economics", subjectCode: "ECO", topic: "Inflation", topicCode: "ECO-5", type: "basic", front: "How does the SARB (South African Reserve Bank) control inflation?", back: "Through monetary policy, mainly the repo rate.\n\nInflation too high → increase repo rate → borrowing costs rise → spending decreases → inflation falls\nInflation too low → decrease repo rate → borrowing cheaper → spending increases → inflation rises" },

  // International Trade
  { id: "ECO-010", subject: "Economics", subjectCode: "ECO", topic: "International Trade", topicCode: "ECO-6", type: "basic", front: "What is the balance of payments?", back: "A record of all economic transactions between residents of a country and the rest of the world.\n\nTwo main accounts:\n1. Current account (trade in goods/services, income, transfers)\n2. Financial account (investment flows)" },
  { id: "ECO-011", subject: "Economics", subjectCode: "ECO", topic: "International Trade", topicCode: "ECO-6", type: "basic", front: "What are trade protection measures?", back: "Tariffs: taxes on imports\nQuotas: limits on quantity of imports\nSubsidies: government financial support to local producers\nEmbargoes: complete ban on trade\n\nPurpose: protect local industries and jobs" },

  // Demand and Supply
  { id: "ECO-012", subject: "Economics", subjectCode: "ECO", topic: "Demand and Supply", topicCode: "ECO-7", type: "basic", front: "State the law of demand and the law of supply.", back: "Law of demand: As price increases, quantity demanded decreases (ceteris paribus)\nLaw of supply: As price increases, quantity supplied increases (ceteris paribus)\n\nEquilibrium: where demand = supply" },
  { id: "ECO-013", subject: "Economics", subjectCode: "ECO", topic: "Demand and Supply", topicCode: "ECO-7", type: "cloze", front: "Price elasticity of demand measures how {{___}} quantity demanded is to a change in {{___}}.", back: "responsive/sensitive ; price" },

  // Economic Growth
  { id: "ECO-014", subject: "Economics", subjectCode: "ECO", topic: "Economic Growth and Development", topicCode: "ECO-8", type: "basic", front: "What is the difference between economic growth and economic development?", back: "Economic growth: increase in real GDP (quantitative measure)\nEconomic development: improvement in quality of life including education, health, equality (qualitative measure)\n\nGrowth does not always lead to development." },

  // Unemployment
  { id: "ECO-015", subject: "Economics", subjectCode: "ECO", topic: "Unemployment", topicCode: "ECO-9", type: "basic", front: "Name and explain three types of unemployment.", back: "1. Structural: mismatch between workers' skills and job requirements\n2. Cyclical: caused by downswing in business cycle\n3. Frictional: temporary unemployment while changing jobs\n4. Seasonal: certain jobs only available in specific seasons\n\nSA mainly faces structural unemployment." },

  // =============================================
  // HISTORY — 15 cards
  // =============================================

  // Cold War
  { id: "HIS-001", subject: "History", subjectCode: "HIS", topic: "The Cold War", topicCode: "HIS-1", type: "basic", front: "What was the Cold War?", back: "An ideological, political, and economic conflict (1947-1991) between:\n- USA and Western allies (capitalism, democracy)\n- USSR and Eastern bloc (communism, one-party state)\n\nCalled 'cold' because the two superpowers never fought each other directly." },
  { id: "HIS-002", subject: "History", subjectCode: "HIS", topic: "The Cold War", topicCode: "HIS-1", type: "basic", front: "What was the significance of the Cuban Missile Crisis (1962)?", back: "USSR placed nuclear missiles in Cuba (90 miles from USA).\nKennedy demanded removal and imposed a naval blockade.\nAfter 13 days, Khrushchev agreed to remove missiles.\n\nSignificance: closest the world came to nuclear war. Led to the Nuclear Test Ban Treaty (1963) and a hotline between Washington and Moscow." },
  { id: "HIS-003", subject: "History", subjectCode: "HIS", topic: "The Cold War", topicCode: "HIS-1", type: "cloze", front: "The policy of {{___}} aimed to prevent the spread of communism, while {{___}} meant easing of tensions between the superpowers.", back: "containment ; détente" },

  // Civil Rights Movement
  { id: "HIS-004", subject: "History", subjectCode: "HIS", topic: "Civil Rights Movement (USA)", topicCode: "HIS-2", type: "basic", front: "What was the significance of Brown v. Board of Education (1954)?", back: "The US Supreme Court ruled that racial segregation in public schools was unconstitutional.\n\nOverturned the 'separate but equal' doctrine of Plessy v. Ferguson (1896).\nMajor legal victory for the Civil Rights Movement." },
  { id: "HIS-005", subject: "History", subjectCode: "HIS", topic: "Civil Rights Movement (USA)", topicCode: "HIS-2", type: "basic", front: "Compare the approaches of Martin Luther King Jr. and Malcolm X.", back: "MLK: non-violent resistance, integration, civil disobedience, 'I Have a Dream'\nMalcolm X: Black nationalism, self-defence, black pride, initially separatist (later softened after Hajj)\n\nBoth fought for Black rights but used different methods." },

  // Apartheid South Africa
  { id: "HIS-006", subject: "History", subjectCode: "HIS", topic: "Apartheid South Africa", topicCode: "HIS-3", type: "basic", front: "Name five key apartheid laws.", back: "1. Population Registration Act (1950) — racial classification\n2. Group Areas Act (1950) — separate residential areas\n3. Bantu Education Act (1953) — inferior education for Black people\n4. Pass Laws — restricted movement of Black people\n5. Separate Amenities Act (1953) — segregated public facilities" },
  { id: "HIS-007", subject: "History", subjectCode: "HIS", topic: "Apartheid South Africa", topicCode: "HIS-3", type: "basic", front: "What happened during the Soweto Uprising of 1976?", back: "On 16 June 1976, students in Soweto protested against Afrikaans as a medium of instruction.\nPolice opened fire on unarmed students. Hector Pieterson (13) was among the first killed.\n\nSignificance: international condemnation, increased sanctions, radicalised youth, 16 June = Youth Day." },

  // Independence Movements in Africa
  { id: "HIS-008", subject: "History", subjectCode: "HIS", topic: "Africa and Independence", topicCode: "HIS-4", type: "basic", front: "What was the role of the OAU/AU in African independence?", back: "Organisation of African Unity (OAU) founded 1963:\n- Promoted unity among African states\n- Supported liberation movements\n- Opposed colonialism and apartheid\n\nReplaced by African Union (AU) in 2002 with broader goals including peace, security, and development." },

  // Transition to Democracy in SA
  { id: "HIS-009", subject: "History", subjectCode: "HIS", topic: "Transition to Democracy", topicCode: "HIS-5", type: "basic", front: "What were the key events leading to democracy in South Africa?", back: "1. Unbanning of ANC, PAC, SACP (2 Feb 1990)\n2. Release of Mandela (11 Feb 1990)\n3. CODESA negotiations (1991-1992)\n4. Multi-Party Negotiating Forum (1993)\n5. Interim Constitution adopted\n6. First democratic elections (27 April 1994)\n7. Mandela inaugurated as President (10 May 1994)" },

  // TRC
  { id: "HIS-010", subject: "History", subjectCode: "HIS", topic: "Truth and Reconciliation", topicCode: "HIS-6", type: "basic", front: "What was the Truth and Reconciliation Commission (TRC)?", back: "Established 1996, chaired by Archbishop Desmond Tutu.\nPurpose: investigate human rights violations during apartheid (1960-1994).\n\nThree committees:\n1. Human Rights Violations Committee\n2. Amnesty Committee (could grant amnesty for full disclosure)\n3. Reparation and Rehabilitation Committee" },

  // Genocide
  { id: "HIS-011", subject: "History", subjectCode: "HIS", topic: "Genocide", topicCode: "HIS-7", type: "basic", front: "What happened during the Rwandan Genocide (1994)?", back: "Hutu extremists killed approximately 800,000 Tutsis and moderate Hutus in about 100 days.\n\nCauses: ethnic tensions, colonial legacy, propaganda (Radio Mille Collines).\nUN and international community failed to intervene.\nEnded when RPF (Rwandan Patriotic Front) took control." },

  // Globalisation
  { id: "HIS-012", subject: "History", subjectCode: "HIS", topic: "Globalisation", topicCode: "HIS-8", type: "basic", front: "What is globalisation and what are its effects?", back: "The increasing interconnectedness of economies, societies, and cultures worldwide.\n\nPositive: trade growth, technology sharing, cultural exchange\nNegative: inequality between rich and poor nations, cultural homogenisation, exploitation of developing countries, environmental damage" },

  // Nuclear Age
  { id: "HIS-013", subject: "History", subjectCode: "HIS", topic: "The Nuclear Age", topicCode: "HIS-9", type: "basic", front: "What were the atomic bombings of Hiroshima and Nagasaki?", back: "USA dropped atomic bombs on:\n- Hiroshima: 6 August 1945 ('Little Boy')\n- Nagasaki: 9 August 1945 ('Fat Man')\n\nJapan surrendered, ending WWII.\nEstimated 200,000+ deaths. Led to nuclear arms race during Cold War." },

  // UNO
  { id: "HIS-014", subject: "History", subjectCode: "HIS", topic: "The United Nations", topicCode: "HIS-10", type: "basic", front: "What are the main organs of the United Nations?", back: "1. General Assembly (all member states, one vote each)\n2. Security Council (5 permanent members with veto power + 10 non-permanent)\n3. International Court of Justice (settles legal disputes)\n4. Secretariat (headed by Secretary-General)\n5. Economic and Social Council (ECOSOC)" },

  // Berlin Wall
  { id: "HIS-015", subject: "History", subjectCode: "HIS", topic: "End of the Cold War", topicCode: "HIS-11", type: "basic", front: "What was the significance of the fall of the Berlin Wall (1989)?", back: "Built in 1961 to prevent East Germans fleeing to West Berlin.\nFell on 9 November 1989 as communist regimes collapsed across Eastern Europe.\n\nSignificance: symbol of the end of the Cold War, German reunification (1990), collapse of Soviet influence in Europe." },

  // =============================================
  // GEOGRAPHY — 15 cards
  // =============================================

  // Climate and Weather
  { id: "GEO-001", subject: "Geography", subjectCode: "GEO", topic: "Climate and Weather", topicCode: "GEO-1", type: "basic", front: "What is the difference between weather and climate?", back: "Weather: short-term atmospheric conditions at a specific place and time\nClimate: average weather conditions of a place over a long period (30+ years)\n\nWeather changes daily; climate is a long-term pattern." },
  { id: "GEO-002", subject: "Geography", subjectCode: "GEO", topic: "Climate and Weather", topicCode: "GEO-1", type: "basic", front: "Explain how a mid-latitude cyclone forms.", back: "Forms along the polar front where warm tropical air meets cold polar air.\n1. Warm air rises over cold air along the front\n2. Low pressure develops\n3. Cold front moves faster than warm front\n4. Brings rain, strong winds, and cloud cover\n5. Occlusion occurs when cold front catches warm front" },
  { id: "GEO-003", subject: "Geography", subjectCode: "GEO", topic: "Climate and Weather", topicCode: "GEO-1", type: "cloze", front: "A tropical cyclone forms over warm ocean water (above {{___}}°C) between latitudes {{___}} and {{___}}.", back: "26 ; 5° ; 20° (north or south)" },

  // Geomorphology
  { id: "GEO-004", subject: "Geography", subjectCode: "GEO", topic: "Geomorphology", topicCode: "GEO-2", type: "basic", front: "Describe the formation of a waterfall.", back: "1. River flows over bands of hard and soft rock\n2. Soft rock erodes faster than hard rock (differential erosion)\n3. Undercutting occurs beneath hard rock\n4. Overhang of hard rock collapses\n5. Process repeats → waterfall retreats upstream\n6. A plunge pool forms at the base due to hydraulic action and abrasion" },
  { id: "GEO-005", subject: "Geography", subjectCode: "GEO", topic: "Geomorphology", topicCode: "GEO-2", type: "basic", front: "Explain how an ox-bow lake forms.", back: "1. River meanders (curves) become more pronounced\n2. Erosion on outside of bends (river cliffs), deposition on inside (slip-off slopes)\n3. Neck of meander narrows\n4. River breaks through the neck during flooding\n5. Old meander is cut off → forms ox-bow lake\n6. Lake eventually dries up leaving a meander scar" },

  // Population
  { id: "GEO-006", subject: "Geography", subjectCode: "GEO", topic: "Population", topicCode: "GEO-3", type: "basic", front: "Describe the Demographic Transition Model (DTM).", back: "Stage 1: High birth and death rates → low growth\nStage 2: High birth rate, falling death rate → rapid growth\nStage 3: Declining birth rate, low death rate → slowing growth\nStage 4: Low birth and death rates → stable/slow growth\nStage 5: Birth rate below death rate → population decline" },
  { id: "GEO-007", subject: "Geography", subjectCode: "GEO", topic: "Population", topicCode: "GEO-3", type: "cloze", front: "Push factors cause people to {{___}} an area, while pull factors {{___}} people to a new area.", back: "leave ; attract" },

  // Settlement Geography
  { id: "GEO-008", subject: "Geography", subjectCode: "GEO", topic: "Settlement Geography", topicCode: "GEO-4", type: "basic", front: "What is urbanisation and what problems does it cause?", back: "Urbanisation: movement of people from rural to urban areas.\n\nProblems: housing shortages (informal settlements), traffic congestion, pollution, strain on services (water, electricity), unemployment, crime, waste management challenges." },

  // Economic Geography
  { id: "GEO-009", subject: "Geography", subjectCode: "GEO", topic: "Economic Geography", topicCode: "GEO-5", type: "basic", front: "Distinguish between primary, secondary, and tertiary economic activities.", back: "Primary: extracting raw materials (mining, farming, fishing)\nSecondary: manufacturing and processing (factories)\nTertiary: providing services (banking, retail, tourism)\nQuaternary: knowledge-based (research, IT)" },
  { id: "GEO-010", subject: "Geography", subjectCode: "GEO", topic: "Economic Geography", topicCode: "GEO-5", type: "basic", front: "What are the factors affecting the location of industries?", back: "1. Raw materials (proximity reduces transport costs)\n2. Transport routes (roads, rail, ports)\n3. Labour supply (skilled/unskilled)\n4. Market (proximity to customers)\n5. Water and energy supply\n6. Government policy (incentives, IDZs)\n7. Flat land for building" },

  // GIS and Mapwork
  { id: "GEO-011", subject: "Geography", subjectCode: "GEO", topic: "GIS and Mapwork", topicCode: "GEO-6", type: "basic", front: "What is a Geographic Information System (GIS)?", back: "A computer-based system for capturing, storing, analysing, and displaying spatial (geographic) data.\n\nUses: urban planning, environmental management, disaster management, disease tracking.\nComponents: hardware, software, data, people, procedures." },
  { id: "GEO-012", subject: "Geography", subjectCode: "GEO", topic: "GIS and Mapwork", topicCode: "GEO-6", type: "basic", front: "How do you calculate gradient on a topographic map?", back: "Gradient = Vertical distance (height difference) / Horizontal distance\n\nExpressed as 1 : x\n\nExample: Height diff = 100m, Horizontal dist = 2000m\nGradient = 100/2000 = 1:20" },

  // Resources and Sustainability
  { id: "GEO-013", subject: "Geography", subjectCode: "GEO", topic: "Resources and Sustainability", topicCode: "GEO-7", type: "basic", front: "What is sustainable development?", back: "Development that meets the needs of the present without compromising the ability of future generations to meet their own needs.\n\n3 pillars: Economic growth, Social equity, Environmental protection" },

  // Drainage Systems
  { id: "GEO-014", subject: "Geography", subjectCode: "GEO", topic: "Drainage Systems", topicCode: "GEO-8", type: "basic", front: "Name and describe three drainage patterns.", back: "1. Dendritic: tree-like branching, forms on uniform rock (most common)\n2. Trellis/Rectangular: right-angle tributaries, forms on alternating hard/soft rock bands\n3. Radial: streams flow outward from a central high point (e.g. volcano)" },

  // South African Geography
  { id: "GEO-015", subject: "Geography", subjectCode: "GEO", topic: "South African Geography", topicCode: "GEO-9", type: "basic", front: "What are South Africa's main natural resources?", back: "Minerals: gold, platinum, diamonds, chrome, manganese, iron ore, coal\nAgricultural: maize, wheat, citrus, wine grapes, sugar cane\nMarine: fish (West Coast)\nWater: limited — SA is a water-scarce country\n\nMining is a major contributor to GDP and employment." },

  // =============================================
  // MATHEMATICAL LITERACY — 15 cards
  // =============================================

  // Finance
  { id: "MATL-001", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Finance", topicCode: "MATL-1", type: "basic", front: "How do you calculate simple interest?", back: "SI = P × r × t\n\nP = principal amount\nr = interest rate (as decimal)\nt = time in years\n\nTotal amount = P + SI" },
  { id: "MATL-002", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Finance", topicCode: "MATL-1", type: "basic", front: "What is the difference between cost price, selling price, and profit?", back: "Cost price: what you pay for an item\nSelling price: what you sell it for\nProfit = Selling price − Cost price\nLoss = Cost price − Selling price\n\nMark-up % = (Profit / Cost price) × 100" },
  { id: "MATL-003", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Finance", topicCode: "MATL-1", type: "cloze", front: "Hire purchase total = Cash price × (1 + {{___}} × number of years) + {{___}}", back: "interest rate ; deposit (if required)" },

  // Measurement
  { id: "MATL-004", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Measurement", topicCode: "MATL-2", type: "basic", front: "How do you convert between metric units of length?", back: "km → m: × 1000\nm → cm: × 100\ncm → mm: × 10\n\nReverse: divide by same factors\n\n1 km = 1000 m = 100 000 cm = 1 000 000 mm" },
  { id: "MATL-005", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Measurement", topicCode: "MATL-2", type: "basic", front: "How do you calculate the volume of a rectangular prism?", back: "Volume = length × width × height\n\nUnit: m³, cm³, mm³\n\n1 m³ = 1000 litres\n1 cm³ = 1 ml" },

  // Maps and Plans
  { id: "MATL-006", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Maps and Plans", topicCode: "MATL-3", type: "basic", front: "How do you use a number scale on a map?", back: "Scale 1 : 50 000 means 1 cm on the map = 50 000 cm (500 m) in real life.\n\nActual distance = Map distance × Scale factor\nMap distance = Actual distance ÷ Scale factor" },
  { id: "MATL-007", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Maps and Plans", topicCode: "MATL-3", type: "basic", front: "How do you read a floor plan?", back: "1. Check the scale\n2. Identify rooms using labels\n3. Identify doors (arc symbol) and windows (gap in wall)\n4. Use the scale to calculate actual measurements\n5. Calculate area of rooms: length × width" },

  // Data Handling
  { id: "MATL-008", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Data Handling", topicCode: "MATL-4", type: "basic", front: "How do you calculate the mean, median, and mode?", back: "Mean: sum of all values ÷ number of values\nMedian: middle value when arranged in order\nMode: most frequently occurring value\n\nFor even number of values, median = average of two middle values" },
  { id: "MATL-009", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Data Handling", topicCode: "MATL-4", type: "basic", front: "What are the advantages of different graph types?", back: "Bar graph: comparing categories\nHistogram: showing frequency distribution (continuous data)\nPie chart: showing parts of a whole\nLine graph: showing trends over time\nScatter plot: showing relationships between two variables" },

  // Probability
  { id: "MATL-010", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Probability", topicCode: "MATL-5", type: "basic", front: "How do you calculate probability?", back: "P(event) = Number of favourable outcomes / Total number of possible outcomes\n\nProbability ranges from 0 (impossible) to 1 (certain)\nCan be expressed as fraction, decimal, or percentage" },

  // Income and Expenditure
  { id: "MATL-011", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Income and Expenditure", topicCode: "MATL-6", type: "basic", front: "How do you read a payslip?", back: "Gross salary: total earnings before deductions\nDeductions: UIF, PAYE (tax), medical aid, pension\nNet salary (take-home pay) = Gross salary − Total deductions\n\nPAYE is calculated using SARS tax tables." },

  // Exchange Rates
  { id: "MATL-012", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Exchange Rates", topicCode: "MATL-7", type: "basic", front: "How do you convert currencies using exchange rates?", back: "If 1 USD = 18.50 ZAR:\n\nZAR to USD: divide by exchange rate\nR1000 ÷ 18.50 = $54.05\n\nUSD to ZAR: multiply by exchange rate\n$100 × 18.50 = R1850" },

  // Taxation
  { id: "MATL-013", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Taxation", topicCode: "MATL-8", type: "basic", front: "How does the South African income tax system work?", back: "Progressive tax system: higher income → higher tax rate.\n\nUse SARS tax tables/brackets.\nTax rebates reduce tax payable (primary, secondary, tertiary based on age).\nTax threshold: minimum income before you pay tax." },

  // Tariffs
  { id: "MATL-014", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Tariffs and Bills", topicCode: "MATL-9", type: "basic", front: "How do you calculate an electricity bill using a tariff table?", back: "1. Read meter to find kWh used\n2. Apply step tariff (different rates for usage blocks)\n3. Add basic/service charge\n4. Add VAT (15%)\n\nExample: 0-50 kWh free, 51-350 kWh @ R1.50, 351+ @ R2.00" },

  // Interest and Banking
  { id: "MATL-015", subject: "Mathematical Literacy", subjectCode: "MATL", topic: "Interest and Banking", topicCode: "MATL-10", type: "basic", front: "What are the different types of bank accounts?", back: "Savings account: earns interest, limited transactions\nCheque/Current account: for daily transactions, may charge fees\nFixed deposit: money locked for a period, higher interest rate\nCredit card: borrow money, pay interest on outstanding balance\n\nCompare: fees, interest rates, access" },

  // =============================================
  // ENGLISH FAL — 10 cards
  // =============================================

  // Language Structures
  { id: "ENGF-001", subject: "English First Additional Language", subjectCode: "ENGF", topic: "Language Structures", topicCode: "ENGF-1", type: "basic", front: "What are the eight parts of speech?", back: "1. Noun (name of person/place/thing)\n2. Pronoun (replaces noun: he, she, it)\n3. Verb (action/state: run, is)\n4. Adjective (describes noun: big, red)\n5. Adverb (describes verb: quickly, very)\n6. Preposition (position: in, on, under)\n7. Conjunction (joins: and, but, because)\n8. Interjection (emotion: wow, ouch)" },
  { id: "ENGF-002", subject: "English First Additional Language", subjectCode: "ENGF", topic: "Language Structures", topicCode: "ENGF-1", type: "basic", front: "How do you change a sentence from active to passive voice?", back: "Active: Subject + Verb + Object\nThe dog bit the man.\n\nPassive: Object + was/were + Past Participle + by + Subject\nThe man was bitten by the dog.\n\nPassive voice emphasises the action rather than the doer." },
  { id: "ENGF-003", subject: "English First Additional Language", subjectCode: "ENGF", topic: "Language Structures", topicCode: "ENGF-1", type: "cloze", front: "Direct speech uses {{___}} marks. When changing to indirect/reported speech, the tense shifts {{___}} (e.g. present → past).", back: "quotation/inverted ; back/backwards" },

  // Comprehension and Summary
  { id: "ENGF-004", subject: "English First Additional Language", subjectCode: "ENGF", topic: "Comprehension and Summary", topicCode: "ENGF-2", type: "basic", front: "What are the key steps for answering comprehension questions?", back: "1. Read the passage carefully (twice if possible)\n2. Read questions before re-reading passage\n3. Underline key words in questions\n4. Find evidence in the text\n5. Answer in full sentences (unless stated otherwise)\n6. Use your own words when asked to 'explain'\n7. For quote questions, use quotation marks" },

  // Visual Literacy
  { id: "ENGF-005", subject: "English First Additional Language", subjectCode: "ENGF", topic: "Visual Literacy", topicCode: "ENGF-3", type: "basic", front: "How do you analyse a cartoon or advertisement?", back: "Consider:\n1. Target audience\n2. Purpose/message\n3. Visual elements (images, colours, font sizes)\n4. Language techniques (puns, alliteration, rhetorical questions)\n5. Tone and mood\n6. Persuasive techniques (bandwagon, emotional appeal, celebrity endorsement)" },

  // Essay Writing
  { id: "ENGF-006", subject: "English First Additional Language", subjectCode: "ENGF", topic: "Essay Writing", topicCode: "ENGF-4", type: "basic", front: "What is the structure of a good essay?", back: "Introduction: hook, background, thesis statement\nBody paragraphs (3-4): topic sentence, evidence/examples, explanation, link to thesis\nConclusion: restate thesis, summarise main points, final thought\n\nPlan before writing. Proofread for SSPE (Spelling, Sentence structure, Punctuation, Expression)." },

  // Literature
  { id: "ENGF-007", subject: "English First Additional Language", subjectCode: "ENGF", topic: "Literature", topicCode: "ENGF-5", type: "basic", front: "Name and define five common literary devices.", back: "1. Simile: comparison using 'like' or 'as'\n2. Metaphor: direct comparison without 'like/as'\n3. Personification: giving human qualities to non-human things\n4. Alliteration: repetition of initial consonant sounds\n5. Irony: when the opposite of what is expected happens" },

  // Transactional Writing
  { id: "ENGF-008", subject: "English First Additional Language", subjectCode: "ENGF", topic: "Transactional Writing", topicCode: "ENGF-6", type: "basic", front: "What is the format of a formal letter?", back: "1. Your address (top right)\n2. Date\n3. Recipient's address (left)\n4. Dear Sir/Madam (salutation)\n5. Subject line (underlined/bold)\n6. Body paragraphs\n7. Yours faithfully (closing — use when you don't know the name)\n8. Signature and printed name" },

  // Poetry
  { id: "ENGF-009", subject: "English First Additional Language", subjectCode: "ENGF", topic: "Poetry", topicCode: "ENGF-7", type: "basic", front: "How do you analyse a poem for the exam?", back: "SMILE approach:\nS — Structure (stanzas, rhyme, metre)\nM — Meaning (what is the poem about?)\nI — Imagery (sensory language, figurative language)\nL — Language (diction, tone, mood)\nE — Effect (how does it make you feel? What is the message?)" },

  // Oral Communication
  { id: "ENGF-010", subject: "English First Additional Language", subjectCode: "ENGF", topic: "Oral Communication", topicCode: "ENGF-8", type: "basic", front: "What are the key elements of a prepared speech?", back: "1. Greeting and introduction (hook the audience)\n2. Clear structure with 3 main points\n3. Use rhetorical devices (questions, repetition, tricolon)\n4. Examples and evidence\n5. Strong conclusion with call to action\n6. Maintain eye contact, use gestures\n7. Stay within time limit (3-5 minutes)" },

  // =============================================
  // INFORMATION TECHNOLOGY — 10 cards
  // =============================================

  // Programming (Delphi/Java)
  { id: "IT-001", subject: "Information Technology", subjectCode: "IT", topic: "Programming", topicCode: "IT-1", type: "basic", front: "What are the three basic control structures in programming?", back: "1. Sequence: statements executed one after another\n2. Selection/Branching: if-then-else, case/switch\n3. Iteration/Loops: for, while, repeat-until\n\nAll algorithms can be built using these three structures." },
  { id: "IT-002", subject: "Information Technology", subjectCode: "IT", topic: "Programming", topicCode: "IT-1", type: "basic", front: "What is Object-Oriented Programming (OOP)?", back: "Programming paradigm based on objects containing data (attributes/fields) and behaviour (methods).\n\nKey concepts:\n- Encapsulation: bundling data and methods\n- Inheritance: child class inherits from parent\n- Polymorphism: same method behaves differently\n- Abstraction: hiding complexity" },
  { id: "IT-003", subject: "Information Technology", subjectCode: "IT", topic: "Programming", topicCode: "IT-1", type: "cloze", front: "An array is a {{___}} data structure that stores multiple values of the {{___}} data type, accessed using an {{___}}.", back: "fixed-size ; same ; index" },

  // Databases and SQL
  { id: "IT-004", subject: "Information Technology", subjectCode: "IT", topic: "Databases and SQL", topicCode: "IT-2", type: "basic", front: "What are the main SQL commands for Grade 12?", back: "SELECT ... FROM ... WHERE (retrieve data)\nORDER BY (sort results)\nGROUP BY with COUNT, SUM, AVG, MAX, MIN\nINSERT INTO ... VALUES (add records)\nUPDATE ... SET ... WHERE (modify records)\nDELETE FROM ... WHERE (remove records)\nJOIN (combine tables)" },
  { id: "IT-005", subject: "Information Technology", subjectCode: "IT", topic: "Databases and SQL", topicCode: "IT-2", type: "basic", front: "What is database normalisation?", back: "The process of organising data to reduce redundancy.\n\n1NF: no repeating groups, atomic values\n2NF: 1NF + no partial dependencies (every non-key field depends on the whole primary key)\n3NF: 2NF + no transitive dependencies (non-key fields don't depend on other non-key fields)" },

  // Networks
  { id: "IT-006", subject: "Information Technology", subjectCode: "IT", topic: "Networks", topicCode: "IT-3", type: "basic", front: "Compare LAN, WAN, and MAN.", back: "LAN (Local Area Network): small area (office, school), fast, low cost\nMAN (Metropolitan Area Network): city-wide\nWAN (Wide Area Network): large geographical area (internet), slower, higher cost\n\nTopologies: Star (most common), Bus, Ring, Mesh" },
  { id: "IT-007", subject: "Information Technology", subjectCode: "IT", topic: "Networks", topicCode: "IT-3", type: "basic", front: "What are the layers of the TCP/IP model?", back: "1. Application Layer (HTTP, FTP, SMTP, DNS)\n2. Transport Layer (TCP, UDP — port numbers)\n3. Internet Layer (IP — IP addresses, routing)\n4. Network Access Layer (Ethernet, Wi-Fi — MAC addresses)" },

  // Data and Information Management
  { id: "IT-008", subject: "Information Technology", subjectCode: "IT", topic: "Data and Information", topicCode: "IT-4", type: "basic", front: "What is the difference between data and information?", back: "Data: raw, unprocessed facts and figures (e.g. 36.7)\nInformation: processed, organised data with meaning and context (e.g. body temperature is 36.7°C — normal)\n\nData → Processing → Information → Knowledge → Wisdom" },

  // Hardware and Software
  { id: "IT-009", subject: "Information Technology", subjectCode: "IT", topic: "Hardware and Software", topicCode: "IT-5", type: "basic", front: "What are the components of a computer system?", back: "Hardware: CPU (ALU + CU), RAM, ROM, storage (HDD/SSD), I/O devices\nSoftware: System software (OS) and Application software\n\nCPU speed measured in GHz\nRAM measured in GB (volatile)\nStorage measured in TB/GB (non-volatile)" },

  // Social Implications and Ethics
  { id: "IT-010", subject: "Information Technology", subjectCode: "IT", topic: "Social Implications", topicCode: "IT-6", type: "basic", front: "What are the main cybersecurity threats?", back: "1. Phishing: fake emails/websites to steal data\n2. Malware: viruses, worms, trojans, ransomware\n3. Social engineering: manipulating people\n4. Identity theft: stealing personal information\n5. Hacking: unauthorized access\n\nProtection: firewalls, antivirus, strong passwords, 2FA, encryption" },

  // =============================================
  // CAT (Computer Applications Technology) — 10 cards
  // =============================================

  // Word Processing
  { id: "CAT-001", subject: "Computer Applications Technology", subjectCode: "CAT", topic: "Word Processing", topicCode: "CAT-1", type: "basic", front: "What are mail merge fields and how is mail merge used?", back: "Mail merge combines a main document with a data source to create personalised documents.\n\n1. Create main document with merge fields (<<Name>>, <<Address>>)\n2. Connect to data source (spreadsheet/database)\n3. Insert merge fields into document\n4. Merge to new document/printer\n\nUsed for: letters, labels, certificates" },

  // Spreadsheets
  { id: "CAT-002", subject: "Computer Applications Technology", subjectCode: "CAT", topic: "Spreadsheets", topicCode: "CAT-2", type: "basic", front: "What are the common spreadsheet functions for Grade 12?", back: "SUM, AVERAGE, COUNT, COUNTA, COUNTIF, SUMIF\nMIN, MAX, LARGE, SMALL\nIF, nested IF\nVLOOKUP (search column, return value)\nLEFT, RIGHT, MID, LEN, CONCATENATE\nROUND, INT\nTODAY, NOW, YEAR, MONTH" },
  { id: "CAT-003", subject: "Computer Applications Technology", subjectCode: "CAT", topic: "Spreadsheets", topicCode: "CAT-2", type: "cloze", front: "VLOOKUP syntax: =VLOOKUP({{___}}, {{___}}, {{___}}, {{___}})", back: "lookup_value ; table_array ; col_index_num ; range_lookup (TRUE/FALSE)" },

  // Database
  { id: "CAT-004", subject: "Computer Applications Technology", subjectCode: "CAT", topic: "Database", topicCode: "CAT-3", type: "basic", front: "What is the difference between a query and a report in Access?", back: "Query: extracts and filters data from tables using criteria (like asking a question)\nReport: formatted, printable summary of data (professional output)\n\nQueries can use calculated fields, criteria, sorting, and joins.\nReports can include grouping, totals, headers/footers." },

  // HTML and Web Design
  { id: "CAT-005", subject: "Computer Applications Technology", subjectCode: "CAT", topic: "HTML and Web Design", topicCode: "CAT-4", type: "basic", front: "What are the essential HTML tags for Grade 12?", back: "<html>, <head>, <title>, <body>\n<h1>-<h6> headings\n<p> paragraph, <br> line break\n<a href='url'> hyperlink\n<img src='file' alt='text'>\n<table>, <tr>, <td>, <th>\n<ul>/<ol>, <li> lists\n<form>, <input>, <select>" },
  { id: "CAT-006", subject: "Computer Applications Technology", subjectCode: "CAT", topic: "HTML and Web Design", topicCode: "CAT-4", type: "basic", front: "What is CSS and how is it used with HTML?", back: "CSS (Cascading Style Sheets) controls the appearance/styling of HTML elements.\n\nThree ways to add CSS:\n1. Inline: style='color:red' (in the tag)\n2. Internal: <style> in <head>\n3. External: linked .css file (best practice)\n\nSelector { property: value; }" },

  // Network Concepts for CAT
  { id: "CAT-007", subject: "Computer Applications Technology", subjectCode: "CAT", topic: "Networks and Internet", topicCode: "CAT-5", type: "basic", front: "What is cloud computing?", back: "Storing and accessing data and programs over the internet instead of on a local computer.\n\nExamples: Google Drive, Dropbox, OneDrive\n\nAdvantages: access anywhere, automatic backup, collaboration\nDisadvantages: needs internet, privacy concerns, ongoing costs" },

  // Solution Development
  { id: "CAT-008", subject: "Computer Applications Technology", subjectCode: "CAT", topic: "Solution Development", topicCode: "CAT-6", type: "basic", front: "What are the steps in the Systems Development Life Cycle (SDLC)?", back: "1. Preliminary investigation (identify problem)\n2. Analysis (gather requirements)\n3. Design (plan solution)\n4. Development/Implementation (build it)\n5. Testing (check it works)\n6. Maintenance (ongoing updates and fixes)\n\nAlternative: Agile methodology (iterative)" },

  // Information Management
  { id: "CAT-009", subject: "Computer Applications Technology", subjectCode: "CAT", topic: "Information Management", topicCode: "CAT-7", type: "basic", front: "What is the POPI Act and why is it important?", back: "Protection of Personal Information Act (POPIA):\n\nProtects personal information of SA citizens.\nBusinesses must:\n- Get consent before collecting data\n- Use data only for stated purpose\n- Keep data secure\n- Allow people to access/correct their data\n- Not keep data longer than necessary\n- Appoint an Information Officer" },

  // E-Communication
  { id: "CAT-010", subject: "Computer Applications Technology", subjectCode: "CAT", topic: "e-Communication", topicCode: "CAT-8", type: "basic", front: "Compare different electronic communication methods.", back: "Email: formal, attachments, asynchronous\nInstant messaging: real-time, informal\nVideo conferencing: face-to-face remotely (Zoom, Teams)\nVoIP: voice over internet (Skype)\nSocial media: broad reach, networking\nForums/Blogs: topic-based discussions\n\nConsider: audience, purpose, urgency, formality" },

  // =============================================
  // LIFE ORIENTATION — 10 cards
  // =============================================

  // Development of Self
  { id: "LO-001", subject: "Life Orientation", subjectCode: "LO", topic: "Development of Self", topicCode: "LO-1", type: "basic", front: "What are life skills needed for adapting to change?", back: "1. Decision-making: weigh options, consider consequences\n2. Problem-solving: identify problem, brainstorm solutions\n3. Critical thinking: evaluate information objectively\n4. Stress management: exercise, time management, support systems\n5. Adaptability: embrace change, be flexible\n6. Self-awareness: know your strengths, weaknesses, values" },

  // Citizenship and Social Justice
  { id: "LO-002", subject: "Life Orientation", subjectCode: "LO", topic: "Citizenship", topicCode: "LO-2", type: "basic", front: "What are the rights and responsibilities in the SA Constitution?", back: "Key rights (Bill of Rights): equality, dignity, freedom of expression, education, healthcare, housing\n\nResponsibilities: respect others' rights, obey the law, pay taxes, vote, protect the environment\n\nRights and responsibilities go hand in hand." },
  { id: "LO-003", subject: "Life Orientation", subjectCode: "LO", topic: "Citizenship", topicCode: "LO-2", type: "basic", front: "What is social justice?", back: "Fair and equitable distribution of resources, opportunities, and privileges in society.\n\nRelated concepts:\n- Redress: correcting past injustices (e.g. BEE, land reform)\n- Equity: fairness (not same as equality)\n- Ubuntu: 'I am because we are' — community values" },

  // Health and Wellness
  { id: "LO-004", subject: "Life Orientation", subjectCode: "LO", topic: "Health and Wellness", topicCode: "LO-3", type: "basic", front: "What are the effects of substance abuse?", back: "Physical: organ damage, addiction, weakened immune system\nPsychological: depression, anxiety, impaired judgement\nSocial: broken relationships, isolation, crime\nEconomic: job loss, financial problems\n\nSubstances: alcohol, tobacco, dagga, tik, nyaope, prescription drugs" },
  { id: "LO-005", subject: "Life Orientation", subjectCode: "LO", topic: "Health and Wellness", topicCode: "LO-3", type: "basic", front: "What are the dimensions of wellness?", back: "1. Physical: exercise, nutrition, sleep\n2. Emotional: managing feelings, self-esteem\n3. Social: healthy relationships, communication\n4. Intellectual: lifelong learning, creativity\n5. Spiritual: purpose, values, meaning\n6. Environmental: safe, clean surroundings" },

  // Careers and Career Choices
  { id: "LO-006", subject: "Life Orientation", subjectCode: "LO", topic: "Careers", topicCode: "LO-4", type: "basic", front: "What factors should you consider when choosing a career?", back: "1. Interests and passions\n2. Skills and abilities (aptitude)\n3. Personality type\n4. Values and lifestyle goals\n5. Subject choices and academic performance\n6. Job availability and market demand\n7. Study/training requirements and costs\n8. Salary and working conditions" },
  { id: "LO-007", subject: "Life Orientation", subjectCode: "LO", topic: "Careers", topicCode: "LO-4", type: "basic", front: "What are the requirements for applying to a South African university?", back: "1. NSC with Bachelor's pass (minimum 4 subjects at 50%+)\n2. Meet faculty-specific APS (Admission Point Score)\n3. Meet subject requirements (e.g. Maths for Engineering)\n4. Apply before closing date\n5. Provide certified documents\n\nAlternatives: TVET colleges, learnerships, online courses, gap year" },

  // Physical Education
  { id: "LO-008", subject: "Life Orientation", subjectCode: "LO", topic: "Physical Education", topicCode: "LO-5", type: "basic", front: "What are the components of physical fitness?", back: "Health-related:\n1. Cardiovascular endurance\n2. Muscular strength\n3. Muscular endurance\n4. Flexibility\n5. Body composition\n\nSkill-related:\n1. Speed\n2. Agility\n3. Balance\n4. Coordination\n5. Power\n6. Reaction time" },

  // Study Skills
  { id: "LO-009", subject: "Life Orientation", subjectCode: "LO", topic: "Study Skills", topicCode: "LO-6", type: "basic", front: "What are effective study techniques for NSC exams?", back: "1. Create a study timetable\n2. Use active recall (test yourself)\n3. Practice past papers (most effective!)\n4. Use spaced repetition\n5. Summarise and make mind maps\n6. Study in focused blocks (Pomodoro: 25 min study, 5 min break)\n7. Get enough sleep (8 hours)\n8. Exercise regularly" },

  // Democracy
  { id: "LO-010", subject: "Life Orientation", subjectCode: "LO", topic: "Democracy and Human Rights", topicCode: "LO-7", type: "basic", front: "How does the South African government work?", back: "Three branches:\n1. Legislature (Parliament): makes laws (National Assembly + NCOP)\n2. Executive (President + Cabinet): implements laws\n3. Judiciary (Courts): interprets laws\n\nSeparation of powers ensures checks and balances.\nConstitution is the supreme law." },

  // =============================================
  // TOURISM — 10 cards
  // =============================================

  // Tourism Sectors
  { id: "TOUR-001", subject: "Tourism", subjectCode: "TOUR", topic: "Tourism Sectors", topicCode: "TOUR-1", type: "basic", front: "What are the main sectors of the tourism industry?", back: "1. Accommodation (hotels, B&Bs, lodges)\n2. Transport (airlines, car rental, buses)\n3. Attractions (theme parks, heritage sites, nature reserves)\n4. Food and beverage (restaurants, catering)\n5. Travel organisers (tour operators, travel agents)\n6. Tourism services (guides, info centres)\n\nThese form the tourism value chain." },

  // Map and Tour Planning
  { id: "TOUR-002", subject: "Tourism", subjectCode: "TOUR", topic: "Map Reading and Tour Planning", topicCode: "TOUR-2", type: "basic", front: "How do you plan an itinerary?", back: "1. Identify destination and duration\n2. Research attractions and activities\n3. Calculate distances and travel times\n4. Arrange accommodation and transport\n5. Consider budget and costs\n6. Include rest time and meals\n7. Check visa/passport requirements\n8. Consider health and safety (vaccinations, travel insurance)" },

  // World Heritage Sites
  { id: "TOUR-003", subject: "Tourism", subjectCode: "TOUR", topic: "Heritage and Culture Tourism", topicCode: "TOUR-3", type: "basic", front: "Name five South African World Heritage Sites.", back: "1. Robben Island (cultural — anti-apartheid history)\n2. iSimangaliso Wetland Park (natural — biodiversity)\n3. Cradle of Humankind (cultural — fossil hominid sites)\n4. uKhahlamba-Drakensberg Park (mixed — San rock art, biodiversity)\n5. Cape Floral Region (natural — fynbos biodiversity)\n\nSA has 10 UNESCO World Heritage Sites." },

  // Sustainable Tourism
  { id: "TOUR-004", subject: "Tourism", subjectCode: "TOUR", topic: "Sustainable and Responsible Tourism", topicCode: "TOUR-4", type: "basic", front: "What is responsible tourism?", back: "Tourism that:\n- Minimises negative environmental impacts\n- Respects local cultures and traditions\n- Benefits local communities economically\n- Conserves natural and cultural heritage\n\nPractices: reduce waste, support local businesses, respect wildlife, use eco-friendly transport" },

  // Tourism and the Economy
  { id: "TOUR-005", subject: "Tourism", subjectCode: "TOUR", topic: "Tourism and Economy", topicCode: "TOUR-5", type: "basic", front: "How does tourism contribute to the South African economy?", back: "1. Job creation (direct and indirect employment)\n2. Foreign exchange earnings (tourists spend Rands)\n3. GDP contribution (~3-4% directly)\n4. Infrastructure development\n5. Small business development (SMMEs)\n6. Poverty alleviation in rural areas\n\nSA attracts ~10 million international tourists per year." },

  // Foreign Exchange
  { id: "TOUR-006", subject: "Tourism", subjectCode: "TOUR", topic: "Foreign Exchange", topicCode: "TOUR-6", type: "basic", front: "How do exchange rates affect tourism?", back: "Weak Rand (e.g. R18/$1):\n- SA is cheaper for foreign tourists → more visitors\n- SA tourists pay more to travel abroad\n\nStrong Rand (e.g. R12/$1):\n- SA is more expensive for foreigners → fewer visitors\n- SA tourists pay less abroad" },

  // Health and Safety
  { id: "TOUR-007", subject: "Tourism", subjectCode: "TOUR", topic: "Health and Safety", topicCode: "TOUR-7", type: "basic", front: "What health precautions should tourists take when visiting Africa?", back: "1. Vaccinations (yellow fever for some countries)\n2. Malaria prophylaxis (preventive medication)\n3. Travel insurance (medical and luggage)\n4. Safe drinking water (bottled water)\n5. Food safety (eat cooked food)\n6. Sun protection (sunscreen, hat)\n7. Check travel advisories" },

  // Marketing in Tourism
  { id: "TOUR-008", subject: "Tourism", subjectCode: "TOUR", topic: "Marketing in Tourism", topicCode: "TOUR-8", type: "basic", front: "What marketing strategies does South African Tourism use?", back: "1. Brand SA and SA Tourism campaigns\n2. Social media marketing\n3. Travel expos and trade shows (Indaba)\n4. Destination marketing (It's Possible campaign)\n5. Partnerships with airlines and hotels\n6. Targeting key markets (UK, Germany, USA, China, India)\n7. Niche marketing (adventure, eco, cultural tourism)" },

  // Time Zones
  { id: "TOUR-009", subject: "Tourism", subjectCode: "TOUR", topic: "Time Zones and Travel", topicCode: "TOUR-9", type: "basic", front: "How do you calculate time differences between countries?", back: "1. Find the UTC/GMT offset for each city\n2. Calculate the difference\n3. Add hours going east, subtract going west\n\nSA = UTC+2 (SAST)\nExample: SA time 14:00 → London (UTC+0) = 12:00\n→ New York (UTC-5) = 07:00\n→ Dubai (UTC+4) = 16:00" },

  // Types of Tourism
  { id: "TOUR-010", subject: "Tourism", subjectCode: "TOUR", topic: "Types of Tourism", topicCode: "TOUR-10", type: "basic", front: "What are the main types of tourism?", back: "1. Domestic: travelling within own country\n2. Regional: travelling to neighbouring countries\n3. International: travelling to distant countries\n\nCategories by purpose:\n- Leisure/Holiday\n- Business/MICE (Meetings, Incentives, Conferences, Events)\n- Adventure/Eco\n- Cultural/Heritage\n- Medical/Health" },
];

export function getSubjects(): { code: string; name: string }[] {
  const seen = new Set<string>();
  const result: { code: string; name: string }[] = [];
  for (const card of FLASHCARD_DECKS) {
    if (!seen.has(card.subjectCode)) {
      seen.add(card.subjectCode);
      result.push({ code: card.subjectCode, name: card.subject });
    }
  }
  return result;
}

export function getTopicsForSubject(subjectCode: string): { code: string; name: string }[] {
  const seen = new Set<string>();
  const result: { code: string; name: string }[] = [];
  for (const card of FLASHCARD_DECKS) {
    if (card.subjectCode === subjectCode && !seen.has(card.topicCode)) {
      seen.add(card.topicCode);
      result.push({ code: card.topicCode, name: card.topic });
    }
  }
  return result;
}

export function getCardsForFilters(subjectCode?: string, topicCode?: string): FlashcardDef[] {
  return FLASHCARD_DECKS.filter(c => {
    if (subjectCode && c.subjectCode !== subjectCode) return false;
    if (topicCode && c.topicCode !== topicCode) return false;
    return true;
  });
}
