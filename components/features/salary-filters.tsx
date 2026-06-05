"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DISPLAY_CURRENCIES, LEVELS } from "@/lib/constants";
import type {
  SalariesApiResponse,
  SalaryFilters as SalaryFiltersType,
} from "@/types/salary";
type Props = {
  filters: SalaryFiltersType;
  facets: SalariesApiResponse["facets"];
};
export function SalaryFilters({ filters, facets }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const selectedLevels = new Set(filters.levels ?? []);
  const formRef = useRef<HTMLFormElement>(null);
  const companySubmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [selectedCurrency, setSelectedCurrency] = useState(
    filters.currency ?? "INR",
  );

  function applyFilters() {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const nextParams = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      const stringValue = String(value).trim();
      if (!stringValue) continue;
      nextParams.append(key, stringValue);
    }

    nextParams.set("page", "1");

    startTransition(() => {
      router.replace(`/salaries?${nextParams.toString()}`, { scroll: false });
    });
  }

  function submitCompanyFilter() {
    if (companySubmitTimerRef.current) {
      clearTimeout(companySubmitTimerRef.current);
    }

    companySubmitTimerRef.current = setTimeout(applyFilters, 500);
  }

  function clearFilters() {
    if (companySubmitTimerRef.current) {
      clearTimeout(companySubmitTimerRef.current);
    }

    formRef.current?.reset();
    setSelectedCurrency("INR");
    startTransition(() => {
      router.replace("/salaries", { scroll: false });
    });
  }

  return (
    <form
      ref={formRef}
      action="/salaries"
      method="GET"
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters();
      }}
      className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-4"
    >
      <div className="grid gap-3 md:grid-cols-4">
        {/* Company */}
        <label className="grid gap-1 text-sm font-semibold text-[var(--text-deep)]">
          Company
          <input
            className="focus-ring rounded-md border border-[var(--border)] px-3 py-2 font-normal"
            name="company"
            placeholder="Amazon"
            defaultValue={filters.company ?? ""}
            onChange={submitCompanyFilter}
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-[var(--text-deep)]">
          Role
          <select
            className="focus-ring rounded-md border border-[var(--border)] px-3 py-2 font-normal"
            name="role"
            defaultValue={filters.role ?? ""}
            onChange={applyFilters}
          >
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
          <select
            className="focus-ring rounded-md border border-[var(--border)] px-3 py-2 font-normal"
            name="location"
            defaultValue={filters.location ?? ""}
            onChange={applyFilters}
          >
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
            {DISPLAY_CURRENCIES.map((currency) => {
              const isSelected = selectedCurrency === currency;

              return (
                <label
                  key={currency}
                  className={`flex flex-1 cursor-pointer items-center justify-center border-r border-[var(--border)] px-3 py-2 text-sm transition-colors last:border-r-0 ${
                    isSelected
                      ? "bg-[var(--accent)] text-white"
                      : "bg-white hover:bg-[#f7f7f7]"
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="currency"
                    value={currency}
                    checked={isSelected}
                    onChange={() => {
                      setSelectedCurrency(currency);
                      requestAnimationFrame(applyFilters);
                    }}
                  />
                  <span>{currency}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
      <fieldset className="grid gap-2 text-sm font-semibold text-[var(--text-deep)]">
        <legend>Level</legend>

        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <label
              key={level}
              className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium"
            >
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                name="level"
                value={level}
                defaultChecked={selectedLevels.has(level)}
                onChange={applyFilters}
              />
              {level}
            </label>
          ))}
        </div>
      </fieldset>
      <input type="hidden" name="sort" value={filters.sort} />
      <div className="flex flex-wrap gap-2">
        <button
          className="focus-ring rounded-md border border-[var(--border)] px-4 py-2 font-semibold text-[var(--text-deep)] hover:bg-[#f7f7f7]"
          type="button"
          onClick={clearFilters}
        >
          Clear all filters
        </button>
      </div>
      {isPending ? (
        <p
          className="text-sm font-semibold text-[#ff5a5f]"
          aria-live="polite"
        >
          Loading...
        </p>
      ) : null}
    </form>
  );
}
