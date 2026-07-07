/** 表示丸め規則 (要件定義書 5-3) */

export function formatManYen(yen: number): string {
  const man = Math.round(yen / 10_000);
  return man.toLocaleString("ja-JP");
}

export function formatYenPerHour(yen: number): string {
  return Math.round(yen).toLocaleString("ja-JP");
}

export function formatHours(hours: number): string {
  return hours.toFixed(1);
}

export function formatMonths(months: number): string {
  return months.toFixed(1);
}

export function formatFte(fte: number): string {
  return fte.toFixed(1);
}

export function formatPercent(rate0to100: number): string {
  return Math.round(rate0to100).toString();
}

export function formatYenPlain(yen: number): string {
  return Math.round(yen).toLocaleString("ja-JP");
}

export function formatManYenSigned(yen: number): string {
  const man = Math.round(yen / 10_000);
  const sign = man > 0 ? "+" : "";
  return `${sign}${man.toLocaleString("ja-JP")}`;
}
