'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export function PeakHoursChart({ hourBuckets }: { hourBuckets: Record<string, number> }) {
  const hours = Array.from({ length: 24 }).map((_, i) => String(i).padStart(2, '0'));
  const data = hours.map((h) => hourBuckets[h] ?? 0);

  return (
    <Bar
      data={{
        labels: hours.map((h) => `${h}:00`),
        datasets: [
          {
            label: 'Bookings',
            data,
            backgroundColor: '#1ad7ff88',
            borderRadius: 4,
            barThickness: 10,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#8b8b93', font: { size: 9 } } },
          y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#8b8b93', font: { size: 10 }, precision: 0 } },
        },
      }}
    />
  );
}
