import type { ChangeMetric } from "@/types/domain";

export function formatCurrency(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${Math.round(value).toLocaleString("da-DK")} kr.`;
}

export function formatPercentage(value: number | null) {
  if (value === null) {
    return "—";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString("da-DK", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Math.abs(value) >= 10 ? 0 : 1,
  })}%`;
}

export function formatSignedCurrency(value: number | null) {
  if (value === null) {
    return "—";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${Math.round(value).toLocaleString("da-DK")} kr.`;
}

export function formatFetchTimestamp(value: string | null) {
  if (!value) {
    return "Ikke hentet endnu";
  }

  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatChangeLine(change: ChangeMetric | null) {
  if (!change) {
    return "—";
  }

  return `${formatSignedCurrency(change.amountDkk)} (${formatPercentage(change.percentage)})`;
}
