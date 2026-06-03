import { Currency, Level, Source } from "@prisma/client";
import { CURRENCIES, LEVELS, SOURCES } from "@/lib/constants";
import type { SalaryInput } from "@/types/salary";

const levels = new Set(LEVELS);
const currencies = new Set(CURRENCIES);
const sources = new Set(SOURCES);

type ValidationError = {
  error: true;
  field: string;
  message: string;
};

type ValidationResult =
  | { data: SalaryInput; error?: never }
  | { data?: never; error: ValidationError };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

export function validateSalaryPayload(
  payload: unknown
): ValidationResult {
  if (!isRecord(payload)) {
    return {
      error: {
        error: true,
        field: "payload",
        message: "Request body must be a JSON object."
      }
    };
  }

  const company_name = asString(payload.company_name);
  const role = asString(payload.role);
  const location = asString(payload.location);

  const level = payload.level as Level;
  const currency = payload.currency as Currency;
  const source = payload.source as Source;

  const experience_years = asNumber(payload.experience_years);
  const base_salary = asNumber(payload.base_salary);
  const bonus = asNumber(payload.bonus, 0);
  const stock = asNumber(payload.stock, 0);

  const confidence_score = asNumber(
    payload.confidence_score,
    0.8
  );

  // Required fields
  if (!company_name) {
    return {
      error: {
        error: true,
        field: "company_name",
        message: "Company name is required."
      }
    };
  }

  if (!role) {
    return {
      error: {
        error: true,
        field: "role",
        message: "Role is required."
      }
    };
  }

  if (!location) {
    return {
      error: {
        error: true,
        field: "location",
        message: "Location is required."
      }
    };
  }

  // Enum validations
  if (!levels.has(level)) {
    return {
      error: {
        error: true,
        field: "level",
        message: `Level must be one of: ${LEVELS.join(", ")}`
      }
    };
  }

  if (!currencies.has(currency)) {
    return {
      error: {
        error: true,
        field: "currency",
        message: `Currency must be one of: ${CURRENCIES.join(", ")}`
      }
    };
  }

  if (!sources.has(source)) {
    return {
      error: {
        error: true,
        field: "source",
        message: `Source must be one of: ${SOURCES.join(", ")}`
      }
    };
  }

  // Numeric validations
  if (
    !Number.isInteger(experience_years) ||
    experience_years < 0
  ) {
    return {
      error: {
        error: true,
        field: "experience_years",
        message:
          "Experience years must be a non-negative integer."
      }
    };
  }

  if (!Number.isInteger(base_salary) || base_salary < 0) {
    return {
      error: {
        error: true,
        field: "base_salary",
        message:
          "Base salary must be a non-negative integer."
      }
    };
  }

  if (!Number.isInteger(bonus) || bonus < 0) {
    return {
      error: {
        error: true,
        field: "bonus",
        message: "Bonus must be a non-negative integer."
      }
    };
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return {
      error: {
        error: true,
        field: "stock",
        message: "Stock must be a non-negative integer."
      }
    };
  }

  // Business rules
  if (experience_years > 51) {
    return {
      error: {
        error: true,
        field: "experience_years",
        message: "Experience should be less than 51 years."
      }
    };
  }

  if (
    confidence_score < 0 ||
    confidence_score > 1
  ) {
    return {
      error: {
        error: true,
        field: "confidence_score",
        message:
          "Confidence score should be between 0 and 1."
      }
    };
  }

  return {
    data: {
      company_name,
      industry:
        asString(payload.industry) || "Technology",
      headquarters:
        asString(payload.headquarters) || "India",
      founded_year: asNumber(
        payload.founded_year,
        2000
      ),
      headcount_range:
        asString(payload.headcount_range) ||
        "Unknown",

      role,
      level,
      location,
      currency,

      experience_years,
      base_salary,
      bonus,
      stock,
      total_compensation:
        base_salary + bonus + stock,
      source,
      confidence_score,

      is_verified: Boolean(payload.is_verified)
    }
  };
}