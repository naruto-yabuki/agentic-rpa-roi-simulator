export function KpiCard({
  label,
  value,
  sub,
  tone = "default",
  size = "md",
}: {
  label: string;
  value: string;
  /** 単一の文字列、または明示的な改行位置を指定する文字列配列 (自動折り返しの不自然な改行を避けるため) */
  sub?: string | string[];
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
  const subLines = Array.isArray(sub) ? sub : sub ? [sub] : [];

  return (
    <div className={`rounded-xl border p-4 shadow-card ${toneClass}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</div>
      <div
        className={`mt-1.5 font-bold tabular-nums leading-tight ${valueToneClass} ${
          size === "lg" ? "text-4xl md:text-5xl" : "text-2xl"
        }`}
      >
        {value}
      </div>
      {subLines.length ? (
        <div className="mt-2 space-y-0.5 border-t border-black/5 pt-2">
          {subLines.map((line, i) => (
            <div key={i} className="text-[11px] leading-snug text-ink-muted">
              {line}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
