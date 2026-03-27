import { auth } from "@/lib/auth";
import { PricingContent } from "./PricingContent";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Pricing — Free vs Pro",
  description:
    "Compare LastEMI Free and Pro plans. Track loans for free or upgrade to Pro for payoff strategies, consolidation analysis, and tax benefits.",
  path: "/pricing",
  keywords: [
    "LastEMI pricing",
    "loan tracker pricing India",
    "free EMI calculator",
  ],
});

export default async function PricingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userPlan =
    ((session?.user as { plan?: string })?.plan ?? "free") as "free" | "pro";

  return <PricingContent isLoggedIn={isLoggedIn} userPlan={userPlan} />;
}
