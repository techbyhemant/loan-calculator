import React from "react";
import NumericInput from "@/components/ui/NumericInput";
import { CompactTabsToggle } from "@/components/ui/CompactTabsToggle";
import { useLoanCalculator } from "../context/LoanCalculatorContext";

// Piecewise-linear mapping: ticks get equal slider spacing, interpolate between.
// Slider operates on 0–1000 internally.
function amountToSlider(amount: number, ticks: number[]): number {
  if (amount <= ticks[0]) return 0;
  if (amount >= ticks[ticks.length - 1]) return 1000;
  for (let i = 1; i < ticks.length; i++) {
    if (amount <= ticks[i]) {
      const segFraction = (amount - ticks[i - 1]) / (ticks[i] - ticks[i - 1]);
      const segStart = ((i - 1) / (ticks.length - 1)) * 1000;
      const segEnd = (i / (ticks.length - 1)) * 1000;
      return segStart + segFraction * (segEnd - segStart);
    }
  }
  return 1000;
}

function sliderToAmount(slider: number, ticks: number[], step: number): number {
  if (slider <= 0) return ticks[0];
  if (slider >= 1000) return ticks[ticks.length - 1];
  const segCount = ticks.length - 1;
  const segSize = 1000 / segCount;
  const segIndex = Math.min(Math.floor(slider / segSize), segCount - 1);
  const segFraction = (slider - segIndex * segSize) / segSize;
  const raw = ticks[segIndex] + segFraction * (ticks[segIndex + 1] - ticks[segIndex]);
  return Math.round(raw / step) * step;
}

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

  const loanTypeOptions = [
    { value: "personal", label: "Personal Loan" },
    { value: "home", label: "Home Loan" },
    { value: "car", label: "Car Loan" },
  ] as const;

  return (
    <div className="w-auto mx-auto bg-card rounded-xl shadow-sm px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4">
      <h1 className="text-base sm:text-lg font-semibold text-foreground mb-2 text-center">
        Loan Details
      </h1>

      {/* Loan Type Tabs */}
      <div className="flex justify-center mb-2">
        <CompactTabsToggle
          label="Loan type"
          value={loanType}
          onValueChange={(value) => setLoanType(value as (typeof loanTypeOptions)[number]["value"])}
          options={[...loanTypeOptions]}
          className="justify-center"
        />
      </div>

      {/* Loan Amount */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-foreground"
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
            className="rounded-md border border-input px-3 py-2 text-sm w-full focus:ring-2 focus:ring-ring focus:border-ring transition-all pr-10 outline-none"
            maxLength={11}
          />
          <span className="absolute right-2 top-2.5 text-sm text-muted-foreground">
            {config.loanAmount.unit}
          </span>
        </div>
        {/* Custom Slider with tooltip — non-linear scale via ticks */}
        <div className="relative flex flex-col gap-1 mt-1">
          <input
            type="range"
            min={0}
            max={1000}
            step={1}
            aria-label="Loan Amount"
            value={amountToSlider(amount, config.loanAmount.ticks)}
            onChange={(e) => {
              setAmount(sliderToAmount(Number(e.target.value), config.loanAmount.ticks, 10000));
            }}
            className="w-full green-slider"
            style={{
              background: `linear-gradient(to right, hsl(var(--slider-fill)) 0%, hsl(var(--slider-fill)) ${amountToSlider(amount, config.loanAmount.ticks) / 10}%, hsl(var(--slider-track)) ${amountToSlider(amount, config.loanAmount.ticks) / 10}%, hsl(var(--slider-track)) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
            {config.loanAmount.ticks.map((tick) => (
              <span key={tick} className="text-xs">
                {tick === 0
                  ? "₹0"
                  : tick >= 10000000
                  ? `₹${tick / 10000000}Cr`
                  : `₹${tick / 100000}L`}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Interest Rate */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-foreground"
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
            className="rounded-md border border-input px-3 py-2 text-sm w-full focus:ring-2 focus:ring-ring focus:border-ring transition-all pr-10 outline-none"
          />
          <span className="absolute right-2 top-2.5 text-sm text-muted-foreground">
            {config.interestRate.unit}
          </span>
        </div>
        {/* Custom Slider with tooltip */}
        <div className="relative flex flex-col gap-1 mt-1">
          <input
            type="range"
            min={0}
            max={1000}
            step={1}
            aria-label="Interest Rate"
            value={amountToSlider(rate, config.interestRate.ticks)}
            onChange={(e) => setRate(
              Math.round(sliderToAmount(Number(e.target.value), config.interestRate.ticks, 0.01) * 100) / 100
            )}
            className="w-full green-slider"
            style={{
              background: `linear-gradient(to right, hsl(var(--slider-fill)) 0%, hsl(var(--slider-fill)) ${amountToSlider(rate, config.interestRate.ticks) / 10}%, hsl(var(--slider-track)) ${amountToSlider(rate, config.interestRate.ticks) / 10}%, hsl(var(--slider-track)) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
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
            className="text-sm font-medium text-foreground"
            htmlFor="tenure"
          >
            Tenure
          </label>
          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
            <button
              type="button"
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                tenureUnit === "years"
                  ? "bg-primary text-white"
                  : "text-muted-foreground"
              }`}
              onClick={() => setTenureUnit("years")}
            >
              Years
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                tenureUnit === "months"
                  ? "bg-primary text-white"
                  : "text-muted-foreground"
              }`}
              onClick={() => setTenureUnit("months")}
            >
              Months
            </button>
          </div>
        </div>
        <span className="text-xs text-muted-foreground mb-1">
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
            className="rounded-md border border-input px-3 py-2 text-sm w-full focus:ring-2 focus:ring-ring focus:border-ring transition-all pr-10 outline-none"
          />
          <span className="absolute right-2 top-2.5 text-sm text-muted-foreground">
            {tenureUnit === "years" ? config.tenure.unit : "mo"}
          </span>
        </div>
        <div className="relative flex flex-col gap-1 mt-1">
          <input
            type="range"
            min={0}
            max={1000}
            step={1}
            aria-label="Loan Tenure"
            value={amountToSlider(
              tenure,
              tenureUnit === "years"
                ? config.tenure.ticks
                : config.tenure.ticks.map((t) => t * 12)
            )}
            onChange={(e) => {
              const ticks = tenureUnit === "years"
                ? config.tenure.ticks
                : config.tenure.ticks.map((t) => t * 12);
              handleTenureSlider(Math.round(sliderToAmount(Number(e.target.value), ticks, 1)));
            }}
            className="w-full green-slider"
            style={{
              background: (() => {
                const ticks = tenureUnit === "years"
                  ? config.tenure.ticks
                  : config.tenure.ticks.map((t) => t * 12);
                const pct = amountToSlider(tenure, ticks) / 10;
                return `linear-gradient(to right, hsl(var(--slider-fill)) 0%, hsl(var(--slider-fill)) ${pct}%, hsl(var(--slider-track)) ${pct}%, hsl(var(--slider-track)) 100%)`;
              })(),
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
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
          className="text-sm font-medium text-foreground"
          htmlFor="emi-start"
        >
          EMI Start Date
        </label>
        <input
          id="emi-start"
          type="month"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border border-input px-3 py-2 text-sm w-full focus:ring-2 focus:ring-ring focus:border-ring transition-all outline-none"
          min="2000-01"
          max="2100-12"
        />
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
        {[
          "No phone number required",
          "No spam calls, ever",
          "No lead generation",
        ].map((text) => (
          <div
            key={text}
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            <span className="text-positive font-medium">✓</span>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
