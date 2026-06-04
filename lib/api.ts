import { Currency, Level, Prisma } from "@prisma/client";
import { DISPLAY_CURRENCIES, LEVELS, SORTS } from "@/lib/constants";
import type { SalaryFilters, SalarySort } from "@/types/salary";

function positiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export function parseSalaryFilters(searchParams: URLSearchParams): SalaryFilters {
  const levels = searchParams.getAll("level").filter((level): level is Level => LEVELS.includes(level as Level));
  const currency = searchParams.get("currency");
  const sort = searchParams.get("sort");

  return {
    company: searchParams.get("company")?.trim() || undefined,
    role: searchParams.get("role")?.trim() || undefined,
    levels: levels.length > 0 ? levels : undefined,
    location: searchParams.get("location")?.trim() || undefined,
    currency: DISPLAY_CURRENCIES.includes(currency as Currency) ? (currency as Currency) : "INR",
    sort: SORTS.includes(sort as SalarySort) ? (sort as SalarySort) : "total_comp_desc",
    page: positiveInt(searchParams.get("page"), 1, 100000),
    limit: positiveInt(searchParams.get("limit"), 25, 100)
  };
}

export function buildSalaryWhere(filters: SalaryFilters): Prisma.SalaryWhereInput {
  return {
    company: filters.company
      ? {
          OR: [
            { name: { contains: filters.company, mode: "insensitive" } },
            { normalized_name: { contains: filters.company.toLowerCase(), mode: "insensitive" } }
          ]
        }
      : undefined,
    role: filters.role ? { contains: filters.role, mode: "insensitive" } : undefined,
    level: filters.levels ? { in: filters.levels } : undefined,
    location: filters.location ? { contains: filters.location, mode: "insensitive" } : undefined
  };
}

export function buildSalaryOrder(sort: SalarySort): Prisma.SalaryOrderByWithRelationInput {
  if (sort === "total_comp_asc") return { total_compensation: "asc" };
  if (sort === "company_asc") return { company: { name: "asc" } };
  if (sort === "company_desc") return { company: { name: "desc" } };
  if (sort === "role_asc") return { role: "asc" };
  if (sort === "role_desc") return { role: "desc" };
  if (sort === "level_asc") return { level: "asc" };
  if (sort === "level_desc") return { level: "desc" };
  if (sort === "location_asc") return { location: "asc" };
  if (sort === "location_desc") return { location: "desc" };
  if (sort === "experience_asc") return { experience_years: "asc" };
  if (sort === "experience_desc") return { experience_years: "desc" };
  if (sort === "base_salary_asc") return { base_salary: "asc" };
  if (sort === "base_salary_desc") return { base_salary: "desc" };
  if (sort === "stock_asc") return { stock: "asc" };
  if (sort === "stock_desc") return { stock: "desc" };
  return { total_compensation: "desc" };
}
