import type { Level } from "@prisma/client";

const levelTone: Record<Level, string> = {
  L3: "bg-slate-100 text-slate-700",
  SDE_I: "bg-slate-100 text-slate-700",
  L4: "bg-blue-100 text-blue-700",
  SDE_II: "bg-blue-100 text-blue-700",
  L5: "bg-indigo-100 text-indigo-700",
  SDE_III: "bg-indigo-100 text-indigo-700",
  L6: "bg-purple-100 text-purple-700",
  STAFF: "bg-purple-100 text-purple-700",
  PRINCIPAL: "bg-[#1e3a5f] text-white",
  IC4: "bg-[#1e3a5f] text-white",
  IC5: "bg-[#1e3a5f] text-white"
};

export function levelBadgeClass(level: Level) {
  return levelTone[level];
}

export function Badge({ children, tone = "neutral", level }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning"; level?: Level }) {
  const toneClass =
    level
      ? levelBadgeClass(level)
      : tone === "success"
      ? "bg-[#e9f7ea] text-[var(--success)]"
      : tone === "warning"
        ? "bg-[#fff6db] text-[#8a6100]"
        : "bg-[#f7f7f7] text-[var(--text-muted)]";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{children}</span>;
}
