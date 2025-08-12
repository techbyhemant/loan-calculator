import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import SEOJsonLd from "../components/SEOJsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EMIPartPay - Smart EMI Calculator with Part Payment Strategies",
  description:
    "Calculate your loan EMI, create amortization schedules, and optimize your loan payments with part payment strategies. Smart loan calculator for home loans, personal loans, and more.",
  keywords: [
    "emi calculator",
    "home loan emi calculator",
    "personal loan emi calculator",
    "car loan emi calculator",
    "emi calculator india",
    "loan emi calculator",
    "emi calculator with part payment",
    "loan prepayment calculator",
    "home loan prepayment calculator",
    "emi reduction calculator",
    "tenure reduction calculator",
    "amortization schedule",
    "amortization table pdf",
    "principal prepayment calculator",
  ],
  applicationName: "EMIPartPay",
  authors: [{ name: "EMIPartPay" }],
  category: "Finance",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "EMIPartPay – EMI Calculator with Part Payment",
    description:
      "Reduce EMI or tenure with part payments. See instant savings with a clear amortization schedule.",
    url: "/",
    siteName: "EMIPartPay",
    images: [{ url: "/file.svg", width: 1200, height: 630, alt: "EMIPartPay" }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "EMIPartPay – EMI Calculator with Part Payment",
    description:
      "Reduce EMI or tenure with part payments. See instant savings with a clear amortization schedule.",
    images: ["/file.svg"],
  },
};

export const viewport = "width=device-width, initial-scale=1";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        {/* Structured data for richer search appearance */}
        <SEOJsonLd />
        {children}
      </body>
    </html>
  );
}
