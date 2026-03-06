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
    const db = await getDb();
    const companies = db.collection('companies');
    const list = await companies.find({}).sort({ createdAt: -1 }).toArray();
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
    const { companyName, companySlug: slug, notes } = body;

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
    const companies = db.collection('companies');

    const existing = await companies.findOne({ companySlug });
    if (existing) {
      return NextResponse.json(
        { error: 'Company slug already exists' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lendandborrow.in';
    const surveyLink = `${baseUrl}/survey/${companySlug}`;

    const doc = {
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
