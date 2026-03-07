import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import type { SurveyResponse, AnswersPart1, AnswersPart2 } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ideaSlug, companySlug, answersPart1, answersPart2, earlyAccessInterest, answers } = body;

    if (!companySlug) {
      return NextResponse.json(
        { error: 'Missing required field: companySlug' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const companies = db.collection('companies');

    const filter = ideaSlug
      ? { ideaSlug, companySlug }
      : { companySlug };
    const company = await companies.findOne(filter);
    if (!company) {
      return NextResponse.json({ error: 'Invalid company slug' }, { status: 400 });
    }

    const resolvedIdeaSlug = company.ideaSlug ?? ideaSlug ?? 'lendandborrow';

    const response: Omit<SurveyResponse, '_id'> = {
      ideaSlug: resolvedIdeaSlug,
      companySlug,
      createdAt: new Date(),
    };

    if (answersPart1 && answersPart2) {
      response.answersPart1 = answersPart1 as AnswersPart1;
      response.answersPart2 = answersPart2 as AnswersPart2;
      response.earlyAccessInterest = earlyAccessInterest || 'no';
    } else if (answers) {
      response.answers = answers as Record<string, string>;
    } else {
      return NextResponse.json(
        { error: 'Missing answers: provide answersPart1+answersPart2 or answers' },
        { status: 400 }
      );
    }

    const responses = db.collection('survey_responses');
    const result = await responses.insertOne(response);

    return NextResponse.json({
      success: true,
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Survey submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    );
  }
}
