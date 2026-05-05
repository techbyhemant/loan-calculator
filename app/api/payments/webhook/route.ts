// Razorpay webhook handler — activates Pro plans after successful
// payment. Handles three SKUs:
//   - Monthly subscription   → planType="monthly", expiry +1 month
//   - Yearly subscription    → planType="yearly", expiry +1 year
//   - Lifetime one-time order → planType="lifetime", expiry NULL
//
// Required env: RAZORPAY_WEBHOOK_SECRET
// Razorpay dashboard webhook URL: https://lastemi.com/api/payments/webhook
//
// Webhook events to subscribe to in Razorpay dashboard:
//   subscription.activated, subscription.charged
//   subscription.cancelled, subscription.expired
//   payment.captured  (for lifetime one-time orders)
//   order.paid        (alternative for lifetime orders)

import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type WebhookEvent = {
  event: string;
  payload?: {
    subscription?: { entity?: SubscriptionEntity };
    payment?: { entity?: PaymentEntity };
    order?: { entity?: OrderEntity };
  };
};

type SubscriptionEntity = {
  customer_id?: string;
  notes?: { userId?: string; planType?: string };
};

type PaymentEntity = {
  notes?: { userId?: string; planType?: string };
  customer_id?: string;
  order_id?: string;
};

type OrderEntity = {
  notes?: { userId?: string; planType?: string };
};

function addMonths(d: Date, months: number): Date {
  const next = new Date(d);
  next.setMonth(next.getMonth() + months);
  return next;
}

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

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");
    if (signature !== expectedSignature) {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body) as WebhookEvent;
    const eventType = event.event;

    // === Subscription events (monthly + yearly) ===
    if (
      eventType === "subscription.activated" ||
      eventType === "subscription.charged"
    ) {
      const sub = event.payload?.subscription?.entity;
      const userId = sub?.notes?.userId;
      const planType = (sub?.notes?.planType as "monthly" | "yearly") ?? "monthly";
      if (userId) {
        // Bump expiry by 1 month or 1 year depending on the SKU. We use
        // "now" rather than the existing expiry because mid-cycle
        // upgrades would otherwise stack incorrectly.
        const expiry =
          planType === "yearly" ? addMonths(new Date(), 12) : addMonths(new Date(), 1);

        await db
          .update(users)
          .set({
            plan: "pro",
            planType,
            planExpiry: expiry,
            razorpayCustomerId: sub?.customer_id ?? undefined,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }
    }

    if (
      eventType === "subscription.cancelled" ||
      eventType === "subscription.expired"
    ) {
      const sub = event.payload?.subscription?.entity;
      const userId = sub?.notes?.userId;
      if (userId) {
        // Don't downgrade lifetime users if a stale subscription event
        // arrives. Lifetime status takes precedence.
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        if (existing && existing.planType === "lifetime") {
          // Ignore — lifetime users keep Pro forever
        } else {
          await db
            .update(users)
            .set({ plan: "free", planType: null, updatedAt: new Date() })
            .where(eq(users.id, userId));
        }
      }
    }

    // === One-time order events (lifetime founding member) ===
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const payment = event.payload?.payment?.entity;
      const order = event.payload?.order?.entity;
      const notes = payment?.notes ?? order?.notes ?? {};
      const userId = notes.userId;
      const planType = notes.planType;
      if (userId && planType === "lifetime") {
        await db
          .update(users)
          .set({
            plan: "pro",
            planType: "lifetime",
            planExpiry: null, // Lifetime never expires
            razorpayCustomerId: payment?.customer_id ?? undefined,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("[POST /api/payments/webhook]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
