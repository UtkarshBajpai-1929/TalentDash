import type { Currency } from "@prisma/client";
import { CURRENCY_RATES_TO_INR } from "@/lib/constants";

export function computeTotalCompensation(base_salary: number, bonus = 0, stock = 0) {
  return base_salary + bonus + stock;
}

export function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) return sorted[middle];
  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

export function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function convertSalaryValue(value: number, fromCurrency: Currency, toCurrency: Currency) {
  const valueInInr = value * CURRENCY_RATES_TO_INR[fromCurrency];
  return Math.round(valueInInr / CURRENCY_RATES_TO_INR[toCurrency]);
}

export function formatCompactMoney(value: number, currency: string) {
  if (currency === "INR") {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}
