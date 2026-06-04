This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## TalentDash Data Flow

TalentDash is implemented as a full-stack App Router project:

```txt
PostgreSQL / Neon
-> Prisma
-> React Server Component
-> rendered HTML
```

Server-rendered pages query Prisma directly from React Server Components. API routes remain for external clients, browser runtime boundaries, and the salary ingestion endpoint.

The reviewer flow is:

```bash
npx prisma db seed
```

Then visit [http://localhost:3000/companies/amazon](http://localhost:3000/companies/amazon) to verify seeded database content, call `POST /api/ingest-salary` to add a salary record, and visit `/salaries` after an ISR revalidation cycle to see the new record in rendered HTML.

## Rendering And Caching Strategy

`/salaries` uses React Server Components and queries Prisma directly through shared server data functions. It uses ISR with:

```ts
export const revalidate = 300;
```

Salary listings are public content and can tolerate short-lived staleness, so they should not render dynamically on every request or make internal HTTP calls to their own API routes.

`/companies/[slug]` uses static generation with a real Prisma-backed `generateStaticParams()` query:

```ts
const companies = await prisma.company.findMany({ select: { slug: true } });
```

Company pages are public SEO content. Existing company pages are generated from database slugs, and new companies appear after redeploy when `generateStaticParams()` runs again. The page also uses `revalidate = 3600` so company salary summaries can refresh without request-time rendering or an internal API roundtrip.

`/compare` uses `revalidate = 86400` for the initial public salary option list, which is loaded directly through Prisma in the Server Component. The interactive comparison itself is client-driven and calls `/api/compare` only after the user selects two salary records, so the page does not require `force-dynamic`.

No page currently uses `export const dynamic = "force-dynamic"` because there is no authenticated, session-specific, admin, dashboard, or real-time page that requires request-time rendering.

API responses set CDN cache headers:

```txt
GET /api/salaries
Cache-Control: public, s-maxage=300, stale-while-revalidate=3600

GET /api/companies/:slug
Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
