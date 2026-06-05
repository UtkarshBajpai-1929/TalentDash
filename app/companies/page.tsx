import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://talent-dash-sigma-puce.vercel.app";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Companies | TalentDash";
  const description =
    "Browse company profiles and view software engineer salary data across top technology companies in India.";

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/companies` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/companies`,
      type: "website",
    },
  };
}

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
            Company directory
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-deep)]">
            Companies Across India
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--text-muted)]">
            Explore company profiles and open their salary pages.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.id} className="flex h-full flex-col p-5">
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-[var(--text-deep)]">
                  {company.name}
                </h2>
                <Badge tone="warning">{company.industry}</Badge>
              </div>

              <dl className="mt-4 grid gap-3 text-sm text-[var(--text-muted)]">
                <div>
                  <dt className="font-semibold text-[var(--text-deep)]">
                    Headquarters
                  </dt>
                  <dd>{company.headquarters}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--text-deep)]">
                    Founded
                  </dt>
                  <dd>{company.founded_year}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--text-deep)]">
                    Headcount
                  </dt>
                  <dd>{company.headcount_range || "NA"}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                className="focus-ring inline-flex justify-center rounded-md bg-[#ff5a5f] px-4 py-2 font-semibold"
                href={`/companies/${company.slug}`}
              >
                <span className="text-white">View Insights</span>
              </Link>
              <Link
                className="focus-ring inline-flex justify-center rounded-md border border-[var(--border)] bg-white px-4 py-2 font-semibold text-[var(--text-deep)] hover:bg-[#f7f7f7]"
                href={`/compare?c1=${company.slug}`}
              >
                Compare
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
