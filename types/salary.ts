import type { Currency, Level, Source } from "@prisma/client";

export type SalarySort = "total_comp_desc" | "total_comp_asc" | "date_desc";

export type SalaryFilters = {
  company?: string;
  role?: string;
  level?: Level;
  location?: string;
  currency?: Currency;
  sort: SalarySort;
  page: number;
  limit: number;
};

export type SalaryInput = {
  company_name: string;
  industry?: string;
  headquarters?: string;
  founded_year?: number;
  headcount_range?: string;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: number;
  bonus?: number;
  stock?: number;
  total_compensation: number;
  source: Source;
  confidence_score?: number;
  is_verified?: boolean;
};
