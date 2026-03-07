import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import type { Idea } from '@/lib/types';

function verifyAdmin(request: NextRequest, password?: string): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  if (password && password === adminPassword) return true;
  return authHeader === `Bearer ${adminPassword}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ideaSlug: string }> }
) {
  try {
    const { ideaSlug } = await params;
    const db = await getDb();
    const ideas = db.collection<Idea>('ideas');
    const idea = await ideas.findOne({ ideaSlug });
    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...idea,
      _id: idea._id?.toString(),
    });
  } catch (error) {
    console.error('Idea fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch idea' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ideaSlug: string }> }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!verifyAdmin(request, password)) {
      return NextResponse.json(
        { error: 'Password required and must be correct' },
        { status: 401 }
      );
    }

    const { ideaSlug } = await params;
    const db = await getDb();
    const ideas = db.collection('ideas');
    const companies = db.collection('companies');
    const responses = db.collection('survey_responses');

    const idea = await ideas.findOne({ ideaSlug });
    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    await responses.deleteMany({ ideaSlug });
    await companies.deleteMany({ ideaSlug });
    await ideas.deleteOne({ ideaSlug });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Idea delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    );
  }
}
