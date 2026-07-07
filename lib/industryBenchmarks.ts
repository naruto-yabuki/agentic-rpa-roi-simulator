/**
 * 業界別ベンチマークマスタ + 共通既定値マスタ (要件定義書 4-3 / 8-1)
 * 「工場出荷値」。恒久的な変更はこのファイルの編集 + 再デプロイで行う。
 */

export type IndustryId =
  | "wholesale"
  | "logistics"
  | "realestate"
  | "lodging"
  | "travel"
  | "other";

export interface IndustryBenchmark {
  id: IndustryId;
  label: string;
  /** (B) 1件あたり処理時間デフォルト (分/件) */
  minutesPerCase: number;
  /** (C) 自動化率デフォルト (0-1) */
  automationRate: number;
  /** (D) 件数/日デフォルト */
  casesPerDayDefault: number;
  /** 代表業務チェーン */
  workflowSteps: string[];
  /** 定性効果メッセージ */
  qualitativeEffects: string[];
}

export const INDUSTRY_ORDER: IndustryId[] = [
  "wholesale",
  "logistics",
  "realestate",
  "lodging",
  "travel",
  "other",
];

export const INDUSTRY_BENCHMARKS: Record<IndustryId, IndustryBenchmark> = {
  wholesale: {
    id: "wholesale",
    label: "卸売",
    minutesPerCase: 15,
    automationRate: 0.85,
    casesPerDayDefault: 120,
    workflowSteps: ["受注取込", "在庫単価確認", "出荷指示", "請求起票"],
    qualitativeEffects: ["転記ミス 月20件→0件", "請求処理 3日/月→4時間/月"],
  },
  logistics: {
    id: "logistics",
    label: "物流",
    minutesPerCase: 12,
    automationRate: 0.83,
    casesPerDayDefault: 150,
    workflowSteps: ["受注受付・配車", "倉庫引当", "実績登録", "請求照合"],
    qualitativeEffects: ["請求ミス 月15件→0件", "例外対応リード 2-4時間→30分以内"],
  },
  realestate: {
    id: "realestate",
    label: "不動産",
    minutesPerCase: 240,
    automationRate: 0.8,
    casesPerDayDefault: 6,
    workflowSteps: ["申込受付", "保証審査依頼", "契約書起票", "更新管理"],
    qualitativeEffects: ["書類不備率 22%→3%", "更新漏れ 月8件→0件"],
  },
  lodging: {
    id: "lodging",
    label: "宿泊業",
    minutesPerCase: 10,
    automationRate: 0.83,
    casesPerDayDefault: 150,
    workflowSteps: ["予約集約・PMS入力", "入金案内", "清掃部屋割", "OTA照合"],
    qualitativeEffects: ["OTA照合エラー 月10件→1件以下"],
  },
  travel: {
    id: "travel",
    label: "旅行代理店",
    minutesPerCase: 150,
    automationRate: 0.75,
    casesPerDayDefault: 4,
    workflowSteps: ["見積受付", "旅程表作成", "変更取消対応", "請求書作成"],
    qualitativeEffects: ["変更対応 1.5時間/件→20分/件"],
  },
  other: {
    id: "other",
    label: "その他",
    minutesPerCase: 20,
    automationRate: 0.8,
    casesPerDayDefault: 60,
    workflowSteps: ["受付", "確認・照合", "システム入力", "承認依頼"],
    qualitativeEffects: ["転記・確認・照合・連絡業務をAIが代行"],
  },
};

/** 共通既定値マスタ (5-1 記号定義の既定値) */
export const MASTER_DEFAULTS = {
  /** A: 平均年収 (円/年) */
  averageAnnualSalaryYen: 6_000_000,
  /** L: 年間所定労働時間 (時間/年) ※月160〜170時間×12ヶ月相当 */
  annualWorkingHours: 2_000,
  /** D: 月間稼働日数 (日) */
  workingDaysPerMonth: 20,
  /** h: 1日の所定労働時間 (時間/日) */
  dailyWorkingHours: 8,
  /** C0: 初期投資 (円) */
  initialInvestmentYen: 3_000_000,
  /** Cm: 月額運用費 (円/月) */
  monthlyOperatingCostYen: 500_000,
} as const;

export const SETTINGS_RANGES = {
  averageAnnualSalaryYen: { min: 3_000_000, max: 12_000_000, step: 100_000 },
  annualWorkingHours: { min: 1_800, max: 2_200, step: 10 },
  workingDaysPerMonth: { min: 15, max: 25, step: 1 },
  dailyWorkingHours: { min: 6, max: 10, step: 1 },
  initialInvestmentYen: { min: 1_000_000, max: 10_000_000, step: 100_000 },
  monthlyOperatingCostYen: { min: 100_000, max: 2_000_000, step: 10_000 },
  minutesPerCase: { min: 1, max: 480, step: 1 },
  automationRate: { min: 0.5, max: 0.95, step: 0.01 },
  casesPerDayDefault: { min: 1, max: 5_000, step: 1 },
} as const;

export const INPUT_RANGES = {
  headcount: { min: 1, max: 100, step: 1 },
  casesPerDay: { min: 1, max: 5_000, step: 1 },
  minutesPerCase: { min: 1, max: 480, step: 1 },
} as const;

/** 業界ごとの実効設定値 (設定ページで編集可能。初期値は INDUSTRY_BENCHMARKS 由来) */
export interface IndustrySettings {
  minutesPerCase: number;
  automationRate: number;
  casesPerDayDefault: number;
}

/** 実効設定値 (React Context で保持。8-2) */
export interface AppSettings {
  averageAnnualSalaryYen: number;
  annualWorkingHours: number;
  workingDaysPerMonth: number;
  dailyWorkingHours: number;
  initialInvestmentYen: number;
  monthlyOperatingCostYen: number;
  industry: Record<IndustryId, IndustrySettings>;
}

export function buildDefaultSettings(): AppSettings {
  const industry = {} as Record<IndustryId, IndustrySettings>;
  for (const id of INDUSTRY_ORDER) {
    const b = INDUSTRY_BENCHMARKS[id];
    industry[id] = {
      minutesPerCase: b.minutesPerCase,
      automationRate: b.automationRate,
      casesPerDayDefault: b.casesPerDayDefault,
    };
  }
  return {
    averageAnnualSalaryYen: MASTER_DEFAULTS.averageAnnualSalaryYen,
    annualWorkingHours: MASTER_DEFAULTS.annualWorkingHours,
    workingDaysPerMonth: MASTER_DEFAULTS.workingDaysPerMonth,
    dailyWorkingHours: MASTER_DEFAULTS.dailyWorkingHours,
    initialInvestmentYen: MASTER_DEFAULTS.initialInvestmentYen,
    monthlyOperatingCostYen: MASTER_DEFAULTS.monthlyOperatingCostYen,
    industry,
  };
}
