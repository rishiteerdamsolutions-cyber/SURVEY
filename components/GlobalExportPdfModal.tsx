'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';

interface GlobalStats {
  totalResponses: number;
  totalCompanies: number;
  globalLendingRate: number;
  globalDelayedPaymentRate: number;
  globalInterestRate: number;
}

interface GlobalExportPdfModalProps {
  stats: GlobalStats;
  onClose: () => void;
}

export default function GlobalExportPdfModal({ stats, onClose }: GlobalExportPdfModalProps) {
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!confirmed) {
      setError('Please confirm you want to export.');
      return;
    }

    setLoading(true);
    try {
      const authRes = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const authData = await authRes.json();
      if (!authRes.ok || !authData.success) {
        setError('Invalid password');
        setLoading(false);
        return;
      }
    } catch {
      setError('Verification failed');
      setLoading(false);
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('LendAndBorrow — Global Survey Analytics Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    doc.text(`Total Responses: ${stats.totalResponses}`, 20, 38);
    doc.text(`Total Companies: ${stats.totalCompanies}`, 20, 46);
    doc.text(`Global Lending Rate: ${stats.globalLendingRate}%`, 20, 56);
    doc.text(`Global Delayed Payment Rate: ${stats.globalDelayedPaymentRate}%`, 20, 64);
    doc.text(`Global Platform Interest: ${stats.globalInterestRate}%`, 20, 72);

    doc.save('LendAndBorrow-Global-Analytics.pdf');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Export Global Analytics as PDF
        </h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to export the global analytics report? The PDF
          will contain overall metrics across all companies.
        </p>
        <form onSubmit={handleExport} className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="confirm" className="text-sm text-gray-700">
              I confirm I want to export this report
            </label>
          </div>
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
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
