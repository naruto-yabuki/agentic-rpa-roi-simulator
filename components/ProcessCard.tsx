"use client";

import type { ProcessBenchmark } from "@/lib/processBenchmarks";
import { ProcessIcon } from "@/lib/processIcons";

export function ProcessCard({
  benchmark,
  selected,
  onSelect,
}: {
  benchmark: ProcessBenchmark;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition ${
        selected
          ? "border-navy-600 bg-navy-50 shadow-card ring-1 ring-navy-600"
          : "border-surface-border bg-white hover:border-navy-300 hover:bg-navy-50/40"
      }`}
    >
      {selected ? (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-navy-700">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
      ) : null}
      <div
        className={`flex h-9 w-9 flex-none items-center justify-center rounded-full transition ${
          selected ? "bg-navy-700 text-white" : "bg-navy-50 text-navy-600 group-hover:bg-navy-100"
        }`}
      >
        <ProcessIcon id={benchmark.id} className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-base font-semibold text-ink">{benchmark.label}</div>
        <div className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {benchmark.workflowSteps.join(" → ")}
        </div>
      </div>
    </button>
  );
}
