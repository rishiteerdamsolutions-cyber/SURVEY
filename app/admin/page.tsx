'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ChartSetup from '@/components/ChartSetup';
import GlobalExportPdfModal from '@/components/GlobalExportPdfModal';
import DeleteIdeaModal from '@/components/DeleteIdeaModal';
import type { Idea } from '@/lib/types';

interface IdeaWithCount extends Idea {
  _id: string;
  responseCount?: number;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ideas, setIdeas] = useState<IdeaWithCount[]>([]);
  const [globalStats, setGlobalStats] = useState<{
    totalResponses: number;
    totalCompanies: number;
    globalLendingRate: number;
    globalDelayedPaymentRate: number;
    globalInterestRate: number;
  } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IdeaWithCount | null>(null);

  const [newIdea, setNewIdea] = useState({
    ideaName: '',
    ideaSlug: '',
    headline: '',
    description: '',
    logo: '',
    questionsFile: null as File | null,
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  useEffect(() => {
    if (token) {
      setAuthenticated(true);
      fetchData(token);
    }
  }, [token]);

  const fetchData = async (t: string) => {
    try {
      const [ideasRes, globalRes] = await Promise.all([
        fetch('/api/ideas', { headers: { Authorization: `Bearer ${t}` } }),
        fetch('/api/analytics/global', {
          headers: { Authorization: `Bearer ${t}` },
        }),
      ]);

      if (ideasRes.ok) {
        const list = await ideasRes.json();
        setIdeas(list);
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

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    let questions;
    if (newIdea.questionsFile) {
      try {
        const text = await newIdea.questionsFile.text();
        questions = JSON.parse(text);
        if (!questions.part1 || !questions.part2 || !questions.interest) {
          throw new Error('Invalid structure');
        }
      } catch (err) {
        setError(
          'Invalid questions JSON. Must have part1 (array), part2 (array), interest (object). Download template for format.'
        );
        setCreating(false);
        return;
      }
    } else {
      setError('Questions JSON file is required');
      setCreating(false);
      return;
    }

    try {
      let logo = newIdea.logo;
      if (!logo) {
        setError('Logo is required');
        setCreating(false);
        return;
      }

      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ideaName: newIdea.ideaName,
          ideaSlug: newIdea.ideaSlug || undefined,
          headline: newIdea.headline,
          description: newIdea.description,
          logo,
          questions,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewIdea({
          ideaName: '',
          ideaSlug: '',
          headline: '',
          description: '',
          logo: '',
          questionsFile: null,
        });
        setShowCreate(false);
        fetchData(token!);
      } else {
        setError(data.error || 'Failed to create');
      }
    } catch {
      setError('Failed to create idea');
    } finally {
      setCreating(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setNewIdea((prev) => ({ ...prev, logo: base64 }));
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Super Admin Login</h1>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Super Admin Dashboard
            </h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(!showCreate)}
                className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                {showCreate ? 'Cancel' : 'Create Idea'}
              </button>
              {globalStats && (
                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  className="px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700"
                >
                  Export Global PDF
                </button>
              )}
            </div>
          </div>

          {showCreate && (
            <div className="mb-8 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Idea (Survey Campaign)
              </h3>
              <form onSubmit={handleCreateIdea} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idea Name
                    </label>
                    <input
                      type="text"
                      value={newIdea.ideaName}
                      onChange={(e) =>
                        setNewIdea((prev) => ({
                          ...prev,
                          ideaName: e.target.value,
                          ideaSlug:
                            prev.ideaSlug ||
                            e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, '-')
                              .replace(/[^a-z0-9-]/g, ''),
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="e.g. LendAndBorrow"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug (optional)
                    </label>
                    <input
                      type="text"
                      value={newIdea.ideaSlug}
                      onChange={(e) =>
                        setNewIdea((prev) => ({ ...prev, ideaSlug: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="lendandborrow"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={newIdea.headline}
                    onChange={(e) =>
                      setNewIdea((prev) => ({ ...prev, headline: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Real Life Lending & Payment Experience Survey"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newIdea.description}
                    onChange={(e) =>
                      setNewIdea((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg min-h-[100px]"
                    placeholder="Survey intro text..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo (image file)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required={!newIdea.logo}
                  />
                  {newIdea.logo && (
                    <img
                      src={newIdea.logo}
                      alt="Preview"
                      className="mt-2 h-16 object-contain"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Questions JSON file (required)
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) =>
                      setNewIdea((prev) => ({
                        ...prev,
                        questionsFile: e.target.files?.[0] ?? null,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a JSON file with part1, part2, interest structure.
                  </p>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create Idea'}
                </button>
              </form>
            </div>
          )}

          {globalStats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500">Total Responses</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {globalStats.totalResponses}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500">Ideas</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {ideas.length}
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
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500">Platform Interest</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                  {globalStats.globalInterestRate}%
                </p>
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ideas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <div
                key={idea._id}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={idea.logo}
                    alt={idea.ideaName}
                    className="h-12 w-12 object-contain rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{idea.ideaName}</h3>
                    <p className="text-sm text-gray-500">
                      {idea.responseCount ?? 0} responses
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                  {idea.headline}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/idea/${idea.ideaSlug}`}
                    className="flex-1 px-4 py-2 text-center text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Manage
                  </Link>
                  {token && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(idea)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showExportModal && globalStats && (
            <GlobalExportPdfModal
              stats={globalStats}
              onClose={() => setShowExportModal(false)}
            />
          )}

          {deleteTarget && token && (
            <DeleteIdeaModal
              ideaName={deleteTarget.ideaName}
              ideaSlug={deleteTarget.ideaSlug}
              onClose={() => setDeleteTarget(null)}
              onDeleted={() => {
                setDeleteTarget(null);
                fetchData(token);
              }}
              token={token}
            />
          )}
        </div>
      </div>
    </ChartSetup>
  );
}
