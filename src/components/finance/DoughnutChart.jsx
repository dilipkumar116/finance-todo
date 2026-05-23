import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import useFinanceStore, { getFilteredExpenses, getCategoryTotals, getTotalSpent } from '../../stores/useFinanceStore';
import { formatCurrency } from '../../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ customCategoryTotals, customTotalSpent }) {
  const expenses = useFinanceStore((s) => s.expenses);
  const categories = useFinanceStore((s) => s.categories);
  const filter = useFinanceStore((s) => s.filter);

  const filteredExpenses = getFilteredExpenses(expenses, filter);
  const categoryTotals = customCategoryTotals || getCategoryTotals(categories, filteredExpenses);
  const totalSpent = customTotalSpent !== undefined ? customTotalSpent : getTotalSpent(filteredExpenses);

  const hasData = categoryTotals.length > 0;

  const data = {
    labels: hasData ? categoryTotals.map((c) => c.name) : ['No Data'],
    datasets: [
      {
        data: hasData ? categoryTotals.map((c) => c.total) : [1],
        backgroundColor: hasData
          ? categoryTotals.map((c) => c.color)
          : ['rgba(255, 255, 255, 0.05)'],
        borderWidth: 0,
        borderRadius: hasData ? 12 : 0,
        spacing: hasData ? 6 : 0,
        hoverOffset: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '82%', // Thinner ring for premium look
    plugins: {
      legend: { display: false }, // Manual legend is better
      tooltip: {
        enabled: hasData,
        backgroundColor: '#121212',
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (ctx) => ` ${formatCurrency(ctx.parsed)}`,
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="relative w-full aspect-square max-w-[240px] mx-auto mt-2">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-0.5">Total</span>
        <span className="text-xl font-black text-text-primary">
          {formatCurrency(totalSpent)}
        </span>
      </div>
    </div>
  );
}
