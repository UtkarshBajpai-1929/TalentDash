import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TalentDash | Salary Intelligence for India",
    template: "%s"
  },
  description: "Explore verified compensation intelligence for software and technology roles in India.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "TalentDash | Salary Intelligence for India",
    description: "Browse, filter, and compare compensation across top technology companies.",
    url: siteUrl,
    siteName: "TalentDash",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-[var(--border)] bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/salaries" className="text-xl font-bold tracking-tight text-[var(--text-deep)]">
              TalentDash
            </Link>
            <nav className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
              <Link className="rounded-md px-3 py-2 hover:bg-[#f7f7f7] hover:text-[var(--text-deep)]" href="/salaries">
                Salaries
              </Link>
              <Link className="rounded-md px-3 py-2 hover:bg-[#f7f7f7] hover:text-[var(--text-deep)]" href="/compare">
                Compare
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
