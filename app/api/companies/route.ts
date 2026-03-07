import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

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
    const { searchParams } = new URL(request.url);
    const ideaSlug = searchParams.get('ideaSlug');

    const db = await getDb();
    const companies = db.collection('companies');
    const filter = ideaSlug ? { ideaSlug } : {};
    const list = await companies.find(filter).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(
      list.map((c) => ({
        ...c,
        _id: c._id?.toString(),
      }))
    );
  } catch (error) {
    console.error('Companies fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { ideaSlug, companyName, companySlug: slug, notes } = body;

    if (!ideaSlug) {
      return NextResponse.json(
        { error: 'ideaSlug is required' },
        { status: 400 }
      );
    }

    if (!companyName) {
      return NextResponse.json(
        { error: 'companyName is required' },
        { status: 400 }
      );
    }

    const companySlug =
      slug ||
      companyName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    const db = await getDb();
    const ideas = db.collection('ideas');
    const companies = db.collection('companies');

    const idea = await ideas.findOne({ ideaSlug });
    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 400 }
      );
    }

    const existing = await companies.findOne({ ideaSlug, companySlug });
    if (existing) {
      return NextResponse.json(
        { error: 'Company slug already exists for this idea' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://simplesurvey.vercel.app';
    const surveyLink = `${baseUrl}/survey/${ideaSlug}/${companySlug}`;

    const doc = {
      ideaSlug,
      companyName,
      companySlug,
      createdAt: new Date(),
      surveyLink,
      notes: notes || '',
    };

    const result = await companies.insertOne(doc);
    return NextResponse.json({
      ...doc,
      _id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Company create error:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
