"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculate } from "@/lib/calc";
import {
  PROCESS_BENCHMARKS,
  PROCESS_ORDER,
  INPUT_RANGES,
  type ProcessId,
} from "@/lib/processBenchmarks";
import { useSettings } from "@/lib/settings-context";
import {
  formatFte,
  formatHours,
  formatManYen,
  formatMonths,
  formatPercent,
  formatYenPerHour,
} from "@/lib/format";
import { ProcessCard } from "@/components/ProcessCard";
import { KpiCard } from "@/components/KpiCard";
import { CumulativeChart } from "@/components/CumulativeChart";
import { CalculationBreakdown } from "@/components/CalculationBreakdown";
import { Pill } from "@/components/Pill";

export default function HomePage() {
  const { settings, isCustomized } = useSettings();

  const [processId, setProcessId] = useState<ProcessId | null>(null);
  const [headcount, setHeadcount] = useState(3);
  const [casesPerDay, setCasesPerDay] = useState<number>(0);
  const [minutesPerCase, setMinutesPerCase] = useState<number>(0);
  const [customerName, setCustomerName] = useState("");

  const selectProcess = (id: ProcessId) => {
    setProcessId(id);
    const s = settings.process[id];
    setCasesPerDay(s.casesPerDayDefault);
    setMinutesPerCase(s.minutesPerCase);
  };

  const processSettings = processId ? settings.process[processId] : null;
  const benchmark = processId ? PROCESS_BENCHMARKS[processId] : null;

  const result = useMemo(() => {
    if (!processId || !processSettings) return null;
    return calculate({
      headcount,
      casesPerDay,
      minutesPerCase,
      automationRate: processSettings.automationRate,
      settings: {
        averageAnnualSalaryYen: settings.averageAnnualSalaryYen,
        annualWorkingHours: settings.annualWorkingHours,
        workingDaysPerMonth: settings.workingDaysPerMonth,
        dailyWorkingHours: settings.dailyWorkingHours,
        initialInvestmentYen: settings.initialInvestmentYen,
        monthlyOperatingCostYen: settings.monthlyOperatingCostYen,
      },
    });
  }, [processId, processSettings, headcount, casesPerDay, minutesPerCase, settings]);

  const hourlyWageYen = settings.averageAnnualSalaryYen / settings.annualWorkingHours;
  const salaryMan = Math.round(settings.averageAnnualSalaryYen / 10_000);

  const otherProcessLabels = processId
    ? PROCESS_ORDER.filter((id) => id !== processId)
        .slice(0, 2)
        .map((id) => PROCESS_BENCHMARKS[id].label)
    : [];

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 md:px-8">
      {/* ヘッダー */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-navy-500">
            株式会社ニューロスフィア
          </div>
          <h1 className="text-2xl font-bold text-navy-800 md:text-3xl">
            Agentic RPA 削減効果シミュレーター
          </h1>
          {customerName.trim() ? (
            <p className="mt-1 text-base text-ink-soft">{customerName.trim()}様向け試算</p>
          ) : null}
        </div>
        <div className="no-print flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-navy-700 px-4 py-2.5 text-base font-medium text-white shadow-card hover:bg-navy-800"
          >
            PDF出力
          </button>
          <Link
            href="/settings"
            aria-label="試算前提の設定"
            title="試算前提の設定"
            className="rounded-lg border border-surface-border bg-white p-2.5 text-ink-muted hover:text-navy-700"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[38%_1fr]">
        {/* 入力パネル */}
        <section className="space-y-5">
          <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-navy-700">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-white">
                1
              </span>
              業務選択
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {PROCESS_ORDER.map((id) => (
                <ProcessCard
                  key={id}
                  benchmark={PROCESS_BENCHMARKS[id]}
                  selected={processId === id}
                  onSelect={() => selectProcess(id)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-navy-700">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-white">
                2
              </span>
              必要情報
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-ink">
                  ① その事務作業は、何名の方が担当されていますか？
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={INPUT_RANGES.headcount.min}
                    max={INPUT_RANGES.headcount.max}
                    step={INPUT_RANGES.headcount.step}
                    value={headcount}
                    onChange={(e) => setHeadcount(Number(e.target.value))}
                    className="flex-1 accent-navy-700"
                  />
                  <input
                    type="number"
                    min={INPUT_RANGES.headcount.min}
                    max={INPUT_RANGES.headcount.max}
                    value={headcount}
                    onChange={(e) =>
                      setHeadcount(
                        Math.min(
                          INPUT_RANGES.headcount.max,
                          Math.max(INPUT_RANGES.headcount.min, Number(e.target.value) || 0),
                        ),
                      )
                    }
                    className="w-20 rounded-lg border border-surface-border px-2 py-1.5 text-right text-base tabular-nums"
                  />
                  <span className="text-base text-ink-muted">人</span>
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-ink">
                  ② 1日あたり、合計で何件くらい処理されていますか？
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={INPUT_RANGES.casesPerDay.min}
                    max={Math.max(500, casesPerDay)}
                    step={1}
                    value={casesPerDay}
                    disabled={!processId}
                    onChange={(e) => setCasesPerDay(Number(e.target.value))}
                    className="flex-1 accent-navy-700 disabled:opacity-40"
                  />
                  <input
                    type="number"
                    min={INPUT_RANGES.casesPerDay.min}
                    max={INPUT_RANGES.casesPerDay.max}
                    value={casesPerDay}
                    disabled={!processId}
                    onChange={(e) =>
                      setCasesPerDay(
                        Math.min(
                          INPUT_RANGES.casesPerDay.max,
                          Math.max(INPUT_RANGES.casesPerDay.min, Number(e.target.value) || 0),
                        ),
                      )
                    }
                    className="w-24 rounded-lg border border-surface-border px-2 py-1.5 text-right text-base tabular-nums disabled:bg-surface-sunken"
                  />
                  <span className="text-base text-ink-muted">件/日</span>
                </div>
                {!processId ? (
                  <p className="mt-1 text-sm text-ink-muted">※ 業務を選択すると入力できます</p>
                ) : null}
              </div>

              <div>
                <label className="block text-base font-medium text-ink">
                  ③ 1件あたりの処理時間（任意）
                  {benchmark ? (
                    <span className="ml-1 font-normal text-ink-muted">
                      （同業平均：{benchmark.minutesPerCase}分）
                    </span>
                  ) : null}
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={INPUT_RANGES.minutesPerCase.min}
                    max={480}
                    step={1}
                    value={minutesPerCase}
                    disabled={!processId}
                    onChange={(e) => setMinutesPerCase(Number(e.target.value))}
                    className="flex-1 accent-navy-700 disabled:opacity-40"
                  />
                  <input
                    type="number"
                    min={INPUT_RANGES.minutesPerCase.min}
                    max={INPUT_RANGES.minutesPerCase.max}
                    value={minutesPerCase}
                    disabled={!processId}
                    onChange={(e) =>
                      setMinutesPerCase(
                        Math.min(
                          INPUT_RANGES.minutesPerCase.max,
                          Math.max(INPUT_RANGES.minutesPerCase.min, Number(e.target.value) || 0),
                        ),
                      )
                    }
                    className="w-20 rounded-lg border border-surface-border px-2 py-1.5 text-right text-base tabular-nums disabled:bg-surface-sunken"
                  />
                  <span className="text-base text-ink-muted">分</span>
                </div>
              </div>
            </div>
          </div>

          {/* 前提条件サマリー (読み取り専用) */}
          <div className="rounded-xl border border-surface-border bg-surface-sunken p-4">
            <div className="mb-2 flex items-center gap-2 text-base font-medium text-ink">
              前提条件
              {isCustomized ? (
                <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-medium text-navy-700">
                  カスタム設定適用中
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Pill>
                人件費 {formatYenPerHour(hourlyWageYen)}円/時（年収{salaryMan.toLocaleString("ja-JP")}万円換算）
              </Pill>
              <Pill>自動化率 {benchmark ? `${formatPercent(benchmark.automationRate * 100)}%` : "—"}</Pill>
              <Pill>稼働 {settings.workingDaysPerMonth}日/月</Pill>
              <Pill>初期投資 {formatManYen(settings.initialInvestmentYen)}万円</Pill>
              <Pill>月額 {formatManYen(settings.monthlyOperatingCostYen)}万円</Pill>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-muted">お客様名（任意）</label>
            <input
              type="text"
              maxLength={40}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="株式会社◯◯"
              className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-base"
            />
            <p className="mt-1 text-xs text-ink-faint">※ どこにも保存・送信されません</p>
          </div>
        </section>

        {/* 結果パネル */}
        <section className="space-y-4">
          {!processId || !result ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-surface-border bg-white text-base text-ink-muted">
              業務を選択すると試算が始まります
            </div>
          ) : (
            <>
              {result.isCapped ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-base text-amber-800">
                  入力値では担当者の総稼働時間を超えるため、総稼働時間で頭打ちにして試算しています。件数・処理時間を再度ご確認ください。
                </div>
              ) : null}

              <div className="animate-fade-in overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 p-6 text-white shadow-pop">
                <div className="text-base font-medium text-navy-200">月間削減余地</div>
                <div className="mt-1 text-6xl font-bold tabular-nums text-white">
                  約{formatManYen(result.monthlySavingsYen)}
                  <span className="ml-1 text-3xl font-semibold text-emerald-300">万円/月</span>
                </div>
                <div className="mt-1 text-base text-navy-200">
                  年間 約{formatManYen(result.annualSavingsYen)}万円
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <KpiCard
                  label="純削減効果"
                  value={`${formatManYen(result.netMonthlySavingsYen)}万円/月`}
                  sub={`削減額 − 月額運用費 ${formatManYen(settings.monthlyOperatingCostYen)}万円`}
                />
                {result.roiMonths !== null ? (
                  <KpiCard
                    label="ROI回収期間"
                    value={`約${formatMonths(result.roiMonths)}ヶ月`}
                    sub={[
                      `初期投資 ${formatManYen(settings.initialInvestmentYen)}万円 ÷`,
                      `純削減効果 ${formatManYen(result.netMonthlySavingsYen)}万円/月`,
                    ]}
                  />
                ) : (
                  <KpiCard
                    label="ROI回収期間"
                    value="拡張で黒字化"
                    tone="info"
                    sub={`あと約${formatManYen(
                      settings.monthlyOperatingCostYen - result.monthlySavingsYen,
                    )}万円/月の削減で黒字化`}
                  />
                )}
                <KpiCard
                  label="削減工数"
                  value={`${formatHours(result.automatedHours)}時間/月`}
                  sub={`＝ ${formatFte(result.fteSaved)}人分`}
                />
              </div>

              {result.netMonthlySavingsYen <= 0 ? (
                <div className="rounded-xl border border-navy-200 bg-navy-50 p-4 text-base text-navy-900 shadow-card">
                  <h3 className="mb-2 flex items-center gap-1.5 text-base font-semibold text-navy-800">
                    <span aria-hidden>💡</span> ご提案
                  </h3>
                  <p>
                    「{benchmark?.label}」単体では月間削減額が月額運用費（
                    {formatManYen(settings.monthlyOperatingCostYen)}万円/月）に届きませんが、あと約
                    {formatManYen(settings.monthlyOperatingCostYen - result.monthlySavingsYen)}
                    万円/月の削減があれば黒字化します。Agentic RPAは複数の業務を組み合わせて導入できるため、次のような進め方がおすすめです。
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      処理件数の多い業務
                      {otherProcessLabels.length ? `（${otherProcessLabels.join("・")}など）` : ""}
                      と組み合わせて導入し、システム全体で運用費をカバーする
                    </li>
                    <li>同じ業務の中でも自動化対象を広げる（確認・照合などの周辺工程も含める）</li>
                    <li>まずは効果の大きい業務から導入し、本業務は次フェーズで追加する</li>
                  </ul>
                </div>
              ) : (
                <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
                  <h3 className="mb-3 text-base font-semibold text-navy-700">
                    累積純削減額の推移（24ヶ月・初期投資控除後）
                  </h3>
                  <CumulativeChart
                    cumulativeByMonth={result.cumulativeByMonth}
                    breakEvenMonth={result.breakEvenMonth}
                  />
                </div>
              )}

              <CalculationBreakdown
                casesPerDay={casesPerDay}
                minutesPerCase={minutesPerCase}
                workingDaysPerMonth={settings.workingDaysPerMonth}
                automationRatePercent={(processSettings?.automationRate ?? 0) * 100}
                hourlyWageYen={result.hourlyWageYen}
                salaryMan={salaryMan}
                monthlyOperatingCostYen={settings.monthlyOperatingCostYen}
                initialInvestmentYen={settings.initialInvestmentYen}
                result={result}
              />

              {benchmark ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-base text-emerald-900 shadow-card">
                  <h3 className="mb-2 text-base font-semibold text-emerald-800">定性効果</h3>
                  <ul className="list-disc space-y-1 pl-5">
                    {benchmark.qualitativeEffects.map((effect) => (
                      <li key={effect}>{effect}</li>
                    ))}
                    <li>人は承認と例外対応に集中し、転記・照合はAIが代行します</li>
                  </ul>
                </div>
              ) : null}
            </>
          )}

          <p className="text-sm leading-relaxed text-ink-faint">
            本試算は入力値と業務平均値に基づく概算であり、削減効果を保証するものではありません。正式な削減余地は業務棚卸し（導入支援の第1フェーズ）にて算定します。入力値はブラウザ内のみで処理され、外部へ送信・保存されません。
          </p>
        </section>
      </div>
    </div>
  );
}
