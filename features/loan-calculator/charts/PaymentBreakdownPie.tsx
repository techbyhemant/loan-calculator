import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useThemeColors } from "@/lib/hooks/useThemeColors";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface PaymentBreakdownPieProps {
  principal: number;
  interest: number;
}

export function PaymentBreakdownPie({
  principal,
  interest,
}: PaymentBreakdownPieProps) {
  const colors = useThemeColors();

  const data = {
    labels: ["Principal Loan Amount", "Total Interest"],
    datasets: [
      {
        data: [principal, interest],
        backgroundColor: [
          colors.chart1,
          colors.chart2,
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: colors.mutedForeground,
          font: { size: 14 },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div
      className="w-48 h-48 mx-auto"
      role="img"
      aria-label="Payment breakdown pie chart"
    >
      <Pie data={data} options={options} />
    </div>
  );
}
