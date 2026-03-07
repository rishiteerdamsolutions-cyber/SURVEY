'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminTable from '@/components/AdminTable';

interface Company {
  _id: string;
  ideaSlug: string;
  companyName: string;
  companySlug: string;
  surveyLink: string;
  totalResponses?: number;
}

export default function IdeaDetailPage() {
  const params = useParams();
  const ideaSlug = params.ideaSlug as string;
  const [idea, setIdea] = useState<{
    ideaName: string;
    ideaSlug: string;
    headline: string;
  } | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCompany, setNewCompany] = useState({ companyName: '', companySlug: '' });
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [ideaRes, companiesRes] = await Promise.all([
          fetch(`/api/ideas/${ideaSlug}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/companies?ideaSlug=${ideaSlug}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (ideaRes.ok) setIdea(await ideaRes.json());
        if (companiesRes.ok) {
          const list = await companiesRes.json();
          const withCounts = await Promise.all(
            list.map(async (c: Company) => {
              const r = await fetch(
                `/api/analytics/${c.companySlug}?ideaSlug=${ideaSlug}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const a = r.ok ? await r.json() : { totalResponses: 0 };
              return { ...c, totalResponses: a.totalResponses };
            })
          );
          setCompanies(withCounts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ideaSlug, token]);

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
          ideaSlug,
          companyName: newCompany.companyName,
          companySlug: newCompany.companySlug || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewCompany({ companyName: '', companySlug: '' });
        setShowCreate(false);
        setCompanies((prev) => [...prev, { ...data, totalResponses: 0 }]);
      } else {
        setError(data.error || 'Failed to create');
      }
    } catch {
      setError('Failed to create company');
    } finally {
      setCreating(false);
    }
  };

  const refreshCompanies = async () => {
    if (!token) return;
    const companiesRes = await fetch(`/api/companies?ideaSlug=${ideaSlug}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!companiesRes.ok) return;
    const list = await companiesRes.json();
    const withCounts = await Promise.all(
      list.map(async (c: Company) => {
        const r = await fetch(
          `/api/analytics/${c.companySlug}?ideaSlug=${ideaSlug}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const a = r.ok ? await r.json() : { totalResponses: 0 };
        return { ...c, totalResponses: a.totalResponses };
      })
    );
    setCompanies(withCounts);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Idea not found</p>
        <Link href="/admin" className="ml-4 text-blue-600 hover:underline">
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to Admin
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {idea.ideaName}
        </h1>
        <p className="text-gray-500 mb-6">{idea.headline}</p>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Companies
          </h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            {showCreate ? 'Cancel' : 'Create Company Survey'}
          </button>
        </div>

        {showCreate && (
          <div className="mb-8 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create Company for {idea.ideaName}
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

        <AdminTable
          companies={companies}
          baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
          token={token}
          ideaSlug={ideaSlug}
          onDeleted={refreshCompanies}
        />
      </div>
    </div>
  );
}
