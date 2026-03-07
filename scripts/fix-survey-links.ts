/**
 * Migration: Update all company survey links to use the live URL
 * Run with: npm run fix-links
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';

const NEW_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://simplesurvey.vercel.app';

async function fixSurveyLinks() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('survey_db');
  const companies = db.collection('companies');

  const all = await companies.find({}).toArray();
  let updated = 0;

  for (const c of all) {
    const ideaSlug = c.ideaSlug || 'lendandborrow';
    const companySlug = c.companySlug;
    const newLink = `${NEW_BASE_URL}/survey/${ideaSlug}/${companySlug}`;

    if (c.surveyLink !== newLink) {
      await companies.updateOne(
        { _id: c._id },
        { $set: { surveyLink: newLink } }
      );
      console.log(`Updated ${c.companyName}: ${c.surveyLink} → ${newLink}`);
      updated++;
    }
  }

  await client.close();
  console.log(`Done. Updated ${updated} of ${all.length} companies to use ${NEW_BASE_URL}`);
}

fixSurveyLinks().catch(console.error);
