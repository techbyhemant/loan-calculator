import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Salary to Home Loan Calculator — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Salary to Home Loan Calculator",
    subtitle: "How much home loan can you get on your salary?",
    badge: "Calculator",
  });
}
