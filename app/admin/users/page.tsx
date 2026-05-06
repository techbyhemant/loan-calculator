"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trpcReact } from "@/lib/trpc/hooks";
import { PlanBadge } from "../page";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "pro">("all");
  const [planTypeFilter, setPlanTypeFilter] = useState<
    "any" | "monthly" | "yearly" | "lifetime"
  >("any");
  const [page, setPage] = useState(0);

  // Tiny debounce so we don't fire a query on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = trpcReact.admin.listUsers.useQuery({
    search: debouncedSearch || undefined,
    plan: planFilter,
    planType: planTypeFilter === "any" ? undefined : planTypeFilter,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold text-foreground">Users</h1>
        <p className="text-xs text-muted-foreground">
          {total > 0
            ? `${total.toLocaleString("en-IN")} total · page ${page + 1} of ${pageCount}`
            : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-3 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search by email or name…"
          className="flex-1 min-w-[200px] rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
        />
        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value as "all" | "free" | "pro");
            setPage(0);
          }}
          className="rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
        >
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
        <select
          value={planTypeFilter}
          onChange={(e) => {
            setPlanTypeFilter(
              e.target.value as "any" | "monthly" | "yearly" | "lifetime",
            );
            setPage(0);
          }}
          className="rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
        >
          <option value="any">Any cadence</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="lifetime">Lifetime</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background text-left">
                <th className="px-4 py-2.5 font-medium text-foreground">Email</th>
                <th className="px-4 py-2.5 font-medium text-foreground">Plan</th>
                <th className="px-4 py-2.5 font-medium text-foreground">Expiry</th>
                <th className="px-4 py-2.5 font-medium text-foreground">Joined</th>
                <th className="px-4 py-2.5 font-medium text-foreground" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading &&
                (data?.users ?? []).map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-foreground">{u.email}</div>
                      {u.name && (
                        <div className="text-xs text-muted-foreground">{u.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <PlanBadge plan={u.plan} planType={u.planType} />
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {u.planType === "lifetime"
                        ? "—"
                        : u.planExpiry
                          ? new Date(u.planExpiry).toLocaleDateString("en-IN")
                          : "—"}
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
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              {!isLoading && (data?.users ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-md border border-border bg-card text-foreground disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-muted-foreground">
            Page {page + 1} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="px-3 py-1.5 rounded-md border border-border bg-card text-foreground disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

