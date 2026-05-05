// Razorpay subscription creation route — handles monthly and yearly
// recurring plans. Lifetime is a separate one-time order, see
// /api/payments/create-lifetime-order.
//
// Required env:
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET
//   RAZORPAY_MONTHLY_PLAN_ID  (Razorpay Plan with ₹299/month interval)
//   RAZORPAY_YEARLY_PLAN_ID   (Razorpay Plan with ₹2499/year interval)
//
// Backwards compat: if RAZORPAY_PLAN_ID is set (the old single-tier env
// var), it is used as the monthly plan ID.

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

type PlanType = "monthly" | "yearly";

const SUBSCRIPTION_PERIOD: Record<PlanType, number> = {
  // total_count: number of billing cycles before the subscription auto-completes.
  // 60 monthly cycles = 5 years, plenty before any plan-rev pressure.
  monthly: 60,
  // 5 yearly cycles = 5 years.
  yearly: 5,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { planType?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const planType: PlanType =
    body.planType === "yearly" ? "yearly" : "monthly";

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const monthlyPlanId =
    process.env.RAZORPAY_MONTHLY_PLAN_ID ?? process.env.RAZORPAY_PLAN_ID;
  const yearlyPlanId = process.env.RAZORPAY_YEARLY_PLAN_ID;

  const planId = planType === "yearly" ? yearlyPlanId : monthlyPlanId;

  if (!keyId || !keySecret || !planId) {
    return Response.json(
      {
        error:
          planType === "yearly"
            ? "Yearly plan not yet configured. Please try monthly or contact support."
            : "Payment gateway not configured",
      },
      { status: 503 },
    );
  }

  try {
    const response = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: SUBSCRIPTION_PERIOD[planType],
        quantity: 1,
        notes: {
          userId: session.user.id,
          email: session.user.email,
          planType,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[POST /api/payments/create-subscription]", errorData);
      return Response.json(
        { error: "Failed to create subscription" },
        { status: 500 },
      );
    }

    const subscription = await response.json();
    return Response.json({
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
      planType,
    });
  } catch (err) {
    console.error("[POST /api/payments/create-subscription]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
