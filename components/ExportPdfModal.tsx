'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import type { SurveyAnalysis } from '@/lib/types';

interface ExportPdfModalProps {
  companyName: string;
  analytics: SurveyAnalysis;
  exportAreaId: string;
  onClose: () => void;
}

export default function ExportPdfModal({
  companyName,
  analytics,
  exportAreaId,
  onClose,
}: ExportPdfModalProps) {
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

    try {
      const element = document.getElementById(exportAreaId);
      if (!element) {
        setError('Export area not found. Please try again.');
        setLoading(false);
        return;
      }

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF('p', 'mm', 'a4', true);
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;
      let imgWidth = contentWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > contentHeight) {
        const scale = contentHeight / imgHeight;
        imgWidth *= scale;
        imgHeight *= scale;
      }

      doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

      doc.save(`${companyName.replace(/\s+/g, '-')}-Analytics.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      setError('Failed to export PDF. Please try again.');
      setLoading(false);
      return;
    }

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Export Analytics as PDF
        </h3>
        <p className="text-gray-600 mb-4">
          Export the analytics report for <strong>{companyName}</strong> as a PDF.
          The PDF will capture the page as it appears, including all stats and
          charts.
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
