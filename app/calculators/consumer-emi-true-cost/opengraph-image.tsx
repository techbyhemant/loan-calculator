import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "0% EMI True Cost Calculator — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "0% EMI True Cost Calculator",
    subtitle: "The processing fee is the interest — just renamed",
    badge: "Calculator",
  });
}
