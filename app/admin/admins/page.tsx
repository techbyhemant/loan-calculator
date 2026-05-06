"use client";

import { useState } from "react";
import Link from "next/link";
import { trpcReact } from "@/lib/trpc/hooks";

export const dynamic = "force-dynamic";

export default function AdminAdminsPage() {
  const utils = trpcReact.useUtils();

  const { data: admins, isLoading } = trpcReact.admin.listAdmins.useQuery();
  const [search, setSearch] = useState("");
  const [confirmingDemote, setConfirmingDemote] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Search the user table to promote someone to admin. Uses the existing
  // listUsers query — only fires when the user types something.
  const { data: searchResults, isLoading: searchLoading } =
    trpcReact.admin.listUsers.useQuery(
      { search, plan: "all", limit: 10, offset: 0 },
      { enabled: search.trim().length >= 2 },
    );

  const setAdmin = trpcReact.admin.setAdmin.useMutation({
    onSuccess: () => {
      setError("");
      setConfirmingDemote(null);
      utils.admin.listAdmins.invalidate();
      utils.admin.listUsers.invalidate();
      setSearch("");
    },
    onError: (err) => setError(err.message),
  });

  const promote = (userId: string) => {
    setError("");
    setAdmin.mutate({ userId, isAdmin: true });
  };

  const demote = (userId: string) => {
    setError("");
    setAdmin.mutate({ userId, isAdmin: false });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold text-foreground">Admins</h1>
        <Link
          href="/admin/users"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← All users
        </Link>
      </div>

      {/* Promote a user */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-base font-semibold text-foreground mb-1">
          Promote a user
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Search by email or name. Click Promote to grant admin access. The
          user has to sign out and back in for the new permission to take
          effect.
        </p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type at least 2 characters..."
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none mb-3"
        />
        {search.trim().length >= 2 && (
          <div className="border border-border rounded-lg overflow-hidden">
            {searchLoading && (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                Searching…
              </p>
            )}
            {!searchLoading && (searchResults?.users ?? []).length === 0 && (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                No matches.
              </p>
            )}
            {!searchLoading &&
              (searchResults?.users ?? []).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between px-4 py-2.5 border-b border-border last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground truncate">
                      {u.email}
                    </div>
                    {u.name && (
                      <div className="text-xs text-muted-foreground truncate">
                        {u.name}
                      </div>
                    )}
                  </div>
                  {u.isAdmin ? (
                    <span className="text-xs text-muted-foreground">
                      Already admin
                    </span>
                  ) : (
                    <button
                      onClick={() => promote(u.id)}
                      disabled={setAdmin.isPending}
                      className="text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      Promote
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Current admins */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Current admins
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {(admins?.length ?? 0)} {admins?.length === 1 ? "admin" : "admins"}
          </p>
        </div>
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background text-left">
                <th className="px-4 py-2.5 font-medium text-foreground">
                  Email
                </th>
                <th className="px-4 py-2.5 font-medium text-foreground">
                  Joined
                </th>
                <th className="px-4 py-2.5 font-medium text-foreground" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(admins ?? []).map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-foreground">{u.email}</div>
                    {u.name && (
                      <div className="text-xs text-muted-foreground">
                        {u.name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {confirmingDemote === u.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          Are you sure?
                        </span>
                        <button
                          onClick={() => demote(u.id)}
                          disabled={setAdmin.isPending}
                          className="text-xs font-medium px-3 py-1 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                        >
                          Yes, revoke
                        </button>
                        <button
                          onClick={() => setConfirmingDemote(null)}
                          className="text-xs font-medium px-3 py-1 rounded-md bg-muted text-foreground hover:bg-accent"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingDemote(u.id)}
                        className="text-xs font-medium text-muted-foreground hover:text-destructive"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(admins ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                  >
                    No admins yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {error && (
        <p className="text-sm text-negative">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Note: promoted users have to sign out and back in for the new
        permission to appear in their session JWT. Bootstrap admins
        (those listed in <code>ADMIN_EMAILS</code>) cannot be revoked
        from this UI alone — remove them from the env var first, then
        revoke here.
      </p>
    </div>
  );
}
