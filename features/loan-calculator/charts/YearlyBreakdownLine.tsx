import React from "react";
import { Line } from "react-chartjs-2";
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
import type { ChartData, ChartOptions, TooltipItem, FontSpec } from "chart.js";
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

export function YearlyBreakdownLine({ schedule }: YearlyBreakdownBarProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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

  const data: ChartData<"line"> = {
    labels: years.map((y, i) => `Year ${i + 1}`),
    datasets: [
      {
        label: "Principal",
        data: principalPerYear,
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        pointRadius: isMobile ? 3 : 4,
        pointBackgroundColor: "#10B981",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        borderWidth: isMobile ? 2 : 3,
        fill: false,
      },
      {
        label: "Interest",
        data: interestPerYear,
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        pointRadius: isMobile ? 3 : 4,
        pointBackgroundColor: "#F59E0B",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        borderWidth: isMobile ? 2 : 3,
        fill: false,
      },
      {
        label: "Balance",
        data: balancePerYear,
        borderColor: "#DC2626",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        tension: 0.4,
        pointRadius: isMobile ? 3 : 4,
        pointBackgroundColor: "#DC2626",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        borderWidth: isMobile ? 2 : 3,
        fill: false,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
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
          color: "#111827",
          font: {
            size: isMobile ? 12 : 14,
            weight: "600" as FontSpec["weight"],
          },
          padding: isMobile ? 16 : 20,
          usePointStyle: true,
          pointStyle: "circle",
          pointStyleWidth: 10,
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
          title: function (context: TooltipItem<"line">[]) {
            return context[0]?.label || "";
          },
          label: function (context: TooltipItem<"line">) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            if (value !== null) {
              const formattedValue = `₹${(value / 100000).toFixed(1)}L`;
              return `${label}: ${formattedValue}`;
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
          color: "#374151",
          font: {
            size: isMobile ? 11 : 12,
            weight: 500,
          },
          maxTicksLimit: isMobile ? 5 : 7,
          callback: function (value: string | number) {
            if (typeof value === "number") {
              return "₹" + (value / 100000).toFixed(0) + "L";
            }
            return value;
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.4)",
          lineWidth: 1,
        },
      },

      x: {
        ticks: {
          color: "#374151",
          font: {
            size: isMobile ? 11 : 12,
            weight: 500,
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
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
