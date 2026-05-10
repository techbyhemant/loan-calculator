// Loan type slider configuration for easy maintenance
export type LoanType = "home" | "personal" | "car" | "gold";

export interface LoanSliderConfig {
  label: string;
  min: number;
  max: number;
  default: number;
  ticks: number[];
  unit: string;
}

export interface LoanTypeConfig {
  loanAmount: LoanSliderConfig;
  interestRate: LoanSliderConfig;
  tenure: LoanSliderConfig;
}

export const loanTypeConfigs: Record<LoanType, LoanTypeConfig> = {
  home: {
    loanAmount: {
      label: "Loan Amount",
      min: 0,
      max: 200000000, // 20 Cr
      default: 7500000, // 75L
      ticks: [0, 2500000, 5000000, 10000000, 50000000, 100000000, 200000000],
      unit: "₹",
    },
    interestRate: {
      label: "Interest Rate",
      min: 0,
      max: 15,
      default: 8.5,
      ticks: [0, 5, 10, 15],
      unit: "%",
    },
    tenure: {
      label: "Tenure",
      min: 1,
      max: 30,
      default: 20,
      ticks: [1, 5, 10, 15, 20, 25, 30],
      unit: "yrs",
    },
  },
  personal: {
    loanAmount: {
      label: "Loan Amount",
      min: 0,
      max: 10000000, // 1 Cr
      default: 1000000, // 10L
      ticks: [0, 1000000, 2500000, 5000000, 10000000],
      unit: "₹",
    },
    interestRate: {
      label: "Interest Rate",
      min: 0,
      max: 40,
      default: 14,
      ticks: [0, 10, 20, 30, 40],
      unit: "%",
    },
    tenure: {
      label: "Tenure",
      min: 1,
      max: 10,
      default: 5,
      ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      unit: "yrs",
    },
  },
  car: {
    loanAmount: {
      label: "Loan Amount",
      min: 0,
      max: 50000000, // 5 Cr
      default: 1200000, // 12L
      ticks: [0, 10000000, 20000000, 30000000, 50000000],
      unit: "₹",
    },
    interestRate: {
      label: "Interest Rate",
      min: 0,
      max: 20,
      default: 9,
      ticks: [0, 5, 10, 15, 20],
      unit: "%",
    },
    tenure: {
      label: "Tenure",
      min: 1,
      max: 10,
      default: 7,
      ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      unit: "yrs",
    },
  },
  // Gold loans are short-tenure (months, not years) and rate ranges
  // span PSU banks (8-10%) through NBFCs (12-18%). Defaults match the
  // sample table on /calculators/gold-loan-emi (₹5L @ 12% for 1 year).
  gold: {
    loanAmount: {
      label: "Loan Amount",
      min: 0,
      max: 5000000, // 50L (RBI 75% LTV cap on ~67L of gold)
      default: 500000, // 5L
      ticks: [0, 100000, 500000, 1000000, 2500000, 5000000],
      unit: "₹",
    },
    interestRate: {
      label: "Interest Rate",
      min: 0,
      max: 25,
      default: 12,
      ticks: [0, 5, 10, 15, 20, 25],
      unit: "%",
    },
    tenure: {
      label: "Tenure",
      min: 1,
      max: 5,
      default: 1,
      ticks: [1, 2, 3, 4, 5],
      unit: "yrs",
    },
  },
};
