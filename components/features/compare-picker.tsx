"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SalaryRecord } from "@/types/salary";

export function ComparePicker({ salaries }: { salaries: SalaryRecord[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function submit(formData: FormData) {
    const s1 = String(formData.get("s1") ?? "");
    const s2 = String(formData.get("s2") ?? "");
    const next = new URLSearchParams();
    if (s1) next.set("s1", s1);
    if (s2) next.set("s2", s2);
    router.push(`/compare?${next.toString()}`);
  }

  return (
    <form action={submit} className="grid gap-3 rounded-lg border border-[var(--border)] bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
      {["s1", "s2"].map((name) => (
        <select key={name} name={name} defaultValue={searchParams.get(name) ?? ""} className="focus-ring rounded-md border border-[var(--border)] px-3 py-2 ">
          <option value="">{name === "s1" ? "First salary" : "Second salary"}</option>
          {salaries.map((salary) => (
            <option key={salary.id} value={salary.id}>
              {salary.company.name} - {salary.role} - {salary.level} - {salary.location}
            </option>
          ))}
        </select>
      ))}
      <button className="focus-ring rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-white" type="submit">
        Compare
      </button>
    </form>
  );
}
