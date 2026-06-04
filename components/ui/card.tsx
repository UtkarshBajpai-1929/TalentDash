export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-[var(--border)] bg-white ${className}`}>{children}</section>;
}
