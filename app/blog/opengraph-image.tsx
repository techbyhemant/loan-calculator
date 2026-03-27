import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "LastEMI Blog — Math-backed guides for Indian borrowers";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "LastEMI Blog",
    subtitle: "Math-backed guides to help Indian borrowers pay off loans faster",
    badge: "Blog",
  });
}
