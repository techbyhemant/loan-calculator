"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trpcReact } from "@/lib/trpc/hooks";
import { PlanBadge } from "../../page";

export const dynamic = "force-dynamic";

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.userId as string;
  const utils = trpcReact.useUtils();

  const { data: user, isLoading } = trpcReact.admin.getUser.useQuery(
    { id: userId },
    { enabled: !!userId },
  );

  // Local form state mirrors the user's current plan so the admin can
  // edit and save in one shot.
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [planType, setPlanType] = useState<"monthly" | "yearly" | "lifetime">(
    "monthly",
  );
  const [planExpiry, setPlanExpiry] = useState<string>("");
  const [reason, setReason] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Hydrate form when user loads.
  useEffect(() => {
    if (!user) return;
    setPlan(user.plan === "pro" ? "pro" : "free");
    if (user.planType === "monthly" || user.planType === "yearly" || user.planType === "lifetime") {
      setPlanType(user.planType);
    } else {
      setPlanType("monthly");
    }
    setPlanExpiry(
      user.planExpiry ? user.planExpiry.slice(0, 10) : "",
    );
  }, [user]);

  const setUserPlan = trpcReact.admin.setUserPlan.useMutation({
    onSuccess: () => {
      setSavedAt(new Date());
      utils.admin.getUser.invalidate({ id: userId });
      utils.admin.listUsers.invalidate();
      utils.admin.stats.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-40 bg-card border border-border rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <p className="text-sm text-muted-foreground">User not found.</p>
        <Link
          href="/admin/users"
          className="text-sm text-primary hover:underline mt-3 inline-block"
        >
          ← Back to users
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    setSavedAt(null);
    setUserPlan.mutate({
      userId: user.id,
      plan,
      planType: plan === "free" ? null : planType,
      planExpiry:
        plan === "free" || planType === "lifetime"
          ? null
          : planExpiry
            ? new Date(planExpiry).toISOString()
            : null,
      reason: reason || undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/admin/users"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Users
      </Link>

      {/* Identity card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {user.name ?? user.email}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <PlanBadge plan={user.plan} planType={user.planType} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Joined</p>
            <p className="text-foreground">
              {new Date(user.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Updated</p>
            <p className="text-foreground">
              {new Date(user.updatedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Plan expiry</p>
            <p className="text-foreground">
              {user.planType === "lifetime"
                ? "Never"
                : user.planExpiry
                  ? new Date(user.planExpiry).toLocaleDateString("en-IN")
                  : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Razorpay ID</p>
            <p className="text-foreground text-xs break-all">
              {user.razorpayCustomerId ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Plan override form */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-base font-semibold text-foreground mb-1">
          Override plan
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          For support cases — manual activations after a missed webhook,
          revocations after refunds, or comp lifetimes.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Plan
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as "free" | "pro")}
              className="w-full sm:w-48 rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          {plan === "pro" && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Cadence
                </label>
                <select
                  value={planType}
                  onChange={(e) =>
                    setPlanType(
                      e.target.value as "monthly" | "yearly" | "lifetime",
                    )
                  }
                  className="w-full sm:w-48 rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>

              {planType !== "lifetime" && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Expiry date
                  </label>
                  <input
                    type="date"
                    value={planExpiry}
                    onChange={(e) => setPlanExpiry(e.target.value)}
                    className="w-full sm:w-48 rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Pro access ends at midnight on this date.
                  </p>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Reason / note (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Razorpay webhook didn't fire — manual activation"
              maxLength={500}
              className="w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={setUserPlan.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {setUserPlan.isPending ? "Saving…" : "Save override"}
            </button>
            {savedAt && (
              <span className="text-xs text-positive">
                Saved {savedAt.toLocaleTimeString("en-IN")}
              </span>
            )}
            {setUserPlan.error && (
              <span className="text-xs text-negative">
                {setUserPlan.error.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
