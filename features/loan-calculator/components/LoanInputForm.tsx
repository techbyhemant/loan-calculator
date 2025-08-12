import React from "react";
import NumericInput from "@/components/ui/NumericInput";
import { useLoanCalculator } from "../context/LoanCalculatorContext";

export function LoanInputForm() {
  const {
    loanType,
    setLoanType,
    amount,
    setAmount,
    rate,
    setRate,
    tenure,
    setTenure,
    tenureUnit,
    setTenureUnit,
    startDate,
    setStartDate,
    handleTenureSlider,
    config,
  } = useLoanCalculator();

  return (
    <div className="w-auto mx-auto bg-white rounded-xl shadow-sm px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4">
      <h1 className="text-base sm:text-lg font-semibold text-[#1E2A38] mb-2 text-center">
        Loan Details
      </h1>

      {/* Loan Type Tabs */}
      <div className="flex justify-center mb-2">
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          {(["personal", "home", "car"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`px-3 sm:px-4 py-1.5 rounded-md font-medium text-xs sm:text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                loanType === type
                  ? "bg-emerald-500 text-white shadow"
                  : "text-gray-700 bg-transparent"
              }`}
              onClick={() => setLoanType(type)}
              aria-pressed={loanType === type}
            >
              {type === "personal"
                ? "Personal Loan"
                : type === "home"
                ? "Home Loan"
                : "Car Loan"}
            </button>
          ))}
        </div>
      </div>

      {/* Loan Amount */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-[#374151]"
          htmlFor="loan-amount"
        >
          Loan Amount
        </label>
        <div className="relative">
          <NumericInput
            id="loan-amount"
            value={amount}
            onChange={(val) => {
              if (val === "") {
                setAmount(config.loanAmount.min);
              } else {
                setAmount(val);
              }
            }}
            alwaysFormat={true}
            placeholder="Loan Amount"
            min={config.loanAmount.min}
            max={config.loanAmount.max}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all pr-10 outline-none border-[1px]"
            maxLength={11}
          />
          <span className="absolute right-2 top-2.5 text-sm text-gray-400">
            {config.loanAmount.unit}
          </span>
        </div>
        {/* Custom Slider with tooltip */}
        <div className="relative flex flex-col gap-1 mt-1">
          <input
            type="range"
            min={config.loanAmount.min}
            max={config.loanAmount.max}
            step={10000}
            value={amount}
            onChange={(e) => {
              setAmount(Number(e.target.value));
            }}
            className="w-full h-2 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 accent-emerald-500 slider-thumb"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                ((amount - config.loanAmount.min) /
                  (config.loanAmount.max - config.loanAmount.min)) *
                100
              }%, #e5e7eb ${
                ((amount - config.loanAmount.min) /
                  (config.loanAmount.max - config.loanAmount.min)) *
                100
              }%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
            {config.loanAmount.ticks.map((tick) => (
              <span key={tick} className="text-xs">
                {tick === 0
                  ? "₹0"
                  : tick >= 10000000
                  ? `₹${tick / 10000000}Cr`
                  : `₹${tick / 10000000}L`}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Interest Rate */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-[#374151]"
          htmlFor="interest-rate"
        >
          Interest Rate
        </label>
        <div className="relative">
          <NumericInput
            id="interest-rate"
            value={rate}
            onChange={(val) => {
              if (val === "") {
                setRate(config.interestRate.min);
              } else {
                let num = Number(val);
                if (num > config.interestRate.max)
                  num = config.interestRate.max;
                if (num < config.interestRate.min)
                  num = config.interestRate.min;
                setRate(num);
              }
            }}
            alwaysFormat={true}
            placeholder="Interest Rate"
            min={config.interestRate.min}
            max={config.interestRate.max}
            step={0.01}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all pr-10 outline-none border-[1px]"
          />
          <span className="absolute right-2 top-2.5 text-sm text-gray-400">
            {config.interestRate.unit}
          </span>
        </div>
        {/* Custom Slider with tooltip */}
        <div className="relative flex flex-col gap-1 mt-1">
          <input
            type="range"
            min={config.interestRate.min}
            max={config.interestRate.max}
            step={0.01}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full h-2 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 accent-emerald-500 slider-thumb"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                ((rate - config.interestRate.min) /
                  (config.interestRate.max - config.interestRate.min)) *
                100
              }%, #e5e7eb ${
                ((rate - config.interestRate.min) /
                  (config.interestRate.max - config.interestRate.min)) *
                100
              }%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
            {config.interestRate.ticks.map((tick) => (
              <span key={tick} className="text-xs">
                {tick}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Loan Tenure */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            className="text-sm font-medium text-[#374151]"
            htmlFor="tenure"
          >
            Tenure
          </label>
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
            <button
              type="button"
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                tenureUnit === "years"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-600"
              }`}
              onClick={() => setTenureUnit("years")}
            >
              Years
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                tenureUnit === "months"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-600"
              }`}
              onClick={() => setTenureUnit("months")}
            >
              Months
            </button>
          </div>
        </div>
        <span className="text-xs text-gray-500 mb-1">
          Switch to months for more granular control
        </span>
        <div className="relative">
          <NumericInput
            id="tenure"
            value={tenure}
            onChange={(val) => {
              if (val === "") {
                setTenure(config.tenure.min);
              } else {
                let num = Number(val);
                if (tenureUnit === "years") {
                  if (num > config.tenure.max) num = config.tenure.max;
                  if (num < config.tenure.min) num = config.tenure.min;
                } else {
                  if (num > config.tenure.max * 12)
                    num = config.tenure.max * 12;
                  if (num < config.tenure.min * 12)
                    num = config.tenure.min * 12;
                }
                setTenure(num);
              }
            }}
            alwaysFormat={true}
            placeholder={tenureUnit === "years" ? "Years" : "Months"}
            min={
              tenureUnit === "years"
                ? config.tenure.min
                : config.tenure.min * 12
            }
            max={
              tenureUnit === "years"
                ? config.tenure.max
                : config.tenure.max * 12
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all pr-10 outline-none border-[1px]"
          />
          <span className="absolute right-2 top-2.5 text-sm text-gray-400">
            {tenureUnit === "years" ? config.tenure.unit : "mo"}
          </span>
        </div>
        <div className="relative flex flex-col gap-1 mt-1">
          <input
            type="range"
            min={
              tenureUnit === "years"
                ? config.tenure.min
                : config.tenure.min * 12
            }
            max={
              tenureUnit === "years"
                ? config.tenure.max
                : config.tenure.max * 12
            }
            step={1}
            value={tenure}
            onChange={(e) => handleTenureSlider(Number(e.target.value))}
            className="w-full h-2 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 accent-emerald-500 slider-thumb"
            style={{
              background:
                tenureUnit === "years"
                  ? `linear-gradient(to right, #10b981 0%, #10b981 ${
                      ((tenure - config.tenure.min) /
                        (config.tenure.max - config.tenure.min)) *
                      100
                    }%, #e5e7eb ${
                      ((tenure - config.tenure.min) /
                        (config.tenure.max - config.tenure.min)) *
                      100
                    }%, #e5e7eb 100%)`
                  : `linear-gradient(to right, #10b981 0%, #10b981 ${
                      ((tenure - config.tenure.min * 12) /
                        (config.tenure.max * 12 - config.tenure.min * 12)) *
                      100
                    }%, #e5e7eb ${
                      ((tenure - config.tenure.min * 12) /
                        (config.tenure.max * 12 - config.tenure.min * 12)) *
                      100
                    }%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
            {tenureUnit === "years"
              ? config.tenure.ticks.map((tick) => (
                  <span key={tick} className="text-xs">
                    {tick}
                  </span>
                ))
              : [
                  config.tenure.min * 12,
                  Math.round((config.tenure.max * 12) / 4),
                  Math.round((config.tenure.max * 12) / 2),
                  Math.round(config.tenure.max * 12 * 0.75),
                  config.tenure.max * 12,
                ].map((tick) => (
                  <span key={tick} className="text-xs">
                    {tick}
                  </span>
                ))}
          </div>
        </div>
      </div>

      {/* EMI Start Date */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-[#374151]"
          htmlFor="emi-start"
        >
          EMI Start Date
        </label>
        <input
          id="emi-start"
          type="month"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none border-[1px]"
          min="2000-01"
          max="2100-12"
        />
      </div>
    </div>
  );
}
