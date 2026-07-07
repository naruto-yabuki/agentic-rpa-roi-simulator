"use client";

import type { CalcResult } from "@/lib/calc";
import { formatHours, formatManYen, formatMonths, formatPercent, formatYenPerHour } from "@/lib/format";
import { Pill } from "@/components/Pill";

interface Part {
  text: string;
  /** true の場合は演算子として薄いテキストで表示 (Pillにしない) */
  op?: boolean;
}

interface Step {
  label: string;
  /** 数式を数値チップで表示する場合 */
  parts?: Part[];
  /** 数式の代わりに説明文だけを表示する場合 (自社の原価情報を含む数式は非表示にするため) */
  formulaText?: string;
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
  result,
}: {
  casesPerDay: number;
  minutesPerCase: number;
  workingDaysPerMonth: number;
  automationRatePercent: number;
  hourlyWageYen: number;
  salaryMan: number;
  result: CalcResult;
}) {
  const steps: Step[] = [
    {
      label: "① 月間対象工数",
      parts: [
        { text: `${casesPerDay.toLocaleString("ja-JP")}件/日` },
        { text: "×", op: true },
        { text: `${minutesPerCase}分/件` },
        { text: "×", op: true },
        { text: `${workingDaysPerMonth}日` },
        { text: "÷ 60分", op: true },
      ],
      resultText: `${formatHours(result.monthlyHours)}時間/月`,
      note: `担当者の総稼働時間 ${formatHours(result.monthlyCapHours)}時間/月 のうち ${formatPercent(result.occupancyRate)}%（専従率）に相当する工数です`,
    },
    {
      label: "② 自動化可能工数",
      parts: [{ text: `${formatHours(result.monthlyHours)}時間` }, { text: "×", op: true }, { text: `自動化率 ${formatPercent(automationRatePercent)}%` }],
      resultText: `${formatHours(result.automatedHours)}時間/月`,
      note: "AIが代行できる工数です（残りは人による確認・例外対応として残ります）",
    },
    {
      label: "③ 月間削減額",
      parts: [{ text: `${formatHours(result.automatedHours)}時間` }, { text: "×", op: true }, { text: `${formatYenPerHour(hourlyWageYen)}円/時` }],
      resultText: `約${formatManYen(result.monthlySavingsYen)}万円/月`,
      note: `時給は年収${salaryMan.toLocaleString("ja-JP")}万円換算です`,
    },
    {
      label: "④ 純削減効果",
      formulaText: "AIエージェントの運用費を差し引いた実質効果",
      resultText: `${formatManYen(result.netMonthlySavingsYen)}万円/月`,
      note: "運用費の詳細は個別のお見積りにてご案内します",
    },
    {
      label: "⑤ ROI回収期間",
      formulaText:
        result.roiMonths !== null
          ? "純削減効果をもとに算出した投資回収期間"
          : "純削減効果がマイナスのため単独では算出できません",
      resultText: result.roiMonths !== null ? `約${formatMonths(result.roiMonths)}ヶ月` : "他業務と組み合わせを提案",
      note: result.roiMonths === null ? "下の「ご提案」もご参照ください" : undefined,
      highlight: true,
    },
  ];

  return (
    <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
      <h3 className="mb-1 text-base font-semibold text-navy-700">計算根拠</h3>
      <p className="mb-4 text-sm text-ink-muted">
        左の入力値がどのように積み上がって最終的なROI回収期間になるかを、5ステップで表示しています。
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
                {step.parts
                  ? step.parts.map((part, j) =>
                      part.op ? (
                        <span key={j} className="text-base font-medium text-ink-faint" aria-hidden>
                          {part.text}
                        </span>
                      ) : (
                        <Pill key={j}>{part.text}</Pill>
                      ),
                    )
                  : step.formulaText && (
                      <span className="text-sm text-ink-faint">{step.formulaText}</span>
                    )}
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
