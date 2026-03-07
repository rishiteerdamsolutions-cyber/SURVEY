import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { calculateGlobalAnalytics } from '@/lib/analyticsEngine';
import type { SurveyResponse } from '@/lib/types';

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return authHeader === `Bearer ${adminPassword}`;
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const db = await getDb();
    const responses = await db
      .collection<SurveyResponse>('survey_responses')
      .find({})
      .toArray();

    const byCompany = responses.reduce<Record<string, SurveyResponse[]>>((acc, r) => {
      const key = r.ideaSlug ? `${r.ideaSlug}:${r.companySlug}` : r.companySlug;
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    }, {});

    const allResponses = Object.entries(byCompany).map(([key, rs]) => {
      const first = rs[0];
      const companySlug = first?.ideaSlug ? key.split(':')[1]! : key;
      const ideaSlug = first?.ideaSlug;
      return { companySlug, ideaSlug, responses: rs };
    });

    const analytics = calculateGlobalAnalytics(allResponses);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Global analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
