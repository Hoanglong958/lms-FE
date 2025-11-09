import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function CompletionRateChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.course),
    datasets: [
      {
        label: "Completion Rate (%)",
        data: data.map((d) => d.completion),
        backgroundColor: "#36b9cc",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Completion Rate" },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return <Bar data={chartData} options={options} />;
}
