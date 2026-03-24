"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { TRPCProvider } from "@/lib/trpc/provider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "\u{1F4CA}" },
  { href: "/dashboard/loans", label: "My Loans", icon: "\u{1F4B3}" },
  { href: "/dashboard/credit-cards", label: "Credit Cards", icon: "\u{1F4B8}" },
  { href: "/dashboard/planner", label: "Payoff Planner", icon: "\u{1F3AF}", pro: true },
  { href: "/dashboard/consolidation", label: "Consolidation", icon: "\u{1F504}", pro: true },
  { href: "/dashboard/tax", label: "Tax Benefits", icon: "\u{1F4B0}", pro: true },
  { href: "/dashboard/challenge", label: "Debt-Free Challenge", icon: "\u{1F3C6}" },
];

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userPlan: "free" | "pro";
}

export function DashboardShell({
  children,
  userName,
  userEmail,
  userPlan,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
            {userName ? userName[0].toUpperCase() : userEmail[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{userName || "User"}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
            userPlan === "pro" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
          }`}>
            {userPlan === "pro" ? "PRO" : "FREE"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href) ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
            {item.pro && (
              <span className="ml-auto text-[10px] font-semibold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                PRO
              </span>
            )}
          </Link>
        ))}
      </nav>

    </div>
  );

  return (
    <TRPCProvider>
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 border-r border-gray-200 bg-white shrink-0">
          {sidebarContent}
        </aside>

        {/* Mobile: floating menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-4 left-4 z-40 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
              {sidebarContent}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 bg-gray-50">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </TRPCProvider>
  );
}
