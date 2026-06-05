import { Card } from "@/components/ui/card";

export function StatCard({ label, value, detail, valueClassName = "text-[var(--text-deep)]" }: { label: string; value: string; detail?: string; valueClassName?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>{value}</p>
      {detail ? <p className="mt-1 text-sm text-[var(--text-muted)]">{detail}</p> : null}
    </Card>
  );
}
