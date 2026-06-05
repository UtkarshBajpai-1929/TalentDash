import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanySalaryInsights } from "@/components/features/company-salary-insights";
import { Badge } from "@/components/ui/badge";
import { getCompanyData } from "@/lib/company-data";
import { prisma } from "@/lib/prisma";
import { formatCompactMoney } from "@/lib/salary";

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
export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCompanyData(slug);
  if (!data) notFound();

  const { company, salaries, level_distribution: levelDistribution } = data;
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

      <div className="mt-6">
        <CompanySalaryInsights company={company} salaries={salaries} />
      </div>
    </main>
  );
}
