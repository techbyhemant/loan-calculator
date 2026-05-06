import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Contact LastEMI — Real Replies, No Auto-Responders",
  description:
    "Get in touch with the LastEMI team. Email contact@lastemi.com for product feedback, bug reports, billing questions, partnerships, or anything else. Replies usually within one working day.",
  path: "/contact",
  keywords: [
    "contact LastEMI",
    "LastEMI support",
    "LastEMI email",
    "loan calculator help India",
  ],
});

// JSON-LD: ContactPage schema. Helps Google associate this URL with
// the organisation entity defined on /about, and surfaces email in
// rich-result eligibility for branded queries like "lastemi support".
const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact LastEMI",
  url: "https://lastemi.com/contact",
  description:
    "Reach the LastEMI team for product questions, billing support, bug reports, or partnerships.",
  mainEntity: {
    "@type": "Organization",
    name: "LastEMI",
    url: "https://lastemi.com",
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "contact@lastemi.com",
        contactType: "customer support",
        availableLanguage: ["English", "Hindi"],
        areaServed: "IN",
      },
      {
        "@type": "ContactPoint",
        email: "privacy@lastemi.com",
        contactType: "data protection",
        availableLanguage: ["English"],
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Contact LastEMI
        </h1>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          One inbox. A real person on the other end. Replies usually within
          one working day.
        </p>

        {/* Primary email block — the headline action. */}
        <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 mb-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Write to us
          </p>
          <a
            href="mailto:contact@lastemi.com"
            className="text-2xl sm:text-3xl font-bold text-primary hover:underline"
          >
            contact@lastemi.com
          </a>
          <p className="text-sm text-muted-foreground mt-3">
            Whether you want to flag a bug, ask whether prepayment makes
            sense for your loan, or just tell us the calculator is wrong
            about something — write in. We read every email.
          </p>
        </div>

        <div className="prose prose-gray max-w-none text-sm sm:text-base leading-relaxed space-y-6 text-foreground">
          <h2 className="text-xl font-semibold text-foreground mt-2">
            Where to send what
          </h2>
          <p>
            We try to keep things simple — most things go to{" "}
            <a
              href="mailto:contact@lastemi.com"
              className="text-primary underline"
            >
              contact@lastemi.com
            </a>{" "}
            and we route from there. Two specific addresses exist for
            things that legally need their own paper trail:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-4 py-2 font-medium text-foreground">
                    What you need
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-foreground">
                    Where to write
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3">Product feedback, feature requests</td>
                  <td className="px-4 py-3">
                    <a
                      href="mailto:contact@lastemi.com"
                      className="text-primary underline"
                    >
                      contact@lastemi.com
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Bug reports, calculation errors</td>
                  <td className="px-4 py-3">
                    <a
                      href="mailto:contact@lastemi.com"
                      className="text-primary underline"
                    >
                      contact@lastemi.com
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Billing, refunds, subscription questions</td>
                  <td className="px-4 py-3">
                    <a
                      href="mailto:contact@lastemi.com"
                      className="text-primary underline"
                    >
                      contact@lastemi.com
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Press, partnerships, media</td>
                  <td className="px-4 py-3">
                    <a
                      href="mailto:contact@lastemi.com"
                      className="text-primary underline"
                    >
                      contact@lastemi.com
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Privacy, data deletion, GDPR / DPDP requests</td>
                  <td className="px-4 py-3">
                    <a
                      href="mailto:privacy@lastemi.com"
                      className="text-primary underline"
                    >
                      privacy@lastemi.com
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Terms of service, legal notices</td>
                  <td className="px-4 py-3">
                    <a
                      href="mailto:support@lastemi.com"
                      className="text-primary underline"
                    >
                      support@lastemi.com
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Things to mention so we can help faster
          </h2>
          <p>
            If you&rsquo;re writing about something specific in the product,
            two details turn a 3-day back-and-forth into a 30-minute fix:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Which page or calculator</strong> you were on (a URL
              or a screenshot is best).
            </li>
            <li>
              <strong>What you expected vs what you got.</strong> Even one
              line is enough.
            </li>
          </ul>
          <p>
            For calculation disputes specifically — &ldquo;our number says
            X, the bank says Y&rdquo; — paste the actual sanction letter
            figures (loan amount, rate, EMI, tenure) so we can replicate
            it. We will tell you which one is wrong, even if it turns out
            to be ours.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            What we cannot help with
          </h2>
          <p>
            LastEMI is a calculator and tracking platform, not a registered
            financial advisor or a lender. So a few hard limits on what we
            can do over email:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>We cannot recommend a specific bank or loan
              product.</strong> The math will tell you whether
              prepayment, balance transfer, or consolidation makes sense.
              We will not pick a lender for you.
            </li>
            <li>
              <strong>We cannot give personalised investment advice.</strong>
              Whether to put extra cash into SIP versus loan prepayment
              depends on your full financial picture. Use the calculator,
              read the math, and consult a registered advisor for anything
              binding.
            </li>
            <li>
              <strong>We cannot intervene with your bank.</strong> If your
              lender is refusing to pass on an RBI rate cut or charging a
              prepayment penalty on a floating-rate loan, we can point you
              to the relevant RBI rule. Filing a grievance has to come
              from you.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            How fast we reply
          </h2>
          <p>
            One working day for most emails. Bug reports tagged urgent
            (anything that breaks calculations or login) usually within
            a few hours during the day. We do not run a 24x7 support
            desk — if you write at midnight, expect a morning reply.
          </p>
          <p>
            We also do not use auto-responders or canned replies. If you
            ask a thoughtful question, you will get a thoughtful answer.
            If you write to abuse the team, you will get silence.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Before you write
          </h2>
          <p>
            A lot of common questions are answered already. Worth a quick
            look at:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <Link href="/pricing" className="text-primary underline">
                Pricing
              </Link>{" "}
              — Free vs Pro features, Founding Member Lifetime details,
              and how billing works
            </li>
            <li>
              <Link href="/about" className="text-primary underline">
                About
              </Link>{" "}
              — Why LastEMI exists, who builds it, and what we will and
              will not do with your data
            </li>
            <li>
              <Link
                href="/editorial-standards"
                className="text-primary underline"
              >
                Editorial Standards
              </Link>{" "}
              — How we verify calculations and which sources we cite
            </li>
            <li>
              <Link href="/blog" className="text-primary underline">
                Blog
              </Link>{" "}
              — Long-form pieces on RBI rules, tax benefits, and payoff
              strategy
            </li>
          </ul>

          <div className="bg-accent border border-primary/20 rounded-lg p-4 mt-8">
            <p className="text-primary font-medium text-sm">
              Spotted something we got wrong? Calculation off, copy out
              of date, or a broken link?{" "}
              <a
                href="mailto:contact@lastemi.com?subject=Correction"
                className="underline font-semibold"
              >
                Tell us &rarr;
              </a>{" "}
              Corrections are usually live within 48 hours.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
