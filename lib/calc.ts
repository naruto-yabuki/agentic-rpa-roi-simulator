/**
 * コスト削減試算ロジック (要件定義書 5章 式(0)〜(12))
 * 純関数。丸めは表示層 (lib/format.ts) で行うため、ここでは円・時間の生値を返す。
 */

export interface CalcSettings {
  /** A: 平均年収 (円/年) */
  averageAnnualSalaryYen: number;
  /** L: 年間所定労働時間 (時間/年) */
  annualWorkingHours: number;
  /** D: 月間稼働日数 (日) */
  workingDaysPerMonth: number;
  /** h: 1日の所定労働時間 (時間/日) */
  dailyWorkingHours: number;
  /** C0: 初期投資 (円) */
  initialInvestmentYen: number;
  /** Cm: 月額運用費 (円/月) */
  monthlyOperatingCostYen: number;
}

export interface CalcInput {
  /** N: 担当人数 (人) */
  headcount: number;
  /** Q: 処理件数 (件/日) */
  casesPerDay: number;
  /** T: 1件あたり処理時間 (分/件) */
  minutesPerCase: number;
  /** r: 自動化率 (0-1) */
  automationRate: number;
  settings: CalcSettings;
}

export interface CalcResult {
  /** W: 時給換算人件費 (円/時) = A ÷ L */
  hourlyWageYen: number;
  /** H_raw: 月間対象工数 (時間/月) */
  monthlyRawHours: number;
  /** H_cap: 担当人数の総稼働時間 (時間/月) = N × h × D。参考表示用で、工数の頭打ちには使わない */
  monthlyCapHours: number;
  /** H: 採用工数 (時間/月) = H_raw (頭打ちなし) */
  monthlyHours: number;
  /** 業務専従率 (%) = H ÷ H_cap × 100。100%を超える場合は入力人数の稼働時間を上回っていることを示す */
  occupancyRate: number;
  /** H_auto: 自動化可能工数 (時間/月) = H × r */
  automatedHours: number;
  /** S: 月間削減額 (円/月) = H_auto × W */
  monthlySavingsYen: number;
  /** P: 純削減効果 (円/月) = S − Cm */
  netMonthlySavingsYen: number;
  /** ROI回収期間 (月)。P ≤ 0 のときは null (回収不可) */
  roiMonths: number | null;
  /** S_year: 年間削減額 (円/年) */
  annualSavingsYen: number;
  /** FTE_saved: 人数換算 (人分) */
  fteSaved: number;
  /** Cum(1..24): 累積純削減額 (初期投資控除後、円) */
  cumulativeByMonth: number[];
  /** 黒字転換月 (n_be)。24ヶ月以内に黒字化しない場合は null */
  breakEvenMonth: number | null;
}

const CUMULATIVE_MONTHS = 24;

export function calculate(input: CalcInput): CalcResult {
  const { headcount: N, casesPerDay: Q, minutesPerCase: T, automationRate: r, settings } = input;
  const {
    averageAnnualSalaryYen: A,
    annualWorkingHours: L,
    workingDaysPerMonth: D,
    dailyWorkingHours: h,
    initialInvestmentYen: C0,
    monthlyOperatingCostYen: Cm,
  } = settings;

  // (0) 時給換算
  const hourlyWageYen = A / L;
  // (1) 月間対象工数
  const monthlyRawHours = ((Q * T) / 60) * D;
  // (2) 担当人数の総稼働時間 (参考値。工数の頭打ちには使わない)
  const monthlyCapHours = N * h * D;
  // (3) 採用工数 — 物理上限で頭打ちにせず、算出された工数をそのまま採用する
  const monthlyHours = monthlyRawHours;
  // (4) 業務専従率
  const occupancyRate = monthlyCapHours > 0 ? (monthlyHours / monthlyCapHours) * 100 : 0;
  // (5) 自動化可能工数
  const automatedHours = monthlyHours * r;
  // (6) 月間削減額
  const monthlySavingsYen = automatedHours * hourlyWageYen;
  // (7) 純削減効果
  const netMonthlySavingsYen = monthlySavingsYen - Cm;
  // (8) ROI回収期間
  const roiMonths = netMonthlySavingsYen > 0 ? C0 / netMonthlySavingsYen : null;
  // (9) 年間削減額
  const annualSavingsYen = monthlySavingsYen * 12;
  // (10) 人数換算
  const fteSaved = automatedHours / (h * D);

  // (11) 累積純削減額 / (12) 黒字転換月
  const cumulativeByMonth: number[] = [];
  let breakEvenMonth: number | null = null;
  for (let n = 1; n <= CUMULATIVE_MONTHS; n++) {
    const cum = netMonthlySavingsYen * n - C0;
    cumulativeByMonth.push(cum);
    if (breakEvenMonth === null && cum >= 0) breakEvenMonth = n;
  }

  return {
    hourlyWageYen,
    monthlyRawHours,
    monthlyCapHours,
    monthlyHours,
    occupancyRate,
    automatedHours,
    monthlySavingsYen,
    netMonthlySavingsYen,
    roiMonths,
    annualSavingsYen,
    fteSaved,
    cumulativeByMonth,
    breakEvenMonth,
  };
}

/**
 * 複数業務の組み合わせ試算。
 *
 * 設計上のキモ: 初期投資 (C0) と月額運用費 (Cm) は「Agentic RPA システム全体で1式」であり、
 * 対象業務を増やしても増えない。したがって各業務の削減額を積み上げつつ固定費は据え置くことで、
 * 組み合わせるほど純削減効果とROIが改善する ＝ バンドル導入の価値を数値で示せる。
 */

export interface ProcessCalcInput {
  id: string;
  label: string;
  /** N: 担当人数 (人) */
  headcount: number;
  /** Q: 処理件数 (件/日) */
  casesPerDay: number;
  /** T: 1件あたり処理時間 (分/件) */
  minutesPerCase: number;
  /** r: 自動化率 (0-1) */
  automationRate: number;
}

/** 業務ごとの削減効果 (運用費・初期投資は含まないグロス値) */
export interface ProcessContribution {
  id: string;
  label: string;
  automationRate: number;
  /** 月間対象工数 (時間/月) */
  monthlyHours: number;
  /** 自動化可能工数 (時間/月) */
  automatedHours: number;
  /** 月間削減額 (円/月、グロス) */
  monthlySavingsYen: number;
  /** 人数換算 (人分) */
  fteSaved: number;
}

export interface CombinedResult {
  /** W: 時給換算人件費 (円/時) */
  hourlyWageYen: number;
  /** 業務別の削減効果 (入力順) */
  contributions: ProcessContribution[];
  /** 合計月間削減額 (円/月、運用費差引前) = Σ各業務 */
  monthlySavingsYen: number;
  /** 合計年間削減額 (円/年) */
  annualSavingsYen: number;
  /** 合計自動化可能工数 (時間/月) */
  automatedHours: number;
  /** 合計人数換算 (人分) */
  fteSaved: number;
  /** 純削減効果 (円/月) = 合計削減額 − 運用費 (システム全体で1式) */
  netMonthlySavingsYen: number;
  /** ROI回収期間 (月)。純削減効果 ≤ 0 のときは null */
  roiMonths: number | null;
  /** 累積純削減額 (初期投資控除後、円) */
  cumulativeByMonth: number[];
  /** 黒字転換月。24ヶ月以内に黒字化しない場合は null */
  breakEvenMonth: number | null;
}

export function calculateCombined(
  processes: ProcessCalcInput[],
  settings: CalcSettings,
): CombinedResult {
  const { initialInvestmentYen: C0, monthlyOperatingCostYen: Cm } = settings;
  const hourlyWageYen = settings.averageAnnualSalaryYen / settings.annualWorkingHours;

  // 各業務は運用費・初期投資ゼロで単体計算し、グロスの削減効果だけを取り出す。
  // 固定費 (C0 / Cm) はシステム全体で1式のため、合算後にまとめて差し引く。
  const contributions: ProcessContribution[] = processes.map((p) => {
    const per = calculate({
      headcount: p.headcount,
      casesPerDay: p.casesPerDay,
      minutesPerCase: p.minutesPerCase,
      automationRate: p.automationRate,
      settings: { ...settings, initialInvestmentYen: 0, monthlyOperatingCostYen: 0 },
    });
    return {
      id: p.id,
      label: p.label,
      automationRate: p.automationRate,
      monthlyHours: per.monthlyHours,
      automatedHours: per.automatedHours,
      monthlySavingsYen: per.monthlySavingsYen,
      fteSaved: per.fteSaved,
    };
  });

  const monthlySavingsYen = contributions.reduce((s, c) => s + c.monthlySavingsYen, 0);
  const automatedHours = contributions.reduce((s, c) => s + c.automatedHours, 0);
  const fteSaved = contributions.reduce((s, c) => s + c.fteSaved, 0);
  const annualSavingsYen = monthlySavingsYen * 12;
  const netMonthlySavingsYen = monthlySavingsYen - Cm;
  const roiMonths = netMonthlySavingsYen > 0 ? C0 / netMonthlySavingsYen : null;

  const cumulativeByMonth: number[] = [];
  let breakEvenMonth: number | null = null;
  for (let n = 1; n <= CUMULATIVE_MONTHS; n++) {
    const cum = netMonthlySavingsYen * n - C0;
    cumulativeByMonth.push(cum);
    if (breakEvenMonth === null && cum >= 0) breakEvenMonth = n;
  }

  return {
    hourlyWageYen,
    contributions,
    monthlySavingsYen,
    annualSavingsYen,
    automatedHours,
    fteSaved,
    netMonthlySavingsYen,
    roiMonths,
    cumulativeByMonth,
    breakEvenMonth,
  };
}
