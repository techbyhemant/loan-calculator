import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Personal Loan EMI Calculator (India) — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Personal Loan EMI Calculator",
    subtitle: "Pick any amount — see EMI, processing fee, real cost across all rates",
    badge: "Hub",
  });
}
