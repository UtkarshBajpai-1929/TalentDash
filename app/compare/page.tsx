export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { CompareClient } from "@/components/features/compare-client";
import { fetchApi } from "@/lib/api";
import type { SalariesApiResponse } from "@/types/salary";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://talentdash.com";

export const revalidate = 86400;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

export default async function ComparePage(_: PageProps) {
  const salaryList = await fetchApi<SalariesApiResponse>("/api/salaries", new URLSearchParams({ limit: "100", sort: "total_comp_desc" }), {
    next: { revalidate: 86400 }
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">Compensation compare</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--text-deep)]">Compare Software Engineer Compensation Packages</h1>
        <p className="mt-2 max-w-2xl text-[var(--text-muted)]">Select two salary records and compare company, role, level, location, experience, base, bonus, stock and total compensation.</p>
      </div>

      <CompareClient salaries={salaryList.salaries} />
    </main>
  );
}
