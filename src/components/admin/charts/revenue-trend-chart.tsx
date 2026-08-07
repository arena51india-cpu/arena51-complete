'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export function RevenueTrendChart({ revenueByDay }: { revenueByDay: Record<string, number> }) {
  const labels = Object.keys(revenueByDay).sort();
  const data = labels.map((d) => revenueByDay[d]);

  return (
    <Line
      data={{
        labels: labels.map((d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })),
        datasets: [
          {
            label: 'Revenue',
            data,
            borderColor: '#dcae32',
            backgroundColor: (ctx) => {
              const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
              gradient.addColorStop(0, 'rgba(220,174,50,0.35)');
              gradient.addColorStop(1, 'rgba(220,174,50,0)');
              return gradient;
            },
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#8b8b93', font: { size: 10 } } },
          y: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#8b8b93', font: { size: 10 }, callback: (v) => `₹${v}` },
          },
        },
      }}
    />
  );
}
