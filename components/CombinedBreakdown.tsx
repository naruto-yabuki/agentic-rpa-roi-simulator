"use client";

import type { CombinedResult } from "@/lib/calc";
import { formatManYen, formatMonths } from "@/lib/format";
import { Pill } from "@/components/Pill";

/** 組み合わせ時の「合計削減額 → 純削減効果 → ROI」を3ステップで示す (計算根拠) */
export function CombinedBreakdown({
  result,
  processCount,
}: {
  result: CombinedResult;
  processCount: number;
}) {
  const steps = [
    {
      label: "① 合計月間削減額",
      formulaText: `選択した${processCount}業務の削減額を合算`,
      resultText: `約${formatManYen(result.monthlySavingsYen)}万円/月`,
      note: "各業務の「件数 × 処理時間 × 稼働日数 × 自動化率 × 時給」の合計です",
      highlight: false,
    },
    {
      label: "② 純削減効果",
      formulaText: "合計削減額 − AIエージェント運用費（システム全体で1式）",
      resultText: `${formatManYen(result.netMonthlySavingsYen)}万円/月`,
      note: "運用費は業務数によらず1式のため、業務を重ねるほど純削減効果が伸びます",
      highlight: false,
    },
    {
      label: "③ ROI回収期間",
      formulaText:
        result.roiMonths !== null
          ? "初期投資 ÷ 純削減効果（初期投資もシステム全体で1式）"
          : "純削減効果がマイナスのため、対象業務の追加をご検討ください",
      resultText: result.roiMonths !== null ? `約${formatMonths(result.roiMonths)}ヶ月` : "業務追加で黒字化",
      note:
        result.roiMonths !== null
          ? "対象業務を増やしても初期投資は据え置きのため、回収期間はさらに短縮できます"
          : undefined,
      highlight: true,
    },
  ];

  return (
    <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
      <h3 className="mb-1 text-base font-semibold text-navy-700">計算根拠（組み合わせ）</h3>
      <p className="mb-4 text-sm text-ink-muted">
        業務別の削減額の合計から、システム全体で1式の運用費・初期投資を差し引いてROIを算出しています。
      </p>
      <ol>
        {steps.map((step, i) => (
          <li key={step.label} className="relative flex gap-3 pb-6 last:pb-0">
            {i < steps.length - 1 ? (
              <span className="absolute left-[15px] top-8 h-full w-px bg-surface-border" aria-hidden />
            ) : null}
            <span
              className={`z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm font-bold text-white ${
                step.highlight ? "bg-emerald-600" : "bg-navy-700"
              }`}
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="text-sm font-medium text-ink-muted">{step.label}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm text-ink-faint">{step.formulaText}</span>
                <span className="text-base text-ink-faint" aria-hidden>
                  →
                </span>
                <Pill tone={step.highlight ? "accent" : "solid"}>{step.resultText}</Pill>
              </div>
              {step.note ? <div className="mt-2 text-sm text-ink-faint">{step.note}</div> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
