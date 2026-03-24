import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PricingContent } from "./PricingContent";

export const metadata: Metadata = {
  title: "Pricing — Free vs Pro | LastEMI",
  description:
    "Compare LastEMI Free and Pro plans. Track loans for free or upgrade to Pro for payoff strategies, consolidation analysis, and tax benefits.",
  alternates: { canonical: "/pricing" },
  robots: { index: true, follow: true },
};

export default async function PricingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userPlan =
    ((session?.user as { plan?: string })?.plan ?? "free") as "free" | "pro";

  return <PricingContent isLoggedIn={isLoggedIn} userPlan={userPlan} />;
}
