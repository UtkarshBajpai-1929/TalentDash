import Link from "next/link";
import type { Currency } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { convertSalaryValue, formatMoney } from "@/lib/salary";
import type { SalaryRecord, SalarySort } from "@/types/salary";

const sortableColumns: { label: string; key?: string; className?: string }[] = [
  { label: "Company", key: "company" },
  { label: "Role", key: "role" },
  { label: "Level", key: "level" },
  { label: "Location", key: "location" },
  { label: "Experience", key: "experience" },
  {label: "Confidence Score", key:"confidence_score"},
  { label: "Base Salary", key: "base_salary" },
  { label: "Stock", key: "stock" },
  { label: "Total Comp", key: "total_comp" },
];

function toggleSort(searchParams: URLSearchParams, key: string) {
  const current = searchParams.get("sort") ?? "total_comp_desc";
  const nextDirection = current === `${key}_desc` ? "asc" : "desc";
  const next = new URLSearchParams(searchParams);
  next.set("sort", `${key}_${nextDirection}`);
  next.set("page", "1");
  return `?${next.toString()}`;
}

function sortArrow(sort: SalarySort, key: string) {
  if (!sort.startsWith(`${key}_`)) return "";
  return sort.endsWith("_asc") ? " ↑" : " ↓";
}

function moneyOrDash(value: number | null | undefined, fromCurrency: Currency, displayCurrency: Currency) {
  if (value === null || value === undefined) return "—";
  return formatMoney(convertSalaryValue(value, fromCurrency, displayCurrency), displayCurrency);
}

export function SalaryTable({
  salaries,
  displayCurrency = "INR",
  searchParams,
  sort = "total_comp_desc"
}: {
  salaries: SalaryRecord[];
  displayCurrency?: Currency;
  searchParams?: URLSearchParams;
  sort?: SalarySort;
}) {
  if (salaries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-(--border) bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-[var(--text-deep)]">No records found for these filters. Try removing a filter.</h2>
        <Link className="mt-4 inline-flex font-semibold text-[#0369A1]" href="/salaries">
          Clear all filters
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[#fbfbfb] text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            <tr>
              {sortableColumns.map((column) => (
                <th key={column.label} className="whitespace-nowrap px-4 py-3">
                  {searchParams && column.key ? (
                    <Link href={toggleSort(searchParams, column.key)} className="hover:text-[var(--text-deep)]">
                      {column.label}
                      {sortArrow(sort, column.key)}
                    </Link>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {salaries.map((salary, index) => (
              <tr key={salary.id} className={`${index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"} hover:bg-[#F2F2F2]`}>
                <td className="whitespace-nowrap px-4 py-4 font-semibold text-[var(--text-deep)]">
                  <Link href={`/companies/${salary.company.slug}`} className="hover:text-[var(--accent)]">
                    {salary.company.name}
                  </Link>
                </td>
                <td className="min-w-48 px-4 py-4">{salary.role}</td>
                <td className="px-4 py-4">
                  <Badge level={salary.level}>{salary.level}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-4">{salary.location}</td>
                <td className="whitespace-nowrap px-4 py-4">{salary.experience_years} yrs</td>
                <td className="whitespace-nowrap px-4 py-4">{salary.confidence_score || "NA"} </td>
                <td className="whitespace-nowrap px-4 py-4">{moneyOrDash(salary.base_salary, salary.currency, displayCurrency)}</td>
                <td className="whitespace-nowrap px-4 py-4">{moneyOrDash(salary.stock, salary.currency, displayCurrency)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-[18px] font-bold text-(--accent)">
                  {moneyOrDash(salary.total_compensation, salary.currency, displayCurrency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
