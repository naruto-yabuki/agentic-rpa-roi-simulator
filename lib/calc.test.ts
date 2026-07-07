import { describe, expect, it } from "vitest";
import { calculate, type CalcSettings } from "./calc";
import { MASTER_DEFAULTS } from "./industryBenchmarks";

const defaultSettings: CalcSettings = {
  averageAnnualSalaryYen: MASTER_DEFAULTS.averageAnnualSalaryYen,
  annualWorkingHours: MASTER_DEFAULTS.annualWorkingHours,
  workingDaysPerMonth: MASTER_DEFAULTS.workingDaysPerMonth,
  dailyWorkingHours: MASTER_DEFAULTS.dailyWorkingHours,
  initialInvestmentYen: MASTER_DEFAULTS.initialInvestmentYen,
  monthlyOperatingCostYen: MASTER_DEFAULTS.monthlyOperatingCostYen,
};

describe("calculate (要件定義書 12章 サンプルシナリオ)", () => {
  it("シナリオ1: 卸売 (標準ケース)", () => {
    const r = calculate({
      headcount: 4,
      casesPerDay: 120,
      minutesPerCase: 15,
      automationRate: 0.85,
      settings: defaultSettings,
    });
    expect(r.hourlyWageYen).toBeCloseTo(3_000, 6);
    expect(r.monthlyRawHours).toBeCloseTo(600, 6);
    expect(r.monthlyCapHours).toBeCloseTo(640, 6);
    expect(r.isCapped).toBe(false);
    expect(Math.round(r.occupancyRate)).toBe(94);
    expect(r.automatedHours).toBeCloseTo(510, 6);
    expect(r.monthlySavingsYen).toBeCloseTo(1_530_000, 3);
    expect(r.netMonthlySavingsYen).toBeCloseTo(1_030_000, 3);
    expect(r.roiMonths).not.toBeNull();
    expect(r.roiMonths!).toBeCloseTo(2.9, 1);
    expect(r.breakEvenMonth).toBe(3);
    expect(r.cumulativeByMonth[1]).toBeCloseTo(-940_000, 3); // Cum(2)
    expect(r.cumulativeByMonth[2]).toBeCloseTo(90_000, 3); // Cum(3)
    expect(r.fteSaved).toBeCloseTo(3.2, 1);
  });

  it("シナリオ2: 物流 (標準ケース)", () => {
    const r = calculate({
      headcount: 4,
      casesPerDay: 150,
      minutesPerCase: 12,
      automationRate: 0.83,
      settings: defaultSettings,
    });
    expect(r.monthlyRawHours).toBeCloseTo(600, 6);
    expect(r.monthlyCapHours).toBeCloseTo(640, 6);
    expect(r.isCapped).toBe(false);
    expect(Math.round(r.occupancyRate)).toBe(94);
    expect(r.automatedHours).toBeCloseTo(498, 6);
    expect(r.monthlySavingsYen).toBeCloseTo(1_494_000, 3);
    expect(r.netMonthlySavingsYen).toBeCloseTo(994_000, 3);
    expect(r.roiMonths!).toBeCloseTo(3.0, 1);
    expect(r.breakEvenMonth).toBe(4);
    expect(r.cumulativeByMonth[2]).toBeCloseTo(-18_000, 3); // Cum(3)
    expect(r.cumulativeByMonth[3]).toBeCloseTo(976_000, 3); // Cum(4)
    expect(r.fteSaved).toBeCloseTo(3.1, 1);
  });

  it("シナリオ3: 不動産 (小規模・回収不可ケース)", () => {
    const r = calculate({
      headcount: 2,
      casesPerDay: 2,
      minutesPerCase: 240,
      automationRate: 0.8,
      settings: defaultSettings,
    });
    expect(r.monthlyRawHours).toBeCloseTo(160, 6);
    expect(r.monthlyCapHours).toBeCloseTo(320, 6);
    expect(r.isCapped).toBe(false);
    expect(Math.round(r.occupancyRate)).toBe(50);
    expect(r.automatedHours).toBeCloseTo(128, 6);
    expect(r.monthlySavingsYen).toBeCloseTo(384_000, 3);
    expect(r.netMonthlySavingsYen).toBeCloseTo(-116_000, 3);
    expect(r.roiMonths).toBeNull();
    expect(r.breakEvenMonth).toBeNull();
  });

  it("シナリオ4: 電力販売 (資料実導入事例の再現・平均年収500万円)", () => {
    const settings500: CalcSettings = { ...defaultSettings, averageAnnualSalaryYen: 5_000_000 };
    const r = calculate({
      headcount: 5,
      casesPerDay: 60,
      minutesPerCase: 30,
      automationRate: 0.8,
      settings: settings500,
    });
    expect(r.hourlyWageYen).toBeCloseTo(2_500, 6);
    expect(r.monthlyRawHours).toBeCloseTo(600, 6);
    expect(r.monthlyCapHours).toBeCloseTo(800, 6);
    expect(r.isCapped).toBe(false);
    expect(Math.round(r.occupancyRate)).toBe(75);
    expect(r.automatedHours).toBeCloseTo(480, 6);
    expect(r.monthlySavingsYen).toBeCloseTo(1_200_000, 3);
    expect(r.netMonthlySavingsYen).toBeCloseTo(700_000, 3);
    expect(r.roiMonths!).toBeCloseTo(4.3, 1);
    expect(r.breakEvenMonth).toBe(5);
    expect(r.cumulativeByMonth[3]).toBeCloseTo(-200_000, 3); // Cum(4)
    expect(r.cumulativeByMonth[4]).toBeCloseTo(500_000, 3); // Cum(5)
    expect(r.fteSaved).toBeCloseTo(3.0, 1);
  });

  it("シナリオ5: 宿泊業 (キャップ発動ケース)", () => {
    const r = calculate({
      headcount: 2,
      casesPerDay: 250,
      minutesPerCase: 10,
      automationRate: 0.83,
      settings: defaultSettings,
    });
    expect(r.monthlyRawHours).toBeCloseTo(833.333, 2);
    expect(r.monthlyCapHours).toBeCloseTo(320, 6);
    expect(r.isCapped).toBe(true);
    expect(r.monthlyHours).toBeCloseTo(320, 6);
    expect(Math.round(r.occupancyRate)).toBe(100);
    expect(r.automatedHours).toBeCloseTo(265.6, 3);
    expect(r.monthlySavingsYen).toBeCloseTo(796_800, 2);
    expect(r.netMonthlySavingsYen).toBeCloseTo(296_800, 2);
    expect(r.roiMonths!).toBeCloseTo(10.1, 1);
    expect(r.breakEvenMonth).toBe(11);
    expect(r.cumulativeByMonth[9]).toBeCloseTo(-32_000, 2); // Cum(10)
    expect(r.cumulativeByMonth[10]).toBeCloseTo(264_800, 2); // Cum(11)
    expect(r.fteSaved).toBeCloseTo(1.7, 1);
  });
});
