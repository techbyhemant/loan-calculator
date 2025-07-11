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

export function YearlyBreakdownBar({ schedule }: YearlyBreakdownBarProps) {
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

  const data = {
    labels: years.map(String),
    datasets: [
      {
        type: "bar" as const,
        label: "Principal",
        data: principalPerYear,
        backgroundColor: "rgb(34,197,94)", // Tailwind green-500
        stack: "stack1",
      },
      {
        type: "bar" as const,
        label: "Interest",
        data: interestPerYear,
        backgroundColor: "rgb(251,146,60)", // Tailwind orange-400
        stack: "stack1",
      },
      {
        type: "line" as const,
        label: "Balance",
        data: balancePerYear,
        borderColor: "rgb(239,68,68)", // Tailwind red-500
        backgroundColor: "rgb(239,68,68)",
        yAxisID: "y1",
        tension: 0.3,
        pointRadius: 2,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: "#64748b", font: { size: 14 } },
      },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Amount (₹)" },
        ticks: { color: "#64748b" },
      },
      y1: {
        beginAtZero: true,
        position: "right" as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Balance (₹)" },
        ticks: { color: "#64748b" },
      },
      x: {
        ticks: { color: "#64748b" },
      },
    },
  };

  return (
    <div
      className="w-full h-80"
      role="img"
      aria-label="Yearly principal, interest, and balance chart"
    >
      <Bar data={data} options={options} />
    </div>
  );
}
