import React from "react";
import { PaymentBreakdownPie } from "../charts/PaymentBreakdownPie";
import { useLoanCalculator } from "../context/LoanCalculatorContext";

export function LoanSummary() {
  const { amount, result, formatINR } = useLoanCalculator();

  return (
    <div className="flex flex-col gap-4">
      {/* Pie Chart at top */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
        <h2 className="text-base sm:text-lg font-semibold text-[#1E2A38] mb-2">
          Break-up of Total Payment
        </h2>
        <div className="w-full h-full flex items-center justify-center">
          <PaymentBreakdownPie
            principal={amount}
            interest={result.totalInterest}
          />
        </div>
      </div>

      {/* Summary cards stacked below */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center min-w-[260px] flex-1">
          <div className="text-sm text-[#6B7280] mb-1">Loan EMI</div>
          <div className="text-base sm:text-lg font-semibold text-[#1E2A38]">
            {formatINR(result.emi)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center min-w-[260px] flex-1">
          <div className="text-sm text-[#6B7280] mb-1">
            Total Interest Payable
          </div>
          <div className="text-base sm:text-lg font-semibold text-[#F43F5E]">
            {formatINR(result.totalInterest)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center min-w-[260px] flex-1">
          <div className="text-sm text-[#6B7280] mb-1">
            Total Payment (Principal + Interest)
          </div>
          <div className="text-base sm:text-lg font-semibold text-[#10B981]">
            {formatINR(result.totalPayment)}
          </div>
        </div>
      </div>
    </div>
  );
}
