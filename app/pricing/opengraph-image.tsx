import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "LastEMI Pricing — Free vs Pro";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "LastEMI Pricing — Free vs Pro",
    subtitle: "Start free. Upgrade when you need advanced strategies.",
    badge: "Pricing",
  });
}
