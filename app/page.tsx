import type { Metadata } from "next";
import { redirect } from "next/navigation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://talentdash.com";

export const revalidate = 3600;
//meta data for SEO
export async function generateMetadata(): Promise<Metadata> {
  const title = "TalentDash | Software Engineer Salaries in India";
  const description = "Browse and compare Software Engineer compensation across top technology companies in India.";

  return {
    title,
    description,
    alternates: { canonical: siteUrl },
    openGraph: {
      title,
      description,
      url: siteUrl,
      type: "website"
    }
  };
}

export default function HomePage() {
  redirect("/salaries");
}
