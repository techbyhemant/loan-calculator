import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import type { AmortizationRow } from "@/lib/utils";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip
);

export interface YearlyBreakdownBarProps {
  schedule: AmortizationRow[];
}

// Helper function to format currency values to shorthand
const formatCurrencyShort = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  } else {
    return `₹${value.toLocaleString("en-IN")}`;
  }
};

// Helper function for full currency formatting in tooltips
const formatCurrencyFull = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Crores`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} Lakhs`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)} Thousands`;
  } else {
    return `₹${value.toLocaleString("en-IN")}`;
  }
};

export function YearlyBreakdownBar({ schedule }: YearlyBreakdownBarProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Early return if no schedule data
  if (!schedule || schedule.length === 0) {
    return (
      <div className="w-full h-72 sm:h-96 flex items-center justify-center text-gray-500">
        No data available for chart
      </div>
    );
  }

  // Group by year
  const years = Array.from(new Set(schedule.map((r) => r.year)));
  const principalPerYear = years.map((y) =>
    schedule
      .filter((r) => r.year === y)
      .reduce((sum, r) => sum + r.principal, 0)
  );
  const interestPerYear = years.map((y) =>
    schedule.filter((r) => r.year === y).reduce((sum, r) => sum + r.interest, 0)
  );
  const balancePerYear = years.map((y) => {
    const last = schedule.filter((r) => r.year === y).at(-1);
    return last ? last.balance : 0;
  });

  const data: ChartData<"bar"> = {
    labels: years.map((y, i) => `Y${i + 1}`),
    datasets: [
      {
        // @ts-expect-error: Mixed chart types (bar + line) are not supported by ChartData<'bar'>
        type: "line" as const,
        label: "Balance",
        data: balancePerYear,
        borderColor: "rgb(220, 38, 38)",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        yAxisID: "y1",
        tension: 0.4,
        pointRadius: isMobile ? 5 : 6,
        borderWidth: isMobile ? 3 : 4,
        borderDash: [6, 4],
        fill: false,
        order: 1,
        pointBackgroundColor: "rgb(220, 38, 38)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointStyle: "circle",
      },
      {
        type: "bar" as const,
        label: "Principal",
        data: principalPerYear,
        backgroundColor: "rgba(16, 185, 129, 0.9)",
        borderRadius: 4,
        stack: "stack1",
        barPercentage: isMobile ? 0.8 : 0.6,
        categoryPercentage: isMobile ? 0.9 : 0.8,
        order: 2,
        pointStyle: "circle",
      },
      {
        type: "bar" as const,
        label: "Interest",
        data: interestPerYear,
        backgroundColor: "rgba(251, 146, 60, 0.9)",
        borderRadius: 4,
        stack: "stack1",
        barPercentage: isMobile ? 0.8 : 0.6,
        categoryPercentage: isMobile ? 0.9 : 0.8,
        order: 3,
        pointStyle: "circle",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        position: "top",
        align: "start",
        labels: {
          color: "#374151",
          font: {
            size: isMobile ? 11 : 13,
            weight: 500,
          },
          padding: isMobile ? 12 : 16,
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: isMobile ? 12 : 15,
          boxHeight: isMobile ? 12 : 15,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#F9FAFB",
        bodyColor: "#F3F4F6",
        borderColor: "rgba(156, 163, 175, 0.2)",
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          size: isMobile ? 12 : 14,
          weight: 500,
        },
        bodyFont: {
          size: isMobile ? 11 : 13,
        },
        padding: isMobile ? 12 : 16,
        callbacks: {
          title: function (context: TooltipItem<"bar">[]) {
            return `Year ${context[0]?.label?.replace("Y", "")} Summary`;
          },
          label: function (context: TooltipItem<"bar">) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            if (value !== null) {
              return `${label}: ${formatCurrencyFull(value)}`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: isMobile ? 10 : 11,
            weight: 400,
          },
          maxTicksLimit: isMobile ? 4 : 6,
          callback: function (value: string | number) {
            if (typeof value === "number") {
              return formatCurrencyShort(value);
            }
            return value;
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
          lineWidth: 1,
        },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
          color: "rgba(156, 163, 175, 0.1)",
        },
        title: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: isMobile ? 10 : 11,
            weight: 400,
          },
          maxTicksLimit: isMobile ? 4 : 6,
          callback: function (value: string | number) {
            if (typeof value === "number") {
              return formatCurrencyShort(value);
            }
            return value;
          },
        },
      },
      x: {
        ticks: {
          color: "#6B7280",
          font: {
            size: isMobile ? 10 : 11,
            weight: 400,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div
        className="w-full h-72 sm:h-96"
        role="img"
        aria-label="Yearly principal, interest, and balance chart"
      >
        {/* Chart.js types do not support mixed bar/line datasets for <Bar />, so we cast to any. */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Bar data={data as any} options={options as any} />
      </div>
    </div>
  );
}
