import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

function verifyAdmin(request: NextRequest, password?: string): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  if (password && password === adminPassword) return true;
  return authHeader === `Bearer ${adminPassword}`;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password, ideaSlug } = body;

    if (!verifyAdmin(request, password)) {
      return NextResponse.json(
        { error: 'Password required and must be correct' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const db = await getDb();
    const companies = db.collection('companies');
    const responses = db.collection('survey_responses');

    const filter = ideaSlug
      ? { ideaSlug, companySlug: slug }
      : { companySlug: slug };
    const company = await companies.findOne(filter);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const delFilter = company.ideaSlug
      ? { ideaSlug: company.ideaSlug, companySlug: slug }
      : { companySlug: slug };
    await responses.deleteMany(delFilter);
    await companies.deleteOne(filter);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Company delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const ideaSlug = searchParams.get('ideaSlug');

    const db = await getDb();
    const companies = db.collection('companies');
    const filter = ideaSlug
      ? { ideaSlug, companySlug: slug }
      : { companySlug: slug };
    const company = await companies.findOne(filter);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...company,
      _id: company._id?.toString(),
    });
  } catch (error) {
    console.error('Company fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}
