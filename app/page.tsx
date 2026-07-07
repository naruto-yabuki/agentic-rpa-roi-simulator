"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculate } from "@/lib/calc";
import {
  INDUSTRY_BENCHMARKS,
  INDUSTRY_ORDER,
  INPUT_RANGES,
  type IndustryId,
} from "@/lib/industryBenchmarks";
import { useSettings } from "@/lib/settings-context";
import {
  formatFte,
  formatHours,
  formatManYen,
  formatMonths,
  formatPercent,
  formatYenPerHour,
} from "@/lib/format";
import { IndustryCard } from "@/components/IndustryCard";
import { KpiCard } from "@/components/KpiCard";
import { CumulativeChart } from "@/components/CumulativeChart";
import { CalculationBreakdown } from "@/components/CalculationBreakdown";

export default function HomePage() {
  const { settings, isCustomized } = useSettings();

  const [industryId, setIndustryId] = useState<IndustryId | null>(null);
  const [headcount, setHeadcount] = useState(3);
  const [casesPerDay, setCasesPerDay] = useState<number>(0);
  const [minutesPerCase, setMinutesPerCase] = useState<number>(0);
  const [customerName, setCustomerName] = useState("");

  const selectIndustry = (id: IndustryId) => {
    setIndustryId(id);
    const s = settings.industry[id];
    setCasesPerDay(s.casesPerDayDefault);
    setMinutesPerCase(s.minutesPerCase);
  };

  const industrySettings = industryId ? settings.industry[industryId] : null;
  const benchmark = industryId ? INDUSTRY_BENCHMARKS[industryId] : null;

  const result = useMemo(() => {
    if (!industryId || !industrySettings) return null;
    return calculate({
      headcount,
      casesPerDay,
      minutesPerCase,
      automationRate: industrySettings.automationRate,
      settings: {
        averageAnnualSalaryYen: settings.averageAnnualSalaryYen,
        annualWorkingHours: settings.annualWorkingHours,
        workingDaysPerMonth: settings.workingDaysPerMonth,
        dailyWorkingHours: settings.dailyWorkingHours,
        initialInvestmentYen: settings.initialInvestmentYen,
        monthlyOperatingCostYen: settings.monthlyOperatingCostYen,
      },
    });
  }, [industryId, industrySettings, headcount, casesPerDay, minutesPerCase, settings]);

  const hourlyWageYen = settings.averageAnnualSalaryYen / settings.annualWorkingHours;
  const salaryMan = Math.round(settings.averageAnnualSalaryYen / 10_000);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 md:px-8">
      {/* ヘッダー */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-navy-500">
            株式会社ニューロスフィア
          </div>
          <h1 className="text-xl font-bold text-navy-800 md:text-2xl">
            Agentic RPA 削減効果シミュレーター
          </h1>
          {customerName.trim() ? (
            <p className="mt-1 text-sm text-ink-soft">{customerName.trim()}様向け試算</p>
          ) : null}
        </div>
        <div className="no-print flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-navy-700 px-3 py-2 text-sm font-medium text-white shadow-card hover:bg-navy-800"
          >
            PDF出力
          </button>
          <Link
            href="/settings"
            aria-label="試算前提の設定"
            title="試算前提の設定"
            className="rounded-lg border border-surface-border bg-white p-2 text-ink-muted hover:text-navy-700"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <h2 className="mb-3 text-sm font-semibold text-navy-700">STEP1 業界選択</h2>
            <div className="grid grid-cols-2 gap-2">
              {INDUSTRY_ORDER.map((id) => (
                <IndustryCard
                  key={id}
                  benchmark={INDUSTRY_BENCHMARKS[id]}
                  selected={industryId === id}
                  onSelect={() => selectIndustry(id)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-navy-700">STEP2 ヒアリング</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink">
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
                    className="w-16 rounded-lg border border-surface-border px-2 py-1 text-right text-sm tabular-nums"
                  />
                  <span className="text-sm text-ink-muted">人</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink">
                  ② 1日あたり、合計で何件くらい処理されていますか？
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={INPUT_RANGES.casesPerDay.min}
                    max={Math.max(500, casesPerDay)}
                    step={1}
                    value={casesPerDay}
                    disabled={!industryId}
                    onChange={(e) => setCasesPerDay(Number(e.target.value))}
                    className="flex-1 accent-navy-700 disabled:opacity-40"
                  />
                  <input
                    type="number"
                    min={INPUT_RANGES.casesPerDay.min}
                    max={INPUT_RANGES.casesPerDay.max}
                    value={casesPerDay}
                    disabled={!industryId}
                    onChange={(e) =>
                      setCasesPerDay(
                        Math.min(
                          INPUT_RANGES.casesPerDay.max,
                          Math.max(INPUT_RANGES.casesPerDay.min, Number(e.target.value) || 0),
                        ),
                      )
                    }
                    className="w-20 rounded-lg border border-surface-border px-2 py-1 text-right text-sm tabular-nums disabled:bg-surface-sunken"
                  />
                  <span className="text-sm text-ink-muted">件/日</span>
                </div>
                {!industryId ? (
                  <p className="mt-1 text-[11px] text-ink-muted">※ 業界を選択すると入力できます</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-navy-700">STEP3 処理時間の確認（任意）</h2>
            <label className="block text-sm font-medium text-ink">
              ③ 1件あたりの処理時間
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
                disabled={!industryId}
                onChange={(e) => setMinutesPerCase(Number(e.target.value))}
                className="flex-1 accent-navy-700 disabled:opacity-40"
              />
              <input
                type="number"
                min={INPUT_RANGES.minutesPerCase.min}
                max={INPUT_RANGES.minutesPerCase.max}
                value={minutesPerCase}
                disabled={!industryId}
                onChange={(e) =>
                  setMinutesPerCase(
                    Math.min(
                      INPUT_RANGES.minutesPerCase.max,
                      Math.max(INPUT_RANGES.minutesPerCase.min, Number(e.target.value) || 0),
                    ),
                  )
                }
                className="w-16 rounded-lg border border-surface-border px-2 py-1 text-right text-sm tabular-nums disabled:bg-surface-sunken"
              />
              <span className="text-sm text-ink-muted">分</span>
            </div>
          </div>

          {/* 前提条件サマリー (読み取り専用) */}
          <div className="rounded-xl border border-surface-border bg-surface-sunken p-4 text-[12px] leading-relaxed text-ink-soft">
            <div className="mb-1 flex items-center gap-2 font-medium text-ink">
              前提条件
              {isCustomized ? (
                <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[10px] font-medium text-navy-700">
                  カスタム設定適用中
                </span>
              ) : null}
            </div>
            <div>
              人件費 {formatYenPerHour(hourlyWageYen)}円/時（年収{salaryMan.toLocaleString("ja-JP")}万円換算）／ 自動化率{" "}
              {benchmark ? `${formatPercent(benchmark.automationRate * 100)}%` : "—"} ／ 稼働{" "}
              {settings.workingDaysPerMonth}日/月 ／ 初期投資 {formatManYen(settings.initialInvestmentYen)}万円・月額{" "}
              {formatManYen(settings.monthlyOperatingCostYen)}万円
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-muted">お客様名（任意）</label>
            <input
              type="text"
              maxLength={40}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="株式会社◯◯"
              className="mt-1 w-full rounded-lg border border-surface-border px-3 py-1.5 text-sm"
            />
            <p className="mt-1 text-[10px] text-ink-faint">※ どこにも保存・送信されません</p>
          </div>
        </section>

        {/* 結果パネル */}
        <section className="space-y-4">
          {!industryId || !result ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-surface-border bg-white text-sm text-ink-muted">
              業界を選択すると試算が始まります
            </div>
          ) : (
            <>
              {result.isCapped ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  入力値では担当者の総稼働時間を超えるため、総稼働時間で頭打ちにして試算しています。件数・処理時間を再度ご確認ください。
                </div>
              ) : null}

              <div className="animate-fade-in rounded-xl border border-navy-100 bg-gradient-to-br from-navy-50 to-white p-6 shadow-card">
                <div className="text-sm font-medium text-navy-600">月間削減余地</div>
                <div className="mt-1 text-5xl font-bold tabular-nums text-navy-800">
                  約{formatManYen(result.monthlySavingsYen)}
                  <span className="ml-1 text-2xl font-semibold">万円/月</span>
                </div>
                <div className="mt-1 text-sm text-ink-muted">
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
                    sub={`初期投資${formatManYen(settings.initialInvestmentYen)}万円 ÷ 純削減効果${formatManYen(
                      result.netMonthlySavingsYen,
                    )}万円/月`}
                  />
                ) : (
                  <KpiCard label="ROI回収期間" value="回収不可" tone="warning" />
                )}
                <KpiCard
                  label="削減工数"
                  value={`${formatHours(result.automatedHours)}時間/月`}
                  sub={`＝ ${formatFte(result.fteSaved)}人分`}
                />
              </div>

              {result.netMonthlySavingsYen <= 0 ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                  この業務単体では月額運用費を下回ります。対象業務の追加（請求・照合・更新管理など周辺業務の同時自動化）で削減余地を広げるのが一般的です。
                </div>
              ) : (
                <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
                  <h3 className="mb-3 text-sm font-semibold text-navy-700">
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
                automationRatePercent={(industrySettings?.automationRate ?? 0) * 100}
                hourlyWageYen={result.hourlyWageYen}
                salaryMan={salaryMan}
                monthlyOperatingCostYen={settings.monthlyOperatingCostYen}
                initialInvestmentYen={settings.initialInvestmentYen}
                result={result}
              />

              {benchmark ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-card">
                  <h3 className="mb-2 text-sm font-semibold text-emerald-800">定性効果</h3>
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

          <p className="text-[11px] leading-relaxed text-ink-faint">
            本試算は入力値と業界平均値に基づく概算であり、削減効果を保証するものではありません。正式な削減余地は業務棚卸し（導入支援の第1フェーズ）にて算定します。入力値はブラウザ内のみで処理され、外部へ送信・保存されません。
          </p>
        </section>
      </div>
    </div>
  );
}
