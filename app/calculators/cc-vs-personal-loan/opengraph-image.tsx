import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Credit Card vs Personal Loan Comparison — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Credit Card vs Personal Loan",
    subtitle: "42% vs 16% — but does the processing fee change the answer?",
    badge: "Comparison",
  });
}
