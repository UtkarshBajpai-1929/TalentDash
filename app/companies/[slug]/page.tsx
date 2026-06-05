import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SalaryTable } from "@/components/features/salary-table";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { getCompanyData } from "@/lib/company-data";
import { prisma } from "@/lib/prisma";
import { formatCompactMoney } from "@/lib/salary";
import type { Level } from "@prisma/client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://talent-dash-sigma-puce.vercel.app";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const companies = await prisma.company.findMany({ select: { slug: true } });
  return companies.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company
    .findUnique({
      where: { slug },
      include: { salaries: { select: { total_compensation: true, level: true, location: true } } }
    })
    .catch(() => null);
  const name = company?.name ?? "Company";
  const median = company?.salaries.length
    ? formatCompactMoney(
        [...company.salaries].sort((a, b) => a.total_compensation - b.total_compensation)[Math.floor(company.salaries.length / 2)].total_compensation,
        "INR"
      )
    : "competitive";
  const levels = Array.from(new Set(company?.salaries.map((salary) => salary.level) ?? [])).slice(0, 4).join(" to ") || "multiple levels";
  const locations = Array.from(new Set(company?.salaries.map((salary) => salary.location) ?? [])).slice(0, 3).join(", ") || "India";
  const title = `Software Engineer Salaries at ${name} India | TalentDash`;
  const description = `Verified compensation data for Software Engineers at ${name} India. Median TC ${median}. Browse ${levels} salaries across ${locations} and more.`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/companies/${slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/companies/${slug}`,
      type: "website"
    },
  };
}
function levelBarColor(level: string) {
if (level === "L3" || level === "SDE_I") return "#CBB98D"; 
if (level === "L4" || level === "SDE_II") return "#D6BFA3"; 
if (level === "L5" || level === "SDE_III") return "#B8A7D9"; 
if (level === "L6" || level === "STAFF") return "#8FA8C7"; 
return "#ff5a5f"; 
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCompanyData(slug);
  if (!data) notFound();

  const { company, salaries, median_total_compensation: medianTotal, level_distribution: levelDistribution } = data;
  const updatedSalaries = salaries.filter(salary=> salary.currency === "INR");
  const { minTotal, maxTotal } = updatedSalaries.reduce(
  (acc, salary) => ({
    minTotal: Math.min(acc.minTotal, salary.total_compensation),
    maxTotal: Math.max(acc.maxTotal, salary.total_compensation),
  }),
  {
    minTotal: Infinity,
    maxTotal: -Infinity,
  }
);

const finalMin = minTotal === Infinity ? 0 : minTotal;
const finalMax = maxTotal === -Infinity ? 0 : maxTotal;
const currency = salaries[0]?.currency ?? "INR";
const headquartersCity = company.headquarters.split(",")[0];
const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Software Engineer Salaries at ${company.name} India`,
    description: `Structured compensation data for Software Engineers at ${company.name} across experience levels`,
    keywords: ["salary", "compensation", company.name, "Software Engineer", "India", ...Object.keys(levelDistribution)]
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="rounded-lg border border-[var(--border)] bg-white p-6">
        <Badge tone="warning">{company.industry}</Badge>
        <h1 className="mt-3 text-3xl font-bold text-[var(--text-deep)]">Salaries at {company.name} India</h1>
        <dl className="mt-4 grid gap-3 text-sm text-[var(--text-muted)] sm:grid-cols-3">
          <div><dt className="font-semibold text-[var(--text-deep)]">Headquarters</dt><dd>{headquartersCity}</dd></div>
          <div><dt className="font-semibold text-[var(--text-deep)]">Founded</dt><dd>{company.founded_year}</dd></div>
          <div><dt className="font-semibold text-[var(--text-deep)]">Headcount</dt><dd>
            {company.headcount_range || "NA"}
            </dd></div>
        </dl>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Median Total Comp" value={formatCompactMoney(medianTotal, currency)} valueClassName="text-3xl text-[#ff5a5f]" />
        <StatCard label="Compensation range" value={`${formatCompactMoney(finalMin, currency)} - ${formatCompactMoney(finalMax, currency)}`} />
        <StatCard label="Record count" value={`${salaries.length.toLocaleString("en-IN")} data points`} />
        <StatCard label="Top level" value={Object.entries(levelDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A"} />
      </div>

      <section className="mt-6 rounded-lg border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-bold text-[var(--text-deep)]">Level distribution</h2>
        <div className="mt-4 flex h-5 overflow-hidden rounded-full bg-[#f1f1f1]">
          {Object.entries(levelDistribution).map(([level, count]) => (
            <div
              key={level}
              title={`${level}: ${count} records`}
              style={{ width: `${(count / salaries.length) * 100}%`, backgroundColor: levelBarColor(level) }}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(levelDistribution).map(([level, count]) => (
            <div key={level} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Badge level={level as Level}>{level}</Badge>
              <span>{Math.round((count / salaries.length) * 100)}%</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6">
        <SalaryTable salaries={salaries} displayCurrency={currency} />
      </div>

      <div className="mt-6">
        <Link className="focus-ring inline-flex rounded-md bg-[#ff5a5f] px-4 py-2 font-semibold text-white" href={`/compare?c1=${company.slug}`}>
          Compare with another company
        </Link>
      </div>
    </main>
  );
}
