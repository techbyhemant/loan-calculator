import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Which Loan to Pay Off First — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Which Loan to Pay Off First?",
    subtitle: "Optimal payoff order for all your loans based on effective rates",
    badge: "Planner",
  });
}
