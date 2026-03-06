'use client';

import { useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from 'chart.js';

export default function ChartSetup({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ChartJS.register(
      ArcElement,
      BarElement,
      CategoryScale,
      LinearScale,
      Legend,
      Tooltip
    );
  }, []);

  return <>{children}</>;
}
