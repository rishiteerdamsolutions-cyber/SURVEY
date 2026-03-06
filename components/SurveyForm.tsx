'use client';

import { useState } from 'react';
import QuestionCard from './QuestionCard';
import { SURVEY_QUESTIONS } from '@/lib/surveyQuestions';
import type { AnswersPart1, AnswersPart2 } from '@/lib/types';

interface SurveyFormProps {
  companySlug: string;
  onSuccess: () => void;
}

type FormState = Record<string, string>;

function shouldShow(
  q: { showIf?: { [x: string]: string }; id: string },
  form: FormState
): boolean {
  if (!q.showIf) return true;
  return Object.entries(q.showIf).every(
    ([key, val]) => form[key] === val
  );
}

export default function SurveyForm({ companySlug, onSuccess }: SurveyFormProps) {
  const [part, setPart] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateForm = (id: string, value: string) => {
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const part1Questions = SURVEY_QUESTIONS.part1.filter((q) =>
    shouldShow(q, form)
  );
  const part2Questions = SURVEY_QUESTIONS.part2.filter((q) =>
    shouldShow(q, form)
  );

  const part1Required = part1Questions.filter((q) => q.required);
  const part2Required = part2Questions.filter((q) => q.required);

  const part1Valid = part1Required.every((q) => form[q.id]);
  const part2Valid = part2Required.every((q) => form[q.id]);

  const handleSubmit = async () => {
    setError('');
    if (part === 1) {
      if (!part1Valid) {
        setError('Please answer all required questions.');
        return;
      }
      setPart(2);
      return;
    }

    if (!part2Valid) {
      setError('Please answer all required questions.');
      return;
    }

    const answersPart1: AnswersPart1 = {
      hasLentMoney: (form.hasLentMoney as 'yes' | 'no') || 'no',
      facedRepaymentDelays: form.facedRepaymentDelays as 'yes' | 'no' | undefined,
      lostMoney: form.lostMoney as 'yes' | 'no' | undefined,
      averageLoanSize: form.averageLoanSize as AnswersPart1['averageLoanSize'],
      hesitatedToAsk: form.hesitatedToAsk as 'yes' | 'no' | undefined,
      wantStructuredPlatform: form.wantStructuredPlatform as 'yes' | 'no' | undefined,
    };

    const answersPart2: AnswersPart2 = {
      experiencedDelayedPayments:
        (form.experiencedDelayedPayments as 'yes' | 'no') || 'no',
      delayedPaymentType: form.delayedPaymentType as AnswersPart2['delayedPaymentType'],
      averageDelayDuration: form.averageDelayDuration as AnswersPart2['averageDelayDuration'],
      sentMoreThan5Reminders: form.sentMoreThan5Reminders as 'yes' | 'no' | undefined,
      averageDelayedAmount: form.averageDelayedAmount as AnswersPart2['averageDelayedAmount'],
      experiencedMentalStress: form.experiencedMentalStress as 'yes' | 'no' | undefined,
    };

    const earlyAccessInterest = (form.earlyAccessInterest as 'yes' | 'no') || 'no';

    setLoading(true);
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companySlug,
          answersPart1,
          answersPart2,
          earlyAccessInterest,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit survey.');
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = part === 1 ? 50 : 100;

  return (
    <div className="space-y-6">
      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
        <div
          className="bg-blue-600 h-2 sm:h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-xs sm:text-sm text-gray-500">
        {part === 1 ? 'PART 1 — Lending' : 'PART 2 — Delayed Payments'}
      </p>

      {part === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Part 1 — Lending Experiences
          </h2>
          {part1Questions.map((q) => (
            <QuestionCard
              key={q.id}
              id={q.id}
              question={q.question}
              type={q.type}
              options={q.options}
              value={form[q.id]}
              onChange={(v) => updateForm(q.id, v)}
              required={q.required}
            />
          ))}
        </div>
      )}

      {part === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Part 2 — Delayed Payment Experiences
          </h2>
          {part2Questions.map((q) => (
            <QuestionCard
              key={q.id}
              id={q.id}
              question={q.question}
              type={q.type}
              options={q.options}
              value={form[q.id]}
              onChange={(v) => updateForm(q.id, v)}
              required={q.required}
            />
          ))}
          <div className="mt-6">
            <QuestionCard
              id={SURVEY_QUESTIONS.interest.id}
              question={SURVEY_QUESTIONS.interest.question}
              type={SURVEY_QUESTIONS.interest.type}
              options={SURVEY_QUESTIONS.interest.options}
              value={form[SURVEY_QUESTIONS.interest.id]}
              onChange={(v) => updateForm(SURVEY_QUESTIONS.interest.id, v)}
              required={SURVEY_QUESTIONS.interest.required}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        {part === 2 && (
          <button
            type="button"
            onClick={() => setPart(1)}
            className="flex-1 sm:flex-none px-6 py-3 sm:py-3.5 text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px] touch-manipulation"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 sm:flex-none px-6 py-3 sm:py-3.5 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-h-[44px] touch-manipulation"
        >
          {loading ? 'Submitting...' : part === 1 ? 'Next' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
