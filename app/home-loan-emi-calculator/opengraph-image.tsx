import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Home Loan EMI Calculator (India) — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Home Loan EMI Calculator",
    subtitle: "Pick any amount — see EMI, interest, salary needed at every common rate",
    badge: "Hub",
  });
}
