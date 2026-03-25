"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface ProGateProps {
  children: React.ReactNode;
  feature: string;
}

export function ProGate({ children, feature }: ProGateProps) {
  const { data: session } = useSession();
  const isPro = (session?.user as { plan?: string })?.plan === "pro";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isPro) return <>{children}</>;

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
      });
      const data = await res.json();
      if (data.shortUrl) {
        window.location.href = data.shortUrl;
      } else if (res.status === 503) {
        setError("Payment gateway is being set up. Please try again later.");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-primary/20 bg-pro-subtle p-8 text-center">
      <p className="text-3xl mb-3">&#x1F512;</p>
      <h3 className="text-base font-semibold text-foreground mb-1">
        {feature} is a Pro feature
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Upgrade to Pro for ₹299/month
      </p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="inline-flex px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Redirecting..." : "Upgrade to Pro \u2192"}
      </button>
      {error && (
        <p className="text-xs text-negative mt-2">{error}</p>
      )}
    </div>
  );
}
