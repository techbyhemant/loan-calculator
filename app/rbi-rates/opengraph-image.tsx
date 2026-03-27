import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "RBI Repo Rate Tracker — LastEMI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "RBI Repo Rate Tracker",
    subtitle: "Current rate, history, and impact on your home loan EMI",
    badge: "Live Data",
  });
}
