import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
  const template = JSON.parse(
    readFileSync(path.join(process.cwd(), 'lib/questionTemplate.json'), 'utf-8')
  );
  return NextResponse.json(template, {
    headers: {
      'Content-Disposition': 'attachment; filename="question-template.json"',
    },
  });
}
