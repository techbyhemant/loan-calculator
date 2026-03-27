import { buildMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "Terms of Service — LastEMI",
  description:
    "LastEMI's terms of service: usage terms, disclaimers, and your responsibilities when using our loan calculators and dashboard.",
  path: "/terms",
  keywords: [
    "LastEMI terms of service",
  ],
});

export default function TermsOfServicePage() {
  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: 24 March 2026
        </p>

        <div className="prose prose-gray max-w-none text-sm sm:text-base leading-relaxed space-y-6">
          <p>
            By using LastEMI (
            <Link href="/" className="text-primary underline">
              lastemi.com
            </Link>
            ), you agree to these terms. If you do not agree, please do not use
            our services.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            What LastEMI Provides
          </h2>
          <p>
            LastEMI provides loan EMI calculators, amortization schedules, part
            payment analysis, payoff planning tools, and a personal loan
            tracking dashboard. All calculations use standard Indian banking
            formulas (reducing balance method).
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Not Financial Advice
          </h2>
          <p>
            LastEMI is an informational tool, not a financial advisor. Our
            calculators, comparisons, and recommendations are based on
            mathematical formulas and publicly available data. They do not
            constitute financial, tax, investment, or legal advice. Always
            consult a qualified financial advisor before making financial
            decisions.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Accuracy
          </h2>
          <p>
            We strive for accuracy in all calculations. Our EMI formulas follow
            the standard reducing balance method used by Indian banks. However:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Actual EMI amounts may vary slightly due to bank-specific rounding,
              processing fees, or insurance charges
            </li>
            <li>
              Tax benefit calculations are based on current Income Tax Act
              provisions and may change with new budgets or amendments
            </li>
            <li>
              RBI repo rate and bank lending rates are updated periodically and
              may not reflect the very latest changes
            </li>
            <li>
              We are not liable for decisions made based on our calculations
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            User Accounts
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              You can sign in using Google OAuth or email magic link — we do not
              store passwords
            </li>
            <li>
              You are responsible for the accuracy of loan data you enter in
              your dashboard
            </li>
            <li>
              You must not share your account or use another person&apos;s
              account
            </li>
            <li>
              We reserve the right to suspend accounts that violate these terms
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Free and Pro Plans
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Free plan</strong> — access to all public calculators,
              up to 2 loans in the dashboard, and up to 5 part payment logs
            </li>
            <li>
              <strong>Pro plan (₹299/month)</strong> — unlimited loans, payoff
              planner, consolidation analyzer, tax dashboard, PDF export, and
              email alerts
            </li>
            <li>
              Pro subscriptions are billed monthly via Razorpay. You can cancel
              anytime — access continues until the end of the billing period
            </li>
            <li>
              Refunds are handled on a case-by-case basis. Contact us within 7
              days of a charge for refund requests
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Affiliate Links
          </h2>
          <p>
            LastEMI may display affiliate links for balance transfer or loan
            consolidation offers. These are clearly marked and only shown when
            our calculations indicate a genuine net saving. We earn a commission
            if you use these links — this does not affect the cost to you. See
            our{" "}
            <Link
              href="/editorial-standards"
              className="text-primary underline"
            >
              Editorial Standards
            </Link>{" "}
            for our affiliate disclosure policy.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Intellectual Property
          </h2>
          <p>
            All content on LastEMI — including calculators, articles, design,
            and code — is owned by LastEMI. You may not copy, reproduce, or
            redistribute our content without written permission. You may share
            links to our pages and embed our calculators with attribution.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Prohibited Use
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Scraping or automated data collection from our website</li>
            <li>Using our service to spam, phish, or distribute malware</li>
            <li>Attempting to access other users&apos; accounts or data</li>
            <li>Reverse-engineering our calculators or proprietary algorithms</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Limitation of Liability
          </h2>
          <p>
            LastEMI is provided &quot;as is&quot; without warranties of any kind.
            To the maximum extent permitted by law, we are not liable for any
            damages arising from your use of our service, including but not
            limited to financial losses from decisions made based on our
            calculations.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Governing Law
          </h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be
            subject to the exclusive jurisdiction of courts in Bengaluru,
            Karnataka.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Changes to These Terms
          </h2>
          <p>
            We may update these terms from time to time. Changes will be posted
            on this page with an updated date. Continued use of LastEMI after
            changes constitutes acceptance of the updated terms.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Contact
          </h2>
          <p>
            Questions about these terms? Email us at{" "}
            <a
              href="mailto:support@lastemi.com"
              className="text-primary underline"
            >
              support@lastemi.com
            </a>
          </p>

          <p className="mt-8 text-muted-foreground text-sm">
            See also:{" "}
            <Link href="/privacy" className="text-primary underline">
              Privacy Policy
            </Link>{" "}
            ·{" "}
            <Link
              href="/editorial-standards"
              className="text-primary underline"
            >
              Editorial Standards
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
