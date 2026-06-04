export function TableSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4">
      <div className="h-8 w-64 animate-pulse rounded bg-[#ebebeb]" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4">
            <div className="h-5 animate-pulse rounded bg-[#ebebeb]" />
            <div className="h-5 animate-pulse rounded bg-[#ebebeb]" />
            <div className="h-5 animate-pulse rounded bg-[#ebebeb]" />
            <div className="h-5 animate-pulse rounded bg-[#ebebeb]" />
          </div>
        ))}
      </div>
    </div>
  );
}
