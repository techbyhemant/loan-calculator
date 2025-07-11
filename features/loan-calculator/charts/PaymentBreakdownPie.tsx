import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface PaymentBreakdownPieProps {
  principal: number;
  interest: number;
}

export function PaymentBreakdownPie({
  principal,
  interest,
}: PaymentBreakdownPieProps) {
  const data = {
    labels: ["Principal Loan Amount", "Total Interest"],
    datasets: [
      {
        data: [principal, interest],
        backgroundColor: [
          "rgb(34,197,94)", // Tailwind green-500
          "rgb(251,146,60)", // Tailwind orange-400
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: "#64748b", // Tailwind slate-500
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
