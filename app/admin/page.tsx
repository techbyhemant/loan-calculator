"use client";

import Link from "next/link";
import { trpcReact } from "@/lib/trpc/hooks";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = trpcReact.admin.stats.useQuery();
  const { data: recent } = trpcReact.admin.recentSignups.useQuery({ limit: 10 });

  if (isLoading || !stats) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-card border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Overview</h1>

      {/* Top-line stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total users" value={stats.totalUsers} />
        <StatCard label="New (7 days)" value={stats.signupsLast7Days} />
        <StatCard label="Free" value={stats.freeUsers} />
        <StatCard label="Monthly Pro" value={stats.monthlyUsers} />
        <StatCard label="Yearly Pro" value={stats.yearlyUsers} />
        <StatCard label="Lifetime" value={stats.lifetimeUsers} />
      </div>

      {/* Founding member campaign card */}
      <div className="bg-card border border-positive/30 rounded-xl p-5">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-base font-semibold text-foreground">
            Founding Member Lifetime
          </h2>
          <span className="text-xs text-muted-foreground">
            Ends {new Date(stats.lifetime.endsAt).toLocaleDateString("en-IN")}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Sold</p>
            <p className="text-lg font-bold text-foreground">
              {stats.lifetime.taken}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-lg font-bold text-positive">
              {stats.lifetime.spotsRemaining}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total cap</p>
            <p className="text-lg font-bold text-foreground">
              {stats.lifetime.totalSpots}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-positive"
            style={{
              width: `${Math.min(
                100,
                (stats.lifetime.taken / stats.lifetime.totalSpots) * 100,
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Recent signups */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Recent signups
          </h2>
          <Link
            href="/admin/users"
            className="text-xs text-primary hover:underline"
          >
            See all users →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background text-left">
                <th className="px-4 py-2.5 font-medium text-foreground">
                  Email
                </th>
                <th className="px-4 py-2.5 font-medium text-foreground">
                  Plan
                </th>
                <th className="px-4 py-2.5 font-medium text-foreground">
                  Joined
                </th>
                <th className="px-4 py-2.5 font-medium text-foreground" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(recent ?? []).map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2.5 text-foreground">
                    <span className="font-medium">{u.email}</span>
                    {u.name && (
                      <span className="text-muted-foreground"> · {u.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <PlanBadge plan={u.plan} planType={u.planType} />
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {(recent ?? []).length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                    colSpan={4}
                  >
                    No signups yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function PlanBadge({
  plan,
  planType,
}: {
  plan: string;
  planType: string | null;
}) {
  if (plan !== "pro") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
        Free
      </span>
    );
  }
  const label =
    planType === "lifetime"
      ? "Lifetime"
      : planType === "yearly"
        ? "Pro · Yearly"
        : planType === "monthly"
          ? "Pro · Monthly"
          : "Pro";
  const cls =
    planType === "lifetime"
      ? "bg-positive/10 text-positive"
      : "bg-primary/10 text-primary";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {label}
    </span>
  );
}
