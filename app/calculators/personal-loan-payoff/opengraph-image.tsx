import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Personal Loan Prepayment Calculator — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Personal Loan Prepayment Calculator",
    subtitle: "Is prepaying worth it after the 2-5% penalty?",
    badge: "Calculator",
  });
}
