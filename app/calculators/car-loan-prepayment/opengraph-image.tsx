import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Car Loan Prepayment Calculator — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Car Loan Prepayment Calculator",
    subtitle: "Should you prepay your car loan? Factor in the penalty.",
    badge: "Calculator",
  });
}
