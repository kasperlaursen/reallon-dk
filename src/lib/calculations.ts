import {
  comparePeriods,
  formatMonthYearLong,
  formatMonthYearShort,
  periodKey,
  shiftPeriod,
  sortSalaryRecords,
  toMonthIndex,
} from "@/lib/date";
import type {
  AnalyticsResult,
  ChangeMetric,
  ChartPoint,
  CoverageWarning,
  CpiPoint,
  SalaryRecord,
  StatsJumpSummary,
  StatsSummary,
} from "@/types/domain";

function getChangeMetric(current: number, previous: number): ChangeMetric {
  return {
    amountDkk: Math.round(current - previous),
    percentage: previous === 0 ? 0 : ((current - previous) / previous) * 100,
  };
}

function getCpiMap(points: CpiPoint[]) {
  return new Map(points.map((point) => [periodKey(point), point]));
}

function getFirstMatchingCpiPoint(
  points: CpiPoint[],
  period: { year: number; month: number }
) {
  return points.find((point) => comparePeriods(point, period) >= 0) ?? null;
}

function buildWarnings(
  baseline: SalaryRecord | null,
  chartPoints: ChartPoint[],
  pendingRecords: SalaryRecord[],
  cpiPoints: CpiPoint[],
  cpiByPeriod: Map<string, CpiPoint>
): CoverageWarning[] {
  const warnings: CoverageWarning[] = [];

  if (!baseline) {
    warnings.push({
      code: "no-comparable-records",
      message: "Tilføj mindst én lønregistrering for at starte analysen.",
    });
    return warnings;
  }

  const latestCpi = cpiPoints.at(-1) ?? null;
  if (latestCpi && comparePeriods(baseline, latestCpi) > 0) {
    warnings.push({
      code: "baseline-outside-cpi",
      message: `Det valgte startpunkt ligger efter seneste CPI-måned (${formatMonthYearLong(
        latestCpi
      )}). Vælg en ældre løn for at se analyse.`,
    });
  } else if (!cpiByPeriod.has(periodKey(baseline))) {
    const firstPossible = getFirstMatchingCpiPoint(cpiPoints, baseline);
    warnings.push({
      code: "baseline-missing-cpi",
      message: firstPossible
        ? `Der findes ikke præcis CPI for ${formatMonthYearLong(
            baseline
          )}. Første sammenlignelige måned er ${formatMonthYearLong(firstPossible)}.`
        : "Det valgte startpunkt kan ikke matches mod tilgængelig CPI-data.",
    });
  }

  if (pendingRecords.length > 0 && latestCpi) {
    warnings.push({
      code: "pending-cpi",
      message: `${pendingRecords.length} lønregistrering${
        pendingRecords.length > 1 ? "er" : ""
      } ligger efter seneste CPI-måned (${formatMonthYearLong(
        latestCpi
      )}) og er markeret som afventer CPI.`,
    });
  }

  if (chartPoints.length === 0) {
    warnings.push({
      code: "no-comparable-records",
      message: "Ingen af de valgte lønregistreringer kan sammenlignes med den tilgængelige CPI-serie endnu.",
    });
  }

  return warnings;
}

function getRealSalary(nominalSalary: number, baseIndexValue: number, point: CpiPoint) {
  return Math.round((nominalSalary * baseIndexValue) / point.indexValue);
}

function buildChartPoints(
  records: SalaryRecord[],
  cpiPoints: CpiPoint[],
  baseline: SalaryRecord | null
) {
  if (!baseline) {
    return [] as ChartPoint[];
  }

  const cpiByPeriod = getCpiMap(cpiPoints);
  const baseCpi = cpiByPeriod.get(periodKey(baseline));
  if (!baseCpi) {
    return [] as ChartPoint[];
  }

  const comparableEvents = records.filter((record) => cpiByPeriod.has(periodKey(record)));
  const eventByPeriod = new Map(comparableEvents.map((record) => [periodKey(record), record]));
  const startIndex = cpiPoints.findIndex(
    (point) => comparePeriods(point, baseline) >= 0 && point.year === baseline.year && point.month === baseline.month
  );

  if (startIndex === -1) {
    return [] as ChartPoint[];
  }

  let activeSalary = baseline.amountDkk;

  return cpiPoints.slice(startIndex).map((point) => {
    const event = eventByPeriod.get(periodKey(point));
    if (event && comparePeriods(event, baseline) >= 0) {
      activeSalary = event.amountDkk;
    }

    return {
      year: point.year,
      month: point.month,
      label: formatMonthYearLong(point),
      nominalSalary: activeSalary,
      realSalary: getRealSalary(activeSalary, baseCpi.indexValue, point),
      cpiIndexedSalary: Math.round((baseline.amountDkk * point.indexValue) / baseCpi.indexValue),
      hasExactSalaryEvent: Boolean(event),
    } satisfies ChartPoint;
  });
}

function buildJumpSummary(
  baseline: SalaryRecord,
  cpiByPeriod: Map<string, CpiPoint>,
  previous: SalaryRecord,
  current: SalaryRecord
): StatsJumpSummary {
  const baselineCpi = cpiByPeriod.get(periodKey(baseline))!;
  const previousCpi = cpiByPeriod.get(periodKey(previous))!;
  const currentCpi = cpiByPeriod.get(periodKey(current))!;
  const previousReal = getRealSalary(previous.amountDkk, baselineCpi.indexValue, previousCpi);
  const currentReal = getRealSalary(current.amountDkk, baselineCpi.indexValue, currentCpi);

  return {
    fromRecordId: previous.id,
    toRecordId: current.id,
    fromLabel: formatMonthYearShort(previous),
    toLabel: formatMonthYearShort(current),
    nominal: getChangeMetric(current.amountDkk, previous.amountDkk),
    real: getChangeMetric(currentReal, previousReal),
  };
}

function buildStats(
  records: SalaryRecord[],
  cpiPoints: CpiPoint[],
  baseline: SalaryRecord | null,
  chartPoints: ChartPoint[],
  pendingRecords: SalaryRecord[]
): StatsSummary {
  const cpiByPeriod = getCpiMap(cpiPoints);
  const comparableRecords = records.filter((record) => cpiByPeriod.has(periodKey(record)));
  const warnings = buildWarnings(baseline, chartPoints, pendingRecords, cpiPoints, cpiByPeriod);

  if (!baseline || chartPoints.length === 0) {
    return {
      baselineRecordId: baseline?.id ?? null,
      baselineLabel: baseline ? formatMonthYearLong(baseline) : null,
      latestComparableLabel: null,
      latestNominalSalary: null,
      latestRealSalary: null,
      inflationMatchedSalary: null,
      inflationGap: null,
      totalChange: null,
      volatility: {
        bestRealJump: null,
        worstRealJump: null,
      },
      trailingTwelveMonths: null,
      cagr: null,
      warnings,
    };
  }

  const latestPoint = chartPoints.at(-1)!;
  const baselineAmount = baseline.amountDkk;
  const totalChange = {
    nominal: getChangeMetric(latestPoint.nominalSalary, baselineAmount),
    real: getChangeMetric(latestPoint.realSalary, baselineAmount),
  };

  let bestRealJump: StatsJumpSummary | null = null;
  let worstRealJump: StatsJumpSummary | null = null;
  const comparableEvents = comparableRecords.filter(
    (record) => comparePeriods(record, baseline) >= 0
  );

  for (let index = 1; index < comparableEvents.length; index += 1) {
    const jump = buildJumpSummary(
      baseline,
      cpiByPeriod,
      comparableEvents[index - 1],
      comparableEvents[index]
    );

    if (!bestRealJump || jump.real.percentage > bestRealJump.real.percentage) {
      bestRealJump = jump;
    }

    if (!worstRealJump || jump.real.percentage < worstRealJump.real.percentage) {
      worstRealJump = jump;
    }
  }

  const twelveMonthsEarlier = shiftPeriod(latestPoint, -12);
  const trailingPoint =
    chartPoints.find((point) => point.year === twelveMonthsEarlier.year && point.month === twelveMonthsEarlier.month) ??
    null;

  const trailingTwelveMonths = trailingPoint
    ? {
        fromLabel: trailingPoint.label,
        toLabel: latestPoint.label,
        nominal: getChangeMetric(latestPoint.nominalSalary, trailingPoint.nominalSalary),
        real: getChangeMetric(latestPoint.realSalary, trailingPoint.realSalary),
      }
    : null;

  const elapsedYears =
    (toMonthIndex(latestPoint.year, latestPoint.month) - toMonthIndex(baseline.year, baseline.month)) / 12;

  const cagr =
    elapsedYears >= 1
      ? {
          years: elapsedYears,
          nominalPercentage:
            (Math.pow(latestPoint.nominalSalary / baselineAmount, 1 / elapsedYears) - 1) * 100,
          realPercentage:
            (Math.pow(latestPoint.realSalary / baselineAmount, 1 / elapsedYears) - 1) * 100,
        }
      : null;

  return {
    baselineRecordId: baseline.id,
    baselineLabel: formatMonthYearLong(baseline),
    latestComparableLabel: latestPoint.label,
    latestNominalSalary: latestPoint.nominalSalary,
    latestRealSalary: latestPoint.realSalary,
    inflationMatchedSalary: latestPoint.cpiIndexedSalary,
    inflationGap: getChangeMetric(latestPoint.nominalSalary, latestPoint.cpiIndexedSalary),
    totalChange,
    volatility: {
      bestRealJump,
      worstRealJump,
    },
    trailingTwelveMonths,
    cagr,
    warnings,
  };
}

export function buildAnalytics(
  inputRecords: SalaryRecord[],
  cpiPoints: CpiPoint[] | null,
  baselineId: string | null
): AnalyticsResult {
  const records = sortSalaryRecords(inputRecords);

  if (!cpiPoints || cpiPoints.length === 0) {
    return {
      comparableRecords: [],
      pendingRecords: records,
      chartPoints: [],
      stats: {
        baselineRecordId: baselineId,
        baselineLabel: null,
        latestComparableLabel: null,
        latestNominalSalary: null,
        latestRealSalary: null,
        inflationMatchedSalary: null,
        inflationGap: null,
        totalChange: null,
        volatility: {
          bestRealJump: null,
          worstRealJump: null,
        },
        trailingTwelveMonths: null,
        cagr: null,
        warnings: [
          {
            code: "no-comparable-records",
            message: "CPI-data er endnu ikke tilgængelig. Prøv igen om lidt.",
          },
        ],
      },
    };
  }

  const latestCpi = cpiPoints.at(-1)!;
  const comparableRecords = records.filter((record) => comparePeriods(record, latestCpi) <= 0);
  const pendingRecords = records.filter((record) => comparePeriods(record, latestCpi) > 0);
  const baseline =
    records.find((record) => record.id === baselineId) ??
    records.find((record) => comparePeriods(record, latestCpi) <= 0) ??
    records[0] ??
    null;
  const chartPoints = buildChartPoints(records, cpiPoints, baseline);

  return {
    comparableRecords,
    pendingRecords,
    chartPoints,
    stats: buildStats(records, cpiPoints, baseline, chartPoints, pendingRecords),
  };
}
