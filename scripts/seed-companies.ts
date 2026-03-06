/**
 * Seed example companies. Run with: npm run seed
 * Requires MONGODB_URI in .env.local
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';

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
  const col = db.collection('companies');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  for (const c of COMPANIES) {
    const existing = await col.findOne({ companySlug: c.slug });
    if (!existing) {
      await col.insertOne({
        companyName: c.name,
        companySlug: c.slug,
        createdAt: new Date(),
        surveyLink: `${baseUrl}/survey/${c.slug}`,
        notes: '',
      });
      console.log(`Created: ${c.name} -> /survey/${c.slug}`);
    } else {
      console.log(`Exists: ${c.name}`);
    }
  }
  await client.close();
  console.log('Done.');
}

seed().catch(console.error);
