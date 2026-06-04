import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">404</p>
      <h1 className="mt-3 text-3xl font-bold text-[var(--text-deep)]">This page is not in the compensation dataset.</h1>
      <p className="mt-3 text-[var(--text-muted)]">Try browsing salaries or comparing two compensation records.</p>
      <Link className="mt-8 inline-flex rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-white" href="/salaries">
        Browse salaries
      </Link>
    </main>
  );
}
