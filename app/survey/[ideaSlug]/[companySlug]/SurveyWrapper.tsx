'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SurveyForm from '@/components/SurveyForm';
import type { IdeaQuestions } from '@/lib/types';

interface SurveyWrapperProps {
  ideaSlug: string;
  companySlug: string;
  questions: IdeaQuestions;
}

export default function SurveyWrapper({
  ideaSlug,
  companySlug,
  questions,
}: SurveyWrapperProps) {
  const [started, setStarted] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/thank-you');
  };

  if (!started) {
    return (
      <div className="text-center py-8 sm:py-12">
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-4 sm:py-5 text-base sm:text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors min-h-[48px] touch-manipulation shadow-md"
        >
          Start Survey
        </button>
      </div>
    );
  }

  return (
    <SurveyForm
      ideaSlug={ideaSlug}
      companySlug={companySlug}
      questions={questions}
      onSuccess={handleSuccess}
    />
  );
}
