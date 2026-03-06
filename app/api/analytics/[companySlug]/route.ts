import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { calculateCompanyAnalytics } from '@/lib/analyticsEngine';
import type { SurveyResponse } from '@/lib/types';

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return authHeader === `Bearer ${adminPassword}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { companySlug } = await params;
    const db = await getDb();
    const responses = await db
      .collection<SurveyResponse>('survey_responses')
      .find({ companySlug })
      .toArray();

    const analytics = calculateCompanyAnalytics(responses, companySlug);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
