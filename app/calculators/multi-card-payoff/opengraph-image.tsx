import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Multi-Card Payoff Planner — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Multi-Card Payoff Planner",
    subtitle: "Avalanche vs Snowball — which strategy for your cards?",
    badge: "Planner",
  });
}
