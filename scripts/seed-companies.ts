/**
 * Seed example companies under lendandborrow idea.
 * Run migrate first: npm run migrate
 * Then: npm run seed
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';

const IDEA_SLUG = 'lendandborrow';
const COMPANIES = [
  { name: 'Zerodha', slug: 'zerodha' },
  { name: 'Darwinbox', slug: 'darwinbox' },
  { name: 'Infosys', slug: 'infosys' },
  { name: 'Startup Founders Network', slug: 'startup-founders' },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in .env.local');
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('survey_db');
  const ideas = db.collection('ideas');
  const col = db.collection('companies');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const idea = await ideas.findOne({ ideaSlug: IDEA_SLUG });
  if (!idea) {
    console.error('Run npm run migrate first to create the lendandborrow idea');
    process.exit(1);
  }

  for (const c of COMPANIES) {
    const existing = await col.findOne({ ideaSlug: IDEA_SLUG, companySlug: c.slug });
    if (!existing) {
      await col.insertOne({
        ideaSlug: IDEA_SLUG,
        companyName: c.name,
        companySlug: c.slug,
        createdAt: new Date(),
        surveyLink: `${baseUrl}/survey/${IDEA_SLUG}/${c.slug}`,
        notes: '',
      });
      console.log(`Created: ${c.name} -> /survey/${IDEA_SLUG}/${c.slug}`);
    } else {
      console.log(`Exists: ${c.name}`);
    }
  }
  await client.close();
  console.log('Done.');
}

seed().catch(console.error);
