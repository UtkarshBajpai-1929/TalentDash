const LEGAL_SUFFIXES = [
  "india",
  "private",
  "pvt",
  "limited",
  "ltd",
  "inc",
  "llc",
  "technologies",
  "technology",
  "systems"
];

const CANONICAL_NAMES: Record<string, string> = {
  google: "Google",
  amazon: "Amazon",
  meta: "Meta",
  microsoft: "Microsoft",
  flipkart: "Flipkart",
  meesho: "Meesho",
  nvidia: "NVIDIA",
  tcs: "TCS",
  infosys: "Infosys",
  wipro: "Wipro",
  razorpay: "Razorpay",
  zepto: "Zepto"
};

export function normalizeCompanyName(input: string): string {
  const words = input
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !LEGAL_SUFFIXES.includes(word));

  return words.join(" ");
}

export function slugFromCompanyName(input: string): string {
  return normalizeCompanyName(input).replace(/\s+/g, "-");
}

export function displayCompanyName(input: string): string {
  const normalized = normalizeCompanyName(input);
  if (CANONICAL_NAMES[normalized]) return CANONICAL_NAMES[normalized];
  return normalized
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
