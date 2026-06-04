import Link from "next/link";

function hrefFor(searchParams: URLSearchParams, page: number) {
  const next = new URLSearchParams(searchParams);
  next.set("page", String(page));
  return `?${next.toString()}`;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  searchParams
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  searchParams: URLSearchParams;
}) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm sm:flex-row">
      <p className="text-[var(--text-muted)]">
        Showing <span className="font-semibold text-[var(--text-deep)]">{start}</span>-<span className="font-semibold text-[var(--text-deep)]">{end}</span> of{" "}
        <span className="font-semibold text-[var(--text-deep)]">{total.toLocaleString("en-IN")}</span> records
      </p>
      <div className="flex gap-2">
        <Link
          aria-disabled={page <= 1}
          className={`rounded-md border border-[var(--border)] px-3 py-2 font-semibold ${page <= 1 ? "pointer-events-none text-[#c4c4c4]" : "text-[var(--text-deep)] hover:bg-[#f7f7f7]"}`}
          href={hrefFor(searchParams, Math.max(1, page - 1))}
        >
          Previous
        </Link>
        <Link
          aria-disabled={page >= totalPages}
          className={`rounded-md border border-[var(--border)] px-3 py-2 font-semibold ${page >= totalPages ? "pointer-events-none text-[#c4c4c4]" : "text-[var(--text-deep)] hover:bg-[#f7f7f7]"}`}
          href={hrefFor(searchParams, Math.min(totalPages, page + 1))}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
