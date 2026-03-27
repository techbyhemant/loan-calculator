import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "LastEMI — Free EMI Calculator & Loan Simulator for India";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Calculate your EMI. Find your debt-free date.",
    subtitle: "Free loan simulator for home loans, personal loans, car loans & credit cards.",
    badge: "Free Tool",
  });
}
