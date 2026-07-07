/**
 * 業務別ベンチマークマスタ + 共通既定値マスタ
 * 「工場出荷値」。恒久的な変更はこのファイルの編集 + 再デプロイで行う。
 *
 * 業界ではなく「どの業務を自動化するか」で選択させる設計。顧客の業界に関わらず、
 * 対象業務が同じであれば同じデフォルト値を適用できるため、汎用性が高い。
 */

export type ProcessId =
  | "order_intake"
  | "invoicing"
  | "expense"
  | "inquiry"
  | "purchasing"
  | "contract"
  | "attendance"
  | "credit_review";

export interface ProcessBenchmark {
  id: ProcessId;
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

export const PROCESS_ORDER: ProcessId[] = [
  "order_intake",
  "invoicing",
  "expense",
  "inquiry",
  "purchasing",
  "contract",
  "attendance",
  "credit_review",
];

export const PROCESS_BENCHMARKS: Record<ProcessId, ProcessBenchmark> = {
  order_intake: {
    id: "order_intake",
    label: "受注処理",
    minutesPerCase: 15,
    automationRate: 0.85,
    casesPerDayDefault: 100,
    workflowSteps: ["受注取込", "内容確認・照合", "在庫・納期確認", "基幹システム入力"],
    qualitativeEffects: ["入力ミス 月20件→0件", "処理時間 3日/月→4時間/月"],
  },
  invoicing: {
    id: "invoicing",
    label: "請求書発行",
    minutesPerCase: 20,
    automationRate: 0.83,
    casesPerDayDefault: 60,
    workflowSteps: ["実績集計", "請求書作成", "内容チェック", "送付"],
    qualitativeEffects: ["請求漏れ・誤請求 月10件→0件", "月次締め処理 2日→3時間"],
  },
  expense: {
    id: "expense",
    label: "経費精算",
    minutesPerCase: 8,
    automationRate: 0.8,
    casesPerDayDefault: 150,
    workflowSteps: ["申請受付", "領収書照合", "規定チェック", "承認・振込データ作成"],
    qualitativeEffects: ["差し戻し件数 月30件→5件", "月末の残業をほぼ解消"],
  },
  inquiry: {
    id: "inquiry",
    label: "問い合わせ対応",
    minutesPerCase: 12,
    automationRate: 0.75,
    casesPerDayDefault: 80,
    workflowSteps: ["問い合わせ受付", "内容分類", "回答文作成", "一次回答送信"],
    qualitativeEffects: ["一次回答時間 半日→5分", "有人対応は複雑案件のみに集中"],
  },
  purchasing: {
    id: "purchasing",
    label: "発注・仕入管理",
    minutesPerCase: 18,
    automationRate: 0.82,
    casesPerDayDefault: 40,
    workflowSteps: ["発注書受領", "内容照合", "在庫反映", "支払データ作成"],
    qualitativeEffects: ["転記ミス 月15件→0件", "仕入計上リード 1日→1時間"],
  },
  contract: {
    id: "contract",
    label: "契約書管理・更新",
    minutesPerCase: 200,
    automationRate: 0.78,
    casesPerDayDefault: 5,
    workflowSteps: ["契約内容確認", "更新期日管理", "更新案内作成", "締結後登録"],
    qualitativeEffects: ["更新漏れ 月8件→0件", "書類不備率 20%→3%"],
  },
  attendance: {
    id: "attendance",
    label: "勤怠・シフト管理",
    minutesPerCase: 6,
    automationRate: 0.85,
    casesPerDayDefault: 200,
    workflowSteps: ["打刻データ収集", "異常検知", "是正依頼", "給与連携データ作成"],
    qualitativeEffects: ["修正対応 月40件→5件", "給与計算前の確認作業を大幅削減"],
  },
  credit_review: {
    id: "credit_review",
    label: "与信・審査業務",
    minutesPerCase: 45,
    automationRate: 0.76,
    casesPerDayDefault: 15,
    workflowSteps: ["申込受付", "信用情報照会", "審査基準チェック", "判定結果通知"],
    qualitativeEffects: ["審査リードタイム 2日→2時間", "一次判定の標準化"],
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

/** 業務ごとの実効設定値 (設定ページで編集可能。初期値は PROCESS_BENCHMARKS 由来) */
export interface ProcessSettings {
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
  process: Record<ProcessId, ProcessSettings>;
}

export function buildDefaultSettings(): AppSettings {
  const process = {} as Record<ProcessId, ProcessSettings>;
  for (const id of PROCESS_ORDER) {
    const b = PROCESS_BENCHMARKS[id];
    process[id] = {
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
    process,
  };
}
