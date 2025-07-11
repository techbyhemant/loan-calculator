"use client";
import { LoanCalculator } from "@/features/loan-calculator";
import { ok } from "assert";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <LoanCalculator />
    </main>
  );
}
