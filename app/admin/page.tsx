'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/AdminTable';
import ChartSetup from '@/components/ChartSetup';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState<
    Array<{
      _id: string;
      companyName: string;
      companySlug: string;
      surveyLink: string;
      totalResponses?: number;
    }>
  >([]);
  const [globalStats, setGlobalStats] = useState<{
    totalResponses: number;
    totalCompanies: number;
    globalLendingRate: number;
    globalDelayedPaymentRate: number;
    globalInterestRate: number;
  } | null>(null);
  const [newCompany, setNewCompany] = useState({ companyName: '', companySlug: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  useEffect(() => {
    if (token) {
      setAuthenticated(true);
      fetchData(token);
    }
  }, [token]);

  const fetchData = async (t: string) => {
    try {
      const [companiesRes, globalRes] = await Promise.all([
        fetch('/api/companies', {
          headers: { Authorization: `Bearer ${t}` },
        }),
        fetch('/api/analytics/global', {
          headers: { Authorization: `Bearer ${t}` },
        }),
      ]);

      if (companiesRes.ok) {
        const list = await companiesRes.json();
        const withCounts = await Promise.all(
          list.map(async (c: { companySlug: string }) => {
            const r = await fetch(`/api/analytics/${c.companySlug}`, {
              headers: { Authorization: `Bearer ${t}` },
            });
            const a = r.ok ? await r.json() : { totalResponses: 0 };
            return { ...c, totalResponses: a.totalResponses };
          })
        );
        setCompanies(withCounts);
      }

      if (globalRes.ok) {
        const stats = await globalRes.json();
        setGlobalStats(stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('admin_token', data.token);
        setAuthenticated(true);
        fetchData(data.token);
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Login failed');
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: newCompany.companyName,
          companySlug: newCompany.companySlug || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewCompany({ companyName: '', companySlug: '' });
        setShowCreate(false);
        fetchData(token!);
      } else {
        setError(data.error || 'Failed to create');
      }
    } catch {
      setError('Failed to create company');
    } finally {
      setCreating(false);
    }
  };

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Admin Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Admin password"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChartSetup>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            Admin Dashboard
          </h1>

          {globalStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500">Total Responses</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {globalStats.totalResponses}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500">Companies</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {globalStats.totalCompanies}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500">Lending Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {globalStats.globalLendingRate}%
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500">Delayed Pay %</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">
                  {globalStats.globalDelayedPaymentRate}%
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 col-span-2 sm:col-span-1">
                <p className="text-xs sm:text-sm text-gray-500">Platform Interest</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                  {globalStats.globalInterestRate}%
                </p>
              </div>
            </div>
          )}

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Company Survey Manager
            </h2>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 min-h-[44px] touch-manipulation"
            >
              {showCreate ? 'Cancel' : 'Create Company Survey'}
            </button>
          </div>

          {showCreate && (
            <div className="mb-8 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Company
              </h3>
              <form onSubmit={handleCreateCompany} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={newCompany.companyName}
                    onChange={(e) =>
                      setNewCompany((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                        companySlug:
                          prev.companySlug ||
                          e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-]/g, ''),
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="e.g. Zerodha"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (optional)
                  </label>
                  <input
                    type="text"
                    value={newCompany.companySlug}
                    onChange={(e) =>
                      setNewCompany((prev) => ({ ...prev, companySlug: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="zerodha"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </form>
            </div>
          )}

          <h3 className="text-base font-medium text-gray-700 mb-4">
            Response Overview
          </h3>
          <AdminTable companies={companies} baseUrl={baseUrl} />
        </div>
      </div>
    </ChartSetup>
  );
}
