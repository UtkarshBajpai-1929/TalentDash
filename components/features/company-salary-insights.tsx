"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CompanySummary, SalaryRecord } from "@/types/salary";

const experienceBuckets = [
  { label: "0-1 Yrs", min: 0, max: 1 },
  { label: "1-3 Yrs", min: 1, max: 3 },
  { label: "3-5 Yrs", min: 3, max: 5 },
  { label: "5-8 Yrs", min: 5, max: 8 },
  { label: "8-12 Yrs", min: 8, max: 12 },
  { label: "12+ Yrs", min: 12, max: Infinity },
];

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function shortInr(value: number) {
  if (!value) return "\u20B90";
  if (value >= 10000000) return `\u20B9${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `\u20B9${(value / 100000).toFixed(1)}L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function roleLabel(role: string) {
  return role
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getRoleSummaries(salaries: SalaryRecord[]) {
  const groups = new Map<string, SalaryRecord[]>();

  for (const salary of salaries) {
    const role = roleLabel(salary.role);
    groups.set(role, [...(groups.get(role) ?? []), salary]);
  }

  return Array.from(groups.entries())
    .map(([role, roleSalaries]) => {
      const totals = roleSalaries.map((salary) => salary.total_compensation);
      return {
        role,
        count: roleSalaries.length,
        averageTotal: average(totals),
        minTotal: Math.min(...totals),
        maxTotal: Math.max(...totals),
        salaries: roleSalaries,
      };
    })
    .sort((left, right) => right.count - left.count || right.averageTotal - left.averageTotal);
}

type Props = {
  company: CompanySummary;
  salaries: SalaryRecord[];
};

export function CompanySalaryInsights({ company, salaries }: Props) {
  const inrSalaries = useMemo(
    () => salaries.filter((salary) => salary.currency === "INR"),
    [salaries],
  );
  const displaySalaries = inrSalaries.length ? inrSalaries : salaries;
  const roleSummaries = useMemo(
    () => getRoleSummaries(displaySalaries),
    [displaySalaries],
  );
  const [selectedRoleName, setSelectedRoleName] = useState(roleSummaries[0]?.role ?? "");
  const selectedRole =
    roleSummaries.find((summary) => summary.role === selectedRoleName) ??
    roleSummaries[0];

  if (!selectedRole) {
    return (
      <section className="rounded-lg border border-dashed border-[var(--border)] bg-white p-8 text-center text-[var(--text-muted)]">
        No salary data is available for this company yet.
      </section>
    );
  }

  const selectedSalaries = selectedRole.salaries;
  const minTotal = selectedRole.minTotal;
  const maxTotal = selectedRole.maxTotal;
  const averageTotal = selectedRole.averageTotal;
  const range = Math.max(maxTotal - minTotal, 1);
  const averageOffset = Math.min(100, Math.max(0, ((averageTotal - minTotal) / range) * 100));
  const rangeStart = 18;
  const rangeWidth = Math.max(28, Math.min(72, 100 - rangeStart - (100 - averageOffset) * 0.3));

  const bucketRows = experienceBuckets.map((bucket) => {
    const bucketSalaries = selectedSalaries.filter(
      (salary) => salary.experience_years >= bucket.min && salary.experience_years < bucket.max,
    );
    return {
      label: bucket.label,
      value: average(bucketSalaries.map((salary) => salary.total_compensation)),
      count: bucketSalaries.length,
    };
  });
  const maxBucketValue = Math.max(...bucketRows.map((bucket) => bucket.value), 1);

  const basePay = average(selectedSalaries.map((salary) => salary.base_salary));
  const bonus = average(selectedSalaries.map((salary) => salary.bonus));
  const equity = average(selectedSalaries.map((salary) => salary.stock));
  const benefits = Math.max(0, averageTotal - basePay - bonus - equity);
  const breakdown = [
    { label: "Base Pay", value: basePay },
    { label: "Bonus", value: bonus },
    { label: "Equity", value: equity },
    { label: "Benefits", value: benefits },
  ];

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(240px,300px)_1fr]">
      <aside className="rounded-lg border border-[var(--border)] bg-white">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] p-5">
          <div>
            <h2 className="font-bold text-[var(--text-deep)]">All Roles</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{roleSummaries.length.toLocaleString("en-IN")} roles</p>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {roleSummaries.slice(0, 8).map((summary) => {
            const isSelected = summary.role === selectedRole.role;
            return (
              <button
                key={summary.role}
                className={`focus-ring relative flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${
                  isSelected ? "bg-[#fff3f5] text-[#ff4f69]" : "bg-white text-[var(--text-deep)]"
                }`}
                type="button"
                onClick={() => setSelectedRoleName(summary.role)}
                aria-pressed={isSelected}
              >
                {isSelected ? <span className="absolute left-0 top-3 h-[calc(100%-1.5rem)] w-1 rounded-r bg-[#ff4f69]" /> : null}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{summary.role}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{summary.count.toLocaleString("en-IN")} reports</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold">{shortInr(summary.averageTotal)} /yr</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {shortInr(summary.minTotal)} - {shortInr(summary.maxTotal)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <Link
          className="focus-ring m-5 flex items-center justify-center rounded-md border border-[#ffd5dc] bg-[#fff6f7] px-4 py-3 text-sm font-bold text-[#ff4f69]"
          href={`/salaries?company=${encodeURIComponent(company.name)}`}
        >
          View all {displaySalaries.length.toLocaleString("en-IN")} salaries
        </Link>
      </aside>

      <div className="rounded-lg border border-[var(--border)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[var(--text-deep)]">{selectedRole.role}</h1>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#4fb76d] text-xs font-bold text-white">{"\u2713"}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {selectedSalaries.length.toLocaleString("en-IN")} salaries submitted {"\u00B7"} Updated June 2026
            </p>
          </div>
          <div className="flex gap-2">
            <button className="focus-ring rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-deep)]" type="button">
              Save
            </button>
            <button className="focus-ring rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-deep)]" type="button">
              Share
            </button>
          </div>
        </div>

        <div className="mt-7">
          <p className="text-sm font-bold text-[var(--text-deep)]">Total Pay (Annual)</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <p className="text-4xl font-bold text-[var(--text-deep)]">{shortInr(averageTotal)}</p>
            <p className="pb-1 text-sm font-semibold text-[var(--text-muted)]">/ year</p>
            <span className="mb-1 rounded-full bg-[#e9f7ea] px-2 py-1 text-xs font-bold text-[#008a05]">+8%</span>
            <span className="mb-1 text-xs text-[var(--text-muted)]">vs last year</span>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-sm font-bold text-[var(--text-deep)]">
              <span>{shortInr(minTotal)}</span>
              <span>{shortInr(maxTotal)}</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-[#f0ecee]">
              <div
                className="relative h-3 rounded-full bg-gradient-to-r from-[#ffd7df] to-[#ff4f69]"
                style={{ marginLeft: `${rangeStart}%`, width: `${rangeWidth}%` }}
              >
                <span
                  className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff4f69] shadow-sm"
                  style={{ left: `${Math.min(95, Math.max(5, averageOffset))}%` }}
                />
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
              <span>Minimum</span>
              <span>Most reports</span>
              <span>Maximum</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-[var(--text-deep)]">Total Pay by Experience</h2>
            <Link className="text-xs font-bold text-[#ff4f69]" href={`/salaries?company=${encodeURIComponent(company.name)}&role=${encodeURIComponent(selectedRole.role)}`}>
              View as table
            </Link>
          </div>
          <div className="mt-5 grid h-56 grid-cols-6 items-end gap-3">
            {bucketRows.map((bucket) => (
              <div key={bucket.label} className="flex h-full min-w-0 flex-col justify-end text-center">
                <p className="mb-2 truncate text-xs font-bold text-[var(--text-deep)]">{bucket.value ? shortInr(bucket.value) : "-"}</p>
                <div
                  className="mx-auto w-full max-w-12 rounded-t-md bg-gradient-to-b from-[#ffd3dc] to-[#ffecef]"
                  style={{ height: `${bucket.value ? Math.max(18, (bucket.value / maxBucketValue) * 150) : 8}px` }}
                />
                <p className="mt-2 truncate text-xs text-[var(--text-muted)]">{bucket.label}</p>
                <p className="mt-1 truncate text-xs font-semibold text-[var(--text-muted)]">{bucket.value ? shortInr(bucket.value) : "No data"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 border-t border-[var(--border)] pt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-[var(--text-deep)]">Compensation Breakdown</h2>
            <Link className="text-xs font-bold text-[#ff4f69]" href={`/compare?c1=${company.slug}`}>
              View details
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {breakdown.map((item) => {
              const percent = averageTotal ? Math.round((item.value / averageTotal) * 100) : 0;
              return (
                <div key={item.label} className="rounded-md bg-gradient-to-r from-[#fff7f8] to-white p-4">
                  <p className="text-xs font-bold text-[var(--text-deep)]">{item.label}</p>
                  <p className="mt-2 text-lg font-bold text-[var(--text-deep)]">{shortInr(item.value)}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">{percent}%</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md bg-[#fff2f4] p-4">
          <p className="text-sm font-semibold text-[var(--text-deep)]">High performer? See how your compensation compares.</p>
          <Link className="focus-ring rounded-md bg-[#ff4f69] px-4 py-2 text-sm font-bold text-white" href={`/compare?c1=${company.slug}`}>
            Compare your salary
          </Link>
        </div>
      </div>
    </section>
  );
}
