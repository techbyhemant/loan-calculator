import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = "image/png";

// Mirror of the [amount]/page.tsx config so the OG image picks the
// correct human-readable label for each programmatic page. Kept inline
// here (instead of importing from page.tsx) because that page uses
// non-edge-compatible helpers and would bloat the OG runtime bundle.
const AMOUNTS: Record<string, { label: string; short: string }> = {
  "15-lakh":  { label: "15 Lakh",  short: "15L" },
  "20-lakh":  { label: "20 Lakh",  short: "20L" },
  "25-lakh":  { label: "25 Lakh",  short: "25L" },
  "50-lakh":  { label: "50 Lakh",  short: "50L" },
  "60-lakh":  { label: "60 Lakh",  short: "60L" },
  "75-lakh":  { label: "75 Lakh",  short: "75L" },
  "90-lakh":  { label: "90 Lakh",  short: "90L" },
  "1-crore":  { label: "1 Crore",  short: "1Cr" },
};

export function generateStaticParams() {
  return Object.keys(AMOUNTS).map((amount) => ({ amount }));
}

export const alt = "Home Loan EMI Calculator — LastEMI";

export default function Image({ params }: { params: { amount: string } }) {
  const cfg = AMOUNTS[params.amount];
  const label = cfg?.label ?? "Home Loan";
  return generateOGImage({
    title: `₹${label} Home Loan EMI`,
    subtitle: "EMI, total interest, salary needed — at every rate and tenure",
    badge: "Calculator",
  });
}
