import type { Currency, Level, Source } from "@prisma/client";

export type SalarySort =
  | "company_asc"
  | "company_desc"
  | "role_asc"
  | "role_desc"
  | "level_asc"
  | "level_desc"
  | "location_asc"
  | "location_desc"
  | "experience_asc"
  | "experience_desc"
  | "base_salary_asc"
  | "base_salary_desc"
  | "stock_asc"
  | "stock_desc"
  | "total_comp_asc"
  | "total_comp_desc";

export type SalaryFilters = {
  company?: string;
  role?: string;
  levels?: Level[];
  location?: string;
  currency?: Currency;
  sort: SalarySort;
  page: number;
  limit: number;
};

export type CompanySummary = {
  id: string;
  name: string;
  slug: string;
  normalized_name: string;
  industry: string;
  headquarters: string;
  founded_year: number;
  headcount_range: string;
  created_at?: string | Date;
  updated_at?: string | Date;
};

export type SalaryRecord = {
  id: string;
  company_id: string;
  company: CompanySummary;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
  source: Source;
  confidence_score: number;
  is_verified: boolean;
  submitted_at: string | Date;
};

export type SalariesApiResponse = {
  salaries: SalaryRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  stats: {
    average_total_compensation: number;
    highest_total_compensation: number;
  };
  facets: {
    roles: string[];
    locations: string[];
  };
};

export type CompareApiResponse = {
  left: SalaryRecord;
  right: SalaryRecord;
  deltas: {
    base_salary: number;
    bonus: number;
    stock: number;
    total_compensation: number;
    total_compensation_percent: number | null;
  };
  higher_salary_id: string | null;
};

export type CompanyApiResponse = {
  company: CompanySummary;
  salaries: SalaryRecord[];
  median_total_compensation: number;
  level_distribution: Record<string, number>;
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
