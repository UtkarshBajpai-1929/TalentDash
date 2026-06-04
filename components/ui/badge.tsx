import type { Level } from "@prisma/client";

const levelTone: Record<Level, string> = {
  L3: "bg-amber-100 text-amber-700",
  SDE_I: "bg-amber-100 text-amber-700",
  L4: "bg-orange-100 text-orange-700",
  SDE_II: "bg-orange-100 text-orange-700",
  L5: "bg-[#fff0f0] text-[#cc2a2e]",
  SDE_III: "bg-[#fff0f0] text-[#cc2a2e]",
  L6: "bg-rose-100 text-rose-700",
  STAFF: "bg-rose-100 text-rose-700",
  PRINCIPAL: "bg-[#3d0a0b] text-white",
  IC4: "bg-[#3d0a0b] text-white",
  IC5: "bg-[#3d0a0b] text-white"
};

export function levelBadgeClass(level: Level) {
  return levelTone[level];
}

export function Badge({
  children,
  tone = "neutral",
  level
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "error";
  level?: Level;
}) {
  const toneClass = level
    ? levelBadgeClass(level)
    : tone === "success"
    ? "bg-[#e9f7ea] text-[var(--success)]"
    : tone === "warning"
    ? "bg-[#fff6db] text-[#8a6100]"
    : tone === "error"
    ? "bg-[#fde8e7] text-[var(--error)]"
    : "bg-[#f7f7f7] text-[var(--text-muted)]";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}
