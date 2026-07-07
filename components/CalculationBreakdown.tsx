"use client";

import type { CalcResult } from "@/lib/calc";
import { formatHours, formatManYen, formatMonths, formatPercent, formatYenPerHour } from "@/lib/format";

interface Step {
  label: string;
  formula: string;
  resultText: string;
  note?: string;
  highlight?: boolean;
}

/** 「なぜこの数字になるのか」を5ステップの積み上げで可視化する (STEP1〜3入力からROIまでの全経路) */
export function CalculationBreakdown({
  casesPerDay,
  minutesPerCase,
  workingDaysPerMonth,
  automationRatePercent,
  hourlyWageYen,
  salaryMan,
  monthlyOperatingCostYen,
  initialInvestmentYen,
  result,
}: {
  casesPerDay: number;
  minutesPerCase: number;
  workingDaysPerMonth: number;
  automationRatePercent: number;
  hourlyWageYen: number;
  salaryMan: number;
  monthlyOperatingCostYen: number;
  initialInvestmentYen: number;
  result: CalcResult;
}) {
  const steps: Step[] = [
    {
      label: "① 月間対象工数",
      formula: `${casesPerDay.toLocaleString("ja-JP")}件/日 × ${minutesPerCase}分/件 × ${workingDaysPerMonth}日 ÷ 60分`,
      resultText: `${formatHours(result.monthlyHours)}時間/月`,
      note: result.isCapped
        ? `担当者の総稼働上限 ${formatHours(result.monthlyCapHours)}時間/月 に達しているため、そこで頭打ちにしています（専従率100%）`
        : `担当者の総稼働時間 ${formatHours(result.monthlyCapHours)}時間/月 のうち ${formatPercent(result.occupancyRate)}%（専従率）を占める計算です`,
    },
    {
      label: "② 自動化可能工数",
      formula: `${formatHours(result.monthlyHours)}時間 × 自動化率 ${formatPercent(automationRatePercent)}%`,
      resultText: `${formatHours(result.automatedHours)}時間/月`,
      note: "AIが代行できる工数（残りは人による確認・例外対応として残ります）",
    },
    {
      label: "③ 月間削減額",
      formula: `${formatHours(result.automatedHours)}時間 × ${formatYenPerHour(hourlyWageYen)}円/時（年収${salaryMan.toLocaleString("ja-JP")}万円換算）`,
      resultText: `約${formatManYen(result.monthlySavingsYen)}万円/月`,
    },
    {
      label: "④ 純削減効果",
      formula: `${formatManYen(result.monthlySavingsYen)}万円 − 月額運用費 ${formatManYen(monthlyOperatingCostYen)}万円`,
      resultText: `${formatManYen(result.netMonthlySavingsYen)}万円/月`,
      note: "AIエージェント導入後の月額運用費を差し引いた、手元に残る削減効果です",
    },
    {
      label: "⑤ ROI回収期間",
      formula:
        result.roiMonths !== null
          ? `初期投資 ${formatManYen(initialInvestmentYen)}万円 ÷ 純削減効果 ${formatManYen(result.netMonthlySavingsYen)}万円/月`
          : "純削減効果がマイナスのため算出できません",
      resultText: result.roiMonths !== null ? `約${formatMonths(result.roiMonths)}ヶ月` : "回収不可",
      highlight: true,
    },
  ];

  return (
    <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
      <h3 className="mb-1 text-sm font-semibold text-navy-700">計算根拠</h3>
      <p className="mb-4 text-[11px] text-ink-muted">
        左の入力値がどのように積み上がって最終的なROI回収期間になるかを、5ステップで表示しています。
      </p>
      <ol>
        {steps.map((step, i) => (
          <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 ? (
              <span className="absolute left-[13px] top-7 h-full w-px bg-surface-border" aria-hidden />
            ) : null}
            <span
              className={`z-10 flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold text-white ${
                step.highlight ? "bg-emerald-600" : "bg-navy-700"
              }`}
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="text-xs font-medium text-ink-muted">{step.label}</div>
              <div className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">
                {step.formula}
                <span className="mx-1.5 text-ink-faint">=</span>
                <span
                  className={`font-semibold ${step.highlight ? "text-emerald-700" : "text-navy-800"}`}
                >
                  {step.resultText}
                </span>
              </div>
              {step.note ? <div className="mt-1 text-[11px] text-ink-faint">{step.note}</div> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
