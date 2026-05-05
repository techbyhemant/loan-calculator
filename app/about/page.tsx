import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "About LastEMI — Built for Indian Borrowers, Not Banks",
  description:
    "LastEMI is an independent loan-tracking platform built in India. No DSA calls, no phone-number capture, no commissions from lenders. The full story of why we exist and how we stay honest.",
  path: "/about",
  keywords: [
    "about LastEMI",
    "Indian debt platform",
    "honest EMI calculator",
    "no phone number EMI calculator",
    "LastEMI founder",
  ],
});

// JSON-LD: Organization + founder identity. Strong E-E-A-T signal for
// Google's YMYL classifier on financial-content sites.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LastEMI",
  url: "https://lastemi.com",
  logo: "https://lastemi.com/long-logo-light.png",
  description:
    "India's honest debt freedom platform. Free EMI calculators and loan tracking with no phone-number capture, no DSA lead gen, and no lender commissions.",
  foundingDate: "2026",
  founder: {
    "@type": "Person",
    name: "Hemant Bhankhar",
  },
  sameAs: [
    "https://lastemi.com",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "hello@lastemi.com",
      contactType: "customer support",
      availableLanguage: ["English", "Hindi"],
    },
  ],
};

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          About LastEMI
        </h1>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          Built in India, by a borrower, for borrowers.
        </p>

        <div className="prose prose-gray max-w-none text-sm sm:text-base leading-relaxed space-y-6 text-foreground">
          <p>
            LastEMI is an independent loan-tracking and EMI-planning platform.
            We do not take lender commissions, we do not run a DSA channel,
            and we never ask you for your phone number. The site exists for
            one reason: every other &ldquo;free&rdquo; EMI calculator in India
            has a quiet conflict of interest, and Indian borrowers deserve
            one tool where the math is the only thing being sold.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Why we built this
          </h2>
          <p>
            If you have ever Googled an EMI calculator in India, you know the
            pattern. You type in your loan amount and tenure. You get an
            answer. Within 24 hours your phone is ringing with three DSA
            calls offering to &ldquo;help&rdquo; with that loan, and your
            inbox starts filling with offers from banks you never opted in
            to. The number you entered for a 10-second calculation became a
            lead, and the lead got sold.
          </p>
          <p>
            That model is fine for the calculator owner. It is the entire
            reason most of these tools are free. It is not fine for the
            person who just wanted to check whether their EMI was correct.
          </p>
          <p>
            LastEMI started as a personal frustration with that loop and
            grew into a small set of public tools: an EMI calculator that
            simulates part-payments accurately, a multi-loan dashboard for
            people juggling home loan plus car loan plus credit card, and a
            payoff planner that compares the avalanche and snowball methods
            without pretending one is universally better. Every calculation
            is built around RBI rules as they actually exist, not as banks
            sometimes describe them.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Who is behind LastEMI
          </h2>
          <p>
            LastEMI is built and maintained by{" "}
            <strong>Hemant Bhankhar</strong>, an India-based software engineer
            who has spent years building consumer products. The platform is
            self-funded, with no external investors, no paid lender
            relationships, and no growth-at-all-costs pressure. That is by
            design. Independence is what makes it possible to publish the
            kind of advice that loses money in the short term, like telling
            someone their planned balance transfer is not worth it after
            fees.
          </p>
          <p>
            Reach the team directly at{" "}
            <a
              href="mailto:hello@lastemi.com"
              className="text-primary underline"
            >
              hello@lastemi.com
            </a>
            . Real replies, no auto-responders.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            What we will not do
          </h2>
          <p>
            A short list of things you will never see on LastEMI, in order
            of how often we get asked about them:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Phone-number capture.</strong> No form on this site
              asks for it. Not for the calculator, not for the dashboard,
              not for the Pro plan. Sign-in is via Google or a Resend magic
              link to your email. That is the brand promise.
            </li>
            <li>
              <strong>DSA / agent referrals.</strong> No telecaller will
              ever contact you because you used LastEMI. We do not run a
              lead-gen pipeline.
            </li>
            <li>
              <strong>Affiliate links by default.</strong> We display them
              only when the math makes the product genuinely cheaper for
              you. Balance-transfer suggestions appear only when net saving
              after fees is above ₹50,000. Consolidation suggestions appear
              only when the verdict is &ldquo;beneficial&rdquo; with at
              least ₹25,000 saved. The triggers are documented in the open
              source we publish.
            </li>
            <li>
              <strong>Misrepresenting RBI rules.</strong> Most calculators
              quietly default the prepayment penalty to a non-zero number on
              floating-rate loans. RBI explicitly forbids that. We hard-code
              zero, and our schema validation rejects any input that tries
              to set it otherwise.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            How LastEMI makes money
          </h2>
          <p>
            The calculators and the basic dashboard are free, with no
            registration required for the calculators. The free dashboard
            tier (Google or magic-link sign-in) lets you save up to two
            loans and log up to a few part-payments. The{" "}
            <Link href="/pricing" className="text-primary underline">
              Pro plan
            </Link>{" "}
            (₹299 a month) unlocks the payoff planner, consolidation
            analyzer, tax dashboard, PDF export, unlimited loans, and rate
            alerts.
          </p>
          <p>
            That is the entire revenue model. No banner ads. No data sales.
            No DSA commissions. If someone offers you a loan because of
            something you did on LastEMI, it was not us. Forward the SMS
            to{" "}
            <a href="mailto:hello@lastemi.com" className="text-primary underline">
              hello@lastemi.com
            </a>{" "}
            so we can investigate.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            How we keep the math honest
          </h2>
          <p>
            All calculation logic is tested against published RBI rules and
            the actual amortization schedules banks send to borrowers. When
            our number disagrees with the bank&rsquo;s number, we have an{" "}
            <Link href="/" className="text-primary underline">
              EMI verifier
            </Link>{" "}
            that back-solves the effective interest rate from the bank&rsquo;s
            stated EMI, which is how you spot the spread that day-count
            conventions and rounding tricks bake in.
          </p>
          <p>
            Our editorial process for every published article is documented
            on the{" "}
            <Link href="/editorial-standards" className="text-primary underline">
              Editorial Standards
            </Link>{" "}
            page: which sources we cite, how we update content when RBI
            policy changes, and how we handle corrections. If you spot a
            calculation error or stale figure, write to us. Corrections are
            usually live within 48 hours.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            What we are working on next
          </h2>
          <p>
            The roadmap is shaped by what borrowers actually ask for. The
            current shortlist includes statement-OCR (point your camera at
            an HDFC SMS and have the dashboard auto-update outstanding and
            EMI), a richer rate-revision history for floating-rate loans,
            and integrations with bank account aggregators once the privacy
            model is clean enough for us to recommend. None of these will
            require a phone number.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Contact and feedback
          </h2>
          <p>
            For product feedback, errors, partnership questions, or
            anything else, write to{" "}
            <a
              href="mailto:hello@lastemi.com"
              className="text-primary underline"
            >
              hello@lastemi.com
            </a>
            . Replies come from a real person, usually within a working
            day.
          </p>
        </div>
      </main>
    </div>
  );
}
