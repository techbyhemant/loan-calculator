import { auth } from "@/lib/auth";
import { PricingContent } from "./PricingContent";
import { buildMetadata } from "@/lib/seo/metadata";
import { LIFETIME_CAMPAIGN, PRICING } from "@/lib/utils/planGating";
import { getLifetimeSpotsRemaining } from "@/lib/utils/lifetimeSpots";

export const metadata = buildMetadata({
  title: "Pricing — Free, Yearly, or Lifetime Founding Member",
  description:
    "Free dashboard for tracking up to 2 loans. Pro at ₹299/month or ₹2,499/year unlocks payoff strategies, consolidation analysis, and tax dashboard. Limited Founding Member Lifetime at ₹6,999.",
  path: "/pricing",
  keywords: [
    "LastEMI pricing",
    "loan tracker pricing India",
    "free EMI calculator",
    "yearly Pro plan",
    "lifetime founding member",
  ],
});

// Pricing depends on the live spots count, so we don't want it
// statically rendered. Force dynamic so each request reads the fresh
// session and recalculates remaining lifetime inventory.
export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userPlan =
    ((session?.user as { plan?: string })?.plan ?? "free") as "free" | "pro";
  const userPlanType =
    (session?.user as { planType?: string })?.planType ?? null;

  const spotsRemaining = await getLifetimeSpotsRemaining();
  const campaignEnded =
    new Date() > new Date(LIFETIME_CAMPAIGN.endsAt) || spotsRemaining <= 0;

  return (
    <PricingContent
      isLoggedIn={isLoggedIn}
      userPlan={userPlan}
      userPlanType={userPlanType}
      pricing={PRICING}
      lifetime={{
        spotsRemaining,
        totalSpots: LIFETIME_CAMPAIGN.totalSpots,
        endsAt: LIFETIME_CAMPAIGN.endsAt,
        campaignEnded,
      }}
    />
  );
}
