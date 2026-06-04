import type { Currency, Level, Source } from "@prisma/client";
import type { SalarySort } from "@/types/salary";

export const LEVELS = ["L3", "L4", "L5", "L6", "SDE_I", "SDE_II", "SDE_III", "STAFF", "PRINCIPAL", "IC4", "IC5"] as Level[];
export const CURRENCIES = ["INR", "USD", "GBP", "EUR"] as Currency[];
export const DISPLAY_CURRENCIES = ["INR", "USD"] as Currency[];
export const CURRENCY_RATES_TO_INR: Record<Currency, number> = {
  INR: 1,
  USD: 83,
  GBP: 105,
  EUR: 90
};
export const SOURCES = ["CONTRIBUTOR", "SCRAPED", "AI_INFERRED"] as Source[];
export const SORTS: SalarySort[] = [
  "company_asc",
  "company_desc",
  "role_asc",
  "role_desc",
  "level_asc",
  "level_desc",
  "location_asc",
  "location_desc",
  "experience_asc",
  "experience_desc",
  "base_salary_asc",
  "base_salary_desc",
  "stock_asc",
  "stock_desc",
  "total_comp_asc",
  "total_comp_desc"
];
