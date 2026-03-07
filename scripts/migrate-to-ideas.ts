/**
 * Migration: Add ideas collection and ideaSlug to companies/responses
 * Run with: npm run migrate
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import path from 'path';
import questionTemplate from '../lib/questionTemplate.json';

const LENDANDBORROW_DESCRIPTION = `This anonymous survey aims to understand real-life experiences with informal lending and delayed payments.`;

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in .env.local');
    process.exit(1);
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://simplesurvey.vercel.app';

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('survey_db');
  const ideas = db.collection('ideas');
  const companies = db.collection('companies');
  const responses = db.collection('survey_responses');

  let logo = '';
  try {
    const logoPath = path.join(process.cwd(), 'public/logo.png');
    const buf = readFileSync(logoPath);
    logo = `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    console.warn('Could not read logo.png, using placeholder');
    logo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvZ288L3RleHQ+PC9zdmc+';
  }

  const existingIdea = await ideas.findOne({ ideaSlug: 'lendandborrow' });
  if (!existingIdea) {
    await ideas.insertOne({
      ideaSlug: 'lendandborrow',
      ideaName: 'LendAndBorrow',
      logo,
      headline: 'Real Life Lending & Payment Experience Survey',
      description: LENDANDBORROW_DESCRIPTION,
      questions: questionTemplate,
      createdAt: new Date(),
    });
    console.log('Created lendandborrow idea');
  } else {
    await ideas.updateOne(
      { ideaSlug: 'lendandborrow' },
      {
        $set: {
          description: LENDANDBORROW_DESCRIPTION,
          questions: questionTemplate,
        },
      }
    );
    console.log('Updated lendandborrow idea (short description, part3 questions)');
  }

  const companiesToUpdate = await companies.find({ ideaSlug: { $exists: false } }).toArray();
  if (companiesToUpdate.length > 0) {
    for (const c of companiesToUpdate) {
      await companies.updateOne(
        { _id: c._id },
        {
          $set: {
            ideaSlug: 'lendandborrow',
            surveyLink: `${baseUrl}/survey/lendandborrow/${c.companySlug}`,
          },
        }
      );
    }
    console.log(`Updated ${companiesToUpdate.length} companies with ideaSlug`);
  } else {
    console.log('All companies already have ideaSlug');
  }

  const responsesToUpdate = await responses.find({ ideaSlug: { $exists: false } }).toArray();
  if (responsesToUpdate.length > 0) {
    await responses.updateMany(
      { ideaSlug: { $exists: false } },
      { $set: { ideaSlug: 'lendandborrow' } }
    );
    console.log(`Updated ${responsesToUpdate.length} responses with ideaSlug`);
  } else {
    console.log('All responses already have ideaSlug');
  }

  await client.close();
  console.log('Migration complete.');
}

migrate().catch(console.error);
