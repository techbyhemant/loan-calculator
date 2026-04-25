import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in to LastEMI — Save Your Loan Calculations",
  description:
    "Sign in to save your EMI calculations, track loans, log part payments, and access your debt freedom dashboard. Free — no phone number required.",
  alternates: { canonical: "https://lastemi.com/login" },
  // Auth pages don't need to rank or be indexed; signals to search engines
  // that this is a utility page and prevents duplicate-title warnings.
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
