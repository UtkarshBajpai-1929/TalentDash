# TalentDash

TalentDash is a full-stack salary intelligence platform built to explore and compare software engineering salaries across companies, experience levels, locations, and roles.

Built using **Next.js App Router**, **Prisma**, and **PostgreSQL (Neon)** with a strong focus on **server-side rendering, SEO, caching strategies, and production-grade architecture**.

## Live Demo

**Website:**
https://talent-dash-sigma-puce.vercel.app

---

## Tech Stack

### Frontend

* Next.js 15 (App Router)
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* Prisma ORM
* PostgreSQL (Neon)

### Deployment

* Vercel

### SEO & Optimization

* React Server Components
* Incremental Static Regeneration (ISR)
* Dynamic Metadata
* JSON-LD Structured Data

---

## Getting Started

Clone the repository:

```bash
git clone <your-repo-url>
cd talentdash
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_database_url
NEXT_PUBLIC_SITE_URL=your_site_url
```

Generate Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Seed the database:

```bash
npx prisma db seed
```

Start the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## TalentDash Data Flow

TalentDash follows a server-first architecture:

```txt
PostgreSQL (Neon)
        ↓
      Prisma
        ↓
React Server Components
        ↓
  Server Rendered HTML
```

Most pages query **Prisma directly inside React Server Components** instead of making unnecessary internal API calls. This improves:

* SEO
* Performance
* Caching
* Server-side rendering efficiency

API routes are only used for:

* Salary ingestion
* External access
* Interactive client-side features
* Runtime boundaries

---

## Reviewer Flow

Seed the database:

```bash
npx prisma db seed
```

Visit:

```txt
/companies/amazon
```

to verify seeded database content.

Call:

```txt
POST /api/ingest-salary
```

using postman to add a salary record.

Then visit:

```txt
/salaries
```

after ISR revalidation to see updated server-rendered data.

---

## Rendering & Caching Strategy

### `/salaries`

Uses **React Server Components** and queries Prisma directly.

ISR:

```ts
export const revalidate = 300;
```

Salary listings are public content and can tolerate short-lived staleness, so the page avoids request-time rendering and unnecessary internal API calls.

---

### `/companies/[slug]`

Uses **static generation** with Prisma-backed `generateStaticParams()`.

```ts
const companies = await prisma.company.findMany({
  select: { slug: true },
});
```

ISR:

```ts
export const revalidate = 3600;
```

Company pages are public SEO-focused pages generated from database slugs.

---

### `/compare`

Uses:

```ts
export const revalidate = 86400;
```

The salary option list is server-rendered and cached.

The interactive comparison itself is client-driven and only calls:

```txt
/api/compare
```

after selecting salary records.

No page currently uses:

```ts
export const dynamic = "force-dynamic";
```

because there are no authenticated dashboards, session-specific pages, or real-time features requiring request-time rendering.

---

## API Cache Strategy

### Salaries API

```txt
GET /api/salaries

Cache-Control:
public, s-maxage=300,
stale-while-revalidate=3600
```

### Company API

```txt
GET /api/companies/:slug

Cache-Control:
public, s-maxage=3600,
stale-while-revalidate=86400
```

---

## SEO Strategy

TalentDash is optimized for discoverability and indexing using:

* Dynamic metadata
* Canonical URLs
* Open Graph tags
* JSON-LD structured data
* Server-rendered public pages

---

## Project Goals

The goal of this project was to build a **real-world production-style application** with:

* Clean architecture
* Scalable database design
* Proper caching strategy
* SEO best practices
* Server-side rendering
* Full-stack integration

---

## Learnings

While building TalentDash, I learned:

* Next.js App Router architecture
* Prisma + PostgreSQL workflow
* React Server Components
* Incremental Static Regeneration (ISR)
* SEO for production applications
* API route design
* Database modeling
* Real-world folder structuring
* Performance optimization



