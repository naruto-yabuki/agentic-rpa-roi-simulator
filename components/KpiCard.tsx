export function KpiCard({
  label,
  value,
  sub,
  tone = "default",
  size = "md",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "warning" | "info";
  size?: "md" | "lg";
}) {
  const toneClass =
    tone === "warning"
      ? "border-amber-300 bg-amber-50"
      : tone === "info"
        ? "border-navy-200 bg-navy-50"
        : "border-surface-border bg-white";
  const valueToneClass = tone === "info" ? "text-navy-800" : "text-ink";

  return (
    <div className={`rounded-xl border p-4 shadow-card ${toneClass}`}>
      <div className="text-xs font-medium text-ink-muted">{label}</div>
      <div
        className={`mt-1 font-bold tabular-nums ${valueToneClass} ${
          size === "lg" ? "text-4xl md:text-5xl" : "text-2xl"
        }`}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-[11px] text-ink-muted">{sub}</div> : null}
    </div>
  );
}
