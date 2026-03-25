import { buildMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "Privacy Policy — LastEMI",
  description:
    "LastEMI's privacy policy: how we collect, use, and protect your data. We never sell your personal information.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: 24 March 2026
        </p>

        <div className="prose prose-gray max-w-none text-sm sm:text-base leading-relaxed space-y-6">
          <p>
            LastEMI (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates
            the website{" "}
            <Link href="/" className="text-primary underline">
              lastemi.com
            </Link>
            . This Privacy Policy explains how we collect, use, and protect your
            information when you use our services.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Information We Collect
          </h2>

          <h3 className="text-lg font-medium text-foreground mt-6">
            Information you provide
          </h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Account information</strong> — name and email address when
              you sign in with Google or email magic link
            </li>
            <li>
              <strong>Loan data</strong> — loan details you add to your
              dashboard (amount, interest rate, tenure, lender name)
            </li>
            <li>
              <strong>Payment information</strong> — processed securely by
              Razorpay. We never store your card or bank details.
            </li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mt-6">
            Information collected automatically
          </h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Usage data</strong> — pages visited, calculator inputs
              (anonymous), and feature usage via Google Analytics
            </li>
            <li>
              <strong>Device data</strong> — browser type, operating system, and
              screen size for improving the experience
            </li>
            <li>
              <strong>Cookies</strong> — authentication session cookies and
              analytics cookies
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            How We Use Your Information
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide and maintain your loan dashboard</li>
            <li>To calculate EMI schedules, payoff strategies, and tax benefits</li>
            <li>To send transactional emails (login links, payment receipts)</li>
            <li>To send monthly loan summary emails (Pro users, opt-out available)</li>
            <li>To improve our calculators and user experience</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            What We Never Do
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>We never sell your personal data to third parties</li>
            <li>We never share your loan details with banks, DSAs, or lenders</li>
            <li>We never capture your phone number for referrals</li>
            <li>We never access your bank accounts or credit score</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Third-Party Services
          </h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Google OAuth</strong> — for account sign-in
            </li>
            <li>
              <strong>Resend</strong> — for sending transactional emails
            </li>
            <li>
              <strong>Razorpay</strong> — for payment processing (Pro
              subscriptions)
            </li>
            <li>
              <strong>Google Analytics</strong> — for anonymous usage analytics
            </li>
            <li>
              <strong>MongoDB Atlas</strong> — for secure data storage
            </li>
          </ul>
          <p>
            Each service has its own privacy policy. We only share the minimum
            data required for each service to function.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Data Storage and Security
          </h2>
          <p>
            Your data is stored on MongoDB Atlas servers with encryption at rest
            and in transit. We use JWT-based session tokens and HTTPS for all
            communications. We do not store passwords — authentication is handled
            via Google OAuth and email magic links.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Data Retention
          </h2>
          <p>
            Your account and loan data is retained as long as your account is
            active. If you delete your account, all associated data is
            permanently removed within 30 days. Calculator usage on public pages
            (without sign-in) is not stored on our servers.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Your Rights
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Access</strong> — view all your data from your dashboard
            </li>
            <li>
              <strong>Export</strong> — download your loan data as PDF or Excel
            </li>
            <li>
              <strong>Delete</strong> — request complete account deletion by
              emailing us
            </li>
            <li>
              <strong>Opt-out</strong> — unsubscribe from emails at any time
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Cookies
          </h2>
          <p>
            We use essential cookies for authentication (keeping you logged in)
            and analytics cookies (Google Analytics) to understand how our
            calculators are used. You can disable analytics cookies in your
            browser settings without affecting core functionality.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Changes to This Policy
          </h2>
          <p>
            We may update this policy from time to time. Changes will be posted
            on this page with an updated date. Continued use of LastEMI after
            changes constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Contact
          </h2>
          <p>
            Questions about this privacy policy? Email us at{" "}
            <a
              href="mailto:privacy@lastemi.com"
              className="text-primary underline"
            >
              privacy@lastemi.com
            </a>
          </p>

          <p className="mt-8 text-muted-foreground text-sm">
            See also:{" "}
            <Link href="/terms" className="text-primary underline">
              Terms of Service
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
