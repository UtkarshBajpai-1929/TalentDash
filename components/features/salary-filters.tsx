import Link from "next/link";
import { DISPLAY_CURRENCIES, LEVELS } from "@/lib/constants";
import type { SalariesApiResponse, SalaryFilters } from "@/types/salary";

export function SalaryFilters({ filters, facets }: { filters: SalaryFilters; facets: SalariesApiResponse["facets"] }) {
  const selectedLevels = new Set(filters.levels ?? []);

  return (
    <form action="/salaries" method="GET" className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <label className="grid gap-1 text-sm font-semibold text-[var(--text-deep)]">
          Company
          <input className="focus-ring rounded-md border border-[var(--border)] px-3 py-2 font-normal" name="company" placeholder="Amazon" defaultValue={filters.company ?? ""} />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-[var(--text-deep)]">
          Role
          <select className="focus-ring rounded-md border border-[var(--border)] px-3 py-2 font-normal" name="role" defaultValue={filters.role ?? ""}>
            <option value="">All roles</option>
            {facets.roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-[var(--text-deep)]">
          Location
          <select className="focus-ring rounded-md border border-[var(--border)] px-3 py-2 font-normal" name="location" defaultValue={filters.location ?? ""}>
            <option value="">All locations</option>
            {facets.locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="grid gap-1 text-sm font-semibold text-[var(--text-deep)]">
          <legend>Currency</legend>
          <div className="flex overflow-hidden rounded-md border border-[var(--border)]">
            {DISPLAY_CURRENCIES.map((currency) => (
              <label
                key={currency}
                className={`flex flex-1 cursor-pointer items-center justify-center border-r border-[var(--border)] px-3 py-2 text-sm last:border-r-0 ${
                  (filters.currency ?? "INR") === currency ? "bg-[var(--accent)] text-white" : "bg-white hover:bg-[#f7f7f7]"
                }`}
              >
                <input className="sr-only" type="radio" name="currency" value={currency} defaultChecked={(filters.currency ?? "INR") === currency} />
                <span>{currency}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset className="grid gap-2 text-sm font-semibold text-[var(--text-deep)]">
        <legend>Level</legend>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <label key={level} className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium">
              <input type="checkbox" className="accent-[var(--accent)]" name="level" value={level} defaultChecked={selectedLevels.has(level)} />
              {level}
            </label>
          ))}
        </div>
      </fieldset>

      <input type="hidden" name="sort" value={filters.sort} />
      <div className="flex flex-wrap gap-2">
        <button className="focus-ring rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-white hover:bg-[#e04e53]" type="submit">
          Apply filters
        </button>
        <Link className="focus-ring rounded-md border border-[var(--border)] px-4 py-2 font-semibold text-[var(--text-deep)] hover:bg-[#f7f7f7]" href="/salaries">
          Clear all filters
        </Link>
      </div>
    </form>
  );
}
