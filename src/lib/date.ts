import type { CpiPoint, SalaryRecord } from "@/types/domain";

export const MONTHS_DA = [
  "Januar",
  "Februar",
  "Marts",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "December",
] as const;

export function toMonthIndex(year: number, month: number) {
  return year * 12 + (month - 1);
}

export function fromMonthIndex(monthIndex: number) {
  const year = Math.floor(monthIndex / 12);
  const month = (monthIndex % 12) + 1;

  return { year, month };
}

export function comparePeriods(
  left: { year: number; month: number },
  right: { year: number; month: number }
) {
  return toMonthIndex(left.year, left.month) - toMonthIndex(right.year, right.month);
}

export function shiftPeriod(
  period: { year: number; month: number },
  months: number
) {
  return fromMonthIndex(toMonthIndex(period.year, period.month) + months);
}

export function periodKey(period: { year: number; month: number }) {
  return `${period.year}-${String(period.month).padStart(2, "0")}`;
}

export function formatMonthYearLong(period: { year: number; month: number }) {
  return `${MONTHS_DA[period.month - 1]} ${period.year}`;
}

export function formatMonthYearShort(period: { year: number; month: number }) {
  return `${MONTHS_DA[period.month - 1].slice(0, 3)} ${period.year}`;
}

export function formatRecordPeriod(record: SalaryRecord | CpiPoint) {
  return formatMonthYearLong(record);
}

export function sortSalaryRecords(records: SalaryRecord[]) {
  return [...records].sort((left, right) => comparePeriods(left, right));
}
