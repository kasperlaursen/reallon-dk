import { describe, expect, it } from "vitest";
import { parseCpiResponse } from "@/lib/cpi";

function createJsonStatResponse(periods: Array<{ key: string; value: number }>) {
  return {
    dataset: {
      dimension: {
        Tid: {
          category: {
            index: Object.fromEntries(periods.map(({ key }, index) => [key, index])),
          },
        },
      },
      value: periods.map(({ value }) => value),
    },
  };
}

describe("parseCpiResponse", () => {
  it("parses and sorts JSONSTAT CPI rows by month", () => {
    const response = createJsonStatResponse([
      { key: "2020M03", value: 102.1 },
      { key: "2020M01", value: 100.0 },
      { key: "2020M02", value: 101.2 },
    ]);

    response.dataset.dimension.Tid.category.index = {
      "2020M03": 2,
      "2020M01": 0,
      "2020M02": 1,
    };
    response.dataset.value = [100.0, 101.2, 102.1];

    expect(parseCpiResponse(response)).toEqual([
      { year: 2020, month: 1, indexValue: 100.0 },
      { year: 2020, month: 2, indexValue: 101.2 },
      { year: 2020, month: 3, indexValue: 102.1 },
    ]);
  });

  it("rejects malformed payloads", () => {
    expect(() => parseCpiResponse({ nope: true })).toThrow();
  });
});
