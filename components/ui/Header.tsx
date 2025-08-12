import React from "react";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                EMIPartPay
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Smart EMI calculator with part payment strategies
              </p>
            </div>
          </div>

          {/* Optional: Navigation or Action Items */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-xs sm:text-sm text-gray-500">
              Optimize Your Loan Payments
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
