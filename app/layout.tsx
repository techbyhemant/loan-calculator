import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Analytics from "@/components/Analytics";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  getOrganizationSchema,
  getWebsiteSchema,
  getFinancialServiceSchema,
} from "@/lib/seo/schema";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = buildMetadata({
  title: "LastEMI — Find Your Debt-Free Date",
  description:
    "India's honest debt freedom platform. Calculate part payment savings, find when you'll pay your last EMI, and plan your path to debt freedom. Free, no spam, no cold calls.",
  path: "/",
  type: "website",
  keywords: [
    "home loan calculator",
    "EMI part payment",
    "debt free calculator India",
    "SIP vs prepayment",
    "home loan tax benefit",
  ],
});

export const viewport = "width=device-width, initial-scale=1";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Schema — Organization, Website, FinancialService */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebsiteSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getFinancialServiceSchema()),
          }}
        />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <AuthProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
