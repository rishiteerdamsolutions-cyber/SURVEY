# LendAndBorrow — Problem Validation Survey Platform

Production-ready web application for collecting and analyzing survey responses about informal lending and delayed payments.

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
- `ADMIN_PASSWORD` — Password for admin dashboard
- `NEXT_PUBLIC_BASE_URL` — Base URL (e.g. `https://your-domain.vercel.app`)

### 3. Seed Example Companies (Optional)

Create the example companies (Zerodha, Darwinbox, Infosys, Startup Founders Network) via the Admin Dashboard, or run:

```bash
npx tsx scripts/seed-companies.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/survey/[companySlug]` | Public survey (e.g. `/survey/zerodha`) |
| `/thank-you` | Thank you page after submission |
| `/admin` | Admin dashboard (password protected) |
| `/admin/company/[companySlug]` | Company analytics |

## Features

- **Company-specific survey links** — Each company gets a unique `/survey/[slug]` link
- **Anonymous responses** — No name, email, or phone collected
- **Admin dashboard** — Create companies, view responses, analytics
- **Analytics** — Lending stats, delayed payment stats, platform interest
- **Mobile-first** — Optimized for phones, tablets, desktops
