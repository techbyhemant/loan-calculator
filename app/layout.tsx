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
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#4F46E5" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0F1117" media="(prefers-color-scheme: dark)" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){d.classList.add('dark')}else{d.classList.remove('dark')}}catch(e){}})();
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
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
