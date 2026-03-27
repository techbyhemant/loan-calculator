import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Home Loan Balance Transfer Calculator — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Home Loan Balance Transfer Calculator",
    subtitle: "Is switching banks worth the processing fee?",
    badge: "Calculator",
  });
}
