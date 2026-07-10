"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculate, calculateCombined } from "@/lib/calc";
import {
  PROCESS_BENCHMARKS,
  PROCESS_ORDER,
  type ProcessId,
} from "@/lib/processBenchmarks";
import { useSettings } from "@/lib/settings-context";
import {
  formatFte,
  formatHours,
  formatManYen,
  formatMonths,
  formatYenPerHour,
} from "@/lib/format";
import { ProcessCard } from "@/components/ProcessCard";
import { ProcessInputRow, type ProcessInputValue } from "@/components/ProcessInputRow";
import { KpiCard } from "@/components/KpiCard";
import { CumulativeChart } from "@/components/CumulativeChart";
import { CalculationBreakdown } from "@/components/CalculationBreakdown";
import { CombinedBreakdown } from "@/components/CombinedBreakdown";
import { ContributionTable } from "@/components/ContributionTable";
import { Pill } from "@/components/Pill";

/** これを超えるROI回収期間は、現在の構成ではなく対象業務の追加提案に切り替える */
const ROI_BUNDLE_THRESHOLD_MONTHS = 12;

const DEFAULT_HEADCOUNT = 3;

export default function HomePage() {
  const { settings, isCustomized } = useSettings();

  const [inputs, setInputs] = useState<Partial<Record<ProcessId, ProcessInputValue>>>({});
  const [customerName, setCustomerName] = useState("");

  // 選択中の業務は PROCESS_ORDER の順に並べて表示の安定性を保つ
  const selectedIds = useMemo(() => PROCESS_ORDER.filter((id) => inputs[id]), [inputs]);

  const toggleProcess = (id: ProcessId) => {
    setInputs((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      const s = settings.process[id];
      return {
        ...prev,
        [id]: {
          headcount: DEFAULT_HEADCOUNT,
          casesPerDay: s.casesPerDayDefault,
          minutesPerCase: s.minutesPerCase,
        },
      };
    });
  };

  const updateInput = (id: ProcessId, patch: Partial<ProcessInputValue>) => {
    setInputs((prev) => {
      const cur = prev[id];
      if (!cur) return prev;
      return { ...prev, [id]: { ...cur, ...patch } };
    });
  };

  const calcSettings = useMemo(
    () => ({
      averageAnnualSalaryYen: settings.averageAnnualSalaryYen,
      annualWorkingHours: settings.annualWorkingHours,
      workingDaysPerMonth: settings.workingDaysPerMonth,
      dailyWorkingHours: settings.dailyWorkingHours,
      initialInvestmentYen: settings.initialInvestmentYen,
      monthlyOperatingCostYen: settings.monthlyOperatingCostYen,
    }),
    [settings],
  );

  const result = useMemo(() => {
    if (!selectedIds.length) return null;
    const procs = selectedIds.map((id) => ({
      id,
      label: PROCESS_BENCHMARKS[id].label,
      headcount: inputs[id]!.headcount,
      casesPerDay: inputs[id]!.casesPerDay,
      minutesPerCase: inputs[id]!.minutesPerCase,
      automationRate: settings.process[id].automationRate,
    }));
    return calculateCombined(procs, calcSettings);
  }, [selectedIds, inputs, settings, calcSettings]);

  // 1業務のみ選択時は、従来どおりの詳細な5ステップ内訳 (専従率など) を出すため単体計算も行う
  const singleResult = useMemo(() => {
    if (selectedIds.length !== 1) return null;
    const id = selectedIds[0];
    const v = inputs[id]!;
    return calculate({
      headcount: v.headcount,
      casesPerDay: v.casesPerDay,
      minutesPerCase: v.minutesPerCase,
      automationRate: settings.process[id].automationRate,
      settings: calcSettings,
    });
  }, [selectedIds, inputs, settings, calcSettings]);

  const isMulti = selectedIds.length >= 2;
  const singleId = selectedIds.length === 1 ? selectedIds[0] : null;
  const singleBenchmark = singleId ? PROCESS_BENCHMARKS[singleId] : null;

  const hourlyWageYen = settings.averageAnnualSalaryYen / settings.annualWorkingHours;
  const salaryMan = Math.round(settings.averageAnnualSalaryYen / 10_000);

  const unselectedLabels = PROCESS_ORDER.filter((id) => !inputs[id])
    .slice(0, 2)
    .map((id) => PROCESS_BENCHMARKS[id].label);

  const automationPercents = selectedIds.map((id) =>
    Math.round(settings.process[id].automationRate * 100),
  );
  const autoRatePill = automationPercents.length
    ? automationPercents.length === 1
      ? `${automationPercents[0]}%`
      : `${Math.min(...automationPercents)}〜${Math.max(...automationPercents)}%`
    : "—";

  const netNonPositive = !!result && result.netMonthlySavingsYen <= 0;
  const needsBundleProposal =
    !!result && result.roiMonths !== null && result.roiMonths > ROI_BUNDLE_THRESHOLD_MONTHS;
  const addMoreHint = unselectedLabels.length
    ? `（${unselectedLabels.join("・")}など）`
    : "";

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
            <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-navy-700">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-white">
                1
              </span>
              業務選択
              <span className="ml-auto text-sm font-normal text-ink-muted">複数選択できます</span>
            </h2>
            <p className="mb-3 text-sm text-ink-muted">
              自動化したい業務をすべて選んでください。組み合わせるほど固定費に対する削減効果が積み上がります。
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PROCESS_ORDER.map((id) => (
                <ProcessCard
                  key={id}
                  benchmark={PROCESS_BENCHMARKS[id]}
                  selected={!!inputs[id]}
                  onSelect={() => toggleProcess(id)}
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
              {selectedIds.length ? (
                <span className="ml-auto rounded-full bg-navy-100 px-2 py-0.5 text-xs font-medium text-navy-700">
                  {selectedIds.length}業務
                </span>
              ) : null}
            </h2>
            {selectedIds.length ? (
              <div className="space-y-2.5">
                {selectedIds.map((id) => (
                  <ProcessInputRow
                    key={id}
                    benchmark={PROCESS_BENCHMARKS[id]}
                    value={inputs[id]!}
                    onChange={(patch) => updateInput(id, patch)}
                    onRemove={() => toggleProcess(id)}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-surface-border bg-surface-sunken px-3 py-6 text-center text-sm text-ink-muted">
                上で業務を選択すると、件数・処理時間を入力できます
              </p>
            )}
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
              <Pill>自動化率 {autoRatePill}</Pill>
              <Pill>稼働 {settings.workingDaysPerMonth}日/月</Pill>
              <Pill>運用費・初期投資 システム全体で1式</Pill>
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
          {!result ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-surface-border bg-white text-base text-ink-muted">
              業務を選択すると試算が始まります
            </div>
          ) : (
            <>
              <div className="animate-fade-in overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 p-6 text-white shadow-pop">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-base font-medium text-navy-200">
                    {isMulti ? `月間削減余地（${selectedIds.length}業務の合計）` : "月間削減余地"}
                  </div>
                  {isMulti ? (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-navy-100">
                      組み合わせ試算
                    </span>
                  ) : null}
                </div>
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
                  sub="AIエージェント運用費差引後の実質効果"
                />
                {result.roiMonths === null ? (
                  <KpiCard
                    label="ROI回収期間"
                    value={isMulti ? "業務追加で黒字化" : "拡張で黒字化"}
                    tone="info"
                    sub="対象業務の追加で黒字化を検討"
                  />
                ) : needsBundleProposal ? (
                  <KpiCard
                    label="ROI回収期間"
                    value="業務追加を推奨"
                    tone="info"
                    sub={[
                      `現構成では約${formatMonths(result.roiMonths)}ヶ月`,
                      "対象業務の追加で短縮を提案",
                    ]}
                  />
                ) : (
                  <KpiCard
                    label="ROI回収期間"
                    value={`約${formatMonths(result.roiMonths)}ヶ月`}
                    sub="純削減効果をもとに算出した投資回収期間"
                  />
                )}
                <KpiCard
                  label="削減工数"
                  value={`${formatHours(result.automatedHours)}時間/月`}
                  sub={`＝ ${formatFte(result.fteSaved)}人分`}
                />
              </div>

              {netNonPositive ? (
                <div className="rounded-xl border border-navy-200 bg-navy-50 p-4 text-base text-navy-900 shadow-card">
                  <h3 className="mb-2 flex items-center gap-1.5 text-base font-semibold text-navy-800">
                    <span aria-hidden>💡</span> ご提案
                  </h3>
                  {isMulti ? (
                    <p>
                      現在の組み合わせでは合計削減額がAIエージェントの運用費を下回っています。運用費・初期投資はシステム全体で1式のため、対象業務を追加すると削減額だけが積み上がり黒字化できます。
                    </p>
                  ) : (
                    <p>
                      「{singleBenchmark?.label}」単体では削減効果がAIエージェントの運用コストを下回るため、単独導入のご提案には向きません。Agentic
                      RPAは複数の業務を組み合わせて導入できるため、次のような進め方がおすすめです。
                    </p>
                  )}
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      処理件数の多い業務{addMoreHint}を追加し、システム全体で運用費をカバーする
                    </li>
                    <li>同じ業務の中でも自動化対象を広げる（確認・照合などの周辺工程も含める）</li>
                    <li>まずは効果の大きい業務から導入し、他業務は次フェーズで追加する</li>
                  </ul>
                </div>
              ) : needsBundleProposal ? (
                <div className="rounded-xl border border-navy-200 bg-navy-50 p-4 text-base text-navy-900 shadow-card">
                  <h3 className="mb-2 flex items-center gap-1.5 text-base font-semibold text-navy-800">
                    <span aria-hidden>💡</span> ご提案
                  </h3>
                  <p>
                    {isMulti
                      ? `現在の組み合わせでのROI回収期間は約${formatMonths(result.roiMonths ?? 0)}ヶ月です。`
                      : `「${singleBenchmark?.label}」単体でのROI回収期間は約${formatMonths(result.roiMonths ?? 0)}ヶ月です。`}
                    1年以内の投資回収を目指す場合は、対象業務を追加するのがおすすめです。初期投資は据え置きのまま削減額を積み増せるため、回収期間を大きく短縮できます。
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      処理件数の多い業務{addMoreHint}を追加し、複数業務分の削減額で初期投資を早期回収する
                    </li>
                    <li>同じ業務の中でも自動化対象を広げる（確認・照合などの周辺工程も含める）</li>
                    <li>まずは回収期間の短い業務から導入し、他業務は次フェーズで追加する</li>
                  </ul>
                </div>
              ) : null}

              {isMulti ? (
                <ContributionTable
                  contributions={result.contributions}
                  totalSavingsYen={result.monthlySavingsYen}
                  totalAutomatedHours={result.automatedHours}
                  totalFte={result.fteSaved}
                />
              ) : null}

              {!netNonPositive ? (
                <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
                  <h3 className="mb-3 text-base font-semibold text-navy-700">
                    累積純削減額の推移（24ヶ月・初期投資控除後）
                  </h3>
                  <CumulativeChart
                    cumulativeByMonth={result.cumulativeByMonth}
                    breakEvenMonth={result.breakEvenMonth}
                  />
                </div>
              ) : null}

              {isMulti ? (
                <CombinedBreakdown result={result} processCount={selectedIds.length} />
              ) : singleResult && singleId ? (
                <CalculationBreakdown
                  casesPerDay={inputs[singleId]!.casesPerDay}
                  minutesPerCase={inputs[singleId]!.minutesPerCase}
                  workingDaysPerMonth={settings.workingDaysPerMonth}
                  automationRatePercent={settings.process[singleId].automationRate * 100}
                  hourlyWageYen={singleResult.hourlyWageYen}
                  salaryMan={salaryMan}
                  result={singleResult}
                />
              ) : null}

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-base text-emerald-900 shadow-card">
                <h3 className="mb-2 text-base font-semibold text-emerald-800">定性効果</h3>
                {isMulti ? (
                  <div className="space-y-3">
                    {selectedIds.map((id) => (
                      <div key={id}>
                        <div className="text-sm font-semibold text-emerald-800">
                          {PROCESS_BENCHMARKS[id].label}
                        </div>
                        <ul className="mt-0.5 list-disc space-y-0.5 pl-5">
                          {PROCESS_BENCHMARKS[id].qualitativeEffects.map((effect) => (
                            <li key={effect}>{effect}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <p className="border-t border-emerald-200 pt-2">
                      人は承認と例外対応に集中し、転記・照合はAIが代行します
                    </p>
                  </div>
                ) : singleBenchmark ? (
                  <ul className="list-disc space-y-1 pl-5">
                    {singleBenchmark.qualitativeEffects.map((effect) => (
                      <li key={effect}>{effect}</li>
                    ))}
                    <li>人は承認と例外対応に集中し、転記・照合はAIが代行します</li>
                  </ul>
                ) : null}
              </div>
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
