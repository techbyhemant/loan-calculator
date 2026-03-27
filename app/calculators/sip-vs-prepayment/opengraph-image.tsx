import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "SIP vs Home Loan Prepayment Calculator — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "SIP vs Home Loan Prepayment",
    subtitle: "Which saves more — investing in mutual funds or prepaying your loan?",
    badge: "Calculator",
  });
}
