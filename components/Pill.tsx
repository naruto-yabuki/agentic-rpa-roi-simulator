export function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "solid" | "accent";
}) {
  const toneClass =
    tone === "solid"
      ? "bg-navy-700 text-white"
      : tone === "accent"
        ? "bg-emerald-600 text-white"
        : "border border-surface-border bg-white text-ink-soft";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-medium tabular-nums ${toneClass}`}
    >
      {children}
    </span>
  );
}
