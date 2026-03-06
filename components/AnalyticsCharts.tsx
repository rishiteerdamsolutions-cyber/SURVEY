'use client';

import dynamic from 'next/dynamic';
import type { SurveyAnalysis } from '@/lib/types';

const ChartComponents = {
  Pie: dynamic(
    () => import('react-chartjs-2').then((mod) => mod.Pie),
    { ssr: false }
  ),
  Bar: dynamic(
    () => import('react-chartjs-2').then((mod) => mod.Bar),
    { ssr: false }
  ),
};

const CHART_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
];

interface AnalyticsChartsProps {
  analytics: SurveyAnalysis;
}

const delayLabelMap: Record<string, string> = {
  'under-1week': 'Under 1 week',
  '1-2weeks': '1-2 weeks',
  '2-4weeks': '2-4 weeks',
  '1-2months': '1-2 months',
  'above-2months': 'Above 2 months',
};

const loanLabelMap: Record<string, string> = {
  'under-5k': 'Under ₹5k',
  '5k-25k': '₹5k-25k',
  '25k-50k': '₹25k-50k',
  '50k-1lakh': '₹50k-1L',
  'above-1lakh': 'Above ₹1L',
};

const typeLabelMap: Record<string, string> = {
  salary: 'Salary',
  freelance: 'Freelance',
  rent: 'Rent',
  vendor: 'Vendor',
  other: 'Other',
};

export default function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const { lendingStats, paymentStats, interestStats } = analytics;

  const lendingData = {
    labels: ['Lent Money', 'Never Lent'],
    datasets: [
      {
        data: [
          lendingStats.lentMoneyPercent,
          100 - lendingStats.lentMoneyPercent,
        ],
        backgroundColor: [CHART_COLORS[0], CHART_COLORS[1]],
      },
    ],
  };

  const delayDurationData = {
    labels: Object.keys(paymentStats.avgDelayDistribution).map(
      (k) => delayLabelMap[k] || k
    ),
    datasets: [
      {
        label: 'Responses',
        data: Object.values(paymentStats.avgDelayDistribution),
        backgroundColor: CHART_COLORS,
      },
    ],
  };

  const paymentTypeData = {
    labels: Object.keys(paymentStats.delayTypeDistribution).map(
      (k) => typeLabelMap[k] || k
    ),
    datasets: [
      {
        data: Object.values(paymentStats.delayTypeDistribution),
        backgroundColor: CHART_COLORS,
      },
    ],
  };

  const reminderData = {
    labels: ['5+ Reminders', 'Fewer than 5'],
    datasets: [
      {
        data: [
          paymentStats.sent5PlusRemindersPercent,
          100 - paymentStats.sent5PlusRemindersPercent,
        ],
        backgroundColor: [CHART_COLORS[2], CHART_COLORS[1]],
      },
    ],
  };

  const interestData = {
    labels: ['Interested', 'Not Interested'],
    datasets: [
      {
        data: [
          interestStats.platformInterestPercent,
          100 - interestStats.platformInterestPercent,
        ],
        backgroundColor: [CHART_COLORS[0], CHART_COLORS[4]],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom' as const },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Lending vs No Lending
          </h3>
          <div className="h-48 sm:h-56 w-full">
            {typeof window !== 'undefined' && (
              <ChartComponents.Pie
                data={lendingData}
                options={chartOptions}
              />
            )}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Delay Duration
          </h3>
          <div className="h-48 sm:h-56 w-full">
            {typeof window !== 'undefined' && Object.keys(paymentStats.avgDelayDistribution).length > 0 && (
              <ChartComponents.Bar
                data={delayDurationData}
                options={barOptions}
              />
            )}
            {Object.keys(paymentStats.avgDelayDistribution).length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No data
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Types of Delayed Payment
          </h3>
          <div className="h-48 sm:h-56 w-full">
            {typeof window !== 'undefined' && Object.keys(paymentStats.delayTypeDistribution).length > 0 && (
              <ChartComponents.Pie
                data={paymentTypeData}
                options={chartOptions}
              />
            )}
            {Object.keys(paymentStats.delayTypeDistribution).length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No data
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Reminder Frequency (5+ reminders)
          </h3>
          <div className="h-48 sm:h-56 w-full">
            {typeof window !== 'undefined' && (
              <ChartComponents.Pie
                data={reminderData}
                options={chartOptions}
              />
            )}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100 sm:col-span-2">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Interest in Platform
          </h3>
          <div className="h-48 sm:h-56 w-full max-w-xs mx-auto">
            {typeof window !== 'undefined' && (
              <ChartComponents.Pie
                data={interestData}
                options={chartOptions}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
