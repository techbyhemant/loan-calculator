"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface ProGateProps {
  children: React.ReactNode;
  feature: string;
}

export function ProGate({ children, feature }: ProGateProps) {
  const { data: session } = useSession();
  const isPro = (session?.user as { plan?: string })?.plan === "pro";
  if (isPro) return <>{children}</>;
  return (
    <div className="rounded-xl border border-dashed border-purple-200 bg-purple-50 p-8 text-center">
      <p className="text-3xl mb-3">&#x1F512;</p>
      <h3 className="text-base font-semibold text-gray-800 mb-1">
        {feature} is a Pro feature
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Upgrade to Pro for &#x20B9;299/month
      </p>
      <Link
        href="/pricing"
        className="inline-flex px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
      >
        Upgrade to Pro &rarr;
      </Link>
    </div>
  );
}
