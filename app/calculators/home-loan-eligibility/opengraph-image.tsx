import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Home Loan Eligibility Calculator — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Home Loan Eligibility Calculator",
    subtitle: "Find out how much home loan you can get based on your salary",
    badge: "Calculator",
  });
}
