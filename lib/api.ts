import { Currency, Level, Prisma } from "@prisma/client";
import { CURRENCIES, LEVELS, SORTS } from "@/lib/constants";
import type { SalaryFilters, SalarySort } from "@/types/salary";

function positiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export function parseSalaryFilters(searchParams: URLSearchParams): SalaryFilters {
  const level = searchParams.get("level");
  const currency = searchParams.get("currency");
  const sort = searchParams.get("sort");

  return {
    company: searchParams.get("company")?.trim() || undefined,
    role: searchParams.get("role")?.trim() || undefined,
    level: LEVELS.includes(level as Level) ? (level as Level) : undefined,
    location: searchParams.get("location")?.trim() || undefined,
    currency: CURRENCIES.includes(currency as Currency) ? (currency as Currency) : undefined,
    sort: SORTS.includes(sort as SalarySort) ? (sort as SalarySort) : "total_comp_desc",
    page: positiveInt(searchParams.get("page"), 1, 100000),
    limit: positiveInt(searchParams.get("limit"), 20, 100)
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
    level: filters.level,
    location: filters.location ? { contains: filters.location, mode: "insensitive" } : undefined,
    currency: filters.currency
  };
}

export function buildSalaryOrder(sort: SalarySort): Prisma.SalaryOrderByWithRelationInput {
  if (sort === "total_comp_asc") return { total_compensation: "asc" };
  if (sort === "date_desc") return { submitted_at: "desc" };
  return { total_compensation: "desc" };
}
