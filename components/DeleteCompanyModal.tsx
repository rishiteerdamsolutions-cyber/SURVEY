'use client';

import { useState } from 'react';

interface DeleteCompanyModalProps {
  companyName: string;
  companySlug: string;
  ideaSlug: string;
  onClose: () => void;
  onDeleted: () => void;
  token: string;
}

export default function DeleteCompanyModal({
  companyName,
  companySlug,
  ideaSlug,
  onClose,
  onDeleted,
  token,
}: DeleteCompanyModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${companySlug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password, ideaSlug }),
      });
      const data = await res.json();
      if (res.ok) {
        onDeleted();
        onClose();
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch {
      setError('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Delete Company
        </h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>{companyName}</strong>? This
          will permanently remove the company and all its survey responses. This
          action cannot be undone.
        </p>
        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter password to confirm
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Admin password"
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
