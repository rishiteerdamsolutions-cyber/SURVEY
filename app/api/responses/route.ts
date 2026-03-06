import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import type { SurveyResponse, AnswersPart1, AnswersPart2 } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companySlug, answersPart1, answersPart2, earlyAccessInterest } = body;

    if (!companySlug || !answersPart1 || !answersPart2) {
      return NextResponse.json(
        { error: 'Missing required fields: companySlug, answersPart1, answersPart2' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const companies = db.collection('companies');
    const company = await companies.findOne({ companySlug });
    if (!company) {
      return NextResponse.json({ error: 'Invalid company slug' }, { status: 400 });
    }

    const response: Omit<SurveyResponse, '_id'> = {
      companySlug,
      answersPart1: answersPart1 as AnswersPart1,
      answersPart2: answersPart2 as AnswersPart2,
      earlyAccessInterest: earlyAccessInterest || 'no',
      createdAt: new Date(),
    };

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
