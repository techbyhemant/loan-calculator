import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  BarController,
  LineElement,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import type { AmortizationRow } from "@/lib/utils";
import { useThemeColors } from "@/lib/hooks/useThemeColors";

ChartJS.register(
  BarElement,
  BarController,
  LineElement,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

export interface YearlyBreakdownBarProps {
  schedule: AmortizationRow[];
}

const formatCurrencyShort = (value: number): string => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value.toLocaleString("en-IN")}`;
};

const formatCurrencyFull = (value: number): string => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Crores`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} Lakhs`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)} Thousands`;
  return `₹${value.toLocaleString("en-IN")}`;
};

export function YearlyBreakdownBar({ schedule }: YearlyBreakdownBarProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const themeColors = useThemeColors();

  React.useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!schedule || schedule.length === 0) {
    return (
      <div className="w-full h-72 sm:h-96 flex items-center justify-center text-muted-foreground">
        No data available for chart
      </div>
    );
  }

  const years = Array.from(new Set(schedule.map((r) => r.year)));
  const principalPerYear = years.map((y) =>
    schedule.filter((r) => r.year === y).reduce((sum, r) => sum + r.principal, 0)
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
    balanceBg: "transparent",
    pointBorder: themeColors.card,
    legend: themeColors.foreground,
    tick: themeColors.mutedForeground,
    grid: themeColors.border,
    tooltipBg: "rgba(17,24,39,0.95)",
    tooltipBorder: themeColors.border,
  };

  const data: ChartData<"bar"> = {
    labels: years.map((y, i) => `Y${i + 1}`),
    datasets: [
      {
        // @ts-expect-error: Mixed chart types
        type: "line" as const,
        label: "Balance",
        data: balancePerYear,
        borderColor: c.balance,
        backgroundColor: c.balanceBg,
        yAxisID: "y1",
        tension: 0.4,
        pointRadius: isMobile ? 5 : 6,
        borderWidth: isMobile ? 3 : 4,
        borderDash: [6, 4],
        fill: false,
        order: 1,
        pointBackgroundColor: c.balance,
        pointBorderColor: c.pointBorder,
        pointBorderWidth: 2,
        pointStyle: "circle",
      },
      {
        type: "bar" as const,
        label: "Principal",
        data: principalPerYear,
        backgroundColor: c.principal,
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
        backgroundColor: c.interest,
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
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: {
        position: "top",
        align: "start",
        labels: {
          color: c.legend,
          font: { size: isMobile ? 11 : 13, weight: 500 },
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
        backgroundColor: c.tooltipBg,
        titleColor: "#F1F3F7",
        bodyColor: "#A0A6B6",
        borderColor: c.tooltipBorder,
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { size: isMobile ? 12 : 14, weight: 500 },
        bodyFont: { size: isMobile ? 11 : 13 },
        padding: isMobile ? 12 : 16,
        callbacks: {
          title: (context: TooltipItem<"bar">[]) =>
            `Year ${context[0]?.label?.replace("Y", "")} Summary`,
          label: (context: TooltipItem<"bar">) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            if (value !== null) return `${label}: ${formatCurrencyFull(value)}`;
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
          font: { size: isMobile ? 10 : 11, weight: 400 },
          maxTicksLimit: isMobile ? 4 : 6,
          callback: (value: string | number) =>
            typeof value === "number" ? formatCurrencyShort(value) : value,
        },
        grid: { color: c.grid, lineWidth: 1 },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        grid: { drawOnChartArea: false, color: themeColors.border },
        ticks: {
          color: c.tick,
          font: { size: isMobile ? 10 : 11, weight: 400 },
          maxTicksLimit: isMobile ? 4 : 6,
          callback: (value: string | number) =>
            typeof value === "number" ? formatCurrencyShort(value) : value,
        },
      },
      x: {
        ticks: {
          color: c.tick,
          font: { size: isMobile ? 10 : 11, weight: 400 },
        },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="w-full h-72 sm:h-96" role="img" aria-label="Yearly principal, interest, and balance chart">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Bar data={data as any} options={options as any} />
      </div>
    </div>
  );
}
