'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function BookingSourceChart({
  online,
  walkIn,
  cancelled,
}: {
  online: number;
  walkIn: number;
  cancelled: number;
}) {
  return (
    <Doughnut
      data={{
        labels: ['Online', 'Walk-in', 'Cancelled'],
        datasets: [
          {
            data: [online, walkIn, cancelled],
            backgroundColor: ['#dcae32', '#1ad7ff', '#3f3f46'],
            borderColor: '#0a0a0c',
            borderWidth: 3,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#8b8b93', font: { size: 11 }, boxWidth: 10 } },
        },
      }}
    />
  );
}
