"use client";

import Link from "next/link";
import { INDUSTRY_BENCHMARKS, INDUSTRY_ORDER, SETTINGS_RANGES } from "@/lib/industryBenchmarks";
import { useSettings } from "@/lib/settings-context";
import { formatYenPerHour } from "@/lib/format";

function yenToMan(yen: number): number {
  return Math.round(yen / 10_000);
}

function manToYen(man: number): number {
  return man * 10_000;
}

export default function SettingsPage() {
  const { settings, updateSettings, updateIndustrySetting, resetToDefaults, isCustomized } = useSettings();

  const hourlyWageYen = settings.averageAnnualSalaryYen / settings.annualWorkingHours;

  const handleReset = () => {
    if (window.confirm("すべての設定値を初期値に戻します。よろしいですか？")) {
      resetToDefaults();
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-6 md:px-8">
      <header className="mb-6">
        <Link href="/" className="text-sm font-medium text-navy-600 hover:underline">
          ← メイン画面へ戻る
        </Link>
        <h1 className="mt-2 text-xl font-bold text-navy-900">試算前提の設定</h1>
        <p className="mt-1 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-700">
          この画面の内容はお客様には表示されません。商談前に調整してください。
        </p>
        {isCustomized ? (
          <p className="mt-2 text-xs font-medium text-emerald-700">
            現在デフォルトから変更された設定が適用されています。
          </p>
        ) : null}
      </header>

      <div className="space-y-6">
        {/* (a) 人件費設定 */}
        <section className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-navy-700">人件費設定</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink">平均年収（万円/年）</label>
              <input
                type="number"
                min={yenToMan(SETTINGS_RANGES.averageAnnualSalaryYen.min)}
                max={yenToMan(SETTINGS_RANGES.averageAnnualSalaryYen.max)}
                step={10}
                value={yenToMan(settings.averageAnnualSalaryYen)}
                onChange={(e) => {
                  const man = Math.min(
                    yenToMan(SETTINGS_RANGES.averageAnnualSalaryYen.max),
                    Math.max(yenToMan(SETTINGS_RANGES.averageAnnualSalaryYen.min), Number(e.target.value) || 0),
                  );
                  updateSettings({ averageAnnualSalaryYen: manToYen(man) });
                }}
                className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm tabular-nums"
              />
              <p className="mt-1 text-[11px] text-ink-muted">対象業務担当者の平均年収。既定 600万円</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">年間所定労働時間（時間/年）</label>
              <input
                type="number"
                min={SETTINGS_RANGES.annualWorkingHours.min}
                max={SETTINGS_RANGES.annualWorkingHours.max}
                step={10}
                value={settings.annualWorkingHours}
                onChange={(e) => {
                  const v = Math.min(
                    SETTINGS_RANGES.annualWorkingHours.max,
                    Math.max(SETTINGS_RANGES.annualWorkingHours.min, Number(e.target.value) || 0),
                  );
                  updateSettings({ annualWorkingHours: v });
                }}
                className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm tabular-nums"
              />
              <p className="mt-1 text-[11px] text-ink-muted">
                月160〜170時間×12ヶ月に相当。通常は変更不要
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            平均年収 {yenToMan(settings.averageAnnualSalaryYen).toLocaleString("ja-JP")}万円 ÷ 年間所定労働時間{" "}
            {settings.annualWorkingHours.toLocaleString("ja-JP")}時間 = 時給{" "}
            <span className="font-bold">{formatYenPerHour(hourlyWageYen)}円/時</span>
          </div>
        </section>

        {/* (b) 稼働・業務前提 */}
        <section className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-navy-700">稼働・業務前提</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink">月間稼働日数（日）</label>
              <input
                type="number"
                min={SETTINGS_RANGES.workingDaysPerMonth.min}
                max={SETTINGS_RANGES.workingDaysPerMonth.max}
                value={settings.workingDaysPerMonth}
                onChange={(e) => {
                  const v = Math.min(
                    SETTINGS_RANGES.workingDaysPerMonth.max,
                    Math.max(SETTINGS_RANGES.workingDaysPerMonth.min, Number(e.target.value) || 0),
                  );
                  updateSettings({ workingDaysPerMonth: v });
                }}
                className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">1日の所定労働時間（時間）</label>
              <input
                type="number"
                min={SETTINGS_RANGES.dailyWorkingHours.min}
                max={SETTINGS_RANGES.dailyWorkingHours.max}
                value={settings.dailyWorkingHours}
                onChange={(e) => {
                  const v = Math.min(
                    SETTINGS_RANGES.dailyWorkingHours.max,
                    Math.max(SETTINGS_RANGES.dailyWorkingHours.min, Number(e.target.value) || 0),
                  );
                  updateSettings({ dailyWorkingHours: v });
                }}
                className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm tabular-nums"
              />
              <p className="mt-1 text-[11px] text-ink-muted">物理上限（キャップ）計算に使用</p>
            </div>
          </div>

          <h3 className="mb-2 mt-5 text-xs font-semibold text-ink-muted">業界別デフォルト値</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs text-ink-muted">
                  <th className="py-2 pr-2">業界</th>
                  <th className="px-2 py-2">1件あたり処理時間（分）</th>
                  <th className="px-2 py-2">自動化率（%）</th>
                  <th className="px-2 py-2">件数/日デフォルト</th>
                </tr>
              </thead>
              <tbody>
                {INDUSTRY_ORDER.map((id) => {
                  const row = settings.industry[id];
                  return (
                    <tr key={id} className="border-b border-surface-border last:border-0">
                      <td className="py-2 pr-2 font-medium text-ink">{INDUSTRY_BENCHMARKS[id].label}</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={SETTINGS_RANGES.minutesPerCase.min}
                          max={SETTINGS_RANGES.minutesPerCase.max}
                          value={row.minutesPerCase}
                          onChange={(e) =>
                            updateIndustrySetting(id, {
                              minutesPerCase: Math.min(
                                SETTINGS_RANGES.minutesPerCase.max,
                                Math.max(SETTINGS_RANGES.minutesPerCase.min, Number(e.target.value) || 0),
                              ),
                            })
                          }
                          className="w-24 rounded-lg border border-surface-border px-2 py-1 text-right tabular-nums"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={Math.round(SETTINGS_RANGES.automationRate.min * 100)}
                          max={Math.round(SETTINGS_RANGES.automationRate.max * 100)}
                          value={Math.round(row.automationRate * 100)}
                          onChange={(e) => {
                            const pct = Math.min(
                              Math.round(SETTINGS_RANGES.automationRate.max * 100),
                              Math.max(Math.round(SETTINGS_RANGES.automationRate.min * 100), Number(e.target.value) || 0),
                            );
                            updateIndustrySetting(id, { automationRate: pct / 100 });
                          }}
                          className="w-20 rounded-lg border border-surface-border px-2 py-1 text-right tabular-nums"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={SETTINGS_RANGES.casesPerDayDefault.min}
                          max={SETTINGS_RANGES.casesPerDayDefault.max}
                          value={row.casesPerDayDefault}
                          onChange={(e) =>
                            updateIndustrySetting(id, {
                              casesPerDayDefault: Math.min(
                                SETTINGS_RANGES.casesPerDayDefault.max,
                                Math.max(SETTINGS_RANGES.casesPerDayDefault.min, Number(e.target.value) || 0),
                              ),
                            })
                          }
                          className="w-24 rounded-lg border border-surface-border px-2 py-1 text-right tabular-nums"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">
            ※ 導入実績に基づく参考値。件数/日デフォルトはメイン画面の初期値になるだけで、商談中に上書きされる想定です。
          </p>
        </section>

        {/* (c) 費用設定 */}
        <section className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-navy-700">費用設定</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink">初期投資（万円）</label>
              <input
                type="number"
                min={yenToMan(SETTINGS_RANGES.initialInvestmentYen.min)}
                max={yenToMan(SETTINGS_RANGES.initialInvestmentYen.max)}
                value={yenToMan(settings.initialInvestmentYen)}
                onChange={(e) => {
                  const man = Math.min(
                    yenToMan(SETTINGS_RANGES.initialInvestmentYen.max),
                    Math.max(yenToMan(SETTINGS_RANGES.initialInvestmentYen.min), Number(e.target.value) || 0),
                  );
                  updateSettings({ initialInvestmentYen: manToYen(man) });
                }}
                className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">月額運用費（万円/月）</label>
              <input
                type="number"
                min={yenToMan(SETTINGS_RANGES.monthlyOperatingCostYen.min)}
                max={yenToMan(SETTINGS_RANGES.monthlyOperatingCostYen.max)}
                value={yenToMan(settings.monthlyOperatingCostYen)}
                onChange={(e) => {
                  const man = Math.min(
                    yenToMan(SETTINGS_RANGES.monthlyOperatingCostYen.max),
                    Math.max(yenToMan(SETTINGS_RANGES.monthlyOperatingCostYen.min), Number(e.target.value) || 0),
                  );
                  updateSettings({ monthlyOperatingCostYen: manToYen(man) });
                }}
                className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm tabular-nums"
              />
            </div>
          </div>
        </section>

        {/* (d) 操作 */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-surface-border bg-white px-4 py-2 text-sm font-medium text-ink-soft hover:bg-surface-sunken"
          >
            初期値に戻す
          </button>
        </div>
      </div>
    </div>
  );
}
