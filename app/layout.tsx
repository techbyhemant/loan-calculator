import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  keywords:
    "EMI calculator, loan calculator, part payment, amortization schedule, home loan, personal loan, loan optimization",
  authors: [{ name: "EMIPartPay" }],
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
        {children}
      </body>
    </html>
  );
}
