import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Loan Tax Benefit Calculator — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Loan Tax Benefit Calculator",
    subtitle: "Section 80C, 24(b) & 80E — see how much tax you save",
    badge: "Calculator",
  });
}
