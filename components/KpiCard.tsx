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
  tone?: "default" | "warning";
  size?: "md" | "lg";
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-card ${
        tone === "warning" ? "border-amber-300 bg-amber-50" : "border-surface-border bg-white"
      }`}
    >
      <div className="text-xs font-medium text-ink-muted">{label}</div>
      <div
        className={`mt-1 font-bold tabular-nums text-ink ${
          size === "lg" ? "text-4xl md:text-5xl" : "text-2xl"
        }`}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-[11px] text-ink-muted">{sub}</div> : null}
    </div>
  );
}
