import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { PRICING } from "@/lib/utils/planGating";

export const metadata = buildMetadata({
  title: "Refund & Cancellation Policy — LastEMI",
  description:
    "LastEMI's refund and cancellation policy. Per-SKU rules for monthly, yearly, and Founding Member Lifetime plans. How to cancel auto-renewal and what counts as eligible for a refund.",
  path: "/refund-policy",
  keywords: [
    "LastEMI refund policy",
    "LastEMI cancellation",
    "Pro plan refund India",
  ],
});

export default function RefundPolicyPage() {
  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          Last updated: 10 May 2026. Plain English on what you can get back and
          how to cancel.
        </p>

        <div className="prose prose-gray max-w-none text-sm sm:text-base leading-relaxed space-y-6 text-foreground">
          <p>
            All paid plans on LastEMI are billed via Razorpay. This page covers
            refund eligibility for each plan, how to cancel auto-renewal, and the
            timeline for getting your money back. If anything here is unclear,
            email us at{" "}
            <a
              href="mailto:contact@lastemi.com"
              className="text-primary underline"
            >
              contact@lastemi.com
            </a>{" "}
            before you decide.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Refund eligibility by plan
          </h2>

          {/* Monthly */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-2">
              Monthly Pro &mdash; ₹{PRICING.monthly}/month
            </h3>
            <p className="text-sm">
              Cancel any time. The current billing month runs to its end; we do
              not pro-rate refunds for partial months. After cancellation, your
              account stays on Pro until the period you have already paid for
              expires, then drops to Free automatically.
            </p>
            <p className="text-sm mt-2">
              <strong>Refund window:</strong> within 7 days of the most recent
              charge, no questions asked. After 7 days the charge for that month
              is non-refundable.
            </p>
          </div>

          {/* Yearly */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-2">
              Yearly Pro &mdash; ₹{PRICING.yearly.toLocaleString("en-IN")}/year
            </h3>
            <p className="text-sm">
              Cancel any time. Auto-renewal stops immediately and your Pro
              access continues until the end of the year you have already paid
              for.
            </p>
            <p className="text-sm mt-2">
              <strong>Full refund window:</strong> within 14 days of the initial
              purchase or any subsequent renewal, full refund minus payment-
              gateway fees (typically ₹30&ndash;₹50). Email{" "}
              <a
                href="mailto:contact@lastemi.com"
                className="text-primary underline"
              >
                contact@lastemi.com
              </a>{" "}
              with your registered email and we will process the refund within
              5&ndash;7 business days.
            </p>
            <p className="text-sm mt-2">
              <strong>Pro-rated refund window:</strong> after 14 days but within
              90 days, we issue a pro-rated refund for the unused months. After
              90 days the year is non-refundable.
            </p>
          </div>

          {/* Lifetime */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-2">
              Founding Member Lifetime &mdash; ₹
              {PRICING.lifetime.toLocaleString("en-IN")} one-time
            </h3>
            <p className="text-sm">
              Single payment, no recurring charges, no auto-renewal. Pro access
              for the lifetime of your account.
            </p>
            <p className="text-sm mt-2">
              <strong>Refund window:</strong> within 14 days of purchase, full
              refund minus payment-gateway fees. After 14 days the lifetime
              purchase is non-refundable. Because the spot count is hard-capped
              at 100 and your payment unlocks one of those spots for life, we
              cannot extend the refund window beyond this without compromising
              the campaign's promise to other members.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            How to cancel auto-renewal
          </h2>
          <p>
            Razorpay manages all subscriptions on our behalf. There are two
            ways to stop auto-renewal:
          </p>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Email us at{" "}
              <a
                href="mailto:contact@lastemi.com"
                className="text-primary underline"
              >
                contact@lastemi.com
              </a></strong> from your registered email address. Subject line
              "Cancel subscription" is enough. We process within one working
              day and reply with confirmation.
            </li>
            <li>
              <strong>Cancel directly via Razorpay.</strong> When you bought the
              plan, Razorpay sent a subscription confirmation email with a
              "Manage subscription" link. Use that link to cancel without
              involving us.
            </li>
          </ol>
          <p>
            The Founding Member Lifetime plan has no auto-renewal to cancel.
            It is a one-time purchase.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            How to request a refund
          </h2>
          <p>
            Email{" "}
            <a
              href="mailto:contact@lastemi.com"
              className="text-primary underline"
            >
              contact@lastemi.com
            </a>{" "}
            from your registered email with:
          </p>
          <ul className="list-disc list-inside space-y-1.5">
            <li>The Razorpay payment ID or order ID (in your purchase email)</li>
            <li>The plan you bought (Monthly / Yearly / Lifetime)</li>
            <li>A brief reason &mdash; not required, but it helps us improve</li>
          </ul>
          <p>
            We acknowledge within one working day. Approved refunds are pushed
            to Razorpay within 5 business days. The actual money lands in your
            bank account / card / UPI within 5&ndash;10 business days
            after that, depending on your payment method (UPI is usually
            fastest, credit cards slowest).
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            What does not qualify for a refund
          </h2>
          <ul className="list-disc list-inside space-y-1.5">
            <li>
              Charges older than the windows above (7 / 14 / 90 days as listed
              per plan).
            </li>
            <li>
              Account suspensions due to terms-of-service violations
              (rare, documented in our{" "}
              <Link href="/terms" className="text-primary underline">
                Terms of Service
              </Link>
              ).
            </li>
            <li>
              Disputes opened with your bank or card issuer without first
              contacting us. Chargebacks cost us a fee and complicate the
              refund process &mdash; please email us first, we will resolve it
              faster.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            What happens to your data after cancellation or refund
          </h2>
          <p>
            Your loan data, part-payment logs, and dashboard state stay in the
            account, which drops to the Free plan. Free plan limits then apply
            (max 2 loans, max 5 part-payment logs). Nothing is deleted unless
            you explicitly request deletion via{" "}
            <a
              href="mailto:privacy@lastemi.com"
              className="text-primary underline"
            >
              privacy@lastemi.com
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Changes to this policy
          </h2>
          <p>
            If we change this policy in a way that materially affects existing
            paid users, we will email everyone on the affected plan at least 30
            days before the change takes effect. Existing payments are honoured
            under the policy that was in force when you paid.
          </p>

          <div className="bg-accent border border-primary/20 rounded-lg p-4 mt-8">
            <p className="text-primary font-medium text-sm">
              Questions about a charge or a refund?{" "}
              <a
                href="mailto:contact@lastemi.com?subject=Refund%20question"
                className="underline font-semibold"
              >
                Email contact@lastemi.com
              </a>
              . We respond within one working day from a real person, not an
              auto-reply.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
