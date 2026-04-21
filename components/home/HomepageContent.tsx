import Link from "next/link";

// Homepage SEO + trust content. Rendered below the calculator as server components
// for indexable text, internal-linking depth, and FAQ-rich results eligibility.
//
// Why this exists: the calculator alone renders only ~500 words of indexable HTML.
// Adding this block brings the homepage to ~1,400 words — the depth Google expects
// from a page competing with BankBazaar, ClearTax, and Paisabazaar for "EMI calculator".

export function HomepageContent() {
  return (
    <div className="bg-background border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <section aria-labelledby="why-section" className="mb-14">
          <h2
            id="why-section"
            className="text-2xl sm:text-3xl font-bold text-foreground mb-4"
          >
            Every EMI calculator in India wants your phone number. We don&apos;t.
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              Try calculating your EMI on BankBazaar, Paisabazaar, Bajaj Finserv, or
              any bank&apos;s own page. Before the numbers appear, you&apos;ll hit a wall:
              enter your phone, enter your email, enter your city. Within 24 hours,
              four different banks call you about &quot;special home loan rates.&quot; That
              happens because those calculators are lead-generation funnels — not
              tools. They&apos;re designed to sell you to the highest-bidding DSA.
            </p>
            <p>
              LastEMI has no phone number field. No email capture. No city selector.
              No affiliate links dressed up as recommendations. You type your loan
              amount, interest rate, and tenure. The calculator shows you the EMI,
              the total interest, the amortization schedule, and your exact
              debt-free date. That&apos;s it. Nothing is sold. Nothing is shared.
              You close the tab and nobody calls you.
            </p>
            <p>
              We believe Indian borrowers deserve honest math, delivered without
              conditions. A ₹50,00,000 home loan at 8.5% for 20 years costs
              ₹55,75,360 in interest alone — almost 112% of the principal. That
              number doesn&apos;t change based on which website shows it. You
              deserve to see it without handing over your contact details first.
            </p>
          </div>
        </section>

        <section aria-labelledby="how-section" className="mb-14">
          <h2
            id="how-section"
            className="text-2xl sm:text-3xl font-bold text-foreground mb-6"
          >
            How LastEMI works
          </h2>
          <ol className="space-y-5 list-decimal list-inside text-sm sm:text-base leading-relaxed">
            <li>
              <span className="font-semibold">Enter your loan details</span> — amount,
              interest rate, tenure, and start date. No sign-up required for the
              basic calculation. All computation happens in your browser.
            </li>
            <li>
              <span className="font-semibold">See your debt-free date</span> — the
              exact month and year your loan ends, plus a full year-by-year
              amortization table showing how principal and interest split across
              every EMI.
            </li>
            <li>
              <span className="font-semibold">Simulate a part payment</span> — add an
              extra payment of any amount at any point in the tenure. Watch the
              debt-free date shift forward and the interest saved update in real
              time. This is where the real value lives: most Indian borrowers have
              no idea that a single ₹2 lakh part payment in year 3 of a home loan
              can save them 16 months of EMIs.
            </li>
          </ol>
        </section>

        <section aria-labelledby="different-section" className="mb-14">
          <h2
            id="different-section"
            className="text-2xl sm:text-3xl font-bold text-foreground mb-6"
          >
            What makes LastEMI different
          </h2>
          <div className="grid sm:grid-cols-2 gap-5 text-sm sm:text-base leading-relaxed">
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                No phone number capture
              </h3>
              <p>
                Use the calculator, see the math, leave. No DSA follow-ups, no
                &quot;special offer&quot; calls.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                RBI rules stated accurately
              </h3>
              <p>
                We correctly cite that RBI&apos;s zero-prepayment-penalty rule applies
                only to floating-rate home loans, not personal or car loans. Most
                sites get this wrong.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Every loan type supported
              </h3>
              <p>
                Home loans, personal loans, car loans, gold loans, education loans,
                credit cards, and no-cost EMIs — all with the same honest math.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Multi-loan debt-free date
              </h3>
              <p>
                Most borrowers have 2 – 3 loans. Our free dashboard stacks them and
                shows the real debt-free date across everything you owe.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Indian number format
              </h3>
              <p>
                Lakhs and crores, not millions. Financial year grouping (April-March)
                for tax planning. Built by Indians who use it themselves.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Optional Pro, never required
              </h3>
              <p>
                ₹299/month unlocks consolidation analysis, email alerts, and PDF
                reports. The core calculator and dashboard are free forever.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="tools-section" className="mb-14">
          <h2
            id="tools-section"
            className="text-2xl sm:text-3xl font-bold text-foreground mb-6"
          >
            Specialist calculators for every debt question
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-5">
            The homepage calculator handles the core EMI math. For the decisions
            most Indian borrowers actually struggle with, we built dedicated tools:
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm sm:text-base">
            <li>
              <Link href="/calculators/sip-vs-prepayment" className="text-primary hover:underline">
                SIP vs Prepayment calculator
              </Link>{" "}
              — should you invest the extra or pay down the loan?
            </li>
            <li>
              <Link href="/calculators/home-loan-eligibility" className="text-primary hover:underline">
                Home loan eligibility
              </Link>{" "}
              — how much can you actually borrow on your salary?
            </li>
            <li>
              <Link href="/calculators/balance-transfer" className="text-primary hover:underline">
                Balance transfer
              </Link>{" "}
              — is it worth switching lenders after processing fees?
            </li>
            <li>
              <Link href="/calculators/tax-benefit" className="text-primary hover:underline">
                Tax benefit calculator
              </Link>{" "}
              — old regime vs new regime for home loan borrowers.
            </li>
            <li>
              <Link href="/calculators/credit-card-payoff" className="text-primary hover:underline">
                Credit card payoff
              </Link>{" "}
              — how long to clear that ₹50,000 balance at minimum due?
            </li>
            <li>
              <Link href="/calculators/multi-loan-planner" className="text-primary hover:underline">
                Multi-loan planner
              </Link>{" "}
              — snowball or avalanche for your entire debt stack?
            </li>
          </ul>
        </section>

        <section aria-labelledby="faq-section" className="mb-4">
          <h2
            id="faq-section"
            className="text-2xl sm:text-3xl font-bold text-foreground mb-6"
          >
            Frequently asked questions
          </h2>
          <div className="space-y-6 text-sm sm:text-base leading-relaxed">
            {HOMEPAGE_FAQS.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-foreground mb-1">
                  {faq.question}
                </h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export const HOMEPAGE_FAQS = [
  {
    question: "Is LastEMI really free?",
    answer:
      "Yes. The EMI calculator, part payment simulator, debt-free date projection, SIP vs prepayment comparison, amortization schedules, and the multi-loan dashboard are all free forever. No sign-up needed to use the calculators. The Pro plan at ₹299 per month is optional and unlocks consolidation analysis, email alerts, and PDF reports — most users never need it.",
  },
  {
    question: "How accurate is the EMI calculator?",
    answer:
      "The math is exact to the rupee. We use the standard reducing-balance EMI formula banks themselves use: EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1). The only variable that might differ from your bank statement is the first month, if your bank uses a partial-period calculation on your disbursement date. Everything else — total interest, tenure, amortization — is precise.",
  },
  {
    question: "Why doesn't LastEMI ask for my phone number?",
    answer:
      "Because we're not selling your contact details to banks. Most free EMI calculators in India capture phone numbers and sell them as leads to DSAs — that's how they make money. We make money from an optional ₹299 per month Pro subscription, so we have zero incentive to harvest your contact info. You use the calculator and leave. Nobody calls you.",
  },
  {
    question: "Can I calculate part payment impact without signing up?",
    answer:
      "Yes. The part payment simulator on the homepage works without any sign-up. Enter your loan details, add a simulated extra payment, and see how your debt-free date and total interest change. Sign-up is only needed if you want to save multiple loans in the dashboard and track real part payments over time.",
  },
  {
    question: "Does LastEMI recommend specific banks or lenders?",
    answer:
      "No. We do not have affiliate partnerships with banks, NBFCs, or DSAs that would influence our math. When the calculator says balance transfer is worth it or your tax regime choice should change, that conclusion is based purely on the numbers you entered — not on whoever pays us the highest commission. We'd rather earn ₹299 from a user who trusts us than ₹2,000 from a bank lead.",
  },
  {
    question: "What loan types can I calculate with LastEMI?",
    answer:
      "All major Indian loan types: home loans, personal loans, car loans, two-wheeler loans, gold loans, education loans, credit card debt, and no-cost consumer EMIs. Each has its own realistic example inputs built into the interface. For home loans specifically, we correctly apply the RBI zero-prepayment-penalty rule for floating-rate loans — something most competing sites get wrong.",
  },
];
