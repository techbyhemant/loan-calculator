import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Credit Card Minimum Due Trap Calculator — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Credit Card Minimum Due Trap",
    subtitle: "See what paying only 5% minimum due actually costs you",
    badge: "Calculator",
  });
}
