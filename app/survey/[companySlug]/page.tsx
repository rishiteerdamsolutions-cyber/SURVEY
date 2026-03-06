import { notFound } from 'next/navigation';
import SurveyWrapper from './SurveyWrapper';
import { getDb } from '@/lib/mongodb';

async function getCompany(slug: string) {
  try {
    const db = await getDb();
    const companies = db.collection('companies');
    const company = await companies.findOne({ companySlug: slug });
    return company ? { companySlug: slug } : null;
  } catch {
    return null;
  }
}

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const company = await getCompany(companySlug);

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex justify-center mb-6 sm:mb-8">
          <img
            src="/logo.png"
            alt="LendAndBorrow"
            className="h-12 sm:h-16 w-auto object-contain"
          />
        </div>
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-sm sm:text-base text-emerald-600 font-medium mb-2">
            This survey takes less than 2 minutes.
          </p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            LendAndBorrow — Real Life Lending & Payment Experience Survey
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            This anonymous survey aims to understand real-life experiences with
            informal lending and delayed payments.
          </p>
        </div>
        <SurveyWrapper companySlug={companySlug} />
      </div>
    </div>
  );
}
