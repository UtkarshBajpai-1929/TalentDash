import type { Metadata } from "next";
import { CompareClient } from "@/components/features/compare-client";
import { parseSalaryFilters } from "@/lib/api";
import { getSalariesData } from "@/lib/salaries-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://talent-dash-sigma-puce.vercel.app";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Compare Software Engineer Compensation Packages | TalentDash";
  const description = "Compare base salary, bonus, stock and total compensation for Software Engineer salary records in India.";
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/compare` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/compare`,
      type: "website"
    }
  };
}

export default async function ComparePage() {
  const filters = parseSalaryFilters(new URLSearchParams({ limit: "100", sort: "total_comp_desc" }));
  const salaryList = await getSalariesData(filters);
  const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Compare Software Engineer Salaries in India",
  description:
    "Compare software engineer salaries, compensation, and pay trends across tech companies in India.",
  url: `${siteUrl}/compare`,
  keywords: ["salary comparison", "software engineer salary india", "compare tech salaries", "engineering compensation", "salary benchmark"]
};
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">Compensation compare</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--text-deep)]">Compare Software Engineer Compensation Packages</h1>
        <p className="mt-2 max-w-2xl text-[var(--text-muted)]">Select two salary records and compare company, role, level, location, experience, base, bonus, stock and total compensation.</p>
      </div>

      <CompareClient salaries={salaryList.salaries} />
    </main>
  );
}
