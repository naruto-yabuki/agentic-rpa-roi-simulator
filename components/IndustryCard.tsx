"use client";

import type { IndustryBenchmark } from "@/lib/industryBenchmarks";

export function IndustryCard({
  benchmark,
  selected,
  onSelect,
}: {
  benchmark: IndustryBenchmark;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-xl border p-3 text-left transition ${
        selected
          ? "border-navy-600 bg-navy-50 shadow-card ring-1 ring-navy-600"
          : "border-surface-border bg-white hover:border-navy-300 hover:bg-navy-50/40"
      }`}
    >
      <div className="text-sm font-semibold text-ink">{benchmark.label}</div>
      <div className="mt-1 text-[11px] leading-relaxed text-ink-muted">
        {benchmark.workflowSteps.join(" → ")}
      </div>
    </button>
  );
}
