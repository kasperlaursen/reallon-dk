export interface SalaryRecord {
  id: string;
  year: number;
  month: number;
  amountDkk: number;
  employer: string;
  jobTitle: string;
}

export interface SalaryRecordDraft {
  year: number;
  month: number;
  amountDkk: number;
  employer: string;
  jobTitle: string;
}

export interface CpiPoint {
  year: number;
  month: number;
  indexValue: number;
}

export interface ChartPoint {
  year: number;
  month: number;
  label: string;
  nominalSalary: number;
  realSalary: number;
  cpiIndexedSalary: number;
  hasExactSalaryEvent: boolean;
}

export interface ChangeMetric {
  amountDkk: number;
  percentage: number;
}

export interface StatsJumpSummary {
  fromRecordId: string;
  toRecordId: string;
  fromLabel: string;
  toLabel: string;
  nominal: ChangeMetric;
  real: ChangeMetric;
}

export interface CoverageWarning {
  code:
    | "baseline-outside-cpi"
    | "baseline-missing-cpi"
    | "pending-cpi"
    | "no-comparable-records";
  message: string;
}

export interface StatsSummary {
  baselineRecordId: string | null;
  baselineLabel: string | null;
  latestComparableLabel: string | null;
  latestNominalSalary: number | null;
  latestRealSalary: number | null;
  inflationMatchedSalary: number | null;
  inflationGap: ChangeMetric | null;
  totalChange: {
    nominal: ChangeMetric;
    real: ChangeMetric;
  } | null;
  volatility: {
    bestRealJump: StatsJumpSummary | null;
    worstRealJump: StatsJumpSummary | null;
  };
  trailingTwelveMonths: {
    fromLabel: string;
    toLabel: string;
    nominal: ChangeMetric;
    real: ChangeMetric;
  } | null;
  cagr: {
    years: number;
    nominalPercentage: number;
    realPercentage: number;
  } | null;
  warnings: CoverageWarning[];
}

export interface LocalStorageEnvelope {
  version: 1;
  savedAt: string;
  records: SalaryRecord[];
  selectedBaselineId: string | null;
  ui: {
    historyView: "table" | "timeline";
    detailRecordId: string | null;
  };
  cpiCacheMeta: {
    lastSuccessfulFetchAt: string | null;
    lastSource: "none" | "cache" | "network";
    lastError: string | null;
  };
}

export interface CpiCacheRecord {
  version: 1;
  fetchedAt: string;
  points: CpiPoint[];
}

export interface AnalyticsResult {
  comparableRecords: SalaryRecord[];
  pendingRecords: SalaryRecord[];
  chartPoints: ChartPoint[];
  stats: StatsSummary;
}

export interface CpiState {
  points: CpiPoint[] | null;
  loading: boolean;
  source: "none" | "cache" | "network";
  stale: boolean;
  error: string | null;
  lastSuccessfulFetchAt: string | null;
}
