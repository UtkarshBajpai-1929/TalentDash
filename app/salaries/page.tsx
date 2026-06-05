import { SalaryFilters } from "@/components/features/salary-filters";
import { SalaryTable } from "@/components/features/salary-table";
import { Pagination } from "@/components/features/pagination";
import { StatCard } from "@/components/ui/stat-card";
import { parseSalaryFilters } from "@/lib/api";
import { getSalariesData } from "@/lib/salaries-data";
import { formatCompactMoney } from "@/lib/salary";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://talent-dash-sigma-puce.vercel.app";

export const revalidate = 300;

export async function generateMetadata() {
  const title = "Software Engineer Salaries in India | TalentDash";
  const description = "Compare Software Engineer salaries in India by company,experience, level, location, and total compensation.Explore verified salary data for Google, Microsoft, Amazon,and top tech companies."

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/salaries` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/salaries`,
      type: "website"
    }
  };
}
type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toURLSearchParams(input: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value) params.set(key, value);
  }
  return params;
}

export default async function SalariesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = toURLSearchParams(resolvedSearchParams);
  const filters = parseSalaryFilters(urlSearchParams);
  const data = await getSalariesData(filters);
  const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'TalentDash India Tech Salary Data',
  description: 'Structured compensation data for software engineers and tech professionals in India',
  url: 'https://talent-dash-sigma-puce.vercel.app/salaries',
  creator: { '@type': 'Organization', name: 'TalentDash' },
  keywords: ['salary', 'compensation', 'software engineer', 'India', 'tech jobs','software development'],
 };
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">Salary intelligence</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-deep)]">Software engineer salaries in India</h1>
          <p className="mt-2 max-w-2xl text-[var(--text-muted)]">Browse compensation records with company, level, location, and currency filters that persist in the URL.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Records" valueClassName="text-[#ff5a5f]" value={data.pagination.total.toLocaleString("en-IN")} detail="Matching current filters" />
        <StatCard label="Average TC" valueClassName="text-[#ff5a5f]" value={formatCompactMoney(data.stats.average_total_compensation, filters.currency ?? "INR")} detail="Across visible dataset" />
        <StatCard label="Highest TC" valueClassName="text-[#ff5a5f]" value={formatCompactMoney(data.stats.highest_total_compensation, filters.currency ?? "INR")} detail="Sorted records supported" />
      </div>

      <div className="mt-6">
        <SalaryFilters filters={filters} facets={data.facets} />
      </div>
      <div className="mt-6">
        <SalaryTable salaries={data.salaries} displayCurrency={filters.currency ?? "INR"} searchParams={urlSearchParams} sort={filters.sort} />
      </div>
      <div className="mt-4">
        <Pagination page={data.pagination.page} totalPages={data.pagination.total_pages} total={data.pagination.total} limit={data.pagination.limit} searchParams={urlSearchParams} />
      </div>
    </main>
  );
}
