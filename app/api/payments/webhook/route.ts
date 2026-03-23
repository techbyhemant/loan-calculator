// Razorpay webhook handler
// Requires: RAZORPAY_WEBHOOK_SECRET in .env.local
// Configure webhook URL in Razorpay dashboard: https://emipartpay.com/api/payments/webhook

import { NextRequest } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "Webhook not configured" }, { status: 503 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return Response.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event as string;

    await dbConnect();

    if (
      eventType === "subscription.activated" ||
      eventType === "subscription.charged"
    ) {
      const userId = event.payload?.subscription?.entity?.notes?.userId;
      if (userId) {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);

        await UserModel.findByIdAndUpdate(userId, {
          plan: "pro",
          planExpiry: expiry,
          razorpayCustomerId:
            event.payload?.subscription?.entity?.customer_id ?? undefined,
        });
      }
    }

    if (
      eventType === "subscription.cancelled" ||
      eventType === "subscription.expired"
    ) {
      const userId = event.payload?.subscription?.entity?.notes?.userId;
      if (userId) {
        await UserModel.findByIdAndUpdate(userId, {
          plan: "free",
        });
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("[POST /api/payments/webhook]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
