import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Education Loan Section 80E Planner — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Education Loan Section 80E Planner",
    subtitle: "Unlimited interest deduction — plan your repayment",
    badge: "Planner",
  });
}
