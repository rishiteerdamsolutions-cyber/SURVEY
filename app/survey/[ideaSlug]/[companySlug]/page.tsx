import { notFound } from 'next/navigation';
import SurveyWrapper from './SurveyWrapper';
import { getDb } from '@/lib/mongodb';
import type { Idea } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getIdeaAndCompany(ideaSlug: string, companySlug: string) {
  try {
    const db = await getDb();
    const ideas = db.collection<Idea>('ideas');
    const companies = db.collection('companies');
    const [idea, company] = await Promise.all([
      ideas.findOne({ ideaSlug }),
      companies.findOne({ ideaSlug, companySlug }),
    ]);
    if (!idea || !company) return null;
    return { idea: { ...idea, _id: idea._id?.toString() }, company };
  } catch (err) {
    console.error('Survey page DB error:', err);
    return null;
  }
}

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ ideaSlug: string; companySlug: string }>;
}) {
  const { ideaSlug, companySlug } = await params;
  const data = await getIdeaAndCompany(ideaSlug, companySlug);

  if (!data) {
    notFound();
  }

  const { idea } = data;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex justify-center mb-6 sm:mb-8">
          <img
            src={idea.logo}
            alt={idea.ideaName}
            className="h-12 sm:h-16 w-auto object-contain max-h-16"
          />
        </div>
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-sm sm:text-base text-emerald-600 font-medium mb-2">
            This survey takes less than 2 minutes.
          </p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {idea.ideaName} — {idea.headline}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto whitespace-pre-line">
            {idea.description}
          </p>
        </div>
        <SurveyWrapper
          ideaSlug={ideaSlug}
          companySlug={companySlug}
          questions={idea.questions}
        />
      </div>
    </div>
  );
}
