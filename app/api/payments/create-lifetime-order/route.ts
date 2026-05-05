// Razorpay one-time order creation for the Founding Member Lifetime
// SKU. Different from subscriptions: lifetime is a single payment with
// no recurring billing, so we create a Razorpay Order, not a Subscription.
//
// Server-side cap enforcement: this route counts existing lifetime
// purchases in the users table and rejects new orders once the cap
// (LIFETIME_CAMPAIGN.totalSpots) is reached. The /pricing page also
// hides the lifetime card client-side, but that's belt-and-suspenders.
//
// Required env:
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { LIFETIME_CAMPAIGN, PRICING } from "@/lib/utils/planGating";
import { getLifetimeSpotsRemaining } from "@/lib/utils/lifetimeSpots";

export async function POST(req: NextRequest) {
  void req;
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Belt-and-suspenders: re-check the spot count and deadline server-side
  // even though the pricing page already hides the card when sold out.
  // A determined client could still POST here directly.
  const spotsRemaining = await getLifetimeSpotsRemaining();
  if (spotsRemaining <= 0) {
    return Response.json(
      { error: "Founding member lifetime is sold out." },
      { status: 410 },
    );
  }
  const now = new Date();
  if (now > new Date(LIFETIME_CAMPAIGN.endsAt)) {
    return Response.json(
      { error: "The lifetime campaign has ended." },
      { status: 410 },
    );
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return Response.json(
      { error: "Payment gateway not configured" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: PRICING.lifetime * 100, // paise
        currency: "INR",
        receipt: `lifetime_${session.user.id.slice(0, 8)}_${Date.now()}`,
        notes: {
          userId: session.user.id,
          email: session.user.email,
          planType: "lifetime",
          campaign: "founding-member",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "[POST /api/payments/create-lifetime-order]",
        errorData,
      );
      return Response.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }

    const order = await response.json();
    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      // Razorpay Checkout opens client-side using the orderId + key. The
      // /pricing page handles the redirect-to-checkout flow.
    });
  } catch (err) {
    console.error("[POST /api/payments/create-lifetime-order]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
