import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = "image/png";

const AMOUNTS: Record<string, { label: string; short: string }> = {
  "1-lakh":  { label: "1 Lakh",  short: "1L" },
  "2-lakh":  { label: "2 Lakh",  short: "2L" },
  "3-lakh":  { label: "3 Lakh",  short: "3L" },
  "5-lakh":  { label: "5 Lakh",  short: "5L" },
  "10-lakh": { label: "10 Lakh", short: "10L" },
  "20-lakh": { label: "20 Lakh", short: "20L" },
};

export function generateStaticParams() {
  return Object.keys(AMOUNTS).map((amount) => ({ amount }));
}

export const alt = "Personal Loan EMI Calculator — LastEMI";

export default function Image({ params }: { params: { amount: string } }) {
  const cfg = AMOUNTS[params.amount];
  const label = cfg?.label ?? "Personal Loan";
  return generateOGImage({
    title: `₹${label} Personal Loan EMI`,
    subtitle: "EMI, total interest, processing fee impact at every rate",
    badge: "Calculator",
  });
}
