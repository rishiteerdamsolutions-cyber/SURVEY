'use client';

import Link from 'next/link';

interface Company {
  _id: string;
  companyName: string;
  companySlug: string;
  surveyLink: string;
  totalResponses?: number;
}

interface AdminTableProps {
  companies: Company[];
  baseUrl: string;
}

export default function AdminTable({ companies, baseUrl }: AdminTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Responses
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
              Survey Link
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {companies.map((c) => (
            <tr key={c._id} className="hover:bg-gray-50">
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {c.companyName}
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600">
                {c.totalResponses ?? 0}
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 hidden sm:table-cell">
                <a
                  href={c.surveyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate block max-w-[200px]"
                >
                  {c.surveyLink}
                </a>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                <Link
                  href={`/admin/company/${c.companySlug}`}
                  className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 min-h-[44px] touch-manipulation"
                >
                  View Analytics
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
