import type { Currency, Level, Source } from "@prisma/client";
import type { SalarySort } from "@/types/salary";

export const LEVELS = ["L3", "L4", "L5", "L6", "SDE_I", "SDE_II", "SDE_III", "STAFF", "PRINCIPAL", "IC4", "IC5"] as Level[];
export const CURRENCIES = ["INR", "USD", "GBP", "EUR"] as Currency[];
export const SOURCES = ["CONTRIBUTOR", "SCRAPED", "AI_INFERRED"] as Source[];
export const SORTS: SalarySort[] = ["total_comp_desc", "total_comp_asc", "date_desc"];
