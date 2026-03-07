import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import type { Idea, IdeaQuestions } from '@/lib/types';

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return authHeader === `Bearer ${adminPassword}`;
}

function validateQuestions(q: unknown): q is IdeaQuestions {
  if (!q || typeof q !== 'object') return false;
  const obj = q as Record<string, unknown>;
  if (!Array.isArray(obj.part1) || !Array.isArray(obj.part2)) return false;
  if (obj.part3 !== undefined && !Array.isArray(obj.part3)) return false;
  if (!obj.interest || typeof obj.interest !== 'object') return false;
  const interest = obj.interest as Record<string, unknown>;
  return (
    typeof interest.id === 'string' &&
    typeof interest.question === 'string' &&
    Array.isArray(interest.options)
  );
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const db = await getDb();
    const ideas = db.collection<Idea>('ideas');
    const list = await ideas.find({}).sort({ createdAt: -1 }).toArray();
    const responses = db.collection('survey_responses');
    const withCounts = await Promise.all(
      list.map(async (idea) => {
        const count = await responses.countDocuments({ ideaSlug: idea.ideaSlug });
        return {
          ...idea,
          _id: idea._id?.toString(),
          responseCount: count,
        };
      })
    );
    return NextResponse.json(withCounts);
  } catch (error) {
    console.error('Ideas fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
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
    const { ideaName, ideaSlug: slug, headline, description, logo, questions } = body;

    if (!ideaName || !headline || !description || !logo || !questions) {
      return NextResponse.json(
        { error: 'ideaName, headline, description, logo, and questions are required' },
        { status: 400 }
      );
    }

    if (!validateQuestions(questions)) {
      return NextResponse.json(
        { error: 'Invalid questions structure. Must have part1 (array), part2 (array), interest (object with id, question, options)' },
        { status: 400 }
      );
    }

    const ideaSlug =
      slug ||
      ideaName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    const db = await getDb();
    const ideas = db.collection<Idea>('ideas');

    const existing = await ideas.findOne({ ideaSlug });
    if (existing) {
      return NextResponse.json(
        { error: 'Idea slug already exists' },
        { status: 400 }
      );
    }

    const doc: Omit<Idea, '_id'> = {
      ideaSlug,
      ideaName,
      logo,
      headline,
      description,
      questions: questions as IdeaQuestions,
      createdAt: new Date(),
    };

    const result = await ideas.insertOne(doc);
    return NextResponse.json({
      ...doc,
      _id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Idea create error:', error);
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}
