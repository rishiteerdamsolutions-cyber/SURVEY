'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import ChartSetup from '@/components/ChartSetup';
import type { SurveyAnalysis } from '@/lib/types';

export default function CompanyAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const companySlug = params.companySlug as string;
  const [analytics, setAnalytics] = useState<SurveyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetch(`/api/analytics/${companySlug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setAnalytics(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companySlug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Analytics not found</p>
        <Link href="/admin" className="ml-4 text-blue-600 hover:underline">
          Back to Admin
        </Link>
      </div>
    );
  }

  const { lendingStats, paymentStats, interestStats } = analytics;
  const companyName = companySlug.charAt(0).toUpperCase() + companySlug.slice(1).replace(/-/g, ' ');

  return (
    <ChartSetup>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            ← Back to Admin
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {companyName} — Analytics
          </h1>
          <p className="text-gray-500 mb-8">
            Total responses: {analytics.totalResponses}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500">Lent Money</p>
              <p className="text-xl font-bold text-blue-600">
                {lendingStats.lentMoneyPercent}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500">Repayment Delays</p>
              <p className="text-xl font-bold text-amber-600">
                {lendingStats.facedDelaysPercent}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500">Lost Money</p>
              <p className="text-xl font-bold text-red-600">
                {lendingStats.lostMoneyPercent}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500">Delayed Payments</p>
              <p className="text-xl font-bold text-amber-600">
                {paymentStats.experiencedDelaysPercent}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500">Mental Stress</p>
              <p className="text-xl font-bold text-rose-600">
                {paymentStats.mentalStressPercent}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500">Platform Interest</p>
              <p className="text-xl font-bold text-emerald-600">
                {interestStats.platformInterestPercent}%
              </p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Charts
          </h2>
          <AnalyticsCharts analytics={analytics} />
        </div>
      </div>
    </ChartSetup>
  );
}
