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
import { useThemeColors } from "@/lib/hooks/useThemeColors";

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
  const themeColors = useThemeColors();

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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

  const c = {
    principal: themeColors.chart1,
    interest: themeColors.chart2,
    balance: themeColors.negative,
    pointBorder: themeColors.card,
    legend: themeColors.foreground,
    tick: themeColors.mutedForeground,
    grid: themeColors.border,
  };

  const data: ChartData<"line"> = {
    labels: years.map((y, i) => `Year ${i + 1}`),
    datasets: [
      {
        label: "Principal",
        data: principalPerYear,
        borderColor: c.principal,
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: isMobile ? 3 : 4,
        pointBackgroundColor: c.principal,
        pointBorderColor: c.pointBorder,
        pointBorderWidth: 2,
        borderWidth: isMobile ? 2 : 3,
        fill: false,
      },
      {
        label: "Interest",
        data: interestPerYear,
        borderColor: c.interest,
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: isMobile ? 3 : 4,
        pointBackgroundColor: c.interest,
        pointBorderColor: c.pointBorder,
        pointBorderWidth: 2,
        borderWidth: isMobile ? 2 : 3,
        fill: false,
      },
      {
        label: "Balance",
        data: balancePerYear,
        borderColor: c.balance,
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: isMobile ? 3 : 4,
        pointBackgroundColor: c.balance,
        pointBorderColor: c.pointBorder,
        pointBorderWidth: 2,
        borderWidth: isMobile ? 2 : 3,
        fill: false,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: {
        position: "top",
        align: "start",
        labels: {
          color: c.legend,
          font: { size: isMobile ? 12 : 14, weight: "600" as FontSpec["weight"] },
          padding: isMobile ? 16 : 20,
          usePointStyle: true,
          pointStyle: "circle",
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(17,24,39,0.95)",
        titleColor: "#F1F3F7",
        bodyColor: "#A0A6B6",
        borderColor: themeColors.border,
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { size: isMobile ? 12 : 14, weight: 500 },
        bodyFont: { size: isMobile ? 11 : 13 },
        padding: isMobile ? 12 : 16,
        callbacks: {
          title: (context: TooltipItem<"line">[]) => context[0]?.label || "",
          label: (context: TooltipItem<"line">) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            if (value !== null) return `${label}: ₹${(value / 100000).toFixed(1)}L`;
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: c.tick,
          font: { size: isMobile ? 11 : 12, weight: 500 },
          maxTicksLimit: isMobile ? 5 : 7,
          callback: (value: string | number) =>
            typeof value === "number" ? "₹" + (value / 100000).toFixed(0) + "L" : value,
        },
        grid: { color: c.grid, lineWidth: 1 },
      },
      x: {
        ticks: {
          color: c.tick,
          font: { size: isMobile ? 11 : 12, weight: 500 },
        },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="w-full h-72 sm:h-96" role="img" aria-label="Yearly principal, interest, and balance chart">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
