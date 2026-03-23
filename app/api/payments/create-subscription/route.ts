// Razorpay subscription creation route
// Requires: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_PLAN_ID in .env.local

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  void req;
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const planId = process.env.RAZORPAY_PLAN_ID;

  if (!keyId || !keySecret || !planId) {
    return Response.json(
      { error: "Payment gateway not configured" },
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
        total_count: 12,
        quantity: 1,
        notes: {
          userId: session.user.id,
          email: session.user.email,
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
    });
  } catch (err) {
    console.error("[POST /api/payments/create-subscription]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
