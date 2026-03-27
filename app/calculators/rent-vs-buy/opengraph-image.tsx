import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Rent vs Buy Calculator — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Rent vs Buy Calculator",
    subtitle: "Should you buy a home or keep renting? The honest math.",
    badge: "Calculator",
  });
}
