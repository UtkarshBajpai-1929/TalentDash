"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { convertSalaryValue, formatMoney } from "@/lib/salary";
import type { CompareApiResponse, SalaryRecord } from "@/types/salary";

const rows = [
  ["Company", "company"],
  ["Role", "role"],
  ["Level", "level"],
  ["Location", "location"],
  ["Experience", "experience_years"],
  ["Base", "base_salary"],
  ["Bonus", "bonus"],
  ["Stock", "stock"],
  ["Total Comp", "total_compensation"]
] as const;

function labelFor(salary: SalaryRecord) {
  return `${salary.company.name} - ${salary.role} - ${salary.level} - ${salary.location}`;
}

function numericValue(salary: SalaryRecord, key: string) {
  if (key === "experience_years") return salary.experience_years;
  if (key === "base_salary") return convertSalaryValue(salary.base_salary, salary.currency, "INR");
  if (key === "bonus") return convertSalaryValue(salary.bonus, salary.currency, "INR");
  if (key === "stock") return convertSalaryValue(salary.stock, salary.currency, "INR");
  if (key === "total_compensation") return convertSalaryValue(salary.total_compensation, salary.currency, "INR");
  return null;
}

function displayValue(salary: SalaryRecord, key: string) {
  if (key === "company") return salary.company.name;
  if (key === "role") return salary.role;
  if (key === "level") return <Badge level={salary.level}>{salary.level}</Badge>;
  if (key === "location") return salary.location;
  if (key === "experience_years") return `${salary.experience_years} yrs`;

  const value = numericValue(salary, key);
  if (value === null || value === undefined) return "—";
  return formatMoney(value, "INR");
}

function Delta({ left, right, keyName }: { left: SalaryRecord; right: SalaryRecord; keyName: string }) {
  const a = numericValue(left, keyName);
  const b = numericValue(right, keyName);

  if (a === null || b === null) return <span className="text-[var(--text-muted)]">-</span>;

  const delta = a - b;
  if (delta === 0) return <span className="font-semibold text-[#717171]">Equal</span>;

  const color = delta > 0 ? "#008A05" : "#FFB400";
  const prefix = delta > 0 ? "+" : "-";
  const text = keyName === "experience_years" ? `${prefix}${Math.abs(delta)} yrs` : `${prefix}${formatMoney(Math.abs(delta), "INR")}`;

  return (
    <span className="font-semibold" style={{ color }}>
      {text}
    </span>
  );
}

export function CompareClient({ salaries }: { salaries: SalaryRecord[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [comparison, setComparison] = useState<CompareApiResponse | null>(null);
  const [error, setError] = useState("");

  const s1 = searchParams.get("s1") ?? "";
  const s2 = searchParams.get("s2") ?? "";
  const c1 = searchParams.get("c1") ?? "";

  useEffect(() => {
    if (!s1 && c1) {
      const firstCompanySalary = salaries.find((salary) => salary.company.slug === c1);
      if (firstCompanySalary) router.replace(`/compare?s1=${firstCompanySalary.id}`);
    }
  }, [c1, router, s1, salaries]);

  useEffect(() => {
    if (!s1 || !s2 || s1 === s2) {
      setComparison(null);
      setError(s1 && s2 && s1 === s2 ? "Choose two different salary records." : "");
      return;
    }

    let cancelled = false;
    setError("");

    fetch(`/api/compare?s1=${encodeURIComponent(s1)}&s2=${encodeURIComponent(s2)}`)
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          throw new Error(body.error ?? "Unable to compare salary records.");
        }
        return response.json() as Promise<CompareApiResponse>;
      })
      .then((data) => {
        if (!cancelled) setComparison(data);
      })
      .catch((nextError: Error) => {
        if (!cancelled) {
          setComparison(null);
          setError(nextError.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [s1, s2]);

  const higherId = comparison?.higher_salary_id;
  const options = useMemo(() => salaries.map((salary) => ({ id: salary.id, label: labelFor(salary) })), [salaries]);

  function updateSelection(name: "s1" | "s2", value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("c1");
    if (value) next.set(name, value);
    else next.delete(name);
    startTransition(() => router.push(`/compare?${next.toString()}`));
  }

  return (
    <div className="mt-6">
      {/* Selector panel — key fix: w-full + min-w-0 + overflow-hidden on every flex/grid child */}
      <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-white p-4 md:grid-cols-2">
        {(["s1", "s2"] as const).map((name) => (
          <label key={name} className="flex min-w-0 flex-col gap-1 text-sm font-semibold text-(--text-deep)">
            {name === "s1" ? "First salary record" : "Second salary record"}
            {/* 
              THE FIX:
              - `w-full`      → fills the label's width
              - `min-w-0`     → allows shrinking below intrinsic content width
              - `max-w-full`  → hard cap so it can never overflow the parent
              - `truncate` on the select itself clips long option text
              Native <select> intrinsic width is driven by the longest <option>.
              Without these constraints it punches through the grid cell on mobile.
            */}
            <select
              className="focus-ring w-full min-w-0 max-w-full truncate rounded-md border border-[var(--border)] px-3 py-2 font-normal"
              value={name === "s1" ? s1 : s2}
              onChange={(event) => updateSelection(name, event.target.value)}
            >
              <option value="">Select a salary record</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-[#ffd6d3] bg-[#fff6f5] p-4 text-sm font-semibold text-[#D93025]">
          {error}
        </div>
      ) : null}

      {isPending ? (
        <div className="mt-6 rounded-lg border border-[var(--border)] bg-white p-4 text-sm text-[var(--text-muted)]">
          Updating comparison...
        </div>
      ) : null}

      {comparison ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border)] bg-white">
          {/* Header — on mobile stack vertically; on md+ keep the 3-col layout */}
          <div className="border-b border-[var(--border)] bg-[#fbfbfb] px-4 py-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-x-2">
              {/* Left company */}
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h2 className="truncate font-bold text-[var(--text-deep)]">{comparison.left.company.name}</h2>
                  {higherId === comparison.left.id ? (
                    <span className="shrink-0 rounded-full bg-[#0369A1] px-2.5 py-1 text-xs font-semibold text-white">
                      Higher TC ↑
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-sm text-[var(--text-muted)]">{comparison.left.role}</p>
              </div>

              {/* Delta label */}
              <div className="px-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Delta
              </div>

              {/* Right company */}
              <div className="min-w-0 text-right">
                <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
                  {higherId === comparison.right.id ? (
                    <span className="shrink-0 rounded-full bg-[#ff5a5f] px-2.5 py-1 text-xs font-semibold text-white">
                      Higher TC ↑
                    </span>
                  ) : null}
                  <h2 className="truncate font-bold text-[var(--text-deep)]">{comparison.right.company.name}</h2>
                </div>
                <p className="mt-1 truncate text-sm text-[var(--text-muted)]">{comparison.right.role}</p>
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[var(--border)]">
            {rows.map(([label, keyName], index) => (
              <div
                key={keyName}
                className={`grid grid-cols-[1fr_auto_1fr] items-center px-4 py-4 text-sm ${
                  index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                }`}
              >
                {/* Left value */}
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
                  <div
                    className={`mt-1 truncate ${
                      keyName === "total_compensation"
                        ? "text-[18px] font-bold text-[#ff5a5f]"
                        : "font-medium text-[var(--text-deep)]"
                    }`}
                  >
                    {displayValue(comparison.left, keyName)}
                  </div>
                </div>

                {/* Delta */}
                <div className="min-w-[5rem] px-3 text-center">
                  <Delta left={comparison.left} right={comparison.right} keyName={keyName} />
                </div>

                {/* Right value */}
                <div className="min-w-0 text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
                  <div
                    className={`mt-1 truncate ${
                      keyName === "total_compensation"
                        ? "text-[18px] font-bold text-[#ff5a5f]"
                        : "font-medium text-[var(--text-deep)]"
                    }`}
                  >
                    {displayValue(comparison.right, keyName)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !error ? (
        <div className="mt-6 rounded-lg border border-dashed border-[var(--border)] bg-white p-10 text-center text-[var(--text-muted)]">
          Pick two records to see compensation deltas.
        </div>
      ) : null}
    </div>
  );
}
