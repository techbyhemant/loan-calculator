import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Credit Card Payoff Calculator — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Credit Card Payoff Calculator",
    subtitle: "Find out exactly how long to clear your credit card debt",
    badge: "Calculator",
  });
}
