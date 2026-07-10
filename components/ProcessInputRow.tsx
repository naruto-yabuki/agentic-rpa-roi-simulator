"use client";

import type { ProcessBenchmark } from "@/lib/processBenchmarks";
import { INPUT_RANGES } from "@/lib/processBenchmarks";
import { ProcessIcon } from "@/lib/processIcons";
import { NumberInput } from "@/components/NumberInput";

export interface ProcessInputValue {
  headcount: number;
  casesPerDay: number;
  minutesPerCase: number;
}

/** 選択中の業務1件ぶんのコンパクトな入力行 (複数業務を縦に積んでも圧迫しないよう数値欄のみ) */
export function ProcessInputRow({
  benchmark,
  value,
  onChange,
  onRemove,
}: {
  benchmark: ProcessBenchmark;
  value: ProcessInputValue;
  onChange: (patch: Partial<ProcessInputValue>) => void;
  onRemove: () => void;
}) {
  const fieldClass =
    "w-24 rounded-lg border border-surface-border px-2 py-1.5 text-right text-base tabular-nums";

  return (
    <div className="animate-fade-in rounded-xl border border-surface-border bg-white p-3 shadow-card">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-navy-700 text-white">
          <ProcessIcon id={benchmark.id} className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 text-base font-semibold text-ink">{benchmark.label}</div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${benchmark.label}を対象から外す`}
          title="対象から外す"
          className="flex h-7 w-7 flex-none items-center justify-center rounded-lg text-ink-faint hover:bg-surface-sunken hover:text-navy-700"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <label className="flex items-center justify-between gap-2 text-sm text-ink-muted">
          担当人数
          <span className="flex items-center gap-1.5">
            <NumberInput
              value={value.headcount}
              onCommit={(n) => onChange({ headcount: n })}
              min={INPUT_RANGES.headcount.min}
              max={INPUT_RANGES.headcount.max}
              className={fieldClass}
            />
            <span className="w-6 text-ink-faint">人</span>
          </span>
        </label>
        <label className="flex items-center justify-between gap-2 text-sm text-ink-muted">
          1日あたり処理件数
          <span className="flex items-center gap-1.5">
            <NumberInput
              value={value.casesPerDay}
              onCommit={(n) => onChange({ casesPerDay: n })}
              min={INPUT_RANGES.casesPerDay.min}
              max={INPUT_RANGES.casesPerDay.max}
              className={fieldClass}
            />
            <span className="w-6 text-ink-faint">件</span>
          </span>
        </label>
        <label className="flex items-center justify-between gap-2 text-sm text-ink-muted">
          1件あたり処理時間
          <span className="flex items-center gap-1.5">
            <NumberInput
              value={value.minutesPerCase}
              onCommit={(n) => onChange({ minutesPerCase: n })}
              min={INPUT_RANGES.minutesPerCase.min}
              max={INPUT_RANGES.minutesPerCase.max}
              className={fieldClass}
            />
            <span className="w-6 text-ink-faint">分</span>
          </span>
        </label>
      </div>
      <p className="mt-2 text-xs text-ink-faint">
        同業平均：1件あたり{benchmark.minutesPerCase}分・自動化率{Math.round(benchmark.automationRate * 100)}%
      </p>
    </div>
  );
}
