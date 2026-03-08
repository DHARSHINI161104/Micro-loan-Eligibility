import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FactorBreakdown({ score }) {
  const data = {
    labels: ['Income (30%)', 'Expenses (25%)', 'EMI (20%)', 'Digital (15%)', 'Savings (10%)'],
    datasets: [
      {
        data: [
          score.income_stability_score,
          score.expense_ratio_score,
          score.emi_burden_score,
          score.digital_payment_score,
          score.savings_score,
        ],
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
        ],
        borderColor: [
          '#059669',
          '#2563eb',
          '#d97706',
          '#7c3aed',
          '#db2777',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const maxScores = [30, 25, 20, 15, 10];
            return `${context.raw}/${maxScores[context.dataIndex]}`;
          },
        },
      },
    },
    cutout: '60%',
  };

  return (
    <div className="h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
}
