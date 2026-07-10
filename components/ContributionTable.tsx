"use client";

import type { ProcessContribution } from "@/lib/calc";
import { formatFte, formatHours, formatManYen, formatPercent } from "@/lib/format";

/** 選択した業務ごとの削減効果を積み上げで見せる内訳テーブル (組み合わせの寄与を可視化) */
export function ContributionTable({
  contributions,
  totalSavingsYen,
  totalAutomatedHours,
  totalFte,
}: {
  contributions: ProcessContribution[];
  totalSavingsYen: number;
  totalAutomatedHours: number;
  totalFte: number;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
      <h3 className="mb-1 text-base font-semibold text-navy-700">業務別の削減内訳</h3>
      <p className="mb-3 text-sm text-ink-muted">
        選択した{contributions.length}業務それぞれの削減額を積み上げた合計です。運用費・初期投資はシステム全体で1式のため、業務を重ねるほど固定費に対する削減額が積み上がります。
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-base tabular-nums">
          <thead>
            <tr className="border-b border-surface-border text-sm text-ink-muted">
              <th className="py-2 text-left font-medium">業務</th>
              <th className="py-2 text-right font-medium">自動化率</th>
              <th className="py-2 text-right font-medium">削減工数</th>
              <th className="py-2 text-right font-medium">月間削減額</th>
              <th className="py-2 pl-3 text-right font-medium">構成比</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((c) => {
              const share = totalSavingsYen > 0 ? (c.monthlySavingsYen / totalSavingsYen) * 100 : 0;
              return (
                <tr key={c.id} className="border-b border-surface-border/60">
                  <td className="py-2.5 text-left font-medium text-ink">{c.label}</td>
                  <td className="py-2.5 text-right text-ink-muted">
                    {formatPercent(c.automationRate * 100)}%
                  </td>
                  <td className="py-2.5 text-right text-ink-soft">
                    {formatHours(c.automatedHours)}h/月
                  </td>
                  <td className="py-2.5 text-right font-semibold text-navy-800">
                    {formatManYen(c.monthlySavingsYen)}万円
                  </td>
                  <td className="py-2.5 pl-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-sunken">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.max(3, Math.round(share))}%` }}
                        />
                      </div>
                      <span className="w-9 text-right text-sm text-ink-muted">
                        {formatPercent(share)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-navy-200">
              <td className="py-2.5 text-left font-bold text-navy-800">合計</td>
              <td className="py-2.5 text-right text-ink-faint">—</td>
              <td className="py-2.5 text-right font-semibold text-navy-800">
                {formatHours(totalAutomatedHours)}h/月
              </td>
              <td className="py-2.5 text-right font-bold text-navy-900">
                {formatManYen(totalSavingsYen)}万円
              </td>
              <td className="py-2.5 pl-3 text-right text-sm text-ink-muted">
                ≒{formatFte(totalFte)}人分
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
