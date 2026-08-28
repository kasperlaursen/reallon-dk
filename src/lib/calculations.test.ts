import { describe, expect, it } from "vitest";
import { buildAnalytics } from "@/lib/calculations";
import type { CpiPoint, SalaryRecord } from "@/types/domain";

function createMonthlyCpi(count: number, startYear = 2020, startMonth = 1): CpiPoint[] {
  const points: CpiPoint[] = [];

  for (let offset = 0; offset < count; offset += 1) {
    const monthIndex = startYear * 12 + (startMonth - 1) + offset;
    const year = Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;

    points.push({
      year,
      month,
      indexValue: 100 + offset,
    });
  }

  return points;
}

describe("buildAnalytics", () => {
  it("computes chart series, totals, real salary, exact trailing 12 months, and pending CPI", () => {
    const cpiPoints = createMonthlyCpi(25);
    const records: SalaryRecord[] = [
      {
        id: "r-2020-01",
        year: 2020,
        month: 1,
        amountDkk: 30000,
        employer: "A",
        jobTitle: "Engineer",
      },
      {
        id: "r-2020-07",
        year: 2020,
        month: 7,
        amountDkk: 33000,
        employer: "A",
        jobTitle: "Engineer",
      },
      {
        id: "r-2021-01",
        year: 2021,
        month: 1,
        amountDkk: 36000,
        employer: "B",
        jobTitle: "Senior Engineer",
      },
      {
        id: "r-2022-02",
        year: 2022,
        month: 2,
        amountDkk: 39000,
        employer: "B",
        jobTitle: "Lead Engineer",
      },
    ];

    const analytics = buildAnalytics(records, cpiPoints, "r-2020-01");

    expect(analytics.chartPoints).toHaveLength(25);
    expect(analytics.pendingRecords.map((record) => record.id)).toEqual(["r-2022-02"]);
    expect(analytics.stats.latestComparableLabel).toBe("Januar 2022");
    expect(analytics.stats.latestRealSalary).toBe(29032);
    expect(analytics.stats.inflationMatchedSalary).toBe(37200);
    expect(analytics.stats.inflationGap).toEqual({
      amountDkk: -1200,
      percentage: expect.closeTo(-3.2258, 4),
    });
    expect(analytics.stats.totalChange?.nominal).toEqual({
      amountDkk: 6000,
      percentage: 20,
    });
    expect(analytics.stats.totalChange?.real?.amountDkk).toBe(-968);
    expect(analytics.stats.totalChange?.real?.percentage).toBeCloseTo(-3.2266, 3);
    expect(analytics.stats.trailingTwelveMonths?.fromLabel).toBe("Januar 2021");
    expect(analytics.stats.trailingTwelveMonths?.toLabel).toBe("Januar 2022");
    expect(analytics.stats.trailingTwelveMonths?.nominal).toEqual({ amountDkk: 0, percentage: 0 });
    expect(analytics.stats.trailingTwelveMonths?.real.amountDkk).toBe(-3111);
    expect(analytics.stats.trailingTwelveMonths?.real.percentage).toBeCloseTo(-9.678, 2);
    expect(analytics.stats.volatility.bestRealJump?.fromRecordId).toBe("r-2020-01");
    expect(analytics.stats.volatility.bestRealJump?.toRecordId).toBe("r-2020-07");
    expect(analytics.stats.warnings.some((warning) => warning.code === "pending-cpi")).toBe(true);
  });
});
