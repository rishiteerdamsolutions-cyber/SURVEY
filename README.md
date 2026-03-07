# Multi-Tenant Survey Platform

Production-ready platform for collecting and analyzing survey responses. Create multiple "Ideas" (survey campaigns) with custom branding and questions, each with company-specific survey links.

## Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **MongoDB**
- **Chart.js** for analytics
- Deployable on **Vercel**

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required variables (see `CREDENTIALS.TXT` for MongoDB details):

- `MONGODB_URI` — MongoDB connection string
- `ADMIN_PASSWORD` — Password for Super Admin dashboard
- `NEXT_PUBLIC_BASE_URL` — Base URL (e.g. `https://your-domain.vercel.app`)

### 3. Migration (First Time)

If you have existing data, run the migration to add the ideas structure:

```bash
npm run migrate
```

### 4. Seed Example (Optional)

After migration, seed the LendAndBorrow idea with example companies:

```bash
npm run seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy
5. Run `npm run migrate` against your production MongoDB (or use a migration script that connects to prod)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/survey/[ideaSlug]/[companySlug]` | Public survey (e.g. `/survey/lendandborrow/zerodha`) |
| `/survey/[companySlug]` | Redirects to `/survey/lendandborrow/[companySlug]` (legacy) |
| `/thank-you` | Thank you page after submission |
| `/admin` | Super Admin dashboard (password protected) |
| `/admin/idea/[ideaSlug]` | Idea detail — manage companies |
| `/admin/idea/[ideaSlug]/company/[companySlug]` | Company analytics |

## Multi-Tenant Flow

1. **Super Admin** logs in at `/admin`
2. **Create Idea** — Upload logo, name, headline, description, and questions JSON file
3. **Manage Idea** — Create company survey links (e.g. Zerodha, Darwinbox)
4. **Survey links** — Each company gets `/survey/[ideaSlug]/[companySlug]`
5. **Analytics** — Per-company and global analytics

## Question JSON Template

Download the template from the admin dashboard or `/api/questions/template`. Structure:

- `part1` — Array of questions (id, question, type, options, required, optional showIf)
- `part2` — Array of questions
- `interest` — Object with id, question, type, options, required

Edit locally and upload when creating an idea.

## Scalability

The platform supports **1,000+ concurrent survey participants**. MongoDB connection pooling and Vercel serverless functions handle high traffic automatically.

## Features

- **Multi-idea** — Create multiple survey campaigns (e.g. LendAndBorrow, other products)
- **Custom branding** — Logo, name, headline, description per idea
- **Upload questions** — JSON file upload (no typing on website)
- **Company-specific links** — Each idea has its own companies
- **Anonymous responses** — No name, email, or phone collected
- **Analytics** — Lending stats, delayed payment stats, platform interest
- **Export PDF** — Per company and global, with password
- **Delete** — Companies and ideas (with password confirmation)
- **Mobile-first** — Optimized for phones, tablets, desktops
